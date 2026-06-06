import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Check, Loader2, ChefHat } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import type { RecipeDetailResponse } from "@/entities/recipe/api/recipeApi";

interface CookingAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: RecipeDetailResponse;
}

export const CookingAssistantModal = ({ isOpen, onClose, recipe }: CookingAssistantModalProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();

  const steps = [...recipe.steps].sort((a, b) => a.stepNumber - b.stepNumber);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const finishCookingMutation = useMutation({
    mutationFn: () => recipeApi.startCooking(recipe.id),
    onSuccess: () => {
      setIsSuccess(true);
      // Invalidate inventory/pantry queries assuming they exist, and recipe detail
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["recipe-detail", recipe.id] });
      
      // Auto close after 3 seconds on success
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    finishCookingMutation.mutate();
  };

  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const currentStep = steps[currentStepIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!finishCookingMutation.isPending && !isSuccess ? onClose : undefined}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white dark:bg-[#111111] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-muted/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg leading-tight">Pişirme Asistanı</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{recipe.title}</p>
              </div>
            </div>
            {!isSuccess && (
              <button 
                onClick={onClose}
                disabled={finishCookingMutation.isPending}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {!isSuccess && (
            <div className="w-full h-1.5 bg-muted/30">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-8 md:p-12 flex flex-col items-center justify-center min-h-[300px]">
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-6"
              >
                <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <Check className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-4xl font-black text-foreground">Afiyet Olsun!</h2>
                <p className="text-xl text-muted-foreground max-w-md">
                  Tarifi başarıyla tamamladın. Gerekli malzemeler stoklarından düşüldü.
                </p>
              </motion.div>
            ) : steps.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-3xl flex flex-col items-center text-center"
                >
                  <span className="text-primary font-black text-2xl mb-6 bg-primary/10 px-6 py-2 rounded-full">
                    Adım {currentStep.stepNumber} / {steps.length}
                  </span>
                  <p className="text-2xl md:text-4xl font-medium text-foreground leading-relaxed">
                    {currentStep.instruction}
                  </p>
                </motion.div>
              </AnimatePresence>
            ) : (
              <p className="text-muted-foreground">Bu tarif için adım bulunamadı.</p>
            )}
          </div>

          {/* Footer Controls */}
          {!isSuccess && steps.length > 0 && (
            <div className="p-6 md:p-8 border-t border-muted/20 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/50">
              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0 || finishCookingMutation.isPending}
                className="px-6 py-3 rounded-2xl font-bold flex items-center gap-2 text-foreground bg-white dark:bg-neutral-800 border border-muted/30 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" /> Geri
              </button>

              {currentStepIndex < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 rounded-2xl font-bold flex items-center gap-2 bg-foreground text-background hover:opacity-90 transition-opacity"
                >
                  İleri <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={finishCookingMutation.isPending}
                  className="px-8 py-3 rounded-2xl font-black flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {finishCookingMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5 stroke-[3]" />
                  )}
                  Pişirmeyi Tamamla
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
