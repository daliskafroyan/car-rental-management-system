import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { customerService } from '@/services/customerService';
import toast from 'react-hot-toast';
import type { Database } from '@/lib/supabase/types';
import CustomerModal from '@/components/modals/CustomerModal';

type Customer = Database['public']['Tables']['customers']['Row'];

export default function Customers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        try {
            const data = await customerService.getAll();
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Failed to fetch customers');
        } finally {
            setIsLoading(false);
        }
    }

    function handleEdit(customer: Customer) {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    }

    async function handleDelete(id: number) {
        if (!window.confirm('Are you sure you want to delete this customer?')) return;

        try {
            await customerService.delete(id);
            toast.success('Customer deleted successfully');
            fetchCustomers();
        } catch (error) {
            console.error('Error deleting customer:', error);
            toast.error('Failed to delete customer');
        }
    }

    const filteredCustomers = customers.filter(customer =>
        searchQuery === '' ||
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.phone?.toLowerCase() || '').includes(searchQuery.toLowerCase())
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
                    <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedCustomer(undefined);
                            setIsModalOpen(true);
                        }}
                        className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-500"
                    >
                        <PlusIcon className="inline-block h-5 w-5 mr-1" />
                        Add Customer
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <div className="max-w-md">
                    <label htmlFor="search" className="sr-only">
                        Search customers
                    </label>
                    <div className="relative">
                        <input
                            type="search"
                            id="search"
                            placeholder="Search by name, email or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        {filteredCustomers.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-sm text-gray-500">
                                    {searchQuery ? 'No customers found matching your search' : 'No customers found'}
                                </p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead>
                                    <tr>
                                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Name</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Address</th>
                                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredCustomers.map((customer) => (
                                        <tr key={customer.customer_id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                {customer.name}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {customer.email}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {customer.phone || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {customer.address}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                <button
                                                    onClick={() => handleEdit(customer)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(customer.customer_id)}
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

            <CustomerModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedCustomer(undefined);
                }}
                onSuccess={fetchCustomers}
                customer={selectedCustomer}
            />
        </div>
    );
} 