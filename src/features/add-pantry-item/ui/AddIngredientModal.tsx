import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, X, Loader2, Plus, CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { pantryApi } from "@/entities/pantry/api/pantryApi";
import type { IngredientSearchResultResponse, AddUserIngredientRequest } from "@/entities/pantry/api/pantryApi";
import { MeasurementCategory, MeasurementUnit, MEASUREMENT_UNIT_LABELS, MEASUREMENT_CATEGORY_UNITS, ALL_UNITS } from "@/shared/constants/measurement";
import { getCategoryIcon } from "@/shared/lib/icon-helpers";
interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKeyword?: string;
  onSubmitOverride?: (request: any) => void;
  isLoadingOverride?: boolean;
}

export const AddIngredientModal = ({ isOpen, onClose, initialKeyword = "", onSubmitOverride, isLoadingOverride }: AddIngredientModalProps) => {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [debouncedKeyword, setDebouncedKeyword] = useState(initialKeyword);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update keyword when modal opens with a new initialKeyword
  useEffect(() => {
    if (isOpen && initialKeyword) {
      setKeyword(initialKeyword);
    }
  }, [isOpen, initialKeyword]);

  // Form State
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientSearchResultResponse | null>(null);
  const [quantity, setQuantity] = useState<string>("1");
  const [unit, setUnit] = useState<MeasurementUnit>(MeasurementUnit.Piece);
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [suggestedCategoryId, setSuggestedCategoryId] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const { data: searchResults, isFetching } = useQuery({
    queryKey: ["search-ingredients", debouncedKeyword],
    queryFn: () => pantryApi.searchIngredients(debouncedKeyword),
    enabled: debouncedKeyword.length >= 2,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => pantryApi.getCategories(),
  });

  const addMutation = useMutation({
    mutationFn: (request: AddUserIngredientRequest) => pantryApi.addIngredient(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-pantry"] });
      handleClose();
    }
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: IngredientSearchResultResponse) => {
    setSelectedIngredient(item);
    setKeyword(item.displayName);
    setIsDropdownOpen(false);

    // Set default unit based on category
    const units = MEASUREMENT_CATEGORY_UNITS[item.unitFamily] || ALL_UNITS;
    setUnit(units[0]);
  };

  const handleCustomAdd = () => {
    if (!keyword.trim()) return;
    setSelectedIngredient(null);
    setIsDropdownOpen(false);
    setUnit(MeasurementUnit.Piece);
    setSuggestedCategoryId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || !quantity) return;

    const request: AddUserIngredientRequest = {
      quantity: parseFloat(quantity),
      unit: unit,
    };

    if (selectedIngredient) {
      request.ingredientId = selectedIngredient.masterIngredientId;
    } else {
      request.requestedName = keyword.trim();
      if (suggestedCategoryId) {
        request.suggestedCategoryId = suggestedCategoryId;
      }
    }

    if (expirationDate) {
      request.expirationDate = new Date(expirationDate).toISOString();
    }

    if (onSubmitOverride) {
      onSubmitOverride(request);
      return;
    }

    addMutation.mutate(request);
  };

  const handleClose = () => {
    setKeyword("");
    setSelectedIngredient(null);
    setQuantity("1");
    setUnit(MeasurementUnit.Piece);
    setExpirationDate("");
    setSuggestedCategoryId("");
    setIsDropdownOpen(false);
    addMutation.reset();
    onClose();
  };

  const availableUnits = selectedIngredient 
    ? (MEASUREMENT_CATEGORY_UNITS[selectedIngredient.unitFamily] || ALL_UNITS) 
    : ALL_UNITS;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-background border border-muted/30 shadow-2xl rounded-[2rem] overflow-hidden pointer-events-auto"
            >
              <div className="p-6 border-b border-muted/30 flex items-center justify-between bg-muted/10">
              <h2 className="text-2xl font-black text-foreground">Malzeme Ekle</h2>
              <button 
                onClick={handleClose}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted/50 text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Search Auto-complete */}
              <div className="space-y-2 relative" ref={dropdownRef}>
                <label className="text-sm font-bold text-foreground">Malzeme Adı</label>
                <div className="relative group">
                  {selectedIngredient ? (
                    getCategoryIcon(selectedIngredient.categoryName, "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary transition-colors")
                  ) : (
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  )}
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value);
                      setSelectedIngredient(null);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Elma, Un, Süt..."
                    className="w-full h-12 pl-12 pr-10 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-muted/50 focus:border-primary outline-none transition-all font-medium text-sm"
                  />
                  {isFetching && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
                  )}
                </div>

                {/* Dropdown */}
                <AnimatePresence>
                  {isDropdownOpen && keyword.length >= 2 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 w-full bg-white dark:bg-neutral-900 border border-muted/30 shadow-xl rounded-2xl z-10 overflow-hidden max-h-60 overflow-y-auto"
                    >
                      {searchResults && searchResults.length > 0 ? (
                        <ul>
                          {searchResults.map((item) => (
                            <li 
                              key={item.masterIngredientId}
                              onClick={() => handleSelect(item)}
                              className="px-4 py-3 hover:bg-muted/30 cursor-pointer flex items-center justify-between transition-colors border-b border-muted/10 last:border-0 group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                                  {getCategoryIcon(item.categoryName, "w-4 h-4")}
                                </div>
                                <div>
                                  <span className="font-bold text-foreground">{item.displayName}</span>
                                  {item.isAlias && <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">Alias</span>}
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground font-medium">{item.categoryName}</span>
                            </li>
                          ))}
                          <li 
                            onClick={handleCustomAdd}
                            className="px-4 py-3 bg-primary/5 hover:bg-primary/10 cursor-pointer flex items-center gap-2 transition-colors text-primary"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="font-bold text-sm">"{keyword}" olarak yeni malzeme ekle</span>
                          </li>
                        </ul>
                      ) : (
                        !isFetching && (
                          <div 
                            onClick={handleCustomAdd}
                            className="px-4 py-4 hover:bg-muted/30 cursor-pointer flex flex-col items-center justify-center text-center transition-colors"
                          >
                            <p className="text-sm text-muted-foreground mb-2">Sistemde bulunamadı.</p>
                            <div className="flex items-center gap-2 text-primary font-bold">
                              <Plus className="w-4 h-4" />
                              <span>"{keyword}" olarak ekle</span>
                            </div>
                          </div>
                        )
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Category Dropdown (Only for custom/new items) */}
              {!selectedIngredient && keyword.trim().length > 0 && (
                <div className="space-y-2 relative z-0">
                  <label className="text-sm font-bold text-foreground">Kategori <span className="text-muted-foreground font-normal">(Opsiyonel)</span></label>
                  <select
                    value={suggestedCategoryId}
                    onChange={(e) => setSuggestedCategoryId(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-muted/50 focus:border-primary outline-none transition-all font-medium text-sm appearance-none cursor-pointer"
                  >
                    <option value="">-- Kategori Seçiniz --</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity and Unit */}
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-bold text-foreground">Miktar</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full h-12 px-4 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-muted/50 focus:border-primary outline-none transition-all font-medium text-sm"
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-bold text-foreground">Birim</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(Number(e.target.value) as MeasurementUnit)}
                    disabled={!!selectedIngredient}
                    className="w-full h-12 px-4 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-muted/50 focus:border-primary outline-none transition-all font-medium text-sm appearance-none disabled:opacity-50 disabled:bg-muted/30 disabled:cursor-not-allowed"
                  >
                    {availableUnits.map((u) => (
                      <option key={u} value={u}>{MEASUREMENT_UNIT_LABELS[u]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Expiration Date */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Son Kullanma Tarihi <span className="text-muted-foreground font-normal">(Opsiyonel)</span></span>
                </label>
                <input
                  type="date"
                  value={expirationDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-muted/50 focus:border-primary outline-none transition-all font-medium text-sm"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoadingOverride ?? (addMutation.isPending || !keyword.trim() || !quantity)}
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {(isLoadingOverride ?? addMutation.isPending) ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Ekleniyor...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-6 h-6" />
                    <span>Listeye Ekle</span>
                  </>
                )}
              </button>
            </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
