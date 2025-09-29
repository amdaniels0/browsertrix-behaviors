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
    
    // Only match the main exhibitions page, not individual exhibition/event/varia pages
    return url.includes('miller-ica.cmu.edu') && 
           (path === '/exhibitions' || path === '/exhibitions/');
  }

  async *run(ctx) {
    const { Lib, state, opts, log } = ctx;
    const { sleep, xpathNode, xpathNodes, scrollIntoView, addLink } = Lib;

    const startTime = Date.now();
    
    try {
      yield log("Starting Miller ICA Exhibitions expansion");

      // Check runtime limit
      if (Date.now() - startTime > opts.maxRuntime) {
        yield log("Runtime limit reached, stopping");
        return;
      }

      // Expand year sections to reveal hidden exhibition content
      yield* this.expandYearSections(ctx, startTime);
      
      // Check runtime limit again
      if (Date.now() - startTime > opts.maxRuntime) {
        yield log("Runtime limit reached after expansion, stopping");
        return;
      }
      
      // Wait for content to fully load after expansion
      await sleep(1000); // Reduced from 2000ms
      
      // Discover and queue exhibition links for the crawler
      yield* this.discoverExhibitionLinks(ctx);

      yield log(`Miller ICA expansion complete. Years expanded: ${state.expandedYears}, Links discovered: ${state.linksDiscovered}, Total interactions: ${state.totalInteractions}`);
    } catch (error) {
      yield log(`Miller ICA behavior error: ${error.message}`);
      // Don't rethrow - just log and continue
    }
  }

  async *expandYearSections(ctx, startTime = Date.now()) {
    const { Lib, state, opts, log } = ctx;
    const { sleep, xpathNodes, scrollIntoView } = Lib;

    // Specific selectors for Miller ICA year sections - simplified for better performance
    const yearSelectors = [
      // Most likely candidates first for faster matching
      "//h2[text()='2023' or text()='2022' or text()='2021' or text()='2020' or text()='2019']",
      "//h3[text()='2023' or text()='2022' or text()='2021' or text()='2020' or text()='2019']",
      "//div[text()='2023' or text()='2022' or text()='2021' or text()='2020' or text()='2019']",
      // Fallback to older years if needed
      "//h2[text()='2018' or text()='2017' or text()='2016' or text()='2015' or text()='2014']",
      "//h3[text()='2018' or text()='2017' or text()='2016' or text()='2015' or text()='2014']"
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

            // Try clicking the year element
            yield log(`Expanding year section: ${yearText}`);
            htmlElement.click();
            state.expandedYears++;
            state.totalInteractions++;
            
            await sleep(opts.waitTime);
            
            // Look for expansion triggers near the year element - reduced scope
            const nearbyExpanders = this.findNearbyExpandableElements(htmlElement);
            for (const expander of nearbyExpanders.slice(0, 1)) { // Reduced from 2 to 1
              try {
                const expanderText = expander.textContent?.trim()?.substring(0, 50) || 'unnamed';
                
                // Skip if it looks like a navigation link
                if (this.isNavigationElement(expanderText) || expander.tagName === 'A') {
                  continue;
                }
                
                expander.click();
                await sleep(300); // Reduced from 500ms
                state.totalInteractions++;
              } catch (e) {
                // Silent error handling for expansion elements
              }
            }
            
            yield { state, msg: `Expanded year ${yearText}` };
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