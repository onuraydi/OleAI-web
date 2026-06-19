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

const formSchema = z.object({
  name: z.string().min(2, "Diyet adı en az 2 karakter olmalıdır"),
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

export type DietFormValues = z.infer<typeof formSchema>;

interface DietFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  isUpdateMode?: boolean;
  onSubmit: (data: DietFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}

export const DietForm = ({ initialData, isUpdateMode = false, onSubmit, onCancel, isPending, submitLabel }: DietFormProps) => {
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
  } = useForm<DietFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      iconName: "",
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
        iconName: initialData.iconName || "Leaf",
        isActive: initialData.isActive ?? true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        excludedIngredientIds: initialData.excludedIngredients?.map((i: any) => i.id) || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        excludedCategoryIds: initialData.excludedCategories?.map((c: any) => c.id) || [],
      });
    }
  }, [initialData, reset]);

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
            className="flex items-center space-x-4 bg-muted/40 p-4 rounded-xl border border-muted/60 transition-colors hover:border-emerald-500/30"
          >
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Checkbox 
                  id="isActive" 
                  checked={field.value} 
                  onCheckedChange={field.onChange}
                  className="w-5 h-5 rounded data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
              )}
            />
            <div className="space-y-1.5 leading-none flex-1">
              <Label htmlFor="isActive" className="text-sm font-bold cursor-pointer text-foreground">Aktif Profil</Label>
              <p className="text-xs text-muted-foreground">
                Pasif yapıldığında kullanıcılar bu diyeti göremez veya seçemez.
              </p>
            </div>
          </motion.div>
        )}

        <div className="space-y-2.5">
          <Label htmlFor="name" className="text-sm font-bold flex items-center gap-2">
            Diyet Adı <span className="text-destructive">*</span>
          </Label>
          <Input 
            id="name" 
            placeholder="Örn: Vegan, Glütensiz, Keto..." 
            {...register("name")} 
            className="h-12 rounded-xl bg-background/50 border-muted-foreground/20 focus-visible:ring-emerald-500/50 transition-all shadow-sm" 
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
              className="h-12 rounded-xl bg-background/50 border-muted-foreground/20 focus-visible:ring-emerald-500/50 transition-all shadow-sm" 
            />
            <div className="w-12 h-12 border rounded-xl flex items-center justify-center shrink-0 bg-muted/20">
              {IconComponent ? <IconComponent className="w-6 h-6 text-emerald-600" /> : <HelpCircle className="w-6 h-6 text-muted-foreground opacity-50" />}
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
            placeholder="Bu diyet profili hakkında kullanıcıları bilgilendirecek kısa bir metin..." 
            {...register("description")} 
            className="resize-none h-24 rounded-xl bg-background/50 border-muted-foreground/20 focus-visible:ring-emerald-500/50 transition-all shadow-sm"
          />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl border border-muted/40 bg-gradient-to-br from-muted/30 to-background shadow-inner"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/40" />
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-2 border-b border-muted/50 pb-3">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg">
              <ListFilter className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-foreground">Dışlama Kuralları</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            <motion.div whileHover={{ scale: 1.01 }} className="space-y-3 transition-transform">
              <div className="bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                <Label className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Kategoriler
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
          className="px-8 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all bg-emerald-600 hover:bg-emerald-700 text-white relative overflow-hidden group"
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
