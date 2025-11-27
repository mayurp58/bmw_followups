'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import { User, Phone, Mail, Building, Clock, Calendar, PlusCircle, MessageCircle } from 'lucide-react';

export default function LeadDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { id } = params;
    const type = searchParams.get('type') || 'enquiry';

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [noteForm, setNoteForm] = useState({
        note: '',
        status: '',
        followupDate: '',
        followupTime: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/leads/${id}?type=${type}`);
            if (res.ok) {
                const result = await res.json();
                setData(result);
                setNoteForm(prev => ({ ...prev, status: result.lead?.status || 'Follow up' }));
            } else {
                console.error('Failed to fetch lead');
            }
        } catch (error) {
            console.error('Error fetching lead:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const handleNoteSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enqid: data.lead.enq_id,
                    custid: data.customer.cust_id,
                    note: noteForm.note,
                    addedby: 'Admin',
                    status: noteForm.status,
                    followupdate: noteForm.followupDate,
                    followuptime: noteForm.followupTime
                })
            });

            if (res.ok) {
                setNoteForm({ note: '', status: noteForm.status, followupDate: '', followupTime: '' });
                fetchData(); // Refresh data
            } else {
                alert('Failed to add note');
            }
        } catch (error) {
            console.error('Error adding note:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    if (!data) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Lead not found</div>;

    const { lead, customer, wishlist, recentlyViewed, notes } = data;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            {lead.cust_name}
                        </h2>
                        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                <Building className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                {lead.project_name}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                <StatusBadge status={lead.status} />
                            </div>
                            <div className="mt-2 flex items-center space-x-2">
                                <a
                                    href={`tel:${customer.cust_mobile}`}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Phone className="h-3 w-3 mr-1" /> Call
                                </a>
                                <a
                                    href={`https://wa.me/${customer.cust_mobile}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600"
                                >
                                    <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column: Customer Info & Projects */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* Customer Info */}
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Customer Details</h3>
                            </div>
                            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                                <dl className="sm:divide-y sm:divide-gray-200">
                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500 flex items-center"><Phone className="h-4 w-4 mr-2" /> Mobile</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.cust_mobile}</dd>
                                    </div>
                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500 flex items-center"><Mail className="h-4 w-4 mr-2" /> Email</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.cust_email || '-'}</dd>
                                    </div>
                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Credits</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.credits}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Interested Projects */}
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Interested Projects</h3>
                            </div>
                            <ul className="divide-y divide-gray-200">
                                {wishlist.length > 0 ? wishlist.map((item) => (
                                    <li key={item.w_id} className="px-4 py-4 sm:px-6 text-sm text-gray-700">
                                        {item.poj_name}
                                    </li>
                                )) : <li className="px-4 py-4 text-sm text-gray-500">No projects in wishlist</li>}
                            </ul>
                        </div>

                        {/* Recently Viewed */}
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Recently Viewed</h3>
                            </div>
                            <ul className="divide-y divide-gray-200">
                                {recentlyViewed.length > 0 ? recentlyViewed.map((item) => (
                                    <li key={item.id} className="px-4 py-4 sm:px-6 flex justify-between text-sm">
                                        <span className="text-gray-700">{item.poj_name}</span>
                                        <span className="text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 text-xs">{item.count} views</span>
                                    </li>
                                )) : <li className="px-4 py-4 text-sm text-gray-500">No recently viewed projects</li>}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Notes & Timeline */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Add Note Form */}
                        <div className="bg-white shadow sm:rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Add Note</h3>
                                <form onSubmit={handleNoteSubmit} className="mt-5 space-y-4">
                                    <div>
                                        <label htmlFor="note" className="sr-only">Note</label>
                                        <textarea
                                            id="note"
                                            rows={3}
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2"
                                            placeholder="Add a note..."
                                            value={noteForm.note}
                                            onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Status</label>
                                            <select
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                                                value={noteForm.status}
                                                onChange={(e) => setNoteForm({ ...noteForm, status: e.target.value })}
                                            >
                                                <option value="Follow up">Follow up</option>
                                                <option value="Call Not Picked">Call Not Picked</option>
                                                <option value="Interested">Interested</option>
                                                <option value="Not Interested">Not Interested</option>
                                                <option value="Site visit done">Site visit done</option>
                                                <option value="Booking done">Booking done</option>
                                                <option value="Already Booked">Already Booked</option>
                                                <option value="Dead Lead">Dead Lead</option>
                                                <option value="CP">CP</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Followup Date</label>
                                            <input
                                                type="date"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                                                value={noteForm.followupDate}
                                                onChange={(e) => setNoteForm({ ...noteForm, followupDate: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700">Followup Time</label>
                                            <input
                                                type="time"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                                                value={noteForm.followupTime}
                                                onChange={(e) => setNoteForm({ ...noteForm, followupTime: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            {submitting ? 'Saving...' : 'Add Note'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white shadow sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Timeline</h3>
                            </div>
                            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                                <div className="flow-root">
                                    <ul className="-mb-8">
                                        {notes.map((note, noteIdx) => (
                                            <li key={note.nid}>
                                                <div className="relative pb-8">
                                                    {noteIdx !== notes.length - 1 ? (
                                                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                                    ) : null}
                                                    <div className="relative flex space-x-3">
                                                        <div>
                                                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${note.type === 'enquiry' ? 'bg-blue-500' : 'bg-green-500'}`}>
                                                                <User className="h-5 w-5 text-white" aria-hidden="true" />
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                            <div>
                                                                <p className="text-sm text-gray-500">
                                                                    {note.note} <span className="font-medium text-gray-900">by {note.added_by}</span>
                                                                </p>
                                                                {note.status && (
                                                                    <p className="mt-1 text-xs text-gray-500">
                                                                        Status changed to <span className="font-medium">{note.status}</span>
                                                                    </p>
                                                                )}
                                                                {note.followup_date && (
                                                                    <p className="mt-1 text-xs text-gray-500 flex items-center">
                                                                        <Calendar className="h-3 w-3 mr-1" />
                                                                        Next Followup: {new Date(note.followup_date).toLocaleDateString()} {note.followup_time}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                                <time dateTime={note.added_at}>{new Date(note.added_at).toLocaleString()}</time>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
