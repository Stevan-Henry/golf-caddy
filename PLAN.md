# 🏌️ Cartoon Golf Caddy App — Claude Code Master Plan
> Drop this entire document into Claude Code as your starting prompt. It contains full context, architecture, file structure, implementation order, and code patterns.

---

## 🎯 PROJECT OVERVIEW

Build a **mobile-first PWA golf caddy app** with animated cartoon-style Google Maps. The map renders each golf hole as a stylized, illustrated environment that reacts to real-time weather. Users see their live GPS position, distance to pin, and a cartoon world that changes with wind, rain, sun, and storms.

**Core Experience:**
- Player opens app → selects golf course + hole number
- Map animates a cinematic flyover of the hole (cartoon style)
- Player's avatar walks the hole in real time via GPS
- Weather pulls live data and triggers matching animations (rain particles, wind flags, fog shaders)
- Distance to pin updates live as player moves
- Hole transition triggers a new flyover animation

---

## 🧱 TECH STACK

| Layer | Technology | Why |
|---|---|---|
| Framework | **React + Vite** | Fast HMR, modern bundling |
| Map | **Google Maps JS API v3** (vector map + WebGL Overlay) | WebGL hooks for 3D/animation |
| 3D Engine | **Three.js** | Render cartoon geometry on map |
| Golf Data | **GolfCourseAPI.com** (free tier) or **OpenStreetMap Overpass API** | Hole geometry, pin coords |
| Weather | **OpenWeatherMap API** (free tier) | Wind, rain, temp, conditions |
| GPS | `navigator.geolocation` watchPosition | Live player tracking |
| Styling | **Tailwind CSS** | Utility-first UI |
| State | **Zustand** | Lightweight global state |
| Animations | **Three.js** particle systems + GLSL shaders | Weather effects |
| PWA | **Vite PWA plugin** | Installable on mobile |

---

## 📁 FILE STRUCTURE

```
golf-caddy/
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── models/
│   │   ├── golfer.glb          # Cartoon golfer avatar (from Sketchfab/Mixamo)
│   │   ├── flag.glb            # Animated pin flag
│   │   └── golf_cart.glb       # Optional cart model
│   └── textures/
│       ├── fairway.png         # Cartoon grass texture
│       ├── sand.png            # Bunker texture
│       └── water_normal.png    # Water animation normal map
├── src/
│   ├── main.jsx                # App entry
│   ├── App.jsx                 # Root component + routing
│   ├── index.css               # Global styles + Tailwind
│   │
│   ├── store/
│   │   └── useGolfStore.js     # Zustand global state
│   │
│   ├── hooks/
│   │   ├── useGPS.js           # GPS watchPosition hook
│   │   ├── useWeather.js       # OpenWeatherMap polling hook
│   │   └── useGolfData.js      # Golf course + hole data fetching
│   │
│   ├── map/
│   │   ├── GolfMap.jsx         # Main map component (Google Maps init)
│   │   ├── WebGLOverlay.js     # Three.js WebGL overlay manager
│   │   ├── CartoonHole.js      # Draws hole geometry as cartoon shapes
│   │   ├── PlayerAvatar.js     # Golfer 3D model + GPS tracking
│   │   ├── PinFlag.js          # Animated flag at green
│   │   └── CameraController.js # Flyover + follow camera logic
│   │
│   ├── weather/
│   │   ├── WeatherEngine.js    # Routes weather data → animations
│   │   ├── RainSystem.js       # Three.js rain particle system
│   │   ├── WindSystem.js       # Wind arrows + grass shader
│   │   ├── FogSystem.js        # Distance fog shader
│   │   ├── SunSystem.js        # Dynamic lighting/shadows
│   │   └── StormSystem.js      # Combined rain + lightning + dark sky
│   │
│   ├── ui/
│   │   ├── HUD.jsx             # Distance to pin + hole info overlay
│   │   ├── WeatherBadge.jsx    # Current conditions display
│   │   ├── HoleSelector.jsx    # Course/hole picker
│   │   ├── FlyoverModal.jsx    # Pre-hole cinematic screen
│   │   └── ClubRecommender.jsx # Club suggestion based on distance+wind
│   │
│   └── utils/
│       ├── geo.js              # Haversine distance, coord transforms
│       ├── mapStyles.js        # Cartoon Google Maps style JSON
│       └── constants.js        # API keys, config values
│
├── .env                        # API keys (never commit)
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🔑 ENVIRONMENT VARIABLES

Create `.env` in project root:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
VITE_GOOGLE_MAPS_MAP_ID=your_map_id_here          # Must be vector map with tilt+rotation enabled
VITE_OPENWEATHER_API_KEY=your_openweather_key_here
VITE_GOLF_API_KEY=your_golfcourse_api_key_here    # From golfcourseapi.com
```

