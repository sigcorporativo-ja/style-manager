import M$plugin$StyleManager from '/home/migueldelarosa/github/mapea-publico/src/plugins/v5/stylemanager/src/facade/js/stylemanager';
import M$impl$control$StyleManagerControl from '/home/migueldelarosa/github/mapea-publico/src/plugins/v5/stylemanager/src/impl/ol/js/stylemanagercontrol';

if (!window.M.plugin) window.M.plugin = {};
if (!window.M.impl) window.M.impl = {};
if (!window.M.impl.control) window.M.impl.control = {};
window.M.plugin.StyleManager = M$plugin$StyleManager;
window.M.impl.control.StyleManagerControl = M$impl$control$StyleManagerControl;
