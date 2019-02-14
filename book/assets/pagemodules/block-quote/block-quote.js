define(
  ["text!./block-quote.html", "require", "knockout"],
  function(htmlTemplate, require, ko) {

    function viewModel(params) {
      var self = this,
          data = params.settings.data();

      self.settings = params.settings;

      //break and concat quote if array of items
      self.quote = data.quote.reduce(function(acc, curr) {
        return acc + "<br>" + curr;
      });

      self.cite = data.cite;
    }

    return {
      viewModel: viewModel,
      template: htmlTemplate
    };
  });
