# StyleManager

[![Build Tool](https://img.shields.io/badge/build-Webpack-green.svg)](https://github.com/sigcorporativo-ja/Mapea4-dev-webpack)  

## Descripción

Plugin de [Mapea](https://github.com/sigcorporativo-ja/Mapea4) para la gestión de la simbología de las capas vectoriales del mapa. Los tipos de simbología soportada son: simple (polígono, línea, punto), coropletas, símbolos proporcionales, categorías, estadísticos y cluster.

## Recursos y uso

- js: stylemanager.ol.js
- css: stylemanager.min.css

Creación del plugin:
```javascript
var mp = new M.plugin.StyleManager();
myMap.addPlugin(mp);
```
