import { useState, useEffect } from 'react';
import { paymentService } from '@/services/paymentService';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { Database } from '@/lib/supabase/types';

type Payment = Database['public']['Tables']['payments']['Row'] & {
    rental: {
        customer: {
            name: string;
        };
        car: {
            brand: string;
            model: string;
        };
    };
};

export default function Payments() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    async function fetchPayments() {
        try {
            const data = await paymentService.getAll();
            setPayments(data);
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Failed to fetch payments');
        } finally {
            setIsLoading(false);
        }
    }

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
                    <h1 className="text-2xl font-semibold text-gray-900">Payment History</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all rental payments received.
                    </p>
                </div>
            </div>

            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                                <tr>
                                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                        Payment Date
                                    </th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Customer
                                    </th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Car
                                    </th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Amount
                                    </th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Payment Method
                                    </th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Reference
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {payments.map((payment) => (
                                    <tr key={payment.payment_id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                                            {format(new Date(payment.payment_date), 'MMM d, yyyy')}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {payment.rental?.customer?.name}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {payment.rental?.car?.brand} {payment.rental?.car?.model}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                                            ${payment.amount.toFixed(2)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {payment.payment_method}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            Rental #{payment.rental_id}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
} 