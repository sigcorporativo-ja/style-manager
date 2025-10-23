import * as chroma from "chroma-js";
import { Binding } from "./binding";

export class ClusterBinding extends Binding {
  constructor(html, htmlParent, styleType, styleParams, layer) {
    super(html, htmlParent, styleType, styleParams, layer);
    this.compilePromise_.then(() => {
      this.addEventRangeListener();
      this.addPaginationListener();
      this.addOpacityListeners();
      this.initializeRangeProgress();
    });
  }

  /**
   * This function sets the attribute layer to the binding.
   * @function
   * @param {M.layer.Vector}
   */
  setLayer(layer) {
    this.layer_ = layer;
    return this;
  }

  /**
   * This function generates the options style from his own html form.
   *
   * @function
   * @api stable
   */
  generateOptions() {
    let styleOpts = {};
    styleOpts["options"] = {};
    styleOpts["ranges"] = {};

    // styleOpts.options section
    this.querySelectorAllForEach("[data-style-options]", (element) => {
      let prop = element.dataset["styleOptions"];
      let value = element.value;

      if (element.type === "checkbox") {
        value = element.checked;
      }

      if (element.type === "number") {
        value = parseFloat(value);
      }

      if (prop === "label.color") {
        styleOpts["options"]["label"] = {};
        styleOpts["options"]["label"]["color"] = value;
      } else {
        styleOpts["options"][prop] = value;
      }
    });

    // Ranges cluster section
    this.querySelectorAllForEach(
      "[data-ranges-id][data-apply-range]",
      (element) => {
        let id = element.dataset["rangesId"];
        if (styleOpts["ranges"][id] == undefined) {
          styleOpts["ranges"][id] = {};
        }
        let path = element.dataset["rangesOptions"];
        let value = element.value;

        if (element.type === "number" || element.type === "range") {
          value = parseFloat(value);
          if (element.classList.contains("m-stylemanager-number-opacity")) {
            value = value / 100;
          }
        }

        // Guardar opacidad como propiedad plana
        if (path === "opacity") {
          styleOpts["ranges"][id]["opacity"] = value;
        } else {
          Binding.createObj(styleOpts["ranges"][id], path, value);
        }
      }
    );

    styleOpts["ranges"] = Object.values(styleOpts["ranges"]).filter(
      (option) => !isNaN(option["minRange"]) && !isNaN(option["maxRange"])
    );
    return styleOpts;
  }

  /**
   * This function generates the cluster style from GUI Options.
   *
   * @function
   * @returns {M.style.Cluster}
   */
  generateStyle() {
    let opts = this.generateOptions();
    let optsRanges = [...opts.ranges];
    let ranges = optsRanges.map((obj) => {
      let styleObj;
      if (obj["style"] && typeof obj["style"].get === "function") {
        styleObj = obj["style"];
      } else {
        let styleParams = {
          fill: obj["style"].fill,
          stroke: obj["style"].stroke,
          radius: obj["style"].radius,
        };
        styleObj = new M.style.Point(styleParams);
      }

      return {
        min: obj["minRange"],
        max: obj["maxRange"],
        style: styleObj,
      };
    });
    opts.options["ranges"] = ranges;
    return new M.style.Cluster(opts.options, {
      distanceSelectFeatures: opts.options.distanceSelectFeatures,
    });
  }

  /**
   * This function sets the number of cluster ranges.
   *
   * @function
   */
  setRanges() {
    let rangesInput = this.querySelector("[data-number-ranges]");
    let numRanges = parseInt(rangesInput.value);
    if (numRanges > 0 && numRanges < ClusterBinding.NUMBER_RANGES) {
      for (let i = 1; i < numRanges + 1; i++) {
        let pagerElement = this.querySelector(`[data-page-selector="${i}"]`);
        pagerElement.classList.remove("m-stylemanager-hidden");
        this.querySelectorAllForEach(`[data-ranges-id="${i}"]`, (element) => {
          element.setAttribute("data-apply-range", "");
        });
      }

      for (let i = numRanges + 1; i < ClusterBinding.NUMBER_RANGES; i++) {
        let pagerElement = this.querySelector(`[data-page-selector="${i}"]`);
        pagerElement.classList.add("m-stylemanager-hidden");
        this.querySelectorAllForEach(`[data-ranges-id="${i}"]`, (element) => {
          element.removeAttribute("data-apply-range");
        });
      }

      let pagerElement = this.querySelector(
        `[data-page-selector="${numRanges}"]`
      );
      this.paginationListener(pagerElement)();

      this.addOpacityListeners();
      this.initializeRangeProgress();
    }
  }

