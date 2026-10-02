# REFERENCE MATRIX: Comprehensive Evidentiary Catalog

**Pack:** Visual Reference Pack (`youcef-ach/docs_3`)  
**Date of Capture:** October 2–3, 2026  
**Standards:** Concrete browser-verified observation (**OBSERVED**) strictly separated from strategic takeaways (**INTERPRETED**). Zero memory extrapolation; zero fabricated metrics.

---

## 1. Matterport

* **Exact URL:** `https://matterport.com`
* **Capture Date:** October 2, 2026
* **Captured Viewports:** $1440 \times 900$ (Desktop) and $390 \times 844$ (Mobile)
* **Associated Screenshot Artifacts:**
  * `screenshots/matterport/matterport__hero__1440.png`
  * `screenshots/matterport/matterport__product-showcase__1440.png`
  * `screenshots/matterport/matterport__workflow__1440.png`
  * `screenshots/matterport/matterport__enterprise-trust__1440.png`
  * `screenshots/matterport/matterport__hero__390.png`
  * `screenshots/matterport/matterport__product-showcase__390.png`

### Observed Visual Characteristics
* **Layout & Composition:** Left-aligned content block (approx. 52% width) paired with an asymmetric right-aligned visual anchor featuring an interactive dollhouse cutaway model. Single-column stacked vertical flow on mobile.
* **Typography Hierarchy:** Clean geometric sans-serif. Display H1 estimated at $52\text{px}$ with tight line-height ($1.1$) and weight $700$. Small uppercase tracked eyebrow pill tag ("PROPERTY INTELLIGENCE"). Body copy set at $18\text{px}$ in muted slate.
* **Image / Product Relationship:** The hero image is not generic stock; it directly showcases the core dollhouse 3D view with dimensional floor indicators. The showcase section transitions to a full-width dark charcoal container (`#1A1A1A`) framing an embedded WebGL viewer with active spatial pin badges.
* **CTA Placement:** Dual CTAs in hero fold: solid high-contrast primary button ("Get started for free") paired with an inline text link + chevron ("Contact sales >"). Right navbar CTA is a compact solid black button.
* **Spacing & Density:** Very generous vertical section padding ($100\text{px} - 120\text{px}$). Content max-width constrained to approximately $1280\text{px}$.
* **Cards & Surfaces:** The workflow section uses 3 vertical progression cards with subtle off-white backgrounds (`#F8F9FA`) and $12\text{px}$ rounded corners.
* **Borders & Radius:** $6\text{px} - 8\text{px}$ border radius on action buttons; $12\text{px} - 16\text{px}$ on media cards.

### Observed Interaction & Motion Characteristics
* **Showcase Hover States:** Hovering over the dollhouse preview reveals spatial pins with animated pulse rings.
* **Mobile Header Behavior:** Fixed header with right hamburger menu. Tap triggers a full-screen vertical slide-out navigation overlay.

### Interpreted Reusable Design Principles
* **Dark Viewer Theater Transition:** Seamless visual transition from a light high-contrast reading environment to a dark full-bleed 3D canvas container creates strong focus on the digital twin.
* **Spatial Dimension Pins:** Visualizing measurements and POI annotations directly on preview graphics demonstrates real utility before the user even opens the app.

### Possible Digital Twin Application (`el_merk_suivi`)
* Can be applied directly to our 198-scan cubemap tour showcase (`IndustrialTourViewer.jsx`), framing the dollhouse cutaway and station pucks inside a dark theater container.

### Elements Explicitly NOT to Copy
* Proprietary red/coral Matterport brand accents.
* Heavy marketing copy targeting residential real estate staging.

---

## 2. OpenSpace

* **Exact URL:** `https://www.openspace.ai`
* **Capture Date:** October 3, 2026
* **Captured Viewports:** $1440 \times 900$ (Desktop) and $390 \times 844$ (Mobile)
* **Associated Screenshot Artifacts:**
  * `screenshots/openspace/openspace__hero__1440.png`
  * `screenshots/openspace/openspace__product-showcase__1440.png`
  * `screenshots/openspace/openspace__workflow__1440.png`
  * `screenshots/openspace/openspace__cards__1440.png`
  * `screenshots/openspace/openspace__hero__390.png`
  * `screenshots/openspace/openspace__product-showcase__390.png`

