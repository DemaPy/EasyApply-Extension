import React, { useEffect, useState } from "react";
import { Profile } from "../../types";

export const useProfiles = () => {
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  useEffect(() => {
    setLoading(true);
    (async () => {
      const data = await browser.storage.local.get("profiles");
      const profiles: undefined | Profile = data?.profiles;
      if (profiles && Array.isArray(profiles)) {
        setProfiles(profiles);
      }
    })().finally(() => {
      setLoading(false);
    });
  }, []);
  return {
    data: profiles,
    loading,
  };
};
