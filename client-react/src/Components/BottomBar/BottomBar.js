import React from 'react';
import './BottomBar.css';
import * as d3 from "d3";

import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

function addDays(date, days) {
   const result = new Date(date);
   result.setDate(result.getDate() + days);
   return result;
}


class Histogram extends React.Component {
   constructor(props) {
      super(props);
   }

   componentDidMount() {
      this.drawChart();
   }

   drawChart() {
      console.log(this.props.data);

      let histogramData = this.props.data.features.map(x => x.properties.startDate.split(' ')[0]);

      const start = Math.min.apply(null,
         histogramData.map(x => new Date(x))
      );
      const end = Math.max.apply(null,
         histogramData.map(x => new Date(x))
      );
      const margin = {
         top: 0,
         right: 0,
         bottom: 0,
         left: 0
      }

      const width = document.getElementById('chart').offsetWidth;
      const height = 40 - margin.top - margin.bottom;

      const parseDate = d3.timeParse("%Y-%d-%m");
      const x = d3.scaleTime().domain([
         addDays(start, -7), //new Date(2017, 1, 20),
         addDays(end, 7)
      ]).rangeRound([0, width]);
      const y = d3.scaleLinear().range([height, 0]);

      const histogram = d3.histogram().value(function(d) {
         return d;
      }).domain(x.domain()).thresholds(x.ticks(
         d3.timeWeek //d3.timeMonth //: d3.timeWeek
      ));

      const svg = d3.select("#chart").append("svg")
         .attr("width", width + margin.left + margin.right)
         .attr("height", height + margin.top + margin.bottom).append("g")
         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      histogramData = histogramData.map(x => parseDate(x));


      const bins = histogram(histogramData);
      console.log(bins);

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
      // console.log(this.props.data);

      return <div id="chart"></div>;

   }
}

class BottomBar extends React.Component {
   constructor(props) {
      super(props);
   }


   render() {
      return (
         <div className = "bottom-bar" >
            <Histogram
               data={this.props.data}
            / >
            <Range count={3} defaultValue={[0, 100]} pushable
               trackStyle={[{ backgroundColor: 'red' }]}
               handleStyle={[{ backgroundColor: 'yellow' }]}
               railStyle={{ backgroundColor: 'black' }}
            />

         </div>
      )
   }
}



export default BottomBar;
