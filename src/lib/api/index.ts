// ═════════════════════════════════════════════════════════════════════════════
// API Index - Central export for all backend functions
// ═════════════════════════════════════════════════════════════════════════════

// AQI & Air Quality Data
export {
  getLiveAqi,
  getAqiForCity,
  getHistoricalAqi,
} from "./aqi.functions";

// Sensors & Devices
export {
  getSensors,
  getSensorHealth,
  getSensorById,
} from "./sensors.functions";

// Forecasts & Predictions
export {
  getForecast,
  getMultiCityForecast,
  getHourlyForecast,
} from "./forecasts.functions";

// Incidents & Enforcement
export {
  getIncidents,
  getIncidentById,
  getIncidentStats,
  createIncident,
  updateIncidentStatus,
  type Incident,
} from "./incidents.functions";

// Enforcement & Strike Teams
export {
  activateStrikeTeams,
  getDispatchHistory,
  type StrikeTeamDispatch,
} from "./enforcement.functions";

// User Management
export {
  inviteUser,
  getUserByEmail,
  listUsers,
  type UserInvitation,
} from "./users.functions";

// Complaints (already implemented)
export {
  submitComplaint,
  getComplaints,
  type Complaint,
} from "./complaints.functions";

// User Settings & Webhooks
export {
  getSettings,
  saveSettings,
  createWebhook,
  deleteWebhook,
  getUserWebhooks,
  type UserSettings,
  type Webhook,
  type WebhookResponse,
} from "./settings.functions";

// Reports & Data Export
export {
  generateReport,
  getReportStatus,
  downloadReport,
  listUserReports,
  type ReportJob,
} from "./reports.functions";

// Policy Simulator
export {
  runSimulation,
  saveScenario,
  generateShareUrl,
} from "./policy-simulator.functions";

// Notifications
export {
  markNotificationsAsRead,
} from "./notifications.functions";

// Middleware & Utilities
export { rateLimiters, getClientIdentifier } from "../middleware/rate-limit";
export { caches, generateCacheKey, withCache, invalidateCache } from "../middleware/cache";
export { 
  ApiError, 
  validationError, 
  notFoundError, 
  unauthorizedError,
  forbiddenError,
  withErrorHandler 
} from "../middleware/api-logger";

// Re-export commonly used types
export type { CityAqi } from "../mock-data";
