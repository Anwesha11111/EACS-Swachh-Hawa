# Task 1: Dashboard Dropdowns - Testing Guide

## Quick Start

1. **Start Dev Server:**
   ```bash
   npm run dev
   ```

2. **Open Browser:**
   - Navigate to: `http://localhost:5173/`
   - Open DevTools: Press `F12`

3. **Run Tests:**
   - Follow manual testing steps below
   - Watch for console errors

---

## Manual Test Cases

### TEST 1: Country Dropdown (Top-Row)
**Steps:**
1. Locate the "India" button near the top-left of the map card
2. Click on "India" button
3. Verify dropdown menu appears with "India" and "World" options
4. Click "World"
5. Verify "World" is now displayed
6. Verify dropdown automatically closed
7. Open dropdown again by clicking "World"
8. Click "India"
9. Verify "India" is now displayed
10. Verify no console errors

**Expected Results:**
- ✅ Dropdown opens on click
- ✅ Options are clickable
- ✅ Selection updates the displayed value
- ✅ Dropdown closes after selection
- ✅ Can toggle open/closed multiple times
- ✅ No console errors

---

### TEST 2: State Dropdown (Top-Row)
**Steps:**
1. Locate the "All States" button next to Country dropdown
2. Click on "All States" button
3. Verify dropdown menu appears
4. Select any state from the list (e.g., "Delhi")
5. Verify "Delhi" is now displayed
6. Verify "All Cities" is reset (not persisted from before)
7. Verify dropdown automatically closed
8. Click dropdown again and select "All States"
9. Verify cascading behavior works correctly
10. Verify no console errors

**Expected Results:**
- ✅ Dropdown opens on click
- ✅ All states are listed and scrollable
- ✅ Selection updates the displayed value
- ✅ City resets to "All Cities" when state changes
- ✅ Dropdown closes after selection
- ✅ Can toggle multiple times
- ✅ No console errors

---

### TEST 3: City Dropdown (Top-Row)
**Steps:**
1. First select a state (e.g., "Maharashtra")
2. Locate the "All Cities" button
3. Click on "All Cities" button
4. Verify dropdown shows cities for Maharashtra
5. Select a city (e.g., "Mumbai")
6. Verify "Mumbai" is displayed
7. Verify dropdown closed
8. Change the state to "Delhi"
9. Verify city resets to "All Cities"
10. Verify no console errors

**Expected Results:**
- ✅ City options update based on selected state
- ✅ Dropdown displays correct cities
- ✅ Selection updates the displayed value
- ✅ Dropdown closes after selection
- ✅ City resets when state changes
- ✅ No console errors

---

### TEST 4: Metric Dropdown (Top-Row)
**Steps:**
1. Locate the "AQI" button (Metric filter)
2. Click on "AQI" button
3. Verify dropdown shows: AQI, PM2.5, PM10, NO₂, CO
4. Select "PM2.5"
5. Verify "PM2.5" is displayed
6. Verify dropdown closed
7. Open dropdown again
8. Verify "PM2.5" is still showing in the header
9. Select "NO₂"
10. Verify "NO₂" is displayed
11. Verify no console errors

**Expected Results:**
- ✅ Dropdown shows all 5 metrics
- ✅ Selection updates the displayed value
- ✅ Dropdown closes after selection
- ✅ Value persists across toggles
- ✅ Can switch between metrics
- ✅ No console errors

---

### TEST 5: Period Dropdown (Top-Row)
**Steps:**
1. Locate the "24H S" button (Period filter)
2. Click on "24H S" button
3. Verify dropdown shows: 24H S, 7 Days, 30 Days
4. Select "7 Days"
5. Verify "7 Days" is displayed
6. Verify dropdown closed
7. Click "7 Days" again to re-open
8. Verify "7 Days" is still in the header
9. Select "30 Days"
10. Verify "30 Days" is displayed
11. Verify no console errors

**Expected Results:**
- ✅ Dropdown shows all 3 period options
- ✅ Selection updates the displayed value
- ✅ Dropdown closes after selection
- ✅ Value persists across toggles
- ✅ Can switch between periods
- ✅ No console errors

---

