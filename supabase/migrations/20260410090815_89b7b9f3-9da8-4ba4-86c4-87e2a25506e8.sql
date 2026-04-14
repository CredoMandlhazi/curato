
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create a more targeted policy - the trigger uses SECURITY DEFINER so it bypasses RLS
-- This policy allows the service role (used by triggers with SECURITY DEFINER) to insert
-- We also allow authenticated users to insert their own notifications
CREATE POLICY "Users and system can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
