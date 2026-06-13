import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Loader2, Sparkles, Clock, ChefHat, Bookmark, Star, ChevronLeft, ChevronRight, Search, ThumbsDown, Trash2, Edit2, Globe, Lock, AlertCircle, X, Check, SlidersHorizontal, BookOpen } from "lucide-react";
import type { RecipeCategoryDto, TagDto } from "@/entities/recipe/api/recipeApi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useQueryClient, useMutation } from "@tanstack/react-query";

type SubTab = "created" | "saved" | "liked" | "disliked";

const SUBTABS = [
  { id: "created", label: "Oluşturduklarım", icon: ChefHat },
  { id: "saved", label: "Kaydedilenler", icon: Bookmark },
  { id: "liked", label: "Beğenilenler", icon: Heart },
  { id: "disliked", label: "Beğenilmeyenler", icon: ThumbsDown },
] as const;

export const ProfileRecipesTab = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("created");

  
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("Newest");

  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<number | undefined>(undefined);
  const [selectedTag, setSelectedTag] = useState<number | undefined>(undefined);
  const [selectedVisibility, setSelectedVisibility] = useState<number | undefined>(undefined);

  const [appliedCategory, setAppliedCategory] = useState<number | undefined>(undefined);
  const [appliedDifficulty, setAppliedDifficulty] = useState<number | undefined>(undefined);
  const [appliedTime, setAppliedTime] = useState<number | undefined>(undefined);
  const [appliedTag, setAppliedTag] = useState<number | undefined>(undefined);
  const [appliedVisibility, setAppliedVisibility] = useState<number | undefined>(undefined);

  const handleApplyFilters = () => {
    setAppliedCategory(selectedCategory);
    setAppliedDifficulty(selectedDifficulty);
    setAppliedTime(selectedTime);
    setAppliedTag(selectedTag);
    setAppliedVisibility(selectedVisibility);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedDifficulty(undefined);
    setSelectedTime(undefined);
    setSelectedTag(undefined);
    setSelectedVisibility(undefined);
    
    setAppliedCategory(undefined);
    setAppliedDifficulty(undefined);
    setAppliedTime(undefined);
    setAppliedTag(undefined);
    setAppliedVisibility(undefined);
  };

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: recipeApi.getRecipeCategories });
  const { data: tags } = useQuery({ queryKey: ["tags"], queryFn: recipeApi.getRecipeTags });
