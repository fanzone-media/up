import { useState, useEffect, useMemo } from 'react';

// https://www.netlify.com/blog/2020/12/05/building-a-custom-react-media-query-hook-for-more-responsive-apps/
export function useMediaQuery(query: string): boolean {
  const media = useMemo(() => window.matchMedia(query), [query]);

  const [matches, setMatches] = useState(media.matches);

  useEffect(() => {
    const listener = () => {
      setMatches(media.matches);
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [media]);

  return matches;
}
