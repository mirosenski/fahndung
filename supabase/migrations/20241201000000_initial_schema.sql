-- Sichere initiale Migration für lokale Entwicklung
-- Diese Migration ist kompatibel mit dem bestehenden Schema

-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS public.investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.investigation_images ENABLE ROW LEVEL SECURITY;

-- Create user profiles table with roles and registration status
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
    department VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    registration_email VARCHAR(255), -- Original E-Mail für Registrierung
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create investigations table with extended fields
CREATE TABLE IF NOT EXISTS public.investigations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    case_number VARCHAR(100) UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'published', 'closed')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent', 'new')),
    category VARCHAR(50) DEFAULT 'WANTED_PERSON' CHECK (category IN ('WANTED_PERSON', 'MISSING_PERSON', 'UNKNOWN_DEAD', 'STOLEN_GOODS')),
    location VARCHAR(255),
    station VARCHAR(255),
    contact_info JSONB DEFAULT '{}',
    features TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'
);

-- Create investigation_images table with extended fields
CREATE TABLE IF NOT EXISTS public.investigation_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    investigation_id UUID REFERENCES public.investigations(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id),
    tags TEXT[] DEFAULT '{}',
    description TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'
);

-- Create media table for server-side file management
CREATE TABLE IF NOT EXISTS public.media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    media_type VARCHAR(20) DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'document')),
    directory VARCHAR(255) DEFAULT 'allgemein',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id),
    tags TEXT[] DEFAULT '{}',
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'
);

-- Create admin_actions table for logging
CREATE TABLE IF NOT EXISTS public.admin_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id),
    action_type VARCHAR(100) NOT NULL,
    target_user_id UUID REFERENCES auth.users(id),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_activities table for tracking
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    activity_type VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_investigations_status ON public.investigations(status);
CREATE INDEX IF NOT EXISTS idx_investigations_created_at ON public.investigations(created_at);
CREATE INDEX IF NOT EXISTS idx_investigations_category ON public.investigations(category);
CREATE INDEX IF NOT EXISTS idx_investigations_priority ON public.investigations(priority);
CREATE INDEX IF NOT EXISTS idx_investigations_tags ON public.investigations USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_investigation_images_investigation_id ON public.investigation_images(investigation_id);
CREATE INDEX IF NOT EXISTS idx_investigation_images_tags ON public.investigation_images USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_directory ON public.media(directory);
CREATE INDEX IF NOT EXISTS idx_media_media_type ON public.media(media_type);
CREATE INDEX IF NOT EXISTS idx_media_tags ON public.media USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);

-- Create RLS policies
-- User profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can read own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" ON public.user_profiles
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- Allow new users to create their profile during registration
CREATE POLICY "Allow profile creation during registration" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Investigations: Authenticated users can read published, editors/admins can manage all
CREATE POLICY "Anyone can read published investigations" ON public.investigations
    FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can read all investigations" ON public.investigations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Editors and admins can manage investigations" ON public.investigations
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    ));

-- Investigation images: Same as investigations
CREATE POLICY "Anyone can read published investigation images" ON public.investigation_images
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.investigations WHERE id = investigation_id AND status = 'published'
    ));

CREATE POLICY "Authenticated users can read all investigation images" ON public.investigation_images
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Editors and admins can manage investigation images" ON public.investigation_images
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    ));

-- Media: Authenticated users can read, editors/admins can manage
CREATE POLICY "Authenticated users can read media" ON public.media
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Editors and admins can manage media" ON public.media
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    ));

-- Admin actions: Only admins can read/write
CREATE POLICY "Admins can manage admin actions" ON public.admin_actions
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- User activities: Users can read their own, admins can read all
CREATE POLICY "Users can read own activities" ON public.user_activities
    FOR SELECT USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.user_profiles WHERE user_id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Users can create own activities" ON public.user_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User sessions: Users can manage their own sessions
