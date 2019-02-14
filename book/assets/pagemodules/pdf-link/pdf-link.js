define(
  ["text!./pdf-link.html", "WebUtility"],
  function(htmlTemplate, WebUtility) {

    function viewModel(p) {
      var self = this,
        elem = $(p.elem),
        config = p.config,
        data = p.settings.data,
        options = p.settings.options,
        assets = config.assets,
        mBook = p.mBook,
        themeSettings = p.themeSettings;
      self.config = p.config;

      /*
       * KNOCKOUT VIEWMODEL SETUP
       */
      self.pdfSrc = ko.computed(function() {
        return self.config.contentPath + "/" + data()[0]();
      }, self);
      self.caption = data()[1];

      self.icon = ko.observable();
      self.iconUrl = ko.computed(function() {
        return assets + themeSettings.icon();
      });
      self.iconUrl.subscribe(function(newVal) {
        WebUtility.FileToImageTag(newVal, function(html) {
          self.icon(html);
        });
      });
      WebUtility.FileToImageTag(self.iconUrl(), function(html) {
        self.icon(html);
      });

      /*
       * INTERACTIVE FUNCTIONALITY
       */



      /*
       * WIDGET EDIT FUNCTIONALITY
       */

    }

    return {
      viewModel: viewModel,
      template: htmlTemplate
    };
  });