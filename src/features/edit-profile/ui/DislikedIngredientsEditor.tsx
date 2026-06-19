import { ThumbsDown } from "lucide-react";
import { pantryApi } from "@/entities/pantry/api/pantryApi";
import { userApi, type DislikedIngredientItem } from "@/entities/user";
import { ProfilePreferenceEditor } from "./ProfilePreferenceEditor";

interface DislikedIngredientsEditorProps {
  currentDisliked: DislikedIngredientItem[];
}

export const DislikedIngredientsEditor = ({ currentDisliked }: DislikedIngredientsEditorProps) => {
  return (
    <ProfilePreferenceEditor
      currentItems={currentDisliked}
      queryKey={["popular-dislikes"]}
      queryFn={pantryApi.getPopularDislikes}
      mutationFn={(ids) => userApi.updateDislikedIngredients({ ingredientIds: ids })}
      successMessage="Sevilmeyen malzemeler güncellendi"
      description="Hoşlanmadığın malzemeleri seç. Yapay zeka tarif önerirken bu malzemeleri kullanmamaya özen gösterir."
      icon={ThumbsDown}
      submitButtonLabel="Malzemeleri Kaydet"
    />
  );
};
