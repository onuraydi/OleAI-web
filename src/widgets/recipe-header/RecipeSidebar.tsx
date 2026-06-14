import { useState } from "react";
import { MessageSquare, Bookmark, Share2, ThumbsUp, ThumbsDown, ChefHat, Clock, Flame, Star, Calendar } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import type { RecipeDetailResponse } from "@/entities/recipe/api/recipeApi";
import { CookingAssistantModal } from "@/features/cooking-assistant/ui/CookingAssistantModal";

interface RecipeSidebarProps {
  recipe: RecipeDetailResponse;
}

export const RecipeSidebar = ({ recipe }: RecipeSidebarProps) => {
  const queryClient = useQueryClient();
  const [isCookingModalOpen, setIsCookingModalOpen] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

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
          statistics: { ...old.statistics, totalDislikes: isCurrentlyDisliked ? old.statistics.totalDislikes - 1 : old.statistics.totalDislikes + 1 },
          userInteraction: { ...(old.userInteraction || { isLiked: false, isDisliked: false, isSaved: false }), isDisliked: !isCurrentlyDisliked, isLiked: false }
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
      commentsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* 0. TITLE & DATE */}
      <div className="flex flex-col gap-3">
        <h2 className="text-3xl font-black text-foreground leading-tight line-clamp-3">
          {recipe.title}
        </h2>
        <div className="flex items-center gap-2 text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-xl border border-border/50 text-xs font-bold w-fit">
           <Calendar className="w-3 h-3" />
           {new Date(recipe.createdDate).toLocaleDateString('tr-TR')}
        </div>
      </div>

      {/* 1. AUTHOR CARD */}
      <div className="bg-card rounded-[2rem] p-6 shadow-sm border border-border/50 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-center w-14 h-14 rounded-full overflow-hidden border border-muted-foreground/20 bg-background shadow-sm flex-shrink-0">
          {recipe.author?.profileImageUrl ? (
            <img src={recipe.author.profileImageUrl} alt={recipe.author.username} className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold text-primary text-xl">{(recipe.author?.username || "O")[0].toUpperCase()}</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-0.5">Tarif Sahibi</span>
          <span className="font-black text-lg text-foreground">{recipe.author?.username || "OleAI Kitchen"}</span>
        </div>
      </div>

      {/* RECIPE DESCRIPTION */}
      {recipe.description && (
        <div className="bg-card rounded-[2rem] p-5 shadow-sm border border-border/50">
          <h3 className="text-sm font-black text-foreground mb-2">Tarif Hakkında</h3>
          <p className={`text-sm text-muted-foreground font-medium leading-relaxed ${!isDescExpanded ? 'line-clamp-3' : ''}`}>
            {recipe.description}
          </p>
          {recipe.description.length > 120 && (
            <button 
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="text-primary font-bold text-xs mt-2 hover:underline"
            >
              {isDescExpanded ? "Daha az göster" : "Devamını oku..."}
            </button>
          )}
        </div>
      )}

      {/* 2. RATING, CATEGORIES & TAGS */}
      <div className="flex flex-col gap-3">
        {/* Rating */}
        <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-2.5 rounded-[1rem] font-bold text-sm justify-center border border-amber-500/20 shadow-sm w-full">
          <Star className="w-5 h-5 fill-current" />
          <span>{recipe.statistics.averageRating > 0 ? recipe.statistics.averageRating.toFixed(1) : "--"}</span>
          <span className="text-amber-600/70 dark:text-amber-400/70 ml-1">({recipe.statistics.totalRatings} Değerlendirme)</span>
        </div>
        
        {/* Categories */}
        {recipe.categories && recipe.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {Array.from(new Map(recipe.categories.map(c => [c.name, c])).values()).map((cat) => (
              <div key={`sidebar-cat-${cat.id}`} className="px-3 py-1.5 bg-primary/10 text-primary font-bold rounded-xl text-xs border border-primary/20 shadow-sm">
                {cat.name}
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {Array.from(new Map(recipe.tags.map(t => [t.name, t])).values()).map((tag) => (
              <div key={`sidebar-tag-${tag.id}`} className="px-2.5 py-1.5 bg-muted/50 text-muted-foreground font-medium rounded-lg text-[11px] hover:text-foreground transition-colors cursor-pointer border border-border/50 shadow-sm">
                #{tag.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. STATS 2x2 BENTO GRID */}
      <div className="grid grid-cols-2 gap-4">
        {/* Difficulty */}
        <div className="bg-card rounded-[1.5rem] p-5 shadow-sm border border-border/50 flex flex-col items-center justify-center gap-2 text-center hover:bg-muted/30 transition-colors">
          <div className="bg-primary/10 p-2.5 rounded-2xl"><ChefHat className="w-6 h-6 text-primary" /></div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Zorluk</span>
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
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Porsiyon</span>
          <span className="font-black text-lg text-foreground">{recipe.servings > 0 ? `${recipe.servings} Kişilik` : 'Belirtilmedi'}</span>
        </div>

        {/* Prep Time */}
        <div className="bg-card rounded-[1.5rem] p-5 shadow-sm border border-border/50 flex flex-col items-center justify-center gap-2 text-center hover:bg-muted/30 transition-colors">
          <div className="bg-blue-500/10 p-2.5 rounded-2xl"><Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hazırlık</span>
          <span className="font-black text-lg text-foreground">{recipe.prepTime > 0 ? `${recipe.prepTime} dk` : '--'}</span>
        </div>

        {/* Cook Time */}
        <div className="bg-card rounded-[1.5rem] p-5 shadow-sm border border-border/50 flex flex-col items-center justify-center gap-2 text-center hover:bg-muted/30 transition-colors">
          <div className="bg-orange-500/10 p-2.5 rounded-2xl"><Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" /></div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pişirme</span>
          <span className="font-black text-lg text-foreground">{recipe.cookTime > 0 ? `${recipe.cookTime} dk` : '--'}</span>
        </div>
      </div>

      {/* 3. ACTIONS CARD */}
      <div className="bg-card rounded-[2rem] p-3 shadow-sm border border-border/50 flex justify-between items-center gap-1 w-full">
        
        {/* Like & Dislike Combo */}
        <div className="flex items-center">
          <button 
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 hover:bg-muted/40 transition-colors rounded-xl min-w-[3.5rem] ${likeMutation.isPending ? 'opacity-50' : ''}`}
          >
            <ThumbsUp className={`w-4 h-4 ${recipe.userInteraction?.isLiked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
            <span className={`font-bold text-[10px] ${recipe.userInteraction?.isLiked ? "text-primary" : "text-muted-foreground"}`}>
              {recipe.statistics.totalLikes >= 1000 ? (recipe.statistics.totalLikes / 1000).toFixed(1) + 'k' : recipe.statistics.totalLikes}
            </span>
          </button>
          
          <div className="w-px h-6 bg-border mx-1"></div>

          <button 
            onClick={() => dislikeMutation.mutate()}
            disabled={dislikeMutation.isPending}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 hover:bg-muted/40 transition-colors rounded-xl min-w-[3.5rem] ${dislikeMutation.isPending ? 'opacity-50' : ''}`}
          >
            <ThumbsDown className={`w-4 h-4 ${recipe.userInteraction?.isDisliked ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
            <span className={`font-bold text-[10px] ${recipe.userInteraction?.isDisliked ? "text-destructive" : "text-muted-foreground"}`}>
              {recipe.statistics.totalDislikes >= 1000 ? (recipe.statistics.totalDislikes / 1000).toFixed(1) + 'k' : recipe.statistics.totalDislikes}
            </span>
          </button>
        </div>

        {/* Comment */}
        <button 
          onClick={scrollToComments}
          className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 hover:bg-muted/40 transition-colors rounded-xl flex-1"
        >
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
          <span className="font-bold text-[10px] text-muted-foreground">{recipe.statistics.totalComments}</span>
        </button>

        {/* Save */}
        <button 
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 hover:bg-muted/40 transition-colors rounded-xl flex-1 ${saveMutation.isPending ? 'opacity-50' : ''}`}
        >
          <Bookmark className={`w-5 h-5 ${recipe.userInteraction?.isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
          <span className={`font-bold text-[10px] ${recipe.userInteraction?.isSaved ? "text-primary" : "text-muted-foreground"}`}>Kaydet</span>
        </button>

        {/* Share */}
        <button 
          onClick={handleShare}
          className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 hover:bg-muted/40 transition-colors rounded-xl flex-1"
        >
          <Share2 className="w-5 h-5 text-muted-foreground" />
          <span className="font-bold text-[10px] text-muted-foreground">Paylaş</span>
        </button>
      </div>

      {/* 4. MAIN ACTION BUTTON */}
      <button 
        onClick={() => setIsCookingModalOpen(true)}
        className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 group mt-2"
      >
        <ChefHat className="w-7 h-7 group-hover:-rotate-12 transition-transform" />
        <span>Tarifi Yap</span>
      </button>

      <CookingAssistantModal 
        isOpen={isCookingModalOpen} 
        onClose={() => setIsCookingModalOpen(false)} 
        recipe={recipe} 
      />
    </div>
  );
};
