import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface PremiumEntityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: React.ReactNode;
  icon: React.ReactNode;
  themeColor?: 'primary' | 'emerald';
  children: React.ReactNode;
}

export const PremiumEntityDialog = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  themeColor = 'primary',
  children
}: PremiumEntityDialogProps) => {
  const themeClasses = {
    emerald: {
      blurBg1: "bg-emerald-500/10",
      blurBg2: "bg-green-500/10",
      iconWrap: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
      iconColor: "text-emerald-600",
      descriptionIcon: "text-amber-500",
    },
    primary: {
      blurBg1: "bg-primary/10",
      blurBg2: "bg-primary/5",
      iconWrap: "from-primary/20 to-primary/5 border-primary/20",
      iconColor: "text-primary",
      descriptionIcon: "text-primary",
    }
  };

  const tc = themeClasses[themeColor];

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
                <div className={`absolute -top-[100px] -right-[100px] w-[300px] h-[300px] rounded-full blur-[80px] ${tc.blurBg1}`} />
                <div className={`absolute top-[50%] -left-[100px] w-[200px] h-[200px] rounded-full blur-[60px] ${tc.blurBg2}`} />
              </div>

              <div className="relative p-6 pb-4 border-b border-white/10 dark:border-white/5">
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center border shadow-inner ${tc.iconWrap}`}
                    >
                      <div className={`w-6 h-6 drop-shadow-sm flex items-center justify-center ${tc.iconColor}`}>
                        {icon}
                      </div>
                    </motion.div>
                    <div className="space-y-1.5">
                      <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        {title}
                      </DialogTitle>
                      <DialogDescription className="text-sm font-medium opacity-80 flex items-center gap-1.5">
                        {description}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>
            </motion.div>
            
            {children}
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
