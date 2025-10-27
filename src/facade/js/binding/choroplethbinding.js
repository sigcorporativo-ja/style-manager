import { Binding } from "./binding";

export class ChoroplethBinding extends Binding {
  constructor(html, htmlParent, styleType, styleParams, layer) {
    super(html, htmlParent, styleType, styleParams, layer);
  }

  setLayer(layer) {
    this.layer_ = layer;
    // this.setIntegerAttributes();
    return this;
  }

  setRanges() {
    let rangesButton = this.querySelector("[data-number-ranges]");
    let number = parseInt(rangesButton.value);
    let ranges = [];

    for (var i = 1; i <= number; i++) {
      ranges.push({
        number: i,
      });
    }
    let parent = this.querySelector("[data-parent]");
    this.addTemplate("choroplethstyles.html", parent, {
      ranges: ranges,
    });
  }

  addEventRangeListener() {
    let rangesButton = this.querySelector("[data-number-ranges]");
    rangesButton.addEventListener("input", this.setRanges.bind(this));
  }

  generateStyle() {
    let opts = this.generateOptions();
    let ranges = opts.ranges;
    let colors = opts.options.colors;
    let quantification =
      opts.quantification === "JENKS"
        ? M.style.quantification.JENKS
        : M.style.quantification.QUANTILE;
    let style = null;
    if (opts.attributeName != "") {
      style = new M.style.Choropleth(
        opts.attributeName,
        colors,
        quantification(ranges)
      );
    }
    return style;
  }

  /**
   * @function
   *
   */
  getOptionsTemplate() {
    let options = ChoroplethBinding.DEFAULT_OPTIONS_STYLE;
    if (this.style_ != null) {
      try {
        const choroplethStyles = this.style_.getChoroplethStyles();

        if (choroplethStyles && choroplethStyles.length > 0) {
          let startColor = choroplethStyles[0].options_.point.fill.color;
          let endColor = choroplethStyles[2].options_.point.fill.color;
          startColor = startColor || choroplethStyles[0].get("stroke.color");
          endColor =
            endColor || choroplethStyles.slice(-1)[0].get("stroke.color");

          const quantification = this.style_.getQuantification();
          const attributeName = this.style_.getAttributeName();

          options = {
            attribute: attributeName || "",
            ranges: choroplethStyles.length,
            quantification: quantification ? quantification.name : "JENKS",
            startColor:
              startColor || ChoroplethBinding.DEFAULT_OPTIONS_STYLE.startColor,
            endColor:
              endColor || ChoroplethBinding.DEFAULT_OPTIONS_STYLE.endColor,
          };
        }
      } catch (error) {
        options = Object.assign({}, ChoroplethBinding.DEFAULT_OPTIONS_STYLE);
      }
    }
    if (this.layer_ != null) {
      options["attributes"] = this.getAttributes();
      options["attributes"].forEach(
        (attribute) =>
          (attribute["selected"] = attribute.name === options.attribute)
      );
    }

    // IMPORTANTE: Exponer startColor/endColor como options.colors para generateStyle()
    if (!options.options) {
      options.options = {};
    }
    if (options.startColor && options.endColor) {
      options.options.colors = [options.startColor, options.endColor];
    }

    // Traducciones para stylechoropleth.html
    const translationKeys = {
      options: "options",
      attribute: "attribute",
      algorithm: "algorithm",
      jenks: "jenks",
      quantile: "quantile",
      ranges: "ranges",
      colorRamp: "color-ramp",
      initial: "initial",
      final: "final",
    };
    options.translations = Binding.getTranslations(translationKeys);

    // Forzar actualización de los inputs de color después del renderizado
    setTimeout(() => {
      this.updateColorInputs(options.startColor, options.endColor);
    }, 100);

    return options;
  }

  /**
   * Actualiza forzadamente los valores de los inputs de color
   */
  updateColorInputs(startColor, endColor) {
    if (startColor) {
      // Buscar todos los inputs de color y tomar el primero
      const colorInputs = this.querySelectorAll(
        'input[type="color"][data-array-options="colors"]'
      );
      if (colorInputs && colorInputs.length > 0) {
        colorInputs[0].value = startColor;
      }
    }
    if (endColor) {
      // Buscar todos los inputs de color y tomar el segundo (último)
      const colorInputs = this.querySelectorAll(
        'input[type="color"][data-array-options="colors"]'
      );
      if (colorInputs && colorInputs.length > 1) {
        colorInputs[1].value = endColor;
      }
    }
  }

  /**
   * @function
   */
  getAttributes() {
    let attributeNames = this.filterAttributesFeature("number").map(
      (element) => {
        return {
          name: element,
        };
      }
    );
    return attributeNames;
  }
}

ChoroplethBinding.DEFAULT_OPTIONS_STYLE = {
  attribute: "",
  quantification: "JENKS",
  ranges: 4,
  startColor: "#F8FF25",
  endColor: "#4400FD",
};
