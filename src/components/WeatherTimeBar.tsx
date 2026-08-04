"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, CloudSun } from 'lucide-react';

const cities = [
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Toronto', lat: 43.6532, lon: -79.3832 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { name: 'Istanbul', lat: 41.0082, lon: 28.9784 },
];

const getWeatherEmoji = (code: number) => {
  if (code === 0) return '☀️';
  if (code >= 1 && code <= 3) return '⛅️';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 95) return '⛈️';
  return '🌍';
};

export default function WeatherTimeBar() {
  const [nyTime, setNyTime] = useState("");
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const updateTime = () => setNyTime(new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    const fetchWeather = async () => {
      try {
        const results = await Promise.all(
          cities.map(async (city) => {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`);
            const data = await res.json();
            const tempF = Math.round((data.current_weather.temperature * 9/5) + 32);
            return { name: city.name, temp: `${tempF}°F`, emoji: getWeatherEmoji(data.current_weather.weathercode) };
          })
        );
        setWeatherData(results);
      } catch (error) { console.error("Weather fetch failed", error); }
    };
    fetchWeather();

    setShowPopup(true);
    const popupTimer = setTimeout(() => {
      setShowPopup(false);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(popupTimer);
    };
  }, []);

  return (
    // ✅ یہاں sticky top-16 استعمال کیا گیا ہے۔ اگر آپ کے navbar کی height 64px (h-16) ہے تو یہ بالکل اس کے نیچے آئے گا۔
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200 py-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 relative">
      <style>
        {`
          @keyframes weatherScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .weather-ticker { animation: weatherScroll 30s linear infinite; }
          .weather-ticker:hover { animation-play-state: paused; }
          
          @keyframes ideaPop {
            0% { transform: scale(0.7); opacity: 0; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .idea-popup { animation: ideaPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
          
          @keyframes fadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; }
          }
          .fade-out { animation: fadeOut 0.5s linear forwards; }
        `}
      </style>

      <div className="max-w-7xl mx-auto px-4 flex items-center gap-6">
        
        <Link href="/weather" className="flex-shrink-0 flex items-center gap-1.5 hover:text-gray-900 transition-colors z-10">
          <Clock className="w-3 h-3" /> NY: <strong className="text-gray-800 ml-1">{nyTime}</strong>
        </Link>

        <div className="flex-1 overflow-hidden">
          <div className="flex gap-8 whitespace-nowrap weather-ticker cursor-pointer">
            {[...weatherData, ...weatherData].map((city, index) => (
              <Link href="/weather" key={index} className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
                <span>{city.emoji}</span>
                <span className="font-bold text-gray-700">{city.name}:</span>
                <strong className="text-gray-800">{city.temp}</strong>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 relative">
          <Link 
            href="/weather"
            className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-[#6D28D9] transition-colors"
          >
            <CloudSun className="w-3 h-3" /> Check Weather
          </Link>

          {showPopup && (
            // ✅ پاپ اپ کا z-index بڑھا دیا گیا ہے تاکہ وہ دوسرے عناصر پر نظر آئے
            <div className="idea-popup absolute right-0 top-full mt-3 w-60 bg-white border border-gray-200 shadow-2xl rounded-xl p-4 z-50">
              <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
              <p className="text-xs text-gray-600 mb-3 normal-case tracking-normal text-center">
                💡 Idea! Check your city's weather, AQI & 7-day forecast.
              </p>
              <Link 
                href="/weather" 
                className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] py-2 rounded-md font-bold uppercase tracking-widest transition-colors"
                onClick={() => setShowPopup(false)}
              >
                View Global Weather
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}