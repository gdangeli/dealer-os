-- ============================================
-- Multi-User / Teams Migration
-- ============================================

-- Team member roles at dealer level
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- ============================================
-- Platform Admins (Super-Admin for Giuseppe)
-- ============================================
CREATE TABLE IF NOT EXISTS platform_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS for platform_admins (only super admins can see this)
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only platform admins can view platform_admins"
  ON platform_admins FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM platform_admins));

CREATE POLICY "Service role can manage platform_admins"
  ON platform_admins FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Team Members
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role team_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dealer_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_team_members_dealer_id ON team_members(dealer_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- RLS for team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Users can view team members of their dealer(s)
CREATE POLICY "Users can view their team members"
  ON team_members FOR SELECT
  USING (
    dealer_id IN (SELECT dealer_id FROM team_members WHERE user_id = auth.uid())
    OR auth.uid() IN (SELECT user_id FROM platform_admins)
  );

-- Only owners/admins can manage team members
CREATE POLICY "Owners and admins can insert team members"
  ON team_members FOR INSERT
  WITH CHECK (
    dealer_id IN (
      SELECT dealer_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR auth.uid() IN (SELECT user_id FROM platform_admins)
  );

CREATE POLICY "Owners and admins can update team members"
  ON team_members FOR UPDATE
  USING (
    dealer_id IN (
      SELECT dealer_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR auth.uid() IN (SELECT user_id FROM platform_admins)
  );

CREATE POLICY "Owners can delete team members"
  ON team_members FOR DELETE
  USING (
    dealer_id IN (
      SELECT dealer_id FROM team_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
    OR auth.uid() IN (SELECT user_id FROM platform_admins)
  );

CREATE POLICY "Service role can manage team_members"
  ON team_members FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Team Invitations
-- ============================================
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID NOT NULL REFERENCES dealers(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role team_role NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dealer_id, email)
);

-- Index for token lookup
CREATE INDEX idx_team_invitations_token ON team_invitations(token);
CREATE INDEX idx_team_invitations_email ON team_invitations(email);

-- RLS for team_invitations
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Users can view invitations for their dealer
CREATE POLICY "Users can view their dealer invitations"
  ON team_invitations FOR SELECT
  USING (
    dealer_id IN (SELECT dealer_id FROM team_members WHERE user_id = auth.uid())
    OR auth.uid() IN (SELECT user_id FROM platform_admins)
  );

-- Owners/admins can create invitations
CREATE POLICY "Owners and admins can create invitations"
  ON team_invitations FOR INSERT
  WITH CHECK (
    dealer_id IN (
      SELECT dealer_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR auth.uid() IN (SELECT user_id FROM platform_admins)
  );

-- Owners/admins can delete invitations
CREATE POLICY "Owners and admins can delete invitations"
  ON team_invitations FOR DELETE
  USING (
    dealer_id IN (
      SELECT dealer_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR auth.uid() IN (SELECT user_id FROM platform_admins)
  );

CREATE POLICY "Service role can manage team_invitations"
  ON team_invitations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Migrate existing dealers to team_members
-- Each dealer owner becomes 'owner' in team_members
-- ============================================
INSERT INTO team_members (dealer_id, user_id, role, accepted_at)
SELECT id, user_id, 'owner', NOW()
FROM dealers
WHERE user_id IS NOT NULL
ON CONFLICT (dealer_id, user_id) DO NOTHING;

-- ============================================
-- Helper function: Check if user is platform admin
-- ============================================
CREATE OR REPLACE FUNCTION is_platform_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM platform_admins WHERE user_id = check_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Helper function: Get user's dealer_id(s)
-- ============================================
CREATE OR REPLACE FUNCTION get_user_dealer_ids(check_user_id UUID)
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY SELECT dealer_id FROM team_members WHERE user_id = check_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Helper function: Check user's role in a dealer
-- ============================================
CREATE OR REPLACE FUNCTION get_user_role(check_user_id UUID, check_dealer_id UUID)
RETURNS team_role AS $$
DECLARE
  user_role team_role;
BEGIN
  SELECT role INTO user_role
  FROM team_members
  WHERE user_id = check_user_id AND dealer_id = check_dealer_id;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Update trigger for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_members_updated_at();
