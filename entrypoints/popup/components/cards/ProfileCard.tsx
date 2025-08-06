import { type Profile } from "../../../../types";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Pencil, Trash } from "lucide-react";

interface ProfileCardProps {
  profile: Profile;
  onDelete: (profileId: string) => void;
  onEdit: (profileId: string) => void;
}

export const ProfileCard = ({
  profile,
  onDelete,
  onEdit,
}: ProfileCardProps) => {
  const remainingSkills = profile.skills.slice(6);

  return (
    <Card className="w-full py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">{profile.title}</CardTitle>
        <CardDescription className="flex gap-1 flex-wrap">
          {profile.skills.slice(0, 6).map((skill, index) => (
            <Badge key={index} variant="outline" className="text-[10px]">
              {skill}
            </Badge>
          ))}
          {!!remainingSkills.length && (
            <Badge className="text-[10px]">{remainingSkills.length} +</Badge>
          )}
        </CardDescription>
        <CardAction className="flex gap-0.5">
          <Button
            size={"sm"}
            onClick={() => onEdit(profile.id)}
            variant="ghost"
          >
            <Pencil />
          </Button>
          <Button
            size={"sm"}
            onClick={() => onDelete(profile.id)}
            variant="ghost"
          >
            <Trash />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex justify-between items-center">
          <div>First Name</div>
          {profile.firstName}
        </div>
        <div className="flex justify-between items-center">
          <div>Last Name</div>
          {profile.lastName}
        </div>
        <div className="flex justify-between items-center">
          <div>Email</div>
          {profile.email}
        </div>
        <div className="flex justify-between items-center">
          <div>Phone</div>
          {profile.phone}
        </div>
        <div className="flex justify-between items-center">
          <div>Current Job Title</div>
          {profile.currentJobTitle}
        </div>
        {profile.languages.map((l) => (
          <div key={l.id} className="flex justify-between items-center">
            <div>Language</div>
            {l.language}
          </div>
        ))}
        <div className="flex justify-between items-center">
          <div>Notice Period</div>
          {profile.noticePeriod}
        </div>
        <div className="flex justify-between items-center">
          <div>Salary Expectations</div>
          {profile.salaryExpectation.value}{" "}
          {profile.salaryExpectation.currency}
        </div>
        <div className="flex justify-between items-center">
          <div>Location</div>
          {profile.location.label}
        </div>
        {profile.socials.map((s) => (
          <div key={s.id} className="flex justify-between items-center">
            <div>{s.url.label || "Social"}</div>
            {s.url.href}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
