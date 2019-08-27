export interface User {
  firstName: string;
  isNotGdprLocation: boolean;
}

export interface State {
  user: User | undefined;
  established: boolean;
}
