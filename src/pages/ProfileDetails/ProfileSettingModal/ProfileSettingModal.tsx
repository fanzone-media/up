import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { StringBoolean } from '../../../boot/types';
import { Tabs } from '../../../components/Tabs';
import { IProfile } from '../../../services/models';
import { getAddressPermissionsOnUniversalProfile } from '../../../utility/permissions';
import { AddPermissions } from '../../AddPermissions';

interface IProps {
  profile: IProfile;
}

export const ProfileSettingModal = ({ profile }: IProps) => {
  const [{ data: account }] = useAccount();

  const [canTransfer, canSetData, canAddPermissions] = useMemo(() => {
    if (!account) return [false, false, false];

    const permissionsSet = getAddressPermissionsOnUniversalProfile(
      profile.permissionSet,
      account.address,
    );

    return [
      permissionsSet?.permissions.call === StringBoolean.TRUE,
      permissionsSet?.permissions.setData === StringBoolean.TRUE,
      permissionsSet?.permissions.addPermissions === StringBoolean.TRUE,
    ];
  }, [account, profile]);

  const tabs = [
    { name: 'Update info', content: <></>, visible: canTransfer && canSetData },
    {
      name: 'Permissions',
      content: <AddPermissions upAddress={profile.address} />,
      visible: canTransfer && canAddPermissions,
    },
  ];

  return <Tabs tabs={tabs} />;
};
