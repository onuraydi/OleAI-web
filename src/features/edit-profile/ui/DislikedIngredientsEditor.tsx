import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Check, Search, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { pantryApi } from "@/entities/pantry/api/pantryApi";
import { userApi, type DislikedIngredientItem } from "@/entities/user";
import { getCategoryIcon } from "@/shared/lib/icon-helpers";

interface DislikedIngredientsEditorProps {
  currentDisliked: DislikedIngredientItem[];
}

export const DislikedIngredientsEditor = ({ currentDisliked }: DislikedIngredientsEditorProps) => {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [dislikedItems, setDislikedItems] = useState<Map<string, string>>(
    new Map(currentDisliked.map(item => [item.id, item.name]))
  );
  const [itemsToDelete, setItemsToDelete] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const { data: searchResults, isFetching } = useQuery({
    queryKey: ["search-ingredients", debouncedKeyword],
    queryFn: () => pantryApi.searchIngredients(debouncedKeyword),
    enabled: debouncedKeyword.length >= 2,
  });

  const mutation = useMutation({
    mutationFn: () => userApi.updateDislikedIngredients({ ingredientIds: Array.from(dislikedItems.keys()) }),
    onSuccess: () => {
      toast.success("Sevilmeyen malzemeler güncellendi");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setKeyword("");
      setItemsToDelete(new Set());
    },
    onError: () => toast.error("Güncelleme başarısız oldu"),
  });

  const handleSearchAdd = (id: string, name: string) => {
    setDislikedItems(prev => {
      const next = new Map(prev);
      next.set(id, name);
      return next;
    });
    setKeyword("");
  };

  const handleDeleteSelected = () => {
    setDislikedItems(prev => {
      const next = new Map(prev);
      itemsToDelete.forEach(id => next.delete(id));
      return next;
    });
    setItemsToDelete(new Set());
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Hoşlanmadığın malzemeleri seç. Yapay zeka tarif önerirken bu malzemeleri kullanmamaya özen gösterir.
      </p>

      {/* Search Input */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Malzeme ara... (örn: Soğan, Sarımsak)"
          className="w-full h-14 pl-12 pr-10 rounded-2xl bg-muted/20 border-2 border-muted/50 focus:border-primary focus:bg-background outline-none transition-all font-bold text-lg"
        />
        {isFetching && (
          <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
        )}
        {keyword && (
          <button 
            onClick={() => setKeyword("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {keyword.length >= 2 && searchResults && searchResults.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-2 max-h-60 overflow-y-auto shadow-sm">
          {searchResults.map(item => {
            const isAlreadyAdded = dislikedItems.has(item.masterIngredientId);
            return (
              <button
                key={item.masterIngredientId}
                onClick={() => handleSearchAdd(item.masterIngredientId, item.displayName)}
                disabled={isAlreadyAdded}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                  isAlreadyAdded ? "bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed" : "hover:bg-primary/10 text-foreground"
                }`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10">
                  {getCategoryIcon(item.categoryName, item.displayName, `w-4 h-4 ${isAlreadyAdded ? "text-muted-foreground" : "text-primary"}`)}
                </div>
                <span className="font-bold flex-1">{item.displayName}</span>
                {isAlreadyAdded ? (
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Eklendi</span>
                ) : (
                  <Plus className="w-4 h-4 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Disliked Items Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from(dislikedItems.entries()).map(([id, name]) => {
          const isSelectedToDelete = itemsToDelete.has(id);
          return (
            <button
              key={id}
              onClick={() => {
                setItemsToDelete(prev => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                });
              }}
              className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold text-sm text-left ${
                isSelectedToDelete
                  ? "border-primary bg-primary/10 text-primary shadow-sm scale-[1.02]"
                  : "border-muted/60 hover:border-primary/40 text-foreground hover:bg-muted/30"
              }`}
            >
              {getCategoryIcon(name, name, `w-4 h-4 shrink-0 ${isSelectedToDelete ? "text-primary" : "text-muted-foreground"}`)}
              <span className="leading-snug truncate" title={name}>{name}</span>
              {isSelectedToDelete && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Delete Selected Button */}
      {itemsToDelete.size > 0 && (
        <div className="flex justify-start">
          <Button
            variant="destructive"
            onClick={handleDeleteSelected}
            className="h-10 px-6 rounded-xl font-bold bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
          >
            Seçilenleri Sil ({itemsToDelete.size})
          </Button>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="h-12 px-8 rounded-xl font-bold gap-2"
        >
          {mutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor...</>
          ) : (
            <><Check className="w-4 h-4" /> Malzemeleri Kaydet</>
          )}
        </Button>
      </div>
    </div>
  );
};
