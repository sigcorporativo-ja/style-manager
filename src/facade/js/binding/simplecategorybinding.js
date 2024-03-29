import * as chroma from 'chroma-js';
import {
  Binding
}
from './binding';

export class SimpleCategoryBinding extends Binding {
  constructor(html, htmlParent, styleType, styleParams, layer, binding) {
    super(html, htmlParent, styleType, styleParams, layer);
    this.fill_ = false;
    this.stroke_ = false;
    this.label_ = false;
    this.form_ = false;
    this.icon_ = false;
    if (styleParams != null) {
      this.fill_ = styleParams.getOptions().fill != undefined;
      this.stroke_ = styleParams.getOptions().stroke != undefined;
      this.label_ = styleParams.getOptions().label != undefined;
      this.icon_ = styleParams.get("icon.src") != undefined;
      this.form_ = styleParams.get("icon.form") != undefined;
    }

    this.binding_ = binding;
  }

  /**
   * This function sets the layer of a binding class.
   * @function
   * @param {M.layer.Vector}
   * @returns {Binding}
   */
  setLayer(layer, refresh = true) {
    this.layer_ = layer;
    if (refresh === true) {
      this.refreshTemplate();
    }
    return this;
  }

  getOptions() {
    return {
      fill: this.fill_,
      stroke: this.stroke_,
      label: this.label_,
      form: this.form_,
      icon: this.icon_
    };
  }

  /**
   * This function sets the geometry of binding class.
   * @function
   * @param {string}
   * @return {SimpleCategoryBinding}
   */
  setGeometry(geometry) {
    if (SimpleCategoryBinding.GEOMETRIES.includes(geometry)) {
      this.geometry_ = geometry;
    } else {
      this.geometry_ = 'point';
    }
    return this;
  }

  /**
   * This function sets the geometry of binding class.
   * @function
   * @return {string}
   */
  getGeometry() {
    return this.geometry_;
  }

  /**
   * This function refresh the html template.
   * @function
   */
  refreshTemplate() {
    let geometry = this.getGeometry();
    let hiddenGeometries = SimpleCategoryBinding.GEOMETRIES.filter(section => section !== geometry);

    hiddenGeometries.forEach(geometry => {
      this.querySelectorAllForEach(`[data-geometry="${geometry}"]`, node => node.classList.add('m-hidden'));
    });
    this.querySelectorAllForEach(`[data-geometry="${geometry}"]`, node => node.classList.remove('m-hidden'));
    this.addLabelPathListener();
  }

  /**
   * This functions initialize the submenu view of each option of Style simple
   * @function
   */
  activateOptionsStyle() {
    let style = this.style_;
    if (style != null) {
      let options = style.getOptions();
      if (options["fill"] != null) {
        let valuesFill = Object.values(options.fill).filter(value => value != undefined);
        if (valuesFill.length > 0) {
          this.checkOptionSection("fill");
        }
      }

      if (options["stroke"] != undefined) {
        this.checkOptionSection("stroke");
      }

      if (options["label"] != undefined) {
        this.checkOptionSection("label");
      }

      if (options["icon"] != undefined) {
        if (options["icon"].hasOwnProperty("src")) {
          this.checkOptionSection("icon");
          this.disableOption("form");
        }

        if (options["icon"].hasOwnProperty("form")) {
          this.checkOptionSection("form");
          this.disableOption("icon");
        }
      }

    }
  }

  showCompatibleSections() {
    this.binding_.enableOption("form");
    this.binding_.enableOption("icon");
    if (this.icon_ === true) {
      this.binding_.disableOption("form");
    }

    if (this.form_ === true) {
      this.binding_.disableOption("icon");
    }
  }

  /**
   * This function sets the layer of a binding class.
   * @function
   */
  addLabelPathListener() {
    let pathCheck = this.querySelector("[data-style-options='label.path']");
    pathCheck.addEventListener("change", () => {
      this.togglePathSection(!pathCheck.checked);
    });
  }

  /**
   * @function
   */
  togglePathSection(flag) {
    this.querySelectorAllForEach("[data-textpath]", element => {
      element.disabled = flag === true ? flag : false;
    });
  }

