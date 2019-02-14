define(
  ["text!./video-player.html", "require", "knockout", "PageViewModel", "BookReader", "WebUtility", "jquery", "jqueryScrollTo"],
  function (htmlTemplate, require, ko, PageViewModel, BookReader, WebUtility, $)
  {
      if (ko.bindingHandlers.fadeVisible == undefined)
      {
          ko.bindingHandlers.fadeVisible = {
              init: function (element, valueAccessor)
              {
                  // Initially set the element to be instantly visible/hidden depending on the value
                  var value = valueAccessor();
                  $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
              },
              update: function (element, valueAccessor)
              {
                  // Whenever the value subsequently changes, slowly fade the element in or out
                  var value = valueAccessor();
                  ko.unwrap(value) ? $(element).fadeIn() : $(element).fadeOut();
              }
          };
      }

      var TRANSPORT_DISPLAY_TIME = 3000;

      function toHMS(seconds)
      {
          var sec_num = parseInt(seconds, 10);
          var hours = Math.floor(sec_num / 3600);
          var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
          var seconds = sec_num - (hours * 3600) - (minutes * 60);
          if (!hours) hours = "";
          else hours += ":";
          //	if(hours   < 10) {hours   = "0"+hours + ":";}
          //	if(minutes < 10) {minutes = "0"+minutes;}
          if (seconds < 10)
          {
              seconds = "0" + seconds;
          }
          return hours + minutes + ':' + seconds;
      }

      function viewModel(p)
      {
          var self = this,
            elem = $(p.elem),
            config = p.config,
            data = p.settings.data,
            options = p.settings.options,
            assets = config.assets,
            mBook = p.mBook,
            themeSettings = p.themeSettings;

          //Element selectors
          var video = $("video", elem)[0];
          var bigPlayButton = $(".play-button", elem);
          var playButton = $(".transport > button:eq(0)", elem);
          var pauseButton = $(".transport > button:eq(1)", elem);
          var fullscreenButton = $(".transport > button:eq(2)", elem)[0];

          //Element intializers
          elem.addClass("inactive");
          pauseButton.hide();

          /*
           * KNOCKOUT VIEWMODEL SETUP
           */

          data.subscribe(function (newVal)
          {
              setTimeout(function ()
              {
                  video.load();
              }, 1000);
          });
          self.videoSource = ko.computed(function ()
          {
              return "assets/content/" + data().video;
          });
          self.autoPlay = options.autoplay;
          self.controls = options.controls;

          self.transportVisible = ko.observable(false);

          //Big Play button icon
          self.playBigIcon = ko.observable();
          self.playBigIconUrl = ko.computed(function ()
          {
              return assets + themeSettings.bigPlayIcon();
          });
          self.playBigIconUrl.subscribe(function (newVal)
          {
              WebUtility.FileToImageTag(newVal, function (html)
              {
                  self.playBigIcon(html);
              });
          });
          WebUtility.FileToImageTag(self.playBigIconUrl(), function (html)
          {
              self.playBigIcon(html);
          });

          //Play button icon
          self.playIcon = ko.observable();
          self.playIconUrl = ko.computed(function ()
          {
              return assets + themeSettings.playIcon();
          });
          self.playIconUrl.subscribe(function (newVal)
          {
              WebUtility.FileToImageTag(newVal, function (html)
              {
                  self.playIcon(html);
              });
          });
          WebUtility.FileToImageTag(self.playIconUrl(), function (html)
          {
              self.playIcon(html);
          });

          //Pause icon
          self.pauseIcon = ko.observable();
          self.pauseIconUrl = ko.computed(function ()
          {
              return assets + themeSettings.pauseIcon();
          });
          self.pauseIconUrl.subscribe(function (newVal)
          {
              WebUtility.FileToImageTag(newVal, function (html)
              {
                  self.pauseIcon(html);
              });
          });
          WebUtility.FileToImageTag(self.pauseIconUrl(), function (html)
          {
              self.pauseIcon(html);
          });

          self.currentTime = ko.observable(video.currentTime || 0);
          self.duration = ko.observable(video.duration);
          self.volume = ko.observable(video.volume);

          self.position = ko.computed(function ()
          {
              return toHMS(self.currentTime());
          });
          self.positionPercent = ko.computed(function ()
          {
              return ((self.currentTime() / self.duration()) * 100) + "%";
          });
          self.totalTime = ko.computed(function ()
          {
              return toHMS(self.duration());
          });

          self.volumePercent = ko.computed(function ()
          {
              return ((0.06 + parseFloat(self.volume())) * 80) + "%"; //between 6% and 84% for slider position
          });

          self.volumePercent.subscribe(function (newVal)
          {
              video.volume = parseFloat(self.volume());
          });

          self.volControlVisible = ko.observable(false);

          //Video events
          self.currentTime(0);
          video.ontimeupdate = function ()
          {
              //		console.log("timeupdate");
              self.currentTime(video.currentTime);
          };

          video.onloadedmetadata = function ()
          {
              self.duration(video.duration);
              $(video).attr('preload', 'none');
          };

          video.onwaiting = function ()
          {
              elem.addClass("inactive");
          };

          video.onstalled = function ()
          {
              //	console.log("stalled");
          };

          video.onsuspend = function ()
          {
              //		console.log("suspend");
          };

          video.onabort = function ()
          {
              //  console.log("suspend");
          };

          video.onplaying = function ()
          {
              bigPlayButton.fadeOut(500);
              elem.removeClass("inactive");
              pauseButton.show();
              playButton.hide();
              //		console.log("playing");
          };

          video.onloadstart = function ()
          {
              //		console.log(" load start");
              //		console.log("waiting")
          };

          video.onended = function ()
          {
              bigPlayButton.fadeIn(500);
              elem.addClass("inactive");
              self.transportVisible(true);
              //		console.log("ended pause");
              self.pause();
          };

          video.onpause = function ()
          {
              pauseButton.hide();
              playButton.show();
              elem.addClass("inactive");
              //		console.log("pause");
          };

          video.onprogress = function ()
          {
              //		console.log(video.buffered)
              //		console.log(video.seekable)
          }

          video.onerror = function ()
          {
              //		console.log("error");
          }


          self.volumeIcon = ko.observable();
          self.volumeIconUrl = ko.computed(function ()
          {
              return assets + themeSettings.volumeIcon();
          });
          self.volumeIconUrl.subscribe(function (newVal)
          {
              WebUtility.FileToImageTag(newVal, function (html)
              {
                  self.volumeIcon(html);
              });
          });
          WebUtility.FileToImageTag(self.volumeIconUrl(), function (html)
          {
              self.volumeIcon(html);
          });

          self.fullscreenIcon = ko.observable();
          self.fullscreenIconUrl = ko.computed(function ()
          {
              return assets + themeSettings.fullscreenIcon();
          });
          self.fullscreenIconUrl.subscribe(function (newVal)
          {
              WebUtility.FileToImageTag(newVal, function (html)
              {
                  self.fullscreenIcon(html);
              });
          });
          WebUtility.FileToImageTag(self.fullscreenIconUrl(), function (html)
          {
              self.fullscreenIcon(html);
          });

          /*
           * INTERACTIVE FUNCTIONALITY
           */

          self.play = function ()
          {

              $('.video-player video').each(function (el)
              {

                  if (this != video)
                  {
                      this.pause();

                  }


              });



              video.play();

              fadeTransport();
          };

          self.pause = function ()
          {
              //	console.log("pause pause");
              video.pause();
              //	pauseButton.hide();
              //	playButton.show();
              //	elem.addClass("inactive");
          };

          //seeker
          var seekTrigger = false;
          self.seekClick = function (data, event)
          {
              var t = event.delegateTarget;
              var posX = $(t).offset().left;
              var width = $(t).width();
              var ratio = ((event.pageX == undefined ? event.touches[0].pageX : event.pageX) - posX) / width;
              video.currentTime = ratio * self.duration();
              seekTrigger = true;
          };

          self.seekMove = function (data, event)
          {
              if (!seekTrigger) return;
              var t = event.delegateTarget;
              var posX = $(t).offset().left;
              var width = $(t).width();
              var ratio = ((event.pageX == undefined ? event.touches[0].pageX : event.pageX) - posX) / width;
              video.currentTime = ratio * self.duration();
          };

          self.seekLift = function (data, event)
          {
              seekTrigger = false;
          };

          self.hideVolControls = ko.observable(WebUtility.IsMobile());

          //volume controller
          var volTrigger = false;
          self.volClick = function (data, event)
          {
              var t = event.delegateTarget;
              var posY = $(t).offset().top + 5;
              var height = $(t).height() - 10;
              var ratio = Math.min(
                            Math.max((
                              (event.pageY == undefined ? event.touches[0].pageY : event.pageY)
                               - posY) / height,
                            0),
                          1);

              self.volume(1 - ratio);
              volTrigger = true;
          };

          self.volMove = function (data, event)
          {
              if (!volTrigger) return;
              var t = event.delegateTarget;
              var posY = $(t).offset().top + 5;
              var height = $(t).height() - 10;
              var ratio = Math.min(
                            Math.max((
                              (event.pageY == undefined ? event.touches[0].pageY : event.pageY)
                               - posY) / height,
                            0),
                          1);
              self.volume(1 - ratio);
          };

          self.volLift = function (data, event)
          {
              volTrigger = false;
          };

          self.volToggle = function ()
          {
              self.volControlVisible(!self.volControlVisible());
          };

          //hide/show transport

          self.transportActive = function ()
          {
              self.transportVisible(true);
              clearTimeout(fadeTimeout);
              fadeTransport();
              return true;
          };

          self.transportInactive = function ()
          {
              self.transportVisible(false);
              clearTimeout(fadeTimeout);
              return false;
          };

          var fadeTimeout = null;

          function fadeTransport()
          {
              //	if(!video.paused && WebUtility.IsMobile()) {
              fadeTimeout = setTimeout(function ()
              {
                  self.transportVisible(false);
              }, TRANSPORT_DISPLAY_TIME);
              //	}
          }

          self.toggleFullscreen = function ()
          {

              WebUtility.ToggleFullScreen(elem[0], function ()
              {
                  self.maxWidth(undefined);
                  //Fix fullscreen swipe bug, disable swipeable elements behind fullscreen
                  setTimeout(function ()
                  {
                      $(".swipe-enabled").swipe("disable");
                      elem.addClass("fullscreen");
                  }, 10);

                  //Hide message if one element is present
                  $(".video-message").css("display", "none");

              },
              function ()
              {
                  self.maxWidth(data().width);
                  $(window).off('resize');

                  setTimeout(function ()
                  {
                      $(".swipe-enabled").swipe("enable");
                      elem.removeClass("fullscreen");
                  }, 10);

                  $(".video-message").css("display", "block");

              });
          };

          self.videoPoster = config.contentPath + data().poster;

          self.maxWidth = ko.observable(data().width);

          self.showMsg = ko.observable((options.message() == true) ? true : false);

          /*
           * WIDGET EDIT FUNCTIONALITY
           */

      }

      return {
          viewModel: viewModel,
          template: htmlTemplate
      };
  });
