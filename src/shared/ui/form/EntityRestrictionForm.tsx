import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ListFilter, AlertCircle } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Checkbox } from "@/shared/ui/checkbox";
import { motion } from "framer-motion";
import { useAdminIngredients } from "@/entities/admin-ingredient/api/adminIngredientQueries";
import { useAdminCategories } from "@/entities/admin-category/api/adminCategoryQueries";
import { MultiSelectBox } from "@/shared/ui/multi-select-box";
import { toPascalCase } from "@/shared/lib/icon-helpers";
import { useDebounce } from "@/shared/hooks/useDebounce";

const entityRestrictionSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  description: z.string().optional().nullable(),
  iconName: z.string().min(2, "İkon adı zorunludur").refine(
    (val) => {
      const pascalCaseName = toPascalCase(val);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return !!(LucideIcons as any)[pascalCaseName];
    },
    {
      message: "Geçersiz ikon adı. Lütfen geçerli bir Lucide ikon adı girin.",
    }
  ),
  isActive: z.boolean().optional(),
  excludedIngredientIds: z.array(z.string()),
  excludedCategoryIds: z.array(z.string()),
});

export type EntityRestrictionFormValues = z.infer<typeof entityRestrictionSchema>;

interface EntityRestrictionFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  isUpdateMode?: boolean;
  onSubmit: (data: EntityRestrictionFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
  
  // Customization
  entityNameLabel?: string;
  entityNamePlaceholder?: string;
  defaultIconName?: string;
  themeColor?: 'primary' | 'emerald';
}

