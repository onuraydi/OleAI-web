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

  return (
    <motion.div 
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row items-center justify-between p-4 gap-4 ${
        parsedResult.isToxic ? 'bg-destructive/10 border-destructive/20' : 
        parsedResult.isApproved ? 'bg-primary/5 border-primary/20' : 
        'bg-secondary/30 border-border'
      }`}
    >
      <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-full bg-background border shadow-sm shrink-0">
            {parsedResult.isToxic ? <AlertTriangle className="w-5 h-5 text-destructive" /> : 
             parsedResult.isApproved ? <CheckCircle2 className="w-5 h-5 text-primary" /> : 
             <XCircle className="w-5 h-5 text-muted-foreground" />}
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">Yapay Zeka Değerlendirmesi</h3>
            <p className="text-xs font-medium opacity-80 flex items-center gap-2 mt-0.5">
              {parsedResult.isToxic ? (
                <span className="text-destructive font-bold">Zararlı İçerik: {parsedResult.rejectionReason}</span>
              ) : parsedResult.isApproved ? (
                <span className="text-primary font-bold">Analiz Tamamlandı. İncelemek ve uygulamak için formu düzenleyin.</span>
              ) : (
                <span className="text-muted-foreground font-bold">Reddedildi: {parsedResult.rejectionReason}</span>
              )}
            </p>
          </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Button 
          variant="ghost" 
          onClick={() => analyzeMutation.mutate()} 
          disabled={isPending}
          className="text-muted-foreground hover:text-foreground text-xs font-bold h-9"
        >
          {isPending ? (
            <><Loader2 className="w-3 h-3 animate-spin mr-2" /> Analiz Ediliyor...</>
          ) : (
            "Yeniden Analiz Et"
          )}
        </Button>
        
        {parsedResult.isApproved && onApplyToForm && (
          <Button 
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 shadow-sm"
            onClick={handleApplyToForm}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Önerileri İncele
          </Button>
        )}
      </div>
    </motion.div>
  );
}
