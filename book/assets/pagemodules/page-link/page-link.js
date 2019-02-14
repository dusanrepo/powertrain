define(
  ["text!./page-link.html", "require", "knockout", "WebUtility"],
  function(htmlTemplate, require, ko, WebUtility) {

    function viewModel(params) {

      var self = this,
          mBook = params.mBook,
          settings = params.settings,
          data = params.settings.data(),
          options = params.settings.options;

      self.touchSupport = ko.observable(WebUtility.IsMobile());

      function setBody() {

        var body = "";

        if (data.body != undefined)
        {
          body = data.body.reduce(function(acc, curr) {
            return acc + "<br>" + curr;
          });
        }
        return body;
      }

      self.title = data.title;

      self.body = setBody();

      self.label = data.label;

      self.pageRef = function () {

        var pageToLoad = data.page;
        var bookData = mBook.bookData.structure;

        function recurse(structure)
        {
          for (var i = 0; i < structure.length; i++)
          {
            if (structure[i].title == pageToLoad)
            {
              return structure[i].pageIndex;
            }
            else if (structure[i].section !== undefined)
            {
              var retVal = recurse(structure[i].section);

              if (retVal != undefined)
              {
                return retVal;
              }
            }
          }
        }

        var page = recurse(bookData);

        if (page != undefined)
        {
          mBook.GotoPage(page);
        }
      }

      self.isFooter = ko.observable((options.format() == "footer") ? true : false);

    }

    return {
      viewModel: viewModel,
      template: htmlTemplate
    };
  });
