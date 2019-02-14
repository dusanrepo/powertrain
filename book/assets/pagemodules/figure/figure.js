define(["text!./figure.html", "knockout", "WebUtility"], function (htmlTemplate, ko, WebUtility)
{
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

        self.imgSrc = ko.computed(function ()
        {
            return config.contentPath + "images/" + data().image;
        }, self);

        self.caption = data().caption;
        self.width = ko.observable(data().width);
        self.backlight = data().backlight;
        self.defaultWidth = themeSettings.defaultWidth;
        self.prompt = themeSettings.prompt;
        self.enlargable = options.enlargable;

        //KO Observable: Enlarge icon HTML
        self.iconImage = ko.observable();

        //KO Computed: Tab icon url
        self.icon = ko.computed(function ()
        {
            return assets + themeSettings.icon();
        });

        //Icon url is changed
        self.icon.subscribe(function (newVal)
        {
            WebUtility.FileToImageTag(newVal, function (html)
            {
                self.iconImage(html);
            });
        });

        WebUtility.FileToImageTag(self.icon(), function (html)
        {
            self.iconImage(html);
        });

        //CSS settings
        applyFloat(options.float());

        options.float.subscribe(function (newVal)
        {
            applyFloat(newVal);
        });

        options.enlargable.subscribe(function (newVal)
        {
            setLightbox(newVal);
        });

        setLightbox(self.enlargable());

        function applyFloat(val)
        {
            elem.removeClass("left right double-left double-right centre");
            elem.addClass(val);
        }

        //Image loaded event
        self.imageLoaded = function (vm, e)
        {
            applySize();
            checkBacklight();
        }

        //Check when window size / orientation changes and reapply sizing
        $(window).resize(applySize);
        $(window).on("orientationchange", applySize);

        function applySize()
        {
            var imgElem = $("img", elem);
            var windowWidth = Math.floor($(window).width());

            if (self.width() != undefined)
            {
                imgElem.css("maxWidth", self.width() + "px");

            } else {
                var isFloat = options.float();
                switch(isFloat)
                {
                    case "left":
                        imgElem.css("maxWidth", self.defaultWidth() + "px");
                        break;

                    case "right":
                        imgElem.css("maxWidth", self.defaultWidth() + "px");
                        break;

                    case "double-left":
                        imgElem.css("maxWidth", self.defaultWidth() * 0.5 + "px");
                        break;

                    case "double-right":
                        imgElem.css("maxWidth", self.defaultWidth() * 0.5 + "px");
                        break;

                    case "none":
                        // For columns or other containers
                        imgElem.css("maxWidth", "100%");
                        break;

                    case "centre":
                        // Adjust the left / right margins (which make up 30%)
                        imgElem.css("maxWidth", windowWidth * 0.9 + "px");
                        break;

                    default:
                        return false;
                }
            }
        }

        function enableLightbox()
        {
            $("a", elem).click(function (e)
            {
                e.preventDefault();

                $(".lightbox").trigger("open", [$("img", elem), self.caption, options.zoomable()]);
                return false;
            });
        }

        function disableLightbox()
        {
            $("a", elem).off("click").click(function ()
            {
                return false;
            });
        }

        function setLightbox(val)
        {
            (val) ? enableLightbox() : disableLightbox();
        }

        function checkBacklight()
        {
            if(typeof self.backlight == "undefined") {
                return false;
            }
            setBacklight(self.backlight);
        }

        function setBacklight(colour)
        {
            elem.addClass("backlight")
            elem.css("background-color", colour);
        }
    }

    return {
        viewModel: viewModel,
        template: htmlTemplate
    };
});
