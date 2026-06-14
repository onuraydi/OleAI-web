import { useState, useMemo } from "react";
import { Star, ChevronLeft, ChevronRight, Maximize2, XCircle, Calendar } from "lucide-react";
import type { RecipeDetailResponse } from "@/entities/recipe/api/recipeApi";
import { motion, AnimatePresence } from "framer-motion";

interface RecipeHeroProps {
  recipe: RecipeDetailResponse;
}

export const RecipeHero = ({ recipe }: RecipeHeroProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  return (
    <div className="w-full flex flex-col gap-8">
      
      {/* HERO IMAGE CARD */}
      <div className="relative w-full h-[300px] md:h-[450px] rounded-[2.5rem] bg-card overflow-hidden shadow-sm border border-border/50 group">
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

        <button 
          onClick={() => setSelectedImage(currentImage)}
          className="absolute top-6 right-6 z-20 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-md"
          title="Büyüt"
        >
          <Maximize2 className="w-5 h-5" />
        </button>

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

      {/* TITLE */}
      <div className="flex flex-col px-2 md:px-4 mt-2">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.1]">
          {recipe.title}
        </h1>
      </div>

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
