import StyleManagerImplControl from "impl/stylemanagercontrol";
import template from "templates/stylemanager";
import { Binding } from "./binding/binding";
import BindingController from "./bindingcontroller";

export default class StyleManagerControl extends M.Control {
  /**
   * @classdesc
   * Main constructor of the class. Creates a PluginControl
   * control
   *
   * @constructor
   * @extends {M.Control}
   * @api stable
   */
  constructor(layer) {
    // 1. checks if the implementation can create PluginControl
    if (M.utils.isUndefined(StyleManagerImplControl)) {
      M.exception(
        "La implementación usada no puede crear controles StylemanagerControl"
      );
    }
    // 2. implementation of this control
    const impl = new StyleManagerImplControl();
    super(impl, "StyleManager");

    this.template = null;
    this.layer_ = layer;

    M.utils.extends = M.utils.extendsObj;
  }

  /**
   * This function creates the view
   *
   * @public
   * @function
   * @param {M.Map} map to add the control
   * @api stable
   */
  createView(map) {
    this.facadeMap_ = map;
    const layers = map
      .getWFS()
      .concat(
        map
          .getMVT()
          .concat(
            map
              .getKML()
              .concat(
                map.getLayers().filter((layer) => layer.type === "GeoJSON")
              )
          )
      )
      .filter((layer) => {
        return layer.name;
      });

    const translationKeys = {
      selectLayer: "select-layer",
      apply: "apply",
      clear: "clear",
      symbology: "symbology",
      symbologysymbol: "symbology-symbol",
      symbologycategory: "symbology-category",
      symbologychoropleths: "symbology-choropleths",
      symbologyproportional: "symbology-proportional",
      symbologycluster: "symbology-cluster",
      symbologyheatmap: "symbology-heatmap",
      label: "label",
      statistical: "statistical",
    };

    return new Promise((success, fail) => {
      const html = M.template.compileSync(template, {
        vars: {
          layers: layers,
          translations: Binding.getTranslations(translationKeys),
        },
      });
      this.template = html;
      let htmlSelect = html.querySelector("#m-stylemanager-select");
      html
        .querySelector("#m-stylemanager-symbology")
        .addEventListener("click", () => {
          if (
            this.template
              .querySelector("#m-stylemanager-arrow-list")
              .classList.contains("m-stylemanager-icons-down-open")
          ) {
            this.removeHidden("#m-stylemanager-symbology-list");
            this.template
              .querySelector("#m-stylemanager-arrow-list")
              .classList.remove("m-stylemanager-icons-down-open");
            this.template
              .querySelector("#m-stylemanager-arrow-list")
              .classList.add("m-stylemanager-icons-up-open");
          } else if (
            this.template
              .querySelector("#m-stylemanager-arrow-list")
              .classList.contains("m-stylemanager-icons-up-open")
          ) {
            this.addHidden("#m-stylemanager-symbology-list");
            this.template
              .querySelector("#m-stylemanager-arrow-list")
              .classList.remove("m-stylemanager-icons-up-open");
            this.template
              .querySelector("#m-stylemanager-arrow-list")
              .classList.add("m-stylemanager-icons-down-open");
          }
        });
      this.bindinController_ = new BindingController(
        html.querySelector("#m-stylemanager-container-options")
      );
      this.addSelectListener(htmlSelect, html);
      this.subscribeRemovedLayer(htmlSelect);
      this.subscribeAddedLayer(htmlSelect);
      this.loadFonts(html);
      success(html);
      this.addApplyBtnListener(html);
      this.addClearBtnListener(html);
      this.preventNegativeNumbers(html);
      this.renderOptionsLayerParam(htmlSelect, html, layers);
      success(html);
    });
  }

