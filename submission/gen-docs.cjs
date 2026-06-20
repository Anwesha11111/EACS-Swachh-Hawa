/* Generates two deliverables for The Open Group INITIATE EA Competition 2026:
   1) Swachh-Hawa_Executive-Summary.docx  (one page)
   2) Swachh-Hawa_Detailed-Project-Report.docx (full template)
*/
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType, ShadingType,
  TableOfContents, PageBreak, ImageRun, Header, Footer, PageNumber, VerticalAlign,
} = require("docx");

const OUT = __dirname;
const IMG = path.join(__dirname, "..", "docs", "system-architecture.png");

// ---- palette / helpers ----------------------------------------------------
const NAVY = "0B2C4D", TEAL = "00667E", SLATE = "334155", LIGHT = "EAF2F6", GREY = "F3F5F7";
const border = (c = "CBD5E1") => ({ style: BorderStyle.SINGLE, size: 1, color: c });
const cellBorders = { top: border(), bottom: border(), left: border(), right: border() };
const M = { top: 80, bottom: 80, left: 120, right: 120 };

function H(text, level) { return new Paragraph({ heading: level, children: [new TextRun(text)] }); }
function P(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 120, line: 276 },
    alignment: opts.align,
    children: [new TextRun({ text, bold: opts.bold, italics: opts.italics, color: opts.color, size: opts.size })],
  });
}
function bullet(text, ref = "bul") {
  return new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60, line: 270 },
    children: [new TextRun(text)] });
}
function rt(runs, opts = {}) { return new Paragraph({ spacing: { after: opts.after ?? 120, line: 276 }, children: runs }); }

// header cell / body cell
function hc(text, w) {
  return new TableCell({ borders: cellBorders, width: { size: w, type: WidthType.DXA }, margins: M,
    shading: { fill: TEAL, type: ShadingType.CLEAR },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 18 })] })] });
}
function bc(text, w, opts = {}) {
  return new TableCell({ borders: cellBorders, width: { size: w, type: WidthType.DXA }, margins: M,
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children: [new TextRun({ text, size: 18, bold: opts.bold, color: opts.color })] })] });
}
function table(widths, headers, rows, totalW) {
  const headRow = new TableRow({ tableHeader: true, children: headers.map((h, i) => hc(h, widths[i])) });
  const bodyRows = rows.map((r, ri) => new TableRow({ children: r.map((c, i) =>
    bc(typeof c === "object" ? c.t : c, widths[i],
       { bold: typeof c === "object" ? c.bold : false, color: typeof c === "object" ? c.color : undefined,
         fill: ri % 2 ? "F7FAFB" : undefined })) }));
  return new Table({ width: { size: totalW, type: WidthType.DXA }, columnWidths: widths, rows: [headRow, ...bodyRows] });
}

const numbering = {
  config: [
    { reference: "bul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 460, hanging: 260 } } } }] },
    { reference: "num", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 460, hanging: 260 } } } }] },
  ],
};

const styles = {
  default: { document: { run: { font: "Calibri", size: 21, color: "1F2937" } } },
  paragraphStyles: [
    { id: "Title", name: "Title", basedOn: "Normal", next: "Normal",
      run: { size: 40, bold: true, color: NAVY, font: "Calibri" }, paragraph: { spacing: { after: 80 } } },
    { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 28, bold: true, color: TEAL, font: "Calibri" },
      paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 0,
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 4 } } } },
    { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 23, bold: true, color: NAVY, font: "Calibri" },
      paragraph: { spacing: { before: 180, after: 80 }, outlineLevel: 1 } },
    { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { size: 21, bold: true, color: SLATE, font: "Calibri" },
      paragraph: { spacing: { before: 120, after: 60 }, outlineLevel: 2 } },
  ],
};

const PAGE = { size: { width: 12240, height: 15840 }, margin: { top: 1180, right: 1180, bottom: 1180, left: 1180 } };
const CW = 12240 - 1180 - 1180; // 9880 content width

