define(["text!./glossary.html", "knockout", "WebUtility", "perfectScrollbar", "less!./glossary"], function(htmlTemplate, ko, WebUtility, Ps) {

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

    Ps.initialize($(".glossary-list-wrapper", elem)[0], {
      wheelSpeed: 1,
      wheelPropagation: true
    });

    self.createText = self.settings.createText;

    //Stores the HTML for the button icon images
    self.closeImage = ko.observable();

    //Close button image has been updated
    self.settings.closeImage.subscribe(function(newVal) {
      updateButtonImage(self.closeImage, newVal);
    });
    updateButtonImage(self.closeImage, self.settings.closeImage());


    var glossaryList = mBook.GetGlossaryList();
    self.glossaryItems = ko.observable(glossaryList);


    if ($(window).width() > 480) {
      $(".glossary-wrapper", elem).addClass(self.settings.position());
    } else {
      $(".glossary-wrapper", elem).addClass(self.settings.positionMobile());
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

    self.closeGlossary = function() {
      elem.trigger("toggle");
      $('.nav-buttons > button').removeClass("current");
      $('#navigationBar').removeClass("active");
    };

    $(".glossary-overlay").click(function() {
      self.closeGlossary();
    });
  };

  return {
    viewModel: viewModel,
    template: htmlTemplate
  };
});