  /**
   * Previene la inserción de números negativos en todos los inputs numéricos
   * @param {HTMLElement} html - El elemento HTML del template
   */
  preventNegativeNumbers(html) {
    // Usar delegación de eventos en el contenedor principal
    html.addEventListener('input', (event) => {
      const target = event.target;
      
      // Verificar si es un input de tipo number
      if (target.tagName === 'INPUT' && target.type === 'number') {
        const value = parseFloat(target.value);
        const min = parseFloat(target.getAttribute('min'));
        
        // Si tiene un valor y es negativo
        if (!isNaN(value) && value < 0) {
          // Si tiene min definido, usar ese valor, sino usar 0
          target.value = !isNaN(min) ? Math.max(value, min) : Math.abs(value);
        }
        
        // Si el min está definido y el valor es menor que min
        if (!isNaN(min) && !isNaN(value) && value < min) {
          target.value = min;
        }
      }
    });

    // También prevenir la entrada desde el teclado
    html.addEventListener('keydown', (event) => {
      const target = event.target;
      
      if (target.tagName === 'INPUT' && target.type === 'number') {
        // Prevenir el signo menos si min es 0 o mayor
        const min = parseFloat(target.getAttribute('min'));
        if ((!isNaN(min) && min >= 0) || isNaN(min)) {
          if (event.key === '-' || event.key === 'Subtract') {
            event.preventDefault();
          }
        }
      }
    });
  }

  addSelectListener(htmlSelect, html) {
    htmlSelect.addEventListener("change", () => {
      this.renderOptions(htmlSelect, html);
    });
  }

  subscribeRemovedLayer(htmlSelect) {
    this.facadeMap_.on(M.evt.REMOVED_LAYER, (layers) => {
      if (Array.isArray(layers)) {
        layers
          .filter((layer) => layer instanceof M.layer.Vector)
          .forEach((layer) => this.removeLayerOption(htmlSelect, layer.name));
      } else if (layers instanceof M.layer.Vector) {
        const _layer = Object.assign({}, layers);
        this.removeLayerOption(htmlSelect, _layer.name);
      }
    });
  }

  removeLayerOption(htmlSelect, layerName) {
    const options = htmlSelect.options;
    for (let i = 0; i < options.length; i++) {
      if (options[i].value === layerName) {
        htmlSelect.remove(i);
        break;
      }
    }
  }

  subscribeAddedLayer(htmlSelect) {
    this.facadeMap_.on(M.evt.ADDED_LAYER, (layers) => {
      if (Array.isArray(layers)) {
        layers
          .filter(
            (layer) =>
              layer instanceof M.layer.Vector && layer.name !== "selectLayer"
          )
          .forEach((layer) => this.addLayerOption(htmlSelect, layer.name));
      } else if (layers instanceof M.layer.Vector) {
        const _layer = Object.assign({}, layers);
        this.addLayerOption(htmlSelect, _layer);
      }
    });
  }

  addApplyBtnListener(html) {
    let buttonApply = html.querySelector("[data-apply-style]");
    buttonApply.addEventListener("click", this.applyStyle.bind(this));
  }

  addClearBtnListener(html) {
    let buttonClear = html.querySelector("[data-clear-style]");
    buttonClear.addEventListener("click", this.clearStyle.bind(this));
  }

  clearStyle() {
    let currentLayer = null;

    if (
      this.bindinController_ &&
      typeof this.bindinController_.getCurrentLayer === "function"
    ) {
      currentLayer = this.bindinController_.getCurrentLayer();
    }

    if (!currentLayer && this.layer_) {
      currentLayer = this.layer_;
    }

    if (!currentLayer) {
      const htmlSelect = this.template.querySelector("#m-stylemanager-select");
      if (htmlSelect && htmlSelect.value) {
        currentLayer = this.getLayerByName(htmlSelect.value);
      }
    }

    if (currentLayer instanceof M.layer.Vector) {
      currentLayer.setStyle(M.layer.Vector.DEFAULT_OPTIONS_STYLE);

      if (
        this.bindinController_ &&
        this.bindinController_.bindings_ &&
        this.bindinController_.bindings_["stylecategory"]
      ) {
        const categoryBinding =
          this.bindinController_.bindings_["stylecategory"];
        if (typeof categoryBinding.reset === "function") {
          categoryBinding.reset();
        }
      }

      // Actualizar las opciones del formulario con el estilo por defecto
      this.bindinController_.change(currentLayer);
    } else {
      M.dialog.info("Tiene que elegir una capa.", "Elija capa");
    }
  }

