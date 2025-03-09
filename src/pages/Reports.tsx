import { useState, useEffect } from 'react';
import { reportService } from '@/services/reportService';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';
import {
    CurrencyDollarIcon,
    TruckIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';

interface ReportStats {
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

export default function Reports() {
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('30'); // days
    const [reportType, setReportType] = useState<'revenue' | 'cars' | 'customers'>('revenue');

    useEffect(() => {
        fetchStats();
    }, [timeframe]);

    async function fetchStats() {
        setIsLoading(true);
        try {
            const startDate = format(subDays(new Date(), parseInt(timeframe)), 'yyyy-MM-dd');
            const [revenue, topCars, topCustomers] = await Promise.all([
                reportService.getRevenue(startDate),
                reportService.getTopCars(startDate),
                reportService.getTopCustomers(startDate),
            ]);

            setStats({
                totalRevenue: revenue,
                topCars: topCars as { car: { brand: string; model: string }; rental_count: number }[],
                topCustomers: topCustomers as { customer: { name: string }; rental_count: number; total_spent: number }[],
            });
        } catch (error) {
            console.error('Error fetching report stats:', error);
            toast.error('Failed to fetch report statistics');
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
                <p className="text-gray-500">Failed to load report data</p>
            </div>
        );
    }

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
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

            <div className="mt-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Report types">
                        <button
                            onClick={() => setReportType('revenue')}
                            className={`${reportType === 'revenue'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                } flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                        >
                            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                            Revenue
                        </button>
                        <button
                            onClick={() => setReportType('cars')}
                            className={`${reportType === 'cars'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                } flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                        >
                            <TruckIcon className="h-5 w-5 mr-2" />
                            Top Cars
                        </button>
                        <button
                            onClick={() => setReportType('customers')}
                            className={`${reportType === 'customers'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                } flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                        >
                            <UserGroupIcon className="h-5 w-5 mr-2" />
                            Top Customers
                        </button>
                    </nav>
                </div>

                <div className="mt-8">
                    {reportType === 'revenue' && (
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CurrencyDollarIcon className="h-8 w-8 text-green-400" />
                                    </div>
                                    <div className="ml-5">
                                        <h3 className="text-lg font-medium leading-6 text-gray-900">Total Revenue</h3>
                                        <div className="mt-2 text-3xl font-semibold text-gray-900">
                                            ${stats.totalRevenue.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {reportType === 'cars' && (
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="p-6">
                                <h3 className="text-base font-semibold leading-6 text-gray-900">Most Rented Cars</h3>
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
                    )}

                    {reportType === 'customers' && (
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
                    )}
                </div>
            </div>
        </div>
    );
} 