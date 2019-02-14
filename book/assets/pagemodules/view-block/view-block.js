define(
  ["text!./view-block.html", "require", "PageViewModel", "BookReader", "knockout"],
  function(htmlTemplate, require, PageViewModel, BookReader, ko) {

    function viewModel(p) {
      var self = this,
        elem = $(p.elem),
        config = p.config,
        data = p.settings.data,
        options = p.settings.options,
        assets = config.assets,
        mBook = p.mBook,
        themeSettings = p.themeSettings;

      //Create page viewmodel
      self.contentViewModel = new PageViewModel();

      //Use mBook page viewmodel components
      self.contentViewModel.componentVM = mBook.mastervm.backBuffer.componentVM;

      //Convert page data into observable objects
      var pageContent = BookReader.ConvertToPage(ko.mapping.toJS(data()));
      for (var i = 0; i < pageContent.length; i++) {
        var module = pageContent[i];
        var settings = {
          data: module.data
        };

        if (module.options != undefined)
          settings["options"] = module.options;

        self.contentViewModel.insertModule(module.type, settings);
      }

    }

    return {
      viewModel: viewModel,
      template: htmlTemplate
    };
  });