import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export const customerService = {
    async getAll() {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getById(id: number) {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('customer_id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(customer: CustomerInsert) {
        const { data, error } = await supabase
            .from('customers')
            .insert(customer)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: number, customer: CustomerUpdate) {
        const { data, error } = await supabase
            .from('customers')
            .update(customer)
            .eq('customer_id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: number) {
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('customer_id', id);

        if (error) throw error;
    }
}; 