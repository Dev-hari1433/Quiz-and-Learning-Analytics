-- Update RLS policies for user_profiles to work with session-based auth
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert access for all users" ON user_profiles;

-- Create new policies that work with the current session-based system
CREATE POLICY "Enable read access for all users" 
ON user_profiles FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON user_profiles FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update access for all users" 
ON user_profiles FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- Also update user_achievements policies to be more permissive
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;

CREATE POLICY "Enable read access for all users" 
ON user_achievements FOR SELECT 
USING (true);

CREATE POLICY "Enable insert access for all users" 
ON user_achievements FOR INSERT 
WITH CHECK (true);