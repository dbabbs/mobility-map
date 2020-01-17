const polyline = require('@mapbox/polyline');
const Papa = require('papaparse');
const fs = require('fs');
const fetch = require('node-fetch');

const here = require('./credentials.js');

let uber = Papa.parse(
   fs.readFileSync('./trips_data.csv', 'utf8'),
   {header: true}
).data;

let jump = Papa.parse(
   fs.readFileSync('./jump-trips.csv', 'utf8'),
   {header: true}
).data
.filter(x => x['Rental Status'] !== '');

// console.log(jump)

const currency = {
   EUR: 1.11,
   GBP: 1.29,
   PLN: 0.26,
   TRY: 0.17,
   USD: 1
}
//
//
// /*
// Data notes
//
// Distance: miles
// */

async function geocode(query) {
   const url = `https://geocoder.api.here.com/6.2/geocode.json?app_id=${here.id}&app_code=${here.code}&searchtext=${query}`
   const data = await (await fetch(url) ).json();
   if (data.hasOwnProperty('Response') && data.Response.View.length > 0 ) {
      return await data.Response.View[0].Result[0].Location.NavigationPosition[0];
   } else {
      return 'error';
   }
}

async function route(start, end, mode = 'car',) {
   const url = `https://route.api.here.com/routing/7.2/calculateroute.json?app_id=${here.id}&app_code=${here.code}&waypoint0=geo!${start.Latitude},${start.Longitude}&waypoint1=geo!${end.Latitude},${end.Longitude}&mode=fastest;${mode};traffic:disabled&routeattributes=shape`
   // console.log(url);
   const data = await ( await fetch(url) ).json().catch(e => console.log(url));
   if (data.hasOwnProperty('response')) {
      if (data.response.hasOwnProperty('route')) {
         const distance = await data.response.route[0].summary.distance;
         const polyline = await data.response.route[0].shape.map(
            x => [
               Number(x.split(",")[1]),
               Number(x.split(",")[0])
            ]
         );
         return {
            routeError: false,
            distance: distance,
            polyline: polyline
         }
      } else {
         return {
            routeError: true,
            distance: '',
            polyline: []
         }
      }
   } else {
      return {
         routeError: true,
         distance: '',
         polyline: []
      }
   }


}

async function start() {

   uber = uber.filter(row => row['Product Type'] !== 'UberEATS Marketplace')
   .filter(row => row['Trip or Order Status'] === 'COMPLETED')

   const uberPromises = uber.map(async row => {
      const startCoordinates = {
         Latitude: Number(row['Begin Trip Lat']),
         Longitude: Number(row['Begin Trip Lng'])
      }
      const endCoordinates = {
         Latitude: Number(row['Dropoff Lat']),
         Longitude: Number(row['Dropoff Lng'])
      }
      const { polyline, routeError } = await route(startCoordinates, endCoordinates);
      // routeError && console.log(routeError)

      const mod = {
         type: 'Feature',
         geometry: {
            type: 'LineString',
            coordinates: routeError ? 'error' : polyline,
         },
         properties: {}
      };
      mod.properties.cost = currency[row['Fare Currency']] * Number(row['Fare Amount']);
      mod.properties.provider = 'uber';
      mod.properties.startDate = new Date(row['Begin Trip Time']);
      mod.properties.distance = Number(row['Distance (miles)']);
      mod.properties.startCoordinates = [Number(row['Begin Trip Lng']), Number(row['Begin Trip Lat'])];
      mod.properties.endCoordinates = [Number(row['Dropoff Lng']), Number(row['Dropoff Lat'])];
      return mod;
   })
   uber = await Promise.all(uberPromises)



   const jumpPromises = jump.map(async row => {
      console.log(row)
      // console.log(row['Begin Rental Address'])
      const startGeocode = {Latitude: row['Begin Rental Lat'], Longitude: row['Begin Rental Lng'] };//await geocode(row['Begin Rental Address']);
      console.log(startGeocode);
      const endGeocode = {Latitude: row['Finish Rental Lat'], Longitude: row['Finish Rental Lng'] };
      console.log(endGeocode)
      const { polyline, routeError } = await route(startGeocode, endGeocode);
      routeError && console.log('jump error ' +routeError)

      const mod = {
         type: 'Feature',
         geometry: {
            type: 'LineString',
            coordinates: routeError ? 'error' : polyline,
         },
         properties: {}
      };
      mod.properties.cost = Number(row['Fare Amount'].toString().substring(1));
      console.log(mod.properties.cost)
      mod.properties.provider = 'jump';
      mod.properties.startDate = new Date(row['Begin Rental Time']);
      mod.properties.distance = Number(row['Distance (miles)']);
      mod.properties.startCoordinates = [startGeocode.Longitude, startGeocode.Latitude];
      mod.properties.endCoordinates = [endGeocode.Longitude, endGeocode.Latitude];
      return mod;
   })
   jump = await Promise.all(jumpPromises)

   


   const old = require('../src/data.json').features.filter(x => x.properties.provider !== 'uber' && x.properties.provider !== 'jump');

   console.log(old.length);

   const output = [...uber, ...jump, ...old]
      .filter(x => x.geometry.coordinates !== 'error');
   console.log(output.length)

   fs.writeFile('../src/updated.json', JSON.stringify({
      type: 'FeatureCollection',
      features: output
   }), function(err) {

       console.log("File was saved!");
   });
}


start();
