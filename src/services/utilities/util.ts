export default class Utils {
  static convertURL(url: string) {
    let hash = url.split('//')[1];
    return url.startsWith('ipfs://') ? Utils.getURL(hash) : url;
  }

  static getURL(hash: string) {
    return `https://ipfs.fanzone.io/ipfs/${hash}`;
  }

  static logstream(log: string) {
    const logElement = document.getElementById('log');

    logElement ? (logElement.innerText = log) : console.log(log);
  }

  static createAsyncOperation<T>(
    operation: (resolve: (_: any) => void, reject: (_: any) => void) => void,
  ): Promise<T> {
    return new Promise<T>(async (resolve, reject) => {
      try {
        operation(resolve, reject);
      } catch (error) {
        reject(new Error(error as string));
      }
    });
  }
}
