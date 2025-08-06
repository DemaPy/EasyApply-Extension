import { TabsHeading } from "../TabsHeading";
import { List, Settings } from "lucide-react";
import { CreateProfile } from "./CreateProfile";
import { ProfilesList } from "./ProfilesList";
import { TabContextProvider } from "../../../context/tabContext";

const TABS = [
  {
    title: (
      <div className="flex gap-1 items-center">
        <List />
        <p>List</p>
      </div>
    ),
    value: "profiles",
    tabContent: <ProfilesList />,
  },
  {
    title: (
      <div className="flex gap-1 items-center">
        <Settings />
        <p>Manage</p>
      </div>
    ),
    value: "add",
    tabContent: <CreateProfile />,
  },
];

export const Profiles = () => {
  const [activeTab, setActiveTab] = useState<string>("profiles");
  return (
    <TabContextProvider activeTabId={activeTab} setActiveTab={setActiveTab}>
      <TabsHeading title="Profiles" tabs={TABS} />
    </TabContextProvider>
  );
};