**Google Maps Setup Requirements:**
1. Enable Maps JavaScript API in Google Cloud Console
2. Create a Map ID: Maps Platform → Map Management → Create New Map ID
3. Set type: JavaScript → Vector → enable Tilt ✓ and Rotation ✓
4. Copy the Map ID into `.env`

---

## 🗺️ CARTOON MAP STYLE

This is the heart of the visual identity. In `src/utils/mapStyles.js`:

```javascript
// Cartoon / illustrated map style
// Makes the base map look like a hand-drawn course guide
export const CARTOON_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#e8f5e9" }] },
  { elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry",
    stylers: [{ color: "#81d4fa" }] },
  { featureType: "landscape.natural",
    stylers: [{ color: "#c8e6c9" }] },
  { featureType: "landscape.man_made",
    stylers: [{ color: "#dcedc8" }] },
];

// Map init options - always use these
export const MAP_OPTIONS = {
  mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
  tilt: 45,
  heading: 0,
  zoom: 17,
  disableDefaultUI: true,
  gestureHandling: "none",   // We control camera programmatically
  keyboardShortcuts: false,
  styles: CARTOON_MAP_STYLES,
};
```

---

## 🏗️ IMPLEMENTATION ORDER

Build in this exact sequence. Each phase is self-contained and testable.

### Phase 1 — Project Scaffold
```bash
npm create vite@latest golf-caddy -- --template react
cd golf-caddy
npm install three @googlemaps/js-api-loader zustand tailwindcss
npm install @googlemaps/three gltf-loader
npm install vite-plugin-pwa
npx tailwindcss init -p
```

### Phase 2 — Google Maps + Cartoon Style
- Init map in `GolfMap.jsx` using `@googlemaps/js-api-loader`
- Apply `CARTOON_MAP_STYLES`
- Confirm vector map renders with tilt

### Phase 3 — WebGL Overlay Base
- Create `WebGLOverlay.js` — instantiates `google.maps.WebGLOverlayView`
- Set up Three.js `Scene`, `PerspectiveCamera`, `WebGLRenderer`
- Render a test cube at a lat/lng to confirm overlay works

### Phase 4 — Hole Geometry (CartoonHole.js)
- Fetch hole data from GolfCourseAPI or OpenStreetMap
- Parse fairway polygon, green circle, bunker shapes, water polygons
- Extrude each shape slightly (0.5m) using `THREE.ExtrudeGeometry`
- Apply cartoon flat-shading materials:
  - Fairway: bright green `#4CAF50` with outline
  - Green: lighter `#81C784`
  - Bunker: sandy `#F5DEB3`
  - Water: animated blue shader
  - Rough: dark green `#2E7D32`

### Phase 5 — Player Avatar + GPS
- Load `golfer.glb` with `GLTFLoader`
- Hook into `navigator.geolocation.watchPosition`
- Convert GPS coords → Three.js world coords using `coordinateTransformer.fromLatLngAltitude()`
- Smoothly lerp avatar position each frame