### Observed Visual Characteristics
* **Layout & Composition:** Centered hero hierarchy. Giant display headline positioned above a horizontal dual-pill button group. Directly followed by a full-bleed horizontal customer logo ticker.
* **Typography Hierarchy:** Heavy modern sans-serif with vibrant blue accent keywords. Display headline estimated at $58\text{px}-64\text{px}$.
* **Image / Product Relationship:** The hero backdrop uses a soft continuous ambient gradient mesh (cyan transitioning to soft green). Below the fold, product capabilities are presented in large tablet/browser mockups showing side-by-side 360° site photo vs. BIM model sync.
* **CTA Placement:** Perfectly centered dual pill buttons: Solid royal blue primary ("Request demo") + outline blue secondary with arrow icon ("Watch video →").
* **Spacing & Density:** Very open density. Generous vertical whitespace.
* **Cards & Surfaces:** Exaggerated rounded corners ($24\text{px} - 32\text{px}$ border radius) on all media cards and feature blocks. Soft drop shadows (`box-shadow: 0 20px 40px rgba(0,0,0,0.06)`).
* **Borders & Radius:** Full $9999\text{px}$ pill radius on CTAs; $28\text{px}$ on showcase containers.

### Observed Interaction & Motion Characteristics
* **Continuous Logo Marquee:** Customer logo bar scrolls horizontally with smooth CSS translation.
* **Video Play Trigger:** Secondary CTA opens a responsive modal video player with backdrop dimming.

### Interpreted Reusable Design Principles
* **Dual-Pill CTA Architecture:** The solid primary + outline secondary with arrow provides clear action priority.
* **Soft Gradient Mesh Canvas:** Ambient gradient meshes create modern depth without distracting from technical graphics.

### Possible Digital Twin Application (`el_merk_suivi`)
* Ideal for the top hero presentation and customer logo strip. The split-screen BIM vs. 360° comparison directly reflects our split timeline and inspection reprocessing capabilities.

### Elements Explicitly NOT to Copy
* OpenSpace corporate royal blue (`#0052FF`).
* Heavy usage of generic jobsite portrait photos.

---

## 3. DroneDeploy

* **Exact URL:** `https://www.dronedeploy.com`
* **Capture Date:** October 2, 2026
* **Captured Viewports:** $1440 \times 900$ (Desktop) and $390 \times 844$ (Mobile)
* **Associated Screenshot Artifacts:**
  * `screenshots/dronedeploy/dronedeploy__hero__1440.png`
  * `screenshots/dronedeploy/dronedeploy__product-showcase__1440.png`
  * `screenshots/dronedeploy/dronedeploy__workflow__1440.png`
  * `screenshots/dronedeploy/dronedeploy__hero__390.png`
  * `screenshots/dronedeploy/dronedeploy__product-showcase__390.png`

### Observed Visual Characteristics
* **Layout & Composition:** Asymmetric 50/50 horizontal split. Left side hosts product category badge, bold H1, body copy, and dual CTAs. Right side hosts an interactive video/canvas mockup showcasing aerial orthomosaics with CAD boundaries.
* **Typography Hierarchy:** Clean, highly readable geometric sans-serif. Strong contrast between pure black headings (`#111827`) and medium slate body text (`#4B5563`).
* **Image / Product Relationship:** Shows real engineering deliverables: cut/fill elevation heatmaps, stockpile boundary polygons, and drone flight paths over physical construction terrain.
* **CTA Placement:** Primary solid blue button ("Start free trial") paired with a secondary white outline button ("Request a demo").
* **Spacing & Density:** Balanced industrial density. Grid gutters set at $32\text{px}$.
* **Cards & Surfaces:** 3-column card grid with colored icon badges at top-left. Segmented horizontal pill tab bar for modality switching.
* **Borders & Radius:** Modern $6\text{px} - 8\text{px}$ border radius.

