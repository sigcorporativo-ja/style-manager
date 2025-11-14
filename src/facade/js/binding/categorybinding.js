// import buttonoptions2 from 'templates/buttonoptions2';
import simpleoptions from "templates/simpleoptions";
// import stylesimple from 'templates/stylesimple';
import attributestemplate from "templates/attributestemplate";
import categorystyles from "templates/categorystyles";
import { Binding } from "./binding";
import { SimpleCategoryBinding } from "./simplecategorybinding";

export class CategoryBinding extends Binding {
  constructor(html, htmlParent, styleType, styleParams, layer, controller) {
    super(html, htmlParent, styleType, styleParams, layer);

    this.categoryLabelVisibility_ = {};
    this.styleCategories_ = {};
    this.categoryVisibility_ = {};
    this.savedStylesCache_ = new Map();
    this.lastSelectedAttribute_ = null;
    this.isFirstLayerLoad_ = true;

    if (layer && typeof layer.getStyle === "function") {
      const currentStyle = layer.getStyle();
      if (currentStyle && currentStyle instanceof M.style.Category) {
        this.style_ = currentStyle;
      }
    }

    this.compilePromise_.then(() => {
      const categoryLabelsCheckbox = this.getTemplate().querySelector(
        "#category-labels-toggle"
      );
      const updateCategoryLabelsToggle = () => {
        const cats = Object.keys(this.styleCategories_);
        if (cats.length === 0) return;
        const visibles = cats.filter(
          (cat) => this.categoryLabelVisibility_[cat] !== false
        );
        if (visibles.length === cats.length) {
          categoryLabelsCheckbox.checked = true;
          categoryLabelsCheckbox.indeterminate = false;
        } else if (visibles.length === 0) {
          categoryLabelsCheckbox.checked = false;
          categoryLabelsCheckbox.indeterminate = false;
        } else {
          categoryLabelsCheckbox.checked = false;
          categoryLabelsCheckbox.indeterminate = true;
        }
      };

      if (categoryLabelsCheckbox) {
        const self = this;
        categoryLabelsCheckbox.addEventListener("change", function () {
          const cats = Object.keys(self.styleCategories_);
          if (cats.length === 0) return;
          cats.forEach((cat) => {
            self.categoryLabelVisibility_[cat] = this.checked;
          });
          self.querySelectorAllForEach(
            "input[type='checkbox'][data-hide-label]",
            (checkbox) => {
              checkbox.checked = !this.checked;
              checkbox.dispatchEvent(new Event("change", { bubbles: true }));
            }
          );
        });
      }

      this._observeHideLabelCheckboxes = () => {
        this.querySelectorAllForEach(
          "input[type='checkbox'][data-hide-label]",
          (checkbox) => {
            checkbox.addEventListener("change", updateCategoryLabelsToggle);
          }
        );
        updateCategoryLabelsToggle();
      };
      let selectElement = this.getTemplate().querySelector(
        "[data-options='attributeName']"
      );
      selectElement.addEventListener("input", (e) => {
        const previousValue = e.target.dataset.previousValue || "none";

        if (previousValue !== "none") {
          this.saveCurrentStylesForAttribute(previousValue);
        }

        const newValue = selectElement.value;
        if (newValue !== "none") {
          this.lastSelectedAttribute_ = newValue;
        }

        e.target.dataset.previousValue = newValue;

        this.renderAttributeOptions(false);
        this.updatedStyle_ = this.generateStyleInternal();

        if (
          this.controller_ &&
          typeof this.controller_.applyStyle === "function"
        ) {
          this.controller_.applyStyle(this.updatedStyle_);
        }

        if (
          this.controller_ &&
          typeof this.controller_.onCategoryAttributeChange === "function"
        ) {
          this.controller_.onCategoryAttributeChange(newValue);
        }

        if (
          this.controller_ &&
          this.controller_.bindings_ &&
          this.controller_.bindings_["stylelabel"]
        ) {
          const labelBinding = this.controller_.bindings_["stylelabel"];
          if (
            typeof labelBinding.updateFromCategoryPanelChange === "function"
          ) {
            labelBinding.updateFromCategoryPanelChange();
          }
        }
      });
      const updateBtn = this.getTemplate().querySelector(
        "[data-update-category-style]"
      );
      if (updateBtn) {
        updateBtn.addEventListener("click", () => {
          Object.keys(this.styleCategories_).forEach((cat) => {
            let binding = this.styleCategories_[cat];
            binding.style_ = CategoryBinding.generateRandomCategoryStyle(
              binding.geometry_
            );
            if (typeof binding.refreshLegend === "function") {
              binding.refreshLegend(cat, true);
            }
          });

          if (this.selectedCategory_ && this.selectedCategory_.style_) {
            this.selectedCategory_.setStyle(this.selectedCategory_.style_);
          }

          this.updatedStyle_ = this.generateStyleInternal();

          if (
            this.controller_ &&
            typeof this.controller_.applyStyle === "function"
          ) {
            this.controller_.applyStyle(this.updatedStyle_);
          }
        });
      }
      const applyBtn = this.getTemplate().querySelector(
        "[data-apply-category-style]"
      );
      if (applyBtn) {
        applyBtn.addEventListener("click", () => {
          const opts = this.generateOptionsFromBindings();
          let style = null;
          if (opts.attributeName && opts.attributeName !== "") {
            style = new M.style.Category(opts.attributeName, opts.options);

            if (
              this.controller_ &&
              typeof this.controller_.applyStyle === "function"
            ) {
              this.controller_.applyStyle(style);
            }
          } else {
            if (
              typeof M !== "undefined" &&
              M.dialog &&
              typeof M.dialog.error === "function"
            ) {
              M.dialog.error(
                "Debe seleccionar un atributo para la simbología de categorías",
                "Error"
              );
            }
          }
        });
      }
    });
    this.selectedCategory_ = null;
    this.clickedOnTable_ = false;
    this.controller_ = controller;

    this.compilePromise_.then(() => {
      const selectElement = this.getTemplate().querySelector(
        "[data-options='attributeName']"
      );
      const labelsRow = this.getTemplate().querySelector(
        "#category-labels-row"
      );
      const updateLabelsRowVisibility = () => {
        const value = selectElement.value;
        if (!value || value === "none") {
          labelsRow.style.display = "none";
        } else {
          labelsRow.style.display = "";
        }
      };
      selectElement.addEventListener("change", updateLabelsRowVisibility);
      updateLabelsRowVisibility();

      const categoryLabelsCheckbox = this.getTemplate().querySelector(
        "#category-labels-toggle"
      );
      const updateCategoryLabelsToggle = () => {
        const cats = Object.keys(this.styleCategories_);
        if (cats.length === 0) return;
        const visibles = cats.filter(
          (cat) => this.categoryLabelVisibility_[cat] !== false
        );
        if (visibles.length === cats.length) {
          categoryLabelsCheckbox.checked = true;
          categoryLabelsCheckbox.indeterminate = false;
        } else if (visibles.length === 0) {
          categoryLabelsCheckbox.checked = false;
          categoryLabelsCheckbox.indeterminate = false;
        } else {
          categoryLabelsCheckbox.checked = false;
          categoryLabelsCheckbox.indeterminate = true;
        }
      };

      if (categoryLabelsCheckbox) {
        categoryLabelsCheckbox.addEventListener("change", () => {
          const cats = Object.keys(this.styleCategories_);
          cats.forEach((cat) => {
            this.categoryLabelVisibility_[cat] = categoryLabelsCheckbox.checked;
          });
          this.addCategoriesView(
            cats.map((name) => ({ name })),
            true,
            false
          );
        });
      }

      this._observeHideLabelCheckboxes = () => {
        this.querySelectorAllForEach(
          "input[type='checkbox'][data-hide-label]",
          (checkbox) => {
            checkbox.addEventListener("change", updateCategoryLabelsToggle);
          }
        );
        updateCategoryLabelsToggle();
      };
      let styleLabelCheckbox = document.querySelector(
        "input[data-checkbox='stylelabel']"
      );
      if (!styleLabelCheckbox) {
        setTimeout(() => {
          styleLabelCheckbox = document.querySelector(
            "input[data-checkbox='stylelabel']"
          );
          if (styleLabelCheckbox) attachMutualEvents();
        }, 500);
      } else {
        attachMutualEvents();
      }

      function attachMutualEvents() {
        if (!categoryLabelsCheckbox || !styleLabelCheckbox) return;
        categoryLabelsCheckbox.addEventListener("change", function () {
          if (this.checked) {
            if (styleLabelCheckbox.checked) {
              styleLabelCheckbox.checked = false;
              styleLabelCheckbox.dispatchEvent(
                new Event("change", { bubbles: true })
              );
            } else {
              styleLabelCheckbox.checked = false;
            }
          }
        });
        styleLabelCheckbox.addEventListener("change", function () {
          if (this.checked) {
            if (categoryLabelsCheckbox.checked) {
              categoryLabelsCheckbox.checked = false;
              categoryLabelsCheckbox.dispatchEvent(
                new Event("change", { bubbles: true })
              );
            } else {
              categoryLabelsCheckbox.checked = false;
            }
          }
        });
        if (categoryLabelsCheckbox.checked && styleLabelCheckbox.checked) {
          styleLabelCheckbox.checked = false;
        }
      }
    });
  }

