import { useState, useMemo } from "react";
import { MessageSquare, Bookmark, Share2, Star, ThumbsDown, ThumbsUp, ChevronLeft, ChevronRight, ChefHat, Clock, Flame, Calendar, Maximize2, XCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import type { RecipeDetailResponse } from "@/entities/recipe/api/recipeApi";
import { motion, AnimatePresence } from "framer-motion";
import { CookingAssistantModal } from "@/features/cooking-assistant/ui/CookingAssistantModal";

interface RecipeHeaderProps {
  recipe: RecipeDetailResponse;
}

export const RecipeHeader = ({ recipe }: RecipeHeaderProps) => {
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCookingModalOpen, setIsCookingModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const sortedImages = useMemo(() => {
    if (!recipe.images || recipe.images.length === 0) {
      return [{ imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop" }];
    }
    return [...recipe.images].sort((a, b) => (a.isMain === b.isMain) ? 0 : a.isMain ? -1 : 1);
  }, [recipe.images]);

  const currentImage = sortedImages[currentImageIndex]?.imageUrl;
  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % sortedImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);

  const likeMutation = useMutation({
    mutationFn: () => recipeApi.toggleLike(recipe.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["recipe-detail", recipe.id] });
      const previousRecipe = queryClient.getQueryData<RecipeDetailResponse>(["recipe-detail", recipe.id]);
      
      queryClient.setQueryData<RecipeDetailResponse>(["recipe-detail", recipe.id], (old) => {
        if (!old) return old;
        const isCurrentlyLiked = old.userInteraction?.isLiked ?? false;
        return {
          ...old,
          statistics: { ...old.statistics, totalLikes: isCurrentlyLiked ? old.statistics.totalLikes - 1 : old.statistics.totalLikes + 1 },
          userInteraction: { ...(old.userInteraction || { isLiked: false, isDisliked: false, isSaved: false }), isLiked: !isCurrentlyLiked, isDisliked: false }
        };
      });
      return { previousRecipe };
    },
    onError: (err, variables, context) => { if (context?.previousRecipe) queryClient.setQueryData(["recipe-detail", recipe.id], context.previousRecipe); },
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ["recipe-detail", recipe.id] }); }
  });

  const saveMutation = useMutation({
    mutationFn: () => recipeApi.toggleSave(recipe.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["recipe-detail", recipe.id] });
      const previousRecipe = queryClient.getQueryData<RecipeDetailResponse>(["recipe-detail", recipe.id]);
      
      queryClient.setQueryData<RecipeDetailResponse>(["recipe-detail", recipe.id], (old) => {
        if (!old) return old;
        const isCurrentlySaved = old.userInteraction?.isSaved ?? false;
        return {
          ...old,
          statistics: { ...old.statistics, totalSaves: isCurrentlySaved ? old.statistics.totalSaves - 1 : old.statistics.totalSaves + 1 },
          userInteraction: { ...(old.userInteraction || { isLiked: false, isDisliked: false, isSaved: false }), isSaved: !isCurrentlySaved }
        };
      });
      return { previousRecipe };
    },
    onError: (err, variables, context) => { if (context?.previousRecipe) queryClient.setQueryData(["recipe-detail", recipe.id], context.previousRecipe); },
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ["recipe-detail", recipe.id] }); }
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: recipe.title, text: `Bu tarife göz at: ${recipe.title}`, url: window.location.href }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Bağlantı panoya kopyalandı!");
    }
  };

  const scrollToComments = () => {
    const commentsSection = document.getElementById("recipe-comments");
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* 1. HERO IMAGE CARD */}
      <div className="relative w-full h-[350px] md:h-[450px] rounded-[2.5rem] bg-card overflow-hidden shadow-sm border border-border/50 group">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentImageIndex}
            src={currentImage} 
            alt={recipe.title} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors pointer-events-none" />

        {/* Expand Button */}
        <button 
          onClick={() => setSelectedImage(currentImage)}
          className="absolute top-6 right-6 z-20 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-md"
          title="Büyüt"
        >
          <Maximize2 className="w-5 h-5" />
        </button>

        {/* Carousel Controls */}
        {sortedImages.length > 1 && (
          <>
            <button 
              onClick={prevImage} 
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black text-foreground p-3 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-10 shadow-md"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextImage} 
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black text-foreground p-3 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-10 shadow-md"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-6 right-6 bg-black/60 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-md z-10 shadow-md">
              {currentImageIndex + 1} / {sortedImages.length}
            </div>
          </>
        )}
      </div>

      {/* 2. BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MAIN INFO CARD (Left, spans 2 columns) */}
        <div className="col-span-1 lg:col-span-2 bg-card rounded-[2rem] p-6 md:p-8 shadow-sm border border-border/50 flex flex-col justify-center">
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Categories & Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {recipe.categories?.slice(0, 2).map((cat) => (
                <div key={`hero-cat-${cat.id}`} className="px-3 py-1.5 bg-primary text-primary-foreground font-bold rounded-xl text-sm shadow-sm">
                  {cat.name}
                </div>
              ))}
              {recipe.tags?.slice(0, 3).map((tag) => (
                <div key={`hero-tag-${tag.id}`} className="px-3 py-1.5 bg-muted text-muted-foreground font-medium rounded-xl text-sm">
                  #{tag.name}
                </div>
              ))}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-xl font-bold text-sm">
              <Star className="w-4 h-4 fill-current" />
              <span>{recipe.statistics.averageRating > 0 ? recipe.statistics.averageRating.toFixed(1) : "--"}</span>
              <span className="text-amber-600/70 dark:text-amber-400/70 ml-1 font-medium hidden sm:inline">({recipe.statistics.totalRatings} Değerlendirme)</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.1] mb-6">
            {recipe.title}
          </h1>

          <div className="flex items-center gap-3 mb-6 bg-muted/30 w-fit px-4 py-2 rounded-2xl border border-muted/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-muted-foreground/20 bg-background shadow-sm">
              {recipe.author?.profileImageUrl ? (
                <img src={recipe.author.profileImageUrl} alt={recipe.author.username} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-primary text-sm">{(recipe.author?.username || "O")[0].toUpperCase()}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Tarif Sahibi</span>
              <span className="font-bold text-base text-foreground">{recipe.author?.username || "OleAI Kitchen"}</span>
            </div>
            <div className="w-px h-8 bg-border mx-2"></div>
            <div className="flex flex-col">
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Tarih</span>
              <span className="font-semibold text-sm text-foreground">{new Date(recipe.createdDate).toLocaleDateString('tr-TR')}</span>
            </div>
          </div>

          {recipe.description && (
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
              {recipe.description}
            </p>
          )}

        </div>

        {/* STATS & ACTIONS BENTO (Right, 1 column) */}
        <div className="col-span-1 flex flex-col gap-6">
          
          {/* 2x2 Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Difficulty */}
            <div className="bg-card rounded-[1.5rem] p-5 shadow-sm border border-border/50 flex flex-col items-center justify-center gap-2 text-center hover:bg-muted/30 transition-colors">
              <div className="bg-primary/10 p-2.5 rounded-2xl"><ChefHat className="w-6 h-6 text-primary" /></div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Zorluk</span>
              <span className="font-black text-lg text-foreground">
                {recipe.difficulty === 1 || String(recipe.difficulty).toLowerCase() === 'easy' ? 'Kolay' :
                 recipe.difficulty === 2 || String(recipe.difficulty).toLowerCase() === 'medium' ? 'Orta' :
                 recipe.difficulty === 3 || String(recipe.difficulty).toLowerCase() === 'hard' ? 'Zor' : 'Belirtilmedi'}
              </span>
            </div>

            {/* Servings */}
            <div className="bg-card rounded-[1.5rem] p-5 shadow-sm border border-border/50 flex flex-col items-center justify-center gap-2 text-center hover:bg-muted/30 transition-colors">
              <div className="bg-emerald-500/10 p-2.5 rounded-2xl">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Porsiyon</span>
              <span className="font-black text-lg text-foreground">{recipe.servings > 0 ? `${recipe.servings} Kişilik` : 'Belirtilmedi'}</span>
            </div>

            {/* Prep Time */}
            <div className="bg-card rounded-[1.5rem] p-5 shadow-sm border border-border/50 flex flex-col items-center justify-center gap-2 text-center hover:bg-muted/30 transition-colors">
              <div className="bg-blue-500/10 p-2.5 rounded-2xl"><Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hazırlık</span>
              <span className="font-black text-lg text-foreground">{recipe.prepTime > 0 ? `${recipe.prepTime} dk` : '--'}</span>
            </div>

            {/* Cook Time */}
            <div className="bg-card rounded-[1.5rem] p-5 shadow-sm border border-border/50 flex flex-col items-center justify-center gap-2 text-center hover:bg-muted/30 transition-colors">
              <div className="bg-orange-500/10 p-2.5 rounded-2xl"><Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" /></div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pişirme</span>
              <span className="font-black text-lg text-foreground">{recipe.cookTime > 0 ? `${recipe.cookTime} dk` : '--'}</span>
            </div>
          </div>

          {/* Actions & Like Card */}
          <div className="bg-card rounded-[2rem] p-4 shadow-sm border border-border/50 flex flex-wrap items-center justify-evenly gap-2">
            
            <button 
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-muted transition-colors w-[70px] ${likeMutation.isPending ? 'opacity-50' : ''}`}
            >
              <ThumbsUp className={`w-6 h-6 ${recipe.userInteraction?.isLiked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              <span className={`font-bold text-xs ${recipe.userInteraction?.isLiked ? "text-primary" : "text-muted-foreground"}`}>
                {recipe.statistics.totalLikes >= 1000 ? (recipe.statistics.totalLikes / 1000).toFixed(1) + 'k' : recipe.statistics.totalLikes}
              </span>
            </button>
            
            <div className="w-px h-10 bg-border"></div>

            <button 
              onClick={scrollToComments}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-muted transition-colors w-[70px]"
            >
              <MessageSquare className="w-6 h-6 text-muted-foreground" />
              <span className="font-bold text-xs text-muted-foreground">{recipe.statistics.totalComments}</span>
            </button>

            <div className="w-px h-10 bg-border"></div>

            <button 
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-muted transition-colors w-[70px] ${saveMutation.isPending ? 'opacity-50' : ''}`}
            >
              <Bookmark className={`w-6 h-6 ${recipe.userInteraction?.isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
              <span className={`font-bold text-xs ${recipe.userInteraction?.isSaved ? "text-primary" : "text-muted-foreground"}`}>Kaydet</span>
            </button>

            <div className="w-px h-10 bg-border"></div>

            <button 
              onClick={handleShare}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-muted transition-colors w-[70px]"
            >
              <Share2 className="w-6 h-6 text-muted-foreground" />
              <span className="font-bold text-xs text-muted-foreground">Paylaş</span>
            </button>

          </div>

          {/* Main Action Button */}
          <button 
            onClick={() => setIsCookingModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 group"
          >
            <ChefHat className="w-6 h-6 group-hover:-rotate-12 transition-transform" />
            <span>Asistanla Tarifi Yap</span>
          </button>

        </div>
      </div>

      <CookingAssistantModal 
        isOpen={isCookingModalOpen} 
        onClose={() => setIsCookingModalOpen(false)} 
        recipe={recipe} 
      />

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 cursor-zoom-out backdrop-blur-md"
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-2 rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            >
              <XCircle className="w-8 h-8" />
            </button>
            <motion.img 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              src={selectedImage} 
              alt="Büyük Görsel" 
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
