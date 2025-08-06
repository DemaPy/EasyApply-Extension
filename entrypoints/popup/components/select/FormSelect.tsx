import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Alert } from "../feedback/Alert";
import { useForms } from "../../../hooks/useForms";
import { executeScript } from "../../../popup/scripts/executeScript";

interface FormSelectProps {
  form: Form | null;
  onSelect: (form: Form) => void;
}

export interface Form {
  id: string;
  action: string;
  fields: Field[];
}

interface Field {
  id: string;
  name?: string;
  label?: string | null;
  type?: string;
  placeholder?: string;
}

export const FormSelect = ({ form, onSelect }: FormSelectProps) => {
  const forms = useForms();

  useEffect(() => {
    if (forms.length === 1) {
      highlightForm(forms[0].id);
    }
  }, [forms]);

  async function highlightForm(formId: Form["id"]) {
    const form = forms.find((f) => f.id === formId)!;
    await executeScript("scrollToForm", [form.id]);
    onSelect(form);
  }

  if (!forms.length) {
    return (
      <Alert
        title="No forms detected"
        subtitle="Try to restart extension or select another website"
      />
    );
  }

  return (
    <Select onValueChange={highlightForm} value={form?.id}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select form" />
      </SelectTrigger>
      <SelectContent>
        {forms.map((f) => (
          <SelectItem key={f.id} value={f.id}>
            Form id: {f.id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
