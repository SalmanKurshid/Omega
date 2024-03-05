const apiResponseHandler = require('../../utilities/apiResponse')
const weather_key=process.env.WEATHER_API_KEY
const axios = require('axios');

const getWeatherByLocation=async(req,res,next)=>{
    try{
        let {city}=req.body
        const apiKey = weather_key;
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${apiKey}`;
        const response = await axios.get(apiUrl);
        if(response){
            console.log(`Weather in ${city}: ${response.data.weather[0].description}, Temperature: ${response.data.main.temp}°C`);
            apiResponseHandler.sendResponse(200,true,response.data,function(response){
                res.json(response)
            })
        }else{
            apiResponseHandler.sendResponse(204,true,'Unable To Fetch Data!',function(response){
                res.json(response)
            })
        }
    }catch(error){
        apiResponseHandler.sendError(500, false, error, function(response){
            res.json(response)
        })
    }
}

module.exports={
    getWeatherByLocation
}