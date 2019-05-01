import React from 'react';
import './GridLabels.css';
const GridLabels = ({labels}) => {
   return (
      <div className="grid-grid">
         {
            labels.map((label, i) => {
               return (
                  <div key={i}>
                     <div className="label">
                        {label.name}
                     </div>

                  </div>
               )
            })
         }
      </div>
   )
}

export default GridLabels;
