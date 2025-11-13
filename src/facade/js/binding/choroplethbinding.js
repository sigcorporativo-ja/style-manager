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

    // Generar el gradiente de colores según el número de rangos
    const gradientColors = this.generateColorGradient(
      colors[0] || ChoroplethBinding.DEFAULT_OPTIONS_STYLE.startColor,
      colors[1] || ChoroplethBinding.DEFAULT_OPTIONS_STYLE.endColor,
      ranges
    );

    const objectChoropleths = [];
    gradientColors.forEach((color, index) => {
      objectChoropleths.push(
        new M.style.Generic({
          point: {
            fill: {
              color: color,
              opacity: 1,
            },
            stroke: {
              color: "black",
              width: 1,
            },
            radius: 5,
          },
          line: {
            stroke: {
              color: color,
              width: 1,
            },
          },
          polygon: {
            fill: {
              color: color,
              opacity: 1,
            },
            stroke: {
              color: "black",
              width: 1,
            },
          },
        })
      );
    });
    let quantification =
      opts.quantification === "JENKS"
        ? M.style.quantification.JENKS
        : M.style.quantification.QUANTILE;
    let style = null;

    if (opts.attributeName != "") {
      style = new M.style.Choropleth(
        opts.attributeName,
        objectChoropleths,
        quantification(ranges)
      );
    }
    return style;
  }

  /**
   * Genera un gradiente de colores entre dos colores
   * @param {string} startColor - Color inicial en formato hexadecimal
   * @param {string} endColor - Color final en formato hexadecimal
   * @param {number} steps - Número de colores a generar
   * @returns {Array<string>} Array de colores en formato hexadecimal
   */
  generateColorGradient(startColor, endColor, steps) {
    // Convertir colores hex a RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    // Convertir RGB a hex
    const rgbToHex = (r, g, b) => {
      return (
        "#" +
        [r, g, b]
          .map((x) => {
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
          })
          .join("")
      );
    };

    const start = hexToRgb(startColor);
    const end = hexToRgb(endColor);

    if (!start || !end || steps < 1) {
      return [startColor];
    }

    if (steps === 1) {
      return [startColor];
    }

    const colors = [];
    const stepFactor = 1 / (steps - 1);

    for (let i = 0; i < steps; i++) {
      const ratio = i * stepFactor;
      const r = start.r + ratio * (end.r - start.r);
      const g = start.g + ratio * (end.g - start.g);
      const b = start.b + ratio * (end.b - start.b);
      colors.push(rgbToHex(r, g, b));
    }

    return colors;
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
