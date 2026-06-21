import type { RecipeDetailResponse } from "@/entities/recipe/api/recipeApi";
import { RecipeImageGallery } from "./RecipeImageGallery";

interface RecipeHeroProps {
  recipe: RecipeDetailResponse;
}

export const RecipeHero = ({ recipe }: RecipeHeroProps) => {
  return (
    <div className="w-full flex flex-col gap-8">
      
      {/* HERO IMAGE CARD */}
      <RecipeImageGallery 
        title={recipe.title}
        images={recipe.images}
        heightClass="h-[300px] md:h-[450px]"
      />

      {/* TITLE */}
      <div className="flex flex-col px-2 md:px-4 mt-2">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.1]">
          {recipe.title}
        </h1>
      </div>
    </div>
  );
};
