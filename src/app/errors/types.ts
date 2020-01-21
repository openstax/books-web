export interface State {
  code?: number;
  error?: Error;
}

export const searchReducer = 'SEARCH_REDUCER' as const;

export type TargetReducer = typeof searchReducer;

export interface ErrorAction {
  error: Error;
  targetReducer?: TargetReducer;
}
