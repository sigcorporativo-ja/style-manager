import * as chroma from 'chroma-js';
import buttonoptions from 'templates/buttonoptions';
import { Binding } from './binding';
export class SimpleBinding extends Binding {
  constructor(html, htmlParent, styleType, styleParams, layer, controller) {
    super(html, htmlParent, styleType, styleParams, layer);
    this.controller_ = controller;
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

  /**
   * This function sets the geometry of binding class.
   * @function
   * @param {string}
   * @return {SimpleBinding}
   */
  setGeometry(geometry) {
    if (SimpleBinding.GEOMETRIES.includes(geometry)) {
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
    this.querySelectorAllForEach(`[data-geometry]`, node => node.classList.remove('m-hidden'));
    this.refreshOptionsButtons();
    this.addLabelPathListener();
  }

  /**
   * This function refresh the html options buttons template.
   * @function
   */
  refreshOptionsButtons() {
    let options = SimpleBinding.OPTIONS_POINT_SUBMENU;

    this.addOptionsButtons(options, () => {
      this.compatibleSectionListener("icon", "form");
      this.compatibleSectionListener("form", "icon");
    });
  }

  /**
   * This function sets the layer of a binding class.
   * @function
   */
  addOptionsButtons(options, callback = null) {
    let parentHtml = this.getParentTemplate().querySelector("[data-buttons-option]");
    this.hideAllOptionsSections();
    this.addTemplate(buttonoptions, parentHtml, {
      buttonsParams: options
    }, () => {
      options.forEach(option => {
        this.toggleCheckOptionSection(option.id);
        this.activateOptionSection(option.id);
        if (typeof callback === "function") {
          callback();
        }
      });
      this.activateOptionsStyle();
      this.addEventCheckFromSubmenu();
    });
  }

  addEventCheckFromSubmenu() {
    this.querySelectorAllForEachParent("[data-buttons-option] input", input => {
      input.addEventListener("change", () => {
        this.controller_.selectPanel("stylesimple");
      });
    });
  }

  /**
   * This functions initialize the submenu view of each option of Style simple
   * @function
   */
  activateOptionsStyle() {
    let style = this.style_;
    let iconSelect = this.querySelector("#select-icon");
    iconSelect.replaceWith(iconSelect.cloneNode(true));
    iconSelect = this.querySelector("#select-icon");
    iconSelect.addEventListener('click', this.eventOpenIconSelector);
    let iconDialog = document.querySelector(".style-grid-container");
    iconDialog.addEventListener('click', this.eventSelectIcon);
    let familySelect = this.querySelector("[data-style-options='point.form.class']");
    familySelect.addEventListener('change', this.changeFamilyFont);
    let famSelector = this.querySelector(".style-col-2 > select[data-style-options = 'point.form.class']");
    let fmSIcon = famSelector.dataset.icon;
    if (fmSIcon !== '') {
      let fmSIconArray = fmSIcon.split('-');
      let fam = fmSIconArray[0] == 'g' ? 'g-cartografia' : fmSIconArray[0] == 'fa' ? 'fa' : '';
      famSelector.querySelector(`option[value="${fam}"]`).selected = true;
      famSelector.dispatchEvent(new Event('change'));
      document.querySelector('#select-icon').classList = (fam == 'fa' ? 'fa ' : '') + fmSIcon;
      document.querySelector(`.style-grid-item${fam == 'fa' ? '.fa' : ''}.${fmSIcon}`).classList.add('selected');
    }

    if (style != null) {
      let options = style.getOptions();
      if (options["point"]["fill"] != null || options["line"]["fill"] != null || options["polygon"]["fill"] != null) {
        let valuesFillPoint = Object.values(options.point.fill).filter(value => value != undefined);
        let valuesFillLine = Object.values(options.line.fill).filter(value => value != undefined);
        let valuesFillPolygon = Object.values(options.polygon.fill).filter(value => value != undefined);
        if (valuesFillPoint.length > 0 || valuesFillLine.length > 0 || valuesFillPolygon.length > 0) {
          this.checkOptionSection("fill");
        }
      }

      if (options["point"]["stroke"] != undefined || options["line"]["stroke"] != undefined || options["polygon"]["stroke"] != undefined) {
        this.checkOptionSection("stroke");
      }

      if (options["point"]["label"] != undefined) {
        this.checkOptionSection("label");
      }

      if (options["point"]["icon"] != undefined) {
        if (options["point"]["icon"].hasOwnProperty("src")) {
          this.checkOptionSection("icon");
          this.disableOption("form");
        }

        if (options["point"]["icon"].hasOwnProperty("form")) {

          this.checkOptionSection("form");
          this.disableOption("icon");
        }

        if (options["point"]["icon"].hasOwnProperty("class")) {
          familySelect.value = options["point"]["icon"]["class"];
        }
      }
      if (options["polygon"]["icon"] != undefined) {
        if (options["polygon"]["icon"].hasOwnProperty("src")) {
          this.checkOptionSection("icon");
          this.disableOption("form");
        }

        if (options["polygon"]["icon"].hasOwnProperty("form")) {

          this.checkOptionSection("form");
          this.disableOption("icon");
        }

        if (options["polygon"]["icon"].hasOwnProperty("class")) {
          familySelect.value = options["polygon"]["icon"]["class"];
        }
      }
      if (options["line"]["icon"] != undefined) {
        if (options["line"]["icon"].hasOwnProperty("src")) {
          this.checkOptionSection("icon");
          this.disableOption("form");
        }

        if (options["line"]["icon"].hasOwnProperty("form")) {

          this.checkOptionSection("form");
          this.disableOption("icon");
        }

        if (options["line"]["icon"].hasOwnProperty("class")) {
          familySelect.value = options["line"]["icon"]["class"];
        }
      }

    }

  }

  /**
   * @function
   */
  eventOpenIconSelector(ev) {
    let iconDialog = document.querySelector(".style-grid-container");
    if (iconDialog.classList.toString() === 'style-grid-container active') { iconDialog.classList.remove('active'); } else { iconDialog.classList.add('active'); }
  }

  /**
   * @function
   */
  eventSelectIcon(ev) {
    if (!ev.target.classList.contains('selected') && ev.target.classList.contains('style-grid-item')) {
      let selected = document.querySelector('.style-grid-item.selected');
      if (selected) { selected.classList.remove('selected'); }
      ev.target.classList.add("selected");
      let iconSelected = ev.target.classList.toString().replace('selected', '').replace('style-grid-item', '').trim();
      document.querySelector("[data-style-options='point.form.class']").dataset.icon = iconSelected.replace('fa', '').trim();
      document.querySelector('#select-icon').classList = iconSelected;
    }
  }

  /**
   * @function
   */
  changeFamilyFont(ev) {
    if (ev.target.value === '') {
      document.querySelector('#select-icon').style.display = 'none';
      document.querySelector(".style-grid-container").classList.remove('active');
    } else {
      document.querySelector('#select-icon').style.display = 'inherit';
    }
    let childs = document.querySelectorAll(`.style-grid-item`);
    childs.forEach(elem => {
      elem.style.display = "none";
    });
    let childsSelected = document.querySelectorAll(`.style-grid-item[class*='${ev.target.value}']`);
    childsSelected.forEach(elem => {
      elem.style.display = "inherit";
    });
  }

  /**
   * This function sets the layer of a binding class.
   * @function
   */
  addLabelPathListener() {
    let pathCheckPoint = this.querySelector("[data-style-options='point.label.path']");
    pathCheckPoint.addEventListener("change", () => {
      this.togglePathSection(!pathCheckPoint.checked);
    });

    let pathCheckPolygon = this.querySelector("[data-style-options='polygon.label.path']");
    pathCheckPolygon.addEventListener("change", () => {
      this.togglePathSection(!pathCheckPolygon.checked);
    });

    let pathCheckLine = this.querySelector("[data-style-options='line.label.path']");
    pathCheckLine.addEventListener("change", () => {
      this.togglePathSection(!pathCheckLine.checked);
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
      if (path == "point.form.class" && value !== '') {
        value = this.querySelector("[data-style-options='point.form.class']").dataset.icon;
      }
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

    let fontSizePoint = this.querySelector("[data-font-size-point]").value || 12;
    let fontFamilyPoint = this.querySelector("[data-font-family-point]").value;
    let fontPoint = `${fontSizePoint}px ${fontFamilyPoint}`;

    let fontSizePolygon = this.querySelector("[data-font-size-polygon]").value || 12;
    let fontFamilyPolygon = this.querySelector("[data-font-family-polygon]").value;
    let fontPolygon = `${fontSizePolygon}px ${fontFamilyPolygon}`;

    let fontSizeLine = this.querySelector("[data-font-size-line]").value || 12;
    let fontFamilyLine = this.querySelector("[data-font-family-line]").value;
    let fontLine = `${fontSizeLine}px ${fontFamilyLine}`;

    let icon = document.querySelector("[data-apply='icon']");
    let iconOpts = icon !== null && icon.checked === true ?
      styleOpts["options"]["point"].src : styleOpts["options"]["point"].form;

    let labelOptPoint;
    if (styleOpts["options"]["point"]["label"] != null && styleOpts["options"]["point"]["label"]["text"] != null) {
      labelOptPoint = styleOpts["options"]["point"]["label"];
    }
    let labelOptPolygon;
    if (styleOpts["options"]["polygon"]["label"] != null && styleOpts["options"]["polygon"]["label"]["text"] != null) {
      labelOptPolygon = styleOpts["options"]["polygon"]["label"];
    }
    let labelOptLine;
    if (styleOpts["options"]["line"]["label"] != null && styleOpts["options"]["line"]["label"]["text"] != null) {
      labelOptLine = styleOpts["options"]["line"]["label"];
    }

    styleOpts["options"] = {
      point: {
        fill: styleOpts["options"]["point"].fill,
        stroke: styleOpts["options"]["point"].stroke,
        label: labelOptPoint,
        icon: iconOpts,
        radius: styleOpts["options"]["point"].radius
      },
      line: {
        fill: styleOpts["options"]["line"].fill,
        stroke: styleOpts["options"]["line"].stroke,
        label: labelOptLine,
      },
      polygon: {
        fill: styleOpts["options"]["polygon"].fill,
        stroke: styleOpts["options"]["polygon"].stroke,
        label: labelOptPolygon,
      }
    };

    // if (this.getGeometry() === "line") {
    //   styleOpts["options"] = {
    //     fill: styleOpts["options"].fill,
    //     stroke: styleOpts["options"].stroke,
    //     label: styleOpts["options"].label
    //   };


    //MIRARLO
    //   delete styleOpts["options"]["fill"]["pattern"];
    //   if (Object.keys(styleOpts["options"]["fill"]).length === 0) {
    //     delete styleOpts["options"]["fill"];
    //   }
    // }

    // if (this.getGeometry() === "polygon") {
    //   styleOpts["options"] = {
    //     fill: styleOpts["options"].fill,
    //     stroke: styleOpts["options"].stroke,
    //     label: styleOpts["options"].label
    //   };
    // }

    if (styleOpts["options"]["point"]["label"] != undefined) {
      styleOpts["options"]["point"]["label"]["font"] = fontPoint;
    }
    if (styleOpts["options"]["polygon"]["label"] != undefined) {
      styleOpts["options"]["polygon"]["label"]["font"] = fontPolygon;
    }
    if (styleOpts["options"]["line"]["label"] != undefined) {
      styleOpts["options"]["line"]["label"]["font"] = fontLine;
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
    styleOptsClone["options"]["point"]["fill"] = checkedFill === true ? styleOptsClone["options"]["point"]["fill"] : undefined;
    styleOptsClone["options"]["point"]["stroke"] = checkedStroke === true ? styleOptsClone["options"]["point"]["stroke"] : undefined;
    styleOptsClone["options"]["point"]["label"] = checkedLabel === true ? styleOptsClone["options"]["point"]["label"] : undefined;
    styleOptsClone["options"]["point"]["icon"] = checkedIcon === true || checkedForm === true ? styleOptsClone["options"]["point"]["icon"] : undefined;

    styleOptsClone["options"]["line"]["fill"] = checkedFill === true ? styleOptsClone["options"]["line"]["fill"] : undefined;
    styleOptsClone["options"]["line"]["stroke"] = checkedStroke === true ? styleOptsClone["options"]["line"]["stroke"] : undefined;
    styleOptsClone["options"]["line"]["label"] = checkedLabel === true ? styleOptsClone["options"]["line"]["label"] : undefined;
    styleOptsClone["options"]["line"]["icon"] = checkedIcon === true || checkedForm === true ? styleOptsClone["options"]["line"]["icon"] : undefined;

    styleOptsClone["options"]["polygon"]["fill"] = checkedFill === true ? styleOptsClone["options"]["polygon"]["fill"] : undefined;
    styleOptsClone["options"]["polygon"]["stroke"] = checkedStroke === true ? styleOptsClone["options"]["polygon"]["stroke"] : undefined;
    styleOptsClone["options"]["polygon"]["label"] = checkedLabel === true ? styleOptsClone["options"]["polygon"]["label"] : undefined;
    styleOptsClone["options"]["polygon"]["icon"] = checkedIcon === true || checkedForm === true ? styleOptsClone["options"]["polygon"]["icon"] : undefined;

    styleOptsClone["point"] = {
      fill: styleOptsClone["options"]["point"].fill,
      radius: styleOptsClone["options"]["point"].radius,
      stroke: styleOptsClone["options"]["point"].stroke,
      label: styleOptsClone["options"]["point"].label,
      icon: styleOptsClone["options"]["point"].icon
    }

    styleOptsClone["line"] = {
      fill: styleOptsClone["options"]["line"].fill,
      stroke: styleOptsClone["options"]["line"].stroke,
      label: styleOptsClone["options"]["line"].label
    }

    styleOptsClone["polygon"] = {
      fill: styleOptsClone["options"]["polygon"].fill,
      stroke: styleOptsClone["options"]["polygon"].stroke,
      label: styleOptsClone["options"]["polygon"].label
    }
    delete styleOptsClone["options"];

    return styleOptsClone;
  }

  /**
   * @function
   */
  isChecked(option) {
    let checked = false;
    let input = this.getParentTemplate().querySelector(`[data-buttons-option] input[data-apply='${option}'`);
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

    let style;
    //let geometry = this.getGeometry();
    let styleOptions = this.generateOptions();

    // switch (geometry) {
    //   case "point":
    //     style = new M.style.Generic(styleOptions);
    //     break;
    //   case "line":
    //     style = new M.style.Line(styleOptions);
    //     break;
    //   case "polygon":
    //     style = new M.style.Polygon(styleOptions);
    //     break;

    //   default:
    //     M.dialog.error("Geometría no soportada", "Error");

    // }

    style = new M.style.Generic(styleOptions);

    return style;
  }

  /**
   * This function adds the listener click event that shows the compatible sections buttons.
   * @param {string}
   * @param {string}
   */
  compatibleSectionListener(optionEnable, optionDisable) {
    let input = this.querySelectorParent(`[data-buttons-option] input[data-apply="${optionEnable}"]`);
    if (input != null) {
      input.addEventListener("change", () => {
        if (input.checked === true) {
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
    let options = SimpleBinding.DEFAULT_OPTIONS_STYLE;
    if (this.style_ != null) {
      if (this.style_.get("polygon.fill.pattern") != null) {
        options["polygon"]["patternflag"] = true;
      }
      options = M.utils.extends({}, this.style_.getOptions());
      options = M.utils.extends(options, SimpleBinding.DEFAULT_OPTIONS_STYLE);
    }

    // transform color options to hex color for value inputs color

    options["point"]["fill"]["color"] = options["point"]["fill"]["color"].indexOf('rgba') >= 0 ? chroma(chroma(options["point"]["fill"]["color"]).rgb()).hex() : chroma(options["point"]["fill"]["color"]).hex();
    options["line"]["fill"]["color"] = options["line"]["fill"]["color"].indexOf('rgba') >= 0 ? chroma(chroma(options["line"]["fill"]["color"]).rgb()).hex() : chroma(options["line"]["fill"]["color"]).hex();
    options["polygon"]["fill"]["color"] = options["polygon"]["fill"]["color"].indexOf('rgba') >= 0 ? chroma(chroma(options["polygon"]["fill"]["color"]).rgb()).hex() : chroma(options["polygon"]["fill"]["color"]).hex();
    options["point"]["stroke"]["color"] = options["point"]["stroke"]["color"].indexOf('rgba') >= 0 ? chroma(chroma(options["point"]["stroke"]["color"]).rgb()).hex() : chroma(options["point"]["stroke"]["color"]).hex();
    options["line"]["stroke"]["color"] = options["line"]["stroke"]["color"].indexOf('rgba') >= 0 ? chroma(chroma(options["line"]["stroke"]["color"]).rgb()).hex() : chroma(options["line"]["stroke"]["color"]).hex();
    options["polygon"]["stroke"]["color"] = options["polygon"]["stroke"]["color"].indexOf('rgba') >= 0 ? chroma(chroma(options["polygon"]["stroke"]["color"]).rgb()).hex() : chroma(options["polygon"]["stroke"]["color"]).hex();
    // options["point"]["label"]["fill"]["color"] = chroma(options["point"]["label"]["fill"]["color"]).hex();
    // options["point"]["label"]["stroke"]["color"] = options["point"]["label"]["stroke"]["color"] === "no-color" ? "no-color" : chroma(options["point"]["label"]["stroke"]["color"]).hex();
    options["polygon"]["fill"]["pattern"]["color"] = chroma(options["polygon"]["fill"]["pattern"]["color"]).hex();
    options["point"]["icon"]["fill"] = chroma(options["point"]["icon"]["fill"]).hex();
    options["point"]["icon"]["color"] = chroma(options["point"]["icon"]["color"]).hex();
    // --

    let patternValids = Object.keys(M.style.pattern).filter(name => name != "ICON" && name != "IMAGE");
    let alignValues = Object.values(M.style.align);
    let baselineValues = Object.values(M.style.baseline);
    let formValues = Object.values(M.style.form).filter(name => name != null);

    //transform array options to data template option
    options["polygon"]["patternlist"] = SimpleBinding.arrayDataToTemplate(options["polygon"]["fill"]["pattern"]["name"], patternValids, patternValids);
    options["point"]["linecapstroke"] = SimpleBinding.arrayDataToTemplate(options["point"]["stroke"]["linecap"], ["butt", "square", "round"], ["Extremo", "Cuadrado", "Redondeado"]);
    options["line"]["linecapstroke"] = SimpleBinding.arrayDataToTemplate(options["line"]["stroke"]["linecap"], ["butt", "square", "round"], ["Extremo", "Cuadrado", "Redondeado"]);
    options["polygon"]["linecapstroke"] = SimpleBinding.arrayDataToTemplate(options["polygon"]["stroke"]["linecap"], ["butt", "square", "round"], ["Extremo", "Cuadrado", "Redondeado"]);
    options["point"]["linejoinstroke"] = SimpleBinding.arrayDataToTemplate(options["point"]["stroke"]["linejoin"], ["bevel", "miter", "round"], ["Bisel", "Inglete", "Redondeado"]);
    options["line"]["linejoinstroke"] = SimpleBinding.arrayDataToTemplate(options["line"]["stroke"]["linejoin"], ["bevel", "miter", "round"], ["Bisel", "Inglete", "Redondeado"]);
    options["polygon"]["linejoinstroke"] = SimpleBinding.arrayDataToTemplate(options["polygon"]["stroke"]["linejoin"], ["bevel", "miter", "round"], ["Bisel", "Inglete", "Redondeado"]);
    options["point"]["linecaplabelstroke"] = SimpleBinding.arrayDataToTemplate(options["point"]["label"]["stroke"]["linecap"], ["butt", "square", "round"], ["Extremo", "Cuadrado", "Redondeado"]);
    options["line"]["linecaplabelstroke"] = SimpleBinding.arrayDataToTemplate(options["line"]["label"]["stroke"]["linecap"], ["butt", "square", "round"], ["Extremo", "Cuadrado", "Redondeado"]);
    options["polygon"]["linecaplabelstroke"] = SimpleBinding.arrayDataToTemplate(options["polygon"]["label"]["stroke"]["linecap"], ["butt", "square", "round"], ["Extremo", "Cuadrado", "Redondeado"]);
    options["point"]["linejoinlabelstroke"] = SimpleBinding.arrayDataToTemplate(options["point"]["label"]["stroke"]["linejoin"], ["bevel", "miter", "round"], ["Bisel", "Inglete", "Redondeado"]);
    options["polygon"]["linejoinlabelstroke"] = SimpleBinding.arrayDataToTemplate(options["polygon"]["label"]["stroke"]["linejoin"], ["bevel", "miter", "round"], ["Bisel", "Inglete", "Redondeado"]);
    options["line"]["linejoinlabelstroke"] = SimpleBinding.arrayDataToTemplate(options["line"]["label"]["stroke"]["linejoin"], ["bevel", "miter", "round"], ["Bisel", "Inglete", "Redondeado"]);
    options["point"]["alignlist"] = SimpleBinding.arrayDataToTemplate(options["point"]["label"]["align"], alignValues, ["Centro", "Justificado", "Izquierda", "Derecha"]);
    options["polygon"]["alignlist"] = SimpleBinding.arrayDataToTemplate(options["polygon"]["label"]["align"], alignValues, ["Centro", "Justificado", "Izquierda", "Derecha"]);
    options["line"]["alignlist"] = SimpleBinding.arrayDataToTemplate(options["line"]["label"]["align"], alignValues, ["Centro", "Justificado", "Izquierda", "Derecha"]);

    options["point"]["baselinelist"] = SimpleBinding.arrayDataToTemplate(options["point"]["label"]["baseline"], baselineValues, ["Alfabetico", "Abajo", "Colgando", "Ideografico", "Arriba", "Centro", ]);
    options["polygon"]["baselinelist"] = SimpleBinding.arrayDataToTemplate(options["polygon"]["label"]["baseline"], baselineValues, ["Alfabetico", "Abajo", "Colgando", "Ideografico", "Arriba", "Centro", ]);
    options["line"]["baselinelist"] = SimpleBinding.arrayDataToTemplate(options["line"]["label"]["baseline"], baselineValues, ["Alfabetico", "Abajo", "Colgando", "Ideografico", "Arriba", "Centro", ]);

    options["point"]["formlist"] = SimpleBinding.arrayDataToTemplate(options["point"]["icon"]["form"], formValues, formValues);
    if (this.layer_ != null) {
      let labelTextValues = Object.keys(this.getFeaturesAttributes());
      let labelTextSelectedPoint = options["point"]["label"] != null ? options["point"]["label"]["text"] : "";
      let labelTextSelectedPolygon = options["polygon"]["label"] != null ? options["polygon"]["label"]["text"] : "";
      let labelTextSelectedLine = options["line"]["label"] != null ? options["line"]["label"]["text"] : "";

      options["point"]["featuresAttr"] = SimpleBinding.arrayDataToTemplate(labelTextSelectedPoint, labelTextValues.map(name => `{{${name}}}`), labelTextValues);
      options["polygon"]["featuresAttr"] = SimpleBinding.arrayDataToTemplate(labelTextSelectedPolygon, labelTextValues.map(name => `{{${name}}}`), labelTextValues);
      options["line"]["featuresAttr"] = SimpleBinding.arrayDataToTemplate(labelTextSelectedLine, labelTextValues.map(name => `{{${name}}}`), labelTextValues);

    }

    options["point"]["label"]["fontSize"] = options["point"]["label"]["font"].split(' ')[0].replace('px', '');
    options["point"]["label"]["font"] = options["point"]["label"]["font"].split(' ')[1];
    options["line"]["label"]["fontSize"] = options["line"]["label"]["font"].split(' ')[0].replace('px', '');
    options["line"]["label"]["font"] = options["line"]["label"]["font"].split(' ')[1];
    options["polygon"]["label"]["fontSize"] = options["polygon"]["label"]["font"].split(' ')[0].replace('px', '');
    options["polygon"]["label"]["font"] = options["polygon"]["label"]["font"].split(' ')[1];


    return options;
  }

  set imgId(id) {
    this.imgId_ = id;
  }

  get imgId() {
    return this.imgId_;
  }

  toggleDisplaySubmenu(flag) {
    let buttonOptions = this.getParentTemplate().querySelector("[data-buttons-option]");
    let funct = flag === true ? "add" : "remove";
    buttonOptions.classList[funct]("m-hidden");
  }

  /**
   * @function
   * @param {function}
   */
  refreshLegend(element, flag = false) {
    let id = this.imgId_;
    let style = this.generateStyle();
    if (flag === true) {
      style = this.style_;
    }
    if (style != null) {
      style = style.clone();
      if (style instanceof M.style.Point) {
        style.set('radius', SimpleBinding.RADIUS_OPTION);
        if (style.get("icon.radius") != null) {
          style.set("icon.radius", SimpleBinding.ICON_RADIUS_OPTION);
        }
      }
      let img = this.htmlParent_.querySelector(`img[id='img-${id}']`);
      style.updateCanvas();
      let dataURL = style.toImage();
      if (img != null) {
        img.src = dataURL;
      }
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
      name: "Fuente"
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
    const
      def = {
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
          text: "",
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
          rotate: false,
          rotation: 0,
          opacity: 1,
          form: "CIRCLE",
          class: "g-cartografia-info",
          fill: "#ffffff",
          color: "#e07e18"
        }
      };
    return {
      "point": M.utils.extends({}, def),
      "line": M.utils.extends({}, def),
      "polygon": M.utils.extends({}, def),
    }
  }
}
