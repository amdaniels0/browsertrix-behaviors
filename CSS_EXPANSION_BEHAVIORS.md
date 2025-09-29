# CSS Element Expansion Behaviors

This document describes the new CSS element expansion behaviors created to improve content discovery and expansion for the Browsertrix crawler.

## Behaviors Created

### 1. CSSExpanderBehavior (Generic)

A generic behavior that can detect and expand various types of collapsible/expandable elements commonly found on websites.

**Features:**
- Accordion sections
- Show more/Load more buttons
- Year-based archives
- Tab interfaces
- Collapsible divs
- Dropdown menus

**Usage:**
This behavior is disabled by default (`isMatch()` returns `false`) since it's generic. To use it, you can either:
1. Set `isMatch()` to return `true` to enable it on all sites
2. Call it manually via the BehaviorManager
3. Enable it specifically for certain sites

**Configuration Options:**
```javascript
opts: {
  maxExpansions: 50,        // Limit to prevent infinite loops
  waitTime: 1000,           // Wait time between expansions (ms)
  retryAttempts: 3,         // Number of retry attempts
  enableScrolling: true,    // Whether to scroll elements into view
  expandAccordions: true,   // Enable accordion expansion
  expandShowMore: true,     // Enable show more button clicking
  expandYearSections: true, // Enable year section expansion
  expandTabs: true         // Enable tab interface expansion
}
```

### 2. MillerICABehavior (Site-Specific)

A specialized behavior designed specifically for the Miller Institute for Contemporary Art exhibitions page (miller-ica.cmu.edu/exhibitions).

**Features:**
- Automatically detects Miller ICA exhibitions page
- Expands year sections (2023, 2022, 2021, etc.) to reveal hidden exhibitions
- Focuses on content expansion without navigation
- Smart filtering to avoid clicking navigation links or phone numbers
- Conservative approach prevents unwanted page navigation

**Usage:**
This behavior automatically runs when visiting Miller ICA exhibitions pages. No manual activation required.

**Configuration Options:**
```javascript
opts: {
  maxYearExpansions: 25,      // Limit year expansions
  maxExhibitionClicks: 50,    // Limit exhibition clicks (reduced for safety)
  waitTime: 1500,             // Wait time between actions (ms)
  scrollDelay: 800,           // Delay after scrolling (ms)
  enableDeepExpansion: false  // Disabled to prevent unwanted navigation
}
```

## Testing the Behaviors

### Prerequisites
First, make sure you have Node.js and Yarn installed, then install dependencies:
```bash
npm install -g yarn
yarn install
```

### Build the Behaviors
```bash
# Development build (unminified, easier debugging)
yarn build-dev

# Production build (minified)
yarn build
```

### Test with the Test Harness
```bash
# Test on Miller ICA website
yarn test 'https://miller-ica.cmu.edu/exhibitions'

# Test on any other website (generic behavior won't auto-run)
yarn test 'https://example.com'
```

### Manual Testing in Browser

1. Build the development version:
   ```bash
   yarn build-dev-copy  # Copies to clipboard on macOS
   ```

2. Open https://miller-ica.cmu.edu/exhibitions in your browser

3. Open DevTools Console and paste the behavior code

4. Run the behaviors:
   ```javascript
   // Run with site-specific behaviors enabled
   self.__bx_behaviors.init({
     autofetch: true,
     autoplay: true,
     autoscroll: true,
     siteSpecific: true
   });
   
   await self.__bx_behaviors.run();
   ```

### Using the Generic CSS Expander on Any Site

To enable the generic CSS expander behavior on any site:

1. Temporarily modify `src/site/css-expander.ts`:
   ```typescript
   static isMatch() {
     return true; // Enable on all sites
   }
   ```

2. Rebuild and test:
   ```bash
   yarn build-dev
   yarn test 'https://your-target-website.com'
   ```

### Manual Invocation

You can also run specific behaviors manually:

```javascript
// Run only the CSS expander behavior
await self.__bx_behaviors.runOne('CSSExpander');

// Run only the Miller ICA behavior
await self.__bx_behaviors.runOne('MillerICA');
```

## Integration with Browsertrix Crawler

These behaviors are now integrated into the main behavior system and will be included in the compiled `dist/behaviors.js` file. The Miller ICA behavior will automatically run when the crawler visits Miller ICA exhibitions pages.

To use these behaviors with Browsertrix Crawler:

1. Build the behaviors: `yarn build`
2. Use the generated `dist/behaviors.js` with your crawler configuration
3. Ensure `siteSpecific: true` is set in your crawler options

## Customization

### Adding New Site-Specific Behaviors

Follow the pattern used in `miller-ica.ts`:

1. Create a new file in `src/site/your-site.ts`
2. Implement the required methods:
   - `static id` - Unique identifier
   - `static isMatch()` - Site detection logic
   - `static init()` - State and options initialization
   - `async *run(ctx)` - Main behavior logic
3. Add the import and export to `src/site/index.ts`
4. Rebuild and test

### Modifying Expansion Patterns

The behaviors use XPath selectors to find expandable elements. You can modify these patterns in the respective behavior files:

- **Accordion patterns**: Modify `accordionSelectors` array
- **Show more patterns**: Modify `showMoreSelectors` array
- **Year patterns**: Modify `yearSelectors` array
- **Tab patterns**: Modify `tabSelectors` array

## Debugging

- Use development builds (`yarn build-dev`) for better debugging
- Check browser console for behavior logs
- The test harness opens with DevTools enabled
- Use `ctx.log()` within behaviors for custom logging

## Performance Considerations

- Both behaviors include limits to prevent infinite loops
- Configurable wait times between actions
- Smart filtering to avoid clicking navigation elements
- Visibility checks before attempting to click elements

## Troubleshooting

**Behavior not running:**
- Check that the site matches the `isMatch()` criteria
- Verify `siteSpecific: true` is set in crawler options
- Check browser console for error messages

**Too many/few elements being clicked:**
- Adjust `maxExpansions`, `maxYearExpansions`, or `maxExhibitionClicks` options
- Modify XPath selectors to be more or less specific
- Add additional filtering logic in the behavior methods

**Elements not found:**
- Inspect the page HTML to understand the actual structure
- Test XPath selectors in browser DevTools: `$x("your-xpath-here")`
- Consider that content might load dynamically