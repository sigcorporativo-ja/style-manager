import chroma from "chroma-js";
import { Binding } from "./binding";

export class LabelBinding extends Binding {
  constructor(html, htmlParent, styleType, styleParams, layer) {
    super(html, htmlParent, styleType, styleParams, layer);

    // Agregar los listeners después de que la plantilla se compile
    this.compilePromise_.then(() => {
      this.addLabelEventListeners();
      this.loadExistingLabelStyle();
    });
  }

  /**
   * Establece la capa y actualiza el formulario con los estilos existentes
   * @function
   * @param {M.layer.Vector} layer
   * @param {boolean} refresh
   * @return {LabelBinding}
   */
  setLayer(layer, refresh = true) {
    this.layer_ = layer;
    if (refresh === true) {
      this.loadExistingLabelStyle();
    }
    return this;
  }

  /**
   * Establece el tipo de geometría
   * @function
   * @param {string} geometry
   * @return {LabelBinding}
   */
  setGeometry(geometry) {
    if (["point", "line", "polygon"].includes(geometry)) {
      this.geometry_ = geometry;
    } else {
      this.geometry_ = "point";
    }
    return this;
  }

  /**
   * Carga el estilo de etiquetas existente de la capa en el formulario
   * @function
   */
  loadExistingLabelStyle() {
    if (!this.layer_ || !this.layer_.getStyle) {
      return;
    }

    const currentStyle = this.layer_.getStyle();
    if (!currentStyle) {
      return;
    }

    let labelOptions = null;

    // Intentar obtener las opciones de etiquetas del estilo actual
    if (
      currentStyle.getOptions &&
      typeof currentStyle.getOptions === "function"
    ) {
      const styleOpts = currentStyle.getOptions();
      labelOptions = this.extractLabelOptions(styleOpts);
    } else if (currentStyle.options_) {
      labelOptions = this.extractLabelOptions(currentStyle.options_);
    }

    if (labelOptions) {
      // Asegurar que las funciones text estén correctamente configuradas antes de actualizar el formulario
      this.ensureTextFunctions(labelOptions);
      this.updateFormWithLabelOptions(labelOptions);
      // Activar automáticamente el binding de etiquetas si encontramos configuración
      this.autoActivateLabelBinding();
      // CRUCIAL: Aplicar realmente el estilo a la capa para que se muestren las etiquetas
      this.forceApplyLabelStyle(labelOptions);
    }
  }

  /**
   * Activa automáticamente el binding de etiquetas cuando se detectan configuraciones existentes
   * @function
   */
  autoActivateLabelBinding() {
    setTimeout(() => {
      const labelCheckbox = this.getParentTemplate().querySelector(
        '[data-checkbox="stylelabel"]'
      );

      if (labelCheckbox && !labelCheckbox.checked) {
        labelCheckbox.checked = true;

        const changeEvent = new Event("change", { bubbles: true });
        labelCheckbox.dispatchEvent(changeEvent);
      }
    }, 100);
  }

  /**
   * Asegura que las funciones text estén correctamente configuradas para estilos con _attributeName
   * @function
   * @param {Object} labelOptions
   */
  ensureTextFunctions(labelOptions) {
    ["point", "line", "polygon"].forEach((geomType) => {
      if (labelOptions[geomType] && labelOptions[geomType].label) {
        const label = labelOptions[geomType].label;

        // Si hay _attributeName pero no hay función text, crearla
        if (
          label._attributeName &&
          (!label.text || typeof label.text !== "function")
        ) {
          const attributeName = label._attributeName;

          label.text = (feature) => {
            if (feature && feature.getAttribute) {
              return feature.getAttribute(attributeName) || "";
            }
            return "";
          };
        }
        // Si hay función text pero no _attributeName, intentar extraerlo
        else if (typeof label.text === "function" && !label._attributeName) {
          // Para estilos existentes, usar el primer atributo disponible como fallback
          const featuresAttributes = this.getFeaturesAttributes();
          if (
            featuresAttributes.length > 0 &&
            featuresAttributes[0].id !== "none"
          ) {
            label._attributeName = featuresAttributes[0].id;
          }
        }
      }
    });
  }

