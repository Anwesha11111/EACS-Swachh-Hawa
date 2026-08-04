# Button Functionality Implementation - Tasks

## Task 1: Wire Dashboard Dropdowns to State Management
**Type:** Feature Implementation  
**Priority:** High  
**Dependencies:** None  

### Subtasks
- [x] Add click-based state management for all 5 top-row filters (Country, State, City, Metric, Period)
- [-] Add state management for forecast city dropdown (Delhi/Mumbai/Bangalore/Chennai)
- [-] Add state management for heatmap metric dropdown (PM2.5/AQI/PM10/NO₂)
- [-] Add state management for trend period dropdown (24H/7 Days/30 Days)
- [-] Close dropdowns on selection to prevent state conflicts
- [-] Test all dropdowns toggle correctly on click
- [~] Verify dropdown z-index positioning doesn't conflict with other elements

### Acceptance Criteria
- All dropdowns use click-based state instead of CSS hover
- Dropdowns close automatically after selection
- Multiple dropdowns can't be open simultaneously
- Dropdown values persist during component render
- No console errors on dropdown interaction

---

## Task 2: Fix Data Access Page Layer Buttons
**Type:** Feature Implementation  
**Priority:** Medium  
**Dependencies:** None  

### Subtasks
- [~] Verify Layers, Satellite, Wind, Drones, MVU buttons have click handlers
- [~] Ensure toggleLayer() function properly updates activeLayers state
- [~] Add proper toast notifications for layer visibility changes
- [~] Test button styling reflects active/inactive state
- [~] Verify map updates when layers are toggled

### Acceptance Criteria
- All 5 layer buttons respond to clicks
- Active state styling is clearly visible
- Toast notifications show which layer was toggled
- No duplicate layer toggles on single click
- Layers properly display/hide on map

---

## Task 3: Implement Dataset Download Functionality
**Type:** Feature Implementation  
**Priority:** High  
**Dependencies:** None  

### Subtasks
- [~] Add onClick handler to all dataset download buttons
- [~] Create handleDownloadDataset() function with proper file handling
- [~] Show loading toast before download starts
- [~] Display download success toast with file info
- [~] Handle download errors gracefully with error toast
- [~] Test all 4 datasets download correctly
- [~] Verify file names and metadata display in toasts

### Acceptance Criteria
- All 4 datasets have working download buttons
- Downloads trigger browser's native download dialog
- Loading and success toasts appear with correct info
- Error handling prevents app crashes
- File sizes and licenses display in success message

---

## Task 4: Implement API Reference Page Buttons
**Type:** Feature Implementation  
**Priority:** High  
**Dependencies:** None  

### Subtasks
- [~] Add onClick handler to OpenAPI Spec button
- [~] Add onClick handler to Request API Key button
- [~] Create handleOpenAPISpec() function - opens spec in new tab
- [~] Create handleRequestAPIKey() function - opens request form in new tab
- [~] Show appropriate loading and success toasts
- [~] Test both buttons open correct external links
- [~] Verify toast messages are helpful and accurate

### Acceptance Criteria
- OpenAPI Spec button opens OpenAPI 3.1 specification
- Request API Key button opens request form
- Both open in new browser tabs (not current tab)
- Toast notifications confirm action
- No JavaScript errors on button click

---

## Task 5: Implement Report Download Handlers
**Type:** Feature Implementation  
**Priority:** High  
**Dependencies:** Task 3 (similar pattern)  

### Subtasks
- [~] Verify generateReport() function works correctly
- [~] Verify getReportStatus() polling mechanism works
- [~] Verify downloadReport() handles file serving
- [~] Test CSV export for all report types
- [~] Test PDF download for published reports
- [~] Test PDF+Shapefile downloads for atlas reports
- [~] Verify error messages show if download fails
- [~] Test "Generate Custom Report" button with proper async handling

### Acceptance Criteria
- All report download buttons work without errors
- CSV exports include all city data
- PDF downloads serve correct format
- Async report generation shows status updates
- Custom report generation polls correctly until ready
- All error cases handled gracefully with user-friendly messages

---

## Task 6: Implement SQL Playground "Run" Button
**Type:** Feature Implementation  
**Priority:** Medium  
**Dependencies:** None  

