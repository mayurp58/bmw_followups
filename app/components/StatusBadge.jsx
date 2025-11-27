export default function StatusBadge({ status }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Interested':
            case 'Booking done':
            case 'Site visit done':
                return 'bg-green-100 text-green-800';
            case 'Follow up':
                return 'bg-blue-100 text-blue-800';
            case 'Call Not Picked':
                return 'bg-orange-100 text-orange-800';
            case 'Not Interested':
            case 'Dead Lead':
                return 'bg-red-100 text-red-800';
            case 'Already Booked':
                return 'bg-purple-100 text-purple-800';
            case 'CP':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status || 'New'}
        </span>
    );
}
