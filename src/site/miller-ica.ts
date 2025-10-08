/**
 * Miller ICA Exhibitions Behavior
 * 
 * Specifically designed for the Miller Institute for Contemporary Art
 * exhibitions page (miller-ica.cmu.edu/exhibitions) to expand year sections
 * and reveal hidden exhibition content.
 */

export class MillerICABehavior {
  static id = "MillerICA";

  static init() {
    return {
      state: { 
        expandedYears: 0,
        clickedExhibitions: 0,
        totalInteractions: 0,
        linksDiscovered: 0
      },
      opts: { 
        maxYearExpansions: 10,  // Reduced for speed
        maxExhibitionClicks: 20, // Reduced for speed  
        waitTime: 800,          // Reduced wait time
        scrollDelay: 400,       // Reduced scroll delay
        enableDeepExpansion: false, // Keep disabled for safety
        maxRuntime: 30000       // Maximum 30 seconds runtime
      },
    };
  }

  static isMatch() {
    // Match only the main Miller ICA exhibitions page, not individual exhibition pages
    const url = window.location.href;
    const path = window.location.pathname;
    
    console.log('[MILLER-ICA] isMatch() called');
    console.log('[MILLER-ICA] Current URL:', url);
    console.log('[MILLER-ICA] Current path:', path);
    
    // Only match the main exhibitions page, not individual exhibition/event/varia pages
    const matches = url.includes('miller-ica.cmu.edu') && 
           (path === '/exhibitions' || path === '/exhibitions/');
           
    console.log('[MILLER-ICA] Match result:', matches);
    return matches;
  }

  async *run(ctx) {
    const { Lib, state, opts, log } = ctx;
    const { sleep, xpathNode, xpathNodes, scrollIntoView, addLink } = Lib;

    const startTime = Date.now();
    
    try {
      // Double-check we're on the right page
      if (!window.location.pathname.startsWith('/exhibitions')) {
        yield log("Not on exhibitions page, skipping behavior");
        return;
      }
      
      yield log("Starting Miller ICA Exhibitions expansion");

      // Simple approach: Find and click all year containers
      const yearContainers = document.querySelectorAll('div.py-4.cursor-pointer');
      yield log(`Found ${yearContainers.length} year containers to expand`);
      
      // Limit to first 3 years to avoid timeout
      const maxExpansions = Math.min(yearContainers.length, 3);
      
      // Click each year container to expand it
      for (let i = 0; i < maxExpansions; i++) {
        // Hard time limit of 15 seconds
        if (Date.now() - startTime > 15000) {
          yield log("Time limit (15s) reached, stopping expansion");
          break;
        }
        
        const container = yearContainers[i] as HTMLElement;
        const yearText = container.querySelector('h2')?.textContent?.trim();
        
        if (!yearText) continue;
        
        yield log(`Clicking year container: ${yearText}`);
        
        try {
          // Scroll to element
          container.scrollIntoView({ behavior: 'instant', block: 'center' });
          await sleep(300);
          
          // Click the container
          container.click();
          state.expandedYears++;
          
          // Wait briefly for content to load
          await sleep(1000);
          
          yield log(`Expanded year ${yearText}`);
        } catch (e) {
          yield log(`Error expanding ${yearText}: ${e.message}`);
        }
      }
      
      // Brief wait for content to settle
      yield log("Waiting for content to settle...");
      await sleep(1000);
      
      // Quick scan for lazy-loaded images
      const images = document.querySelectorAll('img[data-src], img.lazyload, picture source');
      yield log(`Found ${images.length} potentially lazy-loaded images`);
      
      // Only process first 10 images quickly
      for (const img of Array.from(images).slice(0, 10)) {
        try {
          (img as HTMLElement).scrollIntoView({ behavior: 'instant', block: 'center' });
          await sleep(50); // Minimal wait
        } catch (e) {
          // Continue on error
        }
      }

      yield log(`Miller ICA expansion complete. Years expanded: ${state.expandedYears}`);
    } catch (error) {
      yield log(`Miller ICA behavior error: ${error.message}`);
      // Don't rethrow - just log and continue
    }
  }

