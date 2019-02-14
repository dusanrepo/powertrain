//data()[0]: Accordion Name
//data()[1]: Page content object (observable)

define(["text!./tabs.html", "require", "knockout", "PageViewModel", "BookReader", "WebUtility", "jqueryScrollTo"], function (htmlTemplate, require, ko, PageViewModel, BookReader, WebUtility)
{
    //Tab section object constructor (maps observables from data to a readable object)
    var tabSection = function (title, current, content)
    {
        this.title = title;
        this.contentVM = content;
        this.selected = ko.computed(function ()
        {
            //$(window).resize(); //Figure overlay width/height fix
            return this === current();
        }, this);
    };

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

        /*
         * KNOCKOUT VIEWMODEL SETUP
         */

        self.selectedSection = ko.observable();
        self.tabs = ko.observableArray();
        self.wrapperHeight = ko.observable(0);

        for (var i = 0; i < data().length; i++)
        {
            self.tabs.push(new tabSection(data()[i]()[0], self.selectedSection, convertToPage(data()[i]()[1])));
        }

        self.selectedSection(self.tabs()[0]);

        //Converts page data into observable page widgets (!turn into core method)
        function convertToPage(jsonData)
        {
            var vm = new PageViewModel();
            vm.componentVM = mBook.KOPageComponents();
            var pageContent = BookReader.ConvertToPage(ko.mapping.toJS(jsonData));

            for (var i = 0; i < pageContent.length; i++)
            {
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

        self.listStyle = ko.computed(function ()
        {
            if (options.tabStyle() == "minWidth")
                return { 'min-width': options.tabSize() + 'px' };
            else
                return { width: options.tabSize() + 'px' };
        });

        self.touchSupport = ko.observable(WebUtility.IsMobile());
        self.scrollPos = ko.observable(0);
        self.forceRecalculation = ko.observable(1);

        //Left button icon
        self.leftIcon = ko.observable();
        self.leftIconUrl = ko.computed(function ()
        {
            return assets + themeSettings.leftIcon();
        });
        self.leftIconUrl.subscribe(function (newVal)
        {
            WebUtility.FileToImageTag(newVal, function (html)
            {
                self.leftIcon(html);
            });
        });
        WebUtility.FileToImageTag(self.leftIconUrl(), function (html)
        {
            self.leftIcon(html);
        });

        //Right button icon
        self.rightIcon = ko.observable();
        self.rightIconUrl = ko.computed(function ()
        {
            return assets + themeSettings.rightIcon();
        });
        self.rightIconUrl.subscribe(function (newVal)
        {
            WebUtility.FileToImageTag(newVal, function (html)
            {
                self.rightIcon(html);
            });
        });
        WebUtility.FileToImageTag(self.rightIconUrl(), function (html)
        {
            self.rightIcon(html);
        });

        self.showLeft = ko.computed(function ()
        {
            self.forceRecalculation();

            return parseInt(self.scrollPos(), 10) < 0;
        });

        self.showRight = ko.computed(function ()
        {
            self.forceRecalculation();

            var maxScroll = $(".tabWrapper", elem).width() - $(".tabWrapper ul", elem).width();

            return parseFloat(self.scrollPos()) != maxScroll && maxScroll < 0;
        });

        var hold;
        self.scrollLeft = function ()
        {
            function goLeft()
            {
                var maxScroll = $(".tabWrapper", elem).width() - $(".tabWrapper ul", elem).width();
                var newVal = Math.min(Math.max(parseInt(self.scrollPos()) + 5, maxScroll), 0);
                self.scrollPos(newVal + "px");
                hold = requestAnimationFrame(goLeft);
            }
            goLeft();
        };

        self.scrollRight = function ()
        {
            function goRight()
            {
                var maxScroll = $(".tabWrapper", elem).width() - $(".tabWrapper ul", elem).width();
                var newVal = Math.min(Math.max(parseInt(self.scrollPos()) - 5, maxScroll), 0);
                self.scrollPos(newVal + "px");
                hold = requestAnimationFrame(goRight);
            }
            goRight();
        };

        self.scrollQuit = function ()
        {
            cancelAnimationFrame(hold);
        };

        setTimeout(resize, 100);
        $(window).on("resize", resize);

        function resize()
        {
            self.forceRecalculation(self.forceRecalculation() + 1);

            var maxScroll = $(".tabWrapper", elem).width() - $(".tabWrapper ul", elem).width();

            if (maxScroll > 0)
            {
                self.scrollPos((maxScroll / 2) + 'px');
            }
        }
    }

    if (ko.bindingHandlers.tabSwitcher == undefined)
    {
        ko.bindingHandlers.tabSwitcher = {
            init: function (elem, value, bindings, vm, context)
            {
                $(">.container:not(:first)", elem).hide();
                $(">.container:first", elem).addClass("current");
            },
            update: function (elem, value, bindings, vm, context)
            {
                var val = value()();
                
                var prevTab = ko.dataFor($(">.current", elem).get(0));

                if (val == prevTab)
                    return;

                var tabs = $(">.container", elem);

                for (var i = 0; i < tabs.length; i++)
                {
                    if (ko.dataFor(tabs.get(i)) == val)
                    {
                        var newElem = tabs.get(i);
                        break;
                    }
                }

                $(elem).animate({ height: $(newElem).height() + 40 }, { duration: 790, step: function () { context.$parents[1].updateScroll(); } });

                $(">.current", elem).fadeOut(function ()
                {
                    $(this).removeClass("current");

                    $(newElem).addClass("current").fadeIn(function ()
                    {
                        $(elem).css("height", "");
                        context.$parents[1].updateScroll();
                    });
                });
            }
        };
    }

    return {
        viewModel: viewModel,
        template: htmlTemplate
    };
});