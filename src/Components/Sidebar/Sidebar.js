import React from 'react';
import './Sidebar.css';
import Selector from '../Selector/Selector';
import Section from '../SidebarSection/Section'
import ProviderList from '../ProviderList/ProviderList';

class Sidebar extends React.Component {
   constructor(props) {
      super(props);

   }


   render() {
      return(
         <div style={{height: this.props.height}} className="sidebar">
            {this.props.children}
         </div>
      )
   }
}

export default Sidebar;
