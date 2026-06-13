import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RecipeCard } from "@/widgets/recipe-card/ui/RecipeCard";
import type { RecipeListItem } from "@/entities/recipe/api/recipeApi";

interface RecipeCarouselProps {
  title: string;
  subtitle?: string;
  recipes: RecipeListItem[];
  isLoading: boolean;
}

export const RecipeCarousel = ({ title, subtitle, recipes, isLoading }: RecipeCarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.8; // Scroll 80% of the visible width
      scrollContainerRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 my-10">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[280px] h-[320px] bg-muted animate-pulse rounded-[2rem]" />
          ))}
        </div>
      </div>
    );
  }

  if (!recipes || recipes.length === 0) {
    return null; // Eğer tarif yoksa slider'ı gizle
  }

  return (
    <div className="flex flex-col gap-4 my-10 relative group/carousel">
      <div className="flex items-end justify-between px-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>

      <div className="relative">
        {/* Sol ok - Sadece hover'da görünür */}
        <button 
          onClick={() => scroll("left")}
          className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-md shadow-lg border border-border flex items-center justify-center z-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:scale-110 hidden md:flex"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Kaydırılabilir alan */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-8 pt-4 px-2 snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {recipes.map((recipe, index) => (
            <div key={recipe.id} className="snap-start shrink-0 w-[85vw] sm:w-[320px] md:w-[360px]">
              <RecipeCard recipe={recipe} index={index} className="h-full" />
            </div>
          ))}
        </div>

        {/* Sağ ok - Sadece hover'da görünür */}
        <button 
          onClick={() => scroll("right")}
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-md shadow-lg border border-border flex items-center justify-center z-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:scale-110 hidden md:flex"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
