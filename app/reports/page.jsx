'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from 'recharts';
import { Download } from 'lucide-react';

export default function ReportsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        agent: ''
    });

    const fetchData = async () => {
        setLoading(true);
        const params = new URLSearchParams(filters);
        // Remove empty
        for (const [key, value] of params.entries()) {
            if (!value) params.delete(key);
        }

        try {
            const res = await fetch(`/api/reports?${params}`);
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading && !data) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="sm:flex sm:items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
                    <button
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        onClick={() => window.print()} // Simple print for PDF
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                    </button>
                </div>

                {/* Filters */}
                <div className="mt-4 bg-white p-4 shadow rounded-lg flex space-x-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">From Date</label>
                        <input
                            type="date"
                            name="fromDate"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                            value={filters.fromDate}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">To Date</label>
                        <input
                            type="date"
                            name="toDate"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border p-2"
                            value={filters.toDate}
                            onChange={handleFilterChange}
                        />
                    </div>
                </div>

                {data && (
                    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Status Chart */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Leads by Status</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.statusData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="count"
                                            nameKey="status"
                                        >
                                            {data.statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Project Distribution */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Top Projects</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.projectData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="poj_name" type="category" width={150} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Conversion Funnel */}
                        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Conversion Funnel</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <FunnelChart>
                                        <Tooltip />
                                        <Funnel
                                            dataKey="value"
                                            data={data.funnelData}
                                            isAnimationActive
                                        >
                                            <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                                        </Funnel>
                                    </FunnelChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
