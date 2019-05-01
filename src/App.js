import React from 'react';
import {StaticMap, FlyToInterpolator } from 'react-map-gl';
import {GeoJsonLayer, PathLayer, ArcLayer} from '@deck.gl/layers';
import {HexagonLayer} from '@deck.gl/aggregation-layers';
import './App.css';

import Button from './Components/Button/Button'
import mapStyle from './style.json'

import {View, MapView} from '@deck.gl/core';

import {
  CSSTransition,
  TransitionGroup,
} from 'react-transition-group';

// import mapStyle from './style.json'


import Selector from './Components/Selector/Selector';
import Section from './Components/SidebarSection/Section'
import ProviderList from './Components/ProviderList/ProviderList';
import BottomBar from './Components/BottomBar/BottomBar';

import Sidebar from './Components/Sidebar/Sidebar';

// import {experimental} from 'deck.gl';

import DeckGL from '@deck.gl/react';

// import {MapView} from '@deck.gl/core';
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

const mapViews = [
   {
      longitude: -122.35021467990396,
      latitude: 47.623954436942995,
      zoom: 15, //8
      pitch: 60,
      bearing: -20
   },
   //Berlin
   {
      longitude: 13.404954,
      latitude: 52.520008,
      zoom: 10,
      pitch: 60,
      bearing: 0
   },
   //SF
   {
      longitude: -122.41251212803706,
      latitude: 37.77116905512072,
      zoom: 8,
      pitch: 20,
      bearing: 0
   },
   //San Diego
   {
      longitude: -117.19453161713136,
      latitude: 32.7459306899641,
      zoom: 8,
      pitch: 20,
      bearing: 0
   },
   //Chicago
   {
      longitude: -87.65142984345374,
      latitude: 41.87225195677442,
      zoom: 10,
      pitch: 20,
      bearing: 0
   },
   //San Juan
   {
      longitude: -66.06411721833007,
      latitude: 18.465526764926423,
      zoom: 11,
      pitch: 20,
      bearing: 0
   },
   //Detroit
   {
      longitude: -83.03440701349251,
      latitude: 42.34305805549184,
      zoom: 8,
      pitch: 20,
      bearing: 0
   },
   //Instanbul
   {
      longitude: 28.979530,
      latitude: 41.015137,
      zoom: 10,
      pitch: 20,
      bearing: 0
   },
   //Amsterdam
   {
      longitude: 4.899431,
      latitude: 52.379189,
      zoom: 10,
      pitch: 20,
      bearing: 0
   }
]

const transitionInterpolator = new FlyToInterpolator();

/*
TODO: slick transition between button selectors
TODO: Design map style
TODO: add icon attribution
TODO: Efficient map filtering
TODO: Add XYZ Space
TODO: Grid view
TODO: Anonymize data near home
*/

class App extends React.Component {

