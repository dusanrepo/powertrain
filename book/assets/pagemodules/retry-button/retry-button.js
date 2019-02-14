define(["text!./retry-button.html", "knockout", "WebUtility"], function (htmlTemplate, ko, WebUtility, knob)
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

        self.visible = ko.computed(function ()
        {

            var questionsAnswered = mBook.userProfile.QuestionsAnswered();

            if (questionsAnswered == mBook.bookData.assessedmodules)
                return mBook.AssessmentPassed() ? "" : "visible";

        });

        var pageToLoad = data()[0]();

        self.retryQuestions = function ()
        {

            mBook.userProfile.ResetQuestionData();

            mBook.GotoPage(!isNaN(pageToLoad) ? pageToLoad : mBook.GetCurrentPage());

        }
    }

    return {
        viewModel: viewModel,
        template: htmlTemplate
    };
});
