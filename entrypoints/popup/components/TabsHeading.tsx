import { ReactNode } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useTabContext } from "../../context/tabContext";

interface Tab {
  title: ReactNode;
  value: string;
  tabContent: ReactNode;
}

interface TabsHeadingProps {
  title: string;
  tabs: Tab[];
}

export const TabsHeading = ({ title, tabs }: TabsHeadingProps) => {
  const { activeTabId, setActiveTab } = useTabContext();
  const titleTabs = tabs.map((t) => ({ title: t.title, value: t.value }));
  const contentTabs = tabs.map((t) => ({
    tabContent: t.tabContent,
    value: t.value,
  }));
  
  return (
    <Tabs defaultValue={tabs[0].value} value={activeTabId} onValueChange={setActiveTab}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        <TabsList>
          {titleTabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {contentTabs.map(({ value, tabContent }) => (
        <TabsContent key={value} value={value}>
          {tabContent}
        </TabsContent>
      ))}
    </Tabs>
  );
};
