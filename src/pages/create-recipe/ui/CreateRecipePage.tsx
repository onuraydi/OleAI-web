import { Footer } from '@/widgets/footer';
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { CreateRecipeForm } from "@/features/create-recipe/ui/CreateRecipeForm";
import { motion } from "framer-motion";

export const CreateRecipePage = () => {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <Sidebar />
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader />
        
        <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CreateRecipeForm />
          </motion.div>
        </div>
        <Footer />
      </main>
    </div>
  );
};
