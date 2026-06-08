import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Refrigerator, 
  ChefHat, 
  ShoppingBag, 
  Settings, 
  LogOut,
  Sparkles,
  ChevronRight,
  LayoutDashboard,
  Database,
  Tags,
  ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";
import { useSessionStore } from "@/entities/session";

const menuItems = [
  { icon: Home, label: "Ana Sayfa", path: "/home" },
  { icon: ChefHat, label: "Keşfet", path: "/recipes" },
  { icon: Refrigerator, label: "Mutfak Dolabım", path: "/pantry" },
  { icon: ShoppingBag, label: "Alışveriş Listesi", path: "/shopping-list" },
  { icon: Settings, label: "Ayarlar", path: "/settings" },
];

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Database, label: "Malzemeler", path: "/admin/ingredients" },
  { icon: Tags, label: "Kategoriler", path: "/admin/categories" },
  { icon: ShieldAlert, label: "Alerjiler", path: "/admin/allergies" },
];

export const Sidebar = () => {
  const location = useLocation();
  const logout = useSessionStore((state) => state.logout);
  const userRole = useSessionStore((state) => state.user?.role);

  const renderMenuItem = (item: any) => {
    const isActive = location.pathname === item.path || 
                    (item.path !== '/' && item.path !== '/home' && location.pathname.startsWith(item.path));
                    
    return (
      <Link 
        key={item.path} 
        to={item.path}
        className="relative group block"
      >
        <div className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
          isActive 
            ? "bg-primary/10 text-primary" 
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        }`}>
          <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "group-hover:scale-110 transition-transform"}`} />
          <span className="font-bold">{item.label}</span>
          {isActive && (
            <motion.div 
              layoutId="active-pill"
              className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary"
            />
          )}
          {!isActive && (
            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          )}
        </div>
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white dark:bg-neutral-950 border-r border-muted/30 hidden lg:flex flex-col z-50 transition-colors duration-500">
      {/* Logo */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <span className="font-outfit font-black text-2xl tracking-tighter text-foreground">OleAI</span>
      </div>

      {/* Primary Action */}
      <div className="px-6 mb-4">
        <Link 
          to="/recipes/create"
          className="w-full bg-[#588157] hover:bg-[#3a5a39] text-white flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold shadow-lg shadow-[#588157]/20 transition-all hover:scale-105 active:scale-95 group"
        >
          <span className="text-xl leading-none group-hover:rotate-90 transition-transform duration-300">+</span> Yeni Tarif Ekle
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {menuItems.map(renderMenuItem)}
        
        {userRole === 'Admin' && (
          <div className="pt-4 pb-2">
            <div className="flex items-center gap-3 px-4 mb-3">
              <div className="h-px bg-muted flex-1"></div>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Admin</span>
              <div className="h-px bg-muted flex-1"></div>
            </div>
            {adminMenuItems.map(renderMenuItem)}
          </div>
        )}
      </nav>

      {/* Footer / Logout */}
      <div className="p-6 border-t border-muted/30">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-destructive hover:bg-destructive/5 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
};
