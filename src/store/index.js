import { createStore } from 'redux';
import { viewStates, providers } from '../config';
import { features as data } from '../assets/data.json';

const initialState = {
   in: true,
   loaded: false,
   viewStates,
   data,
   curr: 0,
   providers,
   activeMetric: 'trips',
   activeLayer: 'animate',
   activeView: 'single',
   initialMin: Math.min(...data.map((x) => new Date(x.properties.startDate))),
   initialMax: Math.max(...data.map((x) => new Date(x.properties.startDate))),
   minDate: Math.min(...data.map((x) => new Date(x.properties.startDate))),
   maxDate: Math.max(...data.map((x) => new Date(x.properties.startDate))),
};

const reducer = (state = initialState, action) => {
   const { payload, type } = action;
   const copy = { ...state };

   if (action.type === 'SET_ACTIVE') {
      const { key, value } = payload;
      if (key === 'metric') {
         copy.activeMetric = value;
      } else if (key === 'layer') {
         copy.activeLayer = value;
      } else if (key === 'view') {
         copy.activeView = value;
      }
   } else if (action.type === 'SET_PROVIDER') {
      const providers = [...copy.providers];
      providers.forEach((provider) => {
         if (provider.name === payload) {
            provider.active = !provider.active;
         }
      });
      copy.providers = providers;
   } else if (action.type === 'SET_DATE_FILTER') {
      copy.minDate = new Date(payload[0]);
      copy.maxDate = new Date(payload[1]);
   }
   return copy;
};

const store = createStore(
   reducer,
   window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
