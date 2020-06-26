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
      colorRange: ['#f1eef6', '#bdc9e1', '#74a9cf', '#0570b0'].map((x) =>
         hextToRgba(x)
      ),
   });
};

export default hex;
