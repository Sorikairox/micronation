let port = 3001;

export function getAvailableAppPort(): number {
  return port++;
}
