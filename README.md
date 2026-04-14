# WooCommerce Block Visualizer

A developer tool that overlays visual outlines and class name labels on WooCommerce block components, making it easy to identify and target the right CSS selectors when styling Woo blocks.

![visualizer](https://github.com/user-attachments/assets/050c7be9-9020-4a6b-8fab-6fe51aa6aa95)


## Enabling the Visualizer

### Admin Bar Toggle

When browsing any WooCommerce page while logged in, a **Block Visualizer: ON/OFF** button appears in the admin bar. Click it to toggle the visualizer. State is persisted in a cookie so it stays on as you navigate between pages.

### Query Parameter

Append `?wc_block_visualizer=1` to any URL to enable it on that page, or `?wc_block_visualizer=0` to force it off. This works on any page, not just WooCommerce pages — useful for custom templates.

```
https://yoursite.com/cart/?wc_block_visualizer=1
```

---

## What You See

Each WooCommerce block element gets a dashed outline and a label showing its primary class name and nesting depth.

### Color Coding

| Color | Class prefix |
|-------|-------------|
| Blue  | `wc-block-components-*` |
| Pink  | `wc-block-*` |
| Green | `wp-block-woocommerce-*` |

### Depth Indicator

Labels show a depth number in brackets — `[1]` is a top-level block, `[2]` is one level nested inside another WC block, and so on. Use the depth controls to focus on a specific nesting level.

---

## Keyboard Shortcuts

All shortcuts use `Cmd+Shift` on Mac.

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+V` | Toggle visualizer on / off |
| `Cmd+Shift+S` | Rescan the page for new elements (useful after AJAX loads or React re-renders) |
| `Cmd+Shift+↑` | Go deeper — show the next nesting level |
| `Cmd+Shift+↓` | Go shallower — show the previous nesting level |

Start at depth 1 to see top-level blocks, then drill down with `Cmd+Shift+↑` to surface nested components.

---

## Copying CSS Selectors

Clicking a label copies a ready-to-use CSS rule to your clipboard.

| Action | What gets copied |
|--------|-----------------|
| **Click** label | Single selector: `.class-name { }` |
| **Cmd+Click** label | Nested selector with parent context: `.parent-class { .child-name { } }` |

After copying, the label briefly shows **Copied!** or **Copied with parent!** as confirmation. The copied rule is also logged to the browser console.

---

## Typical Workflow

1. Navigate to the WooCommerce page you want to style (cart, checkout, account, etc.).
2. Enable the visualizer from the admin bar.
3. Scan the page at depth 1 to orient yourself — top-level blocks are outlined.
4. Press `Cmd+Shift+↑` to drill into nested components until you find the element you want.
5. Click the label to copy its CSS selector, then paste it into your stylesheet.
6. Use `Cmd+Shift+S` to rescan if blocks appear after a page interaction (e.g. updating cart quantities, switching checkout steps).
7. Toggle off with `Cmd+Shift+V` when you're done to preview your styles cleanly.

---

## Notes

- The visualizer only loads on WooCommerce pages (cart, checkout, account, shop, product, order received). Use the query param to force it on other pages.
- Only users with `manage_woocommerce` capability see the admin bar toggle.
- Visualizer outlines and labels are hidden automatically when printing.
