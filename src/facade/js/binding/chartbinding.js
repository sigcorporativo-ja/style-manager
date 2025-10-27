import attributeschart from "templates/attributeschart";
import paginationchart from "templates/paginationchart";
import variablechart from "templates/variablechart";
import { Binding } from "./binding";

export class ChartBinding extends Binding {
  constructor(html, htmlParent, styleType, styleParams, layer) {
    super(html, htmlParent, styleType, styleParams, layer);
    this.variables_ = [];
    if (styleParams != null) {
      this.variables_ = styleParams
        .getOptions()
        .variables.map((variable) => variable.attribute);
    }
    this.compilePromise_.then(() => {
      this.addKeyEnterListener();
      this.addRenderCompatibleListener();
      this.addAttributeListener();
      this.refreshVariables();
      this.loadExistingChartStyle();
    });
  }

  setLayer(layer) {
    this.layer_ = layer;
    this.renderAttributes();
    this.loadExistingChartStyle();
    return this;
  }

  setGeometry(geometry) {
    if (["point", "line", "polygon"].includes(geometry)) {
      this.geometry_ = geometry;
    } else {
      this.geometry_ = "point";
    }
    return this;
  }

  /**
   * Carga el estilo de gráfico existente de la capa en el formulario
   * @function
   */
  loadExistingChartStyle() {
    if (!this.layer_ || !this.layer_.getStyle) {
      return;
    }

    const currentStyle = this.layer_.getStyle();
    if (!currentStyle) {
      return;
    }

    let isChartStyle = false;
    let chartOptions = null;

    if (currentStyle instanceof M.style.Chart) {
      isChartStyle = true;
      chartOptions = currentStyle.getOptions();
    } else if (currentStyle instanceof M.style.Composite) {
      const styles = currentStyle.getStyles();
      const chartStyle = styles.find((style) => style instanceof M.style.Chart);
      if (chartStyle) {
        isChartStyle = true;
        chartOptions = chartStyle.getOptions();
      } else {
        const genericStyle = styles.find((style) => {
          if (style.getOptions && typeof style.getOptions === "function") {
            return this.isStatisticalStyle(style.getOptions());
          }
          return false;
        });
        if (genericStyle) {
          isChartStyle = true;
          chartOptions = genericStyle.getOptions();
        }
      }
    } else if (
      currentStyle.getOptions &&
      typeof currentStyle.getOptions === "function"
    ) {
      const styleOpts = currentStyle.getOptions();
      if (this.isStatisticalStyle(styleOpts)) {
        isChartStyle = true;
        chartOptions = styleOpts;
      }
    } else if (
      currentStyle.options_ &&
      this.isStatisticalStyle(currentStyle.options_)
    ) {
      isChartStyle = true;
      chartOptions = currentStyle.options_;
    }

    if (isChartStyle && chartOptions) {
      this.updateFormWithChartOptions(chartOptions);
    }
  }

