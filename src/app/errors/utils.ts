import { ErrorAction, TargetReducer } from './types';

export const hasError = (currentReducer: TargetReducer) =>
    (errorAction: ErrorAction) => errorAction.targetReducer &&
        errorAction.targetReducer === currentReducer;
