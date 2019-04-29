import React from 'react';
import {StaticMap, FlyToInterpolator } from 'react-map-gl';
import {GeoJsonLayer, PathLayer, ArcLayer} from '@deck.gl/layers';
import {HexagonLayer} from '@deck.gl/aggregation-layers';
import './App.css';

// import LinearInterpolator from '@deck.gl/core';



import mapStyle from './style.json'


import Selector from './Components/Selector/Selector';
import Section from './Components/SidebarSection/Section'
import ProviderList from './Components/ProviderList/ProviderList';
import BottomBar from './Components/BottomBar/BottomBar';

import Sidebar from './Components/Sidebar/Sidebar';

// import {experimental} from 'deck.gl';

import DeckGL from '@deck.gl/react';
import data from './mobility-data.json';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZGJhYmJzIiwiYSI6ImNqN2d2aDBvczFkNmEycWt5OXo0YnY3ejkifQ.h1gKMs1F18_AhB09s91gWg';
// const initialViewState = { longitude: -122.335167, latitude: 47.608013, zoom: 11, pitch: 60, bearing: -20};
const sizeLookup = { 1: 500000, 2: 200000, 3: 100000, 4: 50000, 5: 25000, 6: 12500, 7: 6250, 8: 3000,
   9: 1200, 10: 600, 11: 400, 12: 200, 13: 100, 14: 80, 15: 40, 16: 20, 17: 10, 18: 5, 19: 5, 20:5}


const initialViewState = {
   longitude: -122.35021467990396,
   latitude: 47.623954436942995,
   zoom: 8,
   pitch: 60,
   bearing: -20
};

const transitionInterpolator = new FlyToInterpolator();

/*
TODO: slick transition between button selectors
TODO: Design map style
TODO: add icon attribution
TODO: camera panning animation
TODO: Add XYZ Space
TODO: Grid view
*/

class App extends React.Component {

   constructor(props) {
      super(props);
      this.state = {
         viewState: initialViewState,
         data: data,
         trips: [],
         time: 0,
         curr: 0, //0,
         providers: [
            {
               name: 'uber',
               color: '#276EF1',
               color2: [39, 110, 241],
               modes: ['car'],
               active: true
            },
            {
               name: 'jump',
               color: '#E73A14',
               color2: [231, 58, 20],
               modes: ['bike', 'scooter'],
               active: true
            },
            {
               name: 'lime',
               color: '#25CF00',
               color2: [37, 207, 0],
               modes: ['bike', 'scooter'],
               active: true
            },
            {
               name: 'lyft',
               color: '#FE00D8',
               color2: [254, 0, 126],
               modes: ['car'],
               active: true
            },
         ],
         activeMetric: 'trips',
         activeLayer: 'polylines',
         activeView: 'single',
         minDate: new Date('08/07/1995'),
         maxDate: new Date()
      }
   }
   changeActive = (type, value) => {

      if (type === 'metric') {
         this.setState({
            activeMetric: value
         })
      } else if (type === 'layer') {
         this.setState({
            activeLayer: value
         })
      } else if (type === 'view') {
         this.setState({
            activeView: value
         })
      }

   }

   componentDidMount = () => {

      const min = Math.min.apply(null,
         this.state.data.features.map(x => new Date(x.properties.startDate))
      );
      const max = Math.max.apply(null,
         this.state.data.features.map(x => new Date(x.properties.startDate))
      );
      this.setState({
         minDate: min,
         maxDate: max
      })
      document.getElementById('deckgl-overlay').oncontextmenu = evt => evt.preventDefault();

   }
   animate() {

      //
      const data = this.state.data.features
         .filter(x => x.geometry);
      const max = Math.max.apply(
         null, data.map(x => x.geometry.coordinates.length)
      )
      this.setState({
         transitionActive: true
      })
      setTimeout(() => {
         const timer = setInterval(() => {

            this.setState({
               curr: this.state.curr + 1,
               // transitionActive: true
            })

            if (this.state.curr === 150) {
               clearInterval(timer)
               this.setState({
                  transitionActive: false
               })
            }

         }, 15)
      },2000)

   }

