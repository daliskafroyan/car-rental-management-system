import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type Payment = Database['public']['Tables']['payments']['Row'];

export const paymentService = {
    async getAll() {
        const { data, error } = await supabase
            .from('payments')
            .select(`
                *,
                rental:rentals (
                    rental_id,
                    customer:customers (
                        name
                    ),
                    car:cars (
                        brand,
                        model
                    )
                )
            `)
            .order('payment_date', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getById(id: number) {
        const { data, error } = await supabase
            .from('payments')
            .select(`
        *,
        rental:rentals(
          customer:customers(name)
        )
      `)
            .eq('payment_id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(payment: Omit<Payment, 'payment_id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('payments')
            .insert(payment)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateStatus(id: number, status: Payment['status']) {
        const { data, error } = await supabase
            .from('payments')
            .update({ status })
            .eq('payment_id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}; 