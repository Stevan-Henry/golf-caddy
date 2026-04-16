# Golf Club Distance Database
# Modify these distances based on your personal carry distances

CLUB_DISTANCES = {
    # Driver and Woods
    "driver": 250,
    "3_wood": 220,
    "5_wood": 200,
    "7_wood": 185,
    
    # Hybrids
    "3_hybrid": 190,
    "4_hybrid": 180,
    "5_hybrid": 170,
    
    # Irons
    "3_iron": 180,
    "4_iron": 170,
    "5_iron": 160,
    "6_iron": 150,
    "7_iron": 140,
    "8_iron": 130,
    "9_iron": 120,
    
    # Wedges
    "pitching_wedge": 110,
    "gap_wedge": 95,
    "sand_wedge": 80,
    "lob_wedge": 65,
    
    # Putter
    "putter": 0  # For putting only
}

# Wind adjustments (add/subtract yards per 10mph of wind)
WIND_ADJUSTMENTS = {
    "headwind": -15,  # Subtract yards for headwind
    "tailwind": 10,   # Add yards for tailwind
    "crosswind": -5   # Slight reduction for crosswind
}

# Temperature adjustments (per 10 degrees from 70°F)
TEMPERATURE_ADJUSTMENTS = {
    "hot": 5,    # Add 5 yards per 10° above 70°F
    "cold": -5   # Subtract 5 yards per 10° below 70°F
}

def get_club_for_distance(target_distance, conditions=None):
    """
    Get recommended club for a target distance
    
    Args:
        target_distance (int): Target distance in yards
        conditions (dict): Weather conditions with wind_speed, wind_direction, temperature
    
    Returns:
        tuple: (club_name, adjusted_distance)
    """
    adjusted_distances = CLUB_DISTANCES.copy()
    
    if conditions:
        # Apply wind adjustments
        if 'wind_speed' in conditions and 'wind_direction' in conditions:
            wind_speed = conditions['wind_speed']
            wind_direction = conditions['wind_direction'].lower()
            
            if 'head' in wind_direction:
                adjustment = (wind_speed // 10) * WIND_ADJUSTMENTS['headwind']
            elif 'tail' in wind_direction:
                adjustment = (wind_speed // 10) * WIND_ADJUSTMENTS['tailwind']
            else:
                adjustment = (wind_speed // 10) * WIND_ADJUSTMENTS['crosswind']
            
            for club in adjusted_distances:
                adjusted_distances[club] += adjustment
        
        # Apply temperature adjustments
        if 'temperature' in conditions:
            temp = conditions['temperature']
            temp_diff = temp - 70
            temp_adjustment = (temp_diff // 10) * (TEMPERATURE_ADJUSTMENTS['hot'] if temp > 70 else TEMPERATURE_ADJUSTMENTS['cold'])
            
            for club in adjusted_distances:
                adjusted_distances[club] += temp_adjustment
    
    # Find closest club
    closest_club = min(adjusted_distances.keys(), 
                      key=lambda club: abs(adjusted_distances[club] - target_distance))
    
    return closest_club, adjusted_distances[closest_club]

def get_all_clubs():
    """Return all clubs and their distances"""
    return CLUB_DISTANCES

def update_club_distance(club_name, new_distance):
    """Update a specific club's distance"""
    if club_name in CLUB_DISTANCES:
        CLUB_DISTANCES[club_name] = new_distance
        return True
    return False