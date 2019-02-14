define(["text!./table.html", "require", "knockout", "WebUtility", "PageViewModel", "BookReader"], function (htmlTemplate, require, ko, WebUtility, PageViewModel, BookReader)
{
    if (ko.bindingHandlers.mobileTable == undefined)
    {
        ko.bindingHandlers.mobileTable = {
            update: function (element, valueAccessor)
            {
                var $element = $(element);

                var value = valueAccessor();
                var valueUnwrapped = ko.unwrap(value);

                if (valueUnwrapped)
                {
                    $element.addClass("mobile");
                } else
                {
                    $element.removeClass("mobile");
                }
            }
        };
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
          oldBody = data().body;

        /*
         * KNOCKOUT VIEWMODEL SETUP
         */
        self.head = data().head;
        self.body = [];
        self.windowWidth = ko.observable();
        self.settings = options;
        self.maxWidth = ko.observable(data().maxWidth);

        for (var i = 0; i < oldBody.length; i++)
        {
            self.body[i] = oldBody[i].map(function (e) { return $.extend({}, e, { content: convertToPage(e.content) }); });
        }

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

        var win = $(window);
        win.resize(function ()
        {
            self.windowWidth(win.width());
        });



        /*
         * INTERACTIVE FUNCTIONALITY
         */



        /*
         * WIDGET EDIT FUNCTIONALITY
         */

    }



    return {
        viewModel: viewModel,
        template: htmlTemplate
    };
});
