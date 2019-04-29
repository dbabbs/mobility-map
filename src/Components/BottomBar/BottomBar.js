import React from 'react';
import './BottomBar.css';
import * as d3 from "d3";

import { Range } from 'rc-slider';
import './Slider.css';

function addDays(date, days) {
   const result = new Date(date);
   result.setDate(result.getDate() + days);
   return result;
}


class Histogram extends React.Component {
   componentDidMount() {
      this.drawChart();
      window.addEventListener('resize', () => this.drawChart())
   }

   drawChart() {
      document.getElementById('chart').innerHTML = ''
      let histogramData = this.props.data.map(x => new Date(x.properties.startDate));
      const start = this.props.min;
      const end = this.props.max;
      const margin = {
         top: 10,
         right: 0,
         bottom: 5,
         left: 0
      }

      const width = document.getElementById('chart').offsetWidth;
      const height = 50 - margin.top - margin.bottom;

      const x = d3.scaleTime().domain([
         addDays(start, -7), //new Date(2017, 1, 20),
         addDays(end, 7)
      ]).rangeRound([0, width]);
      const y = d3.scaleLinear().range([height, 0]);

      const histogram = d3.histogram().value(function(d) {
         return d;
      }).domain(x.domain()).thresholds(x.ticks(
         d3.timeMonth //d3.timeMonth //: d3.timeWeek
      ));

      const svg = d3.select("#chart").append("svg")
         .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom).append("g")
         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      const bins = histogram(histogramData);

      y.domain([
         0,
         d3.max(bins, function(d) {
            return d.length;
         })
      ]);

      svg.selectAll("rect").data(bins).enter().append("rect").attr("class", "bar").attr("x", 1).attr("transform", function(d) {
            return "translate(" + x(d.x0) + "," + y(d.length) + ")";
         }).attr("width", function(d) {
            return x(d.x1) - x(d.x0) - 1 > 0 ? x(d.x1) - x(d.x0) - 1 : 0;
         })
         .attr("height", function(d) {
            return height - y(d.length);
         })
   }


   render() {


      return <div id="chart"></div>;

   }
}

class BottomBar extends React.Component {
   constructor(props) {
      super(props);
   }

   render() {
      const currMin = new Date(this.props.currMin);
      const currMax = new Date(this.props.currMax);

      return (
         <div className="bottom-bar">
            <div className="date-row">
               <div>{currMin.toLocaleString().split(',')[0]}</div>
               <div>{currMax.toLocaleString().split(',')[0]}</div>
            </div>
            <Histogram
               data={this.props.data}
               min={this.props.min}
               max={this.props.max}

            / >
            <Range
               onChange={this.props.filterDate}
               min={this.props.min}
               max={this.props.max}
               count={2}
               defaultValue={[this.props.min, this.props.max]}
               allowCross={false}
               trackStyle={[{ backgroundColor: '#363636' }]}
               handleStyle={[{
                  backgroundColor: 'black',
                  borderRadius: '0',
                  border: '0',
                  width: '8px',
                  padding: '0'
               },
               {
                  backgroundColor: 'black',
                  borderRadius: '0',
                  border: '0',
                  width: '8px',
                  padding: '0'
                }]}
                activeHandleStyle={[{
                   background: 'green'
                }

                ]}
               railStyle={{ backgroundColor: '#D6D6D6' }}
            />

         </div>
      )
   }
}



export default BottomBar;
