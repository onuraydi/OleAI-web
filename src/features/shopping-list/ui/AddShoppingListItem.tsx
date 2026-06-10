import { useState, useRef, useEffect } from "react";
import { Plus, Search, Loader2, X, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { pantryApi } from "@/entities/pantry/api/pantryApi";
import { shoppingListApi } from "@/entities/shopping-list/api/shoppingListApi";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { MeasurementUnit, MEASUREMENT_UNIT_LABELS, MEASUREMENT_CATEGORY_UNITS, ALL_UNITS, MeasurementCategory } from "@/shared/constants/measurement";
import { AddIngredientModal } from "@/features/add-pantry-item/ui/AddIngredientModal";

interface SearchResult {
  masterIngredientId: string;
  displayName: string;
  categoryName: string;
  unitFamily: number;
}

export const AddShoppingListItem = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  // Selected Ingredient State
  const [selectedIngredient, setSelectedIngredient] = useState<SearchResult | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<MeasurementUnit>(MeasurementUnit.Piece);

  // Search Query
  const { data: searchResults, isFetching } = useQuery({
    queryKey: ["ingredients", "search", debouncedSearch],
    queryFn: () => pantryApi.searchIngredients(debouncedSearch),
    enabled: debouncedSearch.length >= 2 && !selectedIngredient,
  });

  // Add Item Mutation
  const addMutation = useMutation({
    mutationFn: (request: any) => shoppingListApi.addItem(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
      resetForm();
    }
  });

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setSelectedIngredient(result);
    setSearchTerm(result.displayName);
    const allowedUnits = result.unitFamily ? MEASUREMENT_CATEGORY_UNITS[result.unitFamily as MeasurementCategory] : ALL_UNITS;
    setUnit(allowedUnits ? allowedUnits[0] : MeasurementUnit.Piece);
    setIsFocused(false);
  };

  const resetForm = () => {
    setSelectedIngredient(null);
    setSearchTerm("");
    setQuantity(1);
    setUnit(MeasurementUnit.Piece);
    setIsFocused(false);
  };

  const handleAdd = () => {
    if (selectedIngredient && quantity > 0) {
      addMutation.mutate({
        ingredientId: selectedIngredient.masterIngredientId,
        quantity,
        unit
      });
    }
  };

  return (
    <div className="relative mt-8" ref={containerRef}>
      <div className={`flex items-center gap-3 p-2 rounded-2xl border-2 transition-all shadow-sm bg-card ${
        isFocused ? "border-primary" : "border-muted/30 hover:border-muted/50"
      }`}>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 text-muted-foreground ml-2 shrink-0">
          <Plus className="w-4 h-4" />
        </div>
        
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (selectedIngredient) setSelectedIngredient(null);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder="Listene yeni malzeme ekle..."
          className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 py-2"
          disabled={addMutation.isPending}
        />

        {selectedIngredient && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-muted rounded-xl text-sm outline-none focus:border-primary"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(Number(e.target.value) as MeasurementUnit)}
              className="px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-muted rounded-xl text-sm outline-none focus:border-primary max-w-[120px]"
            >
              {(selectedIngredient.unitFamily ? MEASUREMENT_CATEGORY_UNITS[selectedIngredient.unitFamily as MeasurementCategory] || ALL_UNITS : ALL_UNITS).map((u: MeasurementUnit) => (
                <option key={u} value={u}>{MEASUREMENT_UNIT_LABELS[u]}</option>
              ))}
            </select>
          </motion.div>
        )}

        {isFetching && !selectedIngredient && (
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin mr-2" />
        )}

        {selectedIngredient ? (
          <div className="flex gap-1 pr-1 shrink-0">
            <button 
              onClick={resetForm}
              className="p-2.5 text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
              disabled={addMutation.isPending}
            >
              <X className="w-5 h-5" />
            </button>
            <button 
              onClick={handleAdd}
              disabled={addMutation.isPending || quantity <= 0}
              className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ekle"}
            </button>
          </div>
        ) : (
          <button 
            className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl opacity-50 cursor-not-allowed mr-1 shrink-0"
            disabled
          >
            Ekle
          </button>
        )}
      </div>

      {/* Search Dropdown */}
      <AnimatePresence>
        {isFocused && debouncedSearch.length >= 2 && !selectedIngredient && searchResults && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl shadow-xl border border-muted/20 z-50 overflow-hidden max-h-60 overflow-y-auto"
          >
            {searchResults.length > 0 ? (
              searchResults.map((result: any) => (
                <button
                  key={result.masterIngredientId}
                  onClick={() => handleSelect(result)}
                  className="w-full text-left px-5 py-3 hover:bg-primary/5 transition-colors border-b border-muted/10 last:border-0 flex items-center justify-between group"
                >
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {result.displayName}
                  </span>
                  <span className="text-xs text-muted-foreground px-2 py-1 bg-muted/20 rounded-md">
                    {result.categoryName}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-5 py-4 text-sm text-muted-foreground text-center">
                <p className="mb-3 font-medium">Sistemde böyle bir malzeme bulunamadı.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-bold rounded-xl flex items-center justify-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Malzeme Talep Et</span>
                </button>
                <p className="text-xs text-muted-foreground mt-3 opacity-70 leading-relaxed max-w-[250px] mx-auto">
                  Talep ettiğiniz malzeme, yapay zeka tarafından onaylandıktan sonra dolabınıza eklenecektir.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AddIngredientModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        initialKeyword={searchTerm}
        isLoadingOverride={addMutation.isPending}
        onSubmitOverride={(request: any) => {
          addMutation.mutate({
            ingredientId: request.ingredientId,
            requestedName: request.requestedName,
            suggestedCategoryId: request.suggestedCategoryId,
            quantity: request.quantity,
            unit: request.unit
          });
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
};
