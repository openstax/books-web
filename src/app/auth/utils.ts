import { AccountsUser } from '../../gateways/createUserLoader';

export const formatUser = (user: AccountsUser) => ({
  firstName: user.first_name,
  isNotGdprLocation: user.is_not_gdpr_location,
  uuid: user.uuid,
});
