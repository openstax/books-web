import { AccountsUser } from '../../gateways/createUserLoader';

export const formatUser = (user: AccountsUser) => ({
  firstName: user.first_name,
  uuid: user.uuid,
});
