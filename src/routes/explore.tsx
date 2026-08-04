import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { ArrowRight, Zap, AlertCircle, Leaf, Cloud, Wind } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [{ title: "Explore · Swachh Hawa" }] }),
  component: Page,
});

const EXPLORE_CARDS = [
  {
    id: 1,
    category: "POLLUTION",
    title: "Real-time AQI Crisis Alerts",
    description: "Get instant notifications when air quality drops below safe levels in your city.",
    image: "🔴",
    color: "rose",
    action: "Set Alert",
  },
  {
    id: 2,
    category: "FORECASTING",
    title: "7-Day Air Quality Forecast",
    description: "Plan your activities with AI-powered predictions of pollution levels.",
    image: "📊",
    color: "amber",
    action: "View Forecast",
  },
  {
    id: 3,
    category: "HEALTH",
    title: "Health Impact Assessment",
    description: "Understand how current pollution levels affect your respiratory health.",
    image: "❤️",
    color: "rose",
    action: "Learn More",
  },
  {
    id: 4,
    category: "ENFORCEMENT",
    title: "Pollution Source Tracking",
    description: "Identify industrial and vehicular sources causing air quality degradation.",
    image: "🏭",
    color: "amber",
    action: "Track",
  },
  {
    id: 5,
    category: "ANALYTICS",
    title: "Seasonal Pollution Patterns",
    description: "Analyze historical data to understand stubble burning and seasonal impacts.",
    image: "📈",
    color: "cyan",
    action: "Analyze",
  },
  {
    id: 6,
    category: "POLICY",
    title: "Policy Impact Simulator",
    description: "Model how GRAP and emission control policies affect air quality.",
    image: "🎯",
    color: "emerald",
    action: "Simulate",
  },
  {
    id: 7,
    category: "SENSORS",
    title: "Sensor Network Health",
    description: "Monitor 2,451 air quality sensors across India in real-time.",
    image: "📡",
    color: "cyan",
    action: "Monitor",
  },
  {
    id: 8,
    category: "DATA",
    title: "Download Research Data",
    description: "Access historical AQI, satellite, and meteorological datasets.",
    image: "💾",
    color: "primary",
    action: "Download",
  },
  {
    id: 9,
    category: "INTEGRATION",
    title: "API Integration Guide",
    description: "Build apps with our REST API - 1.24M calls/day from developers worldwide.",
    image: "⚙️",
    color: "chart-1",
    action: "Integrate",
  },
];

const colorMap: Record<string, string> = {
  rose: "var(--rose)",
  amber: "var(--amber)",
  cyan: "var(--cyan)",
  emerald: "var(--emerald)",
  primary: "var(--primary)",
  "chart-1": "var(--chart-1)",
};

function Page() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...new Set(EXPLORE_CARDS.map(c => c.category))];
  
  const filteredCards = selectedCategory === "All" 
    ? EXPLORE_CARDS 
    : EXPLORE_CARDS.filter(c => c.category === selectedCategory);

  const handleCardAction = (title: string, action: string) => {
    toast.info(`${action} - ${title}`, {
      description: "Feature loading...",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DISCOVER"
        title="Explore Swachh Hawa Features"
        description="Discover real-time air quality data, forecasts, enforcement tracking, and policy analysis tools to combat pollution across India."
      />

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="px-4 py-2 rounded-lg border text-sm font-medium transition-all"
            style={{
              background: selectedCategory === cat ? "var(--primary)" : "var(--card)",
              color: selectedCategory === cat ? "var(--primary-foreground)" : "var(--foreground)",
              borderColor: selectedCategory === cat ? "var(--primary)" : "var(--border)",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map(card => (
          <div
            key={card.id}
            className="group relative overflow-hidden rounded-xl border border-border bg-card/70 backdrop-blur-md transition-all hover:shadow-lg hover:border-primary/50"
          >
            {/* Background Image/Placeholder */}
            <div
              className="relative h-48 bg-gradient-to-br overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${colorMap[card.color]}15, ${colorMap[card.color]}05)`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30 group-hover:opacity-50 transition">
                {card.image}
              </div>
              {/* Category Badge */}
              <div
                className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ background: colorMap[card.color] }}
              >
                {card.category}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition">
                  {card.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleCardAction(card.title, card.action)}
                className="w-full mt-4 px-3 py-2 rounded-lg border border-border bg-background/60 hover:bg-accent/50 text-xs font-medium text-foreground transition-all flex items-center justify-center gap-2 group/btn"
              >
                {card.action}
                <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border">
        {[
          { label: "Real-time Sensors", value: "2,451" },
          { label: "Daily Data Points", value: "8.24M" },
          { label: "API Calls 24h", value: "1.24M" },
          { label: "Monitoring Stations", value: "250+" },
        ].map(stat => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-bold text-primary">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
