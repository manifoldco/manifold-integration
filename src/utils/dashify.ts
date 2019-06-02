export const dashify = (str: string): string =>
  str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[ \t\W_]/g, '-')
    .toLowerCase();