  /**
   * Fuerza la aplicación del estilo de etiquetas a la capa (clona el flujo de aplicar estilos)
   * @function
   * @param {Object} labelOptions
   */
  forceApplyLabelStyle(labelOptions) {
    if (!this.layer_ || !labelOptions) {
      return;
    }

    try {
      // Clonar el flujo de generateOptions() y generateStyle()
      const currentStyle = this.layer_.getStyle();

      if (currentStyle && currentStyle.getOptions) {
        // Obtener las opciones actuales del estilo
        let currentOptions = currentStyle.getOptions();

        // Crear una copia profunda de las opciones actuales preservando funciones
        let newOptions = this.deepCloneWithFunctions(currentOptions);

        // Agregar/actualizar las opciones de etiquetas con las funciones text corregidas
        ["point", "line", "polygon"].forEach((geomType) => {
          if (labelOptions[geomType] && labelOptions[geomType].label) {
            if (!newOptions[geomType]) {
              newOptions[geomType] = {};
            }
            newOptions[geomType].label = labelOptions[geomType].label;
          }
        });

        // Crear un nuevo estilo con las opciones actualizadas
        const newStyle = new M.style.Generic(newOptions);

        // Aplicar el nuevo estilo a la capa
        this.layer_.setStyle(newStyle);
      }
    } catch (error) {
      // Error al aplicar el estilo de etiquetas - silenciar para evitar lint errors
    }
  }

