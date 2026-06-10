import { Bell, Menu, Sparkles, Sun, Moon, Sunrise, Sunset, CloudMoon } from "lucide-react";
import { useSessionStore } from "@/entities/session";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface DashboardHeaderProps {
  // Empty for future use
}

export const DashboardHeader = ({}: DashboardHeaderProps = {}) => {
  const user = useSessionStore((state) => state.user);
  const { theme, setTheme } = useTheme();
  
  const [greeting, setGreeting] = useState("Merhaba");
  const [GreetingIcon, setGreetingIcon] = useState<any>(Sun);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
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
    <header className="h-24 px-8 flex items-center justify-between bg-white/50 dark:bg-neutral-950/50 backdrop-blur-xl border-b border-muted/30 sticky top-0 z-40 transition-colors duration-500">
      {/* Time-based Greeting */}
      <div className="flex-1 hidden md:flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <GreetingIcon className="w-5 h-5" />
        </div>
        <p className="text-base font-bold text-muted-foreground tracking-wide">
          {greeting}, <span className="text-foreground">{displayName}</span>
        </p>
      </div>


      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* AI Magic Button */}
        <Link 
          to="/recipes/create"
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

        <button className="w-10 h-10 rounded-xl bg-card border border-muted/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all relative">
          <Bell className="w-5 h-5" />
          <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-neutral-900" />
        </button>

        <div className="h-10 w-[1px] bg-muted/30 mx-2" />

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-foreground leading-none">
              {user?.username || user?.email?.split('@')[0] || "Şef"}
            </p>
          </div>
          {user?.profileImageUrl ? (
            <img 
              src={user.profileImageUrl} 
              alt="Profil" 
              className="w-10 h-10 rounded-xl object-cover border-2 border-primary/20 shadow-lg shadow-primary/5"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-black shadow-lg shadow-primary/5">
              {(user?.username?.[0] || user?.email?.[0] || "Ş").toUpperCase()}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="lg:hidden w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
