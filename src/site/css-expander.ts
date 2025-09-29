/**
 * CSS Element Expansion Behavior
 * 
 * This behavior detects and expands various types of collapsible/expandable 
 * elements commonly found on websites, including:
 * - Accordion sections
 * - Collapsible divs
 * - Show/hide toggles
 * - Load more buttons
 * - Year-based archives
 * - Tab interfaces
 */

export class CSSExpanderBehavior {
  static id = "CSSExpander";

  static init() {
    return {
      state: { 
        expandedElements: 0,
        clickedButtons: 0,
        totalInteractions: 0 
      },
      opts: { 
        maxExpansions: 50,  // Limit to prevent infinite loops
        waitTime: 1000,     // Wait time between expansions
        retryAttempts: 3,   // Number of retry attempts for failed expansions
        enableScrolling: true, // Whether to scroll elements into view
        expandAccordions: true,
        expandShowMore: true,
        expandYearSections: true,
        expandTabs: true
      },
    };
  }

  static isMatch() {
    // This is a generic behavior that can run on any site
    // It will be manually enabled rather than auto-detected
    return false; // Set to true to enable by default, or call manually
  }

  async *run(ctx) {
    const { Lib, state, opts, log } = ctx;
    const { sleep, xpathNode, xpathNodes, scrollIntoView } = Lib;

    yield* this.expandAccordionElements(ctx);
    yield* this.expandShowMoreButtons(ctx);
    yield* this.expandYearSections(ctx);
    yield* this.expandTabInterfaces(ctx);
    yield* this.expandCollapsibleDivs(ctx);
    yield* this.expandDropdownMenus(ctx);

    yield ctx.log(`CSS Expansion complete. Total interactions: ${state.totalInteractions}`);
  }

  async *expandAccordionElements(ctx) {
    const { Lib, state, opts, log } = ctx;
    const { sleep, xpathNodes, scrollIntoView } = Lib;

    if (!opts.expandAccordions) return;

    // Common accordion selectors
    const accordionSelectors = [
      "//div[contains(@class, 'accordion')]//button[contains(@class, 'toggle') or contains(@class, 'expand') or contains(@class, 'collapse')]",
      "//div[contains(@class, 'collaps')]//button",
      "//*[@role='button'][contains(@aria-expanded, 'false')]",
      "//summary", // HTML5 details/summary elements
      "//*[contains(@class, 'expand')]//*[self::button or self::a or contains(@role, 'button')]",
    ];

    for (const selector of accordionSelectors) {
      yield log(`Searching for accordion elements: ${selector}`);
      const elements = xpathNodes(selector);
      
      for (const element of elements) {
        if (state.expandedElements >= opts.maxExpansions) break;
        
        try {
          if (opts.enableScrolling) {
            await scrollIntoView(element);
            await sleep(500);
          }

          // Check if already expanded
          const ariaExpanded = element.getAttribute('aria-expanded');
          if (ariaExpanded === 'true') continue;

          yield log(`Clicking accordion element`);
          element.click();
          state.expandedElements++;
          state.totalInteractions++;
          
          await sleep(opts.waitTime);
          yield state;
        } catch (e) {
          yield log(`Error expanding accordion: ${e.message}`);
        }
      }
    }
  }

  async *expandShowMoreButtons(ctx) {
    const { Lib, state, opts, log } = ctx;
    const { sleep, xpathNodes, scrollIntoView } = Lib;

    if (!opts.expandShowMore) return;

    // Common "show more" / "load more" button patterns
    const showMoreSelectors = [
      "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'show more')]",
      "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'load more')]",
      "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'see more')]",
      "//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'expand')]",
      "//*[contains(@class, 'show-more') or contains(@class, 'load-more') or contains(@class, 'see-more')]",
      "//a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'show more')]",
    ];

    for (const selector of showMoreSelectors) {
      yield log(`Searching for show more buttons: ${selector}`);
      const elements = xpathNodes(selector);
      
      for (const element of elements) {
        if (state.clickedButtons >= opts.maxExpansions) break;
        
        try {
          if (opts.enableScrolling) {
            await scrollIntoView(element);
            await sleep(500);
          }

          // Check if element is visible and clickable
          if (element.offsetParent === null) continue;

          yield log(`Clicking show more button: ${element.textContent?.trim() || 'unnamed'}`);
          element.click();
          state.clickedButtons++;
          state.totalInteractions++;
          
          await sleep(opts.waitTime);
          yield state;
        } catch (e) {
          yield log(`Error clicking show more button: ${e.message}`);
        }
      }
    }
  }

