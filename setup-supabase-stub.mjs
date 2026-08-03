import fs from 'fs';
import path from 'path';

const nm = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nm)) fs.mkdirSync(nm, { recursive: true });

const supaDir = path.join(nm, '@supabase', 'supabase-js');
fs.mkdirSync(supaDir, { recursive: true });

fs.writeFileSync(
  path.join(supaDir, 'package.json'),
  JSON.stringify({
    name: '@supabase/supabase-js',
    version: '2.47.0',
    main: 'index.js',
    types: 'index.d.ts',
  }, null, 2)
);

fs.writeFileSync(
  path.join(supaDir, 'index.d.ts'),
  `export declare function createClient(url: string, key: string, options?: any): any;\n`
);

fs.writeFileSync(
  path.join(supaDir, 'index.js'),
  `
exports.createClient = function createClient(url, key) {
  return {
    from: function(table) {
      return {
        select: function() { return this; },
        insert: function() { return Promise.resolve({ data: null, error: null }); },
        upsert: function() { return Promise.resolve({ data: null, error: null }); },
        eq: function() { return this; },
        order: function() { return this; },
        limit: function() { return Promise.resolve({ data: [], error: null }); },
        maybeSingle: function() { return Promise.resolve({ data: null, error: null }); }
      };
    }
  };
};
`
);

console.log('Supabase JS module stub installed.');
