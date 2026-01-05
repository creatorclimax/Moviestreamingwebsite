import { BrandingConfig } from './types';

// Cache for branding configs with timestamp
const brandingCache = new Map<string, { config: BrandingConfig; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Default fallback theme
export const DEFAULT_BRANDING: BrandingConfig = {
  brandName: 'MovieStream',
  primaryColor: '#1f7ae0',
  accentColor: '#ffb703',
  logo: '/logo-default.svg'
};

export async function getTenantInfo() {
  // Client-side host detection
  const domain = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
  
  // In a real implementation, you might fetch the branding URL mapping from a backend
  // For this demo, we'll simulate a mapping or just return the domain
  
  // Mock mapping (similar to the middleware logic)
  const tenantMap: Record<string, string> = {
    'localhost:3000': '/branding.json', // In public folder
    'demo.moviestream.com': 'https://demo.moviestream.com/branding.json',
  };

  const brandingUrl = tenantMap[domain] || '/branding.json';
  
  return {
    domain,
    brandingUrl
  };
}

export async function getBrandingConfig(): Promise<BrandingConfig> {
  const { domain, brandingUrl } = await getTenantInfo();
  
  if (!brandingUrl) {
    return DEFAULT_BRANDING;
  }
  
  // Check cache
  const cached = brandingCache.get(domain);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.config;
  }
  
  try {
    // For demo purposes, if the URL is /branding.json, we might fail if it doesn't exist.
    // We'll return default if fetch fails.
    const response = await fetch(brandingUrl);
    
    if (!response.ok) {
      // If file not found, use default
      return DEFAULT_BRANDING;
    }
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Silently fallback for SPA environments where public files might not be served correctly at root
      return DEFAULT_BRANDING;
    }
    
    const config = await response.json();
    const validatedConfig = validateBrandingConfig(config);
    
    brandingCache.set(domain, {
      config: validatedConfig,
      timestamp: Date.now()
    });
    
    return validatedConfig;
  } catch (error) {
    console.warn(`Error fetching branding config for ${domain}, using default.`, error);
    return DEFAULT_BRANDING;
  }
}

function validateBrandingConfig(config: any): BrandingConfig {
  return {
    brandName: typeof config.brandName === 'string' ? config.brandName : DEFAULT_BRANDING.brandName,
    primaryColor: typeof config.primaryColor === 'string' ? config.primaryColor : DEFAULT_BRANDING.primaryColor,
    accentColor: typeof config.accentColor === 'string' ? config.accentColor : DEFAULT_BRANDING.accentColor,
    logo: typeof config.logo === 'string' ? config.logo : DEFAULT_BRANDING.logo,
    favicon: typeof config.favicon === 'string' ? config.favicon : undefined
  };
}

export function getThemeStyles(branding: BrandingConfig): string {
  return `
    :root {
      --brand-primary: ${branding.primaryColor};
      --brand-accent: ${branding.accentColor};
    }
  `;
}
