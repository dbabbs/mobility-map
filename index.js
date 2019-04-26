const polyline = require('@mapbox/polyline');
const Papa = require('papaparse');
const fs = require('fs');
const fetch = require('node-fetch');

const here = require('./credentials.js');


let lime = Papa.parse(
   fs.readFileSync('./data/lime.csv', 'utf8'),
   {header: true}
).data;

let lyft = Papa.parse(
   fs.readFileSync('./data/lyft.csv', 'utf8'),
   {header: true}
).data;
lyft = lyft.filter((x,i) => i !== lyft.length -1)



/*
Data notes

Distance: miles
*/

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
   const data = await ( await fetch(url) ).json();
   return await data.response.route[0].shape.map(
      x => [
         Number(x.split(",")[1]),
         Number(x.split(",")[0])
      ]
   );
}

async function start() {
   lime = lime.map(row => {
      const mod = {
         type: 'Feature',
         geometry: polyline.toGeoJSON(row.POLYLINE),
         properties: {}
      };
      mod.properties.cost = Number(row.COST_AMOUNT_CENTS) / 100;
      mod.properties.provider = 'Lime';
      mod.properties.startDate = row.STARTED_AT;
      mod.properties.endDate = row.COMPLETED_AT;
      mod.properties.distance = row.DISTANCE_METERS * 0.00062137;
      mod.properties.startCoordinates = [Number(row.START_LONGITUDE), Number(row.START_LATITUDE)];
      mod.properties.endCoordinates = [Number(row.END_LONGITUDE), Number(row.END_LATITUDE)];
      return mod;
   })

   const lyftPromises = lyft.map(async row => {
      const startGeocode = await geocode(row.origin);
      const endGeocode = await geocode(row.destination);

      const mod = {
         type: 'Feature',
         geometry: {
            type: 'LineString',
            coordinates: (startGeocode === 'error' || endGeocode === 'error') ? [0,0] : await route(startGeocode, endGeocode)
         },
         properties: {}
      };

      mod.provider = 'Lyft'
      mod.properties.cost = Number(row.total.substring(1));
      mod.properties.startDate = row.date;
      mod.properties.startAddress = row.origin;
      mod.properties.endAddress = row.destination;

      mod.properties.startCoordinates = startGeocode !== 'error' ? [startGeocode.Longitude, startGeocode.Latitude] : [0,0];
      mod.properties.endCoordinates = endGeocode !== 'error' ? [endGeocode.Longitude, endGeocode.Latitude] : [0,0];
      return mod;
   })

   // wait until all promises resolve
   lyft = await Promise.all(lyftPromises)


   fs.writeFile('output/mobility-data.json', JSON.stringify({
      type: 'FeatureCollection',
      features: [...lime, ...lyft]
   }), function(err) {
       if(err) {
           return console.log(err);
       }
       console.log("File was saved!");
   });

}



start();
