
import React, { useEffect } from 'react';
import './App.css';
import BottomBar from './components/BottomBar';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import { connect } from 'react-redux';

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
export default connect(mapStateToProps)(App);
