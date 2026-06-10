import { Check, Edit2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ShoppingListItem as IShoppingListItem } from "@/entities/shopping-list/api/shoppingListApi";
import { MEASUREMENT_UNIT_LABELS, MeasurementUnit, ALL_UNITS } from "@/shared/constants/measurement";

interface ShoppingListItemProps {
  item: IShoppingListItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, qty: number, unit: MeasurementUnit) => void;
}

export const ShoppingListItem = ({
  item,
  isSelected,
  onToggleSelect,
  onDelete,
  onUpdate
}: ShoppingListItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editQty, setEditQty] = useState(item.quantity);
  const [editUnit, setEditUnit] = useState<MeasurementUnit>(item.unit);

  const handleSave = () => {
    if (editQty > 0) {
      onUpdate(item.id, editQty, editUnit);
      setIsEditing(false);
    }
  };

  return (
    <div className="group flex items-center justify-between p-3 rounded-2xl border border-muted/30 bg-background hover:border-primary/50 transition-all shadow-sm">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button
          onClick={() => onToggleSelect(item.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
            isSelected
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground/30 hover:border-primary"
          }`}
        >
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Check className="w-4 h-4" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {isEditing ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="font-bold text-foreground flex-1 truncate" title={item.ingredientName}>{item.ingredientName}</span>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={editQty}
              onChange={(e) => setEditQty(Number(e.target.value))}
              className="w-14 sm:w-16 px-1.5 py-1 bg-background border border-muted rounded-md text-sm outline-none focus:border-primary flex-shrink-0"
            />
            <select
              value={editUnit}
              onChange={(e) => setEditUnit(Number(e.target.value) as MeasurementUnit)}
              className="w-20 sm:w-24 px-1 py-1 bg-background border border-muted rounded-md text-sm outline-none focus:border-primary truncate flex-shrink-0"
            >
              {ALL_UNITS.map(u => (
                <option key={u} value={u}>{MEASUREMENT_UNIT_LABELS[u]}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className={`font-bold transition-colors ${isSelected ? "text-muted-foreground line-through" : "text-foreground"}`}>
              {item.ingredientName}
            </span>
            <span className="px-2 py-0.5 bg-muted/50 text-muted-foreground text-xs font-bold rounded-md">
              {item.quantity} {MEASUREMENT_UNIT_LABELS[item.unit as MeasurementUnit]?.toLowerCase()}
            </span>
            {item.isPendingApproval && (
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 text-xs font-bold rounded-md flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                Oylamada
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => {
              setIsEditing(false);
              setEditQty(item.quantity);
              setEditUnit(item.unit);
            }} className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors">
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
