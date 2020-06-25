import React from 'react';
import './GridLabels.css';
const GridLabels = ({ labels }) => {
   const l = labels.map((x) => x.name);
   return (
      <div className="grid-grid">
         {l.map((label, i) => {
            return (
               <div key={i}>
                  <div className="label">{label}</div>
               </div>
            );
         })}
      </div>
   );
};

export default GridLabels;
