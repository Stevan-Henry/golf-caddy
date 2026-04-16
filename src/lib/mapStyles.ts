/**
 * Cartoon / illustrated Google Maps style JSON.
 *
 * NOTE: When using a vector Map ID (as we do — required for rotation), Google
 * ignores the `styles` prop on the Map component. To apply this style, paste
 * it into the Map ID's style editor at:
 *   https://console.cloud.google.com/google/maps-apis/studio/maps/<MAP_ID>/styles
 *
 * Until that's configured, we rely on the CSS `filter` applied to the map
 * container to give the satellite view a painted, cartoon-y feel.
 */
export const CARTOON_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#dcf2d5" }] },
  { elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", stylers: [{ visibility: "off" }] },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#7fd3f5" }],
  },
  {
    featureType: "landscape.natural",
    stylers: [{ color: "#b7e4a9" }],
  },
  {
    featureType: "landscape.man_made",
    stylers: [{ color: "#e4efcd" }],
  },
];

/**
 * CSS filter applied to the map container to give the (satellite) tiles a
 * more illustrated, painted look. Tuned to boost greens and add a bit of
 * warm saturation without washing out the course features.
 */
export const CARTOON_MAP_CSS_FILTER =
  "saturate(1.45) contrast(1.12) brightness(1.04)";