  applyStyle() {
    if (this.layer_ instanceof M.layer.Vector) {
      this.layer_.clearStyle();
      let style = this.bindinController_.getStyle();
      if (style instanceof M.style.Category) {
        if (
          !style.categoryStyles_ ||
          Object.keys(style.categoryStyles_).length === 0
        ) {
          if (
            typeof this.bindinController_.generateCategoryStyles === "function"
          ) {
            const generatedStyles =
              this.bindinController_.generateCategoryStyles();
            style.setCategories(generatedStyles);
          }
        }
      }
      this.layer_.setStyle(style);
    } else {
      M.dialog.info("Tiene que elegir una capa.", "Elija capa");
    }
  }

  addLayerOption(htmlSelect, name) {
    if (this.isNotAdded(name, htmlSelect) === true) {
      let htmlOption = document.createElement("option");
      htmlOption.setAttribute("name", name);
      htmlOption.innerText = name;
      htmlSelect.add(htmlOption);
    }
  }

  isNotAdded(layerName, htmlSelect) {
    const aChildren = [...htmlSelect.children];
    return !aChildren.some((o) => o.innerHTML === layerName);
  }

  removeHidden(idObject) {
    this.template
      .querySelector(idObject)
      .classList.remove("m-stylemanager-hidden");
  }

  addHidden(idObject) {
    this.template
      .querySelector(idObject)
      .classList.add("m-stylemanager-hidden");
  }

  renderOptions(htmlSelect, html, layer = null) {
    let layerName = htmlSelect.value;
    this.layer_ = this.getLayerByName(layerName);
    if (layer != null) {
      this.layer_ = layer;
    }
    if (this.layer_ instanceof M.layer.Vector) {
      let features = this.layer_.getFeatures();
      if (features.length === 0) {
        M.dialog.error(
          "La capa no tiene features o aún no se han cargado.",
          "Error"
        );
        htmlSelect.selectedIndex = 0;
      } else {
        this.removeHidden(".m-stylemanager-container-content");
        this.bindinController_.change(this.layer_);
      }
    }
  }

  getLayerByName(layerName) {
    let layers = this.facadeMap_
      .getWFS()
      .concat(
        this.facadeMap_
          .getMVT()
          .concat(
            this.facadeMap_
              .getKML()
              .concat(
                this.facadeMap_
                  .getLayers()
                  .filter((layer) => layer.type === "GeoJSON")
              )
          )
      )
      .filter((layer) => {
        return layer.name !== "selectLayer";
      });

    return layers.find((layer) => layer.name === layerName);
  }