   constructor(props) {
      super(props);
      this.state = {
         sidebarOpen: true,
         in: true,
         viewState0: mapViews[0],
         viewState1: mapViews[1],
         viewState2: mapViews[2],
         viewState3: mapViews[3],
         viewState4: mapViews[4],
         viewState5: mapViews[5],
         viewState6: mapViews[6],
         viewState7: mapViews[7],
         viewState8: mapViews[8],
         data: data,
         trips: [],
         time: 0,
         curr: 0, //0,
         providers: [
            {
               name: 'uber',
               color: '#276EF1',
               // color2: [0,0,0],
               color2: [39, 110, 241, 200],
               modes: ['car'],
               active: true
            },
            {
               name: 'jump',
               color: '#E73A14',
               color2: [231, 58, 20, 200],
               modes: ['bike', 'scooter'],
               active: true
            },
            {
               name: 'lime',
               color: '#25CF00',
               color2: [37, 207, 0, 200],
               modes: ['bike', 'scooter'],
               active: true
            },
            {
               name: 'lyft',
               color: '#FE00D8',
               color2: [254, 0, 126, 200],
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
         this.forceUpdate();
      } else if (type === 'view') {
         this.setState({
            activeView: value
         })
         // this.animate();
         this.setState({
            in:true
         })
         setTimeout(() => {
            this.setState({
               in:false
            })
         }, 1000)
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
      console.log('aniamting')
      const data = this.state.data.features
         .filter(x => x.geometry);
      const max = Math.max.apply(
         null, data.map(x => x.geometry.coordinates.length)
      )
      this.setState({
         transitionActive: true,
         curr: 0
      })
      setTimeout(() => {
         const timer = setInterval(() => {

            this.setState({
               curr: this.state.curr + 1,
               // transitionActive: true
            })

            if (this.state.curr === 180) {
               clearInterval(timer)
               this.setState({
                  transitionActive: false
               })
            }

         }, 3)
      },2000)

   }

   moveSidebar = () => {
      this.setState({
         sidebarOpen: !this.state.sidebarOpen
      })
   }

   renderTooltip = () => {
      const {x, y, tooltip} = this.state;

      if (tooltip) {

         // console.log(color)
         console.log(tooltip)
         console.log(this.state.activeLayer)
         if (this.state.activeLayer === 'hexbins') {
            return tooltip && (

               <div
                  className="tooltip"
                  style={{left: this.state.x, top: this.state.y, borderTop: `2px solid black`}}
               >
                  <div>
                     <span className="key"># Pickups</span>
                     <span className="value">{tooltip.points.length}</span>
                  </div>
               </div>
            );
         } else {

            const color = this.state.providers.filter(x => x.name === tooltip.properties.provider)[0].color
            return tooltip && (

               <div
                  className="tooltip"
                  style={{left: this.state.x, top: this.state.y, borderTop: `2px solid ${color}`}}
               >
                  <div>
                     <span className="key">Provider</span>
                     <span className="value">{tooltip.properties.provider.charAt(0).toUpperCase() + tooltip.properties.provider.substring(1)}</span>
                  </div>
                  <div>
                     <span className="key">Distance</span>
                     <span className="value">{tooltip.properties.distance.toFixed(1)} miles</span>
                  </div>
                  <div>
                     <span className="key">Date</span>
                     <span className="value">{new Date(tooltip.properties.startDate).toLocaleString().split(',')[0]}</span>
                  </div>
                  <div>
                     <span className="key">Price</span>
                     <span className="value">${tooltip.properties.cost}</span>
                  </div>
               </div>
            );
         }

      }
      return null;

   }

   setTooltip(x, y, object) {
      this.setState({x, y, tooltip: object});
   }

   rotateCamera = () => {
      this.setState({
         in: false
      })
    // const bearing = this.state.viewState.bearing + 5;
      this.setState({
         viewState0: {
            zoom: 11,
            latitude: 47.61931309876645,
            longitude: -122.38086333961408,
            bearing: 22,
            pitch: 60,
            transitionDuration: 6000,
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

   onViewStateChange = (evt) => {

      const key = 'viewState' + evt.viewId;
      this.setState({
         [key]: evt.viewState
      })

      // this.setState({viewState});
      if (evt.viewState.zoom > 1) {
         this.setState({zoom: evt.viewState.zoom})
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
         const coords = feature.geometry.coordinates.slice(1, this.state.curr)
         // console.log(coords);
         return {
            coordinates: coords,
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

      hexd = [
         ...data.map(x => x.properties.startCoordinates),
         ...data.map(x => x.properties.endCoordinates)
      ]


      const pathLayer = new PathLayer({
         id: 'path-layer',
         data: this.state.transitionActive ? transitionData : data,

         widthScale: 3,
         widthMinPixels: 3,
         getPath: d => this.state.transitionActive ? d.coordinates : d.geometry.coordinates,//.slice(0, this.state.curr),
         getColor: d => {
            let provider = this.state.transitionActive ? d.provider : d.properties.provider;
            return this.state.providers.filter(x => x.name === provider)[0].color2;
         },
         rounded: true,
         getWidth: d => 10,
         pickable: true,
         autoHighlight: true,
         highlightColor: [249,226,0],
         onHover: ({x, y, object}) => !this.state.transitionActive && this.setTooltip(x, y, object ? object : null)
      });

      const hexLayer = new HexagonLayer({
         id: 'hexagon-layer',
         data: hexd,
         pickable: true,
         // extruded: true,
         radius: sizeLookup[Math.round(this.state.zoom)],
         elevationScale: 4,
         getPosition: d => d,
         colorRange: [
            [32,62,154],
            [85,29,173],
            [192,25,188],
            [211,19,86],
            [230,71,10],
            [249,226,0]
         ],
         onHover: ({x, y, object}) => !this.state.transitionActive && this.setTooltip(x, y, object ? object : null)

      });

      const arcLayer = new ArcLayer({
         id: 'arc-layer',
         data: data,
         pickable: true,
         autoHighlight: true,
         highlightColor: [249,226,0],
         getWidth: 4,
         getSourcePosition: d => d.properties.startCoordinates,
         getTargetPosition: d => d.properties.endCoordinates,
         getSourceColor: d => {
            let provider = d.properties.provider;
            return this.state.providers.filter(x => x.name === provider)[0].color2;
         },
         getTargetColor: d => {
            let provider = d.properties.provider;
            return this.state.providers.filter(x => x.name === provider)[0].color2;
         },
         onHover: ({x, y, object}) => this.setTooltip(x, y, object ? object : null)

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
      // console.log(this.state.per + '%')
      let views = [
         {
            id: '0',
            width: '100%',
            height: '100%',
            controller: true,
         },

      ]

      if (this.state.activeView === 'grid') {
         const size1 = 1 / 3 * 100 +'%';
         const size2 = 2 / 3 * 100 + '%';
         const size3 = '100%';
         views = [
            //Row 1
            {
               id: 'top',
               width: size1,
               height: size1,
               controller: true
            },
            {
               id: 'bottom',
               x: size1,
               y: 0,
               width: size1,
               height: size1,
               controller: true
            },
            {
               id: '2',
               x: size2,
               y: 0,
               width: size1,
               height: size1,
               controller: true
            },

            //Row 2
            {
               id: '3',
               x: 0,
               y: size1,
               width: size1,
               height: size1,
               controller: true
            },
            {
               id: '4',
               x: size1,
               y: size1,
               width: size1,
               height: size1,
               controller: true
            },
            {
               id: '5',
               x: size2,
               y: size1,
               width: size1,
               height: size1,
               controller: true
            },

            //Row 3
            {
               id: '6',
               x: 0,
               y: size2,
               width: size1,
               height: size1,
               controller: true
            },
            {
               id: '7',
               x: size1,
               y: size2,
               width: size1,
               height: size1,
               controller: true
            },
            {
               id: '8',
               x: size2,
               y: size2,
               width: size1,
               height: size1,
               controller: true
            },

         ]
      }
      return (
         <>
            {
               this.renderTooltip()
            }

            <CSSTransition
               timeout={1000}
               in={this.state.in}
               classNames="blur"
               onEnter={() => console.log('entering..')}
               unmountOnExit
               appear
            >

               <div className="cover"/>
            </CSSTransition>




            <Sidebar
               height={this.state.sidebarOpen ? "725px" : "102px"}
            >
               <h1>Dylan's Mobility Service Map</h1>


               {
                  this.state.sidebarOpen &&
                  <>
                     <p>A visualization of my mobility service trips.</p>
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
                            Filter a mobility provider by clicking on it.
                         </p>
                     </Section>
                     <Section>
                        <h2>Toggle Layer Type</h2>
                        <Selector
                           type="layer"
                           options={['polylines', 'hexbins', 'arcs']}
                           active={this.state.activeLayer}
                           changeActive={this.changeActive}
                        />
                        <p style={{margin: 0}}>
                           {
                              this.state.activeLayer === 'polylines' &&
                              'Polyines - approximate route of trip.'
                           }
                           {
                              this.state.activeLayer === 'hexbins' &&
                              'Hexbins - aggregated pickups & dropoffs.'
                           }
                           {
                              this.state.activeLayer === 'arcs' &&
                              'Arcs - pickup and dropoff points.'
                           }
                        </p>
                     </Section>
                     <Section
                        paddingBottom={0}
                      >
                        <h2>Toggle Grid View</h2>
                        <Selector
                           type="view"
                           options={['single', 'grid']}
                           active={this.state.activeView}
                           changeActive={this.changeActive}
                        />
                     <p style={{margin: 0}}>
                           Single city or multi city view.
                     </p>
                     </Section>
                  </>
               }

               <Button
                  text={this.state.sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                  handleClick={this.moveSidebar}
               />


            </Sidebar>
            {

               <BottomBar
                  left={this.state.sidebarOpen ? "calc(275px + 45px)" : "100vw"}
                  data={data}
                  min={min}
                  max={max}
                  currMin={this.state.minDate}
                  currMax={this.state.maxDate}
                  filterDate={this.filterDate}
               />

            }
            {
               /*
               initialViewState={initialViewState}
               viewState={this.state.viewState}
               onViewStateChange={this.onViewStateChange}
               */
            }
               <DeckGL
                  onLoad={this.onLoad}
                  layers={layers}
                  minZoom={3}
                  onViewStateChange={this.onViewStateChange}
               >
               {
                  views.map((x,i) => {
                     return (
                        <MapView
                           x={x.x}
                           y={x.y}
                           width={x.width}
                           height={x.height}
                           controller={x.controller}
                           id={i.toString()}
                           key={i}

                           initialViewState={this.state['viewState' + i]}
                           viewState={this.state['viewState' + i]}
                        >
                           <StaticMap
                              mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
                              mapStyle={mapStyle}

                           />
                        </MapView>
                     )
                  })
               }


               </DeckGL>



         </>
      );
   }

}

/*

*/

/* TODO:
<div>Icons made by <a href="https://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" 			    title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" 			    title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
*/

export default App;
