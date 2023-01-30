import React from 'react';
import { useAccount } from 'wagmi';
import {
  StyledAccountDetailsModal,
  StyledAddressLabel,
  StyledDisconnectButton,
} from './styles';

export const AccountDetails = React.forwardRef((_props: any, ref: any) => {
  // const [{ data }, disconnect] = useAccount();
  //const [{data: dataSigner}] = useSigner();

  // const getBalance = async () => {
  //     return await dataSigner?.getBalance();
  // }

  // useMemo(async () => {
  //     await getBalance();
  // }, []);

  // console.log(await getBalance());

  return (
    <StyledAccountDetailsModal ref={ref}>
      <StyledAddressLabel>Address:</StyledAddressLabel>
      {/* {data?.address}
      <StyledDisconnectButton onClick={() => disconnect()}>
        Disconnect
      </StyledDisconnectButton> */}
    </StyledAccountDetailsModal>
  );
});
