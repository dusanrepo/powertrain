define(["text!./list.html", "require", "knockout"], function (htmlTemplate, require, ko)
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

        self.root = true;
        self.type = options.type;
        self.items = data;

        self.template = function (item)
        {
            if (typeof (ko.unwrap(item)) == "string")
                return "string";
            else
                return "array";
        }
    }

    return {
        viewModel: viewModel,
        template: htmlTemplate
    };
});