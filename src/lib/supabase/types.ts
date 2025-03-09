export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    name: string | null
                    phone: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    name?: string | null
                    phone?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string | null
                    phone?: string | null
                    created_at?: string
                }
            }
            customers: {
                Row: {
                    customer_id: number
                    name: string
                    email: string
                    phone: string | null
                    address: string | null
                    created_at: string
                }
                Insert: {
                    customer_id?: number
                    name: string
                    email: string
                    phone?: string | null
                    address?: string | null
                    created_at?: string
                }
                Update: {
                    customer_id?: number
                    name?: string
                    email?: string
                    phone?: string | null
                    address?: string | null
                    created_at?: string
                }
            }
            cars: {
                Row: {
                    car_id: number
                    brand: string
                    model: string
                    year: number
                    license_plate: string
                    status: 'Available' | 'Rented' | 'Maintenance'
                    daily_rate: number
                    created_at: string
                }
                Insert: {
                    car_id?: number
                    brand: string
                    model: string
                    year: number
                    license_plate: string
                    status: 'Available' | 'Rented' | 'Maintenance'
                    daily_rate: number
                    created_at?: string
                }
                Update: {
                    car_id?: number
                    brand?: string
                    model?: string
                    year?: number
                    license_plate?: string
                    status?: 'Available' | 'Rented' | 'Maintenance'
                    daily_rate?: number
                    created_at?: string
                }
            }
            rentals: {
                Row: {
                    rental_id: number
                    customer_id: number
                    car_id: number
                    rental_date: string
                    return_date: string | null
                    total_cost: number
                    status: 'Ongoing' | 'Completed' | 'Cancelled'
                    created_at: string
                }
                Insert: {
                    rental_id?: number
                    customer_id: number
                    car_id: number
                    rental_date: string
                    return_date?: string | null
                    total_cost: number
                    status: 'Ongoing' | 'Completed' | 'Cancelled'
                    created_at?: string
                }
                Update: {
                    rental_id?: number
                    customer_id?: number
                    car_id?: number
                    rental_date?: string
                    return_date?: string | null
                    total_cost?: number
                    status?: 'Ongoing' | 'Completed' | 'Cancelled'
                    created_at?: string
                }
            }
            payments: {
                Row: {
                    payment_id: number
                    rental_id: number
                    amount: number
                    payment_date: string
                    payment_method: string
                    status: 'Paid' | 'Pending' | 'Failed'
                    created_at: string
                }
                Insert: {
                    payment_id?: number
                    rental_id: number
                    amount: number
                    payment_date: string
                    payment_method: string
                    status: 'Paid' | 'Pending' | 'Failed'
                    created_at?: string
                }
                Update: {
                    payment_id?: number
                    rental_id?: number
                    amount?: number
                    payment_date?: string
                    payment_method?: string
                    status?: 'Paid' | 'Pending' | 'Failed'
                    created_at?: string
                }
            }
        }
    }
} 