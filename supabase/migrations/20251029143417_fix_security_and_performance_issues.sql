/*
  # Fix Security and Performance Issues

  1. Add Missing Indexes
    - Add index on `attachments.uploaded_by` foreign key
    - Add index on `leads.created_by` foreign key

  2. Optimize RLS Policies
    - Update all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
    - This prevents re-evaluation of auth functions for each row, improving performance at scale

  3. Remove Unused Indexes
    - Drop indexes that are not being used in queries:
      - `idx_leads_stage`
      - `idx_leads_lead_status`
      - `idx_leads_city`
      - `idx_leads_next_followup`
      - `idx_attachments_lead_id`

  4. Fix Function Search Path
    - Update `update_updated_at_column` function with stable search_path

  5. Security Notes
    - All RLS policies are now optimized for performance
    - Foreign key indexes ensure optimal join performance
    - Function security is improved with stable search_path
*/

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON leads(created_by);

-- Drop unused indexes (these are not being utilized in current queries)
DROP INDEX IF EXISTS idx_leads_stage;
DROP INDEX IF EXISTS idx_leads_lead_status;
DROP INDEX IF EXISTS idx_leads_city;
DROP INDEX IF EXISTS idx_leads_next_followup;
DROP INDEX IF EXISTS idx_attachments_lead_id;

-- Drop all existing RLS policies
DROP POLICY IF EXISTS "Users can view own leads" ON leads;
DROP POLICY IF EXISTS "Users can insert own leads" ON leads;
DROP POLICY IF EXISTS "Users can update own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON leads;
DROP POLICY IF EXISTS "Users can view own attachments" ON attachments;
DROP POLICY IF EXISTS "Users can insert attachments to own leads" ON attachments;
DROP POLICY IF EXISTS "Users can update attachments on own leads" ON attachments;
DROP POLICY IF EXISTS "Users can delete attachments from own leads" ON attachments;

-- Create optimized RLS policies for leads table using (select auth.uid())
CREATE POLICY "Users can view own leads"
  ON leads FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own leads"
  ON leads FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own leads"
  ON leads FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Create optimized RLS policies for attachments table using (select auth.uid())
CREATE POLICY "Users can view own attachments"
  ON attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = attachments.lead_id
      AND leads.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert attachments to own leads"
  ON attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = attachments.lead_id
      AND leads.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update attachments on own leads"
  ON attachments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = attachments.lead_id
      AND leads.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = attachments.lead_id
      AND leads.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete attachments from own leads"
  ON attachments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = attachments.lead_id
      AND leads.user_id = (select auth.uid())
    )
  );

-- Fix function search path to be stable and secure
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;