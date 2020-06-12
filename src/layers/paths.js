import { PathLayer } from '@deck.gl/layers';
const paths = ({ data, transitionData, transitionActive, providers }) => {
   return new PathLayer({
      id: 'path-layer',
      data: transitionActive ? transitionData : data,
      widthScale: 3,
      widthMinPixels: 3,
      widthMaxPixels: 3,
      getPath: (d) =>
         transitionActive ? d.coordinates : d.geometry.coordinates,
      getColor: (d) => {
         let provider = transitionActive ? d.provider : d.properties.provider;
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
