import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2, GitMerge, XCircle } from "lucide-react";
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
import { Textarea } from "@/shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { 
  MeasurementCategory, 
  ResolutionAction, 
  type PendingRequest,
  useResolveRequestMutation, 
  useIngredientCategories,
  useAdminIngredients
} from "@/entities/admin-ingredient";
import { getCategoryIcon } from "@/shared/lib/icon-helpers";
import { toast } from "sonner";

interface ResolveRequestDialogProps {
  request: PendingRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const resolveSchema = z.object({
  action: z.nativeEnum(ResolutionAction),
  newCategoryId: z.string().optional(),
  newUnitFamily: z.nativeEnum(MeasurementCategory).optional(),
  estimatedShelfLifeInDays: z.number().nullable().optional(),
  masterIngredientId: z.string().optional(),
  adminNote: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.action === ResolutionAction.ApproveAsNew) {
    if (!data.newCategoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Yeni onay için kategori seçilmelidir",
        path: ["newCategoryId"],
      });
    }
    if (!data.newUnitFamily) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Yeni onay için ölçü birimi seçilmelidir",
        path: ["newUnitFamily"],
      });
    }
  } else if (data.action === ResolutionAction.MergeAsAlias) {
    if (!data.masterIngredientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Birleştirme işlemi için master malzeme seçilmelidir",
        path: ["masterIngredientId"],
      });
    }
  }
});

type ResolveFormValues = z.infer<typeof resolveSchema>;

