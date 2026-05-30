import { CITIES, aqiCategory } from "@/lib/mock-data";

// x=(lon-68)*23+40  y=(37-lat)*27+30  viewBox 800×820
// Key fixes: HP/Spiti (293,165) replaces wrong 362,135; Nepal entry (316,219)
// replaces wrong 408,216; Pathankot (217,157) + J&K LoC (178,111) replace wrong 201,152/178,125
const INDIA_PATH =
  "M 201,84 L 270,84 " +
  "L 293,165 L 316,219 " +
  "L 408,257 L 511,270 L 569,270 " +
  "L 706,230 " +
  "L 683,297 L 649,378 L 615,405 " +
  "L 569,392 L 511,419 " +
  "L 465,460 L 385,546 L 339,641 L 316,735 " +
  "L 258,810 " +
  "L 231,773 L 196,705 L 178,624 L 173,597 L 155,530 L 150,516 " +
  "L 152,465 L 108,432 L 86,451 L 65,430 " +
  "L 52,392 L 86,300 L 121,260 L 178,192 L 217,157 L 178,111 Z";

const AQI_COLORS: [number, string][] = [
  [0,   "#00e400"],
  [50,  "#ffff00"],
  [100, "#ff7e00"],
  [200, "#ff0000"],
  [300, "#8f3f97"],
  [400, "#7e0023"],
];

function aqiToHeat(aqi: number): string {
  for (let i = AQI_COLORS.length - 1; i >= 0; i--) {
    if (aqi >= AQI_COLORS[i][0]) return AQI_COLORS[i][1];
  }
  return AQI_COLORS[0][1];
}

export function HeatmapIndia() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card/40 to-card/10">
      <svg viewBox="0 0 800 820" className="h-full w-full">
        <defs>
          <clipPath id="indiaClip">
            <path d={INDIA_PATH} />
          </clipPath>
          {CITIES.map((c) => (
            <radialGradient
              key={`rg-${c.name}`}
              id={`heat-${c.name}`}
              cx="50%" cy="50%" r="50%"
            >
              <stop offset="0%"   stopColor={aqiToHeat(c.aqi)} stopOpacity="0.85" />
              <stop offset="100%" stopColor={aqiToHeat(c.aqi)} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* base India fill */}
        <path d={INDIA_PATH} fill="var(--card)" stroke="var(--border)" strokeWidth="1" opacity="0.6" />

        {/* thermal blobs clipped to India shape */}
        <g clipPath="url(#indiaClip)">
          {CITIES.map((c) => {
            const radius = 60 + Math.min(60, c.aqi / 4);
            return (
              <ellipse
                key={c.name}
                cx={c.x} cy={c.y}
                rx={radius} ry={radius * 0.85}
                fill={`url(#heat-${c.name})`}
              />
            );
          })}
        </g>

        {/* India border on top */}
        <path d={INDIA_PATH} fill="none" stroke="var(--border)" strokeWidth="1.2" />

        {/* City dots */}
        {CITIES.map((c) => (
          <circle
            key={`dot-${c.name}`}
            cx={c.x} cy={c.y} r="3"
            fill="white"
            opacity="0.9"
            style={{ filter: "drop-shadow(0 0 3px rgba(0,0,0,0.6))" }}
          />
        ))}
      </svg>

      {/* color scale legend */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-lg border border-border bg-card/80 px-3 py-2 text-[10px] mono backdrop-blur-md">
        <div
          className="h-3 flex-1 rounded-full"
          style={{
            background: "linear-gradient(90deg, #00e400, #ffff00, #ff7e00, #ff0000, #8f3f97, #7e0023)",
          }}
        />
        <div className="flex items-center justify-between gap-4 shrink-0">
          <span className="text-muted-foreground">0</span>
          <span className="text-muted-foreground">100</span>
          <span className="text-muted-foreground">200</span>
          <span className="text-muted-foreground">300+</span>
        </div>
      </div>
    </div>
  );
}