  /**
   * Genera un estilo aleatorio irrepetible para una categoría y geometría
   */
  static generateRandomCategoryStyle(geometry) {
    const randomColor = () => {
      return (
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0")
      );
    };
    const color = randomColor();
    const styleOptions = {
      fill: { color: color, opacity: 1 },
      stroke: { color: "#000000", width: 1 },
      radius: 10,
    };
    if (geometry === "line") {
      styleOptions.stroke.color = "transparent";
      styleOptions.fill.width = 3;
      styleOptions.stroke.width = 0;
      return new M.style.Line(styleOptions);
    } else if (geometry === "polygon") {
      return new M.style.Polygon(styleOptions);
    } else if (geometry === "point") {
      return new M.style.Point(styleOptions);
    }
  }

  /**
   * Genera los estilos de categoría en tiempo real a partir de los bindings actuales
   */
  generateOptionsFromBindings() {
    let styleOptions = {};
    let styleCategories = {};
    styleOptions["attributeName"] = this.querySelector(
      "[data-options='attributeName']"
    ).value;

    Object.keys(this.styleCategories_).forEach((value) => {
      let simpleBinding = this.styleCategories_[value];
      if (
        !this.categoryVisibility_ ||
        this.categoryVisibility_[value] !== false
      ) {
        styleCategories[value] = simpleBinding.style_;
      } else {
        let geometry = simpleBinding.geometry_ || "point";
        let emptyStyle;
        if (geometry === "line") {
          emptyStyle = new M.style.Line({
            fill: { color: "rgba(0,0,0,0)", opacity: 0 },
            stroke: { color: "rgba(0,0,0,0)", width: 0 },
          });
        } else if (geometry === "polygon") {
          emptyStyle = new M.style.Polygon({
            fill: { color: "rgba(0,0,0,0)", opacity: 0 },
            stroke: { color: "rgba(0,0,0,0)", width: 0 },
          });
        } else {
          emptyStyle = new M.style.Point({
            fill: { color: "rgba(0,0,0,0)", opacity: 0 },
            stroke: { color: "rgba(0,0,0,0)", width: 0 },
            radius: 0,
            icon: null,
          });
        }
        styleCategories[value] = emptyStyle;
      }
    });

    styleOptions["options"] = styleCategories;
    return styleOptions;
  }

  /**
   * Guarda los estilos actuales en el cache
   * @function
   */
  saveCurrentStyles() {
    if (!this.layer_) {
      return;
    }

    const attributeName = this.querySelector(
      "[data-options='attributeName']"
    ).value;

    if (attributeName && attributeName !== "none") {
      this.saveCurrentStylesForAttribute(attributeName);
    }
  }

