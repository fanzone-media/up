export const sanitizeLink = (url: string) => {
  return url.replace(/^.*\/\/[^/]+\//, '');
};
