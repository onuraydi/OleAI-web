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
    <div className="w-full max-w-4xl mx-auto px-4 mt-8 mb-16">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-black text-foreground">Malzemeler</h2>
          
          {/* Servings Counter */}
          <div className="flex items-center bg-muted/20 rounded-2xl p-1 border border-muted/30">
            <button 
              onClick={handleDecreaseServings}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
              disabled={servings <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm">
              {servings}
            </span>
            <button 
              onClick={handleIncreaseServings}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Metric / Imperial Toggle */}
        <div className="flex bg-muted/30 p-1 rounded-full border border-muted/50">
          <button
            onClick={() => setSystem('metric')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              system === 'metric' 
                ? 'bg-white dark:bg-neutral-800 text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Metrik
          </button>
          <button
            onClick={() => setSystem('imperial')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              system === 'imperial' 
                ? 'bg-white dark:bg-neutral-800 text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            İngiliz
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
        {ingredients.map((ing) => {
          const isChecked = checkedItems.has(ing.ingredientId);
          // Convert measurement based on selected system and multiply by servings
          const converted = convertMeasurement(ing.amount * servings, ing.unitId as MeasurementUnit, system);
          
          return (
            <div 
              key={ing.ingredientId}
              onClick={() => toggleCheck(ing.ingredientId)}
              className="flex items-start gap-4 cursor-pointer group"
            >
              {/* Custom Checkbox */}
              <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                isChecked 
                  ? 'bg-primary border-primary' 
                  : 'border-muted-foreground/30 group-hover:border-primary/50'
              }`}>
                {isChecked && <Check className="w-4 h-4 text-primary-foreground stroke-[3]" />}
              </div>
              
              {/* Ingredient Text */}
              <div className={`text-lg transition-all ${isChecked ? 'opacity-50 line-through' : ''}`}>
                <span className="font-black text-foreground">
                  {converted.amount} {converted.unitLabel}
                </span>
                <span className="text-muted-foreground ml-2">
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
