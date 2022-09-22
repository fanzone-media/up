import { useMemo } from 'react';
import { theme } from '../../../../boot/styles';
import { StyledAccordionTitle } from '../../../../components/Accordion/styles';
import { useMediaQuery } from '../../../../hooks/useMediaQuery';
import { ICard } from '../../../../services/models';
import { StyledDividerSpan } from '../../styles';
import {
  StyledCardInfo,
  StyledCardInfoAccordion,
  StyledCardInfoContainer,
  StyledCardInfoLabel,
  StyledCardInfoValue,
  StyledCardStandardLabel,
} from './styles';

interface IProps {
  asset: ICard;
  assetId?: string;
}

export const CardInfoAccordion = ({ asset, assetId }: IProps) => {
  const isDesktop = useMediaQuery(theme.screen.md);

  const cardInfo: {
    label: string;
    value: string;
    valueType?: string;
  }[] = [
    {
      label: 'NFT name',
      value: asset.name,
    },
    {
      label: asset.supportedInterface === 'lsp8' ? 'Mint' : 'Total Supply',
      //   value:
      //     ownedTokenIds && ownedTokenIds.length > 0
      //       ? ownedTokenIds[currentIndex].toString()
      //       : '',
      value:
        asset.supportedInterface === 'lsp8'
          ? ` ${assetId} of ${asset.tokenSupplyCap.toString()}`
          : asset.totalSupply.toString(),
      valueType: 'supply',
    },
    {
      label: 'Address',
      value: asset ? asset.address : '',
      valueType: 'address',
    },
  ];

  return (
    <StyledCardInfoAccordion
      header={
        !isDesktop ? (
          <StyledAccordionTitle>Card Info</StyledAccordionTitle>
        ) : null
      }
      enableToggle
    >
      <StyledCardInfo>
        {cardInfo.map((item) => {
          if (item.valueType === 'supply' && !assetId) {
            return '';
          }
          return (
            <StyledCardInfoContainer key={item.label}>
              <StyledCardInfoLabel>{item.label}</StyledCardInfoLabel>
              <StyledCardInfoValue>
                {item.valueType === 'address'
                  ? `${item.value.slice(0, 8)}...${item.value.slice(
                      item.value.length - 4,
                      item.value.length,
                    )}`
                  : item.value}
              </StyledCardInfoValue>
            </StyledCardInfoContainer>
          );
        })}
        <StyledDividerSpan />
        <StyledCardStandardLabel>
          {asset?.supportedInterface.toUpperCase()} on {asset?.network}
        </StyledCardStandardLabel>
      </StyledCardInfo>
    </StyledCardInfoAccordion>
  );
};
