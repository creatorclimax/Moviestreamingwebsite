import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono().basePath("/make-server-188c0e85");

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "x-device-id"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// TMDB Proxy
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = '7ac6de5ca5060c7504e05da7b218a30c';

// Helper to fetch from TMDB
async function fetchTmdb(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.append("api_key", TMDB_API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }
  
  const response = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    throw new Error(`TMDB Error: ${response.status}`);
  }
  return response.json();
}

// Social Share Proxy
// Returns HTML with Open Graph tags for crawlers, and redirects users to the app
app.get("/share/:type/:id", async (c) => {
  const type = c.req.param("type");
  const id = c.req.param("id");
  const siteUrl = Deno.env.get('SITE_URL');
  
  if (!siteUrl || siteUrl === 'https://example.com') {
      // If SITE_URL is missing, we can't redirect users properly.
      // We'll show a fallback page asking them to configure it.
      return c.html(`
        <html>
            <body style="background:#000; color:#fff; font-family:sans-serif; text-align:center; padding-top:50px;">
                <h1>Configuration Error</h1>
                <p>The <code>SITE_URL</code> secret is not set in Supabase.</p>
                <p>Please use the AI to set this value to your application's public URL (e.g., https://myapp.vercel.app).</p>
            </body>
        </html>
      `, 500);
  }

  // Map our types to TMDB types and App routes
  let tmdbPath = '';
  let appPath = '';
  let mediaType = '';

  switch (type) {
    case 'movie':
      tmdbPath = `/movie/${id}`;
      appPath = `/movie/${id}`; // Redirect to Details Page, not Stream
      mediaType = 'video.movie';
      break;
    case 'tv':
      tmdbPath = `/tv/${id}`;
      appPath = `/tv/${id}`; // Redirect to Details Page, not Stream
      mediaType = 'video.tv_show';
      break;
    case 'person':
      tmdbPath = `/person/${id}`;
      appPath = `/person/${id}`;
      mediaType = 'profile';
      break;
    case 'collection':
      tmdbPath = `/collection/${id}`;
      appPath = `/collection/${id}`;
      mediaType = 'website';
      break;
    default:
      return c.text('Invalid type', 400);
  }

  // Construct the final destination URL
  // Ensure siteUrl doesn't have a trailing slash if appPath has a leading slash
  const baseUrl = siteUrl.replace(/\/$/, '');
  const redirectUrl = `${baseUrl}${appPath}`;

  // User-Agent Detection
  const userAgent = c.req.header('user-agent')?.toLowerCase() || '';
  const isBot = /bot|crawl|slurp|spider|facebook|twitter|slack|discord|whatsapp|telegram|linkedin|pinterest|google|bing|applebot/i.test(userAgent);

  let title = 'Check this out';
  let description = 'View this content on our streaming platform.';
  let imageUrl = `${baseUrl}/og-image.png`;
  
  // Try to fetch specific metadata
  try {
    const data = await fetchTmdb(tmdbPath);
    title = data.title || data.name || title;
    const overview = data.overview || data.biography || '';
    description = overview.length > 200 ? overview.substring(0, 197) + '...' : overview;
    const imagePath = data.poster_path || data.profile_path || data.backdrop_path;
    if (imagePath) {
      imageUrl = `https://image.tmdb.org/t/p/w780${imagePath}`;
    }
  } catch (error) {
    // Only log actual errors, warn on 404s
    if (error instanceof Error && error.message.includes('404')) {
       console.warn(`[Share Proxy] Metadata not found for ${type}/${id} (TMDB 404). Using generic tags.`);
    } else {
       console.error("Metadata fetch failed, falling back to generic tags:", error);
    }
  }

  const proxyUrl = c.req.url;

  // STRATEGY SPLIT
  // 1. BOTS: Serve pure HTML with Tags. NO REDIRECTS.
  //    This prevents bots from following the redirect to a 404 page (if the client app doesn't support deep linking yet).
  if (isBot) {
    return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <meta name="description" content="${description}">
        
        <!-- Open Graph -->
        <meta property="og:type" content="${mediaType}">
        <meta property="og:url" content="${proxyUrl}">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${imageUrl}">
        <meta property="og:image:width" content="780">
        
        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${description}">
        <meta name="twitter:image" content="${imageUrl}">
      </head>
      <body>
        <h1>${title}</h1>
        <p>${description}</p>
        <img src="${imageUrl}" alt="${title}" />
      </body>
      </html>
    `);
  }

  // 2. HUMANS: Serve HTML with Client-Side Redirect.
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      
      <!-- Client-side Redirect -->
      <meta http-equiv="refresh" content="0;url=${redirectUrl}">
      
      <style>
        body { 
          background-color: #000; 
          color: #fff; 
          font-family: system-ui, -apple-system, sans-serif; 
          height: 100vh; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          text-align: center;
          margin: 0;
        }
        .content { padding: 20px; max-width: 600px; }
        a { color: #3b82f6; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .debug { margin-top: 2rem; font-size: 0.8rem; color: #666; word-break: break-all; }
        .spinner {
          width: 40px; height: 40px; 
          border: 3px solid rgba(255,255,255,0.3); 
          border-radius: 50%; 
          border-top-color: #fff; 
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 20px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="content">
        <div class="spinner"></div>
        <h1>Redirecting...</h1>
        <p>Taking you to <strong>${title}</strong></p>
        <p>If nothing happens, <a href="${redirectUrl}">click here</a>.</p>
        <div class="debug">Target: ${redirectUrl}</div>
      </div>
      <script>
        // JS Redirect as backup
        window.location.href = "${redirectUrl}";
      </script>
    </body>
    </html>
  `);
});