  /**
   * Guarda los estilos actuales para un atributo específico
   * @function
   * @param {string} attributeName
   */
  saveCurrentStylesForAttribute(attributeName) {
    if (!this.layer_ || !attributeName || attributeName === "none") {
      return;
    }

    const layerId = this.layer_.name || this.layer_.id || "default";
    const cacheKey = `${layerId}_${attributeName}`;
    const stylesToSave = {};

    Object.keys(this.styleCategories_).forEach((categoryName) => {
      const binding = this.styleCategories_[categoryName];
      if (binding && binding.style_) {
        stylesToSave[categoryName] = {
          style: binding.style_,
          visibility: this.categoryVisibility_[categoryName] !== false,
        };
      }
    });

    this.savedStylesCache_.set(cacheKey, stylesToSave);
  }

  /**
   * Restaura los estilos guardados desde el cache
   * @function
   * @param {string} attributeName
   * @return {Object|null}
   */
  getSavedStyles(attributeName) {
    if (!this.layer_ || !attributeName || attributeName === "none") return null;

    const layerId = this.layer_.name || this.layer_.id || "default";
    const cacheKey = `${layerId}_${attributeName}`;
    const savedStyles = this.savedStylesCache_.get(cacheKey) || null;

    return savedStyles;
  }

  /**
   * TODO
   * @function
   */
  setLayer(layer) {
    this.saveCurrentStyles();

    this.layer_ = layer;

    if (layer && typeof layer.getStyle === "function") {
      const currentStyle = layer.getStyle();
      if (currentStyle && currentStyle instanceof M.style.Category) {
        this.style_ = currentStyle;
      }
    }

    this.setAttributes();

    this.isFirstLayerLoad_ = false;

    //this.refreshOptionsButtons();
    return this;
  }

  /**
   * TODO
   * @function
   */
  setAttributes() {
    var layer = this.layer_;
    if (layer instanceof M.layer.Vector) {
      var selected = this.style_ == null ? "" : this.style_.getAttributeName();

      var selectElement = this.getTemplate().querySelector(
        "[data-options='attributeName']"
      );
      var currentValue =
        selectElement && selectElement.value ? selectElement.value : "none";

      if (currentValue !== "none") {
        this.lastSelectedAttribute_ = currentValue;
      }

      var attributeNames = this.filterAttributesFeature("string").map(function (
        element
      ) {
        return {
          name: element,
          selected: selected === element,
        };
      });

      var attributeToSelect = "none";

      if (
        selected !== "" &&
        attributeNames.some((attr) => attr.name === selected)
      ) {
        attributeToSelect = selected;
      } else if (
        currentValue !== "none" &&
        attributeNames.some((attr) => attr.name === currentValue)
      ) {
        attributeToSelect = currentValue;
      } else if (
        this.lastSelectedAttribute_ &&
        attributeNames.some((attr) => attr.name === this.lastSelectedAttribute_)
      ) {
        attributeToSelect = this.lastSelectedAttribute_;
      }

      var attributesSelected =
        attributeToSelect !== "none" && attributeToSelect !== "";

      // Obtener traducciones para los templates de categorías
      const translationKeys = {
        selectAttribute: "select-attribute",
      };
      const translations = Binding.getTranslations(translationKeys);
      this.compileTemplate(attributestemplate, {
        attributes: attributeNames,
        attributesSelected: attributesSelected,
        translations: translations,
      }).then(
        function (html) {
          selectElement.innerHTML = html.innerHTML;
          selectElement.value = attributeToSelect;
          selectElement.dataset.previousValue = attributeToSelect;

          if (attributeToSelect !== "none") {
            this.lastSelectedAttribute_ = attributeToSelect;
          }

          const forceExistingStyle =
            this.style_ != null &&
            this.style_ instanceof M.style.Category &&
            this.style_.getAttributeName() === attributeToSelect;

          this.renderAttributeOptions(forceExistingStyle);
          if (attributeNames.length === 0) {
            this.deactivateBinding();
          } else {
            this.activateBinding();
          }
        }.bind(this)
      );
    }
  }

