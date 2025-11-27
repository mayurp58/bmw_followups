import Link from 'next/link';
import { Phone, Eye, PlusCircle, Calendar, Clock, MessageCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function LeadCard({ lead, onAddNote }) {
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 truncate">
                            {lead.cust_name || 'Unknown Name'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 truncate">
                            {lead.project_name || 'No Project'}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <StatusBadge status={lead.status} />
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