  /**
   * Verifica si las opciones de estilo corresponden a un gráfico estadístico
   * @function
   * @param {Object} styleOpts
   * @return {boolean}
   */
  isStatisticalStyle(styleOpts) {
    if (!styleOpts) return false;

    if (
      styleOpts.type &&
      ["pie", "pie3D", "donut", "bar"].includes(styleOpts.type)
    ) {
      return true;
    }

    if (styleOpts.variables && Array.isArray(styleOpts.variables)) {
      return true;
    }

    for (const geomType of ["point", "line", "polygon"]) {
      if (styleOpts[geomType]) {
        const geomStyle = styleOpts[geomType];
        if (
          (geomStyle.type &&
            ["pie", "pie3D", "donut", "bar"].includes(geomStyle.type)) ||
          (geomStyle.variables && Array.isArray(geomStyle.variables))
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Actualiza el formulario con las opciones de gráfico proporcionadas
   * @function
   * @param {Object} chartOptions
   */
  updateFormWithChartOptions(chartOptions) {
    if (!chartOptions) return;

    let chartConfig = null;

    if (chartOptions.type || chartOptions.variables) {
      chartConfig = chartOptions;
    } else {
      for (const geomType of ["point", "line", "polygon"]) {
        if (
          chartOptions[geomType] &&
          (chartOptions[geomType].type || chartOptions[geomType].variables)
        ) {
          chartConfig = chartOptions[geomType];
          break;
        }
      }
    }

    if (!chartConfig) return;

    if (chartConfig.type) {
      const typeSelect = this.querySelector('[data-style-options="type"]');
      if (typeSelect) {
        typeSelect.value = chartConfig.type;
        this.renderCompatibleOpts(chartConfig.type);
      }
    }

    if (chartConfig.scheme) {
      const schemeSelect = this.querySelector('[data-style-options="scheme"]');
      if (schemeSelect) {
        if (Array.isArray(chartConfig.scheme)) {
          const schemeName = this.getSchemeNameFromArray(chartConfig.scheme);
          if (schemeName) {
            schemeSelect.value = schemeName;
          }
        } else if (typeof chartConfig.scheme === "string") {
          schemeSelect.value = chartConfig.scheme;
        }
      }
    }

    // Actualizar radio
    if (typeof chartConfig.radius !== "undefined") {
      const radiusInput = this.querySelector('[data-style-options="radius"]');
      if (radiusInput) {
        radiusInput.value = chartConfig.radius;
      }
    }

    // Actualizar offset X e Y
    if (typeof chartConfig.offsetX !== "undefined") {
      const offsetXInput = this.querySelector('[data-style-options="offsetX"]');
      if (offsetXInput) {
        offsetXInput.value = chartConfig.offsetX;
      }
    }

    if (typeof chartConfig.offsetY !== "undefined") {
      const offsetYInput = this.querySelector('[data-style-options="offsetY"]');
      if (offsetYInput) {
        offsetYInput.value = chartConfig.offsetY;
      }
    }

    // Actualizar radio donut
    if (typeof chartConfig.donutRatio !== "undefined") {
      const donutRadioInput = this.querySelector(
        '[data-style-options="donutRadio"]'
      );
      if (donutRadioInput) {
        donutRadioInput.value = chartConfig.donutRatio;
      }
    }

    // Actualizar color 3D
    if (chartConfig.fill3DColor) {
      const fill3DColorInput = this.querySelector(
        '[data-style-options="fill3DColor"]'
      );
      if (fill3DColorInput) {
        fill3DColorInput.value = chartConfig.fill3DColor;
      }
    }

    // Actualizar variables
    if (chartConfig.variables && Array.isArray(chartConfig.variables)) {
      this.variables_ = chartConfig.variables
        .map((variable) => {
          // Extraer nombre del atributo de diferentes formatos posibles
          if (typeof variable === "string") {
            return variable;
          } else if (variable && typeof variable === "object") {
            return (
              variable.attribute ||
              variable.attributeName_ ||
              variable.attributeName ||
              variable.name ||
              variable.field
            );
          }
          return null;
        })
        .filter((attr) => typeof attr === "string" && attr.length > 0);

      this.refreshVariables();
    }
  }

  /**
   * Obtiene el nombre del esquema a partir del array de colores
   * @function
   * @param {Array} schemeArray
   * @return {string|null}
   */
  getSchemeNameFromArray(schemeArray) {
    if (!Array.isArray(schemeArray)) return null;

    if (
      typeof M !== "undefined" &&
      M.style &&
      M.style.chart &&
      M.style.chart.schemes
    ) {
      const schemes = M.style.chart.schemes;
      for (const [name, colors] of Object.entries(schemes)) {
        if (this.arraysEqual(schemeArray, colors)) {
          return name;
        }
      }
    }

    return null;
  }

  /**
   * Compara dos arrays para determinar si son iguales
   * @function
   * @param {Array} arr1
   * @param {Array} arr2
   * @return {boolean}
   */
  arraysEqual(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
    if (arr1.length !== arr2.length) return false;
    return arr1.every((element, index) => element === arr2[index]);
  }

  /**
   * @function
   * @param {string}
   */
  addAttribute(attr) {
    this.variables_.push(attr);
  }

  /**
   * @function
   * @param {string}
   */
  removeAttribute(attr) {
    this.variables_ = this.variables_.filter((attr2) => attr2 != attr);
  }

  addAttributeFromParamenter(attribute) {
    this.addAttribute(attribute);
    this.addVariableTemplate(attribute);
    this.refreshPagination();
  }

  /**
   * @function
   */
  addAttributeFromInput() {
    let inputAttribute = this.querySelector("[data-attribute]");
    let attribute = inputAttribute.value;
    if (attribute !== "") {
      if (this.variables_.includes(attribute)) {
        M.dialog.info(
          "El atributo ya ha sido agregado.",
          "Nombre de variable repetida"
        );
      } else {
        let allowedAttrs = this.layer_.getFeatures()[0].getAttributes();
        if (allowedAttrs.hasOwnProperty(attribute)) {
          this.addAttributeFromParamenter(attribute);
        } else {
          M.dialog.info(
            "No existe ninguna variable con ese nombre.",
            "Nombre de variable incorrecto."
          );
        }
      }
    } else {
      M.dialog.info(
        "No está permitido introducir una cadena vacía.",
        "Nombre de variable vacía."
      );
    }
  }

  /**
   * @function
   */
  removeAttributeFromInput() {
    let inputAttribute = this.querySelector("[data-attribute]");
    let attribute = inputAttribute.value;
    this.removeAttribute(attribute);
  }

  /**
   * @function
   */
  addAttributeListener() {
    let button = this.querySelector("[data-add]");
    button.addEventListener("click", () => {
      this.addAttributeFromInput();
    });
  }

  /**
   * @function
   */
  addKeyEnterListener() {
    let inputElement = this.querySelector("[data-attribute]");
    inputElement.addEventListener("keydown", this.keyEnterListener());
  }

  /**
   * @function
   */
  keyEnterListener() {
    return (evt) => {
      if (evt.key === "Enter") {
        this.addAttributeFromInput();
      }
    };
  }

  /**
   * @function
   */
  addVariableTemplate(attribute) {
    let parent = this.querySelector("[data-variables]");
    let variables = [];
    let variable;
    let legend = ChartBinding.DEFAULT_OPTIONS_VARIABLE.legend;
    let label = ChartBinding.DEFAULT_OPTIONS_VARIABLE.label;
    if (this.style_ != null) {
      variables = this.style_.getOptions().variables;
    }
    if (variables.length !== 0) {
      variable = variables.find((variable) => variable.attribute === attribute);
      if (variable != null) {
        legend = variable.legend;
        label = variable.label;
      }
    }
    // Obtener traducciones del contexto de opciones
    let translations =
      (this.getOptionsTemplate && this.getOptionsTemplate().translations) || {};
    this.compileTemplate(variablechart, {
      attribute: attribute,
      legend: legend,
      label: label,
      translations: translations,
    }).then((html) => {
      parent.append(...html.children);
      let removeElement = this.querySelector(`[data-remove="${attribute}"]`);
      if (removeElement != null) {
        this.addRemoveVarSectionListener(removeElement);
        this.addLabelOptionListener(attribute);
      }
    });
  }

  /**
   * @function
   */
  removeVariableTemplate(selector) {
    let parent = this.querySelector(".m-stylemanager-chart-variables");
    this.querySelectorAllForEach(
      `.m-stylemanager-chart-variables [data-delete="${selector}"]`,
      (element) => {
        parent.removeChild(element);
      }
    );
  }

  /**
   * @function
   */
  removeVariableSection(attr) {
    this.removeAttribute(attr);
    this.removeVariableTemplate(attr);
    this.refreshPagination();
  }

  /**
   * @function
   */
  refreshVariables() {
    let variables = [...this.variables_];
    variables.forEach((variable) => {
      this.removeVariableSection(variable);
      this.addAttributeFromParamenter(variable);
    });
  }

  /**
   * @function
   */
  addRemoveVarSectionListener(element) {
    element.addEventListener(
      "click",
      this.removeVarSectionListener(element).bind(this)
    );
  }

  /**
   * @function
   */
  removeVarSectionListener(element) {
    let attribute = element.dataset["remove"];
    return () => {
      this.removeVariableSection(attribute);
    };
  }

  /**
   * @function
   */
  refreshPagination() {
    let options = this.variables_.map((attribute, index) => {
      let option = {
        attribute: attribute,
        number: index + 1,
      };
      return option;
    });

    let parent = this.querySelector("[data-pagination]");
    this.compileTemplate(paginationchart, {
      ranges: options,
    }).then((html) => {
      parent.innerHTML = html.innerHTML;
      this.addClickPagerListener();
      let firstAttr = this.variables_.slice(-1)[0];
      if (firstAttr != null) {
        this.showVariableSection(firstAttr)();
      }
    });
  }

  /**
   * @function
   */
  addClickPagerListener() {
    this.querySelectorAllForEach("[data-page-selector]", (element) => {
      let selector = element.dataset["pageSelector"];
      element.addEventListener(
        "click",
        this.showVariableSection(selector).bind(this)
      );
    });
  }

  /**
   * @function
   */
  clickPagerListener(selector) {
    this.querySelectorAllForEach("[data-target]", (element) => {
      element.classList.add("m-stylemanager-hidden");
    });

    this.querySelectorAllForEach(`[data-target="${selector}"]`, (element) => {
      element.classList.remove("m-stylemanager-hidden");
    });
  }

  /**
   * @function
   */
  activePageListener(selector) {
    this.querySelectorAllForEach("[data-page-selector]", (element2) => {
      element2.classList.remove("m-stylemanager-page-active");
    });
    let element = this.querySelector(`[data-page-selector="${selector}"]`);
    if (element != null) {
      element.classList.add("m-stylemanager-page-active");
    }
  }

  /**
   * @function
   */
  showVariableSection(selector) {
    return () => {
      this.clickPagerListener(selector);
      this.activePageListener(selector);
    };
  }

  /**
   * @function
   */
  renderCompatibleOpts(type) {
    this.querySelectorAllForEach("[data-type]", (element) => {
      let types = element.dataset["type"].split(",");
      if (!types.includes(type)) {
        element.classList.add("m-stylemanager-hidden");
      } else {
        element.classList.remove("m-stylemanager-hidden");
      }
    });
  }

  /**
   * @function
   */
  renderCompatibleListener() {
    let selectElement = this.querySelector("[data-style-options='type']");
    let selectType = selectElement.selectedOptions[0].value;
    this.renderCompatibleOpts(selectType);
  }

  /**
   * @function
   */
  addRenderCompatibleListener() {
    let selectElement = this.querySelector("[data-style-options='type']");
    selectElement.addEventListener(
      "change",
      this.renderCompatibleListener.bind(this)
    );
  }

  /**
   * @function
   */
  renderAttributes() {
    let attributes = this.layer_.getFeatures()[0].getAttributes();
    let keys = Object.keys(attributes);
    keys = keys.filter((key) => {
      return !isNaN(parseFloat(attributes[key]));
    });

    this.compileTemplate(attributeschart, {
      attributes: keys,
    }).then((html) => {
      this.querySelector("[data-attribute]").innerHTML = html.innerHTML;
    });
  }

  /**
   * @function
   */
  toggleLabelOptions(name) {
    let element = this.querySelector(`[data-label-target="${name}"]`);
    let classList = element.classList;
    if (classList.contains("m-stylemanager-hidden")) {
      classList.remove("m-stylemanager-hidden");
    } else {
      classList.add("m-stylemanager-hidden");
    }
  }

  /**
   * @function
   */
  addLabelOptionListener(name) {
    let checkbox = this.querySelector(
      `[data-variable-option="${name}.labelshow"]`
    );
    checkbox.addEventListener("change", () => {
      this.toggleLabelOptions(name);
    });
  }

  /**
   * @function
   */
  generateVariableOptions() {
    let obj = {};

    this.querySelectorAllForEach("input[data-variable-option]", (element) => {
      let path = element.dataset["variableOption"];
      let value = element.value;
      if (element.type === "number") {
        value = parseFloat(value);
      }

      if (element.type === "checkbox") {
        value = element.checked;
      }
      Binding.createObj(obj, path, value);
    });

    let optVars = this.variables_.map((attribute) => {
      obj[attribute]["attribute"] = attribute;

      return obj[attribute];
    });

    optVars = optVars.map((option) => {
      // options text label, show the % of data
      if (option.labelshow === true) {
        option["label"]["text"] = (value, values) => {
          return (
            Math.round(
              (value / values.reduce((tot, curr) => tot + curr)) * 100
            ) + "%"
          );
        };
      }
      // delete every option label
      else {
        option["label"] = undefined;
      }
      return option;
    });

    return optVars;
  }

  /**
   * @function
   */
  generateStyle() {
    let options = this.generateOptions().options;
    let varsOpts = this.generateVariableOptions();
    let scheme = M.style.chart.schemes[options.scheme];

    let style = new M.style.Chart({
      type: options.type,
      scheme: scheme,
      radius: options.radius,
      donutRadio: options.donutRadius,
      offsetX: options.offsetX,
      offsetY: options.offsetY,
      variables:
        varsOpts.length === 0
          ? [
              new M.style.chart.Variable({
                attribute: "default",
              }),
            ]
          : varsOpts,
      fill3DColor: options.fill3DColor,
    });

    return style;
  }

  /**
   * @function
   *
   */
  getOptionsTemplate() {
    let options = ChartBinding.DEFAULT_OPTIONS_STYLE;
    if (this.style_ != null) {
      options = this.style_.getOptions();
      options["scheme"] = this.getSchemeName();
      // parse variable options
    }
    // Traducciones para los templates de estadísticos
    const translationKeys = {
      options: "options",
      type: "type",
      pie: "pie",
      "3dPie": "3d-pie",
      donut: "donut",
      chart: "chart",
      color: "color",
      classic: "classic",
      dark: "dark",
      pale: "pale",
      pastel: "pastel",
      neon: "neon",
      xAxis: "x-axis",
      yAxis: "y-axis",
      radius: "radius",
      donutRadius: "donut-radius",
      "3dColor": "3d-color",
      attributes: "attributes",
      attribute: "attribute",
      addAttribute: "add-attribute",
      variable: "variable",
      legend: "legend",
      showLabel: "show-label",
      fill: "fill",
      size: "size",
      border: "border",
      thickness: "thickness",
      space: "space",
    };
    options.translations = Binding.getTranslations(translationKeys);
    return options;
  }

  /**
   * @function
   */
  getSchemeName() {
    let name;
    const arrayEquals = (array, array2) => {
      let include = false;
      let include2 = false;
      if (array instanceof Array && array2 instanceof Array) {
        include = array.every((element, index) => element === array2[index]);
        include2 = array2.every((element, index) => element === array[index]);
      }
      return include && include2;
    };

    if (this.style_ != null) {
      let scheme = this.style_.getOptions()["scheme"];
      let schemesChart = M.style.chart.schemes;
      name = Object.keys(schemesChart).find((name) =>
        arrayEquals(scheme, schemesChart[name])
      );
    }
    return name;
  }
}

/**
 * @const
 */
ChartBinding.DEFAULT_OPTIONS_STYLE = {
  donutRatio: 4,
  fill3DColor: "#ff00f0",
  offsetX: 0,
  offsetY: 0,
  radius: 12,
  rotateWithView: false,
  scheme: [
    "#ffa500",
    "blue",
    "red",
    "green",
    "cyan",
    "magenta",
    "yellow",
    "#0f0",
  ],
  type: "pie",
};

/**
 * @const
 */
ChartBinding.DEFAULT_OPTIONS_VARIABLE = {
  legend: "Ejemplo de leyenda",
  label: {
    fill: "#ff0000",
    scale: 1,
    text: (value, values) => {
      return (
        Math.round((value / values.reduce((tot, curr) => tot + curr)) * 100) +
        "%"
      );
    },
    radiusIncrement: 2,
    stroke: {
      color: "#000000",
      width: 1,
    },
  },
};
