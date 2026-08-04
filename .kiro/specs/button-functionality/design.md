# Button Functionality Implementation - Design

## Architecture Overview

### Data Flow
1. **UI Layer** (React components) → Click handlers with loading states
2. **API Client Layer** (TypeScript functions) → Type-safe wrappers around backend calls
3. **Backend Middleware** → Rate limiting, caching, logging
4. **Database** (Supabase/PostgreSQL) → Persistent storage
5. **External Services** → Email (InviteUser), PDF generation (Reports), ML models (Simulator)

### Implementation Pattern

All button handlers follow this pattern:
```
User clicks button
  ↓
Set loading state (disable button, show spinner)
  ↓
Call API function with validation
  ↓
Backend processes (DB writes, external calls)
  ↓
Success: Clear modal, refresh data, show success toast
  ↓
Error: Show error toast, keep form open, preserve inputs
```

## Phase 1 Implementation (High Priority)

### Module 1: Incident Management
**Files**: `src/lib/api/incidents.functions.ts`, `src/routes/incidents.tsx`
- `createIncident()` - Create new manual incident case
  - Input validation: title, description, location, severity
  - DB insert into `incidents` table
  - Auto-assign to incident queue
  - Return incident ID for tracking
- Wire up "New Manual Case" button with NewIncidentModal

### Module 2: Enforcement
**Files**: `src/lib/api/enforcement.functions.ts`, `src/routes/incidents.tsx`
- `activateStrikeTeams()` - Dispatch enforcement teams
  - Input: incident ID, team count, priority
  - DB: Create records in `team_deployments` table
  - Calculate ETAs based on team base locations and incident location
  - Return: deployment ID, team ETAs, status
- Wire up "Activate Strike Teams" button with proper response handling

### Module 3: User Management
**Files**: `src/lib/api/users.functions.ts`, `src/routes/users.tsx`
- `inviteUser()` - Send invitation email
  - Input: email address, role
  - Validation: email format, existing user check
  - Generate 48-hour expiry token (JWT or crypto random)
  - Queue email via external service (SendGrid, Resend, etc.)
  - DB: Insert into `user_invitations` table
  - Return: invitation ID, email sent confirmation
- Wire up "Invite User" button with InviteUserModal

### Module 4: Webhook Management
**Files**: `src/lib/api/settings.functions.ts`, `src/routes/settings.tsx`
- `createWebhook()` - Add new webhook
  - Input: URL, events to subscribe, active status
  - Validation: URL format, event list
  - DB: Insert into `webhooks` table
  - Return: webhook ID, secret key for signing
- `updateWebhook()` - Modify webhook
  - Input: webhook ID, updated fields
  - DB: Update record
- `deleteWebhook()` - Remove webhook
  - Input: webhook ID
  - DB: Soft delete (mark inactive)
- Wire up webhook CRUD buttons in settings panel

### Module 5: Report Generation
**Files**: `src/lib/api/reports.functions.ts`, `src/routes/reports.tsx`
- `generateReport()` - Async report creation
  - Input: report type, filters, format (PDF/CSV/Excel)
  - DB: Create job in `report_jobs` table with status='pending'
  - Return: job ID immediately (async pattern)
  - Background: Process job async, store result URL, update status
- `getReportStatus()` - Poll job status
  - Input: job ID
  - Query `report_jobs` table
  - Return: status, progress %, download URL (if ready)
- `downloadReport()` - Serve generated file
  - Input: job ID
  - Fetch file from storage
  - Return: file stream with proper MIME type
- Wire up with modal form, polling interval on button

## Phase 2 Implementation (Medium Priority)

### Module 6: Policy Simulator
**Files**: `src/lib/api/policy-simulator.functions.ts`, `src/routes/policy-simulator.tsx`
- `runSimulation()` - Execute policy simulation
  - Input: policy parameters, baseline conditions
  - Call ML model endpoint (LGBM, local inference, or external API)
  - Return: predicted AQI changes, health impact estimates
