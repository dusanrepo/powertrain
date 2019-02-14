define(["text!./gallery.html", "knockout", "WebUtility", "PageViewModel", "BookReader"], function(htmlTemplate, ko, WebUtility, PageViewModel, BookReader) {
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

        self.images = data;
        self.selected = ko.observable(self.images()[0]());

        var imagesLoaded = 0;
        self.images = self.images().map(
            function(image)
            {
                image().loaded = function()
                {
                    imagesLoaded++
                    if (imagesLoaded === self.images.length) {
                        checkReelSize();
                        self.forceRecalculation(self.forceRecalculation() + 1);
                    }
                };

                if (image().contentArray == undefined) {
                    image().contentArray = image().content;
                }

                if (image().content != undefined) {
                    image().content = convertToPage(image().contentArray);
                }

                return image;
            }
        );

        function convertToPage(jsonData) {
            var vm = new PageViewModel();
            vm.componentVM = mBook.KOPageComponents();
            var pageContent = BookReader.ConvertToPage(ko.mapping.toJS(jsonData));

            for (var i = 0; i < pageContent.length; i++) {
                var module = pageContent[i];
                var settings = {
                    data: module.data
                };

                if (module.options != undefined)
                    settings["options"] = module.options;

                vm.insertModule(module.type, settings);
            }

            return vm;
        }

        self.bigImageSource = ko.computed(function() {
            return config.contentPath + "images/" + self.selected().image;
        });

        self.scrollPos = ko.observable(0);

        self.imageSource = function(path) {
            return ko.computed(function() {
                return config.contentPath + "images/" + path;
            }, self);
        };

        //Left button icon
        self.leftIcon = ko.observable();
        self.leftIconUrl = ko.computed(function() {
            return assets + themeSettings.leftIcon();
        });
        self.leftIconUrl.subscribe(function(newVal) {
            WebUtility.FileToImageTag(newVal, function(html) {
                self.leftIcon(html);
            });
        });
        WebUtility.FileToImageTag(self.leftIconUrl(), function(html) {
            self.leftIcon(html);
        });

        //Right button icon
        self.rightIcon = ko.observable();
        self.rightIconUrl = ko.computed(function() {
            return assets + themeSettings.rightIcon();
        });
        self.rightIconUrl.subscribe(function(newVal) {
            WebUtility.FileToImageTag(newVal, function(html) {
                self.rightIcon(html);
            });
        });
        WebUtility.FileToImageTag(self.rightIconUrl(), function(html) {
            self.rightIcon(html);
        });

        //Enlarge button icon
        self.enlargeIcon = ko.observable();
        self.enlargeIconUrl = ko.computed(function() {
            return assets + themeSettings.enlargeIcon();
        });
        self.enlargeIconUrl.subscribe(function(newVal) {
            WebUtility.FileToImageTag(newVal, function(html) {
                self.enlargeIcon(html);
            });
        });
        WebUtility.FileToImageTag(self.enlargeIconUrl(), function(html) {
            self.enlargeIcon(html);
        });
        self.prompt = themeSettings.prompt;

        self.imageWidth = ko.observable();
        self.imageHeight = ko.observable();

        self.imageLoaded = function(ko, event) {
            self.imageWidth(Math.round($(".large-image > img", elem).width()));
            self.imageHeight(Math.round($(".large-image > img", elem).height()));

            if (navigator.userAgent.match(/Trident.*rv\:11\./)) {
                setTimeout(rectifySize, 100);
            }
        };

        function rectifySize() {

        }

        //IE11 overlay fix
        if (navigator.userAgent.match(/Trident.*rv\:11\./)) {
            setTimeout(rectifySize, 10);
        }

        var overlayWidth;
        var overlayHeight;

        self.forceRecalculation = ko.observable(1);

        $(window).on("resize orientationchange", resize);

        function resize(e) {
            self.forceRecalculation(self.forceRecalculation() + 1);

            overlayWidth = Math.round($(".large-image > img", elem).width());
            overlayHeight = Math.round($(".large-image > img", elem).height());

            checkReelSize();
        }

        /*
         * INTERACTIVE FUNCTIONALITY
         */

        self.thumbClick = function(imgData) {
            self.selected(imgData);
        };

        self.largeClick = function() {
            if (self.selected().expandable)
                $(".lightbox").trigger("open", [$(".large-image img", elem), self.selected().caption, true]);

            return false;
        };

        self.touchSupport = ko.observable(WebUtility.IsMobile());
        self.smallReel = ko.observable(false);
        self.reelWidth = ko.observable("");

        var hold;
        self.scrollLeft = function() {
            var reel = $(".reel-window ul", elem)[0];

            reel.scrollLeft -= 25;
            self.showLeft();
            self.showRight();

            hold = requestAnimationFrame(self.scrollLeft);
        };

        self.scrollRight = function() {
            var reel = $(".reel-window ul", elem)[0];

            reel.scrollLeft += 25;
            self.showLeft();
            self.showRight();

            hold = requestAnimationFrame(self.scrollRight);
        };

        self.scrollQuit = function() {
            cancelAnimationFrame(hold);
        };

        self.showLeft = function()
        {
            self.forceRecalculation();

            var reel = $(".reel-window ul", elem)[0];
            var button = $(".left-button", elem)[0];

            if (reel.scrollLeft === 0) {
                button.style.display = "none";
            } else {
                button.style.display = "block";
            }
        };

        self.showRight = function()
        {
            self.forceRecalculation();

            var reel = $(".reel-window ul", elem)[0];
            var button = $(".right-button", elem)[0];

            if (   reel.scrollWidth <= reel.offsetWidth
                || reel.scrollLeft >= reel.scrollLeftMax) {
                button.style.display = "none";
            } else {
                button.style.display = "block";
            }
        };

        if (WebUtility.IsMobile()) {
            $(".reel-window", elem)
                .on("touchstart touchend", function(e) {
                    e.stopPropagation();
                })
                .css({
                    'overflow-x': 'hidden',
                    // '-webkit-overflow-scrolling': 'touch'
                });
        }

        setTimeout(resize, 100);

        function checkReelSize() {
            self.showLeft();
            self.showRight();
            
            return;
        }

        if (ko.bindingHandlers.contentSwitcher == undefined) {
            ko.bindingHandlers.contentSwitcher = {
                init: function(elem, value, bindings, vm, context) {
                    $(">.container:not(:first)", elem).hide();
                    $(">.container:first", elem).addClass("current");
                },
                update: function(elem, value, bindings, vm, context) {
                    var val = value()();

                    var prevTab = ko.dataFor($(">.current", elem).get(0));

                    if (val == prevTab)
                        return;

                    var tabs = $(">.container", elem);

                    for (var i = 0; i < tabs.length; i++) {
                        if (ko.dataFor(tabs.get(i)) == val) {
                            var newElem = tabs.get(i);
                            break;
                        }
                    }
                    // Overcalculates height until animation is complete then returns to normal height
                    // $(elem).animate({ height: $(newElem).height() }, { duration: 790, step: updateScroll });

                    $(">.current", elem).fadeOut(function() {
                        $(this).removeClass("current");

                        $(newElem).addClass("current").fadeIn(function() {
                            $(elem).css("height", "");

                            updateScroll();
                        });
                    });

                    function updateScroll() {
                        context.$parents.filter(function(p) {
                            return p.updateScroll != undefined
                        })[0].updateScroll();
                    }
                }
            }
        }
    }

    return {
        viewModel: viewModel,
        template: htmlTemplate
    };
});
