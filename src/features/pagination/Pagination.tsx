import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { MetaCard } from '../cards/MetaCard';
import { ICard, IProfile } from '../../services/models';
import { PrevIcon } from '../../assets';
import { NextIcon } from '../../assets';
import { NetworkName, RootState } from '../../boot/types';
import {
  StyledAssetsHeader,
  StyledAssetsHeading,
  StyledAssetsWrappar,
  StyledNextButton,
  StyledNextIcon,
  StyledPageNumButton,
  StyledPaginationControls,
  StyledPaginationWrappar,
  StyledPrevIcon,
  StyledPreviousButton,
} from './styles';
import { Search } from '../../components/Search';
import { useAppDispatch } from '../../boot/store';
import {
  fetchAllCards,
  fetchIssuedCards,
  fetchOwnedCards,
  selectAllCardItems,
} from '../cards';
import { useSelector } from 'react-redux';
import {
  StyledLoader,
  StyledLoadingHolder,
} from '../../pages/AssetDetails/styles';
import { STATUS } from '../../utility';

interface IPagination {
  type: string;
  profile?: IProfile;
  openTransferCardModal?: (address: string) => void;
  transferPermission?: boolean;
  collectionAddresses: string[];
}

interface IParams {
  add: string;
  network: NetworkName;
}

const useViewPort = () => {
  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const handleSize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleSize);

    return () => window.removeEventListener('resize', handleSize);
  }, []);

  return { screenWidth };
};

