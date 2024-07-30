const apiResponseHandler = require('../../utilities/apiResponse')
const weather_key=process.env.WEATHER_API_KEY
const axios = require('axios');
const instagram= require('../models/instagram_posts')
const puppeteer = require('puppeteer');

const getWeatherByLocation=async(req,res,next)=>{
    try{
        console.log('body here::',req.query.city);
        let city=req.query.city
        const apiKey = weather_key;
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${apiKey}`;
        console.log('apiUrl',apiUrl);
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
        console.log('Error in Weather API:',error)
        apiResponseHandler.sendError(500, false, error, function(response){
            res.json(response)
        })
    }
}

const getInstaData=async(req,res,next)=>{   
    try{
        let {username,password,instagram_profile_link}=req.body
        if(username && password && instagram_profile_link){
            let scrap_instagram=await scrapeInstagram(username,password,instagram_profile_link)
            let createObj={
                user_name: instagram_profile_link,
                posts: scrap_instagram
            }
            let newData=await insertInstaData(createObj)
            if(newData){
                apiResponseHandler.sendResponse(200,true,scrap_instagram,function(response){
                    res.json(response)
                })
            }else{
                apiResponseHandler.sendError(400, false, 'Please Provide Proper Data!', function(response){
                    res.json(response)
                })
            }
        }else{
            apiResponseHandler.sendError(400, false, 'Username Or Password Missing!', function(response){
                res.json(response)
            })
        }
    }catch(error){
        apiResponseHandler.sendError(500, false, error, function(response){
            res.json(response)
        })
        return next();
    }
}

const chuckNorris=async(req,res,next)=>{
    try {
        const { data } = await axios.get('https://dog.ceo/api/breeds/image/random');
        res.json({ imageUrl: data.message });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

async function scrapeInstagram(username, password, instagram_profile_link) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    try {
        await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle0' });
        await page.type('input[name="username"]', username);
        await page.type('input[name="password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForNavigation();
        if (page.url().includes('https://www.instagram.com/accounts/login')) {
            console.log('Login failed. Incorrect username or password.');
            await browser.close();
            return { error: 'Login failed. Incorrect username or password.' };
        }
        await page.goto(instagram_profile_link, { waitUntil: 'networkidle0' });
        await autoScroll(page);
        // Extract data (example: scraping post URLs)
        const postLinks = await page.evaluate(() => {
            const links = [];
            document.querySelectorAll('a[href^="/p/"]').forEach(link => {
                links.push('https://www.instagram.com' + link.getAttribute('href'));
            });
            return links;
        });
        await browser.close();
        return postLinks;
    } catch (error) {
        console.error('An error occurred:', error);
        await browser.close();
        return { error: 'An error occurred while scraping Instagram.' };
    }
}


async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

function insertInstaData(userData) {
    return new Promise(function(resolve, reject) {
        instagram.create(userData)
            .then(function(createdUser) {
                resolve(createdUser);
            })
            .catch(function(error) {
                console.error('Error in Creating User:', error);
                reject(error);
            });
    });
}

module.exports={
    getWeatherByLocation,
    getInstaData,
    chuckNorris
}