import { useState } from "react";
import { Form } from "@/popup/components/select/FormSelect";
import useOpenAIkey from "./useOpenAIkey";
import { OpenAI } from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { Profile } from "../../types";
import { fulfillEnrichedScripts } from "../popup/scripts";

const openAI = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_KEY || "",
  dangerouslyAllowBrowser: true,
});

const EnrichedFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  placeholder: z.string(),
  id: z.string(),
  associatedValue: z.string(),
});

const EnrichedFieldsSchema = z.object({
  formFields: z.array(EnrichedFieldSchema),
});

const JobDetails = z.object({
  company_name: z.string(),
  employment_type: z.string(),
  experience: z.string(),
  skills: z.array(z.string()),
  description: z.string(),
});

export type EnrichedFields = z.infer<typeof EnrichedFieldsSchema>;

export const useFulfillForm = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const OPENAI_KEY = useOpenAIkey();

  const fulfillForm = async (form: Form, profile: Profile) => {
    if (!OPENAI_KEY) {
      setError("Open AI key required");
      return;
    }
    if (error) {
      setError("");
    }
    setLoading(true);
    openAI.apiKey = OPENAI_KEY;
    const sanitizedFormFields = sanitizeFormFields(form.fields);
    try {
      const tabHTML = await getTabTextContent();
      if (!tabHTML) {
        throw new Error("Page context not found");
      }
      const jobDetails = await extractJobDetails(tabHTML);
      const enrichedFields = await enrichFormFields(
        profile,
        sanitizedFormFields,
        jobDetails.description
      );
      const logObject = {
        request: {
          profile,
          sanitizedFormFields,
          tabHTML,
        },
        response: {
          enrichedFields,
        },
      };
      console.log(form, logObject);
      await fulfillEnrichedFields({
        formId: form.id,
        enrichedFields,
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }
      setError("Something went wrong");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  return {
    fulfillForm,
    loading,
    error,
  };
};

const extractJobDetails = async (HTML: string) => {
  const response = await openAI.chat.completions.parse({
    model: "o4-mini-2025-04-16",
    messages: [
      {
        role: "system",
        content: `
You are an information extraction assistant.
Your task is to analyze raw HTML of a job posting page and extract structured job details.
{
  company_name: string,     // The company offering the job
  employment_type: string,  // One of: "Full-time", "Part-time", "Contract", "Internship", "Temporary", or "Other"
  experience: string,       // The required experience (e.g., "3+ years", "Mid-level", "Senior", etc.)
  skills: string[],         // A list of required or preferred skills (e.g., ["React", "Node.js"])
  description: string       // Clean plain text of the job description
}
You must:
- Parse visible content only (ignore script/style tags)
- Normalize data (e.g., convert "full time" or "FT" to "Full-time")
- If any field is missing, try to infer or return an empty string (for strings) or empty array (for skills)
- Trim extra whitespace and remove HTML tags in extracted text

Return data that conforms to the provided schema.
        `,
      },
      {
        role: "user",
        content: `
Extract job details from the following HTML content:

${HTML}
        `,
      },
    ],
    response_format: zodResponseFormat(JobDetails, "JobDetails"),
    max_completion_tokens: 6000,
  });

  if (response.choices[0].finish_reason === "length") {
    throw new Error("Content too large");
  }

  const jobDetailsJson = response.choices[0].message.parsed;
  if (!jobDetailsJson) {
    throw new Error("No job details found");
  }
  return jobDetailsJson;
};

const getTabTextContent = async () => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tabId = tabs[0]?.id;
  if (tabId) {
    const result = await browser.scripting.executeScript({
      target: {
        tabId,
      },
      func: () => {
        const cleanBody = document.body.cloneNode(true) as HTMLElement;
        const selectorsToRemove = [
          "script",
          "style",
          "noscript",
          "iframe",
          "header",
          "footer",
          "nav",
          "aside",
          "[hidden]",
          '[aria-hidden="true"]',
          '[style*="display: none"]',
          '[style*="visibility: hidden"]',
          '[class*="ad-"]',
          '[class*="ads-"]',
          '[class*="sponsor"]',
          '[id*="ad-"]',
          '[id*="sponsor"]',
        ];

        cleanBody
          .querySelectorAll(selectorsToRemove.join(","))
          .forEach((el) => el.remove());

        cleanBody.querySelectorAll("div, span").forEach((el) => {
          if (!el.textContent?.trim()) el.remove();
        });

        cleanBody
          .querySelectorAll(
            "[style*='display:none'], [style*='visibility:hidden'], [aria-hidden='true']"
          )
          .forEach((el) => el.remove());
          
        return cleanBody.innerText
      },
    });
    if (!result[0].result) {
      throw new Error("No HTML found");
    }
    return result[0].result as string;
  }
};

const sanitizeFormFields = (formFields: Form["fields"]): Form["fields"] => {
  return formFields.filter(
    (field) => field.name || field.placeholder || field.id || field.label
  );
};

async function enrichFormFields(
  profile: Profile,
  formFields: Form["fields"],
  tabHtml: string | undefined = ""
) {
  const tabHtmlLength = tabHtml.length;
  const maxTokens = 100000;
  if (tabHtmlLength > maxTokens) {
    const ratio = maxTokens / tabHtmlLength;
    const newLength = Math.floor(tabHtmlLength * ratio);
    tabHtml = tabHtml.substring(0, newLength);
  }

  const response = await openAI.chat.completions.parse({
    model: "o4-mini-2025-04-16",
   messages: [
  {
    role: "system",
    content: `
Your task is to extract and assign appropriate values to HTML form fields using the provided **User Data**, **HTML structure**, and **form field definitions**.

### 🎯 Objective:
Create a **complete, accurate autofill dataset** by matching each form field with the best possible value from the user's profile **and/or** inferred context, including the job description.

---

### 🧩 Matching Strategy (In Priority Order):

1. **Direct Matches**:
   - Use 'label', 'placeholder', 'name', 'id', 'title', or 'aria-label'.
   - Match exact field labels with user profile keys (e.g., "email", "phone", "location").

2. **Nearby Context Inference**:
   - Analyze adjacent tags (e.g., '<label>', '<div>', '<span>').
   - Associate inputs with preceding sibling labels or surrounding context.
   - Interpret visual or structural hierarchy if necessary.

3. **Semantic Inference from Field Content**:
   - Use keyword matching (e.g., 'email', 'phone', 'salary', 'location', 'Linkedin').
   - Infer field purpose from label and placeholder even if no profile key matches directly.

4. **Type Normalization & Format Conversion**:
   - Convert dates based on placeholder hints (e.g., 'DD.MM.YYYY'):
     - "ASAP" → today's date
     - "2 weeks" → today + 14 days
   - Normalize types (e.g., number, date, email, URL) from strings as needed.

5. **Custom Message Generation (for textareas or intros)**:
   - If the field expects a **cover letter**, **personal intro**, or **message** (e.g. label includes “Introduce yourself” or mentions “Linkedin/Github”), compose a concise message that:
     - Introduces the user (name, role, experience)
     - Highlights relevant skills from **user profile**
     - Shows interest and alignment with the **job description**
     - Optionally includes links (e.g., GitHub, LinkedIn)
   - Use **both profile and job description context** to tailor the message.

---

### ⚠️ Rules:

- **Do not leave any field blank**, unless no useful value can be inferred.
- Prefer the most **specific and relevant value** from the profile or page.
- Avoid duplication across unrelated fields.
- For multiple-choice fields, pick the **best matching option**.
- Improve incomplete user inputs found in value attributes.

---

### 🧠 Important Notes:

- HTML may be unstructured or messy — rely on proximity and content clues.
- Use visible labels, placeholders, and surrounding text.
- If field is a text input or textarea and can't be matched directly, infer logical intent and fill accordingly.
- Use profile data **creatively and aggressively**, especially to construct messages or populate inferred fields (like links or skills).
    `
  },
  {
    role: "user",
    content: `Extract the most suitable values for the form fields listed below, using all available hints from the User Data and the provided HTML Tab Context.

### Match Priorities:
- **Direct match** from visible text, labels, placeholders, or known attributes.
- **Nearby inference** from HTML structure (including siblings and parents).
- **Fallback inference** from user profile structure, field patterns, or expected field types.

If field expects a **date**, **location**, **salary**, **phone**, or **email**, use the most relevant value from the profile and format appropriately.

---

**Form Fields:**  
${JSON.stringify(formFields)}

**HTML Tab Context:**  
${JSON.stringify(tabHtml)}  

**User Data Object:**  
${JSON.stringify(profile)}
`
  }
],
    response_format: zodResponseFormat(EnrichedFieldsSchema, "EnrichedFields"),
    max_completion_tokens: 3000,
  });
  if (response.choices[0].finish_reason === "length") {
    throw new Error("Content too large");
  }
  const enrichedFields = response.choices[0].message.parsed;
  if (!enrichedFields) {
    throw new Error("No enriched fields found");
  }
  return enrichedFields as EnrichedFields;
}

async function fulfillEnrichedFields({
  formId,
  enrichedFields,
}: {
  formId: Form["id"];
  enrichedFields: EnrichedFields;
}) {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tabId = tabs[0]?.id;
  if (!tabId) {
    throw new Error("No active tab found");
  }

  const results = await browser.scripting.executeScript({
    target: { tabId },
    args: [formId, enrichedFields],
    func: fulfillEnrichedScripts,
  });

  if (!results[0].result) {
    throw new Error("Error form fulfilling");
  }

  return true;
}
