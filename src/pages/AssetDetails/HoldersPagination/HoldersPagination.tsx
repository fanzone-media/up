import { useMemo } from 'react';
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
  selectUserIds,
} from '../../../features/profiles';
import { ProfileCard } from '../../../features/profiles/ProfileCard';
import { usePaginate } from '../../../hooks/usePaginate';
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

  const {
    currentPage,
    setCurrentPage,
    pageCount,
    paginationGroup,
    start,
    end,
  } = usePaginate({ totalItems: holdersAddresses.length });

  const allProfiles = useSelector((state: RootState) =>
    selectUserIds(state.userData[params.network]),
  );

  const holders = useSelector((state: RootState) => {
    return selectAllUsersItems(state.userData[params.network]);
  }).filter((item) => {
    return holdersAddresses.slice(start, end).some((i) => {
      return i === item.address;
    });
  });

  useMemo(() => {
    if (holderStatus === STATUS.LOADING) return;
    let addresses: string[] = [];
    holdersAddresses.slice(start, end).forEach((item) => {
      if (!allProfiles?.includes(item)) {
        addresses.push(item);
      }
    });
    if (addresses.length > 0) {
      dispatch(
        fetchAssetHolders({ address: addresses, network: params.network }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProfiles, dispatch, end, holdersAddresses, params.network, start]);

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
