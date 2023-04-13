// https://vitejs.dev/config/
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import _package from './package.json';

const calciteVersion = _package.dependencies['@esri/calcite-components'].replace('^', '').replace('~', '');
const calciteUrl = `https://js.arcgis.com/calcite-components/${calciteVersion}/calcite.esm.js`;

export default {
  plugins: [
    ViteEjsPlugin({
      calciteUrl,
    }),
  ],
  root: './dev',
  server: {
    port: 8080,
    open: true,
  },
  esbuild: {
    jsxFactory: 'tsx',
  },
};
