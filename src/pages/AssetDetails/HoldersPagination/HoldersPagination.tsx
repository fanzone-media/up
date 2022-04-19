import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { NextIcon, PrevIcon } from '../../../assets';
import { useAppDispatch } from '../../../boot/store';
import { NetworkName, RootState } from '../../../boot/types';
import {
  StyledNextButton,
  StyledNextIcon,
  StyledPageNumButton,
  StyledPaginationControls,
  StyledPrevIcon,
  StyledPreviousButton,
} from '../../../features/pagination/styles';
import {
  fetchAssetHolders,
  selectAllUsersItems,
} from '../../../features/profiles';
import { ProfileCard } from '../../../features/profiles/ProfileCard';
import { useViewPort } from '../../../hooks/useViewPort';
import { STATUS } from '../../../utility';
import {
  StyledHolderPagination,
  StyledHolderPaginationGridContainer,
} from './styles';

type IParams = {
  network: NetworkName;
  add: string;
};
interface IProps {
  holdersAddresses: string[];
}

export const HolderPagination = ({ holdersAddresses }: IProps) => {
  const dispatch = useAppDispatch();
  const params = useParams<IParams>();
  const holderStatus = useSelector(
    (state: RootState) => state.userData[params.network].holderStatus,
  );

  const { screenWidth } = useViewPort();
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { pageCount, limit } = useMemo(() => {
    if (screenWidth > 1280) {
      return {
        pageCount: Math.ceil(holdersAddresses.length / 12),
        limit: 12,
      };
    }
    if (screenWidth > 1024) {
      return {
        pageCount: Math.ceil(holdersAddresses.length / 10),
        limit: 10,
      };
    }
    if (screenWidth > 768) {
      return {
        pageCount: Math.ceil(holdersAddresses.length / 8),
        limit: 8,
      };
    }

    return {
      pageCount: Math.ceil(holdersAddresses.length / 6),
      limit: 6,
    };
  }, [holdersAddresses.length, screenWidth]);

  const range = (from: number, to: number) => {
    const range: number[] = [];
    let i = from;
    while (i <= to) {
      range.push(i);
      i++;
    }
    return range;
  };

  const paginationGroup = () => {
    if (pageCount === 2) {
      return range(1, 2);
    }
    switch (currentPage) {
      case 1:
        return range(currentPage, currentPage + 2);
      case pageCount:
        return range(currentPage - 2, currentPage);
      default:
        return range(currentPage - 1, currentPage + 1);
    }
  };

  const start = useMemo(
    () => currentPage * limit - limit,
    [currentPage, limit],
  );
  const end = useMemo(() => start + limit, [limit, start]);

  const holders = useSelector((state: RootState) => {
    return selectAllUsersItems(state.userData[params.network]);
  }).filter((item) => {
    return holdersAddresses.slice(start, end).some((i) => {
      return i === item.address;
    });
  });

  useMemo(() => {
    dispatch(
      fetchAssetHolders({
        address: holdersAddresses.slice(start, end),
        network: params.network,
      }),
    );
  }, [dispatch, end, holdersAddresses, params.network, start]);

  const nextPage = () => {
    setCurrentPage((currentPage) =>
      currentPage === pageCount ? currentPage : currentPage + 1,
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

  useMemo(() => {
    console.log(start, end, pageCount);
  }, [end, pageCount, start]);

  const renderHolders = useMemo(
    () =>
      holders.map((holder) => {
        const findBalanceOf = holder.ownedAssets.find(
          (item) => item.assetAddress === params.add.toLowerCase(),
        );
        return (
          <>
            <ProfileCard
              key={holder.address}
              balance={findBalanceOf?.balance ? findBalanceOf.balance : 0}
              userProfile={holder}
              type="holder"
              tooltipId="holderTooltip"
            />
            <ReactTooltip
              id="holderTooltip"
              getContent={(dataTip) => <span>Token Ids: {dataTip}</span>}
            ></ReactTooltip>
          </>
        );
      }),
    [holders, params.add],
  );

  return (
    <StyledHolderPagination>
      <StyledHolderPaginationGridContainer>
        {renderHolders}
      </StyledHolderPaginationGridContainer>
      {pageCount > 1 && (
        <StyledPaginationControls>
          <StyledPreviousButton
            onClick={previousPage}
            disabled={currentPage === 1 ? true : false}
          >
            <StyledPrevIcon src={PrevIcon} alt="" />
          </StyledPreviousButton>
          {currentPage >= 3 && pageCount > 3 && (
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
          {currentPage <= pageCount - 2 && pageCount > 3 && (
            <>
              <p>...</p>
              <StyledPageNumButton onClick={changePage}>
                {pageCount}
              </StyledPageNumButton>
            </>
          )}
          <StyledNextButton
            onClick={nextPage}
            disabled={currentPage === pageCount ? true : false}
          >
            <StyledNextIcon src={NextIcon} alt="" />
          </StyledNextButton>
        </StyledPaginationControls>
      )}
    </StyledHolderPagination>
  );
};
