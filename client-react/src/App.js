import React from 'react';
import {StaticMap} from 'react-map-gl';
import {GeoJsonLayer, PathLayer} from '@deck.gl/layers';
import './App.css';
import {TripsLayer} from '@deck.gl/geo-layers';

import Sidebar from './Components/Sidebar/Sidebar';


import DeckGL from '@deck.gl/react';
import data from './mobility-data.json';
import tripsData from './trips-data.json';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZGJhYmJzIiwiYSI6ImNqN2d2aDBvczFkNmEycWt5OXo0YnY3ejkifQ.h1gKMs1F18_AhB09s91gWg';
const initialViewState = { longitude: -122.335167, latitude: 47.608013, zoom: 11, pitch: 0, bearing: 0};


class App extends React.Component {

   constructor(props) {
      super(props);
      this.state = {
         data: data,
         tripsData: tripsData,
         trips: [],
         time: 0,
         curr: 0
      }
   }

   componentDidMount = () => {
      this.animate();
   }
   animate() {
      const max = Math.max.apply(
         null, this.state.data.features.map(x => x.geometry.coordinates.length)
      )


      const timer = setInterval(() => {
         // console.log(this.state.curr + 1)
         this.setState({
            curr: this.state.curr + 1
         })
         if (this.state.curr === max) {
            clearInterval(timer)
         }

      }, 20)
   }

   renderTooltip = () => {
      console.log('yitt')
      const {x, y, tooltip} = this.state;

      if (tooltip) {
         return tooltip && (
            <div className="tooltip" style={{left: this.state.x, top: this.state.y}}>
               <div>
                  <span className="key">Provider</span>
                  <span className="value">Uber</span>
               </div>
               <div>
                  <span className="key">Distance</span>
                  <span className="value">15 miles</span>
               </div>
               <div>
                  <span className="key">Date</span>
                  <span className="value">August 17th, 2019</span>
               </div>
               <div>
                  <span className="key">Price</span>
                  <span className="value">$15.04</span>
               </div>
               <div>
                  <span className="key">Mode</span>
                  <span className="value">Scooter</span>
               </div>
            </div>
         );
      }
      return null;

   }

   setTooltip(x, y, object) {
      this.setState({x, y, tooltip: object});
   }

   render() {
      // console.log(this.state.tripsData);
      // const geojsonLayer = new GeoJsonLayer({
      //    id: 'geojson-layer',
      //    data: this.state.data,
      //    pickable: true,
      //    stroked: false,
      //    lineWidthScale: 1,
      //    lineWidthMinPixels: 1,
      //    getLineColor: [0, 0, 0, 200],
      //    getLineWidth: 1,
      //    getElevation: 30,
      // });
      // const tripsLayer = new TripsLayer({
      //    id: 'trips-layer',
      //    data: this.state.trips,
      //    getPath: d => d.waypoints.map(p => [p.coordinates[0], p.coordinates[1], p.timestamp]),
      //    getColor: [250,250,250],
      //    opacity: 1,
      //    widthMinPixels: 5,
      //    rounded: true,
      //    trailLength: 200,
      //    currentTime: 100
      // });

      const d = this.state.data.features.map(row => {
         return row.geometry.coordinates.slice(0, this.state.curr);
      })
      // console.log(this.state.curr);
      const pathLayer = new PathLayer({
         id: 'path-layer',
         data: d,
         pickable: true,
         widthScale: 20,
         widthMinPixels: 2,
         getPath: d => d,
         getColor: d => [255,255,255],
         getWidth: d => 1,
         onHover: ({x, y, object}) => this.setTooltip(x, y, object ? object : null)
      });

      return (
         <>
            {
               this.renderTooltip()
            }

            <Sidebar />
            <DeckGL
               initialViewState={initialViewState}
               controller={true}
               layers={[pathLayer]}
               minZoom={3}
            >
               <StaticMap
                  mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
                  mapStyle="mapbox://styles/mapbox/dark-v9"
               />
            </DeckGL>
         </>
      );
   }

}

export default App;