  /**
   * This function sets the layer of a binding class.
   * @function
   * @param {M.layer.Vector}
   * @returns {Binding}
   */
  toggleCheckOptionSection(option) {
    let clickable = this.getParentTemplate().querySelector(`[data-buttons-option] input[data-apply="${option}"]`);
    clickable.addEventListener("change", (event) => {
      this.toggleCheckOptSectionListener(option, event);
    });
  }

  /**
   * @function
   */
  toggleCheckOptSectionListener(option, event) {
    if (event.target.checked === true) {
      this.activateOption(option);
    }
  }

  /**
   * @function
   */
  checkOptionSection(option) {
    let inputSection = this.getParentTemplate().querySelector(`[data-buttons-option] input[data-apply="${option}"]`);
    this.activateOption(option);
    inputSection.checked = true;
  }

  /**
   * This function sets the layer of a binding class.
   * @function
   * @param {M.layer.Vector}
   * @returns {Binding}
   */
  activateOptionSection(option) {
    let clickable = this.getParentTemplate().querySelector(`[data-buttons-option] [data-label="${option}"]`);
    clickable.addEventListener("click", () => {
      this.activateOption(option);
    });
  }

  /**
   * This function sets the layer of a binding class.
   * @function
   * @param {M.layer.Vector}
   * @returns {Binding}
   */
  activateOption(option) {
    let label = this.querySelectorParent(`[data-buttons-option] input[data-apply="${option}"]+label`);
    let checkbox = this.querySelectorParent(`[data-buttons-option] input[data-apply="${option}"]`);
    if (checkbox != null && checkbox.disabled === false) {
      this.activateLabel(label);
      this.displaySectionOption(option);
    }
  }

  /**
   * This function sets the layer of a binding class.
   * @function
   * @param {M.layer.Vector}
   * @returns {Binding}
   */
  activateLabel(label) {
    this.querySelectorAllForEachParent(`[data-selector]`, (element) => {
      element.classList.remove("check-active");
      element.classList.add('check-selected');
    });
    label.classList.add("check-active");
    label.classList.remove('check-selected');
  }

  /**
   * This function sets the layer of a binding class.
   * @function
   * @param {M.layer.Vector}
   * @returns {Binding}
   */
  displaySectionOption(option) {
    this.hideAllOptionsSections();
    this.showOptionSection(option);
  }

  /**
   * This function generates the style simple options.
   * @return {object}
   */
  generateOptions() {
    let styleOpts = {};
    styleOpts["options"] = {};

    this.querySelectorAllForEach('[data-style-options]', element => {
      let path = element.dataset["styleOptions"];
      let value = element.value;
      if (element.type === "checkbox") {
        value = element.checked;
      }

      if (element.type === "number") {
        value = parseFloat(value);
        if (isNaN(value)) {
          value = 0;
        }
      }

      let target = element.dataset["target"];
      if (target !== undefined) {
        let value2 = parseFloat(this.querySelector(`[data-id="${target}"]`).value);
        if (isNaN(value2)) {
          value2 = 0;
        }
        value = [value, value2];
      }
      Binding.createObj(styleOpts["options"], path, value);
    });

    this.querySelectorAllForEach("[data-apply]", element => {
      let opt = element.dataset["apply"];
      if (element.checked === false) {
        Binding.createObj(styleOpts["options"], opt, undefined);
      }
    });


    let fontSize = this.querySelector("[data-font-size]").value || 12;
    let fontFamily = this.querySelector("[data-font-family]").value;

    let font = `${fontSize}px ${fontFamily}`;

    let iconOpts = this.icon === true ? styleOpts["options"].src : styleOpts["options"].form;

    let labelOpt;
    if (styleOpts["options"]["label"] != null && styleOpts["options"]["label"]["text"] != null) {
      labelOpt = styleOpts["options"]["label"];
    }

    styleOpts["options"] = {
      fill: styleOpts["options"].fill,
      stroke: styleOpts["options"].stroke,
      label: labelOpt,
      icon: iconOpts,
      radius: styleOpts["options"].radius
    };

    if (this.getGeometry() === "line") {
      styleOpts["options"] = {
        fill: styleOpts["options"].fill,
        stroke: styleOpts["options"].stroke,
        label: styleOpts["options"].label
      };

      delete styleOpts["options"]["fill"]["pattern"];
      if (Object.keys(styleOpts["options"]["fill"]).length === 0) {
        delete styleOpts["options"]["fill"];
      }
    }

    if (this.getGeometry() === "polygon") {
      styleOpts["options"] = {
        fill: styleOpts["options"].fill,
        stroke: styleOpts["options"].stroke,
        label: styleOpts["options"].label
      };
    }

    if (styleOpts["options"]["label"] != undefined) {
      styleOpts["options"]["label"]["font"] = font;
    }

    return this.processOptions(styleOpts);
  }

