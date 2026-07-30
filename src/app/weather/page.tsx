"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Clock, Search, ArrowLeft, MapPin, Wind, Droplets, Gauge, AlertTriangle, Trophy, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export default function WeatherPage() {
  const [nyTime, setNyTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [defaultWeather, setDefaultWeather] = useState<any[]>([]);
  const [globalAqiRanking, setGlobalAqiRanking] = useState<any[]>([]);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => setNyTime(new Date().toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    const fetchDefaults = async () => {
      const cities = [
        { name: "New York", country: "USA", lat: 40.7128, lon: -74.0060 },
        { name: "Los Angeles", country: "USA", lat: 34.0522, lon: -118.2437 },
        { name: "Chicago", country: "USA", lat: 41.8781, lon: -87.6298 },
        { name: "Toronto", country: "Canada", lat: 43.6532, lon: -79.3832 },
        { name: "Vancouver", country: "Canada", lat: 49.2827, lon: -123.1207 },
        { name: "London", country: "UK", lat: 51.5074, lon: -0.1278 },
        { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
        { name: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050 },
        { name: "Rome", country: "Italy", lat: 41.9028, lon: 12.4964 },
        { name: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038 },
        { name: "Warsaw", country: "Poland", lat: 52.2297, lon: 21.0122 },
        { name: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708 },
        { name: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lon: 46.6753 },
        { name: "Delhi", country: "India", lat: 28.6139, lon: 77.2090 },
        { name: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777 },
        { name: "Karachi", country: "Pakistan", lat: 24.8607, lon: 67.0011 },
        { name: "Lahore", country: "Pakistan", lat: 31.5204, lon: 74.3587 },
        { name: "Beijing", country: "China", lat: 39.9042, lon: 116.4074 },
        { name: "Shanghai", country: "China", lat: 31.2304, lon: 121.4737 },
        { name: "Tehran", country: "Iran", lat: 35.6892, lon: 51.3890 },
        { name: "Jakarta", country: "Indonesia", lat: -6.2088, lon: 106.8456 },
        { name: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018 },
        { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198 },
        { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357 },
        { name: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792 },
        { name: "Johannesburg", country: "South Africa", lat: -26.2041, lon: 28.0473 },
        { name: "Sao Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333 },
        { name: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332 },
      ];
      
      const results = await Promise.all(
        cities.map(async (city) => {
          try {
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7`);
            const weatherData = await weatherRes.json();
            
            // ✅ AQI کے ساتھ ساتھ وجوہات (PM2.5, PM10, Ozone) بھی لائیں
            const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide&timezone=auto`);
            const aqiData = await aqiRes.json();
            
            const condition = weatherData.current.weather_code;
            const isSevere = condition >= 95 || (condition >= 71 && condition <= 77) || condition >= 80;

            return { 
              name: city.name, 
              country: city.country, 
              temp: Math.round(weatherData.current.temperature_2m), 
              humidity: weatherData.current.relative_humidity_2m,
              condition: condition,
              wind: Math.round(weatherData.current.wind_speed_10m),
              aqi: aqiData.current?.us_aqi || 0,
              pm25: aqiData.current?.pm2_5 || 0,
              pm10: aqiData.current?.pm10 || 0,
              o3: aqiData.current?.ozone || 0,
              isSevere: isSevere,
              forecast: weatherData.daily.time.map((t: string, i: number) => ({
                day: new Date(t).toLocaleDateString('en-US', { weekday: 'short' }),
                max: Math.round(weatherData.daily.temperature_2m_max[i]),
                min: Math.round(weatherData.daily.temperature_2m_min[i]),
                code: weatherData.daily.weather_code[i]
              }))
            };
          } catch (e) { return null; }
        })
      );
      
      const validResults = results.filter(r => r !== null);
      setDefaultWeather(validResults);
      
      const sortedByAqi = [...validResults].sort((a, b) => b.aqi - a.aqi);
      setGlobalAqiRanking(sortedByAqi);
    };
    
    fetchDefaults();
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();
      
      if (geoData.results && geoData.results.length > 0) {
        const { latitude, longitude, name, country } = geoData.results[0];
        
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7`);
        const weatherData = await weatherRes.json();
        
        const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide&timezone=auto`);
        const aqiData = await aqiRes.json();
        
        setSearchResult({
          name: `${name}, ${country}`,
          temp: Math.round(weatherData.current.temperature_2m),
          humidity: weatherData.current.relative_humidity_2m,
          condition: weatherData.current.weather_code,
          wind: Math.round(weatherData.current.wind_speed_10m),
          aqi: aqiData.current?.us_aqi || 0,
          pm25: aqiData.current?.pm2_5 || 0,
          pm10: aqiData.current?.pm10 || 0,
          o3: aqiData.current?.ozone || 0,
          forecast: weatherData.daily.time.map((t: string, i: number) => ({
            day: new Date(t).toLocaleDateString('en-US', { weekday: 'short' }),
            max: Math.round(weatherData.daily.temperature_2m_max[i]),
            min: Math.round(weatherData.daily.temperature_2m_min[i]),
            code: weatherData.daily.weather_code[i]
          }))
        });
      } else {
        alert("City not found. Try another name.");
      }
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const scrollSlider = (dir: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = 300;
    sliderRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const getWeatherStyle = (code: number) => {
    if (code === 0) return { text: "Clear Sky", emoji: "☀️", bg: "from-yellow-400 to-orange-500", text_color: "text-white" };
    if (code >= 1 && code <= 3) return { text: "Partly Cloudy", emoji: "⛅️", bg: "from-blue-400 to-gray-500", text_color: "text-white" };
    if (code >= 45 && code <= 48) return { text: "Foggy", emoji: "🌫️", bg: "from-gray-300 to-gray-500", text_color: "text-white" };
    if (code >= 51 && code <= 67) return { text: "Rainy", emoji: "🌧️", bg: "from-blue-600 to-indigo-700", text_color: "text-white" };
    if (code >= 71 && code <= 77) return { text: "Snowy", emoji: "❄️", bg: "from-cyan-200 to-blue-400", text_color: "text-gray-800" };
    if (code >= 80 && code <= 82) return { text: "Rain Showers", emoji: "🌦️", bg: "from-blue-400 to-slate-600", text_color: "text-white" };
    if (code >= 95) return { text: "Thunderstorm", emoji: "⛈️", bg: "from-gray-700 to-black", text_color: "text-white" };
    return { text: "Unknown", emoji: "🌍", bg: "from-gray-400 to-gray-600", text_color: "text-white" };
  };

  const getSmallEmoji = (code: number) => getWeatherStyle(code).emoji;

  const getAqiStyle = (aqi: number) => {
    if (aqi <= 50) return { label: "Good", color: "bg-green-500", text: "text-green-600" };
    if (aqi <= 100) return { label: "Moderate", color: "bg-yellow-500", text: "text-yellow-600" };
    if (aqi <= 150) return { label: "Unhealthy (SG)", color: "bg-orange-500", text: "text-orange-600" };
    if (aqi <= 200) return { label: "Unhealthy", color: "bg-red-500", text: "text-red-600" };
    if (aqi <= 300) return { label: "Very Unhealthy", color: "bg-purple-600", text: "text-purple-600" };
    return { label: "Hazardous", color: "bg-red-900", text: "text-red-800" };
  };

  // ✅ AQI کی وجہ تلاش کرنے والا فنکشن
  const getAqiReason = (aqi: number, pm25: number, pm10: number, o3: number) => {
    if (aqi <= 50) return { reason: "Clean Air", detail: "Air quality is satisfactory." };
    
    // کون سی گیس سب سے زیادہ خطرناک ہے اس کا حساب
    const sub_pm25 = pm25 > 35 ? 101 + (pm25 - 35) : pm25 > 12 ? 51 + (pm25 - 12) * 2 : pm25 * 4;
    const sub_pm10 = pm10 > 154 ? 101 + (pm10 - 154) * 0.5 : pm10 > 54 ? 51 + (pm10 - 54) * 0.5 : pm10 * 0.9;
    const sub_o3 = o3 > 137 ? 101 + (o3 - 137) * 2 : o3 > 105 ? 51 + (o3 - 105) * 3 : o3 * 0.4;
    
    const maxVal = Math.max(sub_pm25, sub_pm10, sub_o3);
    
    if (maxVal === sub_pm25) return { reason: "PM2.5 (Fine Particles)", detail: "Caused by vehicles, smoke & industries." };
    if (maxVal === sub_pm10) return { reason: "PM10 (Coarse Dust)", detail: "Caused by construction, roads & wind." };
    if (maxVal === sub_o3) return { reason: "Ozone (O3)", detail: "Formed by sun reacting with pollution." };
    
    return { reason: "Mixed Pollutants", detail: "General urban pollution." };
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 relative overflow-hidden">
      <style>
        {`
          @keyframes rainDrop { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
          @keyframes snowFall { 0% { transform: translateY(-100%) translateX(0); } 100% { transform: translateY(100vh) translateX(20px); } }
          @keyframes flash { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
          @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
          
          .rain-drop { position: fixed; width: 2px; height: 20px; background: rgba(255,255,255,0.4); animation: rainDrop 0.5s linear infinite; }
          .snow-flake { position: fixed; width: 6px; height: 6px; background: white; border-radius: 50%; animation: snowFall 3s linear infinite; }
          .storm-flash { position: fixed; inset: 0; background: white; pointer-events: none; animation: flash 2s infinite; z-index: 0; }
          .severe-shake { animation: shake 0.5s infinite; }
          
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      <div className="bg-white border-b border-gray-200 py-2 text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-6">
          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> NY: <strong className="text-gray-800 ml-1">{nyTime}</strong></span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        <Link href="/" className="flex items-center text-gray-500 hover:text-gray-900 mb-8 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-2 border-b-2 border-gray-900 pb-4 uppercase">Global Weather & AQI</h1>
        <p className="text-gray-500 mb-10 text-lg">Live weather, Air Quality Index (AQI), pollution reasons, and 7-day forecasts globally.</p>

        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-12 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search any city globally (e.g., Toronto, Berlin)..." 
            className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 text-sm uppercase tracking-widest focus:outline-none focus:border-gray-900 rounded-lg"
          />
          <button type="submit" className="px-8 py-3 bg-gray-900 text-white text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-[#6D28D9] transition-colors flex items-center gap-2">
            {loading ? "..." : <><Search className="w-4 h-4" /> Search</>}
          </button>
        </form>

        {/* سرچ رزلٹ */}
        {searchResult && (
          <div className="mb-16">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" /> Search Result
            </h2>
            {(() => {
              const style = getWeatherStyle(searchResult.condition);
              const aqiStyle = getAqiStyle(searchResult.aqi);
              const reason = getAqiReason(searchResult.aqi, searchResult.pm25, searchResult.pm10, searchResult.o3);
              return (
                <div className={`bg-gradient-to-br ${style.bg} p-8 rounded-2xl shadow-lg text-white relative overflow-hidden`}>
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <h3 className="font-playfair text-3xl font-bold">{searchResult.name}</h3>
                      <p className="text-7xl font-bold my-4">{searchResult.temp}°F</p>
                      <p className="uppercase tracking-widest text-sm font-bold opacity-90">{style.text}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-xl text-center">
                      <Gauge className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-3xl font-bold">{searchResult.aqi}</p>
                      <p className="text-xs uppercase font-bold">{aqiStyle.label}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-6 mt-4 text-sm">
                    <span className="flex items-center gap-2"><Wind className="w-4 h-4" /> {searchResult.wind} km/h</span>
                    <span className="flex items-center gap-2"><Droplets className="w-4 h-4" /> {searchResult.humidity}%</span>
                  </div>

                  {/* ✅ AQI کی وجہ (Reason) */}
                  <div className="mt-4 bg-white/10 p-3 rounded-lg text-xs">
                    <p className="font-bold uppercase flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Primary Cause: {reason.reason}</p>
                    <p className="opacity-80 mt-1">{reason.detail}</p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/20">
                    <p className="text-xs uppercase tracking-widest font-bold mb-4">Next 7 Days</p>
                    <div className="flex justify-between gap-2">
                      {searchResult.forecast.map((day: any, idx: number) => (
                        <div key={idx} className="text-center bg-white/10 p-2 rounded-lg flex-1">
                          <p className="text-[10px] font-bold uppercase">{day.day}</p>
                          <p className="text-xl my-1">{getSmallEmoji(day.code)}</p>
                          <p className="text-sm font-bold">{day.max}°</p>
                          <p className="text-[10px] opacity-70">{day.min}°</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 🌍 Top Global AQI Rankings (Horizontal Slider) */}
        {globalAqiRanking.length > 0 && (
          <div className="mb-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" /> Top Global AQI Rankings
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={() => scrollSlider('left')} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button onClick={() => scrollSlider('right')} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div ref={sliderRef} className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory">
              {globalAqiRanking.map((city, idx) => {
                const aqiStyle = getAqiStyle(city.aqi);
                const weatherStyle = getWeatherStyle(city.condition);
                const reason = getAqiReason(city.aqi, city.pm25, city.pm10, city.o3);
                return (
                  <div 
                    key={idx} 
                    className={`flex-shrink-0 w-60 p-4 rounded-xl border snap-center ${city.aqi > 150 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${idx === 0 ? 'bg-yellow-400 text-white' : idx === 1 ? 'bg-gray-300 text-gray-800' : idx === 2 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        Rank #{idx + 1}
                      </span>
                      <span className="text-2xl">{weatherStyle.emoji}</span>
                    </div>
                    
                    <h4 className="font-bold text-gray-800 text-sm">{city.name}</h4>
                    <p className="text-[10px] text-gray-500 mb-3">{city.country}</p>

                    <div className={`text-center py-3 rounded-lg ${aqiStyle.color} text-white mb-3`}>
                      <div className="text-3xl font-bold">{city.aqi}</div>
                      <div className="text-[10px] uppercase font-bold">{aqiStyle.label}</div>
                    </div>

                    {/* ✅ سلیڈر کارڈز میں وجہ (Reason) */}
                    <div className="text-[10px] text-gray-600 bg-gray-100 p-2 rounded-md mb-3">
                      <span className="font-bold text-gray-800 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {reason.reason}</span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Temp: <strong className="text-gray-800">{city.temp}°F</strong></span>
                      <span>Humidity: <strong className="text-gray-800">{city.humidity}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed City Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {defaultWeather.map((city, idx) => {
            const style = getWeatherStyle(city.condition);
            const aqiStyle = getAqiStyle(city.aqi);
            const reason = getAqiReason(city.aqi, city.pm25, city.pm10, city.o3);
            return (
              <div 
                key={idx} 
                className={`bg-gradient-to-br ${style.bg} p-6 rounded-2xl shadow-sm text-center transition-transform hover:scale-105 ${city.isSevere ? 'severe-shake border-4 border-red-500' : ''}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`font-bold text-lg uppercase tracking-widest ${style.text_color} text-left`}>{city.name}, {city.country}</h3>
                  {city.isSevere && <span className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">⚠️ Alert</span>}
                </div>
                <div className="flex items-center justify-center gap-4 mb-2">
                  <div className="text-5xl">{style.emoji}</div>
                  <p className={`text-5xl font-bold ${style.text_color}`}>{city.temp}°F</p>
                </div>
                <p className={`text-xs mt-1 font-medium ${style.text_color} opacity-80`}>{style.text}</p>
                
                <div className={`mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-2 text-xs ${style.text_color}`}>
                  <div className="flex flex-col items-center">
                    <Droplets className="w-4 h-4 mb-1 opacity-70" />
                    <span className="font-bold">{city.humidity}%</span>
                    <span className="text-[9px] opacity-70">Humidity</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Wind className="w-4 h-4 mb-1 opacity-70" />
                    <span className="font-bold">{city.wind}km/h</span>
                    <span className="text-[9px] opacity-70">Wind</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Gauge className="w-4 h-4 mb-1 opacity-70" />
                    <span className="font-bold">{city.aqi}</span>
                    <span className="text-[9px] opacity-70">{aqiStyle.label}</span>
                  </div>
                </div>

                {/* ✅ بڑے کارڈز میں AQI کی وجہ (Reason) */}
                <div className={`mt-4 pt-4 border-t border-white/20 text-xs ${style.text_color}`}>
                  <span className="opacity-70 uppercase tracking-widest text-[9px]">Pollution Reason:</span><br/>
                  <strong className="text-sm flex items-center justify-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {reason.reason}</strong>
                </div>

                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between gap-1">
                    {city.forecast.map((day: any, idx2: number) => (
                      <div key={idx2} className={`flex flex-col items-center p-1 rounded ${day.code >= 51 ? 'bg-white/20' : ''}`}>
                        <p className={`text-[9px] font-bold uppercase ${style.text_color}`}>{day.day}</p>
                        <p className="text-lg my-1">{getSmallEmoji(day.code)}</p>
                        <p className={`text-xs font-bold ${style.text_color}`}>{day.max}°</p>
                        <p className={`text-[9px] ${style.text_color} opacity-70`}>{day.min}°</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}