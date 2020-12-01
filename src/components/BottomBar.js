import React, { useRef, useEffect, useState } from 'react';
import './BottomBar.css';
import * as d3 from 'd3';
import { Range } from 'rc-slider';
import './Slider.css';
import { useSelector, useDispatch } from 'react-redux';
import filter from '../util/filter';

function addDays(date, days) {
   const result = new Date(date);
   result.setDate(result.getDate() + days);
   return result;
}

const Histogram = ({ data, min, max }) => {
   const [width, setWidth] = useState(null);
   const container = useRef(null);
   useEffect(() => {
      setWidth(() => container.current.offsetWidth);
      window.onresize = () => {
         setTimeout(() => {
            setWidth(() => container.current.offsetWidth);
         }, 300);
      };
   }, []);

   const height = 50;

   const x = d3
      .scaleTime()
      .domain([addDays(min, -7), addDays(max, 7)])
      .rangeRound([0, width]);

   const histogram = d3
      .histogram()
      .value((d) => d)
      .domain(x.domain())
      .thresholds(x.ticks(d3.timeMonth));

   const bins = histogram(data.map((x) => new Date(x.properties.startDate)));

   const y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(bins, (d) => d.length)]);

   return (
      <div className="histogram" ref={container}>
         <svg width={width} height={height}>
            <g>
               {bins.map((d, i) => (
                  <rect
                     key={i}
                     className="bar"
                     x={1}
                     transform={`translate(${x(d.x0)},${y(d.length)})`}
                     width={
                        x(d.x1) - x(d.x0) - 1 > 0 ? x(d.x1) - x(d.x0) - 1 : 0
                     }
                     height={height - y(d.length)}
                  />
               ))}
            </g>
         </svg>
      </div>
   );
};

const BottomBar = () => {
   const dispatch = useDispatch();
   const {initialMin,initialMax} = useSelector(({initialMin, initialMax})=>({initialMin, initialMax}));
   const providers = useSelector(({providers})=>providers);
   const min = useSelector(({minDate})=>minDate);
   const max = useSelector(({maxDate})=>maxDate);
   const allData = useSelector(({data})=>data);
   const data = filter(allData, { providers, minDate: min, maxDate: max })
   return (
      <div className="bottom-bar">
         <div className="date-row">
            <div>{new Date(min).toLocaleString().split(',')[0]}</div>
            <div>{new Date(max).toLocaleString().split(',')[0]}</div>
         </div>

         <Histogram data={data} min={initialMin} max={initialMax} />
         <div style={{ marginLeft: '5px' }}>
            <Range
               onChange={(evt) =>
                  dispatch({ type: 'SET_DATE_FILTER', payload: evt })
               }
               min={initialMin}
               max={initialMax}
               count={2}
               defaultValue={[initialMin, initialMax]}
               allowCross={false}
               trackStyle={[{ backgroundColor: '#363636' }]}
               step={8000000}
               handleStyle={[
                  {
                     backgroundColor: 'black',
                     borderRadius: '0',
                     border: '0',
                     width: '8px',
                     padding: '0',
                  },
                  {
                     backgroundColor: 'black',
                     borderRadius: '0',
                     border: '0',
                     width: '8px',
                     padding: '0',
                  },
               ]}
               railStyle={{ backgroundColor: '#D6D6D6' }}
            />
         </div>
      </div>
   );
};

export default BottomBar;
