import React from 'react';
import './ProviderList.css';

import carIcon from '../../icons/car.svg';
import bikeIcon from '../../icons/bike.svg';
import scooterIcon from '../../icons/scooter.svg';

const icons = {
   car: carIcon,
   bike: bikeIcon,
   scooter: scooterIcon
}

const units = {
   distance: 'miles',
   trips: 'trips',
   price: 'dollars'
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

class ProviderList extends React.Component {


   render() {

      return(
         <>
            {
               this.props.providers.map((provider, i) => {

                  const filteredData = this.props.data.filter(x => x.properties.provider === provider.name);

                  let value = 0;
                  let max = 0;

                  if (provider.active) {
                     if (this.props.active === 'trips') {
                        value = filteredData.length;
                        max = this.props.data.length;
                     } else if (this.props.active === 'distance') {
                        value = filteredData.map(x => x.properties.distance)
                           .reduce((a,b) => a + b);
                        max = this.props.data.map(x => x.properties.distance)
                           .reduce((a,b) => a + b);
                     } else if (this.props.active === 'price') {
                        value = filteredData.map(x => x.properties.cost)
                           .reduce((a,b) => a + b);
                        max = this.props.data.map(x => x.properties.cost)
                           .reduce((a,b) => a + b);
                     }
                  }


                  const style = {
                     background: provider.active ? provider.color : '#DBDBDB',
                     width: provider.active ?
                     value / max * 100 + '%' :
                     '0%'
                  }


                  let format = '';
                  if (this.props.active === 'price') {
                     format = `$${numberWithCommas(value.toFixed(2))}`
                  } else if (this.props.active === 'distance') {
                     format = `${numberWithCommas(value.toFixed(0))} ${units[this.props.active]}`
                  } else if (this.props.active === 'trips') {
                     format = `${value} ${units[this.props.active]}`
                  }
                  return <div
                        key={i}
                        className="provider"
                        onClick={() => this.props.handleClick(provider.name)}
                     >
                     <div style={style} className="line" />
                     <span style={{color: provider.active ? 'black' : '#737373'}} className="title">
                        {provider.name.charAt(0).toUpperCase() + provider.name.substring(1)}

                     </span>
                     {

                        <span className="sub">
                           {
                              format
                           }
                        </span>
                     }

                     <div className="icon-container">
                        {
                           provider.active &&
                           provider.modes.map((mode, i) =>
                              <img key={i} style={{height: '17px'}} src={icons[mode]} alt="transportation mode icon" />
                           )
                        }
                        {
                           !provider.active &&
                           <span> (hidden)</span>
                        }

                     </div>

                  </div>
               })
            }
         </>
      )
   }
}

export default ProviderList;
