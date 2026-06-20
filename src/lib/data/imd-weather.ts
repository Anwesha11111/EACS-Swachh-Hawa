// IMD India weather dataset — no API key required.
// Values modelled after real IMD observations for major metro stations.
// All numeric ranges are within IMD-published seasonal norms.

export interface WeatherCurrent {
  city: string;
  state: string;
  station: string;         // ICAO-style station code
  tempC: number;           // Temperature °C
  humidity: number;        // %
  windSpeedKmh: number;
  windDir: string;         // compass direction
  rainfallMm: number;      // last 24 h
  pressureHpa: number;
  visibilityKm: number;
  dewPointC: number;
  feelsLikeC: number;
  condition: string;       // IMD-style: "Clear", "Partly Cloudy", etc.
  updatedAt: string;       // ISO-8601 UTC
}

export interface WeatherHour {
  hour: string;   // "HH:00"
  tempC: number;
  humidityPct: number;
  windKmh: number;
  aqiLink: number;  // rough AQI contribution from weather-driven dispersion
}

export interface WeatherForecastDay {
  date: string;       // "YYYY-MM-DD"
  dayLabel: string;   // "Mon", "Tue", …
  maxC: number;
  minC: number;
  humidity: number;
  rainfallMm: number;
  windSpeedKmh: number;
  condition: string;
  icon: string;       // emoji
}

export interface CityWeather {
  current: WeatherCurrent;
  hourly24: WeatherHour[];
  forecast5d: WeatherForecastDay[];
}

// ── helpers ──────────────────────────────────────────────────────────────────

function isoUtc(offsetHours: number = 0): string {
  const d = new Date(Date.now() + offsetHours * 3_600_000);
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function days5(start: Date): WeatherForecastDay[] {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const conditions: [string, string][] = [
    ["Clear", "☀️"], ["Partly Cloudy", "⛅"], ["Cloudy", "☁️"],
    ["Light Rain", "🌦️"], ["Thunderstorm", "⛈️"],
  ];
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const [condition, icon] = conditions[i % conditions.length];
    return {
      date: d.toISOString().slice(0, 10),
      dayLabel: labels[d.getDay()],
      maxC: 0, minC: 0, humidity: 0, rainfallMm: 0, windSpeedKmh: 0,
      condition, icon,
    };
  });
}

function hourly(base: number): WeatherHour[] {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    tempC: Math.round(base - 4 * Math.cos((i - 14) * Math.PI / 12)),
    humidityPct: Math.min(95, Math.max(25, 60 - 15 * Math.sin((i - 6) * Math.PI / 12))),
    windKmh: Math.max(2, Math.round(12 + 8 * Math.sin((i - 9) * Math.PI / 12))),
    aqiLink: Math.round(30 + 20 * Math.sin((i - 8) * Math.PI / 12)),
  }));
}

// ── dataset ──────────────────────────────────────────────────────────────────

const NOW = new Date();

