import React from 'react';
import { easeCubic } from "d3-ease";

//DeckGL
import DeckGL from '@deck.gl/react';
import {StaticMap, FlyToInterpolator } from 'react-map-gl';
import {PathLayer, ArcLayer} from '@deck.gl/layers';
import {HexagonLayer} from '@deck.gl/aggregation-layers';
import {MapView} from '@deck.gl/core';

//CSS
import './App.css';

//Components
import mapStyle from './style.json'
import Selector from './Components/Selector/Selector';
import Section from './Components/SidebarSection/Section'
import ProviderList from './Components/ProviderList/ProviderList';
import BottomBar from './Components/BottomBar/BottomBar';
import GridLabels from './Components/GridLabels/GridLabels';
import Sidebar from './Components/Sidebar/Sidebar';

//Other
import getGridView from './views';
import {sizeLookup, mapViews, providers, months} from './config';

import url from './updated.json'

const transitionInterpolator = new FlyToInterpolator();

class App extends React.Component {

   constructor(props) {
      super(props);
      this.state = {
         sidebarOpen: true,
         in: true,
         loaded: false,
         viewState0: mapViews[0],
         viewState1: mapViews[1],
         viewState2: mapViews[2],
         viewState3: mapViews[3],
         viewState4: mapViews[4],
         viewState5: mapViews[5],
         viewState6: mapViews[6],
         viewState7: mapViews[7],
         viewState8: mapViews[8],
         data: [],
         curr: 0,
         providers,
         activeMetric: 'trips',
         activeLayer: 'polylines',
         activeView: 'double',
         minDate: new Date('08/07/1995'), //Happy birthday to me
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
            activeView: value,
            in:true
         })
         setTimeout(() => {
            this.setState({
               in:false
            })
         }, 1000)
      }
   }

   componentDidMount = async () => {
      console.log('loading data...')
      console.log('Thanks for taking a look under the hood. Questions? dylan.babbs@gmail.com')
      document.getElementById('deckgl-overlay').oncontextmenu = evt => evt.preventDefault();

      // const url = `https://xyz.api.here.com/hub/spaces/2vDrakce/search?limit=5000&clientId=cli&access_token=AJXABoLRYHN488wIHnxheik`;
 
      const data = url

      this.setState({
         data: data.features,
         loaded: true
      }, () => {
         const min = Math.min.apply(null,
            this.state.data.map(x => new Date(x.properties.startDate))
         );
         const max = Math.max.apply(null,
            this.state.data.map(x => new Date(x.properties.startDate))
         );
  
         this.setState({
            minDate: min,
            maxDate: max
         })
      });

   }

   animate = () => {
      this.setState({
         transitionActive: true,
         curr: 0
      })
      setTimeout(() => {
         const timer = setInterval(() => {
            this.setState({
               curr: this.state.curr + 1,
            })
            if (this.state.curr === 180) { //180
               clearInterval(timer)
               this.setState({
                  transitionActive: false
               })
            }
         }, 3) //3
      },2000)
   }

   moveSidebar = () => {
      this.setState({
         sidebarOpen: !this.state.sidebarOpen
      })
   }

   renderTooltip = () => {
      const {tooltip} = this.state;

      if (tooltip) {
         if (this.state.activeLayer === 'hexbins') {
            return tooltip && (
               <div
                  className="tooltip"
                  style={{left: this.state.x, top: this.state.y, borderTop: `2px solid black`}}
               >
                  <div>
                     <span className="key"># Pickups & Dropoffs</span>
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
                     <span className="value">{months[new Date(tooltip.properties.startDate).getMonth()] + ' ' + new Date(tooltip.properties.startDate).getFullYear()}</span>
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

   setTooltip = (x, y, object) => {
      if (object !== null) {
         this.setState({x, y, tooltip: object});
         setTimeout(() => {
            this.setState({tooltip: null});
         }, 1500)
      }
      // this.setState({x, y, tooltip: object});
   }

   rotateCamera = () => {
      this.setState({
         in: false
      })
      this.setState({
         viewState0: {
            zoom: 11,
            latitude: 47.611171, 
            longitude: -122.313158,
            bearing: 22,
            pitch: 60,
            transitionDuration: 10000,
            transitionEasing: easeCubic,
            transitionInterpolator,
         },
         viewState1: {
            longitude: 13.404954,
            latitude: 52.520008,
            zoom: 11,
            pitch: 60,
            bearing: 0,
            transitionDuration: 10000,
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

   filterDate = (evt) => {
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
      if (evt.viewState.zoom > 1) {
         this.setState({zoom: evt.viewState.zoom})
      }
  }

   render = () => {

      let data = [];
      let hexd = [];

      let min = new Date();
      let max = new Date();

      let transitionData = [];

      if (this.state.data.length > 0) {
         min =  Math.min.apply(null, this.state.data.map(x => new Date(x.properties.startDate)));
         max = Math.max.apply(null, this.state.data.map(x => new Date(x.properties.startDate)));


         transitionData = this.state.data.length === 0 ? [] : this.state.data.map(feature => {
            const coords = feature.geometry.coordinates.slice(1, this.state.curr);
            return {
               coordinates: coords,
               provider: feature.properties.provider
            }
         })

         for (let i = 0; i < this.state.providers.length; i++) {
            if (this.state.providers[i].active) {
               data.push(
                  ...this.state.data.filter(x => x.properties.provider === this.state.providers[i].name)
               );
            }
         }

         data = data.filter(x => new Date(x.properties.startDate) >= this.state.minDate)
            .filter(x => new Date(x.properties.startDate) <= this.state.maxDate)


         hexd = [
            ...data.map(x => x.properties.startCoordinates.map(x => Number(x))),
            ...data.map(x => x.properties.endCoordinates.map(x => Number(x)))
         ]

      }

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
         parameters: {
            depthTest: false
         }
      });

      const hexLayer = new HexagonLayer({
         id: 'hexagon-layer',
         data: hexd,
         pickable: true,
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
         // onHover: ({x, y, object}) => this.setTooltip(x, y, object ? object : null)

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
      let views;

      if (this.state.activeView === 'single') {
         views = [
            {
               id: '0',
               width: '100%',
               height: '100%',
               controller: true,
            }
         ]
         
      } else if (this.state.activeView === 'double') {
         views = [
            {
               id: '0',
               width: '50%',
               height: '100%',
               controller: true,
            },
            {
               id: '1',
               width: '50%',
               height: '100%',
               x: '50%',
               controller: true,
            }
         ]
      } else {
         views = getGridView();
      }
      return (

         <>
            {
               // this.renderTooltip()
            }
            <div className="attribution">
               © <a href="https://here.com">HERE</a> 2019. Icons made by <a href="https://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" rel="noopener noreferrer" target="_blank">CC 3.0 BY</a>
            </div>
            {/* <CSSTransition
               timeout={1000}
               in={this.state.in}
               classNames="blur"
               onEnter={() => console.log('entering..')}
               unmountOnExit
               appear
            > */}
               {/* <div className="cover"/> */}
            {/* </CSSTransition> */}

            
            <Sidebar>
               <h1>Dylan's Mobility Service Map</h1>


               {
                  this.state.sidebarOpen &&
                  <>
                     <p>A visualization of my mobility service trips. Made by <a href="https://twitter.com/dbabbs">@dbabbs</a></p>
                     <Section>
                        <h2>Trip Analytics</h2>
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
                        <h2>Toggle View</h2>
                        <Selector
                           type="view"
                           options={['single', 'double', 'grid']}
                           active={this.state.activeView}
                           changeActive={this.changeActive}
                        />
                     </Section>
                  </>
               }
            </Sidebar>

            <BottomBar
               loaded={this.state.loaded}
               data={data}
               min={min}
               max={max}
               currMin={this.state.minDate}
               currMax={this.state.maxDate}
               filterDate={this.filterDate}
            />
            <div className="map-container">
               {
                  this.state.activeView === 'grid' &&
                  <GridLabels labels={mapViews}/>
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
                              mapStyle={mapStyle}
                           />
                        </MapView>
                     )
                  })
               }


               </DeckGL>
            </div>
         </>
      );
   }

}


export default App;
