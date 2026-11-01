
const API_KEY = "5410dc74e667014975a014f953923bf7";
const API_URL = "https://api.openweathermap.org/data/2.5/weather";
const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const weather = document.getElementById("weather");
document.getElementById("year").textContent =
    new Date().getFullYear();
function showError(message) {
    error.textContent = message;
    error.classList.remove("hidden");
    weather.classList.add("hidden");
}
function getDate() {
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date());
}
async function getWeather(city) {
    loading.classList.remove("hidden");
    error.classList.add("hidden");
    weather.classList.add("hidden");
    searchButton.disabled = true;
    searchButton.textContent = "Searching...";
    try {
        const url = new URL(API_URL);
        url.search = new URLSearchParams({
            q: city,
            appid: API_KEY,
            units: "metric"
        });
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(
                    "The OpenWeatherMap API key is invalid or not active yet."
                );
            }
            if (response.status === 404) {
                throw new Error("City not found. Check the spelling and try again.");
            }
            if (response.status === 429) {
                throw new Error("Too many requests. Please wait and try again.");
            }
            throw new Error(
                `Weather request failed. Error code: ${response.status}`
            );
        }
        const data = await response.json();
        const conditions = data.weather?.[0];
        if (!conditions || !data.main) {
            throw new Error("Weather information is unavailable for this city.");
        }

        document.getElementById("city-name").textContent =
            [data.name, data.sys?.country].filter(Boolean).join(", ");
        document.getElementById("date").textContent =
            getDate();
        document.getElementById("temperature").textContent =
            Math.round(data.main.temp);
        document.getElementById("feels-like").textContent =
            Math.round(data.main.feels_like);
        document.getElementById("humidity").textContent =
            data.main.humidity;
        document.getElementById("wind").textContent =
            Number(data.wind.speed).toFixed(1);
        document.getElementById("pressure").textContent =
            data.main.pressure;
        document.getElementById("description").textContent =
            conditions.description;
        const icon = document.getElementById("weather-icon");
        icon.src = `https://openweathermap.org/img/wn/${conditions.icon}@2x.png`;
        icon.alt = conditions.description;
        weather.classList.remove("hidden");
    } catch (err) {
        console.error(err);
        showError(
            err.message || "Unable to connect. Check your internet connection."
        );
    } finally {
        loading.classList.add("hidden");
        searchButton.disabled = false;
        searchButton.textContent = "Search";
    }
}
form.addEventListener("submit", function(event) {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (!city) {
        showError("Please enter a city name.");
        return;
    }
    getWeather(city);
});
