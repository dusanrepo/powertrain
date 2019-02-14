define(
  ["text!./column-block.html", "require", "knockout"],
  function(htmlTemplate, require, ko) {

    function viewModel(params) {
      var self = this;

      self.html = params.settings.data;
      self.maxColumns = params.settings.options.maxColumns;
    }

    return {
      viewModel: viewModel,
      template: htmlTemplate
    };
  });