define(
  ["text!./table-of-contents.html", "require", "knockout", "BookReader", "WebUtility", "jqueryScrollTo"],
  function(htmlTemplate, require, ko, BookReader, WebUtility) {

    function viewModel(p) {
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

      self.structure = [];
      var structure = mBook.GetStructure();

      function removeTOC(struct) {
        for (var i = 0; i < struct.length; i++) {
          if (struct[i].pageIndex == mBook.bufferPageIndex) {
            struct[i] = undefined;

            //Re-index
            var st = struct;
            st = st.filter(function(item) {
              return item != undefined;
            });
            return st;
          } else {
            if (struct[i].section != undefined)
              removeTOC(struct[i]);
          }
          return;
        }
      }
      structure = removeTOC(structure);

      for (var i = 0; i < structure.length; i++)
        self.structure.push(section(structure[i], self));

      function section(config, parent) {
        var self = {
          title: config.title,
          pageIndex: config.pageIndex,
          lockedStatus: mBook.userProfile.PageGetLockedStatus(config.pageIndex)
        };

        self.toggleSelection = function() {

          //stand alone
          if (config.section == undefined && self.pageIndex != undefined) {
            mBook.GotoPage(self.pageIndex);
          }

          //multi
          if (config.section != undefined && self.pageIndex != undefined) {

            mBook.GotoPage(self.pageIndex);
          }


          //   if(self.pageIndex != undefined)

        };

        if (config.section !== undefined) {
          self.section = [];

          for (var i = 0; i < config.section.length; i++)
            self.section.push(section(config.section[i], self));
        }

        return self;
      }


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