  /**
   * TODO
   * @function
   */
  renderAttributeOptions(flag = false) {
    let selectButton = this.querySelector("[data-options='attributeName']");
    let value = selectButton.value;
    if (this.style_ != null && flag) {
      value = this.style_.getAttributeName();
    }
    let attributeExists = !M.utils.isNullOrEmpty(value) && value !== "none";
    const btn = this.querySelector("[data-update-category-style]");
    const table = this.querySelector("[data-options='values']");

    if (btn) btn.style.display = attributeExists ? "" : "none";
    if (table) table.style.display = attributeExists ? "" : "none";

    let values = attributeExists
      ? this.getAllValuesAttribute(value)
          .filter((value) => !M.utils.isNullOrEmpty(value))
          .map((value) => {
            return {
              name: value,
            };
          })
          .splice(0, CategoryBinding.MAXNUMBER_CATEGORIES)
      : [];

    const savedStyles = this.getSavedStyles(value);

    let existingCategoryStyle = null;
    let categoryStyleInstance = null;

    if (
      this.style_ &&
      this.style_ instanceof M.style.Category &&
      this.style_.getAttributeName() === value
    ) {
      categoryStyleInstance = this.style_;
    }

    if (
      !categoryStyleInstance &&
      this.layer_ &&
      typeof this.layer_.getStyle === "function"
    ) {
      const layerStyle = this.layer_.getStyle();
      if (
        layerStyle &&
        layerStyle instanceof M.style.Category &&
        layerStyle.getAttributeName() === value
      ) {
        categoryStyleInstance = layerStyle;
        this.style_ = layerStyle;
      }
    }

    if (categoryStyleInstance) {
      try {
        if (typeof categoryStyleInstance.getCategories === "function") {
          existingCategoryStyle = categoryStyleInstance.getCategories();
        } else if (categoryStyleInstance.categoryStyles_) {
          existingCategoryStyle = categoryStyleInstance.categoryStyles_;
        } else if (typeof categoryStyleInstance.getOptions === "function") {
          const styleOptions = categoryStyleInstance.getOptions();
          if (styleOptions && Object.keys(styleOptions).length > 0) {
            existingCategoryStyle = styleOptions;
          }
        }
      } catch (error) {
        M.dialog.error("Error al extraer categorías del estilo ", error);
      }
    }

    this.removeCategories();
    values.forEach((v) => {
      const binding = new SimpleCategoryBinding(
        simpleoptions,
        this.htmlTemplate_,
        "stylesimple",
        null,
        this.layer_,
        this
      );
      this.setGeometryCategory(binding);

      if (existingCategoryStyle && existingCategoryStyle[v.name]) {
        const styleFromCategory = existingCategoryStyle[v.name];
        binding.style_ = styleFromCategory;
        this.categoryVisibility_[v.name] = true;

        if (v.name === "ALMERÍA" || v.name === "CÁDIZ") {
          const debugInfo = document.createElement("div");
          debugInfo.style.display = "none";
          debugInfo.id = `debug-${v.name}`;

          let fillColor = "unknown";
          let strokeColor = "unknown";
          let styleType = "unknown";

          if (styleFromCategory) {
            styleType = styleFromCategory.constructor
              ? styleFromCategory.constructor.name
              : typeof styleFromCategory;
            if (styleFromCategory.fill && styleFromCategory.fill.color) {
              fillColor = styleFromCategory.fill.color;
            } else if (styleFromCategory.getOptions) {
              const opts = styleFromCategory.getOptions();
              if (opts && opts.fill && opts.fill.color) {
                fillColor = opts.fill.color;
              }
            }
            if (styleFromCategory.stroke && styleFromCategory.stroke.color) {
              strokeColor = styleFromCategory.stroke.color;
            } else if (styleFromCategory.getOptions) {
              const opts = styleFromCategory.getOptions();
              if (opts && opts.stroke && opts.stroke.color) {
                strokeColor = opts.stroke.color;
              }
            }
          }

          debugInfo.textContent = JSON.stringify({
            categoryName: v.name,
            hasStyle: !!styleFromCategory,
            styleType: styleType,
            fillColor: fillColor,
            strokeColor: strokeColor,
          });
          document.body.appendChild(debugInfo);
        }
      } else if (savedStyles && savedStyles[v.name]) {
        binding.style_ = savedStyles[v.name].style;
        this.categoryVisibility_[v.name] = savedStyles[v.name].visibility;
      } else {
        binding.style_ = CategoryBinding.generateRandomCategoryStyle(
          binding.geometry_
        );
      }

      binding.setCategoryName(v.name);
      this.styleCategories_[v.name] = binding;
    });

    const otherBinding = new SimpleCategoryBinding(
      simpleoptions,
      this.htmlTemplate_,
      "stylesimple",
      null,
      this.layer_,
      this
    );
    this.setGeometryCategory(otherBinding);

    if (existingCategoryStyle && existingCategoryStyle["other"]) {
      otherBinding.style_ = existingCategoryStyle["other"];
      this.categoryVisibility_["other"] = true;
    } else if (savedStyles && savedStyles["other"]) {
      otherBinding.style_ = savedStyles["other"].style;
      this.categoryVisibility_["other"] = savedStyles["other"].visibility;
    } else {
      otherBinding.style_ = CategoryBinding.generateRandomCategoryStyle(
        otherBinding.geometry_
      );
    }

    otherBinding.setCategoryName("other");
    this.styleCategories_["other"] = otherBinding;

    this.addCategoriesView(values, attributeExists);
    if (typeof this._observeHideLabelCheckboxes === "function") {
      this._observeHideLabelCheckboxes();
    }
  }

  getAllValuesAttribute(attribute) {
    let features = this.layer_.getFeatures();
    return features
      .map((feature) => feature.getAttribute(attribute))
      .filter((elem, pos, arr) => arr.indexOf(elem) == pos);
  }

  /**
   * TODO
   * @function
   */
  removeCategories() {
    Object.values(this.styleCategories_).forEach((binding) =>
      binding.destroy()
    );
    this.styleCategories_ = {};
  }

