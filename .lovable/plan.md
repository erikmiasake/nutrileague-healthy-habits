

The `FloatingAddButton` component exists and is rendered globally in `App.tsx`, but its `return` is empty (returns `undefined`). It also excludes `/` from showing, and doesn't include league detail pages.

**Plan:**
1. Fix `FloatingAddButton.tsx` to actually render a floating "+" button in the bottom-right corner (above the bottom nav), positioned like the screenshot shows.
2. Update the exclusion logic: hide on `/login`, `/onboarding`, and `/` (splash). Show on all other pages including `/ligas/:id`.
3. On click, navigate to `/registrar`.
4. Style: circular orange (primary) button with Plus icon, `fixed bottom-24 right-6`, with shadow and scale animation on tap.

