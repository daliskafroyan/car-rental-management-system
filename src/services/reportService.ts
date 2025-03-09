import { supabase } from '@/lib/supabase/client';

export const reportService = {
    async getTotalCars() {
        const { count, error } = await supabase
            .from('cars')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;
        return count || 0;
    },

    async getAvailableCars() {
        const { count, error } = await supabase
            .from('cars')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Available');

        if (error) throw error;
        return count || 0;
    },

    async getOngoingRentals() {
        const { count, error } = await supabase
            .from('rentals')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Ongoing');

        if (error) throw error;
        return count || 0;
    },

    async getRevenue(startDate: string) {
        const { data, error } = await supabase
            .from('rentals')
            .select('total_cost')
            .gte('rental_date', startDate)
            .eq('status', 'Completed');

        if (error) throw error;
        return data.reduce((sum, rental) => sum + rental.total_cost, 0);
    },

    async getTopCars(startDate: string) {
        const { data, error } = await supabase
            .from('rentals')
            .select(`
                car_id,
                cars (
                    brand,
                    model
                )
            `)
            .gte('rental_date', startDate)
            .neq('status', 'Cancelled');

        if (error) throw error;

        // Perform the aggregation in JavaScript
        const carCounts = data.reduce((acc: any, rental: any) => {
            if (!acc[rental.car_id]) {
                acc[rental.car_id] = {
                    car: rental.cars,
                    rental_count: 0
                };
            }
            acc[rental.car_id].rental_count++;
            return acc;
        }, {});

        return Object.values(carCounts)
            .sort((a: any, b: any) => b.rental_count - a.rental_count)
            .slice(0, 5);
    },

    async getTopCustomers(startDate: string) {
        const { data, error } = await supabase
            .from('rentals')
            .select(`
                customer_id,
                customers (
                    name
                ),
                total_cost
            `)
            .gte('rental_date', startDate)
            .neq('status', 'Cancelled');

        if (error) throw error;

        // Perform the aggregation in JavaScript
        const customerStats = data.reduce((acc: any, rental: any) => {
            if (!acc[rental.customer_id]) {
                acc[rental.customer_id] = {
                    customer: rental.customers,
                    rental_count: 0,
                    total_spent: 0
                };
            }
            acc[rental.customer_id].rental_count++;
            acc[rental.customer_id].total_spent += rental.total_cost;
            return acc;
        }, {});

        return Object.values(customerStats)
            .sort((a: any, b: any) => b.total_spent - a.total_spent)
            .slice(0, 5);
    },
}; 