import { EnrichedFields } from "../../hooks/useFulfillForm";
import { Form } from "../components/select/FormSelect";

export const fulfillEnrichedScripts = (
  formId: Form["id"],
  enrichedFields: EnrichedFields
) => {
  function findNodeWithExactText(text: string) {
    const walker = document.createTreeWalker(
      document.forms[0],
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          return node.nodeValue?.includes(text)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP;
        },
      }
    );

    const textNode = walker.nextNode();
    return textNode ? textNode.parentElement : null;
  }

  try {
    const form =
      document.getElementById(formId) ?? document.forms[Number(formId)];

    if (!form) {
      return false;
    }

    enrichedFields.formFields.forEach((enrichedField) => {
      let currentFormField;

      if (enrichedField.label) {
        const label = findNodeWithExactText(enrichedField.label);
        console.log(label);

        currentFormField =
          label?.parentElement?.querySelector("input, textarea");
      }

      if (enrichedField.id && enrichedField.id.trim() !== "") {
        const sanitizedId = enrichedField.id.replace(
          /([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g,
          "\\$1"
        );

        currentFormField = form.querySelector(`#${sanitizedId}`);
      }

      if (!currentFormField) {
        currentFormField = form.querySelector(`[name="${enrichedField.name}"]`);
      }

      if (currentFormField) {
        const inputElement = currentFormField as HTMLInputElement;
        inputElement.value = enrichedField.associatedValue;

        const event = new Event("input", { bubbles: true });
        inputElement.dispatchEvent(event);

        const changeEvent = new Event("change", { bubbles: true });
        inputElement.dispatchEvent(changeEvent);
      }
    });

    return true;
  } catch (error) {
    console.log(error);
    console.error("Error filling form:", error);
    return false;
  }
};

export const highlightFormById = (formId: string) => {
  Array.from(document.forms).forEach((form) => {
    form.style.border = "";
  });

  const form =
    document.getElementById(formId) || document.forms[Number(formId)];
  if (form) {
    form.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
};

export const findForms = () => {
  const forms: Form[] = Array.from(document.forms).map((form, index) => ({
    id: form.getAttribute("id") || index.toString(),
    action: form.action,
    fields: Array.from(form.elements)
      .filter(
        (field): field is HTMLInputElement | HTMLTextAreaElement =>
          (field instanceof HTMLInputElement ||
            field instanceof HTMLTextAreaElement) &&
          ![
            "radio",
            "checkbox",
            "file",
            "button",
            "submit",
            "reset",
            "hidden",
          ].includes(field.type)
      )
      .map(({ id, name, type, placeholder }) => ({
        id,
        name,
        label: "",
        type,
        placeholder,
      })),
  }));

  return forms;
};

export function findFormsV2() {
  const EXCLUDE_FORM_TYPES = new Set([
    "radio",
    "checkbox",
    "file",
    "button",
    "submit",
    "reset",
    "hidden",
  ]);
  function searchLabelUpwards(inputElem: Element) {
    let elem: Element | null = inputElem;

    while (elem) {
      if (elem.tagName === "LABEL") {
        return elem;
      }

      let sibling = elem.previousElementSibling as Element | null;
      while (sibling) {
        if (sibling.tagName === "LABEL") {
          return sibling;
        }
        sibling = sibling.previousElementSibling as Element | null;
      }

      elem = elem.parentElement;
    }

    return undefined;
  }
  const forms = [];

  for (const [index, form] of Array.from(document.forms).entries()) {
    const formObject: Form = {
      id: "",
      action: "",
      fields: [],
    };
    formObject["id"] = form.getAttribute("id") || index.toString();
    formObject["action"] = form.action;

    const fields: Form["fields"] = [];
    for (const field of Array.from(form.elements)) {
      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement
      ) {
        if (!EXCLUDE_FORM_TYPES.has(field?.type)) {
          fields.push({
            id: field.id,
            label: searchLabelUpwards(field)?.textContent?.match(/[a-zA-Z]+/g)?.[0],
            name: field.name,
            type: field.type,
            placeholder: field?.placeholder,
          });
        }
      }
      formObject["fields"] = fields;
    }
    forms.push(formObject);
  }
  return forms;
}
