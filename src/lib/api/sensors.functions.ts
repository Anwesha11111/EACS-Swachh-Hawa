import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseAdmin } from "../supabase.server";

// ═════════════════════════════════════════════════════════════════════════════
// Sensor & Device Management Functions
// ═════════════════════════════════════════════════════════════════════════════

interface Sensor {
  id: string;
  name: string;
  device_type: 'CAAQMS' | 'low-cost' | 'mobile' | 'drone' | 'satellite';
  city: string;
  state: string;
  status: 'online' | 'degraded' | 'offline' | 'maintenance';
  battery_level: number | null;
  firmware_version: string | null;
  last_heartbeat: string | null;
  location: { lat: number; lon: number } | null;
}

// Mock sensor data for fallback
const MOCK_SENSORS: Sensor[] = [
  { id: 'SH-DEL-001', name: 'CAAQMS Delhi ITO', device_type: 'CAAQMS', city: 'Delhi', state: 'DL', status: 'online', battery_level: 100, firmware_version: 'v4.2.1', last_heartbeat: new Date().toISOString(), location: { lat: 28.70, lon: 77.10 } },
  { id: 'SH-MUM-001', name: 'CAAQMS Mumbai Worli', device_type: 'CAAQMS', city: 'Mumbai', state: 'MH', status: 'online', battery_level: 100, firmware_version: 'v4.2.1', last_heartbeat: new Date().toISOString(), location: { lat: 19.08, lon: 72.88 } },
  { id: 'SH-DEL-042', name: 'Low-cost Wazirpur', device_type: 'low-cost', city: 'Delhi', state: 'DL', status: 'online', battery_level: 87, firmware_version: 'v4.2.1', last_heartbeat: new Date().toISOString(), location: { lat: 28.72, lon: 77.15 } },
  { id: 'SH-BLR-001', name: 'CAAQMS Bengaluru Silk Board', device_type: 'CAAQMS', city: 'Bengaluru', state: 'KA', status: 'online', battery_level: 100, firmware_version: 'v4.2.0', last_heartbeat: new Date().toISOString(), location: { lat: 12.97, lon: 77.59 } },
];

/**
 * Get all sensors with optional filtering
 */
export const getSensors = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    city: z.string().optional(),
    status: z.enum(['online', 'degraded', 'offline', 'maintenance', 'all']).optional(),
    type: z.enum(['CAAQMS', 'low-cost', 'mobile', 'drone', 'satellite', 'all']).optional(),
  }))
  .handler(async ({ data: filters }) => {
    const db = await getSupabaseAdmin();
    
    if (!db) {
      // Return filtered mock data
      let sensors = MOCK_SENSORS;
      if (filters.city) {
        sensors = sensors.filter(s => s.city.toLowerCase() === filters.city!.toLowerCase());
      }
      if (filters.status && filters.status !== 'all') {
        sensors = sensors.filter(s => s.status === filters.status);
      }
      if (filters.type && filters.type !== 'all') {
        sensors = sensors.filter(s => s.device_type === filters.type);
      }
      
      return {
        sensors,
        total: sensors.length,
        online: sensors.filter(s => s.status === 'online').length,
        offline: sensors.filter(s => s.status === 'offline').length,
        degraded: sensors.filter(s => s.status === 'degraded').length,
        source: 'mock' as const,
      };
    }

    try {
      let query = db.from('sensors').select('*');
      
      if (filters.city) {
        query = query.ilike('city', filters.city);
      }
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.type && filters.type !== 'all') {
        query = query.eq('device_type', filters.type);
      }

      const { data, error } = await query.order('city', { ascending: true });

      if (error) throw error;

      const sensors = (data || []).map(s => ({
        ...s,
        location: s.location ? {
          lat: (s.location as any).coordinates[1],
          lon: (s.location as any).coordinates[0],
        } : null,
      })) as Sensor[];

      return {
        sensors,
        total: sensors.length,
        online: sensors.filter(s => s.status === 'online').length,
        offline: sensors.filter(s => s.status === 'offline').length,
        degraded: sensors.filter(s => s.status === 'degraded').length,
        source: 'database' as const,
      };
    } catch (err) {
      console.error('[sensors] Fetch error:', err);
      throw new Error('Failed to fetch sensors');
    }
  });

/**
 * Get sensor health metrics
 */
export const getSensorHealth = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = await getSupabaseAdmin();
    
    if (!db) {
      return {
        total: MOCK_SENSORS.length,
        online: MOCK_SENSORS.filter(s => s.status === 'online').length,
        degraded: MOCK_SENSORS.filter(s => s.status === 'degraded').length,
        offline: MOCK_SENSORS.filter(s => s.status === 'offline').length,
        maintenance: MOCK_SENSORS.filter(s => s.status === 'maintenance').length,
        uptime_percentage: 92.5,
        avg_battery_level: 91,
        source: 'mock' as const,
      };
    }

    try {
      const { data, error } = await db
        .from('sensors')
        .select('status, battery_level');

      if (error) throw error;

      const total = data?.length || 0;
      const online = data?.filter(s => s.status === 'online').length || 0;
      const degraded = data?.filter(s => s.status === 'degraded').length || 0;
      const offline = data?.filter(s => s.status === 'offline').length || 0;
      const maintenance = data?.filter(s => s.status === 'maintenance').length || 0;

      const batteryLevels = data?.filter(s => s.battery_level !== null).map(s => s.battery_level as number) || [];
      const avgBattery = batteryLevels.length > 0
        ? batteryLevels.reduce((a, b) => a + b, 0) / batteryLevels.length
        : 0;

      return {
        total,
        online,
        degraded,
        offline,
        maintenance,
        uptime_percentage: total > 0 ? ((online + degraded) / total) * 100 : 0,
        avg_battery_level: Math.round(avgBattery),
        source: 'database' as const,
      };
    } catch (err) {
      console.error('[sensors] Health check error:', err);
      throw new Error('Failed to get sensor health');
    }
  });

/**
 * Get sensor details by ID
 */
export const getSensorById = createServerFn({ method: "POST" })
  .inputValidator(z.object({ sensorId: z.string() }))
  .handler(async ({ data: input }) => {
    const db = await getSupabaseAdmin();
    
    if (!db) {
      const sensor = MOCK_SENSORS.find(s => s.id === input.sensorId);
      return sensor || null;
    }

    try {
      const { data, error } = await db
        .from('sensors')
        .select('*')
        .eq('id', input.sensorId)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        ...data,
        location: data.location ? {
          lat: (data.location as any).coordinates[1],
          lon: (data.location as any).coordinates[0],
        } : null,
      } as Sensor;
    } catch (err) {
      console.error('[sensors] Fetch by ID error:', err);
      return null;
    }
  });
