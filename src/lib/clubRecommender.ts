/**
 * Simple rule-based club recommendation.
 *
 * Adjusts the raw yardage by the component of wind along the player's facing
 * direction (tee → pin), then picks the closest club from a standard bag.
 */

export interface ClubRecommendation {
  club: string;
  effectiveYards: number;
  note: string;
}

interface ClubRange {
  name: string;
  /** Max carry in yards for a typical amateur player. */
  max: number;
}

// Ordered longest → shortest
const CLUBS: ClubRange[] = [
  { name: "Driver", max: 260 },
  { name: "3-Wood", max: 230 },
  { name: "5-Wood", max: 205 },
  { name: "4-Iron", max: 185 },
  { name: "5-Iron", max: 170 },
  { name: "6-Iron", max: 160 },
  { name: "7-Iron", max: 145 },
  { name: "8-Iron", max: 130 },
  { name: "9-Iron", max: 115 },
  { name: "PW", max: 100 },
  { name: "Gap Wedge", max: 85 },
  { name: "Sand Wedge", max: 70 },
  { name: "Lob Wedge", max: 55 },
  { name: "Putter", max: 10 },
];

/**
 * @param yards       Straight-line distance to target in yards.
 * @param windSpeed   Wind speed in mph (OpenWeather `wind.speed` is mph when units=imperial).
 * @param windDeg     Wind bearing in degrees (direction wind is coming FROM, per OWM spec).
 * @param playerFacingDeg  Direction player is aiming in degrees (bearing tee → pin).
 */
export function recommendClub(
  yards: number,
  windSpeed: number,
  windDeg: number,
  playerFacingDeg: number
): ClubRecommendation {
  // OWM windDeg is "where the wind is FROM". If wind is from the same direction
  // the player is facing, the wind is blowing INTO their face (headwind).
  // Angle between "wind from" direction and player facing direction:
  const angleDiff = Math.abs(((playerFacingDeg - windDeg + 540) % 360) - 180);
  // angleDiff: 0° = perfectly head-on headwind, 180° = perfect tailwind
  // cos(0)=1 means headwind → add yards; cos(180)=-1 means tailwind → subtract.
  const headwindFactor = Math.cos((angleDiff * Math.PI) / 180);

  // Each mph of effective headwind adds roughly 1.5 yards to play distance.
  const effectiveYards = Math.round(yards + windSpeed * headwindFactor * 1.5);

  // Pick the shortest club whose max is >= effectiveYards, else the longest.
  const club =
    [...CLUBS].reverse().find((c) => c.max >= effectiveYards) ?? CLUBS[0];

  let note = "";
  if (headwindFactor > 0.3 && windSpeed >= 5) note = "Into the wind — club up";
  else if (headwindFactor < -0.3 && windSpeed >= 5) note = "Downwind — club down";
  else if (Math.abs(headwindFactor) <= 0.3 && windSpeed >= 8) note = "Crosswind";

  return { club: club.name, effectiveYards, note };
}
