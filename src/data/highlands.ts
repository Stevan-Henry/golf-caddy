import { Course } from "@/types/golf";

export const highlands: Course = {
  name: "The Golf Club at The Highlands",
  address: "8136 Highland Glen Drive, Chesterfield, VA 23838",
  center: { lat: 37.3325, lng: -77.5283 },
  par: 72,
  holes: 18,
  tees: [
    { name: "Gold", color: "#FFD700", totalYards: 6651, rating: 72.4, slope: 140 },
    { name: "Blue", color: "#3B82F6", totalYards: 6293, rating: 71.1, slope: 135 },
    { name: "White", color: "#FFFFFF", totalYards: 5682, rating: 68.2, slope: 126 },
    { name: "Green", color: "#22C55E", totalYards: 5001, rating: 68.7, slope: 120 },
  ],
  holeDetails: [
    {
      number: 1,
      par: 4,
      handicap: 7,
      yardages: { Gold: 415, Blue: 369, White: 345, Green: 300 },
      teePosition: { lat: 37.3308900703911, lng: -77.53079498643876 },
      greenCenter: { lat: 37.326836284491485, lng: -77.53339660453797 },
      description:
        "Two strong shots needed to get inside 150. A ravine fronts the two-tiered green, demanding an accurate approach.",
    },
    {
      number: 2,
      par: 3,
      handicap: 17,
      yardages: { Gold: 163, Blue: 159, White: 130, Green: 125 },
      teePosition: { lat: 37.326864953726584, lng: -77.53404190778733 },
      greenCenter: { lat: 37.3281216686107, lng: -77.5335465139389 },
      description:
        "Downhill par three with significant elevation change. Four bunkers behind the green make going long costly.",
    },
    {
      number: 3,
      par: 5,
      handicap: 9,
      yardages: { Gold: 535, Blue: 527, White: 478, Green: 451 },
      teePosition: { lat: 37.32790080413385, lng: -77.5344607963562 },
      greenCenter: { lat: 37.33064457632116, lng: -77.534486328125 },
      description:
        "A mid-fairway bunker demands precise tee shot placement. The small green slopes severely — position is everything.",
    },
    {
      number: 4,
      par: 4,
      handicap: 3,
      yardages: { Gold: 383, Blue: 361, White: 335, Green: 280 },
      teePosition: { lat: 37.33113607249182, lng: -77.53451204109192 },
      greenCenter: { lat: 37.334223831160536, lng: -77.53621774482727 },
      description:
        "Longest par four on the course. Hidden bunkers guard the right side. The elevated putting surface adds difficulty.",
    },
    {
      number: 5,
      par: 3,
      handicap: 13,
      yardages: { Gold: 196, Blue: 190, White: 154, Green: 130 },
      teePosition: { lat: 37.3275, lng: -77.5200 },
      greenCenter: { lat: 37.3262, lng: -77.5188 },
      description:
        "Signature hole — dogleg left with a lake guarding the approach. Risk-reward at its finest.",
    },
    {
      number: 6,
      par: 4,
      handicap: 11,
      yardages: { Gold: 298, Blue: 275, White: 255, Green: 208 },
      teePosition: { lat: 37.3258, lng: -77.5185 },
      greenCenter: { lat: 37.3245, lng: -77.5170 },
      description:
        "Uphill throughout. Features the fastest green on the course — respect the speed or face a tricky three-putt.",
    },
    {
      number: 7,
      par: 5,
      handicap: 5,
      yardages: { Gold: 475, Blue: 460, White: 445, Green: 400 },
      teePosition: { lat: 37.3242, lng: -77.5168 },
      greenCenter: { lat: 37.3225, lng: -77.5140 },
      description:
        "Tee shot to the hilltop, then a downhill approach to a small green surrounded by mounds. Club selection is critical.",
    },
    {
      number: 8,
      par: 3,
      handicap: 15,
      yardages: { Gold: 165, Blue: 157, White: 132, Green: 115 },
      teePosition: { lat: 37.3222, lng: -77.5138 },
      greenCenter: { lat: 37.3212, lng: -77.5128 },
      description:
        "Uphill with only the flag top visible from the tee. The green has a severe right-to-left slope — aim right of center.",
    },
    {
      number: 9,
      par: 5,
      handicap: 1,
      yardages: { Gold: 525, Blue: 505, White: 450, Green: 412 },
      teePosition: { lat: 37.3210, lng: -77.5125 },
      greenCenter: { lat: 37.3192, lng: -77.5095 },
      description:
        "Toughest hole on the course. A hazard runs along the entire left side. The large green slopes back to front — leave it below the hole.",
    },
    {
      number: 10,
      par: 5,
      handicap: 10,
      yardages: { Gold: 580, Blue: 540, White: 494, Green: 486 },
      teePosition: { lat: 37.3340, lng: -77.5290 },
      greenCenter: { lat: 37.3308, lng: -77.5260 },
      description:
        "Good birdie opportunity to start the back nine. Bunker placement leaves a short or mid iron approach.",
    },
    {
      number: 11,
      par: 3,
      handicap: 16,
      yardages: { Gold: 165, Blue: 140, White: 107, Green: 91 },
      teePosition: { lat: 37.3305, lng: -77.5258 },
      greenCenter: { lat: 37.3296, lng: -77.5250 },
      description:
        "Narrow green with a hard right-to-left slope. Multiple pin placements make club selection a puzzle.",
    },
    {
      number: 12,
      par: 4,
      handicap: 8,
      yardages: { Gold: 389, Blue: 366, White: 320, Green: 255 },
      teePosition: { lat: 37.3293, lng: -77.5248 },
      greenCenter: { lat: 37.3275, lng: -77.5222 },
      description:
        "Elevation advantage plays one club shorter. A penalty area crosses the entire hole — layup position matters.",
    },
    {
      number: 13,
      par: 4,
      handicap: 2,
      yardages: { Gold: 466, Blue: 430, White: 385, Green: 340 },
      teePosition: { lat: 37.3272, lng: -77.5220 },
      greenCenter: { lat: 37.3250, lng: -77.5195 },
      description:
        "Large fairway with tee shot options. The green slopes severely from back to front — below the hole is a must.",
    },
    {
      number: 14,
      par: 5,
      handicap: 6,
      yardages: { Gold: 524, Blue: 500, White: 470, Green: 390 },
      teePosition: { lat: 37.3248, lng: -77.5193 },
      greenCenter: { lat: 37.3228, lng: -77.5165 },
      description:
        "Arguably the toughest tee shot on the course. Penalty areas on three sides demand accuracy off the tee.",
    },
    {
      number: 15,
      par: 4,
      handicap: 18,
      yardages: { Gold: 370, Blue: 355, White: 314, Green: 254 },
      teePosition: { lat: 37.3225, lng: -77.5163 },
      greenCenter: { lat: 37.3210, lng: -77.5145 },
      description:
        "Short uphill par four. Multiple teeing options allow aggressive or conservative play depending on conditions.",
    },
    {
      number: 16,
      par: 4,
      handicap: 4,
      yardages: { Gold: 426, Blue: 410, White: 379, Green: 318 },
      teePosition: { lat: 37.3208, lng: -77.5143 },
      greenCenter: { lat: 37.3190, lng: -77.5118 },
      description:
        "Reachable for long hitters but the layup area is tight. A hazard guards the entire left side.",
    },
    {
      number: 17,
      par: 3,
      handicap: 12,
      yardages: { Gold: 151, Blue: 141, White: 121, Green: 112 },
      teePosition: { lat: 37.3188, lng: -77.5115 },
      greenCenter: { lat: 37.3180, lng: -77.5108 },
      description:
        "Uphill with the flag bottom not visible from the tee. Take an extra club — the ball won't release like you think.",
    },
    {
      number: 18,
      par: 4,
      handicap: 14,
      yardages: { Gold: 425, Blue: 408, White: 368, Green: 334 },
      teePosition: { lat: 37.3178, lng: -77.5106 },
      greenCenter: { lat: 37.3160, lng: -77.5080 },
      description:
        "Finishing hole, uphill all the way. Penalty area on left, out of bounds on right. Only a short iron will hold this green.",
    },
  ],
};
