import { useState, useEffect } from 'react';
import axiosInstance from '../../utilities/axiosInstance';
import API_ENDPOINTS from '../../utilities/apiConfig';
import Swal from 'sweetalert2';
import { Wrapper } from './WeatherForecast.css';

const WeatherForecast = () => {
    const [weatherData, setWeatherData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchWeatherForecast();
    }, []);

    const fetchWeatherForecast = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.WEATHER_FORECAST);
            
            if (response.data) {
                setWeatherData(response.data);
                // console.log('Weather Forecast Data:', response.data);
            }
        } catch (error) {
            // console.error('Error fetching weather forecast:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch weather forecast data',
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    return (
        <Wrapper>
            <div className="container">
                <div className="header">
                    <h1>Weather Forecast</h1>
                    <button 
                        className="btn-refresh" 
                        onClick={fetchWeatherForecast}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>

                {loading && weatherData.length === 0 ? (
                    <div className="loading">Loading weather data...</div>
                ) : (
                    <div className="weather-grid">
                        {weatherData.map((weather, index) => (
                            <div key={index} className="weather-card">
                                <div className="weather-date">
                                    {formatDate(weather.date)}
                                </div>
                                <div className="weather-temp">
                                    <div className="temp-celsius">
                                        {weather.temperatureC}°C
                                    </div>
                                    <div className="temp-fahrenheit">
                                        {weather.temperatureF}°F
                                    </div>
                                </div>
                                <div className="weather-summary">
                                    {weather.summary}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && weatherData.length === 0 && (
                    <div className="no-data">No weather data available</div>
                )}
            </div>
        </Wrapper>
    );
};

export default WeatherForecast;
