import StyleManager from "facade/stylemanager";
M.language.setLang("es");

const map = M.map({
  container: "mapjs",
});

const mp = new StyleManager();
window.map = map;

const points = new M.layer.GeoJSON({
  name: "points",
  source: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          alumnos: 399,
          colegios: 10,
          municipio: "Sevilla",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.398185534463248, 37.45730370790821],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 325,
          colegios: 11,
          municipio: "Córdoba",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.5957414385034285, 37.31260205119489],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 58,
          colegios: 13,
          municipio: "Cádiz",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.7166812740555235, 36.842966167382926],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 301,
          colegios: 15,
          municipio: "Granada",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.1615553374241925, 37.090035553089585],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 235,
          colegios: 15,
          municipio: "Jaén",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.448482673516814, 37.656815271705675],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 148,
          colegios: 8,
          municipio: "Huelva",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.950581923428585, 36.78131955383965],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 85,
          colegios: 13,
          municipio: "Almería",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.090627618815714, 36.74307850736811],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 173,
          colegios: 8,
          municipio: "Málaga",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.3702750172379385, 36.871880421172484],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 253,
          colegios: 4,
          municipio: "Almería",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.085955495848571, 36.698061955621164],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 121,
          colegios: 18,
          municipio: "Cádiz",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.09342433102585, 37.45469867093221],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 253,
          colegios: 7,
          municipio: "Córdoba",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.146250009752628, 37.29130849330829],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 178,
          colegios: 3,
          municipio: "Granada",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.669729396428465, 37.099180667986964],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 290,
          colegios: 4,
          municipio: "Málaga",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.5723815844666715, 36.758350955763966],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 97,
          colegios: 6,
          municipio: "Sevilla",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.229523950015954, 36.95796800321581],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 244,
          colegios: 6,
          municipio: "Cádiz",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.824364867422735, 37.216618748057286],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 114,
          colegios: 4,
          municipio: "Granada",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.120464756843248, 37.80990261768569],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 202,
          colegios: 7,
          municipio: "Cádiz",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.881586033526422, 36.5099796770505],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 306,
          colegios: 14,
          municipio: "Málaga",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.9479918420390145, 37.329438353921034],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 52,
          colegios: 4,
          municipio: "Jaén",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.357277747563661, 37.86010185361898],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 229,
          colegios: 7,
          municipio: "Sevilla",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.2033881213822735, 37.51081093834673],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 58,
          colegios: 17,
          municipio: "Cádiz",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.368209186061417, 36.56019913705545],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 114,
          colegios: 15,
          municipio: "Granada",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.790633864763912, 36.84518455840279],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 84,
          colegios: 8,
          municipio: "Málaga",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.106275306740548, 37.97616841301806],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 283,
          colegios: 15,
          municipio: "Cádiz",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.377606351771481, 37.16996250256708],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 226,
          colegios: 16,
          municipio: "Granada",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.192077231736873, 36.810582602906365],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 111,
          colegios: 2,
          municipio: "Jaén",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.312952324615357, 37.688244218696724],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 276,
          colegios: 13,
          municipio: "Cádiz",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.267177704056467, 37.14433931256324],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 140,
          colegios: 5,
          municipio: "Almería",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.9000515263464255, 37.07848053272649],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 131,
          colegios: 12,
          municipio: "Granada",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.9763123852212665, 36.94121200493808],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 58,
          colegios: 2,
          municipio: "Sevilla",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.119846140677662, 37.049177992518054],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 62,
          colegios: 3,
          municipio: "Cádiz",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.415054798069191, 37.32562655729647],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 344,
          colegios: 8,
          municipio: "Málaga",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.633271660894013, 37.56687719110893],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 166,
          colegios: 14,
          municipio: "Granada",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.627568858786239, 36.88766959599923],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 78,
          colegios: 6,
          municipio: "Jaén",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.110787164934307, 36.88864450578582],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 281,
          colegios: 8,
          municipio: "Málaga",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.442189514796764, 37.983118868608685],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 74,
          colegios: 8,
          municipio: "Cádiz",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.364491979422597, 37.76589897110641],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 141,
          colegios: 13,
          municipio: "Granada",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.982592607453279, 36.74558390628279],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 259,
          colegios: 19,
          municipio: "Cádiz",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.332563335974404, 37.590623503816715],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 255,
          colegios: 10,
          municipio: "Málaga",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.665724890211363, 37.787289402072744],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 102,
          colegios: 3,
          municipio: "Sevilla",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.410819235335401, 36.93888718048877],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 228,
          colegios: 8,
          municipio: "Cádiz",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.696200334741402, 37.89454141881721],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 137,
          colegios: 16,
          municipio: "Granada",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.451135493107085, 37.06737436892989],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 83,
          colegios: 3,
          municipio: "Cádiz",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.828101590876895, 37.75870882636568],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 83,
          colegios: 14,
          municipio: "Córdoba",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.213841852401093, 37.3849199467344],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 397,
          colegios: 10,
          municipio: "Sevilla",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.162462140288094, 36.98375757145731],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 245,
          colegios: 16,
          municipio: "Granada",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.769687871441968, 36.7485448221363],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 167,
          colegios: 12,
          municipio: "Jaén",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.8064289999100644, 37.353129615247276],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 106,
          colegios: 9,
          municipio: "Cádiz",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.18130512935752, 36.91825972785444],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 98,
          colegios: 3,
          municipio: "Sevilla",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.606446965482102, 36.84820535288928],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 201,
          colegios: 19,
          municipio: "Cádiz",
        },
        geometry: {
          type: "Point",
          coordinates: [-5.268869643647613, 37.48692113860303],
        },
      },
    ],
  },
});