  async *expandYearSections(ctx, startTime = Date.now()) {
    const { Lib, state, opts, log } = ctx;
    const { sleep, xpathNodes, scrollIntoView } = Lib;

    yield log("=== DIAGNOSTIC MODE: MillerICA Year Section Analysis ===");
    
    // First, let's understand the page structure
    yield log("Page URL: " + window.location.href);
    yield log("Page title: " + document.title);
    
    // Look for all clickable year elements
    const diagnosticSelectors = [
      "//h2[contains(text(), '20')]", // Any h2 with years
      "//div[@class='py-4 cursor-pointer']", // The actual clickable containers  
      "//*[contains(@class, 'cursor-pointer')][contains(text(), '20')]", // Clickable elements with years
      "//*[contains(text(), '2023') or contains(text(), '2022') or contains(text(), '2021') or contains(text(), '2020')]"
    ];
    
    for (const selector of diagnosticSelectors) {
      try {
        const elements = Array.from(xpathNodes(selector));
        yield log(`Selector: ${selector} found ${elements.length} elements`);
        
        for (let index = 0; index < Math.min(elements.length, 5); index++) {
          const htmlEl = elements[index] as HTMLElement;
          yield log(`  Element ${index}: tagName=${htmlEl.tagName}, text="${htmlEl.textContent?.trim()}", classes="${htmlEl.className}", clickable=${htmlEl.style.cursor || 'auto'}`);
        }
      } catch (e) {
        yield log(`Error with selector ${selector}: ${e.message}`);
      }
    }

    // Now try the refined selectors based on the actual page structure
    const yearSelectors = [
      // Target the actual clickable year containers
      "//div[contains(@class, 'cursor-pointer')]//h2[contains(text(), '202')]", // Years 2020-2029
      "//div[contains(@class, 'cursor-pointer')]//h2[contains(text(), '201')]", // Years 2010-2019  
      "//div[@class='py-4 cursor-pointer']", // Direct clickable containers
      // Fallback to any clickable year elements
      "//*[contains(@class, 'cursor-pointer')][contains(text(), '20')]"
    ];

    for (const selector of yearSelectors) {
      // Check runtime limit
      if (Date.now() - startTime > opts.maxRuntime) {
        yield log("Runtime limit reached during year expansion");
        return;
      }
      
      try {
        const elements = xpathNodes(selector);
        const elementArray = Array.from(elements).slice(0, 5); // Limit to first 5 matches per selector
        
        if (elementArray.length > 0) {
          yield log(`Found ${elementArray.length} year elements to expand with selector`);
        }
        
        for (const element of elementArray) {
          const htmlElement = element as HTMLElement;
          if (state.expandedYears >= opts.maxYearExpansions) {
            yield log("Reached maximum year expansions limit");
            return; // Return instead of break to exit completely
          }
          
          // Check runtime limit for each element
          if (Date.now() - startTime > opts.maxRuntime) {
            yield log("Runtime limit reached during individual year processing");
            return;
          }
          
          const yearText = htmlElement.textContent?.trim();
          
          // Validate this looks like a year
          if (!yearText || !/^20\d{2}$/.test(yearText)) {
            continue;
          }

          try {
            // Scroll element into view with timeout protection
            await Promise.race([
              scrollIntoView(htmlElement),
              sleep(2000) // Max 2 seconds for scroll
            ]);
            await sleep(opts.scrollDelay);

            // Get initial page state for comparison
            const initialHTML = document.body.innerHTML.length;
            const initialLinks = document.querySelectorAll('a[href*="exhibition"]').length;
            
            yield log(`About to click year: ${yearText}`);
            yield log(`  Element parent: ${htmlElement.parentElement?.className || 'none'}`);
            yield log(`  Element tag: ${htmlElement.tagName}`);
            yield log(`  Initial page HTML length: ${initialHTML}`);
            yield log(`  Initial exhibition links: ${initialLinks}`);
            
            // Click the element (this might be the h2 or the container)
            let clickTarget = htmlElement;
            
            // If this is an h2, try to click its parent container instead
            if (htmlElement.tagName === 'H2' && htmlElement.parentElement?.classList.contains('cursor-pointer')) {
              clickTarget = htmlElement.parentElement;
              yield log(`  Clicking parent container instead of h2`);
            }
            
            yield log(`Clicking year element: ${yearText}`);
            clickTarget.click();
            state.expandedYears++;
            state.totalInteractions++;
            
            // Wait longer to see if content loads dynamically
            await sleep(opts.waitTime * 2); // Double the wait time
            
            // Check what changed after clicking
            const newHTML = document.body.innerHTML.length;
            const newLinks = document.querySelectorAll('a[href*="exhibition"]').length;
            const contentAdded = newHTML - initialHTML;
            const linksAdded = newLinks - initialLinks;
            
            yield log(`After clicking ${yearText}:`);
            yield log(`  HTML length change: ${contentAdded} characters`);
            yield log(`  Exhibition links added: ${linksAdded}`);
            
            if (contentAdded > 100) {
              yield log(`  SUCCESS: Content was added after clicking!`);
              
              // Wait a bit more for any additional content to load
              await sleep(1000);
              
              // Look for any newly appeared exhibition links
              const newExhibitionLinks = document.querySelectorAll('a[href*="exhibition"]:not([data-processed])') as NodeListOf<HTMLAnchorElement>;
              yield log(`  Found ${newExhibitionLinks.length} new exhibition links to process`);
              
              // Mark them as processed and potentially queue them
              for (const link of newExhibitionLinks) {
                link.setAttribute('data-processed', 'true');
                yield log(`    New link: ${link.href} - "${link.textContent?.trim()?.substring(0, 50)}"`);
              }
            } else {
              yield log(`  No significant content added after clicking`);
            }
            
            yield { state, msg: `Processed year ${yearText} - content added: ${contentAdded} chars, links: ${linksAdded}` };
          } catch (e) {
            yield log(`Error processing year ${yearText}: ${e.message}`);
          }
        }
      } catch (e) {
        yield log(`Error with selector ${selector}: ${e.message}`);
      }
    }
    
    // If no year sections found, try to find any expandable content
    if (state.expandedYears === 0) {
      yield log("Looking for alternative expandable content");
      yield* this.findAnyExpandableContent(ctx);
    }
  }