### Phase 6 — Distance to Pin HUD
- Calculate Haversine distance from player GPS to pin coords
- Display in `HUD.jsx` as large animated number
- Update in real time (every GPS tick)
- Show in yards and meters

### Phase 7 — Camera Flyover Animation
- On hole load: animate camera from overhead → tilted approach
- Use `map.moveCamera()` in a `requestAnimationFrame` loop
- Sequence: zoom out → tilt to 60° → orbit around hole → settle behind tee box

### Phase 8 — Weather Integration
- `useWeather.js` polls OpenWeatherMap every 5 minutes
- Parse: `weather[0].main`, `wind.speed`, `wind.deg`, `visibility`, `rain`
- Pass to `WeatherEngine.js` which activates the right system

### Phase 9 — Weather Animations (see detail below)

### Phase 10 — Club Recommender
- Based on distance to pin + wind speed/direction
- Simple rule-based suggestions (can upgrade to AI later)

### Phase 11 — PWA + Polish
- Add manifest, service worker
- Test on mobile, fix touch controls

---

## ☁️ WEATHER ANIMATION SYSTEMS

### RainSystem.js
```javascript
// Three.js particle system for rain
// ~2000 particles falling at angle matching wind direction

export class RainSystem {
  constructor(scene) {
    const geometry = new THREE.BufferGeometry();
    const count = 2000;
    const positions = new Float32Array(count * 3);
    // Spread particles over 200m radius around player
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 80 + 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x99ccff, size: 0.3, transparent: true, opacity: 0.6
    });
    this.particles = new THREE.Points(geometry, material);
    scene.add(this.particles);
  }

  update(windSpeed, windDeg, deltaTime) {
    const positions = this.particles.geometry.attributes.position.array;
    const windRad = (windDeg * Math.PI) / 180;
    const drift = windSpeed * 0.01;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] -= 0.8;           // Fall down
      positions[i] += Math.sin(windRad) * drift;  // Drift with wind
      positions[i + 2] += Math.cos(windRad) * drift;
      if (positions[i + 1] < 0) positions[i + 1] = 80; // Reset to top
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
  }
}
```

### WindSystem.js
```javascript
// Animated wind direction arrows + waving grass shader
// Show 5-7 large cartoon arrows floating over fairway
// Arrow opacity/size scales with wind speed
// Grass uses a vertex shader with sine-wave displacement

// Wind arrow shader material:
const windArrowMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    windSpeed: { value: 0 },
    windDir: { value: new THREE.Vector2(1, 0) },
    color: { value: new THREE.Color(0x64B5F6) }
  },
  vertexShader: `...`, // Bobbing up/down animation
  fragmentShader: `...`, // Arrow shape with feathered edges
  transparent: true,
});
```

### FogSystem.js
```javascript
// Low visibility weather (fog/mist)
// Uses Three.js built-in fog + custom near-plane shader
// Distant parts of hole fade into white mist

scene.fog = new THREE.FogExp2(0xf0f8ff, 0.015);
// Density scales with weather visibility value from OpenWeatherMap
// visibility: 10000m = no fog, 1000m = heavy fog
const fogDensity = Math.max(0, (10000 - visibility) / 10000) * 0.04;
scene.fog.density = fogDensity;
```

### StormSystem.js
```javascript
// Combines: RainSystem (heavy) + dark sky tint + lightning flash
// Sky tint: lerp ambient light color toward dark gray
// Lightning: random interval flash of bright white ambient light
// Darken map styles dynamically by adjusting feature colors

const lightningFlash = () => {
  ambientLight.intensity = 3.0;
  setTimeout(() => ambientLight.intensity = 0.4, 80);
  setTimeout(() => ambientLight.intensity = 2.5, 120);
  setTimeout(() => ambientLight.intensity = 0.4, 200);
};
// Random lightning every 8-20 seconds during storm
setInterval(lightningFlash, 8000 + Math.random() * 12000);
```

