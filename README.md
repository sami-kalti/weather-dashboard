# Weather Dashboard

This is my project for the Introduction to Web Technologies course. It's a weather app that lets you check the weather in different cities around the world.

**Live Demo:** https://sami-kalti.github.io/weather-dashboard/

## What it does

- Search for weather in any city
- Shows current temperature, humidity, wind speed, etc.
- 5-day forecast so you can plan ahead
- Saves your recent searches (last 5 cities)
- You can favorite cities you check often (up to 5)
- Switch between Celsius and Fahrenheit
- Has a temperature chart that shows the trend over the next days
- Dark mode
- Looks responsive on phones too

## Technologies used

For this project I used:
- **HTML5** - for the page structure
- **CSS3** - custom styles plus Tailwind CSS for the layout
- **JavaScript** - all the interactive stuff
- **Fetch API** - to get data from the weather API
- **Chart.js** - for the temperature graph
- **localStorage** - to save favorites and preferences

## How to use it

1. Just open the `index.html` file in your browser
2. Type a city name in the search box
3. Click Search or press Enter
4. That's it!

You can click the star icon to add cities to your favorites. The moon/sun icon in the top right switches between dark and light mode.

## API

I'm using the Open-Meteo API which is free and doesn't need an API key.

## Features I added

- **Search History**
- **Favorites**
- **Temperature Units**
- **Temperature Chart**
- **Dark Mode**
- **Responsive Design**

## Project Structure

```
web-project/
├── index.html          # main page
├── css/
│   └── styles.css      # custom styles and dark mode
├── js/
│   ├── app.js          # main application logic
│   ├── api.js          # weather API calls
│   ├── storage.js      # localStorage functions
│   └── ui.js           # DOM manipulation
└── README.md           # this file
```

## What I learned

This project helped me understand:
- How to work with APIs using fetch()
- Promises and async/await
- localStorage for saving data
- ES6 modules (import/export)
- Event handling in JavaScript
- DOM manipulation
- Making responsive designs
- Working with third-party libraries (Chart.js, Tailwind)

## Future improvements

Some things I might add later:
- More detailed hourly forecast
- Weather alerts
- Multiple language support
- Save more favorites

## Notes

The weather data comes from Open-Meteo API and is updated in real-time. The icons are from OpenWeatherMap (they have nice weather icons).