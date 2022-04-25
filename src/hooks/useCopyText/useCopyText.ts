import { useState } from 'react';

export const useCopyText = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const copyText = (text: string) => {
    window.navigator.clipboard.writeText(text);
    setCopied((copied) => !copied);
    setTimeout(() => {
      setCopied((copied) => !copied);
    }, 2000);
  };

  const canCopy = !!window.navigator.clipboard;

  return { copied, copyText, canCopy };
};
