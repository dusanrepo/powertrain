define(["UserProfile", "knockout", "BookReader", "ThemeLoader", "MasterViewModel"], function(UserProfile, ko, BookReader, ThemeLoader, MasterViewModel) {
  "use strict";

  //Constructor
  /**
   * The main interface for controlling the mBook and receiving information from it.
   * @class mBook
   *
   * @param {String} bookLocation Location of the book JSON file and content assets. Usually "assets/content".
   *
   */
  function mBook(bookLocation) {

    //IMPORTANT
    //Ensures that Class is invoked with "new"
    //Stops private variables leaking into the global namespace
    if (!(this instanceof mBook)) {
      throw new TypeError("mBook constructor cannot be called as a function.");
    }

    //BookReader object
    this.bookLocation = bookLocation;
    this.bookReader = new BookReader(bookLocation + "/book.json");

    this.events = {
      onRefresh: {
        callbackArgs: [],
        listeners: []
      },
      pageLoad: {
        callbackArgs: [],
        listeners: []
      },
      pageLoaded: {
        callbackArgs: [],
        listeners: []
      }
    };

    this.bufferPageIndex = 0;
	this.directLoad = 0;

    //Append instance to global namespace, for debugging in console only
    window.mBook = this;

  }

  //path to themes folder
  mBook.THEME_PATH = "themes";
  mBook.PAGEMODULE_PATH = "pagemodules";

  mBook.prototype = {

    //IMPORTANT
    constructor: mBook,

    /**
     * Loads the mBook application. This method must be called after instantiating the mBook class.
     * @memberof mBook.prototype
     *
     */
    Load: function() {

      var self = this;

      //Load the book data
      this.bookReader.Load(function(bookData) {

        self.bookData = bookData;

        var storageMode = UserProfile.enum.StorageModes[bookData.settings.storage.mode.toUpperCase()];
        var trackingType = bookData.settings.storage.tracking ?
          UserProfile.enum.Tracking[bookData.settings.storage.tracking.toUpperCase()] : 0;

        self.userProfile = new UserProfile(storageMode, trackingType, self.bookData.pages.length, self.bookData.assessedmodules, self.bookData.settings.passmark, self.GetTitle(), self);

        self.userProfile.checkLoggedIn();

        self.userProfile.Read();
        self.profile = self.userProfile.data;

        //Sort glossary in alphabetically
        self.bookData.glossary.sort(function(a, b) {
          var entry1 = a.n.toUpperCase();
          var entry2 = b.n.toUpperCase();
          return (entry1 < entry2) ? -1 : (entry1 > entry2) ? 1 : 0;
        });

        var themePath = self.GetSelectedThemePath();

        //exercise caution with this option..
        //by default knockout will attempt to use
        //jquery events, setting this to true will result
        //in it using native events
        ko.options.useOnlyNativeEvents = false;

        //Page view model
        self.mastervm = new MasterViewModel();

        //Load page content modules
        var moduleNames = bookData.pagemodules;

        //Get the JSON config files for each ui module
        var moduleConfigLocations = [];
        for (var i = 0; i < moduleNames.length; i++) {
          moduleConfigLocations.push("text!" + mBook.PAGEMODULE_PATH + "/" + moduleNames[i] + "/" + moduleNames[i] + ".json");
        }

        require(moduleConfigLocations, function() {

          for (var i = 0; i < arguments.length; i++) {

            var moduleName = moduleNames[i];

            var moduleConfig = JSON.parse(arguments[i]);
            moduleConfig.timestamp = new Date(moduleConfig.timestamp);
            moduleConfig.root = mBook.PAGEMODULE_PATH + "/" + moduleName;
            moduleConfig.contentPath = "assets/content/";
            moduleConfig.assets = self.GetSelectedThemePath() + "/assets/";

            var moduleType = {
              name: moduleName,
              componentName: "pagewidget-" + moduleName,
              config: moduleConfig,
              mBookInstance: self
            };

            //Register page component
            ko.components.register(moduleType.componentName, {
              require: mBook.PAGEMODULE_PATH + "/" + moduleName + "/" + moduleName
            });

            self.mastervm.frontBuffer.registerComponent(moduleType);
            self.mastervm.backBuffer.registerComponent(moduleType);

          }
        });

        //Set development mode setting according to book setting
        self.EnableDevelopmentMode(self.bookData.settings.developmentMode);

        self.theme = new ThemeLoader(themePath, bookData.uimodules);
        self.theme.Load(self);

        //Set page title
        var titleStyle;

        if (typeof bookData.titlestyle == "undefined") {
          titleStyle = null;
        } else {
          titleStyle = bookData.titlestyle;
        }

        switch (titleStyle) {
          case "subtitle":
            $("title").html(bookData.subtitle);
            break;

          case "title":
            $("title").html(bookData.title);
            break;

          case "title-subtitle":
            $("title").html(bookData.title + " - " + bookData.subtitle);
            break;

          case "subtitle-title":
          default:
            $("title").html(bookData.subtitle + " - " + bookData.title);
            break;
        }
      });
    },

    //Info

    /**
     * Returns the format version of the book content json file. Version 2.0.0+ are natively compatiple with mBook 2. Older or
     * unversioned json files are not currently supported
     * @memberof mBook.prototype
     *
     */
    GetFormatVersion: function() {

      return this.bookData.formatVersion;

    },

    /**
     * Returns the version of the book content.
     *
     * @memberof mBook.prototype
     *
     */
    GetVersion: function() {

      return this.bookData.version;

    },

    /**
     * Get the title of the book.
     *
     * @memberof mBook.prototype
     *
     */
    GetTitle: function() {

      return this.bookData.title;

    },

    /**
     * Get the author of the book (usually blank).
     *
     * @memberof mBook.prototype
     *
     */
    GetAuthor: function() {

      return this.bookData.author;

    },

    /**
     * Get the publisher of the book (usually blank).
     *
     * @memberof mBook.prototype
     *
     */
    GetPublisher: function() {

      return this.bookData.publisher;

    },

    //Settings

    /**
     * Returns true if mBook is in development mode or false of it is not enabled.
     *
     * @memberof mBook.prototype
     *
     */
    DevelopmentModeEnabled: function() {

      return this.bookData.settings.developmentMode;

    },

    /**
     * Loads the module files. All CSS and JS resources files are injected into the DOM. The HTML code is prepared but not injected into the DOM.
     *
     * @memberof mBook.prototype
     *
     * @param {Boolean} enabled Set to true to enable development mode or false to disable development mode.
     *
     */
    EnableDevelopmentMode: function(enabled) {

      this.bookData.settings.developmentMode = enabled;

    },

    /**
     * Returns the name of the currently applied theme as a string.
     *
     * @memberof mBook.prototype
     *
     */
    GetSelectedTheme: function() {

      return this.bookData.settings.theme;

    },

    /**
     * Returns a reference to the mBook's loaded Theme object
     *
     * @memberof mBook.prototype
     *
     */
    GetTheme: function() {

      return this.theme;

    },

    /**
     * Returns the path to the currently applied theme as a string.
     *
     * @memberof mBook.prototype
     *
     */
    GetSelectedThemePath: function() {

      return mBook.THEME_PATH + "/" + this.GetSelectedTheme();

    },

    /**
     * Returns the path to the currently applied theme as a string.
     *
     * @memberof mBook.prototype
     *
     */
    GetSelectedThemeUrl: function() {

      return require.toUrl(mBook.THEME_PATH + "/" + this.GetSelectedTheme());

    },

    //Content

    /**
      * Returns a array of objects containing chapters information:
      * [{
          id : chapterNumber,
          title : chapterTitle,
          content chapterPageContent (only defined if the chapter is also a page, e.g. Table of Contents)
      * }]
      * @memberof mBook.prototype
      *
    */
    GetChapters: function() {

      //Loop through chapters and return array of titles
      var chapters = [];
      for (var i = 0; i < this.bookData.chapters.length; i++) {
        chapters.push({
          id: i,
          title: this.bookData.chapters[i].title
        });
        if (this.bookData.chapters[i].content != undefined)
          chapters[i].content = this.bookData.chapters[i].content;
      }
      return chapters;
    },


    GetStructure: function() {
      //JSON parse JSON stringify to creae new copy of object to avoid mutation
      return JSON.parse(JSON.stringify(this.bookData.structure));

    },

    /**
     * Returns an array of strings containing the location names of a single page. The strings are ordered from highest to lowest level i.e. ["Chapter 1", "Section 2", "Sub Section 2"].
     *
     * @memberof mBook.prototype
     *
     * @param {Number} pageIndex Index of the page to get the location from. Use mBook.GetLocation(mBook.GetCurrentPage()) to get the current location.
     * @returns {Array} List of location strings from highest to lowest level.
     */
    GetLocation: function(pageIndex) {

      //grab location index list.
      var page = (pageIndex != undefined) ? pageIndex : this.profile.currentPage;
      var indexes = this.bookData.pages[page].location;
      var titles = [];

      //Recurses into a section from a specified level
      function pushTitle(section, i) {
        titles.push(section[indexes[i]].title);
        if (section[indexes[i]].section != undefined)
          pushTitle(section[indexes[i]].section, i + 1);
      }

      //Begin recursing into structure at top level (the chapter)
      pushTitle(this.bookData.structure, 0);

      return titles;
    },


    /**
     * Returns the current page index starting from 0.
     *
     * @memberof mBook.prototype
     *
     * @returns {Number} Index of the current page.
     */
    GetCurrentPage: function() {

		  this.directLoad=0;
		  console.log(window.history.state);
      return this.profile.currentPage;

    },

    /**
     * Returns the total number of pages in the book.
     *
     * @memberof mBook.prototype
     *
     * @returns {Number} Total number of pages.
     */
    GetTotalPages: function() {

      return this.bookData.pages.length;

    },


    GetPageData: function(location) {

      return this.bookData.pages[location ? location : this.profile.currentPage];

    },

    //Operations
    /**
     * Searches the entire book's content and returns an list of result objects
     *
     * @memberof mBook.prototype
     *
     * @returns {Object}
     */
    SearchBook: function(query, resultCallback) {

      var self = this;

      setTimeout(function() {

        var results = [];

        //Iterate through each page
        for (var i = 0; i < self.bookData.pages.length; i++) {

          var page = self.bookData.pages[i];

          (function transverseContent(content) {

            //Accumulate occurances
            for (var j = 0; j < content.length; j++) {

              var contentItem = content[j];
              if ((!contentItem.type && contentItem.t) || typeof contentItem === "string") {
                contentItem = BookReader.ConvertToPageModule(contentItem);
              }

              //This string will be searched after being populated with code below
              var dataString = "";
              switch (contentItem.type) {
                case "page-heading":
                  var location = self.GetLocation(i);
                  dataString = location[location.length - 1];
                  break;
                case "sub-heading":
                  dataString = contentItem.data;
                  break;
                case "figure":
                  if (contentItem.data.caption) {
                    dataString = contentItem.data.caption;
                  }
                  break;
                case "html-block":
                  dataString = contentItem.data;
                  break;
                case "page-cover":
                  dataString = contentItem.data;
                  break;
                case "column-block":
                  dataString = contentItem.data;
                  break;
                case "banner":
                  dataString = contentItem.data[0].title.join(" ");
                  break;
                case "bannervideo":
                  dataString = contentItem.data[0].title.join(" ");
                  break;
                case "accordion":
                  dataString = contentItem.data[0];
                  transverseContent(contentItem.data[1]);
                  break;
                case "note":
                  dataString = contentItem.data.title;
                  break;
                case "notes-list":
                  dataString = contentItem.data[0];
                  break;
                case "pdf-link":
                  dataString = contentItem.data[1];
                  break;
                case "page-link":
                  dataString = (function() {
                    if (contentItem.data.title && contentItem.data.body) {
                      dataString =
                        contentItem.data.title + contentItem.data.label +
                        contentItem.data.body.reduce(function(acc, curr) {
                          return acc + " " + curr;
                        }, "");
                    } else {
                      dataString = contentItem.data.label;
                    }
                    return dataString;
                  })();
                  break;
                case "question-multi":
                case "question-multi-response":
                  dataString =
                    contentItem.data[1] +
                    contentItem.data[2].reduce(function(acc, curr) {
                      return acc + " " + curr;
                    }, "");
                  break;
                case 'table':
                  transverseContent(contentItem.data.head);
                  transverseContent(contentItem.data.body);
                  break;
                case 'table-of-contents':
                  var structure = self.GetStructure();

                  (function searchStructure(struct) {
                    struct.forEach(function(item) {
                      if (item.title && item.pageIndex !== i)
                        dataString += item.title + " ";

                      if (item.section)
                        searchStructure(item.section);
                    });
                  })(structure);

                  break;
                case 'tabs':
                  contentItem.data.forEach(function(tab) {
                    dataString += tab[0] + " ";
                    transverseContent(tab[1]);
                  });
                  break;
                case 'tiles':
                  contentItem.data[0].forEach(function(tile) {
                    dataString += tile.title + " ";
                    if (tile.body) {
                      tile.body.forEach(function(text) {
                        dataString += text + " ";
                      });
                    }
                  });
                  break;
                case 'view-block':
                  transverseContent(contentItem.data);
                  break;
                case "list":
                  var reduceList = function(acc, curr) {
                    if (typeof(curr) !== "string") {
                      curr = curr.items.reduce(reduceList, "");
                    }

                    return acc + " " + curr;
                  }

                  dataString = contentItem.data.reduce(reduceList, "");
                  break;
                case "columns":
                  contentItem.data.forEach(transverseContent);
                  break;
                case "panorama":
                  dataString = contentItem.data.title;
                  break;
                default:
                  if (!contentItem.type) {
                    if (Array.isArray(contentItem)) {
                      transverseContent(contentItem);

                    } else {

                      if (Array.isArray(contentItem.content)) {
                        contentItem.content.forEach(function(item) {
                          if (item.t) {
                            transverseContent(item);

                          } else {

                            dataString += item + " ";
                          }
                        });
                      } else {

                        dataString += contentItem.content + " ";
                      }
                    }
                  }
              }

              // Use for debugging purposes
              // console.log("dataString type "+typeof(dataString)+" for "+contentItem.type);

              //Add to results if not empty
              if (dataString != "") {

                var escape = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
                var expression = new RegExp("(" + escape + ")", "gi"); // format the 'keyword' expession
                var found = dataString.match(expression);

                if (found != null) {
                  if (results[i] == undefined)
                    results[i] = {
                      pageIndex: i,
                      location: self.GetLocation(i),
                      occurances: 0
                    };

                  if (results[i] != undefined)
                    results[i].occurances += found.length;
                }
              }
            }

          })(page.content);

        }

        //Fire the callback function if defined with results as argument
        if (resultCallback != undefined) {

          //Re-index array
          results = results.filter(function(item) {
            return item != undefined;
          });
          resultCallback(results);
        }

      }, 0);
    },


    SearchPage: function(query, element) {

      if (element == undefined || query == undefined) return;

      //node.normalize in IE10 causes problems. use this function instead
      function normalize(node) {
        if (!node) {
          return;
        }
        if (node.nodeType == 3) {
          while (node.nextSibling && node.nextSibling.nodeType == 3) {
            node.nodeValue += node.nextSibling.nodeValue;
            node.parentNode.removeChild(node.nextSibling);
          }
        } else {
          normalize(node.firstChild);
        }
        normalize(node.nextSibling);
      }

      //unhighlight
      element.find("mark").each(function() {
        var wrapper = $(this).parent();
        $(this).contents().unwrap();
        normalize(wrapper[0]);
      });

      //if keyword contains any characters
      if (/\S/.test(query)) {
        var escape = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        var expression = new RegExp("(" + escape + ")", "gi"); // format the 'keyword' expession

        element.find('*').contents().each(function(index, element) { // loop through all the elements inside the text_div

          //if the element is a text node
          if (element.nodeType === 3) {

            //store text data of the element in element_data
            var element_data = element.data;
            element_data = element_data.replace(expression, "<mark>$1</mark>"); // replace any matched keywords with .highlight span

            var wrapper = $("<mark>").html(element_data);
            $(element).before(wrapper.contents()).remove();
          }
        });
      }

    },

    NextPage: function() {

      this.GotoPage(this.profile.currentPage + 1);

    },

    PreviousPage: function() {

      this.GotoPage(this.profile.currentPage - 1);

    },

    /**
     * Navigates to the specified page by updating the page viewmodel
     *
     * @memberof mBook.prototype
     *
     * @param {Number} pageIndex The number of the page to load starting from 0.
     *
     */
    GotoPage: function(pageIndex, loadOverride) {
		//Davendra - 04/02/2019
		//Refresh pages
		if(this.directLoad==1) {
			this.directLoad=0;
			var new_page_index = this.FindPageByUrl();
			if(new_page_index != null) {
				pageIndex = new_page_index;
			}
		}
	  console.log('GotoPage = ' + pageIndex );
      var load = this.LoadPage(pageIndex);
      if (load) this.SwapPageBuffer();

      //Davendra - 18/01/2019
      // Make Pages SEO Friendly and Track in GA
      if (load) {

        //Get Page Title
        var page_title = this.GetPageTitle();

        //Function ToSeoUrl
        var segment = this.ToSeoUrl(page_title);

        //Add URL to the browsers history.
        window.history.pushState(pageIndex, page_title, this.base_url(segment));

        //Get Page URL
        var page_url = this.base_url(segment);

        //Output to Console Log
        console.log("page_url=" + page_url);

        if (typeof ga === 'object' && ga !== null) {
          // Using GA to Track Pages
          // Sets the page value on the tracker.
          ga('set', 'page', page_url);

          // Sending the pageview no longer requires passing the page
          // value since it's now stored on the tracker object.
          ga('send', 'pageview');
        }

      }
      return load;

    },

    LoadPage: function(pageIndex) {

      if (pageIndex < 0 || pageIndex > this.bookData.pages.length - 1) {
        console.log("LoadPage() WARNING Page index: " + pageIndex + " does not exist");
        return false;
      }

      this.mastervm.currentBuffer.clearAll();
      this.bufferIndexPage = pageIndex;

      var pageContent = this.bookData.pages[pageIndex].content;

      //Davendra - 18/01/2019
      //console.log("GetPageTitle=" + this.GetPageTitle());

      for (var i = 0; i < pageContent.length; i++) {
        var module = pageContent[i];
        var settings = {
          data: module.data,
          pageIndex: pageIndex
        };

        if (module.options != undefined)
          settings["options"] = module.options;

        this.mastervm.currentBuffer.insertModule(module.type, settings);
      }
      this.FireEvent("pageLoad");

      return true;
    },

    SwapPageBuffer: function() {
      this.mastervm.swapBuffers();
      this.mastervm.currentBuffer.clearAll();
      this.profile.currentPage = this.bufferIndexPage;
      this.userProfile.Save();

      var self = this;

      setTimeout(function() {
        self.FireEvent("pageLoaded")
      }, 200);
    },

    /**
     * Loads the buffer viewmodel. Used currently for mobile page swiping effect.
     *
     * @memberof mBook.prototype
     *
     * @param {Number} pageIndex The number of the page to load starting from 0.
     *
     */
    LoadBufferPage: function(pageIndex) {

      if (pageIndex < 0 || pageIndex > this.bookData.pages.length - 1) {
        console.log("GotoPage() WARNING Page index: " + pageIndex + " does not exist");
        return;
      }

      this.bufferPageIndex = pageIndex;
      this.mastervm.bufferViewModel.clearAll();

      var pageContent = this.bookData.pages[pageIndex].content;
      for (var i = 0; i < pageContent.length; i++) {
        var module = pageContent[i];
        var settings = {
          data: module.data
        };

        if (module.options != undefined)
          settings["options"] = module.options;

        this.mastervm.bufferViewModel.insertModule(module.type, settings);
      }

    },

    GetPageTitle: function() {

      var location = this.GetLocation(this.bufferIndexPage);
      return location[location.length - 1];

    },

    //Profile manipulation
    SetCurrentPageViewStatus: function(status) {

      switch (status) {
        case "read":
          {
            if (this.bookData.settings.autoPageLocking) {
              this.UnlockPage(this.profile.currentPage + 1);
            }
          }
        case "unviewed":
        case "viewed":
          this.profile.pageStatus[this.profile.currentPage].viewStatus = status;
          break;
        default:
          console.log("SetCurrentPageViewStatus() WARNING Page status " + status + "does not exist");
          break;
      }

      this.userProfile.Save();
    },

    LockPage: function(pageIndex) {
      //
      if (pageIndex < 0 || pageIndex > this.bookData.pages.length - 1) {
        console.log("LockPage() WARNING Page index: " + pageIndex + " does not exist");
        return;
      }

      //Lock the page
      this.profile.pageStatus[pageIndex].locked(true);
    },

    UnlockPage: function(pageIndex) {

      //
      if (pageIndex < 0 || pageIndex > this.bookData.pages.length - 1) {
        console.log("UnlockPage() WARNING Page index: " + pageIndex + " does not exist");
        return;
      }

      //Unlock the page
      this.profile.pageStatus[pageIndex].locked = false;

    },

    LockAllPages: function(exceptions) {

      if (typeof exceptions == 'number') exceptions = [exceptions];

      var pages = this.bookData.pages,
        len = pages.length;

      for (var i = 0; i < len; i++) {

        if (exceptions.some(function(value) {
            return value == i;
          }))
          continue;

        this.LockPage(i);

      }

    },


    Event: function(eventName, callback) {

      if (eventName == undefined || callback == undefined) return;

      for (var key in this.events) {
        if (this.events.hasOwnProperty(eventName)) {
          this.events[key].listeners.push(callback);
        }
      }
    },

    FireEvent: function(eventName) {

      if (eventName == undefined || this.events[eventName] == undefined) {
        console.log("FireEvent() Failed to fire event: " + eventName);
        return;
      }

      for (var i = 0; i < this.events[eventName].listeners.length; i++) {
        var listener = this.events[eventName].listeners[i];
        var args = this.events[eventName].callbackArgs;

        listener.apply(this, args);
      }
    },

    KOPageComponents: function() {
      return this.mastervm.backBuffer.componentVM;
    },

    GetGlossaryList: function() {
      return this.bookData.glossary;
    },

    AssessmentQuestionAnswered: $.Callbacks(),

    AssessmentCompleted: function() {
      return this.bookData.assessedmodules == this.userProfile.QuestionsAnswered();
    },

    AssessmentPassed: function() {
      return (this.userProfile.QuestionsCorrect() >= this.bookData.settings.passmark);
    },

    AssessmentScore: function() {
      return (this.userProfile.QuestionsCorrect() / this.bookData.assessedmodules) * 100;
    },

    AssessmentPassMark: function() {
      return this.bookData.settings.passmark;
    },

    // Davendra - 18/01/2019
    // Function to get Basee URL
    base_url: function(segment) {
      // get the segments
      var pathArray = window.location.pathname.split('/');
      // console.log(pathArray);
      // find where the segment is located
      // make base_url be the origin plus the path to the segment
      //console.log(window.location.origin);
      return window.location.origin + pathArray.slice(0, -1).join('/') + '/' + segment;
    },

    // Davendra - 18/01/2019
    // Make URL SEO Friendly URLS
    ToSeoUrl: function(url) {

      // make the url lowercase
      console.log(url);
      var encodedUrl = url.toString().toLowerCase();

      // replace & with and
      encodedUrl = encodedUrl.split(/\&+/).join("-and-")

      // remove invalid characters
      encodedUrl = encodedUrl.split(/[^a-z0-9]/).join("-");

      // remove duplicates
      encodedUrl = encodedUrl.split(/-+/).join("-");

      // trim leading & trailing characters
      encodedUrl = encodedUrl.trim('-');

      return encodedUrl;
	},

	FindPageByUrl: function (){

		var structure = this.GetStructure();
    console.log(window.location.href);
    console.log(structure);
		var current_page_url=window.location.href.split('/');
		current_page_url=current_page_url[current_page_url.length-1];
		
		var new_page_index=null;
		for (var i = 0; i < structure.length; i++)
		{
			if(new_page_index!==null) break;
			console.log(structure[i].section);
			if(structure[i].section) {
				for (var j = 0; j < structure[i].section.length; j++)
				{
          console.log(structure[i].section[j]);
					var title_to_url=this.ToSeoUrl(structure[i].section[j].title);
					console.log(title_to_url, current_page_url);
					if(title_to_url===current_page_url) {
						new_page_index=structure[i].section[j].pageIndex;
						break;
					}
				}
			}
		}
		return new_page_index;
    }
  }
  return mBook;
});
