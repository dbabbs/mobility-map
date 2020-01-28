//React
import React from 'react';

//DeckGL
import DeckGL from '@deck.gl/react';
import { StaticMap, FlyToInterpolator } from 'react-map-gl';
import { PathLayer, ArcLayer } from '@deck.gl/layers';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { MapView } from '@deck.gl/core';

//CSS
import './App.css';

//Components
import MapAttribution from './Components/MapAttribution/MapAttribution'
import Selector from './Components/Selector/Selector';
import Section from './Components/SidebarSection/Section'
import ProviderList from './Components/ProviderList/ProviderList';
import BottomBar from './Components/BottomBar/BottomBar';
import GridLabels from './Components/GridLabels/GridLabels';
import Sidebar from './Components/Sidebar/Sidebar';

//Other
import getGridView from './views';
import { sizeLookup, viewStates, providers } from './config';
import { easeCubic } from "d3-ease";
import url from './assets/data.json'
import mapStyle from './assets/map-style.json'

const transitionInterpolator = new FlyToInterpolator();

class App extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         sidebarOpen: true,
         in: true,
         loaded: false,
         viewStates,
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
            in: true
         })
         setTimeout(() => {
            this.setState({
               in: false
            })
         }, 1000)
      }
   }

   componentDidMount = async () => {
      console.log('loading data...')
      console.log('Thanks for taking a look under the hood. Questions? dylan.babbs@gmail.com')
      document.getElementById('deckgl-overlay').oncontextmenu = evt => evt.preventDefault();
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
      }, 2000)
   }

   moveSidebar = () => {
      this.setState({
         sidebarOpen: !this.state.sidebarOpen
      })
   }

   rotateCamera = () => {
      this.setState({
         in: false
      })
      const viewStates = Object.assign({}, this.state.viewStates);
      viewStates[0] = {
         name: 'Seattle, WA',
         zoom: 11,
         latitude: 47.611171,
         longitude: -122.313158,
         bearing: 22,
         pitch: 60,
         transitionDuration: 10000,
         transitionEasing: easeCubic,
         transitionInterpolator,
      }
      viewStates[1] = {
         name: 'Berlin, DE',
         longitude: 13.404954,
         latitude: 52.520008,
         zoom: 11,
         pitch: 60,
         bearing: 0,
         transitionDuration: 10000,
         transitionEasing: easeCubic,
         transitionInterpolator,
      }
      this.setState({ viewStates });
   }

   onLoad = () => {
      this.rotateCamera();
      this.animate();
   }

   toggleProviders = p => {
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

   onViewStateChange = evt => {
      const { viewId, viewState: modified } = evt;
      const { viewStates } = this.state;

      viewStates[viewId] = modified;
      this.setState({ viewStates })
      if (modified.zoom > 1) {
         this.setState({ zoom: modified.zoom })
      }
   }

   render = () => {
      let data = [];
      let hexd = [];
      let transitionData = [];
      let min = new Date();
      let max = new Date();
      

      if (this.state.data.length > 0) {
         min = Math.min.apply(null, this.state.data.map(x => new Date(x.properties.startDate)));
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
         getPath: d => this.state.transitionActive ? d.coordinates : d.geometry.coordinates,
         getColor: d => {
            let provider = this.state.transitionActive ? d.provider : d.properties.provider;
            return this.state.providers.filter(x => x.name === provider)[0].color2;
         },
         rounded: true,
         getWidth: d => 10,
         pickable: true,
         autoHighlight: true,
         highlightColor: [249, 226, 0],
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
            [32, 62, 154],
            [85, 29, 173],
            [192, 25, 188],
            [211, 19, 86],
            [230, 71, 10],
            [249, 226, 0]
         ],
         onHover: ({ x, y, object }) => !this.state.transitionActive
      });

      const arcLayer = new ArcLayer({
         id: 'arc-layer',
         data: data,
         pickable: true,
         autoHighlight: true,
         highlightColor: [249, 226, 0],
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
         }
      });

      const layers = [];
      if (this.state.activeLayer === 'polylines') {
         layers.push(pathLayer);
      }
      if (this.state.activeLayer === 'hexbins') {
         layers.push(hexLayer);
      }
      if (this.state.activeLayer === 'arcs') {
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
      console.log(viewStates)
      return (
         <>
            <MapAttribution />
            <Sidebar>
               <h1>Dylan's Mobility Service Map</h1>
               {
                  this.state.sidebarOpen &&
                  <>
                     <p style={{marginBottom: 15}}>A visualization of my mobility service trips. Made by <a href="https://twitter.com/dbabbs">@dbabbs</a></p>
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
                        <p> Filter a mobility provider by clicking on it. </p>
                     </Section>
                     <Section>
                        <h2>Toggle Layer Type</h2>
                        <Selector
                           type="layer"
                           options={['polylines', 'hexbins', 'arcs']}
                           active={this.state.activeLayer}
                           changeActive={this.changeActive}
                        />
                        <p>
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
                     <Section>
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
                  <GridLabels labels={viewStates} />
               }
               <DeckGL
                  onLoad={this.onLoad}
                  layers={layers}
                  minZoom={3}
                  onViewStateChange={this.onViewStateChange}
               >
                  {
                     views.map((x, i) => {
                        return (
                           <MapView
                              x={x.x}
                              y={x.y}
                              width={x.width}
                              height={x.height}
                              controller={x.controller}
                              id={i.toString()}
                              key={i}
                              initialViewState={this.state.viewStates[i]}
                              viewState={this.state.viewStates[i]}
                           >
                              <StaticMap mapStyle={mapStyle} />
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
