define(["text!./taskreport.html", "knockout", "WebUtility", "perfectScrollbar", "less!./taskreport"], function(htmlTemplate, ko, WebUtility, Ps) {


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
    updateButtonImage(self.closeImage, self.settings.closeImage()); //Stores the HTML for the button icon images

    self.checkbox = ko.observable();

    //Close button image has been updated
    self.settings.checkbox.subscribe(function(newVal) {
      updateButtonImage(self.checkbox, newVal);
    });

    updateButtonImage(self.checkbox, self.settings.checkbox());

    //add icon
    self.addIcon = ko.observable();

    self.settings.addIcon.subscribe(function(newVal) {
      updateButtonImage(self.addIcon, newVal);
    });

    updateButtonImage(self.addIcon, self.settings.addIcon());


    //remove icon
    self.removeIcon = ko.observable();

    self.settings.removeIcon.subscribe(function(newVal) {
      updateButtonImage(self.removeIcon, newVal);
    });

    updateButtonImage(self.removeIcon, self.settings.removeIcon());


    //camera icon
    self.cameraIcon = ko.observable();

    self.settings.cameraIcon.subscribe(function(newVal) {
      updateButtonImage(self.cameraIcon, newVal);
    });

    updateButtonImage(self.cameraIcon, self.settings.cameraIcon());

    self.checkboxes = ko.observableArray()

    self.checkboxes.push({
      id: "check" + self.checkboxes().length,
      text: "Drain engine oil from sump",
      checkbox: self.checkbox,
      checked: ko.observable(true)
    });

    self.checkboxes.push({
      id: "check" + self.checkboxes().length,
      text: "Used oil filter discarded correctly",
      checkbox: self.checkbox,
      checked: ko.observable(false)
    });

    self.checkboxes.push({
      id: "check" + self.checkboxes().length,
      text: "New oil filter inspected and installed",
      checkbox: self.checkbox,
      checked: ko.observable(false)
    });

    self.checkboxes.push({
      id: "check" + self.checkboxes().length,
      text: "Sufficient vehicle fluid",
      checkbox: self.checkbox,
      checked: ko.observable(false)
    });

    self.checkboxes.push({
      id: "check" + self.checkboxes().length,
      text: "Oil filter assembly free from leakages",
      checkbox: self.checkbox,
      checked: ko.observable(false)
    });

    self.checkboxes.push({
      id: "check" + self.checkboxes().length,
      text: "Sufficient oil level (dipstick)",
      checkbox: self.checkbox,
      checked: ko.observable(false)
    });

    self.checkboxes.push({
      id: "check" + self.checkboxes().length,
      text: "Refill engine with 40 litres of new oil",
      checkbox: self.checkbox,
      checked: ko.observable(false)
    });

    self.checkboxes.push({
      id: "check" + self.checkboxes().length,
      text: "Check engine for leakages",
      checkbox: self.checkbox,
      checked: ko.observable(false)
    });



    self.enableSubmit = ko.computed(function() {

      var i = 0,
        checkboxes = self.checkboxes(),
        len = checkboxes.length;

      for (; i < len; i++)
        if (checkboxes[i].checked() == false) return false;

      return true;

    })

    self.uploadFile = function(e, f) {
      $("#upload" + e.i).click();
    }

    self.faults = ko.observableArray([{
      i: 0,
      cameraIcon: self.cameraIcon,
      uploadFile: self.uploadFile,

      //file upload change
      filename: ko.observable("")

    }]);

    self.faults.subscribe(function() {
      for (var i = 0; i < self.faults().length; i++) {
        self.faults()[i].i = i;
      }
      self.faults();
    });


    self.uploaded = function(e, f) {
      var file = f.target.files[0].name;
      e.filename("<span style='position:relative;bottom:7px;'>" + file + "</span>" + self.checkbox());;
    };

    self.addFault = function() {
      if (self.faults().length < 3)
        self.faults.push({
          i: self.faults().length,
          cameraIcon: self.cameraIcon,
          uploadFile: self.uploadFile,
          //file upload change
          filename: ko.observable(""),
        });
      Ps.update($(".taskreport-content", elem)[0]);
    }

    self.removeFault = function() {
      self.faults.remove(this);
      Ps.update($(".taskreport-content", elem)[0]);
    }

    self.submitTaskComplete = function() {
      self.closeTaskreport();
      $(".lightbox").trigger("open", $("<div class='complete'><h2>Task Complete</h2><p>Form submitted. You have now completed the Oil Filter Change task, please return to the portal to begin another task.</p></div>"), "", false);
    }

    $(window).resize(function() {
      Ps.update($(".taskreport-content", elem)[0]);
    });

    if ($(window).width() > 480) {
      $(".taskreport-wrapper", elem).addClass(self.settings.position());
    } else {
      $(".taskreport-wrapper", elem).addClass(self.settings.positionMobile());
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

    self.closeTaskreport = function() {
      elem.trigger("toggle");
      $('.nav-buttons > button').removeClass("current");
      $('#navigationBar').removeClass("active");
    };

    $(".taskreport-overlay").click(function() {
      self.closeTaskreport();
    });

    if (!WebUtility.IsMobile()) {
      Ps.initialize($(".taskreport-content", elem)[0], {
        wheelSpeed: 1,
        wheelPropagation: true
      });
    }



  };

  return {
    viewModel: viewModel,
    template: htmlTemplate
  };
});