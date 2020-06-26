import { TripsLayer } from '@deck.gl/geo-layers';

const trips = ({ data, providers, time }) => {
   return new TripsLayer({
      id: 'trips-layer',
      data,
      getPath: (d) => d.path, //.map((p) => p.coordinates),
      // deduct start timestamp from each data point to avoid overflow
      getTimestamps: (d, { index }) => d.path.map((x, i) => i + index * 2),
      getColor: ({ provider }) =>
         providers.filter((x) => x.name === provider)[0].color2,
      opacity: 1,
      widthMinPixels: 3,
      rounded: true,
      trailLength: 200,
      currentTime: time,
   });
};

export default trips;