  /**
   * @function
   */
  loadFonts() {
    M.style.Font.addSymbol(
      {
        font: "FontAwesome",
        name: "FontAwesome",
        copyright: "SIL OFL 1.1",
        prefix: "fa",
      },
      {
        "fa-glass": "\uf000",
        "fa-music": "\uf001",
        "fa-search": "\uf002",
        "fa-envelope-o": "\uf003",
        "fa-heart": "\uf004",
        "fa-star": "\uf005",
        "fa-star-o": "\uf006",
        "fa-user": "\uf007",
        "fa-film": "\uf008",
        "fa-th-large": "\uf009",
        "fa-th": "\uf00a",
        "fa-th-list": "\uf00b",
        "fa-check": "\uf00c",
        "fa-remove": "\uf00d",
        "fa-close": "\uf00d",
        "fa-times": "\uf00d",
        "fa-search-plus": "\uf00e",
        "fa-search-minus": "\uf010",
        "fa-power-off": "\uf011",
        "fa-signal": "\uf012",
        "fa-gear": "\uf013",
        "fa-cog": "\uf013",
        "fa-trash-o": "\uf014",
        "fa-home": "\uf015",
        "fa-file-o": "\uf016",
        "fa-clock-o": "\uf017",
        "fa-road": "\uf018",
        "fa-download": "\uf019",
        "fa-arrow-circle-o-down": "\uf01a",
        "fa-arrow-circle-o-up": "\uf01b",
        "fa-inbox": "\uf01c",
        "fa-play-circle-o": "\uf01d",
        "fa-rotate-right": "\uf01e",
        "fa-repeat": "\uf01e",
        "fa-refresh": "\uf021",
        "fa-list-alt": "\uf022",
        "fa-lock": "\uf023",
        "fa-flag": "\uf024",
        "fa-headphones": "\uf025",
        "fa-volume-off": "\uf026",
        "fa-volume-down": "\uf027",
        "fa-volume-up": "\uf028",
        "fa-qrcode": "\uf029",
        "fa-barcode": "\uf02a",
        "fa-tag": "\uf02b",
        "fa-tags": "\uf02c",
        "fa-book": "\uf02d",
        "fa-bookmark": "\uf02e",
        "fa-print": "\uf02f",
        "fa-camera": "\uf030",
        "fa-font": "\uf031",
        "fa-bold": "\uf032",
        "fa-italic": "\uf033",
        "fa-text-height": "\uf034",
        "fa-text-width": "\uf035",
        "fa-align-left": "\uf036",
        "fa-align-center": "\uf037",
        "fa-align-right": "\uf038",
        "fa-align-justify": "\uf039",
        "fa-list": "\uf03a",
        "fa-dedent": "\uf03b",
        "fa-outdent": "\uf03b",
        "fa-indent": "\uf03c",
        "fa-video-camera": "\uf03d",
        "fa-photo": "\uf03e",
        "fa-image": "\uf03e",
        "fa-picture-o": "\uf03e",
        "fa-pencil": "\uf040",
        "fa-map-marker": "\uf041",
        "fa-adjust": "\uf042",
        "fa-tint": "\uf043",
        "fa-edit": "\uf044",
        "fa-pencil-square-o": "\uf044",
        "fa-share-square-o": "\uf045",
        "fa-check-square-o": "\uf046",
        "fa-arrows": "\uf047",
        "fa-step-backward": "\uf048",
        "fa-fast-backward": "\uf049",
        "fa-backward": "\uf04a",
        "fa-play": "\uf04b",
        "fa-pause": "\uf04c",
        "fa-stop": "\uf04d",
        "fa-forward": "\uf04e",
        "fa-fast-forward": "\uf050",
        "fa-step-forward": "\uf051",
        "fa-eject": "\uf052",
        "fa-chevron-left": "\uf053",
        "fa-chevron-right": "\uf054",
        "fa-plus-circle": "\uf055",
        "fa-minus-circle": "\uf056",
        "fa-times-circle": "\uf057",
        "fa-check-circle": "\uf058",
        "fa-question-circle": "\uf059",
        "fa-info-circle": "\uf05a",
        "fa-crosshairs": "\uf05b",
        "fa-times-circle-o": "\uf05c",
        "fa-check-circle-o": "\uf05d",
        "fa-ban": "\uf05e",
        "fa-arrow-left": "\uf060",
        "fa-arrow-right": "\uf061",
        "fa-arrow-up": "\uf062",
        "fa-arrow-down": "\uf063",
        "fa-mail-forward": "\uf064",
        "fa-share": "\uf064",
        "fa-expand": "\uf065",
        "fa-compress": "\uf066",
        "fa-plus": "\uf067",
        "fa-minus": "\uf068",
        "fa-asterisk": "\uf069",
        "fa-exclamation-circle": "\uf06a",
        "fa-gift": "\uf06b",
        "fa-leaf": "\uf06c",
        "fa-fire": "\uf06d",
        "fa-eye": "\uf06e",
        "fa-eye-slash": "\uf070",
        "fa-warning": "\uf071",
        "fa-exclamation-triangle": "\uf071",
        "fa-plane": "\uf072",
        "fa-calendar": "\uf073",
        "fa-random": "\uf074",
        "fa-comment": "\uf075",
        "fa-magnet": "\uf076",
        "fa-chevron-up": "\uf077",
        "fa-chevron-down": "\uf078",
        "fa-retweet": "\uf079",
        "fa-shopping-cart": "\uf07a",
        "fa-folder": "\uf07b",
        "fa-folder-open": "\uf07c",
        "fa-arrows-v": "\uf07d",
        "fa-arrows-h": "\uf07e",
        "fa-bar-t-o": "\uf080",
        "fa-bar-t": "\uf080",
        "fa-twitter-square": "\uf081",
        "fa-facebook-square": "\uf082",
        "fa-camera-retro": "\uf083",
        "fa-key": "\uf084",
        "fa-gears": "\uf085",
        "fa-cogs": "\uf085",
        "fa-comments": "\uf086",
      }
    );
  }
  /**
   * This function compares controls
   *
   * @public
   * @function
   * @param {M.Control} control to compare
   * @api stable
   */
  equals(control) {
    return control instanceof StyleManagerControl;
  }
}
