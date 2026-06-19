import { ShieldAlert, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateAllergy } from "@/entities/admin-allergy";
import { toPascalCase } from "@/shared/lib/icon-helpers";
import { AllergyForm } from "@/widgets/admin-allergy/ui/AllergyForm";
import type { AllergyFormValues } from "@/widgets/admin-allergy/ui/AllergyForm";

interface CreateAllergyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAllergyDialog = ({ isOpen, onClose }: CreateAllergyDialogProps) => {
  const { mutate: createAllergy, isPending } = useCreateAllergy();

  const onSubmit = (data: AllergyFormValues) => {
    createAllergy(
      { ...data, iconName: toPascalCase(data.iconName) },
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
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px]" />
                <div className="absolute top-[50%] -left-[100px] w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-[60px]" />
              </div>
              <div className="relative p-6 pb-4 border-b border-white/10 dark:border-white/5">
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-inner"
                    >
                      <ShieldAlert className="w-6 h-6 text-primary drop-shadow-sm" />
                    </motion.div>
                    <div className="space-y-1.5">
                      <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Yeni Kısıtlama Profili
                      </DialogTitle>
                      <DialogDescription className="text-sm font-medium opacity-80 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Kullanıcıların diyetlerini yönetebileceği yeni bir alerji türü yaratın.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>
            </motion.div>

            <AllergyForm
              onSubmit={onSubmit}
              onCancel={onClose}
              isPending={isPending}
              submitLabel="Alerjiyi Oluştur"
            />
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
