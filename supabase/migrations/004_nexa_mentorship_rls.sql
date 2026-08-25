-- 1. Extend Profiles Table for Mentorship
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_mentor BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_mentee BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS mentor_status TEXT DEFAULT 'pending' CHECK (mentor_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS "current_role" TEXT,
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS field TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS topics TEXT[],
ADD COLUMN IF NOT EXISTS availability TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- 2. Create Mentorship Requests Table
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    goal TEXT NOT NULL,
    help_needed TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'declined', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Mentor Reviews Table
CREATE TABLE IF NOT EXISTS public.mentor_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL UNIQUE REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create User Blocks Table
CREATE TABLE IF NOT EXISTS public.user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

-- 5. Create User Reports Table
CREATE TABLE IF NOT EXISTS public.user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- Mentorship Requests Policies
CREATE POLICY "Users can view their own requests as mentor or mentee"
ON public.mentorship_requests FOR SELECT
USING (auth.uid() = mentee_id OR auth.uid() = mentor_id);

CREATE POLICY "Mentees can create requests"
ON public.mentorship_requests FOR INSERT
WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Mentors and Mentees can update status"
ON public.mentorship_requests FOR UPDATE
USING (auth.uid() = mentee_id OR auth.uid() = mentor_id);

-- Mentor Reviews Policies
CREATE POLICY "Reviews are viewable by everyone"
ON public.mentor_reviews FOR SELECT USING (true);

CREATE POLICY "Mentees can leave reviews for completed mentorships"
ON public.mentor_reviews FOR INSERT
WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
        SELECT 1 FROM public.mentorship_requests
        WHERE id = request_id AND mentee_id = auth.uid() AND status = 'completed'
    )
);

-- User Blocks Policies
CREATE POLICY "Users can block others and see their block list"
ON public.user_blocks FOR ALL USING (auth.uid() = blocker_id);

-- User Reports Policies
CREATE POLICY "Users can report others"
ON public.user_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Trigger to recalculate rating averages
CREATE OR REPLACE FUNCTION update_mentor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET 
        rating_avg = (SELECT COALESCE(AVG(rating), 0) FROM public.mentor_reviews WHERE mentor_id = NEW.mentor_id),
        rating_count = (SELECT COUNT(*) FROM public.mentor_reviews WHERE mentor_id = NEW.mentor_id)
    WHERE id = NEW.mentor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trigger_update_mentor_rating
AFTER INSERT OR UPDATE ON public.mentor_reviews
FOR EACH ROW EXECUTE FUNCTION update_mentor_rating();