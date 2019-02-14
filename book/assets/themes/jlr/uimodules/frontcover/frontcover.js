define(["text!./frontcover.html", "require", "knockout", "jquery", "WebUtility", "jqueryTouchSwipe", "less!./frontcover"],
function(htmlTemplate, require, ko, $, WebUtility, swipe) {
    function viewModel(params) {
        var self = this;

        self.id = params.id;
        self.settings = params.settings;
        var toolbox = params.settings.toolbox;
        var options = params.config.options;
        var elem = $(params.elem);
        var mBook = params.mBook;

        self.instruction = WebUtility.IsMobile() ? self.settings.mobileInstruction() : self.settings.desktopInstruction();
        //self.logoVisible = ko.observable(false);
        self.logoCss = ko.observable(self.settings.logoPosition());
        self.titleVisible = ko.observable(false);
        self.subtitleVisible = ko.observable(false);
        //self.instructionVisible = ko.observable(false);

        function animateLogos() {
            setTimeout(function() {
                //self.logoVisible(true);
                self.logoCss(self.logoCss() + " show");
            }, 300);
            setTimeout(function() {
                self.titleVisible(true);
            }, 600);
            setTimeout(function() {
                self.subtitleVisible(true);
            }, 1200);
            /*
            setTimeout(function() {
                self.instructionVisible(true);
                elem.click(function() {
                    elem.fadeOut(500);
                });
            }, 2000);
            */
            setTimeout(function() {
                //$('#results').css('display','block').fadeIn(1000);
                $('#results').show("slow");

                //Show Menu
                $('#results').css('display','block');

                //Remove Menu
                //$('#results').css('display','none');
                //$('.frontcover').css('display','none');

                //$('.frontcover .video-container .mesh').css('background-color','black');
                //$('.video-container').animate({ opacity: 1/2 }, 1000);

            }, 5000);
        }
		//console.log(mBook);
        var new_page_index =  mBook.FindPageByUrl();
		console.log(new_page_index);

		if( new_page_index !=null ) {

			mBook.directLoad=1;
			console.log(mBook)
			elem.fadeOut(1);
			mBook.GotoPage(new_page_index);
		}
		mBook.directLoad=0;
    /*
    if (!self.settings.video())
        animateLogos();
		elem.fadeOut(1);
    /*
    var timer = self.settings.continueTimer ? self.settings.continueTimer() : false;

    if (timer !== false && !isNaN(timer) && timer > 0) {
        setTimeout(function() {
            elem.fadeOut(500);
        }, timer);
    };
    */

    self.logo = ko.computed(function() {
        return self.settings.logo() ? require.toUrl(params.config.assets + self.settings.logo()) : "";
    });

    self.logoWidth = self.settings.logoWidth;
    self.logoMaxWidth = self.settings.logoMaxWidth;

    self.video = self.settings.video() ? 'assets/' + mBook.theme.path + '/assets/vid/' + self.settings.video() : "";

    self.backgroundImage = self.settings.backgroundImage() ? 'url(assets/' + mBook.theme.path + '/assets/img/' + self.settings.backgroundImage() + ')' : "";

    self.videoOverlay = self.settings.videoOverlay() ? 'url(assets/' + mBook.theme.path + '/assets/img/' + self.settings.videoOverlay() + ')' : "";

    self.videoPoster = self.settings.videoPoster() ? 'assets/' + mBook.theme.path + '/assets/img/' + self.settings.videoPoster() : "";

    self.title = self.settings.title() ? self.settings.title() : mBook.GetTitle();

    self.subtitle = self.settings.subtitle();

    self.showPlayButton = ko.observable(false)

    self.playIcon = ko.observable("");
    self.playButton = ko.observable();

    self.playIcon.subscribe(function(newVal) {
        WebUtility.FileToImageTag(newVal, function(html) {
            self.playButton(html);
        })
    })

    self.playIcon(mBook.theme.path + "/assets/img/" + self.settings.playIcon());


    self.playVideo = null;
    console.log('isIOS=' + WebUtility.isIOS());
    //console.log('IOSVersion' + WebUtility.IOSVersion());
    // if (WebUtility.isIOS() && WebUtility.IOSVersion() < 12) {
    //     self.showPlayButton(true);
    // }

    if (WebUtility.isIOS()) {
        self.showPlayButton(true);
    }

    ko.bindingHandlers.videoHandlers = {
        init: function(video) {

            video.onplaying = function() {
                self.showPlayButton(false);
                animateLogos();
            }

            self.playVideo = function() {
                video.play();
            }

        }
    }

    // var eventHandler = function (event) {
    //     // Only run for iOS full screen apps
    //     if (('standalone' in window.navigator) && window.navigator.standalone) {
    //         // Only run if link is an anchor and points to the current page
    //         if ( event.target.tagName.toLowerCase() !== 'a' || event.target.hostname !== window.location.hostname || event.target.pathname !== window.location.pathname || !/#/.test(event.target.href) ) return;
    //
    //         // Open link in same tab
    //         event.preventDefault();
    //         window.location = event.target.href;
    //     }
    // }
    // window.addEventListener('click', eventHandler, false);

};

return {
    viewModel: viewModel,
    template: htmlTemplate
};
});
