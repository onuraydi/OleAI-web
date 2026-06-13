import { Heart, Loader2, Sparkles, Clock, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import { useNavigate } from "react-router-dom";
import { RecipeCard } from "@/widgets/recipe-card";

export const RecipeFeed = () => {
  const navigate = useNavigate();
  const { data: recipeData, isLoading, isError } = useQuery({
    queryKey: ["recipes", "published"],
    queryFn: () => recipeApi.getPublishedRecipes(0, 6),
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
          <div className="h-6 w-24 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[4/3] rounded-[2.5rem] bg-muted animate-pulse" />
              <div className="h-6 w-3/4 bg-muted animate-pulse rounded-lg" />
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !recipeData?.items.length) {
    return (
      <div className="py-20 text-center space-y-4 bg-card rounded-[3rem] border-2 border-dashed border-muted/50">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto text-muted-foreground">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Henüz Tarif Bulunmuyor</h2>
        <p className="text-muted-foreground max-w-xs mx-auto">
          Yapay zeka asistanımız senin için yeni tarifler üzerinde çalışıyor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground">Sana Özel Öneriler</h2>
          <p className="text-muted-foreground font-medium">Mevcut malzemelerinle yapabileceğin en iyi tarifler</p>
        </div>
        <button onClick={() => navigate('/recipes')} className="text-primary font-bold hover:underline">Tümünü Gör</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {recipeData.items.map((recipe, index) => (
          <RecipeCard key={recipe.id} recipe={recipe} index={index} />
        ))}
      </div>
    </div>
  );
};
