"use client";

import HorizontalFeatureReveal from "@/components/ui/horizontal-feature-reveal";

// Paints the theme background/foreground out of the box.
// Pass `properties` to supply your own items, `bgColor` to pin a palette.
export default function HorizontalFeatureRevealDemo() {
  return <HorizontalFeatureReveal imageParallaxRange={30} cardGap={15} />;
}
