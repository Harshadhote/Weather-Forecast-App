const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const cityDropdown = document.querySelector(".city-dropdown");


const API_KEY = "3db27128ffd4e47c9e7a47f572a7d8b7"; //API key for OpenWeatherMap API

// Function to save city to local storage
const saveCityToStorage = (cityName) => {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!recentCities.includes(cityName)) {
        recentCities.push(cityName);
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
        updateDropdown();
    }
}

// Function to update the dropdown menu with recent cities
const updateDropdown = () => {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    cityDropdown.innerHTML = '<option value="" disabled selected>Select a city</option>'; // Clear existing options
    recentCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityDropdown.appendChild(option);
    });
    cityDropdown.style.display = recentCities.length > 0 ? 'block' : 'none'; // Show dropdown if there are recent cities
}

// Function to handle city selection from the dropdown
const handleDropdownChange = () => {
    const selectedCity = cityDropdown.value;
    if (selectedCity) {
        cityInput.value = selectedCity;
        getCityCoordinates();
    }
}

const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0){ //Html for the main weather card
        return `<div class="details">
            <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
             <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
             <h4>wind: ${weatherItem.wind.speed} M/S</h4>
             <h4>Humidity:  ${weatherItem.main.humidity}%</h4>
            </div> 
            <div class="icon">
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png"alt="weather-icon">
            <h4>${weatherItem.weather[0].description}</h4>
            </div> `;
    } else { //HTML for the other five day forcast card
        return `
                 <li class="card">
                   <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                   <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png"alt="weather-icon">
                   <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                   <h4>wind: ${weatherItem.wind.speed} M/S</h4>
                   <h4>Humidity:  ${weatherItem.main.humidity}%</h4>
                </li>`;
    }
    
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = ` https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL). then(res => res.json()).then(data =>{
        const uniqueForecastDays = [];
       

         const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        });

        //Clearing previous weather data
        cityInput.value = " ";
        currentWeatherDiv.innerHTML = " ";
        weatherCardsDiv.innerHTML = " ";
        // console.log(fiveDaysForecast);

        //creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem , index) => {
            if(index === 0){
                currentWeatherDiv.insertAdjacentHTML("beforeend",createWeatherCard( cityName, weatherItem, index));
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend",createWeatherCard( cityName, weatherItem, index));
            }    
            });
            
           
    }).catch(() => {
        alert("An error occurred while fetching the weather forcast!");
    });   
}
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim(); //Get user entered city name and remove extra spaces.
    if(!cityName) return; //Return if cityName is empty.
    const GEOCODING_API_URL =`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    //Get entered city coordinates(latitude ,longitude , and name)from the API response
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return  alert(`no coordinates found for ${cityName}`);
        const {name, lat, lon} = data[0];
        getWeatherDetails(name, lat, lon);


            // Save and update recent searches
            const recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];
            if (!recentCities.includes(cityName)) {
                recentCities.push(cityName);
                if (recentCities.length > 2) recentCities.shift(); // Keep only the last 5 searches
                localStorage.setItem("recentCities", JSON.stringify(recentCities));
            }
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            //Get city name from coordinates using reverse geocoading API
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                
                // if(!data.length) return  alert(`no coordinates found for ${cityName}`);
                 const { name } = data[0];
                 getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city!");
            });
            
        },
        error => {
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied. Please reset location permission to grant access again.")
            }
        }
    );
}
//Event Listeners
locationButton.addEventListener("click",getUserCoordinates);
searchButton.addEventListener("click",getCityCoordinates);
cityDropdown.addEventListener("change", handleDropdownChange);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());

// Initialize dropdown menu
updateDropdown();