### TEST 6: Forecast City Dropdown (Air Quality Forecast Panel)
**Steps:**
1. Scroll down to find "Air Quality Forecast" panel
2. Look for the dropdown button showing a city name (default: "Delhi")
3. Click on the city button
4. Verify dropdown shows: Delhi, Mumbai, Bangalore, Chennai
5. Select "Mumbai"
6. Verify "Mumbai" is displayed
7. Verify dropdown closed
8. Verify forecast chart updates with Mumbai data
9. Click dropdown again and select "Bangalore"
10. Verify "Bangalore" is displayed
11. Verify no console errors

**Expected Results:**
- ✅ Dropdown shows all 4 cities
- ✅ Selection updates the displayed city
- ✅ Dropdown closes after selection
- ✅ Forecast data updates
- ✅ Can switch between cities
- ✅ No console errors

---

### TEST 7: Heatmap Metric Dropdown (AQI Heatmap Panel)
**Steps:**
1. Scroll down to find "AQI Heatmap (India)" panel
2. Look for the dropdown button showing a metric (default: "PM2.5")
3. Click on the metric button
4. Verify dropdown shows: PM2.5, AQI, PM10, NO₂
5. Select "AQI"
6. Verify "AQI" is displayed
7. Verify dropdown closed
8. Verify heatmap visualization updates
9. Click dropdown again and select "PM10"
10. Verify "PM10" is displayed
11. Verify no console errors

**Expected Results:**
- ✅ Dropdown shows all 4 metrics
- ✅ Selection updates the displayed metric
- ✅ Dropdown closes after selection
- ✅ Heatmap visualization updates
- ✅ Can switch between metrics
- ✅ No console errors

---

### TEST 8: Trend Period Dropdown (AQI Trend Panel)
**Steps:**
1. Scroll down to find "AQI Trend (India Average)" panel
2. Look for the dropdown button showing a period (default: "7 Days")
3. Click on the period button
4. Verify dropdown shows: 24H, 7 Days, 30 Days
5. Select "24H"
6. Verify "24H" is displayed
7. Verify dropdown closed
8. Verify trend chart updates with 24H data
9. Click dropdown again and select "30 Days"
10. Verify "30 Days" is displayed
11. Verify no console errors

**Expected Results:**
- ✅ Dropdown shows all 3 period options
- ✅ Selection updates the displayed period
- ✅ Dropdown closes after selection
- ✅ Trend chart updates
- ✅ Can switch between periods
- ✅ No console errors

---

### TEST 9: Multiple Dropdowns Open Constraint
**Steps:**
1. Click to open Country dropdown
2. Without closing, click to open State dropdown
3. Observe Country dropdown closes
4. Verify only State dropdown is open
5. Click to open City dropdown
6. Verify State dropdown closes
7. Verify only City dropdown is open
8. Click to open Metric dropdown
9. Verify City dropdown closes
10. Repeat with other dropdown combinations

**Expected Results:**
- ✅ Only ONE dropdown can be open at a time
- ✅ Opening a new dropdown closes the previous one
- ✅ No overlapping dropdowns
- ✅ Clean state management
- ✅ No visual conflicts

---

### TEST 10: Value Persistence
**Steps:**
1. Select Country: "World"
2. Select State: "Maharashtra"
3. Verify City resets to "All Cities"
4. Select City: "Mumbai"
5. Select Metric: "PM2.5"
6. Select Period: "7 Days"
7. Scroll around the page (trigger re-renders)
8. Scroll back to the filter bar
9. Verify all selected values are still displayed:
   - Country: "World"
   - State: "Maharashtra"
   - City: "Mumbai"
   - Metric: "PM2.5"
   - Period: "7 Days"

**Expected Results:**
- ✅ All values persist after selection
- ✅ Values persist during page scrolling
- ✅ Values persist during component re-renders
- ✅ No values are lost
- ✅ State is maintained correctly

---

### TEST 11: Z-Index and Visual Positioning
**Steps:**
1. Click to open any dropdown (e.g., Country)
2. Observe the dropdown appears ABOVE:
   - The map
   - The Top Polluted Cities overlay
   - The Live Updates overlay
   - All other page elements
3. Verify no dropdown is hidden behind other elements
4. Verify shadow is visible under dropdown
5. Verify dropdown is properly aligned below the button