### Observed Interaction & Motion Characteristics
* **Segmented Modality Tab Switching:** Clicking between `"Aerial Drone Surveys"`, `"Ground 360 Walkthroughs"`, and `"Interior"` dynamically transitions the right-hand viewer canvas without page reload.

### Interpreted Reusable Design Principles
* **Modality Switcher Pattern:** **The single most important functional pattern for our platform.** Allows a single landing page to cleanly demonstrate both aerial drone photogrammetry and ground 360 tours without visual clutter.

### Possible Digital Twin Application (`el_merk_suivi`)
* Direct 1:1 mapping to our verified dual modalities in `project-detail.jsx`: `DRONE_SURVEY` (photogrammetry, cross-sections, cut/fill) and `VIRTUAL_TOUR` (198-scan cubemaps, depth-warped staging).

### Elements Explicitly NOT to Copy
* DroneDeploy brand blue color tokens.
* Generic marketing claims unrelated to industrial telemetry.

---

## 4. Polycam

* **Exact URL:** `https://poly.cam`
* **Capture Date:** October 2, 2026
* **Captured Viewports:** $1440 \times 900$ (Desktop) and $390 \times 844$ (Mobile)
* **Associated Screenshot Artifacts:**
  * `screenshots/polycam/polycam__hero__1440.png`
  * `screenshots/polycam/polycam__product-showcase__1440.png`
  * `screenshots/polycam/polycam__workflow__1440.png`
  * `screenshots/polycam/polycam__cards__1440.png`
  * `screenshots/polycam/polycam__hero__390.png`
  * `screenshots/polycam/polycam__product-showcase__390.png`

### Observed Visual Characteristics
* **Layout & Composition:** Centered, immersive 100% dark mode (`#0D0D0D` background). Centered headline above an embedded, interactive 3D WebGL viewport frame.
* **Header / Navigation:** Floating dark pill navigation bar (`rgba(20, 20, 20, 0.8)`, `backdrop-filter: blur(12px)`) centered at the top of the viewport.
* **Typography Hierarchy:** Minimalist stark white typography (`#FFFFFF`) with secondary text in cool muted gray (`#8E8E93`).
* **Image / Product Relationship:** An actual interactive 3D WebGL canvas embedded directly in the hero fold. Visitors can orbit, rotate, and zoom a photogrammetric 3D scan with zero friction.
* **CTA Placement:** Clean white solid pill button ("Try Web App") in header and hero.
* **Spacing & Density:** High breathing room; content centered within a tight $1100\text{px}$ reading width.
* **Cards & Surfaces:** Deep OLED dark surfaces (`#161616`) bordered by subtle 1px translucent strokes (`border: 1px solid rgba(255, 255, 255, 0.08)`).
* **Borders & Radius:** $9999\text{px}$ pill radius on nav and buttons; $20\text{px}$ on 3D canvas viewport.

### Observed Interaction & Motion Characteristics
* **Embedded 3D Interaction:** Inertial drag and orbit controls with smooth damping directly on the homepage canvas. Segmented pill tabs underneath toggle capture modes (`LiDAR`, `Gaussian Splats`, `Photogrammetry`).

### Interpreted Reusable Design Principles
* **Floating Glassmorphic Pill Header:** Delivers a modern, lightweight spatial computing feel.
* **OLED Dark Canvas with 1px Strokes:** Highlights 3D WebGL models with zero visual noise.

### Possible Digital Twin Application (`el_merk_suivi`)
* Matches our Three.js WebGL engine dark aesthetic. A floating pill navbar and embedded 3D GLB preview frame will showcase our industrial pump/tank models seamlessly.

### Elements Explicitly NOT to Copy
* Mobile consumer app store download badges (App Store / Google Play).
* Casual hobbyist capture presets.

---

## 5. Bentley iTwin Platform

