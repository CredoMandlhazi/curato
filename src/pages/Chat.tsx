import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Send, MessageCircle, Users, Shield, Music, Headphones } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ChatMessage {
  id: string;
  user_id: string;
  room: string;
  content: string;
  created_at: string;
  profile?: { display_name: string | null; stage_name: string | null } | null;
}

const ROOM_CONFIG: Record<string, { label: string; icon: React.ElementType; roles: string[] }> = {
  curators: { label: "Curators", icon: Shield, roles: ["curator", "super_curator", "admin"] },
  artists: { label: "Artists", icon: Music, roles: ["artist"] },
  listeners: { label: "Listeners", icon: Headphones, roles: ["listener"] },
};

const Chat = () => {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Determine which room the user belongs to
  const userRoom = role
    ? Object.entries(ROOM_CONFIG).find(([, config]) => config.roles.includes(role))?.[0] || "listeners"
    : null;

  const roomConfig = userRoom ? ROOM_CONFIG[userRoom] : null;
  const RoomIcon = roomConfig?.icon || Users;

  const { data: messages = [] } = useQuery({
    queryKey: ["chat-messages", userRoom],
    queryFn: async () => {
      if (!userRoom) return [];
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, user_id, room, content, created_at")
        .eq("room", userRoom)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      const userIds = [...new Set((data || []).map((m) => m.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, stage_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      return (data || []).map((m) => ({
        ...m,
        profile: profileMap.get(m.user_id) || null,
      })) as ChatMessage[];
    },
    enabled: !!userRoom,
    refetchInterval: 5000,
  });

  // Realtime subscription
  useEffect(() => {
    if (!userRoom) return;

    const channel = supabase
      .channel(`chat-${userRoom}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `room=eq.${userRoom}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["chat-messages", userRoom] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRoom, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !user || !userRoom) return;
    setSending(true);
    try {
      const { error } = await supabase.from("chat_messages").insert({
        user_id: user.id,
        room: userRoom,
        content: message.trim(),
      });
      if (error) throw error;
      setMessage("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (!user || !userRoom) {
    return (
      <PageTransition>
        <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
          <Card className="p-12 text-center max-w-md">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-xl font-semibold mb-2">Sign in to Chat</h3>
            <p className="text-muted-foreground">Join the conversation with your community.</p>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-20">
        <div className="studio-container max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <RoomIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{roomConfig?.label} Chat</h1>
                <p className="text-muted-foreground text-sm">
                  Connect with fellow {roomConfig?.label.toLowerCase()}
                </p>
              </div>
            </div>
          </motion.div>

          <Card className="flex flex-col" style={{ height: "calc(100vh - 260px)" }}>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </p>
                )}
                {messages.map((msg) => {
                  const isOwn = msg.user_id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-lg px-4 py-2 ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {!isOwn && (
                          <p className="text-xs font-medium mb-1 opacity-70">
                            {msg.profile?.stage_name || msg.profile?.display_name || "Anonymous"}
                          </p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-[10px] opacity-50 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={sending || !message.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default Chat;
