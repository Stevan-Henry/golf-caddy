from google.adk.agents.llm_agent import Agent
from google.adk.tools import google_search, Tool
import requests

def getWeather(lat, lon, course_name=None):
    try:
        # Your Next.js API endpoint
        url = "http://localhost:3000/api/weather"
        
        # Parameters matching your API
        params = {
            'lat': lat,
            'lon': lon
        }
        if course_name:
            params['course'] = course_name
            
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        return response.json()
        
    except requests.RequestException as e:
        print(f"Error fetching weather data: {e}")
        return None

def create_weather_tool():
    def get_course_weather(lat: float, lon: float, course_name: str = None):
        """Get current weather conditions for a golf course"""
        weather_data = getWeather(lat, lon, course_name)
        
        if weather_data:
            # Extract key information for the agent
            conditions = weather_data.get('golfConditions', {})
            current = weather_data.get('current', {})
            wind = weather_data.get('wind', {})
            
            return f"""
            Course: {weather_data.get('course', 'Unknown')}
            Temperature: {current.get('temperature')}°F (Feels like {current.get('feelsLike')}°F)
            Wind: {wind.get('speed')} mph from {wind.get('direction')}°
            Conditions: {weather_data.get('conditions', {}).get('description')}
            Playability: {conditions.get('playability')}
            Recommendations: {', '.join(conditions.get('recommendations', []))}
            """
        return "Weather data unavailable"
    
    return Tool(
        name="get_course_weather",
        description="Get current weather conditions and golf-specific recommendations for a course",
        function=get_course_weather
    )
    
    

#weather agent
weather_agent = Agent(
    model='gemini-2.5-flash',
    name='weather_agent',
    description='Provides real-time weather information and forecasts for golf courses.',
    instructions='Use the weather tool to fetch current conditions and provide golf-specific weather advice including playability and recommendations.',
    tools=[create_weather_tool()]
)

#course_agent
course_agent = Agent(
    model='gemini-2.5-flash',
    name='course_agent',
    description='Offers detailed information about golf courses, including layout and hazards',
    instructions='Use course database and mapping tools to provide accurate course details, hole layouts, and hazard information.'
)

#clubs_agent
clubs_agent = Agent(
    model='gemini-2.5-flash',
    name='clubs_agent',
    description='Analyzes shot requirements and provides personalized club selection recommendations based on distance, conditions, player skill level, and shot preferences',
    instructions='Analyze shot distance, course conditions, and player preferences to suggest optimal club choices.'
)

#strategy agent
strategy_agent = Agent(
    model='gemini-2.5-flash',
    name='strategy_agent',
    description='Provides strategic golfing advice considering course layout, player skill level, and environmental factors',
    instructions='Analyze course data, player statistics, and weather conditions to formulate optimal play strategies.'
)

#main caddy agent
caddy_agent = Agent(
    model='gemini-2.5-flash',
    name='caddy_agent',
    description='An intelligent golf caddy assistant that provides expert golf advice, course guidance, and strategic recommendations.',
    instructions='Coordinate with sub-agents to gather weather data, course information, club recommendations, and strategy advice to provide comprehensive golfing guidance.',
    sub_agents=[weather_agent, course_agent, clubs_agent, strategy_agent]
)