function footer(label) {
  return new Footer({ children: [ new Paragraph({
    tabStops: [{ type: "right", position: 9880 }],
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1", space: 6 } },
    children: [
      new TextRun({ text: label, size: 16, color: "64748B" }),
      new TextRun({ text: "\t", size: 16 }),
      new TextRun({ text: "Page ", size: 16, color: "64748B" }),
      new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "64748B" }),
      new TextRun({ text: " of ", size: 16, color: "64748B" }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "64748B" }),
    ] }) ] });
}

// ============================================================================
// 1) EXECUTIVE SUMMARY  (one page)
// ============================================================================
function execSummary() {
  const kpis = [
    ["7-tier", "hybrid edge–cloud reference architecture"],
    ["R² 0.93", "AQI forecast accuracy (MAE 11.8 µg/m³)"],
    ["58 ms", "end-to-end telemetry latency (p50)"],
    ["16 ADRs", "governing decisions, fully traceable"],
  ];
  const kpiTable = new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [2470,2470,2470,2470],
    rows: [ new TableRow({ children: kpis.map(([v,l]) => new TableCell({
      borders: cellBorders, width: { size: 2470, type: WidthType.DXA }, margins: { top:100,bottom:100,left:120,right:120 },
      shading: { fill: LIGHT, type: ShadingType.CLEAR },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:30}, children:[new TextRun({ text:v, bold:true, size:30, color:TEAL })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children:[new TextRun({ text:l, size:15, color:SLATE })] }),
      ] })) }) ] });

  const children = [
    new Paragraph({ style: "Title", children: [new TextRun("Swachh Hawa")] }),
    new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "A National Clean-Air Intelligence Platform — Enterprise Architecture for India’s Air-Quality Governance Ecosystem", size: 22, bold: true, color: SLATE })] }),
    new Paragraph({ spacing: { after: 140 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 4 } },
      children: [new TextRun({ text: "Executive Summary  ·  The Open Group INITIATE EA Competition for Students 2026", size: 17, italics: true, color: "64748B" })] }),

    new Paragraph({ spacing:{after:60}, children:[new TextRun({ text:"Overview", bold:true, color:TEAL, size:22 })] }),
    P("India operates the world’s largest clean-air mandate (the National Clean Air Programme) on a monitoring base that is sparse, manual, and fragmented across the Central Pollution Control Board (CPCB), State Pollution Control Boards, and Urban Local Bodies. Swachh Hawa is an enterprise-architecture blueprint and working reference platform that unifies sensing, forecasting, data trust, and citizen transparency into a single, governed, hybrid edge–cloud system aligned to TOGAF ADM and the DPDP Act 2023.", { after: 100 }),

    new Paragraph({ spacing:{after:60}, children:[new TextRun({ text:"Key Problem & Proposed Solution", bold:true, color:TEAL, size:22 })] }),
    P("Air-quality data today is too sparse to act on locally, too slow to support preventive action, and too easily disputed to anchor enforcement. Swachh Hawa closes these gaps with low-cost edge sensor nodes on a self-healing LoRa mesh, near-data ML inference (LightGBM + LSTM ensemble) for multi-horizon forecasting, a tamper-evident SHA-256 hash-chained trust ledger for defensible provenance, and a governed API layer that serves the public, regulators, and researchers — the last via ε-differential-privacy open data.", { after: 100 }),

    kpiTable,
    new Paragraph({ spacing: { after: 80 }, children: [] }),

    new Paragraph({ spacing:{after:60}, children:[new TextRun({ text:"Summary of Key Findings", bold:true, color:TEAL, size:22 })] }),
    bullet("A capability-driven target architecture (6 domains, 18 L1 / 54 L2 capabilities) lets the ecosystem modernise incrementally without a disruptive “big-bang” migration."),
    bullet("Moving inference to the edge with a 72-hour offline buffer makes the network resilient to connectivity loss — essential for tier-2/3 cities and rural air-sheds."),
    bullet("A hash-chained provenance ledger delivers blockchain-grade tamper-evidence at a fraction of the cost and energy, making regulatory action legally defensible."),

    new Paragraph({ spacing:{before:80,after:60}, children:[new TextRun({ text:"Business Impact", bold:true, color:TEAL, size:22 })] }),
    P("Swachh Hawa shifts air-quality governance from reactive reporting to preventive, evidence-based action: earlier and better-targeted Graded Response Action Plan (GRAP) interventions, denser and cheaper spatial coverage, defensible enforcement, and a transparent public record that builds citizen trust — all delivered on an open, standards-based architecture that scales nationally.", { after: 0 }),
  ];

  return new Document({ styles, numbering, sections: [{ properties: { page: PAGE },
    footers: { default: footer("Swachh Hawa · Executive Summary") }, children }] });
}

