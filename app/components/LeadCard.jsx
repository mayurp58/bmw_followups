import { useState } from 'react';
import Link from 'next/link';
import { Phone, Eye, PlusCircle, Calendar, Clock, MessageCircle, X } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function LeadCard({ lead, onAddNote }) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSaveName = async () => {
        if (!newName.trim()) return;
        setSaving(true);
        try {
            const res = await fetch('/api/enquiries/update-customer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enq_id: lead.enq_id, cust_name: newName })
            });
            if (res.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error saving name:', error);
        } finally {
            setSaving(false);
            setIsEditingName(false);
        }
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        {isEditingName ? (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-1"
                                    placeholder="Enter Name"
                                />
                                <button
                                    onClick={handleSaveName}
                                    disabled={saving}
                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    {saving ? '...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => setIsEditingName(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <h3 className="text-lg font-medium leading-6 text-gray-900 truncate">
                                    {lead.cust_name || 'Unknown Name'}
                                </h3>
                                {(!lead.cust_name || lead.cust_name === 'Unknown Name') && (
                                    <button
                                        onClick={() => setIsEditingName(true)}
                                        className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
                                    >
                                        Add Name
                                    </button>
                                )}
                            </div>
                        )}
                        <p className="mt-1 text-sm text-gray-500 truncate">
                            {lead.project_name || 'No Project'}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex flex-col items-end space-y-2">
                        <StatusBadge status={lead.status} />
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${(lead.type || 'enquiry') === 'customer'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                            {(lead.type || 'enquiry') === 'customer' ? 'Customer' : 'Enquiry'}
                        </span>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex items-center text-sm text-gray-500">
                        <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <a href={`tel:${lead.cust_mobile}`} className="hover:text-blue-600">
                            {lead.cust_mobile}
                        </a>
                    </div>
                    {lead.followup_date && (
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                            <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span className="mr-2">
                                {new Date(lead.followup_date).toLocaleDateString()}
                            </span>
                            {lead.followup_time && (
                                <>
                                    <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                    <span>{lead.followup_time}</span>
                                </>
                            )}
                        </div>
                    )}
                    {lead.last_note && (
                        <div className="mt-3 text-sm text-gray-600 italic border-l-2 border-gray-200 pl-2">
                            "{lead.last_note}"
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between items-center">
                <div className="flex space-x-2">
                    <a
                        href={`tel:${lead.cust_mobile}`}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                    </a>
                    <a
                        href={`https://wa.me/${lead.cust_mobile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        WhatsApp
                    </a>
                    <button
                        onClick={() => onAddNote(lead)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <PlusCircle className="h-3 w-3 mr-1" />
                        Note
                    </button>
                </div>
                <Link
                    href={`/leads/${lead.enq_id || lead.cust_id}?type=${lead.type || 'enquiry'}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
                >
                    View Details <Eye className="ml-1 h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}
