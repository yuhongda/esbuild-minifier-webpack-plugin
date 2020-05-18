# esbuild-minifier-webpack-plugin
====
A webpack plugin to compress js based on [esbuild](https://github.com/evanw/esbuild)

Install
-----

```javascript

npm install -D esbuild-minifier-webpack-plugin

```


Usage
-----

in `webpack.config.babel.js` file:

```javascript
import ESBuildMinifierWebpackPlugin from 'esbuild-minifier-webpack-plugin';

optimization: {
  minimizer: [
    new ESBuildMinifierWebpackPlugin(),
  ],
},
```
