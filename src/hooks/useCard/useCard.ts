import { useState, useCallback } from 'react';
import { NetworkName } from '../../boot/types';
import { LSP4DigitalAssetApi } from '../../services/controllers/LSP4DigitalAsset';
import { ICard } from '../../services/models';

interface CardCache {
  [address: string]: ICard;
}

type Result = [
  ICard | null,
  (cardAddress: string, network: NetworkName) => void,
  boolean,
];

export const useCard = (): Result => {
  const [cardCache, setCardCache] = useState<CardCache>({});
  const [card, setCard] = useState<ICard | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCard = useCallback(
    (cardAddress, network) => {
      const cahcedCard = cardCache[cardAddress];
      if (cahcedCard) {
        setCard(cahcedCard);
        return;
      }
      setIsLoading(true);
      LSP4DigitalAssetApi.fetchCard(cardAddress, network)
        .then((card) => {
          setCardCache({
            ...cardCache,
            [cardAddress]: card,
          });

          setCard(card);
        })
        .catch((error) => {
          console.log(error);
          setCard(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [card, setCard, cardCache, setCardCache],
  );

  return [card, getCard, isLoading];
};
