import { HexagonLayer } from '@deck.gl/aggregation-layers';
import hextToRgba from '../../util/hexToRgba';
function aggregate(data) {
   return [
      ...data.map((x) => x.properties.startCoordinates.map((x) => Number(x))),
      ...data.map((x) => x.properties.endCoordinates.map((x) => Number(x))),
   ];
}
const hex = ({ data }) => {
   return new HexagonLayer({
      id: 'hexagon-layer',
      data: aggregate(data),
      pickable: true,
      radius: 80,
      extruded: true,
      elevationScale: 4,
      getPosition: (d) => d,
      colorRange: [
         '#ffffcc',
         '#c7e9b4',
         '#7fcdbb',
         '#41b6c4',
         '#2c7fb8',
         '#253494',
      ].map((x) => hextToRgba(x)),
   });
};

export default hex;
