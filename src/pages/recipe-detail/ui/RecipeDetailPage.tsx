import { Footer } from '@/widgets/footer';
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronLeft, Loader2, Edit2, Trash2 } from "lucide-react";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import { RecipeHero } from "@/widgets/recipe-header/RecipeHero";
import { RecipeSidebar } from "@/widgets/recipe-header/RecipeSidebar";
import { RecipeIngredients } from "@/features/recipe-ingredients/RecipeIngredients";
import { RecipeComments } from "@/features/recipe-comments/RecipeComments";
import { ApproveRecipeDialog, RejectRecipeDialog } from "@/features/admin-recipe";
import { useSessionStore } from "@/entities/session";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";

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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => recipeApi.deleteRecipe(id!),
    onSuccess: () => {
      toast.success("Tarifiniz başarıyla silindi.");
      navigate("/recipes", { replace: true });
    },
    onError: () => {
      toast.error("Tarif silinirken bir hata oluştu.");
    }
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
          <Footer />
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
          <Footer />
      </main>
      </div>
    );
  }

  const isOwner = user?.id === recipe?.author?.userId;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <Sidebar />
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader />
        
        <div className="w-full flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 mb-8 pt-4">

              {/* Admin Actions */}
              {isAdmin && (recipe.status === 1 || recipe.status === 2) && (
                <div className="flex items-center gap-3">
                  <ApproveRecipeDialog recipeId={recipe.id} recipeTitle={recipe.title} />
                  <RejectRecipeDialog recipeId={recipe.id} recipeTitle={recipe.title} />
                </div>
              )}

              {/* Owner Actions */}
              {isOwner && (
                <div className="flex items-center gap-3 ml-auto">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl flex items-center gap-2 border-primary/20 hover:bg-primary/5 text-primary"
                    onClick={() => navigate(`/recipes/edit/${recipe.id}`)}
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Düzenle</span>
                  </Button>

                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-xl flex items-center gap-2 border-destructive/20 hover:bg-destructive/10 text-destructive">
                        <Trash2 className="w-4 h-4" />
                        <span>Sil</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl">
                      <DialogHeader>
                        <DialogTitle>Tarifi Sil</DialogTitle>
                        <DialogDescription>
                          <strong className="text-foreground">{recipe.title}</strong> isimli tarifinizi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-xl" disabled={deleteMutation.isPending}>
                          İptal
                        </Button>
                        <Button 
                          onClick={() => deleteMutation.mutate()} 
                          disabled={deleteMutation.isPending}
                          className="rounded-xl bg-destructive hover:bg-destructive/90 text-white"
                        >
                          {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Evet, Sil
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col lg:flex-row gap-8 items-start relative"
            >
              {/* Left Column (Main Content) */}
              <div className="w-full lg:flex-[2] lg:max-w-[calc(100%-350px)] xl:max-w-[calc(100%-400px)] flex flex-col min-w-0">
                <RecipeHero recipe={recipe} />
                
                {/* Ingredients Section */}
                <RecipeIngredients ingredients={recipe.ingredients} />

                {/* Steps Section */}
                {recipe.steps && recipe.steps.length > 0 && (
                  <div className="w-full bg-card rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-border/50 mb-8 mt-2">
                    <h2 className="text-3xl font-black text-foreground mb-10 tracking-tight">Hazırlanışı</h2>
                    <div className="space-y-6">
                      {recipe.steps.sort((a, b) => a.stepNumber - b.stepNumber).map((step) => (
                        <div key={step.stepNumber} className="flex flex-col md:flex-row gap-6 p-6 bg-muted/10 rounded-3xl border border-transparent hover:bg-muted/20 hover:border-border/50 transition-all group">
                          <div className="w-14 h-14 flex-shrink-0 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm group-hover:scale-110 transition-transform">
                            {step.stepNumber}
                          </div>
                          <p className="text-lg text-foreground/90 leading-relaxed pt-1 font-medium">
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
              </div>

              {/* Right Column (Sticky Sidebar) */}
              <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 sticky top-28 hidden lg:block">
                <RecipeSidebar recipe={recipe} />
              </div>
              
              {/* Mobile Sidebar (Shows at the bottom on mobile) */}
              <div className="w-full lg:hidden mt-8">
                <RecipeSidebar recipe={recipe} />
              </div>
            </motion.div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
};
