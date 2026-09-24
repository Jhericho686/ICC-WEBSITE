-- ============================================================================
-- IDLE COUNTRY CLUB (ICC) OFFICIAL WEBSITE - SUPABASE DATABASE SCHEMA
-- Compatible with PostgreSQL 15+ / Supabase
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_name TEXT NOT NULL DEFAULT 'IDLE COUNTRY CLUB',
  short_name TEXT NOT NULL DEFAULT 'ICC',
  motto TEXT NOT NULL DEFAULT 'WHERE THE ROAD MEETS THE COMMUNITY.',
  description TEXT DEFAULT 'Welcome to IDLE COUNTRY CLUB — a Car Parking Multiplayer community built around cars, competition, creativity, friendship, and unforgettable moments.',
  logo_url TEXT DEFAULT '',
  hero_image_url TEXT DEFAULT '',
  accent_color TEXT DEFAULT '#ff6b00',
  facebook_url TEXT DEFAULT 'https://www.facebook.com/profile.php?id=61573345143647',
  tiktok_url TEXT DEFAULT 'https://www.tiktok.com/@cpm..idle.country',
  discord_url TEXT DEFAULT '',
  youtube_url TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Admin Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin', -- 'owner', 'co-owner', 'head-admin', 'admin', 'moderator'
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically create a profile record when a user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN LOWER(NEW.email) = 'iccadmin@gmail.com' THEN 'owner'
      ELSE 'admin'
    END,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'ICC Admin')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = CASE WHEN LOWER(EXCLUDED.email) = 'iccadmin@gmail.com' THEN 'owner' ELSE profiles.role END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Members Roster
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  in_game_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Member',
  car TEXT,
  bio TEXT,
  avatar_url TEXT,
  hierarchy_order INTEGER DEFAULT 10,
  featured BOOLEAN DEFAULT FALSE,
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Recruitment Applications
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  in_game_name TEXT NOT NULL,
  cpm_id TEXT,
  discord_handle TEXT NOT NULL,
  age INTEGER,
  region TEXT,
  driving_style TEXT,
  primary_car TEXT,
  horsepower TEXT,
  experience_years TEXT,
  device_type TEXT,
  motivation TEXT NOT NULL,
  previous_clans TEXT,
  weekly_hours TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Collaboration Requests
CREATE TABLE IF NOT EXISTS collaboration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_or_org TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  discord_handle TEXT NOT NULL,
  email TEXT,
  collab_type TEXT,
  estimated_participants TEXT,
  proposed_date DATE,
  details TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Videos & Montages
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'Drift',
  duration TEXT,
  description TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Photo Gallery
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'Builds',
  author TEXT,
  car TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Events & Meets
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  category TEXT DEFAULT 'Car Meet',
  host TEXT,
  requirements TEXT,
  description TEXT,
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'past', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Achievements & Milestones
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT DEFAULT 'Tournament',
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Rules
CREATE TABLE IF NOT EXISTS rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  order_num INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Admin Activity Logs
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID,
  admin_name TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Public read-only access for showcase tables
CREATE POLICY "Public Read Site Settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Members" ON members FOR SELECT USING (true);
CREATE POLICY "Public Read Videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Public Read Gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public Read Events" ON events FOR SELECT USING (true);
CREATE POLICY "Public Read Achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Public Read Rules" ON rules FOR SELECT USING (true);

-- Public insert permissions for applicant & collaboration forms
CREATE POLICY "Public Insert Applications" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Collaborations" ON collaboration_requests FOR INSERT WITH CHECK (true);

-- Authenticated full access for admins
CREATE POLICY "Admin Full Site Settings" ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Profiles" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Members" ON members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Applications" ON applications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Collaborations" ON collaboration_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Videos" ON videos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Gallery" ON gallery FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Events" ON events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Achievements" ON achievements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Rules" ON rules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Logs" ON admin_activity_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- SEED INITIAL DATA
-- ============================================================================

INSERT INTO site_settings (clan_name, short_name, motto, description, accent_color, facebook_url, tiktok_url)
VALUES (
  'IDLE COUNTRY CLUB',
  'ICC',
  'WHERE THE ROAD MEETS THE COMMUNITY.',
  'Welcome to IDLE COUNTRY CLUB — a Car Parking Multiplayer community built around cars, competition, creativity, friendship, and unforgettable moments.',
  '#ff6b00',
  'https://www.facebook.com/profile.php?id=61573345143647',
  'https://www.tiktok.com/@cpm..idle.country'
) ON CONFLICT DO NOTHING;

INSERT INTO members (name, in_game_name, role, car, bio, hierarchy_order, featured)
VALUES
  ('JHERICHO', 'ICC • Jhericho [OWNER]', 'Owner', 'Nissan Skyline GT-R R34 (1695HP)', 'Founder of IDLE COUNTRY CLUB. Passionate about touge racing, stance setups, and disciplined community building.', 1, true),
  ('VALKYRIE', 'ICC • Valkyrie [CO-OWNER]', 'Co-Owner', 'Toyota Supra MK4 Turbo', 'Co-founder & media lead. Lead editor for ICC TikTok channel and cinematic montages.', 2, true),
  ('TITAN', 'ICC • Titan [H-ADMIN]', 'Head Admin', 'BMW M4 Competition Widebody', 'Tournament director and event coordinator. Hosts weekly drag shootouts and server meets.', 3, true),
  ('PHANTOM', 'ICC • Phantom [ADMIN]', 'Admin', 'Porsche 911 GT3 RS Track Spec', 'Recruitment officer. Reviews member applications and conducts trial drive inspections.', 4, false),
  ('NIGHTHAWK', 'ICC • Nighthawk [ADMIN]', 'Admin', 'Mazda RX-7 FD3S Rocket Bunny', 'Livery designer & technical tuner. Creator of our official club tournament decals.', 5, false)
ON CONFLICT DO NOTHING;
