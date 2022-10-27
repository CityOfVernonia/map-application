import './main.scss';

// import esri = __esri;

// esri config and auth
import esriConfig from '@arcgis/core/config';
// import Portal from '@arcgis/core/portal/Portal';
// import OAuthInfo from '@arcgis/core/identity/OAuthInfo';

// map, view and layers
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Basemap from '@arcgis/core/Basemap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SearchViewModel from '@arcgis/core/widgets/Search/SearchViewModel';

import MapApplication from './../src/MapApplication';
// import './../src/MapApplication.scss';

import Measure from '@vernonia/core/dist/widgets/Measure';
import '@vernonia/core/dist/widgets/Measure.css';

// config portal and auth
esriConfig.portalUrl = 'https://gis.vernonia-or.gov/portal';

// view
const view = new MapView({
  map: new Map({
    basemap: new Basemap({
      portalItem: {
        id: '6e9f78f3a26f48c89575941141fd4ac3',
      },
    }),
    layers: [
      new FeatureLayer({
        portalItem: {
          id: '5e1e805849ac407a8c34945c781c1d54',
        },
      }),
    ],
    ground: 'world-elevation',
  }),
  zoom: 15,
  center: [-123.18291178267039, 45.8616094153766],
  constraints: {
    // rotationEnabled: false,
  },
  popup: {
    dockEnabled: true,
    dockOptions: {
      position: 'bottom-left',
      breakpoint: false,
    },
  },
});

new MapApplication({
  title: 'Map Application',

  view,

  nextBasemap: new Basemap({
    portalItem: {
      id: '2622b9aecacd401583981410e07d5bb9',
    },
  }),

  searchViewModel: new SearchViewModel(),

  panelWidgets: [{
    widget: new Measure({ view }),
    text: 'Measure',
    icon: 'measure',
    type: 'calcite-panel',
  }],
});