export const EntityRestrictionForm = ({ 
  initialData, 
  isUpdateMode = false, 
  onSubmit, 
  onCancel, 
  isPending, 
  submitLabel,
  entityNameLabel = "Ad",
  entityNamePlaceholder = "Örn: ...",
  defaultIconName = "Leaf",
  themeColor = "primary"
}: EntityRestrictionFormProps) => {
  const [ingredientSearch, setIngredientSearch] = useState("");
  const debouncedIngredientSearch = useDebounce(ingredientSearch, 300);

  const { data: ingredientsData, isLoading: isLoadingIngredients } = useAdminIngredients(0, 10, debouncedIngredientSearch);
  const { data: categoriesData, isLoading: isLoadingCategories } = useAdminCategories();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<EntityRestrictionFormValues>({
    resolver: zodResolver(entityRestrictionSchema),
    defaultValues: {
      name: "",
      description: "",
      iconName: defaultIconName,
      isActive: true,
      excludedIngredientIds: [],
      excludedCategoryIds: [],
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        description: initialData.description || "",
        iconName: initialData.iconName || defaultIconName,
        isActive: initialData.isActive ?? true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        excludedIngredientIds: initialData.excludedIngredients?.map((i: any) => i.id) || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        excludedCategoryIds: initialData.excludedCategories?.map((c: any) => c.id) || [],
      });
    }
  }, [initialData, reset, defaultIconName]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchIconName = watch("iconName");
  const parsedIconName = watchIconName ? toPascalCase(watchIconName) : "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = parsedIconName ? (LucideIcons as any)[parsedIconName] : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ingredientsList = Array.isArray(ingredientsData) ? ingredientsData : (ingredientsData as any)?.items || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoriesList = Array.isArray(categoriesData) ? categoriesData : (categoriesData as any)?.items || [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeIngredients = ingredientsList.filter((i: any) => !i.deletedDate && i.isActive !== false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeCategories = categoriesList.filter((c: any) => !c.deletedDate && c.isActive !== false);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ingredientOptions = activeIngredients.map((i: any) => ({ id: i.id, label: i.name }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoryOptions = activeCategories.map((c: any) => ({ id: c.id, label: c.name }));

  // Dynamic classes based on themeColor
  const themeClasses = {
    emerald: {
      text: "text-emerald-600",
      bg: "bg-emerald-600",
      bgHover: "hover:bg-emerald-700",
      ringFocus: "focus-visible:ring-emerald-500/50",
      shadow: "shadow-emerald-500/20",
      shadowHover: "hover:shadow-emerald-500/30",
      borderHover: "hover:border-emerald-500/30",
      checkboxDataState: "data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600",
      gradientBar: "bg-emerald-500/40",
      iconBg: "bg-emerald-500/10",
      pulseBg: "bg-emerald-500",
      categoryBoxBg: "bg-emerald-500/5",
      categoryBoxBorder: "border-emerald-500/10",
    },
    primary: {
      text: "text-primary",
      bg: "bg-primary text-primary-foreground",
      bgHover: "hover:bg-primary/90",
      ringFocus: "focus-visible:ring-primary/50",
      shadow: "shadow-primary/20",
      shadowHover: "hover:shadow-primary/30",
      borderHover: "hover:border-primary/30",
      checkboxDataState: "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
      gradientBar: "bg-primary/40",
      iconBg: "bg-primary/10",
      pulseBg: "bg-primary",
      categoryBoxBg: "bg-primary/5",
      categoryBoxBorder: "border-primary/10",
    }
  };

  const tc = themeClasses[themeColor];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-5"
      >
        {isUpdateMode && (
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className={`flex items-center space-x-4 bg-muted/40 p-4 rounded-xl border border-muted/60 transition-colors ${tc.borderHover}`}
          >
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Checkbox 
                  id="isActive" 
                  checked={field.value} 
                  onCheckedChange={field.onChange}
                  className={`w-5 h-5 rounded ${tc.checkboxDataState}`}
                />
              )}
            />
            <div className="space-y-1.5 leading-none flex-1">
              <Label htmlFor="isActive" className="text-sm font-bold cursor-pointer text-foreground">Aktif Profil</Label>
              <p className="text-xs text-muted-foreground">
                Pasif yapıldığında kullanıcılar bu kısıtlamayı göremez veya seçemez.
              </p>
            </div>
          </motion.div>
        )}

        <div className="space-y-2.5">
          <Label htmlFor="name" className="text-sm font-bold flex items-center gap-2">
            {entityNameLabel} <span className="text-destructive">*</span>
          </Label>
          <Input 
            id="name" 
            placeholder={entityNamePlaceholder} 
            {...register("name")} 
            className={`h-12 rounded-xl bg-background/50 border-muted-foreground/20 transition-all shadow-sm ${tc.ringFocus}`} 
          />
          {errors.name && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-destructive font-semibold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" /> {errors.name.message}
            </motion.p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="iconName" className="text-sm font-bold flex items-center gap-2">
            İkon Adı (Lucide) <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-3 items-center">
            <Input 
              id="iconName" 
              placeholder="Örn: Leaf, WheatOff, Drumstick" 
              {...register("iconName")} 
              className={`h-12 rounded-xl bg-background/50 border-muted-foreground/20 transition-all shadow-sm ${tc.ringFocus}`} 
            />
            <div className="w-12 h-12 border rounded-xl flex items-center justify-center shrink-0 bg-muted/20">
              {IconComponent ? <IconComponent className={`w-6 h-6 ${tc.text}`} /> : <HelpCircle className="w-6 h-6 text-muted-foreground opacity-50" />}
            </div>
          </div>
          {errors.iconName && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-destructive font-semibold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" /> {errors.iconName.message}
            </motion.p>
          )}
        </div>
        
        <div className="space-y-2.5">
          <Label htmlFor="description" className="text-sm font-bold">Açıklama (İsteğe Bağlı)</Label>
          <Textarea 
            id="description" 
            placeholder="Bu profil hakkında kullanıcıları bilgilendirecek kısa bir metin..." 
            {...register("description")} 
            className={`resize-none h-24 rounded-xl bg-background/50 border-muted-foreground/20 transition-all shadow-sm ${tc.ringFocus}`}
          />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl border border-muted/40 bg-gradient-to-br from-muted/30 to-background shadow-inner"
      >
        <div className={`absolute top-0 left-0 w-1 h-full ${tc.gradientBar}`} />
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2 border-b border-muted/50 pb-3">
            <div className={`p-1.5 rounded-lg ${tc.iconBg}`}>
              <ListFilter className={`w-4 h-4 ${tc.text}`} />
            </div>
            <h3 className="font-bold text-foreground">Dışlama Kuralları</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            <motion.div whileHover={{ scale: 1.01 }} className="space-y-3 transition-transform">
              <div className={`p-3 rounded-lg border ${tc.categoryBoxBg} ${tc.categoryBoxBorder}`}>
                <Label className={`text-sm font-bold flex items-center gap-1.5 mb-1 ${tc.text}`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${tc.pulseBg}`} /> Kategoriler
                </Label>
                <p className="text-[11px] text-muted-foreground leading-snug">Seçtiğiniz kategorideki tüm malzemeler toplu olarak dışlanır.</p>
              </div>
              <div className="px-1">
                <Controller
                  name="excludedCategoryIds"
                  control={control}
                  render={({ field }) => (
                    <MultiSelectBox
                      options={categoryOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={isLoadingCategories ? "Yükleniyor..." : "Kategori ara..."}
                    />
                  )}
                />
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }} className="space-y-3 transition-transform">
              <div className="bg-destructive/5 p-3 rounded-lg border border-destructive/10">
                <Label className="text-sm font-bold text-destructive flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" /> Malzemeler
                </Label>
                <p className="text-[11px] text-muted-foreground leading-snug">Sadece belirli ve spesifik malzemeleri dışlamak istiyorsanız seçin.</p>
              </div>
              <div className="px-1">
                <Controller
                  name="excludedIngredientIds"
                  control={control}
                  render={({ field }) => (
                    <MultiSelectBox
                      options={ingredientOptions}
                      value={field.value}
                      onChange={field.onChange}
                      onSearch={setIngredientSearch}
                      placeholder={isLoadingIngredients ? "Yükleniyor..." : "Malzeme ara..."}
                    />
                  )}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      <div className="pt-4 flex items-center gap-3 w-full sm:justify-end border-t border-muted/20">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel} 
          disabled={isPending}
          className="rounded-xl hover:bg-muted font-medium"
        >
          İptal
        </Button>
        <Button 
          type="submit" 
          disabled={isPending} 
          className={`px-8 rounded-xl font-bold shadow-lg transition-all relative overflow-hidden group ${tc.bg} ${tc.bgHover} ${tc.shadow} ${tc.shadowHover}`}
        >
          <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          {isPending ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> 
              İşleniyor...
            </span>
          ) : submitLabel}
        </Button>
      </div>
    </form>
  );
};
