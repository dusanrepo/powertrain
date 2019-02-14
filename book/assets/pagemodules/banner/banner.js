define(
  ["text!./banner.html", "require", "knockout"],
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

      self.background = config.contentPath + "images/" + data.background;

      self.icon = config.contentPath + "images/" + data.icon;

      self.fontColor = data.color;

      self.type = data.type || "text";

      $('img.background', elem).on('load', function() {
        $(this).addClass('animating');
      })

      //add attribute to expose fact that this is an animated elem
      //initial use case is that we have to force contentview repaint on ios8 Safari
      //which causes animated elements to sometimes break - using this attribute we
      //can target and reset these animations
      //HACKY but at the moment the only way
      $('img.background', elem).attr('data-animated', 'true');

      $(window).on("orientationchange", function(e) {

        $('img.background', elem).removeClass('animating');

        setTimeout(function() {

          $('img.background', elem).addClass('animating');

        }, 500);

      });

    }

    return {
      viewModel: viewModel,
      template: htmlTemplate
    };

  });