### SunSystem.js
```javascript
// Clear weather: dynamic directional light based on time of day
// Morning: warm orange from east
// Noon: white from top
// Afternoon: warm from west
// Casts soft shadows on extruded hole geometry

const hour = new Date().getHours();
const sunAngle = ((hour - 6) / 12) * Math.PI; // 6am=0, 6pm=π
directionalLight.position.set(
  Math.cos(sunAngle) * 100,
  Math.sin(sunAngle) * 100,
  50
);
```

---

## 📐 KEY UTILITY FUNCTIONS

### src/utils/geo.js
```javascript
// Haversine formula — distance between two GPS coords in yards
export function distanceToPin(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const meters = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return {
    meters: Math.round(meters),
    yards: Math.round(meters * 1.09361),
  };
}

// Convert LatLng to Three.js world coordinates (use inside onDraw)
export function latLngToWorld(lat, lng, altitude = 0, transformer) {
  return transformer.fromLatLngAltitude({ lat, lng, altitude });
}

// Smooth interpolation for avatar movement
export function lerpPosition(current, target, alpha = 0.1) {
  return {
    lat: current.lat + (target.lat - current.lat) * alpha,
    lng: current.lng + (target.lng - current.lng) * alpha,
  };
}
```

---

## 🏪 ZUSTAND STORE

### src/store/useGolfStore.js
```javascript
import { create } from 'zustand';

export const useGolfStore = create((set, get) => ({
  // Course
  courseId: null,
  courseName: null,
  holes: [],
  currentHole: 1,

  // Hole geometry
  holeData: null,       // { fairway: [...], green: [...], bunkers: [...], water: [...], pin: {lat,lng} }

  // Player
  playerPos: null,      // { lat, lng }
  distanceToPin: null,  // { meters, yards }

  // Weather
  weather: null,        // Full OpenWeatherMap response
  activeWeatherSystem: null, // 'rain' | 'wind' | 'fog' | 'storm' | 'sun'

  // UI State
  isFlying: false,       // Flyover animation in progress
  showHUD: true,

  // Actions
  setCourse: (id, name, holes) => set({ courseId: id, courseName: name, holes }),
  setHole: (num) => set({ currentHole: num, isFlying: true }),
  setHoleData: (data) => set({ holeData: data }),
  setPlayerPos: (pos) => set({ playerPos: pos }),
  setDistanceToPin: (d) => set({ distanceToPin: d }),
  setWeather: (w) => {
    const condition = w.weather[0].main.toLowerCase();
    let system = 'sun';
    if (condition.includes('rain') || condition.includes('drizzle')) system = 'rain';
    if (condition.includes('thunderstorm')) system = 'storm';
    if (condition.includes('fog') || condition.includes('mist')) system = 'fog';
    if (w.wind.speed > 7) system = system === 'sun' ? 'wind' : system;
    set({ weather: w, activeWeatherSystem: system });
  },
  setFlyingDone: () => set({ isFlying: false }),
}));
```

---

## 🎣 HOOKS

### src/hooks/useGPS.js
```javascript
import { useEffect } from 'react';
import { useGolfStore } from '../store/useGolfStore';
import { distanceToPin } from '../utils/geo';

export function useGPS() {
  const { setPlayerPos, setDistanceToPin, holeData } = useGolfStore();

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setPlayerPos({ lat, lng });

        if (holeData?.pin) {
          const dist = distanceToPin(lat, lng, holeData.pin.lat, holeData.pin.lng);
          setDistanceToPin(dist);
        }
      },
      (err) => console.warn('GPS error:', err),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [holeData]);
}
```

### src/hooks/useWeather.js
```javascript
import { useEffect } from 'react';
import { useGolfStore } from '../store/useGolfStore';

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useWeather() {
  const { playerPos, setWeather } = useGolfStore();

  useEffect(() => {
    if (!playerPos) return;

    const fetchWeather = async () => {
      const { lat, lng } = playerPos;
      const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${key}&units=imperial`;
      const res = await fetch(url);
      const data = await res.json();
      setWeather(data);
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [playerPos?.lat, playerPos?.lng]);
}
```

---

## 🗺️ WEBGL OVERLAY CORE

### src/map/WebGLOverlay.js
```javascript
import * as THREE from 'three';

