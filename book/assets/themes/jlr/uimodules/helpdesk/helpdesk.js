define(["text!./helpdesk.html", "knockout", "WebUtility", "perfectScrollbar", "less!./helpdesk"], function(htmlTemplate, ko, WebUtility, Ps) {


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
      $(".helpdesk-wrapper", elem).addClass(self.settings.position());
    } else {
      $(".helpdesk-wrapper", elem).addClass(self.settings.positionMobile());
    }

    var first = true;
    var noteState = false;
    elem.bind("toggle", function() {
      (noteState) ? elem.removeClass("open"): elem.addClass("open");
      noteState = !noteState;

      if (first) {
        first = false;
        hdTime = setTimeout(function() {
          self.status("Helpdesk is writing a message...");
          hdrespond = setTimeout(function() {
            self.messageList.push({
              msg: "Hello, how may I be of assistance?",
              name: "Helpdesk",
              id: "receiver"
            });
            $(".messages", elem)[0].scrollTop = $(".messages", elem)[0].scrollHeight;
            self.status("");
          }, 2000);
        }, 1000);
      }

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

    $(".helpdesk-overlay").click(function() {
      self.closeTaskinfo();
    });

    if (!WebUtility.IsMobile()) {
      /*	Ps.initialize($(".helpdesk-content", elem)[0], {
      	  wheelSpeed: 1,
      	  wheelPropagation: true
      	});
      	Ps.initialize($(".messages", elem)[0], {
      	  wheelSpeed: 1,
      	  wheelPropagation: true
      	});*/
    }

    $(window).resize(function() {
      //	 Ps.update($(".helpdesk-content", elem)[0]);
    });

    self.messageList = ko.observableArray();




    self.status = ko.observable("");

    var hdTime, hdrespond;

    $("textarea", elem).keypress(function(e) {
      if (e.which == 13) {
        self.sendMessage();
        return false;
      }
    });

    self.sendMessage = function() {
      var text = $("textarea", elem).val();
      if (text.length) {
        clearTimeout(hdTime);
        clearTimeout(hdrespond);
        self.status("");
        self.messageList.push({
          msg: text,
          name: "You",
          id: "sender"
        });
        $("textarea", elem).val("");
        $(".messages", elem)[0].scrollTop = $(".messages", elem)[0].scrollHeight;
        hdTime = setTimeout(function() {
          self.status("Helpdesk is writing a message...");
          hdrespond = setTimeout(function() {
            self.messageList.push({
              msg: "Thank you for contacting the helpdesk.",
              name: "Helpdesk",
              id: "receiver"
            });
            self.status("");
            $(".messages", elem)[0].scrollTop = $(".messages", elem)[0].scrollHeight;
          }, 2000);
        }, 1000);
      }


    };

  };

  return {
    viewModel: viewModel,
    template: htmlTemplate
  };
});