// ------------------SIMPLE
// const pointStyle = new M.style.Generic({
//   point: {
//     fill: {
//       color: "#ffffff",
//       opacity: "0.4",
//     },
//     stroke: {
//       color: "#3399cc",
//       width: 1.5,
//       linedash: [0, 0],
//       linedashoffset: 0,
//       linecap: "round",
//     },
//     radius: 10,
//     label: {
//       color: "#ff0000",
//       scale: 1,
//       align: "center",
//       baseline: "middle",
//       rotation: 0,
//       offset: [0, 0],
//       stroke: {
//         color: "#000000",
//         width: 3,
//         linedash: [0, 0],
//         linedashoffset: 0,
//         linecap: "butt",
//         linejoin: "miter",
//       },
//       rotate: false,
//       path: false,
//       minwidth: 10,
//       smooth: false,
//       textoverflow: "hidden",
//       font: "26px serif",
//       _attributeName: "municipio",
//       // text: (feature) => {
//       //   if (feature && feature.getAttribute) {
//       //     return feature.getAttribute("municipio") || "";
//       //   }
//       //   return "";
//       // },
//     },
//   },
// });

// ------------------CHART
//   // const pointStyle = new M.style.Generic({
// const pointStyle = new M.style.Chart({
//   type: "pie",
//   scheme: ["#ffa500", "#0f0"],
//   radius: 20,
//   offsetX: 0,
//   offsetY: 0,
//   variables: [
//     {
//       attributeName_: "alumnos",
//       label_: {
//         fill: "#ff0000",
//         scale: 1,
//         stroke: {
//           color: "#000000",
//         },
//         radiusIncrement: 2,
//       },
//       fillColor_: null,
//       legend_: "Ejemplo de leyenda",
//     },
//     {
//       attributeName_: "colegios",
//       label_: {
//         fill: "#000000",
//         scale: 1,
//         stroke: {
//           color: "#ff0000",
//         },
//         radiusIncrement: 2,
//       },
//       fillColor_: null,
//       legend_: "Ejemplo de leyenda",
//     },
//   ],
//   fill3DColor: "#ff00f0",
//   shadow3dColor: "#369",
//   donutRatio: 0.5,
//   animationStep: 1,
//   rotateWithView: false,
// });

