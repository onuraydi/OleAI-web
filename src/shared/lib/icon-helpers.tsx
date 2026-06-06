import { Leaf, Apple, Beef, Fish, Milk, Wheat, Flame, Coffee, Grape, Sparkles } from "lucide-react";

export const getCategoryIcon = (categoryName: string, className: string = "w-5 h-5") => {
  const n = categoryName.toLowerCase();
  if (n.includes("sebze") || n.includes("vegetable")) return <Leaf className={className} />;
  if (n.includes("meyve") || n.includes("fruit")) return <Apple className={className} />;
  if (n.includes("et") || n.includes("tavuk") || n.includes("meat")) return <Beef className={className} />;
  if (n.includes("deniz") || n.includes("sea")) return <Fish className={className} />;
  if (n.includes("süt") || n.includes("peynir") || n.includes("dairy") || n.includes("egg")) return <Milk className={className} />;
  if (n.includes("tahıl") || n.includes("un") || n.includes("grain")) return <Wheat className={className} />;
  if (n.includes("baharat") || n.includes("spice")) return <Flame className={className} />;
  if (n.includes("içecek") || n.includes("beverage")) return <Coffee className={className} />;
  if (n.includes("atıştırmalık") || n.includes("snack")) return <Grape className={className} />;
  return <Sparkles className={className} />;
};
