/**
 * Various Utilities
 */


/**
 * Simple parameter adjustment GUI
 * uses p5.gui
 * > https://github.com/bitcraftlab/p5.gui
 * which wraps the quicksettings library which you can access
 * through .prototype for extra functionality
 * > https://github.com/bit101/quicksettings
 */
let _paramGui;
function createParamGui(params, callback) {

  // settings gui
  _paramGui = createGui('Settings');
  // settingsGui.prototype.addButton("Save", function () { storeItem("params", settings) });
  _paramGui.addObject(params)
  if (callback)
    _paramGui.prototype.setGlobalChangeHandler(callback)
  // settingsGui.prototype.addRange('size', 1, 64, 32, 1, function(v) { print("size changed", v) } )


  _paramGui.setPosition(width + 10, 10);
  // the 'S' key hides or shows the GUI
  _paramGui.prototype.setKey("s");

}

function testtest() {
  print("here")
}


