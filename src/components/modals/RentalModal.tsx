import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { rentalService } from '@/services/rentalService';
import { customerService } from '@/services/customerService';
import { carService } from '@/services/carService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import type { Database } from '@/lib/supabase/types';

type Customer = Database['public']['Tables']['customers']['Row'];
type Car = Database['public']['Tables']['cars']['Row'];

const rentalSchema = z.object({
    customer_id: z.number().positive('Please select a customer'),
    car_id: z.number().positive('Please select a car'),
    rental_date: z.string().min(1, 'Rental date is required'),
    expected_return_date: z.string().min(1, 'Expected return date is required'),
});

type RentalFormData = z.infer<typeof rentalSchema>;

interface RentalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RentalModal({ isOpen, onClose, onSuccess }: RentalModalProps) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [availableCars, setAvailableCars] = useState<Car[]>([]);
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const [totalCost, setTotalCost] = useState(0);

    const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<RentalFormData>({
        resolver: zodResolver(rentalSchema),
        defaultValues: {
            rental_date: format(new Date(), 'yyyy-MM-dd'),
            expected_return_date: format(new Date(), 'yyyy-MM-dd'),
        },
    });

    const rentalDate = watch('rental_date');
    const expectedReturnDate = watch('expected_return_date');
    const carId = watch('car_id');

    useEffect(() => {
        fetchCustomers();
        fetchAvailableCars();
    }, []);

    useEffect(() => {
        if (carId && availableCars.length > 0) {
            const car = availableCars.find(c => c.car_id === Number(carId));
            setSelectedCar(car || null);
        } else {
            setSelectedCar(null);
        }
    }, [carId, availableCars]);

    useEffect(() => {
        if (selectedCar && rentalDate && expectedReturnDate) {
            const days = differenceInDays(new Date(expectedReturnDate), new Date(rentalDate));
            setTotalCost(Math.max(1, days) * selectedCar.daily_rate);
        } else {
            setTotalCost(0);
        }
    }, [selectedCar, rentalDate, expectedReturnDate]);

    async function fetchCustomers() {
        try {
            const data = await customerService.getAll();
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Failed to fetch customers');
        }
    }

    async function fetchAvailableCars() {
        try {
            const data = await carService.getAll();
            setAvailableCars(data.filter(car => car.status === 'Available'));
        } catch (error) {
            console.error('Error fetching cars:', error);
            toast.error('Failed to fetch available cars');
        }
    }

    async function onSubmit(data: RentalFormData) {
        try {
            await rentalService.create({
                ...data,
                status: 'Ongoing',
                total_cost: totalCost,
            });
            toast.success('Rental created successfully');
            onSuccess();
            onClose();
            reset();
        } catch (error) {
            console.error('Error creating rental:', error);
            toast.error('Failed to create rental');
        }
    }

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
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <div>
                                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                                        New Rental
                                    </Dialog.Title>
                                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                                        <div>
                                            <label htmlFor="customer_id" className="block text-sm font-medium leading-6 text-gray-900">
                                                Customer
                                            </label>
                                            <select
                                                id="customer_id"
                                                {...register('customer_id', { valueAsNumber: true })}
                                                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            >
                                                <option value="">Select a customer</option>
                                                {customers.map(customer => (
                                                    <option key={customer.customer_id} value={customer.customer_id}>
                                                        {customer.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.customer_id && (
                                                <p className="mt-2 text-sm text-red-600">{errors.customer_id.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="car_id" className="block text-sm font-medium leading-6 text-gray-900">
                                                Car
                                            </label>
                                            <select
                                                id="car_id"
                                                {...register('car_id', { valueAsNumber: true })}
                                                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            >
                                                <option value="">Select a car</option>
                                                {availableCars.map(car => (
                                                    <option key={car.car_id} value={car.car_id}>
                                                        {car.brand} {car.model} - ${car.daily_rate}/day
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.car_id && (
                                                <p className="mt-2 text-sm text-red-600">{errors.car_id.message}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="rental_date" className="block text-sm font-medium leading-6 text-gray-900">
                                                    Rental Date
                                                </label>
                                                <input
                                                    type="date"
                                                    id="rental_date"
                                                    {...register('rental_date')}
                                                    min={format(new Date(), 'yyyy-MM-dd')}
                                                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                />
                                                {errors.rental_date && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.rental_date.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="expected_return_date" className="block text-sm font-medium leading-6 text-gray-900">
                                                    Expected Return Date
                                                </label>
                                                <input
                                                    type="date"
                                                    id="expected_return_date"
                                                    {...register('expected_return_date')}
                                                    min={rentalDate}
                                                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                />
                                                {errors.expected_return_date && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.expected_return_date.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        {selectedCar && totalCost > 0 && (
                                            <div className="rounded-md bg-blue-50 p-4">
                                                <div className="flex">
                                                    <div className="ml-3">
                                                        <h3 className="text-sm font-medium text-blue-800">Rental Summary</h3>
                                                        <div className="mt-2 text-sm text-blue-700">
                                                            <p>Daily Rate: ${selectedCar.daily_rate.toFixed(2)}</p>
                                                            <p className="font-semibold">Total Cost: ${totalCost.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                                            >
                                                {isSubmitting ? 'Creating...' : 'Create Rental'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
} 