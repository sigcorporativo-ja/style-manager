import stylecategory from "templates/stylecategory";
import stylechart from "templates/stylechart";
import stylechoropleth from "templates/stylechoropleth";
import stylecluster from "templates/stylecluster";
import styleheatmap from "templates/styleheatmap";
import stylelabel from "templates/stylelabel";
import styleproportional from "templates/styleproportional";
import stylesymbol from "templates/stylesymbol";
import { Binding } from "./binding/binding";
import { CategoryBinding } from "./binding/categorybinding";
import { ChartBinding } from "./binding/chartbinding";
import { ChoroplethBinding } from "./binding/choroplethbinding";
import { ClusterBinding } from "./binding/clusterbinding";
import { HeatmapBinding } from "./binding/heatmapbinding";
import { LabelBinding } from "./binding/labelbinding";
import { ProportionalBinding } from "./binding/proportionalbinding";
import { SymbolBinding } from "./binding/symbolbinding";

export default class BindingController {
  constructor(htmlParent) {
    this.layer_ = null;
    this.activePanel_ = null;
    this.selectedPanels_ = [];
    this.html_ = htmlParent;
    this.renderViews(null);
  }

  change(layer) {
    this.destroyViews();
    this.renderViews(layer);

    this.renderViewsPromise().then(() => {
      this.setLayer(layer);
      this.resetOptions();
      this.setCompatiblePanels();
      this.initBindings(layer);
    });
  }

  /**
   * Devuelve los estilos generados por el usuario para cada categoría
   */
  generateCategoryStyles() {
    // Accede al binding de categoría y genera los estilos actuales
    if (this.bindings_ && this.bindings_["stylecategory"]) {
      const binding = this.bindings_["stylecategory"];
      const opts = binding.generateOptionsFromBindings();
      // opts.options es el objeto { valor1: estilo1, valor2: estilo2, ... }
      return opts.options;
    }
    return {};
  }

  destroyViews() {
    Object.values(this.bindings_).forEach((binding) => binding.destroy());
  }

  renderViews(layer) {
    this.bindings_ = {};
    // Traducciones para el panel de categorías
    const translationKeys = {
      options: "options",
      attribute: "attribute",
      updateStyles: "update-styles",
      generateSymbology: "generate-symbology",
      labelsByCategory: "labels-by-category",
    };
    const translations = Binding.getTranslations(translationKeys);
    let compiledStyleCategory = stylecategory;
    if (typeof stylecategory === "function") {
      compiledStyleCategory = stylecategory({ translations });
    } else if (typeof stylecategory === "string") {
      compiledStyleCategory = stylecategory.replace(
        /{{translations\.(\w[\w-]*)}}/g,
        (m, key) => translations[key] || ""
      );
    }
    this.bindings_["stylesymbol"] = new SymbolBinding(
      stylesymbol,
      this.html_,
      "stylesymbol",
      this.getStyles(layer, M.style.Simple),
      layer,
      this
    );
    this.bindings_["stylelabel"] = new LabelBinding(
      stylelabel,
      this.html_,
      "stylelabel",
      this.getStyles(layer, M.style.Simple),
      layer,
      this
    );
    this.bindings_["styleproportional"] = new ProportionalBinding(
      styleproportional,
      this.html_,
      "styleproportional",
      this.getStyles(layer, M.style.Proportional),
      layer
    );
    this.bindings_["stylecluster"] = new ClusterBinding(
      stylecluster,
      this.html_,
      "stylecluster",
      this.getStyles(layer, M.style.Cluster),
      layer
    );
    this.bindings_["stylechoropleth"] = new ChoroplethBinding(
      stylechoropleth,
      this.html_,
      "stylechoropleth",
      this.getStyles(layer, M.style.Choropleth),
      layer
    );
    this.bindings_["styleheatmap"] = new HeatmapBinding(
      styleheatmap,
      this.html_,
      "styleheatmap",
      this.getStyles(layer, M.style.Heatmap),
      layer
    );
    this.bindings_["stylechart"] = new ChartBinding(
      stylechart,
      this.html_,
      "stylechart",
      this.getStyles(layer, M.style.Chart),
      layer
    );
    this.bindings_["stylecategory"] = new CategoryBinding(
      compiledStyleCategory,
      this.html_,
      "stylecategory",
      this.getStyles(layer, M.style.Category),
      layer,
      this
    );

    this.bindings_["stylesymbol"].getCompilePromise().then(() => {
      this.addSelectOnChangeListener();
      this.addEventSubtitle();
    });
    this.allCompilePromises_ = this.getBindings().map((binding) =>
      binding.getCompilePromise()
    );
  }

  renderViewsPromise() {
    let promises = Object.values(this.bindings_).map((binding) =>
      binding.getCompilePromise()
    );
    return Promise.all(promises);
  }

  updateValue(val) {
    document.getElementById("sliderValue").textContent = val;
  }

  setLayer(layer) {
    if (this.layer_ === null) {
      this.addActiveListener();
      this.addSelectListener();
    }
    this.layer_ = layer;

    // for (let feature of layer.getFeatures()) {
    let type;

    //   // Establece correspondencia entre tipo de feature y tipo de geometria
    if (layer.type === "MVT") {
      type = "generic";
    } else {
      switch (layer.getFeatures()[0].getGeometry().type) {
        case "Point":
        case "MultiPoint":
          type = "point";
          break;
        case "LineString":
        case "MultiLineString":
          type = "line";
          break;
        case "Polygon":
        case "MultiPolygon":
          type = "polygon";
          break;
        default:
          M.dialog.error("Geometria no soportada", "Error");
      }
    }

    //   // Establece la geometria
    //   this.setGeometry(type);

    //   // Entro si tengo una lista de puntos o que contiene puntos
    //   if (type == "point") {
    //     break;
    //   }

    this.setGeometry(type);

    // }

    //this.setGeometry("generic");
  }

  compatibleGeometry(style) {
    return BindingController.GEOMETRY_COMPATIBLE_OPTIONS[
      this.geometry_
    ].includes(style);
  }

  setGeometry(geometry) {
    this.geometry_ = geometry;
  }

  getGeometry() {
    return this.geometry_;
  }