// ------------------COROPLETAS
// const pointStyle = new M.style.Choropleth(
//   "alumnos",
//   ["#0ea32eff", "#fbaf18"],
//   M.style.quantification.QUANTILE(3)
// );

// ------------------CLUSTER
// const pointStyle = new M.style.Cluster({
//   // atributo usado para agrupar/contar
//   attribute: "alumnos",

//   // visibilidad por zoom (opcional)
//   minZoom: 10,
//   maxZoom: 20,

//   // opciones que mapea el template (incluye la variante con typo por compatibilidad)
//   hoverInteraction: true,
//   hoveInteraction: true,
//   displayAmount: true,
//   selectInteraction: true,
//   animated: false,

//   // parámetros de interacción/presentación
//   distance: 40,
//   maxFeaturesToSelect: 8,
//   distanceSelectFeatures: 30,

//   // color de la etiqueta que aparece en el template
//   label: {
//     color: "#ffffff",
//   },

//   // rangos que se muestran en el template (min, max, estilo)
//   ranges: [
//     {
//       min: 0,
//       max: 1,
//       style: new M.style.Point({
//         fill: {
//           color: "#f1c40f",
//           opacity: 0.8,
//         },
//         stroke: {
//           color: "#333333",
//           width: 1,
//         },
//         radius: 12,
//       }),
//     },
//     {
//       min: 1,
//       max: 4,
//       style: new M.style.Point({
//         fill: {
//           color: "#e67e22",
//           opacity: 0.9,
//         },
//         stroke: {
//           color: "#222222",
//           width: 1,
//         },
//         radius: 18,
//       }),
//     },
//     {
//       min: 5,
//       max: 999999,
//       style: new M.style.Point({
//         fill: {
//           color: "#e74c3c",
//           opacity: 1,
//         },
//         stroke: {
//           color: "#000000",
//           width: 2,
//         },
//         radius: 24,
//       }),
//     },
//   ],
// });

// points.setStyle(pointStyle);

const lines = new M.layer.GeoJSON({
  name: "lines",
  source: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          alumnos: 400,
          colegios: 2,
          nombre: "línea principal",
          tipo: "ruta escolar",
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [-3.8452148437499996, 37.93553306183642],
            [-1.669921875, 38.42777351132902],
            [-3.27392578125, 37.1165261849112],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 120,
          colegios: 1,
          nombre: "tramo A",
          tipo: "auxiliar",
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [-2.724609375, 37.92686760148135],
            [-4.427490234375, 37.16031654673677],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 80,
          colegios: 0,
          nombre: "tramo B",
          tipo: "auxiliar",
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [-1.636962890625, 38.71123253895224],
            [-5.020751953125, 38.91668153637508],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 95,
          colegios: 1,
          nombre: "conector sur",
          tipo: "secundario",
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [-1.669921875, 38.57393751557591],
            [-4.647216796875, 37.90953361677018],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 60,
          colegios: 1,
          nombre: "ruta suroeste",
          tipo: "secundario",
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [-1.395263671875, 38.42777351132902],
            [-2.109375, 37.18657859524883],
            [-3.482666015625, 36.78289206199065],
            [-4.68017578125, 36.85325222344018],
          ],
        },
      },
    ],
  },
});

