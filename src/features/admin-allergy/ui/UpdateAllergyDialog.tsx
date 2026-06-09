import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/ui/dialog";
import { ListFilter, PencilLine, AlertCircle, Sparkles } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Checkbox } from "@/shared/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateAllergy, useAdminAllergyById } from "@/entities/admin-allergy";
import { useAdminIngredients } from "@/entities/admin-ingredient/api/adminIngredientQueries";
import { useAdminCategories } from "@/entities/admin-category/api/adminCategoryQueries";
import { MultiSelectBox } from "@/shared/ui/multi-select-box";
import { toPascalCase } from "@/shared/lib/icon-helpers";

const formSchema = z.object({
  name: z.string().min(2, "Alerji adı en az 2 karakter olmalıdır"),
  description: z.string().optional().nullable(),
  iconName: z.string().min(2, "İkon adı zorunludur").refine(
    (val) => {
      const pascalCaseName = toPascalCase(val);
      return !!(LucideIcons as any)[pascalCaseName];
    },
    {
      message: "Geçersiz ikon adı. Lütfen geçerli bir Lucide ikon adı girin.",
    }
  ),
  isActive: z.boolean(),
  excludedIngredientIds: z.array(z.string()),
  excludedCategoryIds: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateAllergyDialogProps {
  allergyId: string | null;
  onClose: () => void;
}

export const UpdateAllergyDialog = ({ allergyId, onClose }: UpdateAllergyDialogProps) => {
  const { data: allergy, isLoading: isLoadingAllergy } = useAdminAllergyById(allergyId as string);
  const { mutate: updateAllergy, isPending } = useUpdateAllergy();
  const { data: ingredientsData, isLoading: isLoadingIngredients } = useAdminIngredients();
  const { data: categoriesData, isLoading: isLoadingCategories } = useAdminCategories();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
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
    if (allergy) {
      reset({
        name: allergy.name,
        description: allergy.description || "",
        iconName: allergy.iconName || "ShieldAlert",
        isActive: allergy.isActive,
        // Backend returns objects in excludedIngredients and excludedCategories
        excludedIngredientIds: allergy.excludedIngredients?.map((i: any) => i.id) || [],
        excludedCategoryIds: allergy.excludedCategories?.map((c: any) => c.id) || [],
      });
    }
  }, [allergy, reset]);

  const watchIconName = watch("iconName");
  const parsedIconName = watchIconName ? toPascalCase(watchIconName) : "";
  const IconComponent = parsedIconName ? (LucideIcons as any)[parsedIconName] : null;

  const onSubmit = (data: FormValues) => {
    if (!allergyId) return;
    
    updateAllergy(
      { 
        id: allergyId, 
        name: data.name, 
        description: data.description,
        iconName: toPascalCase(data.iconName),
        isActive: data.isActive,
        excludedIngredientIds: data.excludedIngredientIds,
        excludedCategoryIds: data.excludedCategoryIds,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const ingredientsList = Array.isArray(ingredientsData) ? ingredientsData : (ingredientsData as any)?.items || [];
  const categoriesList = Array.isArray(categoriesData) ? categoriesData : (categoriesData as any)?.items || [];
  const activeIngredients = ingredientsList.filter((i: any) => !i.deletedDate && i.isActive !== false);
  const activeCategories = categoriesList.filter((c: any) => !c.deletedDate && c.isActive !== false);
  
  const ingredientOptions = activeIngredients.map((i: any) => ({ id: i.id, label: i.name }));
  const categoryOptions = activeCategories.map((c: any) => ({ id: c.id, label: c.name }));

  return (
    <AnimatePresence>
      {!!allergyId && (
        <Dialog open={!!allergyId} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-0 shadow-2xl bg-gradient-to-b from-background to-background/95 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden"
            >
              {/* Premium Background Elements */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px]" />
                <div className="absolute top-[50%] -left-[100px] w-[200px] h-[200px] bg-indigo-500/10 rounded-full blur-[60px]" />
              </div>

              <div className="relative p-6 pb-4 border-b border-white/10 dark:border-white/5">
                <DialogHeader>
                  <div className="flex items-center gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center border border-blue-500/20 shadow-inner"
                    >
                      <PencilLine className="w-6 h-6 text-blue-600 drop-shadow-sm" />
                    </motion.div>
                    <div className="space-y-1.5">
                      <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Kısıtlama Profilini Düzenle
                      </DialogTitle>
                      <DialogDescription className="text-sm font-medium opacity-80 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        Seçili alerji/kısıtlama profilini ve dışladığı unsurları yapılandırın.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>
            </motion.div>

            {isLoadingAllergy ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-muted-foreground font-medium animate-pulse">Profil Bilgileri Yükleniyor...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8 relative z-10">
                {/* Temel Bilgiler Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="space-y-5"
                >
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center space-x-4 bg-muted/40 p-4 rounded-xl border border-muted/60 transition-colors hover:border-blue-500/30"
                  >
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field }) => (
                        <Checkbox 
                          id="isActive" 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          className="w-5 h-5 rounded data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
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

                  <div className="space-y-2.5">
                    <Label htmlFor="name" className="text-sm font-bold flex items-center gap-2">
                      Kısıtlama Adı <span className="text-destructive">*</span>
                    </Label>
                    <Input 
                      id="name" 
                      placeholder="Örn: Laktoz İntoleransı" 
                      {...register("name")} 
                      className="h-12 rounded-xl bg-background/50 border-muted-foreground/20 focus-visible:ring-blue-500/50 transition-all shadow-sm" 
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
                        placeholder="Örn: Apple, Carrot, Beef, ShieldAlert" 
                        {...register("iconName")} 
                        className="h-12 rounded-xl bg-background/50 border-muted-foreground/20 focus-visible:ring-blue-500/50 transition-all shadow-sm" 
                      />
                      <div className="w-12 h-12 border rounded-xl flex items-center justify-center shrink-0 bg-muted/20">
                        {IconComponent ? <IconComponent className="w-6 h-6 text-blue-600" /> : <HelpCircle className="w-6 h-6 text-muted-foreground opacity-50" />}
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
                      placeholder="Bu kısıtlama profili hakkında kullanıcıları bilgilendirecek kısa bir metin..." 
                      {...register("description")} 
                      className="resize-none h-24 rounded-xl bg-background/50 border-muted-foreground/20 focus-visible:ring-blue-500/50 transition-all shadow-sm"
                    />
                  </div>
                </motion.div>

                {/* Dışlama Kuralları Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="relative overflow-hidden rounded-2xl border border-muted/40 bg-gradient-to-br from-muted/30 to-background shadow-inner"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/40" />
                  <div className="p-5 space-y-5">
                    <div className="flex items-center gap-2 border-b border-muted/50 pb-3">
                      <div className="p-1.5 bg-blue-500/10 rounded-lg">
                        <ListFilter className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-foreground">Dışlama Kuralları</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                      <motion.div whileHover={{ scale: 1.01 }} className="space-y-3 transition-transform">
                        <div className="bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                          <Label className="text-sm font-bold text-blue-600 flex items-center gap-1.5 mb-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Kategoriler
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
                                placeholder={isLoadingIngredients ? "Yükleniyor..." : "Malzeme ara..."}
                              />
                            )}
                          />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
                
                <DialogFooter className="pt-4 flex items-center gap-3 w-full sm:justify-end border-t border-muted/20">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={onClose} 
                    disabled={isPending}
                    className="rounded-xl hover:bg-muted font-medium"
                  >
                    İptal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isPending} 
                    className="px-8 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all bg-blue-600 hover:bg-blue-700 text-white relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> 
                        Güncelleniyor...
                      </span>
                    ) : "Alerjiyi Güncelle"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
