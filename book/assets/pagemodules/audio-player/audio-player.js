define(["text!./audio-player.html", "require", "knockout", "PageViewModel", "BookReader", "WebUtility", "jqueryScrollTo"], function (htmlTemplate, require, ko, PageViewModel, BookReader, WebUtility)
{

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
          themeSettings = p.themeSettings,
          content = config.contentPath;

        /*
         * KNOCKOUT VIEWMODEL SETUP
         */

        if (data().length == 3)
            self.maxWidth = data()[2];
        else
            self.maxWidth = ko.observable();

        var playButton = $(".play", elem);
        var pauseButton = $(".pause", elem);
        pauseButton.hide();

        var files = data()[0]();
        var audio = $("audio", elem)[0];
        audio.volume = 0.8;
        self.audioSource = ko.computed(function ()
        {
            return config.contentPath + files[0]();
        });
        /*	var smo;
          for(var i = 0; i < files.length; i++) {
              var file = files[i]();
              smo = soundManager.createSound({
                  id: 'audio-content-' + file,
                  url: content + file,
                  volume: 80,
                  multiShot: false,
                  autoLoad: false,
                  onload: function() {
                      self.duration(smo.duration);
                  },
                  
                  onplay: function() {
                      
                  },
                  
                  onfinish: function() {
                      playButton.show();
                      pauseButton.hide();
                  },
                  
                  whileplaying: function() {
                      self.currentTime(smo.position);
                  }
              });
          }*/

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

        //Stop icon
        self.stopIcon = ko.observable();
        self.stopIconUrl = ko.computed(function ()
        {
            return assets + themeSettings.stopIcon();
        });
        self.stopIconUrl.subscribe(function (newVal)
        {
            WebUtility.FileToImageTag(newVal, function (html)
            {
                self.stopIcon(html);
            });
        });
        WebUtility.FileToImageTag(self.stopIconUrl(), function (html)
        {
            self.stopIcon(html);
        });

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

        self.currentTime = ko.observable(audio.currentTime);
        self.duration = ko.observable(self.duration);
        self.volume = ko.observable(audio.volume * 100);

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
            return ((0.06 + (self.volume() / 100)) * 80) + "%"; //between 5% and 85% for slider position
        });
        self.volumePercent.subscribe(function (newVal)
        {
            audio.volume = self.volume() / 100;
        });

        self.volControlVisible = ko.observable(false);

        //audio events
        audio.ontimeupdate = function ()
        {
            self.currentTime(audio.currentTime);
        };

        audio.onloadedmetadata = function ()
        {
            self.duration(audio.duration);
        };

        audio.onended = function ()
        {
            playButton.show();
            pauseButton.hide();
        };

        /*
         * INTERACTIVE FUNCTIONALITY
         */

        self.play = function ()
        {
            audio.play();
            pauseButton.show();
            playButton.hide();
        };

        self.pause = function ()
        {
            audio.pause();
            pauseButton.hide();
            playButton.show();
        };

        self.stop = function ()
        {
            self.pause();
            self.currentTime(0);
            audio.currentTime = 0;
        };

        //seeker
        var seekTrigger = false;
        self.seekClick = function (data, event)
        {
            var t = event.delegateTarget;
            var posX = $(t).offset().left;
            var width = $(t).width();
            var ratio = (event.pageX - posX) / width;
            audio.currentTime = ratio * self.duration();
            seekTrigger = true;
        };

        self.seekMove = function (data, event)
        {
            if (!seekTrigger) return;
            var t = event.delegateTarget;
            var posX = $(t).offset().left;
            var width = $(t).width();
            var ratio = (event.pageX - posX) / width;
            audio.currentTime = ratio * self.duration();
        };

        self.seekLift = function (data, event)
        {
            seekTrigger = false;
        };

        //volume controller
        var volTrigger = false;
        self.volClick = function (data, event)
        {
            var t = event.delegateTarget;
            var posY = $(t).offset().top + 5;
            var height = $(t).height() - 10;
            var ratio = Math.min(Math.max((event.pageY - posY) / height, 0), 1);
            self.volume((1 - ratio) * 100);
            volTrigger = true;
        };

        self.volMove = function (data, event)
        {
            if (!volTrigger) return;
            var t = event.delegateTarget;
            var posY = $(t).offset().top + 5;
            var height = $(t).height() - 10;
            var ratio = Math.min(Math.max((event.pageY - posY) / height, 0), 1);
            self.volume((1 - ratio) * 100);
        };

        self.volLift = function (data, event)
        {
            volTrigger = false;
        };

        self.volToggle = function ()
        {
            self.volControlVisible(!self.volControlVisible());
        };

        /*
         * WIDGET EDIT FUNCTIONALITY
         */

    }

    return {
        viewModel: viewModel,
        template: htmlTemplate
    };
});