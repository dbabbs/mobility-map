import { TripsLayer } from '@deck.gl/geo-layers';

const trips = ({ data, providers, time }) => {
   return new TripsLayer({
      id: 'trips-layer',
      data,
      getPath: (d) => d.path,
      getTimestamps: (d, { index }) => d.path.map((x, i) => i + index),
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
