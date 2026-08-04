# Backend API Usage Guide

Quick reference for using the Swachh Hawa backend APIs in your frontend components.

## 📚 Table of Contents

- [Basic Usage](#basic-usage)
- [Common Patterns](#common-patterns)
- [Frontend Integration](#frontend-integration)
- [Error Handling](#error-handling)
- [Performance Tips](#performance-tips)

---

## 🚀 Basic Usage

### Importing Functions

```typescript
// Import specific functions
import { getLiveAqi, getForecast, getIncidents } from '@/lib/api';

// Or import everything
import * as api from '@/lib/api';
```

### Calling Server Functions

Server functions are automatically typed and work seamlessly:

```typescript
// In a React component
import { getLiveAqi } from '@/lib/api';

function AqiDashboard() {
  const { data, isLoading, error } = useSuspenseQuery({
    queryKey: ['aqi', 'live'],
    queryFn: () => getLiveAqi(),
  });

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {data.data.map(city => (
        <CityCard key={city.name} city={city} />
      ))}
    </div>
  );
}
```

---

## 🎯 Common Patterns

### 1. Fetch and Display Live AQI

```typescript
import { getLiveAqi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

function LiveAqiMap() {
  const { data } = useQuery({
    queryKey: ['aqi-live'],
    queryFn: getLiveAqi,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  return (
    <Map markers={data?.data.map(city => ({
      lat: city.lat,
      lon: city.lon,
      color: getAqiColor(city.aqi),
      label: `${city.name}: ${city.aqi}`,
    }))} />
  );
}
```

### 2. Get City-Specific Data

```typescript
import { getAqiForCity, getHistoricalAqi, getForecast } from '@/lib/api';

function CityDetail({ cityName }: { cityName: string }) {
  // Current AQI
  const currentAqi = useQuery({
    queryKey: ['aqi', cityName],
    queryFn: () => getAqiForCity({ data: { city: cityName } }),
  });

  // Historical data (last 24 hours)
  const historical = useQuery({
    queryKey: ['aqi-history', cityName, 24],
    queryFn: () => getHistoricalAqi({ data: { city: cityName, hours: 24 } }),
  });

  // 7-day forecast
  const forecast = useQuery({
    queryKey: ['forecast', cityName, 168],
    queryFn: () => getForecast({ data: { city: cityName, hours: 168 } }),
  });

  return (
    <div>
      <CurrentAqi data={currentAqi.data} />
      <HistoricalChart data={historical.data?.data} />
      <ForecastChart data={forecast.data?.forecasts} />
    </div>
  );
}
```

### 3. Manage Incidents

```typescript
import { getIncidents, createIncident, updateIncidentStatus } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

function IncidentManager() {
  const queryClient = useQueryClient();

  // Fetch incidents
  const { data: incidents } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => getIncidents({ data: { status: 'Open', limit: 50 } }),
  });

  // Create incident mutation
  const createMutation = useMutation({
    mutationFn: createIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incident created successfully');
    },
  });

  // Update status mutation
  const updateMutation = useMutation({
    mutationFn: updateIncidentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });

  const handleCreateIncident = (data: IncidentFormData) => {
    createMutation.mutate({
      data: {
        city: data.city,
        state: data.state,
        incident_type: data.type,
        severity: data.severity,
        location_description: data.location,
        description: data.description,
      },
    });
  };

  const handleResolveIncident = (incidentId: string) => {
    updateMutation.mutate({
      data: {
        incidentId,
        status: 'Resolved',
      },
    });
  };

  return (
    <div>
      <IncidentForm onSubmit={handleCreateIncident} />
      <IncidentList 
        incidents={incidents?.incidents} 
        onResolve={handleResolveIncident}
      />
    </div>
  );
}
```

### 4. Real-Time Sensor Monitoring

```typescript
import { getSensors, getSensorHealth } from '@/lib/api';

function SensorDashboard() {
  // Overall health
  const health = useQuery({
    queryKey: ['sensor-health'],
    queryFn: getSensorHealth,
    refetchInterval: 30 * 1000, // Every 30 seconds
  });

  // Sensors by city
  const [selectedCity, setSelectedCity] = useState<string>('Delhi');
  const sensors = useQuery({
    queryKey: ['sensors', selectedCity],
    queryFn: () => getSensors({ data: { city: selectedCity } }),
  });

  return (
    <div>
      <HealthSummary
        total={health.data?.total}
        online={health.data?.online}
        offline={health.data?.offline}
        uptime={health.data?.uptime_percentage}
      />
      
      <CitySelector value={selectedCity} onChange={setSelectedCity} />
      
      <SensorGrid sensors={sensors.data?.sensors} />
    </div>
  );
}
```

### 5. Complaint Submission (Citizen Portal)

```typescript
import { submitComplaint } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

function CitizenComplaintForm() {
  const submitMutation = useMutation({
    mutationFn: submitComplaint,
    onSuccess: (result) => {
      if (result.ok) {
        toast.success('Complaint submitted successfully!');
        // Show tracking ID
      }
    },
  });

  const handleSubmit = (formData: ComplaintForm) => {
    submitMutation.mutate({
      data: {
        type: formData.type,
        location: formData.location,
        description: formData.description,
        city: formData.city,
        citizen: formData.name || undefined, // Optional
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={submitMutation.isPending}>
        {submitMutation.isPending ? 'Submitting...' : 'Submit Complaint'}
      </button>
    </form>
  );
}
```

---

## 🔧 Frontend Integration

### Replace Mock Data with Real API

**Before (Mock Data):**
```typescript
import { CITIES } from '@/lib/mock-data';

function CityList() {
  return (
    <ul>
      {CITIES.map(city => (
        <li key={city.name}>{city.name}: AQI {city.aqi}</li>
      ))}
    </ul>
  );
}
```

**After (Real API):**
```typescript
import { getLiveAqi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

function CityList() {
  const { data, isLoading } = useQuery({
    queryKey: ['live-aqi'],
    queryFn: getLiveAqi,
  });

  if (isLoading) return <Skeleton />;

  return (
    <ul>
      {data?.data.map(city => (
        <li key={city.name}>{city.name}: AQI {city.aqi}</li>
      ))}
    </ul>
  );
}
```

### Update Map Component

```typescript
// src/routes/index.tsx - Replace IndiaMap call

import { getLiveAqi } from '@/lib/api';

function Index() {
  const { data: aqiData } = useQuery({
    queryKey: ['aqi-live'],
    queryFn: getLiveAqi,
    refetchInterval: 5 * 60 * 1000,
  });

  return (
    <div>
      <IndiaMap 
        cities={aqiData?.data || []}
        source={aqiData?.source}
      />
    </div>
  );
}
```

### Update Incidents Page

```typescript
// src/routes/incidents.tsx

import { getIncidents } from '@/lib/api';

function IncidentsPage() {
  const [filters, setFilters] = useState({
    status: 'Open' as const,
    severity: 'all' as const,
  });

  const { data } = useQuery({
    queryKey: ['incidents', filters],
    queryFn: () => getIncidents({ data: { ...filters, limit: 100 } }),
  });

  return (
    <div>
      <IncidentFilters filters={filters} onChange={setFilters} />
      <IncidentTable incidents={data?.incidents} />
    </div>
  );
}
```

---

## ⚠️ Error Handling

### Basic Error Handling

```typescript
import { useQuery } from '@tanstack/react-query';
import { getLiveAqi } from '@/lib/api';

function Component() {
  const { data, error, isError } = useQuery({
    queryKey: ['aqi'],
    queryFn: getLiveAqi,
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load data</AlertTitle>
        <AlertDescription>
          {error.message || 'An error occurred'}
        </AlertDescription>
      </Alert>
    );
  }

  // Render component...
}
```

### Advanced Error Handling with Fallback

```typescript
import { getLiveAqi } from '@/lib/api';
import { CITIES } from '@/lib/mock-data';

function AqiDashboard() {
  const { data, error } = useQuery({
    queryKey: ['aqi'],
    queryFn: getLiveAqi,
    // Fallback to mock data on error
    placeholderData: { 
      data: CITIES.map(c => ({ ...c, source: 'mock' as const })),
      source: 'mock' as const 
    },
  });

  const showWarning = error || data?.source === 'mock';

  return (
    <div>
      {showWarning && (
        <Banner variant="warning">
          Using demo data. {error ? error.message : 'Database not configured.'}
        </Banner>
      )}
      <Map cities={data?.data} />
    </div>
  );
}
```

### Custom Error Boundary

```typescript
import { ApiError } from '@/lib/api';

class ApiErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      
      if (error instanceof ApiError) {
        return (
          <ErrorDisplay
            title="API Error"
            message={error.message}
            code={error.code}
            details={error.details}
          />
        );
      }

      return <GenericError error={error} />;
    }

    return this.props.children;
  }
}
```

---

## ⚡ Performance Tips

### 1. Use Query Caching

```typescript
// Cache for 5 minutes (data doesn't change frequently)
const { data } = useQuery({
  queryKey: ['forecasts', city],
  queryFn: () => getForecast({ data: { city, hours: 24 } }),
  staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
});
```

### 2. Prefetch Data

```typescript
import { useQueryClient } from '@tanstack/react-query';

function CityList() {
  const queryClient = useQueryClient();

  const handleCityHover = (cityName: string) => {
    // Prefetch city details on hover
    queryClient.prefetchQuery({
      queryKey: ['city-detail', cityName],
      queryFn: () => getAqiForCity({ data: { city: cityName } }),
    });
  };

  return (
    <ul>
      {cities.map(city => (
        <li 
          key={city.name}
          onMouseEnter={() => handleCityHover(city.name)}
        >
          {city.name}
        </li>
      ))}
    </ul>
  );
}
```

### 3. Paginate Large Lists

```typescript
function IncidentsList() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data } = useQuery({
    queryKey: ['incidents', page],
    queryFn: () => getIncidents({ 
      data: { 
        status: 'all',
        limit,
        offset: (page - 1) * limit 
      } 
    }),
    keepPreviousData: true, // Keep showing old data while loading new page
  });

  return (
    <>
      <IncidentTable incidents={data?.incidents} />
      <Pagination 
        currentPage={page}
        totalPages={Math.ceil((data?.total || 0) / limit)}
        onPageChange={setPage}
      />
    </>
  );
}
```

### 4. Debounce Search Queries

```typescript
import { useDebouncedValue } from '@/hooks/use-debounced';

function CitySearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const { data } = useQuery({
    queryKey: ['cities', debouncedSearch],
    queryFn: () => searchCities({ data: { query: debouncedSearch } }),
    enabled: debouncedSearch.length > 2, // Only search with 3+ characters
  });

  return (
    <SearchInput 
      value={searchTerm}
      onChange={setSearchTerm}
      results={data?.results}
    />
  );
}
```

### 5. Parallel Queries

```typescript
function CityDashboard({ cityName }: { cityName: string }) {
  // Fetch all data in parallel
  const [currentAqi, historical, forecast, sensors] = useQueries({
    queries: [
      { 
        queryKey: ['aqi', cityName],
        queryFn: () => getAqiForCity({ data: { city: cityName } })
      },
      { 
        queryKey: ['history', cityName],
        queryFn: () => getHistoricalAqi({ data: { city: cityName, hours: 24 } })
      },
      { 
        queryKey: ['forecast', cityName],
        queryFn: () => getForecast({ data: { city: cityName, hours: 168 } })
      },
      { 
        queryKey: ['sensors', cityName],
        queryFn: () => getSensors({ data: { city: cityName } })
      },
    ],
  });

  return (
    <div>
      <CurrentAqi data={currentAqi.data} isLoading={currentAqi.isLoading} />
      <HistoricalChart data={historical.data} isLoading={historical.isLoading} />
      <ForecastChart data={forecast.data} isLoading={forecast.isLoading} />
      <SensorMap data={sensors.data} isLoading={sensors.isLoading} />
    </div>
  );
}
```

---

## 🎨 UI Patterns

### Loading States

```typescript
function AqiCard({ cityName }: { cityName: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['aqi', cityName],
    queryFn: () => getAqiForCity({ data: { city: cityName } }),
  });

  if (isLoading) {
    return (
      <Card>
        <Skeleton className="h-24 w-full" />
      </Card>
    );
  }

  const category = aqiCategory(data.aqi);

  return (
    <Card style={{ borderColor: `var(--${category.token})` }}>
      <h3>{data.name}</h3>
      <div className="text-4xl font-bold" style={{ color: `var(--${category.token})` }}>
        {data.aqi}
      </div>
      <p>{category.label}</p>
    </Card>
  );
}
```

### Real-Time Updates

```typescript
function LiveAqiDisplay() {
  const { data } = useQuery({
    queryKey: ['aqi-live'],
    queryFn: getLiveAqi,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div>
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-2 w-2 rounded-full bg-green-500"
        />
        <span className="text-xs text-muted-foreground">
          Live • Updated {formatDistanceToNow(new Date())} ago
        </span>
      </div>
      
      <AqiGrid cities={data?.data} />
    </div>
  );
}
```

---

**That's it!** You now have a complete production-grade backend with comprehensive API functions. 🚀
