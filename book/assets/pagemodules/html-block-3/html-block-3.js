define(
  ["text!./html-block-3.html", "require", "knockout"],
  function(htmlTemplate, require, ko) {

    function viewModel(params) {
      var self = this;

      self.settings = params.settings;
      self.html = self.settings.data;

    }

    return {
      viewModel: viewModel,
      template: htmlTemplate
    };
  });