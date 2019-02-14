define(["text!./search.html", "knockout", "jquery", "WebUtility", "perfectScrollbar", "less!./search"], function(htmlTemplate, ko, $, WebUtility, Ps) {

  function viewModel(params) {
    var self = this;

    var elem = params.element;
    self.id = params.id;
    self.settings = params.settings;
    var toolbox = params.settings.toolbox;
    var options = params.config.options;
    var mBook = params.mBook;

    var keepFocus = false;
    var fadeLock = false;

    var searchOpen = false;

    function updateImageHTML(button, url) {
      WebUtility.FileToImageTag(params.config.assets + url, function(html) {
        button(html);
      });
    }

    Ps.initialize($(".search-results", elem)[0], {
      wheelSpeed: 1,
      wheelPropagation: true
    });

    //Observable: placeholder text
    self.placeholder = self.settings.searchEmptyText;

    self.showEmpty = ko.observable(false);

    //Observable: search icon
    self.searchIcon = ko.observable();
    self.settings.searchIcon.subscribe(function(newVal) {
      updateImageHTML(self.searchIcon, newVal);
    });
    updateImageHTML(self.searchIcon, self.settings.searchIcon());

    //Observable: search loading icon
    self.loadingIcon = ko.observable();
    self.settings.searchLoadingIcon.subscribe(function(newVal) {
      updateImageHTML(self.loadingIcon, newVal);
    });
    updateImageHTML(self.loadingIcon, self.settings.searchLoadingIcon());



    self.closeButton = ko.observable();
    if (self.settings.closeButton() != "") {
      self.settings.searchLoadingIcon.subscribe(function(newVal) {
        updateImageHTML(self.closeButton, newVal);
      });
      updateImageHTML(self.closeButton, self.settings.closeButton());
    }

    Ps.initialize($(".search-results", elem)[0], {
      wheelSpeed: 1,
      wheelPropagation: true
    });


    self.closeSearch = function(updateNav) {

      searchOpen = false;
      $(".search-results").css("max-height", 0);
      $(".search-results-wrapper").css("padding-bottom", 0);
      if ($("#search-result-list li").length || self.showEmpty()) {
        //	setTimeout(function(){
        if (!$("#search-query").val()) self.searchResults.removeAll();
        $(".search-bar").removeClass("open");
        $(".search-overlay").removeClass("open");

        //},500);
      } else {
        $(".search-bar").removeClass("open");
      }

      $(".search-overlay").removeClass("open");

      if (updateNav) {
        $('#navigationBar').removeClass("active");
        $('.nav-buttons > button').removeClass("current");
      }


    }

    function toggle() {

      if (!searchOpen) {
        searchOpen = true;
        $(".search-bar").addClass("open");
        if ($("#search-result-list").height()) {
          //setTimeout(function(){
          $(".search-results").css("max-height", (($("#search-result-list").outerHeight() < 400) ? $("#search-result-list").outerHeight() : 400));
          $(".search-results-wrapper").css("padding-bottom", 50);
          //},500);
        }
        if (self.searchResults().length)
          $(".search-overlay").addClass("open");
        $("#search-query").focus();
      } else {
        self.closeSearch(false);
      }
    }

    $("#" + self.id).bind("toggle", toggle);

    $("#" + self.id).bind("close", function() {
      self.closeSearch(true);
    });

    $("#btn-search-submit").focus(function() {
      keepFocus = true;
    });

    //Pressing enter in search field
    $('#search-query').keyup(function(e) {
      if (e.keyCode == 13) {
        $("#btn-search-submit").click();
      } else {
        var query = $("#search-query").val();
        $("#contentView").trigger("searchPage", query);
        if (!query.length) {
          $(".search-results").css("max-height", 0);
          $(".search-results-wrapper").css("padding-bottom", 0);
          $(".search-overlay").removeClass("open");
        }
      }
    });

    /*window.blurTimeout;

    $("#search-query").blur(function() {

    //	$('#navigationBar').removeClass("active");
    //	$('.nav-buttons > button').removeClass("current");
    	console.log("blur")
    	keepFocus = false;

    	window.blurTimeout = setTimeout(function(){
    		console.log("timeo")
    		if(keepFocus == false) {
    			self.closeSearch(true);

    		}
    	}, 200);

    }).focus(function(){
    	keepFocus = true;
    });
    */

    self.searchResults = ko.observableArray();
    self.hoverIconHTML = ko.observable();
    self.settings.resultIcon.subscribe(function(newVal) {
      updateImageHTML(self.hoverIconHTML, newVal);
    });
    updateImageHTML(self.hoverIconHTML, self.settings.resultIcon());

    self.searching = ko.observable(false);

    //Search the book and update results observable array
    self.searchBook = function() {

      $("#search-query").focus();

      self.searching(true);

      //clear results
      self.searchResults.removeAll();
      self.showEmpty(false);

      var query = $("#search-query").val(); //sanitize at some point please...

      if (!query.length) {

        self.searching(false);
        return;

      };

      $("#btn-search-submit").addClass("hidden");

      setTimeout(function() {
        $("#btn-search-submit").hide();

        mBook.SearchBook(query, function(results) {

          $(".loading").removeClass("show");
          setTimeout(function() {
            $(".loading").hide();
          }, 200);
          $("#btn-search-submit").show();

          setTimeout(function() {
            $("#btn-search-submit").removeClass("hidden");
          }, 200);

          if (!$(".search-bar").hasClass("open")) return;

          if (results.length) {
            for (var i = 0; i < results.length; i++) {

              self.searchResults.push({
                sLastLocation: results[i].location.pop(),
                sLocation: (results[i].location.length > 0) ? results[i].location.join(" > ") : "",
                pageIndex: results[i].pageIndex,
                occurances: "(" + results[i].occurances + ")",
                gotoPage: function() {
                  mBook.GotoPage(this.pageIndex);
                }
              });

            }
            $(".search-results").css("max-height", (($("#search-result-list").outerHeight() < 400) ? $("#search-result-list").outerHeight() : 400));

          } else {
            self.showEmpty(true);
            $(".search-results").css("max-height", "100px");
          }

          $(".search-results-wrapper").css("padding-bottom", 50);

          self.searching(false);

        });

      }, 500);
      $(".loading").show();

      setTimeout(function() {
        $(".loading").addClass("show");
      }, 5);

    };
  }

  return {
    viewModel: viewModel,
    template: htmlTemplate
  };
});