/**
 * Minimal Test Behavior
 * 
 * A simple behavior to test if custom behaviors are loading and running at all
 */

export class TestMinimalBehavior {
  static id = "TestMinimal";

  static init() {
    console.log('[TEST-MINIMAL] Behavior init() called');
    return {
      state: { 
        initialized: true
      }
    };
  }

  static isMatch() {
    // Match all miller-ica pages for testing
    const matches = window.location.href.includes('miller-ica.cmu.edu');
    console.log('[TEST-MINIMAL] isMatch() called, result:', matches, 'for URL:', window.location.href);
    return matches;
  }

  async *run(ctx) {
    const { log } = ctx;
    
    try {
      yield log("[TEST-MINIMAL] Behavior is running!");
      yield log("[TEST-MINIMAL] Current URL: " + window.location.href);
      yield log("[TEST-MINIMAL] Page title: " + document.title);
      
      // Just do a simple action - count links
      const links = document.querySelectorAll('a');
      yield log(`[TEST-MINIMAL] Found ${links.length} links on page`);
      
      yield { state: ctx.state, msg: "Test behavior completed successfully" };
    } catch (error) {
      yield log(`[TEST-MINIMAL] Error: ${error.message}`);
    }
  }
}