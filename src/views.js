const getGridView = (activeView) => {
   if (activeView === 'single') {
      return [
         {
            id: '0',
            width: '100%',
            height: '100%',
            controller: true,
         },
      ];
   } else if (activeView === 'double') {
      return [
         {
            id: '0',
            width: '50%',
            height: '100%',
            controller: true,
         },
         {
            id: '1',
            width: '50%',
            height: '100%',
            x: '50%',
            controller: true,
         },
      ];
   } else {
      const size1 = (1 / 3) * 100 + '%';
      const size2 = (2 / 3) * 100 + '%';
      return [
         //Row 1
         {
            id: 'top',
            width: size1,
            height: size1,
            controller: true,
         },
         {
            id: 'bottom',
            x: size1,
            y: 0,
            width: size1,
            height: size1,
            controller: true,
         },
         {
            id: '2',
            x: size2,
            y: 0,
            width: size1,
            height: size1,
            controller: true,
         },

         //Row 2
         {
            id: '3',
            x: 0,
            y: size1,
            width: size1,
            height: size1,
            controller: true,
         },
         {
            id: '4',
            x: size1,
            y: size1,
            width: size1,
            height: size1,
            controller: true,
         },
         {
            id: '5',
            x: size2,
            y: size1,
            width: size1,
            height: size1,
            controller: true,
         },

         //Row 3
         {
            id: '6',
            x: 0,
            y: size2,
            width: size1,
            height: size1,
            controller: true,
         },
         {
            id: '7',
            x: size1,
            y: size2,
            width: size1,
            height: size1,
            controller: true,
         },
         {
            id: '8',
            x: size2,
            y: size2,
            width: size1,
            height: size1,
            controller: true,
         },
      ];
   }
};

export default getGridView;
