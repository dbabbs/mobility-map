import React from 'react';
import './Sidebar.css';
import Selector from '../Selector/Selector';
import Section from '../SidebarSection/Section'
import ProviderList from '../ProviderList/ProviderList';

class Sidebar extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         providers: [
            {
               name: 'uber',
               color: 'black',
               distance: 3184,
               trips: 122,
               price: 800,
               modes: ['car']
            },
            {
               name: 'jump',
               color: '#E73A14',
               distance: 2124,
               trips: 35,
               price: 112,
               modes: ['bike', 'scooter']
            },
            {
               name: 'lime',
               color: '#25CF00',
               distance: 1241,
               trips: 80,
               price: 201,
               modes: ['bike', 'scooter']
            },
            {
               name: 'lyft',
               color: '#FE00D8',
               distance: 400,
               trips: 14,
               price: 181,
               modes: ['car']
            },
         ],
         activeMetric: 'trips',
         activeLayer: 'polylines'
      }
   }

   changeActive = (type, value) => {
      // console.log(t);
      if (type === 'metric') {
         this.setState({
            activeMetric: value
         })
      } else if (type === 'layer') {
         this.setState({
            activeLayer: value
         })
      }

   }
   render() {
      return(
         <div className="sidebar">
            <h1>Mobility Map</h1>
            <p>An overview of my mobility service activity across cities. With the exception of Lyft, all data was acquired through GDPR requests.</p>
            <Section>
               <h2>Toggle Layer</h2>
               <Selector
                  type="layer"
                  options={['polylines', 'hexbins']}
                  active={this.state.activeLayer}
                  changeActive={this.changeActive}
               />
            </Section>
            <Section>
               <h2>View Analytics</h2>
               <Selector
                  type="metric"
                  options={['trips', 'price', 'distance']}
                  active={this.state.activeMetric}
                  changeActive={this.changeActive}
               />
               <ProviderList
                  providers={this.state.providers}
                  active={this.state.activeMetric}
                />
            </Section>



         </div>
      )
   }
}
/* TODO:
<div>Icons made by <a href="https://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" 			    title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" 			    title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
*/
export default Sidebar;
