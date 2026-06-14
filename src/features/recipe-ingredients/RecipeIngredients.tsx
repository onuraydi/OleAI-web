import { useState } from "react";
import type { RecipeIngredientResponse } from "@/entities/recipe/api/recipeApi";
import type { SystemType } from "@/shared/lib/measurement-converter";
import { convertMeasurement } from "@/shared/lib/measurement-converter";
import { Check, Minus, Plus } from "lucide-react";
import { MeasurementUnit } from "@/shared/constants/measurement";

interface RecipeIngredientsProps {
  ingredients: RecipeIngredientResponse[];
}

export const RecipeIngredients = ({ ingredients }: RecipeIngredientsProps) => {
  const [system, setSystem] = useState<SystemType>('metric');
  const [servings, setServings] = useState(1);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheck = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const handleDecreaseServings = () => {
    if (servings > 1) setServings(s => s - 1);
  };

  const handleIncreaseServings = () => {
    setServings(s => s + 1);
  };

  return (
    <div className="w-full bg-card rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-border/50 mt-8 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-black text-foreground tracking-tight">Malzemeler</h2>
          
          {/* Servings Counter */}
          <div className="flex items-center bg-muted/40 rounded-2xl p-1.5 border border-muted/50">
            <button 
              onClick={handleDecreaseServings}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-background shadow-sm hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all disabled:opacity-50 disabled:hover:bg-background disabled:hover:text-muted-foreground"
              disabled={servings <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-black text-base">
              {servings}
            </span>
            <button 
              onClick={handleIncreaseServings}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-background shadow-sm hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Metric / Imperial Toggle */}
        <div className="flex bg-muted/40 p-1.5 rounded-2xl border border-muted/50">
          <button
            onClick={() => setSystem('metric')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              system === 'metric' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Metrik
          </button>
          <button
            onClick={() => setSystem('imperial')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              system === 'imperial' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            İngiliz
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ingredients.map((ing) => {
          const isChecked = checkedItems.has(ing.ingredientId);
          const converted = convertMeasurement(ing.amount * servings, ing.unitId as MeasurementUnit, system);
          
          return (
            <div 
              key={ing.ingredientId}
              onClick={() => toggleCheck(ing.ingredientId)}
              className={`flex items-center gap-5 cursor-pointer group p-4 rounded-2xl transition-all border ${
                isChecked 
                  ? 'bg-muted/20 border-transparent opacity-60' 
                  : 'bg-muted/10 border-transparent hover:bg-muted/30 hover:border-border/50'
              }`}
            >
              {/* Custom Checkbox */}
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 shadow-sm ${
                isChecked 
                  ? 'bg-primary border-primary' 
                  : 'border-muted-foreground/30 bg-background group-hover:border-primary/50'
              }`}>
                {isChecked && <Check className="w-4 h-4 text-primary-foreground stroke-[3]" />}
              </div>
              
              {/* Ingredient Text */}
              <div className={`text-lg transition-all ${isChecked ? 'line-through' : ''}`}>
                <span className="font-black text-foreground">
                  {converted.amount} {converted.unitLabel}
                </span>
                <span className="text-foreground/80 font-medium ml-2">
                  {ing.ingredientName}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
