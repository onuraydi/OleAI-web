import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/ui";
import { 
  ArrowRight, 
  ArrowLeft, 
  Leaf, 
  Salad, 
  Flame, 
  WheatOff, 
  Dna, 
  Milk, 
  Egg, 
  Nut, 
  Fish, 
  Sprout, 
  Wheat,
  Check,
  UtensilsCrossed,
  Sparkles,
  Loader2,
  Search,
  X,
  Apple,
  Beef,
  Coffee,
  Grape,
  Camera,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { dietaryPreferenceApi } from "@/entities/dietary-preference/api/dietaryPreferenceApi";
import { allergyApi } from "@/entities/allergy/api/allergyApi";
import { userApi } from "@/entities/user/api/userApi";
import { pantryApi } from "@/entities/pantry/api/pantryApi";
import { useDebouncedValue } from '@/shared/lib/hooks/useDebouncedValue';
import { useSessionStore } from "@/entities/session";

const getDietIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("vegan")) return <Leaf />;
  if (n.includes("vejetaryen") || n.includes("vegetarian")) return <Salad />;
  if (n.includes("keto")) return <Flame />;
  if (n.includes("glüten") || n.includes("gluten")) return <WheatOff />;
  if (n.includes("paleo")) return <Dna />;
  return <UtensilsCrossed />;
};

const getAllergyIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("süt") || n.includes("milk")) return <Milk />;
  if (n.includes("yumurta") || n.includes("egg")) return <Egg />;
  if (n.includes("fıstık") || n.includes("peanut") || n.includes("nut")) return <Nut />;
  if (n.includes("deniz") || n.includes("fish") || n.includes("sea")) return <Fish />;
  if (n.includes("soya") || n.includes("soy")) return <Sprout />;
  if (n.includes("buğday") || n.includes("wheat")) return <Wheat />;
  return <Sparkles />;
};

const getCategoryIcon = (categoryName: string) => {
  const n = categoryName.toLowerCase();
  if (n.includes("sebze")) return <Leaf className="w-4 h-4" />;
  if (n.includes("meyve")) return <Apple className="w-4 h-4" />;
  if (n.includes("et") || n.includes("tavuk")) return <Beef className="w-4 h-4" />;
  if (n.includes("deniz")) return <Fish className="w-4 h-4" />;
  if (n.includes("süt") || n.includes("peynir")) return <Milk className="w-4 h-4" />;
  if (n.includes("tahıl") || n.includes("un")) return <Wheat className="w-4 h-4" />;
  if (n.includes("baharat")) return <Flame className="w-4 h-4" />;
  if (n.includes("içecek")) return <Coffee className="w-4 h-4" />;
  if (n.includes("atıştırmalık")) return <Grape className="w-4 h-4" />;
  return <Sparkles className="w-4 h-4" />;
};

