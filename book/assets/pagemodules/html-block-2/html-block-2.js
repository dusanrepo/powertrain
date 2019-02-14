define(
  ["text!./html-block-2.html", "require", "knockout"],
  function(htmlTemplate, require, ko) {

    function viewModel(params) {
      var self = this,
          config = params.config,
          data = params.settings.data()[0]();

      self.settings = params.settings;
      self.html = self.settings.data;
      //Background Image
      self.background = config.contentPath + "images/" + data.background;
      // console.log('data.background=' + data.background);
      //Title
      self.title = data.title;
      //Sub Title
      self.sub_title = data.sub_title;
      //Description
      self.description = data.description;
    }

    return {
      viewModel: viewModel,
      template: htmlTemplate
    };
  });
