import { PathLayer } from '@deck.gl/layers';
const paths = ({ data, providers }) => {
   return new PathLayer({
      id: 'path-layer',
      data,
      widthScale: 3,
      widthMinPixels: 3,
      widthMaxPixels: 3,
      getPath: (d) => d.geometry.coordinates,
      getColor: (d) => {
         const provider = d.properties.provider;
         return providers.filter((x) => x.name === provider)[0].color2;
      },
      rounded: true,
      getWidth: 10,
      pickable: true,
      autoHighlight: true,
      highlightColor: [249, 226, 0],
      parameters: {
         depthTest: false,
      },
   });
};

export default paths;