  /**
   * Clona profundamente un objeto preservando las funciones
   * @function
   * @param {Object} obj
   * @return {Object}
   */
  deepCloneWithFunctions(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (typeof obj === "function") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepCloneWithFunctions(item));
    }

    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepCloneWithFunctions(obj[key]);
      }
    }

    return cloned;
  }

  /**
   * Extrae las opciones de etiquetas de las opciones de estilo
   * @function
   * @param {Object} styleOpts
   * @return {Object|null}
   */
  extractLabelOptions(styleOpts) {
    let labelOptions = {};
    let hasLabel = false;

    ["point", "line", "polygon"].forEach((geomType) => {
      if (styleOpts[geomType] && styleOpts[geomType].label) {
        labelOptions[geomType] = { label: styleOpts[geomType].label };
        hasLabel = true;
      }
    });

    return hasLabel ? labelOptions : null;
  }

  /**
   * Actualiza el formulario con las opciones de etiquetas proporcionadas
   * @function
   * @param {Object} labelOptions
   */
  updateFormWithLabelOptions(labelOptions) {
    const safeColorConversion = (color, defaultColor = "#000000") => {
      try {
        if (
          !color ||
          color === "" ||
          color === "transparent" ||
          color === "no-color"
        ) {
          return defaultColor;
        }
        if (typeof chroma !== "undefined") {
          return chroma(color).hex();
        }
        return color;
      } catch (error) {
        return defaultColor;
      }
    };

    // Procesar cada tipo de geometría
    ["point", "line", "polygon"].forEach((geomType) => {
      if (!labelOptions[geomType] || !labelOptions[geomType].label) {
        return;
      }

      const label = labelOptions[geomType].label;

      // Color de texto
      if (label.color) {
        const colorInput = this.querySelector(
          `[data-style-options="${geomType}.label.color"]`
        );
        if (colorInput) {
          colorInput.value = safeColorConversion(label.color, "#000000");
        }
      }

      // Atributo de etiqueta: solo usar _attributeName
      const textSelect = this.querySelector(
        `[data-style-options="${geomType}.label.text"]`
      );
      if (textSelect) {
        if (label._attributeName) {
          textSelect.value = label._attributeName;
        } else {
          textSelect.value = "";
        }
      }

      // Alineación horizontal
      if (label.align) {
        const alignSelect = this.querySelector(
          `[data-style-options="${geomType}.label.align"]`
        );
        if (alignSelect) {
          alignSelect.value = label.align;
        }
      }

      // Alineación vertical
      if (label.baseline) {
        const baselineSelect = this.querySelector(
          `[data-style-options="${geomType}.label.baseline"]`
        );
        if (baselineSelect) {
          baselineSelect.value = label.baseline;
        }
      }

      // Rotación
      if (typeof label.rotation !== "undefined") {
        const rotationInput = this.querySelector(
          `[data-style-options="${geomType}.label.rotation"]`
        );
        if (rotationInput) {
          rotationInput.value = label.rotation;
        }
      }

      // Checkbox de rotación
      if (typeof label.rotate !== "undefined") {
        const rotateCheck = this.querySelector(
          `[data-style-options="${geomType}.label.rotate"]`
        );
        if (rotateCheck) {
          rotateCheck.checked = label.rotate;
        }
      }

      // Escala
      if (typeof label.scale !== "undefined") {
        const scaleInput = this.querySelector(
          `[data-style-options="${geomType}.label.scale"]`
        );
        if (scaleInput) {
          scaleInput.value = label.scale;
        }
      }

      // Fuente (extraer tamaño y familia)
      if (label.font) {
        const fontParts = label.font.match(/(\d+)px\s+(.+)/);
        if (fontParts) {
          const fontSize = fontParts[1];
          const fontFamily = fontParts[2];

          const fontSizeInput = this.querySelector(
            `[data-font-size-${geomType}]`
          );
          const fontFamilySelect = this.querySelector(
            `[data-font-family-${geomType}]`
          );

          if (fontSizeInput) {
            fontSizeInput.value = fontSize;
          }
          if (fontFamilySelect) {
            fontFamilySelect.value = fontFamily;
          }
        }
      }

      // Configuración de stroke/halo
      if (label.stroke) {
        const strokeApplyCheck = this.querySelector(
          `[data-apply="${geomType}.label.stroke"]`
        );

        const hasStroke =
          label.stroke.color &&
          label.stroke.color !== "no-color" &&
          label.stroke.width &&
          label.stroke.width > 0;

        if (strokeApplyCheck) {
          strokeApplyCheck.checked = hasStroke;

          const haloSections = this.querySelectorAll(
            `[data-${geomType}-halo-section]`
          );
          haloSections.forEach((section) => {
            if (hasStroke) {
              section.classList.remove("m-stylemanager-hidden");
            } else {
              section.classList.add("m-stylemanager-hidden");
            }
          });
        }

        // Color del stroke
        if (label.stroke.color && hasStroke) {
          const strokeColorInput = this.querySelector(
            `[data-style-options="${geomType}.label.stroke.color"]`
          );
          if (strokeColorInput) {
            strokeColorInput.value = safeColorConversion(
              label.stroke.color,
              "#000000"
            );
          }
        }

        // Ancho del stroke
        if (typeof label.stroke.width !== "undefined") {
          const strokeWidthInput = this.querySelector(
            `[data-style-options="${geomType}.label.stroke.width"]`
          );
          if (strokeWidthInput) {
            strokeWidthInput.value = label.stroke.width;
          }
        }

        // Line cap
        if (label.stroke.linecap) {
          const linecapSelect = this.querySelector(
            `[data-style-options="${geomType}.label.stroke.linecap"]`
          );
          if (linecapSelect) {
            linecapSelect.value = label.stroke.linecap;
          }
        }

        // Line join
        if (label.stroke.linejoin) {
          const linejoinSelect = this.querySelector(
            `[data-style-options="${geomType}.label.stroke.linejoin"]`
          );
          if (linejoinSelect) {
            linejoinSelect.value = label.stroke.linejoin;
          }
        }
      }

      // Configuración de path (para líneas principalmente)
      if (typeof label.path !== "undefined") {
        const pathCheck = this.querySelector(
          `[data-style-options="${geomType}.label.path"]`
        );
        if (pathCheck) {
          pathCheck.checked = label.path;

          // Habilitar/deshabilitar campos de textpath
          const textpathInputs = this.querySelectorAll("[data-textpath]");
          textpathInputs.forEach((input) => {
            input.disabled = !label.path;
          });
        }
      }

      // Ancho mínimo (textpath)
      if (typeof label.minwidth !== "undefined") {
        const minwidthInput = this.querySelector(
          `[data-style-options="${geomType}.label.minwidth"]`
        );
        if (minwidthInput) {
          minwidthInput.value = label.minwidth;
        }
      }

      // Suavizado (textpath)
      if (typeof label.smooth !== "undefined") {
        const smoothCheck = this.querySelector(
          `[data-style-options="${geomType}.label.smooth"]`
        );
        if (smoothCheck) {
          smoothCheck.checked = label.smooth;
        }
      }

      // Desbordamiento de texto
      if (label.textoverflow) {
        const textoverflowSelect = this.querySelector(
          `[data-style-options="${geomType}.label.textoverflow"]`
        );
        if (textoverflowSelect) {
          textoverflowSelect.value = label.textoverflow;
        }
      }

      // Desplazamiento (offset)
      if (label.offset && Array.isArray(label.offset)) {
        const offsetXInput = this.querySelector(
          `[data-style-options="${geomType}.label.offset"][data-target="${geomType}.label.offset"]`
        );
        const offsetYInput = this.querySelector(
          `[data-id="${geomType}.label.offset"]`
        );

        if (offsetXInput) {
          offsetXInput.value = label.offset[0] || 0;
        }
        if (offsetYInput) {
          offsetYInput.value = label.offset[1] || 0;
        }
      }
    });
  }

  /**
   * Actualiza la plantilla y sus valores con la capa actual
   * @function
   */
  refreshTemplate() {
    this.loadExistingLabelStyle();
  }

  /**
   * Genera los datos necesarios para la plantilla de etiquetas
   * @function
   * @return {Object}
   */
  generateTemplateData() {
    // Centralizar los valores por defecto como en SimpleCategoryBinding
    const defaultLabelData = {
      color: "#000000",
      scale: 2,
      align: "center",
      baseline: "top",
      rotate: false,
      rotation: 0,
      offset: [0, 0],
      path: false,
      minwidth: 0,
      smooth: false,
      textoverflow: "hidden",
      font: "12px serif",
      stroke: {
        color: "no-color",
        width: 0,
        linedash: [0, 0],
        linedashoffset: 0,
        linecap: "round",
        linejoin: "round",
      },
    };

    // Permitir que styleParams sobreescriba los valores por defecto
    const getLabel = (geom) => {
      let label = Object.assign({}, defaultLabelData);
      if (
        this.styleParams_ &&
        this.styleParams_[geom] &&
        this.styleParams_[geom].label
      ) {
        label = this.mergeDeep(label, this.styleParams_[geom].label);
      }
      return label;
    };

    const templateData = {
      point: { label: getLabel("point") },
      line: { label: getLabel("line") },
      polygon: { label: getLabel("polygon") },
      featuresAttr: this.getFeaturesAttributes(),
      alignlist: this.getAlignmentOptions(),
      baselinelist: this.getBaselineOptions(),
      linecaplabelstroke: this.getLineCapOptions(),
      linejoinlabelstroke: this.getLineJoinOptions(),
    };
    return templateData;
  }

  /**
   * Obtiene los atributos de las features para el select de texto
   * @function
   * @return {Array}
   */
  getFeaturesAttributes() {
    // Igual que en CategoryBinding: marcar como selected el atributo usado en styleParams
    let attributes = [];
    let selectedAttr = null;
    // Buscar el atributo seleccionado en styleParams (point, line o polygon)
    if (this.styleParams_) {
      ["point", "line", "polygon"].forEach((geom) => {
        if (
          this.styleParams_[geom] &&
          this.styleParams_[geom].label &&
          (this.styleParams_[geom].label._attributeName ||
            this.styleParams_[geom].label.text)
        ) {
          selectedAttr =
            this.styleParams_[geom].label._attributeName ||
            this.styleParams_[geom].label.text;
        }
      });
    }

    if (this.layer_ && this.layer_.getFeatures) {
      let features = this.layer_.getFeatures();
      if (features.length > 0) {
        let feature = features[0];
        let attrs = feature.getAttributes ? feature.getAttributes() : {};
        Object.keys(attrs).forEach((attr, index) => {
          attributes.push({
            id: attr,
            name: attr,
            selected: selectedAttr ? attr === selectedAttr : index === 0,
          });
        });
      }
    }
    if (attributes.length === 0) {
      attributes.push({
        id: "none",
        name: "Sin atributos disponibles",
        selected: true,
      });
    }
    return attributes;
  }

  /**
   * Obtiene las opciones de alineación horizontal
   * @function
   * @return {Array}
   */
  getAlignmentOptions() {
    return [
      { id: "left", name: "left", selected: false },
      { id: "center", name: "center", selected: true },
      { id: "right", name: "right", selected: false },
    ];
  }

  /**
   * Obtiene las opciones de alineación vertical
   * @function
   * @return {Array}
   */
  getBaselineOptions() {
    return [
      { id: "top", name: "top", selected: true },
      { id: "middle", name: "middle", selected: false },
      { id: "bottom", name: "bottom", selected: false },
    ];
  }

  /**
   * Obtiene las opciones de line cap
   * @function
   * @return {Array}
   */
  getLineCapOptions() {
    return [
      { id: "butt", name: "Butt", selected: false },
      { id: "round", name: "Round", selected: true },
      { id: "square", name: "Square", selected: false },
    ];
  }

  /**
   * Obtiene las opciones de line join
   * @function
   * @return {Array}
   */
  getLineJoinOptions() {
    return [
      { id: "miter", name: "Miter", selected: false },
      { id: "round", name: "Round", selected: true },
      { id: "bevel", name: "Bevel", selected: false },
    ];
  }

  /**
   * Merge profundo de objetos
   * @function
   * @param {Object} target
   * @param {Object} source
   * @return {Object}
   */
  mergeDeep(target, source) {
    const result = Object.assign({}, target);

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!(key in target)) Object.assign(result, { [key]: {} });
          result[key] = this.mergeDeep(target[key], source[key]);
        } else {
          Object.assign(result, { [key]: source[key] });
        }
      }
    }

    return result;
  }

  /**
   * Verifica si un valor es un objeto
   * @function
   * @param {*} item
   * @return {boolean}
   */
  isObject(item) {
    return item && typeof item === "object" && !Array.isArray(item);
  }

  /**
   * Genera el estilo de etiquetas que se puede fusionar con otros estilos
   * @function
   * @return {M.style.Generic}
   */
  generateStyle() {
    const labelOptions = this.generateOptions();
    return new M.style.Generic(labelOptions);
  }

  /**
   * Genera las opciones de estilo para las etiquetas
   * @function
   * @return {Object}
   */
  generateOptions() {
    let styleOpts = {};
    styleOpts["options"] = {};

    styleOpts["options"]["point"] = { label: {} };
    styleOpts["options"]["line"] = { label: {} };
    styleOpts["options"]["polygon"] = { label: {} };

    this.querySelectorAllForEach("[data-style-options]", (element) => {
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

      if (element.type === "range") {
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
    });

    this.processFontOptions(styleOpts["options"]);

    this.querySelectorAllForEach("[data-apply]", (element) => {
      let path = element.dataset["apply"];
      let isChecked = element.checked;

      if (!isChecked && path.includes("stroke")) {
        let colorPath = path.replace(/stroke$/, "stroke.color");
        Binding.createObj(styleOpts["options"], colorPath, "no-color");
        let widthPath = path.replace(/stroke$/, "stroke.width");
        Binding.createObj(styleOpts["options"], widthPath, 0);
      }
    });

    this.ensureLabelDefaults(styleOpts["options"]);

    // Convertir label.text en función para extraer valores de atributos
    this.convertLabelTextToFunction(styleOpts["options"]);

    return styleOpts["options"];
  }

  /**
   * Procesa las opciones de fuente que usan atributos especiales
   * @function
   * @param {Object} options
   */
  processFontOptions(options) {
    let fontSizePoint = this.querySelector("[data-font-size-point]");
    let fontFamilyPoint = this.querySelector("[data-font-family-point]");

    if (fontSizePoint && fontFamilyPoint) {
      let fontSize = parseFloat(fontSizePoint.value) || 12;
      let fontFamily = fontFamilyPoint.value || "sans-serif";
      let font = `${fontSize}px ${fontFamily}`;

      if (!options.point.label) {
        options.point.label = {};
      }
      options.point.label.font = font;
    }

    let fontSizeLine = this.querySelector("[data-font-size-line]");
    let fontFamilyLine = this.querySelector("[data-font-family-line]");

    if (fontSizeLine && fontFamilyLine) {
      let fontSize = parseFloat(fontSizeLine.value) || 12;
      let fontFamily = fontFamilyLine.value || "sans-serif";
      let font = `${fontSize}px ${fontFamily}`;

      if (!options.line.label) {
        options.line.label = {};
      }
      options.line.label.font = font;
    } else if (fontSizePoint && fontFamilyPoint) {
      let fontSize = parseFloat(fontSizePoint.value) || 12;
      let fontFamily = fontFamilyPoint.value || "sans-serif";
      let font = `${fontSize}px ${fontFamily}`;

      if (!options.line.label) {
        options.line.label = {};
      }
      options.line.label.font = font;
    }

    let fontSizePolygon = this.querySelector("[data-font-size-polygon]");
    let fontFamilyPolygon = this.querySelector("[data-font-family-polygon]");

    if (fontSizePolygon && fontFamilyPolygon) {
      let fontSize = parseFloat(fontSizePolygon.value) || 12;
      let fontFamily = fontFamilyPolygon.value || "sans-serif";
      let font = `${fontSize}px ${fontFamily}`;

      if (!options.polygon.label) {
        options.polygon.label = {};
      }
      options.polygon.label.font = font;
    } else if (fontSizePoint && fontFamilyPoint) {
      let fontSize = parseFloat(fontSizePoint.value) || 12;
      let fontFamily = fontFamilyPoint.value || "sans-serif";
      let font = `${fontSize}px ${fontFamily}`;

      if (!options.polygon.label) {
        options.polygon.label = {};
      }
      options.polygon.label.font = font;
    }
  }

  /**
   * Asegura que existan valores por defecto mínimos para las etiquetas
   * @function
   * @param {Object} options
   */
  ensureLabelDefaults(options) {
    const defaultLabel = {
      text: "",
      color: "#000000",
      scale: 2,
      align: "center",
      baseline: "top",
      rotate: false,
      rotation: 0,
      offset: [0, 0],
      path: false,
      minwidth: 0,
      smooth: false,
      textoverflow: "hidden",
      font: "12px serif",
      // stroke: {
      //   color: "no-color",
      //   width: 0,
      //   linedash: [0, 0],
      //   linedashoffset: 0,
      //   linecap: "round",
      //   linejoin: "round",
      // },
    };

    ["point", "line", "polygon"].forEach((geomType) => {
      if (!options[geomType]) {
        options[geomType] = {};
      }
      if (!options[geomType].label) {
        options[geomType].label = {};
      }

      const hasLabelConfig = Object.keys(options[geomType].label).length > 0;

      let haloActive = false;
      const haloCheckbox =
        this.querySelector &&
        this.querySelector(`[data-apply='${geomType}.label.stroke']`);
      if (haloCheckbox) {
        haloActive = haloCheckbox.checked;
      } else if (
        typeof options[geomType].label.stroke === "object" &&
        options[geomType].label.stroke.width > 0 &&
        options[geomType].label.stroke.color &&
        options[geomType].label.stroke.color !== "no-color"
      ) {
        haloActive = true;
      }

      if (hasLabelConfig) {
        options[geomType].label = Object.assign(
          {},
          defaultLabel,
          options[geomType].label
        );

        if (haloActive) {
          options[geomType].label.stroke = options[geomType].label.stroke || {
            color: "#000000",
            width: 1,
            linedash: [0, 0],
            linedashoffset: 0,
            linecap: "round",
            linejoin: "round",
          };
        } else {
          delete options[geomType].label.stroke;
        }
      }
    });
  }

  /**
   * Convierte label.text de string a función para extraer valores de atributos
   * @function
   * @param {Object} options
   */
  convertLabelTextToFunction(options) {
    ["point", "line", "polygon"].forEach((geomType) => {
      if (
        options[geomType] &&
        options[geomType].label &&
        (options[geomType].label.text || options[geomType].label._attributeName)
      ) {
        // Permitir que _attributeName tenga prioridad si existe
        const attributeName =
          options[geomType].label._attributeName ||
          options[geomType].label.text;

        // Solo convertir si es un string (nombre de atributo) y no una función
        if (
          typeof attributeName === "string" &&
          attributeName !== "" &&
          attributeName !== "none"
        ) {
          // Almacenar el nombre del atributo para poder restaurarlo en el formulario
          options[geomType].label._attributeName = attributeName;

          // Siempre crear/actualizar la función text, incluso si ya existe
          options[geomType].label.text = (feature) => {
            // Extraer el valor del atributo de la feature
            if (feature && feature.getAttribute) {
              return feature.getAttribute(attributeName) || "";
            }
            return "";
          };
        }
        // Si ya es una función pero no tiene _attributeName, intentar determinarlo
        else if (
          typeof options[geomType].label.text === "function" &&
          !options[geomType].label._attributeName
        ) {
          // Para estilos existentes, intentar determinar el atributo de las features disponibles
          const featuresAttributes = this.getFeaturesAttributes();
          // Por ahora, usar el primer atributo disponible como fallback
          if (
            featuresAttributes.length > 0 &&
            featuresAttributes[0].id !== "none"
          ) {
            options[geomType].label._attributeName = featuresAttributes[0].id;
          }
        }
      }
    });
  }

  /**
   * Sobrescribe el método de compilación de plantilla para incluir datos
   * @function
   */
  compileTemplate(template, options = {}) {
    const templateData = this.generateTemplateData();
    const mergedOptions = Object.assign({}, templateData, options);

    return super.compileTemplate(template, mergedOptions);
  }

  /**
   * Obtiene las opciones de la plantilla (requerido por el sistema de binding)
   * @function
   * @return {Object}
   */
  getOptionsTemplate() {
    let options = this.generateTemplateData();

    if (this.styleParams_) {
      options = this.mergeDeep(options, this.styleParams_);
    }

    options.featuresAttr = this.getFeaturesAttributes();
    options.alignlist = this.getAlignmentOptions();
    options.baselinelist = this.getBaselineOptions();
    options.linecaplabelstroke = this.getLineCapOptions();
    options.linejoinlabelstroke = this.getLineJoinOptions();

    const translationKeys = {
      labels: "labels",
      pointOptions: "point-options",
      lineOptions: "line-options",
      polygonOptions: "polygon-options",
      labelValue: "label-value",
      labelFont: "label-font",
      labelSize: "label-size",
      labelColor: "label-color",
      labelHalo: "label-halo",
      advancedOptions: "advanced-options",
      scale: "scale",
      align: "align",
      baseline: "baseline",
      rotationWithMap: "rotation-with-map",
      rotation: "rotation",
      offset: "offset",
      wrap: "wrap",
      minWidth: "min-width",
      smooth: "smooth",
      textOverflow: "text-overflow",
      hidden: "hidden",
      visible: "visible",
      ellipsis: "ellipsis",
      labelHaloSection: "label-halo-section",
      labelHaloColor: "label-halo-color",
      strokeSize: "stroke-size",
      linedash: "linedash",
      linedashOffset: "linedash-offset",
      lineCap: "line-cap",
      lineJoin: "line-join",
      horizontalAlign: "horizontal-align",
      verticalAlign: "vertical-align",
    };
    options.translations = Binding.getTranslations(translationKeys);

    return options;
  }

  /**
   * Agrega los event listeners específicos para la gestión de etiquetas
   * @function
   */
  addLabelEventListeners() {
    const advancedButtons = this.querySelectorAll(
      ".m-stylemanager-button-advanced-options"
    );

    if (advancedButtons.length === 0) {
      return;
    }

    this.querySelectorAllForEach(
      ".m-stylemanager-button-advanced-options",
      (element) => {
        if (element._categoryAdvancedListener) {
          element.removeEventListener(
            "click",
            element._categoryAdvancedListener
          );
        }

        element._categoryAdvancedListener = (e) => {
          const nextSibling = e.currentTarget.nextElementSibling;
          if (
            nextSibling &&
            nextSibling.classList.contains("m-stylemanager-hidden")
          ) {
            nextSibling.classList.remove("m-stylemanager-hidden");
            e.currentTarget.firstElementChild.classList.remove(
              "m-stylemanager-icons-down-open"
            );
            e.currentTarget.firstElementChild.classList.add(
              "m-stylemanager-icons-up-open"
            );
          } else if (nextSibling) {
            nextSibling.classList.add("m-stylemanager-hidden");
            e.currentTarget.firstElementChild.classList.add(
              "m-stylemanager-icons-down-open"
            );
            e.currentTarget.firstElementChild.classList.remove(
              "m-stylemanager-icons-up-open"
            );
          }
        };

        element.addEventListener("click", element._categoryAdvancedListener);
      }
    );

    this.querySelectorAllForEach(
      ".m-stylemanager-subtitle-section",
      (element) => {
        if (element._categorySectionListener) {
          element.removeEventListener(
            "click",
            element._categorySectionListener
          );
        }

        element._categorySectionListener = (e) => {
          const clss = e.currentTarget.nextElementSibling.classList.value;
          if (clss === "m-stylemanager-hidden") {
            e.currentTarget.nextElementSibling.classList.remove(
              "m-stylemanager-hidden"
            );
            e.currentTarget.firstElementChild.classList.remove(
              "m-stylemanager-icons-down-circled2"
            );
            e.currentTarget.firstElementChild.classList.add(
              "m-stylemanager-icons-up-circled2"
            );
          } else {
            e.currentTarget.nextElementSibling.classList.add(
              "m-stylemanager-hidden"
            );
            e.currentTarget.firstElementChild.classList.add(
              "m-stylemanager-icons-down-circled2"
            );
            e.currentTarget.firstElementChild.classList.remove(
              "m-stylemanager-icons-up-circled2"
            );
          }
        };

        element.addEventListener("click", element._categorySectionListener);
      }
    );

    const pointStrokeCheck = this.querySelector(
      '[data-apply="point.label.stroke"]'
    );
    if (pointStrokeCheck) {
      pointStrokeCheck.addEventListener("change", (e) => {
        const strokeInputs = this.querySelectorAll(
          '[data-style-options^="point.label.stroke."]'
        );
        strokeInputs.forEach((input) => {
          input.disabled = !e.target.checked;
        });

        const strokeWidthInput = this.querySelector(
          '[data-style-options="point.label.stroke.width"]'
        );
        if (strokeWidthInput) {
          strokeWidthInput.value =
            pointStrokeCheck.value === true ? strokeWidthInput.value || 1 : 0;
        }

        const haloSections = this.querySelectorAll("[data-point-halo-section]");
        haloSections.forEach((section) => {
          if (e.target.checked) {
            section.classList.remove("m-stylemanager-hidden");
          } else {
            section.classList.add("m-stylemanager-hidden");
          }
        });
      });
    }

    const lineStrokeCheck = this.querySelector(
      '[data-apply="line.label.stroke"]'
    );
    if (lineStrokeCheck) {
      lineStrokeCheck.addEventListener("change", (e) => {
        const strokeInputs = this.querySelectorAll(
          '[data-style-options^="line.label.stroke."]'
        );
        strokeInputs.forEach((input) => {
          input.disabled = !e.target.checked;
        });

        const strokeWidthInput = this.querySelector(
          '[data-style-options="line.label.stroke.width"]'
        );
        if (strokeWidthInput) {
          strokeWidthInput.value =
            lineStrokeCheck.value === true ? strokeWidthInput.value || 1 : 0;
        }

        const haloSections = this.querySelectorAll("[data-line-halo-section]");
        haloSections.forEach((section) => {
          if (e.target.checked) {
            section.classList.remove("m-stylemanager-hidden");
          } else {
            section.classList.add("m-stylemanager-hidden");
          }
        });
      });
    }

    const polygonStrokeCheck = this.querySelector(
      '[data-apply="polygon.label.stroke"]'
    );
    if (polygonStrokeCheck) {
      polygonStrokeCheck.addEventListener("change", (e) => {
        const strokeInputs = this.querySelectorAll(
          '[data-style-options^="polygon.label.stroke."]'
        );
        strokeInputs.forEach((input) => {
          input.disabled = !e.target.checked;
        });

        const strokeWidthInput = this.querySelector(
          '[data-style-options="polygon.label.stroke.width"]'
        );
        if (strokeWidthInput) {
          strokeWidthInput.value =
            polygonStrokeCheck.value === true ? strokeWidthInput.value || 1 : 0;
        }

        const haloSections = this.querySelectorAll(
          "[data-polygon-halo-section]"
        );
        haloSections.forEach((section) => {
          if (e.target.checked) {
            section.classList.remove("m-stylemanager-hidden");
          } else {
            section.classList.add("m-stylemanager-hidden");
          }
        });
      });
    }

    const pointPathCheck = this.querySelector(
      '[data-style-options="point.label.path"]'
    );
    if (pointPathCheck) {
      pointPathCheck.addEventListener("change", (e) => {
        const textpathInputs = this.querySelectorAll("[data-textpath]");
        textpathInputs.forEach((input) => {
          input.disabled = !e.target.checked;
        });
      });
    }

    const linePathCheck = this.querySelector(
      '[data-style-options="line.label.path"]'
    );
    if (linePathCheck) {
      linePathCheck.addEventListener("change", (e) => {
        const textpathInputs = this.querySelectorAll("[data-textpath]");
        textpathInputs.forEach((input) => {
          input.disabled = !e.target.checked;
        });
      });
    }

    const polygonPathCheck = this.querySelector(
      '[data-style-options="polygon.label.path"]'
    );
    if (polygonPathCheck) {
      polygonPathCheck.addEventListener("change", (e) => {
        const textpathInputs = this.querySelectorAll("[data-textpath]");
        textpathInputs.forEach((input) => {
          input.disabled = !e.target.checked;
        });
      });
    }

    this.initializeHaloVisibility();
  }

  /**
   * Actualiza el progreso visual de una barra de rango
   * @param {HTMLInputElement} rangeElement - El elemento input de tipo range
   */
  updateRangeProgress(rangeElement) {
    if (rangeElement && rangeElement.type === "range") {
      const min = parseFloat(rangeElement.min) || 0;
      const max = parseFloat(rangeElement.max) || 1;
      const value = parseFloat(rangeElement.value) || 0;
      const percentage = ((value - min) / (max - min)) * 100;

      rangeElement.style.setProperty("--progress", `${percentage}%`);
    }
  }

  /**
   * Inicializa la visibilidad de la sección del halo basándose en el estado del checkbox
   * @function
   */
  initializeHaloVisibility() {
    const pointStrokeCheck = this.querySelector(
      '[data-apply="point.label.stroke"]'
    );
    if (pointStrokeCheck) {
      const haloSections = this.querySelectorAll("[data-point-halo-section]");
      haloSections.forEach((section) => {
        if (pointStrokeCheck.checked) {
          section.classList.remove("m-stylemanager-hidden");
        } else {
          section.classList.add("m-stylemanager-hidden");
        }
      });
    }

    const lineStrokeCheck = this.querySelector(
      '[data-apply="line.label.stroke"]'
    );
    if (lineStrokeCheck) {
      const haloSections = this.querySelectorAll("[data-line-halo-section]");
      haloSections.forEach((section) => {
        if (lineStrokeCheck.checked) {
          section.classList.remove("m-stylemanager-hidden");
        } else {
          section.classList.add("m-stylemanager-hidden");
        }
      });
    }

    const polygonStrokeCheck = this.querySelector(
      '[data-apply="polygon.label.stroke"]'
    );
    if (polygonStrokeCheck) {
      const haloSections = this.querySelectorAll("[data-polygon-halo-section]");
      haloSections.forEach((section) => {
        if (polygonStrokeCheck.checked) {
          section.classList.remove("m-stylemanager-hidden");
        } else {
          section.classList.add("m-stylemanager-hidden");
        }
      });
    }
  }

  /**
   * Stub para compatibilidad con CategoryBinding. Actualiza el formulario si es necesario.
   */
  updateFromCategoryPanelChange() {}

  /**
   * Sincroniza el panel de etiquetas con el de categorías (stub para compatibilidad)
   */
  syncWithCategoryPanel() {}
}
