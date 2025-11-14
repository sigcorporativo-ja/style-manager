import chroma from "chroma-js";
import { Binding } from "./binding";
// import { stylelabel } from "templates/stylelabel";

export class SymbolBinding extends Binding {
  constructor(html, htmlParent, styleType, styleParams, layer, controller) {
    super(html, htmlParent, styleType, styleParams, layer);
    this.controller_ = controller;
  }

  setLayer(layer, refresh = true) {
    this.layer_ = layer;
    if (refresh === true) {
      //   this.activateOptionsStyle();
    }
    return this;
  }

  toggleDisplaySubmenu(flag) {
    let buttonOptions = this.getParentTemplate().querySelector(
      "[data-buttons-option]"
    );
    let funct = flag === true ? "add" : "remove";
    buttonOptions.classList[funct]("m-stylemanager-hidden");
    if (buttonOptions.classList.contains("m-stylemanager-hidden")) {
      this.getParentTemplate()
        .querySelector("#m-stylemanager-arrow-list")
        .classList.remove("m-stylemanager-icons-up-open");
      this.getParentTemplate()
        .querySelector("#m-stylemanager-arrow-list")
        .classList.add("m-stylemanager-icons-down-open");
    } else {
      this.getParentTemplate()
        .querySelector("#m-stylemanager-arrow-list")
        .classList.remove("m-stylemanager-icons-down-open");
      this.getParentTemplate()
        .querySelector("#m-stylemanager-arrow-list")
        .classList.add("m-stylemanager-icons-up-open");
    }
  }

  setGeometry(geometry) {
    if (SymbolBinding.GEOMETRIES.includes(geometry)) {
      this.geometry_ = geometry;
    } else {
      this.geometry_ = "point";
    }
    return this;
  }

  static get GEOMETRIES() {
    return ["point", "line", "polygon"];
  }

