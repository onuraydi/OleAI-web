import { Menu, Sparkles, Sun, Moon, Sunrise, Sunset, CloudMoon, LogOut, Settings, User, Bookmark } from "lucide-react";
import { useSessionStore } from "@/entities/session";
import { useUiStore } from "@/entities/ui";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { NotificationBell } from "@/widgets/notification";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface DashboardHeaderProps {
  // Empty for future use
}

// eslint-disable-next-line no-empty-pattern
export const DashboardHeader = ({}: DashboardHeaderProps = {}) => {
  const user = useSessionStore((state) => state.user);
  const logout = useSessionStore((state) => state.logout);
  const toggleMobileSidebar = useUiStore((state) => state.toggleMobileSidebar);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  const [greeting, setGreeting] = useState("Merhaba");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [GreetingIcon, setGreetingIcon] = useState<any>(Sun);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGreeting("Günaydın");
      setGreetingIcon(() => Sunrise);
    } else if (hour >= 12 && hour < 18) {
      setGreeting("İyi Günler");
      setGreetingIcon(() => Sun);
    } else if (hour >= 18 && hour < 22) {
      setGreeting("İyi Akşamlar");
      setGreetingIcon(() => Sunset);
    } else {
      setGreeting("İyi Geceler");
      setGreetingIcon(() => CloudMoon);
    }
  }, []);

  const displayName = user?.username || user?.email?.split('@')[0] || "Şef";

  return (
    <header className="h-20 lg:h-24 px-4 lg:px-8 flex items-center justify-between bg-white/50 dark:bg-neutral-950/50 backdrop-blur-xl border-b border-muted/30 sticky top-0 z-40 transition-colors duration-500">
      
      {/* Mobile Left Section */}
      <div className="flex lg:hidden items-center gap-3">
        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMobileSidebar}
          className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center transition-transform active:scale-95"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Mobile Logo Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Desktop Time-based Greeting */}
      <div className="flex-1 hidden lg:flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <GreetingIcon className="w-5 h-5" />
        </div>
        <p className="text-base font-bold text-muted-foreground tracking-wide">
          {greeting}, <span className="text-foreground">{displayName}</span>
        </p>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* AI Magic Button */}
        <Link 
          to="/ai-recommendations"
          className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-bold text-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>Bana Tarif Öner</span>
        </Link>

        {/* Theme Switcher */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-10 h-10 rounded-xl bg-card border border-muted/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <NotificationBell />

        <div className="hidden sm:block h-10 w-[1px] bg-muted/30 mx-1" />

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 outline-none">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-foreground leading-none">
                  {user?.username || user?.email?.split('@')[0] || "Şef"}
                </p>
              </div>
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profil" 
                  className="w-10 h-10 rounded-xl object-cover border-2 border-primary/20 shadow-lg shadow-primary/5 hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-black shadow-lg shadow-primary/5 hover:scale-105 transition-transform">
                  {(user?.username?.[0] || user?.email?.[0] || "Ş").toUpperCase()}
                </div>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl">
              <DropdownMenuLabel className="font-bold">Hesabım</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer rounded-xl font-medium py-2">
                <User className="w-4 h-4 mr-2" />
                Profilim
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/recipes")} className="cursor-pointer rounded-xl font-medium py-2">
                <Bookmark className="w-4 h-4 mr-2" />
                Tariflerim
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/profile", { state: { activeTab: 'account' } })} className="cursor-pointer rounded-xl font-medium py-2">
                <Settings className="w-4 h-4 mr-2" />
                Ayarlar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer rounded-xl font-bold py-2 text-rose-500 hover:text-rose-600 focus:text-rose-600 focus:bg-rose-500/10 transition-colors">
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
