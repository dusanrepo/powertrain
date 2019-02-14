define(
  ["require", "knockout"],
  function(require, ko) {

    function viewModel() {

      this.modules = ko.observableArray();

      self.insertModule = function(name, settings) {

      };

      this.removeUIModule = function(name) {

      };

      self.clearAll = function() {
        self.modules.removeAll();
      };
    }

    return viewModel;
  });