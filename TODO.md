# Logo Display Modification Plan

## Task Requirements
1. Don't show vait-logo.png in hero section (header)
2. Don't show vait-logo.png in navbar
3. Show vait-logo.png only in Auth page header
4. Make both logos same size when both are displayed

## Analysis
- Currently Logo component shows both `/vait-logo.png` and `/logo.png`
- In Navbar: `<Logo size="md" showText={true} />` displays both logos with different sizes
- VAIT logo (w-10 h-10) vs Main logo (w-12 h-12) for "md" size
- Need to modify Logo component to optionally hide VAIT logo
- Need to make both logos same size when both are displayed

## Plan
1. **Modify Logo component** (`src/components/Logo.tsx`):
   - Add new prop `showVaitLogo` (boolean, default true for backward compatibility)
   - Update size classes to make both logos same size
   - Hide VAIT logo when `showVaitLogo={false}`

2. **Update Navbar usage** (`src/components/layout/Navbar.tsx`):
   - Pass `showVaitLogo={false}` to Logo component
   - This will hide VAIT logo in navbar as requested

3. **Update other pages** that need both logos:
   - Index.tsx (hero section) - keep both logos
   - Auth.tsx (auth page) - keep both logos  
   - Footer sections - adjust as needed

## Implementation Steps
1. ✅ Update Logo.tsx with showVaitLogo prop and equal sizing
2. ✅ Update Navbar.tsx to hide VAIT logo
3. ✅ Update Index.tsx hero section to hide VAIT logo
4. ✅ Update Index.tsx footer to explicitly show both logos (same size)
5. ✅ Verify Auth.tsx shows both logos (default behavior)

## Summary of Changes
- **Logo.tsx**: Added `showVaitLogo` prop (default: true) and made both logos same size
- **Navbar.tsx**: Set `showVaitLogo={false}` - only main logo shows
- **Index.tsx**: Hero section has `showVaitLogo={false}`, footer explicitly shows both logos
- **Auth.tsx**: No changes needed - shows both logos by default

## Files to be Modified
- `src/components/Logo.tsx` - Add prop and equal sizing
- `src/components/layout/Navbar.tsx` - Hide VAIT logo