  /**
   * TODO
   * @function
   */
  addCategoriesView(values, attributeExists, forceRefreshPreviews = true) {
    let parent = this.querySelector("[data-options='values']");

    // Obtener traducciones para la tabla de categorías
    const translationKeys = {
      attributeValue: "attribute-value",
      hideSymbols: "hide-symbols",
      hideLabels: "hide-labels",
      preview: "preview",
      others: "others",
      hideShowSymbol: "hide-show-symbol",
      hideShowLabel: "hide-show-label",
    };
    const translations = Binding.getTranslations(translationKeys);
    this.compileTemplate(categorystyles, {
      values: values,
      attributeExists: attributeExists,
      translations: translations,
    }).then((html) => {
      parent.innerHTML = html.innerHTML;

      Object.values(this.styleCategories_).forEach((binding) => {
        binding.refreshTemplate();
        binding.hide();
      });
      this.updatedStyle_ = this.generateStyleInternal();
      this.addEventClickListener();
      this.addEventSelectedListener();
      this.addEventOptionListener();

      this.querySelectorAllForEach(
        "input[type='checkbox'][data-hide-category]",
        (checkbox) => {
          const catName = checkbox.getAttribute("data-hide-category");
          this.categoryVisibility_[catName] = !checkbox.checked;
          const img = document.getElementById(`img-${catName}`);
          if (img) {
            img.style.display = checkbox.checked ? "none" : "";
          }
          checkbox.addEventListener("change", (e) => {
            this.categoryVisibility_[catName] = !e.target.checked;
            if (img) {
              img.style.display = e.target.checked ? "none" : "";
            }
            this.updatedStyle_ = this.generateStyleInternal();
            if (
              this.controller_ &&
              typeof this.controller_.applyStyle === "function"
            ) {
              this.controller_.applyStyle(this.updatedStyle_);
            }
          });
        }
      );

      this.querySelectorAllForEach(
        "input[type='checkbox'][data-hide-label]",
        (checkbox) => {
          const catName = checkbox.getAttribute("data-hide-label");
          this.categoryLabelVisibility_[catName] = !checkbox.checked;
          const binding = this.styleCategories_[catName];
          if (binding && binding.style_) {
            if (!binding._lastCustomLabel) {
              binding._lastCustomLabel =
                binding.style_.options_ && binding.style_.options_.label
                  ? JSON.parse(JSON.stringify(binding.style_.options_.label))
                  : null;
            }
            if (!checkbox.checked) {
              if (binding._lastCustomLabel) {
                binding.style_.options_.label = JSON.parse(
                  JSON.stringify(binding._lastCustomLabel)
                );
              }
            } else {
              if (binding.style_.options_ && binding.style_.options_.label) {
                binding._lastCustomLabel = JSON.parse(
                  JSON.stringify(binding.style_.options_.label)
                );
                binding.style_.options_.label = null;
              }
            }
          }
          if (binding && binding.style_ && binding.style_.setLabelVisible) {
            binding.style_.setLabelVisible(!checkbox.checked);
          } else if (binding && binding.style_ && binding.style_.label) {
            binding.style_.label.visible = !checkbox.checked;
          }
          try {
            if (
              this.controller_ &&
              this.controller_.bindings_ &&
              this.controller_.bindings_["stylelabel"] &&
              typeof this.controller_.bindings_["stylelabel"]
                .toggleLabelCategoryVisibility === "function"
            ) {
              this.controller_.bindings_[
                "stylelabel"
              ].toggleLabelCategoryVisibility(catName, !checkbox.checked);
            }
          } catch (err) {
            M.dialog.error(err);
          }
          try {
            if (
              this.controller_ &&
              this.controller_.bindings_ &&
              this.controller_.bindings_["stylelabel"] &&
              typeof this.controller_.bindings_["stylelabel"]
                .toggleLabelCategoryVisibility === "function"
            ) {
              this.controller_.bindings_[
                "stylelabel"
              ].toggleLabelCategoryVisibility(catName, !checkbox.checked);
            }
          } catch (err) {
            M.dialog.error(err);
          }
          checkbox.addEventListener("change", (e) => {
            this.categoryLabelVisibility_[catName] = !e.target.checked;
            const binding = this.styleCategories_[catName];
            if (binding && binding.style_) {
              if (!binding._lastCustomLabel) {
                binding._lastCustomLabel =
                  binding.style_.options_ && binding.style_.options_.label
                    ? JSON.parse(JSON.stringify(binding.style_.options_.label))
                    : null;
              }
              if (!e.target.checked) {
                if (binding._lastCustomLabel) {
                  binding.style_.options_.label = JSON.parse(
                    JSON.stringify(binding._lastCustomLabel)
                  );
                }
              } else {
                if (binding.style_.options_ && binding.style_.options_.label) {
                  binding._lastCustomLabel = JSON.parse(
                    JSON.stringify(binding.style_.options_.label)
                  );
                  binding.style_.options_.label = null;
                }
              }
            }
            if (binding && binding.style_ && binding.style_.setLabelVisible) {
              binding.style_.setLabelVisible(!e.target.checked);
            } else if (binding && binding.style_ && binding.style_.label) {
              binding.style_.label.visible = !e.target.checked;
            }
            try {
              if (
                this.controller_ &&
                this.controller_.bindings_ &&
                this.controller_.bindings_["stylelabel"] &&
                typeof this.controller_.bindings_["stylelabel"]
                  .toggleLabelCategoryVisibility === "function"
              ) {
                this.controller_.bindings_[
                  "stylelabel"
                ].toggleLabelCategoryVisibility(catName, !e.target.checked);
              }
            } catch (err) {
              M.dialog.error(err);
            }
            this.updatedStyle_ = this.generateStyleInternal();
            if (
              this.controller_ &&
              typeof this.controller_.applyStyle === "function"
            ) {
              this.controller_.applyStyle(this.updatedStyle_);
            }
          });
        }
      );

      Object.keys(this.styleCategories_).forEach((cat) => {
        const binding = this.styleCategories_[cat];
        if (
          forceRefreshPreviews &&
          binding &&
          typeof binding.refreshLegend === "function"
        ) {
          binding.refreshLegend(cat, true);
        }
        if (binding && binding.style_) {
          this.updatePreviewImage(cat, binding.style_);
        }
      });

      // Configurar el checkbox "Ocultar/Mostrar todos" después de renderizar la tabla
      this.setupHideAllCheckbox();
    });
  }

