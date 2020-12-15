import { rejectResponse } from '../helpers/fetch';

export interface BuyPrintResponse {
  buy_urls: Array<{
    url: string;
    provider: 'amazon';
    allows_redirects: boolean;
    disclosure: string | null;
  }>;
}

export default (url: string) => {
  return {
    load: (book: {slug: string}) => fetch(`${url}/${book.slug}.json`)
      .then((response) => {
        if (response.status === 200) {
          return response.json() as Promise<BuyPrintResponse>;
        } else {
          return rejectResponse(response,  (status, message) => `Error response from BuyPrint ${status}: ${message}`);
        }
      }),
  };
};
