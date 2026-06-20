import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NODES, EDGES } from "../lib/metamodel/model";
import {
  LAYER_META, EDGE_COLORS, type Layer, type MetaNode, type MetaEdge,
} from "../lib/metamodel/schema";

export const Route = createFileRoute("/ea-metamodel")({ component: EAMetamodel });

// ── Layout constants ────────────────────────────────────────────────────────
const LAYERS_ORDER: Layer[] = [
  "motivation", "strategy", "business", "application", "data", "technology",
];
const NODE_W = 172;
const NODE_H = 42;
const LAYER_GAP = 160;
const NODE_PAD_X = 20;
const CANVAS_PAD_TOP = 60;
const CANVAS_PAD_LEFT = 60;

function buildLayout(nodes: MetaNode[]) {
  const byLayer: Record<Layer, MetaNode[]> = {
    motivation: [], strategy: [], business: [],
    application: [], data: [], technology: [],
  };
  nodes.forEach((n) => byLayer[n.layer].push(n));

  const positions: Record<string, { x: number; y: number }> = {};
  let maxWidth = 0;

  LAYERS_ORDER.forEach((layer, li) => {
    const layerNodes = byLayer[layer];
    const totalW = layerNodes.length * (NODE_W + NODE_PAD_X) - NODE_PAD_X;
    if (totalW > maxWidth) maxWidth = totalW;
    layerNodes.forEach((n, ni) => {
      positions[n.id] = {
        x: CANVAS_PAD_LEFT + ni * (NODE_W + NODE_PAD_X),
        y: CANVAS_PAD_TOP + li * LAYER_GAP,
      };
    });
  });

  return { positions, canvasW: Math.max(maxWidth + CANVAS_PAD_LEFT * 2, 1200) };
}

function cubicBezier(
  x1: number, y1: number, x2: number, y2: number,
): string {
  const dx = (x2 - x1) * 0.5;
  const dy = (y2 - y1) * 0.5;
  const cx1 = x1 + dx;
  const cy1 = y1 + dy * 0.2;
  const cx2 = x2 - dx;
  const cy2 = y2 - dy * 0.2;
  return `M${x1},${y1} C${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`;
}

