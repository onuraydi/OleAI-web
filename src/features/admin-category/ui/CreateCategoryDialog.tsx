import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as LucideIcons from "lucide-react";
import { HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useCreateCategory } from "@/entities/admin-category/api/adminCategoryQueries";

// PascalCase'e çevirme fonksiyonu (kullanıcı "apple" girerse "Apple" yapar)
const toPascalCase = (str: string) => {
  return str
    .split(/[-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
};

const formSchema = z.object({
  name: z.string().min(2, "Kategori adı en az 2 karakter olmalıdır"),
  iconName: z.string().min(2, "İkon adı zorunludur").refine(
    (val) => {
      const pascalCaseName = toPascalCase(val);
      return !!(LucideIcons as any)[pascalCaseName];
    },
    {
      message: "Geçersiz ikon adı. Lütfen geçerli bir Lucide ikon adı girin.",
    }
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCategoryDialog = ({ isOpen, onClose }: CreateCategoryDialogProps) => {
  const { mutate: createCategory, isPending } = useCreateCategory();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      iconName: "",
    },
  });

  const currentIconName = watch("iconName");
  const parsedIconName = currentIconName ? toPascalCase(currentIconName) : "";
  const IconComponent = parsedIconName ? (LucideIcons as any)[parsedIconName] : null;

  const onSubmit = (data: FormValues) => {
    createCategory(
      { name: data.name, iconName: toPascalCase(data.iconName) },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Kategori Ekle</DialogTitle>
          <DialogDescription>
            Uygulamada kullanılacak yeni bir malzeme kategorisi oluşturun.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Kategori Adı</Label>
            <Input id="name" placeholder="Örn: Meyveler" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive font-medium">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="iconName">İkon Adı (Lucide)</Label>
            <div className="flex gap-3 items-center">
              <Input id="iconName" placeholder="Örn: Apple, Carrot, Beef" {...register("iconName")} />
              <div className="w-10 h-10 border rounded-xl flex items-center justify-center shrink-0 bg-muted/20">
                {IconComponent ? <IconComponent className="w-5 h-5 text-primary" /> : <HelpCircle className="w-5 h-5 text-muted-foreground opacity-50" />}
              </div>
            </div>
            {errors.iconName && <p className="text-sm text-destructive font-medium">{errors.iconName.message}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              Geçerli ikon isimlerini <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold">Lucide Icons</a> dokümantasyonundan inceleyebilirsiniz.
            </p>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              İptal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Ekleniyor..." : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