  async *findAnyExpandableContent(ctx) {
    const { Lib, state, opts, log } = ctx;
    const { sleep, xpathNodes, scrollIntoView } = Lib;
    
    // Look for common expandable patterns
    const expandableSelectors = [
      "//button[contains(@class, 'expand') or contains(@class, 'toggle') or contains(@class, 'show')]",
      "//*[@role='button'][contains(@aria-expanded, 'false')]",
      "//div[contains(@class, 'collapsed') or contains(@class, 'closed')]",
      "//summary", // HTML5 details/summary
      "//*[contains(@class, 'accordion')]",
      "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'show')]",
      "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'more')]"
    ];
    
    let totalFound = 0;
    for (const selector of expandableSelectors) {
      try {
        const elements = Array.from(xpathNodes(selector));
        totalFound += elements.length;
        
        for (const element of elements.slice(0, 3)) { // Limit to first 3
          const htmlElement = element as HTMLElement;
          try {
            const elementText = htmlElement.textContent?.trim()?.substring(0, 100) || '';
            
            // Skip navigation elements
            if (this.isNavigationElement(elementText)) {
              continue;
            }
            
            await scrollIntoView(htmlElement);
            await sleep(500);
            htmlElement.click();
            state.totalInteractions++;
            
            await sleep(opts.waitTime);
            yield { state, msg: `Expanded content element` };
          } catch (e) {
            // Silent error handling
          }
        }
      } catch (e) {
        // Silent error handling
      }
    }
    
    if (totalFound > 0) {
      yield log(`Found and processed ${totalFound} expandable elements`);
    }
  }
  