const Pagination: React.FC<IPagination> = ({
  type,
  profile,
  openTransferCardModal,
  transferPermission,
  collectionAddresses,
}) => {
  const params = useParams<IParams>();

  const dispatch = useAppDispatch();

  const [currentPageAssetAddresses, setCurrentPageAssetAddresses] = useState<
    string[]
  >([]);

  const allCollection = useSelector(selectAllCardItems).filter((item) =>
    currentPageAssetAddresses.some((i) => i === item.address),
  );

  const ownedCardStatus = useSelector(
    (state: RootState) => state.cards.ownedStatus,
  );

  const issuedCardStatus = useSelector(
    (state: RootState) => state.cards.issuedStatus,
  );

  const cardStatus = useSelector((state: RootState) => state.cards.status);

  const [search, setSearch] = useState<string>('');

  const { screenWidth } = useViewPort();

  const [filterCollection, setFilterCollection] = useState<ICard[]>();

  const [currentPage, setCurrentPage] = useState<number>(1);

  const [limit, setLimit] = useState<number>(4);

  const [pagesCount, setPagesCount] = useState<number>(1);

  //helper
  const range = (from: number, to: number) => {
    const range: number[] = [];
    let i = from;
    while (i <= to) {
      range.push(i);
      i++;
    }
    return range;
  };

  const nextPage = () => {
    setCurrentPage((currentPage) =>
      currentPage === pagesCount ? currentPage : currentPage + 1,
    );
  };

  const previousPage = () => {
    setCurrentPage((currentPage) =>
      currentPage === 1 ? currentPage : currentPage - 1,
    );
  };

  const changePage = (event: React.MouseEvent) => {
    const pageNumber = Number(event.currentTarget.textContent);
    setCurrentPage(pageNumber);
  };

  const paginationGroup = () => {
    if (pagesCount === 2) {
      return range(1, 2);
    }
    switch (currentPage) {
      case 1:
        return range(currentPage, currentPage + 2);
      case pagesCount:
        return range(currentPage - 2, currentPage);
      default:
        return range(currentPage - 1, currentPage + 1);
    }
  };

  useMemo(() => {
    if (screenWidth < 769) {
      setPagesCount(Math.ceil(collectionAddresses.length / 4));
      setLimit(4);
    }
    if (screenWidth > 768) {
      setPagesCount(Math.ceil(collectionAddresses.length / 6));
      setLimit(6);
    }
    if (screenWidth > 1024) {
      setPagesCount(Math.ceil(collectionAddresses.length / 8));
      setLimit(8);
    }
    if (screenWidth > 1280) {
      setPagesCount(Math.ceil(collectionAddresses.length / 10));
      setLimit(10);
    }
  }, [collectionAddresses.length, screenWidth]);

  useMemo(() => {
    const start = currentPage * limit - limit;
    const end = start + limit;
    setCurrentPageAssetAddresses(collectionAddresses.slice(start, end));
    if (
      type === 'owned' &&
      ownedCardStatus !== STATUS.LOADING &&
      allCollection.length !== currentPageAssetAddresses.length
    ) {
      dispatch(
        fetchOwnedCards({
          network: params.network,
          addresses: collectionAddresses.slice(start, end),
        }),
      );
    }
    if (
      type === 'issued' &&
      issuedCardStatus !== STATUS.LOADING &&
      allCollection.length !== currentPageAssetAddresses.length
    ) {
      dispatch(
        fetchIssuedCards({
          network: params.network,
          addresses: collectionAddresses.slice(start, end),
        }),
      );
    }
    if (
      type === 'demo' &&
      cardStatus !== STATUS.LOADING &&
      allCollection.length !== currentPageAssetAddresses.length
    ) {
      dispatch(
        fetchAllCards({
          network: params.network,
          addresses: collectionAddresses.slice(start, end),
        }),
      );
    }
  }, [
    allCollection.length,
    cardStatus,
    collectionAddresses,
    currentPage,
    currentPageAssetAddresses.length,
    dispatch,
    issuedCardStatus,
    limit,
    ownedCardStatus,
    params.network,
    type,
  ]);

  // const getBalanceOf = () => {
  //   if (balanceOf.length < 1) {
  //     if (type === 'owned') {
  //       collection.forEach(async (item) => {
  //         const res = await LSP4DigitalAssetApi.fetchBalanceOf(
  //           new Web3Service(),
  //         )(params.network, item.address, profileAddr);
  //         setBalanceOf((prevState) => [
  //           ...prevState,
  //           { address: item.address, balance: res },
  //         ]);
  //       });
  //     }
  //   }
  // };

  const searchHandler = (event: React.FormEvent<HTMLInputElement>) => {
    // setSearch(event.currentTarget.value.toLowerCase());
    // if (search !== '') setCurrentPage(1);
    // const filter = collection.filter((item) => {
    //   const name = item.name.split('•')[0];
    //   return name
    //     .toLowerCase()
    //     .includes(event.currentTarget.value.toLowerCase());
    // });
    // setFilterCollection(filter);
  };

  const renderCollection = useMemo(
    () =>
      allCollection.map((digitalCard: ICard) => {
        if (type === 'owned' || type === 'issued') {
          const findBalanceOf = profile?.ownedAssets.find(
            (item) =>
              item.assetAddress.toLowerCase() ===
              digitalCard.address.toLowerCase(),
          );
          return (
            <MetaCard
              key={digitalCard.address}
              digitalCard={digitalCard}
              type={type}
              balance={findBalanceOf?.balance}
              openTransferCardModal={openTransferCardModal}
              transferPermission={transferPermission}
            />
          );
        }
        if (type === 'demo') {
          return (
            <MetaCard
              key={digitalCard.address}
              digitalCard={digitalCard}
              type={type}
            />
          );
        }
        return '';
      }),
    [
      allCollection,
      currentPageAssetAddresses,
      type,
      profile?.ownedAssets,
      openTransferCardModal,
      transferPermission,
    ],
  );

  return (
    <StyledPaginationWrappar>
      <StyledAssetsHeader className="flex">
        <StyledAssetsHeading>
          {type === 'demo' ? 'Assets' : `${type} Assets`}
        </StyledAssetsHeading>
        <Search onChange={searchHandler} />
      </StyledAssetsHeader>
      {/* {ownedCardStatus === STATUS.LOADING ||
      issuedCardStatus === STATUS.LOADING ||
      cardStatus === STATUS.LOADING ? (
        <StyledLoadingHolder>
          <StyledLoader color="#ed7a2d" />
        </StyledLoadingHolder>
      ) : ( */}
      <StyledAssetsWrappar>{renderCollection}</StyledAssetsWrappar>
      {pagesCount > 1 && search === '' && (
        <StyledPaginationControls>
          <StyledPreviousButton
            onClick={previousPage}
            disabled={currentPage === 1 ? true : false}
          >
            <StyledPrevIcon src={PrevIcon} alt="" />
          </StyledPreviousButton>
          {currentPage >= 3 && pagesCount > 3 && (
            <>
              <StyledPageNumButton onClick={changePage}>1</StyledPageNumButton>
              <p>...</p>
            </>
          )}
          {paginationGroup().map((value) => (
            <StyledPageNumButton
              key={value}
              active={currentPage === value ? true : false}
              onClick={changePage}
            >
              {value}
            </StyledPageNumButton>
          ))}
          {currentPage <= pagesCount - 2 && pagesCount > 3 && (
            <>
              <p>...</p>
              <StyledPageNumButton onClick={changePage}>
                {pagesCount}
              </StyledPageNumButton>
            </>
          )}
          <StyledNextButton
            onClick={nextPage}
            disabled={currentPage === pagesCount ? true : false}
          >
            <StyledNextIcon src={NextIcon} alt="" />
          </StyledNextButton>
        </StyledPaginationControls>
      )}
    </StyledPaginationWrappar>
  );
};

export default Pagination;