export const ResolveRequestDialog = ({ request, open, onOpenChange }: ResolveRequestDialogProps) => {
  const { data: categories } = useIngredientCategories();
  // Fetch a lot of ingredients to populate the merge dropdown. Ideally, this should be an autocomplete endpoint, but we'll use the paginated list for now
  const { data: ingredientsData } = useAdminIngredients(0, 100); 
  
  const resolveMutation = useResolveRequestMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ResolveFormValues>({
    resolver: zodResolver(resolveSchema),
    defaultValues: {
      action: ResolutionAction.ApproveAsNew,
      adminNote: ""
    }
  });

  const [searchMaster, setSearchMaster] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedAction = watch("action");

  // Reset form when request changes
  useState(() => {
    reset({
      action: ResolutionAction.ApproveAsNew,
      adminNote: "",
      estimatedShelfLifeInDays: request?.estimatedShelfLifeInDays || null
    });
  });

  const onSubmit = async (data: ResolveFormValues) => {
    if (!request) return;
    
    try {
      await resolveMutation.mutateAsync({
        requestId: request.id,
        action: data.action,
        newCategoryId: data.newCategoryId,
        newUnitFamily: data.newUnitFamily,
        estimatedShelfLifeInDays: data.estimatedShelfLifeInDays,
        masterIngredientId: data.masterIngredientId,
        adminNote: data.adminNote
      });
      toast.success("Talep başarıyla karara bağlandı");
      onOpenChange(false);
      reset();
    // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (error) {
      toast.error("İşlem sırasında bir hata oluştu");
    }
  };

  if (!request) return null;

  let displayName = request.requestedName;
  let isJson = false;
  if (displayName && displayName.startsWith('{') && displayName.endsWith('}')) {
    try {
      const parsed = JSON.parse(displayName);
      displayName = parsed.RequestedName || parsed.Name || "Bilinmeyen Malzeme (JSON Hatası)";
      isJson = true;
    // eslint-disable-next-line unused-imports/no-unused-vars
    } catch { /* ignore */ }
  }

  const filteredMasterIngredients = ingredientsData?.items.filter(ing => 
    ing.name.toLowerCase().includes(searchMaster.toLowerCase())
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-[2rem] p-6">
        <DialogHeader>
          <DialogTitle>Talebi Değerlendir</DialogTitle>
          <DialogDescription>
            <span className="font-bold text-foreground">"{displayName}"</span> adlı istek için aksiyon seçin.
          </DialogDescription>
        </DialogHeader>

        {(request.llmAnalysisResult || isJson) && (
          <div className="bg-muted p-3 rounded-md text-sm mb-4 max-h-40 overflow-y-auto">
            <p className="font-semibold mb-1 flex items-center gap-2">
              <span className="text-xl">🤖</span> AI Analizi
            </p>
            <p className="text-muted-foreground break-words">
              {isJson ? request.requestedName : request.llmAnalysisResult}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setValue("action", ResolutionAction.ApproveAsNew)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${selectedAction === ResolutionAction.ApproveAsNew ? 'bg-[#4CAF50]/10 border-[#4CAF50] text-[#4CAF50] scale-[1.02] shadow-sm' : 'bg-card border-border text-muted-foreground hover:bg-muted hover:border-muted-foreground/30'}`}
            >
              <CheckCircle2 className="w-6 h-6 mb-2" />
              <span className="text-sm font-bold">Yeni Ekle</span>
            </button>
            <button
              type="button"
              onClick={() => setValue("action", ResolutionAction.MergeAsAlias)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${selectedAction === ResolutionAction.MergeAsAlias ? 'bg-[#2196F3]/10 border-[#2196F3] text-[#2196F3] scale-[1.02] shadow-sm' : 'bg-card border-border text-muted-foreground hover:bg-muted hover:border-muted-foreground/30'}`}
            >
              <GitMerge className="w-6 h-6 mb-2" />
              <span className="text-sm font-bold text-center">Alias Yap</span>
            </button>
            <button
              type="button"
              onClick={() => setValue("action", ResolutionAction.Reject)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${selectedAction === ResolutionAction.Reject ? 'bg-[#F44336]/10 border-[#F44336] text-[#F44336] scale-[1.02] shadow-sm' : 'bg-card border-border text-muted-foreground hover:bg-muted hover:border-muted-foreground/30'}`}
            >
              <XCircle className="w-6 h-6 mb-2" />
              <span className="text-sm font-bold">Reddet</span>
            </button>
          </div>

          {selectedAction === ResolutionAction.ApproveAsNew && (
            <div className="space-y-4 pt-2 border-t">
              <div className="space-y-2">
                <Label>Kategori Seçimi</Label>
                <Select onValueChange={(val) => setValue("newCategoryId", val)}>
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
                {errors.newCategoryId && <p className="text-xs text-destructive">{errors.newCategoryId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Ölçü Birimi Ailesi</Label>
                <Select 
                  onValueChange={(val) => setValue("newUnitFamily", val as MeasurementCategory)}
                  value={watch("newUnitFamily")}
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
                {errors.newUnitFamily && <p className="text-sm text-destructive">{errors.newUnitFamily.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedShelfLife">Tahmini Raf Ömrü (Gün - Opsiyonel)</Label>
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
                {errors.estimatedShelfLifeInDays && <p className="text-xs text-destructive">{errors.estimatedShelfLifeInDays.message}</p>}
              </div>
            </div>
          )}

          {selectedAction === ResolutionAction.MergeAsAlias && (
            <div className="space-y-4 pt-2 border-t">
              <div className="space-y-2">
                <Label>Hangi Ana Malzemeye Bağlansın?</Label>
                <div className="relative" onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setIsDropdownOpen(false);
                  }
                }}>
                  <Input 
                    placeholder="Ana malzeme aramak için yazın..." 
                    value={searchMaster}
                    onChange={(e) => {
                      setSearchMaster(e.target.value);
                      setValue("masterIngredientId", "");
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                  />
                  {isDropdownOpen && searchMaster && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-48 overflow-y-auto">
                      {filteredMasterIngredients.length > 0 ? (
                        filteredMasterIngredients.map((ing) => (
                          <div 
                            key={ing.id}
                            className="px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                            onMouseDown={(e) => {
                              // onMouseDown fires before onBlur
                              e.preventDefault(); 
                              setValue("masterIngredientId", ing.id);
                              setSearchMaster(ing.name);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {ing.name}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-muted-foreground text-center">Sonuç bulunamadı</div>
                      )}
                    </div>
                  )}
                </div>
                {errors.masterIngredientId && <p className="text-xs text-destructive">{errors.masterIngredientId.message}</p>}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2 border-t">
            <Label htmlFor="adminNote">Yönetici Notu (Opsiyonel)</Label>
            <Textarea id="adminNote" placeholder="Bu işlemle ilgili notunuz..." {...register("adminNote")} />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={resolveMutation.isPending}>
              {resolveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              İşlemi Tamamla
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