  async *discoverExhibitionLinks(ctx) {
    const { Lib, state, opts, log } = ctx;
    const { addLink } = Lib;
    
    // Look for exhibition links that are now visible after expansion
    const linkSelectors = [
      "//a[contains(@href, 'exhibition')]", // Direct exhibition URLs
      "//a[contains(@href, '/20')] ", // Year-based URLs (2023, 2022, etc.)
      "//h1/a", "//h2/a", "//h3/a", // Heading links (likely exhibitions)
      "//a[string-length(text()) > 15 and not(contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'home')) and not(contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'about'))]", // Longer link text, not navigation
      "//div[contains(@class, 'exhibition') or contains(@class, 'show') or contains(@class, 'event')]//a[@href]", // Links within exhibition containers
    ];
    
    const discoveredLinks = new Set();
    
    for (const selector of linkSelectors) {
      try {
        const elements = Array.from(Lib.xpathNodes(selector));
        
        for (const element of elements) {
          const htmlElement = element as HTMLAnchorElement;
          const href = htmlElement.href;
          const text = htmlElement.textContent?.trim() || '';
          
          // Skip if no href or if it's a navigation element
          if (!href || href === window.location.href || this.isNavigationElement(text)) {
            continue;
          }
          
          // Skip external links (focus on Miller ICA content)
          if (!href.includes('miller-ica.cmu.edu') && !href.startsWith('/')) {
            continue;
          }
          
          // Skip if we've already found this link
          if (discoveredLinks.has(href)) {
            continue;
          }
          
          // Add the link for the crawler to follow
          try {
            await addLink(href);
            discoveredLinks.add(href);
            state.linksDiscovered++;
            
            yield { state, msg: `Discovered exhibition link: ${text.substring(0, 50)}...` };
          } catch (e) {
            // Silent error handling for link addition
          }
        }
      } catch (e) {
        // Silent error handling for selector
      }
    }
    
    if (discoveredLinks.size > 0) {
      yield log(`Discovered ${discoveredLinks.size} exhibition links for crawler`);
    }
  }

  // Helper method to find expandable elements near a year element
  // Focus on buttons and expansion triggers, avoid navigation links
  findNearbyExpandableElements(yearElement) {
    const expandables = [];
    
    // Check parent and sibling elements for expansion triggers only
    const parent = yearElement.parentElement;
    if (parent) {
      // Focus on buttons, toggles, and expansion elements (exclude links)
      const parentExpandables = parent.querySelectorAll('button, [role="button"], .clickable, .expandable, .toggle, .expand, [data-toggle], [data-expand]');
      expandables.push(...Array.from(parentExpandables));
    }
    
    // Check next siblings for expansion triggers
    let sibling = yearElement.nextElementSibling;
    let siblingCount = 0;
    while (sibling && siblingCount < 2) { // Reduced from 3 to 2
      const siblingExpandables = sibling.querySelectorAll('button, [role="button"], .toggle, .expand, [data-toggle], [data-expand]');
      expandables.push(...Array.from(siblingExpandables));
      sibling = sibling.nextElementSibling;
      siblingCount++;
    }
    
    // Filter out the year element itself and any links
    return expandables.filter(el => 
      el !== yearElement && 
      el.tagName !== 'A' && 
      !el.closest('a') // Also exclude elements inside links
    );
  }

  // Helper method to determine if an element looks like navigation
  isNavigationElement(text) {
    const navKeywords = [
      'home', 'about', 'contact', 'menu', 'search', 'login', 'sign up',
      'newsletter', 'subscribe', 'gallery hours', 'visit', 'events',
      'give', 'donate', 'terms', 'conditions', 'privacy', 'colophon',
      // Phone numbers and contact info
      '(412)', '268-3618', 'miller-ica@andrew.cmu.edu',
      // Navigation text patterns
      'click here', 'read more', 'learn more', 'view all', 'see all',
      'back to', 'return to', 'go to', 'next', 'previous',
      // Social media
      'follow us', 'facebook', 'twitter', 'instagram', 'social',
      // Common site elements
      'footer', 'header', 'sidebar', 'navigation', 'breadcrumb'
    ];
    
    const lowerText = text.toLowerCase().trim();
    
    // Check for phone number patterns
    if (/\(\d{3}\)\s*\d{3}-\d{4}/.test(lowerText)) {
      return true;
    }
    
    // Check for email patterns
    if (/\S+@\S+\.\S+/.test(lowerText)) {
      return true;
    }
    
    // Check for navigation keywords
    return navKeywords.some(keyword => lowerText.includes(keyword));
  }
}