  generateStyle() {
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

  generateOptions() {
    let styleOpts = {};
    styleOpts["options"] = {};

    this.querySelectorAllForEach("[data-style-options]", (element) => {
      let path = element.dataset["styleOptions"];
      let value;

      if (path === "point.icon.form") {
        const selectedIcon = element.querySelector(
          ".m-stylemanager-grid-item.selected"
        );
        if (selectedIcon) {
          const iconForm = selectedIcon.getAttribute("data-id");
          if (iconForm) {
            Binding.createObj(
              styleOpts["options"],
              "point.icon.form",
              iconForm
            );
          }
        }
      }

      if (path === "point.icon.family") {
        const selectedFamily = element.querySelector(
          ".m-stylemanager-grid-item.selected"
        );
        if (selectedFamily) {
          const iconFamily = selectedFamily.getAttribute("data-id");
          if (iconFamily) {
            Binding.createObj(
              styleOpts["options"],
              "point.icon.class",
              iconFamily
            );
          }
        }
      }

      if (path !== "point.icon.form" && path !== "point.icon.family") {
        value = element.value;

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
          let value2 = parseFloat(
            this.querySelector(`[data-id="${target}"]`).value
          );
          if (isNaN(value2)) {
            value2 = 0;
          }
          value = [value, value2];
        }

        Binding.createObj(styleOpts["options"], path, value);
      }
    });

    this.querySelectorAllForEach("[data-apply]", (element) => {
      let opt = element.dataset["apply"];
      if (element.checked === false) {
        Binding.createObj(styleOpts["options"], opt, undefined);
      }
    });

    const pointOptions = styleOpts["options"]["point"];
    let iconOpts;

    const iconOptions = pointOptions["icon"];
    // const familyOption = pointOptions["family"];

    let shape = iconOptions["form"];
    let src = iconOptions["src"];
    let family = iconOptions["class"];

    const iconFormType = this.getParentTemplate().querySelector(
      'input[name="iconFormType"]:checked'
    );
    const isShape = iconFormType && iconFormType.value === "form";
    const isUrl = iconFormType && iconFormType.value === "url";
    const isNone = iconFormType && iconFormType.value === "none";

    const iconFamilyType = this.querySelector('select[name="iconFamilyType"]');
    const isFamily =
      iconFamilyType &&
      (iconFamilyType.value === "g-cartografia" ||
        iconFamilyType.value === "font-awesome");

    if (isFamily && isShape) {
      iconOpts = {
        form: shape,
        class: family,
        radius: iconOptions.radius,
        fontsize: iconOptions.fontsize,
        color: iconOptions.color,
        fill: iconOptions.fill,
        opacity: Number(iconOptions.opacity),
        rotation: iconOptions.rotation,
        offset: iconOptions.offset,
        gradient: iconOptions.gradient,
        rotate: iconOptions.rotate,
      };
    } else if (isShape && !isFamily && !isUrl) {
      iconOpts = {
        form: shape,
        radius: iconOptions.radius,
        fill: iconOptions.fill,
        color: iconOptions.color,
        opacity: Number(iconOptions.opacity),
        rotation: iconOptions.rotation,
        offset: iconOptions.offset,
        gradient: iconOptions.gradient,
        rotate: iconOptions.rotate,
      };
    } else if (isUrl) {
      iconOpts = {
        src: src,
        anchor: iconOptions.anchor,
        scale: iconOptions.scale,
        size: iconOptions.size,
        offset: iconOptions.offset,
        opacity: Number(iconOptions.opacity),
        rotation: iconOptions.rotation,
        rotate: iconOptions.rotate,
      };
    }

    if (isNone) {
      styleOpts["options"] = {
        point: {
          fill: pointOptions.fill,
          stroke: pointOptions.stroke,
          radius: pointOptions.radius,
        },
        line: {
          fill: styleOpts["options"]["line"].fill,
          stroke: styleOpts["options"]["line"].stroke,
        },
        polygon: {
          fill: styleOpts["options"]["polygon"].fill,
          stroke: styleOpts["options"]["polygon"].stroke,
        },
      };
    } else {
      styleOpts["options"] = {
        point: {
          fill: pointOptions.fill,
          stroke: pointOptions.stroke,
          radius: pointOptions.radius,
          icon: iconOpts,
        },
        line: {
          fill: styleOpts["options"]["line"].fill,
          stroke: styleOpts["options"]["line"].stroke,
        },
        polygon: {
          fill: styleOpts["options"]["polygon"].fill,
          stroke: styleOpts["options"]["polygon"].stroke,
        },
      };
    }

    // Verificar si el checkbox del patrón está desactivado y limpiar el patrón si es necesario
    const patternCheckbox = this.getParentTemplate().querySelector(
      "[data-apply='polygon.fill.pattern.patternflag']"
    );
    if (patternCheckbox && !patternCheckbox.checked) {
      // Si el checkbox está desactivado, eliminar el patrón completamente
      if (
        styleOpts["options"]["polygon"] &&
        styleOpts["options"]["polygon"]["fill"]
      ) {
        delete styleOpts["options"]["polygon"]["fill"]["pattern"];
      }
    }

    return this.processOptions(styleOpts);
  }

