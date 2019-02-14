define(
  ["text!./question-multi.html", "knockout", "WebUtility"],
  function(htmlTemplate, ko, WebUtility) {

    ko.bindingHandlers.questionMultiFadeVisible = {
      init: function(element, valueAccessor) {
        var value = valueAccessor();
        $(element).toggle(ko.unwrap(value));
      },
      update: function(element, valueAccessor) {
        var value = valueAccessor();
        ko.unwrap(value) ? $(element).fadeIn(500) : $(element).fadeOut(500);
      }
    };

    function viewModel(params) {
      var self = this,
        elem = $(params.elem),
        config = params.config,
        data = params.settings.data(),
        options = params.settings.options,
        assets = config.assets,
        mBook = params.mBook,
        themeSettings = params.themeSettings;

      /*
       * KNOCKOUT VIEWMODEL SETUP
       */

      self.id = data.id;
      self.questionBody = data.body;
      self.answers = data.options.answers;
      self.correctAnswer = data.options.correct;

      self.answers = self.answers.map(function(answer) {
        return {
          text: answer,
          selected: ko.observable(false),
          handleChange: inputChange
        }
      });

      function inputChange(d, e) {
        self.answers.forEach(function(el){
            if(el !== d) el.selected(false);
        })

        this.selected(!this.selected());
      }

      var profileData = mBook.userProfile.GetCustomData("questionmulti" + self.id);
      self.chosenAnswer = ko.observable(((profileData.length) ? profileData[0] : ""));
      self.complete = ko.observable(((profileData.length) ? true : false));

      self.result = ko.computed(function() {
        if (self.chosenAnswer() === "") return "";

        return (self.chosenAnswer() == self.correctAnswer) ? "pass" : "fail";
      });

      self.passIcon = ko.observable();
      self.passIconUrl = ko.computed(function() {
        return assets + themeSettings.passIcon();
      });
      self.passIconUrl.subscribe(function(newVal) {
        WebUtility.FileToImageTag(newVal, function(html) {
          self.passIcon(html);
        });
      });
      WebUtility.FileToImageTag(self.passIconUrl(), function(html) {
        self.passIcon(html);
      });

      self.failIcon = ko.observable();
      self.failIconUrl = ko.computed(function() {
        return assets + themeSettings.failIcon();
      });
      self.failIconUrl.subscribe(function(newVal) {
        WebUtility.FileToImageTag(newVal, function(html) {
          self.failIcon(html);
        });
      });
      WebUtility.FileToImageTag(self.failIconUrl(), function(html) {
        self.failIcon(html);
      });

      self.currentIcon = ko.computed(function() {
        if (self.complete()) {
          return (self.chosenAnswer() == self.correctAnswer) ? self.passIcon() : self.failIcon();
        } else {
          return "";
        }
      });

      self.makeFeedback = function(array) {
          return array.reduce(function(acc, curr) {
            return acc + "<br><br>" + curr;
          });
      };

      self.feedback = ko.computed(function() {
        if (self.complete()) {
          return (self.chosenAnswer() == self.correctAnswer)
                  ? self.makeFeedback(data.feedback.correct) : self.makeFeedback(data.feedback.incorrect);
        } else {
          return "";
        }
      });

      self.feedbackClass = ko.computed(function() {
        if (self.complete()) {
          return (self.chosenAnswer() == self.correctAnswer) ? "correct" : "incorrect";
        } else {
          return "";
        }
      });

      /*
       * INTERACTIVE FUNCTIONALITY
       */
      self.submit = function(data) {

        if (self.chosenAnswer().length != undefined)
          return;

        var correct = self.chosenAnswer() == self.correctAnswer;

        self.complete(true);
        mBook.userProfile.QuestionSubmit(self.id, correct);

        mBook.userProfile.ModifyCustomData("questionmulti" + self.id, [self.chosenAnswer()]);

        if (mBook.userProfile.mode > 0) {

          var location = mBook.GetLocation(mBook.bufferIndexPage);
          var pageTitle = location[location.length - 1];
          var answers = data.answers;

          mBook.userProfile.addInteraction({
            id: pageTitle.replace(/\s/g, "_") + "_" + "MultiChoice_" + self.id,
            type: "choice",
            response: answers[data.chosenAnswer()].text,
            rightAnswer: answers[data.correctAnswer].text,
            result: correct ? "correct" : "wrong",
            description: self.questionBody
          });

        }

        mBook.userProfile.Save();

      };

      self.touchSupport = ko.observable(WebUtility.IsMobile());

    }

    return {
      viewModel: viewModel,
      template: htmlTemplate
    };
  });
