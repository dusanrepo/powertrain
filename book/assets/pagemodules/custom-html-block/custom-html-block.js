define(
  ["require", "knockout"],
  function(require, ko) {

    function viewModel(params) {
      var self = this;

      self.settings = params.settings;
      self.html = self.settings.data;

    }

    return viewModel;
  });