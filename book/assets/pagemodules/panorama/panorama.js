define(
  ["text!./panorama.html", "require", "knockout", "pannellum", "libPannellum", "requestAnimationFrame"],
  function(htmlTemplate, require, ko) {

    function viewModel(params) {
        var self = this,
        config = params.config,
        data = params.settings.data(),
        // Instance of the Pannellum Viewer
        view = pannellum.viewer("module-panorama", data);

        // Allow implicit setting of height for the viewport (fallback is 400px)
        self.calcHeight = ((data.height) ? data.height + "px" : "");

        // UI elements
        var btn = view.getContainer().querySelector(".pnlm-load-button");
        var info = view.getContainer().querySelector(".pnlm-panorama-info");
        var controls = view.getContainer().querySelector(".pnlm-controls-container");

        // Hide controls intially then display once started
        controls.setAttribute("style","display: none;");

        // Temporary solution for hiding infoLabel & displaying controls when loadButton is pressed
        btn.addEventListener("click", startPano);

        function startPano() {
            info.setAttribute("style","display: none;");
            controls.removeAttribute("style");
        };
    };

    return {
      viewModel: viewModel,
      template: htmlTemplate
    };
  });