export class GolfWebGLOverlay {
  constructor(map) {
    this.map = map;
    this.overlay = new google.maps.WebGLOverlayView();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.renderer = null;
    this.systems = []; // Active weather/scene systems
    this.clock = new THREE.Clock();

    this._setupLifecycle();
    this.overlay.setMap(map);
  }

  _setupLifecycle() {
    this.overlay.onAdd = () => {
      // Ambient light — warm and cartoon-friendly
      const ambient = new THREE.AmbientLight(0xffffff, 0.8);
      this.scene.add(ambient);
      this.directional = new THREE.DirectionalLight(0xfff4e0, 1.2);
      this.directional.position.set(50, 100, 50);
      this.directional.castShadow = true;
      this.scene.add(this.directional);
    };

    this.overlay.onContextRestored = ({ gl }) => {
      this.renderer = new THREE.WebGLRenderer({
        canvas: gl.canvas,
        context: gl,
        ...gl.getContextAttributes(),
      });
      this.renderer.autoClear = false;
      this.renderer.shadowMap.enabled = true;
      this.renderer.setAnimationLoop(() => {
        this.overlay.requestRedraw();
      });
    };

    this.overlay.onDraw = ({ gl, transformer }) => {
      const delta = this.clock.getDelta();

      // Update all active systems
      this.systems.forEach(system => system.update?.(delta));

      // Sync camera with Google Maps camera
      const matrix = transformer.fromLatLngAltitude(
        this.map.getCenter(), 0
      );
      this.camera.projectionMatrix.fromArray(matrix);

      this.renderer.render(this.scene, this.camera);
      this.renderer.resetState();
    };
  }

  addSystem(system) {
    this.systems.push(system);
  }

  removeSystem(system) {
    this.systems = this.systems.filter(s => s !== system);
  }
}
```

---

## 🎨 CARTOON HOLE RENDERER

### src/map/CartoonHole.js
```javascript
import * as THREE from 'three';

// Material palette — flat cartoon shading, no metalness
const MATERIALS = {
  fairway: new THREE.MeshToonMaterial({ color: 0x4CAF50 }),
  green:   new THREE.MeshToonMaterial({ color: 0x81C784 }),
  bunker:  new THREE.MeshToonMaterial({ color: 0xF5DEB3 }),
  water:   new THREE.MeshToonMaterial({ color: 0x42A5F5, transparent: true, opacity: 0.85 }),
  rough:   new THREE.MeshToonMaterial({ color: 0x388E3C }),
  tee:     new THREE.MeshToonMaterial({ color: 0xA5D6A7 }),
  outline: new THREE.LineBasicMaterial({ color: 0x1B5E20, linewidth: 2 }),
};

export class CartoonHole {
  constructor(scene, holeData, transformer) {
    this.scene = scene;
    this.meshes = [];
    this._render(holeData, transformer);
  }

  _polygonToShape(coordinates) {
    const shape = new THREE.Shape();
    coordinates.forEach(([lng, lat], i) => {
      // Note: coords come as [lng, lat] from GeoJSON
      i === 0 ? shape.moveTo(lng * 1e5, lat * 1e5) : shape.lineTo(lng * 1e5, lat * 1e5);
    });
    return shape;
  }

  _extrudeShape(shape, material, height = 0.3) {
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    return mesh;
  }

