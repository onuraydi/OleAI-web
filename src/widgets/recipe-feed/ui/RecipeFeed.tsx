import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import { HeroCarousel } from "./HeroRecipeCard";
import { RecipeCard } from "@/widgets/recipe-card/ui/RecipeCard";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export const TrendingHero = () => {
  const { data: trendingData, isLoading: isTrendingLoading } = useQuery({
    queryKey: ["recipes", "daily_trend"],
    queryFn: () => recipeApi.getPublishedRecipes(0, 3, "", undefined, undefined, undefined, undefined, "daily_trend"),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm">Günün Popüler Tarifleri</h2>
        <p className="text-muted-foreground mt-2 text-lg">Topluluğumuzun bugün en çok sevdiği lezzetler</p>
      </div>
      {isTrendingLoading ? (
        <div className="w-full h-[400px] md:h-[500px] lg:h-[550px] rounded-[2.5rem] bg-muted animate-pulse" />
      ) : trendingData?.items && trendingData.items.length > 0 ? (
        <HeroCarousel recipes={trendingData.items} />
      ) : null}
    </div>
  );
};

export const RecipeFeed = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);

  const { data: categories } = useQuery({ 
    queryKey: ["categories"], 
    queryFn: recipeApi.getRecipeCategories,
    staleTime: 10 * 60 * 1000,
  });

  const { data: forYouData, isLoading: isForYouLoading, isFetching: isForYouFetching } = useQuery({
    queryKey: ["recipes", "forYou", page, size, selectedCategoryId],
    queryFn: () => recipeApi.getPublishedRecipes(page, size, "", selectedCategoryId, undefined, undefined, undefined, "newest", true),
  });

  return (
    <div className="pb-10">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm">Sana Özel Öneriler</h2>
          <p className="text-muted-foreground mt-2 text-lg">Sevdiğin lezzetler ve diyetine uygun en yeni tarifler</p>
        </div>

        {categories && categories.length > 0 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button 
              onClick={() => {
                setSelectedCategoryId(undefined);
                setPage(0);
              }}
              className={`snap-start shrink-0 px-6 py-2.5 rounded-full font-bold whitespace-nowrap shadow-sm transition-all border-2 ${
                selectedCategoryId === undefined 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-card text-muted-foreground border-transparent hover:bg-muted'
              }`}
            >
              Tümü
            </button>
            {categories.slice(0, 6).map((cat) => (
              <button 
                key={cat.id}
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  setPage(0);
                }}
                className={`snap-start shrink-0 px-6 py-2.5 rounded-full font-bold whitespace-nowrap shadow-sm transition-all border-2 ${
                  selectedCategoryId === cat.id 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-card text-muted-foreground border-transparent hover:bg-muted'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {isForYouLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
             {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[380px] bg-muted animate-pulse rounded-[2rem]" />
             ))}
           </div>
        ) : forYouData?.items && forYouData.items.length > 0 ? (
           <div className={`transition-opacity duration-300 ${isForYouFetching ? 'opacity-50' : 'opacity-100'}`}>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
               {forYouData.items.map((recipe, index) => (
                 <div key={recipe.id} className="h-[380px] w-full shrink-0">
                    <RecipeCard recipe={recipe} index={index} className="h-full w-full" />
                 </div>
               ))}
             </div>
             
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-muted/50 mt-12">
               <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                 <span>Göster:</span>
                 <select 
                   value={size}
                   onChange={(e) => {
                     setSize(Number(e.target.value));
                     setPage(0);
                   }}
                   className="bg-card border-2 border-transparent focus:border-primary rounded-xl px-2 py-1 outline-none transition-all shadow-sm cursor-pointer"
                 >
                   <option value={12}>12</option>
                   <option value={24}>24</option>
                   <option value={48}>48</option>
                 </select>
                 <span className="ml-2 border-l border-muted/50 pl-4">Toplam {forYouData.totalItems} tarif ({forYouData.totalPages} sayfa)</span>
               </div>

               {forYouData.totalPages > 0 && (
                 <div className="flex items-center gap-2">
                   <button 
                     onClick={() => setPage(p => Math.max(0, p - 1))}
                     disabled={!forYouData.hasPreviousPage || isForYouFetching}
                     className="p-2 rounded-xl bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
                   >
                     <ChevronLeft className="w-5 h-5" />
                   </button>
                   
                   <div className="flex items-center gap-2">
                     {[...Array(forYouData.totalPages)].map((_, i) => (
                       <button
                         key={i}
                         onClick={() => setPage(i)}
                         disabled={isForYouFetching}
                         className={`w-10 h-10 rounded-xl font-bold transition-colors shadow-sm disabled:cursor-not-allowed ${
                           page === i 
                             ? 'bg-primary text-primary-foreground' 
                             : 'bg-card text-muted-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800'
                         }`}
                       >
                         {i + 1}
                       </button>
                     ))}
                   </div>

                   <button 
                     onClick={() => setPage(p => Math.min(forYouData.totalPages - 1, p + 1))}
                     disabled={!forYouData.hasNextPage || isForYouFetching}
                     className="p-2 rounded-xl bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
                   >
                     <ChevronRight className="w-5 h-5" />
                   </button>
                 </div>
               )}
             </div>
           </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-[2rem] border border-border/50">
            <p className="text-xl font-medium text-muted-foreground">Şu an sana özel bir tarif bulamadık.</p>
          </div>
        )}
      </div>
    </div>
  );
};
