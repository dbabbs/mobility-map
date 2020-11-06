import { ArcLayer } from '@deck.gl/layers';
const arcs = ({ data, providers, activeRoute, setActiveRoute }) => {
   return new ArcLayer({
      id: 'arc-layer',
      data,
      pickable: true,
      // autoHighlight: true,
      // highlightColor: [249, 226, 0],
      getWidth: 4,
      getSourcePosition: (d) => d.properties.startCoordinates,
      getTargetPosition: (d) => d.properties.endCoordinates,
      getSourceColor: (d, { index }) => {
         const provider = d.properties.provider;
         const color = providers.filter((x) => x.name === provider)[0].color2;
         if (activeRoute === -1) {
            return color;
         } else {
            if (index === activeRoute) {
               return [...color.slice(0, 3), 255];
            } else {
               return [...color.slice(0, 3), 0];
            }
         }
      },
      getTargetColor: (d, { index }) => {
         const provider = d.properties.provider;
         const color = providers.filter((x) => x.name === provider)[0].color2;
         if (activeRoute === -1) {
            return color;
         } else {
            if (index === activeRoute) {
               return [...color.slice(0, 3), 255];
            } else {
               return [...color.slice(0, 3), 0];
            }
         }
      },
      updateTriggers: {
         getTargetColor: [activeRoute],
         getSourceColor: [activeRoute],
      },
      transitions: {
         getTargetColor: 100,
         getSourceColor: 100,
      },
      onHover: ({ index, object }) => {
         if (object) {
            setActiveRoute(index);
         } else {
            setActiveRoute(-1);
         }
      },
   });
};

export default arcs;
