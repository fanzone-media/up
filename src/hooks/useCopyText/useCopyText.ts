import { useState } from 'react';

export const useCopyText = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const copyText = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied((copied) => !copied);
    setTimeout(() => {
      setCopied((copied) => !copied);
    }, 2000);
  };

  return { copied, copyText };
};
