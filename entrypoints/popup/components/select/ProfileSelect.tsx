import { useProfiles } from "../../../hooks/useProfiles";
import { Profile } from "../../../../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

interface ProfileSelectProps {
  profile: Profile | null;
  onSelect: (profile: Profile) => void;
}

export const ProfileSelect = ({ profile, onSelect }: ProfileSelectProps) => {
  const { data: profiles } = useProfiles();
  const handleProfileSelect = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId)!;
    onSelect(profile);
  };

  useEffect(() => {
    if (profiles.length === 1) {
      onSelect(profiles[0])
    }
  }, [profiles])

  return (
    <Select onValueChange={handleProfileSelect} value={profile?.id}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select profile" />
      </SelectTrigger>
      <SelectContent>
        {profiles.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