const polygons = new M.layer.GeoJSON({
  name: "polygons",
  source: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          alumnos: 400,
          colegios: 2,
          nombre: "zona norte",
          tipo: "urbano",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-5.5810546875, 40.713955826286046],
              [-6.734619140625, 40.153686857794035],
              [-6.383056640625, 39.78321267821705],
              [-6.8994140625, 39.47860556892209],
              [-6.492919921875, 39.39375459224348],
              [-5.833740234375, 39.38526381099774],
              [-5.33935546875, 39.78321267821705],
              [-5.5810546875, 40.713955826286046],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 320,
          colegios: 3,
          nombre: "zona centro",
          tipo: "urbano",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-3.2080078125, 40.6723059714534],
              [-4.515380859375, 41.12074559016745],
              [-4.625244140625, 40.01078714046552],
              [-3.779296875, 39.715638134796336],
              [-4.603271484375, 39.26628442213066],
              [-4.4384765625, 39.00211029922515],
              [-3.834228515625, 38.98503278695909],
              [-2.669677734375, 39.605688178320804],
              [-2.35107421875, 40.22082997283287],
              [-3.2080078125, 40.6723059714534],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 180,
          colegios: 1,
          nombre: "zona noroeste",
          tipo: "rural",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-6.50390625, 41.43449030894922],
              [-7.536621093749999, 40.871987756697415],
              [-7.448730468749999, 40.027614437486655],
              [-6.50390625, 41.43449030894922],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 220,
          colegios: 2,
          nombre: "zona suroeste",
          tipo: "rural",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-8.536376953125, 39.46164364205549],
              [-8.67919921875, 37.53586597792038],
              [-7.404785156249999, 38.75408327579141],
              [-7.943115234375001, 39.631076770083666],
              [-8.536376953125, 39.46164364205549],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          alumnos: 360,
          colegios: 3,
          nombre: "zona sur",
          tipo: "rural",
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-6.921386718749999, 38.47939467327645],
              [-7.921142578125, 37.23032838760387],
              [-6.976318359375, 36.1822249804225],
              [-6.6796875, 37.49229399862877],
              [-6.383056640625, 36.81808022778526],
              [-5.899658203125, 37.996162679728116],
              [-6.943359374999999, 37.779398571318765],
              [-6.921386718749999, 38.47939467327645],
            ],
          ],
        },
      },
    ],
  },
});

// const stylePolygons = new M.style.Generic({
//   polygon: {
//     fill: {
//       color: "#ff0000",
//       opacity: "0.4",
//       pattern: {
//         name: "CHAOS",
//         size: 4,
//         spacing: 2,
//         color: "#00ff59",
//         scale: 5,
//         rotation: 6,
//         offset: 5,
//       },
//     },
//     stroke: {
//       color: "#3399cc",
//       width: 1.5,
//       linedash: [0, 0],
//       linedashoffset: 0,
//       linecap: "round",
//       linejoin: "round",
//     },
//   },
// });

const stylePolygons = new M.style.Category("tipo", {
  urbano: new M.style.Polygon({
    fill: {
      color: "#ff0000",
      opacity: 0.4,
      pattern: {
        name: "HATCH",
        size: 4,
        spacing: 2,
        color: "#00ff59",
        scale: 5,
        rotation: 6,
        offset: 5,
      },
    },
    stroke: {
      color: "#3399cc",
      width: 1.5,
      linedash: [0, 0],
      linedashoffset: 0,
      linecap: "round",
      linejoin: "round",
    },
  }),
  rural: new M.style.Polygon({
    fill: {
      color: "#0000ff",
      opacity: 0.4,
      pattern: {
        name: "DOT",
        size: 3,
        spacing: 3,
        color: "#ffcc00",
        scale: 4,
        rotation: 0,
        offset: 2,
      },
    },
    stroke: {
      color: "#ff6600",
      width: 2,
      linedash: [4, 2],
      linedashoffset: 1,
      linecap: "square",
      linejoin: "bevel",
    },
  }),
  other: new M.style.Polygon({
    fill: {
      color: "#808080",
      opacity: 0.3,
      pattern: {
        name: "CROSS",
        size: 5,
        spacing: 4,
        color: "#ffffff",
        scale: 3,
        rotation: 45,
        offset: 3,
      },
    },
    stroke: {
      color: "#000000",
      width: 1,
      linedash: [1, 1],
      linedashoffset: 0,
      linecap: "round",
      linejoin: "round",
    },
  }),
});

polygons.setStyle(stylePolygons);

