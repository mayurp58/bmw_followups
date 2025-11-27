'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { Building2, Users, Search, TrendingUp } from 'lucide-react';

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = projects.filter(project =>
                project.poj_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProjects(filtered);
        } else {
            setFilteredProjects(projects);
        }
    }, [searchTerm, projects]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            setProjects(data.projects || []);
            setFilteredProjects(data.projects || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProjectClick = (projectId) => {
        router.push(`/projects/${projectId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            View all projects and their lead counts
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-medium">{projects.length}</span> Total Projects
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="mt-6">
                    <div className="relative rounded-md shadow-sm max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md border p-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                        <div
                            key={project.proj_id}
                            onClick={() => handleProjectClick(project.proj_id)}
                            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Building2 className="h-10 w-10 text-blue-500" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            {project.poj_name}
                                        </dt>
                                        <dd className="mt-2 space-y-1">
                                            <div className="flex items-center text-sm font-semibold text-gray-900">
                                                <Users className="h-4 w-4 text-gray-400 mr-1" />
                                                {project.total_count} Total
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500 space-x-2">
                                                <span>{project.enquiry_count} Enquiries</span>
                                                <span>•</span>
                                                <span>{project.customer_count} Customers</span>
                                            </div>
                                        </dd>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-3">
                                <div className="text-sm">
                                    <span className="font-medium text-blue-600 hover:text-blue-500">
                                        View details →
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProjects.length === 0 && (
                    <div className="text-center py-12">
                        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Try adjusting your search' : 'No projects available'}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
