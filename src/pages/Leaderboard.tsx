import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrackPlayButton } from "@/components/TrackPlayButton";
import {
  Trophy,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Crown,
  Medal,
  Star,
  Music,
} from "lucide-react";

interface LeaderboardTrack {
  id: string;
  title: string;
  artist_name: string;
  file_url: string | null;
  external_link: string | null;
  genre: string | null;
  likes: number;
  comments: number;
  shares: number;
  score: number;
}

interface TopContributor {
  user_id: string;
  display_name: string | null;
  stage_name: string | null;
  feedback_count: number;
  comment_count: number;
  total_contributions: number;
}

const getRankIcon = (rank: number) => {
  if (rank === 0) return <Crown className="w-5 h-5 text-yellow-400" />;
  if (rank === 1) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground">#{rank + 1}</span>;
};

const Leaderboard = () => {
  // Fetch top tracks by engagement
  const { data: topTracks, isLoading: tracksLoading } = useQuery({
    queryKey: ["leaderboard-tracks"],
    queryFn: async () => {
      const { data: tracks, error } = await supabase
        .from("tracks")
        .select("id, title, artist_name, file_url, external_link, genre")
        .in("status", ["pending", "in_review", "community_review", "shortlisted", "approved"]);

      if (error) throw error;

      const enriched: LeaderboardTrack[] = await Promise.all(
        (tracks || []).map(async (track) => {
          const [likesRes, commentsRes, sharesRes] = await Promise.all([
            supabase.from("track_likes").select("id", { count: "exact", head: true }).eq("track_id", track.id),
            supabase.from("track_comments").select("id", { count: "exact", head: true }).eq("track_id", track.id),
            supabase.from("track_shares").select("id", { count: "exact", head: true }).eq("track_id", track.id),
          ]);

          return {
            ...track,
            likes: likesRes.count || 0,
            comments: commentsRes.count || 0,
            shares: sharesRes.count || 0,
            score: (likesRes.count || 0) + (commentsRes.count || 0) * 2 + (sharesRes.count || 0) * 3,
          };
        })
      );

      return enriched.sort((a, b) => b.score - a.score).slice(0, 20);
    },
  });

  // Fetch top community contributors (commenters + feedback givers)
  const { data: topContributors, isLoading: contributorsLoading } = useQuery({
    queryKey: ["leaderboard-contributors"],
    queryFn: async () => {
      // Get comment counts per user
      const { data: commentData } = await supabase
        .from("track_comments")
        .select("user_id");

      // Get feedback counts per user
      const { data: feedbackData } = await supabase
        .from("feedback")
        .select("reviewer_id");

      // Aggregate
      const contributionMap = new Map<string, { feedback: number; comments: number }>();

      feedbackData?.forEach((f) => {
        const existing = contributionMap.get(f.reviewer_id) || { feedback: 0, comments: 0 };
        existing.feedback++;
        contributionMap.set(f.reviewer_id, existing);
      });

      commentData?.forEach((c) => {
        const existing = contributionMap.get(c.user_id) || { feedback: 0, comments: 0 };
        existing.comments++;
        contributionMap.set(c.user_id, existing);
      });

      const userIds = [...contributionMap.keys()];
      if (!userIds.length) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, stage_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      const contributors: TopContributor[] = userIds.map((uid) => {
        const c = contributionMap.get(uid)!;
        const profile = profileMap.get(uid);
        return {
          user_id: uid,
          display_name: profile?.display_name || null,
          stage_name: profile?.stage_name || null,
          feedback_count: c.feedback,
          comment_count: c.comments,
          total_contributions: c.feedback * 3 + c.comments,
        };
      });

      return contributors.sort((a, b) => b.total_contributions - a.total_contributions).slice(0, 15);
    },
  });

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-20">
        <div className="studio-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Leaderboard</h1>
                <p className="text-muted-foreground text-sm">
                  Top tracks and contributors — powered by community signals
                </p>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="tracks" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
              <TabsTrigger value="tracks" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Top Tracks
              </TabsTrigger>
              <TabsTrigger value="contributors" className="gap-2">
                <Star className="w-4 h-4" />
                Top Contributors
              </TabsTrigger>
            </TabsList>

            {/* Top Tracks */}
            <TabsContent value="tracks">
              {tracksLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
                </div>
              ) : !topTracks?.length ? (
                <Card className="p-12 text-center">
                  <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">No tracks yet</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {topTracks.map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4 hover:border-foreground/20 transition-colors">
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div className="w-8 flex justify-center">{getRankIcon(index)}</div>

                          {/* Play */}
                          <TrackPlayButton
                            trackId={track.id}
                            fileUrl={track.file_url}
                            externalLink={track.external_link}
                            trackTitle={track.title}
                            artistName={track.artist_name}
                            variant="minimal"
                          />

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{track.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">{track.artist_name}</p>
                          </div>

                          {/* Stats */}
                          <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" /> {track.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" /> {track.comments}
                            </span>
                            <span className="flex items-center gap-1">
                              <Share2 className="w-3 h-3" /> {track.shares}
                            </span>
                          </div>

                          {/* Score */}
                          <Badge className="bg-primary/10 text-primary">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {track.score}
                          </Badge>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Top Contributors */}
            <TabsContent value="contributors">
              {contributorsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
                </div>
              ) : !topContributors?.length ? (
                <Card className="p-12 text-center">
                  <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">No contributors yet</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {topContributors.map((contributor, index) => (
                    <motion.div
                      key={contributor.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4 hover:border-foreground/20 transition-colors">
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div className="w-8 flex justify-center">{getRankIcon(index)}</div>

                          {/* Name */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">
                              {contributor.stage_name || contributor.display_name || "Anonymous"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {contributor.feedback_count} reviews · {contributor.comment_count} comments
                            </p>
                          </div>

                          {/* Score */}
                          <Badge className="bg-primary/10 text-primary">
                            {contributor.total_contributions} pts
                          </Badge>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
};

export default Leaderboard;
