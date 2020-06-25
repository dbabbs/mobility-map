import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { sizeLookup } from '../../config';

function aggregate(data) {
   return [
      ...data.map((x) => x.properties.startCoordinates.map((x) => Number(x))),
      ...data.map((x) => x.properties.endCoordinates.map((x) => Number(x))),
   ];
}
const hex = ({ data, zoom }) => {
   return new HexagonLayer({
      id: 'hexagon-layer',
      data: aggregate(data),
      pickable: true,
      radius: sizeLookup[Math.round(zoom)],
      elevationScale: 4,
      getPosition: (d) => d,
      colorRange: [
         [32, 62, 154],
         [85, 29, 173],
         [192, 25, 188],
         [211, 19, 86],
         [230, 71, 10],
         [249, 226, 0],
      ],
   });
};

export default hex;
