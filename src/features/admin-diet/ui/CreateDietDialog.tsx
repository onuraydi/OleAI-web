import { Leaf, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateDiet } from "@/entities/admin-diet";
import { toPascalCase } from "@/shared/lib/icon-helpers";
import { DietForm } from "@/widgets/admin-diet/ui/DietForm";
import type { DietFormValues } from "@/widgets/admin-diet/ui/DietForm";

interface CreateDietDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateDietDialog = ({ isOpen, onClose }: CreateDietDialogProps) => {
  const { mutate: createDiet, isPending } = useCreateDiet();

  const onSubmit = (data: DietFormValues) => {
    createDiet(
      { ...data, iconName: toPascalCase(data.iconName), description: data.description ?? undefined },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl bg-gradient-to-b from-background to-background/95 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden"
            >
              {/* Premium Background Elements */}
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
                      <Leaf className="w-6 h-6 text-emerald-600 drop-shadow-sm" />
                    </motion.div>
                    <div className="space-y-1.5">
                      <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Yeni Diyet Tercihi
                      </DialogTitle>
                      <DialogDescription className="text-sm font-medium opacity-80 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Kullanıcıların beslenme tarzlarına özel yeni bir diyet profili oluşturun.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>
            </motion.div>
            
            <DietForm 
              onSubmit={onSubmit}
              onCancel={onClose}
              isPending={isPending}
              submitLabel="Diyeti Oluştur"
            />
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
