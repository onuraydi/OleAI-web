import { useState } from "react";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { 
  IngredientsTable, 
  PendingRequests, 
  ResolvedRequests,
  AllAliasesTable
} from "@/widgets/admin-ingredient";
import { CreateIngredientDialog } from "@/features/admin-ingredient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { LayoutDashboard, AlertCircle, CheckSquare, Tags, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/shared/ui/input";
import { useDebounce } from "@/shared/hooks/useDebounce";

export const AdminIngredientsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <Sidebar />
      
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader />
        
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
                  <LayoutDashboard className="w-3 h-3" /> Malzeme Yönetimi
                </div>
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                Malzemeler <span className="text-primary">& İstekler</span>
              </h1>
              <p className="text-muted-foreground text-lg mt-2 font-medium">
                Sistemdeki malzemeleri, eş anlamlı kelimeleri ve AI destekli kullanıcı taleplerini yönetin.
              </p>
            </div>
            <div className="shrink-0 mb-2 flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Tabloda ara..." 
                  className="pl-9 w-64 rounded-xl border-muted/30 focus-visible:ring-primary/20 bg-card"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <CreateIngredientDialog />
            </div>
          </section>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Tabs defaultValue="ingredients" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-muted/30 p-1.5 rounded-[1.5rem] h-auto mb-8 gap-2">
                  <TabsTrigger value="ingredients" className="data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white data-[state=active]:shadow-md rounded-2xl py-3.5 flex gap-2 font-bold transition-all">
                    <LayoutDashboard className="w-5 h-5" /> Tüm Malzemeler
                  </TabsTrigger>
                  <TabsTrigger value="aliases" className="data-[state=active]:bg-[#2196F3] data-[state=active]:text-white data-[state=active]:shadow-md rounded-2xl py-3.5 flex gap-2 font-bold transition-all">
                    <Tags className="w-5 h-5" /> Tüm Alias'lar
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="data-[state=active]:bg-[#FF9800] data-[state=active]:text-white data-[state=active]:shadow-md rounded-2xl py-3.5 flex gap-2 font-bold transition-all">
                    <AlertCircle className="w-5 h-5" /> Bekleyen Talepler
                  </TabsTrigger>
                  <TabsTrigger value="resolved" className="data-[state=active]:bg-[#9C27B0] data-[state=active]:text-white data-[state=active]:shadow-md rounded-2xl py-3.5 flex gap-2 font-bold transition-all">
                    <CheckSquare className="w-5 h-5" /> İşlem Geçmişi
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ingredients" className="mt-0 focus-visible:outline-none">
                  <IngredientsTable searchTerm={debouncedSearchTerm} />
                </TabsContent>

                <TabsContent value="aliases" className="mt-0 focus-visible:outline-none">
                  <AllAliasesTable searchTerm={debouncedSearchTerm} />
                </TabsContent>

                <TabsContent value="pending" className="mt-0 focus-visible:outline-none">
                  <PendingRequests searchTerm={debouncedSearchTerm} />
                </TabsContent>

                <TabsContent value="resolved" className="mt-0 focus-visible:outline-none">
                  <ResolvedRequests searchTerm={debouncedSearchTerm} />
                </TabsContent>
              </Tabs>
            </motion.div>
        </div>
      </main>
    </div>
  );
};
