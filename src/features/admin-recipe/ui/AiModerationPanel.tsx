import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Sparkles, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recipeApi } from '@/entities/recipe/api/recipeApi';
import { toast } from 'sonner';

interface AiModerationPanelProps {
  recipeId: string;
  originalDescription: string;
  originalSteps: { stepNumber: number; instruction: string }[];
  llmReviewResultJson?: string;
  status: number;
  onApplyToForm?: (description: string, steps: string[]) => void;
}

interface LlmCorrection {
  isApproved: boolean;
  isToxic: boolean;
  correctedDescription: string | null;
  correctedSteps: string[] | null;
  rejectionReason: string | null;
}


// eslint-disable-next-line unused-imports/no-unused-vars
export function AiModerationPanel({ recipeId, originalDescription, originalSteps, llmReviewResultJson, status, onApplyToForm }: AiModerationPanelProps) {
  const queryClient = useQueryClient();
  
  const analyzeMutation = useMutation({
    mutationFn: () => recipeApi.analyzeWithAi(recipeId),
    onSuccess: () => {
      toast.success("Yapay zeka analizi başarıyla tamamlandı.");
      queryClient.invalidateQueries({ queryKey: ["recipe-detail", recipeId] });
    },
    onError: () => {
      toast.error("Yapay zeka analizi sırasında bir hata oluştu.");
    }
  });

  const approveMutation = useMutation({
    mutationFn: () => recipeApi.approveRecipe(recipeId),
    onSuccess: () => {
      toast.success("Tarif onaylandı!");
      queryClient.invalidateQueries({ queryKey: ["recipe-detail", recipeId] });
      setIsEditMode(false);
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

  // eslint-disable-next-line unused-imports/no-unused-vars
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [editedDescription, setEditedDescription] = React.useState<string>("");
  const [editedSteps, setEditedSteps] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (parsedResult) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditedDescription(parsedResult.correctedDescription || "");
      setEditedSteps(parsedResult.correctedSteps || []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [llmReviewResultJson]);

  const handleApplyToForm = () => {
    if (onApplyToForm) {
      onApplyToForm(
        editedDescription,
        editedSteps
      );
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
          disabled={analyzeMutation.isPending}
          className="gap-2 font-bold shrink-0 h-9"
        >
          {analyzeMutation.isPending ? (
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
          disabled={analyzeMutation.isPending}
          className="text-muted-foreground hover:text-foreground text-xs font-bold h-9"
        >
          {analyzeMutation.isPending ? "Analiz Ediliyor..." : "Yeniden Analiz Et"}
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
