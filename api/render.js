import { startInstance } from '../dist/server/assets/start.js'

export default async function handler(req, res) {
  try {
    const response = await startInstance.fetch(req);
    const text = await response.text();
    
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    res.end(text);
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
