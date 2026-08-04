import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { Panel } from "@/components/ui-kit/Panel";
import { HeatmapIndia } from "@/components/ui-kit/HeatmapIndia";
import { CITIES, aqiCategory, FORECAST_DELHI } from "@/lib/mock-data";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  AreaChart, Area, BarChart, Bar, ResponsiveContainer,
} from "recharts";
import { ArrowUp, ArrowDown, Zap, AlertCircle, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/city/$cityId")({
  head: ({ params }) => ({
    meta: [{ title: `${params.cityId} - Air Quality Dashboard · Swachh Hawa` }],
  }),
  component: CityPage,
});

const CITY_DATA: Record<string, any> = {
  delhi: {
    name: "Delhi",
    state: "DL",
    aqi: 379,
    pm25: 213,
    pm10: 280,
    no2: 145,
    co: 2.1,
    category: "Very Poor",
    color: "rose",
    description: "National Capital with severe air quality challenges driven by vehicle emissions, industrial activity, and seasonal stubble burning.",
    population: "32.9M",
    area: "1,484 km²",
    sensors: 324,
    incidents: 8,
    healthImpact: "Critical - Respiratory issues widespread",
    trend24h: "+18%",
    forecast: "Deteriorating",
  },
  ghaziabad: {
    name: "Ghaziabad",
    state: "UP",
    aqi: 289,
    pm25: 156,
    pm10: 220,
    no2: 98,
    co: 1.5,
    category: "Poor",
    color: "amber",
    description: "Industrial hub in National Capital Region with significant pollution from manufacturing, power plants, and vehicular traffic.",
    population: "17.4M",
    area: "3,594 km²",
    sensors: 156,
    incidents: 4,
    healthImpact: "High - Vulnerable populations at risk",
    trend24h: "+12%",
    forecast: "Moderate",
  },
  bangalore: {
    name: "Bangalore",
    state: "KA",
    aqi: 105,
    pm25: 42,
    pm10: 68,
    no2: 35,
    co: 0.8,
    category: "Moderate",
    color: "cyan",
    description: "Tech hub with moderate air quality. Challenges from urban expansion, traffic congestion, and construction activities.",
    population: "12.5M",
    area: "2,190 km²",
    sensors: 89,
    incidents: 1,
    healthImpact: "Moderate - Precautions advised",
    trend24h: "-5%",
    forecast: "Stable",
  },
};

// Sample hourly trend data for each city
const HOURLY_TRENDS: Record<string, any[]> = {
  delhi: Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    aqi: 300 + Math.sin(i / 4) * 80 + Math.random() * 40,
  })),
  ghaziabad: Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    aqi: 220 + Math.sin(i / 4) * 60 + Math.random() * 30,
  })),
  bangalore: Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    aqi: 80 + Math.sin(i / 4) * 25 + Math.random() * 15,
  })),
};

// Source contribution data
const SOURCE_DATA: Record<string, any[]> = {
  delhi: [
    { name: "Vehicular", value: 35 },
    { name: "Industrial", value: 25 },
    { name: "Stubble Burning", value: 20 },
    { name: "Construction", value: 12 },
    { name: "Other", value: 8 },
  ],
  ghaziabad: [
    { name: "Industrial", value: 40 },
    { name: "Vehicular", value: 30 },
    { name: "Power Plants", value: 18 },
    { name: "Other", value: 12 },
  ],
  bangalore: [
    { name: "Vehicular", value: 45 },
    { name: "Construction", value: 25 },
    { name: "Industrial", value: 20 },
    { name: "Other", value: 10 },
  ],
};

