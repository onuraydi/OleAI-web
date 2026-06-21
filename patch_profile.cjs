const fs = require('fs');

const path = 'src/widgets/profile-recipes/ui/ProfileRecipesTab.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add imports
code = code.replace(
  `import { Heart, Loader2, Sparkles, Clock, ChefHat, Bookmark, Star, ChevronLeft, ChevronRight, Search, ThumbsDown, Trash2, Edit2, Globe, Lock, AlertCircle, X, Check } from "lucide-react";`,
  `import { Heart, Loader2, Sparkles, Clock, ChefHat, Bookmark, Star, ChevronLeft, ChevronRight, Search, ThumbsDown, Trash2, Edit2, Globe, Lock, AlertCircle, X, Check, SlidersHorizontal } from "lucide-react";\nimport type { RecipeCategoryDto, TagDto } from "@/entities/recipe/api/recipeApi";`
);

// 2. Add states for filters
const stateHookPos = code.indexOf(`const [searchTerm, setSearchTerm] = useState("");`);
const statesToAdd = `
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
`;
code = code.slice(0, stateHookPos) + statesToAdd + code.slice(stateHookPos);

// 3. Update useEffect
code = code.replace(
  `useEffect(() => {
    setPage(0);
  }, [debouncedSearch, size, activeSubTab]);`,
  `useEffect(() => {
    setPage(0);
  }, [debouncedSearch, size, activeSubTab, appliedCategory, appliedDifficulty, appliedTime, appliedTag, appliedVisibility, sortBy]);`
);

// 4. Update getMyRecipes call
code = code.replace(
  `const { data: createdData, isLoading: isLoadingCreated } = useQuery({
    queryKey: ["recipes", "created", page, size, debouncedSearch],
    queryFn: () => recipeApi.getMyRecipes(page, size, debouncedSearch || undefined),
  });`,
  `const { data: createdData, isLoading: isLoadingCreated } = useQuery({
    queryKey: ["recipes", "created", page, size, debouncedSearch, appliedCategory, appliedDifficulty, appliedTime, appliedTag, appliedVisibility, sortBy],
    queryFn: () => recipeApi.getMyRecipes(page, size, debouncedSearch || undefined, appliedCategory, appliedDifficulty, appliedTime, appliedTag, appliedVisibility, sortBy),
  });`
);

// 5. Inject Filter UI
const searchBarRegex = /\{\/\* Search Bar \*\/\}[\s\S]*?<\/div>\n\s*<\/div>/;
const searchBarMatch = code.match(searchBarRegex);
if (searchBarMatch) {
  const replacement = `{/* Search Bar & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tarif ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border-2 border-transparent focus:border-primary rounded-[1rem] outline-none transition-all shadow-sm font-medium"
            />
          </div>
          
          {activeSubTab === "created" && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-40">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none w-full pl-4 pr-10 py-3 bg-card border-2 border-transparent focus:border-primary rounded-[1rem] outline-none transition-all shadow-sm font-medium cursor-pointer"
                >
                  <option value="Newest">En Yeni</option>
                  <option value="Popular">Popüler</option>
                  <option value="Highest Rated">En Çok Oylanan</option>
                  <option value="Quickest">En Hızlı</option>
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
              </div>

              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={\`flex items-center justify-center gap-2 px-4 py-3 rounded-[1rem] shadow-sm transition-colors font-medium border-2 \${
                  showFilters 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-card text-foreground border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800"
                }\`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="hidden sm:inline">Filtreler</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Filters Panel (UI Only) */}
      <AnimatePresence>
        {activeSubTab === "created" && showFilters && (
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
                      className={\`px-4 py-2 rounded-xl text-sm font-medium transition-colors \${
                        selectedCategory === undefined 
                          ? "bg-primary/10 text-primary border-2 border-primary/20" 
                          : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                      }\`}
                    >
                      Tümü
                    </button>
                    {categories?.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={\`px-4 py-2 rounded-xl text-sm font-medium transition-colors \${
                          selectedCategory === cat.id 
                            ? "bg-primary/10 text-primary border-2 border-primary/20" 
                            : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                        }\`}
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
                      className={\`px-4 py-2 rounded-xl text-sm font-medium transition-colors \${
                        selectedDifficulty === undefined ? "bg-primary/10 text-primary border-2 border-primary/20" : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                      }\`}>Tümü</button>
                    {[
                      { label: "Kolay", val: 1 }, 
                      { label: "Orta", val: 2 }, 
                      { label: "Zor", val: 3 }
                    ].map(level => (
                      <button 
                        key={level.val}
                        onClick={() => setSelectedDifficulty(level.val)}
                        className={\`px-4 py-2 rounded-xl text-sm font-medium transition-colors \${
                          selectedDifficulty === level.val 
                            ? "bg-primary/10 text-primary border-2 border-primary/20" 
                            : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                        }\`}
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
                      className={\`px-4 py-2 rounded-xl text-sm font-medium transition-colors \${
                        selectedTime === undefined ? "bg-primary/10 text-primary border-2 border-primary/20" : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                      }\`}>Tümü</button>
                    {[
                      { label: "< 15 dk", val: 15 },
                      { label: "< 30 dk", val: 30 },
                      { label: "< 60 dk", val: 60 }
                    ].map(time => (
                      <button 
                        key={time.val}
                        onClick={() => setSelectedTime(time.val)}
                        className={\`px-4 py-2 rounded-xl text-sm font-medium transition-colors \${
                          selectedTime === time.val 
                            ? "bg-primary/10 text-primary border-2 border-primary/20" 
                            : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                        }\`}
                      >
                        {time.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visibility Filter */}
                <div className="space-y-3">
                  <h3 className="font-bold text-foreground">Görünürlük</h3>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setSelectedVisibility(undefined)}
                      className={\`px-4 py-2 rounded-xl text-sm font-medium transition-colors \${
                        selectedVisibility === undefined ? "bg-primary/10 text-primary border-2 border-primary/20" : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                      }\`}>Tümü</button>
                    {[
                      { label: "Sadece Ben", val: 0 },
                      { label: "Herkese Açık", val: 1 }
                    ].map(vis => (
                      <button 
                        key={vis.val}
                        onClick={() => setSelectedVisibility(vis.val)}
                        className={\`px-4 py-2 rounded-xl text-sm font-medium transition-colors \${
                          selectedVisibility === vis.val 
                            ? "bg-primary/10 text-primary border-2 border-primary/20" 
                            : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                        }\`}
                      >
                        {vis.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Preferences Filter (Tag) */}
                <div className="space-y-3">
                  <h3 className="font-bold text-foreground">Diyet / Etiket</h3>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setSelectedTag(undefined)}
                      className={\`px-4 py-2 rounded-xl text-sm font-medium transition-colors \${
                        selectedTag === undefined ? "bg-primary/10 text-primary border-2 border-primary/20" : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                      }\`}>Tümü</button>
                    {tags?.map(tag => (
                      <button 
                        key={tag.id}
                        onClick={() => setSelectedTag(tag.id)}
                        className={\`px-4 py-2 rounded-xl text-sm font-medium transition-colors \${
                          selectedTag === tag.id 
                            ? "bg-primary/10 text-primary border-2 border-primary/20" 
                            : "bg-muted/30 text-muted-foreground hover:bg-muted border-2 border-transparent"
                        }\`}
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
      </AnimatePresence>`;

  code = code.replace(searchBarMatch[0], replacement);
}

fs.writeFileSync(path, code);