const generic = new M.layer.GeoJSON({
  name: "generic",
  source: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-7.021386718749999, 38.07939467327645],
              [-9.021142578125, 36.03032838760387],
              [-7.143359374999999, 35.179398571318765],
              [-6.121386718749999, 37.17939467327645],
            ],
          ],
        },
      },
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [-4.113134765624999, 37.148696585910376],
        },
      },
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [-3.1452148437499996, 37.13553306183642],
            [-1.169921875, 38.12777351132902],
            [-3.17392578125, 37.1165261849112],
          ],
        },
      },
    ],
  },
});

// Capa de campamentos 2
// const campamentos2 = new M.layer.WFS({
//   url: "https://hcsigc.juntadeandalucia.es/geoserver/IECA/wfs?",
//   name: "sigc_campamentos_1724753464727",
//   legend: "Campamentos 2",
//   geometry: "POINT",
//   extract: true,
// });

// let estiloPunto2 = new M.style.Generic({
//   point: {
//     radius: 20,
//     fill: {
//       color: "orange",
//       opacity: "0.8",
//     },
//     stroke: {
//       color: "red",
//       width: 1,
//       // linecap: "square",
//       // linedash: [30, 30],
//       // linejoin: "miter", // miter, round y bevel
//     },
//     // CASO ICON FontSymbol
//     icon: {
//       form: M.style.form.POI,
//       // url: "https://hcsigc.juntadeandalucia.es/geoserver/IECA/wfs?",
//       class: "fa-user",
//       fontsize: 0.8,
//       gradient: false,
//       radius: 70,
//       rotation: 0,
//       rotate: false,
//       width: 20,
//       // anchor: [0.5, 0.5],
//       color: "green",
//       fill: "yellow",
//       // gradientcolor: '#FF0000',
//       opacity: 0.8,
//     },
//     // icon: {
//     //   src: "https://mapea4-sigc.juntadeandalucia.es/assets/img/m-pin-24-sel.svg",
//     //   rotation: 0,
//     //   scale: 1,
//     //   opacity: 0.8,
//     //   anchor: [0.5, 1],
//     //   //anchororigin: 'top-left',
//     //   //anchorxunits: 'fraction',
//     //   //anchoryunits: 'fraction',
//     //   rotate: false,
//     //   //offset: [10, 0],
//     //   //crossorigin: null,
//     //   //snaptopixel: true,
//     //   //offsetorigin: 'bottom-left',
//     //   //size:[10,10]
//     // },
//   },
// });

// let estiloPunto2 = new M.style.Generic({
//   point: {
//     radius: 10,
//     fill: {
//       color: "orange",
//       opacity: "0.8",
//     },
//     stroke: {
//       color: "red",
//       width: 1,
//     },
//     icon: {
//       form: "POI",
//       class: "fa-user",
//       fontsize: 0.9,
//       gradient: false,
//       radius: 15,
//       rotation: 0,
//       rotate: false,
//       width: 20,
//       color: "green",
//       fill: "yellow",
//       opacity: 0.8,
//     },
//   },
// });

