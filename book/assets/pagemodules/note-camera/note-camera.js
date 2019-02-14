define(["text!./note-camera.html",
        "require",
        "knockout",
        "NoteCamera"],
    function(htmlTemplate, require, ko, NoteCamera)
    {
        function viewModel(parameters)
        {
            var self = this;

            var data = parameters.settings.data;
            var elem = $(parameters.elem);
            var config = parameters.config;
            var options = config.options;
            var assets = config.assets;

            var module = data();

            options.wrapper = module.id;
            elem[0].children[0].setAttribute("id", module.id);

            var noteCamera = new NoteCamera;
            noteCamera.setServerDelete(mBook.userProfile.removeNoteCameraImage.bind(this));
            noteCamera.setServerLoad(mBook.userProfile.loadNoteCameraImage.bind(this));
            noteCamera.setServerSave(mBook.userProfile.saveNoteCameraImage.bind(this));
            noteCamera.setup(options)
            .then(function()
                {
                    noteCamera.loadImageFromServer();
                }
            );
        }

        return {
            viewModel: viewModel,
            template: htmlTemplate
        };
    }
);