* **Exact URL:** `https://www.itwinplatform.com` & `https://www.bentley.com/software/itwin-platform`
* **Capture Date:** October 2, 2026
* **Captured Viewports:** $1440 \times 900$ (Desktop) and $390 \times 844$ (Mobile)
* **Associated Screenshot Artifacts:**
  * `screenshots/bentley-itwin/bentley-itwin__hero__1440.png`
  * `screenshots/bentley-itwin/bentley-itwin__benefits__1440.png`
  * `screenshots/bentley-itwin/bentley-itwin__capabilities__1440.png`
  * `screenshots/bentley-itwin/bentley-itwin__hero__390.png`
  * `screenshots/bentley-itwin/bentley-itwin__product-showcase__390.png`

### Observed Visual Characteristics
* **Layout & Composition:** Structured, high-authority engineering layout. Deep industrial navy background (`#0A192F` / `#002D54`).
* **Typography Hierarchy:** Bold, structural headings paired with monospaced code labels and API tags. Heading text: `"Build Digital Twin Solutions on an Open Platform"`.
* **Image / Product Relationship:** Visuals feature massive infrastructure models (bridges, water plants, offshore facilities) with technical wireframes and sensor overlay diagrams.
* **CTA Placement:** Primary blue button ("Get Started") paired with developer portal link ("Explore Documentation →").
* **Spacing & Density:** Moderate-to-high density typical of enterprise developer portals.
* **Cards & Surfaces:** Multi-layer architectural diagram illustrating data ingestion (CAD, GIS, IoT, Reality Data) $ightarrow$ Cloud Ingestion $ightarrow$ APIs $ightarrow$ Web/Mobile Viewers.
* **Borders & Radius:** Conservative $4\text{px} - 6\text{px}$ radius.

### Observed Interaction & Motion Characteristics
* **Developer Code Tabs:** Interactive code block tabs displaying JavaScript/TypeScript SDK syntax alongside live render frames.

### Interpreted Reusable Design Principles
* **Layered Architectural Pipeline Diagram:** Visually explaining the ingestion and processing flow (CAD/OBJ $ightarrow$ Draco Compression $ightarrow$ MinIO S3 $ightarrow$ Three.js Viewer) establishes deep technical credibility.

### Possible Digital Twin Application (`el_merk_suivi`)
* Excellent for illustrating our automated backend ingestion pipeline (`inspections.service.ts`), proving that our platform handles automated geometry conversion and Draco compression.

### Elements Explicitly NOT to Copy
* Heavy enterprise text density with multiple competing sub-menus.
* Legacy Bentley blue corporate branding.

---

## 6. Cesium

* **Exact URL:** `https://cesium.com`
* **Capture Date:** October 2, 2026
* **Captured Viewports:** $1440 \times 900$ (Desktop) and $390 \times 844$ (Mobile)
* **Associated Screenshot Artifacts:**
  * `screenshots/cesium/cesium__hero__1440.png`
  * `screenshots/cesium/cesium__product-showcase__1440.png`
  * `screenshots/cesium/cesium__workflow__1440.png`
  * `screenshots/cesium/cesium__hero__390.png`
  * `screenshots/cesium/cesium__product-showcase__390.png`

### Observed Visual Characteristics
* **Layout & Composition:** Full-bleed dark geospatial atmosphere (`#0B111E`). Hero visual features a photorealistic 3D globe with photogrammetry city mesh and point cloud tiles.
* **Typography Hierarchy:** High-contrast white headline with electric cyan keywords (`#00E5FF`): `"The 3D Geospatial Platform for Digital Twins"`.
* **Image / Product Relationship:** Direct technical visualization of 3D data: 3D Tiles streaming, point cloud decimation, photogrammetric mesh tiling, terrain elevation shading.
* **CTA Placement:** Prominent top-right "Sign In" link and bright cyan primary button ("Try Cesium ion"). Hero CTA row features cyan button ("Get Started") + secondary outline button ("Contact Sales").
* **Spacing & Density:** Balanced geospatial grid. $80\text{px}$ section margins.
* **Cards & Surfaces:** Dark slate card containers (`#161E2E`) with subtle 1px border outlines (`#2A374A`).
* **Borders & Radius:** Consistent $8\text{px}$ border radius across buttons, cards, and input fields.

