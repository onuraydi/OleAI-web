import { EntityRestrictionForm, type EntityRestrictionFormValues } from "@/shared/ui/form/EntityRestrictionForm";

export type DietFormValues = EntityRestrictionFormValues;

interface DietFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  isUpdateMode?: boolean;
  onSubmit: (data: DietFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}

export const DietForm = (props: DietFormProps) => {
  return (
    <EntityRestrictionForm 
      {...props}
      entityNameLabel="Diyet Adı"
      entityNamePlaceholder="Örn: Vegan, Glütensiz, Keto..."
      defaultIconName="Leaf"
      themeColor="emerald"
    />
  );
};
