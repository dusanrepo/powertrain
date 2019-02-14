define(
  ["jquery", "knockout", "komapping", "WebUtility"],
  function($, ko, komapping, util) {
    ko.mapping = komapping;

    "use strict";

    /**
     * Loads mBook Themes. This class uses the ModuleLoader class to load the theme's modules
     *
     * @constructs ThemeLoader
     *
     * @param {String} modulePath The path to the module files. Do not include any file names. Only supply the path to them.
     *
     * @example
     * //Require the ThemeLoader class
     * require(["jquery", "core/js/src/ThemeLoader"], function($, ThemeLoader) {
     *
     * 	//Create ThemeModule object with given module path
     * 	var theme = new ThemeLoader("path/to/theme");
     *
     * 	//Load the theme
     * 	theme.Load(function(){
     * 		//... some code here
     * 	});
     *
     * });
     *
     */
    function ThemeLoader(themePath, themeSettings) {

      //IMPORTANT
      //Ensures that Class is invoked with "new"
      //Stops private variables leaking into the global namespace
      if (!(this instanceof ThemeLoader)) {
        throw new TypeError("ThemeLoader constructor cannot be called as a function.");
      }

      this.loaded = false;

      //Store the path to the theme
      this.path = themePath;

      this.config = {};
      this.settings = themeSettings;

      //Get the module name from the end of the module path
      var pathArray = themePath.split("/");
      this.folderName = pathArray[pathArray.length - 1];

    }

    //Public
    ThemeLoader.prototype = {

      //IMPORTANT
      constructor: ThemeLoader,

      /**
       * Loads the theme into the mBook. All modules that belong to this theme are also loaded.
       * @memberof ThemeLoader.prototype
       *
       * @param {Function} loadedCallback Function to be called when loading is finished. GetHTML will not work until the module has been loaded.
       *
       */
      Load: function(mBookInstance) {

        var self = this;
        if (self.loaded) return;

        //Theme config file location
        var themeLocation = self.path + "/" + self.folderName;

        //Load the theme configuration file
        require(["text!" + themeLocation + ".json", "less!" + themeLocation], function(data) {

          //	util.LoadLESS(require.toUrl(themeLocation));

          self.config = JSON.parse(data);

          var vm = mBookInstance.mastervm.uiViewModel;

          window.vm = vm;
          window.ko = ko;

          //Get the JSON config files for each ui module
          var moduleConfigLocations = [],
            moduleNames = [];
          for (var key in self.settings) {
            moduleNames.push(key);
            moduleConfigLocations.push("text!" + self.path + "/uimodules/" + key + "/" + key + ".json");
          }

          require(moduleConfigLocations, function() {

            for (var i = 0; i < arguments.length; i++) {

              var moduleName = moduleNames[i];

              var moduleConfig = JSON.parse(arguments[i]);
              var moduleSettings = self.settings[moduleName];
              moduleConfig.timestamp = new Date(moduleConfig.timestamp);
              moduleConfig.root = self.path + "/uimodules/" + moduleName;
              moduleConfig.assets = self.path + "/assets/";

              var UIModule = {
                name: "uiwidget-" + moduleName,
                className: moduleName,
                id: moduleConfig.id,
                settings: ko.mapping.fromJS(moduleSettings),
                config: moduleConfig,
                mBookInstance: mBookInstance
              };

              ko.components.register(UIModule.name, {
                require: self.path + "/uimodules/" + moduleName + "/" + moduleName
              });

              vm.modules.push(UIModule);
            }
            ko.applyBindings(mBookInstance.mastervm);
          });
        });

      },

      /**
       * Retreives the value of a theme setting. Theme settings are the selected values for module "options". See Module.GetOptions() for more information.
       * @memberof ThemeLoader.prototype
       *
       * @param {String} moduleName The name of the theme module to retreive setting from.
       * @param {String} setting The name setting to be retrieved.
       *
       */
      GetSetting: function(moduleName, setting) {

        var settingValue = this.config.settings[moduleName][setting];

        if (settingValue != undefined) {
          return settingValue;
        } else {
          console.log("WARNING: The setting " + moduleName + "." + setting + " is not defined.");
          return "";
        }
      }

    };

    return ThemeLoader;

  });