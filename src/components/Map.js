import React, { useEffect } from 'react';

import { MapView } from '@deck.gl/core';
import GridLabels from './GridLabels';
import { viewStates, MAPBOX_TOKEN } from '../config';
import DeckGL from '@deck.gl/react';
import { StaticMap, FlyToInterpolator } from 'react-map-gl';
import getGridView from '../views';

import hexLayer from './layers/hex';
import arcLayer from './layers/arcs';
import pathLayer from './layers/paths';
import filterState from '../util/filter';
import { connect } from 'react-redux';

const Map = ({ activeView, activeLayer, data, zoom, providers, dispatch }) => {
   useEffect(() => {
      document.getElementById('deckgl-overlay').oncontextmenu = (evt) =>
         evt.preventDefault();
   }, []);

   const views = getGridView(activeView);

   const layers = [
      activeLayer === 'polylines'
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
            onViewStateChange={(payload) =>
               dispatch({ type: 'SET_VIEW_STATE', payload })
            }
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
