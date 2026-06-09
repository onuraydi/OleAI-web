import { useState } from "react";
import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import { Send, UserCircle2, Loader2, MessageSquare, ChevronDown, ChevronUp, Reply, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RecipeCommentsProps {
  recipeId: string;
  totalComments: number;
}

export const RecipeComments = ({ recipeId, totalComments }: RecipeCommentsProps) => {
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ["recipe-comments", recipeId],
    queryFn: ({ pageParam = 0 }) => recipeApi.getRecipeComments(recipeId, pageParam, 10),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.pageNumber : undefined,
    enabled: isOpen // Only fetch when accordion is open
  });

  const comments = data?.pages.flatMap((page) => page.items) || [];

  const addCommentMutation = useMutation({
    mutationFn: ({ content, parentId, rating }: { content: string, parentId?: string, rating?: number }) => 
      recipeApi.addComment(recipeId, content, parentId, rating),
    onSuccess: () => {
      setCommentText("");
      setRating(0);
      setReplyText("");
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ["recipe-comments", recipeId] });
      queryClient.invalidateQueries({ queryKey: ["recipe-detail", recipeId] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || rating === 0) return;
    addCommentMutation.mutate({ content: commentText, rating });
  };

  const handleReplySubmit = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addCommentMutation.mutate({ content: replyText, parentId });
  };

  return (
    <div id="recipe-comments" className="w-full max-w-4xl mx-auto px-4 mt-8 pb-24 scroll-mt-24">
      
      {/* Accordion Header */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 border-b border-muted/20 hover:border-primary/50 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <MessageSquare className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <h2 className="text-2xl md:text-3xl font-black text-foreground">Yorumlar</h2>
            <p className="text-muted-foreground font-medium text-sm md:text-base">{totalComments} yorum yapıldı</p>
          </div>
        </div>
        <div className="text-muted-foreground group-hover:text-primary transition-colors">
          {isOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-8">
              {/* Comment Input */}
              <div className="bg-white dark:bg-[#111111] rounded-[2rem] p-6 border border-muted/20 mb-10 shadow-sm">
                <form onSubmit={handleSubmit} className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <UserCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    {/* Rating Selector */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-muted-foreground mr-2">Puanınız:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`hover:scale-110 transition-transform ${
                            rating >= star ? "text-amber-500" : "text-muted-foreground/30"
                          }`}
                        >
                          <Star className={`w-6 h-6 ${rating >= star ? "fill-amber-500" : ""}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Düşüncelerini paylaş veya soru sor..."
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-muted/30 rounded-2xl p-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none min-h-[100px]"
                    />
                    <div className="flex justify-end mt-4">
                      <button
                        type="submit"
                        disabled={!commentText.trim() || rating === 0 || addCommentMutation.isPending}
                        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                      >
                        {addCommentMutation.isPending && !replyingTo ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                        Yorum Yap
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {status === "pending" ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : comments.length > 0 ? (
                  <>
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-white dark:bg-[#111111] p-6 rounded-[2rem] border border-muted/20 shadow-sm">
                        {/* Main Comment */}
                        <div className="flex items-start gap-4 mb-4">
                          {comment.profileImageUrl ? (
                            <img src={comment.profileImageUrl} alt={comment.username} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <UserCircle2 className="w-8 h-8 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-foreground flex items-center gap-2">
                                {comment.username}
                                {comment.rating && (
                                  <div className="flex items-center gap-0.5 bg-amber-500/10 px-1.5 py-0.5 rounded text-amber-600 dark:text-amber-500 text-xs font-bold">
                                    <Star className="w-3 h-3 fill-current" />
                                    {comment.rating}
                                  </div>
                                )}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(comment.createdDate).toLocaleDateString("tr-TR", { 
                                  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <button 
                              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-sm font-semibold bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-full"
                            >
                              <Reply className="w-4 h-4" /> Cevapla
                            </button>
                          </div>
                        </div>
                        <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap ml-16">{comment.content}</p>

                        {/* Reply Input */}
                        <AnimatePresence>
                          {replyingTo === comment.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-6"
                            >
                              <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="flex gap-3 items-start ml-4 md:ml-16">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                  <UserCircle2 className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder={`${comment.username} kullanıcısına cevap ver...`}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-muted/30 rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none min-h-[80px]"
                                  />
                                  <div className="flex justify-end gap-2 mt-2">
                                    <button
                                      type="button"
                                      onClick={() => setReplyingTo(null)}
                                      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      İptal
                                    </button>
                                    <button
                                      type="submit"
                                      disabled={!replyText.trim() || addCommentMutation.isPending}
                                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {addCommentMutation.isPending && replyingTo === comment.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Send className="w-4 h-4" />
                                      )}
                                      Cevapla
                                    </button>
                                  </div>
                                </div>
                              </form>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-6 ml-4 md:ml-16 space-y-4 border-l-2 border-muted/20 pl-4 md:pl-6">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="relative">
                                <div className="flex items-center gap-3 mb-2">
                                  {reply.profileImageUrl ? (
                                    <img src={reply.profileImageUrl} alt={reply.username} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                      <UserCircle2 className="w-5 h-5 text-primary" />
                                    </div>
                                  )}
                                  <div>
                                    <h5 className="font-bold text-foreground text-sm">{reply.username}</h5>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(reply.createdDate).toLocaleDateString("tr-TR", { 
                                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap ml-11">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {hasNextPage && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={() => fetchNextPage()}
                          disabled={isFetchingNextPage}
                          className="bg-neutral-100 dark:bg-neutral-800 text-foreground px-8 py-3 rounded-full font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2"
                        >
                          {isFetchingNextPage && <Loader2 className="w-5 h-5 animate-spin" />}
                          Daha Fazla Yorum Yükle
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 bg-neutral-50 dark:bg-[#111111] rounded-[2rem] border border-dashed border-muted/30">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">Henüz Yorum Yok</h3>
                    <p className="text-muted-foreground">Bu tarif hakkında ilk yorumu sen yap!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
