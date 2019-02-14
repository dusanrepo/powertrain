define(["text!./lightbox.html", "knockout", "WebUtility", "perfectScrollbar", "less!./lightbox"],
    function(htmlTemplate, ko, WebUtility, Ps) {

        function viewModel(params) {

            var self = this;
            self.settings = params.settings;
            self.options = params.config.options;
            var mBook = params.mBook;
            var elem = $(params.elem);

            var imgWidth, imgHeight, oldWidth, oldHeight, img;
            var wr = $(".wrapper", elem);

            self.closeImage = ko.observable();
            self.close = ko.computed(function() {
                return params.config.assets + self.settings.closeIcon();
            });
            self.close.subscribe(function(newVal) {
                WebUtility.FileToImageTag(newVal, function(html) {
                    self.closeImage(html);
                });
            });
            WebUtility.FileToImageTag(self.close(), function(html) {
                self.closeImage(html);
            });

            self.zoomImage = ko.observable();
            self.zoom = ko.computed(function() {
                return params.config.assets + self.settings.zoomIcon();
            });
            self.close.subscribe(function(newVal) {
                WebUtility.FileToImageTag(newVal, function(html) {
                    self.zoomImage(html);
                });
            });
            WebUtility.FileToImageTag(self.zoom(), function(html) {
                self.zoomImage(html);
            });

            self.content = ko.observable();
            self.caption = ko.observable();

            self.zoomFactor = ko.observable();
            self.zoomPercent = ko.computed(function() {
                return (self.zoomFactor() * 100) + "%";
            });
            self.zoomFactor.subscribe(function() {

                img.val(img.css({
                    "width": (100 + self.zoomFactor() * 100) + "%",
                    "height": "auto"
                }));
                var currentWidth = parseInt(img.css("width"));
                var currentHeight = parseInt(img.css("height"));

                //    if((currentWidth - oldWidth) > 0)
                //    {
                wr.scrollLeft(wr.scrollLeft() + ((currentWidth - oldWidth) / 2));
                wr.scrollTop(wr.scrollTop() + ((currentHeight - oldHeight) / 2));
                //    }

                oldWidth = parseInt(img.css("width"));
                oldHeight = parseInt(img.css("height"));
            });

            self.closeLightbox = function() {
                elem.fadeOut(500, function() {
                    if (closeEvent) {
                        closeEvent();
                        closeEvent = null;
                    }
                    elem.removeClass("popup");
                    Ps.destroy($('.lightbox .wrapper').get(0));
                });

            };

            function positionElements() {
                wr.css({
                    "margin-left": (-wr.width() / 2) + "px",
                    "margin-top": (-wr.height() / 2) + "px"
                });

                $(".info-controls", elem).css({
                    left: wr.offset().left + "px",
                    top: (wr.offset().top + wr.height()) + "px",
                    width: wr.width() + "px"
                });

                $(".info-controls .figcap", elem).css("padding-left", wr.offset().left + "px");
            }

            /*	$(window).resize(function(){
            		positionElements();
            	});*/

            var zoomTrigger = false;
            self.zoomClick = function(data, event) {
                console.log("Click");
                var t = event.delegateTarget;

                console.log(t);

                var posX = $(t).offset().left;
                var width = $(t).width();
                var ratio = Math.min(Math.max((event.pageX - posX) / width, 0), 1);
                self.zoomFactor(ratio);
                zoomTrigger = true;
            };

            self.zoomMove = function(data, event) {
                if (!zoomTrigger) return;

                var t = event.delegateTarget;
                var posX = $(t).offset().left;
                var width = $(t).width();

                var ratio = Math.min(Math.max((event.pageX - posX) / width, 0), 1);
                self.zoomFactor(ratio);
            };

            self.zoomLift = function(data, event) {
                zoomTrigger = false;
            };

            var dragClicked = false,
                clickX, clickY, touchEvent = false,
                updateScrollPos = function(e) {
                    wr.scrollTop(wr.scrollTop() + (clickY - e.offsetY));
                    wr.scrollLeft(wr.scrollLeft() + (clickX - e.offsetX));
                };
            self.dragMove = function(data, event) {
                event.preventDefault();
                if (dragClicked && touchEvent == false) {
                    dragClicked = true;
                    updateScrollPos(event);
                }
                return false;
            };
            self.dragStart = function(data, event) {
                    event.preventDefault();
                    dragClicked = true;
                    clickY = event.offsetY;
                    clickX = event.offsetX;
                    //	notify.click();
                    return false;
                },
                self.dragEnd = function(data, event) {
                    event.preventDefault();
                    dragClicked = false;
                };

            var touchEvent = false;
            var touch1, touch2, prevZoom;

            self.touchStart = function(data, event) {

                oldWidth = oldWidth = img.width();
                oldHeight = oldHeight = img.height();
                touchEvent = true;
                event.preventDefault();
                var t1 = event.originalEvent.touches[0].clientX;
                var t2 = event.originalEvent.touches[0].clientY;
                //	notify.click();
                if (event.originalEvent.touches[1] == undefined) {

                    var rect = event.target.getBoundingClientRect();

                    dragClicked = true;
                    clickY = t2;
                    clickX = t1;

                } else {
                    var t3 = event.originalEvent.touches[1].clientX;
                    var t4 = event.originalEvent.touches[1].clientY;
                    touch1 = Math.sqrt(Math.pow(t3 - t1, 2) + Math.pow(t4 - t2, 2));
                    prevZoom = self.zoomFactor();
                }

            };

            self.touchMove = function(data, event) {

                event.preventDefault();
                var t1 = event.originalEvent.touches[0].clientX;
                var t2 = event.originalEvent.touches[0].clientY;

                if (event.originalEvent.touches[1] == undefined) {
                    var rect = event.target.getBoundingClientRect();

                    dragClicked = true;

                    wr.scrollLeft(wr.scrollLeft() + (clickX - t1));
                    wr.scrollTop(wr.scrollTop() + (clickY - t2));

                    clickX = t1;
                    clickY = t2;

                } else {

                    var t3 = event.originalEvent.touches[1].clientX;
                    var t4 = event.originalEvent.touches[1].clientY;

                    touch2 = Math.sqrt(Math.pow(t3 - t1, 2) + Math.pow(t4 - t2, 2));

                    var zoomVal = prevZoom + (touch2 - touch1) * 0.005;
                    zoomVal = Math.min(Math.max(zoomVal, 0), 1);

                    self.zoomFactor(zoomVal);
                    //	img.css({"width": zoomVal + "%", "height": "auto"});

                    var currentWidth = parseInt(img.css("width"));
                    var currentHeight = parseInt(img.css("height"));

                    //    if((currentWidth - oldWidth) > 0)
                    //    {
                    wr.scrollLeft(wr.scrollLeft() + ((currentWidth - oldWidth) / 2));
                    wr.scrollTop(wr.scrollTop() + ((currentHeight - oldHeight) / 2));
                    //    }

                    oldWidth = parseInt(img.css("width"));
                    oldHeight = parseInt(img.css("height"));
                }
            };

            self.touchEnd = function(data, event) {

                event.preventDefault();
                if (event.originalEvent.touches[0] == undefined) {
                    touchEvent = false;
                    touch1 = touch2;
                    dragClicked = false;
                }
            };

            self.enableZoom = ko.observable();

            var closeEvent = null;
            elem.bind("onClose", function(e, closeFunction) {
                if (closeFunction)
                    closeEvent = closeFunction;
            });


            elem.bind("open", function(e, content, caption, enableZoom) {
                var isImg = $(content).is('img');

                if (isImg) {
                    $(content).addClass('lightbox-content')
                    self.content(content[0].outerHTML);
                    if (WebUtility.IsMobile()) {
                        self.enableZoom(false);
                        $(".zoom", elem).css({
                            color: "#fff",
                            width: "200px",
                            top: "0px"

                        });
                        $(".zoom", elem).html("Pinch the image to zoom");
                    } else
                        self.enableZoom(true);

                } else {

                    var messageContent = $(content)

                    self.content(messageContent[0].outerHTML);

                    messageContent.hasClass("complete") && $(elem).addClass("small");

                    self.enableZoom(false)
                    //$('.lightbox .wrapper').css("cursor", "default")
                    elem.addClass("popup");

                    if (!WebUtility.IsMobile()) {
                        Ps.initialize($('.lightbox .wrapper').get(0), {
                            wheelSpeed: 1,
                            wheelPropagation: true
                        });
                    }
                }

                elem.fadeIn(300);

                self.caption((caption != "") ? caption : "&nbsp;");



                img = $(".wrapper .lightbox-content", elem);

                function applySize() {
                    var maxWidth = $(window).width() - 100;
                    var maxHeight = $(window).height() - 100;
                    var nWidth = img[0].naturalWidth;
                    var nHeight = img[0].naturalHeight;
                    if (nWidth > maxWidth) {
                        img.css({
                            width: maxWidth + "px",
                            height: "auto",
                            "max-width": "none"
                        });
                    }
                    if (img.height() > maxHeight) {
                        img.css({
                            width: "auto",
                            height: maxHeight + "px",
                            "max-width": "none"
                        });
                    }

                    oldWidth = img.width();
                    oldHeight = img.height();
                    wr.css({
                        "width": img.width() + "px",
                        "height": img.height() + "px"
                    });
                    positionElements();

                    self.zoomFactor(0);
                };


                if (isImg) {
                    img.on("load", function() {
                        applySize();
                    });
                    $(window).resize(function() {
                        applySize();
                    });
                    applySize();
                }


                /*	thisimg.on({
                		'mousemove': function(e) {
                			e.preventDefault();
                			if(dragClicked && touchEvent == false)
                			{
                				dragClicked = true;
                				updateScrollPos(e);
                			}
                		},
                		'mousedown': function(e) {
                			e.preventDefault();
                			dragClicked = true;
                			clickY = e.offsetY;
                			clickX = e.offsetX;
                			notify.click();
                		},
                		'mouseup': function() {
                			dragClicked = false;
                		},
                		'touchstart': function(e) {
                			oldWidth = $(this).css("width");
                			oldHeight = $(this).css("height");
                			touchEvent = true;
                			e.preventDefault();
                			var t1 = e.originalEvent.touches[0].clientX;
                			var t2 = e.originalEvent.touches[0].clientY;
                			notify.click();
                			if(e.originalEvent.touches[1] == undefined) {

                				var rect = e.target.getBoundingClientRect();

                				dragClicked = true;
                				clickY = t2;
                				clickX = t1;

                			} else {
                				var t3 = e.originalEvent.touches[1].clientX;
                				var t4 = e.originalEvent.touches[1].clientY;
                				touch1 = Math.sqrt(Math.pow(t3 - t1, 2) + Math.pow(t4 - t2, 2));
                				prevZoom = zoomSlider.slider("value");
                			}
                		},
                		'touchmove': function(e) {
                			e.preventDefault();
                			var t1 = e.originalEvent.touches[0].clientX;
                			var t2 = e.originalEvent.touches[0].clientY;

                			if(e.originalEvent.touches[1] == undefined) {
                				var rect = e.target.getBoundingClientRect();

                				dragClicked = true;
                				$loaded.scrollLeft($loaded.scrollLeft() + (clickX - t1));
                				$loaded.scrollTop($loaded.scrollTop() + (clickY - t2));

                				clickX = t1;
                				clickY = t2;

                			} else {

                				var t3 = e.originalEvent.touches[1].clientX;
                				var t4 = e.originalEvent.touches[1].clientY;

                				touch2 = Math.sqrt(Math.pow(t3 - t1, 2) + Math.pow(t4 - t2, 2));

                				var zoomVal = prevZoom + (touch2 - touch1)*0.5;
                				zoomVal = Math.min(Math.max(zoomVal, 100), 200);

                				zoomSlider.slider("value", zoomVal);
                				$(this).css({"width": zoomVal + "%", "height": "auto"});

                				var currentWidth = parseInt($(this).css("width"));
                				var currentHeight = parseInt($(this).css("height"));

                			//    if((currentWidth - oldWidth) > 0)
                			//    {
                					$loaded.scrollLeft($loaded.scrollLeft() + ((currentWidth - oldWidth)/2));
                					$loaded.scrollTop($loaded.scrollTop() + ((currentHeight - oldHeight)/2));
                			//    }

                				oldWidth = parseInt($(this).css("width"));
                				oldHeight = parseInt($(this).css("height"));
                			}


                		},
                		'touchend': function(e) {
                			e.preventDefault();
                			if(e.originalEvent.touches[0] == undefined)
                			{
                				touchEvent = false;
                			   touch1 = touch2;
                			   dragClicked = false;
                			}
                		}
                	});*/

                /*	$.featherlight(content, {
				targetAttr: 'href',
				closeIcon: self.closeImage(),
				closeOnClick: false,
				afterContent: function() {

					this.$content.addClass("featherlight-image");
					this.$content.wrap("<div class='wrapper'></div>");

					var wrapper = $(".featherlight .wrapper");
					elem.insertAfter(this.$content);


					var img = this.$content;
					if(img.height() > $(window).height() - 100) {
						var ratio = ($(window).height() - 100)/img.height();
						img.width(img.width()*ratio);
						img.height(img.height()*ratio);
					//	wrapper.css("height", img.height()+"px");
					//	wrapper.css("width", (img.width()*ratio)+"px");
					} else {
					//	wrapper.css("height", img.height()+"px");
					}


					zoom.append('<img src="assets/images/mag.png" style="float:left;"/>');
					zoom.append(zoomSlider);
					if(WebUtility.IsMobile()) {
						if(zoomNotify == false) {
							notify.append("<div>Use the pinch gesture to zoom in and out of the image</div>");
							notify.delay(500).fadeIn(600);
							notify.on("click touchstart", function(){
								$(this).fadeOut(300);
								zoomNotify = true;
							});
						}
						$(".featherlight-content .zoom").css("visibility","hidden");
					}


					$loaded = $(".featherlight-content .wrapper");

					var updateScrollPos = function(e) {
						$loaded.scrollTop($loaded.scrollTop() + (clickY - e.offsetY));
						$loaded.scrollLeft($loaded.scrollLeft() + (clickX - e.offsetX));
					};

					var thisimg = $(".featherlight-image");
					zoomSlider.slider({
						orientation: "horizontal",
						range: "min",
						min: 100,
						max: 200,
						value: 100,
						slide: function(event, ui) {
							thisimg.val(thisimg.css({"width": ui.value + "%", "height": "auto"}));

	                        var currentWidth = parseInt(thisimg.css("width"));
	                        var currentHeight = parseInt(thisimg.css("height"));

							if(ui.value == 100) {
								thisimg.attr("style","float: none");
							}

	                    //    if((currentWidth - oldWidth) > 0)
	                    //    {
					            $loaded.scrollLeft($loaded.scrollLeft() + ((currentWidth - oldWidth)/2));
					            $loaded.scrollTop($loaded.scrollTop() + ((currentHeight - oldHeight)/2));
	                    //    }

	                        oldWidth = parseInt(thisimg.css("width"));
	                        oldHeight = parseInt(thisimg.css("height"));
						}
					});
					thisimg.on({
						'mousemove': function(e) {
							e.preventDefault();
							if(dragClicked && touchEvent == false)
							{
								dragClicked = true;
								updateScrollPos(e);
							}
						},
						'mousedown': function(e) {
							e.preventDefault();
							dragClicked = true;
							clickY = e.offsetY;
							clickX = e.offsetX;
							notify.click();
						},
						'mouseup': function() {
							dragClicked = false;
						},
						'touchstart': function(e) {
							oldWidth = $(this).css("width");
							oldHeight = $(this).css("height");
							touchEvent = true;
							e.preventDefault();
							var t1 = e.originalEvent.touches[0].clientX;
							var t2 = e.originalEvent.touches[0].clientY;
							notify.click();
							if(e.originalEvent.touches[1] == undefined) {

								var rect = e.target.getBoundingClientRect();

								dragClicked = true;
								clickY = t2;
								clickX = t1;

							} else {
								var t3 = e.originalEvent.touches[1].clientX;
								var t4 = e.originalEvent.touches[1].clientY;
								touch1 = Math.sqrt(Math.pow(t3 - t1, 2) + Math.pow(t4 - t2, 2));
								prevZoom = zoomSlider.slider("value");
							}
						},
						'touchmove': function(e) {
							e.preventDefault();
							var t1 = e.originalEvent.touches[0].clientX;
							var t2 = e.originalEvent.touches[0].clientY;

							if(e.originalEvent.touches[1] == undefined) {
								var rect = e.target.getBoundingClientRect();

								dragClicked = true;
								$loaded.scrollLeft($loaded.scrollLeft() + (clickX - t1));
								$loaded.scrollTop($loaded.scrollTop() + (clickY - t2));

								clickX = t1;
								clickY = t2;

							} else {

								var t3 = e.originalEvent.touches[1].clientX;
								var t4 = e.originalEvent.touches[1].clientY;

								touch2 = Math.sqrt(Math.pow(t3 - t1, 2) + Math.pow(t4 - t2, 2));

								var zoomVal = prevZoom + (touch2 - touch1)*0.5;
								zoomVal = Math.min(Math.max(zoomVal, 100), 200);

								zoomSlider.slider("value", zoomVal);
								$(this).css({"width": zoomVal + "%", "height": "auto"});

								var currentWidth = parseInt($(this).css("width"));
								var currentHeight = parseInt($(this).css("height"));

							//    if((currentWidth - oldWidth) > 0)
							//    {
									$loaded.scrollLeft($loaded.scrollLeft() + ((currentWidth - oldWidth)/2));
									$loaded.scrollTop($loaded.scrollTop() + ((currentHeight - oldHeight)/2));
							//    }

								oldWidth = parseInt($(this).css("width"));
								oldHeight = parseInt($(this).css("height"));
							}


						},
						'touchend': function(e) {
							e.preventDefault();
							if(e.originalEvent.touches[0] == undefined)
							{
								touchEvent = false;
							   touch1 = touch2;
							   dragClicked = false;
							}
						}
					});
				}
			});*/
            });

        };

        return {
            viewModel: viewModel,
            template: htmlTemplate
        };
    });
