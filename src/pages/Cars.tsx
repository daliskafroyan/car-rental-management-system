import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { carService } from '@/services/carService';
import toast from 'react-hot-toast';
import type { Database } from '@/lib/supabase/types';
import CarModal from '@/components/modals/CarModal';

type Car = Database['public']['Tables']['cars']['Row'];

export default function Cars() {
    const [cars, setCars] = useState<Car[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCar, setSelectedCar] = useState<Car | undefined>();
    const [statusFilter, setStatusFilter] = useState<Car['status'] | 'all'>('all');

    useEffect(() => {
        fetchCars();
    }, []);

    async function fetchCars() {
        try {
            const data = await carService.getAll();
            setCars(data);
        } catch (error) {
            console.error('Error fetching cars:', error);
            toast.error('Failed to fetch cars');
        } finally {
            setIsLoading(false);
        }
    }

    function handleEdit(car: Car) {
        setSelectedCar(car);
        setIsModalOpen(true);
    }

    async function handleDelete(id: number) {
        if (!window.confirm('Are you sure you want to delete this car?')) return;

        try {
            await carService.delete(id);
            toast.success('Car deleted successfully');
            fetchCars();
        } catch (error) {
            console.error('Error deleting car:', error);
            toast.error('Failed to delete car');
        }
    }

    const filteredCars = cars.filter(
        car => statusFilter === 'all' || car.status === statusFilter
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
                    <h1 className="text-2xl font-semibold text-gray-900">Cars</h1>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedCar(undefined);
                            setIsModalOpen(true);
                        }}
                        className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-500"
                    >
                        <PlusIcon className="inline-block h-5 w-5 mr-1" />
                        Add Car
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as Car['status'] | 'all')}
                    className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                    <option value="all">All Status</option>
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Maintenance">Maintenance</option>
                </select>
            </div>

            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        {filteredCars.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-sm text-gray-500">No cars found</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead>
                                    <tr>
                                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Brand</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Model</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Year</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">License Plate</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Daily Rate</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredCars.map((car) => (
                                        <tr key={car.car_id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                {car.brand}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {car.model}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {car.year}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {car.license_plate}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                ${car.daily_rate.toFixed(2)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <span
                                                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${car.status === 'Available'
                                                            ? 'bg-green-100 text-green-800'
                                                            : car.status === 'Rented'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {car.status}
                                                </span>
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                <button
                                                    onClick={() => handleEdit(car)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(car.car_id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            <CarModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedCar(undefined);
                }}
                onSuccess={fetchCars}
                car={selectedCar}
            />
        </div>
    );
} 