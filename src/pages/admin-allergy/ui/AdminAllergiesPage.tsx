import { useState } from "react";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { AllergiesTable } from "@/widgets/admin-allergy";
import { CreateAllergyDialog } from "@/features/admin-allergy/ui/CreateAllergyDialog";
import { UpdateAllergyDialog } from "@/features/admin-allergy/ui/UpdateAllergyDialog";
import { useDeleteAllergy } from "@/entities/admin-allergy";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

export const AdminAllergiesPage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAllergy, setSelectedAllergy] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { mutate: deleteAllergy, isPending: isDeleting } = useDeleteAllergy();

  const handleEdit = (allergy: any) => {
    setSelectedAllergy(allergy);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (allergy: any) => {
    setSelectedAllergy(allergy);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedAllergy) return;
    deleteAllergy(selectedAllergy.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setTimeout(() => setSelectedAllergy(null), 300);
      },
      onError: () => {
        setIsDeleteOpen(false);
        setTimeout(() => setSelectedAllergy(null), 300);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <Sidebar />
      
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader searchPlaceholder="Alerji ara..." />
        
        <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Welcome Section */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 mb-2"
              >
                <div className="px-3 py-1 bg-primary/10 rounded-full text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert className="w-3 h-3" /> Alerji ve Kısıtlama Yönetimi
                </div>
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                Alerjiler ve <span className="text-primary">Kısıtlamalar</span>
              </h1>
              <p className="text-muted-foreground text-lg mt-2 font-medium">
                Kullanıcıların tarifleri süzerken seçebileceği alerjenleri ve diyet kısıtlamalarını yönetin.
              </p>
            </div>
            <div className="shrink-0 mb-2 flex items-center gap-3">
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md rounded-xl h-11 px-6">
                <ShieldAlert className="w-4 h-4" />
                Yeni Alerji Ekle
              </Button>
            </div>
          </section>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full"
          >
            <AllergiesTable onEdit={handleEdit} onDelete={handleDeleteClick} />
          </motion.div>
        </div>
      </main>

      {/* Modals */}
      <CreateAllergyDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      
      <UpdateAllergyDialog 
        allergyId={selectedAllergy?.id || null} 
        onClose={() => {
          setIsEditOpen(false);
          setTimeout(() => setSelectedAllergy(null), 300);
        }} 
      />
      
      <AlertDialog open={isDeleteOpen} onOpenChange={(open) => !open && !isDeleting && setIsDeleteOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alerjiyi Silmek İstediğinize Emin Misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-bold text-foreground">{selectedAllergy?.name}</span> adlı alerjiyi/kısıtlamayı sildiğinizde sistemden kalıcı olarak kaldırılacaktır.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={() => setTimeout(() => setSelectedAllergy(null), 300)}>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
