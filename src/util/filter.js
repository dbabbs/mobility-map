function filterData(data, opts) {
   const { providers, minDate, maxDate } = opts;
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

export default filterData;
