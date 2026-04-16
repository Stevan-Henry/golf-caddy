"use client";

import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useGolfStore } from "@/store/useGolfStore";

/**
 * Three.js WebGL overlay attached to the Google Map.
 * Renders a cartoon 3D golfer avatar at the player's live GPS position.
 *
 * Tries to load `/models/golfer.glb` first; if not present, falls back to a
 * stylized primitive avatar built from Three.js shapes (works with zero assets).
 *
 * Requires a vector Map ID — WebGLOverlayView only works on vector maps.
 */
export default function ThreeOverlay() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // ── Scene / lights ────────────────────────────────────────────
    const scene = new THREE.Scene();
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.4);
    sun.position.set(30, 40, 60);
    scene.add(sun);

    // Avatar group holds whatever we render (primitive or GLB).
    const avatar = buildPrimitiveGolfer();
    // Axis flip — Three.js default is Y-up; Google Maps transformer gives Z-up.
    // Put the model inside a wrapper we can rotate; leaves the model's own
    // coordinate system intact.
    const wrapper = new THREE.Group();
    wrapper.rotation.x = Math.PI / 2;
    wrapper.add(avatar);
    scene.add(wrapper);

    // Optionally upgrade to a real GLB if present. Silent fail if not found.
    const loader = new GLTFLoader();
    loader.load(
      "/models/golfer.glb",
      (gltf) => {
        // Normalize scale so model is ~2m tall regardless of source
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const size = box.getSize(new THREE.Vector3());
        const targetHeight = 2.2;
        const scale = size.y > 0 ? targetHeight / size.y : 1;
        gltf.scene.scale.setScalar(scale);
        // Re-center on origin with feet on the ground
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.x -= center.x * scale;
        gltf.scene.position.z -= center.z * scale;
        gltf.scene.position.y -= box.min.y * scale;

        // Swap: remove primitive, add GLB
        wrapper.remove(avatar);
        wrapper.add(gltf.scene);
      },
      undefined,
      () => {
        // 404 or parse error — stay with primitive. No console noise.
      }
    );

    // ── Overlay ───────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera();
    let renderer: THREE.WebGLRenderer | null = null;
    const clock = new THREE.Clock();

    const overlay = new google.maps.WebGLOverlayView();

    overlay.onAdd = () => {
      /* nothing — scene already built */
    };

    overlay.onContextRestored = ({ gl }) => {
      renderer = new THREE.WebGLRenderer({
        canvas: gl.canvas as HTMLCanvasElement,
        context: gl,
        ...gl.getContextAttributes(),
      });
      renderer.autoClear = false;

      // Drive continuous redraw so our bob/spin animation runs.
      renderer.setAnimationLoop(() => overlay.requestRedraw());
    };

    overlay.onDraw = ({ transformer }) => {
      if (!renderer) return;
      const pos = useGolfStore.getState().playerPos;
      if (!pos) return;

      const t = clock.getElapsedTime();
      // Gentle bob + slow spin for personality
      wrapper.position.set(0, 0, Math.sin(t * 1.8) * 0.08);
      wrapper.rotation.z = (t * 0.4) % (Math.PI * 2);

      const matrix = transformer.fromLatLngAltitude({
        lat: pos.lat,
        lng: pos.lng,
        altitude: 0,
      });
      camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);

      renderer.render(scene, camera);
      renderer.resetState();
    };

    overlay.onContextLost = () => {
      renderer?.dispose();
      renderer = null;
    };

    overlay.onRemove = () => {
      renderer?.setAnimationLoop(null);
      renderer?.dispose();
      renderer = null;
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        const mat = (obj as THREE.Mesh).material;
        if (mat) {
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
    };

    overlay.setMap(map);

    return () => {
      overlay.setMap(null);
    };
  }, [map]);

  return null;
}

// ─────────────────────────────────────────────────────────────────
// Primitive golfer built from basic Three.js shapes.
// Stylized cartoon proportions: big head, chunky body, visible club.
// Units are meters (matches the Maps WebGL overlay coordinate space).
// Model is built Y-up; wrapper flips it to Z-up.
// ─────────────────────────────────────────────────────────────────
function buildPrimitiveGolfer(): THREE.Group {
  const group = new THREE.Group();

  const toon = (color: number) => new THREE.MeshToonMaterial({ color });

  // Body — red polo
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.9, 6, 12), toon(0xef4444));
  body.position.y = 0.95;
  group.add(body);

  // Pants — dark
  const pants = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.4, 0.5, 14),
    toon(0x1f2937)
  );
  pants.position.y = 0.25;
  group.add(pants);

  // Shoes
  const shoeMat = toon(0xffffff);
  const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.15, 0.5), shoeMat);
  shoeL.position.set(-0.22, 0.08, 0.08);
  group.add(shoeL);
  const shoeR = shoeL.clone();
  shoeR.position.x = 0.22;
  group.add(shoeR);

  // Head — skin tone sphere
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 16), toon(0xf5d5a8));
  head.position.y = 1.9;
  group.add(head);

  // Hat brim
  const brim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.44, 0.44, 0.05, 18),
    toon(0x0369a1)
  );
  brim.position.y = 2.13;
  brim.position.z = 0.08;
  group.add(brim);

  // Hat crown
  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.34, 0.22, 18),
    toon(0x0369a1)
  );
  crown.position.y = 2.25;
  group.add(crown);

  // Arm holding a club (right side)
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.8, 10),
    toon(0xef4444)
  );
  arm.position.set(0.5, 1.1, 0.3);
  arm.rotation.z = -Math.PI / 4;
  group.add(arm);

  // Club shaft
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 1.2, 8),
    toon(0xd4d4d8)
  );
  shaft.position.set(0.85, 0.7, 0.3);
  shaft.rotation.z = -Math.PI / 4;
  group.add(shaft);

  // Club head (little box)
  const clubHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.06, 0.25),
    toon(0x6b7280)
  );
  clubHead.position.set(1.25, 0.25, 0.3);
  clubHead.rotation.y = Math.PI / 6;
  group.add(clubHead);

  // Soft shadow disc under feet
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 20),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  group.add(shadow);

  return group;
}
