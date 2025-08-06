import { useCallback } from "react";
import { ProfileCard } from "../cards/ProfileCard";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Profile } from "../../../../types";
import { useTabContext } from "../../../context/tabContext";
import { Alert } from "../feedback/Alert";

export const ProfilesList = () => {
  const { setActiveTab } = useTabContext();
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    (async () => {
      const data = await browser.storage.local.get("profiles");
      const profiles: undefined | Profile = data?.profiles;
      if (profiles && Array.isArray(profiles)) {
        setProfiles(profiles);
      }
    })();
  }, []);

  const handleDeleteProfile = useCallback((profileId: string) => {
    browser.storage.local.get("profiles").then((data) => {
      const profiles: Profile[] = data.profiles;
      const newProfiles = profiles.filter((p) => p.id !== profileId);
      browser.storage.local
        .set({
          profiles: newProfiles,
        })
        .then(() => {
          setProfiles(newProfiles);
        })
    });
  }, []);

  const handleEditProfile = useCallback((profileId: string) => {
    browser.storage.local
      .set({
        editProfileId: profileId,
      })
      .then(() => {
        setActiveTab?.("add");
      });
  }, []);

  if (!profiles.length) {
    return <Alert title="Oops" subtitle="It looks like you don't have any profiles yet!" />
  }

  return (
    <ScrollArea className="h-[400px] bg-slate-50 rounded-md border p-2">
      <div className="flex flex-col gap-2">
        {profiles.map((p, index) => (
          <ProfileCard
            key={index}
            onEdit={handleEditProfile}
            onDelete={handleDeleteProfile}
            profile={p}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
