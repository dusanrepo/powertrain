define(
  ["text!./bannervideo.html", "require", "knockout"],
  function(htmlTemplate, require, ko) {

    function viewModel(p) {

      var self = this,
        elem = $(p.elem),
        config = p.config,
        data = p.settings.data()[0](),
        options = p.settings.options,
        assets = config.assets,
        mBook = p.mBook,
        themeSettings = p.themeSettings;

      var location = mBook.GetLocation(mBook.bufferIndexPage);

      self.text = data.title.reduce(function(acc, curr) {
        return acc + "<br>" + curr;
      });

      self.backgroundvideo = config.contentPath + "videos/" + data.backgroundvideo;

      self.fontColor = data.color;

      self.type = data.type || "text";

    }

    return {
      viewModel: viewModel,
      template: htmlTemplate
    };

  });
