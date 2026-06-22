/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, X, ImagePlus, ChevronDown, Plus, GripVertical, Search, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { pantryApi } from "@/entities/pantry/api/pantryApi";
import { useAdminRecipeCategories, useAdminTags } from "@/entities/admin-recipe-taxonomy/api/adminRecipeTaxonomyQueries";
import { 
  MeasurementCategory, 
  MEASUREMENT_CATEGORY_UNITS, 
  MEASUREMENT_UNIT_LABELS,
  ALL_UNITS,
  MeasurementUnit
} from "@/shared/constants/measurement";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

interface IngredientInput {
  id: string;
  qty: string;
  unitId: string;
  ingredientId: string;
  name: string;
  unitFamily?: MeasurementCategory;
  isSearching: boolean;
   
  searchResults: any[];
  isPending?: boolean;
  suggestedCategoryId?: string;
}

interface StepInput {
  id: string;
  instruction: string;
  image?: File | null;
  imagePreview?: string | null;
}

const DIFFICULTIES = [
  { id: "1", name: "Kolay" },
  { id: "2", name: "Orta" },
  { id: "3", name: "Zor" },
];

import type { RecipeDetailResponse } from "@/entities/recipe/api/recipeApi";

export interface RecipeEditorFormProps {
  initialData?: RecipeDetailResponse;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  isPending: boolean;
  headerTitle?: string;
  submitButtonText?: string;
  aiSuggestions?: { description: string | null; steps: string[] };
  extraActions?: React.ReactNode;
}

// Reusable Meta Input Component
function MetaInputBox({ label, unit, value, onChange, min = "0", errorText }: { label: string, unit: string, value: string, onChange: (val: string) => void, min?: string, errorText?: string }) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-4 flex flex-col">
      <span className={`text-xs font-bold uppercase tracking-wider mb-2 ${errorText ? 'text-[#588157]' : 'text-muted-foreground'}`}>{label}</span>
      <div className={`flex items-center gap-2 bg-muted/40 border rounded-xl px-4 py-3 transition-colors ${errorText ? 'border-[#588157] bg-[#588157]/5' : 'border-muted focus-within:border-primary/50 hover:border-primary/30'}`}>
        <input 
          type="number" 
          value={value} 
          onChange={(e) => {
            onChange(e.target.value);
          }}
          className="w-full bg-transparent font-medium text-foreground outline-none"
          min={min}
        />
        <span className="text-muted-foreground text-sm">{unit}</span>
      </div>
      {errorText && <span className="text-[#588157] text-[10px] font-bold mt-2">{errorText}</span>}
    </div>
  );
}

// Reusable Select Component
function MetaSelectBox({ label, value, onChange, options, defaultOption, errorText }: { label: string, value: string, onChange: (val: string) => void, options: { id: string, name: string }[], defaultOption?: string, errorText?: string }) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-4 flex flex-col">
      <span className={`text-xs font-bold uppercase tracking-wider mb-2 ${errorText ? 'text-[#588157]' : 'text-muted-foreground'}`}>{label}</span>
      <div className="relative">
        <select 
          value={value} 
          onChange={(e) => {
            onChange(e.target.value);
          }}
          className={`w-full bg-muted/40 border rounded-xl px-4 py-3 appearance-none font-medium text-foreground outline-none transition-colors ${errorText ? 'border-[#588157] bg-[#588157]/5' : 'border-muted hover:border-primary/30 focus:border-primary/50'}`}
        >
          {defaultOption && <option value="" disabled className="text-foreground bg-neutral-50 dark:bg-neutral-900">{defaultOption}</option>}
          {options.map(opt => <option key={opt.id} value={opt.id} className="text-foreground bg-neutral-50 dark:bg-neutral-900">{opt.name}</option>)}
        </select>
        <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {errorText && <span className="text-[#588157] text-[10px] font-bold mt-2">{errorText}</span>}
    </div>
  );
}

