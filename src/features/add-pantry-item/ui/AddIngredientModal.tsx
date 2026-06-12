import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, X, Loader2, Plus, CalendarIcon, Trash2, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { pantryApi } from "@/entities/pantry/api/pantryApi";
import type { IngredientSearchResultResponse, AddUserIngredientRequest, AddMultipleUserIngredientsRequest } from "@/entities/pantry/api/pantryApi";
import { MeasurementCategory, MeasurementUnit, MEASUREMENT_UNIT_LABELS, MEASUREMENT_CATEGORY_UNITS, ALL_UNITS } from "@/shared/constants/measurement";
import { getCategoryIcon } from "@/shared/lib/icon-helpers";

interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKeyword?: string;
  onSubmitOverride?: (request: any) => void;
  isLoadingOverride?: boolean;
}

interface StagedItem {
  id: string; // temp id
  ingredient: IngredientSearchResultResponse | null;
  customName?: string;
  categoryId?: string;
  categoryName?: string;
  quantity: number;
  unit: MeasurementUnit;
  expirationDate?: string;
  estimatedShelfLifeInDays?: number;
}

export const AddIngredientModal = ({ isOpen, onClose, initialKeyword = "", onSubmitOverride, isLoadingOverride }: AddIngredientModalProps) => {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [debouncedKeyword, setDebouncedKeyword] = useState(initialKeyword);
  
  // Form State
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientSearchResultResponse | null>(null);
  const [quantity, setQuantity] = useState<string>("1");
  const [unit, setUnit] = useState<MeasurementUnit>(MeasurementUnit.Piece);
  type ExpirationMode = 'auto' | 'shelf-life' | 'exact-date';
  const [expirationMode, setExpirationMode] = useState<ExpirationMode>('auto');
  const [shelfLifeDays, setShelfLifeDays] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [suggestedCategoryId, setSuggestedCategoryId] = useState<string>("");
  
  // Staged Items State
  const [stagedItems, setStagedItems] = useState<StagedItem[]>([]);

  useEffect(() => {
    if (isOpen && initialKeyword) {
      setKeyword(initialKeyword);
    }
  }, [isOpen, initialKeyword]);

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

  const { data: popularCategories, isLoading: isPopularLoading } = useQuery({
    queryKey: ["popular-ingredients-by-category"],
    queryFn: () => pantryApi.getPopularByCategory(),
  });

  const addMultipleMutation = useMutation({
    mutationFn: (request: AddMultipleUserIngredientsRequest) => pantryApi.addMultipleIngredients(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-pantry"] });
      handleClose();
    }
  });

  const handleSelect = (item: IngredientSearchResultResponse) => {
    setSelectedIngredient(item);
    // API string enum döndürüyor ("Weight", "Volume"), bunu numeric enum'a çevirmeliyiz
    let categoryValue = item.unitFamily as unknown as number;
    if (typeof item.unitFamily === "string") {
      categoryValue = MeasurementCategory[item.unitFamily as keyof typeof MeasurementCategory] as number;
    }
    const units = MEASUREMENT_CATEGORY_UNITS[categoryValue as MeasurementCategory] || ALL_UNITS;
    setUnit(units[0]);

    // Update expiration mode based on default from admin
    if (item.defaultExpirationMode === 2) {
      setExpirationMode('shelf-life');
      setShelfLifeDays(item.estimatedShelfLifeInDays ? item.estimatedShelfLifeInDays.toString() : "");
    } else if (item.defaultExpirationMode === 3) {
      setExpirationMode('exact-date');
      setShelfLifeDays("");
    } else {
      setExpirationMode('auto');
      setShelfLifeDays("");
    }
  };

  const handleCustomAdd = () => {
    if (!keyword.trim()) return;
    setSelectedIngredient(null);
    setUnit(MeasurementUnit.Piece);
    setSuggestedCategoryId("");
  };

  const handleAddToList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() && !selectedIngredient) return;
    if (!quantity) return;

    let finalExpirationDate: string | undefined = undefined;
    if (expirationMode === 'exact-date' && expirationDate) {
      finalExpirationDate = expirationDate;
    } else if (expirationMode === 'shelf-life' && shelfLifeDays) {
      const days = parseInt(shelfLifeDays, 10);
      if (!isNaN(days)) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        finalExpirationDate = date.toISOString();
      }
    } else if (expirationMode === 'auto' && selectedIngredient?.estimatedShelfLifeInDays) {
      const date = new Date();
      date.setDate(date.getDate() + selectedIngredient.estimatedShelfLifeInDays);
      finalExpirationDate = date.toISOString();
    }

    const newItem: StagedItem = {
      id: Math.random().toString(36).substr(2, 9),
      ingredient: selectedIngredient,
      customName: selectedIngredient ? undefined : keyword.trim(),
      categoryId: selectedIngredient ? selectedIngredient.categoryId : (suggestedCategoryId || undefined),
      categoryName: selectedIngredient ? selectedIngredient.categoryName : (suggestedCategoryId ? categories?.find(c => c.id === suggestedCategoryId)?.name : undefined),
      quantity: parseFloat(quantity),
      unit: unit,
      expirationDate: finalExpirationDate,
      estimatedShelfLifeInDays: (!selectedIngredient && expirationMode === 'shelf-life' && shelfLifeDays) ? parseInt(shelfLifeDays, 10) : undefined,
    };

    setStagedItems([newItem, ...stagedItems]); // Prepend so newest is at top

    // Formu sıfırla ki yeni ürün eklenebilsin
    setKeyword("");
    setSelectedIngredient(null);
    setQuantity("1");
    setUnit(MeasurementUnit.Piece);
    setExpirationMode('auto');
    setShelfLifeDays("");
    setExpirationDate("");
    setSuggestedCategoryId("");
  };

  const handleRemoveFromList = (id: string) => {
    setStagedItems(stagedItems.filter(item => item.id !== id));
  };

  const handleSaveAll = () => {
    if (stagedItems.length === 0) return;

    const request: AddMultipleUserIngredientsRequest = {
      ingredients: stagedItems.map(item => {
        const req: AddUserIngredientRequest = {
          quantity: Number(item.quantity),
          unit: Number(item.unit),
          estimatedShelfLifeInDays: item.estimatedShelfLifeInDays
        };

        if (item.ingredient) {
          req.ingredientId = item.ingredient.masterIngredientId;
        } else {
          req.requestedName = item.customName;
          if (item.categoryId) {
            req.suggestedCategoryId = item.categoryId;
          }
        }

        if (item.expirationDate) {
          req.expirationDate = item.expirationDate ? new Date(item.expirationDate).toISOString() : undefined;
        }

        return req;
      })
    };

    if (onSubmitOverride) {
      onSubmitOverride(request);
      return;
    }

    addMultipleMutation.mutate(request);
  };

  const handleClose = () => {
    setKeyword("");
    setSelectedIngredient(null);
    setQuantity("1");
    setUnit(MeasurementUnit.Piece);
    setExpirationMode('auto');
    setShelfLifeDays("");
    setExpirationDate("");
    setSuggestedCategoryId("");
    setStagedItems([]);
    addMultipleMutation.reset();
    onClose();
  };

  let currentCategoryValue = selectedIngredient?.unitFamily as unknown as number;
  if (typeof currentCategoryValue === "string") {
    currentCategoryValue = MeasurementCategory[currentCategoryValue as keyof typeof MeasurementCategory] as number;
  }
  
  const availableUnits = selectedIngredient 
    ? (MEASUREMENT_CATEGORY_UNITS[currentCategoryValue as MeasurementCategory] || ALL_UNITS) 
    : ALL_UNITS;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-50"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-6xl h-[85vh] bg-background border border-muted/30 shadow-2xl rounded-3xl overflow-hidden pointer-events-auto flex flex-col"
            >
              {/* Modal Header */}
              <div className="h-16 px-6 border-b border-muted/30 flex items-center justify-between bg-muted/5 shrink-0">
                <div>
                  <h2 className="text-xl font-black text-foreground">Dolaba Malzeme Ekle</h2>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">Arayın, detaylandırın ve sepetinize atın.</p>
                </div>
                <button 
                  onClick={handleClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Split Screen Body */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                
                {/* LEFT PANEL: Search & Discovery */}
                <div className="w-full md:w-1/2 flex flex-col border-r border-muted/30 bg-background relative">
                  
                  {/* Search Header */}
                  <div className="p-6 shrink-0 border-b border-muted/10">
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => {
                          setKeyword(e.target.value);
                          if (selectedIngredient) setSelectedIngredient(null);
                        }}
                        placeholder="Elma, Un, Süt..."
                        className="w-full h-14 pl-12 pr-10 rounded-2xl bg-muted/20 border-2 border-muted/50 focus:border-primary focus:bg-background outline-none transition-all font-bold text-lg"
                      />
                      {isFetching && (
                        <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
                      )}
                      {keyword && (
                        <button 
                          onClick={() => { setKeyword(""); setSelectedIngredient(null); }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Left Content Scrollable */}
                  <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    {/* State 1: Typing & Searching */}
                    {keyword.length >= 2 ? (
                      <div className="space-y-2">
                        <h3 className="font-bold text-sm text-muted-foreground mb-4 px-2 uppercase tracking-wider">Arama Sonuçları</h3>
                        {searchResults && searchResults.length > 0 ? (
                          <ul className="space-y-2">
                            {searchResults.map((item) => {
                              const isCurrentlySelected = selectedIngredient?.masterIngredientId === item.masterIngredientId;
                              const isAlreadyInCart = stagedItems.some(s => s.ingredient?.masterIngredientId === item.masterIngredientId);
                              const isSelected = isCurrentlySelected || isAlreadyInCart;
                              return (
                                <li 
                                  key={item.masterIngredientId}
                                  onClick={() => handleSelect(item)}
                                  className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-all rounded-xl border ${
                                    isCurrentlySelected 
                                      ? 'bg-primary/10 border-primary shadow-sm' 
                                      : isAlreadyInCart
                                        ? 'bg-primary/5 border-primary/30 opacity-80'
                                        : 'hover:bg-muted/30 border-transparent hover:border-muted/30'
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                      isCurrentlySelected ? 'bg-primary text-primary-foreground' : isAlreadyInCart ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-primary'
                                    }`}>
                                      {isSelected ? <Check className="w-5 h-5" /> : getCategoryIcon(item.categoryName, "w-5 h-5")}
                                    </div>
                                    <div>
                                      <span className={`font-bold text-base ${isSelected ? 'text-primary' : 'text-foreground'}`}>{item.displayName}</span>
                                      {item.isAlias && <span className="ml-2 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase font-black">Alias</span>}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground font-medium px-3 py-1 bg-background/50 rounded-full">{item.categoryName}</span>
                                    <ArrowRight className={`w-4 h-4 transition-all ${isCurrentlySelected ? 'text-primary opacity-100 translate-x-0' : 'text-muted-foreground opacity-0 -translate-x-2'}`} />
                                  </div>
                                </li>
                              )
                            })}
                            <li 
                              onClick={handleCustomAdd}
                              className={`px-4 py-4 cursor-pointer flex items-center gap-3 transition-colors rounded-xl mt-4 border ${
                                !selectedIngredient && keyword.length >= 2 && searchResults.length === 0
                                  ? 'bg-primary/10 border-primary text-primary'
                                  : 'bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary'
                              }`}
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <Plus className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-base block">Sistemde Bulunamadı</span>
                                <span className="font-medium text-sm opacity-80">"{keyword}" olarak yeni malzeme ekle</span>
                              </div>
                            </li>
                          </ul>
                        ) : (
                          !isFetching && (
                            <div 
                              onClick={handleCustomAdd}
                              className="p-8 border-2 border-dashed border-primary/30 rounded-2xl bg-primary/5 hover:bg-primary/10 cursor-pointer flex flex-col items-center justify-center text-center transition-colors group"
                            >
                              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                                <Plus className="w-6 h-6" />
                              </div>
                              <p className="font-black text-lg text-primary mb-1">"{keyword}" Bulunamadı</p>
                              <p className="text-sm text-primary/80 font-medium">Bunu özel malzeme olarak dolabınıza ekleyebilirsiniz.</p>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      /* State 2: Popular Categories (Default) */
                      <div className="space-y-8">
                        {isPopularLoading ? (
                          <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          </div>
                        ) : (
                          popularCategories?.map((category) => (
                            <div key={category.categoryId} className="space-y-4">
                              <h3 className="font-black text-foreground flex items-center gap-3 text-lg border-b border-muted/20 pb-2">
                                <span className="w-10 h-10 rounded-full bg-muted/50 text-primary flex items-center justify-center">
                                  {getCategoryIcon(category.categoryName, "w-5 h-5")}
                                </span>
                                {category.categoryName}
                              </h3>
                              <div className="flex flex-wrap gap-2.5">
                                {category.ingredients.map((item) => {
                                  const isCurrentlySelected = selectedIngredient?.masterIngredientId === item.masterIngredientId;
                                  const isAlreadyInCart = stagedItems.some(s => s.ingredient?.masterIngredientId === item.masterIngredientId);
                                  const isSelected = isCurrentlySelected || isAlreadyInCart;
                                  return (
                                    <button
                                      key={item.masterIngredientId}
                                      type="button"
                                      onClick={() => handleSelect(item)}
                                      className={`px-4 py-2.5 rounded-2xl font-bold text-sm transition-all border shadow-sm ${
                                        isCurrentlySelected
                                          ? 'bg-primary text-primary-foreground border-primary scale-105 shadow-primary/20'
                                          : isAlreadyInCart
                                            ? 'bg-primary/20 text-primary border-primary/40 opacity-90'
                                            : 'bg-secondary dark:bg-secondary/80 hover:bg-primary/20 text-secondary-foreground border-border hover:border-primary/50'
                                      }`}
                                    >
                                      {isSelected && <Check className="w-4 h-4 inline-block mr-1.5 -ml-1" />}
                                      {item.displayName}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT PANEL: Form & Cart */}
                <div className="w-full md:w-1/2 flex flex-col bg-muted/5 relative">
                  
                  {/* Current Item Action Form (Top Half) */}
                  <div className="p-6 shrink-0 border-b border-muted/30 bg-background shadow-sm z-10 transition-all duration-300">
                    {(selectedIngredient || (keyword.trim().length > 0 && !isFetching && (!searchResults || searchResults.length === 0))) ? (
                      <form onSubmit={handleAddToList} className="space-y-4 animate-in slide-in-from-top-4 fade-in duration-300">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              {selectedIngredient 
                                ? getCategoryIcon(selectedIngredient.categoryName, "w-5 h-5") 
                                : <Plus className="w-5 h-5" />}
                            </div>
                            <div>
                              <h3 className="font-black text-xl text-foreground">
                                {selectedIngredient ? selectedIngredient.displayName : `"${keyword.trim()}"`}
                              </h3>
                              <p className="text-xs text-muted-foreground font-medium">
                                {selectedIngredient ? selectedIngredient.categoryName : 'Özel Malzeme'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Category Dropdown (Only for custom/new items) */}
                        {!selectedIngredient && (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Kategori (Opsiyonel)</label>
                            <select
                              value={suggestedCategoryId}
                              onChange={(e) => setSuggestedCategoryId(e.target.value)}
                              className="w-full h-12 px-4 rounded-xl bg-secondary dark:bg-secondary/60 border-2 border-transparent focus:border-primary outline-none transition-all font-bold text-sm cursor-pointer"
                            >
                              <option value="">-- Kategori Seçiniz --</option>
                              {categories?.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="flex gap-4">
                          <div className="space-y-2 flex-1">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Miktar</label>
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              required
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              className="w-full h-12 px-4 rounded-xl bg-secondary dark:bg-secondary/60 border-2 border-transparent focus:border-primary focus:bg-background outline-none transition-all font-bold text-lg text-center"
                            />
                          </div>
                          <div className="space-y-2 flex-[1.5]">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Birim</label>
                            <select
                              value={unit}
                              onChange={(e) => setUnit(Number(e.target.value) as MeasurementUnit)}
                              disabled={!!selectedIngredient}
                              className="w-full h-12 px-4 rounded-xl bg-secondary dark:bg-secondary/60 border-2 border-transparent focus:border-primary outline-none transition-all font-bold text-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              {availableUnits.map((u) => (
                                <option key={u} value={u}>{MEASUREMENT_UNIT_LABELS[u]}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            Raf Ömrü & SKT
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setExpirationMode('auto')}
                              className={`h-10 text-xs font-bold rounded-xl border transition-all ${expirationMode === 'auto' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary dark:bg-secondary/60 text-muted-foreground border-transparent hover:border-primary/50'}`}
                            >
                              Otomatik
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpirationMode('shelf-life')}
                              className={`h-10 text-xs font-bold rounded-xl border transition-all ${expirationMode === 'shelf-life' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary dark:bg-secondary/60 text-muted-foreground border-transparent hover:border-primary/50'}`}
                            >
                              Raf Ömrü
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpirationMode('exact-date')}
                              className={`h-10 text-xs font-bold rounded-xl border transition-all ${expirationMode === 'exact-date' ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary dark:bg-secondary/60 text-muted-foreground border-transparent hover:border-primary/50'}`}
                            >
                              Kesin Tarih
                            </button>
                          </div>
                          
                          <AnimatePresence mode="wait">
                            {expirationMode === 'shelf-life' && (
                              <motion.div
                                key="shelf-life"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pt-1"
                              >
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="1"
                                    placeholder="Örn: 5"
                                    value={shelfLifeDays}
                                    onChange={(e) => setShelfLifeDays(e.target.value)}
                                    className="w-full h-12 px-4 pr-16 rounded-xl bg-secondary dark:bg-secondary/60 border-2 border-transparent focus:border-primary focus:bg-background outline-none transition-all font-bold text-sm"
                                  />
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Gün</span>
                                </div>
                              </motion.div>
                            )}
                            {expirationMode === 'exact-date' && (
                              <motion.div
                                key="exact-date"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pt-1"
                              >
                                <input
                                  type="date"
                                  value={expirationDate}
                                  min={new Date().toISOString().split('T')[0]}
                                  onChange={(e) => setExpirationDate(e.target.value)}
                                  className="w-full h-12 px-4 rounded-xl bg-secondary dark:bg-secondary/60 border-2 border-transparent focus:border-primary focus:bg-background outline-none transition-all font-bold text-sm"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <button
                          type="submit"
                          disabled={!quantity}
                          className="w-full h-12 rounded-xl bg-foreground text-background font-black text-base flex items-center justify-center gap-2 hover:bg-foreground/90 transition-all disabled:opacity-50 mt-2 shadow-md hover:shadow-lg"
                        >
                          <Plus className="w-5 h-5" />
                          <span>Listeye Ekle</span>
                        </button>
                      </form>
                    ) : (
                      <div className="h-[284px] flex flex-col items-center justify-center text-center px-6">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                          <Search className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="font-bold text-foreground text-lg mb-1">Henüz Seçim Yapılmadı</h3>
                        <p className="text-sm text-muted-foreground font-medium">Lütfen sol taraftan bir malzeme arayın veya popüler kategorilerden birini seçin.</p>
                      </div>
                    )}
                  </div>

                  {/* Staged Items List (Bottom Half) */}
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col bg-black/5 dark:bg-black/40">
                    <div className="flex items-center justify-between mb-4 shrink-0">
                      <h3 className="font-black text-lg text-foreground flex items-center gap-2">
                        Eklenecekler
                        {stagedItems.length > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs px-2.5 py-0.5 rounded-full">{stagedItems.length}</span>
                        )}
                      </h3>
                      {stagedItems.length > 0 && (
                        <button onClick={() => setStagedItems([])} className="text-xs font-bold text-muted-foreground hover:text-destructive transition-colors">
                          Tümünü Temizle
                        </button>
                      )}
                    </div>

                    {stagedItems.length > 0 ? (
                      <div className="space-y-3 flex-1">
                        <AnimatePresence>
                          {stagedItems.map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="flex items-center justify-between bg-card dark:bg-secondary/40 p-4 rounded-2xl border border-border shadow-sm group hover:border-primary/50 transition-all"
                            >
                              <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                  {getCategoryIcon(item.categoryName || "", "w-5 h-5")}
                                </div>
                                <div>
                                  <p className="font-bold text-foreground text-sm line-clamp-1">
                                    {item.ingredient ? item.ingredient.displayName : item.customName}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                      {item.quantity} {MEASUREMENT_UNIT_LABELS[item.unit]}
                                    </span>
                                    {item.expirationDate && (
                                      <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                                        <CalendarIcon className="w-3 h-3" />
                                        {new Date(item.expirationDate).toLocaleDateString('tr-TR')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveFromList(item.id)}
                                className="w-8 h-8 rounded-full bg-destructive/5 flex items-center justify-center text-destructive opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-destructive-foreground shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                          <Plus className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <p className="font-bold text-muted-foreground">Liste Boş</p>
                        <p className="text-sm text-muted-foreground font-medium max-w-[200px] mt-1">Eklediğiniz malzemeler burada listelenecek.</p>
                      </div>
                    )}
                  </div>

                  {/* Save All Footer */}
                  <div className="p-6 border-t border-muted/30 shrink-0 bg-background z-20">
                    <button
                      onClick={handleSaveAll}
                      disabled={stagedItems.length === 0 || (isLoadingOverride ?? addMultipleMutation.isPending)}
                      className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none"
                    >
                      {(isLoadingOverride ?? addMultipleMutation.isPending) ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Dolaba Gönderiliyor...</span>
                        </>
                      ) : (
                        <>
                          <span>{stagedItems.length > 0 ? `${stagedItems.length} Ürünü Dolaba Ekle` : 'Dolaba Ekle'}</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
