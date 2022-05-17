import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { NextIcon, PrevIcon } from '../../assets';
import { useViewPort } from '../../hooks/useViewPort';
import { CardSkeleton } from '../../components/CardSkeleton';
import { STATUS } from '../../utility';
import {
  StyledPaginationGrid,
  StyledPaginationGridElement,
  StyledPageNumButton,
  StyledPaginationControls,
  StyledPaginationWrapper,
  StyledArrowButton,
} from './styles';
import { Address } from '../../utils/types';

interface IPagination {
  status?: STATUS;
  components: Array<React.ReactNode>;
  nbrOfAllComponents: number;
  setComponentsRange: Dispatch<SetStateAction<[number, number]>>;
  addressesToShow?: Array<Address>;
}

export const Pagination: React.FC<IPagination> = ({
  status = 'idle',
  components,
  nbrOfAllComponents,
  setComponentsRange,
  addressesToShow = [],
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagesCount, setPagesCount] = useState<number>(1);
  const [limit, setLimit] = useState<number>(4);
  const { screenWidth } = useViewPort();

  const changePage = useCallback(
    (pageNumber: number) => {
      setComponentsRange([pageNumber * limit - limit, pageNumber * limit - 1]);
      setCurrentPage(pageNumber);
    },
    [limit, setComponentsRange],
  );

  //helper
  const range = useCallback((from: number, to: number) => {
    const range: number[] = [];
    let i = from;
    while (i <= to) {
      range.push(i);
      i++;
    }
    return range;
  }, []);

  useMemo(() => {
    if (screenWidth < 769) {
      setPagesCount(Math.ceil(nbrOfAllComponents / 4));
      setLimit(4);
    }
    if (screenWidth > 768) {
      setPagesCount(Math.ceil(nbrOfAllComponents / 6));
      setLimit(6);
    }
    if (screenWidth > 1024) {
      setPagesCount(Math.ceil(nbrOfAllComponents / 8));
      setLimit(8);
    }
    if (screenWidth > 1280) {
      setPagesCount(Math.ceil(nbrOfAllComponents / 10));
      setLimit(10);
    }
  }, [screenWidth, nbrOfAllComponents]);

  const paginationGroup = useMemo(() => {
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
  }, [currentPage, pagesCount, range]);

  return (
    <StyledPaginationWrapper>
      <StyledPaginationGrid>
        {status === 'loading'
          ? [...Array(limit).keys()].map((el, key) => (
              <StyledPaginationGridElement key={key}>
                <CardSkeleton />
              </StyledPaginationGridElement>
            ))
          : components.map((component, key) => (
              <StyledPaginationGridElement key={key}>
                {component}
              </StyledPaginationGridElement>
            ))}
      </StyledPaginationGrid>
      {pagesCount > 1 && (
        <StyledPaginationControls>
          <StyledArrowButton
            disabled={status === 'loading' && true}
            onClick={() =>
              changePage(currentPage === 1 ? pagesCount : currentPage - 1)
            }
          >
            <img src={PrevIcon} alt="previous" />
          </StyledArrowButton>
          {currentPage >= 3 && pagesCount > 4 && (
            <>
              <StyledPageNumButton
                onClick={(e) => changePage(Number(e.currentTarget.textContent))}
              >
                1
              </StyledPageNumButton>
              <p>...</p>
            </>
          )}
          {paginationGroup.map((value) => (
            <StyledPageNumButton
              key={value}
              active={currentPage === value ? true : false}
              onClick={(e) => changePage(Number(e.currentTarget.textContent))}
            >
              {value}
            </StyledPageNumButton>
          ))}
          {currentPage <= pagesCount - 2 && pagesCount > 3 && (
            <>
              <p>...</p>
              <StyledPageNumButton
                onClick={(e) => changePage(Number(e.currentTarget.textContent))}
              >
                {pagesCount}
              </StyledPageNumButton>
            </>
          )}
          <StyledArrowButton
            disabled={status === 'loading' && true}
            onClick={() =>
              changePage(currentPage === pagesCount ? 1 : currentPage + 1)
            }
          >
            <img src={NextIcon} alt="next" />
          </StyledArrowButton>
        </StyledPaginationControls>
      )}
    </StyledPaginationWrapper>
  );
};
