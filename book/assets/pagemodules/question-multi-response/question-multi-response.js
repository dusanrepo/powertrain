define(
  ["text!./question-multi-response.html", "knockout", "WebUtility"],
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
      self.correctAnswers = data.options.correct;

      self.answers = self.answers.map(function(answer) {
        return {
          text: answer,
          selected: ko.observable(false),
          handleChange: WebUtility.IsTouch() ? inputChange : null
        }
      });

      function inputChange(e) {
        this.selected(!this.selected());
      }

      var profileData = mBook.userProfile.GetCustomData("questionmulti" + self.id);
      self.chosenAnswers = ko.observableArray(((profileData.length) ? profileData[0] : []));
      self.complete = ko.observable(((profileData.length) ? true : false));

      self.correct = ko.computed(function() {
        var chosen = self.chosenAnswers(),
          correct = ko.mapping.toJS(self.correctAnswers);

        return chosen.length === correct.length && chosen.every(function(val) {
          return correct.indexOf(val) > -1;
        });

      });

      self.result = ko.computed(function() {
        if (self.chosenAnswers().length === 0) return "";

        return self.correct() ? "pass" : "fail";
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


      self.checkHtml = ko.observable();

      WebUtility.FileToImageTag(assets + themeSettings.checkedIcon(), function(html) {
        self.checkHtml(html);
      })

      self.currentIcon = ko.computed(function() {
        if (self.complete()) {
          return self.correct() ? self.passIcon() : self.failIcon();
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
          return self.correct() ? self.makeFeedback(data.feedback.correct) : self.makeFeedback(data.feedback.incorrect);
        } else {
          return "";
        }
      });

      self.feedbackClass = ko.computed(function() {
        if (self.complete()) {
          return self.correct() ? "correct" : "incorrect";
        } else {
          return "";
        }
      });

      /*
       * INTERACTIVE FUNCTIONALITY
       */
      self.submit = function(data) {

        if (self.chosenAnswers().length === 0) return;

        var correct = self.correct();

        self.complete(true);

        mBook.userProfile.QuestionSubmit(self.id, correct);
        mBook.userProfile.ModifyCustomData("questionmulti" + self.id, [self.chosenAnswers()]);

        if (mBook.userProfile.mode > 0) {

          var location = mBook.GetLocation(mBook.bufferIndexPage);
          var pageTitle = location[location.length - 1];
          var answers = data.answers;

          mBook.userProfile.addInteraction({
            id: pageTitle.replace(/\s/g, "_") + "_" + "MultiChoice_" + self.id,
            type: "choice",
            response: data.chosenAnswers().reduce(function(acc, qnum, i) {
              return acc + (i > 0 ? ", " : "") + answers[qnum].text;
            }, ""),
            rightAnswer: data.correctAnswers.reduce(function(acc, qnum, i) {
              return acc + (i > 0 ? ", " : "") + answers[qnum].text;
            }, ""),
            result: correct ? "correct" : "wrong",
            description: self.questionBody
          });

        }

        mBook.userProfile.Save();

      };

      self.touchSupport = ko.observable(WebUtility.IsMobile());

      /*
       * WIDGET EDIT FUNCTIONALITY
       */

    }

    return {
      viewModel: viewModel,
      template: htmlTemplate
    };
  });
