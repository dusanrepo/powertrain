define(["text!./notes-list.html", "knockout", "WebUtility"], function(htmlTemplate, ko, WebUtility) {
    function viewModel(p) {
        var self = this;
        var elem = $(p.elem);
        var config = p.config;
        var data = p.settings.data;
        var options = p.settings.options;
        var assets = config.assets;
        var mBook = p.mBook;
        var themeSettings = p.themeSettings;
        var mBookId = mBook.bookData.id;

        var element = elem[0].children[0].children[1];

        self.id = data()[1]();

        self.list = ko.observableArray();

        mBook.userProfile.loadNoteList(
            {
                book_code: mBookId,
                list_id: self.id
            },
            function(data) {
                if (data && data.notes) {
                    self.list(data.notes);

                    var current;
                    var count = element.children.length;

                    for (current = 0; current < count; current++) {
                        element.children[current].id = data.notes[current].note_id;
                    }
                }
            }
        );

        self.html = "";

        self.removeIcon = ko.observable();
        self.remove = ko.computed(function() {
            return p.config.assets + themeSettings.removeIcon();
        });
        self.remove.subscribe(function(newVal) {
            WebUtility.FileToImageTag(newVal, function(html) {
                self.removeIcon(html);
            });
        });
        WebUtility.FileToImageTag(self.remove(), function(html) {
            self.removeIcon(html);
        });

        self.addIcon = ko.observable();
        self.add = ko.computed(function() {
            return p.config.assets + themeSettings.addIcon();
        });
        self.add.subscribe(function(newVal) {
            WebUtility.FileToImageTag(newVal, function(html) {
                self.addIcon(html);
            });
        });
        WebUtility.FileToImageTag(self.add(), function(html) {
            self.addIcon(html);
        });

        self.title = data()[0];

        self.colour = data()[2];
        //elem.width(options.width());

        self.position = options.position();

        elem.addClass(self.position);

        self.value = ko.observable();

        self.addItem = function(event)
        {
            var val = self.value();

            self.list.push(
                {
                    text: val,
                    note_id: 0,
                    module_type: "notelist"
                }
            );

            var callBackFired =
                mBook.userProfile.submitNoteToList(
                    {
                        book_code: mBookId,
                        list_id: self.id,
                        note_id: element.children[element.children.length - 1].id,
                        content: val
                    },
                    function()
                    {
                        console.log("Note List Added");
                    }
                );

            self.value("");
        };

        self.removeItem = function(data, event)
        {
            var id;

            if (event.target.parentElement.id !== "") {
                id = event.target.parentElement.id;

            } else {
                id = event.target.parentElement.parentElement.id;
            }

            mBook.userProfile.removeNoteFromList(
                {
                    book_code: mBookId,
                    list_id: self.id,
                    note_id: id
                },
                function()
                {
                    console.log("Note list removed");
                }
            );

            self.list.remove(data);
        };

        window.randomID = function() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var i;

            for (i = 0; i < 10; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return text;
        }

        //REST OF CODE IS NOT COMPLETE
        //FINISH TO IMPLEMENT EDITIABLE NOTES
        self.editItem = function(data, event) {
            console.log(data);
        }

        self.editMode = ko.observable(false);

        self.toggleEdit = function() {
            self.editMode(!self.editMode());
        }

        self.acceptEdit = function(data, event) {
            self.toggleEdit();
        }
        // END OF INCOMPLETE CODE
        /////////////////////////

    }

    return {
        viewModel: viewModel,
        template: htmlTemplate
    };
});