const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);

  const queryClient = useQueryClient();
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => recipeApi.deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes", "created"] });
      setRecipeToDelete(null);
    }
  });

  const visibilityMutation = useMutation({
    mutationFn: ({ id, visibility }: { id: string; visibility: number }) => recipeApi.changeVisibility(id, visibility),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes", "created"] });
    }
  });

  useEffect(() => {
    if (location.state?.subTab) {
      setActiveSubTab(location.state.subTab as SubTab);
    }
  }, [location.state]);

  // Reset page when search or tab changes
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, size, activeSubTab, appliedCategory, appliedDifficulty, appliedTime, appliedTag, appliedVisibility, sortBy]);

  const { data: createdData, isLoading: isLoadingCreated } = useQuery({
    queryKey: ["recipes", "created", page, size, debouncedSearch, appliedCategory, appliedDifficulty, appliedTime, appliedTag, appliedVisibility, sortBy],
    queryFn: () => recipeApi.getMyRecipes(page, size, debouncedSearch || undefined, appliedCategory, appliedDifficulty, appliedTime, appliedTag, appliedVisibility, sortBy),
  });

  const { data: savedData, isLoading: isLoadingSaved } = useQuery({
    queryKey: ["recipes", "saved", page, size, debouncedSearch, appliedCategory, appliedDifficulty, appliedTime, appliedTag, sortBy],
    queryFn: () => recipeApi.getMySavedRecipes(page, size, debouncedSearch || undefined, appliedCategory, appliedDifficulty, appliedTime, appliedTag, sortBy),
  });

  const { data: likedData, isLoading: isLoadingLiked } = useQuery({
    queryKey: ["recipes", "liked", page, size, debouncedSearch, appliedCategory, appliedDifficulty, appliedTime, appliedTag, sortBy],
    queryFn: () => recipeApi.getMyLikedRecipes(page, size, debouncedSearch || undefined, appliedCategory, appliedDifficulty, appliedTime, appliedTag, sortBy),
  });

  const { data: dislikedData, isLoading: isLoadingDisliked } = useQuery({
    queryKey: ["recipes", "disliked", page, size, debouncedSearch],
    queryFn: () => recipeApi.getMyDislikedRecipes(page, size, debouncedSearch || undefined),
  });

  const isLoading = 
    (activeSubTab === "created" && isLoadingCreated) ||
    (activeSubTab === "saved" && isLoadingSaved) ||
    (activeSubTab === "liked" && isLoadingLiked) ||
    (activeSubTab === "disliked" && isLoadingDisliked);

  const currentData = 
    activeSubTab === "created" ? createdData :
    activeSubTab === "saved" ? savedData :
    activeSubTab === "liked" ? likedData :
    dislikedData;

  const hasActiveFilters = appliedCategory !== undefined || appliedDifficulty !== undefined || appliedTime !== undefined || appliedTag !== undefined || appliedVisibility !== undefined;
  const isSearchOrFilterActive = !!debouncedSearch || hasActiveFilters;

  const getEmptyStateMessage = () => {
    if (isSearchOrFilterActive) {
      return "Arama kriterlerinize veya filtrelerinize uygun tarif bulunamadı. Lütfen başka filtreler deneyin.";
    }
    switch(activeSubTab) {
      case "created": return "Henüz kendi tarifini oluşturmadın. Yapay zeka ile hemen yaratıcı tarifler oluşturmaya başla!";
      case "saved": return "Henüz hiç tarif kaydetmedin. Sevdiğin tarifleri kaydederek kendi yemek kitabını oluşturabilirsin.";
      case "liked": return "Henüz hiçbir tarifi beğenmedin. Keşfete dönüp yeni lezzetler bulmaya ne dersin?";
      case "disliked": return "Henüz hiçbir tarifi beğenmemezlik yapmadın.";
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Sub-tabs */}
      <div className="flex flex-col gap-6 w-full">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <h2 className="text-xl lg:text-2xl font-black text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
            Tarif Defterim
          </h2>
        </div>

        {/* Action Bar: Subtabs + Search/Filter */}
        <div className="flex flex-col gap-4 w-full">
          {/* Sub-tabs */}
          <div className="flex gap-2 p-1.5 rounded-2xl bg-muted/40 border border-muted/50 w-full xl:w-fit overflow-x-auto scrollbar-hide flex-shrink-0 h-fit">
            {SUBTABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as SubTab)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap
                  ${activeSubTab === tab.id
                    ? "text-primary-foreground bg-primary shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full flex-1">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tarif ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-card border-2 border-transparent focus:border-primary rounded-xl outline-none transition-all shadow-sm font-medium text-sm"
              />
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              {activeSubTab !== "disliked" && (
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl shadow-sm transition-colors font-medium text-sm border-2 ${
                    showFilters 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-card text-foreground border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filtreler</span>
                </button>
              )}
              <div className="relative">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-card border-2 border-transparent focus:border-primary rounded-xl outline-none transition-all shadow-sm font-medium text-sm cursor-pointer"
                >
                  <option value="Newest">En Yeni</option>
                  <option value="Popular">Popüler</option>
                  <option value="Highest Rated">En Çok Oylanan</option>
                  <option value="Quickest">En Hızlı</option>
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Filters Panel (UI Only) */}
      <AnimatePresence>
        {activeSubTab !== "disliked" && showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 24 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card p-6 rounded-[2rem] shadow-sm border border-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Category Filter */}
                <div className="space-y-3">
                  <h3 className="font-bold text-foreground">Kategori</h3>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setSelectedCategory(undefined)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        selectedCategory === undefined 
                          ? "bg-primary/10 text-primary border-2 border-primary/20" 
                          : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                      }`}
                    >
                      Tümü
                    </button>
                    {categories?.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          selectedCategory === cat.id 
                            ? "bg-primary/10 text-primary border-2 border-primary/20" 
                            : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div className="space-y-3">
                  <h3 className="font-bold text-foreground">Zorluk</h3>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setSelectedDifficulty(undefined)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        selectedDifficulty === undefined ? "bg-primary/10 text-primary border-2 border-primary/20" : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                      }`}>Tümü</button>
                    {[
                      { label: "Kolay", val: 1 }, 
                      { label: "Orta", val: 2 }, 
                      { label: "Zor", val: 3 }
                    ].map(level => (
                      <button 
                        key={level.val}
                        onClick={() => setSelectedDifficulty(level.val)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          selectedDifficulty === level.val 
                            ? "bg-primary/10 text-primary border-2 border-primary/20" 
                            : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cook Time Filter */}
                <div className="space-y-3">
                  <h3 className="font-bold text-foreground">Hazırlama Süresi</h3>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setSelectedTime(undefined)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        selectedTime === undefined ? "bg-primary/10 text-primary border-2 border-primary/20" : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                      }`}>Tümü</button>
                    {[
                      { label: "< 15 dk", val: 15 },
                      { label: "< 30 dk", val: 30 },
                      { label: "< 60 dk", val: 60 }
                    ].map(time => (
                      <button 
                        key={time.val}
                        onClick={() => setSelectedTime(time.val)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          selectedTime === time.val 
                            ? "bg-primary/10 text-primary border-2 border-primary/20" 
                            : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                        }`}
                      >
                        {time.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visibility Filter */}
                {activeSubTab === "created" && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-foreground">Görünürlük</h3>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setSelectedVisibility(undefined)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          selectedVisibility === undefined ? "bg-primary/10 text-primary border-2 border-primary/20" : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                        }`}>Tümü</button>
                      {[
                        { label: "Sadece Ben", val: 1 },
                        { label: "Herkese Açık", val: 2 }
                      ].map(vis => (
                        <button 
                          key={vis.val}
                          onClick={() => setSelectedVisibility(vis.val)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                            selectedVisibility === vis.val 
                              ? "bg-primary/10 text-primary border-2 border-primary/20" 
                              : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                          }`}
                        >
                          {vis.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dietary Preferences Filter (Tag) */}
                <div className="space-y-3">
                  <h3 className="font-bold text-foreground">Diyet / Etiket</h3>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setSelectedTag(undefined)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        selectedTag === undefined ? "bg-primary/10 text-primary border-2 border-primary/20" : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                      }`}>Tümü</button>
                    {tags?.map(tag => (
                      <button 
                        key={tag.id}
                        onClick={() => setSelectedTag(tag.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          selectedTag === tag.id 
                            ? "bg-primary/10 text-primary border-2 border-primary/20" 
                            : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
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

      {/* Decorative Tags (Quick Filters) */}
      {activeSubTab !== "disliked" && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button 
            onClick={() => {
              setSelectedTag(undefined);
              setAppliedTag(undefined);
            }}
            className={`px-5 py-2 rounded-full font-bold whitespace-nowrap shadow-sm transition-colors ${appliedTag === undefined ? 'bg-primary text-primary-foreground shadow-primary/20' : 'bg-card text-muted-foreground border border-muted/30 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
          >
            Tümü
          </button>
          {tags?.map((tag) => (
            <button 
              key={tag.id}
              onClick={() => {
                setSelectedTag(tag.id);
                setAppliedTag(tag.id);
              }}
              className={`px-5 py-2 rounded-full font-bold whitespace-nowrap shadow-sm transition-colors ${appliedTag === tag.id ? 'bg-primary text-primary-foreground shadow-primary/20' : 'bg-card text-muted-foreground border border-muted/30 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Grid Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-[4/3] rounded-[2rem] bg-card shadow-sm animate-pulse" />
                </div>
              ))}
            </motion.div>
          ) : !currentData?.items.length ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-20 text-center space-y-4 bg-card rounded-[3rem] shadow-sm border border-muted/30"
            >
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto text-muted-foreground">
                {isSearchOrFilterActive ? <Search className="w-8 h-8" /> : <Sparkles className="w-8 h-8 text-primary" />}
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {isSearchOrFilterActive ? "Sonuç Bulunamadı" : "Tarif Bulunamadı"}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {getEmptyStateMessage()}
              </p>
              {!isSearchOrFilterActive && activeSubTab === "created" && (
                <button onClick={() => navigate('/recipes/create')} className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
                  İlk Tarifini Oluştur
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={activeSubTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {currentData.items.map((recipe, index) => (
                  <motion.div 
                    key={recipe.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                    className="group relative cursor-pointer bg-card rounded-[2rem] overflow-hidden border border-muted/30 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col"
                  >
                    {activeSubTab === "created" && (
                      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            visibilityMutation.mutate({ id: recipe.id, visibility: recipe.visibility === 0 ? 1 : 0 });
                          }}
                          disabled={visibilityMutation.isPending}
                          className="p-2 bg-background/80 backdrop-blur-md rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm text-muted-foreground disabled:opacity-50"
                          title={recipe.visibility === 0 ? "Gizli - Herkese Aç" : "Herkese Açık - Gizle"}
                        >
                          {recipe.visibility === 0 ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/recipes/edit/${recipe.id}`);
                          }}
                          className="p-2 bg-background/80 backdrop-blur-md rounded-xl hover:bg-blue-500 hover:text-white transition-colors shadow-sm text-muted-foreground"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRecipeToDelete(recipe.id);
                          }}
                          className="p-2 bg-background/80 backdrop-blur-md rounded-xl hover:bg-red-500 hover:text-white transition-colors shadow-sm text-muted-foreground"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img 
                        src={recipe.mainImageUrl || "https://images.unsplash.com/photo-1495195129352-aed325a55b65?q=80&w=1776&auto=format&fit=crop"} 
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-lg font-black text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {recipe.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                        {recipe.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-muted/30">
                        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-primary/60" />
                            <span>{recipe.prepTime + recipe.cookTime > 0 ? recipe.prepTime + recipe.cookTime : '--'} dk</span>
                          </div>
                          {recipe.difficulty > 0 && (
                            <div className="flex items-center gap-1.5 hidden sm:flex">
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                              <span>{recipe.difficulty === 1 ? 'Kolay' : recipe.difficulty === 2 ? 'Orta' : 'Zor'}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm font-bold text-foreground">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>{recipe.averageRating > 0 ? recipe.averageRating.toFixed(1) : "--"}</span>
                          {recipe.totalRatings > 0 && (
                            <span className="text-xs font-normal text-muted-foreground ml-1">({recipe.totalRatings})</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {currentData && currentData.items.length > 0 && (
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
            <span className="ml-2 border-l border-muted/50 pl-4">Toplam {currentData.totalItems} tarif ({currentData.totalPages} sayfa)</span>
          </div>

          {currentData.totalPages > 0 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={!currentData.hasPreviousPage}
                className="p-2 rounded-xl bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(currentData.totalPages)].map((_, i) => (
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
                onClick={() => setPage(p => Math.min(currentData.totalPages - 1, p + 1))}
                disabled={!currentData.hasNextPage}
                className="p-2 rounded-xl bg-card text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {recipeToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setRecipeToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-md bg-card rounded-[2rem] shadow-2xl border border-border/50 overflow-hidden"
            >
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-100/50 dark:bg-red-500/10 flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Tarifi Sil</h3>
                <p className="text-muted-foreground mb-8">
                  Bu tarifi silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tarife ait tüm yorumlar ve beğeniler kalıcı olarak silinir.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setRecipeToDelete(null)}
                    disabled={deleteMutation.isPending}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-muted-foreground bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
                  >
                    İptal Et
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(recipeToDelete)}
                    disabled={deleteMutation.isPending}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        Evet, Sil
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
