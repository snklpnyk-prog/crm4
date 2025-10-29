/*
  # Create Lead Management System with User Authentication

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users) - Links lead to sales team member
      - `business_name` (text, required)
      - `contact_person` (text, required)
      - `phone` (text, required)
      - `email` (text, optional)
      - `address` (text, optional)
      - `city` (text, optional)
      - `lead_status` (text, required) - Hot, Warm, or Cold
      - `stage` (text, required) - Contacted, Requirements Received, Follow-ups, or Closed/Won
      - `next_followup_date` (timestamptz, optional)
      - `interested_services` (text array, optional)
      - `notes_first_call` (text, optional)
      - `created_at` (timestamptz, auto-generated)
      - `updated_at` (timestamptz, auto-updated)
      - `created_by` (uuid, foreign key to auth.users)

    - `attachments`
      - `id` (uuid, primary key)
      - `lead_id` (uuid, foreign key to leads)
      - `file_name` (text, required)
      - `file_url` (text, required)
      - `file_type` (text, optional)
      - `uploaded_at` (timestamptz, auto-generated)
      - `uploaded_by` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own leads and attachments
    - Each sales team member has a completely isolated dashboard
    - All policies verify authentication and ownership

  3. Features
    - Multi-user support with user isolation
    - Each sales team member can sign up and get their own dashboard
    - Password reset capability through Supabase Auth
    - Automatic user_id assignment on lead creation
*/

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  contact_person text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  city text,
  lead_status text NOT NULL CHECK (lead_status IN ('Hot', 'Warm', 'Cold')),
  stage text NOT NULL CHECK (stage IN ('Contacted', 'Requirements Received', 'Follow-ups', 'Closed/Won')),
  next_followup_date timestamptz,
  interested_services text[],
  notes_first_call text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  uploaded_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for leads table
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Create restrictive RLS policies for leads table
CREATE POLICY "Users can view own leads"
  ON leads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
  ON leads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create restrictive RLS policies for attachments table
CREATE POLICY "Users can view own attachments"
  ON attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = attachments.lead_id
      AND leads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert attachments to own leads"
  ON attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = attachments.lead_id
      AND leads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update attachments on own leads"
  ON attachments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = attachments.lead_id
      AND leads.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = attachments.lead_id
      AND leads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete attachments from own leads"
  ON attachments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = attachments.lead_id
      AND leads.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_lead_status ON leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city);
CREATE INDEX IF NOT EXISTS idx_leads_next_followup ON leads(next_followup_date);
CREATE INDEX IF NOT EXISTS idx_attachments_lead_id ON attachments(lead_id);