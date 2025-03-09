import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { carService } from '@/services/carService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import type { Database } from '@/lib/supabase/types';

type Car = Database['public']['Tables']['cars']['Row'];

const carSchema = z.object({
    brand: z.string().min(1, 'Brand is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.number().min(1900).max(new Date().getFullYear() + 1),
    license_plate: z.string().min(1, 'License plate is required'),
    status: z.enum(['Available', 'Rented', 'Maintenance']),
    daily_rate: z.number().positive('Daily rate must be greater than 0'),
});

type CarFormData = z.infer<typeof carSchema>;

interface CarModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    car?: Car;
}

export const CarModal = ({ isOpen, onClose, onSuccess, car }: CarModalProps) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CarFormData>({
        resolver: zodResolver(carSchema),
        defaultValues: {
            brand: '',
            model: '',
            year: new Date().getFullYear(),
            license_plate: '',
            status: 'Available',
            daily_rate: 0,
        },
    });

    useEffect(() => {
        if (car) {
            reset({
                brand: car.brand,
                model: car.model,
                year: car.year,
                license_plate: car.license_plate,
                status: car.status,
                daily_rate: car.daily_rate,
            });
        }
    }, [car, reset]);

    async function onSubmit(data: CarFormData) {
        try {
            if (car) {
                await carService.update(car.car_id, data);
                toast.success('Car updated successfully');
            } else {
                await carService.create(data);
                toast.success('Car created successfully');
            }
            onSuccess();
            onClose();
            reset();
        } catch (error) {
            console.error('Error saving car:', error);
            toast.error(car ? 'Failed to update car' : 'Failed to create car');
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
                                        {car ? 'Edit Car' : 'Add Car'}
                                    </Dialog.Title>
                                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="brand" className="block text-sm font-medium leading-6 text-gray-900">
                                                    Brand
                                                </label>
                                                <input
                                                    type="text"
                                                    id="brand"
                                                    {...register('brand')}
                                                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                />
                                                {errors.brand && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.brand.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="model" className="block text-sm font-medium leading-6 text-gray-900">
                                                    Model
                                                </label>
                                                <input
                                                    type="text"
                                                    id="model"
                                                    {...register('model')}
                                                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                />
                                                {errors.model && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.model.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="year" className="block text-sm font-medium leading-6 text-gray-900">
                                                    Year
                                                </label>
                                                <input
                                                    type="number"
                                                    id="year"
                                                    {...register('year', { valueAsNumber: true })}
                                                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                />
                                                {errors.year && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.year.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="license_plate" className="block text-sm font-medium leading-6 text-gray-900">
                                                    License Plate
                                                </label>
                                                <input
                                                    type="text"
                                                    id="license_plate"
                                                    {...register('license_plate')}
                                                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                />
                                                {errors.license_plate && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.license_plate.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">
                                                    Status
                                                </label>
                                                <select
                                                    id="status"
                                                    {...register('status')}
                                                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                >
                                                    <option value="Available">Available</option>
                                                    <option value="Rented">Rented</option>
                                                    <option value="Maintenance">Maintenance</option>
                                                </select>
                                                {errors.status && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.status.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="daily_rate" className="block text-sm font-medium leading-6 text-gray-900">
                                                    Daily Rate ($)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="daily_rate"
                                                    step="0.01"
                                                    {...register('daily_rate', { valueAsNumber: true })}
                                                    className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                />
                                                {errors.daily_rate && (
                                                    <p className="mt-2 text-sm text-red-600">{errors.daily_rate.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                                            >
                                                {isSubmitting ? 'Saving...' : car ? 'Update' : 'Create'}
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

export default CarModal; 