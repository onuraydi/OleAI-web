import { Leaf } from "lucide-react";
import { dietaryPreferenceApi } from "@/entities/dietary-preference/api/dietaryPreferenceApi";
import { userApi, type DietaryPreferenceItem } from "@/entities/user";
import { ProfilePreferenceEditor } from "./ProfilePreferenceEditor";

interface DietaryPreferencesEditorProps {
  currentPreferences: DietaryPreferenceItem[];
}

export const DietaryPreferencesEditor = ({ currentPreferences }: DietaryPreferencesEditorProps) => {
  return (
    <ProfilePreferenceEditor
      currentItems={currentPreferences}
      queryKey={["dietary-preferences"]}
      queryFn={dietaryPreferenceApi.getList}
      mutationFn={(ids) => userApi.updateDietaryPreferences({ dietaryPreferenceIds: ids })}
      successMessage="Beslenme tercihlerin güncellendi"
      description="Beslenme tarzını seç. Seçimlerin tarif önerilerini kişiselleştirir."
      icon={Leaf}
      submitButtonLabel="Tercihleri Kaydet"
    />
  );
};
