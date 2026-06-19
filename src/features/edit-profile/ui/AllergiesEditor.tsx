import { ShieldAlert } from "lucide-react";
import { allergyApi } from "@/entities/allergy/api/allergyApi";
import { userApi, type AllergyItem } from "@/entities/user";
import { ProfilePreferenceEditor } from "./ProfilePreferenceEditor";

interface AllergiesEditorProps {
  currentAllergies: AllergyItem[];
}

export const AllergiesEditor = ({ currentAllergies }: AllergiesEditorProps) => {
  return (
    <ProfilePreferenceEditor
      currentItems={currentAllergies}
      queryKey={["allergy-restrictions"]}
      queryFn={allergyApi.getList}
      mutationFn={(ids) => userApi.updateAllergies({ allergyRestrictionIds: ids })}
      successMessage="Alerji bilgilerin güncellendi"
      description="Alerjenlerini ve gıda kısıtlamalarını işaretle. Bu bilgiler tariflerden otomatik olarak filtrelenir."
      icon={ShieldAlert}
      submitButtonLabel="Alerjileri Kaydet"
    />
  );
};