  _render(holeData, transformer) {
    const zones = [
      { key: 'fairway', mat: MATERIALS.fairway, height: 0.15 },
      { key: 'green',   mat: MATERIALS.green,   height: 0.25 },
      { key: 'bunkers', mat: MATERIALS.bunker,  height: 0.10 },
      { key: 'water',   mat: MATERIALS.water,   height: 0.05 },
      { key: 'tee',     mat: MATERIALS.tee,     height: 0.20 },
    ];

    zones.forEach(({ key, mat, height }) => {
      const polys = holeData[key];
      if (!polys) return;
      (Array.isArray(polys[0][0]) ? polys : [polys]).forEach(poly => {
        const shape = this._polygonToShape(poly);
        const mesh = this._extrudeShape(shape, mat, height);
        this.scene.add(mesh);
        this.meshes.push(mesh);
      });
    });
  }

  dispose() {
    this.meshes.forEach(m => {
      m.geometry.dispose();
      this.scene.remove(m);
    });
    this.meshes = [];
  }
}
```

---

## 🎬 FLYOVER CAMERA SEQUENCE

### src/map/CameraController.js
```javascript
export class CameraController {
  constructor(map) {
    this.map = map;
    this.animating = false;
  }

  // Dramatic hole intro: zoom out → tilt → orbit → settle
  async flyoverHole(holeCenter, teeLat, teeLng, pinLat, pinLng, onComplete) {
    this.animating = true;
    const map = this.map;

    // Step 1: Zoom out, look straight down
    await this._animate({ tilt: 0, zoom: 15, heading: 0 }, 1200);

    // Step 2: Tilt and tighten
    await this._animate({ tilt: 55, zoom: 17, heading: 30 }, 1500);

    // Step 3: Slow orbit around the hole
    for (let h = 30; h <= 150; h += 2) {
      map.moveCamera({ heading: h });
      await this._delay(30);
    }

    // Step 4: Settle behind tee box
    const teeHeading = this._bearing(teeLat, teeLng, pinLat, pinLng);
    await this._animate({
      tilt: 50,
      heading: teeHeading,
      zoom: 17,
      center: { lat: teeLat, lng: teeLng }
    }, 1000);

    this.animating = false;
    onComplete?.();
  }

  _animate(cameraOptions, duration) {
    return new Promise(resolve => {
      const start = performance.now();
      const startState = {
        tilt: this.map.getTilt(),
        zoom: this.map.getZoom(),
        heading: this.map.getHeading(),
      };

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = this._easeInOut(progress);

        this.map.moveCamera({
          tilt: startState.tilt + (cameraOptions.tilt - startState.tilt) * eased,
          zoom: startState.zoom + (cameraOptions.zoom - startState.zoom) * eased,
          heading: startState.heading + (cameraOptions.heading - startState.heading) * eased,
          ...(cameraOptions.center && { center: cameraOptions.center }),
        });

        if (progress < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  _easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Compass bearing between two coords (degrees)
  _bearing(lat1, lng1, lat2, lng2) {
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180);
    const x =
      Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
      Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLng);
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  }
}
```

---

## 📱 HUD COMPONENT

### src/ui/HUD.jsx
```jsx
import { useGolfStore } from '../store/useGolfStore';

export function HUD() {
  const { distanceToPin, currentHole, weather, activeWeatherSystem } = useGolfStore();

  const windDir = weather ? getWindDirection(weather.wind.deg) : '';
  const windSpeed = weather ? Math.round(weather.wind.speed) : 0;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Distance to Pin — top center, large */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
        <div className="bg-white/90 backdrop-blur rounded-2xl px-6 py-3 shadow-xl border-2 border-green-400">
          <div className="text-5xl font-black text-green-700 leading-none">
            {distanceToPin?.yards ?? '--'}
          </div>
          <div className="text-sm font-bold text-green-500 uppercase tracking-widest">
            yards to pin
          </div>
          <div className="text-xs text-gray-400">{distanceToPin?.meters ?? '--'} m</div>
        </div>
      </div>

      {/* Hole number — top left */}
      <div className="absolute top-6 left-4">
        <div className="bg-green-600 text-white rounded-xl px-4 py-2 shadow-lg">
          <div className="text-xs uppercase tracking-wider opacity-80">Hole</div>
          <div className="text-3xl font-black leading-none">{currentHole}</div>
        </div>
      </div>

      {/* Weather badge — top right */}
      <div className="absolute top-6 right-4">
        <div className="bg-white/90 backdrop-blur rounded-xl px-3 py-2 shadow-lg text-center">
          <WeatherIcon condition={activeWeatherSystem} />
          <div className="text-xs font-bold text-gray-600 mt-1">
            {windSpeed} mph {windDir}
          </div>
          <div className="text-xs text-gray-400">
            {weather ? Math.round(weather.main.temp) : '--'}°F
          </div>
        </div>
      </div>

      {/* Club recommendation — bottom center */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <ClubSuggestion />
      </div>
    </div>
  );
}

function getWindDirection(degrees) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(degrees / 45) % 8];
}
```

---

## ⛳ CLUB RECOMMENDER LOGIC

### src/ui/ClubRecommender.jsx — Logic
```javascript
// Simple rule-based club suggestion
// Upgrade to AI call later if desired

