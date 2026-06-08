import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { type Ingredient, MeasurementCategory, useIngredientCategories, useUpdateIngredientMutation } from "@/entities/admin-ingredient";
import { getCategoryIcon } from "@/shared/lib/icon-helpers";
import { toast } from "sonner";

const updateIngredientSchema = z.object({
  name: z.string().min(2, "Malzeme adı en az 2 karakter olmalıdır"),
  categoryId: z.string().min(1, "Lütfen bir kategori seçin"),
  unitFamily: z.nativeEnum(MeasurementCategory, {
    message: "Lütfen geçerli bir ölçü birimi ailesi seçin"
  }),
});

type UpdateIngredientFormValues = z.infer<typeof updateIngredientSchema>;

interface UpdateIngredientDialogProps {
  ingredient: Ingredient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpdateIngredientDialog = ({ ingredient, open, onOpenChange }: UpdateIngredientDialogProps) => {
  const { data: categories, isLoading: isLoadingCategories } = useIngredientCategories();
  const updateMutation = useUpdateIngredientMutation(ingredient?.id || "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<UpdateIngredientFormValues>({
    resolver: zodResolver(updateIngredientSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      unitFamily: MeasurementCategory.Other
    }
  });

  useEffect(() => {
    if (ingredient && categories && open) {
      // Find the category id from the name
      const cat = categories.find(c => c.name === ingredient.categoryName);
      
      reset({
        name: ingredient.name,
        categoryId: cat?.id || "",
        unitFamily: ingredient.unitFamily
      });
    }
  }, [ingredient, categories, open, reset]);

  const onSubmit = async (data: UpdateIngredientFormValues) => {
    if (!ingredient) return;
    try {
      await updateMutation.mutateAsync({
        name: data.name,
        categoryId: data.categoryId,
        unitFamily: data.unitFamily
      });
      toast.success("Malzeme başarıyla güncellendi");
      onOpenChange(false);
    } catch (error) {
      toast.error("Malzeme güncellenirken bir hata oluştu");
    }
  };

  if (!ingredient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Malzemeyi Güncelle</DialogTitle>
          <DialogDescription>
            <span className="font-bold text-foreground">"{ingredient.name}"</span> malzemesinin bilgilerini güncelliyorsunuz.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="update-name">Malzeme Adı</Label>
            <Input id="update-name" placeholder="Örn: Sızma Zeytinyağı" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select 
              onValueChange={(val) => setValue("categoryId", val)} 
              value={watch("categoryId")}
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

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Değişiklikleri Kaydet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