  /**
   * Obtiene la geometría efectiva considerando estilos que pueden modificar la geometría visual
   * @returns {string} La geometría efectiva ('point', 'line', 'polygon', 'generic')
   */
  getEffectiveGeometry() {
    let baseGeometry = this.getGeometry();

    const proportionalBinding = this.selectedPanels_.includes(
      "styleproportional"
    )
      ? this.bindings_["styleproportional"]
      : null;

    if (proportionalBinding && proportionalBinding.generateStyle()) {
      return "point";
    }

    const clusterBinding = this.selectedPanels_.includes("stylecluster")
      ? this.bindings_["stylecluster"]
      : null;

    if (clusterBinding && clusterBinding.generateStyle()) {
      return "point";
    }

    return baseGeometry;
  }

  resetOptions() {
    this.deactivateAll();
    this.unselectAll();
  }

  setCompatiblePanels() {
    let styles = BindingController.GEOMETRY_COMPATIBLE_OPTIONS[this.geometry_];
    this.getKeysBindings().forEach((binding) => {
      if (styles.includes(binding)) {
        this.bindLayer(binding);
      } else {
        this.disablePanel(binding);
      }
    });
    this.deactivateAll();
  }

  addActiveListener() {
    this.getKeysBindings().forEach((binding) => {
      let bindingStyle = this.bindings_[binding];
      //let selectButton = bindingStyle.getSelectButton();
      let activeButton = bindingStyle.getActivateButton();
      let label = this.html_.querySelector(`[data-flap='${binding}']`);
      label.addEventListener("click", () => {
        //if (selectButton.disabled === false) {
        Object.values(this.bindings_).forEach((styleObj) => {
          let btn = styleObj.getActivateButton();
          btn.classList.remove("selected");
        });

        let style = activeButton.dataset.flap;
        activeButton.classList.add("selected");

        this.toggleDisplaySubmenu(
          style !== "stylesymbol" &&
            style !== "stylechoropleth" &&
            style !== "styleproportional" &&
            style !== "styleheatmap" &&
            style !== "stylecluster" &&
            style !== "stylecategory" &&
            style !== "stylelabel" &&
            style !== "stylechart"
        );
        this.showActivePanel(style);
        //}
      });
    });
  }

  addSelectListener() {
    this.getKeysBindings().forEach((binding) => {
      let bindingStyle = this.bindings_[binding];
      let selectButton = bindingStyle.getSelectButton();
      selectButton.addEventListener("change", () => {
        let style = selectButton.dataset.checkbox;
        this.toggleDisplaySubmenu(
          style !== "stylesymbol" &&
            style !== "stylechoropleth" &&
            style !== "styleproportional" &&
            style !== "styleheatmap" &&
            style !== "stylecluster" &&
            style !== "stylecategory" &&
            style !== "stylelabel" &&
            style !== "stylechart"
        );
        this.showCompatiblePanel(style);
        this.activeLastSelected(style);
      });
    });
  }

  initBindings(layer) {
    this.bindings_["stylesymbol"]
      .setGeometry(this.geometry_)
      .setLayer(this.layer_);

    this.bindings_["stylelabel"]
      .setGeometry(this.geometry_)
      .setLayer(this.layer_);

    this.bindings_["stylechart"]
      .setGeometry(this.geometry_)
      .setLayer(this.layer_);

    let styles = [layer.getStyle()];
    if (styles[0] instanceof M.style.Composite) {
      styles.push(...styles[0].getStyles());
    }
    let styleNames = styles.map((style) =>
      BindingController.parseStyleToName(style)
    );
    styleNames.forEach((style) => {
      this.showCompatiblePanel(style);
      this.activeLastSelected(style);
    });

    styles.forEach((style) => {
      this.loadSymbolConfiguration(style);
      this.loadCategoryConfiguration(style);
      this.loadChoroplethConfiguration(style);
      this.loadLabelConfiguration(style);
      this.loadChartConfiguration(style);
    });
  }

