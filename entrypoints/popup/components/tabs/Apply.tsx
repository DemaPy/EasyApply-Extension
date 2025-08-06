import { useState } from "react";
import { Heading } from "../Heading";
import { ProfileSelect } from "../select/ProfileSelect";
import { Form, FormSelect } from "../select/FormSelect";
import { Profile } from "../../../../types";
import { Button } from "../../../components/ui/button";
import { useFulfillForm } from "../../../hooks/useFulfillForm";
import { Alert } from "../feedback/Alert";

export const Apply = () => {
  const [profile, setProfile] = useState<null | Profile>(null);
  const [form, setForm] = useState<null | Form>(null);
  const { fulfillForm, error, loading } = useFulfillForm();

  const handleFulfillForm = () => {
    if (!form || !profile) return;
    fulfillForm(form, profile)
  }
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex flex-col gap-1">
        <Heading title="Forms" />
        <FormSelect form={form} onSelect={setForm} />
      </div>
      {form && (
        <div className="flex flex-col gap-1">
          <Heading title="Profiles" />
          <ProfileSelect profile={profile} onSelect={setProfile} />
        </div>
      )}
      {error && <Alert title="Oops" subtitle={error} type="error" />}
      {profile && form && (
        <Button disabled={loading || !!error} variant={"outline"} className="mt-auto" onClick={handleFulfillForm}>
          Fulfill form
        </Button>
      )}
    </div>
  );
};
