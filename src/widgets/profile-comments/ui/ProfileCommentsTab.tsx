import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Loader2, 
  Search, 
  AlertCircle,
  Clock,
  Trash2,
  Edit2,
  X,
  Check,
  Star,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import type { MyComment } from "@/entities/recipe/api/recipeApi";
import { useSessionStore } from "@/entities/session";
import { useDebounce } from "@/shared/hooks/useDebounce";

export const ProfileCommentsTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [sortBy, setSortBy] = useState("Newest");
  
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);

  const queryClient = useQueryClient();
  // eslint-disable-next-line unused-imports/no-unused-vars
  const user = useSessionStore(state => state.user);

  // Delete State
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  // Edit State
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState<number>(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-comments", page, size, debouncedSearch, sortBy],
    queryFn: () => recipeApi.getMyComments(page, size, debouncedSearch, sortBy),
  });

  const comments = data?.items || [];

  const deleteCommentMutation = useMutation({
    mutationFn: recipeApi.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-comments"] });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content, rating }: { commentId: string, content: string, rating?: number }) => 
      recipeApi.updateComment(commentId, content, rating),
    onSuccess: () => {
      setEditingCommentId(null);
      queryClient.invalidateQueries({ queryKey: ["my-comments"] });
    },
  });

  const confirmDelete = () => {
    if (commentToDelete) {
      deleteCommentMutation.mutate(commentToDelete);
      setCommentToDelete(null);
    }
  };

  const handleDelete = (commentId: string) => {
    setCommentToDelete(commentId);
  };

  const startEdit = (commentId: string, currentText: string, currentRating: number | undefined) => {
    setEditingCommentId(commentId);
    setEditText(currentText);
    setEditRating(currentRating || 0);
  };

  const handleEditSubmit = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!editText.trim()) return;
    updateCommentMutation.mutate({ commentId, content: editText, rating: editRating > 0 ? editRating : undefined });
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-xl font-black text-foreground flex items-center gap-2 w-full md:w-auto">
          <MessageSquare className="w-6 h-6 text-primary" />
          Yorumlarım {data ? `(${data.totalItems})` : ""}
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Yorumlarda ara..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-background border-2 border-muted/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
            />
          </div>
          
          <div className="relative w-full sm:w-48 shrink-0">
            <select 
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(0);
              }}
              className="w-full appearance-none pl-4 pr-10 py-2.5 bg-background border-2 border-muted/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-full outline-none transition-all text-sm font-medium cursor-pointer"
            >
              <option value="Newest">En Yeni</option>
              <option value="Oldest">En Eski</option>
              <option value="Highest Rated">En Yüksek Puanlı</option>
              <option value="Lowest Rated">En Düşük Puanlı</option>
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 rounded-[2rem] bg-red-500/10 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 font-bold">Yorumlar yüklenirken bir hata oluştu.</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-20 text-center bg-card rounded-[2rem] border border-dashed border-muted/50">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-primary opacity-50" />
          </div>
          <h3 className="text-2xl font-black text-foreground mb-3">
            {debouncedSearch ? "Sonuç bulunamadı" : "Henüz yorum yapmadınız"}
          </h3>
          <p className="text-muted-foreground font-medium max-w-sm mx-auto">
            {debouncedSearch 
              ? "Aramanıza uygun yorum bulunamadı. Lütfen başka bir kelime deneyin."
              : "Tariflere yorum yaparak topluluğa katkıda bulunabilirsiniz."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {comments.map((comment: MyComment) => {
              const isEditing = editingCommentId === comment.id;

              return (
                <motion.div
                  key={comment.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card rounded-2xl p-4 sm:p-6 border border-muted/30 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Recipe Thumbnail */}
                    <Link to={`/recipes/${comment.recipeId}`} className="block shrink-0 relative group">
                      {comment.recipeImageUrl ? (
                        <img 
                          src={comment.recipeImageUrl} 
                          alt={comment.recipeName}
                          className="w-full sm:w-24 h-40 sm:h-24 rounded-xl object-cover group-hover:opacity-80 transition-opacity" 
                        />
                      ) : (
                        <div className="w-full sm:w-24 h-40 sm:h-24 rounded-xl bg-primary/10 flex flex-col items-center justify-center group-hover:bg-primary/20 transition-colors">
                           <span className="text-3xl">🍲</span>
                        </div>
                      )}
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <Link to={`/recipes/${comment.recipeId}`} className="text-lg font-bold text-foreground hover:text-primary transition-colors line-clamp-1">
                            {comment.recipeName}
                          </Link>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(comment.createdDate).toLocaleDateString('tr-TR', {
                              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                        
                        {/* Actions */}
                        {!isEditing && (
                          <div className="flex items-center gap-1 shrink-0 bg-muted/20 p-1 rounded-xl">
                            <button
                              onClick={() => startEdit(comment.id, comment.content, comment.rating)}
                              className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(comment.id)}
                              disabled={deleteCommentMutation.isPending}
                              className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Parent Comment Ref */}
                      {comment.parentCommentId && (
                        <div className="text-xs bg-muted/40 p-2 rounded-lg border-l-2 border-primary/50 text-muted-foreground mb-3 italic line-clamp-2">
                          Yanıtlanan yorum: {comment.parentCommentContent || "Silinmiş içerik"}
                        </div>
                      )}

                      {/* Rating Display */}
                      {!isEditing && comment.rating != null && (
                        <div className="flex items-center gap-1 mb-2">
                           {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  comment.rating! >= star
                                    ? "fill-amber-500 text-amber-500"
                                    : "fill-muted text-muted-foreground/30"
                                }`}
                              />
                            ))}
                        </div>
                      )}

                      {/* Comment Content / Editor */}
                      {isEditing ? (
                        <form onSubmit={(e) => handleEditSubmit(e, comment.id)} className="mt-3">
                          {comment.rating != null && (
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm font-semibold text-muted-foreground mr-2">Puanı Düzenle:</span>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setEditRating(star)}
                                  className={`hover:scale-110 transition-transform ${
                                    editRating >= star ? "text-amber-500" : "text-muted-foreground/30"
                                  }`}
                                >
                                  <Star className={`w-5 h-5 ${editRating >= star ? "fill-amber-500" : ""}`} />
                                </button>
                              ))}
                            </div>
                          )}
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full bg-background border border-muted rounded-xl p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none min-h-[80px] mb-3"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingCommentId(null)}
                              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 bg-muted/50 rounded-lg hover:bg-muted"
                            >
                              <X className="w-4 h-4" /> İptal
                            </button>
                            <button
                              type="submit"
                              disabled={!editText.trim() || updateCommentMutation.isPending}
                              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1 hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                              {updateCommentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              Kaydet
                            </button>
                          </div>
                        </form>
                      ) : (
                        <p className="text-foreground/80 text-sm whitespace-pre-wrap leading-relaxed">
                          {comment.content}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {data && data.items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-muted/50 mt-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <span>Göster:</span>
            <select 
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className="bg-card border-2 border-transparent focus:border-primary rounded-xl px-2 py-1 outline-none transition-all shadow-sm cursor-pointer"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
            <span className="ml-2 border-l border-muted/50 pl-4">Toplam {data.totalItems} yorum ({data.totalPages} sayfa)</span>
          </div>

          {data.totalPages > 0 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={!data.hasPreviousPage}
                className="p-2 rounded-xl bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 hidden sm:flex">
                {[...Array(data.totalPages)].map((_, i) => {
                  // Sadece aktif sayfanın etrafındakileri göster (basit sayfalama)
                  if (data.totalPages > 7 && i !== 0 && i !== data.totalPages - 1 && Math.abs(page - i) > 1) {
                    if (Math.abs(page - i) === 2) return <span key={i} className="text-muted-foreground">...</span>;
                    return null;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-10 h-10 rounded-xl font-bold transition-colors shadow-sm ${
                        page === i 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-card text-muted-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 sm:hidden text-sm font-bold text-muted-foreground px-4">
                {page + 1} / {data.totalPages}
              </div>

              <button 
                onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                disabled={!data.hasNextPage}
                className="p-2 rounded-xl bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {commentToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-[2rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              
              <h3 className="text-2xl font-black text-foreground mb-3">
                Yorumu Sil
              </h3>
              <p className="text-muted-foreground font-medium mb-8">
                Bu yorumu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setCommentToDelete(null)}
                  className="px-5 py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteCommentMutation.isPending}
                  className="px-5 py-2.5 text-sm font-bold bg-red-500 text-white hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteCommentMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
