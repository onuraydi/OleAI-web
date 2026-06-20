import { Footer } from '@/widgets/footer';
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useDebounce } from "@/shared/hooks/useDebounce";

import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { RecipeCard } from "@/widgets/recipe-card";

interface FilterGroupProps<T> {
  title: string;
  options: { label: string; val: T }[];
  selectedValue: T | undefined;
  onSelect: (val: T | undefined) => void;
  scrollable?: boolean;
}

function FilterGroup<T extends string | number>({ title, options, selectedValue, onSelect, scrollable }: FilterGroupProps<T>) {
  const content = (
    <div className="flex flex-wrap gap-2">
      <button 
        onClick={() => onSelect(undefined)}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
          selectedValue === undefined ? "bg-primary/10 text-primary border-2 border-primary/20" : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
        }`}
      >
        Tümü
      </button>
      {options.map(opt => (
        <button 
          key={String(opt.val)}
          onClick={() => onSelect(opt.val)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            selectedValue === opt.val 
              ? "bg-primary/10 text-primary border-2 border-primary/20" 
              : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-foreground">{title}</h3>
      {scrollable ? (
        <div className="max-h-48 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
          {content}
        </div>
      ) : (
        content
      )}
    </div>
  );
}

export const RecipesPage = () => {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("Popular");

  // Seçili Filtreler (Sadece UI'da Gözüken)
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<number | undefined>(undefined);
  const [selectedTag, setSelectedTag] = useState<number | undefined>(undefined);

  // Uygulanmış Filtreler (API'ye Gönderilen)
  const [appliedCategory, setAppliedCategory] = useState<number | undefined>(undefined);
  const [appliedDifficulty, setAppliedDifficulty] = useState<number | undefined>(undefined);
  const [appliedTime, setAppliedTime] = useState<number | undefined>(undefined);
  const [appliedTag, setAppliedTag] = useState<number | undefined>(undefined);
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [appliedRating, setAppliedRating] = useState<number | undefined>(undefined);

  const handleApplyFilters = () => {
    setAppliedCategory(selectedCategory);
    setAppliedDifficulty(selectedDifficulty);
    setAppliedTime(selectedTime);
    setAppliedTag(selectedTag);
    setAppliedRating(selectedRating);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedDifficulty(undefined);
    setSelectedTime(undefined);
    setSelectedTag(undefined);
    setSelectedRating(undefined);
    
    setAppliedCategory(undefined);
    setAppliedDifficulty(undefined);
    setAppliedTime(undefined);
    setAppliedTag(undefined);
    setAppliedRating(undefined);
  };

  // Filtreler için veriler
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: recipeApi.getRecipeCategories });
  const { data: tags } = useQuery({ queryKey: ["tags"], queryFn: recipeApi.getRecipeTags });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["recipes", "published", page, size, debouncedSearch, appliedCategory, appliedRating, appliedDifficulty, appliedTime, appliedTag, sortBy],
    queryFn: () => recipeApi.getPublishedRecipes(page, size, debouncedSearch || undefined, appliedCategory, appliedRating, appliedDifficulty, appliedTime, appliedTag, sortBy),
  });

  // Reset page when search, size or any APPLIED filter changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(0);
  }, [debouncedSearch, size, appliedCategory, appliedDifficulty, appliedTime, appliedTag, appliedRating, sortBy]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <Sidebar />
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader />
        
        <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 w-full">
        <h1 className="text-3xl md:text-4xl font-black text-foreground whitespace-nowrap">Tarifleri Keşfet</h1>

        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tarif ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border-2 border-transparent focus:border-primary rounded-[1rem] outline-none transition-all shadow-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-card border-2 border-transparent focus:border-primary rounded-[1rem] outline-none transition-all shadow-sm font-medium cursor-pointer"
            >
              <option value="Popular">Popüler</option>
              <option value="Newest">En Yeni</option>
              <option value="Highest Rated">En Çok Oylanan</option>
              <option value="Quickest">En Hızlı</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
          </div>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-[1rem] shadow-sm transition-colors font-medium border-2 ${
              showFilters 
                ? "bg-primary text-primary-foreground border-primary" 
                : "bg-card text-foreground border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800"
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden sm:inline">Filtreler</span>
          </button>
        </div>
      </div>

      {/* Expanded Filters Panel (UI Only) */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 24 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card p-6 rounded-[2rem] shadow-sm border border-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Rating Filter */}
                <FilterGroup 
                  title="Değerlendirme Puanı" 
                  selectedValue={selectedRating} 
                  onSelect={setSelectedRating}
                  options={[
                    { label: "4+ Yıldız", val: 4 }, 
                    { label: "3+ Yıldız", val: 3 }, 
                    { label: "2+ Yıldız", val: 2 }
                  ]}
                />

                {/* Difficulty Filter */}
                <FilterGroup 
                  title="Zorluk" 
                  selectedValue={selectedDifficulty} 
                  onSelect={setSelectedDifficulty}
                  options={[
                    { label: "Kolay", val: 1 }, 
                    { label: "Orta", val: 2 }, 
                    { label: "Zor", val: 3 }
                  ]}
                />

                {/* Cook Time Filter */}
                <FilterGroup 
                  title="Hazırlama Süresi" 
                  selectedValue={selectedTime} 
                  onSelect={setSelectedTime}
                  options={[
                    { label: "< 15 dk", val: 15 },
                    { label: "< 30 dk", val: 30 },
                    { label: "< 60 dk", val: 60 }
                  ]}
                />

                {/* Dietary Preferences Filter (Tag) */}
                <FilterGroup 
                  title="Diyet / Etiket" 
                  selectedValue={selectedTag} 
                  onSelect={setSelectedTag}
                  scrollable
                  options={tags?.map(t => ({ label: t.name, val: t.id })) || []}
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-muted/30">
                <button 
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 text-muted-foreground font-medium hover:text-foreground transition-colors"
                >
                  Temizle
                </button>
                <button 
                  onClick={handleApplyFilters}
                  className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                >
                  Filtreleri Uygula
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Categories */}
      <div className="relative group flex items-center">
        <button 
          onClick={() => scrollCategories('left')}
          className="absolute -left-2 z-10 p-2 rounded-full bg-background/90 shadow-sm border hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div ref={scrollContainerRef} className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button 
            onClick={() => {
              setSelectedCategory(undefined);
              setAppliedCategory(undefined);
            }}
            className={`px-5 py-2 rounded-full font-bold whitespace-nowrap shadow-sm transition-colors shrink-0 ${appliedCategory === undefined ? 'bg-primary text-primary-foreground shadow-primary/20' : 'bg-card text-muted-foreground hover:bg-neutral-50'}`}
          >
            Tümü
          </button>
          {categories?.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setAppliedCategory(cat.id);
              }}
              className={`px-5 py-2 rounded-full font-bold whitespace-nowrap shadow-sm transition-colors shrink-0 ${appliedCategory === cat.id ? 'bg-primary text-primary-foreground shadow-primary/20' : 'bg-card text-muted-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <button 
          onClick={() => scrollCategories('right')}
          className="absolute -right-2 z-10 p-2 rounded-full bg-background/90 shadow-sm border hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-square rounded-3xl bg-card shadow-sm animate-pulse" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="py-20 text-center space-y-4 bg-card rounded-[3rem] shadow-sm">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">Bir hata oluştu</h2>
          <p className="text-muted-foreground">Tarifler yüklenemedi. Lütfen tekrar deneyin.</p>
        </div>
      ) : data?.items.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-card rounded-[3rem] shadow-sm">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto text-muted-foreground">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Sonuç Bulunamadı</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Arama kriterlerinize uygun tarif bulunamadı. Lütfen başka kelimeler deneyin.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {data?.items.map((recipe, index) => (
                <RecipeCard key={recipe.id} recipe={recipe} index={index} />
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination & Footer */}
          {data && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-muted/50 mt-8">
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <span>Göster:</span>
                <select 
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="bg-card border-2 border-transparent focus:border-primary rounded-xl px-2 py-1 outline-none transition-all shadow-sm cursor-pointer"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
                <span className="ml-2 border-l border-muted/50 pl-4">Toplam {data.totalItems} tarif ({data.totalPages} sayfa)</span>
              </div>

              {data.totalPages > 0 && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={!data.hasPreviousPage}
                    className="p-2 rounded-xl bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {[...Array(data.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`w-10 h-10 rounded-xl font-bold transition-colors shadow-sm ${
                          page === i 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-card text-muted-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                    disabled={!data.hasNextPage}
                    className="p-2 rounded-xl bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
        </div>
        <Footer />
      </main>
    </div>
  );
};
