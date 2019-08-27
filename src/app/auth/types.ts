export interface User {
  firstName: string;
  uuid: string;
}

export interface State {
  user: User | undefined;
  established: boolean;
}
