import { useState } from 'react';

export const usePagination = () => {
  const [range, setRange] = useState<[number, number]>([0, 9]); // load first 10 by default

  return {
    range,
    setRange,
  };
};