### Observed Interaction & Motion Characteristics
* **Subtle Starfield / Orbit Motion:** Background 3D globe exhibits smooth slow rotational motion.

### Interpreted Reusable Design Principles
* **Color Palette & Technical Badges:** The combination of `#0B111E` space navy, `#161E2E` card surfaces, and `#00E5FF` cyan accents matches our Three.js HUD telemetry palette perfectly.

### Possible Digital Twin Application (`el_merk_suivi`)
* Direct visual blueprint for our GIS tools section (DSM/DTM elevation shaders, 3D measurements, and GPS coordinates `31.9056°N, 9.1489°E`).

### Elements Explicitly NOT to Copy
* Global orbital-scale claims that do not apply to localized facility digital twins.

---

## 7. Hexagon GeoCloud (formerly HxDR)

* **Exact URL:** `https://geocloud.hexagon.com/`
* **Capture Date:** October 3, 2026
* **Captured Viewports:** $1440 \times 900$ (Desktop) and $390 \times 844$ (Mobile)
* **Associated Screenshot Artifacts:**
  * `screenshots/hexagon/hexagon__hero__1440.png`
  * `screenshots/hexagon/hexagon__product-showcase__1440.png`
  * `screenshots/hexagon/hexagon__workflow__1440.png`
  * `screenshots/hexagon/hexagon__hero__390.png`
  * `screenshots/hexagon/hexagon__product-showcase__390.png`

### Observed Visual Characteristics
* **Layout & Composition:** 50/50 asymmetric split. Left side hosts brand title and concise 2-sentence value proposition. Right side features an angled geometric mask revealing an interior 3D point cloud scan.
* **Typography Hierarchy:** Clean Swiss-style grotesque sans-serif with strong vertical rhythm. Uppercase tracked category headers ("OUTCOMES", "PLATFORM CAPABILITIES").
* **Image / Product Relationship:** Point cloud preview features interactive pinned dimension badges (`"Stage Area: 374 sq ft"`).
* **CTA Placement:** Lime-green pill primary button ("Contact us →") paired with a light gray secondary pill ("Login →").
* **Spacing & Density:** Clean geometric structure with strict vertical alignment.
* **Cards & Surfaces:** 3-column feature section separated by ultra-fine 1px hairline vertical dividers (no bulky card containers).
* **Borders & Radius:** Hairline 1px grid borders; selective pill radius on primary action buttons.

### Observed Interaction & Motion Characteristics
* **Quantitative Stat Callouts:** Statistical proof points (`"Up to 50% faster"`, `"75% reduction in site visits"`) paired with horizontal colored indicator bars.

### Interpreted Reusable Design Principles
* **Spatial Dimension Pins on 3D Previews:** Pinning real measurement badges over 3D preview graphics proves functional accuracy.
* **1px Hairline Column Dividers:** Replaces heavy card containers with elegant, lightweight visual boundaries.

### Possible Digital Twin Application (`el_merk_suivi`)
* Excellent for showcasing our 3D Measurement Ruler (`useMeasurements.js`) and Topographic Cross-Section Profiler (`useCrossSection.js`).

### Elements Explicitly NOT to Copy
* Hexagon corporate lime-green branding.
* Monochromatic gray surfaces that lack visual depth.

---

## 8. Trimble Reality Capture

* **Exact URL:** `https://geospatial.trimble.com/en/products/software/trimble-reality-capture`
* **Capture Date:** October 3, 2026
* **Captured Viewports:** $1440 \times 900$ (Desktop) and $390 \times 844$ (Mobile)
* **Associated Screenshot Artifacts:**
  * `screenshots/trimble/trimble__hero__1440.png`
  * `screenshots/trimble/trimble__product-showcase__1440.png`
  * `screenshots/trimble/trimble__cards__1440.png`
  * `screenshots/trimble/trimble__hero__390.png`
  * `screenshots/trimble/trimble__product-showcase__390.png`

