import { useState, useEffect } from "react";
import { Label } from "@radix-ui/react-label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { CheckSquare2, Clipboard } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import useOpenAIkey from "../../../hooks/useOpenAIkey";

export const Settings = () => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const OPENAI_KEY = useOpenAIkey();
  const [openAiKey, setOpenAiKey] = useState(() => OPENAI_KEY);

  useEffect(() => {
    setOpenAiKey(OPENAI_KEY);
  }, [OPENAI_KEY]);

  const handleSaveSettings = () => {
    if (!openAiKey) return;
    setSaved(true);
    browser.storage.local.set({
      preferences: {
        OPENAI_KEY: openAiKey,
      },
    });
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  const handleCopy = () => {
    if (!openAiKey) return;
    setCopied(true);
    navigator.clipboard.writeText(openAiKey);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  return (
    <div className="flex flex-col h-full gap-2">
      <div>
        <Label htmlFor="openai_key">Open AI key</Label>
        <div className="flex gap-1">
          <Input
            onChange={(ev) => setOpenAiKey(ev.target.value.trim())}
            value={openAiKey}
            type="text"
            id="openai_key"
            placeholder="Open AI key"
          />
          <Tooltip open={copied}>
            <TooltipTrigger asChild>
              <Button variant={"secondary"} onClick={handleCopy}>
                <Clipboard />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              tooltipArrowHidden={true}
              className="flex items-center gap-1 bg-green-100 text-green-600"
            >
              <CheckSquare2 size={16} />
              Copied
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      {OPENAI_KEY !== openAiKey && (
        <Tooltip open={saved}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="mt-auto"
              onClick={handleSaveSettings}
            >
              Save
            </Button>
          </TooltipTrigger>
          <TooltipContent
            tooltipArrowHidden={true}
            className="flex items-center gap-1 bg-green-100 text-green-600"
          >
            <CheckSquare2 size={16} />
            Saved
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};
