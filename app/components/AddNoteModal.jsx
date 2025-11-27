'use client';
import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

export default function AddNoteModal({ isOpen, onClose, lead, onNoteAdded }) {
    const [note, setNote] = useState('');
    const [status, setStatus] = useState(lead?.status || 'Follow up');
    const [followupDate, setFollowupDate] = useState('');
    const [followupTime, setFollowupTime] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (lead) {
            setStatus(lead.status || 'Follow up');
            // Reset other fields
            setNote('');
            setFollowupDate('');
            setFollowupTime('');
        }
    }, [lead]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    enqid: lead.enq_id,
                    custid: lead.cust_id,
                    note,
                    addedby: 'Admin', // Hardcoded for now
                    status,
                    followupdate: followupDate,
                    followuptime: followupTime,
                }),
            });

            if (response.ok) {
                onNoteAdded();
                onClose();
            } else {
                alert('Failed to add note');
            }
        } catch (error) {
            console.error('Error adding note:', error);
            alert('Error adding note');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                                    <button
                                        type="button"
                                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Close</span>
                                        <X className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                            Add Note for {lead?.cust_name}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div>
                                                    <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                                                        Note
                                                    </label>
                                                    <div className="mt-1">
                                                        <textarea
                                                            id="note"
                                                            name="note"
                                                            rows={3}
                                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                                            value={note}
                                                            onChange={(e) => setNote(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                                        Status
                                                    </label>
                                                    <select
                                                        id="status"
                                                        name="status"
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                                        value={status}
                                                        onChange={(e) => setStatus(e.target.value)}
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

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label htmlFor="followupDate" className="block text-sm font-medium text-gray-700">
                                                            Followup Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            id="followupDate"
                                                            name="followupDate"
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                                            value={followupDate}
                                                            onChange={(e) => setFollowupDate(e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="followupTime" className="block text-sm font-medium text-gray-700">
                                                            Followup Time
                                                        </label>
                                                        <input
                                                            type="time"
                                                            id="followupTime"
                                                            name="followupTime"
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                                            value={followupTime}
                                                            onChange={(e) => setFollowupTime(e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                    <button
                                                        type="submit"
                                                        disabled={loading}
                                                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                                    >
                                                        {loading ? 'Saving...' : 'Save Note'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                                                        onClick={onClose}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