### Observed Visual Characteristics
* **Layout & Composition:** High-contrast deep navy blue container (`#004F83` / `#0A2540`) with crisp white typography. Right side features a photorealistic tablet device mockup framing a multi-floor BIM point cloud model.
* **Typography Hierarchy:** Corporate sans-serif with high contrast between deep blue backgrounds and pure white headlines.
* **Image / Product Relationship:** Showcases real terrestrial laser scanning deliverables: colored point cloud registrations, tunnel scans, and BIM clash detections.
* **CTA Placement:** Yellow-gold primary button ("REQUEST A DEMO") in header; white button box with right arrow indicator in hero.
* **Spacing & Density:** Structured corporate pacing with alternating dark blue and light gray background bands.
* **Cards & Surfaces:** Clean white feature cards with subtle border outlines set against light gray section backgrounds.
* **Borders & Radius:** Conservative $4\text{px} - 6\text{px}$ radius.

### Observed Interaction & Motion Characteristics
* **Tablet Mockup Frame:** The tablet frame gives context to how mobile/field surveyors interact with the 3D data.

### Interpreted Reusable Design Principles
* **Framed Device Context:** Wrapping the 3D model inside a sleek tablet/desktop frame conveys software polish and real-world portability.
* **Alternating Section Contrast:** Alternating dark and light bands creates clear visual pacing across long landing pages.

### Possible Digital Twin Application (`el_merk_suivi`)
* Frame our verified `scratch/screenshots/engine_desktop.png` inside a glassmorphic desktop browser wrapper with live GPS telemetry.

### Elements Explicitly NOT to Copy
* Trimble corporate yellow/blue branding.
* Cluttered multi-tier corporate headers.

---

## 9. Autodesk Construction Cloud

* **Exact URL:** `https://construction.autodesk.com`
* **Capture Date:** October 2, 2026
* **Captured Viewports:** $1440 \times 900$ (Desktop) and $390 \times 844$ (Mobile)
* **Associated Screenshot Artifacts:**
  * `screenshots/autodesk/autodesk__hero__1440.png`
  * `screenshots/autodesk/autodesk__product-showcase__1440.png`
  * `screenshots/autodesk/autodesk__workflow__1440.png`
  * `screenshots/autodesk/autodesk__hero__390.png`
  * `screenshots/autodesk/autodesk__product-showcase__390.png`

### Observed Visual Characteristics
* **Layout & Composition:** Enterprise layout with strict $24\text{px}$ grid gutters. Left text column with heavy black display typography (`"Connect workflows, teams, and data at every stage"`).
* **Typography Hierarchy:** Clean, authoritative modern grotesque. High visual weight on display titles.
* **Image / Product Relationship:** Right column features an isometric composite showing 2D blueprints transitioning into a live 3D BIM model on an iPad.
* **CTA Placement:** Solid blue primary button ("Talk to an expert") paired with outline secondary ("Watch overview").
* **Spacing & Density:** Structured enterprise grid with strict section rhythm.
* **Cards & Surfaces:** 5-stage project lifecycle stepper: `[Design]` $\rightarrow$ `[Plan]` $\rightarrow$ `[Build]` $\rightarrow$ `[Operate]` $\rightarrow$ `[Inspect]`.
* **Borders & Radius:** Minimalist $4\text{px} - 8\text{px}$ radius.

### Observed Interaction & Motion Characteristics
* **Lifecycle Stepper Interaction:** Clicking or scrolling through lifecycle stages dynamically updates the feature cards and product deliverables below.

### Interpreted Reusable Design Principles
* **Lifecycle Stepper:** A progressive horizontal stepper breaking down a complex engineering workflow into clear sequential phases.

### Possible Digital Twin Application (`el_merk_suivi`)
* Represents our 4-stage pipeline: `01 Ingest CAD/OBJ/ZIP` $\rightarrow$ `02 Draco Geometry Compression` $\rightarrow$ `03 3D Spatial Inspection & Cut/Fill` $\rightarrow$ `04 Automated PDF Survey Report`.

### Elements Explicitly NOT to Copy
* Generic corporate construction marketing copy.
* Autodesk proprietary black/blue styling.
