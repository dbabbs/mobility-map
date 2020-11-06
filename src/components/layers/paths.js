import { PathLayer } from '@deck.gl/layers';
const paths = ({ data, providers, activeRoute, setActiveRoute }) => {
   return new PathLayer({
      id: 'path-layer',
      data,
      widthScale: 3,
      widthMinPixels: 3,
      widthMaxPixels: 3,
      getPath: (d) => d.geometry.coordinates,
      getColor: (d, { index }) => {
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
      rounded: true,
      getWidth: 10,
      pickable: true,
      // autoHighlight: true,
      highlightColor: [249, 226, 0],
      parameters: {
         depthTest: false,
      },
      onHover: ({ index, object }) => {
         if (object) {
            setActiveRoute(index);
         } else {
            setActiveRoute(-1);
         }
      },
      updateTriggers: {
         getColor: [activeRoute],
      },
      transitions: {
         getColor: 100,
      },
   });
};

export default paths;
