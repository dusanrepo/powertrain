define(
  ["require", "knockout", "jquery"],
  function(require, ko, $) {

    function viewModel() {
      var self = this;

      //ko observable list of modules
      self.modules = ko.observableArray();

      //List of page component constructor objects
      self.componentVM = [];

      //Register a component constructor in the componentVM list
      self.registerComponent = function(vmConstructor) {
        self.componentVM.push(vmConstructor);
      };

      //Insert module from list of named modules registered with "registerModule"
      self.insertModule = function(name, settings) {

        //Get component constructor from list by name
        var cvm = self.componentVM.filter(function(object) {
          return object.name == name;
        })[0];

        //Only continue if component is registered
        if (cvm == undefined) {
          console.log("WARNING: The page viewmodel component " + componentName + " is not registered.");
          return;
        }

        //Convert array of options into object
        var realOptions = {};
        if (settings.options != undefined) {
          var i = 0;
          for (var key in cvm.config.options) {
            var option = cvm.config.options[key][settings.options[i]];
            if (typeof cvm.config.options[key] === "object")
              realOptions[key] = cvm.config.options[key][settings.options[i]];
            else
              realOptions[key] = settings.options[i];
            i++;
          }
        }
        var realSettings = {
          data: settings.data,
          options: realOptions,
          pageIndex: settings.pageIndex
        };

        //override ko mapping create (needed to make array properties observable)
        var mapping = {
          "data": {
            create: function(options) {
              return ko.observable(options.data);
            }
          }
        };

        //Make settings observable using knockout mapping plugin
        var koSettings = {
          settings: ko.mapping.fromJS(realSettings, mapping)
        };

        //Create new object constructor with observable settings merged
        cvm = $.extend({}, cvm, koSettings);

        self.modules.push(cvm);
      };

      //Remove module with position "index" from list of modules registered with "registerModule"
      self.removeModule = function(index) {

      };

      self.clearAll = function() {
        for (var i = 0; i < self.modules().length; i++) {
          var module = self.modules()[i];
          if (module.config.destructor)
            module.config.destructor();
        }
        self.modules.removeAll();
      };
    }

    return viewModel;
  });