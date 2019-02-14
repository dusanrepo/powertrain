define(
  ["jquery"],
  function ($)
  {
      "use strict";

      //Constructor
      function BookReader(bookFile)
      {

          //IMPORTANT
          //Ensures that Class is invoked with "new"
          //Stops private variables leaking into the global namespace

          if (!(this instanceof BookReader))
          {
              throw new TypeError("BookReader constructor cannot be called as a function.");
          }

          //Location to the book JSON file
          this.file = bookFile;

      }


      BookReader.ConvertToPage = function (pageContent)
      {

          var content = [];
          for (var j = 0; j < pageContent.length; j++)
          {
              content.push({
                  type: (typeof pageContent[j] === "string") ? "html-block" : pageContent[j].t,
                  data: (typeof pageContent[j] === "string") ? pageContent[j] : pageContent[j].d
              });
              if (pageContent[j].p != undefined)
              {
                  content[j].options = pageContent[j].p;
              }
          }

          return content;
      };

      BookReader.ConvertToPageModule = function (moduleContent)
      {

          var module = {
              type: (typeof moduleContent === "string") ? "html-block" : moduleContent.t,
              data: (typeof moduleContent === "string") ? moduleContent : moduleContent.d
          };

          if (moduleContent.p != undefined)
          {
              module.options = moduleContent.p;
          }

          return module;

      }

      function ReadJSON(raw)
      {
          var self = this;

          var book = {
              formatVersion: raw.f,
              title: raw.n,
              subtitle: raw.subtitle,
              titlestyle: raw.titlestyle,
              author: raw.a,
              publisher: raw.pb,
              version: raw.v,
              id: raw.id,
              settings: {
                  theme: raw.s.th,
                  developmentMode: raw.s.dm,
                  autoPageLocking: raw.s.lk,
                  passmark: raw.s.passmark,
                  storage: {
                      mode: raw.s.st.m,
                      tracking: raw.s.st.t
                  },
                  externalLogin: raw.s.extLogin
              },
              uimodules: raw.uimodules,
              pagemodules: raw.pagemodules,
              glossary: raw.glossary,
              structure: [],
              pages: [],
              assessedmodules: 0
          };


          function buildSection(section, refSection, location)
          {

              for (var i = 0; i < refSection.length; i++)
              {

                  section.push({
                      title: "",
                      pageIndex: undefined
                  });

                  var loc = [i];

                  var conc = location.concat(loc);

                  section[i].title = refSection[i].n;

                  //copy content
                  if (refSection[i].c != undefined)
                  {

                      book.pages.push({
                          location: [],
                          content: []
                      });

                      var pageIndex = book.pages.length - 1;

                      book.pages[pageIndex].location = conc;
                      var refContent = refSection[i].c;

                      var content = [];
                      for (var j = 0; j < refContent.length; j++)
                      {
                          content.push({
                              type: (typeof refContent[j] === "string") ? "html-block" : refContent[j].t,
                              data: (typeof refContent[j] === "string") ? refContent[j] : refContent[j].d
                          });
                          if (typeof refContent[j] !== "string" && refContent[j].t.search("question-") != -1)
                              book.assessedmodules++;
                          if (refContent[j].p != undefined)
                          {
                              content[j].options = refContent[j].p;
                          }
                      }
                      book.pages[pageIndex].content = content;

                      section[i].pageIndex = pageIndex;

                  }
                  //copy sections
                  if (refSection[i].s != undefined)
                  {
                      section[i].section = [];
                      buildSection(section[i].section, refSection[i].s, conc);
                  }
              }
          }

          //Build a section/sub section
          /*	function buildSub(section, refSection) {

                for(var i = 0; i < refSection.length; i++) {
                    section.push({
                        title: refSection[i].n,
                        pageIndex: undefined
                    });

                    //content
                    if(refSection[i].c != undefined) {
                        var refContent = refSection[i].c;
                        book.pages.push({
                            sectionIndex: i,
                            location: level,
                            content: []
                        });
                        for(var j = 0; j < refContent.length; j++) {
                            book.pages[i].content.push({
                                type: refContent[j].t,
                                data: refContent[j].d
                            });
                            if(refContent[j].p != undefined) {
                                book.pages[i].content[j].options = refContent[j].p
                            }
                        }
                    }
                }
            }*/

          buildSection(book.structure, raw.chp, []);

          return book;
      }

      BookReader.prototype = {

          //IMPORTANT
          constructor: BookReader,

          //Public Method
          Load: function (loadedCallback)
          {

              var self = this;

              $.getJSON(self.file, function (data)
              {

                  if (loadedCallback != undefined)
                  {
                      loadedCallback(ReadJSON(data));
                  }

              }).fail(function ()
              {

                  //If loading fails throw an error
                  console.log("Error loading Book JSON file: ", self.file);

              });

          },

          Search: function ()
          {

          }


      };

      return BookReader;

  });