  async *expandYearSections(ctx) {
    const { Lib, state, opts, log } = ctx;
    const { sleep, xpathNodes, scrollIntoView } = Lib;

    if (!opts.expandYearSections) return;

    // Patterns for year-based sections (like Miller ICA)
    const yearSelectors = [
      "//div[contains(text(), '20') and string-length(text()) = 4]", // Years like 2023, 2022
      "//*[contains(@class, 'year')][contains(text(), '20')]",
      "//*[text()='2023' or text()='2022' or text()='2021' or text()='2020' or text()='2019' or text()='2018' or text()='2017' or text()='2016' or text()='2015']",
      "//h1[contains(text(), '20') and string-length(text()) = 4]",
      "//h2[contains(text(), '20') and string-length(text()) = 4]",
      "//h3[contains(text(), '20') and string-length(text()) = 4]",
    ];

    for (const selector of yearSelectors) {
      yield log(`Searching for year sections: ${selector}`);
      const elements = xpathNodes(selector);
      
      for (const element of elements) {
        if (state.expandedElements >= opts.maxExpansions) break;
        
        try {
          if (opts.enableScrolling) {
            await scrollIntoView(element);
            await sleep(500);
          }

          yield log(`Clicking year section: ${element.textContent?.trim()}`);
          element.click();
          state.expandedElements++;
          state.totalInteractions++;
          
          await sleep(opts.waitTime);
          
          // Also try to find and click any child clickable elements
          const childClickables = element.parentElement?.querySelectorAll('button, a[href], [role="button"]') || [];
          for (const child of Array.from(childClickables).slice(0, 5)) { // Limit child clicks
            try {
              (child as HTMLElement).click();
              await sleep(200);
            } catch (e) {
              // Ignore child click errors
            }
          }
          
          yield state;
        } catch (e) {
          yield log(`Error expanding year section: ${e.message}`);
        }
      }
    }
  }

  async *expandTabInterfaces(ctx) {
    const { Lib, state, opts, log } = ctx;
    const { sleep, xpathNodes, scrollIntoView } = Lib;

    if (!opts.expandTabs) return;

    // Tab interface patterns
    const tabSelectors = [
      "//*[@role='tab'][not(@aria-selected='true')]",
      "//*[contains(@class, 'tab')][not(contains(@class, 'active'))]",
      "//ul[contains(@class, 'tab')]//li[not(contains(@class, 'active'))]",
    ];

    for (const selector of tabSelectors) {
      yield log(`Searching for tab elements: ${selector}`);
      const elements = xpathNodes(selector);
      
      for (const element of elements) {
        if (state.expandedElements >= opts.maxExpansions) break;
        
        try {
          if (opts.enableScrolling) {
            await scrollIntoView(element);
            await sleep(500);
          }

          yield log(`Clicking tab: ${element.textContent?.trim()}`);
          element.click();
          state.expandedElements++;
          state.totalInteractions++;
          
          await sleep(opts.waitTime);
          yield state;
        } catch (e) {
          yield log(`Error clicking tab: ${e.message}`);
        }
      }
    }
  }

  async *expandCollapsibleDivs(ctx) {
    const { Lib, state, opts, log } = ctx;
    const { sleep, xpathNodes, scrollIntoView } = Lib;

    // Generic collapsible div patterns
    const collapsibleSelectors = [
      "//*[contains(@class, 'collapsed')]",
      "//*[contains(@class, 'closed')]", 
      "//*[contains(@data-state, 'closed')]",
      "//*[contains(@data-expanded, 'false')]",
    ];

    for (const selector of collapsibleSelectors) {
      yield log(`Searching for collapsible divs: ${selector}`);
      const elements = xpathNodes(selector);
      
      for (const element of elements) {
        if (state.expandedElements >= opts.maxExpansions) break;
        
        try {
          if (opts.enableScrolling) {
            await scrollIntoView(element);
            await sleep(500);
          }

          // Try to find a clickable trigger within or near the element
          const trigger = element.querySelector('button, a, [role="button"], .trigger, .toggle') ||
                         element.previousElementSibling?.querySelector('button, a, [role="button"]') ||
                         element;

          yield log(`Clicking collapsible div trigger`);
          (trigger as HTMLElement).click();
          state.expandedElements++;
          state.totalInteractions++;
          
          await sleep(opts.waitTime);
          yield state;
        } catch (e) {
          yield log(`Error expanding collapsible div: ${e.message}`);
        }
      }
    }
  }

  async *expandDropdownMenus(ctx) {
    const { Lib, state, opts, log } = ctx;
    const { sleep, xpathNodes, scrollIntoView } = Lib;

    // Dropdown menu patterns
    const dropdownSelectors = [
      "//*[contains(@class, 'dropdown')]//*[contains(@class, 'toggle') or contains(@class, 'trigger')]",
      "//select[not(@multiple)]", // Single select dropdowns
      "//*[@role='combobox' or @role='listbox']",
    ];

    for (const selector of dropdownSelectors) {
      yield log(`Searching for dropdown menus: ${selector}`);
      const elements = xpathNodes(selector);
      
      for (const element of elements) {
        if (state.expandedElements >= opts.maxExpansions) break;
        
        try {
          if (opts.enableScrolling) {
            await scrollIntoView(element);
            await sleep(500);
          }

          if (element.tagName === 'SELECT') {
            // For select elements, we can trigger the dropdown
            element.focus();
            // Optionally iterate through options
            const options = element.querySelectorAll('option');
            yield log(`Found select with ${options.length} options`);
          } else {
            yield log(`Clicking dropdown trigger`);
            element.click();
          }
          
          state.expandedElements++;
          state.totalInteractions++;
          
          await sleep(opts.waitTime);
          yield state;
        } catch (e) {
          yield log(`Error expanding dropdown: ${e.message}`);
        }
      }
    }
  }
}