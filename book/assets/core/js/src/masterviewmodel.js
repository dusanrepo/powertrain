define(
  ["require", "knockout", "UIViewModel", "PageViewModel"],
  function(require, ko, UIViewModel, PageViewModel) {

    function viewModel() {
      var self = this;
      self.isBack = ko.observable(true);

      //User interface widgets view-model
      self.uiViewModel = new UIViewModel();

      //Page content view-models
      self.frontBuffer = new PageViewModel();
      self.backBuffer = new PageViewModel();

      //Points current buffer used for writing into
      self.currentBuffer = self.backBuffer;

      //Points to page being currently shown
      self.currentlyViewed = self.frontBuffer;

      self.swapBuffers = function() {

        if(self.isBack()){
          self.currentBuffer = self.frontBuffer;
          self.currentlyViewed = self.backBuffer;
        }
        else {
          self.currentBuffer = self.backBuffer;
          self.currentlyViewed = self.frontBuffer;
        }

        self.isBack(!self.isBack());

      };
    }

    return viewModel;
  });