  /**
   * This function process de style generate options
   * @function
   */
  processOptions(styleOpts) {
    let styleOptsClone = M.utils.extends({}, styleOpts);
    let checkedFill = this.isChecked("fill");
    let checkedStroke = this.isChecked("stroke");
    let checkedLabel = this.isChecked("label");
    let checkedIcon = this.isChecked("icon");
    let checkedForm = this.isChecked("form");
    styleOptsClone["options"]["fill"] = checkedFill === true ? styleOptsClone["options"]["fill"] : undefined;
    styleOptsClone["options"]["stroke"] = checkedStroke === true ? styleOptsClone["options"]["stroke"] : undefined;
    styleOptsClone["options"]["label"] = checkedLabel === true ? styleOptsClone["options"]["label"] : undefined;
    styleOptsClone["options"]["icon"] = checkedIcon === true || checkedForm === true ? styleOptsClone["options"]["icon"] : undefined;
    return styleOptsClone;
  }

  /**
   * @function
   */
  isChecked(option) {
    let checked = false;
    let input = this.getParentTemplate().parentElement.querySelector(`[data-buttons-option-category] input[data-apply='${option}'`);
    if (input != null) {
      checked = input.checked;
    }
    return checked;
  }

  /**
   * This function generates the style simple.
   * @return {M.style.Simple}
   */
  generateStyle() {
    let undefineStyle = true;
    this.querySelectorAllForEach("[data-apply]", element => {
      if (element.checked === true) {
        undefineStyle = false;
      }
    });
    let styleOptions = this.generateOptions().options;
    return new M.style.Generic({ point: styleOptions, polygon: styleOptions, line: styleOptions });
  }

  /**
   * This function adds the listener click event that shows the compatible sections buttons.
   * @param {string}
   * @param {string}
   */
  compatibleSectionListener(optionEnable, optionDisable) {
    let clickable = this.querySelectorParent(`[data-buttons-option] input[data-apply="${optionEnable}"]+label`);
    let input = this.querySelectorParent(`[data-buttons-option] input[data-apply="${optionEnable}"]`);
    if (clickable != null) {
      clickable.addEventListener("click", () => {
        if (input.checked === false) {
          this.disableOption(optionDisable);
        } else {
          this.enableOption(optionDisable);
        }
      });
    }
  }

  /**
   * This function disable a button options passed by paramenter.
   * @function
   * @param {string}
   */
  disableOption(option) {
    let input = this.getParentTemplate().querySelector(`[data-buttons-option] input[data-apply="${option}"]`);
    let clickable = this.getParentTemplate().querySelector(`[data-buttons-option] input[data-apply="${option}"]+label`);
    this.hideOptionSection(option);
    clickable.classList.add("check-inactive");
    clickable.classList.add("check-selected");
    clickable.classList.remove("m-option-active");
    input.disabled = true;
    input.checked = false;
  }

  /**
   * This function enable a button options passed by paramenter.
   * @function
   * @param {string}
   */
  enableOption(option) {
    let input = this.getParentTemplate().querySelector(`[data-buttons-option] input[data-apply="${option}"]`);
    let clickable = this.getParentTemplate().querySelector(`[data-buttons-option] input[data-apply="${option}"]+label`);
    clickable.classList.remove("check-inactive");
    input.disabled = false;
  }


