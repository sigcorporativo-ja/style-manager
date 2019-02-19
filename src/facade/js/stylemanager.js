import namespace from 'mapea-util/decorator';
import StyleManagerControl from './stylemanagerControl.js';
import {
  ColorPickerPolyfill
}
from './utils/colorpicker';
import css from 'assets/css/stylemanager.css';
import fonts from 'assets/fonts/sigc.eot';
import fonts2 from 'assets/fonts/sigc.woff';
import fonts3 from 'assets/fonts/sigc.svg';
import fonts4 from 'assets/fonts/sigc.ttf';
import 'templates/categorystyles.html';

@namespace("M.plugin")
class StyleManager extends M.Plugin {

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
     * add your variables
     *
     */

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
    Handlebars.registerHelper('sum', function(n1, n2) {
      return n1 + n2;
    });

    Handlebars.registerHelper('neq', function(arg1, arg2, options) {
      if (!Object.equals(arg1, arg2)) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    Handlebars.registerHelper('unless', function(arg1, options) {
      if (!arg1) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    Handlebars.registerHelper('get', function(index, array) {
      return array[index];
    });

    Handlebars.registerHelper('uppercase', function(string) {
      return string.toUpperCase();
    });

    Handlebars.registerHelper('lowercase', function(string) {
      return string.toLowerCase();
    });

    // patch: mapea 5 api change
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
    this.controls_.push(new M.control.StyleManagerControl(this.layer_));
    this.map_ = map;
    this.panel_ = new M.ui.Panel(M.plugin.StyleManager.NAME, {
      'collapsible': true,
      'className': 'm-stylemanager',
      'collapsedButtonClass': 'g-sigc-palette',
      'position': M.ui.position.TL
    });
    this.panel_.addControls(this.controls_);
    map.addPanels(this.panel_);
  }

  /**
   * TODO
   */
  destroy() {
    this.panel_.removeControls(this.controls_);
    this.panel_ = null;
    this.controls_ = [];
    this.map_ = null;
  }

  static get NAME() {
    return "stylemanager";
  }
}
