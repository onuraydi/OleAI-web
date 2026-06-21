import { useState } from "react";
import { Loader2, Tags, Trash2, Plus } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { 
  type Ingredient, 
  useIngredientAliases, 
  useAddAliasMutation, 
  useDeleteAliasMutation,
  useRestoreAliasMutation 
} from "@/entities/admin-ingredient";
import { toast } from "sonner";

interface ManageAliasesDialogProps {
  ingredient: Ingredient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageAliasesDialog = ({ ingredient, open, onOpenChange }: ManageAliasesDialogProps) => {
  const [newAlias, setNewAlias] = useState("");
  
  const { data: aliases, isLoading } = useIngredientAliases(ingredient?.id ?? "");
  const addMutation = useAddAliasMutation(ingredient?.id ?? "");
  const deleteMutation = useDeleteAliasMutation(ingredient?.id ?? "");
  const restoreMutation = useRestoreAliasMutation(ingredient?.id ?? "");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredient || !newAlias.trim()) return;

    try {
      await addMutation.mutateAsync(newAlias.trim());
      setNewAlias("");
      toast.success("Eş anlamlı kelime eklendi");
    } catch {
      toast.error("Eş anlamlı kelime eklenirken hata oluştu");
    }
  };

  const handleDelete = async (aliasId: string) => {
    if (!ingredient) return;
    try {
      await deleteMutation.mutateAsync(aliasId);
      toast.success("Eş anlamlı kelime silindi");
    } catch {
      toast.error("Silme işlemi başarısız oldu");
    }
  };

  if (!ingredient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="w-5 h-5 text-primary" /> 
            {ingredient.name} Alias Yönetimi
          </DialogTitle>
          <DialogDescription>
            Bu malzemenin eş anlamlılarını ekleyin veya çıkarın.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input 
              placeholder="Yeni eş anlamlı kelime..." 
              value={newAlias}
              onChange={(e) => setNewAlias(e.target.value)}
              disabled={addMutation.isPending}
            />
            <Button type="submit" disabled={!newAlias.trim() || addMutation.isPending}>
              {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </Button>
          </form>

          <div className="border rounded-md max-h-60 overflow-y-auto bg-muted/30">
            {isLoading ? (
              <div className="p-4 flex justify-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : !aliases || aliases.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Henüz eş anlamlı kelime bulunmuyor.
              </div>
            ) : (
              <ul className="divide-y">
                {aliases.map((alias) => (
                  <li key={alias.id} className="p-3 flex justify-between items-center bg-card hover:bg-muted/50 transition-colors">
                    <span className={`text-sm font-medium ${alias.deletedDate ? 'line-through text-muted-foreground' : ''}`}>
                      {alias.aliasName} {alias.deletedDate && <span className="text-xs text-destructive ml-2 font-normal">(Silindi)</span>}
                    </span>
                    {alias.deletedDate ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2 text-xs"
                        onClick={async () => {
                          try {
                            await restoreMutation.mutateAsync(alias.id);
                            toast.success("Eş anlamlı kelime geri getirildi");
                          } catch {
                            toast.error("Geri getirme işlemi başarısız oldu");
                          }
                        }}
                        disabled={restoreMutation.isPending}
                      >
                        {restoreMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                        Geri Getir
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-white"
                        onClick={() => handleDelete(alias.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
