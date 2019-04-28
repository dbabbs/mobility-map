import React from 'react';
import './ProviderList.css';

import carIcon from '../../icons/car.svg';
import bikeIcon from '../../icons/bike.svg';
import scooterIcon from '../../icons/scooter.svg';
console.log(carIcon);

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

class ProviderList extends React.Component {
   render() {
      const max = Math.max.apply(null,
         this.props.providers.map(x => x[this.props.active])
      )
      return(
         <>
            {
               this.props.providers.map((provider, i) => {
                  const style = {
                     background: provider.color,
                     width: provider[this.props.active] / max * 100 + '%'
                  }
                  return <div key={i} className="provider">
                     <div style={style} className="line" />
                     <span className="title">
                     {provider.name.charAt(0).toUpperCase() + provider.name.substring(1)}
                     </span>
                     {
                        this.props.active === 'price' ?
                        <span className="sub">${provider[this.props.active]}</span>
                        :
                        <span className="sub">{provider[this.props.active]} {units[this.props.active]}</span>

                     }
                        <div className="icon-container">
                           {
                              provider.modes.map(mode =>
                                 <img style={{height: '17px'}} src={icons[mode]} alt="transportation mode icon" />
                              )
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
