import * as os from 'os';

export function getServerIP(): string {
  const networkInterfaces = os.networkInterfaces();

  for (const [name, nets] of Object.entries(networkInterfaces)) {
    if (nets) {
      for (const net of nets) {
        // Check for IPv4 and ensure it's not an internal address
        if (net.family === 'IPv4' && !net.internal) {
          return net.address; // Return the first non-internal IPv4 address
        }
      }
    }
  }

  return '127.0.0.1'; // Fallback to localhost if no external IP is found
}
