
-- Add new profile columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS id_number text,
ADD COLUMN IF NOT EXISTS contact_number text,
ADD COLUMN IF NOT EXISTS residential_address text,
ADD COLUMN IF NOT EXISTS gender text;

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Track status change notification trigger
CREATE OR REPLACE FUNCTION public.notify_track_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  status_label text;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'community_review' THEN status_label := 'Community Review';
      WHEN 'in_review' THEN status_label := 'Curator Review';
      WHEN 'shortlisted' THEN status_label := 'Shortlisted';
      WHEN 'in_pool' THEN status_label := 'Test Pool';
      WHEN 'approved' THEN status_label := 'Validated';
      WHEN 'rejected' THEN status_label := 'Not Selected';
      ELSE status_label := NEW.status;
    END CASE;

    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      NEW.user_id,
      'track_status',
      'Track Status Updated',
      format('Your track "%s" has been moved to: %s', NEW.title, status_label),
      jsonb_build_object('track_id', NEW.id, 'new_status', NEW.status, 'old_status', OLD.status)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_track_status_change
AFTER UPDATE ON public.tracks
FOR EACH ROW
EXECUTE FUNCTION public.notify_track_status_change();

-- Allow the trigger to insert notifications
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);