// ── Component ───────────────────────────────────────────────────────────────
export default function EAMetamodel() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<Layer | "all">("all");
  const [showValidation, setShowValidation] = useState(false);
  const [traceMode, setTraceMode] = useState<"none" | "upstream" | "downstream">("none");
  const svgRef = useRef<SVGSVGElement>(null);

  const { positions, canvasW } = useMemo(() => buildLayout(NODES), []);
  const canvasH = CANVAS_PAD_TOP + LAYERS_ORDER.length * LAYER_GAP + 20;

  // Nodes connected to selected (for highlighting)
  const connectedIds = useMemo(() => {
    if (!selectedId) return new Set<string>();
    const ids = new Set<string>();
    if (traceMode === "none") {
      EDGES.forEach((e) => {
        if (e.source === selectedId) ids.add(e.target);
        if (e.target === selectedId) ids.add(e.source);
      });
    } else if (traceMode === "upstream") {
      const queue = [selectedId];
      while (queue.length) {
        const cur = queue.shift()!;
        EDGES.forEach((e) => {
          if (e.target === cur && !ids.has(e.source)) {
            ids.add(e.source);
            queue.push(e.source);
          }
        });
      }
    } else {
      const queue = [selectedId];
      while (queue.length) {
        const cur = queue.shift()!;
        EDGES.forEach((e) => {
          if (e.source === cur && !ids.has(e.target)) {
            ids.add(e.target);
            queue.push(e.target);
          }
        });
      }
    }
    return ids;
  }, [selectedId, traceMode]);

  // Validation: nodes with no connections
  const orphanIds = useMemo(() => {
    if (!showValidation) return new Set<string>();
    const connected = new Set<string>();
    EDGES.forEach((e) => { connected.add(e.source); connected.add(e.target); });
    return new Set(NODES.filter((n) => !connected.has(n.id)).map((n) => n.id));
  }, [showValidation]);

  // Visible nodes after layer filter
  const visibleNodes = useMemo(
    () => NODES.filter((n) => activeLayer === "all" || n.layer === activeLayer),
    [activeLayer],
  );
  const visibleIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);
  const visibleEdges = useMemo(
    () => EDGES.filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target)),
    [visibleIds],
  );

  const selectedNode = useMemo(() => NODES.find((n) => n.id === selectedId) ?? null, [selectedId]);
  const relatedEdges = useMemo(() => {
    if (!selectedId) return [];
    return EDGES.filter((e) => e.source === selectedId || e.target === selectedId);
  }, [selectedId]);

  const handleNodeClick = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      {/* ── Header ── */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              EA Content Metamodel
              <span className="ml-2 rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-primary mono">
                TOGAF
              </span>
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {NODES.length} elements · {EDGES.length} typed relationships · click a node to trace
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Trace buttons */}
            {["none", "upstream", "downstream"].map((m) => (
              <button
                key={m}
                onClick={() => setTraceMode(m as any)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                  traceMode === m
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {m === "none" ? "Neighbours" : m === "upstream" ? "↑ Upstream" : "↓ Downstream"}
              </button>
            ))}
            {/* Validation toggle */}
            <button
              onClick={() => setShowValidation((v) => !v)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                showValidation
                  ? "border-rose-500 bg-rose-500/15 text-rose-400"
                  : "border-border text-muted-foreground hover:border-rose-500/50"
              }`}
            >
              {showValidation ? "✓ Validation ON" : "Validate Gaps"}
            </button>
          </div>
        </div>

        {/* Layer filter */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveLayer("all")}
            className={`rounded-full border px-3 py-0.5 text-xs transition ${
              activeLayer === "all"
                ? "border-foreground/40 bg-foreground/10 text-foreground"
                : "border-border text-muted-foreground hover:border-foreground/30"
            }`}
          >
            All Layers
          </button>
          {LAYERS_ORDER.map((layer) => {
            const meta = LAYER_META[layer];
            const active = activeLayer === layer;
            return (
              <button
                key={layer}
                onClick={() => setActiveLayer(active ? "all" : layer)}
                style={{ borderColor: active ? meta.color : undefined, color: active ? meta.color : undefined }}
                className={`rounded-full border px-3 py-0.5 text-xs transition ${
                  active ? "opacity-100" : "border-border text-muted-foreground hover:opacity-80"
                }`}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── SVG Canvas ── */}
        <div className="flex-1 overflow-auto">
          <svg
            ref={svgRef}
            width={canvasW}
            height={canvasH}
            className="select-none"
            onClick={() => { if (!selectedId) return; }}
          >
            <defs>
              {Object.entries(EDGE_COLORS).map(([type, color]) => (
                <marker
                  key={type}
                  id={`arrow-${type}`}
                  markerWidth="14"
                  markerHeight="14"
                  refX="12"
                  refY="5"
                  orient="auto"
                  markerUnits="userSpaceOnUse"
                >
                  <path d="M0,0 L0,10 L14,5 z" fill={color} />
                </marker>
              ))}
              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="redglow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.9  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="colored" />
                <feMerge><feMergeNode in="colored" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* ── Layer band labels ── */}
            {LAYERS_ORDER.map((layer, li) => {
              const meta = LAYER_META[layer];
              const y = CANVAS_PAD_TOP + li * LAYER_GAP;
              return (
                <g key={layer}>
                  <rect
                    x={0} y={y - 8} width={canvasW} height={NODE_H + 16}
                    fill={meta.color} fillOpacity={0.04}
                    stroke={meta.color} strokeOpacity={0.1} strokeWidth={1}
                  />
                  <text
                    x={canvasW - 8} y={y + NODE_H / 2 + 5}
                    textAnchor="end"
                    fontSize={9}
                    fontFamily="monospace"
                    fontWeight="600"
                    fill={meta.color}
                    opacity={0.5}
                    letterSpacing={2}
                  >
                    {meta.label.toUpperCase()}
                  </text>
                </g>
              );
            })}

            {/* ── Edges ── */}
            {visibleEdges.map((edge) => {
              const sp = positions[edge.source];
              const tp = positions[edge.target];
              if (!sp || !tp) return null;

              const x1 = sp.x + NODE_W / 2;
              const y1 = sp.y + NODE_H;
              const x2 = tp.x + NODE_W / 2;
              const y2 = tp.y;

              const isSelected = selectedId && (edge.source === selectedId || edge.target === selectedId);
              const isTrace =
                selectedId &&
                traceMode !== "none" &&
                ((traceMode === "downstream" && edge.source === selectedId) ||
                  (traceMode === "upstream" && edge.target === selectedId));
              const color = EDGE_COLORS[edge.type];
              const opacity = selectedId
                ? isSelected || isTrace
                  ? 1.0
                  : 0.12
                : 0.5;
              const strokeW = isSelected || isTrace ? 2.0 : 1.2;

              return (
                <g key={edge.id}>
                  <motion.path
                    d={cubicBezier(x1, y1, x2, y2)}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeW}
                    strokeOpacity={opacity}
                    markerEnd={`url(#arrow-${edge.type})`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                  />
                  {/* Animated data packet on selected edges */}
                  {(isSelected || isTrace) && (
                    <motion.circle
                      r={3}
                      fill={color}
                      filter="url(#glow)"
                      initial={{ offsetDistance: "0%" } as any}
                      animate={{ offsetDistance: "100%" } as any}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                      style={{
                        offsetPath: `path("${cubicBezier(x1, y1, x2, y2)}")`,
                      } as any}
                    />
                  )}
                </g>
              );
            })}

            {/* ── Nodes ── */}
            {visibleNodes.map((node) => {
              const pos = positions[node.id];
              if (!pos) return null;
              const meta = LAYER_META[node.layer];
              const isSelected = selectedId === node.id;
              const isConnected = connectedIds.has(node.id);
              const isOrphan = orphanIds.has(node.id);
              const dimmed = selectedId && !isSelected && !isConnected;

              return (
                <motion.g
                  key={node.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: dimmed ? 0.15 : 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleNodeClick(node.id)}
                >
                  {/* Orphan glow */}
                  {isOrphan && (
                    <motion.rect
                      x={pos.x - 4} y={pos.y - 4}
                      width={NODE_W + 8} height={NODE_H + 8}
                      rx={10} ry={10}
                      fill="none"
                      stroke="#f87171"
                      strokeWidth={2}
                      filter="url(#redglow)"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  )}
                  {/* Node box */}
                  <rect
                    x={pos.x} y={pos.y}
                    width={NODE_W} height={NODE_H}
                    rx={7} ry={7}
                    fill={meta.color}
                    fillOpacity={isSelected ? 0.22 : isConnected ? 0.14 : 0.08}
                    stroke={meta.color}
                    strokeWidth={isSelected ? 2 : 1}
                    strokeOpacity={isSelected ? 1 : isConnected ? 0.7 : 0.35}
                  />
                  {/* Node type tag */}
                  <text
                    x={pos.x + 8} y={pos.y + 12}
                    fontSize={7.5}
                    fontFamily="monospace"
                    fill={meta.color}
                    opacity={0.7}
                    fontWeight="600"
                    letterSpacing={0.5}
                  >
                    {node.type.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                  </text>
                  {/* Node ID badge */}
                  <text
                    x={pos.x + NODE_W - 8} y={pos.y + 12}
                    fontSize={7.5}
                    fontFamily="monospace"
                    fill={meta.color}
                    opacity={0.5}
                    textAnchor="end"
                  >
                    {node.id}
                  </text>
                  {/* Node label */}
                  <text
                    x={pos.x + NODE_W / 2} y={pos.y + 28}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={isSelected ? "700" : "500"}
                    fill={isSelected ? meta.color : "var(--foreground)"}
                    fontFamily="system-ui, sans-serif"
                  >
                    {node.label.length > 22 ? node.label.slice(0, 21) + "…" : node.label}
                  </text>
                  {/* Selection indicator dot */}
                  {isSelected && (
                    <circle cx={pos.x + 8} cy={pos.y + 28} r={3} fill={meta.color} />
                  )}
                </motion.g>
              );
            })}
          </svg>
        </div>

        {/* ── Detail Panel ── */}
        <AnimatePresence>
          {selectedNode && (
            <motion.aside
              key="panel"
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="w-80 shrink-0 border-l border-border overflow-y-auto bg-card"
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <span
                      className="inline-block rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider mono mb-1"
                      style={{
                        background: `${LAYER_META[selectedNode.layer].color}20`,
                        color: LAYER_META[selectedNode.layer].color,
                      }}
                    >
                      {LAYER_META[selectedNode.layer].label.toUpperCase()} · {selectedNode.id}
                    </span>
                    <div className="text-sm font-semibold">{selectedNode.label}</div>
                    <div className="text-[10px] text-muted-foreground mono mt-0.5">
                      {selectedNode.type}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="text-muted-foreground hover:text-foreground text-lg leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* Description */}
                {selectedNode.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 border-b border-border pb-4">
                    {selectedNode.description}
                  </p>
                )}

                {/* Relationships */}
                <div className="space-y-3">
                  {/* Outgoing */}
                  {relatedEdges.filter((e) => e.source === selectedId).length > 0 && (
                    <div>
                      <div className="text-[9px] font-bold tracking-widest text-muted-foreground mono uppercase mb-2">
                        Outgoing ({relatedEdges.filter((e) => e.source === selectedId).length})
                      </div>
                      <div className="space-y-1.5">
                        {relatedEdges
                          .filter((e) => e.source === selectedId)
                          .map((e) => {
                            const target = NODES.find((n) => n.id === e.target);
                            if (!target) return null;
                            return (
                              <button
                                key={e.id}
                                onClick={() => setSelectedId(e.target)}
                                className="w-full text-left rounded-md border border-border p-2 hover:border-primary/40 transition group"
                              >
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ background: EDGE_COLORS[e.type] }}
                                  />
                                  <span className="text-[9px] mono font-semibold" style={{ color: EDGE_COLORS[e.type] }}>
                                    {e.type}
                                  </span>
                                </div>
                                <div className="text-xs text-foreground group-hover:text-primary truncate">
                                  → {target.label}
                                </div>
                                <div className="text-[9px] text-muted-foreground mono">
                                  {LAYER_META[target.layer].label} · {target.type}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Incoming */}
                  {relatedEdges.filter((e) => e.target === selectedId).length > 0 && (
                    <div>
                      <div className="text-[9px] font-bold tracking-widest text-muted-foreground mono uppercase mb-2">
                        Incoming ({relatedEdges.filter((e) => e.target === selectedId).length})
                      </div>
                      <div className="space-y-1.5">
                        {relatedEdges
                          .filter((e) => e.target === selectedId)
                          .map((e) => {
                            const source = NODES.find((n) => n.id === e.source);
                            if (!source) return null;
                            return (
                              <button
                                key={e.id}
                                onClick={() => setSelectedId(e.source)}
                                className="w-full text-left rounded-md border border-border p-2 hover:border-primary/40 transition group"
                              >
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ background: EDGE_COLORS[e.type] }}
                                  />
                                  <span className="text-[9px] mono font-semibold" style={{ color: EDGE_COLORS[e.type] }}>
                                    {e.type}
                                  </span>
                                </div>
                                <div className="text-xs text-foreground group-hover:text-primary truncate">
                                  ← {source.label}
                                </div>
                                <div className="text-[9px] text-muted-foreground mono">
                                  {LAYER_META[source.layer].label} · {source.type}
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="mt-6 border-t border-border pt-4">
                  <div className="text-[9px] font-bold tracking-widest text-muted-foreground mono uppercase mb-2">
                    Relationship Types
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {(Object.entries(EDGE_COLORS) as [string, string][]).slice(0, 8).map(([type, color]) => (
                      <div key={type} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                        <span className="text-[9px] mono text-muted-foreground truncate">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ── Stats Bar ── */}
      <div className="border-t border-border px-6 py-2 flex items-center gap-6 text-[10px] mono text-muted-foreground">
        {LAYERS_ORDER.map((layer) => {
          const meta = LAYER_META[layer];
          const count = NODES.filter((n) => n.layer === layer).length;
          return (
            <span key={layer} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
              {meta.label}: <span className="text-foreground">{count}</span>
            </span>
          );
        })}
        <span className="ml-auto">
          Edges: <span className="text-foreground">{EDGES.length}</span>
        </span>
        {showValidation && orphanIds.size > 0 && (
          <span className="text-rose-400">
            ⚠ {orphanIds.size} orphan{orphanIds.size !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
