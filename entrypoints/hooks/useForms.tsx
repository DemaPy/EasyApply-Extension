import { Form } from "../popup/components/select/FormSelect";
import { executeScript } from "../popup/scripts/executeScript";

export const useForms = () => {
  const [forms, setForms] = useState<Form[]>([]);
  useEffect(() => {
    detectForms();
  }, []);

  async function detectForms() {
    const forms = await executeScript("findForms");
    if (!forms) return;
    setForms(forms);
  }

  return forms;
};
