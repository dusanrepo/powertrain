define(["text!./taskinfo.html", "knockout", "WebUtility", "perfectScrollbar", "less!./taskinfo"], function(htmlTemplate, ko, WebUtility, Ps) {


  function viewModel(params) {
    var self = this;
    self.settings = params.settings;
    self.options = params.config.options;
    var mBook = params.mBook;
    var elem = $(params.elem);

    function updateButtonImage(button, url) {
      WebUtility.FileToImageTag(params.config.assets + url, function(html) {
        button(html);
      });
    }



    self.createText = self.settings.createText;

    //Stores the HTML for the button icon images
    self.closeImage = ko.observable();

    //Close button image has been updated
    self.settings.closeImage.subscribe(function(newVal) {
      updateButtonImage(self.closeImage, newVal);
    });
    updateButtonImage(self.closeImage, self.settings.closeImage());



    if ($(window).width() > 480) {
      $(".taskinfo-wrapper", elem).addClass(self.settings.position());
    } else {
      $(".taskinfo-wrapper", elem).addClass(self.settings.positionMobile());
    }

    var noteState = false;
    elem.bind("toggle", function() {
      (noteState) ? elem.removeClass("open"): elem.addClass("open");
      noteState = !noteState;
    });
    elem.bind("close", function() {
      elem.removeClass("open");
      noteState = false;
    });

    self.closeTaskinfo = function() {
      elem.trigger("toggle");
      $('.nav-buttons > button').removeClass("current");
      $('#navigationBar').removeClass("active");
    };

    $(".taskinfo-overlay").click(function() {
      self.closeTaskinfo();
    });

    if (!WebUtility.IsMobile()) {
      Ps.initialize($(".taskinfo-content", elem)[0], {
        wheelSpeed: 1,
        wheelPropagation: true
      });
    }

    $(window).resize(function() {
      Ps.update($(".taskinfo-content", elem)[0]);
    });

  };

  return {
    viewModel: viewModel,
    template: htmlTemplate
  };
});