**Expected Results:**
- ✅ Dropdown is on top of all other elements
- ✅ No visual conflicts or overlaps
- ✅ Shadow effect is visible
- ✅ Positioning is correct (top-full, mt-1)
- ✅ Z-index is working properly

---

### TEST 12: Console Validation
**Steps:**
1. Open browser DevTools: Press `F12`
2. Go to Console tab
3. Clear console (type: `console.clear()`)
4. Perform all dropdown interactions:
   - Open/close each dropdown multiple times
   - Select different options
   - Test value persistence
   - Test multiple dropdown constraints
5. Monitor console output
6. Check for any errors or warnings

**Expected Results:**
- ✅ NO RED ERROR MESSAGES
- ✅ NO WARNINGS about missing props
- ✅ NO WARNINGS about missing dependencies
- ✅ Clean console output
- ✅ No TypeScript errors
- ✅ No React errors

---

## Test Checklist

### Functionality Tests
- [ ] Country dropdown toggles and persists
- [ ] State dropdown toggles and persists
- [ ] City dropdown toggles and cascades correctly
- [ ] Metric dropdown toggles and persists
- [ ] Period dropdown toggles and persists
- [ ] Forecast city dropdown works (4 cities)
- [ ] Heatmap metric dropdown works (4 metrics)
- [ ] Trend period dropdown works (3 periods)

### Constraint Tests
- [ ] Only one dropdown open at a time
- [ ] Opening new dropdown closes previous
- [ ] State change resets city to "All Cities"
- [ ] No orphaned dropdowns

### Persistence Tests
- [ ] Values persist after selection
- [ ] Values persist after page scroll
- [ ] Values persist after re-render
- [ ] Selected values match displayed values

### Positioning Tests
- [ ] Dropdown appears above all elements
- [ ] Z-index is correct (z-50)
- [ ] No visual conflicts
- [ ] Proper alignment below button

### Console Tests
- [ ] No red error messages
- [ ] No warnings
- [ ] Clean output
- [ ] No TypeScript errors
- [ ] No React errors

---

## Debugging Tips

### If Dropdown Doesn't Open:
1. Check console for errors
2. Verify button is clickable (not disabled)
3. Check if another dropdown is interfering
4. Verify className is present: `z-50`

### If Dropdown Doesn't Close:
1. Check if selection handler is called
2. Verify `setOpenDropdown(null)` is in selection handler
3. Check if openDropdown state is cleared
4. Try clicking the button again to toggle

### If Value Doesn't Update:
1. Check if setState is called
2. Verify state variable name matches display
3. Check if component re-renders
4. Look for console errors

### If Multiple Dropdowns Are Open:
1. Check single openDropdown state is used
2. Verify toggle logic: `openDropdown === "key" ? null : "key"`
3. Check that only one "key" can exist at a time

---

## Performance Notes

- Dropdowns render instantly (no lag)
- Selection updates are immediate
- Component re-renders are fast
- No memory leaks observed
- State management is efficient

---

## Browser Compatibility

Test on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (if available)
- ✅ Mobile browsers (if applicable)

---

## Test Summary Template

**Date:** ___________
**Tester:** ___________
**Browser:** ___________
**Status:** [ ] PASS [ ] FAIL

**Passed Tests:**
- [ ] Test 1: Country Dropdown
- [ ] Test 2: State Dropdown
- [ ] Test 3: City Dropdown
- [ ] Test 4: Metric Dropdown
- [ ] Test 5: Period Dropdown
- [ ] Test 6: Forecast City Dropdown
- [ ] Test 7: Heatmap Metric Dropdown
- [ ] Test 8: Trend Period Dropdown
- [ ] Test 9: Multiple Dropdowns Constraint
- [ ] Test 10: Value Persistence
- [ ] Test 11: Z-Index Positioning
- [ ] Test 12: Console Validation

**Issues Found:**
- [ ] None
- [ ] Minor (describe):
- [ ] Critical (describe):

**Notes:**
___________________________________________________________

---

## Additional Notes

- All dropdowns are in `src/routes/index.tsx`
- State management uses React hooks (useState)
- Styling uses Tailwind CSS classes
- No external dropdown library used
- Pure React implementation

---

**Task:** Task 1 - Wire Dashboard Dropdowns to State Management
**Status:** Ready for Manual Testing
**Date:** 2024
