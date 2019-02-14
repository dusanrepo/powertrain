define(["core/js/lib/Area",
        "core/js/lib/Canvas",
        "core/js/lib/DeviceManager",
        "core/js/lib/Entity",
        "core/js/lib/ImageManager"],
        function(Area, Canvas, DeviceManager, Entity, ImageManager)
        {
            return function NoteCamera()
            {
                var self = this;

                this.config;
                this.id;

                this.deviceManager;
                this.imageManager;
                this.updateLoop;

                this.state = "no_javascript";
                this.feed = false;
                this.entities = [];

                this.dragging = false;
                this.draggingAction = null;
                this.draggingEntity = null;
                this.lastGrab = null;

                this.wrapper;
                this.container;
                this.containerStyles = null;
                this.video;

                this.raw;
                this.output;
                this.preview;

                this.appliedCrop;
                this.workingCrop;
                this.rotation = 0;

                this.serverDelete;
                this.serverLoad;
                this.serverSave;
                this.imageOnServer = false;
                this.interacting = false;
                this.interactionEnabled = false;

                // Setup
                    this.setup = function(config)
                    {
                        config = this.parseConfiguration(config);
                        if (config === false) {
                            throw "Invalid configuration JSON";
                        }

                        this.config = config;
                        this.id = this.config.wrapper;

                        // Setup Wrappers
                            this.wrapper = document.getElementById(this.config.wrapper);

                            if (this.wrapper === null) {
                                throw "Wrapper " + this.config.wrapper + " not found";
                            }

                            this.removeChildren(this.wrapper);
                            this.container = document.createElement("div");
                            this.wrapper.appendChild(this.container);
                            this.video = document.createElement("video");
                            this.video.playsInline = true;

                        // Setup Canvases
                            this.raw = new Canvas;
                            this.raw.setup();
                            this.raw.setDimensions(300, 150);

                            this.output = new Canvas;
                            this.output.setup();
                            this.output.setDimensions(300, 150);

                            this.preview = new Canvas;
                            this.preview.setup();
                            this.preview.setFontFamily(this.config.style.font_family);
                            this.preview.setDimensions(320, 240);

                            this.container.appendChild(this.preview.getCanvas());
                            //this.container.appendChild(this.output.getCanvas());
                            //this.container.appendChild(this.raw.getCanvas());

                        // Canvas Events
                            this.enableInteraction();
                            window.addEventListener("resize", this.handleResize.bind(this));
                            window.addEventListener("orientationchange", this.handleOrientation.bind(this));

                            if (self.isBrowser('chrome') === true || self.isBrowser('safari') === true) {
                                document.addEventListener("webkitfullscreenchange", this.handleFullscreenChange.bind(this));
                            } else if (self.isBrowser('firefox') === true) {
                                document.addEventListener("mozfullscreenchange", this.handleFullscreenChange.bind(this));
                            } else {
                                document.addEventListener("fullscreenchange", this.handleFullscreenChange.bind(this));
                            }

                            if (this.isBrowser('Safari') === true) {
                                navigator.mediaDevices.ondevicechange = this.updateDevices.bind(this);
                            } else {
                                navigator.mediaDevices.addEventListener("devicechange", this.updateDevices.bind(this));
                            }

                        // Load Assets
                            this.imageManager = new ImageManager;
                            this.imageManager.setCallback(this.showScreen.bind(this, "start_camera"));
                            this.imageManager.addImage("camera");
                            this.imageManager.addImage("camera_button");
                            this.imageManager.addImage("change_camera");
                            this.imageManager.addImage("change_camera_button");
                            this.imageManager.addImage("crop_button");
                            this.imageManager.addImage("cross");
                            this.imageManager.addImage("cross_button");
                            this.imageManager.addImage("disconnected");
                            this.imageManager.addImage("fullscreen_button");
                            this.imageManager.addImage("image_button");
                            this.imageManager.addImage("image_delete");
                            this.imageManager.addImage("image_load");
                            this.imageManager.addImage("image_save");
                            this.imageManager.addImage("leftarrow_button");
                            this.imageManager.addImage("missing");
                            this.imageManager.addImage("restart");
                            this.imageManager.addImage("restart_button");
                            this.imageManager.addImage("rotate_anticlockwise_button");
                            this.imageManager.addImage("rotate_clockwise_button");
                            this.imageManager.addImage("save_button");
                            this.imageManager.addImage("tick_button");
                            this.imageManager.addImage("trash_button");
                            this.imageManager.loadImages();

                        // Setup Devices
                            self.setState("setting_up");
                            this.deviceManager = new DeviceManager;
                            this.updateGUI();

                            if (this.checkBrowserCompatability() === false) {
                                this.setState("error");
                                return false;
                            }

                            this.deviceManager.setup();
                            return this.deviceManager.findDevices(this.setState.bind(this, "start_camera"), this.setState.bind(this, "no_camera"));
                    }

                    this.parseConfiguration = function(config)
                    {
                        if (typeof config === "string") {
                            try {
                                config = JSON.parse(config);
                            } catch (error) {
                                return false;
                            }
                        }

                        // Wrapper
                            if (this.checkProperty(config, "wrapper", "string") === false) {
                                return false;
                            }

                        // Output Size
                            if (this.checkProperty(config, "output", "object") === false) {
                                return false;
                            }

                            if (this.checkProperty(config.output, "edge_maximum", "number") === false) {
                                return false;
                            }

                        // Default Crop Settings
                            if (this.checkProperty(config.crop, 'minimum_width', 'number') === false) {
                                return false;
                            }

                            if (this.checkProperty(config.crop, 'minimum_height', 'number') === false) {
                                return false;
                            }

                        return config;
                    }

                    this.checkProperty = function(object, key, type)
                    {
                        if (key in object === false) {
                            return false;
                        }

                        if (typeof object[key] !== type) {
                            return false;
                        }

                        return true;
                    }

                    this.enableInteraction = function()
                    {
                        if (this.interactionEnabled === true) {
                            throw "Interaction is already enabled";
                        }

                        this.preview.addEvent("mousedown", this.handleMouseDown.bind(this));
                        document.addEventListener("mousemove", this.handleMouseMove.bind(this));
                        document.addEventListener("mouseup", this.handleMouseUp.bind(this));

                        this.preview.addEvent("touchstart", this.handleTouchStart.bind(this));
                        document.addEventListener("touchmove", this.handleTouchMove.bind(this));
                        document.addEventListener("touchend", this.handleTouchEnd.bind(this));

                        this.interactionEnabled = true;
                    }

                    this.disableInteraction = function()
                    {
                        if (this.interactionEnabled === false) {
                            throw "Interaction is not enabled";
                        }

                        this.preview.removeEvent("mousedown", this.handleMouseDown.bind(this));
                        document.removeEventListener("mousemove", this.handleMouseMove.bind(this));
                        document.removeEventListener("mouseup", this.handleMouseUp.bind(this));

                        this.preview.removeEvent("touchstart", this.handleTouchStart.bind(this));
                        document.removeEventListener("touchmove", this.handleTouchMove.bind(this));
                        document.removeEventListener("touchend", this.handleTouchEnd.bind(this));

                        this.interactionEnabled = false;
                    }

                // Input
                    this.setContainer = function(element)
                    {
                        this.wrapper = document.getElementById(element);
                    }

                    this.createAreaOverlay = function(area, push)
                    {
                        var entity;

                        if (area instanceof Area === false) {
                            throw "An Area class object is required to draw the overlay";
                        }

                        entity = new Entity;
                        entity.setTarget(this.preview);
                        entity.createHollowRectangle(0, 0);
                        entity.setLink(area, ["x", "y", "height", "width"]);
                        entity.setFillColour("#000000");
                        entity.setOpacity(0.6);
                        entity.setScale(false);

                        if (push !== false) {
                            this.entities.push(entity);
                        }
                    }

                    this.createButton = function(icon, action, link, origin, links, x, y, push)
                    {
                        var button;
                        var image;
                        var source;

                        var radius;
                        var diameter;
                        var position;
                        var size;

                        var offset;
                        var offsets;
                        var buttonOffset;

                        // Button
                            offset = this.config.button.offset;
                            radius = this.config.button.radius;
                            diameter = radius * 2;

                            buttonOffset = diameter + offset;

                            if (typeof origin === 'string') {
                                offsets = this.calculateOffsetFromOrigin(origin, offset, buttonOffset, buttonOffset);

                                links = offsets.links;

                                if (typeof x !== 'number' && typeof y !== 'number') {
                                    x = 0;
                                    y = 0;
                                }

                                x += offsets.canvas.x;
                                y += offsets.canvas.y;
                            }

                            if (!Array.isArray(links)) {
                                throw "Links must be of type Array"
                            }

                            button = new Entity;
                            button.setTarget(this.preview);
                            button.setPosition(x, y);
                            button.setLink(link, links);
                            button.setHotspotRegion(0, 0, diameter, diameter);
                            button.createCircle(radius);
                            button.setFillColour("#000000");
                            button.setHoverFill(this.config.style.main_colour);
                            button.setOpacity(0.5);
                            button.setScale(false);

                        // Image
                            source = this.imageManager.getImage(icon);
                            if (source === false) {
                                throw "Image not found";
                            }

                            position = diameter * (0.25 / 2);
                            size = diameter * 0.75;

                            image = new Entity;
                            image.setTarget(this.preview);
                            image.setLink(button, ["x", "y"]);
                            image.setPosition(position, position);
                            image.createImage(source, size, size);
                            image.setScale(false);

                        // Action
                            if (typeof action === "function") {
                                button.setCursor("pointer", "hover");
                                button.setHotspotAction(action);
                            }

                        // Push
                            if (push !== false) {
                                this.entities.push(button);
                                this.entities.push(image);
                            }

                        return button;
                    }

                    this.createButtonGroup = function(buttons, link, origin)
                    {
                        var amount;
                        var count;

                        var action;
                        var links = [];

                        var x;
                        var y;
                        var radius
                        var diameter;
                        var offsets;

                        var buttonOffset;
                        var groupOffset;

                        if (!Array.isArray(buttons)) {
                            throw "Buttons must be of type Array";
                        }

                        if (buttons.length < 1) {
                            return false;
                        }

                        amount = buttons.length;
                        offset = this.config.button.offset;
                        radius = this.config.button.radius;
                        diameter = radius * 2;

                        buttonOffset = diameter + offset;
                        groupOffset = ((amount * buttonOffset) - offset) / 2;

                        offsets = this.calculateOffsetFromOrigin(origin, offset, groupOffset, buttonOffset);

                        for (count = 0; count < amount; count++) {
                            if (count === 0) {
                                links = offsets.links;
                                x = offsets.canvas.x;
                                y = offsets.canvas.y;

                            } else {
                                links = ["x", "y"];
                                x = offsets.chain.x;
                                y = offsets.chain.y;
                            }

                            if ('parameters' in buttons[count]) {
                                action = buttons[count].action.bind(this, buttons[count].parameters);
                            } else {
                                action = buttons[count].action.bind(this);
                            }

                            link = this.createButton(buttons[count].icon, action, link, null, links, x, y);
                        }
                    }

                    this.createCropHandle = function(area, corner, push)
                    {
                        var entity;
                        var handleSize;
                        var handleDim;
                        var links = [];

                        if (area instanceof Area === false) {
                            throw "An Area class object is required to draw the overlay";
                        }

                        handleSize = 16;
                        handleDim = handleSize * 2;

                        entity = new Entity;
                        entity.setTarget(this.preview);
                        entity.createCircle(handleSize);
                        entity.setFillColour("#ffffff");
                        entity.setHoverFill(this.config.style.main_colour);
                        entity.setCursor("grab", "hover");
                        entity.setCursor("grabbing", "down");

                        switch (corner) {
                            case "bl":
                                links = ["bottom", "left"];
                                break;

                            case "br":
                                links = ["bottom", "right"];
                                break;

                            case "tl":
                                links = ["top", "left"];
                                break;

                            case "tr":
                                links = ["top", "right"];
                                break;

                            default:
                                throw corner + " is not a valid corner";
                        }

                        entity.setLink(area, links);
                        entity.setHotspotRegion(0, 0, handleDim, handleDim);
                        entity.setHotspotAction(function(x, y){
                            this.dragCropHandle(x, y, corner);
                        });
                        entity.setHotspotRelative(true);
                        entity.setScale(false);
                        entity.setDraggable(true);
                        entity.setPosition(-handleSize, -handleSize);

                        if (push !== false) {
                            this.entities.push(entity);
                        }
                    }

                    this.createCropPanArea = function(area, push)
                    {
                        var entity;
                        var cursor;

                        if (area instanceof Area === false) {
                            throw "An Area class object is required to draw the overlay";
                        }

                        entity = new Entity;
                        entity.setTarget(this.preview);
                        entity.createRectangle(0, 0);
                        entity.setLink(area, ["x", "y", "height", "width"]);
                        entity.setDraggable(true);
                        entity.setHotspotRelative(true);
                        entity.setHotspotRegion(0, 0, 0, 0);
                        entity.setHotspotAction(this.panCropArea.bind(this));
                        entity.setCursor("grab", "hover");
                        entity.setCursor("grabbing", "down");

                        if (push !== false) {
                            this.entities.push(entity);
                        }
                    }

                    this.createMessage = function(icon, action, push)
                    {
                        var image;
                        var bounds;
                        var x;
                        var y;
                        var height;
                        var width;

                        bounds = this.preview.getDimensionsAsObject();
                        x = bounds.width * 0.5;
                        y = bounds.height * 0.75;

                        // Image
                            src = this.imageManager.getImage(icon);

                            image = new Entity;
                            image.createImage(src, src.width, src.height);
                            image.setTarget(this.preview);
                            image.setLink(this.preview, ["centerX", "centerY"]);
                            image.setPosition(-src.width / 2, -src.height / 2);
                            image.setHotspotRegion(0, 0, bounds.width, bounds.height);
                            image.setHotspotRelative(false);
                            image.setScale(false);

                        if (typeof action === "function") {
                            image.setCursor("pointer", "hover");
                            image.setHotspotAction(action);
                        }

                        if (push !== false) {
                            this.entities.push(image);
                        }
                    }

                    this.createTargetingRing = function(action, push)
                    {
                        var entity;
                        var bounds;
                        var x;
                        var y;
                        var r;

                        bounds = this.preview.getDimensionsAsObject();
                        x = bounds.width * 0.5;
                        y = bounds.height * 0.5;
                        r = bounds.width * 0.06;

                        entity = new Entity;
                        entity.createCircle(r);
                        entity.setPosition(-r, -r);
                        entity.setTarget(this.preview);
                        entity.setLink(this.preview, ["centerX", "centerY", "height", "width"]);
                        entity.setHotspotRegion(0, 0, 0, 0);
                        entity.setStroke("#ffffff", 4);
                        entity.setCompositeMode("difference");
                        entity.setHotspotRelative(false);
                        entity.setCursor("pointer", "hover");
                        entity.setScale(false);

                        if (typeof action === "function") {
                            entity.setHotspotAction(action);
                        }

                        if (push !== false) {
                            this.entities.push(entity);
                        }
                    }

                    this.setState = function(state, message)
                    {
                        var buttons = [];

                        this.feed = false;
                        this.entities = [];

                        switch (state) {
                            case "change_camera":
                                this.createMessage("change_camera");
                                this.createButton("fullscreen_button", this.toggleFullscreen.bind(this), this.preview, "br");
                                break;

                            case "disconnected":
                                this.createMessage("disconnected");
                                this.createButton("fullscreen_button", this.toggleFullscreen.bind(this), this.preview, "br");
                                break;

                            case "error":
                                this.createMessage("cross");
                                this.createButton("fullscreen_button", this.toggleFullscreen.bind(this), this.preview, "br");
                                break;

                            case "finding_cameras":
                                this.createMessage("change_camera");
                                this.createButton("fullscreen_button", this.toggleFullscreen.bind(this), this.preview, "br");
                                break;

                            case "image_preview":
                                if (this.appliedCrop instanceof Area === true) {
                                    this.feed = "output";
                                } else {
                                    this.feed = "raw";
                                }

                                this.createButton("camera_button", this.listDevices.bind(this), this.preview, "bl");

                                if (this.imageOnServer === true) {
                                    buttons.push({ "icon" : "trash_button", "action" : this.removeImageFromServer });
                                }

                                buttons.push({ "icon" : "save_button", "action" : this.saveImageToServer });
                                buttons.push({ "icon" : "crop_button", "action" : this.startEditing });
                                this.createButtonGroup(buttons, this.preview, "bc");

                                this.createButton("fullscreen_button", this.toggleFullscreen.bind(this), this.preview, "br");
                                break;

                            case "image_edit":
                                this.feed = "raw";

                                this.createAreaOverlay(this.workingCrop);
                                this.createCropPanArea(this.workingCrop);
                                this.createCropHandle(this.workingCrop, "tl");
                                this.createCropHandle(this.workingCrop, "tr");
                                this.createCropHandle(this.workingCrop, "bl");
                                this.createCropHandle(this.workingCrop, "br");

                                this.createButton("leftarrow_button", this.stopEditing.bind(this), this.preview, "bl");

                                buttons.push({ "icon" : "cross_button", "action" : this.clearCrop });
                                buttons.push({ "icon" : "rotate_clockwise_button", "action" : this.rotateClockwise });
                                buttons.push({ "icon" : "rotate_anticlockwise_button", "action" : this.rotateAnticlockwise });
                                buttons.push({ "icon" : "tick_button", "action" : this.applyCropArea });
                                this.createButtonGroup(buttons, this.preview, "bc");

                                this.createButton("fullscreen_button", this.toggleFullscreen.bind(this), this.preview, "br");

                                break;

                            case "no_camera":
                                this.createMessage("missing");
                                this.createButton("fullscreen_button", this.toggleFullscreen.bind(this), this.preview, "br");
                                break;

                            case "server_delete":
                                this.createMessage("image_delete");
                                break;

                            case "server_load":
                                this.createMessage("image_load");
                                break;

                            case "server_save":
                                this.createMessage("image_save");
                                break;

                            case "setting_up":
                                this.createMessage("change_camera");
                                this.createButton("fullscreen_button", this.toggleFullscreen.bind(this), this.preview, "br");
                                break;

                            case "start_camera":
                                if (this.raw.getImageState() === true) {
                                    this.setState("image_preview");
                                    return false;
                                }

                                if (this.deviceManager.getVideoInputCount() < 1) {
                                    this.setState("no_camera");
                                    return false;
                                }

                                this.createMessage("camera", this.listDevices.bind(this));
                                this.createButton("fullscreen_button", this.toggleFullscreen.bind(this), this.preview, "br");

                                break;

                            case "video_preview":
                                this.feed = "video";
                                this.createTargetingRing(this.takeImage.bind(this));

                                this.createButton("cross_button", this.hideCamera.bind(this), this.preview, "bl");

                                if (this.deviceManager.getVideoInputCount() > 1) {
                                    buttons.push({ "icon" : "change_camera_button", "action" : this.changeCamera });
                                }
                                if (this.raw.hasImage() === true) {
                                    buttons.push({ "icon" : "image_button", "action" : this.showScreen.bind(this, "image_preview") });
                                }
                                this.createButtonGroup(buttons, this.preview, "bc");

                                this.createButton("fullscreen_button", this.toggleFullscreen.bind(this), this.preview, "br");
                                break;

                            default:
                                throw state + " is not a valid state";
                        }

                        this.state = state;
                        this.resizePreview();
                    }

                    this.setWrapper = function(element)
                    {
                        this.wrapper = document.getElementById(element);
                    }

                    this.showScreen = function(screen)
                    {
                        if (this.deviceManager.isStreaming() === true) {
                            this.stopStream();
                        }

                        this.setState(screen);
                    }

                // Utility
                    this.calculateMousePosition = function(target, x, y)
                    {
                        var bounds;
                        var offset = {
                            x : 0,
                            y : 0
                        };
                        var previewHeight;
                        var previewWidth;
                        var position = {
                            x : 0,
                            y : 0
                        };
                        var ratio = null;

                        bounds = this.getBounds(target);

                        if (this.isFullscreen() === true) {
                            previewHeight = this.preview.getHeight();
                            previewWidth = this.preview.getWidth();

                            if (   previewHeight !== bounds.height
                                && previewWidth !== bounds.width) {
                                
                                if (bounds.height - previewHeight < bounds.width - previewWidth) {
                                    ratio = bounds.height / previewHeight;
                                } else {
                                    ratio = bounds.width / previewWidth;
                                }

                                previewHeight = Math.floor(previewHeight * ratio);
                                previewWidth = Math.floor(previewWidth * ratio);
                            }

                            offset.y = -(bounds.height - previewHeight) / 2;
                            offset.x = -(bounds.width - previewWidth) / 2;
                        }

                        position.x = Math.floor(x - bounds.x + offset.x);
                        position.y = Math.floor(y - bounds.y + offset.y);

                        if (position.x < 0) {
                            position.x = 0;
                        }

                        if (position.y < 0) {
                            position.y = 0;
                        }

                        if (position.x > bounds.width) {
                            position.x = bounds.width;
                        }

                        if (position.y > bounds.height) {
                            position.y = bounds.height;
                        }

                        if (ratio !== null) {
                            position.x = Math.floor(position.x / ratio);
                            position.y = Math.floor(position.y / ratio);
                        }

                        return position;
                    }

                    this.calculateOffsetFromOrigin = function(origin, offset, canvasOffset, entityOffset)
                    {
                        var position = {
                            "canvas" : { x : 0, y : 0 },
                            "chain" : { x : 0, y : 0 }
                        };

                        switch (origin) {
                            case 'bl':
                                position.links = ["bottom", "left"];

                                position.canvas.x = offset;
                                position.canvas.y = -entityOffset;

                                position.chain.x = entityOffset;
                                position.chain.y = 0;
                                break;

                            case 'br':
                                position.links = ["bottom", "right"];

                                position.canvas.x = -entityOffset;
                                position.canvas.y = -entityOffset;

                                position.chain.x = -entityOffset;
                                position.chain.y = 0;
                                break;

                            case "bc":
                                position.links = ["bottom", "centerX"];

                                position.canvas.x = -canvasOffset;
                                position.canvas.y = -entityOffset;

                                position.chain.x = entityOffset;
                                position.chain.y = 0;
                                break;

                            case "tc":
                                position.links = ["top", "centerX"];

                                position.canvas.x = -canvasOffset;
                                position.canvas.y = offset;

                                position.chain.x = entityOffset;
                                position.chain.y = 0;
                                break;

                            case 'tl':
                                position.links = ["top", "left"];

                                position.canvas.x = offset;
                                position.canvas.y = offset;

                                position.chain.x = entityOffset;
                                position.chain.y = 0;
                                break;

                            case 'tr':
                                position.links = ["top", "right"];

                                position.canvas.x = -entityOffset;
                                position.canvas.y = offset;

                                position.chain.x = -entityOffset;
                                position.chain.y = 0;
                                break;

                            default:
                                throw origin + " is not a valid origin designation";
                        }

                        return position;
                    }

                    this.checkBrowserCompatability = function()
                    {
                        if (this.deviceManager.checkBrowserCompatability() === false) {
                            return false;
                        }
                    }

                    this.checkScreenOrientation = function()
                    {
                        var orientation;

                        if (this.isBrowser("safari") === true) {
                            orientation = window.orientation;
                        } else {
                            orientation = screen.orientation.type;
                        }

                        switch (orientation) {
                            case 0:
                            case "portrait-primary":
                            case "portrait-secondary":
                                return "portrait";

                            case 180:
                                return "portrait-flip";

                            case 90:
                            case -90:
                            case "landscape-primary":
                            case "landscape-secondary":
                            default:
                                return "landscape";
                        }
                    }

                    this.isBrowser = function(browserType)
                    {
                        var userAgent = navigator.userAgent;

                        if (typeof userAgent !== 'string') {
                            throw 'userAgent is not a string!';
                        }

                        if (userAgent === '') {
                            throw 'userAgent is empty!';
                        }

                        if (typeof browserType !== 'string') {
                            throw 'browserType is not a string!';
                        }

                        if (browserType === '') {
                            throw 'browserType is empty!';
                        }

                        userAgent = userAgent.toLowerCase();
                        browserType = browserType.toLowerCase();

                        if (userAgent.indexOf(browserType) === -1) {
                            return false;
                        }

                        return true;
                    }

                    this.isFullscreen = function()
                    {
                        return this.preview.isFullscreen();
                    }

                    this.getBounds = function(element)
                    {
                        var clientRect;
                        var bounds;

                        clientRect = element.getBoundingClientRect();
                        bounds = {
                            top : clientRect.top,
                            left : clientRect.left,
                            bottom : clientRect.bottom,
                            right : clientRect.right,
                            width : clientRect.width,
                            height : clientRect.height,
                            x : clientRect.x,
                            y : clientRect.y
                        };

                        return bounds;
                    }

                    this.removeChildren = function(parent)
                    {
                        while (parent.firstChild) {
                            parent.removeChild(parent.firstChild);
                        }
                    }

                    this.setCursor = function(cursor)
                    {
                        this.preview.setCursor(cursor);
                    }

                    this.toggleFullscreen = function()
                    {
                        if (this.preview.toggleFullscreen() === false) {
                            this.togglePreviewMaximise();
                        }
                    }

                    this.maximisePreview = function()
                    {
                        this.container.classList.add("maximised");
                    }

                    this.minimisePreview = function()
                    {
                        this.container.classList.remove("maximised");
                    }

                    this.togglePreviewMaximise = function()
                    {
                        this.container.classList.toggle("maximised");
                        this.resizePreview();
                    }

                    this.saveImage = function()
                    {
                        if (this.state !== "image_preview") {
                            throw "You must be in the image preview state to save";
                        }

                        return this.output.getImage();
                    }

                // GUI
                    this.updateGUI = function()
                    {
                        var current;
                        var count;

                        switch (this.state) {
                            case "disconnected":
                            case "no_camera":
                                if (   this.deviceManager.getVideoInputCount() > 0
                                    && this.deviceManager.isReady() === true) {
                                    this.setState("start_camera");
                                }
                                break;
                        }

                        this.preview.resetContext();
                        this.preview.setFillColour(this.config.style.main_colour);
                        this.preview.fillWithColour();

                        if (this.checkScreenOrientation() === "portrait-flip") {
                            this.preview.flip(true, true);
                        }

                        switch (this.feed) {
                            case "output":
                                this.preview.drawImage(this.output.getCanvas(), 0, 0, this.preview.getWidth(), this.preview.getHeight());
                                break;

                            case "raw":
                                this.preview.drawImage(this.raw.getCanvas(), 0, 0, this.preview.getWidth(), this.preview.getHeight());
                                break;

                            case "video":
                                this.preview.drawImage(this.video, 0, 0, this.preview.getWidth(), this.preview.getHeight());
                                break;
                        }

                        count = this.entities.length;
                        for (current = 0; current < count; current++) {
                            this.entities[current].draw();
                        }

                        this.updateLoop = window.requestAnimationFrame(this.updateGUI.bind(this));
                    }

                    this.resizePreview = function()
                    {
                        var container = {};
                        var fullscreen;
                        var width;
                        var height;
                        var ratio = {};
                        var scales = {};
                        var previousDimensions = {};
                        var currentDimensions = {};

                        fullscreen = this.preview.isFullscreen();
                        if (fullscreen === true) {
                            container.width = window.innerWidth;
                            container.height = window.innerHeight;
                        } else {
                            container = this.container.getBoundingClientRect();
                        }

                        previousDimensions = this.preview.getDimensionsAsObject();

                        switch (this.state) {
                            case "image_edit":
                            case "image_preview":
                                ratio = this.output.getRatio();
                                break;

                            case "video_preview":
                                if (this.video.videoHeight === 0) {
                                    ratio.height = 0.5;
                                    ratio.width = 1.5;
                                } else {
                                    ratio.height = this.video.videoHeight / this.video.videoWidth;
                                    ratio.width = this.video.videoWidth / this.video.videoHeight;
                                }

                                break;

                            default:
                                if (fullscreen === true) {
                                    ratio.width = window.innerWidth / window.innerHeight;
                                    ratio.height = window.innerHeight / window.innerWidth;
                                } else {
                                    ratio.width = 1.5;
                                    ratio.height = 0.5;
                                }

                                break;
                        }

                        width = Math.floor(container.width);
                        height = Math.floor(width * ratio.height);

                        if (width < height) {
                            height = width;
                            width = Math.floor(width * ratio.width);
                        }

                        if (height > window.innerHeight) {
                            height *= 0.75;
                            width *= 0.75;
                        }

                        if (   fullscreen === true
                            && height > container.height) {
                            height = container.height;
                            width = height * ratio.width;
                        }

                        this.preview.setDimensions(width, height);
                        this.scaleEntities();

                        if (this.workingCrop instanceof Area === true) {
                            currentDimensions = this.preview.getDimensionsAsObject();

                            scales.width = currentDimensions.width / previousDimensions.width;
                            scales.height = currentDimensions.height / previousDimensions.height;

                            this.workingCrop.scale(scales);
                        }
                    }

                    this.scaleEntities = function()
                    {
                        var current;
                        var count;

                        count = this.entities.length;
                        for (current = 0; current < count; current++) {
                            this.entities[current].scale();
                        }
                    }

                // Interaction
                    this.handleDown = function(x, y)
                    {
                        var action;
                        var entity;

                        entity = this.isOverHotspot(x, y);
                        if (entity === false) {
                            return false;
                        }

                        action = entity.getHotspotAction();
                        if (typeof action !== "function") {
                            return false;
                        }

                        if (entity.isDraggable() === true) {
                            this.dragging = true;
                            this.draggingAction = action;
                            this.draggingEntity = entity;
                            entity.setHotspotDown(true);

                            cursor = entity.getCursor();
                            this.setCursor(cursor);

                        } else {
                            action();
                        }

                        return true;
                    }

                    this.handleMove = function(x, y)
                    {
                        var cursor;

                        if (typeof this.draggingAction === "function") {
                            this.draggingAction(x, y);
                            return true;
                        }

                        entity = this.isOverHotspot(x, y);

                        if (entity === false) {
                            this.setCursor("default");
                            return true;
                        }

                        cursor = entity.getCursor();
                        this.setCursor(cursor);

                        return true;
                    }

                    this.handleUp = function()
                    {
                        if (this.dragging === true) {
                            this.draggingEntity.setHotspotDown(false);
                            this.setCursor(this.draggingEntity.getCursor());

                            this.dragging = false;
                            this.draggingAction = null;
                            this.draggingEntity = null;
                            this.lastGrab = null;
                        }

                        return true;
                    }

                    this.handleFullscreenChange = function()
                    {
                        this.resizePreview();
                    }

                    this.handleMouseDown = function(event)
                    {
                        var position = this.calculateMousePosition(event.target, event.clientX, event.clientY);
                        this.handleDown(position.x, position.y);

                        return true;
                    }

                    this.handleMouseMove = function(event)
                    {
                        var position = this.calculateMousePosition(this.preview.getCanvas(), event.clientX, event.clientY);
                        this.handleMove(position.x, position.y);

                        return true;
                    }

                    this.handleMouseUp = function(event)
                    {
                        this.handleUp();
                    }

                    this.handleOrientation = function(event)
                    {
                        this.resizePreview();
                    }

                    this.handleResize = function()
                    {
                        this.resizePreview();
                    }

                    this.handleTouchEnd = function(event)
                    {
                        window.perfectScrollbarSettings.suppressScrollX = false;
                        this.handleUp();
                    }

                    this.handleTouchMove = function(event)
                    {
                        var position;

                        position = this.calculateMousePosition(event.touches[0].target, event.touches[0].clientX, event.touches[0].clientY);
                        this.handleMove(position.x, position.y);

                        return true;
                    }

                    this.handleTouchStart = function(event)
                    {
                        var position;

                        event.preventDefault();
                        window.perfectScrollbarSettings.suppressScrollX = true;
                        position = this.calculateMousePosition(event.touches[0].target, event.touches[0].clientX, event.touches[0].clientY);
                        this.handleDown(position.x, position.y);

                        return true;
                    }

                    this.isOverHotspot = function(x, y)
                    {
                        var current;
                        var entity = null;

                        for (current = this.entities.length - 1; current >= 0; current--) {
                            if (   this.entities[current].isWithinHotspot(x, y)
                                && entity === null) {
                                entity = this.entities[current];
                            }
                        }

                        if (entity instanceof Entity === false) {
                            return false;
                        }

                        return entity;
                    }

                    this.updateDevices = function()
                    {
                        var stream;

                        stream = this.deviceManager.getStream();
                        if (stream.active === false) {
                            this.deviceManager.setReady(false);
                            this.setState("disconnected");
                            this.stopStream();
                        } else {
                            this.deviceManager.findDevices();
                        }
                    }

                // Editing
                    this.applyCropArea = function()
                    {
                        if ((this.workingCrop instanceof Area) === false) {
                            return false;
                        }

                        this.workingCrop.scaleToDestination(this.raw);
                        this.workingCrop.matchRatio(this.output);
                        this.workingCrop.fitAreaToSource();

                        this.output.resetContext();
                        this.output.setFillColour("#000000");
                        this.output.fillWithColour();
                        this.output.drawImage(this.raw.canvas,
                            this.workingCrop.x, this.workingCrop.y, this.workingCrop.width, this.workingCrop.height,
                            0, 0, this.output.getWidth(), this.output.getHeight());

                        this.appliedCrop = this.workingCrop;
                        this.workingCrop = null;
                        this.rotation = 0;

                        this.setState("image_preview");
                    }

                    this.clearCrop = function()
                    {
                        this.appliedCrop = null;
                        this.workingCrop = null;

                        this.output.resetContext();
                        this.output.setFillColour("#000000");
                        this.output.fillWithColour();
                        this.output.drawImage(
                            this.raw.canvas,
                            0, 0, this.raw.getWidth(), this.raw.getHeight(),
                            0, 0, this.output.getWidth(), this.output.getHeight());

                        if (this.state === "image_edit") {
                            this.setState("image_preview");
                        }
                    }

                    this.dragCropHandle = function(x, y, corner)
                    {
                        this.workingCrop.setCornerToPosition(x, y, corner);
                        return true;
                    }

                    this.panCropArea = function(x, y)
                    {
                        var mouse;

                        if (this.lastGrab === null) {
                            this.lastGrab = {
                                x : x,
                                y : y
                            };
                        }

                        this.workingCrop.adjustPosition(x - this.lastGrab.x, y - this.lastGrab.y);

                        this.lastGrab = {
                            x : x,
                            y : y
                        };

                        return true;
                    }

                    this.setCropArea = function(x, y, width, height)
                    {
                        this.workingCrop.setArea(x, y, width, height);
                    }

                    this.startEditing = function()
                    {
                        var area;
                        var x;
                        var y;
                        var width;
                        var height;

                        var minimumWidth = this.config.crop.minimum_width;
                            minimumHeight = this.config.crop.minimum_height;

                        if (this.state !== "image_preview") {
                            throw "Unable to start editing from the " + this.state + " state";
                        }

                        if (this.appliedCrop instanceof Area === true) {
                            this.workingCrop = this.appliedCrop;
                            this.workingCrop.scaleToDestination(this.preview);

                        } else {
                            area = this.preview.getDimensionsAsObject();
                            x = area.width * 0.1;
                            y = area.height * 0.1;
                            width = area.width * 0.8;
                            height = area.height * 0.8;

                            this.workingCrop = new Area;
                            this.workingCrop.setSource(this.preview);
                            this.workingCrop.setArea(x, y, width, height);
                            this.workingCrop.setMinimumDimensions(minimumWidth, minimumHeight);
                        }

                        this.setState("image_edit");
                    }

                    this.stopEditing = function()
                    {
                        this.resetRotation();
                        this.workingCrop = null;
                        this.setState("image_preview");
                    }

                // Image
                    this.takeImage = function()
                    {
                        var scale;
                        var outputWidth;
                        var outputHeight;

                        if (this.video.srcObject === null) {
                            throw "No video stream is running";
                        }

                        this.workingCrop = null;
                        this.appliedCrop = null;

                        this.raw.setDimensions(this.video.videoWidth, this.video.videoHeight);
                        this.raw.drawImage(this.video, 0, 0);

                        if (this.video.videoHeight >= this.video.videoWidth) {
                            scale = this.config.output.edge_maximum / this.video.videoHeight;
                        } else {
                            scale = this.config.output.edge_maximum / this.video.videoWidth;
                        }

                        outputHeight = this.video.videoHeight * scale;
                        outputWidth = this.video.videoWidth * scale;
                        this.output.setDimensions(outputWidth, outputHeight);

                        this.output.resetContext();
                        this.output.setFillColour("#000000");
                        this.output.fillWithColour();
                        this.output.drawImage(
                            this.raw.canvas,
                            0, 0, this.raw.getWidth(), this.raw.getHeight(),
                            0, 0, this.output.getWidth(), this.output.getHeight());

                        this.raw.setImageState(true);
                        this.setState("image_preview");
                        this.stopStream();
                    }

                    this.removeImage = function()
                    {
                        this.raw.setImageState(false);
                        this.raw.fillWithColour("#000000");

                        this.setState("start_camera");
                    }

                    this.setImageFromServer = function(response)
                    {
                        var image;
                        var scale;
                        var outputWidth;
                        var outputHeight;

                        if (response.success === false) {
                            return false;
                        }

                        this.setState("server_load");

                        this.workingCrop = null;
                        this.appliedCrop = null;

                        image = new Image;
                        image.addEventListener("load", this.setImage.bind(this, image));
                        image.src = response.camera_image;
                        this.imageOnServer = true;

                        return true;
                    }

                    this.setImage = function(image)
                    {
                        this.raw.setDimensions(image.width, image.height);
                        this.raw.drawImage(
                            image,
                            0, 0, image.width, image.height,
                            0, 0, this.raw.getWidth(), this.raw.getHeight());
                        this.raw.setImageState(true);

                        if (image.height >= image.width) {
                            scale = this.config.output.edge_maximum / image.height;
                        } else {
                            scale = this.config.output.edge_maximum / image.width;
                        }

                        outputHeight = image.height * scale;
                        outputWidth = image.width * scale;

                        this.output.setDimensions(outputWidth, outputHeight);
                        this.output.drawImage(
                            image,
                            0, 0, image.width, image.height,
                            0, 0, this.output.getWidth(), this.output.getHeight());

                        this.setState("image_preview");
                    }

                // Server
                    this.setServerDelete = function(func)
                    {
                        if (typeof func !== "function") {
                            throw "Server Delete must be set to a function";
                        }

                        this.serverDelete = func;
                        return true;
                    }

                    this.setServerLoad = function(func)
                    {
                        if (typeof func !== "function") {
                            throw "Server Load must be set to a function";
                        }

                        this.serverLoad = func;
                        return true;
                    }

                    this.setServerSave = function(func)
                    {
                        if (typeof func !== "function") {
                            throw "Server Save must be set to a function";
                        }

                        this.serverSave = func;
                        return true;
                    }

                    this.loadImageFromServer = function()
                    {
                        if (typeof this.serverLoad !== "function") {
                            throw "Load function not defined";
                        }

                        var data = {};

                        data.camera_id = this.id;
                        this.serverLoad(data, this.setImageFromServer.bind(this));

                        return true;
                    }

                    this.removeImageFromServer = function()
                    {
                        if (typeof this.serverDelete !== "function") {
                            throw "Delete function not defined";
                        }

                        var data = {};

                        this.removeImage();
                        this.setState("server_delete");

                        data.camera_id = this.id;
                        this.serverDelete(data, this.setState.bind(this, "start_camera"));

                        return true;
                    }

                    this.saveImageToServer = function()
                    {
                        if (typeof this.serverSave !== "function") {
                            throw "Save function not defined";
                        }

                        var data = {};

                        this.setState("server_save");

                        data.camera_id = this.id;
                        data.camera_image = this.output.getImage();

                        this.serverSave(data, this.setState.bind(this, "image_preview"));
                        this.imageOnServer = true;

                        return true;
                    }

                // Stream
                    this.changeCamera = function()
                    {
                        if (this.deviceManager.getVideoInputCount() < 2) {
                            return false;
                        }

                        this.setState("change_camera");
                        this.deviceManager.nextVideoInput();
                        this.stopStream();
                        this.startStream();

                        return true;
                    }

                    this.hideCamera = function()
                    {
                        this.stopStream();

                        this.setState("start_camera");
                    }

                    this.showStream = function(stream)
                    {
                        this.video.addEventListener("playing", this.resizePreview.bind(this));
                        this.video.addEventListener("timeupdate", this.handleVideoTimeUpdate.bind(this));
                        this.video.srcObject = stream;
                        this.video.play();

                        setTimeout(this.setState.bind(this, "video_preview"), 1000);
                    }

                    this.handleVideoTimeUpdate = function()
                    {
                        if (this.preview.getOrientation() !== this.checkScreenOrientation()) {
                            this.resizePreview();
                        }
                    }

                    this.listDevices = function()
                    {
                        this.setState("change_camera");
                        this.deviceManager.findDevices()
                        .then(function(){
                            var videoInput;

                            if (self.isBrowser('chrome') === true || self.isBrowser('safari') === true) {
                                videoInput = 1;
                            } else {
                                videoInput = 0;
                            }

                            self.deviceManager.setInitialInputs(false, videoInput);
                            self.startStream();
                        })
                        .catch(function(error){
                            self.setState("error", "Unable to find your cameras");
                        });
                    }

                    this.startStream = function()
                    {
                        this.deviceManager.startStream()
                        .then(function(stream){
                            self.showStream(stream);
                        })
                        .catch(function(error){
                            console.log(error);
                            self.setState("error", "Unable to start camera");
                        });
                    }

                    this.stopStream = function()
                    {
                        this.video.pause();
                        this.video.removeEventListener("playing", this.resizePreview.bind(this));
                        this.video.removeEventListener("timeupdate", this.handleVideoTimeUpdate.bind(this));
                        this.deviceManager.stopStream();
                    }

                // Rotation
                    this.resetRotation = function()
                    {
                        var direction;
                        var rotations;

                        rotations = (this.rotation / 90) % 4;

                        if (rotations === 0) {
                            this.rotation = 0;
                            return true;
                        }

                        if (rotations === -3) {
                            direction = "anticlockwise"
                            rotations = 1;
                        } else if (rotations === 3) {
                            direction = "clockwise";
                            rotations = 1;
                        } else if (rotations < 0) {
                            direction = "clockwise"
                            rotations = Math.abs(rotations);
                        } else if (rotations > 0) {
                            direction = "anticlockwise";
                        }

                        for (; rotations > 0; rotations--) {
                            if (direction === "clockwise") {
                                this.rotateClockwise();
                            } else {
                                this.rotateAnticlockwise();
                            }
                        }

                        this.rotation = 0;
                        return true;
                    }

                    this.rotate = function(angle)
                    {
                        this.rotation += angle;
                        this.raw.rotate(angle);
                        this.output.rotate(angle);
                        this.preview.rotate(angle);
                        this.workingCrop.rotate(angle);
                        this.resizePreview();
                    }

                    this.rotateAnticlockwise = function()
                    {
                        this.rotate(-90);
                    }

                    this.rotateClockwise = function()
                    {
                        this.rotate(90);
                    }
            }
});