- `saveScenario()` - Store simulation result
  - Input: simulation results, scenario name, description
  - DB: Insert into `scenarios` table
  - Return: scenario ID
- `loadScenario()` - Retrieve saved scenario
  - Input: scenario ID
  - Query `scenarios` table with related simulation data
  - Return: full scenario details
- `shareScenario()` - Generate shareable link
  - Input: scenario ID
  - Generate short token/UUID
  - DB: Store mapping in `scenario_shares` table
  - Return: public share URL
- Wire up all simulator buttons with loading states

### Module 7: Notifications
**Files**: `src/lib/api/notifications.functions.ts`
- `markNotificationsAsRead()` - Bulk mark as read
  - Input: notification IDs (or all)
  - DB: Update `notifications` table
  - Return: count updated
- Wire up "Mark All Read" button with success feedback

## Data Models

### Core Tables (Already in Database)
- `incidents` - Incident records
- `team_deployments` - Strike team dispatch records
- `users` - User accounts
- `user_invitations` - Invitation tokens and expiry
- `webhooks` - Webhook endpoints and subscriptions
- `report_jobs` - Async report generation jobs
- `scenarios` - Saved policy simulation scenarios
- `notifications` - User notifications

### API Response Types
```typescript
// Success responses
type IncidentResponse = {
  id: string
  title: string
  createdAt: string
  status: 'created' | 'assigned' | 'resolved'
}

type DeploymentResponse = {
  id: string
  teams: Array<{ id: string; eta: number; baseLocation: string }>
  status: 'dispatched'
}

type ReportStatusResponse = {
  status: 'pending' | 'processing' | 'ready' | 'failed'
  progress?: number
  downloadUrl?: string
  error?: string
}

// Error responses
type ApiError = {
  code: string
  message: string
  details?: Record<string, string>
}
```

## Error Handling Strategy

1. **Validation Errors** (400)
   - Show field-level errors in form
   - Highlight invalid inputs
   - Keep modal open for correction

2. **Authorization Errors** (401/403)
   - Redirect to login if 401
   - Show "permission denied" message if 403

3. **Server Errors** (500+)
   - Log error with ID
   - Show generic user message
   - Offer "Try Again" button

4. **Network Errors**
   - Show offline indicator
   - Queue request for retry when online
   - Provide manual retry button

## Loading States & UX

- **Button disabled** during API call
- **Spinner indicator** inside button
- **Modal locked** (no dismiss) during submission
- **Toast on success** with brief confirmation
- **Toast on error** with actionable message
- **Auto-refresh data** after successful mutations

## Testing Approach

1. **Unit Tests** - API functions with mocked backend
2. **Integration Tests** - Full button flows with test database
3. **E2E Tests** - User interactions through UI

## Files to Modify/Create

### New Files
- `src/lib/api/incidents.functions.ts`
- `src/lib/api/enforcement.functions.ts`
- `src/lib/api/users.functions.ts`
- `src/lib/api/settings.functions.ts`
- `src/lib/api/reports.functions.ts`
- `src/lib/api/policy-simulator.functions.ts`
- `src/lib/api/notifications.functions.ts`

### Modified Files
- `src/lib/api/index.ts` - Export all new functions
- `src/routes/incidents.tsx` - Wire incident & enforcement buttons
- `src/routes/users.tsx` - Wire invite button
- `src/routes/settings.tsx` - Wire webhook buttons
- `src/routes/reports.tsx` - Wire report buttons
- `src/routes/policy-simulator.tsx` - Wire simulator buttons

### Backend Migrations (if needed)
- Verify all required tables exist in database schema
- Add any missing indices for performance
- Ensure RLS policies are correct

## Success Metrics

✓ All Phase 1 buttons connect to real endpoints
✓ Loading states prevent double-clicks
✓ Modals close only on success
✓ Error messages are user-friendly
✓ Data refreshes automatically after mutations
✓ No more fake delays or toast-only implementations
