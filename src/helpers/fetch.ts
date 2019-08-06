
export type FormatError = (status: number, message: string) => string;

export const rejectResponse = (response: Response, formatError: FormatError) =>
  response.text().then((message: string) => {
    throw new Error(formatError(response.status, message));
  });

export const acceptStatus = (
  status: number,
  formatError: FormatError
) => (response: Response): Promise<Response> | Promise<never> => {

  if (response.status !== status) {
    return rejectResponse(response, formatError);
  }
  return Promise.resolve(response);
};
