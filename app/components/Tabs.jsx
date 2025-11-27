export default function Tabs({ tabs, activeTab, onTabChange }) {
    return (
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                        `}
                        aria-current={activeTab === tab.id ? 'page' : undefined}
                    >
                        {tab.name}
                        {tab.count !== undefined && (
                            <span className={`ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900'}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
}
