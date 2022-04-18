import { useEffect, useState } from 'react';

export const useViewPort = () => {
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
