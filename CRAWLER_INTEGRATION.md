# Browsertrix Crawler Integration

This document describes how to use the CSS expansion behaviors with Browsertrix Crawler for optimal content discovery and crawling.

## Production-Ready Behaviors

The behaviors are now optimized for crawler use with these key features:

### ✅ Crawler-Friendly Design
- **Non-navigational**: Expands content without leaving the current page
- **Link discovery**: Automatically finds and queues exhibition links for the crawler
- **Conservative logging**: Minimal logs to avoid noise in crawler output
- **Error resilient**: Silent error handling to prevent crawler disruption

### ✅ Miller ICA Specific Optimizations
- **Smart expansion**: Finds and expands year sections and other collapsible content
- **Exhibition link detection**: Discovers links to individual exhibitions after expansion
- **Navigation filtering**: Avoids clicking navigation elements or contact info
- **Performance optimized**: Efficient selectors and limited interaction counts

## Using with Browsertrix Crawler

### 1. Build the Production Behaviors
```bash
yarn build
```
This creates the minified production file: `dist/behaviors.js`

### 2. Crawler Configuration

#### Option A: File-based Configuration
```yaml
# crawl-config.yaml
behaviors: ./dist/behaviors.js
behaviorOpts:
  siteSpecific: true
  autofetch: true
  autoplay: false
  autoscroll: false
seeds:
  - url: https://miller-ica.cmu.edu/exhibitions
```

#### Option B: Inline Configuration
```javascript
// Crawler configuration
{
  behaviors: fs.readFileSync('./dist/behaviors.js', 'utf8'),
  behaviorOpts: {
    siteSpecific: true,
    autofetch: true,
    autoplay: false,
    autoscroll: false
  },
  seeds: ['https://miller-ica.cmu.edu/exhibitions']
}
```

### 3. Expected Crawler Behavior

When the crawler visits `https://miller-ica.cmu.edu/exhibitions`:

1. **Page Load**: Miller ICA behavior automatically detects and activates
2. **Content Expansion**: Year sections and other expandable content is revealed
3. **Link Discovery**: Exhibition links are found and added to the crawler queue
4. **Continued Crawling**: Crawler proceeds to visit discovered exhibition pages
5. **Content Capture**: Full content from both the main page and exhibition pages

## Crawler Integration Benefits

### 🎯 **Before Behavior**
- Crawler sees only the collapsed exhibition list
- Many exhibition links remain hidden
- Limited content depth
- Missing exhibition details

### ✅ **With Behavior**
- All year sections expanded automatically
- Exhibition links discovered and queued
- Complete content capture
- Full site coverage including individual exhibitions

## Monitoring and Verification

### Check Behavior Activity
Look for these log messages in crawler output:
```
"Using Site-Specific Behavior: MillerICA"
"Expanding year section: 2023"
"Found X year elements to expand" 
"Discovered X exhibition links for crawler"
"Miller ICA expansion complete"
```

### Verify Link Discovery
The behavior will discover and queue links such as:
- Individual exhibition pages
- Year-based archive pages
- Event detail pages
- Related content links

## Advanced Configuration

### Custom Behavior Options
You can customize the behavior through crawler configuration:

```javascript
behaviorOpts: {
  siteSpecific: {
    MillerICA: {
      maxYearExpansions: 25,      // Limit year section clicks
      waitTime: 1500,             // Delay between actions (ms)
      scrollDelay: 800,           // Scroll delay (ms)
      enableDeepExpansion: false  // Disabled for crawler safety
    }
  }
}
```

### Combining with Other Behaviors
The Miller ICA behavior works alongside other built-in behaviors:

```javascript
behaviorOpts: {
  siteSpecific: true,    // Enables Miller ICA + other site behaviors
  autofetch: true,       // Background resource fetching
  autoplay: false,       // Disable for quieter crawling
  autoscroll: false      // Disable to prevent conflicts
}
```

## Troubleshooting

### Behavior Not Running
- ✅ Check URL matches: `miller-ica.cmu.edu/exhibitions`
- ✅ Verify `siteSpecific: true` in crawler config
- ✅ Check for "Using Site-Specific Behavior: MillerICA" in logs

### No Links Discovered
- ✅ Ensure site content is loading properly
- ✅ Check for "Discovered X exhibition links" in logs
- ✅ Website structure may have changed (inspect page manually)

### Crawler Missing Content
- ✅ Verify behavior completed before crawler moves on
- ✅ Check timeout settings in crawler configuration
- ✅ Ensure crawler isn't moving too quickly after behavior runs

## Performance Considerations

### Crawler Impact
- **Minimal delay**: Behavior adds ~3-5 seconds per exhibitions page
- **Increased discovery**: May significantly increase total crawl time due to more links
- **Memory usage**: Additional links in crawler queue
- **Network requests**: More pages to crawl after expansion

### Optimization Tips
- **Scope crawling**: Use URL patterns to limit crawl scope if needed
- **Concurrent crawling**: Higher concurrency can offset behavior delays
- **Timeouts**: Set appropriate page timeouts to account for behavior runtime
- **Depth limits**: Consider crawl depth limits if discovering too many links

## Production Deployment

The behavior is now production-ready with:
- ✅ **Error handling**: Won't crash crawler on failures
- ✅ **Performance optimization**: Efficient element selection
- ✅ **Conservative interaction**: Limited clicks to prevent issues
- ✅ **Clean logging**: Minimal noise in crawler logs
- ✅ **Link discovery**: Automatic queuing of found exhibition pages

Deploy the `dist/behaviors.js` file with your Browsertrix Crawler configuration to start benefiting from enhanced Miller ICA content discovery.