export default function PreferencesPage() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedDislikedIngredients, setSelectedDislikedIngredients] = useState<{id: string, name: string}[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPopularCategory, setSelectedPopularCategory] = useState<string>("Tümü");
  const [isFinishing, setIsFinishing] = useState(false);
  const navigate = useNavigate();
  // eslint-disable-next-line unused-imports/no-unused-vars
  const user = useSessionStore((state) => state.user);
  const initializeSession = useSessionStore((state) => state.initialize);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const { data: diets, isLoading: isLoadingDiets } = useQuery({
    queryKey: ["dietary-preferences"],
    queryFn: dietaryPreferenceApi.getList,
    staleTime: Infinity,
  });

  const { data: allergies, isLoading: isLoadingAllergies } = useQuery({
    queryKey: ["allergy-restrictions"],
    queryFn: allergyApi.getList,
    staleTime: Infinity,
  });

  const { data: popularDislikes, isLoading: isLoadingPopular } = useQuery({
    queryKey: ["popular-dislikes"],
    queryFn: pantryApi.getPopularDislikes,
    staleTime: Infinity,
  });

  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  const { data: searchResults, isLoading: isLoadingSearch } = useQuery({
    queryKey: ["search-ingredients", debouncedSearchQuery],
    queryFn: () => pantryApi.searchIngredients(debouncedSearchQuery),
    enabled: debouncedSearchQuery.length >= 2,
  });

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const toggleAllergy = (id: string) => {
    setSelectedAllergies(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleDiet = (id: string) => {
    setSelectedDiets(prev => {
      if (id === "none") return [];
      return prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id];
    });
  };

  const toggleDislikedIngredient = (id: string, name: string) => {
    setSelectedDislikedIngredients(prev => 
      prev.some(i => i.id === id) 
        ? prev.filter(i => i.id !== id) 
        : [...prev, { id, name }]
    );
  };

  const popularCategories = popularDislikes 
    ? ["Tümü", ...Array.from(new Set(popularDislikes.map(i => i.categoryName)))]
    : ["Tümü"];

  const filteredPopular = popularDislikes
    ? popularDislikes.filter(i => selectedPopularCategory === "Tümü" || i.categoryName === selectedPopularCategory)
    : [];

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      await userApi.updateProfile({
        username: username || undefined,
        birthDate: birthDate || undefined,
        profileImage: profileFile ?? undefined,
      });

      // 2. Diyet tercihini kaydet
      await userApi.updateDietaryPreferences({ dietaryPreferenceIds: selectedDiets });
      
      // 2. Alerjileri kaydet
      await userApi.updateAllergies({ allergyRestrictionIds: selectedAllergies });

      // 3. Sevilmeyen malzemeleri kaydet
      const ingredientIds = selectedDislikedIngredients.map(i => i.id);
      await userApi.updateDislikedIngredients({ ingredientIds });

      await initializeSession();
      navigate("/home");
    } catch (error) {
      console.error("Tercihler kaydedilirken hata oluştu:", error);
    } finally {
      setIsFinishing(false);
    }
  };

  if (isLoadingDiets || isLoadingAllergies) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0a]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] font-outfit transition-colors duration-500 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] dark:opacity-20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] dark:opacity-20" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-12 pb-24 min-h-screen flex flex-col">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">OleAI Kişiselleştirme</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  s === step ? "w-8 bg-primary" : "w-4 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="max-w-xl">
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                    Seni daha yakından tanıyalım
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Profilini oluşturarak OleAI deneyimini sana özel hale getir.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-12 items-center">
                  {/* Profile Image Upload */}
                  <div className="relative group">
                    <div className="w-40 h-40 rounded-full border-4 border-white dark:border-neutral-800 shadow-2xl overflow-hidden bg-muted flex items-center justify-center relative">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-16 h-16 text-muted-foreground" />
                      )}
                      
                      <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="w-8 h-8 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center border-4 border-[#fafafa] dark:border-[#0a0a0a] shadow-lg">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="flex-1 w-full space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">Kullanıcı Adı</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input 
                          type="text" 
                          value={username}
                          onChange={(e) => {
                            const val = e.target.value;
                            setUsername(val);
                            if (val.length > 0 && val.length < 3) setUsernameError("En az 3 karakter olmalıdır.");
                            else if (val.length > 50) setUsernameError("En fazla 50 karakter olabilir.");
                            else if (!/^[a-zA-Z0-9_]*$/.test(val)) setUsernameError("Sadece harf, rakam ve alt çizgi içerebilir.");
                            else setUsernameError("");
                          }}
                          placeholder="Örn: onuraydin"
                          className={`w-full h-14 pl-12 pr-4 rounded-2xl bg-card border-2 ${usernameError ? 'border-destructive' : 'border-transparent focus:border-primary'} focus:bg-background outline-none transition-all shadow-sm font-medium`}
                        />
                      </div>
                      {usernameError && <p className="text-sm text-destructive px-1">{usernameError}</p>}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Doğum Tarihi</label>
                        <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">Min. 13 Yaş</span>
                      </div>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input 
                          type="date" 
                          value={birthDate}
                          max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split("T")[0]}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card border-2 border-transparent focus:border-primary focus:bg-background outline-none transition-all shadow-sm font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : step === 2 ? (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="max-w-xl">
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                    Beslenme tarzını seç
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Sana en uygun tarifleri önermemiz için beslenme düzenini bilmemiz gerekiyor.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {diets?.filter(d => d.isActive).map((diet) => (
                    <motion.button
                      key={diet.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleDiet(diet.id)}
                      className={`relative flex flex-col items-start p-6 rounded-3xl border-2 transition-all text-left ${
                        selectedDiets.includes(diet.id) 
                          ? "border-primary bg-primary/5 shadow-xl shadow-primary/10" 
                          : "border-transparent bg-card shadow-sm hover:shadow-md"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                        selectedDiets.includes(diet.id) ? "bg-primary text-white" : "bg-muted dark:bg-neutral-800 text-primary"
                      }`}>
                        {getDietIcon(diet.name)}
                      </div>
                      <h3 className="font-bold text-xl mb-1 text-foreground">{diet.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{diet.description}</p>
                      
                      {selectedDiets.includes(diet.id) && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleDiet("none")}
                    className={`relative flex flex-col items-start p-6 rounded-3xl border-2 transition-all text-left ${
                      selectedDiets.length === 0 
                        ? "border-primary bg-primary/5 shadow-xl shadow-primary/10" 
                        : "border-transparent bg-card shadow-sm hover:shadow-md"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                      selectedDiets.length === 0 ? "bg-primary text-white" : "bg-muted dark:bg-neutral-800 text-primary"
                    }`}>
                      <UtensilsCrossed />
                    </div>
                    <h3 className="font-bold text-xl mb-1 text-foreground">Her Şeyi Yerim</h3>
                    <p className="text-sm text-muted-foreground">Herhangi bir beslenme kısıtlamam yok.</p>
                  </motion.button>
                </div>
              </motion.div>
            ) : step === 3 ? (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="max-w-xl">
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                    Alerjilerin var mı?
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Kullanmadığın veya alerjin olan malzemeleri seç, onları tariflerinden çıkaralım.
                  </p>
                </div>

                <div className="relative group">
                  <div 
                    ref={scrollRef}
                    className="overflow-x-auto pb-4 snap-x -mx-2 px-2 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  >
                    <div className="grid grid-rows-4 grid-flow-col auto-cols-[240px] md:auto-cols-[280px] gap-4 w-max">
                      {allergies?.filter(a => a.isActive).map((allergy) => (
                        <motion.button
                          key={allergy.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleAllergy(allergy.id)}
                          className={`relative snap-start flex flex-col items-start p-6 rounded-3xl border-2 transition-all text-left ${
                            selectedAllergies.includes(allergy.id)
                              ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                              : "border-transparent bg-card shadow-sm hover:shadow-md"
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                            selectedAllergies.includes(allergy.id) ? "bg-primary text-white" : "bg-muted dark:bg-neutral-800 text-primary"
                          }`}>
                            {getAllergyIcon(allergy.name)}
                          </div>
                          <h3 className="font-bold text-lg mb-1 text-foreground">{allergy.name}</h3>
                          {allergy.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{allergy.description}</p>
                          )}
                          
                          {selectedAllergies.includes(allergy.id) && (
                            <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 bg-background border-2 border-border rounded-full flex items-center justify-center shadow-lg text-foreground hover:border-primary hover:text-primary transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-12 h-12 bg-background border-2 border-border rounded-full flex items-center justify-center shadow-lg text-foreground hover:border-primary hover:text-primary transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>
            ) : step === 4 ? (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="max-w-xl">
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                    Sevmediğin malzemeler
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Tadı hoşuna gitmeyen veya görmek istemediğin malzemeleri buraya ekleyebilirsin.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text"
                      placeholder="Malzeme ara... (örn: Mantar, Soğan)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-16 pl-14 pr-6 rounded-2xl bg-card border-2 border-transparent focus:border-primary focus:bg-background outline-none text-lg transition-all shadow-sm"
                    />
                    
                    <AnimatePresence>
                      {searchQuery.length >= 2 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 w-full mt-2 bg-card rounded-2xl shadow-2xl border border-muted z-50 max-h-60 overflow-y-auto"
                        >
                          {isLoadingSearch ? (
                            <div className="p-8 text-center text-muted-foreground">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                              Aranıyor...
                            </div>
                          ) : searchResults && searchResults.length > 0 ? (
                            searchResults.map((ing) => (
                              <button
                                key={ing.masterIngredientId}
                                onClick={() => {
                                  toggleDislikedIngredient(ing.masterIngredientId, ing.displayName);
                                  setSearchQuery("");
                                }}
                                className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left border-b border-muted/30 last:border-0"
                              >
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                                  {getCategoryIcon(ing.categoryName)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-foreground group-hover/item:text-primary transition-colors">
                                    {ing.displayName}
                                  </span>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    {ing.categoryName} {ing.isAlias && <span className="w-1 h-1 bg-muted-foreground rounded-full mx-1" />} {ing.isAlias && "Eşanlamlı"}
                                  </span>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-8 text-center text-muted-foreground">
                              Sonuç bulunamadı.
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-wrap gap-2 min-h-[50px]">
                    <AnimatePresence>
                      {selectedDislikedIngredients.map((ing) => (
                        <motion.div
                          key={ing.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full font-bold"
                        >
                          {ing.name}
                          <button 
                            onClick={() => toggleDislikedIngredient(ing.id, ing.name)}
                            className="hover:text-destructive transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Flame className="w-4 h-4" /> Popüler Seçimler
                      </h3>
                      {popularCategories.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {popularCategories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => setSelectedPopularCategory(cat)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                                selectedPopularCategory === cat
                                  ? "bg-foreground text-background"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {isLoadingPopular ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor...
                        </div>
                      ) : filteredPopular.length > 0 ? (
                        filteredPopular.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => toggleDislikedIngredient(item.id, item.name)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 font-medium shadow-sm transition-all group/pop ${
                              selectedDislikedIngredients.some(i => i.id === item.id)
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-card border-transparent hover:border-primary/50 text-foreground"
                            }`}
                          >
                            <span className={`${selectedDislikedIngredients.some(i => i.id === item.id) ? "text-primary" : "text-primary group-hover/pop:scale-110"} transition-transform`}>
                              {getCategoryIcon(item.categoryName)}
                            </span>
                            {item.name}
                          </button>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">Bu kategoride malzeme bulunamadı.</div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="mt-12 flex justify-between items-center">
          {step > 1 ? (
            <Button 
              variant="outline"
              disabled={isFinishing}
              onClick={() => setStep(step - 1)}
              className="h-14 px-8 rounded-2xl gap-2 font-bold"
            >
              <ArrowLeft className="w-5 h-5" /> Geri
            </Button>
          ) : (
            <div />
          )}

          <Button 
            disabled={(step === 1 && (!username || !birthDate || !!usernameError)) || isFinishing}
            onClick={() => step < 4 ? setStep(step + 1) : handleFinish()}
            className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 gap-2 group transition-all"
          >
            {isFinishing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {step === 4 ? "Tamamla" : "Devam Et"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
