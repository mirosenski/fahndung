-- Add pending_registrations table
CREATE TABLE IF NOT EXISTS public.pending_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    department TEXT,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for pending_registrations
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status ON public.pending_registrations(status);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_created_at ON public.pending_registrations(created_at);

-- Create RLS policies for pending_registrations
CREATE POLICY "Admins can manage pending registrations" ON public.pending_registrations
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- Create trigger for updated_at
CREATE TRIGGER update_pending_registrations_updated_at 
    BEFORE UPDATE ON public.pending_registrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 