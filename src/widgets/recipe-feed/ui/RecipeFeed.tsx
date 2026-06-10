import { Heart, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import { useNavigate } from "react-router-dom";

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
          <motion.div 
            key={recipe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(`/recipes/${recipe.id}`)}
            className="group cursor-pointer"
          >
            <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-4 shadow-xl shadow-black/5">
              <img 
                src={recipe.mainImageUrl || "https://images.unsplash.com/photo-1495195129352-aed325a55b65?q=80&w=1776&auto=format&fit=crop"} 
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              


              <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-all">
                <Heart className="w-5 h-5" />
              </button>


            </div>

            <div className="px-2">
              <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                {recipe.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-1 font-medium">{recipe.description}</p>
              
              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground mt-2">
                {recipe.prepTime > 0 || recipe.cookTime > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{recipe.prepTime + recipe.cookTime} dk</span>
                  </div>
                ) : null}

                {recipe.difficulty > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>{recipe.difficulty === 1 ? 'Kolay' : recipe.difficulty === 2 ? 'Orta' : 'Zor'}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