  /**
   * This function activate the page selector passed by parameter.
   *
   * @function
   * @param {HTMLElement}
   */
  paginationListener(element) {
    return () => {
      let oldElement = this.querySelector("[data-page-active]");
      if (oldElement != null) {
        oldElement.removeAttribute("data-page-active");
        oldElement.classList.remove("m-stylemanager-page-active");
        let oldId = oldElement.dataset["pageSelector"];
        let oldRange = this.querySelector(`[data-page='${oldId}']`);
        if (oldRange != null) {
          oldRange.classList.add("m-stylemanager-hidden");
        }
      }

      if (element != null) {
        element.classList.add("m-stylemanager-page-active");
        element.dataset["pageActive"] = "";
        let id = element.dataset["pageSelector"];
        let newRange = this.querySelector(`[data-page='${id}']`);
        newRange.classList.remove("m-stylemanager-hidden");

        this.addOpacityListeners();
        this.initializeRangeProgress();
      }
    };
  }

  /**
   * TODO
   */
  addEventRangeListener() {
    let rangesInput = this.querySelector("[data-number-ranges]");
    rangesInput.addEventListener("input", this.setRanges.bind(this));
  }

  /**
   * TODO
   */
  addPaginationListener() {
    this.querySelectorAllForEach("[data-page-selector]", (element) => {
      element.addEventListener(
        "click",
        this.paginationListener(element).bind(this)
      );
    });
  }

