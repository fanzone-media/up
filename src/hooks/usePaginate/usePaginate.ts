import { useMemo, useState } from 'react';
import { useViewPort } from '../useViewPort';

interface IProps {
  totalItems: number;
}

export const usePaginate = ({ totalItems }: IProps) => {
  const { screenWidth } = useViewPort();
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { pageCount, limit } = useMemo(() => {
    if (screenWidth > 1280) {
      return {
        pageCount: Math.ceil(totalItems / 12),
        limit: 12,
      };
    }
    if (screenWidth > 1024) {
      return {
        pageCount: Math.ceil(totalItems / 10),
        limit: 10,
      };
    }
    if (screenWidth > 768) {
      return {
        pageCount: Math.ceil(totalItems / 8),
        limit: 8,
      };
    }

    if (screenWidth > 640) {
      return {
        pageCount: Math.ceil(totalItems / 6),
        limit: 6,
      };
    }

    return {
      pageCount: Math.ceil(totalItems / 4),
      limit: 4,
    };
  }, [screenWidth, totalItems]);

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

  return {
    currentPage,
    setCurrentPage,
    pageCount,
    limit,
    paginationGroup,
    start,
    end,
  };
};
