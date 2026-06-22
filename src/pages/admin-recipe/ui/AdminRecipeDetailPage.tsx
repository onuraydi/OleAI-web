/* eslint-disable @typescript-eslint/no-explicit-any */
import { Footer } from '@/widgets/footer';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { motion } from "framer-motion";
import { ArrowLeft, ChefHat, Clock, AlertCircle, CheckCircle2, XCircle, List, Heart, ThumbsDown, Bookmark, MessageSquare, Trash2, Edit, Maximize2, Tags, FolderOpen, Timer, Gauge } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recipeApi } from '@/entities/recipe/api/recipeApi';
import { ApproveRecipeDialog, RejectRecipeDialog, AiModerationPanel } from '@/features/admin-recipe';
import { AdminEditRecipeForm } from '@/features/admin-recipe/ui/AdminEditRecipeForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/shared/ui/alert-dialog";
import { toast } from 'sonner';

import { AnimatePresence } from 'framer-motion';

export function AdminRecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => recipeApi.deleteRecipe(id!),
    onSuccess: () => {
      toast.success("Tarif başarıyla silindi");
      queryClient.invalidateQueries({ queryKey: ["admin-recipes"] });
      navigate('/admin/recipes');
    },
    onError: () => {
      toast.error("Tarif silinirken bir hata oluştu");
    }
  });

  const { data: recipe, isLoading, isError } = useQuery({
    queryKey: ["recipe-detail", id],
    queryFn: () => recipeApi.getRecipeById(id!),
    enabled: !!id,
    retry: 1, // Minimize retries on 404
  });

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <Sidebar />
      
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader />
        
        <div className="flex-1 p-4 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/recipes')}
            className="gap-2 mb-4 hover:bg-white dark:hover:bg-neutral-900 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Tariflere Dön
          </Button>

          {isLoading ? (
            <div className="bg-card border border-muted/50 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-6 text-muted-foreground font-medium text-lg">Tarif detayları yükleniyor...</p>
            </div>
          ) : isError || !recipe ? (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-16 h-16 mb-6 text-destructive" />
              <h2 className="text-3xl font-black mb-2">Tarif Bulunamadı veya Erişim Reddedildi</h2>
              <p className="text-lg opacity-80 max-w-md mx-auto mb-6">
                Bu tarifi görüntüleme yetkiniz olmayabilir veya tarif silinmiş olabilir. Backend tarafında C# değişikliklerinin geçerli olması için projeyi yeniden derlediğinizden (yeniden başlattığınızdan) emin olun.
              </p>
              <Button variant="default" onClick={() => navigate('/admin/recipes')}>
                Yönetim Paneline Dön
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-muted/50 rounded-[2rem] overflow-hidden shadow-sm"
            >
              {/* Header section with actions */}
              <div className="p-6 md:p-8 border-b border-muted/50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-muted/5">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                      Detaylı İnceleme
                    </span>
                    {(recipe.status === 1 || recipe.status === 2) && ( // PendingLlmApproval or PendingAdminApproval
                      <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Onay Bekliyor
                      </span>
                    )}
                    {recipe.status === 3 && ( // Published
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Yayınlanmış
                      </span>
                    )}
                    {recipe.status === 4 && ( // Rejected
                      <span className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-full border border-red-200 dark:border-red-800 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        Reddedilmiş
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-foreground">{recipe.title}</h1>
                  <p className="text-muted-foreground mt-2 font-medium mb-4">
                    Yazar: <span className="text-foreground">{recipe.author?.username || 'Bilinmiyor'}</span> • {new Date(recipe.createdDate).toLocaleDateString('tr-TR')}
                  </p>

                  {/* Statistics */}
                  {recipe.statistics && (
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-xl font-bold text-sm border border-rose-100 dark:border-rose-900">
                        <Heart className="w-4 h-4" /> {recipe.statistics.totalLikes} Beğeni
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-xl font-bold text-sm border border-muted/30">
                        <ThumbsDown className="w-4 h-4" /> {recipe.statistics.totalDislikes}
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl font-bold text-sm border border-blue-100 dark:border-blue-900">
                        <Bookmark className="w-4 h-4" /> {recipe.statistics.totalSaves} Kaydetme
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl font-bold text-sm border border-amber-100 dark:border-amber-900">
                        <MessageSquare className="w-4 h-4" /> {recipe.statistics.totalComments} Yorum
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3 flex-wrap justify-end">
                  {(recipe.status === 1 || recipe.status === 2) && ( // PendingLlmApproval or PendingAdminApproval
                    <>
                      <ApproveRecipeDialog recipeId={recipe.id} recipeTitle={recipe.title} />
                      <RejectRecipeDialog recipeId={recipe.id} recipeTitle={recipe.title} />
                    </>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(!isEditing)}
                    className="gap-2 font-bold"
                  >
                    <Edit className="w-4 h-4" />
                    {isEditing ? "İncelemeye Dön" : "Tüm Tarifi Düzenle"}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2 font-bold">
                        <Trash2 className="w-4 h-4" />
                        Sil
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu işlem geri alınamaz. "{recipe.title}" tarifini tamamen silmek istediğinize emin misiniz?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteMutation.mutate()}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleteMutation.isPending ? "Siliniyor..." : "Evet, Sil"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* AI Moderation Panel - ALWAYS VISIBLE */}
              <div className="p-6 md:p-8 pt-6 border-b border-muted/20">
                <AiModerationPanel 
                  recipeId={recipe.id} 
                  originalDescription={recipe.description}
                  originalSteps={recipe.steps}
                  llmReviewResultJson={recipe.llmReviewResultJson}
                  status={recipe.status}
                  onApplyToForm={() => {
                    setIsEditing(true);
                  }}
                />
              </div>

              {!isEditing ? (
                <>
                  {/* Recipe Content */}
                  <div className="p-6 md:p-8 space-y-8">
                {/* Image Gallery & Description */}
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="w-full lg:w-1/2 space-y-4">
                    {/* Main Image */}
                    {recipe.images?.find((img: any) => img.isMain) && (
                      <div 
                        className="w-full rounded-2xl overflow-hidden aspect-video bg-muted/10 relative group cursor-zoom-in"
                         
                        onClick={() => setSelectedImage(recipe.images.find((img: any) => img.isMain)?.imageUrl || null)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.currentTarget.click();
                          }
                        }}
                      >
                        <img 
                           
                          src={recipe.images.find((img: any) => img.isMain)?.imageUrl} 
                          alt={recipe.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm z-10">
                          Kapak Fotoğrafı
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Maximize2 className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                        </div>
                      </div>
                    )}
                    
                    {/* Other Images */}
                    {recipe.images && recipe.images.length > 1 && (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {
                           
                          recipe.images.filter((img: any) => !img.isMain).map((img: any, i: number) => (
                            <div 
                              key={i} 
                              className="aspect-square rounded-xl overflow-hidden bg-muted/10 border border-muted/20 hover:border-primary/50 transition-colors group relative cursor-zoom-in"
                              onClick={() => setSelectedImage(img.imageUrl)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  e.currentTarget.click();
                                }
                              }}
                            >
                            <img src={img.imageUrl} alt={`Ek Fotoğraf ${i+1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <h3 className="text-xl font-bold border-b border-muted/50 pb-2">Açıklama</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {recipe.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-muted/20 mt-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><Timer className="w-3.5 h-3.5"/> Hazırlık</span>
                        <span className="font-bold text-foreground">{recipe.prepTime} Dk</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Pişirme</span>
                        <span className="font-bold text-foreground">{recipe.cookTime} Dk</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5"/> Zorluk</span>
                        <span className="font-bold text-foreground capitalize">{recipe.difficulty}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5"><ChefHat className="w-3.5 h-3.5"/> Porsiyon</span>
                        <span className="font-bold text-foreground">{recipe.servings}</span>
                      </div>
                    </div>

                    {(recipe.categories?.length > 0 || recipe.tags?.length > 0) && (
                      <div className="flex flex-col gap-3 pt-4">
                        {recipe.categories?.length > 0 && (
                          <div className="flex items-start gap-2">
                            <FolderOpen className="w-4 h-4 text-primary mt-0.5" />
                            <div className="flex flex-wrap gap-2">
                              {
                                 
                                recipe.categories.map((cat: any) => (
                                  <span key={cat.id} className="text-xs font-bold px-2.5 py-1 rounded-md bg-primary/10 text-primary">{cat.name}</span>
                                ))
                              }
                            </div>
                          </div>
                        )}
                        {recipe.tags?.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Tags className="w-4 h-4 text-primary mt-0.5" />
                            <div className="flex flex-wrap gap-2">
                              {
                                 
                                recipe.tags.map((tag: any) => (
                                  <span key={tag.id} className="text-xs font-bold px-2.5 py-1 rounded-md bg-secondary text-foreground border border-border">#{tag.name}</span>
                                ))
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ingredients & Steps */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Ingredients */}
                  <div className="bg-muted/5 p-6 rounded-2xl border border-muted/20">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <ChefHat className="w-5 h-5 text-primary" />
                      Malzemeler
                    </h3>
                    <ul className="space-y-3">
                      {
                         
                        recipe.ingredients?.map((ing: any, idx: number) => (
                          <li key={idx} className="flex justify-between items-center py-2 border-b border-muted/10 last:border-0">
                            <span className="font-medium">{ing.ingredientName}</span>
                            <span className="text-muted-foreground font-bold">
                              {ing.amount} birim
                            </span>
                          </li>
                        ))
                      }
                    </ul>
                  </div>

                  {/* Steps */}
                  <div className="bg-muted/5 p-6 rounded-2xl border border-muted/20">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <List className="w-5 h-5 text-primary" />
                      Adımlar
                    </h3>
                    <div className="space-y-4">
                      {
                         
                        recipe.steps?.sort((a: any, b: any) => a.stepNumber - b.stepNumber).map((step: any) => (
                          <div key={step.id} className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black flex-shrink-0">
                              {step.stepNumber}
                            </div>
                            <div className="flex-1 space-y-3">
                              <p className="text-muted-foreground pt-1">
                                {step.instruction}
                              </p>
                              {step.imageUrl && (
                                <div className="w-full max-w-sm rounded-xl overflow-hidden border border-muted/20">
                                  <img src={step.imageUrl} alt={`Adım ${step.stepNumber}`} className="w-full h-auto object-cover" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </div>
                </>
              ) : (
                <div className="p-6 md:p-8">
                  <AdminEditRecipeForm 
                    initialData={recipe} 
                    isReviewMode={recipe.status === 1 || recipe.status === 2} 
                    onCancel={() => setIsEditing(false)} 
                  />
                </div>
              )}
            </motion.div>
          )}
        </div>
        <Footer />
      </main>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 cursor-zoom-out backdrop-blur-sm"
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 p-2 rounded-full transition-colors"
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
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
