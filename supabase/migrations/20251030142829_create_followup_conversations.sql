/*
  # Create Follow-up Conversations System

  1. New Tables
    - `followup_conversations`
      - `id` (uuid, primary key) - Unique identifier for each conversation
      - `lead_id` (uuid, foreign key) - References the lead this conversation belongs to
      - `created_by` (uuid, foreign key) - References the user who added this conversation
      - `conversation_text` (text) - The actual conversation/notes content
      - `conversation_date` (timestamptz) - When this conversation took place
      - `created_at` (timestamptz) - When this record was created
      - `updated_at` (timestamptz) - When this record was last updated

  2. Security
    - Enable RLS on `followup_conversations` table
    - Add policies for authenticated users to:
      - View conversations for leads they have access to
      - Create new conversations
      - Update their own conversations
      - Delete their own conversations

  3. Indexes
    - Add index on `lead_id` for faster lookups
    - Add index on `conversation_date` for chronological sorting
*/

CREATE TABLE IF NOT EXISTS followup_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_text text NOT NULL,
  conversation_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE followup_conversations ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_followup_conversations_lead_id ON followup_conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_followup_conversations_date ON followup_conversations(conversation_date DESC);

-- Policies: Users can view conversations for any lead (since all leads are shared within the organization)
CREATE POLICY "Users can view all conversations"
  ON followup_conversations FOR SELECT
  TO authenticated
  USING (true);

-- Users can create conversations
CREATE POLICY "Users can create conversations"
  ON followup_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON followup_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Users can delete their own conversations
CREATE POLICY "Users can delete own conversations"
  ON followup_conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_followup_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_followup_conversations_updated_at_trigger'
  ) THEN
    CREATE TRIGGER update_followup_conversations_updated_at_trigger
      BEFORE UPDATE ON followup_conversations
      FOR EACH ROW
      EXECUTE FUNCTION update_followup_conversations_updated_at();
  END IF;
END $$;
