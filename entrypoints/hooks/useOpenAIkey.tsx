import { useEffect, useState } from "react";

const useOpenAIkey = () => {
  const [openAiKey, setOpenAiKey] = useState("");

  useEffect(() => {
    browser.storage.local.get("preferences").then((data) => {
      if ("preferences" in data) {
        const OPENAI_KEY = data.preferences.OPENAI_KEY;
        if (OPENAI_KEY) {
          setOpenAiKey(OPENAI_KEY);
        }
      }
    });
  }, []);

  return openAiKey;
};

export default useOpenAIkey;
