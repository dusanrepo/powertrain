define(["text!./results.html", "knockout", "WebUtility", "./jquery.knob"], function (htmlTemplate, ko, WebUtility, knob)
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

        // This is a horrible hack, but it works
        var forceRecalculation = ko.observable(1);

        mBook.AssessmentQuestionAnswered.add(function ()
        {
            self.resultAvailable(mBook.AssessmentCompleted());
            self.score(mBook.AssessmentScore() + "%");
            self.correctAnswers(mBook.userProfile.QuestionsCorrect());

            forceRecalculation(forceRecalculation() + 1);

            if (mBook.AssessmentPassed())
                self.currentIcon = self.passIcon;
            else
                self.currentIcon = self.failIcon;

            if (mBook.AssessmentCompleted())
            {
                $(".key-wrapper", elem).fadeTo(900, 1.0, function ()
                {
                    $(".complete-message", elem).fadeTo(900, 1.0, function ()
                    {
                        $(".final-result", elem).fadeIn(900);
                    });
                });
            }

            var dum = $("<div></div>");
            //	setTimeout(function(){
            dum.animate({
                'height': self.score() + "px"
            }, {
                duration: 3000,
                easing: 'swing',
                step: function (val)
                {
                    self.score(val);

                }
            }, function ()
            {

            });
            //	},500);
        });

        /*
         * KNOCKOUT VIEWMODEL SETUP
         */
        var complete = mBook.AssessmentCompleted();
        self.resultAvailable = ko.observable(complete);
        self.score = ko.observable(mBook.AssessmentScore() + "%");
        self.correctAnswers = ko.observable(mBook.userProfile.QuestionsCorrect());

        self.wrongAnswers = ko.computed(function ()
        {
            forceRecalculation();
            return mBook.bookData.assessedmodules - self.correctAnswers();
        });

        self.correctMessage = ko.computed(function ()
        {
            forceRecalculation();
            return (self.correctAnswers() == 1) ? themeSettings.correctAnswer() : themeSettings.correctAnswers();
        });

        self.incorrectMessage = ko.computed(function ()
        {
            forceRecalculation();
            return (self.wrongAnswers() == 1) ? themeSettings.incorrectAnswer() : themeSettings.incorrectAnswers();
        });

        self.result = ko.computed(function ()
        {
            forceRecalculation();
            return (mBook.AssessmentPassed()) ? "pass" : "fail";
        });

        self.completeMessage = ko.computed(function ()
        {
            forceRecalculation();

            if (mBook.AssessmentPassed())
                return themeSettings.passMessage();
            else
                return themeSettings.failMessage();
        });

        self.unavailableMessage = themeSettings.unavailableMessage;

        self.score.subscribe(function (newVal)
        {
            $("input", elem).val(newVal);
            $("input", elem).trigger("change");
        });

        self.passIcon = ko.observable();
        self.passIconUrl = ko.computed(function ()
        {
            return assets + themeSettings.passIcon();
        });
        self.passIconUrl.subscribe(function (newVal)
        {
            WebUtility.FileToImageTag(newVal, function (html)
            {
                self.passIcon(html);
            });
        });
        WebUtility.FileToImageTag(self.passIconUrl(), function (html)
        {
            self.passIcon(html);
        });

        self.failIcon = ko.observable();
        self.failIconUrl = ko.computed(function ()
        {
            return assets + themeSettings.failIcon();
        });
        self.failIconUrl.subscribe(function (newVal)
        {
            WebUtility.FileToImageTag(newVal, function (html)
            {
                self.failIcon(html);
            });
        });
        WebUtility.FileToImageTag(self.failIconUrl(), function (html)
        {
            self.failIcon(html);
        });

        if (mBook.AssessmentPassed())
            self.currentIcon = self.passIcon;
        else
            self.currentIcon = self.failIcon;

        $("input", elem).knob({
            'format': function (value)
            {
                return value + '%';
            }
        });
        var dum = $("<div></div>");
        //	setTimeout(function(){
        dum.animate({
            'height': self.score() + "px"
        }, {
            duration: 3000,
            easing: 'swing',
            step: function (val)
            {
                self.score(val);

            }
        }, function ()
        {

        });
        //	},500);

        if (mBook.AssessmentCompleted())
        {
            $(".key-wrapper", elem).fadeTo(900, 1.0, function ()
            {
                $(".complete-message", elem).fadeTo(900, 1.0, function ()
                {
                    $(".final-result", elem).fadeIn(900);
                });
            });
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