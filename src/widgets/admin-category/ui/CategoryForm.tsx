import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import * as LucideIcons from "lucide-react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toPascalCase } from "@/shared/lib/icon-helpers";

const formSchema = z.object({
  name: z.string().min(2, "Kategori adı en az 2 karakter olmalıdır"),
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
});

export type CategoryFormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  initialData?: { name: string; iconName: string } | null;
  onSubmit: (data: CategoryFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}

export const CategoryForm = ({ initialData, onSubmit, onCancel, isPending, submitLabel }: CategoryFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", iconName: "" },
  });

  useEffect(() => {
    if (initialData) {
      reset({ name: initialData.name, iconName: initialData.iconName });
    } else {
      reset({ name: "", iconName: "" });
    }
  }, [initialData, reset]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const currentIconName = watch("iconName");
  const parsedIconName = currentIconName ? toPascalCase(currentIconName) : "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = parsedIconName ? (LucideIcons as any)[parsedIconName] : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="space-y-2">
        <Label htmlFor="cat-name">Kategori Adı</Label>
        <Input id="cat-name" placeholder="Örn: Meyveler" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive font-medium">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat-iconName">İkon Adı (Lucide)</Label>
        <div className="flex gap-3 items-center">
          <Input id="cat-iconName" placeholder="Örn: Apple, Carrot, Beef" {...register("iconName")} />
          <div className="w-10 h-10 border rounded-xl flex items-center justify-center shrink-0 bg-muted/20">
            {IconComponent ? <IconComponent className="w-5 h-5 text-primary" /> : <HelpCircle className="w-5 h-5 text-muted-foreground opacity-50" />}
          </div>
        </div>
        {errors.iconName && <p className="text-sm text-destructive font-medium">{errors.iconName.message}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          Geçerli ikon isimlerini{" "}
          <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold">
            Lucide Icons
          </a>{" "}
          dokümantasyonundan inceleyebilirsiniz.
        </p>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          İptal
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "İşleniyor..." : submitLabel}
        </Button>
      </div>
    </form>
  );
};
