//Main application entry point

//require.js configuration
requirejs.config({
    baseUrl: "assets/",
    paths: {

        //Source includes
        BookReader: "core/js/src/bookreader",
        MasterViewModel: "core/js/src/masterviewmodel",
        mBook: "core/js/src/mbook",
        UserProfile: "core/js/src/userprofile",
        PageViewModel: "core/js/src/pageviewmodel",
        UIViewModel: "core/js/src/uiviewmodel",
        ThemeLoader: "core/js/src/themeloader",

        //3rd party Vendor code includes
        text: "core/js/vendor/requirejs/text",
        jquery: "core/js/vendor/jquery",
        jqueryTouchSwipe: "core/js/vendor/jquery.touchSwipe",
        jqueryScrollTo: "core/js/vendor/jquery.scrollTo",
        knockout: "core/js/vendor/knockout",
        komapping: "core/js/vendor/knockout.mapping",
        lesscss: "core/js/vendor/requirejs/lessc",
        perfectScrollbar: "core/js/vendor/perfect-scrollbar",
        pdf: "core/js/vendor/pdfjs/pdf",
        libPannellum: "core/js/vendor/pannellum/libpannellum",
        pannellum: "core/js/vendor/pannellum/pannellum",
        requestAnimationFrame: "core/js/vendor/pannellum/RequestAnimationFrame",
        less: 'core/js/vendor/requirejs/less',
        css: 'core/js/vendor/requirejs/css',
        normalize: "core/js/vendor/requirejs/normalize",

        //Library code includes
        NoteCamera: "core/js/lib/NoteCamera",
        WebUtility: "core/js/lib/WebUtility",
        scorm12comms: "core/js/lib/scorm12comms",
        scorm2004comms: "core/js/lib/scorm2004comms",
        service: "core/js/lib/service"

    },
    shim: {
        "scorm12comms": {
            "exports": "scorm12comms"
        },
        "scorm2004comms": {
            "exports": "scorm2004comms"
        },
        komapping: {
            deps: ["knockout"],
            exports: "komapping"
        }
    }
});

requirejs(
    ["jquery", "mBook"],
    function($, mBook, service) {
        var application = new mBook("assets/content");
        application.Load();
    }
);
