import { useState } from "react";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { PantryFeed } from "@/widgets/pantry-feed/ui/PantryFeed";

export default function PantryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <Sidebar />
      
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader 
          searchPlaceholder="Dolabındaki malzemelerde ara..."
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <div className="p-8 md:p-12 max-w-7xl mx-auto w-full">
          <PantryFeed externalSearchTerm={searchTerm} />
        </div>
      </main>
    </div>
  );
}
