export interface User {
  firstName: string;
}

export interface State {
  user: User | undefined;
  established: boolean;
}
