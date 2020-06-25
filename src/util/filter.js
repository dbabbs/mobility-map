function filter(data, { providers, minDate, maxDate }) {
   const output = [];
   for (let i = 0; i < providers.length; i++) {
      if (providers[i].active) {
         output.push(
            ...data.filter((x) => x.properties.provider === providers[i].name)
         );
      }
   }
   return output
      .filter((x) => new Date(x.properties.startDate) >= minDate)
      .filter((x) => new Date(x.properties.startDate) <= maxDate);
}

function filterState(state) {
   const { providers, minDate, maxDate, data } = state;
   return {
      ...state,
      data: filter(data, { providers, minDate, maxDate }),
   };
}

export default filterState;
