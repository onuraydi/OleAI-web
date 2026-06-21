import { EntityRestrictionForm, type EntityRestrictionFormValues } from "@/shared/ui/form/EntityRestrictionForm";

export type AllergyFormValues = EntityRestrictionFormValues;

interface AllergyFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  isUpdateMode?: boolean;
  onSubmit: (data: AllergyFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}

export const AllergyForm = (props: AllergyFormProps) => {
  return (
    <EntityRestrictionForm 
      {...props}
      entityNameLabel="Kısıtlama Adı"
      entityNamePlaceholder="Örn: Gluten İntoleransı, Laktoz..."
      defaultIconName="ShieldAlert"
      themeColor="primary"
    />
  );
};
