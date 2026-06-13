import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ShoppingListItem as IShoppingListItem } from "@/entities/shopping-list/api/shoppingListApi";
import { ShoppingListItem } from "./ShoppingListItem";
import { MeasurementUnit } from "@/shared/constants/measurement";
import { getCategoryIcon } from "@/shared/lib/icon-helpers";

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

  const ITEMS_LIMIT = 8;
  const displayedItems = showAll ? items : items.slice(0, ITEMS_LIMIT);
  const hasMore = items.length > ITEMS_LIMIT;

  return (
    <div className="mb-10 last:mb-0">
      <div 
        className="flex items-center justify-between mb-6 border-b border-muted/30 pb-4 cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="text-primary">
            {getCategoryIcon(categoryName)}
          </div>
          <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
            {categoryName || "DİĞER"}
          </h2>
          <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        <div className="text-muted-foreground group-hover:text-primary transition-colors p-1 rounded-full group-hover:bg-primary/10">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedItems.map(item => (
                <ShoppingListItem 
                  key={item.id} 
                  item={item} 
                  categoryName={categoryName}
                  isSelected={selectedItemIds.includes(item.id)}
                  onToggleSelect={onToggleSelect}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-6 py-2 rounded-full border-2 border-primary/20 text-primary font-bold hover:bg-primary/10 transition-colors text-sm"
                >
                  {showAll ? "Daha Az Göster" : `Tüm ${items.length} Ürünü Göster`}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
