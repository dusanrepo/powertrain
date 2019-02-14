define(
  ["text!./sub-heading.html", "require", "knockout"],
  function(htmlTemplate, require, ko) {

    function viewModel(params) {
      var self = this;

      self.settings = params.settings;
      self.text = self.settings.data;

    }

    return {
      viewModel: viewModel,
      template: htmlTemplate
    };
  });
