-- Create Users table (handled by Supabase Auth, we just need to extend it)
create table public.users (
  id uuid references auth.users not null primary key,
  email text not null,
  name text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Customers table
create table public.customers (
  customer_id bigint generated by default as identity primary key,
  name text not null,
  email text unique not null,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Cars table
create table public.cars (
  car_id bigint generated by default as identity primary key,
  brand text not null,
  model text not null,
  year integer not null,
  license_plate text unique not null,
  status text not null check (status in ('Available', 'Rented', 'Maintenance')),
  daily_rate decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Rentals table
create table public.rentals (
  rental_id bigint generated by default as identity primary key,
  customer_id bigint references public.customers(customer_id) not null,
  car_id bigint references public.cars(car_id) not null,
  rental_date date not null,
  return_date date,
  total_cost decimal(10,2) not null,
  status text not null check (status in ('Ongoing', 'Completed', 'Cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Payments table
create table public.payments (
  payment_id bigint generated by default as identity primary key,
  rental_id bigint references public.rentals(rental_id) not null,
  amount decimal(10,2) not null,
  payment_date timestamp with time zone not null,
  payment_method text not null,
  status text not null check (status in ('Paid', 'Pending', 'Failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.customers enable row level security;
alter table public.cars enable row level security;
alter table public.rentals enable row level security;
alter table public.payments enable row level security;

-- Create policies
create policy "Users can view their own data" on public.users
  for select using (auth.uid() = id);

create policy "Allow full access to authenticated users" on public.customers
  for all using (auth.role() = 'authenticated');

create policy "Allow full access to authenticated users" on public.cars
  for all using (auth.role() = 'authenticated');

create policy "Allow full access to authenticated users" on public.rentals
  for all using (auth.role() = 'authenticated');

create policy "Allow full access to authenticated users" on public.payments
  for all using (auth.role() = 'authenticated'); 