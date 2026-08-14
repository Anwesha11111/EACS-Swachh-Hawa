import server from '../dist/server/assets/server.js'

export const config = {
  api: {
    bodyParser: false,
  },
};

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

    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      body = Buffer.concat(chunks);
    }

    const requestInit = {
      method: req.method,
      headers,
    };

    if (body !== undefined) {
      requestInit.body = body;
    }

    const webRequest = new Request(url, requestInit);

    // Use the TanStack server fetch handler
    const response = await server.fetch(webRequest);

    // Send headers
    res.status(response.status);
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'set-cookie') {
        if (typeof response.headers.getSetCookie === 'function') {
          res.setHeader(key, response.headers.getSetCookie());
          return;
        }
      }
      res.setHeader(key, value);
    });

    // Stream body back
    const responseBody = await response.text();
    res.end(responseBody);
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).send(`<pre>Render error: ${error?.message ?? error}</pre>`);
  }
}

