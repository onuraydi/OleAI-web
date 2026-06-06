import { useState, useMemo } from "react";
import { MessageSquare, Bookmark, Share2, Star, ThumbsDown, ThumbsUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import type { RecipeDetailResponse } from "@/entities/recipe/api/recipeApi";
import { motion, AnimatePresence } from "framer-motion";

interface RecipeHeaderProps {
  recipe: RecipeDetailResponse;
  // Mock data for display purposes based on UI design
  mockTags?: string[];
  mockRating?: number;
}

export const RecipeHeader = ({ recipe, mockTags = ["VEGETARIAN", "GLUTEN-FREE"], mockRating = 4.8 }: RecipeHeaderProps) => {
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
          statistics: {
            ...old.statistics,
            totalLikes: isCurrentlyLiked ? old.statistics.totalLikes - 1 : old.statistics.totalLikes + 1
          },
          userInteraction: {
            ...(old.userInteraction || { isLiked: false, isDisliked: false, isSaved: false }),
            isLiked: !isCurrentlyLiked,
            isDisliked: false // Optional: clear dislike when liking optimistically
          }
        };
      });
      return { previousRecipe };
    },
    onError: (err, variables, context) => {
      if (context?.previousRecipe) queryClient.setQueryData(["recipe-detail", recipe.id], context.previousRecipe);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe-detail", recipe.id] });
    }
  });

  const dislikeMutation = useMutation({
    mutationFn: () => recipeApi.toggleDislike(recipe.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["recipe-detail", recipe.id] });
      const previousRecipe = queryClient.getQueryData<RecipeDetailResponse>(["recipe-detail", recipe.id]);
      
      queryClient.setQueryData<RecipeDetailResponse>(["recipe-detail", recipe.id], (old) => {
        if (!old) return old;
        const isCurrentlyDisliked = old.userInteraction?.isDisliked ?? false;
        return {
          ...old,
          statistics: {
            ...old.statistics,
            totalDislikes: isCurrentlyDisliked ? old.statistics.totalDislikes - 1 : old.statistics.totalDislikes + 1
          },
          userInteraction: {
            ...(old.userInteraction || { isLiked: false, isDisliked: false, isSaved: false }),
            isDisliked: !isCurrentlyDisliked,
            isLiked: false // Optional: clear like when disliking optimistically
          }
        };
      });
      return { previousRecipe };
    },
    onError: (err, variables, context) => {
      if (context?.previousRecipe) queryClient.setQueryData(["recipe-detail", recipe.id], context.previousRecipe);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe-detail", recipe.id] });
    }
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
          statistics: {
            ...old.statistics,
            totalSaves: isCurrentlySaved ? old.statistics.totalSaves - 1 : old.statistics.totalSaves + 1
          },
          userInteraction: {
            ...(old.userInteraction || { isLiked: false, isDisliked: false, isSaved: false }),
            isSaved: !isCurrentlySaved
          }
        };
      });
      return { previousRecipe };
    },
    onError: (err, variables, context) => {
      if (context?.previousRecipe) queryClient.setQueryData(["recipe-detail", recipe.id], context.previousRecipe);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe-detail", recipe.id] });
    }
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: `Bu tarife göz at: ${recipe.title}`,
        url: window.location.href,
      }).catch(console.error);
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
    <div className="w-full flex flex-col items-center">
      {/* Hero Image / Carousel */}
      <div className="w-full max-w-5xl relative rounded-[2rem] overflow-hidden aspect-[21/9] shadow-2xl mb-6 group bg-black/5 dark:bg-white/5">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentImageIndex}
            src={currentImage} 
            alt={recipe.title} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        
        {sortedImages.length > 1 && (
          <>
            {/* Arrows */}
            <button 
              onClick={prevImage} 
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextImage} 
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md z-10">
              {currentImageIndex + 1} / {sortedImages.length}
            </div>
          </>
        )}
        
        {/* Mock Tags */}
        <div className="absolute top-6 right-6 flex gap-3 z-10">
          {mockTags.map((tag, idx) => (
            <span 
              key={idx} 
              className="bg-white/90 backdrop-blur-md text-foreground font-bold px-4 py-1.5 rounded-full text-sm shadow-lg tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 mb-8 w-full max-w-5xl justify-center items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {sortedImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`relative rounded-xl overflow-hidden w-20 h-20 md:w-24 md:h-24 flex-shrink-0 transition-all ${
                currentImageIndex === idx 
                  ? "ring-4 ring-primary scale-105 opacity-100 z-10" 
                  : "opacity-50 hover:opacity-100 scale-95"
              }`}
            >
              <img src={img.imageUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Title & Author */}
      <div className="text-center max-w-3xl px-4">
        <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6 tracking-tight">
          {recipe.title}
        </h1>
        
        <div className="flex items-center justify-center gap-6 text-muted-foreground font-medium mb-12 text-sm md:text-base">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            <span className="font-bold text-foreground">{mockRating}</span>
            <span>({recipe.statistics.totalComments} Değerlendirme)</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">
              {recipe.author?.username || "OleAI Kitchen"}
            </span>
            <span>tarafından</span>
          </div>
        </div>

        {recipe.description && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto">
            {recipe.description}
          </p>
        )}

        {/* Interaction Bar */}
        <div className="flex items-center justify-center gap-4 md:gap-8 bg-white dark:bg-[#111111] border border-muted/20 shadow-lg rounded-full py-3 px-6 md:px-8 mb-16 mx-auto w-fit max-w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Like */}
          <button 
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 transition-colors px-2 md:px-4 group ${likeMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary'}`}
          >
            <ThumbsUp className={`w-5 h-5 ${recipe.userInteraction?.isLiked ? "fill-primary text-primary" : "text-muted-foreground group-hover:text-primary transition-colors"}`} />
            <span className={`font-bold text-xs md:text-base ${recipe.userInteraction?.isLiked ? "text-primary" : "text-foreground"}`}>
              {recipe.statistics.totalLikes >= 1000 ? (recipe.statistics.totalLikes / 1000).toFixed(1) + 'k' : recipe.statistics.totalLikes}
            </span>
          </button>
          
          <div className="w-px h-6 bg-muted/50 hidden md:block" />

          {/* Dislike */}
          <button 
            onClick={() => dislikeMutation.mutate()}
            disabled={dislikeMutation.isPending}
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 transition-colors px-2 md:px-4 group ${dislikeMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary'}`}
          >
            <ThumbsDown className={`w-5 h-5 ${recipe.userInteraction?.isDisliked ? "fill-foreground text-foreground" : "text-muted-foreground group-hover:text-foreground transition-colors"}`} />
            <span className={`font-bold text-xs md:text-base ${recipe.userInteraction?.isDisliked ? "text-foreground" : "text-muted-foreground group-hover:text-foreground transition-colors"}`}>
              {recipe.statistics.totalDislikes >= 1000 ? (recipe.statistics.totalDislikes / 1000).toFixed(1) + 'k' : recipe.statistics.totalDislikes}
            </span>
          </button>

          <div className="w-px h-6 bg-muted/50 hidden md:block" />
          
          {/* Comment */}
          <button 
            onClick={scrollToComments}
            className="flex flex-col md:flex-row items-center gap-1 md:gap-3 hover:text-primary transition-colors px-2 md:px-4 text-muted-foreground"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            <span className="font-bold text-foreground text-xs md:text-base">{recipe.statistics.totalComments}</span>
          </button>

          <div className="w-px h-6 bg-muted/50 hidden md:block" />
          
          {/* Save */}
          <button 
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 transition-colors px-2 md:px-4 group ${saveMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary'}`}
          >
            <Bookmark className={`w-5 h-5 ${recipe.userInteraction?.isSaved ? "fill-primary text-primary" : "text-muted-foreground group-hover:text-primary transition-colors"}`} />
            <span className={`font-bold text-xs md:text-base ${recipe.userInteraction?.isSaved ? "text-primary" : "text-foreground"}`}>Kaydet</span>
          </button>

          <div className="w-px h-6 bg-muted/50 hidden md:block" />
          
          {/* Share */}
          <button 
            onClick={handleShare}
            className="flex flex-col md:flex-row items-center gap-1 md:gap-3 hover:text-primary transition-colors px-2 md:px-4 group text-muted-foreground"
          >
            <Share2 className="w-5 h-5 group-hover:text-primary transition-colors" />
            <span className="font-bold text-foreground text-xs md:text-base">Paylaş</span>
          </button>
        </div>
      </div>
    </div>
  );
};
