export function errorMessage(err) {
  if (err === null || err === undefined) {
    return '';
  }
  if (err instanceof Error) {
    return err.message || err.toString();
  }
  if (typeof err !== 'string' || !err) {
    return 'an unknown error has occurred';
  }
  return err;
}
