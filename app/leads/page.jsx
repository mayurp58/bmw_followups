'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import AddNoteModal from '../components/AddNoteModal';
import Link from 'next/link';
import { Search, Filter, Download, Plus, Calendar, Phone, MessageCircle, User, ChevronLeft, ChevronRight } from 'lucide-react';

import Tabs from '../components/Tabs';

function LeadsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [leads, setLeads] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [activeTab, setActiveTab] = useState('enquiry');
    const [statusCounts, setStatusCounts] = useState([]);

    // Filters state
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        status: searchParams.get('status') || '',
        projectId: searchParams.get('projectId') || '',
        fromDate: searchParams.get('fromDate') || '',
        toDate: searchParams.get('toDate') || '',
    });

    const fetchLeads = async () => {
        setLoading(true);
        const params = new URLSearchParams({
            page: pagination.page,
            limit: 10,
            type: activeTab,
            ...filters
        });

        // Remove empty filters
        for (const [key, value] of params.entries()) {
            if (!value) params.delete(key);
        }

        try {
            const res = await fetch(`/api/leads?${params}`);
            const data = await res.json();
            if (data.pagination) {
                setLeads(data.leads || []);
                setPagination(data.pagination);
            } else {
                console.error('Invalid API response:', data);
                setLeads([]);
            }
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
        fetchStatusCounts();
    }, [pagination.page, activeTab, filters]);

    const fetchStatusCounts = async () => {
        try {
            const res = await fetch('/api/dashboard/stats');
            const data = await res.json();
            if (data.statusCounts) {
                setStatusCounts(data.statusCounts);
            }
        } catch (err) {
            console.error('Failed to fetch status counts', err);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 when filters change
        fetchLeads(); // Manually trigger fetch
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const openAddNoteModal = (lead) => {
        setSelectedLead(lead);
        setIsModalOpen(true);
    };

    const handleNoteAdded = () => {
        fetchLeads(); // Refresh list
    };

    const exportToCSV = () => {
        // Simple CSV export of current data
        const headers = ['ID', 'Name', 'Mobile', 'Project', 'Status', 'Followup Date', 'Followup Time', 'Last Note'];
        const csvContent = [
            headers.join(','),
            ...leads.map(lead => [
                lead.id,
                `"${lead.cust_name}"`,
                lead.cust_mobile,
                `"${lead.project_name || ''}"`,
                lead.status,
                lead.followup_date ? new Date(lead.followup_date).toLocaleDateString() : '',
                lead.followup_time || '',
                `"${(lead.last_note || '').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'leads.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const tabs = [
        { id: 'enquiry', name: 'Project Enquiry Leads' },
        { id: 'customer', name: 'Customer Leads' },
        { id: 'new', name: 'New Leads' },
        { id: 'booking', name: 'Booking Done' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            A list of all leads including their name, project, status, and followup details.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <button
                            onClick={exportToCSV}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </button>
                    </div>
                </div>

                <div className="mt-6">
                    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                {/* Filters */}
                <div className="mt-8 bg-white p-4 shadow rounded-lg">
                    <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="search"
                                    id="search"
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md border p-2"
                                    placeholder="Search by name or mobile"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>

                        {/* Hide status filter for new and booking tabs */}
                        {activeTab !== 'new' && activeTab !== 'booking' && (
                            <div className="sm:col-span-1">
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                                    value={filters.status}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Follow up">Follow up</option>
                                    <option value="Call Not Picked">Call Not Picked</option>
                                    <option value="Interested">Interested</option>
                                    <option value="Not Interested">Not Interested</option>
                                    <option value="Site visit done">Site visit done</option>
                                    <option value="Booking done">Booking done</option>
                                    <option value="Already Booked">Already Booked</option>
                                    <option value="Dead Lead">Dead Lead</option>
                                </select>
                            </div>
                        )}

                        <div className="sm:col-span-1">
                            <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700">From Date</label>
                            <input
                                type="date"
                                name="fromDate"
                                id="fromDate"
                                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2"
                                value={filters.fromDate}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="sm:col-span-1">
                            <label htmlFor="toDate" className="block text-sm font-medium text-gray-700">To Date</label>
                            <input
                                type="date"
                                name="toDate"
                                id="toDate"
                                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2"
                                value={filters.toDate}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="sm:col-span-1 flex items-end">
                            <button
                                onClick={applyFilters}
                                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Apply
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Project</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Followup</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Note</th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4 text-sm text-gray-500">Loading...</td>
                                            </tr>
                                        ) : leads.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4 text-sm text-gray-500">No leads found</td>
                                            </tr>
                                        ) : (
                                            leads.map((lead) => (
                                                <tr key={lead.id || lead.enq_id || Math.random()}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                        <Link href={`/leads/${lead.id || lead.enq_id}?type=${activeTab}`} className="font-medium text-blue-600 hover:text-blue-900 block">
                                                            {lead.cust_name || 'Unknown'}
                                                        </Link>
                                                        <Link href={`/leads/${lead.id || lead.enq_id}?type=${activeTab}`} className="text-gray-500 hover:text-gray-900 block">
                                                            {lead.cust_mobile || '-'}
                                                        </Link>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${activeTab === 'customer'
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {activeTab === 'customer' ? 'Customer' : 'Enquiry'}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {lead.project_name || '-'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        <StatusBadge status={lead.status} />
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {lead.followup_date ? (
                                                            <>
                                                                <div>{new Date(lead.followup_date).toLocaleDateString()}</div>
                                                                <div className="text-xs text-gray-400">{lead.followup_time}</div>
                                                            </>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                        {lead.last_note || '-'}
                                                    </td>
                                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <div className="flex justify-end space-x-2">
                                                            <a
                                                                href={`https://wa.me/${lead.cust_mobile}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-green-600 hover:text-green-900"
                                                                title="WhatsApp"
                                                            >
                                                                <MessageCircle className="h-5 w-5" />
                                                            </a>
                                                            <button
                                                                onClick={() => openAddNoteModal(lead)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                                title="Add Note"
                                                            >
                                                                <Plus className="h-5 w-5" />
                                                            </button>
                                                            <Link href={`/leads/${lead.id || lead.enq_id}?type=${activeTab}`} className="text-gray-600 hover:text-gray-900" title="View Details">
                                                                <ChevronRight className="h-5 w-5" />
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing page <span className="font-medium">{pagination.page}</span> of <span className="font-medium">{pagination.totalPages}</span> ({pagination.total} results)
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </main>

            <AddNoteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                lead={selectedLead}
                onNoteAdded={handleNoteAdded}
            />
        </div>
    );
}

export default function LeadsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LeadsContent />
        </Suspense>
    );
}
