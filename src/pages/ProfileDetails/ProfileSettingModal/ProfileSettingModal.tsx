import { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { NetworkName, StringBoolean } from '../../../boot/types';
import { Tabs } from '../../../components/Tabs';
import { IProfile } from '../../../services/models';
import { getAddressPermissionsOnUniversalProfile } from '../../../utility/permissions';
import { AddPermissionsModalContent } from '../AddPermissionsModalContent';
import { ProfileEditModal } from '../ProfileEditModal';

interface IProps {
  profile: IProfile;
  network: NetworkName;
  onDismiss: () => void;
}

export const ProfileSettingModal = ({
  profile,
  network,
  onDismiss,
}: IProps) => {
  const { address: account } = useAccount();

  const [tabName, setTabName] = useState('');

  const [canTransfer, canSetData, canAddPermissions] = useMemo(() => {
    if (!account) return [false, false, false];

    const permissionsSet = getAddressPermissionsOnUniversalProfile(
      profile.permissionSet,
      account,
    );

    return [
      permissionsSet?.permissions.call === StringBoolean.TRUE,
      permissionsSet?.permissions.setdata === StringBoolean.TRUE,
      permissionsSet?.permissions.addpermissions === StringBoolean.TRUE,
    ];
  }, [account, profile]);

  const tabs = [
    {
      name: tabName || 'Update Info',
      content: (
        <ProfileEditModal
          profile={profile}
          onDismiss={onDismiss}
          setTabName={(name: string) => setTabName(name)}
        />
      ),
      visible: canTransfer && canSetData,
    },
    {
      name: 'Permissions',
      content: (
        <AddPermissionsModalContent profile={profile} network={network} />
      ),
      visible: canAddPermissions,
    },
  ];

  return <Tabs tabs={tabs} />;
};