// ============================================================================
// 2) DETAILED PROJECT REPORT (template-faithful)
// ============================================================================
function detailedReport() {
  const imgBuf = fs.readFileSync(IMG);
  const children = [];

  // ---- Cover ----
  children.push(
    new Paragraph({ spacing: { before: 1600, after: 0 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "SWACHH HAWA", bold: true, size: 64, color: NAVY })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
      children: [new TextRun({ text: "A National Clean-Air Intelligence Platform", size: 30, color: TEAL, bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 },
      children: [new TextRun({ text: "Enterprise Architecture for India’s Air-Quality Governance Ecosystem", size: 22, italics: true, color: SLATE })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
      children: [new TextRun({ text: "Detailed Project Report", size: 26, bold: true, color: "64748B" })] }),
  );
  const cover = [
    ["Project Title", "Swachh Hawa — National Clean-Air Intelligence Platform"],
    ["Team Name", "〈your team name〉"],
    ["Course & Institution", "〈course〉, 〈institution〉"],
    ["Mentor", "〈mentor name〉"],
    ["Competition", "The Open Group INITIATE EA Competition for Students 2026"],
    ["Submission Date", "June 2026"],
  ];
  children.push(new Table({ width: { size: 7200, type: WidthType.DXA }, columnWidths: [2600, 4600],
    alignment: AlignmentType.CENTER,
    rows: cover.map(([k, v], i) => new TableRow({ children: [
      bc(k, 2600, { bold: true, fill: LIGHT }), bc(v, 4600, { fill: i % 2 ? "F7FAFB" : "FFFFFF" }) ] })) }));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ---- TOC ----
  children.push(H("Table of Contents", HeadingLevel.HEADING_1));
  children.push(new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ---- Executive Summary ----
  children.push(H("Executive Summary", HeadingLevel.HEADING_1));
  children.push(H("Overview of the Project", HeadingLevel.HEADING_2));
  children.push(P("Swachh Hawa (“Clean Air”) is an enterprise-architecture blueprint and working reference platform for modernising India’s air-quality monitoring and governance ecosystem. It unifies field sensing, near-data machine-learning forecasting, tamper-evident data provenance, and multi-channel citizen and regulator services into a single governed, hybrid edge–cloud system. The architecture is developed using TOGAF® ADM, modelled in ArchiMate® (capability levels L0–L2), and is compliant-by-design with India’s Digital Personal Data Protection (DPDP) Act 2023."));
  children.push(H("Key Problem and Proposed Solution", HeadingLevel.HEADING_2));
  children.push(P("The data underpinning India’s National Clean Air Programme (NCAP) is too sparse to support local action, too slow to enable prevention, and too easily disputed to anchor enforcement. Swachh Hawa addresses this with low-cost edge sensor nodes on a self-healing LoRa mesh, edge ML inference for multi-horizon AQI forecasting, a SHA-256 hash-chained trust ledger for defensible provenance, and a governed API gateway serving public, governmental, and research consumers."));
  children.push(H("Summary of Key Findings", HeadingLevel.HEADING_2));
  children.push(bullet("A capability-led target architecture enables incremental modernisation across a federated, multi-agency ecosystem without a disruptive migration."));
  children.push(bullet("Edge inference with a 72-hour offline buffer delivers resilience against the connectivity gaps typical of tier-2/3 cities and rural air-sheds."));
  children.push(bullet("A hash-chained provenance ledger provides blockchain-grade tamper-evidence at materially lower cost and energy than a distributed-ledger alternative."));
  children.push(H("Business Impact", HeadingLevel.HEADING_2));
  children.push(P("Swachh Hawa shifts governance from reactive reporting to preventive, evidence-based action — earlier and better-targeted GRAP interventions, denser and cheaper spatial coverage, legally defensible enforcement, and a transparent public record that strengthens citizen trust."));

  // ---- Introduction ----
  children.push(H("Introduction", HeadingLevel.HEADING_1));
  children.push(H("Background", HeadingLevel.HEADING_2));
  children.push(P("India hosts a majority of the world’s most polluted cities, and ambient air pollution is among its leading public-health risks. The National Clean Air Programme (NCAP) targets substantial reductions in particulate concentrations across 130+ non-attainment cities. Delivery depends on the Central Pollution Control Board (CPCB), State Pollution Control Boards (SPCBs), and Urban Local Bodies (ULBs), supported by the Continuous Ambient Air Quality Monitoring Stations (CAAQMS) network. The reference-grade station network, however, is expensive and spatially sparse relative to the population and geography it must serve."));
  children.push(H("Project Objectives and Goal", HeadingLevel.HEADING_2));
  children.push(bullet("Define a target-state enterprise architecture that unifies sensing, forecasting, data trust, and citizen engagement across the air-quality ecosystem.", "num"));
  children.push(bullet("Increase spatial and temporal density of trustworthy air-quality data at a fraction of reference-station cost.", "num"));
  children.push(bullet("Enable preventive, forecast-driven action (e.g., GRAP) rather than reactive reporting.", "num"));
  children.push(bullet("Establish tamper-evident provenance so that data can anchor enforcement and withstand legal challenge.", "num"));
  children.push(bullet("Deliver transparent, privacy-respecting access for citizens, regulators, and researchers.", "num"));
  children.push(H("Scope of the Project", HeadingLevel.HEADING_2));
  children.push(P("In scope: the end-to-end logical and physical architecture across seven tiers — field sensing, mesh backhaul, edge compute, stream ingestion, cloud processing (trust, ML, storage), API delivery, and consumer applications — together with the supporting capability, data, integration, security, and governance architectures. Out of scope: detailed hardware bill-of-materials, procurement, and full production implementation; the project delivers an architecture, a working front-end reference, and a synthetic-data demonstration rather than a deployed national system."));
  children.push(H("Research Methodology", HeadingLevel.HEADING_2));
  children.push(P("The project follows the TOGAF® Architecture Development Method (ADM). Current-state and stakeholder analysis informed an Architecture Vision; Business, Data, Application, and Technology architectures were then developed and modelled in ArchiMate across capability levels L0–L2. Key decisions are captured as Architecture Decision Records (ADRs, 16 in total). Security and privacy were assessed using STRIDE threat modelling and a Data Protection Impact Assessment (DPIA) aligned to the DPDP Act 2023."));

  // ---- Problem Statement ----
  children.push(H("Problem Statement", HeadingLevel.HEADING_1));
  children.push(H("Description of the Problem", HeadingLevel.HEADING_2));
  children.push(P("Air-quality decision-making in India is constrained by three compounding data deficiencies: (1) sparsity — reference-grade stations are too few and too costly to capture neighbourhood-level variation; (2) latency — reporting is largely retrospective, preventing pre-emptive action; and (3) trust — data lineage is weak, so readings can be disputed when used for enforcement."));
  children.push(H("Importance of Solving This Problem", HeadingLevel.HEADING_2));
  children.push(P("Better-resolved, faster, and trustworthy data translates directly into public-health benefit: earlier health advisories, more precise and timely emergency measures, fairer enforcement against polluters, and an evidence base for policy. It also underpins citizen trust and India’s NCAP commitments."));
  children.push(H("Stakeholders Involved or Affected", HeadingLevel.HEADING_2));
  children.push(table([2300, 4380, 3200],
    ["Stakeholder", "Role / Interest", "Primary Need"],
    [
      ["CPCB", "National regulator & data custodian", "Authoritative, comparable national data"],
      ["State PCBs", "State-level monitoring & enforcement", "Actionable local forecasts & evidence"],
      ["Urban Local Bodies", "City operations (GRAP execution)", "Neighbourhood-level, real-time signals"],
      ["Citizens", "Affected public", "Trusted alerts & transparent information"],
      ["Researchers / Academia", "Analysis & policy modelling", "Open, privacy-safe datasets"],
      ["Platform Operations", "Run & evolve the platform", "Observability, reliability, security"],
    ], CW));
  children.push(H("Current Challenges with the Existing Enterprise Architecture", HeadingLevel.HEADING_2));
  children.push(bullet("Siloed systems and inconsistent data formats across CPCB, SPCBs, and ULBs impede a single, comparable view."));
  children.push(bullet("Manual and reference-only sensing limits spatial density and timeliness."));
  children.push(bullet("No tamper-evident lineage, weakening the evidentiary value of readings."));
  children.push(bullet("Reactive analytics with little or no operational forecasting capability."));
  children.push(bullet("Limited citizen-facing transparency and weak feedback/complaint loops."));

  // ---- Current State Analysis ----
  children.push(H("Current State Analysis", HeadingLevel.HEADING_1));
  children.push(H("Description of the Current EA in the Organization", HeadingLevel.HEADING_2));
  children.push(P("The present ecosystem is a federation of independently procured monitoring stations and agency portals. Data flows are predominantly batch and document-oriented (periodic uploads, PDFs, spreadsheets). Integration between agencies is point-to-point or manual, there is no shared streaming backbone, and analytical capability is concentrated in retrospective reporting rather than forecasting or simulation."));
  children.push(H("Identified Gaps or Issues in the Existing Architecture", HeadingLevel.HEADING_2));
  children.push(table([3000, 3440, 3440],
    ["Domain", "Current State", "Gap"],
    [
      ["Business / Capability", "Reactive reporting", "No forecasting, simulation, or GRAP decision support"],
      ["Data", "Siloed, inconsistent formats", "No common model, lineage, or retention governance"],
      ["Application / Integration", "Point-to-point, batch", "No event backbone or standard APIs"],
      ["Technology", "Reference stations only", "No edge tier; poor spatial density & resilience"],
      ["Security / Privacy", "Perimeter-oriented", "No zero-trust, weak provenance, partial DPDP readiness"],
    ], CW));
  children.push(H("Stakeholder Needs and Expectations", HeadingLevel.HEADING_2));
  children.push(P("Across stakeholders the consistent expectations are: trustworthy and comparable data; timely, local, and predictive signals; defensible evidence for enforcement; transparent public access; and strict protection of any personal data, consistent with the DPDP Act 2023."));
  children.push(H("Impact Assessment", HeadingLevel.HEADING_2));
  children.push(P("Left unaddressed, the gaps perpetuate avoidable health and economic costs, undermine enforcement, and erode public confidence. The change is high-value but must be incremental and federated — agencies cannot pause operations for a wholesale replacement, which directly shapes the chosen capability-led, coexistence-friendly approach."));

  // ---- Solution / Approach ----
  children.push(H("Solution / Approach", HeadingLevel.HEADING_1));
  children.push(H("Proposed EA Framework or Approach to Address the Problem", HeadingLevel.HEADING_2));
  children.push(P("The target architecture is developed with TOGAF® ADM and modelled in ArchiMate®. It is organised around six enterprise capability domains (18 L1 and 54 L2 capabilities) and realised as a seven-tier hybrid edge–cloud platform. An operating model with a RACI across CPCB, SPCBs, ULBs, Platform Operations, a Data Governance Council, and a Standards & Review Board governs how the capabilities are run and evolved. Sixteen ADRs document the major decisions and their trade-offs."));
  children.push(H("Future State Architecture Design (with Diagrams or Models)", HeadingLevel.HEADING_2));
  children.push(P("The reference architecture spans seven tiers — Field Sensing → Mesh Backhaul → Edge Compute → Ingestion → Cloud Processing (Trust · ML · Storage) → Delivery → Consumers — with two cross-cutting concerns (Zero-Trust Security and Data Governance / DPDP) spanning every tier:", { after: 80 }));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
    children: [new ImageRun({ type: "png", data: imgBuf, transformation: { width: 640, height: 343 },
      altText: { title: "Swachh Hawa System Architecture", name: "architecture", description: "Seven-tier hybrid edge-cloud reference architecture" } })] }));
  children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 140 },
    children: [new TextRun({ text: "Figure 1 — Swachh Hawa seven-tier hybrid edge–cloud reference architecture.", italics: true, size: 16, color: "64748B" })] }));
  children.push(H("Tools, Technologies, or Methodologies to be Used", HeadingLevel.HEADING_2));
  children.push(table([2600, 3200, 4080],
    ["Layer", "Technology", "Role"],
    [
      ["Field sensing", "Optical PM2.5/PM10, electrochemical gas array (NO₂/SO₂/O₃/CO)", "Low-cost distributed measurement"],
      ["Backhaul", "LoRa mesh (AES-128), self-healing", "Long-range, low-power transport"],
      ["Edge compute", "Jetson / Raspberry Pi 5, 72-hour buffer", "Near-data inference & resilience"],
      ["Ingestion", "Apache Kafka (8 topics, ~380 msg/s)", "Scalable event backbone"],
      ["ML", "LightGBM + LSTM ensemble, SHAP", "Multi-horizon forecasting & explainability"],
      ["Trust", "SHA-256 hash-chained Merkle ledger", "Tamper-evident provenance"],
      ["Storage", "TimescaleDB (time-series, ~4.8 TB)", "Governed historical store"],
      ["Delivery", "API Gateway — REST / GraphQL / WebSocket", "Governed, multi-channel access"],
      ["Methodology", "TOGAF ADM, ArchiMate, STRIDE, DPIA, ADRs", "Architecture rigour & traceability"],
    ], CW));
  children.push(H("Rationale Behind the Chosen Approach", HeadingLevel.HEADING_2));
  children.push(P("A capability-led, coexistence-friendly design lets the federated ecosystem modernise incrementally. Edge inference is chosen over cloud-only processing for resilience and latency. A hash-chained ledger is chosen over a public or permissioned blockchain (ADR-005): it delivers the required tamper-evidence with far lower cost, energy, and operational complexity, since a trusted custodian (CPCB) already exists and full decentralisation is unnecessary."));
  children.push(H("How the Solution Will Address the Identified Gaps", HeadingLevel.HEADING_2));
  children.push(table([3300, 3290, 3290],
    ["Gap", "Mechanism", "Outcome"],
    [
      ["Sparsity", "Low-cost edge nodes on LoRa mesh", "Higher spatial density at lower cost"],
      ["Latency", "Edge inference + streaming + forecasting", "Predictive, real-time signals"],
      ["Trust", "Hash-chained provenance ledger", "Defensible, tamper-evident data"],
      ["Silos", "Kafka backbone + standard APIs", "Unified, comparable data flows"],
      ["Privacy", "DPDP-aligned governance + ε-DP", "Compliant, privacy-safe sharing"],
    ], CW));
  children.push(H("Cost-Benefit Analysis", HeadingLevel.HEADING_2));
  children.push(P("Costs are dominated by edge-node deployment, connectivity, and platform operations; these are an order of magnitude lower per measurement point than reference stations, enabling far denser coverage for a comparable budget. Benefits — earlier and better-targeted interventions, reduced health and economic burden, defensible enforcement, and reusable open data — accrue across agencies and the public. Open-source components and commodity edge hardware further reduce total cost of ownership."));
  children.push(H("Scalability and Flexibility", HeadingLevel.HEADING_2));
  children.push(P("The event-driven backbone and stateless services scale horizontally; new sensor types, cities, or consumer applications are added without re-architecting. Edge autonomy means coverage can expand into low-connectivity regions. Standard APIs and a published data model keep the platform extensible and vendor-neutral."));

  // ---- Implementation Plan ----
  children.push(H("Implementation Plan", HeadingLevel.HEADING_1));
  children.push(H("Steps to Implement the Proposed Solution", HeadingLevel.HEADING_2));
  children.push(bullet("Phase 1 — Foundation: governance, data model, trust ledger, and Kafka backbone; pilot edge cluster in one city.", "num"));
  children.push(bullet("Phase 2 — Intelligence: ML forecasting, explainability, and public dashboard; onboard a state PCB.", "num"));
  children.push(bullet("Phase 3 — Scale: multi-city rollout, GRAP decision support, research API with ε-differential privacy.", "num"));
  children.push(bullet("Phase 4 — Optimise: digital-twin and policy-simulation capabilities; continuous model and capability improvement.", "num"));
  children.push(H("Timeline and Key Milestones", HeadingLevel.HEADING_2));
  children.push(table([2200, 3600, 4080],
    ["Phase", "Milestone", "Indicative Window"],
    [
      ["Phase 1", "Backbone + trust ledger + city pilot live", "Months 0–4"],
      ["Phase 2", "Forecasting + public dashboard live", "Months 4–8"],
      ["Phase 3", "Multi-city + research API live", "Months 8–14"],
      ["Phase 4", "Digital twin + policy simulator", "Months 14–20"],
    ], CW));
  children.push(H("Resources Required (People, Tools, Budget)", HeadingLevel.HEADING_2));
  children.push(bullet("People: enterprise & solution architects, data/ML engineers, platform/SRE, security & privacy lead, field-ops team, agency liaisons."));
  children.push(bullet("Tools: edge hardware (Jetson/RPi5), LoRa gateways, Kafka, TimescaleDB, ML stack, observability/SIEM, CI/CD."));
  children.push(bullet("Budget: weighted toward edge deployment and operations; reduced by open-source software and commodity hardware."));
  children.push(H("Potential Risks and Mitigation Strategies", HeadingLevel.HEADING_2));
  children.push(table([3300, 3290, 3290],
    ["Risk", "Impact", "Mitigation"],
    [
      ["Low-cost sensor drift", "Data quality", "Co-location calibration vs. reference stations; QA pipeline"],
      ["Connectivity loss", "Data gaps", "72-hour edge buffer; store-and-forward"],
      ["Inter-agency adoption", "Stalled rollout", "Capability-led coexistence; RACI; phased onboarding"],
      ["Privacy / DPDP breach", "Legal & trust", "DPIA, consent ledger, ε-DP, zero-trust controls"],
      ["Model degradation", "Poor forecasts", "MLflow versioning, monitoring, scheduled retraining"],
    ], CW));

  // ---- Outcome ----
  children.push(H("Outcome", HeadingLevel.HEADING_1));
  children.push(H("Anticipated Outcomes of the Proposed Architecture-Based Solutions", HeadingLevel.HEADING_2));
  children.push(bullet("Denser, trustworthy air-quality coverage with real-time and forecast signals."));
  children.push(bullet("Preventive GRAP action and earlier public-health advisories."));
  children.push(bullet("Legally defensible enforcement backed by tamper-evident provenance."));
  children.push(bullet("Open, privacy-safe data accelerating research and policy."));
  children.push(H("Hypothetical Results If the Solution Were Implemented", HeadingLevel.HEADING_2));
  children.push(P("In the reference demonstration, the forecasting ensemble achieves MAE 11.8 µg/m³, RMSE 16.4, and R² 0.93 with quantile-regression confidence bands, while end-to-end telemetry latency is ~58 ms (p50) across a 46-node edge deployment moving ~1.2 TB/day. These figures are illustrative of the architecture’s intended performance envelope rather than production measurements."));
  children.push(H("Challenges (Hypothetical) During Implementation", HeadingLevel.HEADING_2));
  children.push(P("Likely challenges include large-scale sensor calibration and QA, securing sustained inter-agency commitment, field logistics for installation and maintenance, and maintaining forecast accuracy across diverse air-sheds and seasons (e.g., crop-burning and winter inversion events)."));
  children.push(H("Post-Implementation Monitoring and Evaluation", HeadingLevel.HEADING_2));
  children.push(P("The platform is evaluated on data-quality KPIs (coverage, uptime, calibration drift), model KPIs (MAE/RMSE/R², drift), operational KPIs (latency, throughput, availability), and governance KPIs (DPDP compliance, audit completeness). Observability, SIEM, and MLflow provide continuous monitoring, with a Standards & Review Board owning periodic architecture reviews."));

  // ---- Conclusion ----
  children.push(H("Conclusion", HeadingLevel.HEADING_1));
  children.push(H("Summary of the Problem and Proposed Solution", HeadingLevel.HEADING_2));
  children.push(P("India’s clean-air mission is constrained by data that is sparse, slow, and disputable. Swachh Hawa’s capability-led, hybrid edge–cloud enterprise architecture resolves these constraints with affordable edge sensing, predictive ML, tamper-evident provenance, and governed, privacy-respecting access."));
  children.push(H("Key Findings and Insights", HeadingLevel.HEADING_2));
  children.push(bullet("Architecture, not just technology, is the lever: a capability-led, federated design is what makes incremental modernisation feasible."));
  children.push(bullet("Edge autonomy and pragmatic trust (hash-chaining over blockchain) deliver the needed properties at sustainable cost."));
  children.push(bullet("Embedding DPDP and zero-trust as cross-cutting concerns makes compliance and security structural rather than bolted-on."));
  children.push(H("Recommendations for Future EA Improvements", HeadingLevel.HEADING_2));
  children.push(bullet("Advance from forecasting to a full digital twin and policy-simulation capability for scenario planning."));
  children.push(bullet("Adopt formal data-product thinking and a federated data-mesh model as agency maturity grows."));
  children.push(bullet("Integrate satellite and meteorological feeds to enrich models and extend coverage."));
  children.push(bullet("Pursue ISO 27001 / 27701-aligned certification of the platform operating model."));

  // ---- References ----
  children.push(H("References", HeadingLevel.HEADING_1));
  children.push(bullet("The Open Group. TOGAF® Standard, 10th Edition.", "num"));
  children.push(bullet("The Open Group. ArchiMate® 3.2 Specification.", "num"));
  children.push(bullet("Government of India. National Clean Air Programme (NCAP), MoEFCC.", "num"));
  children.push(bullet("Central Pollution Control Board (CPCB) — National Air Quality Index methodology.", "num"));
  children.push(bullet("Government of India. Digital Personal Data Protection (DPDP) Act, 2023.", "num"));
  children.push(bullet("Microsoft. STRIDE threat-modelling methodology.", "num"));
  children.push(bullet("Ke et al. “LightGBM: A Highly Efficient Gradient Boosting Decision Tree.” NeurIPS 2017.", "num"));
  children.push(bullet("Lundberg & Lee. “A Unified Approach to Interpreting Model Predictions (SHAP).” NeurIPS 2017.", "num"));

  // ---- Appendices ----
  children.push(H("Appendices", HeadingLevel.HEADING_1));
  children.push(H("Appendix A — Enterprise Capability Domains", HeadingLevel.HEADING_2));
  children.push(P("Six L0 domains decomposed into 18 L1 and 54 L2 capabilities: Sensing & Acquisition; Data Management & Trust; Intelligence & Forecasting; Engagement & Transparency; Governance, Risk & Compliance; and Platform & Operations."));
  children.push(H("Appendix B — Architecture Decision Records (selected)", HeadingLevel.HEADING_2));
  children.push(table([1500, 4400, 3980],
    ["ADR", "Decision", "Rationale (summary)"],
    [
      ["ADR-001", "Capability-based architecture", "Enables federated, incremental modernisation"],
      ["ADR-002", "Federated operating model + RACI", "Clear accountability across agencies"],
      ["ADR-003", "Common data model + retention tiers", "Comparability and DPDP-aligned governance"],
      ["ADR-004", "Kafka event backbone + standard APIs", "Decoupled, scalable integration"],
      ["ADR-005", "Hash-chained ledger over blockchain", "Tamper-evidence at lower cost/energy"],
      ["ADR-006", "Zero-trust + DPIA cross-cutting", "Structural security & privacy"],
    ], CW));
  children.push(H("Appendix C — Reference Front-End", HeadingLevel.HEADING_2));
  children.push(P("A working React/TanStack front-end demonstrates the architecture through dashboards for live AQI, forecasting, explainable AI, policy simulation, a digital twin, and the seven Enterprise Architecture views (overview, capability model, operating model, data, integration, ledger, and security/DPIA), plus the live system-architecture diagram reproduced in Figure 1. All data shown is synthetic for demonstration."));

  return new Document({ styles, numbering, features: { updateFields: true }, sections: [{ properties: { page: PAGE },
    footers: { default: footer("Swachh Hawa · Detailed Project Report") }, children }] });
}

// ---- write both ----
(async () => {
  const a = await Packer.toBuffer(execSummary());
  fs.writeFileSync(path.join(OUT, "Swachh-Hawa_Executive-Summary.docx"), a);
  console.log("wrote Executive Summary:", a.length, "bytes");
  const b = await Packer.toBuffer(detailedReport());
  fs.writeFileSync(path.join(OUT, "Swachh-Hawa_Detailed-Project-Report.docx"), b);
  console.log("wrote Detailed Report:", b.length, "bytes");
})();