CREATE POLICY "Users can manage own sessions" ON public.user_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_investigations_updated_at 
    BEFORE UPDATE ON public.investigations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at 
    BEFORE UPDATE ON public.user_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for local development
INSERT INTO public.investigations (title, case_number, description, short_description, status, priority, category, location, station, features, tags) VALUES
('Vermisste Person - Max Mustermann', 'F-2024-001', 'Max Mustermann wurde zuletzt am 15.03.2024 gesehen. Er trug eine blaue Jacke und schwarze Jeans. Er ist 1,75m groß und hat braune Haare.', 'Max Mustermann vermisst seit 15.03.2024', 'published', 'urgent', 'MISSING_PERSON', 'Berlin, Innenstadt', 'Polizei Berlin', 'Größe: 1,75m, Haare: braun, Kleidung: blaue Jacke, schwarze Jeans', ARRAY['vermisst', 'person', 'berlin']),
('Gesuchte Person - Anna Schmidt', 'F-2024-002', 'Anna Schmidt wird wegen Betrugs gesucht. Sie ist 1,65m groß und hat blonde Haare. Zuletzt gesehen in Hamburg.', 'Anna Schmidt wird wegen Betrugs gesucht', 'published', 'normal', 'WANTED_PERSON', 'Hamburg, Hafen', 'Polizei Hamburg', 'Größe: 1,65m, Haare: blond, Vorstrafen: Betrug', ARRAY['gesucht', 'betrug', 'hamburg']),
('Unbekannte Person - Freiburg', 'F-2024-003', 'Unbekannte Person wurde tot in Freiburg gefunden. Männlich, ca. 45 Jahre alt, 1,80m groß.', 'Unbekannte Person in Freiburg gefunden', 'published', 'normal', 'UNKNOWN_DEAD', 'Freiburg, Altstadt', 'Polizei Freiburg', 'Geschlecht: männlich, Alter: ca. 45, Größe: 1,80m', ARRAY['unbekannt', 'tot', 'freiburg'])
ON CONFLICT (case_number) DO NOTHING;

-- Insert sample images
INSERT INTO public.investigation_images (investigation_id, file_name, original_name, file_path, file_size, mime_type, width, height, tags, description, is_primary) VALUES
((SELECT id FROM public.investigations WHERE case_number = 'F-2024-001' LIMIT 1), 'max_mustermann.jpg', 'max_mustermann.jpg', '/uploads/max_mustermann.jpg', 1024000, 'image/jpeg', 1920, 1080, ARRAY['person', 'portrait'], 'Letztes Foto von Max Mustermann', TRUE),
((SELECT id FROM public.investigations WHERE case_number = 'F-2024-002' LIMIT 1), 'verdaechtige_person.jpg', 'verdaechtige_person.jpg', '/uploads/verdaechtige_person.jpg', 2048000, 'image/jpeg', 1920, 1080, ARRAY['verdaechtig', 'kapuze'], 'Verdächtige Person mit Kapuze', TRUE);

-- Insert sample media
INSERT INTO public.media (original_name, file_name, file_path, file_size, mime_type, width, height, media_type, directory, tags, description) VALUES
('sample_person_1.jpg', 'sample_person_1.jpg', '/uploads/sample_person_1.jpg', 1024000, 'image/jpeg', 1920, 1080, 'image', 'allgemein', ARRAY['person', 'portrait'], 'Beispiel-Portrait 1'),
('sample_person_2.jpg', 'sample_person_2.jpg', '/uploads/sample_person_2.jpg', 1536000, 'image/jpeg', 1920, 1080, 'image', 'allgemein', ARRAY['person', 'portrait'], 'Beispiel-Portrait 2'),
('sample_vehicle_1.jpg', 'sample_vehicle_1.jpg', '/uploads/sample_vehicle_1.jpg', 2048000, 'image/jpeg', 1920, 1080, 'image', 'fahrzeuge', ARRAY['fahrzeug', 'auto'], 'Beispiel-Fahrzeug 1'); 