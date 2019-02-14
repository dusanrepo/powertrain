define(["text!./contentview.html", "knockout", "jquery", "WebUtility", "perfectScrollbar", "jqueryTouchSwipe", "less!./contentview"],
    function(htmlTemplate, ko, $, WebUtility, Ps, swipe) {

        function viewModel(params) {
            var self = this;
            self.settings = params.settings;
            var mBook = params.mBook;
            var elem = $(params.elem);

            var containers = $(elem).children("div");

            self.frontPageBuffer = mBook.mastervm.frontBuffer.modules;
            self.backPageBuffer = mBook.mastervm.backBuffer.modules;
            self.isBack = mBook.mastervm.isBack;
            self.isMobile = WebUtility.IsMobile();

            //Search page event
            var recentQuery = "";
            elem.bind("searchPage", function(e, query) {
                recentQuery = query;
                mBook.SearchPage(query, elem);
            });

            mBook.Event("pageLoad", function() {
				mBook.directLoad=0;
                //highlight search
                setTimeout(function() {
                    elem.trigger("searchPage", recentQuery);
                }, 500);

                //Update scrollbars
                updateScroll();
            });

            //Initialise perfect scrollbar plugin
            function updateScroll() {
                Ps.update(containers[0]);
                Ps.update(containers[1]);
            }

            self.updateScroll = updateScroll;

            function initScroll() {
                if (!WebUtility.IsMobile()) {
                    Ps.initialize(containers[0], {
                        wheelSpeed: 1,
                        wheelPropagation: true,
                        minScrollbarLength: 20
                    });
                    Ps.initialize(containers[1], {
                        wheelSpeed: 1,
                        wheelPropagation: true,
                        minScrollbarLength: 20
                    });
                }
            }
            setTimeout(function() {
                initScroll();
            }, 10);

            $(window).resize(function() {

                //Update scrollbar
                updateScroll();
            });

            //var currentPage = mBook.GetCurrentPage();
            //var currentPage = (window.history.state!=null) ? window.history.state : mBook.GetCurrentPage();
            //mBook.GotoPage(currentPage);

            mBook.Event("onRefresh", function() {
                var currentPage = mBook.GetCurrentPage();
                mBook.userProfile.PageSetViewedStatus(currentPage, "viewed");
            });

        }

        if (ko.bindingHandlers.fadeVisible == undefined) {
            ko.bindingHandlers.fadeVisible = {
                init: function(element, valueAccessor) {
                    // Initially set the element to be instantly visible/hidden depending on the value
                    var value = valueAccessor();
                    $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
                },
                update: function(element, valueAccessor) {
                    // Whenever the value subsequently changes, slowly fade the element in or out
                    var value = valueAccessor();
                    ko.unwrap(value) ? $(element).fadeIn() : $(element).fadeOut();
                }
            };
        }

        return {
            viewModel: viewModel,
            template: htmlTemplate
        };
    });
