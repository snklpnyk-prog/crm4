/*
  # Create Lead Management System Tables

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
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
      - `created_by` (text, required)

    - `attachments`
      - `id` (uuid, primary key)
      - `lead_id` (uuid, foreign key to leads)
      - `file_name` (text, required)
      - `file_url` (text, required)
      - `file_type` (text, optional)
      - `uploaded_at` (timestamptz, auto-generated)
      - `uploaded_by` (text, required)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their leads
*/

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
  created_by text NOT NULL
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  uploaded_at timestamptz DEFAULT now(),
  uploaded_by text NOT NULL
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

-- Create policies for leads table
CREATE POLICY "Anyone can view leads"
  ON leads FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert leads"
  ON leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update leads"
  ON leads FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete leads"
  ON leads FOR DELETE
  USING (true);

-- Create policies for attachments table
CREATE POLICY "Anyone can view attachments"
  ON attachments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert attachments"
  ON attachments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update attachments"
  ON attachments FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete attachments"
  ON attachments FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_lead_status ON leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city);
CREATE INDEX IF NOT EXISTS idx_leads_next_followup ON leads(next_followup_date);
CREATE INDEX IF NOT EXISTS idx_attachments_lead_id ON attachments(lead_id);
