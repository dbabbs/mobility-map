const polyline = require('@mapbox/polyline');
const Papa = require('papaparse');
const fs = require('fs');
const fetch = require('node-fetch');

const here = require('./credentials.js');

let lime = Papa.parse(fs.readFileSync('../data/lime.csv', 'utf8'), {
   header: true,
}).data;

let lyft = Papa.parse(fs.readFileSync('../data/lyft.csv', 'utf8'), {
   header: true,
}).data;
lyft = lyft.filter((x, i) => i !== lyft.length - 1);

let uber = Papa.parse(fs.readFileSync('../data/uber.csv', 'utf8'), {
   header: true,
}).data;

let jump = Papa.parse(fs.readFileSync('../data/jump.csv', 'utf8'), {
   header: true,
}).data.filter((x) => x['Rental Status'] !== '');

// console.log(jump)

const currency = {
   EUR: 1.11,
   GBP: 1.29,
   PLN: 0.26,
   TRY: 0.17,
   USD: 1,
};
//
//
// /*
// Data notes
//
// Distance: miles
// */

async function geocode(query) {
   const url = `https://geocoder.api.here.com/6.2/geocode.json?apikey=${here.key}&searchtext=${query}`;
   const data = await (await fetch(url)).json();
   if (data.hasOwnProperty('Response') && data.Response.View.length > 0) {
      return await data.Response.View[0].Result[0].Location
         .NavigationPosition[0];
   } else {
      return 'error';
   }
}

async function route(start, end, mode = 'car') {
   const url = `https://route.api.here.com/routing/7.2/calculateroute.json?apikey=${here.key}&waypoint0=geo!${start.Latitude},${start.Longitude}&waypoint1=geo!${end.Latitude},${end.Longitude}&mode=fastest;${mode};traffic:disabled&routeattributes=shape`;
   // console.log(url);
   const data = await (await fetch(url)).json().catch((e) => console.log(url));
   if (data.hasOwnProperty('response')) {
      if (data.response.hasOwnProperty('route')) {
         const distance = await data.response.route[0].summary.distance;
         const polyline = await data.response.route[0].shape.map((x) => [
            Number(x.split(',')[1]),
            Number(x.split(',')[0]),
         ]);
         return {
            routeError: false,
            distance: distance,
            polyline: polyline,
         };
      } else {
         return {
            routeError: true,
            distance: '',
            polyline: [],
         };
      }
   } else {
      return {
         routeError: true,
         distance: '',
         polyline: [],
      };
   }
}

async function start() {
   lime = lime
      .map((row) => {
         const mod = {
            type: 'Feature',
            geometry: polyline.toGeoJSON(row.POLYLINE),
            properties: {},
         };
         mod.properties.cost = Number(row.COST_AMOUNT_CENTS) / 100;
         mod.properties.provider = 'lime';
         mod.properties.startDate = new Date(row.STARTED_AT);
         mod.properties.distance = row.DISTANCE_METERS * 0.00062137;
         mod.properties.startCoordinates = [
            Number(row.START_LONGITUDE),
            Number(row.START_LATITUDE),
         ];
         mod.properties.endCoordinates = [
            Number(row.END_LONGITUDE),
            Number(row.END_LATITUDE),
         ];
         return mod;
      })
      .filter((x) => x.geometry.coordinates.length > 1);

   const lyftPromises = lyft.map(async (row) => {
      const startGeocode = await geocode(row.origin);
      const endGeocode = await geocode(row.destination);

      const { polyline, distance, routeError } = await route(
         startGeocode,
         endGeocode
      );
      const mod = {
         type: 'Feature',
         geometry: {
            type: 'LineString',
            coordinates: routeError ? 'error' : polyline,
         },
         properties: {},
      };

      mod.properties.provider = 'lyft';
      mod.properties.cost = Number(row.total.substring(1));
      mod.properties.startDate = new Date(row.date);

      mod.properties.distance = routeError ? 0 : distance * 0.00062137;

      mod.properties.startCoordinates =
         startGeocode !== 'error'
            ? [startGeocode.Longitude, startGeocode.Latitude]
            : [0, 0];
      mod.properties.endCoordinates =
         endGeocode !== 'error'
            ? [endGeocode.Longitude, endGeocode.Latitude]
            : [0, 0];
      return mod;
   });

   lyft = await Promise.all(lyftPromises);

   uber = uber
      .filter((row) => row['Product Type'] !== 'UberEATS Marketplace')
      .filter((row) => row['Trip or Order Status'] === 'COMPLETED');

   const uberPromises = uber.map(async (row) => {
      const startCoordinates = {
         Latitude: Number(row['Begin Trip Lat']),
         Longitude: Number(row['Begin Trip Lng']),
      };
      const endCoordinates = {
         Latitude: Number(row['Dropoff Lat']),
         Longitude: Number(row['Dropoff Lng']),
      };
      const { polyline, routeError } = await route(
         startCoordinates,
         endCoordinates
      );
      // routeError && console.log(routeError)

      const mod = {
         type: 'Feature',
         geometry: {
            type: 'LineString',
            coordinates: routeError ? 'error' : polyline,
         },
         properties: {},
      };
      mod.properties.cost =
         currency[row['Fare Currency']] * Number(row['Fare Amount']);
      mod.properties.provider = 'uber';
      mod.properties.startDate = new Date(row['Begin Trip Time']);
      mod.properties.distance = Number(row['Distance (miles)']);
      mod.properties.startCoordinates = [
         Number(row['Begin Trip Lng']),
         Number(row['Begin Trip Lat']),
      ];
      mod.properties.endCoordinates = [
         Number(row['Dropoff Lng']),
         Number(row['Dropoff Lat']),
      ];
      return mod;
   });
   uber = await Promise.all(uberPromises);

   const jumpPromises = jump.map(async (row) => {
      console.log(row);
      // console.log(row['Begin Rental Address'])
      const startGeocode = await geocode(row['Begin Rental Address']);
      // console.log(geoCode);
      const endGeocode = await geocode(row['Finish Rental Address']);

      const { polyline, routeError } = await route(startGeocode, endGeocode);
      routeError && console.log('jump error ' + routeError);

      const mod = {
         type: 'Feature',
         geometry: {
            type: 'LineString',
            coordinates: routeError ? 'error' : polyline,
         },
         properties: {},
      };
      mod.properties.cost = Number(row['Fare Amount'].toString().substring(1));
      console.log(mod.properties.cost);
      mod.properties.provider = 'jump';
      mod.properties.startDate = new Date(row['Begin Rental Time']);
      mod.properties.distance = Number(row['Distance (miles)']);
      mod.properties.startCoordinates = [
         startGeocode.Longitude,
         startGeocode.Latitude,
      ];
      mod.properties.endCoordinates = [
         endGeocode.Longitude,
         endGeocode.Latitude,
      ];
      return mod;
   });
   jump = await Promise.all(jumpPromises);

   const output = [...lime, ...uber, ...lyft, ...jump].filter(
      (x) => x.geometry.coordinates !== 'error'
   );

   fs.writeFile(
      '../src/mobility-data.json',
      JSON.stringify({
         type: 'FeatureCollection',
         features: output,
      }),
      function (err) {
         console.log('File was saved!');
      }
   );
}

start();
