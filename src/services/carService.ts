import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Car = Database['public']['Tables']['cars']['Row'];
type CarInsert = Database['public']['Tables']['cars']['Insert'];
type CarUpdate = Database['public']['Tables']['cars']['Update'];

export const carService = {
    async getAll() {
        const { data, error } = await supabase
            .from('cars')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getById(id: number) {
        const { data, error } = await supabase
            .from('cars')
            .select('*')
            .eq('car_id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(car: CarInsert) {
        const { data, error } = await supabase
            .from('cars')
            .insert(car)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: number, car: CarUpdate) {
        const { data, error } = await supabase
            .from('cars')
            .update(car)
            .eq('car_id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: number) {
        const { error } = await supabase
            .from('cars')
            .delete()
            .eq('car_id', id);

        if (error) throw error;
    },

    async updateStatus(id: number, status: Car['status']) {
        const { data, error } = await supabase
            .from('cars')
            .update({ status })
            .eq('car_id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}; 