app.all("/media/*", async (c) => {
  // Robust path extraction logic
  // Handles both with and without basePath prefix if Hono behavior varies
  const fullPath = c.req.path;
  const match = fullPath.match(/\/media\/(.*)/);
  const path = match ? `/${match[1]}` : null;
  
  if (!path) {
    console.error(`Invalid TMDB path extraction from: ${fullPath}`);
    return c.json({ error: "Invalid path" }, 400);
  }

  // Blacklist specific collections that are known to return 404
  const BLACKLISTED_PATHS = [
    '/collection/297',
    '/collection/1198', 
    '/collection/472502'
  ];
  
  if (BLACKLISTED_PATHS.some(blocked => path.includes(blocked))) {
    // Return a fake "Not Found" that doesn't log an error, or just a 404 directly without error logging
    return c.json({ error: "Resource not found (blacklisted)" }, 404);
  }

  const query = c.req.query();
  
  // Directly use the hardcoded key to ensure it works
  const apiKey = TMDB_API_KEY;

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.append("api_key", apiKey);
  
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.append(key, value);
  }

  // console.log(`Proxying to: ${url.toString().replace(apiKey, 'HIDDEN')}`);

  try {
    const response = await fetch(url.toString(), {
      method: c.req.method,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error(`TMDB Error: ${response.status} ${response.statusText} for ${path}`);
      const errorBody = await response.text();
      console.error(`TMDB Error Body: ${errorBody}`);
      
      return c.json({ 
        error: `TMDB API error: ${response.status}`,
        details: errorBody
      }, response.status as any);
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return c.json({ error: "Failed to fetch from TMDB" }, 500);
  }
});

// User Library Management
app.get("/library/:type", async (c) => {
  const type = c.req.param("type");
  const deviceId = c.req.header("x-device-id");

  if (!deviceId) {
    return c.json({ error: "Device ID required" }, 400);
  }

  try {
    const key = `device:${deviceId}:${type}`;
    const data = await kv.get(key);
    return c.json(data || []);
  } catch (error) {
    console.error("Library GET error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

app.post("/library/:type", async (c) => {
  const type = c.req.param("type");
  const deviceId = c.req.header("x-device-id");

  if (!deviceId) {
    return c.json({ error: "Device ID required" }, 400);
  }

  try {
    const body = await c.req.json();
    const key = `device:${deviceId}:${type}`;
    await kv.set(key, body);
    return c.json({ success: true });
  } catch (error) {
    console.error("Library POST error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// Verify URL endpoint
app.get("/verify-url", async (c) => {
  const url = c.req.query("url");
  if (!url) {
    return c.json({ valid: false, error: "Missing URL" }, 400);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    
    clearTimeout(timeoutId);

    // If HEAD fails with 405 Method Not Allowed, try GET
    if (response.status === 405) {
       const controllerGet = new AbortController();
       const timeoutIdGet = setTimeout(() => controllerGet.abort(), 5000);
       const responseGet = await fetch(url, {
          method: "GET",
          signal: controllerGet.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          }
       });
       clearTimeout(timeoutIdGet);
       
       // Strict check: 404 (Not Found) is invalid.
       // 500 (Internal Error) and 502 (Bad Gateway) are invalid.
       // 503 (Service Unavailable) is often Cloudflare protection, so we treat it as potentially valid.
       // 403 (Forbidden) is also often Cloudflare/Bot protection, so treated as valid.
       const status = responseGet.status;
       const isInvalid = status === 404 || status === 500 || status === 502;
       return c.json({ valid: !isInvalid, status });
    }

    const status = response.status;
    const isInvalid = status === 404 || status === 500 || status === 502;
    return c.json({ valid: !isInvalid, status });
  } catch (error) {
    // If request fails (DNS error, connection refused), it's invalid
    return c.json({ valid: false, error: "Request failed" });
  }
});

// Auth Routes
app.post("/signup", async (c) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  )
  try {
    const { email, password, name } = await c.req.json();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    })

    if (error) {
        return c.json({ error: error.message }, 400);
    }
    return c.json(data);
  } catch (e) {
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

Deno.serve(app.fetch);
