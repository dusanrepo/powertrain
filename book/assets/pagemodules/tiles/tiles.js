define(["text!./tiles.html", "require", "knockout", "WebUtility", "PageViewModel", "BookReader"], function (htmlTemplate, require, ko, WebUtility, PageViewModel, BookReader)
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

        var location = mBook.GetLocation(mBook.bufferIndexPage);

        self.textAlign = options.textAlign();

        self.minWidth = data()[1]()[0];
        self.maxWidth = data()[1]()[1];
        self.bgColor = data()[2];
        self.color = data()[3];

        var tiles = ko.toJS(data()[0]());

        tiles.map(function (val)
        {
            var backgroundSettings = val.background;

            val.background = backgroundSettings.type == 'color' ? backgroundSettings.setting :
              'url(' + config.contentPath + "images/" + backgroundSettings.setting + ')';

            val.body = convertToPage(val.body);

            if (val.icon)
            {
                var iconSrc = val.icon.src;
                var iconMaxWidth = val.icon.maxWidth;
                var iconPos = val.icon.position;

                val.icon = ko.observable();

                WebUtility.FileToImageTag(config.contentPath.replace("assets/", "") + "images/" + iconSrc, function (html)
                {
                    val.icon(html);
                });

                val.iconWidth = iconMaxWidth;

                val.iconOrder = 0;
                val.iconGrow = 0;
                
                if (iconPos != undefined && iconPos == "top") {
                    val.iconOrder = -1;
                    val.iconGrow = 1;
                }
            }

            return val;
        });

        self.tiles = ko.observableArray(tiles);


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
