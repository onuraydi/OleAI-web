import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChefHat, Heart, Bookmark, ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { recipeApi, type RecipeListItem } from "@/entities/recipe/api/recipeApi";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";

interface HeroCarouselProps {
  recipes: RecipeListItem[];
}

/** Tek bir Hero slide'ını render eden iç bileşen */
const HeroSlide = ({ recipe }: { recipe: RecipeListItem }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(recipe.isLiked ?? false);
  const [isSaved, setIsSaved] = useState(recipe.isSaved ?? false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const uniqueTags = recipe.tags?.filter((tag, index, self) => self.findIndex(t => t.id === tag.id) === index) || [];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (recipe.isLiked !== undefined) setIsLiked(recipe.isLiked);
    if (recipe.isSaved !== undefined) setIsSaved(recipe.isSaved);
  }, [recipe.isLiked, recipe.isSaved]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    setIsLiked(!isLiked);
    try {
      await recipeApi.toggleLike(recipe.id);
      toast.success(isLiked ? "Beğeni geri alındı." : "Tarif beğenildi!");
    } catch {
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
    setIsSaved(!isSaved);
    try {
      await recipeApi.toggleSave(recipe.id);
      toast.success(isSaved ? "Tarif kaydedilenlerden çıkarıldı." : "Tarif kaydedildi!");
    } catch {
      setIsSaved(isSaved);
      toast.error("İşlem sırasında bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      key={recipe.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      className="absolute inset-0 cursor-pointer group"
    >
      <img
        src={recipe.mainImageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"}
        alt={recipe.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Top badges */}
      <div className="absolute top-6 left-6 flex flex-wrap items-center gap-2 z-20">
        <span className="bg-primary/90 text-primary-foreground backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium">
          🔥 Günün Trendi
        </span>
        {uniqueTags.length > 0 && (
          <>
            {uniqueTags.slice(0, 2).map(tag => (
              <span key={tag.id} className="bg-primary/90 text-primary-foreground backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium hidden sm:inline-flex">
                {tag.name}
              </span>
            ))}
            {uniqueTags.length > 2 && (
              <span className="bg-primary/90 text-primary-foreground backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium hidden sm:inline-flex">
                +{uniqueTags.length - 2}
              </span>
            )}
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/50 active:scale-95 transition-all border border-white/10"
        >
          <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'fill-primary text-primary' : 'text-white'}`} />
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/50 active:scale-95 transition-all border border-white/10"
        >
          <Bookmark className={`w-6 h-6 transition-colors ${isSaved ? 'fill-primary text-primary' : 'text-white'}`} />
        </button>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white">
        <div className="flex items-center gap-4 text-white/80 mb-6 text-sm md:text-base font-medium">
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
            <Clock className="w-4 h-4 text-primary" />
            <span>{recipe.prepTime + recipe.cookTime} Dk</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
            <ChefHat className="w-4 h-4 text-primary" />
            <span>{recipe.difficulty === 0 ? "Kolay" : recipe.difficulty === 1 ? "Orta" : "Zor"}</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-5 tracking-tight leading-snug group-hover:text-primary/90 transition-colors drop-shadow-md">
          {recipe.title}
        </h1>

        <p className="text-white/80 line-clamp-2 md:w-2/3 text-lg mb-8 font-light leading-relaxed drop-shadow-sm">
          {recipe.description}
        </p>

        <Button
          size="lg"
          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 font-semibold text-lg group/btn border-none"
        >
          Tarife Git
          <ChevronRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
};

/** Ana carousel bileşeni - 3 tarif arasında otomatik geçiş yapar */
export const HeroCarousel = ({ recipes }: HeroCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % recipes.length);
  }, [recipes.length]);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + recipes.length) % recipes.length);
  }, [recipes.length]);

  // Auto-play: her 6 saniyede bir sonraki slide'a geç
  useEffect(() => {
    if (isPaused || recipes.length <= 1) return;

    const interval = setInterval(goToNext, 6000);
    return () => clearInterval(interval);
  }, [isPaused, goToNext, recipes.length]);

  if (!recipes || recipes.length === 0) return null;

  return (
    <div
      className="relative w-full h-[400px] md:h-[500px] lg:h-[550px] rounded-[2.5rem] overflow-hidden shadow-2xl group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <HeroSlide key={recipes[activeIndex].id} recipe={recipes[activeIndex]} />
      </AnimatePresence>

      {/* Navigation Arrows */}
      {recipes.length > 1 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/50 border border-white/10 text-white z-30 transition-all opacity-0 group-hover:opacity-100 hidden md:flex active:scale-95"
            aria-label="Önceki Tarif"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-black/50 border border-white/10 text-white z-30 transition-all opacity-0 group-hover:opacity-100 hidden md:flex active:scale-95"
            aria-label="Sonraki Tarif"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {recipes.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-12 flex items-center gap-3 z-30">
          {recipes.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(index);
              }}
              className={`transition-all duration-500 rounded-full ${
                index === activeIndex
                  ? "w-10 h-3 bg-primary shadow-lg shadow-primary/50"
                  : "w-3 h-3 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
