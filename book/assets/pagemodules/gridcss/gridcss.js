define(["text!./columns.html", "require", "knockout", "PageViewModel", "BookReader"], function (htmlTemplate, require, ko, PageViewModel, BookReader)
{
    if (ko.bindingHandlers['css2'] == undefined)
    {
        ko.bindingHandlers['css2'] = ko.bindingHandlers.css;
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

        self.columns = data().map(function (col)
        {
            return convertToPage(col());
        });

        self.recalculate = ko.observable(1);

        /*
        self.columnWidth = ko.computed(function ()
        {
            self.recalculate();

            return (($(window).width() * 0.9) - ((self.columns.length - 1) * 20)) / self.columns.length;
        });

        $(window).resize(function ()
        {
            self.recalculate(self.recalculate() + 1);
        });

        */

        self.isInverted = ko.computed(function ()
        {
            return elem.hasClass("inverted");
        });

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
    }

    return {
        viewModel: viewModel,
        template: htmlTemplate
    };
});
