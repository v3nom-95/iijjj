import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Send, 
  ImageIcon, 
  MoreHorizontal,
  Loader2,
  Users,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { format } from "date-fns";

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    batch_year: string | null;
    company: string | null;
  };
  likes: { user_id: string }[];
  comments: { 
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles?: {
      full_name: string | null;
    };
  }[];
}

const Community = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchPosts();
      
      // Real-time subscription
      const channel = supabase
        .channel('posts-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'posts' },
          () => fetchPosts()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'likes' },
          () => fetchPosts()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'comments' },
          () => fetchPosts()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          likes (user_id),
          comments (id, content, created_at, user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = [...new Set(postsData?.map(p => p.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, batch_year, company')
        .in('user_id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      
      const postsWithProfiles = (postsData || []).map(post => ({
        ...post,
        profiles: profilesMap.get(post.user_id) || { full_name: null, batch_year: null, company: null },
        comments: post.comments.map((c: any) => ({
          ...c,
          profiles: profilesMap.get(c.user_id) || { full_name: null }
        }))
      }));

      setPosts(postsWithProfiles as Post[]);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;

    setPosting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          content: newPost.trim(),
          user_id: user.id,
        });

      if (error) throw error;

      setNewPost("");
      toast({
        title: "Posted!",
        description: "Your post has been shared with the community.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    const hasLiked = post?.likes.some(l => l.user_id === user.id);

    try {
      if (hasLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!commentText.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: commentText.trim(),
        });

      if (error) throw error;

      setCommentText("");
      setActiveCommentPost(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-8 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHoiIHN0cm9rZT0iI2YzYjg0YyIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20" />
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Community Feed</span>
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
              Connect & Share
            </h1>
            <p className="text-primary-foreground/80">
              Share updates, opportunities, and engage with the VNITS IT community.
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Create Post */}
        <Card className="mb-8 shadow-soft animate-scale-in">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="gradient-hero text-secondary font-display font-bold">
                  {user.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <Textarea
                  placeholder="Share an update, job opportunity, or ask for advice..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Add Image
                  </Button>
                  <Button 
                    variant="hero" 
                    onClick={handleCreatePost}
                    disabled={!newPost.trim() || posting}
                  >
                    {posting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-2">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">
                No Posts Yet
              </h3>
              <p className="text-muted-foreground">
                Be the first to share something with the community!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <Card 
                key={post.id} 
                className="shadow-soft hover:shadow-medium transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-11 h-11">
                        <AvatarFallback className="gradient-hero text-secondary font-display font-bold">
                          {post.profiles?.full_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">
                          {post.profiles?.full_name || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {post.profiles?.company && (
                            <span>{post.profiles.company}</span>
                          )}
                          {post.profiles?.batch_year && (
                            <Badge variant="secondary" className="text-xs">
                              {post.profiles.batch_year}
                            </Badge>
                          )}
                          <span>•</span>
                          <span>{format(new Date(post.created_at), 'MMM d, h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-foreground whitespace-pre-wrap mb-4">
                    {post.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-6 pt-4 border-t border-border">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        post.likes.some(l => l.user_id === user.id)
                          ? "text-destructive"
                          : "text-muted-foreground hover:text-destructive"
                      }`}
                    >
                      <Heart 
                        className={`w-5 h-5 ${
                          post.likes.some(l => l.user_id === user.id) ? "fill-current" : ""
                        }`} 
                      />
                      <span>{post.likes.length}</span>
                    </button>

                    <button
                      onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.comments.length}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {(activeCommentPost === post.id || post.comments.length > 0) && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                              {comment.profiles?.full_name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-muted rounded-lg p-3">
                            <p className="text-sm font-medium text-foreground">
                              {comment.profiles?.full_name || "Anonymous"}
                            </p>
                            <p className="text-sm text-foreground mt-1">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}

                      {activeCommentPost === post.id && (
                        <div className="flex gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="gradient-hero text-secondary text-xs">
                              {user.email?.[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex gap-2">
                            <Textarea
                              placeholder="Write a comment..."
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              className="min-h-[60px] resize-none text-sm"
                            />
                            <Button 
                              size="icon" 
                              onClick={() => handleComment(post.id)}
                              disabled={!commentText.trim()}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Community;
