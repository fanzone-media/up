import { DateTime } from 'luxon';
import { ReactText, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useSigner } from 'wagmi';
import { useModal } from '../../../../hooks/useModal';
import { useUrlParams } from '../../../../hooks/useUrlParams';
import { IAuctionMarket, ICard } from '../../../../services/models';
import { BidModalContent } from '../../BidModalContent';
import { StyledBidButton } from './styles';

interface IProps {
  asset: ICard;
  auctionMarket: IAuctionMarket;
}

export const Bidbutton = ({ asset, auctionMarket }: IProps) => {
  const { network } = useUrlParams();
  const { data: signer } = useSigner();
  const toastRef = useRef<ReactText>();

  const handleOnClick = () => {
    if (signer) {
      onPresentBidModal();
    } else {
      toast.dismiss(toastRef.current);
      toast('Please connect to metamask', {
        type: 'error',
        position: 'top-center',
      });
    }
  };

  useEffect(() => {
    if (!signer) onDismissBidModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer]);

  const { handlePresent: onPresentBidModal, onDismiss: onDismissBidModal } =
    useModal(
      <BidModalContent
        onDismiss={() => onDismissBidModal}
        asset={asset}
        auctionMarket={auctionMarket}
        network={network}
      />,
      'Bid Modal',
      'Bid',
    );

  return (
    <StyledBidButton
      disabled={auctionMarket.auction.endTime <= DateTime.now().toSeconds()}
      onClick={handleOnClick}
    >
      Bid
    </StyledBidButton>
  );
};
