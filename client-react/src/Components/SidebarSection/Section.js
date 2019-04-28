import React from 'react';

const Section = ({children}) => {
   const style = {
      borderTop: '1px solid #E8E8E8',
      padding: '15px 0'
   }
   return (
      <div style={style}>
         {children}
      </div>
   )
}

export default Section;
