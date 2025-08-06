import "~/assets/tailwind.css";
import { Heading } from "./components/Heading";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Profiles, Apply, Settings } from "./components/tabs";

function App() {
  return (
    <div className="px-5 pt-4 bg-white h-full">
      <div className="flex flex-col gap-4">
        <Heading size="xl" title="EasyApply" subtitle="AI-powered applying tool" />
        <Tabs defaultValue="profiles" className="h-full">
          <TabsList className="w-full">
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
            <TabsTrigger value="apply">Apply</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="profiles">
            <Profiles />
          </TabsContent>
          <TabsContent value="apply">
            <Apply />
          </TabsContent>
          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
