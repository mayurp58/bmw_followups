'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import LeadCard from '../components/LeadCard';
import AddNoteModal from '../components/AddNoteModal';
import { Disclosure } from '@headlessui/react';
import { ChevronUp, Calendar } from 'lucide-react';

export default function RemindersPage() {
    const [groupedLeads, setGroupedLeads] = useState({});
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/followups/upcoming');
            const data = await res.json();
            setGroupedLeads(data);
        } catch (error) {
            console.error('Error fetching reminders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleAddNote = (lead) => {
        setSelectedLead(lead);
        setIsModalOpen(true);
    };

    const sortedDates = Object.keys(groupedLeads).sort();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Upcoming Reminders</h1>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white shadow rounded-lg h-16 animate-pulse"></div>
                        ))}
                    </div>
                ) : sortedDates.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No upcoming followups for the next 7 days.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sortedDates.map((date) => {
                            const leads = groupedLeads[date];
                            const isToday = new Date(date).toDateString() === new Date().toDateString();

                            return (
                                <Disclosure key={date} defaultOpen={true}>
                                    {({ open }) => (
                                        <div className="bg-white shadow rounded-lg overflow-hidden">
                                            <Disclosure.Button className="flex w-full justify-between items-center px-4 py-4 sm:px-6 bg-gray-50 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
                                                <div className="flex items-center">
                                                    <Calendar className={`h-5 w-5 mr-3 ${isToday ? 'text-blue-500' : 'text-gray-400'}`} />
                                                    <span className={`text-lg font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                                                        {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </span>
                                                    <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {leads.length}
                                                    </span>
                                                </div>
                                                <ChevronUp
                                                    className={`${open ? 'transform rotate-180' : ''} h-5 w-5 text-gray-500`}
                                                />
                                            </Disclosure.Button>
                                            <Disclosure.Panel className="px-4 py-4 sm:px-6 bg-white border-t border-gray-200">
                                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                    {leads.map((lead) => (
                                                        <LeadCard
                                                            key={lead.enq_id || lead.cust_id}
                                                            lead={lead}
                                                            onAddNote={handleAddNote}
                                                        />
                                                    ))}
                                                </div>
                                            </Disclosure.Panel>
                                        </div>
                                    )}
                                </Disclosure>
                            );
                        })}
                    </div>
                )}
            </main>

            <AddNoteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                lead={selectedLead}
                onNoteAdded={fetchLeads}
            />
        </div>
    );
}
