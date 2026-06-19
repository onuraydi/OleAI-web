import { Footer } from '@/widgets/footer';
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { userApi, RecommendationMode } from "@/entities/user/api/userApi";
import { pantryApi } from "@/entities/pantry/api/pantryApi";
import { RecipeCard } from "@/widgets/recipe-card/ui/RecipeCard";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { Sparkles, Zap, Flame, Compass, PackageMinus, BrainCircuit, Heart, Info, Loader2, Salad, Target, ChevronDown, Leaf, HeartPulse, ShieldAlert, ThumbsDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";


const modes = [
  { id: RecommendationMode.Default, label: "DENGELİ", fullLabel: "Dengeli Öneriler", icon: BrainCircuit, description: "Eldeki malzemelerinle damak zevkini harmanlayan en optimal günlük denge." },
  { id: RecommendationMode.Strict, label: "SADECE DOLAP", fullLabel: "Sadece Dolaptakiler", icon: Flame, description: "Alışverişe çıkmadan, kesinlikle sadece dolabındaki malzemelerle yapabileceğin tarifler." },
  { id: RecommendationMode.ForYou, label: "SANA ÖZEL", fullLabel: "Sana Özel", icon: Heart, description: "Malzemeleri umursamadan, tamamen geçmiş beğenilerine göre senin tarzına en uygun lezzetler." },
  { id: RecommendationMode.Ultimate, label: "GURME", fullLabel: "Gurme", icon: Sparkles, description: "Şefin seçimi! Hem zevkine uyan hem de 1'e 1 eşleşen kusursuz, garantili tarifler." },
  { id: RecommendationMode.Quick, label: "HIZLI PİŞİR", fullLabel: "Hızlı Pişir", icon: Zap, description: "Zamanın az olduğunda, minimum çaba ve eldeki malzemeyle şipşak kurtarıcı öğünler." },
  { id: RecommendationMode.Explore, label: "KEŞFET", fullLabel: "Keşfet", icon: Compass, description: "Klasikleri unut! Daha az bilinen, daha önce hiç denemediğin yeni gizli lezzetler." },
  { id: RecommendationMode.MinimalShopping, label: "AZ ALIŞVERİŞ", fullLabel: "Minimum Alışveriş", icon: PackageMinus, description: "Eksikleri minimumda tutarak, marketten sadece 1-2 şey alıp hemen hazırlayabileceğin tarifler." },
];

export const AiRecommendationsPage = () => {
  const [selectedMode, setSelectedMode] = useState<RecommendationMode>(RecommendationMode.Strict);
  const [useZeroWaste, setUseZeroWaste] = useState(false);
  const [useAllergyFilters, setUseAllergyFilters] = useState(true);
  const [useDietFilters, setUseDietFilters] = useState(true);
  const [useDislikedFilters, setUseDislikedFilters] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const resultsRef = useRef<HTMLElement>(null);

  const loadingTexts = [
    "Mutfak dolabındaki malzemeler taranıyor...",
    "Geçmiş lezzet profilin analiz ediliyor...",
    "Diyet tercihlerin gözden geçiriliyor...",
    "Sana özel kusursuz eşleşmeler hesaplanıyor...",
    "Şefin son dokunuşları yapılıyor..."
  ];

  // Queries for Context
  const { data: profile } = useQuery({
    queryKey: ["user_profile"],
    queryFn: () => userApi.getProfile(),
  });

  const { data: pantryItems } = useQuery({
    queryKey: ["pantry_items"],
    queryFn: () => pantryApi.getMyPantry(),
  });

  const { data: recommendations, isFetching, refetch } = useQuery({
    queryKey: ["ai_recommendations", selectedMode, useZeroWaste, useAllergyFilters, useDietFilters, useDislikedFilters],
    queryFn: () => userApi.getRecommendations(selectedMode, useZeroWaste, useAllergyFilters, useDietFilters, useDislikedFilters),
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isFetching) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingTexts.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isFetching]);

  const handleGenerate = () => {
    setHasRequested(true);
    refetch().then((res) => {
      if (res.isError) {
        toast.error("Öneriler alınırken bir hata oluştu.", {
          description: "Lütfen bağlantınızı kontrol edip tekrar deneyin."
        });
      } else {
        // Scroll to results after fetching
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 500);
      }
    }).catch(() => {
        toast.error("Beklenmeyen bir hata oluştu.");
    });
  };

  const handleModeSelect = (id: RecommendationMode) => {
    setSelectedMode(id);
    setHasRequested(false);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#0a0a0a] transition-colors duration-500">
      <Sidebar />
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader />

        <div className="flex-1 p-8 max-w-7xl mx-auto w-full pt-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left Column - Content & Modes */}
            <div className="lg:col-span-7 space-y-12">
              
              {/* Hero Header */}
              <section>
                <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[1.1] mb-6">
                  Bir Sonraki Öğününü <br/> <span className="italic text-primary">Keşfet</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Nasıl bir deneyim aradığını seç ve OleAI sana özel kusursuz bir lezzet serüveni hazırlasın.
                </p>
              </section>

              {/* Modes Selection */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <BrainCircuit className="w-6 h-6 text-primary" /> Analiz Modu
                  </h2>
                </div>
                
                {/* Custom Dropdown Selector */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between bg-card border border-border/50 hover:border-primary/50 px-6 py-5 rounded-[24px] transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-4">
                      {(() => {
                        const SelectedIcon = modes.find(m => m.id === selectedMode)?.icon;
                        return SelectedIcon ? <SelectedIcon className="w-7 h-7 text-primary" /> : null;
                      })()}
                      <span className="font-bold text-lg text-foreground uppercase tracking-wide">
                        {modes.find(m => m.id === selectedMode)?.label}
                      </span>
                    </div>
                    <ChevronDown className={cn("w-6 h-6 text-muted-foreground transition-transform duration-300", isDropdownOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-[24px] shadow-2xl overflow-hidden z-50 flex flex-col p-2"
                      >
                        {modes.map((mode) => {
                          const Icon = mode.icon;
                          const isSelected = selectedMode === mode.id;
                          return (
                            <button
                              key={mode.id}
                              onClick={() => {
                                handleModeSelect(mode.id);
                                setIsDropdownOpen(false);
                              }}
                              className={cn(
                                "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-left",
                                isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <Icon className="w-6 h-6 shrink-0" />
                              <span className="font-bold uppercase tracking-wide block">{mode.label}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Dynamic Mode Description */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedMode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 bg-card border border-border/50 rounded-[24px] p-6 flex items-start gap-5 shadow-sm"
                  >
                    <div className="bg-primary/10 p-3 rounded-full shrink-0">
                      <Info className="w-6 h-6 text-primary" />
                    </div>
                    <div className="pt-1">
                      <h4 className="font-bold text-foreground mb-1 text-sm uppercase tracking-wider">{modes.find(m => m.id === selectedMode)?.label} Modu</h4>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {modes.find(m => m.id === selectedMode)?.description}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>



                <div className="mt-8">
                  <button
                    onClick={handleGenerate}
                    disabled={isFetching}
                    className="w-full h-16 bg-[#588157] hover:bg-[#3a5a39] text-white rounded-[24px] flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-[#588157]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:scale-100"
                  >
                    {isFetching ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Sparkles className="w-6 h-6" />
                    )}
                    {isFetching ? "Yapay Zeka Çalışıyor..." : "Önerileri Getir"}
                  </button>
                </div>
              </section>
            </div>

            {/* Right Column - Visual & Context */}
            <div className="lg:col-span-5 flex flex-col gap-6 mt-10 lg:mt-0 md:flex">
               {/* Live Context Card */}
               <div className="bg-card/95 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-border/50 w-full shrink-0">
                 <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full">
                      Kişisel Bağlam
                    </span>
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                      <Target className="w-4 h-4" /> OleAI Aktif
                    </div>
                 </div>
                 
                 <div>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2">Profil Özeti</h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      Zeka motoru sana özel öneriler sunarken şu parametreleri anlık olarak kullanır:
                    </p>
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center relative">
                          <PackageMinus className="w-6 h-6 text-blue-500" />
                          <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping opacity-20" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Dolap Stoğu</p>
                          <p className="text-xs text-muted-foreground">
                            {pantryItems ? `${pantryItems.length} malzeme tanımlı` : "Yükleniyor..."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center relative">
                          <Salad className="w-6 h-6 text-emerald-500" />
                          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping opacity-20" style={{ animationDelay: '0.5s' }} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Diyetler</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {profile?.dietaryPreferences?.length ? profile.dietaryPreferences.map(d => d.name).join(", ") : "Özel diyet seçilmedi"}
                          </p>
                        </div>
                      </div>
                    </div>
                 </div>
               </div>

               {/* Advanced Options Card */}
               <div className="bg-card/95 backdrop-blur-xl rounded-[32px] p-8 shadow-2xl border border-border/50 w-full shrink-0">
                 <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full">
                      Gelişmiş Seçenekler
                    </span>
                 </div>
                 
                 <h3 className="text-2xl font-bold tracking-tight text-foreground mb-4">Motor Ayarları</h3>
                 <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                   Yapay zeka önerilerini oluştururken kullanılacak ek filtreleri buradan açıp kapatabilirsiniz.
                 </p>

                 <div className="flex flex-col gap-3">
                   {/* Zero Waste */}
                   <div className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl">
                     <div className="flex items-center gap-3">
                       <div className={cn("p-2 rounded-full shrink-0 transition-colors", useZeroWaste ? "bg-primary/20" : "bg-muted")}>
                         <Leaf className={cn("w-5 h-5", useZeroWaste ? "text-primary" : "text-muted-foreground")} />
                       </div>
                       <div>
                         <h4 className="font-bold text-foreground text-sm">İsrafı Önle</h4>
                       </div>
                     </div>
                     <button 
                       onClick={() => setUseZeroWaste(!useZeroWaste)}
                       className={cn("relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none", useZeroWaste ? "bg-primary" : "bg-muted")}
                     >
                       <span className={cn("pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", useZeroWaste ? "translate-x-5" : "translate-x-0")} />
                     </button>
                   </div>

                   {/* Allergy */}
                   <div className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl">
                     <div className="flex items-center gap-3">
                       <div className={cn("p-2 rounded-full shrink-0 transition-colors", useAllergyFilters ? "bg-red-500/20" : "bg-muted")}>
                         <ShieldAlert className={cn("w-5 h-5", useAllergyFilters ? "text-red-500" : "text-muted-foreground")} />
                       </div>
                       <div>
                         <h4 className="font-bold text-foreground text-sm">Alerji Koruması</h4>
                       </div>
                     </div>
                     <button 
                       onClick={() => setUseAllergyFilters(!useAllergyFilters)}
                       className={cn("relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none", useAllergyFilters ? "bg-red-500" : "bg-muted")}
                     >
                       <span className={cn("pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", useAllergyFilters ? "translate-x-5" : "translate-x-0")} />
                     </button>
                   </div>

                   {/* Diet */}
                   <div className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl">
                     <div className="flex items-center gap-3">
                       <div className={cn("p-2 rounded-full shrink-0 transition-colors", useDietFilters ? "bg-green-500/20" : "bg-muted")}>
                         <Salad className={cn("w-5 h-5", useDietFilters ? "text-green-500" : "text-muted-foreground")} />
                       </div>
                       <div>
                         <h4 className="font-bold text-foreground text-sm">Diyet Kuralları</h4>
                       </div>
                     </div>
                     <button 
                       onClick={() => setUseDietFilters(!useDietFilters)}
                       className={cn("relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none", useDietFilters ? "bg-green-500" : "bg-muted")}
                     >
                       <span className={cn("pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", useDietFilters ? "translate-x-5" : "translate-x-0")} />
                     </button>
                   </div>

                   {/* Disliked */}
                   <div className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl">
                     <div className="flex items-center gap-3">
                       <div className={cn("p-2 rounded-full shrink-0 transition-colors", useDislikedFilters ? "bg-orange-500/20" : "bg-muted")}>
                         <ThumbsDown className={cn("w-5 h-5", useDislikedFilters ? "text-orange-500" : "text-muted-foreground")} />
                       </div>
                       <div>
                         <h4 className="font-bold text-foreground text-sm">Sevilmeyenler</h4>
                       </div>
                     </div>
                     <button 
                       onClick={() => setUseDislikedFilters(!useDislikedFilters)}
                       className={cn("relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none", useDislikedFilters ? "bg-orange-500" : "bg-muted")}
                     >
                       <span className={cn("pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", useDislikedFilters ? "translate-x-5" : "translate-x-0")} />
                     </button>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Results Area */}
          <section ref={resultsRef} className="mt-32 pb-20 scroll-mt-32">
            <AnimatePresence mode="wait">
              {isFetching ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 min-h-[400px]"
                >
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                    <div className="w-20 h-20 bg-primary/10 border-2 border-primary/20 rounded-full flex items-center justify-center relative">
                      <BrainCircuit className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="h-8 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={loadingStep}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-xl text-primary font-bold tracking-tight text-center"
                      >
                        {loadingTexts[loadingStep]}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                  <p className="text-muted-foreground mt-4 max-w-sm text-center">Bu işlem, dolabındaki malzemelere ve profil büyüklüğüne göre birkaç saniye sürebilir.</p>
                </motion.div>
              ) : hasRequested && recommendations && recommendations.length > 0 ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12"
                >
                  <div className="text-center mb-10">
                    <h2 className="text-4xl font-black tracking-tight text-foreground mb-4">Senin İçin Seçtiklerimiz</h2>
                    <p className="text-lg text-muted-foreground mb-6">Zeka Motoru profilini analiz etti ve en uygun {recommendations.length} tarifi buldu.</p>

                    {recommendations.some(r => r.isFallback) && (
                      <div className="bg-primary/10 border border-primary/20 p-6 rounded-[24px] flex items-start gap-4 text-left max-w-3xl mx-auto shadow-lg shadow-primary/5">
                        <div className="bg-primary/20 p-3 rounded-full shrink-0">
                           <Info className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground text-lg mb-1">Daha Fazla Etkileşime İhtiyacımız Var</h4>
                          <p className="text-muted-foreground leading-relaxed">
                            Sistemimiz şu anda sizi tam olarak tanımadığı veya elinizdeki malzemelerle uygun eşleşme bulamadığı için size platformdaki <strong>en popüler trend tarifleri</strong> gösteriyor. Size özel kusursuz öneriler sunabilmemiz için bol bol tarif <strong>beğenmeniz</strong> veya <strong>kaydetmeniz</strong> gerekiyor!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {recommendations.map((item, idx) => (
                      <div key={item.recipe.id} className="relative group">
                        <div className="absolute top-4 right-4 z-20">
                          <div className={cn(
                            "px-4 py-2 rounded-2xl text-xs font-black text-white shadow-xl flex items-center gap-2 backdrop-blur-md",
                            item.matchScore >= 0.90 ? "bg-emerald-500/95" :
                            item.matchScore >= 0.70 ? "bg-blue-500/95" :
                            "bg-amber-500/95"
                          )}>
                            <Sparkles className="w-4 h-4" />
                            %{(item.matchScore * 100).toFixed(0)} Eşleşme
                          </div>
                        </div>
                        <RecipeCard recipe={item.recipe} index={idx} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : hasRequested && recommendations && recommendations.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-24 h-24 bg-muted rounded-[2rem] flex items-center justify-center mb-6">
                    <Info className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight text-foreground mb-4">Uygun Tarif Bulunamadı</h3>
                  <p className="text-muted-foreground text-lg max-w-md">
                    Seçtiğiniz modda dolabınızdaki malzemelerle eşleşen bir tarif bulamadık. Lütfen farklı bir analiz modu seçin.
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>

        </div>
        <Footer />
      </main>
    </div>
  );
};
