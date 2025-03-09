import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Rental = Database['public']['Tables']['rentals']['Row'];
type RentalInsert = Database['public']['Tables']['rentals']['Insert'];
type RentalUpdate = Database['public']['Tables']['rentals']['Update'];

export const rentalService = {
    async getAll() {
        const { data, error } = await supabase
            .from('rentals')
            .select(`
        *,
        customer:customers(name),
        car:cars(brand, model)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getById(id: number) {
        const { data, error } = await supabase
            .from('rentals')
            .select(`
        *,
        customer:customers(name),
        car:cars(brand, model)
      `)
            .eq('rental_id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(rental: RentalInsert) {
        const { data, error } = await supabase
            .from('rentals')
            .insert(rental)
            .select(`
        *,
        customer:customers(name),
        car:cars(brand, model)
      `)
            .single();

        if (error) throw error;

        // Update car status
        await supabase
            .from('cars')
            .update({ status: 'Rented' })
            .eq('car_id', rental.car_id);

        return data;
    },

    async complete(id: number, returnDate: string) {
        const { data: rental } = await supabase
            .from('rentals')
            .select('car_id')
            .eq('rental_id', id)
            .single();

        if (!rental) throw new Error('Rental not found');

        const { data, error } = await supabase
            .from('rentals')
            .update({
                status: 'Completed',
                return_date: returnDate
            })
            .eq('rental_id', id)
            .select()
            .single();

        if (error) throw error;

        // Update car status
        await supabase
            .from('cars')
            .update({ status: 'Available' })
            .eq('car_id', rental.car_id);

        return data;
    },

    async cancel(id: number) {
        const { data: rental } = await supabase
            .from('rentals')
            .select('car_id')
            .eq('rental_id', id)
            .single();

        if (!rental) throw new Error('Rental not found');

        const { data, error } = await supabase
            .from('rentals')
            .update({ status: 'Cancelled' })
            .eq('rental_id', id)
            .select()
            .single();

        if (error) throw error;

        // Update car status
        await supabase
            .from('cars')
            .update({ status: 'Available' })
            .eq('car_id', rental.car_id);

        return data;
    }
}; 