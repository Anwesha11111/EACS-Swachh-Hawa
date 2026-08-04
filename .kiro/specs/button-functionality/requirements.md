# Button Functionality Implementation - Requirements

## Overview
The Swachh Hawa UI has extensive scaffolding but many buttons are non-functional (toast-only or simulated). This spec covers wiring all buttons to real backend functionality.

## High-Priority Buttons (Phase 1)

### 1. Incident Management - New Manual Case
- **Location**: `src/routes/incidents.tsx` (Line 70-73)
- **Current State**: Toast-only handler
- **Required**: 
  - Modal form for entering incident details
  - Validation for required fields
  - POST endpoint: `/api/incidents/create`
  - Response handling & success toast

### 2. Enforcement - Activate Strike Teams
- **Location**: `src/routes/incidents.tsx` (Line 56-66)
- **Current State**: 1.8s fake delay + mock response
- **Required**:
  - POST endpoint: `/api/enforcement/activate-teams`
  - Response should include team ETAs, dispatch status
  - Real implementation (not simulated)

### 3. User Management - Invite User
- **Location**: `src/routes/users.tsx` (Line 75-81)
- **Current State**: Toast-only
- **Required**:
  - Modal for email entry
  - POST endpoint: `/api/users/invite`
  - Email service integration
  - Token generation with 48h expiry

### 4. Settings - Save Changes
- **Location**: `src/routes/settings.tsx` (Line 82-89)
- **Current State**: Partially working
- **Required**:
  - Fix webhook management (CRUD endpoints missing)
  - Validate all threshold inputs
  - PATCH endpoint: `/api/settings/webhooks/{id}`

### 5. Reports - Custom Report Generation
- **Location**: `src/routes/reports.tsx` (Line 60-66)
- **Current State**: 2.2s fake delay
- **Required**:
  - POST endpoint: `/api/reports/generate`
  - Async job queue (background task)
  - PDF generation service
  - Return download URL when ready

## Medium-Priority Buttons (Phase 2)

### 6. Report Download (PDF)
- **Location**: `src/routes/reports.tsx` (Line 119-130)
- **Current State**: CSV works, PDF is toast-only
- **Required**: GET endpoint to serve PDF files

### 7. Policy Simulator - Run Simulation
- **Location**: `src/routes/policy-simulator.tsx` (Line 75-96)
- **Current State**: 2s fake delay
- **Required**:
  - POST endpoint: `/api/simulator/run`
  - Call actual LGBM model (or similar ML model)
  - Return predicted impacts

### 8. Policy Simulator - Save Scenario
- **Location**: `src/routes/policy-simulator.tsx` (Line 93)
- **Current State**: Toast-only
- **Required**:
  - POST endpoint: `/api/scenarios`
  - GET endpoint: `/api/scenarios/{id}`
  - Persistence & retrieval

## Low-Priority Buttons (Phase 3)

### 9. Policy Simulator - Share Scenario
### 10. Report Access Links (Shapefile, API Docs, Bulk Export)
### 11. Notifications - Mark All Read
### 12. User Actions - Reinstate Suspended Account

## API Endpoints to Create

```
POST   /api/incidents/create
POST   /api/enforcement/activate-teams
POST   /api/users/invite
PATCH  /api/settings/webhooks/{id}
POST   /api/reports/generate
GET    /api/reports/{id}/download
POST   /api/simulator/run
POST   /api/scenarios
GET    /api/scenarios/{id}
```

## Testing Strategy
- Unit tests for each button handler
- Integration tests with mock backend
- End-to-end tests in dev environment

## Success Criteria
- All buttons in Phase 1 connect to backend endpoints
- All handlers show proper loading states
- Error messages are user-friendly
- No more toast notifications for data mutations (only success/error)
