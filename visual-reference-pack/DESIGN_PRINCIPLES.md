# DESIGN PRINCIPLES: Spatial Digital Twin & Reality Capture Synthesis

**Pack:** Visual Reference Pack (`youcef-ach/docs_3`)  
**Scope:** Core structural design principles synthesized from 9 market leaders, tailored for the MAJARA Digital Twin Platform (`el_merk_suivi`).

---

## 1. Dark Slate Engine Aesthetic with High-Tech Luminous Accents

* **Observed in:** **Polycam** (`#0D0D0D` OLED dark) & **Cesium** (`#0B111E` space navy with `#00E5FF` electric cyan).
* **Synthesis:** 
  * 3D WebGL meshes, textured photogrammetry, point clouds, and equirectangular panoramas lose visual contrast when surrounded by bright white browser chrome.
  * Deep space slate backgrounds (`#0B111E`) paired with subtle 1px border strokes (`rgba(255, 255, 255, 0.08)`) and vibrant luminous cyan accents (`#00E5FF`) create an authentic engineering workstation atmosphere.
* **Direct Application to `el_merk_suivi`:**
  * Matches our existing Three.js engine UI (`routes/engine.css`), which already uses `.azurid-top-bar`, `.azurid-badge.cyan`, and live GPS telemetry HUDs.

---

## 2. Asymmetric 50/50 Split Hero with Framed WebGL Viewport

* **Observed in:** **DroneDeploy**, **Hexagon GeoCloud**, and **Matterport**.
* **Synthesis:**
  * Avoid generic hero photography or abstract marketing illustrations.
  * **Left Column (approx. 48%):** Industry category eyebrow badge, bold display value proposition headline, concise supporting body copy, and a dual-pill CTA button group.
  * **Right Column (approx. 52%):** A photorealistic, framed 3D application window (desktop mockup wrapper) displaying an actual textured digital twin mesh with live GPS coordinates, altitude datum indicators, and interactive orbit hints.
* **Direct Application to `el_merk_suivi`:**
  * Frame our verified `scratch/screenshots/engine_desktop.png` (or a lightweight interactive Three.js GLB viewer) showing the El Merk industrial facility with live telemetry badges (`31.9056°N, 9.1489°E`, `Datum: 99.31m ASL`).

---

## 3. Segmented Modality Tab Switching

* **Observed in:** **DroneDeploy** (`[Aerial Drone Surveys]` vs. `[Ground 360 Walkthroughs]`).
* **Synthesis:**
  * Reality capture platforms operate across distinct operational capture modalities. Forcing them into separate pages confuses prospective enterprise users.
  * Provide an interactive horizontal segmented tab selector directly on the landing page showcase. Clicking each tab dynamically transitions the preview screen, metric callouts, and feature list.
* **Direct Application to `el_merk_suivi`:**
  * Directly mirrors the two verified modalities in `project-detail.jsx`:
    1. **`Drone Photogrammetry & 3D GIS`**: Textured 3D mesh, topographic cross-section profiler, cut & fill stockpile volume calculation, and DSM/DTM elevation rasters.
    2. **`360° Industrial Virtual Tour`**: 198-scan cubemaps, raycast floor hotspots, and depth-warped virtual asset staging.

---

## 4. Spatial Dimension Pins & Live Telemetry Badges

* **Observed in:** **Hexagon GeoCloud** (`"Stage Area: 374 sq ft"`), **Matterport** (dimension lines), and **Trimble** (colored point cloud elevations).
* **Synthesis:**
  * Static screenshots look passive. Overlaying realistic 3D spatial annotation tags, measurement pins, and GPS telemetry badges proves algorithmic precision and software depth before the user signs up.
* **Direct Application to `el_merk_suivi`:**
  * Overlay real pins from our codebase onto showcase visuals:
    * *"Distance: 14.82m | Slope: 3.2°"* (from `useMeasurements.js`)
    * *"Stockpile #1: Fill 2,140 m³ | Net +1,890 m³"* (from `useVolumeCalculation.js`)
    * *"Inspection Tag #04 [CRITICAL]: Flange Seal Wear"* (from `TagPanel.jsx`)

---

## 5. Progressive 4-Stage Processing Pipeline Stepper

* **Observed in:** **Autodesk Construction Cloud** (Lifecycle Stepper) and **Bentley iTwin** (Data Ingestion Architecture).
* **Synthesis:**
  * Prospective industrial customers want to know: *How does my raw drone/camera data become an interactive digital twin?*
  * Present a structured 4-step progressive stepper illustrating the automated backend ingestion pipeline.
* **Direct Application to `el_merk_suivi`:**
  * Step 1: **Upload Multi-Format Survey Data** (Accepts OBJ, GLB, 3D Tiles, Panoramas ZIP, DSM GeoTIFFs).
  * Step 2: **Automated Vertex Welding & Draco Compression** (Reduces geometry payload by 80–90% via Google Draco).
  * Step 3: **Spatial 3D Inspection & Volumetric Analytics** (Point-to-point measurement, cross-section elevation profiling, stockpile cut/fill).
  * Step 4: **Automated PDF Survey Reporting** (Instant client-side PDF export with datum offsets and coordinates).

---

## 6. Dual-Pill CTA Architecture

* **Observed in:** **OpenSpace** (Solid primary + outline secondary with icon) and **Polycam** (High-contrast pill buttons).
* **Synthesis:**
  * Keep user choices unambiguous. Every CTA group should contain:
    * **Primary Action:** Solid, high-contrast button (`[Launch 3D Explorer →]`).
    * **Secondary Action:** Glassmorphic translucent or outline button with icon (`[Enterprise Sign In]`).
  * Full pill radius ($9999\text{px}$) signals a modern spatial web interface.

---

## 7. Mobile-First Single-Column Responsive Reflow ($390\text{px}$)

* **Observed in:** **OpenSpace**, **DroneDeploy**, and **Cesium** mobile viewports.
* **Synthesis:**
  * On mobile viewports ($< 768\text{px}$):
    * Asymmetric 50/50 hero splits must collapse cleanly into a single vertical column (Headline $ightarrow$ CTAs $ightarrow$ Framed Preview).
    * Dual CTAs expand into full-width stacked touch targets with minimum $48\text{px}$ hit areas.
    * Navigation bar collapses into a clean slide-out drawer or bottom bar, keeping the viewport unobstructed.
    * 3D viewports maintain fixed 16:9 aspect ratio boxes to prevent vertical scroll hijacking.
* **Direct Application to `el_merk_suivi`:**
  * Avoids repeating the desktop engine's mobile layout collapse defect (`scratch/screenshots/engine_mobile.png`), ensuring mobile visitors experience a responsive, pristine marketing presentation.
