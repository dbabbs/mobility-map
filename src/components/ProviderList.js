import React from 'react';
import './ProviderList.css';

import carIcon from '../icons/car.svg';
import bikeIcon from '../icons/bike.svg';
import scooterIcon from '../icons/scooter.svg';

const icons = {
   car: carIcon,
   bike: bikeIcon,
   scooter: scooterIcon,
};

const units = {
   distance: 'miles',
   trips: 'trips',
   price: 'dollars',
};

function numberWithCommas(x) {
   return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const ProviderList = ({ data, providers, handleClick, activeMetric }) => {
   return providers.map((provider, i) => {
      const filteredData = data.filter(
         (x) => x.properties.provider === provider.name
      );

      let value = 0;
      let max = 0;

      if (provider.active) {
         if (activeMetric === 'trips') {
            value = filteredData.length;
            max = data.length;
         } else if (activeMetric === 'distance') {
            if (
               (value ===
                  filteredData.map((x) => x.properties.distance).length) ===
               0
            ) {
               value = 0;
            } else {
               value = filteredData
                  .map((x) => x.properties.distance)
                  .reduce((a, b) => a + b);
            }

            max = data
               .map((x) => x.properties.distance)
               .reduce((a, b) => a + b);
         } else if (activeMetric === 'price') {
            if (filteredData.map((x) => x.properties.cost).length === 0) {
               value = 0;
            } else {
               value = filteredData
                  .map((x) => x.properties.cost)
                  .reduce((a, b) => a + b);
            }

            max = data.map((x) => x.properties.cost).reduce((a, b) => a + b);
         }
      }

      const style = {
         background: provider.active ? provider.color : '#DBDBDB',
         width: provider.active ? (value / max) * 100 + '%' : '0%',
      };

      let format = '';
      if (activeMetric === 'price') {
         format = `$${numberWithCommas(value.toFixed(2))}`;
      } else if (activeMetric === 'distance') {
         format = `${numberWithCommas(value.toFixed(0))} ${
            units[activeMetric]
         }`;
      } else if (activeMetric === 'trips') {
         format = `${value} ${units[activeMetric]}`;
      }
      return (
         <div
            key={i}
            className="provider noselect"
            onClick={() => handleClick(provider.name)}
         >
            <div style={style} className="line" />
            <span
               style={{ color: provider.active ? 'black' : '#737373' }}
               className="title"
            >
               {provider.name.charAt(0).toUpperCase() +
                  provider.name.substring(1)}
            </span>
            {<span className="sub">{format}</span>}

            <div className="icon-container">
               {provider.active &&
                  provider.modes.map((mode, i) => (
                     <img
                        key={i}
                        style={{ height: '17px' }}
                        src={icons[mode]}
                        alt="transportation mode icon"
                     />
                  ))}
               {!provider.active && <span> (hidden)</span>}
            </div>
         </div>
      );
   });
};

export default ProviderList;
