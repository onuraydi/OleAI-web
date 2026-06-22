import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Sparkles, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recipeApi } from '@/entities/recipe/api/recipeApi';
import { toast } from 'sonner';
import { useAiModerationStore } from '../model/aiModerationStore';

interface AiModerationPanelProps {
  recipeId: string;
  originalDescription: string;
  originalSteps: { stepNumber: number; instruction: string }[];
  llmReviewResultJson?: string;
  status: number;
  updatedDate?: string | null;
  onApplyToForm?: () => void;
}

interface LlmCorrection {
  isApproved: boolean;
  isToxic: boolean;
  correctedDescription: string | null;
  correctedSteps: string[] | null;
  rejectionReason: string | null;
}


// eslint-disable-next-line unused-imports/no-unused-vars
export function AiModerationPanel({ recipeId, originalDescription, originalSteps, llmReviewResultJson, status, updatedDate, onApplyToForm }: AiModerationPanelProps) {
  const queryClient = useQueryClient();
  
  const setAnalyzing = useAiModerationStore(state => state.setAnalyzing);
  const clearAnalyzing = useAiModerationStore(state => state.clearAnalyzing);
  const isAnalyzingGlobally = !!useAiModerationStore(state => state.analyzingRecipes[recipeId]);

  React.useEffect(() => {
    if (!isAnalyzingGlobally) return;

    // Her 5 saniyede bir recipe datasını invalidate et (arka planda poll yap)
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["recipe-detail", recipeId] });
    }, 5000);

    return () => clearInterval(interval);
  }, [isAnalyzingGlobally, recipeId, queryClient]);

  const initialUpdatedDateStore = useAiModerationStore(state => state.analyzingRecipes[recipeId]);

  React.useEffect(() => {
    if (!initialUpdatedDateStore) return;
    
    // Eğer recipe.updatedDate, analiz başladığındaki updatedDate'den farklıysa işlem bitmiştir
    const currentUpdatedStr = updatedDate || "none";
    if (currentUpdatedStr !== initialUpdatedDateStore) {
      clearAnalyzing(recipeId);
    }
  }, [updatedDate, initialUpdatedDateStore, recipeId, clearAnalyzing]);

  const analyzeMutation = useMutation({
    mutationFn: () => recipeApi.analyzeWithAi(recipeId),
    onMutate: () => {
      setAnalyzing(recipeId, updatedDate || "none");
    },
    onSuccess: () => {
      toast.info("Analiz arka planda başlatıldı...");
      queryClient.invalidateQueries({ queryKey: ["recipe-detail", recipeId] });
    },
    onError: () => {
      toast.error("Yapay zeka analizi sırasında bir hata oluştu.");
      clearAnalyzing(recipeId);
    }
  });

  const isPending = analyzeMutation.isPending || isAnalyzingGlobally;

  const approveMutation = useMutation({
    mutationFn: () => recipeApi.approveRecipe(recipeId),
    onSuccess: () => {
      toast.success("Tarif onaylandı!");
      queryClient.invalidateQueries({ queryKey: ["recipe-detail", recipeId] });
    },
    onError: () => {
      toast.error("Onaylama sırasında bir hata oluştu.");
    }
  });

  let parsedResult: LlmCorrection | null = null;
  if (llmReviewResultJson) {
    try {
      parsedResult = JSON.parse(llmReviewResultJson) as LlmCorrection;
    } catch (e) {
      console.error("Failed to parse LLM result", e);
    }
  }

  const handleApplyToForm = () => {
    if (onApplyToForm) {
      onApplyToForm();
      toast.success("Yapay zeka önerilerini formu düzenleyerek inceleyebilirsiniz.");
    } else {
      approveMutation.mutate();
    }
  };

  // eslint-disable-next-line unused-imports/no-unused-vars
  const originalText = `Açıklama:\n${originalDescription}\n\nAdımlar:\n${originalSteps?.sort((a, b) => a.stepNumber - b.stepNumber).map(s => `${s.stepNumber}. ${s.instruction}`).join('\n')}`;

  if (!parsedResult) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">Yapay Zeka Analizi</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              İmla hatalarını düzeltmek ve zararlı içerik taraması yapmak için analizi başlatın.
            </p>
          </div>
        </div>
        <Button 
          onClick={() => analyzeMutation.mutate()} 
          disabled={isPending}
          className="gap-2 font-bold shrink-0 h-9"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Analiz Ediliyor...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Analiz Et</>
          )}
        </Button>
      </div>
    );
  }

  const resultStyles = parsedResult.isToxic 
    ? { glow: 'from-red-500/30 via-orange-500/20 to-red-500/30', bg: 'from-red-500/8 to-transparent', border: 'border-red-500/15' }
    : parsedResult.isApproved 
    ? { glow: 'from-primary/40 via-emerald-500/30 to-primary/40', bg: 'from-primary/8 via-emerald-500/5 to-transparent', border: 'border-primary/15' }
    : { glow: 'from-amber-500/30 via-orange-500/20 to-amber-500/30', bg: 'from-amber-500/8 to-transparent', border: 'border-amber-500/15' };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="relative group/panel"
    >
      {/* Gradient glow */}
      <div className={`absolute -inset-[1px] bg-gradient-to-r ${resultStyles.glow} rounded-2xl blur-[2px] opacity-50 group-hover/panel:opacity-80 transition-opacity duration-500`} />
      
      <div className={`relative bg-background/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl ${resultStyles.border} border overflow-hidden`}>
        <div className={`flex flex-col md:flex-row items-center justify-between p-4 gap-4 bg-gradient-to-r ${resultStyles.bg}`}>
          <div className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${
              parsedResult.isToxic ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20' : 
              parsedResult.isApproved ? 'bg-gradient-to-br from-primary/20 to-emerald-500/20' : 
              'bg-gradient-to-br from-amber-500/20 to-orange-500/20'
            }`}>
              {parsedResult.isToxic ? <AlertTriangle className="w-5 h-5 text-red-500" /> : 
               parsedResult.isApproved ? <CheckCircle2 className="w-5 h-5 text-primary" /> : 
               <XCircle className="w-5 h-5 text-amber-500" />}
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                AI Analiz Sonucu
              </h3>
              <p className="text-xs font-bold mt-0.5">
                {parsedResult.isToxic ? (
                  <span className="text-red-500">Zararlı İçerik Tespit Edildi: {parsedResult.rejectionReason}</span>
                ) : parsedResult.isApproved ? (
                  <span className="text-primary">Analiz tamamlandı — düzeltme önerileri formu düzenleyince görünecek.</span>
                ) : (
                  <span className="text-amber-500">Reddedildi: {parsedResult.rejectionReason}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button 
              variant="ghost" 
              onClick={() => analyzeMutation.mutate()} 
              disabled={isPending}
              className="text-muted-foreground hover:text-foreground text-xs font-bold h-9 rounded-xl"
            >
              {isPending ? (
                <><Loader2 className="w-3 h-3 animate-spin mr-2" /> Analiz Ediliyor...</>
              ) : (
                "Yeniden Analiz Et"
              )}
            </Button>
            
            {parsedResult.isApproved && onApplyToForm && (
              <Button 
                className="gap-2 bg-gradient-to-r from-primary to-emerald-600 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] text-white font-black text-xs h-9 rounded-xl transition-all duration-200"
                onClick={handleApplyToForm}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Önerileri İncele
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