  /**
   * @function
   *
   */
  getOptionsTemplate() {
    let options = SimpleCategoryBinding.DEFAULT_OPTIONS_STYLE;
    if (this.style_ != null) {
      if (this.style_.get("fill.pattern") != null) {
        options["patternflag"] = true;
      }
      options = M.utils.extends({}, this.style_.getOptions());
      options = M.utils.extends(options, SimpleCategoryBinding.DEFAULT_OPTIONS_STYLE);
    }

    // transform color options to hex color for value inputs color
    options["fill"]["color"] = chroma(options["fill"]["color"]).hex();
    options["stroke"]["color"] = chroma(options["stroke"]["color"]).hex();
    options["label"]["fill"]["color"] = chroma(options["label"]["fill"]["color"]).hex();
    options["label"]["stroke"]["color"] = options["label"]["stroke"]["color"] === "no-color" ? "no-color" : chroma(options["label"]["stroke"]["color"]).hex();
    options["fill"]["pattern"]["color"] = chroma(options["fill"]["pattern"]["color"]).hex();
    options["icon"]["fill"] = chroma(options["icon"]["fill"]).hex();
    options["icon"]["gradientcolor"] = chroma(options["icon"]["gradientcolor"]).hex();
    // --

    let patternValids = Object.keys(M.style.pattern).filter(name => name != "ICON" && name != "IMAGE");
    let alignValues = Object.values(M.style.align);
    let baselineValues = Object.values(M.style.baseline);
    let formValues = Object.values(M.style.form).filter(name => name != null);

    //transform array options to data template option
    options["patternlist"] = SimpleCategoryBinding.arrayDataToTemplate(options["fill"]["pattern"]["name"], patternValids, patternValids);
    options["linecapstroke"] = SimpleCategoryBinding.arrayDataToTemplate(options["stroke"]["linecap"], ["butt", "square", "round"], ["Extremo", "Cuadrado", "Redondeado"]);
    options["linejoinstroke"] = SimpleCategoryBinding.arrayDataToTemplate(options["stroke"]["linejoin"], ["bevel", "miter", "round"], ["Bisel", "Inglete", "Redondeado"]);
    options["linecaplabelstroke"] = SimpleCategoryBinding.arrayDataToTemplate(options["label"]["stroke"]["linecap"], ["butt", "square", "round"], ["Extremo", "Cuadrado", "Redondeado"]);
    options["linejoinlabelstroke"] = SimpleCategoryBinding.arrayDataToTemplate(options["label"]["stroke"]["linejoin"], ["bevel", "miter", "round"], ["Bisel", "Inglete", "Redondeado"]);
    options["alignlist"] = SimpleCategoryBinding.arrayDataToTemplate(options["label"]["align"], alignValues, alignValues);
    options["baselinelist"] = SimpleCategoryBinding.arrayDataToTemplate(options["label"]["baseline"], baselineValues, baselineValues);
    options["formlist"] = SimpleCategoryBinding.arrayDataToTemplate(options["icon"]["form"], formValues, formValues);
    if (this.layer_ != null) {
      let labelTextValues = Object.keys(this.getFeaturesAttributes());
      let labelTextSelected = options["label"] != null ? options["label"]["text"] : "";
      options["featuresAttr"] = SimpleCategoryBinding.arrayDataToTemplate(labelTextSelected, labelTextValues.map(name => `{{${name}}}`), labelTextValues);
    }
    return options;
  }

  set imgId(id) {
    this.imgId_ = id;
  }

  get imgId() {
    return this.imgId_;
  }

  set fill(bool) {
    this.fill_ = bool;
  }

  set stroke(bool) {
    this.stroke_ = bool;
  }

  set label(bool) {
    this.label_ = bool;
  }

  set form(bool) {
    this.form_ = bool;
  }

  set icon(bool) {
    this.icon_ = bool;
  }

  get fill() {
    return this.fill_;
  }

  get stroke() {
    return this.stroke_;
  }

  get label() {
    return this.label_;
  }

  get form() {
    return this.form_;
  }

  get icon() {
    return this.icon_;
  }

