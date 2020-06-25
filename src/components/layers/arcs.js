import { ArcLayer } from '@deck.gl/layers';
const arcs = ({ data, providers }) => {
   return new ArcLayer({
      id: 'arc-layer',
      data,
      pickable: true,
      autoHighlight: true,
      highlightColor: [249, 226, 0],
      getWidth: 4,
      getSourcePosition: (d) => d.properties.startCoordinates,
      getTargetPosition: (d) => d.properties.endCoordinates,
      getSourceColor: (d) => {
         let provider = d.properties.provider;
         return providers.filter((x) => x.name === provider)[0]
            .color2;
      },
      getTargetColor: (d) => {
         let provider = d.properties.provider;
         return providers.filter((x) => x.name === provider)[0]
            .color2;
      },
   });
};

export default arcs;