// Estilo de categoría basado en un atributo (ejemplo: por tipo de campamento)
// let estiloPunto2 = new M.style.Category("provincia", {
//   ALMERÍA: new M.style.Point({
//     radius: 8,
//     fill: {
//       color: "#FF5733",
//       opacity: 0.8,
//     },
//     stroke: {
//       color: "#C70039",
//       width: 2,
//     },
//     icon: {
//       form: "CIRCLE",
//       class: "fa-user",
//       fontsize: 1.0,
//       radius: 12,
//       color: "#FF5733",
//       fill: "#FFC300",
//       opacity: 0.9,
//       rotate: true,
//     },
//   }),
//   CÁDIZ: new M.style.Point({
//     radius: 10,
//     fill: {
//       color: "#33A1FF",
//       opacity: 0.8,
//     },
//     stroke: {
//       color: "#0080FF",
//       width: 2,
//     },
//     icon: {
//       form: "TRIANGLE",
//       class: "fa-user",
//       fontsize: 1.1,
//       radius: 14,
//       color: "#33A1FF",
//       fill: "#87CEEB",
//       opacity: 0.9,
//     },
//   }),
//   CÓRDOBA: new M.style.Point({
//     radius: 9,
//     fill: {
//       color: "#33FF57",
//       opacity: 0.8,
//     },
//     stroke: {
//       color: "#28A745",
//       width: 2,
//     },
//     icon: {
//       form: "SQUARE",
//       class: "fa-user",
//       fontsize: 1.0,
//       radius: 13,
//       color: "#33FF57",
//       fill: "#90EE90",
//       opacity: 0.9,
//     },
//   }),
//   GRANADA: new M.style.Point({
//     radius: 11,
//     fill: {
//       color: "#FF33F5",
//       opacity: 0.8,
//     },
//     stroke: {
//       color: "#DC143C",
//       width: 2,
//     },
//     icon: {
//       form: "POI",
//       class: "fa-user",
//       fontsize: 1.2,
//       radius: 15,
//       color: "#FF33F5",
//       fill: "#FFB6C1",
//       opacity: 0.9,
//     },
//   }),
//   HUELVA: new M.style.Point({
//     radius: 8,
//     fill: {
//       color: "#FFD700",
//       opacity: 0.8,
//     },
//     stroke: {
//       color: "#FF8C00",
//       width: 2,
//     },
//     icon: {
//       form: "MARKER",
//       class: "fa-user",
//       fontsize: 1.0,
//       radius: 12,
//       color: "#FFD700",
//       fill: "#FFFF99",
//       opacity: 0.9,
//     },
//   }),
//   JAÉN: new M.style.Point({
//     radius: 9,
//     fill: {
//       color: "#8B4513",
//       opacity: 0.8,
//     },
//     stroke: {
//       color: "#654321",
//       width: 2,
//     },
//     icon: {
//       form: "CIRCLE",
//       class: "fa-user",
//       fontsize: 1.0,
//       radius: 13,
//       color: "#8B4513",
//       fill: "#DEB887",
//       opacity: 0.9,
//     },
//   }),
//   MÁLAGA: new M.style.Point({
//     radius: 10,
//     fill: {
//       color: "#FF69B4",
//       opacity: 0.8,
//     },
//     stroke: {
//       color: "#FF1493",
//       width: 2,
//     },
//     icon: {
//       form: "TRIANGLE",
//       class: "fa-user",
//       fontsize: 1.1,
//       radius: 14,
//       color: "#FF69B4",
//       fill: "#FFCCCB",
//       opacity: 0.9,
//     },
//   }),
//   SEVILLA: new M.style.Point({
//     radius: 12,
//     fill: {
//       color: "#9370DB",
//       opacity: 0.8,
//     },
//     stroke: {
//       color: "#8A2BE2",
//       width: 2,
//     },
//     icon: {
//       form: "POI",
//       class: "fa-user",
//       fontsize: 1.3,
//       radius: 16,
//       color: "#9370DB",
//       fill: "#DDA0DD",
//       opacity: 0.9,
//     },
//   }),
//   // Estilo por defecto para valores no especificados
//   other: new M.style.Point({
//     radius: 7,
//     fill: {
//       color: "#808080",
//       opacity: 0.6,
//     },
//     stroke: {
//       color: "#696969",
//       width: 1,
//     },
//     icon: {
//       form: "CIRCLE",
//       class: "fa-user",
//       fontsize: 0.8,
//       radius: 10,
//       color: "#808080",
//       fill: "#D3D3D3",
//       opacity: 0.7,
//     },
//   }),
// });

// campamentos2.setStyle(estiloPunto2);

// map.addWFS(campamentos2);
// window.wfs3 = wfs3;
// window.points = points;
// map.addWFS(campamentos1)
map.addLayers([points, lines, polygons, generic]);

// Agregar el control LayerSwitcher
// const layerSwitcher = new M.control.LayerSwitcher();
// map.addControls([layerSwitcher]);

map.addPlugin(mp);
