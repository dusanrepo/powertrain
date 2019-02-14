define(
  ["dependency"],
  function(dependencyVariable) {
    "use strict";

    //Constructor
    function ExampleTemplate(argv) {

      //IMPORTANT
      //Ensures that Class is invoked with "new"
      //Stops private variables leaking into the global namespace
      if (!(this instanceof ExampleTemplate)) {
        throw new TypeError("ExampleTemplate constructor cannot be called as a function.");
      }

      //Private Variable
      this.privateVar = argv;

    }

    //Static Variable
    ExampleTemplate.STATIC_VAR = 10;

    //Public Static Method
    ExampleTemplate.PublicStaticMethod = function(argv) {

      return argv;

    }

    //Private Static Function
    function PrivateStaticFunction(argv) {

      return argv;

    }

    ExampleTemplate.prototype = {

      //IMPORTANT
      constructor: ExampleTemplate,

      //Public Method
      PublicMethod: function(argv) {

      }

    };

    return ExampleTemplate;

  });