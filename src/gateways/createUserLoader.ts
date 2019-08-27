import { rejectResponse } from '../helpers/fetch';

export interface AccountsUser {
  uuid: string;
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_not_gdpr_location: boolean;
}

export default (url: string) => {
  return {
    getCurrentUser: () => fetch(`${url}/api/user`, {credentials: 'include'})
      .then((response) => {
        if (response.status === 200) {
          return response.json() as Promise<AccountsUser>;
        } else if (response.status === 403) {
          return Promise.resolve(undefined);
        } else {
          return rejectResponse(response,  (status, message) => `Error response from Accounts ${status}: ${message}`);
        }
      }),
  };
};