   renderTooltip = () => {
      const {x, y, tooltip} = this.state;

      if (tooltip) {
         return tooltip && (

            <div
               className="tooltip"
               style={{left: this.state.x, top: this.state.y, borderTop: `2px solid ${this.state.providers[1].color}`}}
            >
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

   rotateCamera = () => {
    // change bearing by 120 degrees.
    // const bearing = this.state.viewState.bearing + 5;
      this.setState({
         viewState: {
            zoom: 11,
            latitude: 47.61931309876645,
            longitude: -122.38086333961408,
            bearing: 22,
            pitch: 40,
            transitionDuration: 5000,
            transitionEasing: t => t,
            transitionInterpolator,
         }
      });
   }

   onLoad = () => {
      this.rotateCamera();
      this.animate();
   }

   toggleProviders = (p) => {

      const providers = this.state.providers.map(x => {
         if (x.name === p) {
            x.active = !x.active;
         }
         return x;
      })


      this.setState({
         providers: providers
      })
   }

   filterDate = evt => {
      this.setState({
         minDate: new Date(evt[0]),
         maxDate: new Date(evt[1])
      })

   }

   onViewStateChange = ({viewState}) => {
      this.setState({viewState});
      console.log(viewState);
      if (viewState.zoom > 1) {
         this.setState({zoom: viewState.zoom})
      }
  }


   render() {

      const min = Math.min.apply(null,
         this.state.data.features.map(x => new Date(x.properties.startDate))
      );
      const max = Math.max.apply(null,
         this.state.data.features.map(x => new Date(x.properties.startDate))
      );


      let data = [];
      let hexd = [];

      const transitionData = this.state.data.features.map(feature => {
         return {
            coordinates: feature.geometry.coordinates.slice(0, this.state.curr),
            provider: feature.properties.provider
         }
      })



      for (let i = 0; i < this.state.providers.length; i++) {
         if (this.state.providers[i].active) {
            data.push(
               ...this.state.data.features.filter(x => x.properties.provider === this.state.providers[i].name)
            )
         }
      }
      data = data.filter(x => new Date(x.properties.startDate) >= this.state.minDate)
         .filter(x => new Date(x.properties.startDate) <= this.state.maxDate)


      hexd = data.map(x => x.geometry.coordinates).flat();



      const pathLayer = new PathLayer({
         id: 'path-layer',
         data: this.state.transitionActive ? transitionData : data,
         pickable: true,
         widthScale: 20,
         widthMinPixels: 2,
         getPath: d => this.state.transitionActive ? d.coordinates : d.geometry.coordinates,//.slice(0, this.state.curr),
         getColor: d => {
            let provider = this.state.transitionActive ? d.provider : d.properties.provider;
            return this.state.providers.filter(x => x.name === provider)[0].color2;
         },
         getWidth: d => 1,
         onHover: ({x, y, object}) => this.setTooltip(x, y, object ? object : null)
      });

      const hexLayer = new HexagonLayer({
         id: 'hexagon-layer',
         data: hexd,
         pickable: true,
         extruded: true,
         radius: sizeLookup[Math.round(this.state.zoom)],
         elevationScale: 4,
         getPosition: d => d,
         // onHover: ({object, x, y}) => {}
      });

      const arcLayer = new ArcLayer({
         id: 'arc-layer',
         data: data,
         pickable: true,
         getWidth: 3,
         getSourcePosition: d => d.properties.startCoordinates,
         getTargetPosition: d => d.properties.endCoordinates,
         getSourceColor: d => [Math.sqrt(d.inbound), 140, 0],
         getTargetColor: d => [Math.sqrt(d.outbound), 140, 0],
      });
      const layers = [];
      if (this.state.activeLayer === 'polylines') {
         layers.push(pathLayer);
      }
      if (this.state.activeLayer === 'hexbins') {
         layers.push(hexLayer);
      }
      if (this.state.activeLayer === 'arcs' ) {
         layers.push(arcLayer);
      }

      return (
         <>
            {
               this.renderTooltip()
            }
            <Sidebar>
               <h1>Dylan's Mobility Map</h1>
               <p>An overview of my mobility service activity across cities. With the exception of Lyft, all data was acquired through GDPR requests.</p>

               <Section>
                  <h2>View Analytics</h2>
                  <Selector
                     type="metric"
                     options={['trips', 'price', 'distance']}
                     active={this.state.activeMetric}
                     changeActive={this.changeActive}
                  />
                  <ProviderList
                     handleClick={this.toggleProviders}
                     providers={this.state.providers}
                     data={data}
                     active={this.state.activeMetric}
                   />
                <p style={{margin: 0}}>
                   Filter a particular company by clicking on it.
                </p>
               </Section>
               <Section>
                  <h2>Toggle Layer</h2>
                  <Selector
                     type="layer"
                     options={['polylines', 'hexbins', 'arcs']}
                     active={this.state.activeLayer}
                     changeActive={this.changeActive}
                  />
                  <p style={{margin: 0}}>
                     Switch between individual trip lines and aggregated locations.
                  </p>
               </Section>
               <Section>
                  <h2>Toggle Grid View</h2>
                  <Selector
                     type="view"
                     options={['single', 'grid']}
                     active={this.state.activeView}
                     changeActive={this.changeActive}
                  />
               <p style={{margin: 0}}>
                     Switch between a single map view and multiple city map views.
                  </p>
               </Section>
            </Sidebar>
            <BottomBar
               data={data}
               min={min}
               max={max}
               currMin={this.state.minDate}
               currMax={this.state.maxDate}
               filterDate={this.filterDate}
            />
            <DeckGL
               initialViewState={initialViewState}
               viewState={this.state.viewState}
               onLoad={this.onLoad}
               controller={true}
               layers={layers}
               minZoom={3}
               onViewStateChange={this.onViewStateChange}
            >
               <StaticMap
                  mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
                  mapStyle={mapStyle}
                  mapStyle="mapbox://styles/mapbox/dark-v9"
               />
            </DeckGL>
         </>
      );
   }

}

/* TODO:
<div>Icons made by <a href="https://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" 			    title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" 			    title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
*/

export default App;