### Subtasks
- [~] Add onClick handler to SQL "Run" button
- [~] Create handleRunQuery() function
- [~] Show loading toast while query executes
- [~] Simulate query execution (500-1000ms delay)
- [~] Display success toast with result count and timing
- [~] Mock actual query results if needed
- [~] Handle query errors with error toast
- [~] Test multiple sequential query runs

### Acceptance Criteria
- Run button shows loading state
- Success toast displays result count and execution time
- Query can be run multiple times
- No errors in console
- Toast messages are informative

---

## Task 7: Fix Missing Button Handlers in Reports
**Type:** Bug Fix  
**Priority:** Medium  
**Dependencies:** Task 5  

### Subtasks
- [~] Review all report category filter buttons (All, Quarterly, NCAP, Atlas, Enforcement, Health)
- [~] Verify category filtering works correctly
- [~] Test switching between categories updates displayed reports
- [~] Test "Generate Custom Report" modal functionality
- [~] Verify report generation async flow
- [~] Test polling for report completion
- [~] Verify download buttons update after report completion

### Acceptance Criteria
- Category buttons filter correctly
- Custom report modal appears and accepts input
- Report generation status updates properly
- Polling mechanism waits for completion
- No duplicate downloads or orphaned jobs

---

## Task 8: Fix Missing Button Handlers in Sandbox
**Type:** Bug Fix  
**Priority:** Medium  
**Dependencies:** Task 3, Task 6  

### Subtasks
- [~] Verify all dataset download buttons have handlers
- [~] Verify SQL Run button has handler
- [~] Test Report links are clickable
- [~] Add hover effects to report items
- [~] Verify API endpoint list displays correctly
- [~] Test that clicking reports shows appropriate action

### Acceptance Criteria
- All interactive elements respond to clicks
- Download buttons trigger file downloads
- Run button shows loading state
- Report items are visually distinct and clickable
- No console errors on interaction

---

## Task 9: Add Global Error Boundary & Toast Fallback
**Type:** Technical Improvement  
**Priority:** Low  
**Dependencies:** Tasks 1-8  

### Subtasks
- [~] Create error boundary component if missing
- [~] Catch unhandled button click errors
- [~] Display generic error toast for unexpected failures
- [~] Log errors to console for debugging
- [~] Test error boundary catches render errors
- [~] Verify app continues functioning after error
- [~] Test toast notifications work across all button handlers

### Acceptance Criteria
- Unhandled errors don't crash the app
- Users see helpful error messages
- Error logging works for debugging
- App recovers gracefully from errors
- All button interactions have proper error handling

---

## Task 10: Verify All Dropdowns & Buttons Across All Pages
**Type:** Quality Assurance  
**Priority:** Medium  
**Dependencies:** Tasks 1-9  

### Subtasks
- [~] Test all dropdowns on dashboard page
- [~] Test all buttons on data access page
- [~] Test all buttons on sandbox page
- [~] Test all buttons on API page
- [~] Test all buttons on reports page
- [~] Test all buttons on other pages with interactive elements
- [~] Verify no console errors on any page
- [~] Test on multiple browsers (Chrome, Firefox, Safari)
- [~] Test mobile responsiveness of buttons and dropdowns
- [~] Document any remaining issues

### Acceptance Criteria
- All buttons respond to clicks correctly
- All dropdowns open/close properly
- No console errors or warnings
- Mobile layouts work correctly
- Cross-browser compatibility verified
- All toasts display correctly
- Loading states work as expected

---

## Summary

**Total Tasks:** 10  
**Phase 1 (High Priority):** Tasks 1-5  
**Phase 2 (Medium Priority):** Tasks 6-8  
**Phase 3 (Quality & Polish):** Tasks 9-10  

**Estimated Effort:**
- Phase 1: 6-8 hours
- Phase 2: 3-4 hours
- Phase 3: 2-3 hours

**Success Metrics:**
- ✅ All 40+ buttons functional
- ✅ All 8+ dropdowns working
- ✅ No console errors
- ✅ All toasts display correctly
- ✅ No fake delays or mock-only implementations
- ✅ Proper loading states everywhere
- ✅ Error handling for all edge cases