  /**
   * Configura el comportamiento del checkbox "Ocultar/Mostrar todos"
   */
  setupHideAllCheckbox() {
    const hideAllSymbols = this.querySelector("#hide-all-categories");
    const hideAllLabels = this.querySelector("#hide-all-labels");
    if (hideAllSymbols) {
      hideAllSymbols.addEventListener("change", () => {
        const checked = hideAllSymbols.checked;
        // Solo afecta a los checkboxes de símbolos
        this.querySelectorAllForEach("input[data-hide-category]", (el) => {
          if (!el.id.startsWith("label-hide-")) {
            el.checked = checked;
            el.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
      });
    }
    if (hideAllLabels) {
      hideAllLabels.addEventListener("change", () => {
        const checked = hideAllLabels.checked;
        // Solo afecta a los checkboxes de etiquetas
        this.querySelectorAllForEach("input[data-hide-label]", (el) => {
          el.checked = checked;
          el.dispatchEvent(new Event("change", { bubbles: true }));
        });
      });
    }
  }

  /**
   * TODO
   * @function
   */
  setGeometryCategory(category) {
    let features =
      this.layer_ && this.layer_.getFeatures ? this.layer_.getFeatures() : [];
    let geometry = null;
    for (let i = 0; i < features.length; i++) {
      let f = features[i];
      if (f && f.getGeometry && f.getGeometry() && f.getGeometry().type) {
        geometry = f.getGeometry().type;
        break;
      }
    }
    if (!geometry) {
      M.dialog.error("No se pudo detectar la geometría de la capa", "Error");
      category.geometry_ = "point";
      return;
    }
    switch (geometry) {
      case "Point":
      case "MultiPoint":
        category.geometry_ = "point";
        break;
      case "LineString":
      case "MultiLineString":
        category.geometry_ = "line";
        break;
      case "Polygon":
      case "MultiPolygon":
        category.geometry_ = "polygon";
        break;
      default:
        M.dialog.error("Geometría no soportada: " + geometry, "Error");
        category.geometry_ = "point";
    }
  }

  /**
   * @function
   */
  addEventClickListener() {
    this.querySelectorAllForEach("td:first-child", (element) => {
      element.addEventListener("click", () => {
        this.toggleCategory(element.id);
      });
    });
  }

  addEventSelectedListener() {
    this.querySelectorAllForEach("td:first-child", (element) => {
      let id = element.id;
      element.addEventListener("click", () => this.setSelectedRow(id));
    });
  }

  /**
   * Actualiza la previsualización de una categoría específica
   * @function
   * @param {string} categoryName
   * @param {M.style.Simple} newStyle
   */
  updateCategoryPreview(categoryName, newStyle) {
    if (newStyle && categoryName) {
      if (this.styleCategories_[categoryName]) {
        this.styleCategories_[categoryName].style_ = newStyle;
      }

      this.updatePreviewImage(categoryName, newStyle);

      this.updatedStyle_ = this.generateStyleInternal();
    }
  }
  /**
   * Actualiza la imagen de previsualización en la tabla para una categoría
   * @function
   * @param {string} categoryName
   * @param {M.style.Simple} style
   */
  updatePreviewImage(categoryName, style) {
    const imgElement = document.getElementById(`img-${categoryName}`);
    if (imgElement && style) {
      const categoryBinding = this.styleCategories_[categoryName];
      if (
        categoryBinding &&
        typeof categoryBinding.generateCanvasForStyle === "function"
      ) {
        const canvas = categoryBinding.generateCanvasForStyle(style);
        if (canvas) {
          imgElement.src = canvas.toDataURL("image/png");
        }
      }
    }
  }

  toggleCategory(id) {
    Object.values(this.styleCategories_).forEach((symbolBinding) => {
      symbolBinding.hide();
    });
    if (this.clickedOnTable_ === false) {
      //this.activateSubmenu();
      this.clickedOnTable_ = true;
    }

    let symbolBinding = this.styleCategories_[id];
    this.selectedCategory_ = symbolBinding;

    if (symbolBinding != null) {
      symbolBinding.unhide();

      const template = symbolBinding.getTemplate();
      if (template) {
        template.style.display = "";
        template.classList.remove("m-stylemanager-hidden");
      }

      if (
        typeof symbolBinding.setStyle === "function" &&
        symbolBinding.style_
      ) {
        symbolBinding.setStyle(symbolBinding.style_);
      }

      setTimeout(() => {
        this.configureCategoryListeners(symbolBinding);
      }, 100);
    }

    Object.values(this.styleCategories_).forEach((simpleBinding) => {
      simpleBinding.setLayer(this.layer_, false);
    });
  }

  /**
   * Configura los listeners para una categoría específica
   * @function
   * @param {SimpleCategoryBinding} categoryBinding
   */
  configureCategoryListeners(categoryBinding) {
    if (!categoryBinding) return;

    categoryBinding.querySelectorAllForEach(
      "[data-style-options]",
      (element) => {
        const eventType =
          element.type === "range" || element.type === "color"
            ? "input"
            : "change";

        if (element._categoryStyleListener) {
          element.removeEventListener(
            eventType,
            element._categoryStyleListener
          );
        }

        element._categoryStyleListener = () => {
          if (element.type === "range") {
            this.updateRangeProgress(element);
          }
          this.updateCategoryStyleFromInputs(categoryBinding);
        };

        element.addEventListener(eventType, element._categoryStyleListener);

        if (element.type === "range") {
          this.updateRangeProgress(element);
        }
      }
    );

    categoryBinding.querySelectorAllForEach("[data-apply]", (element) => {
      element.addEventListener("change", () => {
        this.updateCategoryStyleFromInputs(categoryBinding);
      });
    });

    this.addCategorySectionListeners(categoryBinding);

    this.addCategoryIconListeners(categoryBinding);

    this.addCategoryOpacityListeners(categoryBinding);
  }

  /**
   * Actualiza el estilo de una categoría basado en los inputs actuales
   * @function
   * @param {SimpleCategoryBinding} categoryBinding
   */
  updateCategoryStyleFromInputs(categoryBinding) {
    setTimeout(() => {
      const newStyle = categoryBinding.generateStyleFromInputs();
      if (newStyle && categoryBinding.categoryName_) {
        this.updateCategoryPreview(categoryBinding.categoryName_, newStyle);
      }
    }, 50);
  }

  /**
   * Configura listeners para secciones colapsables de categorías
   * @function
   * @param {SimpleCategoryBinding} categoryBinding
   */
  addCategorySectionListeners(categoryBinding) {
    categoryBinding.querySelectorAllForEach(
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

    categoryBinding.querySelectorAllForEach(
      ".m-stylemanager-button-advanced-options",
      (element) => {
        if (element._categoryAdvancedListener) {
          element.removeEventListener(
            "click",
            element._categoryAdvancedListener
          );
        }

        element._categoryAdvancedListener = (e) => {
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
        };

        element.addEventListener("click", element._categoryAdvancedListener);
      }
    );
  }

  /**
   * Configura listeners para iconos de categorías
   * @function
   * @param {SimpleCategoryBinding} categoryBinding
   */
  addCategoryIconListeners(categoryBinding) {
    const iconFormRadios = categoryBinding.querySelectorAll(
      'input[name="iconFormType"]'
    );
    const iconFamilySelect = categoryBinding.querySelector(
      "#icon-family-select"
    );
    const iconFamilyContainer = categoryBinding.querySelector(
      "#icon-family-container"
    );
    const gCartografiaContainer = categoryBinding.querySelector(
      "#icon-family-gcartografia"
    );
    const fontAwesomeContainer = categoryBinding.querySelector(
      "#icon-family-fontawesome"
    );
    const optionsFamily = categoryBinding.querySelector("#icon-family-option");
    const formContainer = categoryBinding.querySelector("#icon-form-container");
    const formUrlInput = categoryBinding.querySelector("#icon-form-input");
    const optionsForm = categoryBinding.querySelector("#icon-form-option");
    const optionsForm2 = categoryBinding.querySelector("#icon-form-option2");
    const optionsImg = categoryBinding.querySelector("#icon-img-option");
    const optionsUrl = categoryBinding.querySelector("#icon-url-option");

    const updateIconVisibility = () => {
      // Oculta todo por defecto
      if (formContainer) formContainer.classList.add("m-stylemanager-hidden");
      if (formUrlInput) formUrlInput.classList.add("m-stylemanager-hidden");
      if (optionsForm) optionsForm.classList.add("m-stylemanager-hidden");
      if (optionsForm2) optionsForm2.classList.add("m-stylemanager-hidden");
      if (optionsImg) optionsImg.classList.add("m-stylemanager-hidden");
      if (optionsUrl) optionsUrl.classList.add("m-stylemanager-hidden");
      if (iconFamilyContainer)
        iconFamilyContainer.classList.add("m-stylemanager-hidden");
      if (gCartografiaContainer)
        gCartografiaContainer.classList.add("m-stylemanager-hidden");
      if (fontAwesomeContainer)
        fontAwesomeContainer.classList.add("m-stylemanager-hidden");
      if (optionsFamily) optionsFamily.classList.add("m-stylemanager-hidden");

      const checkedRadio = categoryBinding.querySelector(
        'input[name="iconFormType"]:checked'
      );
      if (checkedRadio && checkedRadio.value === "form") {
        if (formContainer)
          formContainer.classList.remove("m-stylemanager-hidden");
        if (optionsForm) optionsForm.classList.remove("m-stylemanager-hidden");
        if (optionsForm2)
          optionsForm2.classList.remove("m-stylemanager-hidden");
        if (optionsImg) optionsImg.classList.remove("m-stylemanager-hidden");
        if (iconFamilyContainer)
          iconFamilyContainer.classList.remove("m-stylemanager-hidden");
        if (iconFamilySelect) {
          if (
            iconFamilySelect.value === "g-cartografia" &&
            gCartografiaContainer
          ) {
            gCartografiaContainer.classList.remove("m-stylemanager-hidden");
          } else if (
            iconFamilySelect.value === "font-awesome" &&
            fontAwesomeContainer
          ) {
            fontAwesomeContainer.classList.remove("m-stylemanager-hidden");
          }
          iconFamilySelect.disabled = false;

          if (iconFamilySelect.value !== "none" && optionsFamily) {
            optionsFamily.classList.remove("m-stylemanager-hidden");
          }
        }
      } else if (checkedRadio && checkedRadio.value === "url") {
        if (formUrlInput)
          formUrlInput.classList.remove("m-stylemanager-hidden");
        if (optionsForm) optionsForm.classList.remove("m-stylemanager-hidden");
        if (optionsUrl) optionsUrl.classList.remove("m-stylemanager-hidden");
        if (iconFamilySelect) {
          iconFamilySelect.disabled = true;
          if (iconFamilyContainer)
            iconFamilyContainer.classList.add("m-stylemanager-hidden");
        }
      }
      this.updateCategoryStyleFromInputs(categoryBinding);
    };

    // Listeners para cambio de tipo de icono
    iconFormRadios.forEach((radio) =>
      radio.addEventListener("change", updateIconVisibility)
    );
    if (iconFamilySelect)
      iconFamilySelect.addEventListener("change", updateIconVisibility);

    categoryBinding.querySelectorAllForEach(
      ".m-stylemanager-grid-form-item",
      (element) => {
        element.addEventListener("click", (e) => {
          categoryBinding
            .querySelectorAll(".m-stylemanager-grid-form-item")
            .forEach((el) => {
              el.classList.remove("selected");
            });
          e.currentTarget.classList.add("selected");
          this.updateCategoryStyleFromInputs(categoryBinding);
        });
      }
    );

    categoryBinding.querySelectorAllForEach(
      ".m-stylemanager-grid-family-item",
      (element) => {
        element.addEventListener("click", (e) => {
          categoryBinding
            .querySelectorAll(".m-stylemanager-grid-family-item")
            .forEach((el) => {
              el.classList.remove("selected");
            });
          e.currentTarget.classList.add("selected");
          this.updateCategoryStyleFromInputs(categoryBinding);
        });
      }
    );

    // Inicializar visibilidad
    updateIconVisibility();
  }

  /**
   * Configura listeners para opacidad sincronizada de categorías
   * @function
   * @param {SimpleCategoryBinding} categoryBinding
   */
  addCategoryOpacityListeners(categoryBinding) {
    categoryBinding.querySelectorAllForEach(
      ".m-stylemanager-range-opacity",
      (element) => {
        const numberInput = element.parentElement.querySelector(
          ".m-stylemanager-number-opacity"
        );
        if (numberInput) {
          element.addEventListener("input", (e) => {
            numberInput.value = Math.round(e.currentTarget.value * 100);
            this.updateCategoryStyleFromInputs(categoryBinding);
          });

          numberInput.addEventListener("input", (e) => {
            element.value = e.currentTarget.value / 100;
            this.updateCategoryStyleFromInputs(categoryBinding);
          });
        }
      }
    );

    categoryBinding.querySelectorAllForEach(
      'input[type="range"]',
      (element) => {
        element.addEventListener("input", (e) => {
          this.updateRangeProgress(e.currentTarget);
        });
        this.updateRangeProgress(element);
      }
    );
  }

  /**
   * @function
   */
  setSelectedRow(id) {
    this.querySelectorAllForEach("td:first-child", (element) => {
      element.classList.remove("m-table-cell-selected");
    });
    this.querySelector(`[id='${id}']`).classList.add("m-table-cell-selected");
  }

  addEventOptionListener() {
    this.querySelectorAllForEach("td:first-child", (element) => {
      element.addEventListener("click", () => {
        this.showSection();
      });
    });
  }

  showSection() {
    this.querySelectorAllForEach(`[data-id='opciones']`, (element) => {
      element.classList.remove("m-stylemanager-hidden");
    });
  }

  /**
   * TODO
   * @function
   */
  // Devuelve el último estilo actualizado por el usuario
  generateStyle() {
    if (this.updatedStyle_) {
      return this.updatedStyle_;
    }
    // Si nunca se ha pulsado 'Actualizar', genera el estilo actual
    return this.generateStyleInternal();
  }

  // Genera el estilo actual (sin guardar)
  generateStyleInternal() {
    let opts = this.generateOptions();
    let style = null;
    if (opts.attributeName !== "") {
      for (let key in opts.options) {
        if (
          this.categoryLabelVisibility_ &&
          this.categoryLabelVisibility_[key] !== false
        ) {
          if (!opts.options[key].options_.label) {
            opts.options[key].options_.label = {
              text: `{{${opts.attributeName}}}`,
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
          }
        } else {
          if (opts.options[key].options_.label) {
            opts.options[key].options_.label = null;
          }
        }
      }
      style = new M.style.Category(opts.attributeName, opts.options);
    }
    return style;
  }

  /**
   * TODO
   * @function
   */
  generateOptions() {
    let styleOptions = {};
    let styleCategories = {};
    styleOptions["attributeName"] = this.querySelector(
      "[data-options='attributeName']"
    ).value;

    Object.keys(this.styleCategories_).forEach((value) => {
      let simpleBinding = this.styleCategories_[value];

      // Usar el estilo actualizado del binding si está disponible
      if (simpleBinding.style_) {
        // Verificar visibilidad de la categoría
        if (
          !this.categoryVisibility_ ||
          this.categoryVisibility_[value] !== false
        ) {
          styleCategories[value] = simpleBinding.style_;
        } else {
          // Crear estilo vacío para categorías ocultas
          let geometry = simpleBinding.geometry_ || "point";
          let emptyStyle;
          if (geometry === "line") {
            emptyStyle = new M.style.Line({
              fill: { color: "rgba(0,0,0,0)", opacity: 0 },
              stroke: { color: "rgba(0,0,0,0)", width: 0 },
              label: simpleBinding.style_.options_.label || null,
            });
          } else if (geometry === "polygon") {
            emptyStyle = new M.style.Polygon({
              fill: { color: "rgba(0,0,0,0)", opacity: 0 },
              stroke: { color: "rgba(0,0,0,0)", width: 0 },
              label: simpleBinding.style_.options_.label || null,
            });
          } else {
            emptyStyle = new M.style.Point({
              fill: { color: "rgba(0,0,0,0)", opacity: 0 },
              stroke: { color: "rgba(0,0,0,0)", width: 0 },
              radius: 0,
              label: simpleBinding.style_.options_.label || null,
            });
          }
          styleCategories[value] = emptyStyle;
        }
      } else {
        // Fallback al método anterior si no hay estilo disponible
        let fill = simpleBinding.fill;
        let stroke = simpleBinding.stroke;
        let icon = simpleBinding.icon || simpleBinding.form;
        let label = simpleBinding.label;
        // Validación de color hexadecimal para fill y stroke
        if (fill && fill.color) {
          if (!/^#[0-9A-Fa-f]{6}$/.test(fill.color)) {
            fill.color = "#ff0000";
          }
        }
        if (stroke && stroke.color) {
          if (!/^#[0-9A-Fa-f]{6}$/.test(stroke.color)) {
            stroke.color = "#ff0000";
          }
        }
        if (fill || stroke || icon || label) {
          styleCategories[value] = this.styleCategories_[value].style;
        }
      }

      if (this.categoryLabelVisibility_[value] === false) {
        styleCategories[value].options_.label = null;
      }
    });

    styleOptions["options"] = styleCategories;

    return styleOptions;
  }

  /**
   * @function
   */
  clearStylesCache() {
    this.savedStylesCache_.clear();
  }

  /**
   * Resetea el binding de categorías, limpiando todos los estilos y la interfaz
   * @function
   */
  reset() {
    const table = this.querySelector(".m-table-category tbody");
    if (table) {
      table.innerHTML = "";
    }

    this.styleCategories_ = {};

    this.clearStylesCache();

    const attributeSelect = this.querySelector(
      "[data-options='attributeName']"
    );
    if (attributeSelect) {
      attributeSelect.selectedIndex = 0;
      attributeSelect.value = "none";
    }

    const optionsSection = this.querySelector("[data-id='opciones']");
    if (optionsSection) {
      optionsSection.classList.add("m-stylemanager-hidden");
    }

    const btn = this.querySelector("[data-update-category-style]");
    const tableContainer = this.querySelector("[data-options='values']");
    if (btn) btn.style.display = "none";
    if (tableContainer) tableContainer.style.display = "none";

    this.updatedStyle_ = null;
    this.categoryVisibility_ = {};
    this.selectedCategory_ = null;
    this.clickedOnTable_ = false;
    this.lastSelectedAttribute_ = null;

    // Aplicar estilo por defecto a la capa inmediatamente
    if (this.layer_ && this.layer_ instanceof M.layer.Vector) {
      // Limpiar cualquier estilo existente primero
      this.layer_.clearStyle();
      // Aplicar el estilo por defecto
      this.layer_.setStyle(M.layer.Vector.DEFAULT_OPTIONS_STYLE);

      // Forzar un refresco del mapa para asegurar que se vean los cambios
      if (this.layer_.getMap && this.layer_.getMap()) {
        this.layer_.getMap().refresh();
      }
    }
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
   * TODO
   * @const
   */
  static get MAXNUMBER_CATEGORIES() {
    return 500;
  }
}
