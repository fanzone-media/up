import { useState } from 'react';

export const useCopyText = () => {
  const [copied, setCopied] = useState<{ [key: string]: boolean }>();

  const copyText = (key: string, text: string) => {
    window.navigator.clipboard.writeText(text);
    setCopied({ ...copied, [key]: true });
    setTimeout(() => {
      setCopied({ ...copied, [key]: false });
    }, 2000);
  };

  const canCopy = !!window.navigator.clipboard;

  return { copied, copyText, canCopy };
};