  /**
   * This function adds event listeners for opacity controls.
   * Synchronizes range and number inputs for opacity.
   */
  addOpacityListeners() {
    this.querySelectorAllForEach(".m-stylemanager-range-opacity", (element) => {
      if (element._opacityInputHandler) {
        element.removeEventListener("input", element._opacityInputHandler);
      }
    });

    this.querySelectorAllForEach(
      ".m-stylemanager-number-opacity",
      (element) => {
        if (element._opacityInputHandler) {
          element.removeEventListener("input", element._opacityInputHandler);
        }
      }
    );

    this.querySelectorAllForEach(".m-stylemanager-range-opacity", (element) => {
      const numberElement = element.nextElementSibling;
      if (
        numberElement &&
        numberElement.classList.contains("m-stylemanager-number-opacity")
      ) {
        element._opacityInputHandler = (e) => {
          numberElement.value = Math.round(e.currentTarget.value * 100);
          this.updateRangeProgress(e.currentTarget);
        };
        element.addEventListener("input", element._opacityInputHandler);
      }
    });

    this.querySelectorAllForEach(
      ".m-stylemanager-number-opacity",
      (element) => {
        const rangeElement = element.previousElementSibling;
        if (
          rangeElement &&
          rangeElement.classList.contains("m-stylemanager-range-opacity")
        ) {
          element._opacityInputHandler = (e) => {
            rangeElement.value = e.currentTarget.value / 100;
            this.updateRangeProgress(rangeElement);
          };
          element.addEventListener("input", element._opacityInputHandler);
        }
      }
    );

    this.querySelectorAllForEach('input[type="range"]', (element) => {
      if (element._rangeProgressListener) {
        element.removeEventListener("input", element._rangeProgressListener);
      }

      element._rangeProgressListener = (e) => {
        this.updateRangeProgress(e.currentTarget);
      };

      element.addEventListener("input", element._rangeProgressListener);
    });
  }
  /**
   * @function
   *
   */
  getOptionsTemplate() {
    let options = Object.assign({}, ClusterBinding.DEFAULT_OPTIONS_STYLE);
    // Si hay estilo previo, adaptar igual que antes
    if (this.style_ != null) {
      options = Object.assign({}, this.style_.getOptions());
      let ranges = options["ranges"]
        .filter((range) => !isNaN(range["min"]))
        .map((rangeOpt) => {
          let obj = {};
          let style = rangeOpt["style"];
          if (style && typeof style.get === "function") {
            obj["min"] = rangeOpt["min"];
            obj["max"] = rangeOpt["max"];
            obj["fill"] = style.get("fill.color");
            obj["stroke"] = style.get("stroke.color");
            obj["width"] = style.get("stroke.width");
            obj["opacity"] =
              style.get("fill.opacity") == null ? 1 : style.get("fill.opacity");
            obj["radius"] = style.get("radius");
          } else {
            obj["min"] = rangeOpt["min"];
            obj["max"] = rangeOpt["max"];
            obj["fill"] = rangeOpt.style.fill.color;
            obj["stroke"] = rangeOpt.style.stroke.color;
            obj["width"] = rangeOpt.style.stroke.width;
            obj["opacity"] =
              rangeOpt.style.fill.opacity == null
                ? 1
                : rangeOpt.style.fill.opacity;
            obj["radius"] = rangeOpt.style.radius;
          }
          return obj;
        });
      options["ranges"] = ranges;
    } else {
      // Si no hay estilo previo, inicializar los rangos desde los valores por defecto
      options["ranges"] = ClusterBinding.DEFAULT_OPTIONS_STYLE.ranges.map(
        (rangeOpt) => {
          let style = rangeOpt.style;
          let obj = {
            min: rangeOpt.min,
            max: rangeOpt.max,
            fill: style.get("fill.color"),
            stroke: style.get("stroke.color"),
            width: style.get("stroke.width"),
            opacity:
              style.get("fill.opacity") == null ? 1 : style.get("fill.opacity"),
            radius: style.get("radius"),
          };
          return obj;
        }
      );
    }

    //generator function
    const range = (n, m, lastRange) => {
      const ranges = [];
      let max = lastRange;
      for (let i = n; i < m; i++) {
        let min = max + 1;
        max = min + 200;
        const obj = {
          id: i,
          min: min,
          max: max,
          fill: chroma.random().hex(),
          stroke: chroma.random().hex(),
        };
        ranges.push(obj);
      }
      return ranges;
    };

    // generates
    let lastRange = options["ranges"].slice(-1)[0]["max"];
    options["pages"] = [];
    const ranges = range(
      options["ranges"].length + 1,
      ClusterBinding.NUMBER_RANGES,
      lastRange
    );
    ranges.forEach((element, index) => {
      options["pages"].push(element);
    });

    // Traducciones para stylecluster.html
    const translationKeys = {
      range: "range",
      ranges: "ranges",
      numberOfRanges: "number-of-ranges",
      from: "from",
      to: "to",
      fill: "fill",
      opacity: "opacity",
      stroke: "border",
      width: "width",
      radius: "radius",
      envelope: "wrap",
      amount: "quantity",
      selectable: "selectable",
      animated: "animated",
      distance: "distance",
      points: "points",
      fanDistance: "fan-distance",
      textColor: "text-color",
      options: "options",
    };
    options.translations = Binding.getTranslations(translationKeys);

    return options;
  }

  /**
   * Inicializa el progreso visual de todas las barras de rango
   */
  initializeRangeProgress() {
    this.querySelectorAllForEach('input[type="range"]', (element) => {
      this.updateRangeProgress(element);
    });
  }

  /**
   * Actualiza el progreso visual de una barra de rango
   * @param {HTMLInputElement} rangeElement - El elemento input de tipo range
   */
  updateRangeProgress(rangeElement) {
    if (!rangeElement || rangeElement.type !== "range") {
      return;
    }

    const value = rangeElement.value;
    const min = rangeElement.min || 0;
    const max = rangeElement.max || 100;

    const percentage = ((value - min) / (max - min)) * 100;

    rangeElement.style.setProperty("--progress", `${percentage}%`);
  }
}

/**
 * Maximum number of cluster ranges allowed.
 *
 * @const
 */
ClusterBinding.NUMBER_RANGES = 13;

/**
 *
 * @const
 */
ClusterBinding.DEFAULT_OPTIONS_STYLE = {
  hoverInteraction: true,
  displayAmount: true,
  selectInteraction: true,
  animated: true,
  distance: 30,
  label: {
    color: "#4dfeef",
  },
  maxFeaturesToSelect: 20,
  distanceSelectFeatures: 15,
  ranges: [
    {
      min: 2,
      max: 30,
      style: new M.style.Point({
        fill: {
          color: "#ff00ff",
          opacity: 1,
        },
        stroke: {
          color: "#00fef0",
          width: 2,
        },
        radius: 10,
      }),
    },
  ],
};
