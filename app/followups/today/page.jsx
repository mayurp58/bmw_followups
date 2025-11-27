'use client';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import LeadCard from '../../components/LeadCard';
import AddNoteModal from '../../components/AddNoteModal';
import { Filter } from 'lucide-react';

import Tabs from '../../components/Tabs';

export default function TodayFollowupsPage() {
    const [enquiries, setEnquiries] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [activeTab, setActiveTab] = useState('enquiries');

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/followups/today');
            const data = await res.json();
            setEnquiries(data.enquiries || []);
            setCustomers(data.customers || []);
        } catch (error) {
            console.error('Error fetching followups:', error);
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

    const filterList = (list) => {
        return filterStatus
            ? list.filter(lead => lead.status === filterStatus)
            : list;
    };

    const filteredEnquiries = filterList(enquiries);
    const filteredCustomers = filterList(customers);

    const tabs = [
        { id: 'enquiries', name: 'Project Enquiries', count: filteredEnquiries.length },
        { id: 'customers', name: 'Customer Followups', count: filteredCustomers.length },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-2xl font-semibold text-gray-900">Today's Followups</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Leads scheduled for followup today.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center space-x-2">
                        <Filter className="h-5 w-5 text-gray-400" />
                        <select
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="Follow up">Follow up</option>
                            <option value="Call Not Picked">Call Not Picked</option>
                            <option value="Interested">Interested</option>
                            <option value="Not Interested">Not Interested</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6">
                    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                {/* Project Enquiries Section */}
                {activeTab === 'enquiries' && (
                    <div className="mt-8">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-white shadow rounded-lg h-48 animate-pulse"></div>
                                ))
                            ) : filteredEnquiries.length === 0 ? (
                                <div className="col-span-full text-center py-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                                    No project enquiries scheduled for today.
                                </div>
                            ) : (
                                filteredEnquiries.map((lead) => (
                                    <LeadCard
                                        key={`enq-${lead.enq_id}`}
                                        lead={lead}
                                        onAddNote={handleAddNote}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Customer Followups Section */}
                {activeTab === 'customers' && (
                    <div className="mt-8">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-white shadow rounded-lg h-48 animate-pulse"></div>
                                ))
                            ) : filteredCustomers.length === 0 ? (
                                <div className="col-span-full text-center py-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                                    No customer followups scheduled for today.
                                </div>
                            ) : (
                                filteredCustomers.map((lead) => (
                                    <LeadCard
                                        key={`cust-${lead.cust_id}`}
                                        lead={lead}
                                        onAddNote={handleAddNote}
                                    />
                                ))
                            )}
                        </div>
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
