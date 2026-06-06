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
        
        <div className="w-full flex-1 p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CreateRecipeForm />
          </motion.div>
        </div>
      </main>
    </div>
  );
};
