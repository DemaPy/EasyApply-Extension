import { findFormsV2, highlightFormById } from ".";
import { getActiveTab } from "../utils/getActiveTab";

const scripts = {
  findForms: findFormsV2,
  scrollToForm: highlightFormById,
};

export async function executeScript(
  script: keyof typeof scripts,
  args?: Parameters<(typeof scripts)[keyof typeof scripts]>
) {
  const tabId = await getActiveTab();
    if (!tabId) {
      throw new Error("Tab not found")
    }
  const results = await browser.scripting.executeScript({
    target: {
      tabId,
    },
    // @ts-ignore
    args: args ?? [],
    // @ts-ignore
    func: scripts[script],
  });
  return results[0].result;
}