  getOptionsTemplate() {
    let options = SymbolBinding.DEFAULT_OPTIONS_STYLE;
    if (this.style_ != null) {
      const sopts = this.style_.getOptions
        ? this.style_.getOptions()
        : this.style_.options_ || {};
      options = M.utils.extends({}, sopts);
      options = M.utils.extends(options, SymbolBinding.DEFAULT_OPTIONS_STYLE);

      let pattern = null;
      let patternFlag = false;

      if (
        this.style_.options_ &&
        this.style_.options_.polygon &&
        this.style_.options_.polygon.fill &&
        this.style_.options_.polygon.fill.pattern
      ) {
        pattern = this.style_.options_.polygon.fill.pattern;
        patternFlag = !!this.style_.options_.polygon.patternflag;
      } else if (
        sopts.polygon &&
        sopts.polygon.fill &&
        sopts.polygon.fill.pattern
      ) {
        pattern = sopts.polygon.fill.pattern;
        patternFlag = !!sopts.polygon.patternflag;
      } else if (sopts.fill && sopts.fill.pattern) {
        pattern = sopts.fill.pattern;
        patternFlag = !!sopts.fill.patternflag;
      }

      if (pattern && pattern.name) {
        options.polygon = options.polygon || {};
        options.polygon.fill = options.polygon.fill || {};
        options.polygon.fill.pattern = M.utils.extends(
          {},
          options.polygon.fill.pattern || {},
          pattern
        );
        options.polygon.patternflag =
          patternFlag || (pattern.name !== null && pattern.name !== undefined);
      }
    }

    // --- POINT ------------------------------------------------------------------------------------------------------- //
    // Obtener valor booleanos
    options["point"]["icon"]["gradient"] =
      !!options["point"]["icon"]["gradient"];
    options["point"]["icon"]["rotate"] = !!options["point"]["icon"]["rotate"];

    // transform color options to hex color for value inputs color
    options["point"]["fill"]["color"] =
      options["point"]["fill"]["color"].indexOf("rgba") >= 0
        ? chroma(chroma(options["point"]["fill"]["color"]).rgb()).hex()
        : chroma(options["point"]["fill"]["color"]).hex();
    options["point"]["icon"]["fill"] = chroma(
      options["point"]["icon"]["fill"]
    ).hex();
    options["point"]["icon"]["color"] = chroma(
      options["point"]["icon"]["color"]
    ).hex();
    options["point"]["stroke"]["color"] =
      options["point"]["stroke"]["color"].indexOf("rgba") >= 0
        ? chroma(chroma(options["point"]["stroke"]["color"]).rgb()).hex()
        : chroma(options["point"]["stroke"]["color"]).hex();
    // options["point"]["label"]["fill"]["color"] = chroma(options["point"]["label"]["fill"]["color"]).hex();
    // options["point"]["label"]["stroke"]["color"] = options["point"]["label"]["stroke"]["color"] === "no-color" ? "no-color" : chroma(options["point"]["label"]["stroke"]["color"]).hex();
    options["point"]["linecapstroke"] = SymbolBinding.arrayDataToTemplate(
      options["point"]["stroke"]["linecap"],
      ["butt", "square", "round"],
      ["Extremo", "Cuadrado", "Redondeado"]
    );
    options["point"]["linejoinstroke"] = SymbolBinding.arrayDataToTemplate(
      options["point"]["stroke"]["linejoin"],
      ["bevel", "miter", "round"],
      ["Bisel", "Inglete", "Redondeado"]
    );

    // --- LINE ------------------------------------------------------------------------------------------------------- //
    options["line"]["fill"]["color"] =
      options["line"]["fill"]["color"].indexOf("rgba") >= 0
        ? chroma(chroma(options["line"]["fill"]["color"]).rgb()).hex()
        : chroma(options["line"]["fill"]["color"]).hex();
    options["line"]["stroke"]["color"] =
      options["line"]["stroke"]["color"].indexOf("rgba") >= 0
        ? chroma(chroma(options["line"]["stroke"]["color"]).rgb()).hex()
        : chroma(options["line"]["stroke"]["color"]).hex();
    options["line"]["linecapstroke"] = SymbolBinding.arrayDataToTemplate(
      options["line"]["stroke"]["linecap"],
      ["butt", "square", "round"],
      ["Extremo", "Cuadrado", "Redondeado"]
    );
    options["line"]["linejoinstroke"] = SymbolBinding.arrayDataToTemplate(
      options["line"]["stroke"]["linejoin"],
      ["bevel", "miter", "round"],
      ["Bisel", "Inglete", "Redondeado"]
    );

    // --- POLYGON ------------------------------------------------------------------------------------------------------- //
    options["polygon"]["fill"]["color"] =
      options["polygon"]["fill"]["color"].indexOf("rgba") >= 0
        ? chroma(chroma(options["polygon"]["fill"]["color"]).rgb()).hex()
        : chroma(options["polygon"]["fill"]["color"]).hex();
    options["polygon"]["stroke"]["color"] =
      options["polygon"]["stroke"]["color"].indexOf("rgba") >= 0
        ? chroma(chroma(options["polygon"]["stroke"]["color"]).rgb()).hex()
        : chroma(options["polygon"]["stroke"]["color"]).hex();
    options["polygon"]["fill"]["pattern"]["color"] = chroma(
      options["polygon"]["fill"]["pattern"]["color"]
    ).hex();
    let patternValids = Object.keys(M.style.pattern).filter(
      (name) => name != "ICON" && name != "IMAGE"
    );
    options["polygon"]["patternlist"] = SymbolBinding.arrayDataToTemplate(
      options["polygon"]["fill"]["pattern"]["name"],
      patternValids,
      patternValids
    );
    options["polygon"]["linecapstroke"] = SymbolBinding.arrayDataToTemplate(
      options["polygon"]["stroke"]["linecap"],
      ["butt", "square", "round"],
      ["Extremo", "Cuadrado", "Redondeado"]
    );
    options["polygon"]["linejoinstroke"] = SymbolBinding.arrayDataToTemplate(
      options["polygon"]["stroke"]["linejoin"],
      ["bevel", "miter", "round"],
      ["Bisel", "Inglete", "Redondeado"]
    );

    // Determinar qué tipo de icono está configurado
    const iconForm = options["point"]["icon"]["form"];
    const iconSrc = options["point"]["icon"]["src"];
    const iconClass = options["point"]["icon"]["class"];

    // Establecer el tipo de icono seleccionado
    if (iconSrc && iconSrc !== "") {
      options["point"]["icon"]["selectedType"] = "url";
    } else if (iconClass && iconClass !== "") {
      options["point"]["icon"]["selectedType"] = "form";
    } else if (iconForm && iconForm !== "" && iconForm !== "NONE") {
      options["point"]["icon"]["selectedType"] = "form";
    } else {
      options["point"]["icon"]["selectedType"] = "none";
    }

    // Traducciones
    const translationKeys = {
      none: "none",
      pointOptions: "point-options",
      lineOptions: "line-options",
      polygonOptions: "polygon-options",
      options: "options",
      advancedOptions: "advanced-options",
      fillColor: "fill-color",
      strokeColor: "stroke-color",
      outlineThickness: "outline-thickness",
      lineThickness: "line-thickness",
      size: "size",
      opacity: "opacity",
      linedash: "linedash",
      offset: "offset",
      linedashOffset: "linedash-offset",
      lineCap: "line-cap",
      lineJoin: "line-join",
      iconAndFont: "icon-and-font",
      fontSelect: "font-select",
      urlSelect: "url-select",
      url: "url",
      formSize: "form-size",
      family: "family",
      familyGCartografia: "g-cartografia",
      familyFontAwesome: "font-awesome",
      iconSize: "icon-size",
      gradient: "gradient",
      rotationWithMap: "rotation-with-map",
      rotation: "rotation",
      pattern: "pattern",
      type: "type",
      patternSize: "pattern-size",
      patternSpacing: "pattern-spacing",
      scale: "scale",
      anchor: "anchor",
      noneA: "none-A",
      noneO: "none-O",
      gCartography: "g-cartography",
      fontAwesome: "font-awesome",
    };
    options.translations = Binding.getTranslations(translationKeys);

    return options;
  }