export function recommendClub(yards, windSpeed, windDirection, playerFacing) {
  // Effective distance adjusted for headwind/tailwind
  const windAngle = Math.abs(playerFacing - windDirection) % 360;
  const windFactor = Math.cos((windAngle * Math.PI) / 180);
  const effectiveYards = Math.round(yards + windSpeed * windFactor * 1.5);

  const clubs = [
    { name: 'Driver',     max: 280 },
    { name: '3-Wood',     max: 240 },
    { name: '5-Wood',     max: 210 },
    { name: '4-Iron',     max: 190 },
    { name: '5-Iron',     max: 175 },
    { name: '6-Iron',     max: 160 },
    { name: '7-Iron',     max: 145 },
    { name: '8-Iron',     max: 130 },
    { name: '9-Iron',     max: 115 },
    { name: 'PW',         max: 100 },
    { name: 'Gap Wedge',  max: 85  },
    { name: 'Sand Wedge', max: 70  },
    { name: 'Lob Wedge',  max: 55  },
    { name: 'Putter',     max: 10  },
  ];

  const club = clubs.find(c => effectiveYards >= c.max - 15 && effectiveYards <= c.max + 15)
    || clubs.find(c => effectiveYards <= c.max)
    || clubs[0];

  return {
    club: club.name,
    effectiveYards,
    note: windFactor > 0.3 ? '🍃 Headwind — club up'
        : windFactor < -0.3 ? '💨 Tailwind — club down'
        : '',
  };
}
```

---

## 🌐 GOLF DATA FETCHING

### src/hooks/useGolfData.js
```javascript
// Uses golfcourseapi.com (free tier) or falls back to OpenStreetMap

export async function fetchHoleData(courseId, holeNumber) {
  // Try GolfCourseAPI first
  try {
    const res = await fetch(
      `https://api.golfcourseapi.com/v1/courses/${courseId}/holes/${holeNumber}`,
      { headers: { Authorization: `Bearer ${import.meta.env.VITE_GOLF_API_KEY}` } }
    );
    if (res.ok) return normalizeGolfAPIResponse(await res.json());
  } catch {}

  // Fallback: OpenStreetMap Overpass API
  // Query for golf features near the course center
  return fetchFromOverpass(courseId, holeNumber);
}

