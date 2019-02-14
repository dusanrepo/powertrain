define(["text!./note.html", "knockout", "WebUtility"], function (htmlTemplate, ko, service, WebUtility)
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
          themeSettings = p.themeSettings,
          mBookId = mBook.bookData.id;

        self.id = data().id;

        var note_id;

        mBook.userProfile.loadNotes({
            book_code: mBookId,
            group_id: self.id
        },
          function (data)
          {
              if (data && data.notes) {
                  var note = data.notes.pop();
                  self.value(note ? note.text : '');
                  note_id = note ? parseInt(note.note_id) : undefined;
              }
          });

        self.html = "";

        self.type = data().type || "";

        self.title = data().title;
        self.icon = config.contentPath + "images/" + data().icon;
        self.height = options.height();

        self.cssBinds = ko.computed(function () {
          var position = options.label() == "none" ? "noLabel" : options.label() == "left" ? "" : "labelAbove";
          var height = options.height();

          return position + " " + height;
        });

        elem.addClass(options.position());

        self.value = ko.observable();

        var sendData;
        var fieldIsEmpty = false;
        self.addItem = function ()
        {

            var val = self.value();

            if (val !== "") fieldIsEmpty = false;

            if (fieldIsEmpty) return;

            if (val === "") fieldIsEmpty = true;

            clearTimeout(sendData);

            sendData = setTimeout(function ()
            {

                if (note_id === undefined) {
                    mBook.userProfile.addNote({
                        book_code: mBookId,
                        group_id: self.id,
                        content: val
                    },
                      function (data)
                      {
                        //note_id = parseInt(data.note_id);
                      });
                } else {
                    mBook.userProfile.editNote({
                        book_code: mBookId,
                        note_id: self.id,
                        content: val
                    });
                }

            }, 500);

        };

    }

    return {
        viewModel: viewModel,
        template: htmlTemplate
    };
});
