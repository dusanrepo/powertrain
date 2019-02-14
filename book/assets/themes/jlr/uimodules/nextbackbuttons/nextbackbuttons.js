define(["text!./nextbackbuttons.html", "knockout", "WebUtility", "less!./nextbackbuttons"], function(htmlTemplate, ko, WebUtility) {

    ko.bindingHandlers.navButtonsfadeVisible = {
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
        var self = this;
        self.settings = params.settings;
        self.options = params.config.options;
        var mBook = params.mBook;
        var elem = $(params.elem);

        function updateButtonImage(button, url) {
            WebUtility.FileToImageTag(params.config.assets + url, function(html) {
                button(html);
            });
        }

        //Stores the HTML for the button icon images
        this.backImage = ko.observable();
        this.nextImage = ko.observable();


        self.showBack = ko.observable(true);

        self.showNext = ko.observable(true);

        self.showBackComp = ko.computed({
            read: function() {
                var currentPage = mBook.GetCurrentPage(),
                    profile = mBook.userProfile;

                if (currentPage == 0 || profile.PageGetLockedStatus(currentPage - 1) == true) {
                    self.showBack(false);
                } else {
                    self.showBack(true);
                }
            },
            write: function(val) {
                //return val;
            }
        });

        self.showNextComp = ko.computed({
            read: function() {
                var currentPage = mBook.GetCurrentPage(),
                    profile = mBook.userProfile;

                if (currentPage >= mBook.GetTotalPages() - 1 || profile.PageGetLockedStatus(currentPage + 1) == true) {
                    self.showNext(false);
                } else {
                    self.showNext(true);
                }
            },
            write: function(val) {
                //return val;
            }

        });

        //Back button image has been updated
        self.settings.backImage.subscribe(function(newVal) {
            updateButtonImage(self.backImage, newVal);
        });
        updateButtonImage(self.backImage, self.settings.backImage());

        //Next button image has been updated
        self.settings.nextImage.subscribe(function(newVal) {
            updateButtonImage(self.nextImage, newVal);
        });
        updateButtonImage(self.nextImage, self.settings.nextImage());

        self.settings.hideOnMobile.subscribe(function(newVal) {
            elem.show();
        });
        elem.show();

        //Next button is clicked
        this.nextClick = function() {
            mBook.NextPage();
            soundManager.play("ui-tap");
            $("#notes").trigger("close");
        };

        //Back button is clicked
        this.backClick = function() {
            mBook.PreviousPage();
            soundManager.play("ui-tap");
            $("#notes").trigger("close");
            $("#glossary").trigger("close");
        };

        mBook.Event("onRefresh", function() {

            var currentPage = mBook.GetCurrentPage(),
                profile = mBook.userProfile;

            if (currentPage == 0 || profile.PageGetLockedStatus(currentPage - 1) == true) {
                self.showBack(false);
            } else {
                self.showBack(true);
            }
            if (currentPage >= mBook.GetTotalPages() - 1 || profile.PageGetLockedStatus(currentPage + 1) == true) {
                self.showNext(false);
            } else {
                self.showNext(true);
            }
        });
    };

    return {
        viewModel: viewModel,
        template: htmlTemplate
    };
});
