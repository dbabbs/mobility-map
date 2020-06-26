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

const App = ({ activeLayer }) => {
   useEffect(() => {
      console.log(
         'Thanks for taking a look under the hood. Questions? dylan.babbs@gmail.com'
      );
   }, []);
   return (
      <>
         <Sidebar />
         {activeLayer !== 'animate' && <BottomBar />}
         <Map />
      </>
   );
};

const mapStateToProps = (state) => state;
const mapDispatchToProps = (dispatch) => ({ dispatch });
export default connect(mapStateToProps, mapDispatchToProps)(App);
