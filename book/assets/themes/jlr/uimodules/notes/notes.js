define(["text!./notes.html", "knockout", "WebUtility", "perfectScrollbar", "less!./notes"], function(htmlTemplate, ko, WebUtility, Ps) {

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

    Ps.initialize($(".note-list-wrapper", elem)[0], {
      wheelSpeed: 1,
      wheelPropagation: true
    });

    self.createText = self.settings.createText;

    //Stores the HTML for the button icon images
    self.editImage = ko.observable();
    self.deleteImage = ko.observable();
    self.closeImage = ko.observable();

    //Edit button image has been updated
    self.settings.editImage.subscribe(function(newVal) {
      updateButtonImage(self.editImage, newVal);
    });
    updateButtonImage(self.editImage, self.settings.editImage());

    //Delete button image has been updated
    self.settings.deleteImage.subscribe(function(newVal) {
      updateButtonImage(self.deleteImage, newVal);
    });
    updateButtonImage(self.deleteImage, self.settings.deleteImage());

    //Close button image has been updated
    self.settings.closeImage.subscribe(function(newVal) {
      updateButtonImage(self.closeImage, newVal);
    });
    updateButtonImage(self.closeImage, self.settings.closeImage());

    self.viewMode = ko.observable("current");
    self.currentPage = ko.observable(mBook.GetCurrentPage());
    self.isNoteVisible = function(pageIndex) {
      return self.viewMode() == "all" || (self.viewMode() == "current" && self.currentPage() == pageIndex);
    };

    var noteList = mBook.userProfile.GetCustomData("notes");
    self.noteItems = ko.observableArray(noteList);

    self.emptyText = ko.computed(function() {
      return (self.noteItems().length == 0) ? self.settings.emptyAll() : self.settings.emptyCurrent();
    });

    self.emptyTextVisible = ko.computed(function() {
      if (self.noteItems().length == 0)
        return true;
      else if (self.viewMode() == "current") {
        for (var i = 0; i < self.noteItems().length; i++) {
          if (self.noteItems()[i].pIndex == self.currentPage())
            return false;
        }
        return true;
      }
    });

    self.noteToCreate = ko.observable("");
    self.createNote = function() {
      if (self.noteToCreate() == "") return;
      self.noteItems.push({
        pIndex: mBook.GetCurrentPage(),
        content: self.noteToCreate()
      });
      self.noteToCreate("");

      $(".note-list-wrapper", elem)[0].scrollTop = $(".note-list-wrapper", elem)[0].scrollHeight;

      mBook.userProfile.ModifyCustomData("notes", self.noteItems());
      mBook.userProfile.Save();
    };

    self.closeNotes = function() {
      elem.trigger("toggle");
    };

    mBook.Event("onRefresh", function() {
      self.currentPage(mBook.GetCurrentPage());
      elem.trigger("close");
    });

    if ($(window).width() > 480) {
      $(elem).addClass(self.settings.position());
    } else {
      $(elem).addClass(self.settings.positionMobile());
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
  };

  return {
    viewModel: viewModel,
    template: htmlTemplate
  };
});