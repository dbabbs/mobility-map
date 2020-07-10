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
import filter from '../util/filter';
import { useSelector } from 'react-redux';
import interpolate from '../util/interpolate';

const Map = () => {
   const activeView = useSelector(({activeView})=>activeView);
   const activeLayer = useSelector(({activeLayer})=>activeLayer);
   const zoom = useSelector(({zoom})=>zoom);
   const providers = useSelector(({providers})=>providers);
   const minDate = useSelector(({minDate})=>minDate);
   const maxDate = useSelector(({maxDate})=>maxDate);
   const allData = useSelector(({data})=>data);
   const data = filter(allData, { providers, minDate, maxDate })
   const [time, setTime] = useState(0);
   const [viewStates, setViewStates] = useState(initialViewStates);
   useEffect(() => {
      document.getElementById('deckgl-overlay').oncontextmenu = (evt) =>
         evt.preventDefault();
   }, []);
   const interval = useRef(null);

   const step = () => {
      setTime((t) => t + 1);
      setViewStates((copy) =>
         [...copy].map((x) => ({
            ...x,
            bearing: x.bearing + 0.04,
         }))
      );
      requestAnimationFrame(step);
   };

   useEffect(() => {
      if (activeLayer === 'animate') {
         interval.current = requestAnimationFrame(step);
      } else {
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
            onClick={(evt) => console.log(viewStates[1])}
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

export default Map;
