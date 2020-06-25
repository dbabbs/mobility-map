import React from 'react';
import './Sidebar.css';
import Selector from './Selector';
import ProviderList from './ProviderList';
import { connect } from 'react-redux';
import filterState from '../util/filter';

const Section = ({ children }) => {
   return (
      <div
         style={{
            borderTop: '1px solid #E8E8E8',
            padding: '15px 0',
         }}
      >
         {children}
      </div>
   );
};

const Sidebar = ({
   data,
   dispatch,
   activeMetric,
   providers,
   activeLayer,
   activeView,
}) => {
   return (
      <div className="sidebar">
         <h1>Dylan's Mobility Service Map</h1>

         <>
            <p style={{ marginBottom: 15 }}>
               A visualization of my mobility service trips. Made by{' '}
               <a href="https://twitter.com/dbabbs">@dbabbs</a>
            </p>
            <Section>
               <h2>Trip Analytics</h2>
               <Selector
                  type="metric"
                  options={['trips', 'price', 'distance']}
                  active={activeMetric}
                  changeActive={(key, value) =>
                     dispatch({
                        type: 'SET_ACTIVE',
                        payload: { key, value },
                     })
                  }
               />
               <ProviderList
                  handleClick={(provider) =>
                     dispatch({
                        type: 'SET_PROVIDER',
                        payload: provider,
                     })
                  }
                  providers={providers}
                  data={data}
                  activeMetric={activeMetric}
               />
               <p> Filter a mobility provider by clicking on it. </p>
            </Section>
            <Section>
               <h2>Toggle Layer Type</h2>
               <Selector
                  type="layer"
                  options={['polylines', 'hexbins', 'arcs']}
                  active={activeLayer}
                  changeActive={(key, value) =>
                     dispatch({
                        type: 'SET_ACTIVE',
                        payload: { key, value },
                     })
                  }
               />
               <p>
                  {activeLayer === 'polylines' &&
                     'Polyines - approximate route of trip.'}
                  {activeLayer === 'hexbins' &&
                     'Hexbins - aggregated pickups & dropoffs.'}
                  {activeLayer === 'arcs' &&
                     'Arcs - pickup and dropoff points.'}
               </p>
            </Section>
            <Section>
               <h2>Toggle View</h2>
               <Selector
                  type="view"
                  options={['single', 'double', 'grid']}
                  active={activeView}
                  changeActive={(key, value) =>
                     dispatch({
                        type: 'SET_ACTIVE',
                        payload: { key, value },
                     })
                  }
               />
            </Section>
         </>
      </div>
   );
};

const mapStateToProps = (state) => filterState(state);
const mapDispatchToProps = (dispatch) => ({ dispatch });
export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
