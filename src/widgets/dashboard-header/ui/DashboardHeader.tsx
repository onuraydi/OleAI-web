import { Search, Bell, Menu } from "lucide-react";
import { useSessionStore } from "@/entities/session";

interface DashboardHeaderProps {
  searchPlaceholder?: string;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

export const DashboardHeader = ({ 
  searchPlaceholder = "Tarif, malzeme veya mutfak ara...",
  searchTerm,
  onSearchChange
}: DashboardHeaderProps) => {
  const user = useSessionStore((state) => state.user);

  return (
    <header className="h-24 px-8 flex items-center justify-between bg-white/50 dark:bg-neutral-950/50 backdrop-blur-xl border-b border-muted/30 sticky top-0 z-40 transition-colors duration-500">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            value={searchTerm !== undefined ? searchTerm : undefined}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-muted/30 dark:bg-neutral-900/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-neutral-900 outline-none transition-all font-medium text-sm"
          />
        </div>
      </div>


      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-muted/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all relative">
          <Bell className="w-5 h-5" />
          <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-neutral-900" />
        </button>

        <div className="h-10 w-[1px] bg-muted/30 mx-2" />

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-foreground leading-none mb-1">
              {user?.email?.split('@')[0] || "Şef Onur"}
            </p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Altın Üye</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-black shadow-lg shadow-primary/5">
            {user?.email?.[0]?.toUpperCase() || "O"}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className="lg:hidden w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
