import chroma from "chroma-js";
import { Binding } from "./binding";

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
   * Controla la visibilidad de la etiqueta de la categoría
   * @param {boolean} visible
   */
  setLabelVisible(visible) {
    if (this.style_ && this.style_.setLabelVisible) {
      this.style_.setLabelVisible(visible);
    } else if (this.style_ && this.style_.label) {
      this.style_.label.visible = visible;
    } else if (this.style_ && typeof this.style_.set === "function") {
      this.style_.set("labelVisible", visible);
    }
    if (typeof this.refreshTemplate === "function") {
      this.refreshTemplate();
    }
  }

  /**
   * Permite sincronizar el formulario con los estilos actuales al seleccionar una categoría
   * @param {M.style.Simple} style
   */
  setStyle(style) {
    if (style) {
      this.style_ = style;
      this.refreshTemplate();

      // Sincronizar inputs
      const opts = style.getOptions ? style.getOptions() : {};

      // Función auxiliar para validar y convertir colores
      const safeColorConversion = (color, defaultColor = "#000000") => {
        try {
          if (!color || color === "" || color === "transparent") {
            return defaultColor;
          }
          return chroma(color).hex();
        } catch (error) {
          return defaultColor;
        }
      };

      // Relleno
      if (opts.fill && opts.fill.color) {
        const fillInput = this.querySelector(
          "[data-style-options='fill.color']"
        );
        if (fillInput) {
          const safeColor = safeColorConversion(opts.fill.color, "#e5008a");
          fillInput.value = safeColor;
        }
      }
      if (opts.fill && typeof opts.fill.opacity !== "undefined") {
        const fillOpacityRangeInput = this.querySelector(
          "[data-style-options='fill.opacity']"
        );
        const fillOpacityNumberInput = this.querySelector(
          ".m-stylemanager-number-opacity"
        );
        if (fillOpacityRangeInput)
          fillOpacityRangeInput.value = opts.fill.opacity;
        if (fillOpacityNumberInput)
          fillOpacityNumberInput.value = Math.round(opts.fill.opacity * 100);
      }
      if (opts.fill && typeof opts.fill.width !== "undefined") {
        const fillWidthInput = this.querySelector(
          "[data-style-options='fill.width']"
        );
        if (fillWidthInput) fillWidthInput.value = opts.fill.width;
      }

      // Trazo - general
      if (opts.stroke && opts.stroke.color) {
        const strokeInput = this.querySelector(
          "[data-style-options='stroke.color']"
        );
        if (strokeInput) {
          const safeColor = safeColorConversion(opts.stroke.color, "#000000");
          strokeInput.value = safeColor;
        }
      }
      if (opts.stroke && typeof opts.stroke.width !== "undefined") {
        const strokeWidthInput = this.querySelector(
          "[data-style-options='stroke.width']"
        );
        if (strokeWidthInput) strokeWidthInput.value = opts.stroke.width;
      }

      // Trazo  - lineas
      if (opts.line && opts.line.stroke && opts.line.stroke.color) {
        const lineStrokeInput = this.querySelector(
          "[data-style-options='line.stroke.color']"
        );
        if (lineStrokeInput) {
          const safeColor = safeColorConversion(
            opts.line.stroke.color,
            "#000000"
          );
          lineStrokeInput.value = safeColor;
        }
      }
      if (opts.line && typeof opts.line.stroke.width !== "undefined") {
        const lineStrokeWidthInput = this.querySelector(
          "[data-style-options='line.stroke.width']"
        );
        if (lineStrokeWidthInput)
          lineStrokeWidthInput.value = opts.line.stroke.width;
      }

      // Radio
      if (typeof opts.radius !== "undefined") {
        const radiusInput = this.querySelector("[data-style-options='radius']");
        if (radiusInput) radiusInput.value = opts.radius;
      }

      // Icono
      if (opts.icon) {
        // Icono por URL/src
        if (opts.icon.src) {
          const iconInput = this.querySelector(
            "[data-style-options='icon.src']"
          );
          if (iconInput) iconInput.value = opts.icon.src;

          // Seleccionar el radio button de URL
          const urlRadio = this.querySelector(
            'input[name="iconFormType"][value="url"]'
          );
          if (urlRadio) urlRadio.checked = true;
        }

        // Icono por forma (shape)
        if (opts.icon.form && opts.icon.form !== "NONE") {
          // Seleccionar el radio button de forma
          const formRadio = this.querySelector(
            'input[name="iconFormType"][value="form"]'
          );
          if (formRadio) formRadio.checked = true;

          // Buscar y seleccionar la forma correspondiente
          const formItem = this.querySelector(`[data-id="${opts.icon.form}"]`);
          if (formItem) {
            // Limpiar selecciones anteriores
            this.querySelectorAllForEach(
              ".m-stylemanager-grid-form-item",
              (el) => {
                el.classList.remove("selected");
              }
            );
            // Seleccionar la forma actual
            formItem.classList.add("selected");
          }
        }

        // Familia de iconos (Font Awesome, g-cartografia, etc.)
        if (opts.icon.class) {
          const iconFamilySelect = this.querySelector(
            'select[name="iconFamilyType"]'
          );
          if (iconFamilySelect) {
            // Determinar la familia basada en la clase
            if (opts.icon.class.includes("g-cartografia")) {
              iconFamilySelect.value = "g-cartografia";
            } else if (opts.icon.class.includes("fa-")) {
              iconFamilySelect.value = "font-awesome";
            }

            // Buscar y seleccionar el icono específico en la familia
            const familyItem = this.querySelector(
              `[data-id="${opts.icon.class}"]`
            );
            if (familyItem) {
              // Limpiar selecciones anteriores
              this.querySelectorAllForEach(
                ".m-stylemanager-grid-family-item",
                (el) => {
                  el.classList.remove("selected");
                }
              );
              // Seleccionar el icono actual
              familyItem.classList.add("selected");
            }
          }
        }

        // Colores de iconos
        if (opts.icon.fill) {
          const iconFillInput = this.querySelector(
            "[data-style-options='icon.fill']"
          );
          if (iconFillInput) {
            const safeColor = safeColorConversion(opts.icon.fill, "#ffffff");
            iconFillInput.value = safeColor;
          }
        }

        if (opts.icon.color) {
          const iconColorInput = this.querySelector(
            "[data-style-options='icon.color']"
          );
          if (iconColorInput) {
            const safeColor = safeColorConversion(opts.icon.color, "#e07e18");
            iconColorInput.value = safeColor;
          }
        }

        // Radio de iconos
        if (typeof opts.icon.radius !== "undefined") {
          const iconRadiusInput = this.querySelector(
            "[data-style-options='icon.radius']"
          );
          if (iconRadiusInput) iconRadiusInput.value = opts.icon.radius;
        }

        // Tamaño de iconos
        if (typeof opts.icon.fontsize !== "undefined") {
          const iconFontsizeInput = this.querySelector(
            "[data-style-options='icon.fontsize']"
          );
          if (iconFontsizeInput) iconFontsizeInput.value = opts.icon.fontsize;
        }

        // Opacidad de iconos
        if (typeof opts.icon.opacity !== "undefined") {
          const iconOpacityInput = this.querySelector(
            "[data-style-options='icon.opacity']"
          );
          if (iconOpacityInput) iconOpacityInput.value = opts.icon.opacity;
        }

        // Gradiente de iconos (checkbox)
        if (typeof opts.icon.gradient !== "undefined") {
          const iconGradientInput = this.querySelector(
            "[data-style-options='icon.gradient']"
          );
          if (iconGradientInput)
            iconGradientInput.checked = !!opts.icon.gradient;
        }

        // Rotación de iconos (checkbox)
        if (typeof opts.icon.rotate !== "undefined") {
          const iconRotateInput = this.querySelector(
            "[data-style-options='icon.rotate']"
          );
          if (iconRotateInput) iconRotateInput.checked = !!opts.icon.rotate;
        }

        // Rotación numérica de iconos
        if (typeof opts.icon.rotation !== "undefined") {
          const iconRotationInput = this.querySelector(
            "[data-style-options='icon.rotation']"
          );
          if (iconRotationInput) iconRotationInput.value = opts.icon.rotation;
        }

        // Escala de iconos
        if (typeof opts.icon.scale !== "undefined") {
          const iconScaleInput = this.querySelector(
            "[data-style-options='icon.scale']"
          );
          if (iconScaleInput) iconScaleInput.value = opts.icon.scale;
        }

        // Ancla de iconos
        if (opts.icon.anchor && Array.isArray(opts.icon.anchor)) {
          const iconAnchorInput = this.querySelector(
            "[data-style-options='icon.anchor']"
          );
          if (iconAnchorInput)
            iconAnchorInput.value = opts.icon.anchor.join(",");
        }

        // Tamaño de iconos (array)
        if (opts.icon.size && Array.isArray(opts.icon.size)) {
          const iconSizeInput = this.querySelector(
            "[data-style-options='icon.size']"
          );
          if (iconSizeInput) iconSizeInput.value = opts.icon.size[0]; // Usar primer valor
        }

        // Offset de iconos
        if (opts.icon.offset && Array.isArray(opts.icon.offset)) {
          const iconOffsetInput = this.querySelector(
            "[data-style-options='icon.offset']"
          );
          if (iconOffsetInput)
            iconOffsetInput.value = opts.icon.offset.join(",");
        }
      }

      // Campos avanzados de trazo
      if (opts.stroke) {
        // LineDash
        if (opts.stroke.linedash && Array.isArray(opts.stroke.linedash)) {
          const strokeLineDashInput = this.querySelector(
            "[data-style-options='stroke.linedash']"
          );
          if (strokeLineDashInput)
            strokeLineDashInput.value = opts.stroke.linedash.join(",");
        }

        // LineDashOffset
        if (typeof opts.stroke.linedashoffset !== "undefined") {
          const strokeLineDashOffsetInput = this.querySelector(
            "[data-style-options='stroke.linedashoffset']"
          );
          if (strokeLineDashOffsetInput)
            strokeLineDashOffsetInput.value = opts.stroke.linedashoffset;
        }

        // LineCap
        if (opts.stroke.linecap) {
          const strokeLineCapInput = this.querySelector(
            "[data-style-options='stroke.linecap']"
          );
          if (strokeLineCapInput)
            strokeLineCapInput.value = opts.stroke.linecap;
        }

        // LineJoin
        if (opts.stroke.linejoin) {
          const strokeLineJoinInput = this.querySelector(
            "[data-style-options='stroke.linejoin']"
          );
          if (strokeLineJoinInput)
            strokeLineJoinInput.value = opts.stroke.linejoin;
        }
      }

      // Campos de patrón de relleno
      if (opts.fill && opts.fill.pattern) {
        const pattern = opts.fill.pattern;

        const patternCheckbox = this.querySelector(
          "[data-apply='fill.pattern.patternflag']"
        );
        if (patternCheckbox) {
          patternCheckbox.checked = true;
        }

        // Nombre del patrón
        if (pattern.name) {
          const patternNameInput = this.querySelector(
            "[data-style-options='fill.pattern.name']"
          );
          if (patternNameInput) patternNameInput.value = pattern.name;
        }

        // Color del patrón
        if (pattern.color) {
          const patternColorInput = this.querySelector(
            "[data-style-options='fill.pattern.color']"
          );
          if (patternColorInput) {
            const safeColor = safeColorConversion(pattern.color, "#ff0000");
            patternColorInput.value = safeColor;
          }
        }

        // Tamaño del patrón
        if (typeof pattern.size !== "undefined") {
          const patternSizeInput = this.querySelector(
            "[data-style-options='fill.pattern.size']"
          );
          if (patternSizeInput) patternSizeInput.value = pattern.size;
        }

        // Espaciado del patrón
        if (typeof pattern.spacing !== "undefined") {
          const patternSpacingInput = this.querySelector(
            "[data-style-options='fill.pattern.spacing']"
          );
          if (patternSpacingInput) patternSpacingInput.value = pattern.spacing;
        }

        // Escala del patrón
        if (typeof pattern.scale !== "undefined") {
          const patternScaleInput = this.querySelector(
            "[data-style-options='fill.pattern.scale']"
          );
          if (patternScaleInput) patternScaleInput.value = pattern.scale;
        }

        // Rotación del patrón
        if (typeof pattern.rotation !== "undefined") {
          const patternRotationInput = this.querySelector(
            "[data-style-options='fill.pattern.rotation']"
          );
          if (patternRotationInput)
            patternRotationInput.value = pattern.rotation;
        }

        // Offset del patrón
        if (typeof pattern.offset !== "undefined") {
          const patternOffsetInput = this.querySelector(
            "[data-style-options='fill.pattern.offset']"
          );
          if (patternOffsetInput) patternOffsetInput.value = pattern.offset;
        }
      } else {
        // Si no hay patrón, desactivar checkbox
        const patternCheckbox = this.querySelector(
          "[data-apply='fill.pattern.patternflag']"
        );
        if (patternCheckbox) {
          patternCheckbox.checked = false;
        }
      }

      // Etiqueta
      if (opts.label && opts.label.text) {
        const labelInput = this.querySelector(
          "[data-style-options='label.text']"
        );
        if (labelInput) labelInput.value = opts.label.text;
      }

      if (opts.label && opts.label.fill && opts.label.fill.color) {
        const labelFillInput = this.querySelector(
          "[data-style-options='label.color']"
        );
        if (labelFillInput) {
          const safeColor = safeColorConversion(
            opts.label.fill.color,
            "#ff0000"
          );
          labelFillInput.value = safeColor;
        }
      }

      // Campos avanzados de etiqueta
      if (opts.label) {
        // Alineación
        if (opts.label.align) {
          const labelAlignInput = this.querySelector(
            "[data-style-options='label.align']"
          );
          if (labelAlignInput) labelAlignInput.value = opts.label.align;
        }

        // Línea base
        if (opts.label.baseline) {
          const labelBaselineInput = this.querySelector(
            "[data-style-options='label.baseline']"
          );
          if (labelBaselineInput)
            labelBaselineInput.value = opts.label.baseline;
        }

        // Rotación de etiqueta (checkbox)
        if (typeof opts.label.rotate !== "undefined") {
          const labelRotateInput = this.querySelector(
            "[data-style-options='label.rotate']"
          );
          if (labelRotateInput) labelRotateInput.checked = !!opts.label.rotate;
        }

        // Rotación numérica de etiqueta
        if (typeof opts.label.rotation !== "undefined") {
          const labelRotationInput = this.querySelector(
            "[data-style-options='label.rotation']"
          );
          if (labelRotationInput)
            labelRotationInput.value = opts.label.rotation;
        }

        // Escala de etiqueta
        if (typeof opts.label.scale !== "undefined") {
          const labelScaleInput = this.querySelector(
            "[data-style-options='label.scale']"
          );
          if (labelScaleInput) labelScaleInput.value = opts.label.scale;
        }

        // Offset de etiqueta
        if (opts.label.offset && Array.isArray(opts.label.offset)) {
          const labelOffsetInput = this.querySelector(
            "[data-style-options='label.offset']"
          );
          if (labelOffsetInput)
            labelOffsetInput.value = opts.label.offset.join(",");
        }

        // Ruta de texto (checkbox)
        if (typeof opts.label.path !== "undefined") {
          const labelPathInput = this.querySelector(
            "[data-style-options='label.path']"
          );
          if (labelPathInput) labelPathInput.checked = !!opts.label.path;
        }

        // Ancho mínimo
        if (typeof opts.label.minwidth !== "undefined") {
          const labelMinWidthInput = this.querySelector(
            "[data-style-options='label.minwidth']"
          );
          if (labelMinWidthInput)
            labelMinWidthInput.value = opts.label.minwidth;
        }

        // Suave (checkbox)
        if (typeof opts.label.smooth !== "undefined") {
          const labelSmoothInput = this.querySelector(
            "[data-style-options='label.smooth']"
          );
          if (labelSmoothInput) labelSmoothInput.checked = !!opts.label.smooth;
        }

        // Desbordamiento de texto
        if (opts.label.textoverflow) {
          const labelTextOverflowInput = this.querySelector(
            "[data-style-options='label.textoverflow']"
          );
          if (labelTextOverflowInput)
            labelTextOverflowInput.value = opts.label.textoverflow;
        }

        // Trazo de etiqueta
        if (opts.label.stroke) {
          // Color del trazo de etiqueta
          if (
            opts.label.stroke.color &&
            opts.label.stroke.color !== "no-color"
          ) {
            const labelStrokeColorInput = this.querySelector(
              "[data-style-options='label.stroke.color']"
            );
            if (labelStrokeColorInput)
              labelStrokeColorInput.value = chroma(
                opts.label.stroke.color
              ).hex();
          }

          // Ancho del trazo de etiqueta
          if (typeof opts.label.stroke.width !== "undefined") {
            const labelStrokeWidthInput = this.querySelector(
              "[data-style-options='label.stroke.width']"
            );
            if (labelStrokeWidthInput)
              labelStrokeWidthInput.value = opts.label.stroke.width;
          }

          // LineDash del trazo de etiqueta
          if (
            opts.label.stroke.linedash &&
            Array.isArray(opts.label.stroke.linedash)
          ) {
            const labelStrokeLineDashInput = this.querySelector(
              "[data-style-options='label.stroke.linedash']"
            );
            if (labelStrokeLineDashInput)
              labelStrokeLineDashInput.value =
                opts.label.stroke.linedash.join(",");
          }

          // LineDashOffset del trazo de etiqueta
          if (typeof opts.label.stroke.linedashoffset !== "undefined") {
            const labelStrokeLineDashOffsetInput = this.querySelector(
              "[data-style-options='label.stroke.linedashoffset']"
            );
            if (labelStrokeLineDashOffsetInput)
              labelStrokeLineDashOffsetInput.value =
                opts.label.stroke.linedashoffset;
          }
        }
      }

      // Update preview
      if (this.categoryName_) {
        setTimeout(() => {
          this.updatePreviewImage();
        }, 50);
      }
    }
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
      icon: this.icon_,
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
      this.geometry_ = "point";
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
    if (!this.getTemplate || !this.getTemplate()) {
      return;
    }

    let geometry = this.getGeometry();
    this.querySelectorAllForEach("[data-geometry]", (node) => {
      const geoms = node.getAttribute("data-geometry");
      if (
        geoms &&
        geoms
          .split(/[, ]/)
          .map((g) => g.trim())
          .includes(geometry)
      ) {
        node.classList.remove("m-stylemanager-hidden");
      } else {
        node.classList.add("m-stylemanager-hidden");
      }
    });
    // this.addLabelPathListener();

    if (!this.imgId_) {
      const imgs = this.getTemplate().querySelectorAll("img[data-legend-img]");
      if (imgs.length === 1) {
        this.imgId_ = imgs[0].getAttribute("data-legend-img");
      }
    }

    this.addLegendListener();
    this.addStyleChangeListeners();
    this.addLabelListener();
  }

  addLabelListener() {
    const haloCheckbox = this.querySelector("[data-apply='label.stroke']");
    const haloSections = this.getTemplate().querySelectorAll(
      "[data-halo-section]"
    );
    if (haloCheckbox && haloSections.length > 0) {
      const updateHaloVisibility = () => {
        haloSections.forEach((section) => {
          if (haloCheckbox.checked) {
            section.classList.remove("m-stylemanager-hidden");
          } else {
            section.classList.add("m-stylemanager-hidden");
          }
        });
      };
      haloCheckbox.removeEventListener(
        "change",
        haloCheckbox._haloListener || (() => {})
      );
      haloCheckbox._haloListener = updateHaloVisibility;
      haloCheckbox.addEventListener("change", updateHaloVisibility);
      updateHaloVisibility();
    }
  }

  /**
   * Agrega listeners básicos para actualizar la previsualización
   * @function
   */
  addStyleChangeListeners() {
    // Este método se mantiene para compatibilidad con refreshTemplate()
  }

  /**
   * Actualización de previsualización con debounce para mejorar rendimiento
   * @function
   */
  debouncedUpdatePreview() {
    if (this.updatePreviewTimeout_) {
      clearTimeout(this.updatePreviewTimeout_);
    }

    this.updatePreviewTimeout_ = setTimeout(() => {
      this.updatePreview();
      this.updatePreviewTimeout_ = null;
    }, 150);
  }

  /**
   * Actualiza la previsualización del estilo en tiempo real
   * @function
   */
  updatePreview() {
    const newStyle = this.generateStyleFromInputs();
    if (newStyle) {
      this.style_ = newStyle;
      this.updatePreviewImage();
      if (this.binding_ && this.binding_.updateCategoryPreview) {
        this.binding_.updateCategoryPreview(this.categoryName_, newStyle);
      }
    }
  }

  /**
   * Genera un estilo basado en los valores actuales de los inputs
   * @function
   * @return {M.style.Simple}
   */
  generateStyleFromInputs() {
    const options = this.generateOptions();
    if (!options || !options.options) return null;

    const geometry = this.getGeometry();
    const styleOptions = options.options;

    if (geometry === "line") {
      return new M.style.Line(styleOptions);
    } else if (geometry === "polygon") {
      return new M.style.Polygon(styleOptions);
    } else {
      return new M.style.Point(styleOptions);
    }
  }

  /**
   * Actualiza la imagen de previsualización en la tabla
   * @function
   */
  updatePreviewImage() {
    if (this.categoryName_ && this.style_) {
      const imgElement = document.getElementById(`img-${this.categoryName_}`);
      if (imgElement) {
        const canvas = this.generateCanvasForStyle(this.style_);
        if (canvas) {
          imgElement.src = canvas.toDataURL("image/png");
        }
      }
    }
  }

  /**
   * Genera un canvas con la representación visual del estilo
   * @function
   * @param {M.style.Simple} style
   * @return {HTMLCanvasElement}
   */
  generateCanvasForStyle(style) {
    if (!style) return null;

    const canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 24;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 24, 24);

    let opts = {};
    if (style.getOptions && typeof style.getOptions === "function") {
      opts = style.getOptions();
    } else if (style.options_) {
      opts = style.options_;
    } else if (style.fill_ || style.stroke_ || style.radius_) {
      opts = {
        fill: style.fill_
          ? {
              color: style.fill_.color || style.fill_,
              opacity: style.fill_.opacity,
            }
          : undefined,
        stroke: style.stroke_
          ? {
              color: style.stroke_.color || style.stroke_,
              width: style.stroke_.width,
            }
          : undefined,
        radius: style.radius_,
      };
    }

    if (!opts.fill && !opts.stroke && !opts.radius) {
      const currentOptions = this.generateOptions();
      if (currentOptions && currentOptions.options) {
        opts = currentOptions.options;
      }
    }

    let fillColor = "#e5008a";
    let strokeColor = "#000000";
    let strokeWidth = 1;
    let fillWidth = 3;
    let radius = 10;

    // Extraer colores de relleno
    if (opts.fill && opts.fill.color) {
      fillColor = opts.fill.color;
    }
    if (opts.fill && opts.fill.width) {
      fillWidth = opts.fill.width;
    }

    if (opts.stroke && opts.stroke.color) {
      strokeColor = opts.stroke.color;
    }
    if (opts.stroke && opts.stroke.width) {
      strokeWidth = opts.stroke.width || 1;
    }

    // Radio - verificar múltiples fuentes
    if (typeof opts.radius !== "undefined") {
      radius = opts.radius;
    } else if (opts.size && typeof opts.size === "number") {
      radius = opts.size;
    }

    let geometry = this.getGeometry ? this.getGeometry() : "point";

    ctx.save();
    if (geometry === "point") {
      // Dibujar círculo para puntos
      const drawRadius = Math.min(radius, 10); // Limitar el radio para la previsualización
      ctx.beginPath();
      ctx.arc(12, 12, drawRadius, 0, 2 * Math.PI);
      ctx.fillStyle = fillColor;
      ctx.fill();
      if (strokeWidth > 0) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
      }
    } else if (geometry === "line") {
      // Dibujar línea
      ctx.beginPath();
      ctx.moveTo(4, 12);
      ctx.lineTo(10, 6);
      ctx.lineTo(16, 12);
      ctx.lineTo(24, 6);
      ctx.strokeStyle = fillColor;
      ctx.lineWidth = Math.max(fillWidth, 2);
      ctx.stroke();
      if (strokeWidth > 0) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
      }
    } else if (geometry === "polygon") {
      ctx.beginPath();
      ctx.rect(4, 8, 16, 8);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
    ctx.restore();
    return canvas;
  }

  /**
   * Establece el nombre de la categoría para esta instancia
   * @function
   * @param {string} categoryName
   */
  setCategoryName(categoryName) {
    this.categoryName_ = categoryName;
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
  // addLabelPathListener() {
  //   let pathCheck = this.querySelector("[data-style-options='label.path']");
  //   pathCheck.addEventListener("change", () => {
  //     this.togglePathSection(!pathCheck.checked);
  //   });
  // }

  /**
   * @function
   */
  togglePathSection(flag) {
    this.querySelectorAllForEach("[data-textpath]", (element) => {
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
    let clickable = this.getParentTemplate().querySelector(
      `[data-buttons-option] input[data-apply="${option}"]`
    );
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
    let inputSection = this.getParentTemplate().querySelector(
      `[data-buttons-option] input[data-apply="${option}"]`
    );
    this.activateOption(option);
    inputSection.checked = true;
  }

  /**
   * This function sets the layer of a binding class.
   * @function
   * @param {M.layer.Vector}
   * @returns {Binding}
   */
  // activateOptionSection(option) {
  //   let clickable = this.getParentTemplate().querySelector(
  //     `[data-buttons-option] [data-label="${option}"]`
  //   );
  //   clickable.addEventListener("click", () => {
  //     this.activateOption(option);
  //   });
  // }

  /**
   * This function sets the layer of a binding class.
   * @function
   * @param {M.layer.Vector}
   * @returns {Binding}
   */
  activateOption(option) {
    let label = this.querySelectorParent(
      `[data-buttons-option] input[data-apply="${option}"]+label`
    );
    let checkbox = this.querySelectorParent(
      `[data-buttons-option] input[data-apply="${option}"]`
    );
    if (checkbox != null && checkbox.disabled === false) {
      this.activateLabel(label);
      this.displaySectionOption(option);
    }
  }

  // /**
  //  * This function sets the layer of a binding class.
  //  * @function
  //  * @param {M.layer.Vector}
  //  * @returns {Binding}
  //  */
  // activateLabel(label) {
  //   this.querySelectorAllForEachParent(`[data-selector]`, (element) => {
  //     element.classList.remove("check-active");
  //     element.classList.add("check-selected");
  //   });
  //   label.classList.add("check-active");
  //   label.classList.remove("check-selected");
  // }

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

    this.querySelectorAllForEach("[data-style-options]", (element) => {
      let path = element.dataset["styleOptions"];
      let value;

      // Manejo especial para iconos de formulario - similar a SymbolBinding
      if (path === "icon.form") {
        const selectedIcon = element.querySelector(
          ".m-stylemanager-grid-item.selected"
        );
        if (selectedIcon) {
          const iconForm = selectedIcon.getAttribute("data-id");
          if (iconForm && iconForm !== "NONE") {
            Binding.createObj(styleOpts["options"], "icon.form", iconForm);
          }
        }
        return; // Skip el procesamiento normal
      }

      // Manejo especial para familias de iconos - similar a SymbolBinding
      if (path === "icon.family") {
        const selectedFamily = element.querySelector(
          ".m-stylemanager-grid-item.selected"
        );
        if (selectedFamily) {
          const iconFamily = selectedFamily.getAttribute("data-id");
          if (iconFamily) {
            Binding.createObj(styleOpts["options"], "icon.class", iconFamily);
          }
        }
        return; // Skip el procesamiento normal
      }

      // Procesamiento normal para otros elementos
      if (path !== "icon.form" && path !== "icon.family") {
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

        // // Para elementos select, usar directamente el valor seleccionado
        // if (element.tagName.toLowerCase() === "select") {
        //   value = element.value;
        //   // Si el valor está vacío o es "Ninguno", usar undefined o null
        //   if (value === "" || value === "Ninguno") {
        //     value = undefined;
        //   }
        // }

        let target = element.dataset["target"];
        if (target !== undefined) {
          let inputTarget = this.querySelector(`[data-id="${target}"]`);
          let value2 = 0;
          if (
            inputTarget &&
            typeof inputTarget.value !== "undefined" &&
            inputTarget.value !== ""
          ) {
            value2 = parseFloat(inputTarget.value);
            if (isNaN(value2)) {
              value2 = 0;
            }
          }
          value = [value, value2];
        }
        if (element.type === "color" && (!value || value === "")) {
          value = "#000000";
        }

        // Solo sobrescribir el valor por defecto si hay un valor válido
        if (value !== undefined && value !== null && value !== "") {
          Binding.createObj(styleOpts["options"], path, value);
        }
      }
    });

    this.querySelectorAllForEach("[data-apply]", (element) => {
      let opt = element.dataset["apply"];
      if (element.checked === false) {
        Binding.createObj(styleOpts["options"], opt, undefined);
      }
    });

    let fontSizeElem = this.querySelector("[data-font-size]");
    let fontFamilyElem = this.querySelector("[data-font-family]");
    let fontSize = fontSizeElem && fontSizeElem.value ? fontSizeElem.value : 12;
    let fontFamily =
      fontFamilyElem && fontFamilyElem.value ? fontFamilyElem.value : "serif";
    let font = `${fontSize}px ${fontFamily}`;

    let iconOpts = {};

    const iconFormType = this.querySelector(
      'input[name="iconFormType"]:checked'
    );
    const isShape = iconFormType && iconFormType.value === "form";
    const isUrl = iconFormType && iconFormType.value === "url";

    const iconFamilyType = this.querySelector('select[name="iconFamilyType"]');
    const isFamily =
      iconFamilyType &&
      (iconFamilyType.value === "g-cartografia" ||
        iconFamilyType.value === "font-awesome");

    if (styleOpts["options"].icon) {
      const iconOptions = styleOpts["options"].icon;

      if (isFamily && isShape) {
        iconOpts = {
          form: iconOptions.form,
          class: iconOptions.class,
          fill: iconOptions.fill,
          color: iconOptions.color,
          fontsize: iconOptions.fontsize,
          radius: iconOptions.radius,
          anchor: iconOptions.anchor,
          scale: iconOptions.scale,
          size: iconOptions.size,
          opacity: Number(iconOptions.opacity),
          rotation: iconOptions.rotation,
          offset: iconOptions.offset,
          stroke: {
            color: iconOptions.color,
          },
          gradient: iconOptions.gradient,
          rotate: iconOptions.rotate,
        };
      } else if (isShape && !isFamily && !isUrl) {
        // Caso para forma sin familia - similar a SymbolBinding
        iconOpts = {
          form: iconOptions.form,
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
          src: iconOptions.src,
          anchor: iconOptions.anchor,
          scale: iconOptions.scale,
          size: iconOptions.size,
          offset: iconOptions.offset,
          opacity: Number(iconOptions.opacity),
          rotation: iconOptions.rotation,
          rotate: iconOptions.rotate,
        };
      }
    }

    let labelOpt;
    if (
      styleOpts["options"]["label"] != null &&
      styleOpts["options"]["label"]["text"] != null
    ) {
      labelOpt = styleOpts["options"]["label"];
    }

    styleOpts["options"] = {
      fill: styleOpts["options"].fill,
      stroke: styleOpts["options"].stroke,
      label: labelOpt,
      icon: iconOpts,
      radius: styleOpts["options"].radius,
      // line: styleOpts["options"].line,
    };

    if (this.getGeometry() === "line") {
      styleOpts["options"] = {
        fill: styleOpts["options"].fill,
        stroke: styleOpts["options"].stroke,
        label: styleOpts["options"].label,
      };

      delete styleOpts["options"]["fill"]["pattern"];
      if (Object.keys(styleOpts["options"]["fill"]).length === 0) {
        delete styleOpts["options"]["fill"];
      }
    }

    if (this.getGeometry() === "polygon") {
      const patternCheckbox = this.querySelector(
        "[data-apply='fill.pattern.patternflag']"
      );
      const patternEnabled = patternCheckbox && patternCheckbox.checked;

      if (patternEnabled && styleOpts["options"]["fill"]) {
        if (!styleOpts["options"]["fill"]["pattern"]) {
          styleOpts["options"]["fill"]["pattern"] = {};
        }
      } else if (
        !patternEnabled &&
        styleOpts["options"]["fill"] &&
        styleOpts["options"]["fill"]["pattern"]
      ) {
        delete styleOpts["options"]["fill"]["pattern"];
      }

      styleOpts["options"] = {
        fill: styleOpts["options"].fill,
        stroke: styleOpts["options"].stroke,
        label: styleOpts["options"].label,
      };
    }

    if (styleOpts["options"]["label"] != undefined) {
      styleOpts["options"]["label"]["font"] = font;
    }

    return M.utils.extends({}, styleOpts);
  }

  /**
   * @function
   */
  isChecked(option) {
    let checked = false;
    let input = this.getParentTemplate().parentElement.querySelector(
      `[data-buttons-option-category] input[data-apply='${option}'`
    );
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
    if (this.style_) {
      return this.style_;
    }
    if (
      typeof M !== "undefined" &&
      M.utils &&
      typeof M.style.utils.generateRandomGenericStyle === "function"
    ) {
      let uniqueId = undefined;
      if (this.layer_ && typeof this.getFeaturesAttributes === "function") {
        const attrs = this.getFeaturesAttributes();
        if (attrs && typeof attrs === "object") {
          const keys = Object.keys(attrs);
          if (keys.length > 0) {
            uniqueId = keys[0] + ":" + attrs[keys[0]];
          }
        }
      }
      return M.utils.generateRandomGenericStyle(uniqueId || this.getGeometry());
    }

    let style;
    let geometry = this.getGeometry();
    let styleOptions = this.generateOptions().options;
    if (!styleOptions.fill || !styleOptions.fill.color) {
      styleOptions.fill = styleOptions.fill || {};
      styleOptions.fill.color = "#e5008a";
      styleOptions.fill.opacity = 1;
    }
    if (!styleOptions.stroke || !styleOptions.stroke.color) {
      styleOptions.stroke = styleOptions.stroke || {};
      styleOptions.stroke.color = "#000000";
      styleOptions.stroke.width = 1;
    }
    if (
      geometry === "point" &&
      (!styleOptions.radius || styleOptions.radius <= 0)
    ) {
      styleOptions.radius = 10;
    }

    switch (geometry) {
      case "point":
        style = new M.style.Point(styleOptions);
        break;
      case "line":
        style = new M.style.Line(styleOptions);
        break;
      case "polygon":
        style = new M.style.Polygon(styleOptions);
        break;
      default:
        M.dialog.error("Geometría no soportada", "Error");
    }
    return style;
  }

  /**
   * This function adds the listener click event that shows the compatible sections buttons.
   * @param {string}
   * @param {string}
   */
  compatibleSectionListener(optionEnable, optionDisable) {
    let clickable = this.querySelectorParent(
      `[data-buttons-option] input[data-apply="${optionEnable}"]+label`
    );
    let input = this.querySelectorParent(
      `[data-buttons-option] input[data-apply="${optionEnable}"]`
    );
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
    let input = this.getParentTemplate().querySelector(
      `[data-buttons-option] input[data-apply="${option}"]`
    );
    let clickable = this.getParentTemplate().querySelector(
      `[data-buttons-option] input[data-apply="${option}"]+label`
    );
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
    let input = this.getParentTemplate().querySelector(
      `[data-buttons-option] input[data-apply="${option}"]`
    );
    let clickable = this.getParentTemplate().querySelector(
      `[data-buttons-option] input[data-apply="${option}"]+label`
    );
    clickable.classList.remove("check-inactive");
    input.disabled = false;
  }

  /**
   * @function
   *
   */
  getOptionsTemplate() {
    if (this.categoryName_) {
      const labelCheckbox = document.getElementById(
        `label-hide-${this.categoryName_}`
      );
      options.label = options.label || {};
      if (labelCheckbox) {
        options.label.visible = !labelCheckbox.checked;
      } else {
        options.label.visible = true;
      }
      if (!options.label.text || options.label.text === "") {
        if (this.layer_ && typeof this.getFeaturesAttributes === "function") {
          const attrs = Object.keys(this.getFeaturesAttributes());
          if (attrs.length > 0) {
            options.label.text = `{{${attrs[0]}}}`;
          }
        }
      }
    }
    let baseOptions = SimpleCategoryBinding.DEFAULT_OPTIONS_STYLE;
    if (this.style_ != null) {
      baseOptions = M.utils.extends({}, this.style_.getOptions());
      baseOptions = M.utils.extends(
        baseOptions,
        SimpleCategoryBinding.DEFAULT_OPTIONS_STYLE
      );

      if (
        this.style_.getOptions().fill &&
        this.style_.getOptions().fill.pattern &&
        this.style_.getOptions().fill.pattern.name
      ) {
        baseOptions.patternflag = true;
      }
    }

    // Crear estructura similar a SymbolBinding
    let options = {
      point: M.utils.extends({}, baseOptions),
      line: M.utils.extends({}, baseOptions),
      polygon: M.utils.extends({}, baseOptions),
      label: M.utils.extends({}, baseOptions.label),
      fill: M.utils.extends({}, baseOptions.fill),
      stroke: M.utils.extends({}, baseOptions.stroke),
      icon: M.utils.extends({}, baseOptions.icon),
      patternflag: baseOptions.patternflag,
    };

    // transform color options to hex color for value inputs color
    // options["point"]["fill"]["color"] = chroma(
    //   options["point"]["fill"]["color"]
    // ).hex();
    // options["point"]["stroke"]["color"] = chroma(
    //   options["point"]["stroke"]["color"]
    // ).hex();
    // options["line"]["fill"]["color"] = chroma(
    //   options["line"]["fill"]["color"]
    // ).hex();
    // options["line"]["stroke"]["color"] = chroma(
    //   options["line"]["stroke"]["color"]
    // ).hex();
    // options["polygon"]["fill"]["color"] = chroma(
    //   options["polygon"]["fill"]["color"]
    // ).hex();
    // options["polygon"]["stroke"]["color"] = chroma(
    //   options["polygon"]["stroke"]["color"]
    // ).hex();

    // Función auxiliar para conversiones seguras de color en el template
    const safeChromaConversion = (color, defaultColor = "#000000") => {
      try {
        if (!color || color === "" || color === "transparent") {
          return defaultColor;
        }
        return chroma(color).hex();
      } catch (error) {
        return defaultColor;
      }
    };

    options["fill"]["color"] = safeChromaConversion(
      options["fill"]["color"],
      "#e5008a"
    );
    options["stroke"]["color"] = safeChromaConversion(
      options["stroke"]["color"],
      "#000000"
    );

    if (!options["fill"]["width"]) {
      options["fill"]["width"] = 3;
    }

    options["line"]["stroke"]["color"] = safeChromaConversion(
      options["line"]["stroke"]["color"],
      "#000000"
    );

    options["label"]["color"] = safeChromaConversion(
      baseOptions["label"]["color"],
      "#000000"
    );
    options["label"]["stroke"]["color"] =
      baseOptions["label"]["stroke"]["color"] === "no-color"
        ? "no-color"
        : safeChromaConversion(
            baseOptions["label"]["stroke"]["color"],
            "#000000"
          );
    options["fill"]["pattern"]["color"] = safeChromaConversion(
      baseOptions["fill"]["pattern"]["color"],
      "#e5008a"
    );

    options["icon"]["fill"] = safeChromaConversion(
      options["icon"]["fill"],
      "#e5008a"
    );
    options["icon"]["color"] = safeChromaConversion(
      options["icon"]["color"],
      "#000000"
    );

    // Obtener valor booleanos para iconos
    options["icon"]["gradient"] = !!options["icon"]["gradient"];
    options["icon"]["rotate"] = !!options["icon"]["rotate"];
    // --

    let patternValids = Object.keys(M.style.pattern).filter(
      (name) => name != "ICON" && name != "IMAGE"
    );
    let alignValues = Object.values(M.style.align);
    let baselineValues = Object.values(M.style.baseline);
    let formValues = Object.values(M.style.form).filter((name) => name != null);

    //transform array options to data template option
    options["polygon"]["patternlist"] =
      SimpleCategoryBinding.arrayDataToTemplate(
        baseOptions["fill"]["pattern"]["name"],
        patternValids,
        patternValids
      );
    // options["point"]["linecapstroke"] =
    //   SimpleCategoryBinding.arrayDataToTemplate(
    //     baseOptions["stroke"]["linecap"],
    //     ["butt", "square", "round"],
    //     ["Extremo", "Cuadrado", "Redondeado"]
    //   );
    // options["point"]["linejoinstroke"] =
    //   SimpleCategoryBinding.arrayDataToTemplate(
    //     baseOptions["stroke"]["linejoin"],
    //     ["bevel", "miter", "round"],
    //     ["Bisel", "Inglete", "Redondeado"]
    //   );

    options["linecapstroke"] = SimpleCategoryBinding.arrayDataToTemplate(
      baseOptions["stroke"]["linecap"],
      ["butt", "square", "round"],
      ["Extremo", "Cuadrado", "Redondeado"]
    );
    options["linejoinstroke"] = SimpleCategoryBinding.arrayDataToTemplate(
      baseOptions["stroke"]["linejoin"],
      ["bevel", "miter", "round"],
      ["Bisel", "Inglete", "Redondeado"]
    );

    // options["line"]["linecapstroke"] =
    //   SimpleCategoryBinding.arrayDataToTemplate(
    //     baseOptions["stroke"]["linecap"],
    //     ["butt", "square", "round"],
    //     ["Extremo", "Cuadrado", "Redondeado"]
    //   );
    // options["line"]["linejoinstroke"] =
    //   SimpleCategoryBinding.arrayDataToTemplate(
    //     baseOptions["stroke"]["linejoin"],
    //     ["bevel", "miter", "round"],
    //     ["Bisel", "Inglete", "Redondeado"]
    //   );

    // options["polygon"]["linecapstroke"] =
    //   SimpleCategoryBinding.arrayDataToTemplate(
    //     baseOptions["stroke"]["linecap"],
    //     ["butt", "square", "round"],
    //     ["Extremo", "Cuadrado", "Redondeado"]
    //   );
    // options["polygon"]["linejoinstroke"] =
    //   SimpleCategoryBinding.arrayDataToTemplate(
    //     baseOptions["stroke"]["linejoin"],
    //     ["bevel", "miter", "round"],
    //     ["Bisel", "Inglete", "Redondeado"]
    //   );

    options["linecaplabelstroke"] = SimpleCategoryBinding.arrayDataToTemplate(
      baseOptions["label"]["stroke"]["linecap"],
      ["butt", "square", "round"],
      ["Extremo", "Cuadrado", "Redondeado"]
    );
    options["linejoinlabelstroke"] = SimpleCategoryBinding.arrayDataToTemplate(
      baseOptions["label"]["stroke"]["linejoin"],
      ["bevel", "miter", "round"],
      ["Bisel", "Inglete", "Redondeado"]
    );

    options["alignlist"] = SimpleCategoryBinding.arrayDataToTemplate(
      baseOptions["label"]["align"],
      alignValues,
      alignValues
    );
    options["baselinelist"] = SimpleCategoryBinding.arrayDataToTemplate(
      baseOptions["label"]["baseline"],
      baselineValues,
      baselineValues
    );
    options["formlist"] = SimpleCategoryBinding.arrayDataToTemplate(
      baseOptions["icon"]["form"],
      formValues,
      formValues
    );

    if (this.layer_ != null) {
      let labelTextValues = Object.keys(this.getFeaturesAttributes());
      let labelTextSelected =
        baseOptions["label"] != null ? baseOptions["label"]["text"] : "";
      if (
        (!labelTextSelected || labelTextSelected === "") &&
        labelTextValues.length > 0
      ) {
        labelTextSelected = `{{${labelTextValues[0]}}}`;
        if (!baseOptions["label"]) baseOptions["label"] = {};
        baseOptions["label"]["text"] = labelTextSelected;
      }
      options["featuresAttr"] = SimpleCategoryBinding.arrayDataToTemplate(
        labelTextSelected,
        labelTextValues.map((name) => `{{${name}}}`),
        labelTextValues
      );
    }

    // Traducciones completas como en stylesymbol
    const translationKeys = {
      options: "options",
      advancedOptions: "advanced-options",
      pointOptions: "point-options",
      lineOptions: "line-options",
      polygonOptions: "polygon-options",
      fillColor: "fill-color",
      strokeColor: "stroke-color",
      outlineThickness: "outline-thickness",
      lineThickness: "line-thickness",
      fillWidth: "fill-width",
      minWidth: "min-width",
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
      familyGCartografia: "g-cartography",
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
      labels: "labels",
      labelValue: "label-value",
      labelFont: "label-font",
      labelSize: "label-size",
      labelColor: "label-color",
      labelHalo: "label-halo",
      labelHaloSection: "label-halo-section",
      labelHaloColor: "label-halo-color",
      minWidthLabel: "min-width-label",
      smooth: "smooth",
      hidden: "hidden",
      updateStyles: "update-styles",
      generateSymbology: "generate-symbology",
      labelsByCategory: "labels-by-category",
      selectAttribute: "select-attribute",
      attributeValue: "attribute-value",
      hideSymbols: "hide-symbols",
      hideLabels: "hide-labels",
      preview: "preview",
      hideShowAllSymbols: "hide-show-all-symbols",
      hideShowAllLabels: "hide-show-all-labels",
      hideShowSymbol: "hide-show-symbol",
      hideShowLabel: "hide-show-label",
      others: "others",
      strokeSize: "stroke-size",
      horizontalAlign: "horizontal-align",
      verticalAlign: "vertical-align",
      align: "align",
      baseline: "baseline",
      wrap: "wrap",
      textOverflow: "text-overflow",
      visible: "visible",
      ellipsis: "ellipsis",
    };
    options.translations = Binding.getTranslations(translationKeys);

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
    let buttonOptions = this.getParentTemplate().querySelector(
      "[data-buttons-option]"
    );
    let funct = flag === true ? "add" : "remove";
    buttonOptions.classList[funct]("m-hidden");
  }

  addLegendListener() {
    this.querySelectorAllForEach("input,select,div.m-boxes", (element) => {
      if (element instanceof HTMLDivElement) {
        element.addEventListener("click", () => {
          this.updateStyleFromForm();
          this.refreshLegend(element);
        });
      } else {
        if (element instanceof HTMLSelectElement) {
          element.addEventListener("change", () => {
            this.updateStyleFromForm();
            this.refreshLegend(element);
          });
        } else {
          element.addEventListener("input", () => {
            this.updateStyleFromForm();
            this.refreshLegend(element);
          });
        }
      }
    });
  }

  updateStyleFromForm() {
    const geometry = this.getGeometry();
    let styleOptions = this.generateOptions().options;
    let style;
    switch (geometry) {
      case "point":
        style = new M.style.Point(styleOptions);
        break;
      case "line":
        style = new M.style.Line(styleOptions);
        break;
      case "polygon":
        style = new M.style.Polygon(styleOptions);
        break;
      default:
        style = new M.style.Point(styleOptions);
    }
    this.style_ = style;
  }

  /**
   * @function
   * @param {function}
   */
  refreshLegend(element, flag) {
    let style = this.style_;
    if (flag === true) {
      style = this.style_;
    }
    if (style != null) {
      this.style_ = style;
      style = style.clone();
      if (style instanceof M.style.Point) {
        style.set("radius", SimpleCategoryBinding.RADIUS_OPTION);
        if (style.get("icon.radius") != null) {
          style.set("icon.radius", SimpleCategoryBinding.ICON_RADIUS_OPTION);
        }
      }
      const imgElem = document.getElementById(`img-${element}`);
      if (imgElem && this.style_ && this.style_.getOptions) {
        const opts = this.style_.getOptions();
        let iconSrc = null;
        if (opts.icon && typeof opts.icon === "string") {
          iconSrc = opts.icon;
        } else if (opts.icon && opts.icon.src) {
          iconSrc = opts.icon.src;
        }
        if (
          iconSrc &&
          (/^data:image\/(png|jpeg|svg\+xml);base64,/.test(iconSrc) ||
            iconSrc.startsWith("data:image/svg+xml"))
        ) {
          imgElem.src = iconSrc;
        } else {
          const canvas = document.createElement("canvas");
          canvas.width = 24;
          canvas.height = 24;
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, 24, 24);
          let fillColor =
            opts.fill && opts.fill.color ? opts.fill.color : "#888";
          let strokeColor =
            opts.stroke && opts.stroke.color ? opts.stroke.color : "#000";
          let fillWidth =
            opts.fill && typeof opts.fill.width !== "undefined"
              ? opts.fill.width
              : 3;
          let geometry = this.getGeometry ? this.getGeometry() : "point";
          ctx.save();

          if (geometry === "point") {
            ctx.beginPath();
            ctx.arc(12, 12, 10, 0, 2 * Math.PI);
            ctx.fillStyle = fillColor;
            ctx.fill();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 1;
            ctx.stroke();
          } else if (geometry === "line") {
            ctx.beginPath();
            ctx.moveTo(4, 12);
            ctx.lineTo(10, 6);
            ctx.lineTo(16, 12);
            ctx.lineTo(24, 6);
            ctx.strokeStyle = fillColor;
            ctx.lineWidth = fillWidth;
            ctx.stroke();
          } else if (geometry === "polygon") {
            ctx.beginPath();
            ctx.rect(4, 8, 16, 8);
            ctx.fillStyle = fillColor;
            ctx.fill();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth =
              opts.stroke && opts.stroke.width ? opts.stroke.width : 1;
            ctx.stroke();
          }
          ctx.restore();
          imgElem.src = canvas.toDataURL("image/png");
        }
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

  get style() {
    return this.style_;
  }

  // /**
  //  * TODO
  //  * @const
  //  */
  // static get OPTIONS_POINT_SUBMENU() {
  //   return [
  //     {
  //       id: "fill",
  //       name: "Relleno",
  //     },
  //     {
  //       id: "stroke",
  //       name: "Trazo",
  //     },
  //     {
  //       id: "label",
  //       name: "Etiqueta",
  //     },
  //     {
  //       id: "icon",
  //       name: "Icono",
  //     },
  //     {
  //       id: "form",
  //       name: "Familia",
  //     },
  //   ];
  // }

  // /**
  //  * TODO
  //  * @const
  //  */
  // static get OPTIONS_SUBMENU() {
  //   return [
  //     {
  //       id: "fill",
  //       name: "Relleno",
  //     },
  //     {
  //       id: "stroke",
  //       name: "Trazo",
  //     },
  //     {
  //       id: "label",
  //       name: "Etiqueta",
  //     },
  //   ];
  // }

  /**
   * Array of allowed geometries.
   * @const {Array<string>}
   */
  static get GEOMETRIES() {
    return ["point", "line", "polygon"];
  }

  /**
   * @function
   */
  static arrayDataToTemplate(selected, arrayId, arrayName) {
    return arrayId.map((id, index) => {
      return {
        id: id,
        name: arrayName[index],
        selected: selected,
      };
    });
  }

  /**
   * @const
   */
  static get DEFAULT_OPTIONS_STYLE() {
    return {
      radius: 10,
      fill: {
        color: "#e5008a",
        opacity: 1,
        width: 3,
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
        width: 1,
        linedash: [0, 0],
        linedashoffset: 0,
        linecap: "round",
        linejoin: "round",
      },
      label: {
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
        stroke: {
          color: "no-color",
          width: 0,
          linedash: [0, 0],
          linedashoffset: 0,
          linecap: "round",
          linejoin: "round",
        },
      },
      line: {
        stroke: {
          color: "transparent",
          width: 0,
        },
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

    // Calcular el porcentaje
    const percentage = ((value - min) / (max - min)) * 100;

    // Aplicar el progreso usando una variable CSS personalizada
    rangeElement.style.setProperty("--progress", `${percentage}%`);
  }

  /**
   * Limpia recursos al destruir el binding
   * @function
   */
  destroy() {
    if (this.updatePreviewTimeout_) {
      clearTimeout(this.updatePreviewTimeout_);
      this.updatePreviewTimeout_ = null;
    }
    super.destroy();
  }
}
