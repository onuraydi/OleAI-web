import { Leaf, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ShoppingListItem as IShoppingListItem } from "@/entities/shopping-list/api/shoppingListApi";
import { ShoppingListItem } from "./ShoppingListItem";
import { MeasurementUnit } from "@/shared/constants/measurement";

interface ShoppingListGroupProps {
  categoryName: string;
  items: IShoppingListItem[];
  selectedItemIds: string[];
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, qty: number, unit: MeasurementUnit) => void;
}

export const ShoppingListGroup = ({
  categoryName,
  items,
  selectedItemIds,
  onToggleSelect,
  onDelete,
  onUpdate
}: ShoppingListGroupProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);
  
  if (items.length === 0) return null;

  const ITEMS_LIMIT = 6;
  const displayedItems = showAll ? items : items.slice(0, ITEMS_LIMIT);
  const hasMore = items.length > ITEMS_LIMIT;

  return (
    <div className="mb-6 last:mb-0 bg-card border border-muted/30 rounded-[2rem] p-5 shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2 mb-2 group outline-none"
      >
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          <h3 className="text-xs font-black tracking-widest text-muted-foreground uppercase group-hover:text-foreground transition-colors">
            {categoryName || "DİĞER"} <span className="ml-1 text-primary/50 bg-primary/10 px-2 py-0.5 rounded-full">{items.length}</span>
          </h3>
        </div>
        <div className="text-muted-foreground group-hover:text-foreground transition-colors">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayedItems.map(item => (
                <ShoppingListItem 
                  key={item.id} 
                  item={item} 
                  isSelected={selectedItemIds.includes(item.id)}
                  onToggleSelect={onToggleSelect}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-full"
                >
                  {showAll ? "Daha Az Göster" : `Tümünü Gör (+${items.length - ITEMS_LIMIT})`}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
