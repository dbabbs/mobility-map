function hexToRgba(
   hex,
   { format = 'array', alpha = 1 } = { format: 'array', alpha: 1 }
) {
   const r = parseInt(hex.slice(1, 3), 16);
   const g = parseInt(hex.slice(3, 5), 16);
   const b = parseInt(hex.slice(5, 7), 16);
   if (format === 'string') {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
   }
   return [r, g, b, alpha * 255];
}
export default hexToRgba;
