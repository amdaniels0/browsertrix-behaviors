import { FacebookTimelineBehavior } from "./facebook";
import { InstagramPostsBehavior } from "./instagram";
import { TelegramBehavior } from "./telegram";
import { TwitterTimelineBehavior } from "./twitter";
import { TikTokVideoBehavior, TikTokProfileBehavior } from "./tiktok";
import { CSSExpanderBehavior } from "./css-expander";
import { MillerICABehavior } from "./miller-ica";
import { TestMinimalBehavior } from "./test-minimal";

const siteBehaviors = [
  TestMinimalBehavior,  // Put first for testing
  InstagramPostsBehavior,
  TwitterTimelineBehavior,
  FacebookTimelineBehavior,
  TelegramBehavior,
  TikTokVideoBehavior,
  TikTokProfileBehavior,
  CSSExpanderBehavior,
  MillerICABehavior,
];

export default siteBehaviors;
