//data()[0]: Accordion Name
//data()[1]: Page content object (observable)

define(
  ["text!./accordion.html", "require", "knockout", "PageViewModel", "BookReader", "WebUtility", "jqueryScrollTo"],
  function(htmlTemplate, require, ko, PageViewModel, BookReader, WebUtility) {

    function viewModel(p) {
      var self = this,
        elem = $(p.elem),
        config = p.config,
        data = p.settings.data,
        options = p.settings.options,
        assets = config.assets,
        mBook = p.mBook,
        themeSettings = p.themeSettings;

      /*
       * KNOCKOUT VIEWMODEL SETUP
       */

      //KO Observable: Accordion title
      self.title = data()[0];

      //KO Observable: Tab icon HTML
      self.iconImage = ko.observable();

      //KO Computed: Tab icon url
      self.icon = ko.computed(function() {
        return assets + themeSettings.icon();
      });

      //Icon url is changed
      self.icon.subscribe(function(newVal) {
        WebUtility.FileToImageTag(newVal, function(html) {
          self.iconImage(html);
        });
      });
      WebUtility.FileToImageTag(self.icon(), function(html) {
        self.iconImage(html);
      });

      //Create page viewmodel for accordion content
      self.contentViewModel = new PageViewModel();

      //Use mBook page viewmodel components
      self.contentViewModel.componentVM = mBook.mastervm.backBuffer.componentVM;

      //Convert page data into observable objects
      var pageContent = BookReader.ConvertToPage(ko.mapping.toJS(data()[1]));
      for (var i = 0; i < pageContent.length; i++) {
        var module = pageContent[i];
        var settings = {
          data: module.data
        };

        if (module.options != undefined)
          settings["options"] = module.options;

        self.contentViewModel.insertModule(module.type, settings);
      }

      /*
       * INTERACTIVE FUNCTIONALITY
       */

      self.press = function() {
        self.toggleState();
        soundManager.play("ui-tap");
      };

      //Internal vm Function: Toggles open/close state of accordion
      self.toggleState = function() {
        elem.toggleClass("open");
        resizeContainer();
        if (options.autoclose()) {
          elem.siblings(".accordion").trigger("close");
        }
      };

      //Setup Triggers
      elem.bind("toggle", function() {
        self.toggleState();
      }).bind("close", function() {
        elem.removeClass("open");
        resizeContainer();
      }).bind("open", function() {
        elem.addClass("open");
        resizeContainer();
      });


      var scrollTimeout;
      function resizeContainer() {

        clearTimeout(scrollTimeout);

        if (elem.hasClass("open")) {
          var outerHeight = 0;
          $(".container", elem).children().each(function() {
            outerHeight += $(this).outerHeight(true);
          });


          $(".container", elem).css("max-height", outerHeight);
          if (options.autoscroll()) {
            scrollTimeout = setTimeout(function() {
              $("#contentView .front-buffer").scrollTo(elem, 500, {
                axis: 'y',
                easing: 'swing'
              });
            }, 500);
          }

        } else {
          $(".container", elem).css("max-height", 0);
        }
      }

      $(window).resize(function() {
        setTimeout(function() { /// hacky timeout -_-
          resizeContainer();
        }, 500);
      });

      (WebUtility.IsMobile()) ? false: $(".link", elem).addClass("hover");

      /*
       * WIDGET EDIT FUNCTIONALITY
       */

    }

    return {
      viewModel: viewModel,
      template: htmlTemplate
    };
  });
