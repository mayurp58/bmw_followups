'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import AddNoteModal from '../../components/AddNoteModal';
import Tabs from '../../components/Tabs';
import { Search, ChevronLeft, ChevronRight, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProjectLeadsPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [project, setProject] = useState(null);
    const [leads, setLeads] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [leadType, setLeadType] = useState('enquiry'); // 'enquiry' or 'customer'

    const [filters, setFilters] = useState({
        search: '',
        status: '',
    });

    const fetchProjectLeads = async () => {
        setLoading(true);
        const params = new URLSearchParams({
            page: pagination.page,
            limit: 10,
            leadType,
            ...filters
        });

        // Remove empty filters
        for (const [key, value] of params.entries()) {
            if (!value) params.delete(key);
        }

        try {
            const res = await fetch(`/api/projects/${id}/leads?${params}`);
            const data = await res.json();
            if (data.pagination) {
                setProject(data.project);
                setLeads(data.leads || []);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error fetching project leads:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchProjectLeads();
    }, [id, pagination.page, filters, leadType]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchProjectLeads();
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
        fetchProjectLeads(); // Refresh list
    };

    if (loading && !project) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/projects')}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Projects
                    </button>
                    <h1 className="text-2xl font-semibold text-gray-900">{project?.poj_name}</h1>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span>{project?.enquiry_count || 0} Enquiries</span>
                        <span>•</span>
                        <span>{project?.customer_count || 0} Customers</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-6">
                    <Tabs
                        tabs={[
                            { name: 'Enquiry Leads', id: 'enquiry' },
                            { name: 'Customer Leads', id: 'customer' }
                        ]}
                        activeTab={leadType}
                        onTabChange={setLeadType}
                    />
                </div>

                {/* Filters */}
                <div className="bg-white p-4 shadow rounded-lg mb-6">
                    <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-4">
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
                        <div className="sm:col-span-1 flex items-end">
                            <button
                                onClick={applyFilters}
                                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>

                {/* Leads Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Followup</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Note</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link href={`/leads/${lead.id}?type=${lead.type}`} className="text-blue-600 hover:text-blue-800">
                                                {lead.cust_name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <Link href={`/leads/${lead.id}?type=${lead.type}`} className="text-gray-900 hover:text-blue-600">
                                                {lead.cust_mobile}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={lead.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {lead.followup_date ? (
                                                <div>
                                                    <div>{new Date(lead.followup_date).toLocaleDateString()}</div>
                                                    {lead.followup_time && <div className="text-xs">{lead.followup_time}</div>}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {lead.last_note || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => openAddNoteModal(lead)}
                                                className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add Note
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {leads.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No leads found for this project</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{((pagination.page - 1) * 10) + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(pagination.page * 10, pagination.total)}</span> of{' '}
                                        <span className="font-medium">{pagination.total}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                            Page {pagination.page} of {pagination.totalPages}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page === pagination.totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Add Note Modal */}
            {isModalOpen && selectedLead && (
                <AddNoteModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    lead={selectedLead}
                    onNoteAdded={handleNoteAdded}
                />
            )}
        </div>
    );
}
