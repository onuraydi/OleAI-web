import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Check } from "lucide-react";
import type { IngredientResponse } from "@/entities/recipe/api/recipeApi";
import { MeasurementUnit, MeasurementCategory, MEASUREMENT_UNIT_LABELS, MEASUREMENT_CATEGORY_UNITS } from "@/shared/constants/measurement";

export interface RestockItem {
  ingredientId: string;
  quantity: number;
  unit: number;
}

interface PostCookDepletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  depletedIngredients: IngredientResponse[];
  onSync: (items: RestockItem[]) => void;
  isSyncing: boolean;
}

export const PostCookDepletedModal = ({ isOpen, onClose, depletedIngredients, onSync, isSyncing }: PostCookDepletedModalProps) => {
  const [itemsData, setItemsData] = useState<Record<string, { selected: boolean; quantity: number | string; unit: number }>>({});

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, { selected: boolean; quantity: number; unit: number }> = {};
      depletedIngredients.forEach(item => {
        let defaultQuantity = 1;
        let defaultUnit = MeasurementUnit.Piece;
        
        let familyVal = item.unitFamily as unknown as number;
        if (typeof item.unitFamily === 'string') {
          familyVal = MeasurementCategory[item.unitFamily as keyof typeof MeasurementCategory] as number;
        }
        
        if (familyVal === MeasurementCategory.Weight) {
          defaultQuantity = 250;
          defaultUnit = MeasurementUnit.Gram;
        } else if (familyVal === MeasurementCategory.Volume) {
          defaultQuantity = 500;
          defaultUnit = MeasurementUnit.Milliliter;
        }

        initial[item.id] = {
          selected: true,
          quantity: defaultQuantity,
          unit: defaultUnit
        };
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItemsData(initial);
    }
  }, [isOpen, depletedIngredients]);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    setItemsData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        selected: !prev[id].selected
      }
    }));
  };

  const handleQuantityChange = (id: string, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      setItemsData(prev => ({
        ...prev,
        [id]: { ...prev[id], quantity: num }
      }));
    } else if (value === '') {
      setItemsData(prev => ({
        ...prev,
        [id]: { ...prev[id], quantity: '' }
      }));
    }
  };

  const handleUnitChange = (id: string, value: string) => {
    setItemsData(prev => ({
      ...prev,
      [id]: { ...prev[id], unit: parseInt(value, 10) }
    }));
  };

  const handleSync = () => {
    const itemsToSync: RestockItem[] = Object.entries(itemsData)
      .filter(([_, data]) => data.selected && typeof data.quantity === 'number' && data.quantity > 0)
      .map(([id, data]) => ({
        ingredientId: id,
        quantity: data.quantity as number,
        unit: data.unit
      }));
      
    onSync(itemsToSync);
  };
  
  const hasSelected = Object.values(itemsData).some(d => d.selected);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isSyncing ? onClose : undefined}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-card rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50 bg-emerald-500/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-black text-foreground text-xl">Biten Malzemeler</h3>
                <p className="text-sm text-muted-foreground font-medium">Alışveriş listenize ekleyelim mi?</p>
              </div>
            </div>
            {!isSyncing && (
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <p className="text-sm text-foreground/80 leading-relaxed mb-6">
              Bu tarifi pişirdikten sonra dolabınızdaki bazı malzemelerin stokları <strong className="text-foreground">sıfırlandı</strong>. Miktarlarını dilediğiniz gibi düzenleyerek alışveriş listenize ekleyebilirsiniz.
            </p>

            <div className="space-y-3">
              {depletedIngredients.map(item => {
                let familyVal = item.unitFamily as unknown as number;
                if (typeof item.unitFamily === 'string') {
                  familyVal = MeasurementCategory[item.unitFamily as keyof typeof MeasurementCategory] as number;
                }

                const data = itemsData[item.id] || { selected: false, quantity: 1, unit: MeasurementUnit.Piece };
                const availableUnits = MEASUREMENT_CATEGORY_UNITS[familyVal as MeasurementCategory] || [MeasurementUnit.Piece];

                return (
                  <div 
                    key={item.id} 
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border transition-all ${
                      data.selected 
                        ? 'bg-primary/5 border-primary/30' 
                        : 'bg-muted/30 border-border/50'
                    }`}
                  >
                    <div 
                      className="flex items-center gap-4 cursor-pointer flex-1"
                      onClick={() => handleToggle(item.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.currentTarget.click();
                        }
                      }}
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 ${
                        data.selected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background border-border'
                      }`}>
                        {data.selected && <Check className="w-4 h-4" />}
                      </div>
                      
                      <div className="flex flex-col">
                        <span className={`font-bold text-base transition-colors ${data.selected ? 'text-foreground' : 'text-foreground/70'}`}>
                          {item.name}
                        </span>
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 ${!data.selected ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input 
                        type="number" 
                        min="0"
                        step="any"
                        value={data.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        className="w-24 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-right font-medium"
                      />
                      <select
                        value={data.unit}
                        onChange={(e) => handleUnitChange(item.id, e.target.value)}
                        className="w-36 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                      >
                        {availableUnits.map((u: MeasurementUnit) => (
                          <option key={u} value={u}>{MEASUREMENT_UNIT_LABELS[u]}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isSyncing}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-background border border-border hover:bg-muted text-foreground transition-colors disabled:opacity-50"
            >
              Atla
            </button>
            <button
              onClick={handleSync}
              disabled={isSyncing || !hasSelected}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSyncing ? "Ekleniyor..." : "Listeye Ekle"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