// Reusable Tag/Category Group
function TaxonomyGroup({ label, items, selectedIds, onToggle, errorText }: { label: string, items: any[], selectedIds: number[], onToggle: (id: number) => void, errorText?: string }) {
  return (
    <div className={`bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-4 flex flex-col gap-3 transition-colors ${errorText ? 'border border-[#588157] bg-[#588157]/5' : ''}`}>
      <span className={`text-xs font-bold uppercase tracking-wider ${errorText ? 'text-[#588157]' : 'text-muted-foreground'}`}>{label}</span>
      <div className="flex flex-wrap gap-2">
        {items.map((item: any) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                isSelected 
                  ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                  : errorText 
                    ? 'bg-transparent text-[#588157] border-[#588157] hover:bg-[#588157]/10'
                    : 'bg-muted/40 dark:bg-neutral-800 text-muted-foreground border-muted/50 hover:border-primary/50'
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </div>
      {errorText && <span className="text-[#588157] text-[10px] font-bold mt-1">{errorText}</span>}
    </div>
  );
}

export const RecipeEditorForm = ({ initialData, onSubmit, onCancel, isPending, headerTitle, submitButtonText = "Tarifi Kaydet",
  aiSuggestions,
  extraActions
}: RecipeEditorFormProps) => {

      const fileInputRef = useRef<HTMLInputElement>(null);

  const draftKey = initialData?.id ? `recipe-draft-${initialData.id}` : "recipe-draft-new";

  const getInitial = (key: string, defaultVal: any) => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[key] !== undefined && parsed[key] !== null) return parsed[key];
      }
    } catch (e) {}
    return defaultVal;
  };

  const [title, setTitle] = useState<string>(getInitial("title", initialData?.title || ""));
  const [description, setDescription] = useState<string>(getInitial("description", initialData?.description || ""));
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
   
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(initialData?.images?.find((i: any) => i.isMain)?.imageUrl || null);

  const difficultyMap: Record<string, string> = {
    "Easy": "1",
    "Medium": "2",
    "Hard": "3",
    "1": "1",
    "2": "2",
    "3": "3"
  };

  const visibilityMap: Record<string, string> = {
    "Private": "1",
    "Public": "2",
    "1": "1",
    "2": "2"
  };

  const initialDiff = initialData?.difficulty ? (difficultyMap[initialData?.difficulty.toString()] || "1") : "";
  const initialVis = initialData?.visibility ? (visibilityMap[initialData?.visibility.toString()] || "2") : "";

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    getInitial("selectedCategoryIds", Array.from(new Set(initialData?.categories?.map((c: any) => c.id) || [])))
  );
  const [difficulty, setDifficulty] = useState<string>(getInitial("difficulty", initialDiff));
  const [servings, setServings] = useState<string>(getInitial("servings", initialData?.servings?.toString() || ""));
  const [prepTime, setPrepTime] = useState<string>(getInitial("prepTime", initialData?.prepTime?.toString() || ""));
  const [cookTime, setCookTime] = useState<string>(getInitial("cookTime", initialData?.cookTime?.toString() || ""));
  const [visibility, setVisibility] = useState<string>(getInitial("visibility", initialVis)); 
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [activeDescTab, setActiveDescTab] = useState<'original' | 'ai'>('original');
  const [activeStepTabs, setActiveStepTabs] = useState<Record<string, 'original' | 'ai'>>({});
  
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    getInitial("selectedTagIds", Array.from(new Set(initialData?.tags?.map((t: any) => t.id) || [])))
  );

  const [ingredients, setIngredients] = useState<IngredientInput[]>(
    getInitial("ingredients", initialData?.ingredients && initialData.ingredients.length > 0 
      ? initialData.ingredients.map((ing, i) => ({
          id: i.toString(),
          qty: ing.amount.toString(),
          unitId: ing.unitId.toString(),
          ingredientId: ing.ingredientId || "",
          name: ing.ingredientName,
          unitFamily: ing.unitFamily as MeasurementCategory,
          isSearching: false,
          searchResults: []
        }))
      : [{ id: "1", qty: "", unitId: "", ingredientId: "", name: "", isSearching: false, searchResults: [] }]
    )
  );

  const [steps, setSteps] = useState<StepInput[]>(
    getInitial("steps", initialData?.steps && initialData.steps.length > 0
      ? initialData.steps.map(s => ({
          id: s.id.toString(),
          instruction: s.instruction,
           
          imagePreview: initialData?.images?.find((i: any) => i.stepId === s.id)?.imageUrl || null
        }))
      : [{ id: "1", instruction: "" }]
    )
  );

  useEffect(() => {
    const draftData = {
      title,
      description,
      difficulty,
      servings,
      prepTime,
      cookTime,
      visibility,
      selectedCategoryIds,
      selectedTagIds,
      ingredients: ingredients.map(ing => ({...ing, isSearching: false, searchResults: []})),
      steps: steps.map(s => ({...s, image: null, imagePreview: s.imagePreview}))
    };
    localStorage.setItem(draftKey, JSON.stringify(draftData));
  }, [title, description, difficulty, servings, prepTime, cookTime, visibility, selectedCategoryIds, selectedTagIds, ingredients, steps, draftKey]);


  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingIngredientName, setPendingIngredientName] = useState("");
  const [pendingIngredientRowId, setPendingIngredientRowId] = useState("");
  const [newIngCategory, setNewIngCategory] = useState("");
  const [newIngUnit, setNewIngUnit] = useState<MeasurementUnit>(MeasurementUnit.Piece);

  // Fetch Pantry Categories (for new ingredient suggestions)
  const { data: pantryCategories = [] } = useQuery({
    queryKey: ['ingredient-categories'],
    queryFn: () => pantryApi.getCategories()
  });

  // Fetch Recipe Taxonomy
  const { data: recipeCategories = [] } = useAdminRecipeCategories();
  const { data: recipeTags = [] } = useAdminTags();

  const toggleCategory = (id: number) => {
    setErrors(err => ({...err, categories: ""}));
    setSelectedCategoryIds(prev => {
      if (prev.includes(id)) return prev.filter(c => c !== id);
      if (prev.length >= 3) {
        toast.error("En fazla 3 kategori seçebilirsiniz.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const toggleTag = (id: number) => {
    setErrors(err => ({...err, tags: ""}));
    setSelectedTagIds(prev => {
      if (prev.includes(id)) return prev.filter(t => t !== id);
      if (prev.length >= 5) {
        toast.error("En fazla 5 etiket seçebilirsiniz.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPhoto(file);
      setErrors(err => ({...err, coverPhoto: ""}));
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };



  const addIngredient = () => {
    setIngredients(prev => [...prev, { id: Date.now().toString(), qty: "", unitId: "", ingredientId: "", name: "", isSearching: false, searchResults: [] }]);
  };

  const removeIngredient = (id: string) => {
    setIngredients(prev => {
      if (prev.length > 1) {
        return prev.filter(ing => ing.id !== id);
      }
      return prev;
    });
  };

   
  const updateIngredient = (id: string, field: keyof IngredientInput, value: any) => {
    setErrors(err => ({...err, ingredients: ""}));
    setIngredients(prev => prev.map(ing => ing.id === id ? { ...ing, [field]: value } : ing));
  };

  // Ingredient Autocomplete Logic
  const handleIngredientSearch = async (id: string, keyword: string) => {
    setErrors(err => ({...err, ingredients: ""}));
    setIngredients(prev => prev.map(ing => 
      ing.id === id ? { ...ing, name: keyword, ingredientId: "" } : ing
    ));
    
    if (keyword.length >= 2) {
      setIngredients(prev => prev.map(ing => ing.id === id ? { ...ing, isSearching: true } : ing));
      try {
        const results = await pantryApi.searchIngredients(keyword);
        setIngredients(prev => prev.map(ing => ing.id === id ? { ...ing, searchResults: results } : ing));
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIngredients(prev => prev.map(ing => ing.id === id ? { ...ing, isSearching: false } : ing));
      }
    } else {
      setIngredients(prev => prev.map(ing => ing.id === id ? { ...ing, searchResults: [] } : ing));
    }
  };

   
  const handleSelectSearchResult = (id: string, result: any) => {
    setIngredients(prev => prev.map(ing => {
      if (ing.id === id) {
        const familyVal = typeof result.unitFamily === 'string' 
          ? MeasurementCategory[result.unitFamily as keyof typeof MeasurementCategory] 
          : result.unitFamily;

        return {
          ...ing,
          name: result.displayName,
          ingredientId: result.masterIngredientId,
          unitFamily: familyVal,
          searchResults: [], 
          unitId: MEASUREMENT_CATEGORY_UNITS[familyVal as MeasurementCategory]?.[0]?.toString() || ""
        };
      }
      return ing;
    }));
  };

  const handleAddNewIngredientClick = (id: string, name: string) => {
    setPendingIngredientRowId(id);
    setPendingIngredientName(name);
    setShowAddModal(true);
    updateIngredient(id, "searchResults", []); // Close dropdown
  };

  const handleAddNewIngredientConfirm = () => {
    if (!newIngCategory) return;
    
    setIngredients(prev => prev.map(ing => {
      if (ing.id === pendingIngredientRowId) {
        return {
          ...ing,
          name: pendingIngredientName,
          ingredientId: "",
          isPending: true,
          suggestedCategoryId: newIngCategory,
          unitId: newIngUnit.toString()
        };
      }
      return ing;
    }));
    
    setShowAddModal(false);
    setNewIngCategory("");
  };

  const addStep = () => {
    setSteps(prev => [...prev, { id: Date.now().toString(), instruction: "" }]);
  };

   
  const updateStep = (id: string, field: keyof StepInput, value: any) => {
    setErrors(err => ({...err, steps: ""}));
    setSteps(prev => prev.map(step => step.id === id ? { ...step, [field]: value } : step));
  };

  const removeStep = (id: string) => {
    setSteps(prev => {
      if (prev.length > 1) {
        return prev.filter(step => step.id !== id);
      }
      return prev;
    });
  };

  

  const handleSubmit = () => {
    setErrors({});
    const newErrors: Record<string, string> = {};
    let hasGlobalError = false;

    if (!(title || "").trim()) {
      newErrors.title = "Lütfen Tarif Adı alanını doldurun.";
      hasGlobalError = true;
    }
    
    if (!(description || "").trim()) {
      newErrors.description = "Lütfen tarifiniz için bir hikaye/açıklama girin.";
      hasGlobalError = true;
    }
    
    if (!initialData && !coverPhoto) {
      newErrors.coverPhoto = "Lütfen bir Kapak Fotoğrafı yükleyin.";
      hasGlobalError = true;
    }
    
    if (selectedCategoryIds.length === 0) {
      newErrors.categories = "Lütfen en az bir Kategori seçin.";
      hasGlobalError = true;
    }

    if (selectedTagIds.length === 0) {
      newErrors.tags = "Lütfen en az bir Etiket seçin.";
      hasGlobalError = true;
    }

    if (!difficulty) {
      newErrors.difficulty = "Zorluk derecesini seçin";
    }

    if (!visibility) {
      newErrors.visibility = "Görünürlük seçin";
    }

    if (!servings || parseInt(servings) <= 0) {
      newErrors.servings = "Geçerli bir porsiyon girin";
    }

    if (!prepTime || parseInt(prepTime) < 0) {
      newErrors.prepTime = "Geçerli bir süre girin";
    }

    if (!cookTime || parseInt(cookTime) < 0) {
      newErrors.cookTime = "Geçerli bir süre girin";
    }

    const validIngredients = ingredients.filter(i => (i.ingredientId || i.isPending) && i.qty && i.unitId);
    const hasIncompleteIngredient = ingredients.some(i => 
      ((i.name || "").trim() !== "" || i.qty !== "" || i.unitId !== "") && 
      !( (i.ingredientId || i.isPending) && i.qty && i.unitId )
    );

    if (hasIncompleteIngredient) {
      newErrors.ingredients = "Eksik malzeme bilgisi var.";
      hasGlobalError = true;
    } else if (validIngredients.length === 0) {
      newErrors.ingredients = "Lütfen en az bir malzeme ekleyin.";
      hasGlobalError = true;
    }

    const validSteps = steps.filter(s => (s.instruction || "").trim() !== "");
    const hasIncompleteStep = steps.some(s => (s.instruction || "").trim() === "");
    
    if (hasIncompleteStep) {
      newErrors.steps = "Açıklaması boş olan adımlar var.";
      hasGlobalError = true;
    } else if (validSteps.length === 0) {
      newErrors.steps = "Lütfen en az bir adım ekleyin.";
      hasGlobalError = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorMessage = Object.values(newErrors)[0];
      toast.error(firstErrorMessage || "Lütfen eksik alanları (kırmızıyla işaretlenmiş) doldurun.");
      return;
    }

    const formData = new FormData();
    formData.append("Title", title);
    formData.append("Description", description);
    formData.append("Visibility", visibility); // "1" or "2"
    formData.append("Difficulty", difficulty); // "1", "2" or "3"
    formData.append("Servings", servings);
    formData.append("PrepTime", prepTime);
    formData.append("CookTime", cookTime);
    
    const uniqueCategoryIds = Array.from(new Set(selectedCategoryIds));
    const uniqueTagIds = Array.from(new Set(selectedTagIds));

    if (uniqueCategoryIds.length === 0 || uniqueCategoryIds.length > 3) {
      toast.error("En az 1, en fazla 3 kategori seçebilirsiniz.");
      return;
    }

    if (uniqueTagIds.length > 5) {
      toast.error("En fazla 5 etiket seçebilirsiniz.");
      return;
    }

    uniqueCategoryIds.forEach(id => {
      formData.append("CategoryIds", id.toString());
    });

    uniqueTagIds.forEach(id => {
      formData.append("TagIds", id.toString());
    });

    if (coverPhoto) {
      formData.append(initialData ? "NewMainImage" : "MainImage", coverPhoto);
    }

    const formattedIngredients = validIngredients.map(i => ({
      IngredientId: i.ingredientId || null,
      RequestedName: i.isPending ? i.name : null,
      SuggestedCategoryId: i.isPending ? i.suggestedCategoryId : null,
      Amount: parseFloat(i.qty) || 0,
      UnitId: parseInt(i.unitId) || 1
    }));
    formData.append("IngredientsJson", JSON.stringify(formattedIngredients));

    const formattedSteps = steps
      .filter(s => s.instruction.trim() !== "")
      .map((s, index) => ({
        StepNumber: index + 1,
        Instruction: s.instruction
      }));
    formData.append("StepsJson", JSON.stringify(formattedSteps));

    steps.filter(s => s.instruction.trim() !== "").forEach((s, index) => {
      const stepNum = index + 1;
      if (s.image) {
        formData.append("StepImages", s.image);
        formData.append("StepImageStepNumbers", stepNum.toString());
      }
    });

    localStorage.removeItem(draftKey);
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col min-h-screen">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-muted/20">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <span>Tarifler</span>
          <span>/</span>
          <span className="text-foreground">{headerTitle}</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              localStorage.removeItem(draftKey);
              onCancel();
            }}
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl font-bold text-foreground hover:bg-muted/50 transition-colors"
          >
            İptal
          </button>
          {extraActions}
          <button 
            onClick={handleSubmit}
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl font-bold bg-[#588157] hover:bg-[#3a5a39] text-white transition-colors flex items-center gap-2 shadow-lg shadow-[#588157]/20 disabled:opacity-50"
          >
            {isPending ? <span className="animate-pulse">Kaydediliyor...</span> : <><Save className="w-4 h-4" /> {submitButtonText}</>}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* LEFT COLUMN: Basic Info & Meta */}
        <div className="lg:w-5/12 flex flex-col gap-8 shrink-0">
          
          {/* Title & Description */}
          <div className="flex flex-col gap-4">
            <div className={`flex flex-col rounded-xl p-2 transition-colors ${errors.title ? 'bg-[#588157]/5 border border-[#588157]' : ''}`}>
              <input
                type="text"
                placeholder="Tarif Adı"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors(prev => ({...prev, title: ""})); }}
                className={`text-4xl md:text-5xl font-black bg-transparent border-none outline-none w-full transition-colors px-2 ${errors.title ? 'text-[#588157] placeholder:text-[#588157]/50' : 'text-foreground/30 placeholder:text-foreground/30 focus:text-foreground'}`}
              />
              {errors.title && <span className="text-[#588157] text-xs font-bold px-2 mt-2">{errors.title}</span>}
            </div>
            <div className={aiSuggestions?.description && aiSuggestions.description !== description ? "flex flex-col gap-3" : ""}>
              {/* Sol: Orijinal Metin */}
              <div className={`flex flex-col rounded-xl p-3 transition-colors h-full ${errors.description ? 'bg-[#588157]/5 border border-[#588157]' : 'bg-muted/10 border border-muted/20'}`}>
                <div className="flex items-center gap-2 mb-2 opacity-60">
                  <span className="text-[10px] font-black uppercase tracking-wider">Orijinal Metin</span>
                </div>
                <textarea
                  placeholder="Bu yemeğin hikayesini anlatın... (Örn. 'Büyükannemden bana kalan, pazar günlerinin vazgeçilmezi...')"
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setErrors(prev => ({...prev, description: ""})); }}
                  className={`text-base bg-transparent border-none outline-none w-full resize-none h-full min-h-[120px] ${errors.description ? 'text-[#588157] placeholder:text-[#588157]/50' : 'text-muted-foreground placeholder:text-muted-foreground/50'}`}
                />
                {errors.description && <span className="text-[#588157] text-xs font-bold mt-2">{errors.description}</span>}
              </div>

              {/* Sağ: AI Önerisi */}
              {aiSuggestions?.description && aiSuggestions.description !== description && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="relative group/ai w-full"
                >
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/40 via-emerald-500/30 to-primary/40 rounded-2xl blur-[2px] opacity-60 group-hover/ai:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative h-full bg-background/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl border border-primary/15 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/8 via-emerald-500/5 to-transparent border-b border-primary/10 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center">
                          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                        </div>
                        <span className="text-xs font-black text-primary uppercase tracking-wider">AI Düzeltme Önerisi</span>
                      </div>
                      <button 
                        onClick={() => setDescription(aiSuggestions.description!)}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-emerald-600 text-white px-4 py-1.5 rounded-xl text-[11px] font-black hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Uygula
                      </button>
                    </div>
                    
                    <div className="p-4 flex-1 overflow-auto">
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{aiSuggestions.description}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Cover Photo Upload */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.currentTarget.click();
              }
            }}
            className={`w-full aspect-[4/3] md:aspect-[16/9] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${errors.coverPhoto ? 'border-[#588157] bg-[#588157]/5' : coverPhoto ? 'border-primary/50' : 'border-muted/40 hover:bg-muted/5 hover:border-primary/50'}`}
          >
            {coverPhotoPreview ? (
              <>
                <img src={coverPhotoPreview} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white font-bold">Fotoğrafı Değiştir</span>
                </div>
              </>
            ) : (
              <div className={`flex flex-col items-center gap-3 transition-colors ${errors.coverPhoto ? 'text-[#588157] group-hover:text-[#3a5a39]' : 'text-muted-foreground group-hover:text-primary'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${errors.coverPhoto ? 'bg-[#588157]/10 group-hover:bg-[#588157]/20' : 'bg-muted/20 group-hover:bg-primary/10'}`}>
                  <ImagePlus className="w-8 h-8" />
                </div>
                <span className={`font-bold ${errors.coverPhoto ? 'text-[#588157]' : 'text-foreground'}`}>Kapak Fotoğrafı Yükle</span>
                <span className="text-sm">PNG, JPG (Maks 10MB)</span>
                {errors.coverPhoto && <span className="text-[#588157] text-xs font-bold mt-2">{errors.coverPhoto}</span>}
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/png, image/jpeg"
              onChange={handlePhotoUpload} 
            />
          </div>

          {/* Meta Information Cards */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <MetaSelectBox 
                label="Zorluk Derecesi"
                value={difficulty}
                onChange={(val) => { setDifficulty(val); setErrors(prev => ({...prev, difficulty: ""})) }}
                options={DIFFICULTIES}
                defaultOption="Zorluk Seçin"
                errorText={errors.difficulty}
              />
              <MetaSelectBox 
                label="Görünürlük"
                value={visibility}
                onChange={(val) => { setVisibility(val); setErrors(prev => ({...prev, visibility: ""})) }}
                options={[{ id: "2", name: "Herkese Açık (Public)" }, { id: "1", name: "Sadece Ben (Private)" }]}
                defaultOption="Görünürlük Seçin"
                errorText={errors.visibility}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <MetaInputBox label="Porsiyon" unit="Kişilik" value={servings} onChange={(val) => { setServings(val); setErrors(prev => ({...prev, servings: ""})) }} min="1" errorText={errors.servings} />
              <MetaInputBox label="Hazırlık" unit="Dk" value={prepTime} onChange={(val) => { setPrepTime(val); setErrors(prev => ({...prev, prepTime: ""})) }} errorText={errors.prepTime} />
              <MetaInputBox label="Pişirme" unit="Dk" value={cookTime} onChange={(val) => { setCookTime(val); setErrors(prev => ({...prev, cookTime: ""})) }} errorText={errors.cookTime} />
            </div>

            <TaxonomyGroup 
              label="Kategoriler" 
              items={recipeCategories} 
              selectedIds={selectedCategoryIds} 
              onToggle={toggleCategory} 
              errorText={errors.categories}
            />

            <TaxonomyGroup 
              label="Etiketler" 
              items={recipeTags} 
              selectedIds={selectedTagIds} 
              onToggle={toggleTag} 
              errorText={errors.tags}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Ingredients & Preparation */}
        <div className="lg:w-7/12 flex flex-col gap-6">
          
          <div className={`bg-neutral-50 dark:bg-neutral-900/50 rounded-[2rem] p-6 md:p-8 transition-colors ${errors.ingredients ? 'border border-[#588157] bg-[#588157]/5' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border transition-colors ${errors.ingredients ? 'bg-[#588157]/10 border-[#588157]/20' : 'bg-muted/40 dark:bg-neutral-800 border-muted/20'}`}>
                  <span className="text-primary font-bold text-lg">⚖️</span>
                </div>
                <h3 className={`text-2xl font-bold transition-colors ${errors.ingredients ? 'text-[#588157]' : 'text-foreground'}`}>Malzemeler</h3>
                {errors.ingredients && <span className="text-[#588157] text-xs font-bold bg-[#588157]/10 px-3 py-1 rounded-full">{errors.ingredients}</span>}
              </div>
              <span className="text-sm font-bold text-muted-foreground">{ingredients.length} ADET</span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-[auto_60px_100px_1fr_auto] gap-4 px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                <div className="w-6"></div>
                <div>Miktar</div>
                <div>Birim</div>
                <div>Malzeme (Arama)</div>
                <div className="w-6"></div>
              </div>

              {ingredients.map((ing) => {
                const allowedUnits = ing.unitFamily 
                  ? MEASUREMENT_CATEGORY_UNITS[ing.unitFamily] || ALL_UNITS
                  : ALL_UNITS;

                return (
                  <div key={ing.id} className={`grid grid-cols-[auto_60px_100px_1fr_auto] gap-4 items-center p-2 rounded-xl shadow-sm border transition-colors group relative ${errors.ingredients ? 'bg-background border-[#588157]/30' : 'bg-muted/40 dark:bg-neutral-800 border-muted/10'}`}>
                    <div className="w-6 flex items-center justify-center text-muted-foreground/30 cursor-grab">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    
                    <input 
                      type="number" 
                      value={ing.qty} 
                      onChange={(e) => updateIngredient(ing.id, "qty", e.target.value)}
                      className="w-full bg-transparent outline-none text-center font-medium placeholder:text-muted-foreground/30"
                      placeholder="1"
                    />
                    
                    <div className="relative">
                      <select 
                        value={ing.unitId} 
                        onChange={(e) => updateIngredient(ing.id, "unitId", e.target.value)}
                        className={`w-full bg-transparent outline-none text-sm font-medium appearance-none ${!ing.ingredientId && !ing.isPending ? 'opacity-50' : ''}`}
                        disabled={!ing.ingredientId && !ing.isPending}
                      >
                        <option value="" disabled className="text-foreground bg-neutral-50 dark:bg-neutral-900">Seç...</option>
                        {allowedUnits.map(unitVal => (
                          <option key={unitVal} value={unitVal} className="text-foreground bg-neutral-50 dark:bg-neutral-900">
                            {MEASUREMENT_UNIT_LABELS[unitVal as MeasurementUnit]}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="relative w-full">
                      <input 
                        type="text" 
                        value={ing.name} 
                        onChange={(e) => handleIngredientSearch(ing.id, e.target.value)}
                        className={`w-full bg-transparent outline-none font-medium pr-8 ${ing.ingredientId ? 'text-primary' : ing.isPending ? 'text-orange-500' : 'text-foreground'}`}
                        placeholder="Malzeme ara..."
                        disabled={ing.isPending}
                      />
                      {ing.isSearching ? (
                        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin absolute right-2 top-1/2 -translate-y-1/2" />
                      ) : (
                        <Search className="w-4 h-4 text-muted-foreground/50 absolute right-2 top-1/2 -translate-y-1/2" />
                      )}

                      <AnimatePresence>
                        {(ing.searchResults.length > 0 || (ing.name.length >= 2 && !ing.isSearching && !ing.ingredientId && !ing.isPending)) && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-muted/40 dark:bg-neutral-800 rounded-xl shadow-xl border border-muted/20 z-50 overflow-hidden max-h-56 overflow-y-auto"
                          >
                            {ing.searchResults.length > 0 ? (
                              ing.searchResults.map((result, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSelectSearchResult(ing.id, result)}
                                  className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors border-b border-muted/10 last:border-0 flex items-center justify-between group"
                                >
                                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">{result.displayName}</span>
                                  <span className="text-xs text-muted-foreground px-2 py-1 bg-muted/20 rounded-md">
                                    {result.categoryName}
                                  </span>
                                </button>
                              ))
                            ) : (
                              <div className="p-4 text-center">
                                <p className="text-sm text-muted-foreground mb-3">Aradığınız malzeme veritabanında bulunamadı.</p>
                                <button
                                  onClick={() => handleAddNewIngredientClick(ing.id, ing.name)}
                                  className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                                >
                                  <Plus className="w-4 h-4" /> Yeni Ekle ve Öner
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button 
                      onClick={() => removeIngredient(ing.id)}
                      className="w-6 flex items-center justify-center text-muted-foreground/50 hover:text-[#588157] transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

              <button 
                onClick={addIngredient}
                className="flex items-center gap-2 text-primary font-bold px-2 py-3 hover:bg-primary/5 rounded-xl transition-colors w-fit mt-2"
              >
                <Plus className="w-5 h-5" /> Malzeme Ekle
              </button>
            </div>
          </div>

          <div className={`bg-neutral-50 dark:bg-neutral-900/50 rounded-[2rem] p-6 md:p-8 transition-colors ${errors.steps ? 'border border-[#588157] bg-[#588157]/5' : ''}`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border transition-colors ${errors.steps ? 'bg-[#588157]/10 border-[#588157]/20' : 'bg-muted/40 dark:bg-neutral-800 border-muted/20'}`}>
                  <span className="text-primary font-bold text-lg">📖</span>
                </div>
                <h3 className={`text-2xl font-bold transition-colors ${errors.steps ? 'text-[#588157]' : 'text-foreground'}`}>Hazırlanışı</h3>
                {errors.steps && <span className="text-[#588157] text-xs font-bold bg-[#588157]/10 px-3 py-1 rounded-full">{errors.steps}</span>}
              </div>
              <span className="text-sm font-bold text-muted-foreground">{steps.length} ADIM</span>
            </div>

            <div className="flex flex-col gap-6 relative">
              <div className="absolute left-6 top-6 bottom-16 w-px bg-muted/20 z-0"></div>

              {steps.map((step, index) => (
                <div key={step.id} className="flex gap-6 relative z-10 group">
                  <div className="w-12 h-12 rounded-full bg-[#588157] text-white flex items-center justify-center font-black flex-shrink-0 shadow-md">
                    {index + 1}
                  </div>
                  <div className="flex-1 bg-muted/40 dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-muted/10 relative">
                    <div className={aiSuggestions?.steps && aiSuggestions.steps[index] && aiSuggestions.steps[index] !== step.instruction ? "flex flex-col gap-3" : ""}>
                      
                      {/* Sol: Orijinal Adım Metni */}
                      <div className="flex flex-col h-full bg-background/50 border border-muted/20 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2 opacity-60">
                          <span className="text-[10px] font-black uppercase tracking-wider">Orijinal Metin</span>
                        </div>
                        <textarea 
                          value={step.instruction}
                          onChange={(e) => updateStep(step.id, "instruction", e.target.value)}
                          placeholder="Bu adımda ne yapılması gerektiğini açıklayın..."
                          className={`w-full bg-transparent outline-none resize-none text-foreground leading-relaxed h-full ${aiSuggestions?.steps && aiSuggestions.steps[index] && aiSuggestions.steps[index] !== step.instruction ? 'min-h-[120px]' : 'min-h-[100px]'}`}
                        />
                      </div>
                      
                      {/* Sağ: AI Adım Önerisi */}
                      {aiSuggestions?.steps && aiSuggestions.steps[index] && aiSuggestions.steps[index] !== step.instruction && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                          className="relative group/aistep w-full"
                        >
                          <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 via-emerald-500/20 to-primary/30 rounded-xl blur-[1px] opacity-50 group-hover/aistep:opacity-90 transition-opacity duration-500" />
                          
                          <div className="relative h-full bg-background/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-xl border border-primary/10 overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-primary/8 to-transparent border-b border-primary/10 shrink-0">
                              <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-wider">AI Düzeltme</span>
                              </div>
                              <button 
                                onClick={(e) => { 
                                  e.preventDefault(); 
                                  updateStep(step.id, "instruction", aiSuggestions.steps![index]); 
                                }}
                                className="flex items-center gap-1 bg-gradient-to-r from-primary to-emerald-600 text-white px-3 py-1 rounded-lg text-[10px] font-black hover:shadow-md hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5" /> Uygula
                              </button>
                            </div>
                            <div className="p-4 flex-1 overflow-auto min-h-[120px]">
                              <p className="text-sm text-foreground/90 leading-relaxed">{aiSuggestions.steps[index]}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                        <ImagePlus className="w-4 h-4" />
                        {step.image ? "Fotoğrafı Değiştir" : "Fotoğraf Ekle (İsteğe Bağlı)"}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/png, image/jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              updateStep(step.id, "image", file);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                updateStep(step.id, "imagePreview", reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      
                      {step.imagePreview && (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-muted/20 shadow-sm">
                          <img src={step.imagePreview} alt={`Adım ${index + 1}`} className="w-full h-full object-cover" />
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              updateStep(step.id, "image", null);
                              updateStep(step.id, "imagePreview", null);
                            }}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {steps.length > 1 && (
                      <button 
                        onClick={() => removeStep(step.id)}
                        className="absolute -right-3 -top-3 w-8 h-8 rounded-full bg-muted/40 dark:bg-neutral-800 border border-muted/20 shadow-sm flex items-center justify-center text-muted-foreground hover:text-[#588157] opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button 
                onClick={addStep}
                className="ml-18 bg-transparent border-2 border-dashed border-muted/40 text-muted-foreground font-bold hover:bg-muted/10 hover:text-foreground transition-colors py-4 rounded-2xl flex items-center justify-center gap-2 z-10"
                style={{ marginLeft: '4.5rem' }}
              >
                <Plus className="w-5 h-5" /> Adım Ekle
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Add New Ingredient Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-muted/20 flex items-center justify-between">
                <h3 className="font-black text-xl text-foreground">Yeni Malzeme Öner</h3>
                <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-5">
                <p className="text-sm text-muted-foreground">
                  "<span className="font-bold text-foreground">{pendingIngredientName}</span>" sistemimizde bulunamadı. Yapay zeka onayına göndererek sisteme (ve dolabınıza) eklenmesini sağlayabilirsiniz.
                </p>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Önerilen Kategori</label>
                  <Select value={newIngCategory} onValueChange={setNewIngCategory}>
                    <SelectTrigger className="w-full bg-neutral-100 dark:bg-neutral-800 h-12 rounded-xl font-medium text-foreground border-none ring-0 focus:ring-0">
                      <SelectValue placeholder="Kategori Seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border/10 rounded-xl shadow-xl z-[200]">
                      {pantryCategories.map((c: any) => (
                        <SelectItem key={c.id} value={c.id} className="rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Varsayılan Birim</label>
                  <Select value={newIngUnit?.toString()} onValueChange={(val) => setNewIngUnit(Number(val) as MeasurementUnit)}>
                    <SelectTrigger className="w-full bg-neutral-100 dark:bg-neutral-800 h-12 rounded-xl font-medium text-foreground border-none ring-0 focus:ring-0">
                      <SelectValue placeholder="Birim Seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border/10 rounded-xl shadow-xl z-[200]">
                      {ALL_UNITS.map(unitVal => (
                        <SelectItem key={unitVal} value={unitVal.toString()} className="rounded-lg focus:bg-primary/10 focus:text-primary cursor-pointer">
                          {MEASUREMENT_UNIT_LABELS[unitVal as MeasurementUnit]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="bg-orange-500/10 text-orange-600 dark:text-orange-400 p-4 rounded-xl text-sm font-medium border border-orange-500/20 mt-2">
                  <span className="font-bold">Not:</span> Bu malzeme onaya gönderilecek ve "Beklemede" olarak işaretlenecektir. Ancak tarife kaydedilebilecektir.
                </div>

                <button 
                  onClick={handleAddNewIngredientConfirm}
                  disabled={!newIngCategory}
                  className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  Onaya Gönder ve Tarife Ekle
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
