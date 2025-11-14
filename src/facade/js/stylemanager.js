/**
 * @module M/plugin/StyleManager
 */
import "assets/css/stylemanager.css";
import "assets/css/font-awesome.min.css";
import StyleManagerControl from "./stylemanagercontrol.js";
import api from "../../api.json";

export default class StyleManager extends M.Plugin {
  /**
   * @classdesc
   * Main facade plugin object. This class creates a plugin
   * object which has an implementation Object
   *
   * @constructor
   * @extends {M.Plugin}
   * @param {Object} impl implementation object
   * @api stable
   */
  constructor(layer = null) {
    super();
    /**
     * Facade of the map
     * @private
     * @type {M.Map}
     */
    this.map_ = null;

    /**
     * Array of controls
     * @private
     * @type {Array<M.Control>}
     */
    this.controls_ = [];

    /**
     * Metadata from api.json
     * @private
     * @type {Object}
     */
    this.metadata_ = api.metadata;

    /**
     * Name
     * @public
     * @type {string}
     */
    this.name = "StyleManager";

    /**
     * @private
     * @type {M.layer.Vector}
     */
    this.layer_ = layer;

    //helpers handlebars
    Handlebars.registerHelper("sum", function (n1, n2) {
      return n1 + n2;
    });

    Handlebars.registerHelper("neq", function (arg1, arg2, options) {
      if (!Object.equals(arg1, arg2)) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    Handlebars.registerHelper("unless", function (arg1, options) {
      if (!arg1) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    Handlebars.registerHelper("get", function (index, array) {
      return array[index];
    });

    Handlebars.registerHelper("uppercase", function (string) {
      return string.toUpperCase();
    });

    Handlebars.registerHelper("lowercase", function (string) {
      return string.toLowerCase();
    });

    Handlebars.registerHelper("multiply", function (a, b) {
      return a * b;
    });

    Handlebars.registerHelper("eq", function (a, b, options) {
      if (a === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Handlebars.registerHelper("sanitizeId", function (id) {
    //   if (!id) return '';
    //   return id.replace(/[^a-zA-Z0-9_-]/g, '_');
    // });

    M.utils.extends = M.utils.extendsObj;
  }

  /**
   * This function adds this plugin into the map
   *
   * @public
   * @function
   * @param {M.Map} map the map to add the plugin
   * @api stable
   */
  addTo(map) {
    this.controls_.push(new StyleManagerControl(this.layer_));
    this.map_ = map;
    // panel para agregar control - no obligatorio
    this.panel_ = new M.ui.Panel("panelStyleManager", {
      collapsible: true,
      position: M.ui.position.TR,
      className: "m-stylemanager",
    });
    this.panel_.addControls(this.controls_);
    this.panel_.on(M.evt.ADDED_TO_MAP, () => {
      this.fire(M.evt.ADDED_TO_MAP);
    });
    map.addPanels(this.panel_);
  }

  /**
   * This function gets metadata plugin
   *
   * @public
   * @function
   * @api stable
   */
  getMetadata() {
    return this.metadata_;
  }
}
