import { Leaf, Apple, Beef, Fish, Milk, Wheat, Flame, Coffee, Grape, Sparkles, Droplet } from "lucide-react";

export const getCategoryIcon = (identifier: string | null | undefined, fallbackName?: string | null, className: string = "w-5 h-5") => {
  const tryMatch = (str: string | null | undefined) => {
    if (!str || str.trim() === "") return null;
    const n = str.toLowerCase().trim();

    if (n === "grass") return <Leaf className={className} />;
    if (n === "set_meal") return <Beef className={className} />;
    if (n === "grain") return <Wheat className={className} />;
    if (n === "scatter_plot") return <Flame className={className} />;
    if (n === "water_drop") return <Milk className={className} />;
    if (n === "health_and_safety") return <Sparkles className={className} />;
    if (n === "oil_barrel") return <Droplet className={className} />;
    if (n === "phishing") return <Fish className={className} />;
    if (n === "local_cafe" || n === "coffee") return <Coffee className={className} />;
    if (n === "apple" || n === "nutrition") return <Apple className={className} />;
    if (n === "category" || n === "more_horiz") return <Sparkles className={className} />;
    
    // If the database assigned "fastfood" as the default, we should ignore it and try the fallback text match first
    if (n === "fastfood" && str === identifier && fallbackName) return null; 
    if (n === "fastfood") return <Grape className={className} />;

    if (n.includes("sebze") || n.includes("vegetable") || n.includes("meyve") || n.includes("fruit")) return <Leaf className={className} />;
    if (n.includes("et") || n.includes("tavuk") || n.includes("meat")) return <Beef className={className} />;
    if (n.includes("deniz") || n.includes("sea") || n.includes("balık")) return <Fish className={className} />;
    if (n.includes("süt") || n.includes("peynir") || n.includes("dairy") || n.includes("egg") || n.includes("yumurta")) return <Milk className={className} />;
    if (n.includes("tahıl") || n.includes("un") || n.includes("grain") || n.includes("bakliyat")) return <Wheat className={className} />;
    if (n.includes("baharat") || n.includes("spice") || n.includes("tuz")) return <Flame className={className} />;
    if (n.includes("içecek") || n.includes("beverage") || n.includes("su")) return <Coffee className={className} />;
    if (n.includes("atıştırmalık") || n.includes("snack") || n.includes("tatlı")) return <Grape className={className} />;
    if (n.includes("yağ") || n.includes("oil")) return <Droplet className={className} />;
    
    return null;
  };

  const primaryMatch = tryMatch(identifier);
  if (primaryMatch) return primaryMatch;

  if (fallbackName) {
    const fallbackMatch = tryMatch(fallbackName);
    if (fallbackMatch) return fallbackMatch;
  }
  
  return <Sparkles className={className} />;
};

export const getCategoryColorClass = (identifier: string | null | undefined) => {
  if (!identifier) return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  const n = identifier.toLowerCase();
  
  if (n.includes("sebze") || n === "grass" || n.includes("vegetable")) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (n.includes("meyve") || n === "apple" || n === "nutrition" || n.includes("fruit")) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (n.includes("et") || n.includes("tavuk") || n === "set_meal" || n.includes("meat")) return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
  if (n.includes("deniz") || n === "phishing" || n.includes("sea") || n.includes("balık")) return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
  if (n.includes("süt") || n === "water_drop" || n.includes("peynir") || n.includes("dairy")) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  if (n.includes("tahıl") || n === "grain" || n.includes("bakliyat")) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  if (n.includes("baharat") || n === "scatter_plot" || n.includes("spice")) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  if (n.includes("içecek") || n === "local_cafe" || n === "coffee" || n.includes("beverage")) return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
  if (n.includes("atıştırmalık") || n === "fastfood" || n.includes("snack")) return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  if (n.includes("yağ") || n === "oil_barrel" || n.includes("oil")) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
};

export const toPascalCase = (str: string) => {
  if (!str) return "";
  return str
    .split(/[-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
};
