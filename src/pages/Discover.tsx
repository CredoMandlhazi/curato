import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrackPlayButton } from "@/components/TrackPlayButton";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { toast } from "sonner";
import {
  Heart,
  MessageCircle,
  TrendingUp,
  Music,
  Send,
  ChevronDown,
  ChevronUp,
  Flame,
  Clock,
  Filter,
} from "lucide-react";
import { GENRE_LIST } from "@/lib/genres";

interface TrackWithEngagement {
  id: string;
  title: string;
  artist_name: string;
  file_url: string | null;
  external_link: string | null;
  genre: string | null;
  status: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  engagement_score: number;
  user_liked: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: { display_name: string | null; stage_name: string | null } | null;
}

const Discover = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<"trending" | "newest">("trending");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  const { data: tracks, isLoading } = useQuery({
    queryKey: ["discover-tracks", sortBy, genreFilter, user?.id],
    queryFn: async () => {
      let query = supabase
        .from("tracks")
        .select("*")
        .in("status", ["pending", "in_review", "community_review", "shortlisted"])
        .order("created_at", { ascending: false });

      if (genreFilter !== "all") {
        query = query.eq("genre", genreFilter);
      }

      const { data: tracksData, error } = await query;
      if (error) throw error;

      const enriched: TrackWithEngagement[] = await Promise.all(
        (tracksData || []).map(async (track) => {
          const [likesRes, commentsRes, sharesRes, userLikeRes] = await Promise.all([
            supabase.from("track_likes").select("id", { count: "exact", head: true }).eq("track_id", track.id),
            supabase.from("track_comments").select("id", { count: "exact", head: true }).eq("track_id", track.id),
            supabase.from("track_shares").select("id", { count: "exact", head: true }).eq("track_id", track.id),
            user?.id
              ? supabase.from("track_likes").select("id").eq("track_id", track.id).eq("user_id", user.id).maybeSingle()
              : Promise.resolve({ data: null }),
          ]);

          return {
            ...track,
            likes_count: likesRes.count || 0,
            comments_count: commentsRes.count || 0,
            shares_count: sharesRes.count || 0,
            engagement_score: (likesRes.count || 0) * 1 + (commentsRes.count || 0) * 2 + (sharesRes.count || 0) * 3,
            user_liked: !!userLikeRes.data,
          };
        })
      );

      if (sortBy === "trending") {
        enriched.sort((a, b) => b.engagement_score - a.engagement_score);
      }

      return enriched;
    },
  });

  const { data: comments } = useQuery({
    queryKey: ["track-comments", expandedComments],
    queryFn: async () => {
      if (!expandedComments) return [];
      const { data, error } = await supabase
        .from("track_comments")
        .select("id, content, created_at, user_id")
        .eq("track_id", expandedComments)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const userIds = [...new Set((data || []).map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, stage_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      return (data || []).map((c) => ({
        ...c,
        profiles: profileMap.get(c.user_id) || null,
      })) as Comment[];
    },
    enabled: !!expandedComments,
  });

  const likeMutation = useMutation({
    mutationFn: async ({ trackId, liked }: { trackId: string; liked: boolean }) => {
      if (!user?.id) throw new Error("Must be logged in");
      if (liked) {
        await supabase.from("track_likes").delete().eq("track_id", trackId).eq("user_id", user.id);
      } else {
        await supabase.from("track_likes").insert({ track_id: trackId, user_id: user.id });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["discover-tracks"] }),
  });

  const commentMutation = useMutation({
    mutationFn: async ({ trackId, content }: { trackId: string; content: string }) => {
      if (!user?.id) throw new Error("Must be logged in");
      const { error } = await supabase
        .from("track_comments")
        .insert({ track_id: trackId, user_id: user.id, content });
      if (error) throw error;
    },
    onSuccess: (_, { trackId }) => {
      setCommentText((prev) => ({ ...prev, [trackId]: "" }));
      queryClient.invalidateQueries({ queryKey: ["track-comments"] });
      queryClient.invalidateQueries({ queryKey: ["discover-tracks"] });
      toast.success("Comment added!");
    },
  });

  const handleComment = (trackId: string) => {
    const content = commentText[trackId]?.trim();
    if (!content) return;
    commentMutation.mutate({ trackId, content });
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-20">
        <div className="studio-container">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Discover</h1>
                <p className="text-muted-foreground text-sm">
                  The community surfaces talent — the experts validate it
                </p>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center gap-3 mb-6"
          >
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Button
              variant={sortBy === "trending" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("trending")}
              className="gap-2"
            >
              <Flame className="w-4 h-4" />
              Trending
            </Button>
            <Button
              variant={sortBy === "newest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("newest")}
              className="gap-2"
            >
              <Clock className="w-4 h-4" />
              Newest
            </Button>

            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {GENRE_LIST.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {/* Tracks Feed */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
            </div>
          ) : !tracks?.length ? (
            <Card className="p-12 text-center">
              <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-xl font-semibold mb-2">No tracks found</h3>
              <p className="text-muted-foreground">
                {genreFilter !== "all" ? "Try a different genre filter" : "Be the first to submit a track!"}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {tracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-5 hover:border-foreground/20 transition-colors">
                      {/* Track Row */}
                      <div className="flex items-center gap-4 mb-3">
                        <TrackPlayButton
                          trackId={track.id}
                          fileUrl={track.file_url}
                          externalLink={track.external_link}
                          trackTitle={track.title}
                          artistName={track.artist_name}
                          variant="minimal"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{track.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">{track.artist_name}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {track.genre && (
                            <Badge variant="outline" className="text-xs">
                              {track.genre}
                            </Badge>
                          )}
                          {track.engagement_score > 10 && (
                            <Badge className="bg-orange-500/20 text-orange-400 gap-1">
                              <Flame className="w-3 h-3" />
                              Hot
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Engagement Bar */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`gap-2 ${track.user_liked ? "text-red-400" : "text-muted-foreground"}`}
                          onClick={() => {
                            if (!user) return toast.error("Sign in to like tracks");
                            likeMutation.mutate({ trackId: track.id, liked: track.user_liked });
                          }}
                        >
                          <Heart className={`w-4 h-4 ${track.user_liked ? "fill-current" : ""}`} />
                          {track.likes_count}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-muted-foreground"
                          onClick={() => setExpandedComments(expandedComments === track.id ? null : track.id)}
                        >
                          <MessageCircle className="w-4 h-4" />
                          {track.comments_count}
                          {expandedComments === track.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </Button>

                        {/* Social Share Buttons */}
                        <SocialShareButtons trackTitle={track.title} artistName={track.artist_name} trackId={track.id} />

                        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="w-3 h-3" />
                          {track.engagement_score} pts
                        </div>
                      </div>

                      {/* Comments Section */}
                      <AnimatePresence>
                        {expandedComments === track.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-border space-y-3"
                          >
                            {user && (
                              <div className="flex gap-2">
                                <Textarea
                                  placeholder="Add a comment..."
                                  value={commentText[track.id] || ""}
                                  onChange={(e) => setCommentText((prev) => ({ ...prev, [track.id]: e.target.value }))}
                                  rows={1}
                                  className="min-h-[40px] text-sm"
                                />
                                <Button size="icon" variant="outline" onClick={() => handleComment(track.id)} disabled={commentMutation.isPending}>
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            )}

                            {comments?.map((c) => (
                              <div key={c.id} className="text-sm space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {c.profiles?.stage_name || c.profiles?.display_name || "Anonymous"}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(c.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-muted-foreground">{c.content}</p>
                              </div>
                            ))}

                            {comments?.length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-2">
                                No comments yet. Be the first!
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Discover;
