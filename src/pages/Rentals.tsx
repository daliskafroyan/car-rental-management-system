import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { rentalService } from '@/services/rentalService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { Database } from '@/lib/supabase/types';
import RentalModal from '@/components/modals/RentalModal';
import { PaymentModal } from '@/components/modals/PaymentModal';

type Rental = Database['public']['Tables']['rentals']['Row'] & {
    customer: { name: string };
    car: { brand: string; model: string };
};

export default function Rentals() {
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedRental, setSelectedRental] = useState<Rental>();
    const [statusFilter, setStatusFilter] = useState<Rental['status'] | 'all'>('all');

    useEffect(() => {
        fetchRentals();
    }, []);

    async function fetchRentals() {
        try {
            const data = await rentalService.getAll();
            setRentals(data);
        } catch (error) {
            console.error('Error fetching rentals:', error);
            toast.error('Failed to fetch rentals');
        } finally {
            setIsLoading(false);
        }
    }

    function handleComplete(rental: Rental) {
        setSelectedRental(rental);
        setIsPaymentModalOpen(true);
    }

    async function handleCancel(id: number) {
        if (!window.confirm('Are you sure you want to cancel this rental?')) return;

        try {
            await rentalService.cancel(id);
            toast.success('Rental cancelled successfully');
            fetchRentals();
        } catch (error) {
            console.error('Error cancelling rental:', error);
            toast.error('Failed to cancel rental');
        }
    }

    const filteredRentals = rentals.filter(
        rental => statusFilter === 'all' || rental.status === statusFilter
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Rentals</h1>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => setIsRentalModalOpen(true)}
                        className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-500"
                    >
                        <PlusIcon className="inline-block h-5 w-5 mr-1" />
                        New Rental
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as Rental['status'] | 'all')}
                    className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                    <option value="all">All Status</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        {filteredRentals.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-sm text-gray-500">
                                    {statusFilter === 'all' ? 'No rentals found' : `No ${statusFilter.toLowerCase()} rentals found`}
                                </p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead>
                                    <tr>
                                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Car</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rental Date</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Return Date</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total Cost</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredRentals.map((rental) => (
                                        <tr key={rental.rental_id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                {rental.customer.name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {rental.car.brand} {rental.car.model}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {format(new Date(rental.rental_date), 'MMM d, yyyy')}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {rental.return_date ? format(new Date(rental.return_date), 'MMM d, yyyy') : '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                ${rental.total_cost.toFixed(2)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <span
                                                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${rental.status === 'Ongoing'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : rental.status === 'Completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {rental.status}
                                                </span>
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                {rental.status === 'Ongoing' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleComplete(rental)}
                                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                        >
                                                            Complete
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(rental.rental_id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            <RentalModal
                isOpen={isRentalModalOpen}
                onClose={() => setIsRentalModalOpen(false)}
                onSuccess={fetchRentals}
            />

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedRental(undefined);
                }}
                onSuccess={fetchRentals}
                rental={selectedRental}
            />
        </div>
    );
} 