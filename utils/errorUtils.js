export function errorMessage(err) {
  if (err === null || err === undefined) {
    return 'an unknown error has occurred';
  }
  if (err instanceof Error) {
    return err.message || err.toString();
  }
  if (err.toString) {
    return err.toString();
  }
  return JSON.stringify(err);
}
