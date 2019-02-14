/**
 * The WebUtility module contains helper functions to assist in general development. These
 * functions include loading web resources on the fly.
 *
 * @class WebUtility
 * @example
 * //Require the WebUtility module
 * define(["WebUtility"], function(WebUtility) {
 *
 * 	//Load a css file
 * 	WebUtility.LoadCSS("assets/css/style.css");
 *
 * });
 */

define(function() {
    "use strict";

    return {

        /**
         * Loads a LESS style sheet file onto the page. The LESS style sheet is compiled into CSS immediately after it is loaded
         * @memberof WebUtility
         *
         * @param {String} source Resource location without extension
         * @example
         * ...
         *
         * WebUtility.LoadLESS("path/to/less/file/mylessfile");
         *
         * ...
         *
         */
        /*		LoadLESS: function(source) {
        			$("head").append("<link rel='stylesheet/less' type='text/css' href='"+source+".less'>");
        			less.sheets.push($("link[href='"+source+".less']")[0]);
        			less.refresh();
        		},*/

        /**
         * Loads a CSS file onto the page.
         * @memberof WebUtility
         *
         * @param {String} source Resource location without extension
         * @example
         * ...
         *
         * WebUtility.LoadCSS("path/to/css/file/mycssfile");
         *
         * ...
         *
         */
        LoadCSS: function(source) {
            $("head").append("<link rel='stylesheet' type='text/css' href='" + source + ".css'>");
        },

        /**
         * Loads a JS file onto the page.
         * @memberof WebUtility
         *
         * @param {String} source Resource location without extension
         * @example
         * ...
         *
         * WebUtility.LoadJS("path/to/js/file/myscriptfile.js");
         *
         * ...
         *
         */
        LoadJS: function(source) {
            $("head").append("<script type='text/javascript' src='" + source + ".js'>");
        },

        /**
         * Loads a JS file onto the page.
         * @memberof WebUtility
         *
         * @param {String} source Resource location without extension
         *
         */
        ImageToInlineSVG: function(tag, source) {

            //Request SVG file
            return $.ajax({
                url: source,
                success: function(svgData) {

                    //Replace img tag with SVG markup
                    var div = document.createElement("div");
                    div.innerHTML = new XMLSerializer().serializeToString(svgData.documentElement);
                    tag.replaceWith(div.innerHTML);

                }
            });
        },

        FileToImageTag: function(url, callback) {

            if (!url.length) callback("");

            if (url.split('.').pop() == "svg") {
                require(["text!" + url], function(svg) {
                    callback(svg);
                });
            } else {
                callback("<img src='" + require.toUrl(url) + "' />");
            }
        },

        GetObjectsByFilter: function(objectList, property, value) {
            return $.grep(objectList, function(e) {
                return e[property] == value;
            });
        },

        ToggleFullScreen: function(documentElement, callbackEnter, callbackExit) {

            var hasRequestFullscreen =
                documentElement.requestFullscreen ||
                documentElement.mozRequestFullScreen ||
                documentElement.msRequestFullscreen ||
                documentElement.webkitRequestFullscreen;

            if (hasRequestFullscreen) {

                var notFullscreen = !document.fullscreenElement &&
                    !document.mozFullScreenElement &&
                    !document.webkitFullscreenElement &&
                    !document.msFullscreenElement;

                if (notFullscreen) {

                    if (documentElement.requestFullscreen) {

                        document.addEventListener("fullscreenchange", function() {

                            if (document.fullscreenElement != null)
                                if (callbackEnter) callbackEnter();

                            if (document.fullscreenElement == null)
                                if (callbackExit) callbackExit();

                            document.removeEventListener("fullscreenchange", false);

                        });

                        documentElement.requestFullscreen();

                    } else if (documentElement.msRequestFullscreen) {

                        document.addEventListener("MSFullscreenChange", function() {

                            if (document.msFullscreenElement != null)
                                if (callbackEnter) callbackEnter();

                            if (document.msFullscreenElement == null)
                                if (callbackExit) callbackExit();

                            document.removeEventListener("MSFullscreenChange", false);

                        });

                        documentElement.msRequestFullscreen();

                    } else if (documentElement.mozRequestFullScreen) {

                        document.addEventListener("mozfullscreenchange", function() {

                            if (document.mozFullscreenElement != null)
                                if (callbackEnter) callbackEnter();

                            if (document.mozFullscreenElement == null)
                                if (callbackExit) callbackExit();

                            document.removeEventListener("mozfullscreenchange", false);

                        });

                        documentElement.mozRequestFullScreen();

                    } else if (documentElement.webkitRequestFullscreen) {
                        document.addEventListener("webkitfullscreenchange", function() {
                            if (document.webkitFullscreenElement != null)
                                if (callbackEnter) callbackEnter();
                            if (document.webkitFullscreenElement == null)
                                if (callbackExit) callbackExit();

                            document.removeEventListener("webkitfullscreenchange", false);

                        });

                        documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                    }

                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                }


            } else {
                var media = $('video, audio', documentElement).get(0);

                if (!media) {
                    throw new Error("No media to full screen");
                }

                var enterFullscreen =
                    media.enterFullscreen ||
                    media.mozEnterFullscreen ||
                    media.msEnterFullscreen ||
                    media.webkitEnterFullscreen;

                if (media.enterFullscreen) {
                    media.enterFullscreen();
                } else if (media.mozEnterFullscreen) {
                    media.mozEnterFullscreen();
                } else if (media.msEnterFullscreen) {
                    media.msEnterFullscreen();
                } else if (media.webkitEnterFullscreen) {
                    media.webkitEnterFullscreen();
                }
            }
        },

        IsMobile: function() {
            return navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i);
        },

        IsTouch: function() {
            return 'ontouchstart' in window || 'ontouchmove' in window;
        },

        isIOS: function() {
            return /iP(hone|od|ad)/.test(navigator.platform);
        },

        isAndroid: function() {
            return /Android/i.test(navigator.userAgent);
        },

        IOSVersion: function() {
            if (this.isIOS() === false) {
                throw new Error("Attemping to check IOS when device is not IOS");
            }

            return parseInt(navigator.appVersion.match(/OS (\d+)/)[1]);
        },

        forceRepaint: function(elements) {

            var self = this;

            if (!(elements instanceof jQuery) &&
                typeof elements !== 'object' &&
                !/html|node/i.test(elements.toString())
            )
                throw new Error(elements + " : is not nodes or jQuery object");

            if (!(elements instanceof jQuery))
                elements = $(elements);

            elements.each(function(i, el) {

                if (el.style.display !== 'none') {
                    el.style.display = 'none';
                    el.offsetHeight;
                    el.style.display = '';
                }
                if (el.children && el.children.length > 0) {
                    self.forceRepaint($(el).children());
                }

            });
        }

    };

});
