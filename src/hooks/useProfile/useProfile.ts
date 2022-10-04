import { useState, useCallback } from 'react';
import { NetworkName } from '../../boot/types';
import { LSP3ProfileApi } from '../../services/controllers/LSP3Profile';
import { IProfile } from '../../services/models';

interface ProfileCache {
  [address: string]: IProfile;
}

type Result = [
  IProfile | null,
  string,
  (cardAddress: string, network: NetworkName) => void,
  boolean,
];

export const useProfile = (): Result => {
  const [profileCache, setProfileCache] = useState<ProfileCache>({});
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [profileAddressError, setProfileAddressError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const getProfile = useCallback(
    (profileAddress, network) => {
      setProfileAddressError('');
      const cahcedProfile = profileCache[profileAddress];
      if (cahcedProfile) {
        setProfile(cahcedProfile);
        return;
      }

      setIsLoading(true);

      LSP3ProfileApi.getProfile(profileAddress, network)
        .then((profile) => {
          if (!profile) {
            setProfileAddressError('Profile not found');
          }

          setProfileAddressError('');

          setProfileCache({
            ...profileCache,
            [profileAddress]: profile,
          });

          setProfile(profile!);
        })
        .catch((error) => {
          console.log(error);
          setProfile(null);
          setProfileAddressError(error.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [profileCache, profile, profileAddressError, isLoading],
  );

  return [profile, profileAddressError, getProfile, isLoading];
};
