import { PencilLine, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateDiet, useAdminDietById } from "@/entities/admin-diet";
import { toPascalCase } from "@/shared/lib/icon-helpers";
import { DietForm } from "@/widgets/admin-diet/ui/DietForm";
import type { DietFormValues } from "@/widgets/admin-diet/ui/DietForm";

interface UpdateDietDialogProps {
  dietId: string | null;
  onClose: () => void;
}

export const UpdateDietDialog = ({ dietId, onClose }: UpdateDietDialogProps) => {
  const { data: diet, isLoading: isLoadingDiet } = useAdminDietById(dietId as string);
  const { mutate: updateDiet, isPending } = useUpdateDiet();

  const onSubmit = (data: DietFormValues) => {
    if (!dietId) return;
    updateDiet(
      {
        id: dietId,
        name: data.name,
        description: data.description || undefined,
        iconName: toPascalCase(data.iconName),
        isActive: data.isActive ?? true,
        excludedIngredientIds: data.excludedIngredientIds,
        excludedCategoryIds: data.excludedCategoryIds,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {!!dietId && (
        <Dialog open={!!dietId} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl bg-gradient-to-b from-background to-background/95 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px]" />
                <div className="absolute top-[50%] -left-[100px] w-[200px] h-[200px] bg-green-500/10 rounded-full blur-[60px]" />
              </div>

              <div className="relative p-6 pb-4 border-b border-white/10 dark:border-white/5">
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/20 shadow-inner"
                    >
                      <PencilLine className="w-6 h-6 text-emerald-600 drop-shadow-sm" />
                    </motion.div>
                    <div className="space-y-1.5">
                      <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Diyet Tercihini Düzenle
                      </DialogTitle>
                      <DialogDescription className="text-sm font-medium opacity-80 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        Seçili diyet tercihini ve dışladığı unsurları yapılandırın.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>
            </motion.div>

            {isLoadingDiet ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-muted-foreground font-medium animate-pulse">Profil Bilgileri Yükleniyor...</p>
              </div>
            ) : (
              <DietForm
                initialData={diet}
                isUpdateMode
                onSubmit={onSubmit}
                onCancel={onClose}
                isPending={isPending}
                submitLabel="Diyeti Güncelle"
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
