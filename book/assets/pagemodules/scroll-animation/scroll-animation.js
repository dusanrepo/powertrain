define(
  ["text!./scroll-animation.html", "./skrollr", "WebUtility", "css!./scroll-animation"],
  function(htmlTemplate, skrollr, util) {

    function viewModel(p) {
      var self = this,
        elem = $(p.elem),
        config = p.config,
        data = p.settings.data,
        options = p.settings.options,
        assets = config.assets,
        mBook = p.mBook,
        themeSettings = p.themeSettings;

      /*
       * KNOCKOUT VIEWMODEL SETUP
       */

      /*
       * INTERACTIVE FUNCTIONALITY
       */

      elem.css("opacity", 0);

      //	elem.css("cursor", "url(assets/content/images/scroll/bae_ic_scroll.png)  20 8, auto");

      var loading = elem.parent().append("<div class='loading-wrapper''><img src='assets/content/images/scroll/bae_ic_load.svg' /></div>");



      var _firstScroll = false,
        _endScroll = false;
      /*	function firstScroll() {
      		$("#intro", elem).animate({
      		        "opacity" : 0
      		}, 500);
      		$(elem.parent().parent()).off("scroll", firstScroll);
      		console.log("start scroll");
      		_firstScroll = true;
      	}
      	
      	function endScroll() {
      		if($(elem.parent())[0].scrollTop >= 30000) {
      			$("#ending", elem).animate({
      		        "opacity" : 1
      			}, 500);
      			$(elem.parent()).off("scroll", endScroll);
      		}
      		console.log("end scroll");
      	}
      	
      	$(elem.parent()).scroll(firstScroll);
      	$(elem.parent()).scroll(endScroll);*/

      $(".ps-scrollbar-y-rail").css("z-index", 400);

      util.FileToImageTag('content/images/scroll/ic_taskinfo.svg', function(html) {
        $(".notification .icon", elem).html(html);
      });

      $("<img src='assets/content/images/scroll/powerpack.png' />");
      $("<img src='assets/content/images/scroll/powerpack_alpha.png' />");
      $("<img src='assets/content/images/scroll/powerpack_old_alpha01.png' />");
      $("<img src='assets/content/images/scroll/powerpack_old_alpha02.png' />");
      $("<img src='assets/content/images/scroll/powerpack_old_alpha03.png' />");
      $("<img src='assets/content/images/scroll/powerpack_old_alpha04.png' />");
      $("<img src='assets/content/images/scroll/powerpack_old_alpha05.png' />");
      $("<img src='assets/content/images/scroll/powerpack_old_alpha06.png' />");
      $("<img src='assets/content/images/scroll/powerpack_new_alpha01.png' />");
      $("<img src='assets/content/images/scroll/powerpack_new_alpha02.png' />");
      $("<img src='assets/content/images/scroll/powerpack_new_alpha03.png' />");
      $("<img src='assets/content/images/scroll/powerpack_new_alpha04.png' />");
      $("<img src='assets/content/images/scroll/powerpack_new_alpha05.png' />");
      $("<img src='assets/content/images/scroll/powerpack_new_alpha06.png' />");
      $("<img src='assets/content/images/scroll/ofc/01.png' />");
      $("<img src='assets/content/images/scroll/ofc/02.png' />");
      $("<img src='assets/content/images/scroll/ofc/03.png' />");
      $("<img src='assets/content/images/scroll/ofc/04.png' />");
      $("<img src='assets/content/images/scroll/ofc/05.png' />");
      $("<img src='assets/content/images/scroll/ofc/06.png' />");
      $("<img src='assets/content/images/scroll/ofc/07.png' />");
      $("<img src='assets/content/images/scroll/ofc/08.png' />");
      $("<img src='assets/content/images/scroll/ofc/09.png' />");
      $("<img src='assets/content/images/scroll/ofc/10.png' />");
      $("<img src='assets/content/images/scroll/ofc/11.png' />");
      $("<img src='assets/content/images/scroll/ofc/12.png' />");
      $("<img src='assets/content/images/scroll/ofc/13.png' />");
      $("<img src='assets/content/images/scroll/ofc/14.png' />");
      $("<img src='assets/content/images/scroll/ofc/15.png' />");
      $("<img src='assets/content/images/scroll/ofc/16.png' />");
      $("<img src='assets/content/images/scroll/ofc/17.png' />");
      $("<img src='assets/content/images/scroll/ofc/18.png' />");
      $("<img src='assets/content/images/scroll/ofc/19.png' />");
      $("<img src='assets/content/images/scroll/ofc/20.png' />");
      $("<img src='assets/content/images/scroll/ofc/21.png' />");
      $("<img src='assets/content/images/scroll/ofc/22.png' />");
      $("<img src='assets/content/images/scroll/ofc/23.png' />");
      $("<img src='assets/content/images/scroll/cppengine_on.png' />");
      $("<img src='assets/content/images/scroll/dipstick.png' />");
      $("<img src='assets/content/images/scroll/step3.png' />");
      $("<img src='assets/content/images/scroll/step31.png' />");
      $("<img src='assets/content/images/scroll/step5.png' />");
      $("<img src='assets/content/images/scroll/oil-levels.png' />");

      function forceLoad() {
        $(window).resize();
        setTimeout(function() {
          $(".loading-wrapper").fadeOut(600);
          elem.animate({
            "opacity": 1
          }, 600, function() {
            if (!_firstScroll) {
              $("#intro", elem).animate({
                "opacity": 1
              }, 500);
            }

          });
        }, 1000);
      }

      var imgCount = $("img", elem).length;
      var imgLoadCount = 0;
      self.imgLoaded = function() {
        imgLoadCount++;
        if (imgLoadCount == imgCount)
          forceLoad();
      };

      /*	$('<img>').load(function(){
      	    console.log("bg image loaded");
      	}).attr('src',function(){
      	    var imgUrl = $(".filter-bg", elem).css('background-image');
      	    imgUrl = imgUrl .substring(4, imgUrl .length-1);
      	    return imgUrl;
      	}).each(function() {

      	    if(this.complete) $(this).load();
      	});*/


      var s = skrollr.init({
        element: elem[0],
        elementContainer: elem.parent()[0],
        edgeStrategy: 'set',
        smoothScrolling: false,
        easing: {
          WTF: Math.random,
          inverted: function(p) {
            return 1 - p;
          }
        },
        render: function(data) {

          if (data.curTop < 1000) {
            $(window).resize();
          }

          if (!_firstScroll && data.curTop > 0) {
            $("#intro", elem).animate({
              "opacity": 0
            }, 500);
            _firstScroll = true;
          }

          if (!_endScroll && data.curTop >= 30000) {
            $("#ending", elem).animate({
              "opacity": 1
            }, 500);
            _endScroll = true;
          }


        }
      });

      s.refresh();

      self.progressClick = function(data, event) {
        var t = event.target;
        var posX = $(".progress", elem).offset().left;
        var width = $(".progress", elem).width();
        var ratio = (event.pageX - posX) / width;
        $(elem.parent())[0].scrollTop = ratio * 32000;
      };

      var addHeight = 130;

      if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
        addHeight = 170;
        setTimeout(function() {
          $(window).resize();
        }, 1000);
      }

      function scale() {
        var parent = $(elem.parent());
        var viewRatio = parent.width() / (parent.height() - addHeight);

        var inset = $(".inset", elem);
        var insetImg = $("img", inset);

        var insetRatio = insetImg.width() / insetImg.height();
        if (viewRatio >= insetRatio) {
          inset.addClass("sizeh");
        } else {
          inset.removeClass("sizeh");
        }

        $(".fit-within", elem).each(function() {
          var content = $(this);
          var contentRatio = content.width() / content.height();

          var matrixRegex = /matrix\((-?\d*\.?\d+),\s*0,\s*0,\s*(-?\d*\.?\d+),\s*0,\s*0\)/;
          var scale = $(this).css("transform") || $(this).css("-webkit-transform");
          if (scale != "none" && scale.length) {
            var matches = scale.match(matrixRegex);
            scale = matches[1];
          } else {
            scale = 1;
          }

          if (viewRatio > contentRatio) {
            content.addClass("scaleh");
            content.removeClass("scalew");
            content.css("margin-left", ((parent.width() / 2 - content.width() / 2) * scale) + "px");
            content.css("margin-top", "0px");
          } else {
            content.addClass("scalew");
            content.removeClass("scaleh");
            content.css("margin-top", (((parent.height() - addHeight) / 2 - content.height() / 2) * scale) + "px");
            content.css("margin-left", "0px");
          }
        });
      }
      setTimeout(function() {
        if (imgLoadCount != imgCount) {
          forceLoad();
        }

      }, 8000);

      $(window).resize(scale);

      /*	elem.parent().scroll(function(){
      		if($(this)[0].scrollTop < 1000) {
      			$(window).resize();
      		}
      		console.log("scrolling");
      	});*/

      var animHandle;
      var par = $(elem.parent());

      function animateScroll() {
        par[0].scrollTop += 10;
        animHandle = requestAnimationFrame(animateScroll);
      }

      //	setTimeout(animateScroll, 1000);

      /*
       * WIDGET EDIT FUNCTIONALITY
       */


      config.destructor = function() {
        s.destroy();
        $(".skrollr-desktop").removeClass("skrollr-desktop skrollr");
        $(window).off("resize", scale);
        //	$(elem.parent()).off("scroll", firstScroll);
        //	$(elem.parent()).off("scroll", endScroll);
      };

    }

    return {
      viewModel: viewModel,
      template: htmlTemplate
    };
  });