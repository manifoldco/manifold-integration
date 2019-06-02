export function $(cents: number) {
  const cost = `$${cents / 100}`;
  return cost.replace('.00', '');
}
