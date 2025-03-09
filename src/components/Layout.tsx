import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Cars', href: '/cars' },
    { name: 'Customers', href: '/customers' },
    { name: 'Rentals', href: '/rentals' },
    { name: 'Payments', href: '/payments' },
    { name: 'Reports', href: '/reports' },
];

export function Layout() {
    const signOut = useAuthStore(state => state.signOut);
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await signOut();
            navigate('/login');
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
        }
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Disclosure as="nav" className="bg-white shadow-sm">
                {({ open }) => (
                    <>
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="flex h-16 justify-between">
                                <div className="flex">
                                    <div className="flex flex-shrink-0 items-center">
                                        <span className="text-2xl font-bold text-indigo-600">CarRental</span>
                                    </div>
                                    <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                                        {navigation.map((item) => (
                                            <NavLink
                                                key={item.name}
                                                to={item.href}
                                                className={({ isActive }) =>
                                                    clsx(
                                                        isActive
                                                            ? 'border-indigo-500 text-gray-900'
                                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                                        'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                                                    )
                                                }
                                            >
                                                {item.name}
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                                    <button
                                        onClick={handleLogout}
                                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    >
                                        Logout
                                    </button>
                                </div>
                                <div className="-mr-2 flex items-center sm:hidden">
                                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
                                        <span className="sr-only">Open main menu</span>
                                        {open ? (
                                            <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                        ) : (
                                            <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                        )}
                                    </Disclosure.Button>
                                </div>
                            </div>
                        </div>

                        <Disclosure.Panel className="sm:hidden">
                            <div className="space-y-1 pb-3 pt-2">
                                {navigation.map((item) => (
                                    <Disclosure.Button
                                        key={item.name}
                                        as={NavLink}
                                        to={item.href}
                                        className={({ isActive }: { isActive: boolean }) =>
                                            clsx(
                                                isActive
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800',
                                                'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                                            )
                                        }
                                    >
                                        {item.name}
                                    </Disclosure.Button>
                                ))}
                                <div className="pt-4">
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>

            <div className="py-10">
                <main>
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
} 