export const IMD_WEATHER: Record<string, CityWeather> = {
  Delhi: {
    current: {
      city: "Delhi", state: "DL", station: "VIDD",
      tempC: 34, humidity: 52, windSpeedKmh: 14, windDir: "NW",
      rainfallMm: 0, pressureHpa: 1002, visibilityKm: 4.2,
      dewPointC: 23, feelsLikeC: 38,
      condition: "Hazy", updatedAt: isoUtc(),
    },
    hourly24: hourly(34),
    forecast5d: days5(NOW).map((d, i) => ({
      ...d,
      maxC: [36, 35, 33, 30, 28][i],
      minC: [26, 25, 23, 21, 20][i],
      humidity: [52, 58, 65, 72, 68][i],
      rainfallMm: [0, 0, 4, 12, 6][i],
      windSpeedKmh: [14, 18, 22, 28, 20][i],
    })),
  },
  Mumbai: {
    current: {
      city: "Mumbai", state: "MH", station: "VABB",
      tempC: 31, humidity: 78, windSpeedKmh: 22, windDir: "SW",
      rainfallMm: 18, pressureHpa: 1006, visibilityKm: 6.8,
      dewPointC: 27, feelsLikeC: 39,
      condition: "Partly Cloudy", updatedAt: isoUtc(),
    },
    hourly24: hourly(31),
    forecast5d: days5(NOW).map((d, i) => ({
      ...d,
      maxC: [32, 31, 30, 29, 30][i],
      minC: [27, 27, 26, 25, 26][i],
      humidity: [78, 82, 85, 88, 80][i],
      rainfallMm: [18, 32, 45, 22, 10][i],
      windSpeedKmh: [22, 28, 35, 30, 24][i],
    })),
  },
  Kolkata: {
    current: {
      city: "Kolkata", state: "WB", station: "VECC",
      tempC: 33, humidity: 71, windSpeedKmh: 16, windDir: "S",
      rainfallMm: 4, pressureHpa: 1004, visibilityKm: 5.5,
      dewPointC: 26, feelsLikeC: 40,
      condition: "Partly Cloudy", updatedAt: isoUtc(),
    },
    hourly24: hourly(33),
    forecast5d: days5(NOW).map((d, i) => ({
      ...d,
      maxC: [34, 33, 32, 31, 30][i],
      minC: [27, 26, 26, 25, 24][i],
      humidity: [71, 75, 78, 80, 72][i],
      rainfallMm: [4, 8, 14, 20, 8][i],
      windSpeedKmh: [16, 18, 20, 24, 18][i],
    })),
  },
  Chennai: {
    current: {
      city: "Chennai", state: "TN", station: "VOMM",
      tempC: 35, humidity: 68, windSpeedKmh: 18, windDir: "SE",
      rainfallMm: 0, pressureHpa: 1008, visibilityKm: 9.2,
      dewPointC: 28, feelsLikeC: 44,
      condition: "Clear", updatedAt: isoUtc(),
    },
    hourly24: hourly(35),
    forecast5d: days5(NOW).map((d, i) => ({
      ...d,
      maxC: [36, 36, 35, 34, 33][i],
      minC: [28, 28, 27, 27, 26][i],
      humidity: [68, 72, 74, 76, 70][i],
      rainfallMm: [0, 0, 2, 6, 4][i],
      windSpeedKmh: [18, 20, 22, 20, 18][i],
    })),
  },
  Bengaluru: {
    current: {
      city: "Bengaluru", state: "KA", station: "VOBG",
      tempC: 27, humidity: 62, windSpeedKmh: 12, windDir: "E",
      rainfallMm: 2, pressureHpa: 914, visibilityKm: 12.0,
      dewPointC: 20, feelsLikeC: 29,
      condition: "Partly Cloudy", updatedAt: isoUtc(),
    },
    hourly24: hourly(27),
    forecast5d: days5(NOW).map((d, i) => ({
      ...d,
      maxC: [28, 27, 26, 25, 26][i],
      minC: [20, 19, 19, 18, 18][i],
      humidity: [62, 68, 72, 76, 65][i],
      rainfallMm: [2, 6, 14, 8, 4][i],
      windSpeedKmh: [12, 14, 16, 18, 12][i],
    })),
  },
  Hyderabad: {
    current: {
      city: "Hyderabad", state: "TG", station: "VOHY",
      tempC: 32, humidity: 58, windSpeedKmh: 14, windDir: "NE",
      rainfallMm: 0, pressureHpa: 1001, visibilityKm: 8.0,
      dewPointC: 23, feelsLikeC: 36,
      condition: "Clear", updatedAt: isoUtc(),
    },
    hourly24: hourly(32),
    forecast5d: days5(NOW).map((d, i) => ({
      ...d,
      maxC: [33, 32, 31, 30, 30][i],
      minC: [24, 23, 22, 22, 21][i],
      humidity: [58, 62, 66, 70, 64][i],
      rainfallMm: [0, 0, 4, 10, 6][i],
      windSpeedKmh: [14, 16, 20, 22, 16][i],
    })),
  },
  Ahmedabad: {
    current: {
      city: "Ahmedabad", state: "GJ", station: "VAAH",
      tempC: 38, humidity: 38, windSpeedKmh: 20, windDir: "W",
      rainfallMm: 0, pressureHpa: 999, visibilityKm: 7.0,
      dewPointC: 22, feelsLikeC: 42,
      condition: "Clear", updatedAt: isoUtc(),
    },
    hourly24: hourly(38),
    forecast5d: days5(NOW).map((d, i) => ({
      ...d,
      maxC: [39, 38, 36, 34, 33][i],
      minC: [28, 27, 26, 24, 24][i],
      humidity: [38, 42, 48, 54, 50][i],
      rainfallMm: [0, 0, 2, 8, 4][i],
      windSpeedKmh: [20, 22, 26, 30, 22][i],
    })),
  },
  Lucknow: {
    current: {
      city: "Lucknow", state: "UP", station: "VILK",
      tempC: 35, humidity: 55, windSpeedKmh: 10, windDir: "NW",
      rainfallMm: 0, pressureHpa: 1000, visibilityKm: 3.8,
      dewPointC: 25, feelsLikeC: 40,
      condition: "Hazy", updatedAt: isoUtc(),
    },
    hourly24: hourly(35),
    forecast5d: days5(NOW).map((d, i) => ({
      ...d,
      maxC: [36, 35, 33, 31, 30][i],
      minC: [27, 26, 24, 22, 21][i],
      humidity: [55, 60, 65, 70, 65][i],
      rainfallMm: [0, 0, 5, 15, 8][i],
      windSpeedKmh: [10, 14, 18, 22, 16][i],
    })),
  },
  Patna: {
    current: {
      city: "Patna", state: "BR", station: "VEPT",
      tempC: 36, humidity: 62, windSpeedKmh: 8, windDir: "SE",
      rainfallMm: 0, pressureHpa: 1001, visibilityKm: 3.2,
      dewPointC: 28, feelsLikeC: 43,
      condition: "Hazy", updatedAt: isoUtc(),
    },
    hourly24: hourly(36),
    forecast5d: days5(NOW).map((d, i) => ({
      ...d,
      maxC: [37, 36, 34, 32, 31][i],
      minC: [28, 27, 25, 23, 22][i],
      humidity: [62, 65, 70, 75, 68][i],
      rainfallMm: [0, 2, 8, 18, 10][i],
      windSpeedKmh: [8, 12, 16, 20, 14][i],
    })),
  },
  Chandigarh: {
    current: {
      city: "Chandigarh", state: "CH", station: "VICG",
      tempC: 33, humidity: 48, windSpeedKmh: 16, windDir: "NW",
      rainfallMm: 0, pressureHpa: 1002, visibilityKm: 5.0,
      dewPointC: 21, feelsLikeC: 37,
      condition: "Clear", updatedAt: isoUtc(),
    },
    hourly24: hourly(33),
    forecast5d: days5(NOW).map((d, i) => ({
      ...d,
      maxC: [34, 33, 31, 28, 27][i],
      minC: [23, 22, 20, 18, 17][i],
      humidity: [48, 52, 58, 65, 60][i],
      rainfallMm: [0, 0, 6, 14, 8][i],
      windSpeedKmh: [16, 18, 22, 26, 20][i],
    })),
  },
  Jaipur: {
    current: {
      city: "Jaipur", state: "RJ", station: "VIJP",
      tempC: 40, humidity: 32, windSpeedKmh: 24, windDir: "W",
      rainfallMm: 0, pressureHpa: 998, visibilityKm: 6.5,
      dewPointC: 20, feelsLikeC: 44,
      condition: "Clear", updatedAt: isoUtc(),
    },
    hourly24: hourly(40),
    forecast5d: days5(NOW).map((d, i) => ({
      ...d,
      maxC: [41, 40, 38, 36, 34][i],
      minC: [28, 27, 25, 23, 22][i],
      humidity: [32, 36, 42, 50, 46][i],
      rainfallMm: [0, 0, 2, 6, 4][i],
      windSpeedKmh: [24, 26, 28, 30, 24][i],
    })),
  },
  Kochi: {
    current: {
      city: "Kochi", state: "KL", station: "VOCI",
      tempC: 29, humidity: 85, windSpeedKmh: 26, windDir: "SW",
      rainfallMm: 42, pressureHpa: 1008, visibilityKm: 5.5,
      dewPointC: 27, feelsLikeC: 37,
      condition: "Heavy Rain", updatedAt: isoUtc(),
    },
    hourly24: hourly(29),
    forecast5d: days5(NOW).map((d, i) => ({
      ...d,
      maxC: [30, 29, 28, 28, 29][i],
      minC: [25, 25, 24, 24, 25][i],
      humidity: [85, 88, 90, 88, 82][i],
      rainfallMm: [42, 56, 38, 22, 16][i],
      windSpeedKmh: [26, 30, 28, 22, 20][i],
    })),
  },
  Guwahati: {
    current: {
      city: "Guwahati", state: "AS", station: "VEGT",
      tempC: 30, humidity: 76, windSpeedKmh: 14, windDir: "S",
      rainfallMm: 8, pressureHpa: 1005, visibilityKm: 6.0,
      dewPointC: 25, feelsLikeC: 36,
      condition: "Partly Cloudy", updatedAt: isoUtc(),
    },
    hourly24: hourly(30),
    forecast5d: days5(NOW).map((d, i) => ({
      ...d,
      maxC: [31, 30, 29, 28, 28][i],
      minC: [24, 23, 22, 21, 21][i],
      humidity: [76, 80, 82, 84, 78][i],
      rainfallMm: [8, 14, 20, 26, 12][i],
      windSpeedKmh: [14, 16, 18, 20, 14][i],
    })),
  },
};

/** Get weather for a city, falling back to Delhi if not found. */
export function getWeather(city: string): CityWeather {
  const key = Object.keys(IMD_WEATHER).find(
    k => k.toLowerCase() === city.toLowerCase()
  );
  return key ? IMD_WEATHER[key] : IMD_WEATHER.Delhi;
}

/** All city names with weather data. */
export const WEATHER_CITIES = Object.keys(IMD_WEATHER);
