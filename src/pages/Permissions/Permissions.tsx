import { useUrlParams } from '../../hooks';
import { AddPermissionsModalContent } from '../ProfileDetails/AddPermissionsModalContent';

export const Permissions = () => {
  const { network } = useUrlParams();

  return <AddPermissionsModalContent network={network} />;
};