// Normalize different API shapes into a consistent format
function normalizeGolfAPIResponse(data) {
  return {
    fairway: data.fairway_polygon,
    green: data.green_polygon,
    bunkers: data.bunkers || [],
    water: data.water_hazards || [],
    tee: data.tee_polygon,
    pin: { lat: data.pin_lat, lng: data.pin_lng },
    par: data.par,
    handicap: data.handicap,
    distance: { yards: data.yards, meters: data.meters },
  };
}
```

---

## 📦 PACKAGE.JSON DEPENDENCIES

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "three": "^0.167.0",
    "@googlemaps/js-api-loader": "^1.16.6",
    "@googlemaps/three": "^0.0.7",
    "zustand": "^4.5.4",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.3.0",
    "vite-plugin-pwa": "^0.20.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 🚀 CLAUDE CODE EXECUTION INSTRUCTIONS

When you paste this into Claude Code, tell it:

> **"Build this golf caddy app following the plan above. Start with Phase 1-4 (scaffold + map + WebGL + hole geometry). Use the exact file structure, store shape, and class interfaces defined. For the cartoon map style, use the CARTOON_MAP_STYLES config exactly. For Three.js materials, use MeshToonMaterial throughout for the flat cartoon look. After phases 1-4 are working, continue with Phase 5-8. Ask me before Phase 9 weather systems so I can confirm my API keys are ready."**

---

## ⚠️ COMMON GOTCHAS — TELL CLAUDE CODE THESE

1. **WebGL Overlay only works with vector maps** — always pass `mapId` in map options, never use raster maps
2. **`coordinateTransformer` is only available inside `onDraw`** — don't try to use it in `onAdd`
3. **Call `renderer.resetState()` after every render** — Three.js and Google Maps share the same WebGL context; not resetting causes rendering artifacts
4. **GPS `watchPosition` drains battery** — use `maximumAge: 1000` to throttle updates
5. **Three.js coordinate scale** — Google Maps world space uses large numbers; multiply lat/lng by 1e5 or use the transformer helper
6. **Don't use `gestureHandling: 'auto'` during flyover** — it conflicts with `moveCamera`; switch it after flyover completes
7. **CORS on weather API** — OpenWeatherMap allows browser fetch directly; GolfCourseAPI may need a proxy

---

## 🎨 VISUAL STYLE GUIDE FOR CLAUDE CODE

- **Cartoon palette**: Saturated, flat colors. No gradients on 3D objects. Use `MeshToonMaterial` everywhere.
- **Outlines**: Add black outline meshes (slightly scaled up, backface culling) for cartoon cel-shading look
- **UI**: White cards with rounded corners, bold green typography, playful font (suggest `Fredoka One` from Google Fonts)
- **Shadows**: Soft, slightly offset. Enable `renderer.shadowMap.type = THREE.PCFSoftShadowMap`
- **Scale**: Everything slightly exaggerated — fatter fairways, rounder greens, puffier bunkers

---

## 🧭 ADAPTATION NOTES FOR THIS REPO

The master plan above targets **Vite + React**. Our project uses **Next.js 15 App Router + `@vis.gl/react-google-maps`**. When implementing, translate as follows:

- `import.meta.env.VITE_*` → `process.env.NEXT_PUBLIC_*`
  - `VITE_GOOGLE_MAPS_API_KEY` → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
  - `VITE_GOOGLE_MAPS_MAP_ID` → `NEXT_PUBLIC_GOOGLE_MAP_ID`
  - `VITE_OPENWEATHER_API_KEY` → `WEATHER_API_KEY` (server-only) or expose as `NEXT_PUBLIC_WEATHER_API_KEY` if called from browser
- `.jsx` → `.tsx` (repo is TypeScript)
- Path alias: `@/*` maps to `src/*`
- All client-side files must start with `"use client"`
- Instead of raw `@googlemaps/js-api-loader`, use `useMap()` from `@vis.gl/react-google-maps` to get the underlying `google.maps.Map` instance for WebGL overlay / camera work
- Existing files to respect / integrate with:
  - `src/data/highlands.ts` — course + hole data (tee + green coords)
  - `src/lib/distance.ts` — already has haversine + bearing helpers
  - `src/lib/holePositions.ts` — localStorage override of tee/green positions per hole
  - `src/components/map/HoleMap.tsx` — current Google Map component with rangefinder
  - `src/app/hole/[number]/page.tsx` — hole page with HUD
  - `src/components/ui/BottomNav.tsx` — Course / Scorecard / Settings tabs
- PWA: use Next.js `next-pwa` or similar; not `vite-plugin-pwa`

*This plan covers 100% of the architecture. Claude Code should be able to implement the full app from this document alone.*
