define(["text!./nav.html", "knockout", "jquery", "WebUtility", "less!./nav"], function(htmlTemplate, ko, $, WebUtility) {

  function viewModel(params) {
    var self = this;
    var elem = $(params.elem);
    self.id = params.id;
    self.settings = params.settings;
    var toolbox = params.settings.toolbox;
    var options = params.config.options;

    function updateImageHTML(button, url) {
      WebUtility.FileToImageTag(params.config.assets + url, function(html) {
        button(html);
      });
    }


    var mBook = params.mBook;

    //Observable: position
    self.settings.position.subscribe(function(newVal) {
      $("#" + self.id).addClass(newVal);
    });
    $("#" + self.id).addClass(self.settings.position());

    //Observable: logos
    self.imageLogos = toolbox.imageLogos;
    self.imageLogos.subscribe(function(newVal) {
      createLogoHTML(newVal.length);
    });

    function createLogoHTML(n) {
      for (var i = 0; i < n; i++) {
        self.imageLogos()[i].logoHTML = ko.observable();
        self.imageLogos()[i].image.subscribe(function(newVal) {
          updateImageHTML(self.imageLogos()[i].logoHTML, newVal);
        });
        updateImageHTML(self.imageLogos()[i].logoHTML, self.imageLogos()[i].image());
      }
    }
    createLogoHTML(self.imageLogos().length);

    //Observable: buttons
    self.buttons = toolbox.buttons;

    self.buttons.subscribe(function(newVal) {
      creatIconHTML(newVal.length);
    });

    function creatIconHTML(n) {
      for (var i = 0; i < n; i++) {
        self.buttons()[i].iconHTML = ko.observable();
        self.buttons()[i].icon.subscribe(function(newVal) {
          updateImageHTML(self.buttons()[i].iconHTML, newVal);
        });
        updateImageHTML(self.buttons()[i].iconHTML, self.buttons()[i].icon());
      }
    }

    creatIconHTML(self.buttons().length);

    //Click event for observable buttons
    self.buttonClick = function(triggerID, triggerName, triggerAll, functionCall, button, event) {

      var target = $(event.delegateTarget);

      var targIsCurrent = target.hasClass("current");

      //Trigger event on element
      if (triggerID.length) {
        $("#" + triggerID).trigger(triggerName);
      }

      //Trigger all on other elements
      for (var i = 0; i < self.buttons().length; i++) {
        if (self.buttons()[i].triggerTargetID() != triggerID) {
          $("#" + self.buttons()[i].triggerTargetID()).trigger(triggerAll);
        }
      }

      //Evaluate function

      // MP REMOVED - due to integration with backends,
      // it may be unwise to 'eval' due to security risks;
      // potentially input JSON could be tampered with to inject malicious code
      ///////
      // if(functionCall.length) {
      // 	var func = "function caller() {"+functionCall+"}";
      // 	eval(func);
      // 	caller();
      // }

      soundManager.play("ui-tap");

      if (targIsCurrent) {
        target.removeClass("current");
        elem.removeClass("active");
      } else {
        setTimeout(function() {
          target.addClass('current').siblings().removeClass('current');
          $("#" + self.id).addClass("active");
        }, 1);
      }

    };

    //Add button
    toolbox.AddButton = function(buttonIcon, buttonTriggerID, buttonTriggerName, buttonTriggerAll, buttonFunctionCall) {

      var newButton = {
        icon: buttonIcon,
        triggerTargetID: buttonTriggerID,
        triggerName: buttonTriggerName,
        triggerAll: buttonTriggerAll,
        functionCall: buttonFunctionCall
      };

      self.buttons.push(ko.mapping.fromJS(newButton));
    };

  };

  return {
    viewModel: viewModel,
    template: htmlTemplate
  };
});
