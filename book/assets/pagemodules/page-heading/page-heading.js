define(
  ["text!./page-heading.html", "require", "knockout"],
  function(htmlTemplate, require, ko) {

    function viewModel(params) {

      var self = this;
      var mBook = params.mBook;
      var themeSettings = params.themeSettings;

      var location = mBook.GetLocation(mBook.bufferIndexPage);

      var pageTitle = themeSettings.fullTitle() ?
        location.reduce(function(acc, curr) {
          return acc + "<br><span>" + curr + "</span>";
        }) :
        location[location.length - 1];

      self.html = pageTitle;

    }

    return {
      viewModel: viewModel,
      template: htmlTemplate
    };
  });