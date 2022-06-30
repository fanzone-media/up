export const createImageFile = async (url: string) => {
  let response = await fetch(url);
  let data = await response.blob();
  let metadata = {
    type: 'image/jpeg',
  };

  return new File([data], url, metadata);
};
