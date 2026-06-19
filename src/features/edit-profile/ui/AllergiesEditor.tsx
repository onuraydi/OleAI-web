import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Check, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { allergyApi } from "@/entities/allergy/api/allergyApi";
import { userApi, type AllergyItem } from "@/entities/user";

interface AllergiesEditorProps {
  currentAllergies: AllergyItem[];
}

export const AllergiesEditor = ({ currentAllergies }: AllergiesEditorProps) => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(currentAllergies.map((a) => a.id))
  );

  const { data: allAllergies, isLoading } = useQuery({
    queryKey: ["allergy-restrictions"],
    queryFn: allergyApi.getList,
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: () =>
      userApi.updateAllergies({ allergyRestrictionIds: [...selected] }),
    onSuccess: () => {
      toast.success("Alerji bilgilerin güncellendi");
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
        Alerjenlerini ve gıda kısıtlamalarını işaretle. Bu bilgiler tariflerden otomatik olarak filtrelenir.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {allAllergies?.map((allergy) => {
          const isActive = selected.has(allergy.id);
          return (
            <button
              key={allergy.id}
              type="button"
              onClick={() => toggle(allergy.id)}
              className={`relative flex items-center gap-3 p-4 rounded-2xl border-2 font-bold text-sm transition-all duration-200 text-left
                ${isActive
                  ? "border-primary bg-primary/10 text-primary shadow-sm scale-[1.02]"
                  : "border-muted/60 hover:border-primary/40 text-foreground hover:bg-muted/30"
                }`}
            >
              <ShieldAlert className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className="leading-snug">{allergy.name}</span>
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
            <><Check className="w-4 h-4" /> Alerjileri Kaydet</>
          )}
        </Button>
      </div>
    </div>
  );
};
