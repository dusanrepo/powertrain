define(
  ["require", "knockout", "core/js/src/pageviewmodel", "core/js/src/BookReader", "WebUtility", "jqueryScrollTo"],
  function(require, ko, PageViewModel, BookReader, WebUtility) {

    function viewModel(p) {
      var self = this,
        elem = $(p.elem),
        config = p.config,
        data = p.settings.data,
        options = p.settings.options,
        assets = config.assets,
        mBook = p.mBook,
        themeSettings = p.themeSettings;

      /*
       * KNOCKOUT VIEWMODEL SETUP
       */



      /*
       * INTERACTIVE FUNCTIONALITY
       */



      /*
       * WIDGET EDIT FUNCTIONALITY
       */

    }

    return viewModel;
  });