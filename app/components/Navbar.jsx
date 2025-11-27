'use client';
import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Phone, Bell, BarChart3, User, Menu, X } from 'lucide-react';
import { Disclosure, Popover, Transition } from '@headlessui/react';

export default function Navbar() {
    const pathname = usePathname();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetch('/api/followups/today')
            .then(res => res.json())
            .then(data => {
                // Handle new API response structure { enquiries: [], customers: [] }
                const allNotifications = [
                    ...(data.enquiries || []),
                    ...(data.customers || [])
                ].sort((a, b) => {
                    if (!a.followup_time) return 1;
                    if (!b.followup_time) return -1;
                    return a.followup_time.localeCompare(b.followup_time);
                });
                setNotifications(allNotifications);
            })
            .catch(err => console.error('Failed to fetch notifications', err));
    }, []);

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Leads', href: '/leads', icon: Users },
        { name: 'Followups', href: '/followups/today', icon: Phone },
        { name: 'Reminders', href: '/reminders', icon: Bell },
        { name: 'Reports', href: '/reports', icon: BarChart3 },
    ];

    return (
        <Disclosure as="nav" className="bg-white shadow-sm border-b border-gray-200">
            {({ open }) => (
                <>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex">
                                <div className="flex-shrink-0 flex items-center">
                                    <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
                                        <img width="120" height="30" src="https://d19yyi13ug8knw.cloudfront.net/assets/logo.png" alt="Bookmywing Logo" />
                                    </Link>
                                </div>
                                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                    {navItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = pathname.startsWith(item.href);
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive
                                                    ? 'border-blue-500 text-gray-900'
                                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4 mr-2" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:items-center">
                                {/* Notification Dropdown */}
                                <Popover className="relative">
                                    {({ open }) => (
                                        <>
                                            <Popover.Button className={`bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${open ? 'text-gray-500' : ''}`}>
                                                <span className="sr-only">View notifications</span>
                                                <div className="relative">
                                                    <Bell className="h-6 w-6" />
                                                    {notifications.length > 0 && (
                                                        <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs text-center leading-4">
                                                            {notifications.length}
                                                        </span>
                                                    )}
                                                </div>
                                            </Popover.Button>
                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-200"
                                                enterFrom="opacity-0 translate-y-1"
                                                enterTo="opacity-100 translate-y-0"
                                                leave="transition ease-in duration-150"
                                                leaveFrom="opacity-100 translate-y-0"
                                                leaveTo="opacity-0 translate-y-1"
                                            >
                                                <Popover.Panel className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                    <div className="py-1">
                                                        <div className="px-4 py-2 border-b border-gray-100 font-medium text-gray-900">
                                                            Today's Reminders ({notifications.length})
                                                        </div>
                                                        <div className="max-h-96 overflow-y-auto">
                                                            {notifications.length === 0 ? (
                                                                <div className="px-4 py-3 text-sm text-gray-500">No reminders for today.</div>
                                                            ) : (
                                                                notifications.map((note, idx) => (
                                                                    <Link
                                                                        key={idx}
                                                                        href={`/leads/${note.enq_id || note.cust_id}?type=${note.type || 'enquiry'}`}
                                                                        className="block px-4 py-3 hover:bg-gray-50 transition duration-150 ease-in-out"
                                                                    >
                                                                        <div className="flex justify-between">
                                                                            <p className="text-sm font-medium text-blue-600 truncate">{note.cust_name}</p>
                                                                            <p className="text-xs text-gray-500">{note.followup_time}</p>
                                                                        </div>
                                                                        <p className="text-xs text-gray-500 mt-1 truncate">{note.last_note}</p>
                                                                    </Link>
                                                                ))
                                                            )}
                                                        </div>
                                                        <div className="border-t border-gray-100">
                                                            <Link href="/followups/today" className="block w-full px-4 py-2 text-center text-sm font-medium text-blue-600 hover:bg-gray-50">
                                                                View all
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </Popover.Panel>
                                            </Transition>
                                        </>
                                    )}
                                </Popover>

                                <div className="ml-3 relative flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="bg-blue-100 rounded-full p-2">
                                            <User className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Admin</span>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            await fetch('/api/auth/logout', { method: 'POST' });
                                            window.location.href = '/login';
                                        }}
                                        className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                            <div className="-mr-2 flex items-center sm:hidden">
                                {/* Mobile menu button */}
                                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <X className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Menu className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden">
                        <div className="pt-2 pb-3 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Disclosure.Button
                                        key={item.name}
                                        as={Link}
                                        href={item.href}
                                        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive
                                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                                            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <Icon className="w-5 h-5 mr-3" />
                                            {item.name}
                                        </div>
                                    </Disclosure.Button>
                                );
                            })}
                        </div>
                        <div className="pt-4 pb-4 border-t border-gray-200">
                            <div className="flex items-center px-4">
                                <div className="flex-shrink-0">
                                    <div className="bg-blue-100 rounded-full p-2">
                                        <User className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-gray-800">Admin</div>
                                </div>
                                <button className="ml-auto bg-white flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <span className="sr-only">View notifications</span>
                                    <div className="relative">
                                        <Bell className="h-6 w-6" />
                                        {notifications.length > 0 && (
                                            <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs text-center leading-4">
                                                {notifications.length}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            </div>
                            {notifications.length > 0 && (
                                <div className="mt-3 px-2 space-y-1">
                                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Today's Reminders
                                    </div>
                                    {notifications.slice(0, 5).map((note, idx) => (
                                        <Link
                                            key={idx}
                                            href={`/leads/${note.enq_id || note.cust_id}?type=${note.type || 'enquiry'}`}
                                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                        >
                                            <div className="flex justify-between">
                                                <span>{note.cust_name}</span>
                                                <span className="text-xs text-gray-400">{note.followup_time}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                            <div className="mt-3 px-2">
                                <button
                                    onClick={async () => {
                                        await fetch('/api/auth/logout', { method: 'POST' });
                                        window.location.href = '/login';
                                    }}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
}
