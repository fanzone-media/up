import { useEffect, useState } from 'react';
import { NetworkName } from '../../boot/types';
import { AuctionApi } from '../../services/controllers/Auction';
import { IAuctionOptions } from '../../services/models';

export const useAuctionOptions = (network: NetworkName) => {
  const [auctionOptions, setAuctionOptions] = useState<IAuctionOptions | null>(
    null,
  );

  useEffect(() => {
    AuctionApi.fetchAuctionSettings(network).then((res) => {
      setAuctionOptions(res);
    });
  }, [network]);

  return auctionOptions;
};