  processOptions(styleOpts) {
    const finalStyle = styleOpts["options"];

    if (finalStyle.point.fill === undefined) {
      delete finalStyle.point.fill;
    }
    if (finalStyle.point.stroke === undefined) {
      delete finalStyle.point.stroke;
    }
    if (finalStyle.point.icon === undefined) {
      delete finalStyle.point.icon;
    }

    return finalStyle;
  }

  isChecked(option) {
    let checked = false;
    let input = this.getParentTemplate().querySelector(
      `[data-buttons-option] input[data-apply='${option}'`
    );
    if (input != null) {
      checked = input.checked;
    }
    return checked;
  }

  static arrayDataToTemplate(selected, arrayId, arrayName) {
    return arrayId.map((id, index) => {
      return {
        id: id,
        name: arrayName[index],
        selected: selected,
      };
    });
  }

  static get DEFAULT_OPTIONS_STYLE() {
    const def = {
      radius: 10,
      fill: {
        color: "#e5008a",
        opacity: 1,
        width: 2,
        pattern: {
          color: "#ff0000",
          name: "HATCH",
          size: 1,
          spacing: 2,
          scale: 3,
          offset: 5,
          rotation: 0,
        },
      },
      stroke: {
        color: "#000000",
        width: 2,
        linedash: [0, 0],
        linedashoffset: 0,
        linecap: "round",
        linejoin: "round",
      },
      label: {
        fill: {
          color: "#ff0000",
        },
        stroke: {
          color: "no-color",
          width: 2,
          linedash: [0, 0],
          linedashoffset: 0,
          linecap: "round",
          linejoin: "round",
        },
        scale: 2,
        text: "",
        font: "14px serif",
        align: "center",
        baseline: "top",
        rotate: false,
        rotation: 0,
        offset: [0, 0],
      },
      icon: {
        form: "NONE",
        // class: "g-cartografia-info",
        src: "",
        size: [40, 40],
        anchor: [0, 0],
        scale: 1,
        offset: [0, 0],
        rotate: false,
        rotation: 0,
        opacity: 1,
        fill: "#ffffff",
        color: "#e07e18",
        radius: 10,
        fontsize: 0.8,
        gradient: false,
      },
    };
    return {
      point: M.utils.extends({}, def),
      line: M.utils.extends({}, def),
      polygon: M.utils.extends({}, def),
    };
  }
}
