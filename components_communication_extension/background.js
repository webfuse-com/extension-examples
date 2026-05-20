const weatherCodes = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail"
};
const chatMessageToBackgroundPrefix = '/background '
const chatMessageHandler = messageData => {
	// handle onbly `chat_message` events
	if (
		messageData.event_type === 'chat_message' &&
		messageData.message &&
		messageData.message.startsWith(chatMessageToBackgroundPrefix)
	) {
		const message = `### Message from chat: ${messageData.message.slice(chatMessageToBackgroundPrefix.length - 1).trim()}`;
		console.log(message);
	}
};

const forecastUrl = 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=weather_code&forecast_days=1';
const getForecast = async (messageData, sender) => {
	if (messageData.event_type === 'forecast') {	
		const res = await fetch(forecastUrl);
		const data = await res.json();
		const forecast = weatherCodes[data.current.weather_code] || 'Atmosphere is rolling a dice, outcome unknown';
		return { forecast };
	}
};

browser.webfuseSession.on.addListener(chatMessageHandler);
browser.runtime.onMessage.addListener(getForecast);

// Listen to the broadcast message from extension popup
browser.webfuseSession.on.addListener((message, sender) => {
  if (message === 'extension_popup_DOMContentLoaded') {
    console.log('### Broadcasted message from popup ###', message, sender);
  }
});
