/**
 * @module M/plugin/StyleManager
 */
import 'css/stylemanager.css';
import 'css/font-awesome.min.css';
import StyleManagerControl from './stylemanagerControl.js';
import {
  ColorPickerPolyfill
}
  from './utils/colorpicker';
import 'templates/categorystyles.html';

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
     * @private
     * @type {M.ui.Panel}
     */
    this.panel_ = null;

    /**
     * @private
     * @type {M.layer.Vector}
     */
    this.layer_ = layer;

    ColorPickerPolyfill.apply(window);


    //helpers handlebars
    Handlebars.registerHelper('sum', function (n1, n2) {
      return n1 + n2;
    });

    Handlebars.registerHelper('neq', function (arg1, arg2, options) {
      if (!Object.equals(arg1, arg2)) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    Handlebars.registerHelper('unless', function (arg1, options) {
      if (!arg1) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    Handlebars.registerHelper('get', function (index, array) {
      return array[index];
    });

    Handlebars.registerHelper('uppercase', function (string) {
      return string.toUpperCase();
    });

    Handlebars.registerHelper('lowercase', function (string) {
      return string.toLowerCase();
    });

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
    this.panel_ = new M.ui.Panel(StyleManager.NAME, {
      'collapsible': true,
      'className': 'm-stylemanager',
      'collapsedButtonClass': 'g-sigc-palette',
      'position': M.ui.position.TL,
      'tooltip': 'Simbología',
    });
    this.panel_.addControls(this.controls_);
    map.addPanels(this.panel_);
  }

  /**
   * TODO
   */
  destroy() {
    this.map_.removeControls(this.controls_);
    [this.control_, this.panel_, this.map_] = [null, null, null];
  }

  get name() {
    return "stylemanager";
  }
}
