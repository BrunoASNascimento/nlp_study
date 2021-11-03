const express = require("express");
const app = express();
const replaceSpecialCharacters = require("replace-special-characters");
var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const OpenWeatherMapHelper = require("openweathermap-node");

const helper = new OpenWeatherMapHelper({
  APPID: process.env.open_weather_token,
  units: "metric"
});

app.use(express.static("public"));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.post("/api-forecast", function(request, resposta) {
  var intentName = request.body.queryResult.intent.displayName;

  if (intentName == "forecast") {
    var city = request.body.queryResult.parameters.location["city"];

    helper.getThreeHourForecastByCityName(
      "" + replaceSpecialCharacters(city),
      (erro, currentWeather) => {
        if (erro) {
          console.log(erro);

          resposta.json({
            fulfillmentText: `A cidade ${city} não foi encontrada.`
          });
        } else {
          console.log(currentWeather);

          var nextForecast = currentWeather.list[0];

          var temperatureMax = parseInt(nextForecast.main.temp_max);
          var temperatureMin = parseInt(nextForecast.main.temp_min);
          var humidity = parseInt(nextForecast.main.humidity);

          resposta.json({
            fulfillmentMessages: [
              {
                card: {
                  title: "Previsão do Tempo",
                  subtitle: currentWeather.city.name,
                  imageUri: `https://openweathermap.org/img/wn/${nextForecast.weather[0].icon}@2x.png`
                }
              },
              {
                text: {
                  text: [nextForecast.weather[0].main]
                }
              },

              {
                text: {
                  text: [`🌡️ ${temperatureMin}/${temperatureMax} ℃`]
                }
              },
              {
                text: {
                  text: [`💧 ${humidity} %`]
                }
              }
            ]
          });
        }
      }
    );
  }
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
