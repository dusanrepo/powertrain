define(
    ["text!./note-checkbox.html", "knockout", "WebUtility"],
    function (htmlTemplate, ko, WebUtility)
    {
        function viewModel(p)
        {
            var self = this;
            var element = $(p.elem);
            element = element[0];
            var config = p.config;
            var data = p.settings.data;
            var options = p.settings.options;
            var assets = config.assets;
            var mBook = p.mBook;
            var themeSettings = p.themeSettings;
            var mBookId = mBook.bookData.id;

            var module = data();
            var label = element.children[0];
            var checkbox = label.children[0];

            mBook.userProfile.loadNoteCheckbox(
                {
                    book_code : mBookId,
                    checkbox_id : module.id
                }, function(response)
                {
                    if (response.success === false) {
                        if (module.checked === true) {
                            checkbox.checked = true;
                        } else {
                            checkbox.checked = false;
                        }

                    } else {
                        if (response.checked === 1) {
                            checkbox.checked = true;
                        } else {
                            checkbox.checked = false;
                        }
                    }
                }
            );

            checkbox.addEventListener("change", function(){
                var checked = 0;
                if (checkbox.checked === true) {
                    checked = 1;
                }

                mBook.userProfile.submitNoteCheckbox(
                    {
                        book_code : mBookId,
                        checkbox_id : module.id,
                        group_id : module.group,
                        checked : checked
                    }, function(data)
                    {
                        console.log("Note Checkbox saved");
                    }
                );
            });
        }

        return {
            viewModel: viewModel,
            template: htmlTemplate
        };
    }
);
