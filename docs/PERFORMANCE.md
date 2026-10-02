# MAJARA Platform Performance Charter & Runtime Architecture

This document establishes the authoritative performance architecture, device tier specifications, resource budgets, and plugin performance contracts for the MAJARA Frontend Platform across Web, Desktop Kiosk, and Mobile WebView containers.

---

## 1. Architectural Philosophy: Engineering Discipline over Blanket Guarantees

> [!IMPORTANT]
> **Authoritative Invariant**:
> The platform is architected, constrained, and instrumented to achieve smooth performance within explicit budgets across supported device tiers.
> The platform NEVER claims an unqualified "guarantee of 60 FPS across all devices." Performance is an emergent engineering property of the workload, device hardware, OS WebView runtime, network quality, and active plugins.

```text
Supported Device Tiers
         ↓
Platform Performance Budgets
         ↓
Automated CI Regression Gates & Profiling
         ↓
Smooth, Predictable Runtime Experience
```

---

## 2. Supported Device Tiers & Runtime Characteristics

| Tier | Environment | Runtime Engine | Constraints & Strategy |
| :--- | :--- | :--- | :--- |
| **Tier 1: Desktop Web & Kiosks** | Chrome, Edge, Safari, Firefox (Desktop) + Tauri Desktop | V8 / JavaScriptCore / SpiderMonkey + WebKit/Blink WebView + Rust Core Process | Full capability. Heavy disk, cryptographic, or network compute offloaded to Tauri Rust process or Web Workers. |
| **Tier 2: Mobile Web & Containers** | iOS Safari, Android Chrome, Tauri Mobile | iOS WebKit / Android Chromium System WebView | **No React Native primitives.** WebView-based rendering requires shallow DOM depth, compositor-only animations (`transform`, `opacity`), zero layout thrashing, and list virtualization on collections $> 50$ items. |
| **Tier 3: Offline Physical Observatories** | Edge Kiosks (Raspberry Pi 5 / Minisforum) | Lightweight Tauri Webview + SQLite | Strict memory bounding, hardware acceleration verification, local time-key offline queueing. |

---

## 3. The 14 Platform Performance Principles

1. **Core-First Startup**: The core application shell and navigation boot immediately with zero reliance on plugins or packs.
2. **Lazy Plugin Hydration**: Plugins must never be eagerly bundled into the initial payload. Dynamic `import()` on demand is mandatory.
3. **Route-Level Code Splitting**: All major pages (`Discover`, `Compass`, `Map`, `Quests`, `Profile`) load as isolated ESM chunks.
4. **Zero Eager Initialization**: Plugins initialize only when their domain route, bundle, or active star lens is selected.
5. **Typed & Bounded RPC**: Communication across sandboxes, workers, or edge processes is asynchronously bounded and rate-limited.
6. **Resource Quotas for Sandboxed Plugins**: T2 sandboxed execution realms have strict watchdog timeouts and memory ceilings.
7. **Virtualization on Demand**: Large item feeds ($> 50$ items) utilize windowed virtualization; small feeds remain simple.
8. **Compositor-Only Animations**: Hot-path UI animations animate GPU-backed `transform` and `opacity` exclusively.
9. **Asset & Vector Optimization**: All cyberpunk plates, brackets, and avatars use vector SVGs with clean paths or optimized WebP.
10. **Stable UI Composition (Zero CLS)**: Dynamic slots reserve dimensions or use stable layouts so delayed plugin loads do not shift layout.
11. **Mandatory Lifecycle Cleanup**: Every plugin `dispose()` releases 100% of event listeners, slot registrations, and timers.
12. **Real-Device Profiling**: Benchmarks and verification are conducted against real midrange Android devices representative of the Algerian youth ecosystem.
13. **Plugin Performance Telemetry**: Plugin initialization duration and slot render timings are instrumentable without profiling overhead.
14. **Regression Budgets in CI**: Automated test runners and production bundle size checks fail pull requests that breach budgets.

---

## 4. Platform Performance Budgets & Release Gates

| Metric | Target Budget | Warning Threshold | Hard CI Failure |
| :--- | :--- | :--- | :--- |
| **Initial Core JS Bundle (gzip)** | $< 180\text{ kB}$ | $\ge 200\text{ kB}$ | $> 250\text{ kB}$ |
| **Initial CSS Bundle (gzip)** | $< 25\text{ kB}$ | $\ge 35\text{ kB}$ | $> 50\text{ kB}$ |
| **Largest Contentful Paint (LCP)** | $< 2.0\text{ s}$ (4G) | $\ge 2.5\text{ s}$ | $> 3.5\text{ s}$ |
| **Interaction to Next Paint (INP)** | $< 150\text{ ms}$ | $\ge 200\text{ ms}$ | $> 300\text{ ms}$ |
| **Cumulative Layout Shift (CLS)** | $< 0.05$ | $\ge 0.10$ | $> 0.25$ |
| **Plugin Initialization Timeout** | $\le 50\text{ ms}$ | $> 50\text{ ms}$ | $\ge 100\text{ ms}$ (auto-eject to `DEGRADED`) |
| **Plugin Memory Footprint** | $< 5\text{ MB}$ / plugin | $\ge 8\text{ MB}$ | $> 15\text{ MB}$ |

---

## 5. Plugin Performance Contract (T1 & T2)

Every plugin contributed to MAJARA is evaluated as an untrusted consumer of host CPU, memory, and DOM resources:

```text
Plugin Performance Contract

Initial JS Payload:     0 kB on app boot (strictly lazy-loaded)
Initialization Budget:  <= 50 ms wall clock
Hot-Path CSS:           Zero runtime CSS-in-JS injection; static Vanilla Extract only
DOM Tree:               Shallow depth; clean semantic elements
RPC Calls:              Rate-limited; asynchronous Promise-based
Memory Cleanup:         Mandatory unregisterAll() on dispose()
```

### The Hybrid Extensible Anchor Performance Advantage
By using the **Hybrid Extensible Anchor Pattern** on pages like Discover:
1. Core renders baseline navigation (`-----FEED-----`, `----TOPICS----`, `-FOLLOWINGS-`) with zero delay.
2. If `official.star-forge` takes 80ms to load its bundle over a slow mobile network, the page is already interactive and usable.
3. The plugin contribution mounts seamlessly into `discover.tabs` without blocking initial interaction or triggering layout shifts.
