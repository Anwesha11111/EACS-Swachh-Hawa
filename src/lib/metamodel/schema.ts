export type Layer =
  | "motivation"
  | "strategy"
  | "business"
  | "application"
  | "data"
  | "technology";

export type NodeType =
  // Motivation
  | "Driver" | "Goal" | "Objective" | "Principle"
  // Strategy
  | "Capability" | "ValueStream" | "CourseOfAction"
  // Business
  | "BusinessActor" | "BusinessProcess" | "BusinessFunction" | "BusinessService"
  // Application
  | "ApplicationComponent" | "ApplicationService"
  // Data
  | "DataEntity" | "DataService"
  // Technology
  | "TechnologyService" | "TechnologyComponent";

export type EdgeType =
  | "realizes"          // motivation → lower layers
  | "isRealizedBy"      // lower layers → motivation
  | "triggeredBy"       // event causality
  | "triggers"          // event causality
  | "uses"              // depends on / consumes
  | "serves"            // provides value to
  | "operationalizes"   // process makes capability concrete
  | "delivers"          // service/component delivers data/event
  | "stores"            // component persists data entity
  | "composedOf"        // structural containment
  | "runsOn"            // application → technology
  | "enables";          // technology enables application

export const LAYER_META: Record<Layer, { label: string; color: string; order: number }> = {
  motivation:   { label: "Motivation",   color: "#a78bfa", order: 0 },
  strategy:     { label: "Strategy",     color: "#60a5fa", order: 1 },
  business:     { label: "Business",     color: "#34d399", order: 2 },
  application:  { label: "Application",  color: "#22d3ee", order: 3 },
  data:         { label: "Data",         color: "#fbbf24", order: 4 },
  technology:   { label: "Technology",   color: "#f87171", order: 5 },
};

export const EDGE_COLORS: Record<EdgeType, string> = {
  realizes:       "#a78bfa",
  isRealizedBy:   "#a78bfa",
  triggeredBy:    "#fbbf24",
  triggers:       "#fbbf24",
  uses:           "#60a5fa",
  serves:         "#34d399",
  operationalizes:"#22d3ee",
  delivers:       "#f87171",
  stores:         "#fb923c",
  composedOf:     "#94a3b8",
  runsOn:         "#f87171",
  enables:        "#f87171",
};

export interface MetaNode {
  id: string;
  label: string;
  type: NodeType;
  layer: Layer;
  description?: string;
}

export interface MetaEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
}