  /**
   * Carga la configuración de símbolo existente
   */
  loadSymbolConfiguration(style) {
    if (
      style &&
      style.getOptions &&
      style.getOptions().point &&
      style.getOptions().point.icon
    ) {
      const iconForm = style.getOptions().point.icon.form;
      if (iconForm) {
        const binding = this.bindings_["stylesymbol"];
        const radioFuente = binding
          .getParentTemplate()
          .querySelector(
            'input[type="radio"][name="iconFormType"][value="form"]'
          );
        if (radioFuente) {
          radioFuente.checked = true;
          radioFuente.dispatchEvent(new Event("change", { bubbles: true }));
        }

        const allIcons = binding
          .getParentTemplate()
          .querySelectorAll(".m-stylemanager-grid-form-item");
        allIcons.forEach((el) => {
          el.classList.remove("selected");
          if ((el.dataset.id || "").toUpperCase() === iconForm.toUpperCase()) {
            el.classList.add("selected");
          }
        });
      }
      const iconSrc = style.getOptions().point.icon.src;
      if (iconSrc) {
        const binding = this.bindings_["stylesymbol"];
        const radioUrl = binding
          .getParentTemplate()
          .querySelector(
            'input[type="radio"][name="iconFormType"][value="url"]'
          );
        if (radioUrl) {
          radioUrl.checked = true;
          radioUrl.dispatchEvent(new Event("change", { bubbles: true }));
        }
        const urlInput = binding
          .getParentTemplate()
          .querySelector('input[data-style-options="point.icon.src"]');
        if (urlInput) {
          urlInput.value = iconSrc;
          urlInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }

      // Iconos
      const iconClass = style.getOptions().point.icon.class;
      if (iconClass) {
        const binding = this.bindings_["stylesymbol"];
        const radioFuente = binding
          .getParentTemplate()
          .querySelector(
            'input[type="radio"][name="iconFormType"][value="form"]'
          );
        if (radioFuente) {
          radioFuente.checked = true;
          radioFuente.dispatchEvent(new Event("change", { bubbles: true }));
        }

        const allFamilies = binding
          .getParentTemplate()
          .querySelectorAll(".m-stylemanager-grid-family-item");
        allFamilies.forEach((el) => {
          el.classList.remove("selected");
          if ((el.dataset.id || "").toLowerCase() === iconClass.toLowerCase()) {
            el.classList.add("selected");
          }
        });

        const selectFamily = binding
          .getParentTemplate()
          .querySelector("#icon-family-select");
        if (selectFamily) {
          if (iconClass.startsWith("g-cartografia")) {
            selectFamily.value = "g-cartografia";
          } else if (iconClass.startsWith("fa")) {
            selectFamily.value = "font-awesome";
          }
          selectFamily.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    }
  }

  /**
   * Carga la configuración de categoría existente
   */
  loadCategoryConfiguration(style) {
    if (style instanceof M.style.Category) {
      const categoryBinding = this.bindings_["stylecategory"];
      if (categoryBinding && style.getAttributeName && style.getOptions) {
        const attributeName = style.getAttributeName();
        const categoryOptions = style.getOptions();

        // Esperar a que el binding esté listo
        categoryBinding.getCompilePromise().then(() => {
          this.applyCategoryStyleFromExisting(
            categoryBinding,
            attributeName,
            categoryOptions
          );
        });
      }
    }
  }

  /**
   * Carga la configuración de choropletas existente
   */
  loadChoroplethConfiguration(style) {
    if (style instanceof M.style.Choropleth) {
      const choroplethBinding = this.bindings_["stylechoropleth"];
      if (
        choroplethBinding &&
        style.getAttributeName &&
        style.getQuantification
      ) {
        // Esperar a que el binding esté listo
        choroplethBinding.getCompilePromise().then(() => {
          // Establecer el atributo seleccionado
          const attributeName = style.getAttributeName();
          const selectElement = choroplethBinding.querySelector(
            "[data-options='attributeName']"
          );
          if (selectElement && attributeName) {
            selectElement.value = attributeName;
            selectElement.dispatchEvent(new Event("change", { bubbles: true }));
          }

          // Establecer el algoritmo de cuantificación
          const quantification = style.getQuantification();
          const quantSelectElement = choroplethBinding.querySelector(
            "[data-options='quantification']"
          );
          if (quantSelectElement && quantification) {
            let quantValue = "JENKS"; // valor por defecto
            if (quantification.name === "quantile") {
              quantValue = "QUANTILE";
            } else if (quantification.name === "jenks") {
              quantValue = "JENKS";
            }
            quantSelectElement.value = quantValue;
            quantSelectElement.dispatchEvent(
              new Event("change", { bubbles: true })
            );
          }

          // Establecer el número de rangos
          const choroplethStyles = style.getChoroplethStyles();
          if (choroplethStyles && choroplethStyles.length > 0) {
            const rangesElement = choroplethBinding.querySelector(
              "[data-options='ranges']"
            );
            if (rangesElement) {
              rangesElement.value = choroplethStyles.length;
              rangesElement.dispatchEvent(
                new Event("input", { bubbles: true })
              );
            }

            // Establecer los colores inicial y final
            try {
              const startColor =
                choroplethStyles[0].get("fill.color") ||
                choroplethStyles[0].get("stroke.color") ||
                "#F8FF25";
              const endColor =
                choroplethStyles[choroplethStyles.length - 1].get(
                  "fill.color"
                ) ||
                choroplethStyles[choroplethStyles.length - 1].get(
                  "stroke.color"
                ) ||
                "#4400FD";

              const startColorElement = choroplethBinding.querySelector(
                'input[type="color"][data-array-options="colors"]:first-of-type'
              );
              const endColorElement = choroplethBinding.querySelector(
                'input[type="color"][data-array-options="colors"]:last-of-type'
              );

              if (startColorElement && startColor) {
                startColorElement.value = startColor;
                startColorElement.dispatchEvent(
                  new Event("change", { bubbles: true })
                );
              }

              if (endColorElement && endColor) {
                endColorElement.value = endColor;
                endColorElement.dispatchEvent(
                  new Event("change", { bubbles: true })
                );
              }
            } catch (error) {
              // Error silencioso al cargar colores
            }
          }
        });
      }
    }
  }

  /**
   * Carga la configuración de etiquetas existente
   */
  loadLabelConfiguration(style) {
    if (style && this.bindings_["stylelabel"]) {
      const labelBinding = this.bindings_["stylelabel"];
      if (labelBinding.loadExistingLabelStyle) {
        labelBinding.loadExistingLabelStyle();
      }
    }
  }

  /**
   * Carga la configuración de gráfico estadístico existente
   */
  loadChartConfiguration(style) {
    const styleToCheck = style || (this.layer_ ? this.layer_.getStyle() : null);

    if (styleToCheck && this.isStatisticalStyleOptions(styleToCheck)) {
      const chartBinding = this.bindings_["stylechart"];
      if (chartBinding && chartBinding.loadExistingChartStyle) {
        chartBinding.loadExistingChartStyle();
      }

      setTimeout(() => {
        const chartCheckbox = this.html_.querySelector(
          '[data-checkbox="stylechart"]'
        );

        if (chartCheckbox && !chartCheckbox.checked) {
          chartCheckbox.checked = true;

          const changeEvent = new Event("change", { bubbles: true });
          chartCheckbox.dispatchEvent(changeEvent);
        }
      }, 100);
    }
  }

  /**
   * Verifica si las opciones de estilo corresponden a un gráfico estadístico
   * @function
   * @param {Object} styleOpts
   * @return {boolean}
   */
  isStatisticalStyleOptions(styleOpts) {
    return BindingController.isStatisticalStyleOptions(styleOpts);
  }

  /**
   * Aplica un estilo de categoría existente al formulario
   */
  applyCategoryStyleFromExisting(
    categoryBinding,
    attributeName,
    categoryOptions
  ) {
    if (!categoryBinding || !attributeName || !categoryOptions) {
      return;
    }

    if (!categoryBinding.style_) {
      const tempStyle = new M.style.Category(attributeName, categoryOptions);
      categoryBinding.style_ = tempStyle;
    }

    const selectElement = categoryBinding.querySelector(
      "[data-options='attributeName']"
    );

    if (selectElement) {
      selectElement.value = attributeName;
      selectElement.dataset.previousValue = attributeName;
      categoryBinding.lastSelectedAttribute_ = attributeName;
      selectElement.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  /**
   * Aplica los estilos de categoría existentes a los bindings
   */
  applyCategoryStyles(categoryBinding, categoryOptions) {
    if (typeof categoryBinding.generateStyleInternal === "function") {
      categoryBinding.updatedStyle_ = categoryBinding.generateStyleInternal();
    }

    if (typeof categoryBinding.saveCurrentStyles === "function") {
      categoryBinding.saveCurrentStyles();
    }
  }

  /**
   * Carga la configuración de un estilo existente en el formulario correspondiente
   * @param {Object} style - El estilo a cargar
   */
  loadExistingStyleConfiguration(style) {
    if (!style) return;

    if (
      style instanceof M.style.Simple ||
      (style.getOptions &&
        style.getOptions().point &&
        style.getOptions().point.icon)
    ) {
      this.loadSymbolStyleConfiguration(style);
    }

    if (style instanceof M.style.Category) {
      this.loadCategoryStyleConfiguration(style);
    }
  }

  /**
   * Carga la configuración de símbolos existente
   * @param {Object} style - El estilo de símbolo
   */
  loadSymbolStyleConfiguration(style) {
    if (
      style &&
      style.getOptions &&
      style.getOptions().point &&
      style.getOptions().point.icon
    ) {
      const iconForm = style.getOptions().point.icon.form;
      if (iconForm) {
        const binding = this.bindings_["stylesymbol"];
        const radioFuente = binding
          .getParentTemplate()
          .querySelector(
            'input[type="radio"][name="iconFormType"][value="form"]'
          );
        if (radioFuente) {
          radioFuente.checked = true;
          radioFuente.dispatchEvent(new Event("change", { bubbles: true }));
        }

        const allIcons = binding
          .getParentTemplate()
          .querySelectorAll(".m-stylemanager-grid-form-item");
        allIcons.forEach((el) => {
          el.classList.remove("selected");
          if ((el.dataset.id || "").toUpperCase() === iconForm.toUpperCase()) {
            el.classList.add("selected");
          }
        });
      }
      const iconSrc = style.getOptions().point.icon.src;
      if (iconSrc) {
        const binding = this.bindings_["stylesymbol"];
        const radioUrl = binding
          .getParentTemplate()
          .querySelector(
            'input[type="radio"][name="iconFormType"][value="url"]'
          );
        if (radioUrl) {
          radioUrl.checked = true;
          radioUrl.dispatchEvent(new Event("change", { bubbles: true }));
        }
        const urlInput = binding
          .getParentTemplate()
          .querySelector('input[data-style-options="point.icon.src"]');
        if (urlInput) {
          urlInput.value = iconSrc;
          urlInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }

      // Iconos
      const iconClass = style.getOptions().point.icon.class;
      if (iconClass) {
        const binding = this.bindings_["stylesymbol"];
        const radioFuente = binding
          .getParentTemplate()
          .querySelector(
            'input[type="radio"][name="iconFormType"][value="form"]'
          );

        if (radioFuente) {
          radioFuente.checked = true;
          radioFuente.dispatchEvent(new Event("change", { bubbles: true }));
        }

        const allFamilies = binding
          .getParentTemplate()
          .querySelectorAll(".m-stylemanager-grid-family-item");
        allFamilies.forEach((el) => {
          el.classList.remove("selected");
          if ((el.dataset.id || "").toLowerCase() === iconClass.toLowerCase()) {
            el.classList.add("selected");
          }
        });

        const selectFamily = binding
          .getParentTemplate()
          .querySelector("#icon-family-select");
        if (selectFamily) {
          if (iconClass.startsWith("g-cartografia")) {
            selectFamily.value = "g-cartografia";
          } else if (iconClass.startsWith("fa")) {
            selectFamily.value = "font-awesome";
          }
          selectFamily.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    }

    if (style instanceof M.style.Category) {
      const categoryBinding = this.bindings_["stylecategory"];
      if (categoryBinding && style.getAttributeName && style.getOptions) {
        const attributeName = style.getAttributeName();
        const categoryOptions = style.getOptions();

        categoryBinding.getCompilePromise().then(() => {
          this.loadCategoryStyleFromExisting(
            categoryBinding,
            attributeName,
            categoryOptions
          );
        });
      }
    }
  }

  /**
   * Carga un estilo de categoría existente en el formulario
   * @param {CategoryBinding} categoryBinding
   * @param {string} attributeName
   * @param {Object} categoryOptions
   */
  loadCategoryStyleFromExisting(
    categoryBinding,
    attributeName,
    categoryOptions
  ) {
    if (!categoryBinding || !attributeName || !categoryOptions) {
      return;
    }

    const selectElement = categoryBinding.querySelector(
      "[data-options='attributeName']"
    );

    if (selectElement) {
      selectElement.value = attributeName;
      selectElement.dataset.previousValue = attributeName;
      categoryBinding.lastSelectedAttribute_ = attributeName;

      selectElement.dispatchEvent(new Event("input", { bubbles: true }));

      setTimeout(() => {
        this.applyCategoryStyles(categoryBinding, categoryOptions);
      }, 200);
    }
  }

  getStyles(layer, styleType) {
    let styleBinding = null;
    if (layer != null) {
      let style = layer.getStyle();

      if (style instanceof styleType) {
        styleBinding = style;
      } else if (style instanceof M.style.Composite) {
        let styles = style.getStyles();
        styleBinding = styles.find((style) => style instanceof styleType);
      }
    }
    return styleBinding;
  }

  getStyle() {
    let style;
    if (this.getSelectedPanels().length === 0) {
      M.dialog.info("Debe elegir al menos un estilo", "Elija estilo");
    } else if (this.getSelectedPanels().length === 1) {
      style = this.getSelectedPanels()[0].generateStyle();
    } else {
      const categoryBinding = this.selectedPanels_.includes("stylecategory")
        ? this.bindings_["stylecategory"]
        : null;
      const symbolBinding = this.selectedPanels_.includes("stylesymbol")
        ? this.bindings_["stylesymbol"]
        : null;
      const labelBinding = this.selectedPanels_.includes("stylelabel")
        ? this.bindings_["stylelabel"]
        : null;

      if (categoryBinding && labelBinding) {
        let categoryStyle = categoryBinding.generateStyle();

        if (!categoryStyle) {
          const categoryOptions = categoryBinding.generateOptionsFromBindings();
          if (categoryOptions && categoryOptions.length > 0) {
            categoryStyle = new M.style.Category(
              categoryOptions[0].name,
              categoryOptions
            );
          }
        }

        if (categoryStyle && categoryStyle instanceof M.style.Category) {
          const labelOptions = labelBinding.generateOptions();

          const attributeName = categoryStyle.getAttributeName();
          let categories = {};

          if (typeof categoryStyle.getCategories === "function") {
            categories = categoryStyle.getCategories();
          } else if (categoryStyle.categoryStyles_) {
            categories = categoryStyle.categoryStyles_;
          }

          if (!categories || Object.keys(categories).length === 0) {
            const categoryOptions =
              categoryBinding.generateOptionsFromBindings();
            if (categoryOptions && categoryOptions.length > 0) {
              categoryOptions.forEach((catOption) => {
                if (catOption.value && catOption.options) {
                  categories[catOption.value] = new M.style.Generic(
                    catOption.options
                  );
                }
              });
            }
          }

          const fusedCategories = {};
          Object.keys(categories).forEach((categoryValue) => {
            const categoryStyleObj = categories[categoryValue];

            if (categoryStyleObj) {
              const effectiveGeometry = this.getEffectiveGeometry();

              const labelConfig = this.getLabelConfigForGeometry(
                labelOptions,
                effectiveGeometry
              );

              if (labelConfig) {
                categoryStyleObj.options_.label = labelConfig;
              }

              fusedCategories[categoryValue] = categoryStyleObj;
            }
          });
          style = new M.style.Category(attributeName, fusedCategories);
        } else {
          let mainStyle = this.getMainStyle();
          let styles = this.getIndividualStyles();
          if (mainStyle && mainStyle.add) {
            mainStyle.add(styles);
            style = mainStyle;
          } else {
            style = this.getSelectedPanels()[0].generateStyle();
          }
        }
      }

      if (symbolBinding && labelBinding && !categoryBinding) {
        const symbolOptions = symbolBinding.generateOptions();
        const labelOptions = labelBinding.generateOptions();
        const effectiveGeometry = this.getEffectiveGeometry();

        const labelConfig = this.getLabelConfigForGeometry(
          labelOptions,
          effectiveGeometry
        );

        if (labelConfig) {
          if (effectiveGeometry === "point") {
            symbolOptions.point = symbolOptions.point || {};
            symbolOptions.point.label = labelConfig;
          } else if (effectiveGeometry === "line") {
            symbolOptions.line = symbolOptions.line || {};
            symbolOptions.line.label = labelConfig;
          } else if (effectiveGeometry === "polygon") {
            symbolOptions.polygon = symbolOptions.polygon || {};
            symbolOptions.polygon.label = labelConfig;
          }
        }

        let mainStyle = this.getMainStyle();
        if (mainStyle && mainStyle.add) {
          const symbolWithLabelStyle = new M.style.Generic(symbolOptions);
          const otherStyles = this.getIndividualStyles().filter(
            (s) =>
              !(s instanceof M.style.Generic) && !(s instanceof M.style.Simple)
          );
          mainStyle.add([symbolWithLabelStyle, ...otherStyles]);
          style = mainStyle;
        } else {
          style = new M.style.Generic(symbolOptions);
        }
      } else {
        let mainStyle = this.getMainStyle();
        let styles = this.getIndividualStyles();
        if (mainStyle && mainStyle.add) {
          mainStyle.add(styles);
          style = mainStyle;
        } else {
          style = this.getSelectedPanels()[0].generateStyle();
        }
      }
    }

    const labelBinding = this.selectedPanels_.includes("stylelabel")
      ? this.bindings_["stylelabel"]
      : null;
    const labelCategoryBinding = document.getElementById(
      "category-labels-toggle"
    );

    if (!labelBinding && !labelCategoryBinding.checked) {
      this.removeLabelsFromStyle(style);
    }

    return style;
  }

  /**
   * Elimina recursivamente las propiedades de etiqueta de un objeto de estilo.
   * @param {M.style.Base} style - El estilo a limpiar.
   */
  removeLabelsFromStyle(style) {
    if (!style) return;

    if (style instanceof M.style.Cluster) {
      return;
    }

    if (style instanceof M.style.Composite && style.getStyles) {
      style.getStyles().forEach((s) => this.removeLabelsFromStyle(s));
    }

    if (style instanceof M.style.Category) {
      const categories = style.getCategories
        ? style.getCategories()
        : style.categoryStyles_ || {};
      Object.values(categories).forEach((s) => this.removeLabelsFromStyle(s));
    }

    if (style.getOptions && typeof style.getOptions === "function") {
      const options = style.getOptions();
      if (options) {
        for (const geomType of ["point", "line", "polygon"]) {
          if (options[geomType] && options[geomType].label) {
            delete options[geomType].label;
          }
        }
        if (options.label) {
          delete options.label;
        }
      }
    }
  }

  /**
   * Obtiene la configuración de etiqueta específica para la geometría de la capa
   * @param {Object} labelOptions - Las opciones de etiqueta generadas
   * @param {string} layerGeometry - La geometría de la capa ('point', 'line', 'polygon', 'generic')
   * @returns {Object|null} La configuración de etiqueta para la geometría específica
   */
  getLabelConfigForGeometry(labelOptions, layerGeometry) {
    if (!labelOptions || !layerGeometry) {
      return null;
    }

    switch (layerGeometry) {
      case "point":
        return labelOptions.point && labelOptions.point.label
          ? labelOptions.point.label
          : null;
      case "line":
        return labelOptions.line && labelOptions.line.label
          ? labelOptions.line.label
          : null;
      case "polygon":
        return labelOptions.polygon && labelOptions.polygon.label
          ? labelOptions.polygon.label
          : null;
      case "generic":
        if (labelOptions.point && labelOptions.point.label) {
          return labelOptions.point.label;
        } else if (labelOptions.line && labelOptions.line.label) {
          return labelOptions.line.label;
        } else if (labelOptions.polygon && labelOptions.polygon.label) {
          return labelOptions.polygon.label;
        }
        return null;
      default:
        return null;
    }
  }

  /**
   * Fusiona las opciones de estilo de manera segura
   * @param {Object} sourceOptions - Las opciones de origen (ej. símbolo)
   * @param {Object} targetOptions - Las opciones de destino (ej. proporcional/cluster)
   * @returns {Object} Las opciones fusionadas
   */
  mergeStyleOptions(sourceOptions, targetOptions) {
    if (!sourceOptions || !targetOptions) {
      return targetOptions || sourceOptions || {};
    }

    function deepMerge(src, tgt) {
      const result = Array.isArray(tgt) ? tgt.slice() : Object.assign({}, tgt);
      for (const key in src) {
        if (key === "label") {
          if (!(key in result)) {
            result[key] = src[key];
          }
        } else if (
          src[key] &&
          typeof src[key] === "object" &&
          !Array.isArray(src[key]) &&
          tgt[key]
        ) {
          result[key] = deepMerge(src[key], tgt[key]);
        } else {
          result[key] = src[key];
        }
      }
      return result;
    }

    const merged = Object.assign({}, targetOptions);
    ["point", "line", "polygon"].forEach((geomType) => {
      if (sourceOptions[geomType]) {
        if (!merged[geomType]) {
          merged[geomType] = JSON.parse(
            JSON.stringify(sourceOptions[geomType])
          );
        } else {
          merged[geomType] = deepMerge(
            sourceOptions[geomType],
            merged[geomType]
          );
        }
      }
    });
    Object.keys(sourceOptions).forEach((key) => {
      if (["point", "line", "polygon"].indexOf(key) === -1) {
        merged[key] = sourceOptions[key];
      }
    });
    return merged;
  }

  /**
   * Verifica si un valor está vacío o es inválido
   * @param {*} value - El valor a verificar
   * @returns {boolean} True si el valor está vacío o es inválido
   */
  isEmptyValue(value) {
    return (
      value === "" ||
      value === null ||
      value === undefined ||
      (typeof value === "number" && isNaN(value)) ||
      (typeof value === "string" && value.trim() === "")
    );
  }

  getSelectedPanels() {
    return this.selectedPanels_.map((selected) => this.bindings_[selected]);
  }

  getMainStyle() {
    const selectedStyles = this.getSelectedPanels().map((binding) =>
      binding.generateStyle()
    );

    const cluster = selectedStyles.find(
      (style) => style instanceof M.style.Cluster
    );
    if (cluster) {
      return cluster;
    }

    const proportional = selectedStyles.find(
      (style) => style instanceof M.style.Proportional
    );
    if (proportional) {
      return proportional;
    }

    return selectedStyles.find((style) => style instanceof M.style.Composite);
  }

  getIndividualStyles() {
    let mainStyle = this.getMainStyle();
    return this.getSelectedPanels()
      .filter((style) => style != null)
      .map((binding) => binding.generateStyle())
      .filter((style) => !style.equals(mainStyle));
  }

  getKeysBindings() {
    return Object.keys(this.bindings_);
  }

  addSelectOnChangeListener() {
    this.bindings_["stylesymbol"].querySelectorAllForEach("*", (element) => {
      element.addEventListener("click", () => {
        this.addSelectedPanel("stylesymbol");
      });
    });
  }

  addEventSubtitle() {
    this.bindings_["stylesymbol"].querySelectorAllForEach(
      ".m-stylemanager-subtitle-section",
      (element) => {
        element.addEventListener("click", (e) => {
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
        });
      }
    );

    this.bindings_["stylesymbol"].querySelectorAllForEach(
      ".m-stylemanager-button-advanced-options",
      (element) => {
        element.addEventListener("click", (e) => {
          const clss = e.currentTarget.nextElementSibling.classList.value;
          if (clss === "m-stylemanager-hidden") {
            e.currentTarget.nextElementSibling.classList.remove(
              "m-stylemanager-hidden"
            );
            e.currentTarget.firstElementChild.classList.remove(
              "m-stylemanager-icons-down-open"
            );
            e.currentTarget.firstElementChild.classList.add(
              "m-stylemanager-icons-up-open"
            );
          } else {
            e.currentTarget.nextElementSibling.classList.add(
              "m-stylemanager-hidden"
            );
            e.currentTarget.firstElementChild.classList.add(
              "m-stylemanager-icons-down-open"
            );
            e.currentTarget.firstElementChild.classList.remove(
              "m-stylemanager-icons-up-open"
            );
          }
        });
      }
    );

    this.bindings_["stylesymbol"].querySelectorAllForEach(
      ".m-stylemanager-range-opacity",
      (element) => {
        element.addEventListener("input", (e) => {
          e.currentTarget.nextElementSibling.value = Math.round(
            e.currentTarget.value * 100
          );
        });
      }
    );

    this.bindings_["stylesymbol"].querySelectorAllForEach(
      ".m-stylemanager-number-opacity",
      (element) => {
        element.addEventListener("input", (e) => {
          e.currentTarget.previousElementSibling.value =
            e.currentTarget.value / 100;
        });
      }
    );

    this.bindings_["stylesymbol"].querySelectorAllForEach(
      ".m-stylemanager-grid-form-item",
      (element) => {
        element.addEventListener("click", (e) => {
          this.bindings_["stylesymbol"]
            .querySelectorAll(".m-stylemanager-grid-form-item")
            .forEach((el) => {
              el.classList.remove("selected");
            });
          e.currentTarget.classList.add("selected");
        });
      }
    );

    this.bindings_["stylesymbol"].querySelectorAllForEach(
      ".m-stylemanager-grid-family-item",
      (element) => {
        element.addEventListener("click", (e) => {
          this.bindings_["stylesymbol"]
            .querySelectorAll(".m-stylemanager-grid-family-item")
            .forEach((el) => {
              el.classList.remove("selected");
            });
          e.currentTarget.classList.add("selected");
        });
      }
    );

    const iconFamilySelect = this.bindings_["stylesymbol"].querySelector(
      "#icon-family-select"
    );
    const iconFamilyContainer = this.bindings_["stylesymbol"].querySelector(
      "#icon-family-container"
    );
    if (iconFamilySelect) {
      const gCartografiaContainer = this.bindings_["stylesymbol"].querySelector(
        "#icon-family-gcartografia"
      );
      const fontAwesomeContainer = this.bindings_["stylesymbol"].querySelector(
        "#icon-family-fontawesome"
      );
      const optionsFamily = this.bindings_["stylesymbol"].querySelector(
        "#icon-family-option"
      );

      const updateIconVisibility = () => {
        const selectedValue = iconFamilySelect.value;
        gCartografiaContainer.classList.add("m-stylemanager-hidden");
        fontAwesomeContainer.classList.add("m-stylemanager-hidden");
        optionsFamily.classList.add("m-stylemanager-hidden");

        if (selectedValue === "g-cartografia") {
          gCartografiaContainer.classList.remove("m-stylemanager-hidden");
          optionsFamily.classList.remove("m-stylemanager-hidden");
        } else if (selectedValue === "font-awesome") {
          fontAwesomeContainer.classList.remove("m-stylemanager-hidden");
          optionsFamily.classList.remove("m-stylemanager-hidden");
        }
      };

      iconFamilySelect.addEventListener("change", updateIconVisibility);
      updateIconVisibility();
    }

    const iconFormSelect = this.bindings_["stylesymbol"].querySelectorAll(
      'input[name="iconFormType"]'
    );
    if (iconFormSelect) {
      const formContainer = this.bindings_["stylesymbol"].querySelector(
        "#icon-form-container"
      );
      const formUrlInput =
        this.bindings_["stylesymbol"].querySelector("#icon-form-input");
      const optionsForm =
        this.bindings_["stylesymbol"].querySelector("#icon-form-option");
      const optionsForm2 =
        this.bindings_["stylesymbol"].querySelector("#icon-form-option2");
      const optionsImg =
        this.bindings_["stylesymbol"].querySelector("#icon-img-option");
      const optionsUrl =
        this.bindings_["stylesymbol"].querySelector("#icon-url-option");

      const gCartografiaContainer = this.bindings_["stylesymbol"].querySelector(
        "#icon-family-gcartografia"
      );
      const fontAwesomeContainer = this.bindings_["stylesymbol"].querySelector(
        "#icon-family-fontawesome"
      );

      const updateIconVisibility = () => {
        formContainer.classList.add("m-stylemanager-hidden");
        formUrlInput.classList.add("m-stylemanager-hidden");
        optionsForm.classList.add("m-stylemanager-hidden");
        optionsForm2.classList.add("m-stylemanager-hidden");
        optionsImg.classList.add("m-stylemanager-hidden");
        optionsUrl.classList.add("m-stylemanager-hidden");

        const checkedInputs = this.bindings_["stylesymbol"].querySelector(
          'input[name="iconFormType"]:checked'
        );

        if (checkedInputs !== null && checkedInputs.value === "form") {
          formContainer.classList.remove("m-stylemanager-hidden");
          optionsForm.classList.remove("m-stylemanager-hidden");
          optionsForm2.classList.remove("m-stylemanager-hidden");
          optionsImg.classList.remove("m-stylemanager-hidden");
          iconFamilyContainer.classList.remove("m-stylemanager-hidden");
          if (iconFamilySelect) {
            if (iconFamilySelect.value === "g-cartografia") {
              gCartografiaContainer.classList.remove("m-stylemanager-hidden");
              fontAwesomeContainer.classList.add("m-stylemanager-hidden");
            } else if (iconFamilySelect.value === "font-awesome") {
              fontAwesomeContainer.classList.remove("m-stylemanager-hidden");
              gCartografiaContainer.classList.add("m-stylemanager-hidden");
            }
            iconFamilySelect.disabled = false;
          }
        } else if (checkedInputs !== null && checkedInputs.value === "url") {
          formUrlInput.classList.remove("m-stylemanager-hidden");
          optionsForm.classList.remove("m-stylemanager-hidden");
          optionsUrl.classList.remove("m-stylemanager-hidden");
          if (iconFamilySelect) {
            gCartografiaContainer.classList.add("m-stylemanager-hidden");
            fontAwesomeContainer.classList.add("m-stylemanager-hidden");
            iconFamilySelect.disabled = true;
            iconFamilyContainer.classList.add("m-stylemanager-hidden");
          }
        }
      };

      iconFormSelect.forEach((r) =>
        r.addEventListener("change", updateIconVisibility)
      );
      updateIconVisibility();
    }

    // Agregar listeners para todos los elementos de tipo range para actualizar el progreso visual
    this.bindings_["stylesymbol"].querySelectorAllForEach(
      'input[type="range"]',
      (element) => {
        element.addEventListener("input", (e) => {
          this.updateRangeProgress(e.currentTarget);
        });
        this.updateRangeProgress(element);
      }
    );
  }

  bindLayer(binding) {
    this.bindings_[binding].setLayer(this.layer_);
    this.bindings_[binding].setDisabled(false);
  }

  disablePanel(style) {
    let binding = this.bindings_[style];
    if (binding != null) {
      binding.setDisabled(true);
    }
  }

  getBindings() {
    return Object.values(this.bindings_);
  }

  toggleDisplaySubmenu(flag) {
    this.bindings_["stylesymbol"].toggleDisplaySubmenu(flag);
  }

  showActivePanel(style) {
    this.deactivateAll();
    this.setActivePanel(style);
  }

  activeLastSelected(style) {
    let lastSelected = this.selectedPanels_.slice(-1)[0];
    if (lastSelected == undefined) {
      lastSelected = style;
    }
    this.showActivePanel(lastSelected);
  }

  deactivateAll() {
    this.getBindings().forEach((binding) => binding.setActivated(false));
    this.activePanel_ = null;
  }

  unselectAll() {
    this.getBindings().forEach((binding) => binding.setSelected(false));
    this.selectedPanels_ = [];
  }

  setActivePanel(style) {
    Object.values(this.bindings_).forEach((binding) =>
      binding.setActivated(false)
    );
    this.activePanel_ = this.bindings_[style];
    this.activePanel_.setActivated(true);
    if (
      style === "stylesymbol" ||
      style === "stylechoropleth" ||
      style === "styleproportional" ||
      style === "styleheatmap" ||
      style === "stylecluster" ||
      style === "stylecategory" ||
      style === "stylelabel" ||
      style === "stylechart"
    ) {
      this.bindings_["stylesymbol"].toggleDisplaySubmenu(false);
    } else {
      this.bindings_["stylesymbol"].toggleDisplaySubmenu(true);
    }
  }

  showCompatiblePanel(style) {
    if (this.selectedPanels_.includes(style)) {
      this.removeSelectedPanel(style);
      if (this.selectedPanels_.length === 0) {
        this.disableAll();
        this.getCompatibles().forEach((style2) => {
          if (this.compatibleGeometry(style2)) {
            this.enablePanel(style2);
          }
        });
      } else {
        this.setCompatibleStylePanels(style);
      }
    } else {
      this.addSelectedPanel(style);
      this.setCompatibleStylePanels(style);
    }
  }

  removeSelectedPanel(style) {
    this.selectedPanels_ = this.selectedPanels_.filter(
      (style2) => style2 !== style
    );
    this.bindings_[style].setSelected(false);

    if (style === "stylecategory" && this.bindings_["stylelabel"]) {
      this.bindings_["stylelabel"].updateFromCategoryPanelChange();
      this.bindings_["stylelabel"].syncWithCategoryPanel(null);
    }
  }

  addSelectedPanel(style) {
    if (!this.selectedPanels_.includes(style)) {
      this.selectedPanels_.push(style);
      this.bindings_[style].setSelected(true);

      if (style === "stylecategory" && this.bindings_["stylelabel"]) {
        this.bindings_["stylelabel"].updateFromCategoryPanelChange();

        const categoryBinding = this.bindings_["stylecategory"];
        if (categoryBinding) {
          setTimeout(() => {
            const attributeSelect = categoryBinding.querySelector(
              "[data-options='attributeName']"
            );
            if (
              attributeSelect &&
              attributeSelect.value &&
              attributeSelect.value !== "none"
            ) {
              this.bindings_["stylelabel"].syncWithCategoryPanel(
                attributeSelect.value
              );
            }
          }, 100);
        }
      }
    }
  }

  /**
   * Notifica al panel de etiquetas cuando cambia el atributo seleccionado en categorías
   * @function
   * @param {string} newAttribute - El nuevo atributo seleccionado
   */
  onCategoryAttributeChange(newAttribute) {
    if (
      this.selectedPanels_.includes("stylelabel") &&
      this.bindings_["stylelabel"]
    ) {
      this.bindings_["stylelabel"].syncWithCategoryPanel(newAttribute);
    }
  }

  setCompatibleStylePanels(style) {
    this.disableAll();
    this.getCompatibles().forEach((style2) => {
      if (this.compatibleGeometry(style2)) {
        this.enablePanel(style2);
      }
    });
    this.selectedPanels_.forEach((style) => {
      this.bindings_[style].setSelected(true);
    });
  }

  disableAll() {
    this.getKeysBindings().forEach((binding) => this.disablePanel(binding));
  }

  enablePanel(style) {
    let binding = this.bindings_[style];
    if (binding != null) {
      binding.setDisabled(false);
    }
  }

  getCompatibles() {
    let compatibles = [
      "stylesymbol",
      "stylecluster",
      "stylechart",
      "styleproportional",
      "stylecategory",
      "stylechoropleth",
      "styleheatmap",
      "stylelabel",
    ];
    return compatibles.filter((style) =>
      this.isCompatibleAll(this.selectedPanels_, style)
    );
  }

  isCompatibleAll(styles, style) {
    let isCompatible = true;
    styles.forEach((style2) => {
      if (!this.isCompatible(style2, style)) {
        isCompatible = false;
      }
    });
    return isCompatible;
  }

  isCompatible(style, style2) {
    return BindingController.STYLE_COMPATIBLE_OPTIONS[style].includes(style2);
  }

  static get GEOMETRY_COMPATIBLE_OPTIONS() {
    return {
      generic: ["stylesymbol", "stylelabel"],
      point: [
        "styleproportional",
        "stylecluster",
        "stylechoropleth",
        "stylecategory",
        "styleheatmap",
        "stylechart",
        "stylesymbol",
        "stylelabel",
      ],
      line: ["stylechoropleth", "stylecategory", "stylesymbol", "stylelabel"],
      polygon: [
        "styleproportional",
        "stylechoropleth",
        "stylecategory",
        "stylesymbol",
        "stylelabel",
      ],
    };
  }

  static get STYLE_COMPATIBLE_OPTIONS() {
    return {
      stylesymbol: [
        "styleproportional",
        "stylecluster",
        "stylesymbol",
        "stylelabel",
      ],
      styleproportional: [
        "stylesymbol",
        "stylecluster",
        "stylechart",
        "styleproportional",
        "stylecategory",
        "stylechoropleth",
        "stylelabel",
      ],
      stylechoropleth: ["styleproportional", "stylecluster", "stylechoropleth"],
      stylecategory: [
        "styleproportional",
        "stylecluster",
        "stylecategory",
        "stylelabel",
      ],
      stylecluster: [
        "stylesymbol",
        "stylelabel",
        "stylechart",
        "styleproportional",
        "stylecategory",
        "stylechoropleth",
        "stylecluster",
      ],
      styleheatmap: ["styleheatmap"],
      stylechart: ["stylecluster", "styleproportional", "stylechart"],
      stylelabel: [
        "styleproportional",
        "stylecluster",
        "stylecategory",
        "stylesymbol",
        "stylelabel",
      ],
    };
  }

  /**
   * Obtiene la capa actual del BindingController
   * @returns {M.layer.Vector|null} La capa actual
   */
  getCurrentLayer() {
    return this.layer_;
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
   * Clona profundamente un objeto preservando funciones y métodos
   * @param {Object} obj - El objeto a clonar
   * @returns {Object} El objeto clonado
   */
  deepCloneWithFunctions(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
      return obj.map((item) => this.deepCloneWithFunctions(item));
    }
    if (obj instanceof Function) {
      return obj;
    }

    const cloned = Object.create(Object.getPrototypeOf(obj));

    const descriptors = Object.getOwnPropertyDescriptors(obj);
    for (const key in descriptors) {
      if (
        descriptors[key].value &&
        typeof descriptors[key].value === "object"
      ) {
        descriptors[key].value = this.deepCloneWithFunctions(
          descriptors[key].value
        );
      }
      Object.defineProperty(cloned, key, descriptors[key]);
    }

    return cloned;
  }

  /**
   * Clona profundamente un objeto simple (sin funciones)
   * @param {Object} obj - El objeto a clonar
   * @returns {Object} El objeto clonado
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
      return obj.map((item) => this.deepClone(item));
    }

    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }

    return cloned;
  }

  static parseStyleToName(style) {
    let name = "";
    if (style instanceof M.style.Simple) {
      name = "stylesymbol";
    } else if (style instanceof M.style.Cluster) {
      name = "stylecluster";
    } else if (style instanceof M.style.Heatmap) {
      name = "styleheatmap";
    } else if (style instanceof M.style.Choropleth) {
      name = "stylechoropleth";
    } else if (style instanceof M.style.Category) {
      name = "stylecategory";
    } else if (style instanceof M.style.Chart) {
      name = "stylechart";
    } else if (style instanceof M.style.Proportional) {
      name = "styleproportional";
    }
    return name;
  }

  /**
   * Verifica si las opciones de estilo corresponden a un gráfico estadístico (método estático)
   * @function
   * @param {Object} styleOpts
   * @return {boolean}
   */
  static isStatisticalStyleOptions(styleOpts) {
    if (!styleOpts) return false;

    // Verificar si es una instancia de M.style.Chart
    if (styleOpts instanceof M.style.Chart) {
      return true;
    }

    // Verificar si es una instancia de M.style.Composite que contiene Charts
    if (styleOpts instanceof M.style.Composite) {
      const styles = styleOpts.getStyles();
      return styles.some((style) => style instanceof M.style.Chart);
    }

    // Verificar propiedades de estilo mediante getOptions()
    let options = null;
    if (styleOpts.getOptions && typeof styleOpts.getOptions === "function") {
      options = styleOpts.getOptions();
    } else if (styleOpts.options_) {
      options = styleOpts.options_;
    } else {
      options = styleOpts;
    }

    if (!options) return false;

    // Verificar tipo directo en el nivel raíz
    if (
      options.type &&
      ["pie", "pie3D", "donut", "bar"].includes(options.type)
    ) {
      return true;
    }

    // Verificar variables directas en el nivel raíz
    if (options.variables && Array.isArray(options.variables)) {
      return true;
    }

    // Buscar en diferentes tipos de geometría
    for (const geomType of ["point", "line", "polygon"]) {
      if (options[geomType]) {
        const geomStyle = options[geomType];
        // Verificar si tiene tipo estadístico y variables
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
}
