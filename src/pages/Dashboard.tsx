import { useState, useEffect } from 'react';
import { reportService } from '@/services/reportService';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';
import {
    TruckIcon,
    CurrencyDollarIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
    totalCars: number;
    availableCars: number;
    ongoingRentals: number;
    totalRevenue: number;
    topCars: {
        car: {
            brand: string;
            model: string;
        };
        rental_count: number;
    }[];
    topCustomers: {
        customer: {
            name: string;
        };
        rental_count: number;
        total_spent: number;
    }[];
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('30'); // days

    useEffect(() => {
        fetchDashboardStats();
    }, [timeframe]);

    async function fetchDashboardStats() {
        setIsLoading(true);
        try {
            const startDate = format(subDays(new Date(), parseInt(timeframe)), 'yyyy-MM-dd');

            const [
                totalCarsCount,
                availableCarsCount,
                ongoingRentalsCount,
                revenue,
                topCars,
                topCustomers,
            ] = await Promise.all([
                reportService.getTotalCars(),
                reportService.getAvailableCars(),
                reportService.getOngoingRentals(),
                reportService.getRevenue(startDate),
                reportService.getTopCars(startDate),
                reportService.getTopCustomers(startDate),
            ]);

            setStats({
                totalCars: totalCarsCount,
                availableCars: availableCarsCount,
                ongoingRentals: ongoingRentalsCount,
                totalRevenue: revenue,
                topCars: topCars as { car: { brand: string; model: string }; rental_count: number }[],
                topCustomers: topCustomers as { customer: { name: string }; rental_count: number; total_spent: number }[],
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            toast.error('Failed to fetch dashboard statistics');
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

    if (!stats) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Failed to load dashboard data</p>
            </div>
        );
    }

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0">
                    <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                    </select>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <TruckIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Cars</dt>
                                <dd className="text-lg font-medium text-gray-900">{stats.totalCars}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <TruckIcon className="h-8 w-8 text-green-400" aria-hidden="true" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Available Cars</dt>
                                <dd className="text-lg font-medium text-gray-900">{stats.availableCars}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ClockIcon className="h-8 w-8 text-yellow-400" aria-hidden="true" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Ongoing Rentals</dt>
                                <dd className="text-lg font-medium text-gray-900">{stats.ongoingRentals}</dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CurrencyDollarIcon className="h-8 w-8 text-green-400" aria-hidden="true" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                                <dd className="text-lg font-medium text-gray-900">
                                    ${stats.totalRevenue.toFixed(2)}
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-6">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">Top Cars</h3>
                        <div className="mt-6 flow-root">
                            <ul className="-my-5 divide-y divide-gray-200">
                                {stats.topCars.map((item, index) => (
                                    <li key={index} className="py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900">
                                                    {item.car.brand} {item.car.model}
                                                </p>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {item.rental_count} rentals
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-6">
                        <h3 className="text-base font-semibold leading-6 text-gray-900">Top Customers</h3>
                        <div className="mt-6 flow-root">
                            <ul className="-my-5 divide-y divide-gray-200">
                                {stats.topCustomers.map((item, index) => (
                                    <li key={index} className="py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900">
                                                    {item.customer.name}
                                                </p>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {item.rental_count} rentals · ${item.total_spent.toFixed(2)}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 