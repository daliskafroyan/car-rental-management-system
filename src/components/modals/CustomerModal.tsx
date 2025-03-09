import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { customerService } from '@/services/customerService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import type { Database } from '@/lib/supabase/types';

type Customer = Database['public']['Tables']['customers']['Row'];

const customerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    address: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    customer?: Customer;
}

export default function CustomerModal({ isOpen, onClose, onSuccess, customer }: CustomerModalProps) {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            address: '',
        },
    });

    useEffect(() => {
        if (customer) {
            reset({
                name: customer.name,
                email: customer.email,
                phone: customer.phone || '',
                address: customer.address || '',
            });
        }
    }, [customer, reset]);

    async function onSubmit(data: CustomerFormData) {
        try {
            if (customer) {
                await customerService.update(customer.customer_id, data);
                toast.success('Customer updated successfully');
            } else {
                await customerService.create(data);
                toast.success('Customer created successfully');
            }
            onSuccess();
            onClose();
            reset();
        } catch (error) {
            console.error('Error saving customer:', error);
            toast.error(customer ? 'Failed to update customer' : 'Failed to create customer');
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
                                        {customer ? 'Edit Customer' : 'Add Customer'}
                                    </Dialog.Title>
                                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                {...register('name')}
                                                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                            {errors.name && (
                                                <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                {...register('email')}
                                                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                            {errors.email && (
                                                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                {...register('phone')}
                                                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">
                                                Address
                                            </label>
                                            <textarea
                                                id="address"
                                                rows={3}
                                                {...register('address')}
                                                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>

                                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                                            >
                                                {isSubmitting ? 'Saving...' : customer ? 'Update' : 'Create'}
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