  toggleDisplaySubmenu(flag) {
    let buttonOptions = this.getParentTemplate().querySelector("[data-buttons-option]");
    let funct = flag === true ? "add" : "remove";
    buttonOptions.classList[funct]("m-hidden");
  }

  addLegendListener() {
    this.querySelectorAllForEach("input,select,div.m-boxes", element => {
      if (element instanceof HTMLDivElement) {
        element.addEventListener("click", () => {
          this.refreshLegend(element);
        });
      } else {
        if (element instanceof HTMLSelectElement) {
          element.addEventListener("change", () => {
            this.refreshLegend(element);
          });
        } else {
          element.addEventListener("input", () => {
            this.refreshLegend(element);
          });
        }
      }
    });
  }

  /**
   * @function
   * @param {function}
   */
  refreshLegend(element, flag) {
    let id = this.imgId_;
    let style = this.generateStyle();
    if (flag === true) {
      style = this.style_;
    }
    if (style != null) {
      this.style_ = style;
      style = style.clone();
      style.set('point.radius', SimpleCategoryBinding.RADIUS_OPTION);
      if (style.get("point.icon.radius") != null) {
        style.set("point.icon.radius", SimpleCategoryBinding.ICON_RADIUS_OPTION);
      }
      let img = this.htmlParent_.querySelector(`img[id='img-${id}']`);
      style.updateCanvas();
      let dataURL = style.toImage().then((data) => {
        if (img != null) {
          img.src = data;
          img.style.marginLeft = '15%';
          img.style.width = '95px';
        }
      });
    }
  }

  /**
   * TODO
   * @const
   */
  static get RADIUS_OPTION() {
    return 10;
  }


  /**
   * TODO
   * @const
   */
  static get ICON_RADIUS_OPTION() {
    return 10;
  }

  get style() {

    return this.style_;
  }

  /**
   * TODO
   * @const
   */
  static get OPTIONS_POINT_SUBMENU() {
    return [{
      id: "fill",
      name: "Relleno"
    }, {
      id: "stroke",
      name: "Trazo"
    }, {
      id: "label",
      name: "Etiqueta"
    }, {
      id: "icon",
      name: "Icono"
    }, {
      id: "form",
      name: "Familia"
    }];
  }

  /**
   * TODO
   * @const
   */
  static get OPTIONS_SUBMENU() {
    return [{
      id: "fill",
      name: "Relleno"
    }, {
      id: "stroke",
      name: "Trazo"
    }, {
      id: "label",
      name: "Etiqueta"
    }];
  }

  /**
   * Array of allowed geometries.
   * @const {Array<string>}
   */
  static get GEOMETRIES() {
    return ['point', 'line', 'polygon'];
  }

  /**
   * @function
   */
  static arrayDataToTemplate(selected, arrayId, arrayName) {
    return arrayId.map((id, index) => {
      return {
        id: id,
        name: arrayName[index],
        selected: selected
      };
    });
  };

  /**
   * @const
   */
  static get DEFAULT_OPTIONS_STYLE() {
    return {
      radius: 10,
      fill: {
        color: "#e5008a",
        opacity: 1,
        width: 2,
        pattern: {
          color: 'red',
          name: "HATCH",
          size: 1,
          spacing: 2,
          scale: 3,
          offset: 5,
          rotation: 0
        }
      },
      stroke: {
        color: "#000000",
        width: 2,
        linedash: [0, 0],
        linedashoffset: 0,
        linecap: "none",
        linejoin: "none"
      },
      label: {
        fill: {
          color: '#ff0000',
        },
        stroke: {
          color: "no-color",
          width: 2,
          linedash: [0, 0],
          linedashoffset: 0,
          linecap: "none",
          linejoin: "none"
        },
        scale: 2,
        text: "Texto de prueba",
        font: "14px serif",
        align: "center",
        baseline: "top",
        rotate: false,
        rotation: 0,
        offset: [0, 0]
      },
      icon: {
        src: "",
        form: "",
        size: [40, 40],
        anchor: [0, 0],
        scale: 1,
        offset: [0, 0],
        rotation: 0,
        opacity: 1,
        form: "CIRCLE",
        fill: "#ffffff",
        gradientcolor: "#e07e18"
      }
    };
  }
}
