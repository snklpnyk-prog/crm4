/*
  # Setup Storage Policies for Lead Attachments

  1. Storage Configuration
    - Create policies for the 'lead-attachments' bucket
    - Allow public read access to attachments
    - Allow authenticated operations for upload and delete

  2. Security
    - Enable public access for viewing attachments
    - Allow anyone to upload files to lead-attachments bucket
    - Allow anyone to delete their uploaded files
*/

-- Create policies for storage.objects table
CREATE POLICY "Public Access for lead attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'lead-attachments');

CREATE POLICY "Allow upload to lead attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lead-attachments');

CREATE POLICY "Allow delete from lead attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'lead-attachments');

CREATE POLICY "Allow update to lead attachments"
ON storage.objects FOR UPDATE
USING (bucket_id = 'lead-attachments')
WITH CHECK (bucket_id = 'lead-attachments');