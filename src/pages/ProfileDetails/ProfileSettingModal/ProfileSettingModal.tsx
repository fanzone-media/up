import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { StringBoolean } from '../../../boot/types';
import { Tabs } from '../../../components/Tabs';
import { IProfile } from '../../../services/models';
import { getAddressPermissionsOnUniversalProfile } from '../../../utility/permissions';
import { AddPermissions } from '../../AddPermissions';
import { ProfileEditModal } from '../ProfileEditModal';

interface IProps {
  profile: IProfile;
  onDismiss: () => void;
}

export const ProfileSettingModal = ({ profile, onDismiss }: IProps) => {
  const [{ data: account }] = useAccount();

  const [canTransfer, canSetData, canAddPermissions] = useMemo(() => {
    if (!account) return [false, false, false];

    const permissionsSet = getAddressPermissionsOnUniversalProfile(
      profile.permissionSet,
      account.address,
    );

    return [
      permissionsSet?.permissions.call === StringBoolean.TRUE,
      permissionsSet?.permissions.setdata === StringBoolean.TRUE,
      permissionsSet?.permissions.addpermissions === StringBoolean.TRUE,
    ];
  }, [account, profile]);

  const tabs = [
    {
      name: 'Update info',
      content: <ProfileEditModal profile={profile} onDismiss={onDismiss} />,
      visible: canTransfer && canSetData,
    },
    {
      name: 'Permissions',
      content: <AddPermissions upAddress={profile.address} />,
      visible: canTransfer && canAddPermissions,
    },
  ];

  return <Tabs tabs={tabs} />;
};
