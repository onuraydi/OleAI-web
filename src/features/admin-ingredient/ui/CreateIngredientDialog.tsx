import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Loader2, CalendarIcon } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";
import { MeasurementCategory, ExpirationMode, useCreateIngredientMutation, useIngredientCategories } from "@/entities/admin-ingredient";
import { getCategoryIcon } from "@/shared/lib/icon-helpers";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const createIngredientSchema = z.object({
  name: z.string().min(2, "Malzeme adı en az 2 karakter olmalıdır"),
  categoryId: z.string().min(1, "Lütfen bir kategori seçin"),
  unitFamily: z.nativeEnum(MeasurementCategory, {
    message: "Lütfen geçerli bir ölçü birimi ailesi seçin"
  }),
  isPolarizing: z.boolean(),
  isStaple: z.boolean(),
  estimatedShelfLifeInDays: z.number().nullable().optional(),
});

type CreateIngredientFormValues = z.infer<typeof createIngredientSchema>;

export const CreateIngredientDialog = () => {
  const [open, setOpen] = useState(false);
  
  const { data: categories, isLoading: isLoadingCategories } = useIngredientCategories();
  const createMutation = useCreateIngredientMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<CreateIngredientFormValues>({
    resolver: zodResolver(createIngredientSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      unitFamily: MeasurementCategory.Other,
      isPolarizing: false,
      isStaple: false,
      estimatedShelfLifeInDays: null,
    }
  });


  const onSubmit = async (data: CreateIngredientFormValues) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        categoryId: data.categoryId,
        unitFamily: data.unitFamily,
        isPolarizing: data.isPolarizing,
        isStaple: data.isStaple,
        estimatedShelfLifeInDays: data.estimatedShelfLifeInDays || null,
        defaultExpirationMode: ExpirationMode.ShelfLife
      });
      toast.success("Malzeme başarıyla eklendi");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error("Malzeme eklenirken bir hata oluştu");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Yeni Malzeme
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Malzeme Ekle</DialogTitle>
          <DialogDescription>
            Sisteme yeni bir master malzeme ekleyin. Eş anlamlıları (alias) malzeme oluştuktan sonra ekleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Malzeme Adı</Label>
            <Input id="name" placeholder="Örn: Sızma Zeytinyağı" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select 
              onValueChange={(val) => setValue("categoryId", val)} 
              disabled={isLoadingCategories}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategori Seçin" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(cat.iconName, cat.name, "w-4 h-4")}
                      <span>{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Ölçü Birimi Ailesi (Unit Family)</Label>
            <Select 
              onValueChange={(val) => setValue("unitFamily", val as MeasurementCategory)}
              value={watch("unitFamily")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Birim Seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MeasurementCategory.Weight}>Ağırlık (Gram, Kilogram)</SelectItem>
                <SelectItem value={MeasurementCategory.Volume}>Hacim (Mililitre, Litre)</SelectItem>
                <SelectItem value={MeasurementCategory.Count}>Adet / Tane</SelectItem>
                <SelectItem value={MeasurementCategory.Other}>Diğer</SelectItem>
              </SelectContent>
            </Select>
            {errors.unitFamily && <p className="text-sm text-destructive">{errors.unitFamily.message}</p>}
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="estimatedShelfLife">Tahmini Raf Ömrü (Gün)</Label>
            <div className="relative">
              <Input 
                id="estimatedShelfLife" 
                type="number" 
                min="1"
                placeholder="Örn: 5" 
                {...register("estimatedShelfLifeInDays", { 
                  setValueAs: v => {
                    if (v === "" || v === null || v === undefined) return null;
                    const parsed = parseInt(v, 10);
                    return isNaN(parsed) ? null : parsed;
                  }
                })} 
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Gün</span>
            </div>
            {errors.estimatedShelfLifeInDays && <p className="text-sm text-destructive">{errors.estimatedShelfLifeInDays.message}</p>}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="isPolarizing" 
              checked={watch("isPolarizing")}
              onCheckedChange={(checked) => setValue("isPolarizing", checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="isPolarizing" className="font-bold text-foreground cursor-pointer">
                Yaygın Olarak Sevilmeyen Malzeme
              </Label>
              <p className="text-sm text-muted-foreground">
                Bamya, kişniş veya sakatat gibi toplumda sıkça sevilmeyen bir malzemeyse işaretleyin.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="isStaple" 
              checked={watch("isStaple")}
              onCheckedChange={(checked) => setValue("isStaple", checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="isStaple" className="font-bold text-foreground cursor-pointer">
                Temel Gıda (Staple)
              </Label>
              <p className="text-sm text-muted-foreground">
                Tuz, karabiber, su gibi hemen her evde bulunan ve yapay zeka önerilerinde "eksik" sayılmayacak malzemeyse işaretleyin.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Kaydet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
