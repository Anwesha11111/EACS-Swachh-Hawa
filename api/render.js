import server from '../dist/server/assets/server.js'

export default async function handler(req, res) {
  try {
    // Build the full URL from the Node.js request
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers['host'];
    const url = `${protocol}://${host}${req.url}`;

    // Convert Node.js IncomingMessage to Web API Request
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      }
    }

    const webRequest = new Request(url, {
      method: req.method,
      headers,
    });

    // Use the TanStack server fetch handler
    const response = await server.fetch(webRequest);

    // Send headers
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Stream body back
    const body = await response.text();
    res.end(body);
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).send(`<pre>Render error: ${error?.message ?? error}</pre>`);
  }
}

