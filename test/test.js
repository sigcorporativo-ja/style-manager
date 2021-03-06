import StyleManager from 'facade/stylemanager';

const map = M.map({
  container: 'mapjs',
});

const mp = new StyleManager();
window.mapjs = map;

const points = new M.layer.GeoJSON({
  name: "points",
  source: {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "properties": {
          "alumnos": 400,
          "colegios": 2
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-6.383056640625,
            37.3002752813443
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "alumnos": 340,
          "colegios": 5
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-6.119384765624999,
            37.60552821745789
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "alumnos": 675,
          "colegios": 3
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-5.679931640625,
            37.43997405227057
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "alumnos": 440,
          "colegios": 2
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-6.0205078125,
            37.17782559332976
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "alumnos": 520,
          "colegios": 6
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-5.47119140625,
            37.84015683604136
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [-5.2294921875,
            37.483576550426996
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "alumnos": 350,
          "colegios": 4
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-5.4931640625,
            37.07271048132943
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "alumnos": "860",
          "colegios": 5
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-4.85595703125,
            37.67512527892127
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "alumnos": 150,
          "colegios": 1
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-4.954833984374999,
            37.3002752813443
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "alumnos": 320,
          "colegios": 8
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-4.713134765624999,
            37.448696585910376
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "alumnos": 575,
          "colegios": 3
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-5.11962890625,
            37.09023980307208
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "alumnos": 330,
          "colegios": 4
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-5.855712890625,
            36.97622678464096
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "alumnos": 360,
          "colegios": 6
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-6.39404296875,
            36.99377838872517
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "alumnos": 240,
          "colegios": 3
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-6.602783203124999,
            37.622933594900864
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "alumnos": 740,
          "colegios": 2
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-5.82275390625,
            37.900865092570065
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "alumnos": 500,
          "colegios": 1
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-5.756835937499999,
            36.721273880045004
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "alumnos": 210,
          "colegios": 4
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-5.3173828125,
            36.8708321556463
          ]
        }
      }
    ]
  }
});

const lines = new M.layer.GeoJSON({
  name: 'lines',
  source: {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [-3.8452148437499996,
              37.93553306183642
            ],
            [-1.669921875,
              38.42777351132902
            ],
            [-3.27392578125,
              37.1165261849112
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [-2.724609375,
              37.92686760148135
            ],
            [-4.427490234375,
              37.16031654673677
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [-1.636962890625,
              38.71123253895224
            ],
            [-5.020751953125,
              38.91668153637508
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [-1.669921875,
              38.57393751557591
            ],
            [-4.647216796875,
              37.90953361677018
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [-1.395263671875,
              38.42777351132902
            ],
            [-2.109375,
              37.18657859524883
            ],
            [-3.482666015625,
              36.78289206199065
            ],
            [-4.68017578125,
              36.85325222344018
            ]
          ]
        }
      }
    ]
  }
});

const polygons = new M.layer.GeoJSON({
  name: 'polygons',
  source: {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [-5.5810546875,
                40.713955826286046
              ],
              [-6.734619140625,
                40.153686857794035
              ],
              [-6.383056640625,
                39.78321267821705
              ],
              [-6.8994140625,
                39.47860556892209
              ],
              [-6.492919921875,
                39.39375459224348
              ],
              [-5.833740234375,
                39.38526381099774
              ],
              [-5.33935546875,
                39.78321267821705
              ],
              [-5.5810546875,
                40.713955826286046
              ]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [-3.2080078125,
                40.6723059714534
              ],
              [-4.515380859375,
                41.12074559016745
              ],
              [-4.625244140625,
                40.01078714046552
              ],
              [-3.779296875,
                39.715638134796336
              ],
              [-4.603271484375,
                39.26628442213066
              ],
              [-4.4384765625,
                39.00211029922515
              ],
              [-3.834228515625,
                38.98503278695909
              ],
              [-2.669677734375,
                39.605688178320804
              ],
              [-2.35107421875,
                40.22082997283287
              ],
              [-3.2080078125,
                40.6723059714534
              ]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [-6.50390625,
                41.43449030894922
              ],
              [-7.536621093749999,
                40.871987756697415
              ],
              [-7.448730468749999,
                40.027614437486655
              ],
              [-6.50390625,
                41.43449030894922
              ]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [-8.536376953125,
                39.46164364205549
              ],
              [-8.67919921875,
                37.53586597792038
              ],
              [-7.404785156249999,
                38.75408327579141
              ],
              [-7.943115234375001,
                39.631076770083666
              ],
              [-8.536376953125,
                39.46164364205549
              ]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [-6.921386718749999,
                38.47939467327645
              ],
              [-7.921142578125,
                37.23032838760387
              ],
              [-6.976318359375,
                36.1822249804225
              ],
              [-6.6796875,
                37.49229399862877
              ],
              [-6.383056640625,
                36.81808022778526
              ],
              [-5.899658203125,
                37.996162679728116
              ],
              [-6.943359374999999,
                37.779398571318765
              ],
              [-6.921386718749999,
                38.47939467327645
              ]
            ]
          ]
        }
      }
    ]
  }
});

map.addLayers([points, lines, polygons]);
map.addPlugin(mp);