export default function CityPage() {
  const { cityId } = Route.useParams();
  const city = CITY_DATA[cityId?.toLowerCase()] || CITY_DATA.delhi;
  const hourlyData = HOURLY_TRENDS[cityId?.toLowerCase()] || HOURLY_TRENDS.delhi;
  const sourceData = SOURCE_DATA[cityId?.toLowerCase()] || SOURCE_DATA.delhi;

  const cat = aqiCategory(city.aqi);
  const [selectedTab, setSelectedTab] = useState("overview");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={city.state}
        title={`${city.name} Air Quality Dashboard`}
        description={city.description}
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: "AQI", value: city.aqi, unit: "", color: cat.token },
          { label: "PM2.5", value: city.pm25, unit: "µg/m³", color: "chart-2" },
          { label: "PM10", value: city.pm10, unit: "µg/m³", color: "chart-3" },
          { label: "Population", value: city.population, unit: "", color: "primary" },
          { label: "Sensors", value: city.sensors, unit: "", color: "cyan" },
        ].map(m => (
          <div key={m.label} className="rounded-xl border border-border bg-card/70 p-4">
            <div className="text-[10px] uppercase mono tracking-wider text-muted-foreground">{m.label}</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="mono text-2xl font-bold" style={{ color: `var(--${m.color})` }}>{m.value}</span>
              {m.unit && <span className="text-xs text-muted-foreground">{m.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Status & Health Impact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Panel title="Current Status" subtitle={`Updated now`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <span className="text-sm">Category</span>
              <span className="px-3 py-1 rounded font-bold text-white" style={{ background: `var(--${cat.token})` }}>
                {city.category.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <span className="text-sm">24h Trend</span>
              <span className="flex items-center gap-1 font-semibold" style={{ color: "var(--rose)" }}>
                <ArrowUp className="h-4 w-4" />
                {city.trend24h}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
              <span className="text-sm">Forecast</span>
              <span className="text-amber">{city.forecast}</span>
            </div>
          </div>
        </Panel>

        <Panel title="Health Advisory" subtitle={`For ${city.name}`}>
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-rose/20 bg-rose/5">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-rose flex-shrink-0 mt-0.5" />
                <div className="text-sm">{city.healthImpact}</div>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>• Limit outdoor activities</li>
              <li>• Wear N95 masks</li>
              <li>• Increase water intake</li>
              <li>• Avoid strenuous exercise</li>
            </ul>
          </div>
        </Panel>

        <Panel title="City Info" subtitle={`${city.name}, ${city.state}`}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Population</span><span className="font-semibold">{city.population}</span></div>
            <div className="flex justify-between"><span>Area</span><span className="font-semibold">{city.area}</span></div>
            <div className="flex justify-between"><span>Active Sensors</span><span className="font-semibold">{city.sensors}</span></div>
            <div className="flex justify-between"><span>Active Incidents</span><span className="font-semibold">{city.incidents}</span></div>
          </div>
        </Panel>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 24h Trend */}
        <Panel title="24-Hour AQI Trend" subtitle={`Hourly breakdown`}>
          <div className="h-[250px]">
            <ResponsiveContainer>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id={`grad-${cityId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor={`var(--${cat.token})`} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={`var(--${cat.token})`} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={2} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
                <Area type="monotone" dataKey="aqi" stroke={`var(--${cat.token})`} fill={`url(#grad-${cityId})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Pollution Sources */}
        <Panel title="Pollution Sources" subtitle={`Primary contributors`}>
          <div className="h-[250px]">
            <ResponsiveContainer>
              <BarChart data={sourceData} layout="vertical">
                <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
                <Bar dataKey="value" fill={`var(--${city.color})`} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Heatmap */}
      <Panel title={`${city.name} Heatmap`} subtitle={`Real-time pollution visualization`} dense>
        <div className="h-[300px] rounded-lg overflow-hidden">
          <HeatmapIndia />
        </div>
      </Panel>

      {/* Recommendations */}
      <Panel title="Recommendations & Actions" subtitle={`For ${city.name} residents and businesses`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-cyan/20 bg-cyan/5">
            <div className="flex items-start gap-3 mb-2">
              <Zap className="h-5 w-5 text-cyan flex-shrink-0" />
              <div>
                <div className="font-semibold text-sm">Personal Protection</div>
                <div className="text-xs text-muted-foreground mt-1">Wear N95 masks, limit outdoor activities, use air purifiers indoors</div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-amber/20 bg-amber/5">
            <div className="flex items-start gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-amber flex-shrink-0" />
              <div>
                <div className="font-semibold text-sm">Industrial Action</div>
                <div className="text-xs text-muted-foreground mt-1">Factories operating at 50% capacity, stack height requirements enforced</div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-emerald/20 bg-emerald/5">
            <div className="flex items-start gap-3 mb-2">
              <Users className="h-5 w-5 text-emerald flex-shrink-0" />
              <div>
                <div className="font-semibold text-sm">Public Transport</div>
                <div className="text-xs text-muted-foreground mt-1">Free bus/metro passes, encourage carpooling and work-from-home</div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-rose/20 bg-rose/5">
            <div className="flex items-start gap-3 mb-2">
              <AlertCircle className="h-5 w-5 text-rose flex-shrink-0" />
              <div>
                <div className="font-semibold text-sm">Health Services</div>
                <div className="text-xs text-muted-foreground mt-1">Increased respiratory clinics, free masks distribution, AQI-aware alerts</div>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
