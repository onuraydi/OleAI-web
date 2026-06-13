import { Check, Edit2, Trash2, X, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ShoppingListItem as IShoppingListItem } from "@/entities/shopping-list/api/shoppingListApi";
import { MEASUREMENT_UNIT_LABELS, MeasurementUnit, ALL_UNITS, UNIT_SHORT_LABELS, MeasurementCategory, MEASUREMENT_CATEGORY_UNITS } from "@/shared/constants/measurement";
import { getCategoryIcon } from "@/shared/lib/icon-helpers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";

interface ShoppingListItemProps {
  item: IShoppingListItem;
  categoryName: string;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, qty: number, unit: MeasurementUnit) => void;
}

export const ShoppingListItem = ({
  item,
  categoryName,
  isSelected,
  onToggleSelect,
  onDelete,
  onUpdate
}: ShoppingListItemProps) => {
  // Helper to safely parse string enums from API to numeric enum values
  const parseUnit = (u: any): MeasurementUnit => {
    if (typeof u === "number") return u;
    if (typeof u === "string") {
      const parsed = MeasurementUnit[u as keyof typeof MeasurementUnit];
      if (parsed !== undefined) return parsed as MeasurementUnit;
    }
    return MeasurementUnit.Other;
  };

  const itemUnitNum = parseUnit(item.unit);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editQty, setEditQty] = useState(item.quantity);
  const [editUnit, setEditUnit] = useState<MeasurementUnit>(itemUnitNum);

  const handleIncrease = () => setEditQty(q => q + 1);
  const handleDecrease = () => setEditQty(q => Math.max(0, q - 1));

  const handleUnitChange = (newUnit: MeasurementUnit) => {
    if (newUnit === editUnit) return;

    let newQty = editQty;
    if (editUnit === MeasurementUnit.Gram && newUnit === MeasurementUnit.Kilogram) {
      newQty = editQty / 1000;
    } else if (editUnit === MeasurementUnit.Kilogram && newUnit === MeasurementUnit.Gram) {
      newQty = editQty * 1000;
    } else if (editUnit === MeasurementUnit.Milliliter && newUnit === MeasurementUnit.Liter) {
      newQty = editQty / 1000;
    } else if (editUnit === MeasurementUnit.Liter && newUnit === MeasurementUnit.Milliliter) {
      newQty = editQty * 1000;
    }

    setEditUnit(newUnit);
    setEditQty(Number(newQty.toFixed(2))); // avoid float precision issues
  };

  const handleSave = () => {
    if (editQty <= 0) {
      onDelete(item.id);
    } else {
      onUpdate(item.id, editQty, editUnit);
    }
    setIsUpdateModalOpen(false);
  };

  // Determine allowed units based on original item unit
  const getCategoryForUnit = (u: MeasurementUnit | number | string) => {
    const numU = Number(u);
    for (const [catStr, units] of Object.entries(MEASUREMENT_CATEGORY_UNITS)) {
      if (units.includes(numU)) return Number(catStr) as MeasurementCategory;
    }
    return null;
  };
  const category = getCategoryForUnit(itemUnitNum);
  const allowedUnits = category ? MEASUREMENT_CATEGORY_UNITS[category] : ALL_UNITS;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`group relative flex items-center gap-4 bg-card rounded-[1.5rem] p-4 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border overflow-hidden ${
          isSelected ? "border-primary/50 opacity-60" : "border-muted/80 dark:border-white/10 hover:border-primary/50"
        }`}
      >
        {/* Select Checkbox on the left */}
        <button
          onClick={() => onToggleSelect(item.id)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 border-2 ${
            isSelected
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground/30 text-transparent hover:border-primary/50 hover:text-primary/50"
          }`}
        >
          <Check className="w-4 h-4" strokeWidth={isSelected ? 3 : 2} />
        </button>

        {/* Icon Background */}
        <div className="relative w-14 h-14 rounded-2xl flex-shrink-0 bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20 group-hover:bg-primary/15 transition-colors">
          <div className="text-primary z-10 group-hover:scale-110 transition-all duration-300">
            {getCategoryIcon(categoryName)}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-1">
          <h3 className={`font-bold text-sm mb-1 whitespace-normal transition-colors ${isSelected ? "text-muted-foreground line-through" : "text-foreground group-hover:text-primary"}`}>
            {item.ingredientName}
          </h3>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md w-fit whitespace-nowrap">
              {item.quantity} {UNIT_SHORT_LABELS[MeasurementUnit[itemUnitNum]] || UNIT_SHORT_LABELS[String(item.unit)] || itemUnitNum}
            </p>
            {item.isPendingApproval && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                Oylamada
              </span>
            )}
          </div>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end gap-2 pl-12 pr-4 bg-gradient-to-l from-white via-white to-transparent dark:from-[#18181b] dark:via-[#18181b] translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-20">
          <button 
            onClick={() => setIsUpdateModalOpen(true)}
            className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 shadow-sm"
            title="Miktarı Güncelle"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(item.id)}
            className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all hover:scale-110 shadow-sm"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Update Quantity Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{item.ingredientName} Miktarını Güncelle</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 gap-6">
            <div className="flex items-center gap-6">
              <button 
                onClick={handleDecrease}
                className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Minus className="w-6 h-6" />
              </button>
              
              <div className="flex flex-col items-center min-w-[100px]">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={editQty}
                  onChange={(e) => setEditQty(Number(e.target.value))}
                  className="w-28 bg-transparent text-center text-4xl font-black text-foreground outline-none border-b-2 border-transparent focus:border-primary/50 transition-colors pb-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              
              <button 
                onClick={handleIncrease}
                className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <div className="w-full max-w-[200px] space-y-2 mt-2">
              <label className="text-sm font-bold text-muted-foreground ml-1">Birim</label>
              <select
                value={editUnit}
                onChange={(e) => handleUnitChange(Number(e.target.value) as MeasurementUnit)}
                className="w-full h-12 px-4 rounded-xl border border-muted/50 bg-background font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                {allowedUnits.map(u => (
                  <option key={u} value={u}>{MEASUREMENT_UNIT_LABELS[u]}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="mt-2 gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsUpdateModalOpen(false)} className="rounded-xl h-12 font-bold">
              İptal
            </Button>
            <Button onClick={handleSave} className="rounded-xl h-12 font-bold">
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
