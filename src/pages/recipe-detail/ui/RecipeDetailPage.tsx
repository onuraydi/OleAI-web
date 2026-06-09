import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Loader2 } from "lucide-react";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import { RecipeHeader } from "@/widgets/recipe-header/RecipeHeader";
import { RecipeIngredients } from "@/features/recipe-ingredients/RecipeIngredients";
import { RecipeComments } from "@/features/recipe-comments/RecipeComments";
import { ApproveRecipeDialog, RejectRecipeDialog } from "@/features/admin-recipe";
import { useSessionStore } from "@/entities/session";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { motion } from "framer-motion";

export const RecipeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useSessionStore((state) => state.user);
  const isAdmin = user?.role === 'Admin';

  const { data: recipe, isLoading, isError } = useQuery({
    queryKey: ["recipe-detail", id],
    queryFn: () => recipeApi.getRecipeById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
        <Sidebar />
        <main className="lg:ml-72 min-h-screen flex flex-col">
          <DashboardHeader />
          <div className="flex flex-col items-center justify-center h-[50vh] flex-1">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground font-medium">Tarif detayları getiriliyor...</p>
          </div>
        </main>
      </div>
    );
  }

  if (isError || !recipe) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
        <Sidebar />
        <main className="lg:ml-72 min-h-screen flex flex-col">
          <DashboardHeader />
          <div className="flex flex-col items-center justify-center h-[50vh] flex-1 text-center px-4">
            <h2 className="text-3xl font-black text-foreground mb-4">Tarif Bulunamadı</h2>
            <p className="text-muted-foreground mb-8">Aradığınız tarifi maalesef bulamadık.</p>
            <button 
              onClick={() => navigate("/recipes")}
              className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
            >
              Tariflere Dön
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <Sidebar />
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader />
        
        <div className="w-full flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pt-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium">Geri</span>
                </button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Tarifler</span>
                  <span>/</span>
                  <span className="text-foreground font-bold truncate max-w-[200px] md:max-w-md">
                    {recipe.title}
                  </span>
                </div>
              </div>

              {/* Admin Actions */}
              {isAdmin && (recipe.status === 1 || recipe.status === 2) && (
                <div className="flex items-center gap-3">
                  <ApproveRecipeDialog recipeId={recipe.id} recipeTitle={recipe.title} />
                  <RejectRecipeDialog recipeId={recipe.id} recipeTitle={recipe.title} />
                </div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <RecipeHeader recipe={recipe} />
              
              {/* Ingredients Section */}
              <RecipeIngredients ingredients={recipe.ingredients} />

              {/* Steps Section */}
              {recipe.steps && recipe.steps.length > 0 && (
                <div className="w-full max-w-4xl mx-auto px-4 mt-16 mb-16">
                  <h2 className="text-3xl font-black text-foreground mb-8">Hazırlanışı</h2>
                  <div className="space-y-8">
                    {recipe.steps.sort((a, b) => a.stepNumber - b.stepNumber).map((step) => (
                      <div key={step.stepNumber} className="flex gap-6">
                        <div className="w-12 h-12 flex-shrink-0 bg-primary/10 text-primary rounded-full flex items-center justify-center font-black text-xl">
                          {step.stepNumber}
                        </div>
                        <p className="text-lg text-foreground/80 leading-relaxed pt-2">
                          {step.instruction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <RecipeComments 
                recipeId={recipe.id} 
                totalComments={recipe.statistics.totalComments} 
              />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};
