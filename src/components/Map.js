import React, { useEffect, useState, useMemo, useRef } from 'react';

import { MapView } from '@deck.gl/core';
import GridLabels from './GridLabels';
import { viewStates as initialViewStates, MAPBOX_TOKEN } from '../config';
import DeckGL from '@deck.gl/react';
import { StaticMap } from 'react-map-gl';
import getGridView from '../views';

import hexLayer from './layers/hex';
import arcLayer from './layers/arcs';
import pathLayer from './layers/paths';
import tripLayer from './layers/trips';
import filterState from '../util/filter';
import { connect } from 'react-redux';
import interpolate from '../util/interpolate';

const Map = ({ activeView, activeLayer, data, zoom, providers }) => {
   const [time, setTime] = useState(0);
   const [viewStates, setViewStates] = useState(initialViewStates);
   const [animation, setAnimation] = useState(false);

   useEffect(() => {
      document.getElementById('deckgl-overlay').oncontextmenu = (evt) =>
         evt.preventDefault();
   }, []);
   // console.log(activeLayer === 'animate');

   const interval = useRef(null);

   const step = () => {
      console.log(activeLayer);
      setTime((t) => t + 1);
      setViewStates((temp) => {
         const copy = [...temp];
         copy[0] = {
            ...copy[0],
            bearing: copy[0].bearing + 0.04,
         };
         return copy;
      });
      requestAnimationFrame(step);
   };

   useEffect(() => {
      if (activeLayer === 'animate') {
         // setAnimation(true);

         interval.current = requestAnimationFrame(step);
      } else {
         console.log('cancel...');
         cancelAnimationFrame(interval.current);
         interval.current = null;
      }

      return () => cancelAnimationFrame(interval.current);
   }, [activeLayer === 'animate']);

   const tripsData = useMemo(() => interpolate(data), [
      ...providers.map((x) => x.active),
   ]);

   const views = getGridView(activeView);

   const layers = [
      activeLayer === 'animate'
         ? tripLayer({ data: tripsData, providers, time })
         : activeLayer === 'polylines'
         ? pathLayer({
              data,
              providers,
           })
         : activeLayer === 'hexbins'
         ? hexLayer({
              data,
              zoom,
           })
         : arcLayer({ data, providers }),
   ];

   return (
      <div className="map-container">
         {activeView === 'grid' && <GridLabels labels={viewStates} />}
         <DeckGL
            layers={layers}
            onViewStateChange={({ viewId, viewState }) => {
               setViewStates((temp) => {
                  const copy = [...temp];
                  copy[Number(viewId)] = viewState;
                  return copy;
               });
            }}
            onClick={(evt) => console.log(viewStates[0])}
         >
            {views.map((view, i) => {
               return (
                  <MapView
                     {...view}
                     id={i.toString()}
                     key={i}
                     initialViewState={viewStates[i]}
                     viewState={viewStates[i]}
                  >
                     <StaticMap mapboxApiAccessToken={MAPBOX_TOKEN} />
                  </MapView>
               );
            })}
         </DeckGL>
      </div>
   );
};

const mapStateToProps = (state) => filterState(state);
const mapDispatchToProps = (dispatch) => ({ dispatch });
export default connect(mapStateToProps, mapDispatchToProps)(Map);
