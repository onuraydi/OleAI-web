import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Check, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { pantryApi } from "@/entities/pantry/api/pantryApi";
import { userApi, type DislikedIngredientItem } from "@/entities/user";

interface DislikedIngredientsEditorProps {
  currentDisliked: DislikedIngredientItem[];
}

export const DislikedIngredientsEditor = ({ currentDisliked }: DislikedIngredientsEditorProps) => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(currentDisliked.map((d) => d.id))
  );

  const { data: popularDislikes, isLoading } = useQuery({
    queryKey: ["popular-dislikes"],
    queryFn: pantryApi.getPopularDislikes,
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: () =>
      userApi.updateDislikedIngredients({ ingredientIds: [...selected] }),
    onSuccess: () => {
      toast.success("Sevilmeyen malzemeler güncellendi");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: () => toast.error("Güncelleme başarısız oldu"),
  });

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-14 rounded-2xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Hoşlanmadığın malzemeleri seç. Yapay zeka tarif önerirken bu malzemeleri kullanmamaya özen gösterir.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {popularDislikes?.map((ingredient) => {
          const isActive = selected.has(ingredient.id);
          return (
            <button
              key={ingredient.id}
              type="button"
              onClick={() => toggle(ingredient.id)}
              className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 font-bold text-sm transition-all duration-200 text-left
                ${isActive
                  ? "border-primary bg-primary/10 text-primary shadow-sm scale-[1.02]"
                  : "border-muted/60 hover:border-primary/40 text-foreground hover:bg-muted/30"
                }`}
            >
              <ThumbsDown className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className="leading-snug truncate" title={ingredient.name}>{ingredient.name}</span>
              {isActive && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

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
