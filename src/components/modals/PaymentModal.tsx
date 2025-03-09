import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import type { Database } from '@/lib/supabase/types';

type Rental = Database['public']['Tables']['rentals']['Row'];

const paymentSchema = z.object({
    amount: z.number()
        .positive('Amount must be greater than 0')
        .refine(val => val <= 1000000, 'Amount cannot exceed $1,000,000'),
    payment_method: z.enum(['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer']),
    payment_date: z.string().min(1, 'Payment date is required'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    rental?: Rental;
}

export function PaymentModal({ isOpen, onClose, onSuccess, rental }: PaymentModalProps) {
    const [totalPaid, setTotalPaid] = useState(0);
    const [isLoadingPayments, setIsLoadingPayments] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: 0,
            payment_method: 'Cash',
            payment_date: new Date().toISOString().split('T')[0],
        },
    });

    useEffect(() => {
        if (isOpen && rental) {
            fetchPreviousPayments();
        }
    }, [isOpen, rental]);

    async function fetchPreviousPayments() {
        if (!rental) return;

        setIsLoadingPayments(true);
        try {
            const { data: payments, error } = await supabase
                .from('payments')
                .select('amount')
                .eq('rental_id', rental.rental_id);

            if (error) throw error;

            const total = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
            setTotalPaid(total);

            const remainingBalance = rental.total_cost - total;
            setValue('amount', remainingBalance);
        } catch (error) {
            console.error('Error fetching previous payments:', error);
            toast.error('Failed to fetch payment history');
        } finally {
            setIsLoadingPayments(false);
        }
    }

    const currentAmount = watch('amount');
    const remainingBalance = rental ? rental.total_cost - totalPaid : 0;
    const isFullPayment = currentAmount >= remainingBalance;

    async function onSubmit(data: PaymentFormData) {
        if (!rental) return;

        try {
            // Create payment record
            const { error: paymentError } = await supabase
                .from('payments')
                .insert({
                    rental_id: rental.rental_id,
                    amount: data.amount,
                    payment_method: data.payment_method,
                    payment_date: data.payment_date,
                    status: 'Paid'
                });

            if (paymentError) throw paymentError;

            const newTotalPaid = totalPaid + data.amount;
            const isComplete = newTotalPaid >= rental.total_cost;

            if (isComplete) {
                const [rentalError, carError] = await Promise.all([
                    supabase
                        .from('rentals')
                        .update({
                            status: 'Completed',
                            return_date: new Date().toISOString().split('T')[0]
                        })
                        .eq('rental_id', rental.rental_id),
                    supabase
                        .from('cars')
                        .update({ status: 'Available' })
                        .eq('car_id', rental.car_id)
                ]);

                if (rentalError?.error) throw rentalError.error;
                if (carError?.error) throw carError.error;
            }

            toast.success(isComplete
                ? 'Full payment processed and rental completed'
                : `Partial payment processed. Remaining balance: $${(rental.total_cost - newTotalPaid).toFixed(2)}`
            );
            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Error processing payment:', error);
            toast.error('Failed to process payment');
        }
    }

    function handleClose() {
        reset();
        onClose();
    }

    if (!rental) return null;

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={handleClose}>
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
                                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                                    Process Payment
                                </Dialog.Title>

                                {isLoadingPayments ? (
                                    <div className="my-8 flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <div>Total Cost: ${rental.total_cost.toFixed(2)}</div>
                                                <div>Already Paid: ${totalPaid.toFixed(2)}</div>
                                                <div className="text-base font-medium text-gray-900">
                                                    Remaining Balance: ${remainingBalance.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                                Payment Amount
                                            </label>
                                            <div className="mt-1">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    max={remainingBalance}
                                                    {...register('amount', { valueAsNumber: true })}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                                {errors.amount && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                                                )}
                                                {currentAmount < remainingBalance && (
                                                    <p className="mt-1 text-sm text-yellow-600">
                                                        This is a partial payment. Rental will remain ongoing.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">
                                                Payment Method
                                            </label>
                                            <select
                                                {...register('payment_method')}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            >
                                                <option value="Cash">Cash</option>
                                                <option value="Credit Card">Credit Card</option>
                                                <option value="Debit Card">Debit Card</option>
                                                <option value="Bank Transfer">Bank Transfer</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700">
                                                Payment Date
                                            </label>
                                            <input
                                                type="date"
                                                {...register('payment_date')}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>

                                        <div className="mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed sm:col-start-2"
                                            >
                                                {isSubmitting ? (
                                                    <span className="flex items-center">
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Processing...
                                                    </span>
                                                ) : isFullPayment ? 'Complete Payment' : 'Process Partial Payment'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                disabled={isSubmitting}
                                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed sm:col-start-1 sm:mt-0"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
} 