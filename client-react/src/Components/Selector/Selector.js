import React from 'react';
import './Selector.css';

class Selector extends React.Component {


   handleClick = (index) => {
      this.props.changeActive(this.props.type, this.props.options[index])
   }
   render() {

      const grid = {
         gridTemplateColumns:` repeat(${this.props.options.length}, 1fr)`
      }

      return(
         <div style={grid} className="selector-outside">
            {
               this.props.options.map((x,i) => {
                  const classes = ['selector-option'];
                  if (this.props.active === x) {
                     if (i === 0) {
                        classes.push('left-selector-active');
                     } else if (i === this.props.options.length - 1) {
                        classes.push('right-selector-active');
                     } else {
                        classes.push('selector-active');
                     }
                  } else {
                     if (i !== 0 && i !== this.props.options.length - 1) {
                        if (i === 1 && this.props.options.length > 2) {
                           classes.push('first-center-selector-option');
                        } else {
                           classes.push('center-selector-option')
                        }

                     }
                  }
                  return <div
                     className={classes.join(' ')}
                     key={i}
                     onClick={() => this.handleClick(i)}
                  >
                     {x.charAt(0).toUpperCase() + x.substring(1)}
                  </div>
               })
            }
         </div>
      )
   }
}

export default Selector;
