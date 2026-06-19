import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, ChefHat, ShoppingCart, Package, Loader2 } from "lucide-react";
import type { IngredientResponse, RecipeIngredientResponse } from "@/entities/recipe/api/recipeApi";
import { MEASUREMENT_UNIT_LABELS, MeasurementUnit } from "@/shared/constants/measurement";
import { shoppingListApi } from "@/entities/shopping-list/api/shoppingListApi";
import { pantryApi } from "@/entities/pantry/api/pantryApi";
import { toast } from "sonner";

interface PreCookSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingIngredients: IngredientResponse[];
  recipeIngredients: RecipeIngredientResponse[];
  onContinue: (ignoredIngredientIds: string[]) => void;
}

type ActionType = 'ignore' | 'shopping' | 'pantry';

export const PreCookSyncModal = ({ isOpen, onClose, missingIngredients, recipeIngredients, onContinue }: PreCookSyncModalProps) => {
  const [actions, setActions] = useState<Record<string, ActionType>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleActionChange = (id: string, action: ActionType) => {
    setActions(prev => ({ ...prev, [id]: action }));
  };

  const handleQuantityChange = (id: string, val: string) => {
    setQuantities(prev => ({ ...prev, [id]: parseFloat(val) || 0 }));
  };

  const handleContinue = async () => {
    setIsSyncing(true);
    try {
      const shoppingListItems: any[] = [];
      const pantryItems: any[] = [];
      const ignoredIds: string[] = [];

      missingIngredients.forEach(item => {
        const action = actions[item.id] || 'ignore';
        const recipeIngredient = recipeIngredients.find(ri => ri.ingredientId === item.id);
        const quantity = quantities[item.id] !== undefined ? quantities[item.id] : (recipeIngredient?.amount || 1);
        
        if (action === 'ignore') {
          ignoredIds.push(item.id);
        } else if (action === 'shopping') {
          shoppingListItems.push({
            ingredientId: item.id,
            quantity: quantity,
            unit: recipeIngredient?.unitId || 1,
          });
          // Also ignore it so it doesn't crash the cooking deduction!
          ignoredIds.push(item.id);
        } else if (action === 'pantry') {
          pantryItems.push({
            ingredientId: item.id,
            quantity: quantity,
            unit: recipeIngredient?.unitId || 1,
          });
          // We DO NOT ignore it, because it is now in the pantry and should be deducted!
        }
      });

      if (shoppingListItems.length > 0) {
        await shoppingListApi.bulkAddItems({ items: shoppingListItems });
        toast.success(`${shoppingListItems.length} ürün alışveriş listesine eklendi.`);
      }
      
      if (pantryItems.length > 0) {
        await pantryApi.addMultipleIngredients({ ingredients: pantryItems });
        toast.success(`${pantryItems.length} ürün dolabınıza eklendi.`);
      }

      onContinue(ignoredIds);
    } catch (error) {
      toast.error("İşlem sırasında bir hata oluştu.");
      onContinue([]); // Proceed anyway if it fails
    } finally {
      setIsSyncing(false);
    }
  };

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
          className="relative w-full max-w-lg bg-card rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50 bg-amber-500/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-black text-foreground text-xl">Eksik Malzemeler</h3>
                <p className="text-sm text-muted-foreground font-medium">Dolabınızda bu ürünler bulunmuyor</p>
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
              Aşağıdaki malzemeler dijital dolabınızda bulunamadı. Lütfen eksik ürünler için bir aksiyon seçin:
            </p>

            <div className="space-y-3">
              {missingIngredients.map(item => {
                const recipeIngredient = recipeIngredients.find(ri => ri.ingredientId === item.id);
                const currentAction = actions[item.id] || 'ignore';
                const currentQuantity = quantities[item.id] !== undefined ? quantities[item.id] : (recipeIngredient?.amount || 1);
                
                const unitLabel = recipeIngredient ? MEASUREMENT_UNIT_LABELS[recipeIngredient.unitId as MeasurementUnit] || "birim" : "birim";
                const amountText = recipeIngredient ? `${recipeIngredient.amount} ${unitLabel}` : "Tarifte gerekli";

                return (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors gap-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground text-base">{item.name}</span>
                      
                      {currentAction !== 'ignore' ? (
                        <div className="flex items-center gap-2 mt-1.5">
                          <input 
                            type="number" 
                            min="0.1" 
                            step="0.1"
                            value={currentQuantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-16 px-2 py-1 text-xs font-bold bg-background border border-border rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-foreground"
                          />
                          <span className="text-xs text-muted-foreground font-medium">{unitLabel}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium mt-1">
                          {amountText}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleActionChange(item.id, 'ignore')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                          currentAction === 'ignore' 
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400' 
                            : 'bg-background hover:bg-muted text-foreground/70 border-transparent'
                        }`}
                        title="Sadece bu yemeğe kullanacağım, stoktan düşme"
                      >
                        <ChefHat className="w-3.5 h-3.5" /> Yoksay
                      </button>
                      <button
                        onClick={() => handleActionChange(item.id, 'shopping')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                          currentAction === 'shopping' 
                            ? 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400' 
                            : 'bg-background hover:bg-muted text-foreground/70 border-transparent'
                        }`}
                        title="Alışveriş listeme ekle"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Listeye Al
                      </button>
                      <button
                        onClick={() => handleActionChange(item.id, 'pantry')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                          currentAction === 'pantry' 
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400' 
                            : 'bg-background hover:bg-muted text-foreground/70 border-transparent'
                        }`}
                        title="Dijital dolabıma ekle"
                      >
                        <Package className="w-3.5 h-3.5" /> Dolaba Ekle
                      </button>
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
              İptal
            </button>
            <button
              onClick={handleContinue}
              disabled={isSyncing}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-70"
            >
              {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChefHat className="w-4 h-4" />}
              {isSyncing ? "İşleniyor..." : "Devam Et"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
