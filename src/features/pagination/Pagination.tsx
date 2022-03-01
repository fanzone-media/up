import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { MetaCard } from '../cards/MetaCard';
import { IBalanceOf, ICard, IProfile } from '../../services/models';
import { PrevIcon } from '../../assets';
import { NextIcon } from '../../assets';
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

interface IPagination {
  collection: ICard[];
  type: string;
  profile?: IProfile;
}

interface IParams {
  add: string;
  network: string;
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

const Pagination: React.FC<IPagination> = ({ collection, type, profile }) => {
  const params = useParams<IParams>();

  const [search, setSearch] = useState<string>('');

  const { screenWidth } = useViewPort();

  const [filterCollection, setFilterCollection] = useState<ICard[]>(collection);

  const [currentPage, setCurrentPage] = useState<number>(1);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [balanceOf, setBalanceOf] = useState<IBalanceOf[]>([]);

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

  const getPaginationData = () => {
    let limit: number = 4;
    if (screenWidth < 769) {
      setPagesCount(Math.ceil(filterCollection.length / 4));
      limit = 4;
    }
    if (screenWidth > 768) {
      setPagesCount(Math.ceil(filterCollection.length / 6));
      limit = 6;
    }
    if (screenWidth > 1024) {
      setPagesCount(Math.ceil(filterCollection.length / 8));
      limit = 8;
    }
    if (screenWidth > 1280) {
      setPagesCount(Math.ceil(filterCollection.length / 10));
      limit = 10;
    }
    if (search === '') {
      const start = currentPage * limit - limit;
      const end = start + limit;
      return filterCollection.slice(start, end);
    } else {
      return filterCollection;
    }
  };

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
    setSearch(event.currentTarget.value.toLowerCase());
    if (search !== '') setCurrentPage(1);
    const filter = collection.filter((item) => {
      const name = item.name.split('•')[0];
      return name
        .toLowerCase()
        .includes(event.currentTarget.value.toLowerCase());
    });
    setFilterCollection(filter);
  };

  useEffect(() => {
    setFilterCollection(collection);
    //getBalanceOf();
  }, [collection]);

  const renderCollection = useMemo(
    () =>
      getPaginationData().map((digitalCard: ICard) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      collection,
      params.add,
      type,
      screenWidth,
      balanceOf,
      filterCollection,
      currentPage,
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
