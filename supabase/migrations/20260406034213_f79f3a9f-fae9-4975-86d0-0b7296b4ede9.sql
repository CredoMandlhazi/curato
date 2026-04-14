
-- Track Comments table
CREATE TABLE public.track_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.track_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.track_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.track_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.track_comments FOR DELETE USING (auth.uid() = user_id);

-- Track Shares table
CREATE TABLE public.track_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.track_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shares" ON public.track_shares FOR SELECT USING (true);
CREATE POLICY "Authenticated users can share" ON public.track_shares FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Engagement score function: calculates a score based on likes, comments, shares
CREATE OR REPLACE FUNCTION public.get_track_engagement(p_track_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT COUNT(*) FROM public.track_likes WHERE track_id = p_track_id) * 1 +
    (SELECT COUNT(*) FROM public.track_comments WHERE track_id = p_track_id) * 2 +
    (SELECT COUNT(*) FROM public.track_shares WHERE track_id = p_track_id) * 3,
    0
  )::INTEGER
$$;

-- Add new track statuses for the Waze pipeline
-- Update tracks status to support: community_review, shortlisted, validated
-- (existing statuses: pending, in_review, approved, rejected)

-- Add realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.track_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.track_likes;
