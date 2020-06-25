//React
import React from 'react';

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

class App extends React.Component {
   constructor(props) {
      super(props);
   }
   componentDidMount = async () => {
      console.log('loading data...');
      console.log(
         'Thanks for taking a look under the hood. Questions? dylan.babbs@gmail.com'
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

   rotateCamera = () => {
      this.setState({
         in: false,
      });
      const viewStates = Object.assign({}, this.props.viewStates);
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
      };
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
      };
      this.setState({ viewStates });
   };


   onViewStateChange = (evt) => {};

   render = () => {
      let data = [];
      let transitionData = [];
      let min = new Date();
      let max = new Date();



      for (let i = 0; i < this.props.providers.length; i++) {
         if (this.props.providers[i].active) {
            data.push(
               ...this.props.data.filter(
                  (x) => x.properties.provider === this.props.providers[i].name
               )
            );
         }
      }

      data = data
         .filter((x) => new Date(x.properties.startDate) >= this.props.minDate)
         .filter((x) => new Date(x.properties.startDate) <= this.props.maxDate);

      return (
         <>
            <Sidebar />
            <BottomBar />
            <Map />
         </>
      );
   };
}

const mapStateToProps = (state) => state;
const mapDispatchToProps = (dispatch) => ({ dispatch });
export default connect(mapStateToProps, mapDispatchToProps)(App);
