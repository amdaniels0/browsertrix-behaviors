import { BehaviorManager } from "./src";
export { BehaviorManager };

// Comprehensive debug logging
if (typeof console !== 'undefined' && console.log) {
  console.log('[BROWSERTRIX-BEHAVIORS] ===== BEHAVIORS.JS LOADING =====');
  console.log('[BROWSERTRIX-BEHAVIORS] Loaded at:', new Date().toISOString());
  console.log('[BROWSERTRIX-BEHAVIORS] Current URL:', typeof window !== 'undefined' ? window.location.href : 'no window');
  console.log('[BROWSERTRIX-BEHAVIORS] BehaviorManager available:', typeof BehaviorManager);
  
  // Check if the behavior manager is being initialized
  if (typeof window !== 'undefined') {
    console.log('[BROWSERTRIX-BEHAVIORS] Window.__bx_behaviors:', window['__bx_behaviors']);
    console.log('[BROWSERTRIX-BEHAVIORS] Window.options:', window['options']);
    
    // Try to detect if we're being run by Browsertrix
    if (window['__bx_behaviors']) {
      console.log('[BROWSERTRIX-BEHAVIORS] Behavior system detected!');
    } else {
      console.log('[BROWSERTRIX-BEHAVIORS] No behavior system detected - may need initialization');
      
      // Create a global flag to indicate behaviors are loaded
      window['__browsertrix_behaviors_loaded'] = true;
    }
  }
  console.log('[BROWSERTRIX-BEHAVIORS] ===== END LOADING =====');
}
