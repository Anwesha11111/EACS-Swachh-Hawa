import server from '../dist/server/assets/server.js'

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Reads the raw request body as a Buffer.
 * Falls back to req.body if Vercel already consumed the stream.
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    // If Vercel's body-parser already ran despite bodyParser:false, use it
    if (req.body !== undefined && req.body !== null) {
      if (Buffer.isBuffer(req.body)) return resolve(req.body);
      if (typeof req.body === 'string') return resolve(Buffer.from(req.body));
      if (typeof req.body === 'object') return resolve(Buffer.from(JSON.stringify(req.body)));
    }

    // Stream is still available — collect it
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  try {
    // Build the full URL from the Node.js request
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers['host'];
    const url = `${protocol}://${host}${req.url}`;

    // Convert Node.js headers to Web API Headers
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

    // Build request init
    const requestInit = { method: req.method, headers };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const body = await readBody(req);
      console.log(`[render] ${req.method} ${req.url} body=${body.length}B`);
      if (body.length > 0) {
        requestInit.body = body;
        requestInit.duplex = 'half';
      }
    }

    const webRequest = new Request(url, requestInit);

    // Use the TanStack server fetch handler
    const response = await server.fetch(webRequest);

    // Forward status and headers
    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        if (typeof response.headers.getSetCookie === 'function') {
          res.setHeader(key, response.headers.getSetCookie());
          return;
        }
      }
      res.setHeader(key, value);
    });

    const responseBody = await response.text();
    res.end(responseBody);
  } catch (error) {
    console.error('[render] error:', error?.message, error?.stack);
    res.status(500).send(`<pre>Render error: ${error?.message ?? error}</pre>`);
  }
}
