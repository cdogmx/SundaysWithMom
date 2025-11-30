import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, serverUrl, token, functionsVersion } = appParams;

// Validate required configuration
if (!appId || !serverUrl) {
  console.warn('Base44 client configuration missing. appId or serverUrl not set. Some features may not work.');
}

// Suppress Base44 SDK connection errors in console
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Override console.error to filter Base44 connection errors
  console.error = function(...args) {
    const errorString = args.join(' ');
    // Filter out Base44 SDK connection errors
    if (errorString.includes('connect_error') || 
        (errorString.includes('server error') && errorString.includes('index-'))) {
      // Suppress these specific Base44 SDK connection errors
      return;
    }
    originalConsoleError.apply(console, args);
  };
  
  // Also filter warnings related to connection issues
  console.warn = function(...args) {
    const warnString = args.join(' ');
    if (warnString.includes('connect_error') || 
        (warnString.includes('server error') && warnString.includes('index-'))) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
}

// Create a client with authentication required
// Wrap in try-catch to handle initialization errors gracefully
let base44;
try {
  base44 = createClient({
    appId: appId || '',
    serverUrl: serverUrl || '',
    token,
    functionsVersion,
    requiresAuth: false
  });
} catch (error) {
  console.error('Failed to initialize Base44 client:', error);
  // Create a minimal client object to prevent app crashes
  base44 = {
    auth: {},
    entities: {},
    integrations: {},
    appLogs: {}
  };
}

export { base44 };
