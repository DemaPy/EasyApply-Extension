import { createContext, PropsWithChildren } from "react";

const TabContext = createContext<TabProviderProps | null>(null);

export const useTabContext = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("Context outside of provider");
  }
  return context;
};

interface TabProviderProps {
  setActiveTab?: (tabId: string) => void;
  activeTabId?: string;
}

export const TabContextProvider = ({
  children,
  ...props
}: PropsWithChildren<TabProviderProps>) => {
  return <TabContext.Provider value={props}>{children}</TabContext.Provider>;
};
