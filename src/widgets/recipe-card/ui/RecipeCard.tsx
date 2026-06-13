import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Bookmark, Clock, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import type { RecipeListItem } from "@/entities/recipe/api/recipeApi";
import { toast } from "sonner";

interface RecipeCardProps {
  recipe: RecipeListItem;
  index?: number;
  initialLiked?: boolean;
  initialSaved?: boolean;
}

export const RecipeCard = ({ recipe, index = 0, initialLiked = false, initialSaved = false }: RecipeCardProps) => {
  const navigate = useNavigate();
  
  // Yerel state ile optimistik UI güncellemeleri
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    
    // Optimiztic update
    setIsLiked(!isLiked);
    try {
      await recipeApi.toggleLike(recipe.id);
      toast.success(isLiked ? "Beğeni geri alındı." : "Tarif beğenildi!");
    } catch (err) {
      // Revert on error
      setIsLiked(isLiked);
      toast.error("İşlem sırasında bir hata oluştu.");
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving) return;
    setIsSaving(true);
    
    // Optimiztic update
    setIsSaved(!isSaved);
    try {
      await recipeApi.toggleSave(recipe.id);
      toast.success(isSaved ? "Tarif kaydedilenlerden çıkarıldı." : "Tarif kaydedildi!");
    } catch (err) {
      // Revert on error
      setIsSaved(isSaved);
      toast.error("İşlem sırasında bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      className="group cursor-pointer bg-card rounded-[2rem] overflow-hidden border border-muted/30 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img 
          src={recipe.mainImageUrl || "https://images.unsplash.com/photo-1495195129352-aed325a55b65?q=80&w=1776&auto=format&fit=crop"} 
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Hover Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={handleLike}
            disabled={isLiking}
            className="w-10 h-10 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-md flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
            title="Beğen"
          >
            <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary'}`} />
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-10 h-10 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-md flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
            title="Kaydet"
          >
            <Bookmark className={`w-5 h-5 transition-colors ${isSaved ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary'}`} />
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-black text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {recipe.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
          {recipe.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-muted/30">
          <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary/60" />
              <span>{recipe.prepTime + recipe.cookTime > 0 ? recipe.prepTime + recipe.cookTime : '--'} dk</span>
            </div>
            {recipe.difficulty > 0 && (
              <div className="flex items-center gap-1.5 hidden sm:flex">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                <span>{recipe.difficulty === 1 ? 'Kolay' : recipe.difficulty === 2 ? 'Orta' : 'Zor'}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-foreground">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{recipe.averageRating > 0 ? recipe.averageRating.toFixed(1) : "--"}</span>
            {recipe.totalRatings > 0 && (
              <span className="text-xs font-normal text-muted-foreground ml-1">({recipe.totalRatings})</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
