//React
import React, { useEffect } from 'react';

//DeckGL

import { FlyToInterpolator } from 'react-map-gl';

//CSS
import './App.css';

//Components
import BottomBar from './components/BottomBar';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
//Other

import { easeCubic } from 'd3-ease';

//Layers

import { connect } from 'react-redux';

/**
 * TODO: USE REDUCER from REACT
 */

const transitionInterpolator = new FlyToInterpolator();

const App = () => {
   useEffect(() => {
      console.log(
         'Thanks for taking a look under the hood. Questions? dylan.babbs@gmail.com'
      );
   }, []);
   return (
      <>
         <Sidebar />
         <BottomBar />
         <Map />
      </>
   );
};

// animate = () => {
//    this.setState({
//       transitionActive: true,
//       curr: 0,
//    });
//    let i = 0;

//    const step = () => {
//       if (i >= 180) {
//          //180
//          cancelAnimationFrame(interval);
//          this.setState({
//             transitionActive: false,
//          });
//       } else {
//          this.setState({
//             curr: this.props.curr + 1,
//          });
//          requestAnimationFrame(step);
//       }
//       i++;
//    };
//    const interval = requestAnimationFrame(step);
// };

// rotateCamera = () => {
//    this.setState({
//       in: false,
//    });
//    const viewStates = Object.assign({}, this.props.viewStates);
//    viewStates[0] = {
//       name: 'Seattle, WA',
//       zoom: 11,
//       latitude: 47.611171,
//       longitude: -122.313158,
//       bearing: 22,
//       pitch: 60,
//       transitionDuration: 10000,
//       transitionEasing: easeCubic,
//       transitionInterpolator,
//    };
//    viewStates[1] = {
//       name: 'Berlin, DE',
//       longitude: 13.404954,
//       latitude: 52.520008,
//       zoom: 11,
//       pitch: 60,
//       bearing: 0,
//       transitionDuration: 10000,
//       transitionEasing: easeCubic,
//       transitionInterpolator,
//    };
//    this.setState({ viewStates });
// };

const mapStateToProps = (state) => state;
const mapDispatchToProps = (dispatch) => ({ dispatch });
export default connect(mapStateToProps, mapDispatchToProps)(App);
