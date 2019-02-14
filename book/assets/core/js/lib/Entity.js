define(["core/js/lib/Area", "core/js/lib/Canvas"], function(Area, Canvas)
{
    return function Entity()
    {
        this.id;

        this.basis = {
            height : 0,
            scale : true,
            width : 0
        };

        this.cursor = {
            normal : "default",
            hover : null,
            down : null
        };

        this.fill = {
            colour : null,
            hover : null
        };

        this.hotspot = {
            action : null,
            draggable : false,
            down : false,
            height : 0,
            hovering : false,
            relative : true,
            width : 0,
            x : 0,
            y : 0
        };

        this.link = {
            bottom : false,
            centerX : false,
            centerY : false,
            height: false,
            left : false,
            object : null,
            right : false,
            top : false,
            width : false,
            x : false,
            y : false
        };

        this.position = {
            relative : false,
            x : 0,
            y : 0
        };

        this.shape = {
            endAngle : null,
            height : 0,
            source : null,
            path : null,
            radius : null,
            startAngle : null,
            type : null,
            width : 0
        };

        this.stroke = {
            colour: null,
            weight: null
        };

        this.style = {
            mode : "source-over",
            opacity : 1
        };

        this.target = {
            canvas : null
        };

        this.text = {
            alignment : "center",
            font : "Arial",
            size : "1rem",
            string : "",
            transform : null
        };

        this.dimensions = {};
        this.object = {};

        // Input
            this.setID = function(id)
            {
                if (typeof id !== "string") {
                    throw "ID must be a string";
                }

                this.id = id;
                return true;
            }

        // Output
            this.getDimensionsAsObject = function()
            {
                var position;

                position = this.getPosition();
                this.dimensions = this.getShapeDimensions();

                if (this.shape.type === 'circle') {
                    this.dimensions.width = this.shape.radius * 2;
                    this.dimensions.height = this.shape.radius * 2;
                }

                this.object.x = position.x;
                this.object.y = position.y;
                this.object.width = this.dimensions.width;
                this.object.height = this.dimensions.height;

                this.object.top = position.y;
                this.object.right = position.x + this.dimensions.width;
                this.object.bottom = position.y + this.dimensions.height;
                this.object.left = position.x;

                this.object.centerX = position.x + (this.dimensions.width / 2);
                this.object.centerY = position.y + (this.dimensions.height / 2);

                return this.object;
            }

            this.getID = function()
            {
                return this.id;
            }

        // Utility
            this.draw = function()
            {
                var position;
                var dimensions;
                var fill;

                position = this.getPosition();
                dimensions = this.getShapeDimensions();

                this.target.canvas.resetContext();
                this.target.canvas.beginPath();

                // Apply Globals
                    this.target.canvas.applyCompositeMode(this.style.mode);
                    this.target.canvas.applyOpacity(this.style.opacity);

                // Styling
                    fill = this.getFillColour();

                    if (fill !== null) {
                        this.target.canvas.setFillColour(fill);
                    }

                    if (this.stroke.colour !== null) {
                        this.target.canvas.setStrokeColour(this.stroke.colour);
                        this.target.canvas.setStrokeWeight(this.stroke.weight);
                    }

                // Draw Path
                    switch (this.shape.type) {
                        case "circle":
                            this.target.canvas.drawCircle(position.x + this.shape.radius, position.y + this.shape.radius, this.shape.radius);
                            break;

                        case "hollow_rectangle":
                            this.target.canvas.drawHollowRectangle(position.x, position.y, dimensions.width, dimensions.height);
                            break;

                        case "image":
                            this.target.canvas.drawImage(this.shape.source, position.x, position.y, dimensions.width, dimensions.height);
                            break;

                        case "rectangle":
                            this.target.canvas.drawRectangle(position.x, position.y, dimensions.width, dimensions.height);
                            break;

                        case "text":
                            this.target.canvas.setTextAlignment(this.text.alignment);
                            this.target.canvas.setFont(this.text.font, this.text.size);
                            this.target.canvas.drawText(position.x, position.y, this.getTextString());
                            break;
                    }

                // Apply Styling
                    if (fill !== null) {
                        this.target.canvas.applyFill();
                    }

                    if (this.stroke.colour !== null) {
                        this.target.canvas.applyStroke();
                    }
            }

            this.isCalled = function(id)
            {
                if (this.id === id) {
                    return true;
                }

                return false;
            }

            this.scale = function()
            {
                var target;

                if (this.basis.scale === false) {
                    return false;
                }

                target = this.target.canvas.getDimensionsAsObject();

                if (   target.width === 0
                    || target.height === 0) {
                    return false;
                }

                scaleW = target.width / this.basis.width;
                scaleH = target.height / this.basis.height;

                this.position.x *= scaleW;
                this.position.y *= scaleH;
                this.shape.width *= scaleW;
                this.shape.height *= scaleW;
                this.shape.radius *= scaleW;

                this.hotspot.x *= scaleW;
                this.hotspot.y *= scaleH;
                this.hotspot.width *= scaleW;
                this.hotspot.height *= scaleW;

                this.basis.width = target.width;
                this.basis.height = target.height;

                return true;
            }

        // Basis
            this.getBasis = function()
            {
                return this.basis;
            }

            this.setBasis = function(width, height)
            {
                if (typeof width !== "number") {
                    throw "Basis width must be a number";
                }

                if (typeof height !== "number") {
                    throw "Basis height must be a number";
                }

                this.basis.width = width;
                this.basis.height = height;
                return true;
            }

            this.setScale = function(scale)
            {
                if (scale === false) {
                    this.basis.scale = false;
                } else {
                    this.basis.scale = true;
                }

                return true;
            }

        // Cursor
            this.getCursor = function()
            {
                if (   this.hotspot.down === true
                    && this.cursor.down !== null) {
                    return this.cursor.down;
                }

                if (   this.hotspot.hovering === true
                    && this.cursor.hover !== null) {
                    return this.cursor.hover;
                }

                return this.cursor.normal;
            }

            this.setCursor = function(cursor, type)
            {
                switch (cursor) {
                    case "alias ":
                    case "all-scroll":
                    case "cell":
                    case "context-menu":
                    case "col-resize":
                    case "copy":
                    case "crosshair":
                    case "default":
                    case "e-resize":
                    case "ew-resize":
                    case "grab":
                    case "grabbing":
                    case "help":
                    case "move":
                    case "n-resize":
                    case "ne-resize":
                    case "nesw-resize":
                    case "ns-resize":
                    case "nw-resize":
                    case "nwse-resize":
                    case "no-drop":
                    case "none":
                    case "not-allowed":
                    case "pointer":
                    case "progress":
                    case "row-resize":
                    case "s-resize":
                    case "se-resize":
                    case "sw-resize":
                    case "text":
                    case "w-resize":
                    case "wait":
                    case "zoom-in":
                    case "zoom-out":
                        break;

                    default:
                        throw "Cursor type " + cursor + " is not supported";
                }

                switch (type) {
                    case "down":
                        this.cursor.down = cursor;
                        break;

                    case "hover":
                        this.cursor.hover = cursor;
                        break;

                    case "normal":
                        this.cursor.normal = cursor;
                        break;

                    default:
                        throw type + " is not a settable cursor type";
                }
            }

        // Fill
            this.getFillColour = function()
            {
                if (   this.hotspot.hovering === true
                    && this.fill.hover !== null) {
                    return this.fill.hover;
                }

                return this.fill.colour;
            }

            this.setFillColour = function(colour)
            {
                if (typeof colour !== "string") {
                    throw "Colour must be in a string format";
                }

                this.fill.colour = colour;
                return true;
            }

            this.setHoverFill = function(colour)
            {
                if (typeof colour !== "string") {
                    throw "Colour must be in a string format";
                }

                this.fill.hover = colour;
                return true;
            }

        // Hotspot
            this.getHotspotAction = function()
            {
                return this.hotspot.action;
            }

            this.getHotspotRegion = function()
            {
                var region = {};
                var position;
                var dimensions;

                region.x = this.hotspot.x;
                region.y = this.hotspot.y;
                region.height = this.hotspot.height;
                region.width = this.hotspot.width;

                if (this.link.object !== null) {
                    position = this.getPosition();
                    dimensions = this.getShapeDimensions();

                    if (this.hotspot.relative === true) {
                        region.x = position.x + this.hotspot.x;
                        region.y = position.y + this.hotspot.y;
                    }

                    if (this.link.height === true) {
                        region.height = dimensions.height;
                    }

                    if (this.link.width === true) {
                        region.width = dimensions.width;
                    }
                }

                return region;
            }

            this.isDraggable = function()
            {
                return this.hotspot.draggable;
            }

            this.isWithinHotspot = function(x, y)
            {
                var region = this.getHotspotRegion();

                if (   typeof this.hotspot.action !== "function"
                    || x < region.x
                    || y < region.y
                    || x > region.x + region.width
                    || y > region.y + region.height) {
                    this.hotspot.down = false;
                    this.hotspot.hovering = false;
                    return false;
                }

                this.hotspot.hovering = true;
                return true;
            }

            this.setDraggable = function(draggable)
            {
                if (draggable === true) {
                    this.hotspot.draggable = true;
                } else {
                    this.hotspot.draggable = false;
                }

                return true;
            }

            this.setHotspotAction = function(callback)
            {
                if (typeof callback !== "function") {
                    throw "Hotspot action must be a function";
                }

                this.hotspot.action = callback;
            }

            this.setHotspotDown = function(down)
            {
                if (down === true) {
                    this.hotspot.down = true;
                } else {
                    this.hotspot.down = false;
                }
            }

            this.setHotspotRegion = function(x, y, width, height)
            {
                if (typeof x === 'number') {
                    this.hotspot.x = x;
                }

                if (typeof y === 'number') {
                    this.hotspot.y = y;
                }

                if (typeof width === 'number') {
                    this.hotspot.width = width;
                }

                if (typeof height === 'number') {
                    this.hotspot.height = height;
                }
            }

            this.setHotspotRelative = function(relative)
            {
                if (relative === false) {
                    this.hotspot.relative = false;
                } else {
                    this.hotspot.relative = true;
                }

                return true;
            }

        // Linking
            this.getLink = function()
            {
                return this.link;
            }

            this.setLink = function(object, links, relativePosition)
            {
                var current;

                if (   object instanceof Area === false
                    && object instanceof Canvas === false
                    && object instanceof Entity === false) {
                    throw "Entities may only be linked to Entity, Area or Canvas class objects";
                }

                if ("length" in links === false) {
                    throw "Links must be an array";
                }

                if (links.length < 1) {
                    throw "At least one link must be specified";
                }

                this.removeLink();
                this.link.object = object;

                for (current = 0; current < links.length; current++) {
                    this.linkProperty(links[current]);
                }

                if (relativePosition !== false) {
                    this.setPositionRelative(true);
                }

                return true;
            }

            this.linkProperty = function(link)
            {
                var key;

                for (key in this.link) {
                    if (key == link) {
                        this.link[key] = true;
                        return true;
                    }
                }

                return false;
            }

            this.removeLink = function()
            {
                var property;

                for (property in this.link) {
                    property = false;
                }

                this.link.object = null;

                return true;
            }

        // Position
            this.getPosition = function()
            {
                var bounds;
                var position = {};

                if (this.link.object !== null) {
                    bounds = this.link.object.getDimensionsAsObject();

                    if (this.link.x === true) {
                        position.x = bounds.x;

                    } else if (this.link.left === true) {
                        position.x = bounds.left;

                    } else if (this.link.right === true) {
                        position.x = bounds.right;

                    } else if (this.link.centerX === true) {
                        position.x = bounds.centerX;

                    } else {
                        position.x = this.hotspot.x;
                    }

                    if (this.link.y === true) {
                        position.y = bounds.y;

                    } else if (this.link.top === true) {
                        position.y = bounds.top;

                    } else if (this.link.bottom === true) {
                        position.y = bounds.bottom;

                    } else if (this.link.centerY === true) {
                        position.y = bounds.centerY;

                    } else {
                        position.y = this.hotspot.y;
                    }

                    if (this.position.relative === true) {
                        position.x += this.position.x;
                        position.y += this.position.y;
                    }

                    return position;

                } else {
                    return this.position;
                }
            }

            this.setPosition = function(x, y)
            {
                if (typeof x !== "number") {
                    throw "X coordinate must be a number";
                }

                if (typeof y !== "number") {
                    throw "Y coordinate must be a number";
                }

                this.position.x = x;
                this.position.y = y;
                return true;
            }

            this.setPositionRelative = function(relative)
            {
                if (relative === true) {
                    this.position.relative = true;
                } else {
                    this.position.relative = false;
                }

                return true;
            }

        // Shape
            this.createCircle = function(radius, startAngle, endAngle)
            {
                if (typeof radius !== "number") {
                    throw "Radius must be a number";
                }

                if (typeof startAngle !== "number") {
                    startAngle = 0;
                }

                if (typeof endAngle !== "number") {
                    endAngle = 360;
                }

                this.shape.type = "circle";
                this.shape.radius = radius;
                this.shape.startAngle = startAngle;
                this.shape.endAngle = endAngle;
            }

            this.createImage = function(source, height, width)
            {
                this.shape.type = "image";
                this.shape.source = source;
                this.shape.height = height;
                this.shape.width = width;
            }

            this.createPath = function(path)
            {
                this.shape.type = "path";
            }

            this.createHollowRectangle = function(width, height)
            {
                this.shape.type = "hollow_rectangle";
                this.shape.height = height;
                this.shape.width = width;
            }

            this.createRectangle = function(height, width)
            {
                this.shape.type = "rectangle";
                this.shape.height = height;
                this.shape.width = width;
            }

            this.createText = function(string)
            {
                this.shape.type = "text";
                this.setTextString(string);
            }

            this.getShapeDimensions = function()
            {
                var bounds;
                var dimensions = {};

                if (this.link.object !== null) {
                    bounds = this.link.object.getDimensionsAsObject();

                    if (this.link.height === true) {
                        dimensions.height = bounds.height;
                    } else {
                        dimensions.height = this.shape.height;
                    }

                    if (this.link.width === true) {
                        dimensions.width = bounds.width;
                    } else {
                        dimensions.width = this.shape.width;
                    }

                } else {
                    dimensions.height = this.shape.height;
                    dimensions.width = this.shape.width;
                }

                return dimensions;
            }

        // Stroke
            this.getStrokeColour = function()
            {
                return this.stroke.colour;
            }

            this.getStrokeWeight = function()
            {
                return this.stroke.weight;
            }

            this.setStroke = function(colour, weight)
            {
                this.setStrokeColour(colour);
                this.setStrokeWeight(weight);
            }

            this.setStrokeColour = function(colour)
            {
                if (typeof colour !== "string") {
                    throw "Colour must be in a string format";
                }

                this.stroke.colour = colour;
                return true;
            }

            this.setStrokeWeight = function(weight)
            {
                if (typeof weight !== "number") {
                    throw "Weight must be a number";
                }

                this.stroke.weight = weight;
                return true;
            }

        // Style
            this.getCompositeMode = function()
            {
                return this.style.mode;
            }

            this.getOpacity = function()
            {
                return this.style.opacity;
            }

            this.setCompositeMode = function(mode)
            {
                switch (mode) {
                    case "color":
                    case "color-burn":
                    case "color-dodge":
                    case "copy":
                    case "darken":
                    case "destination-atop":
                    case "destination-in":
                    case "destination-out ":
                    case "destination-over":
                    case "difference":
                    case "exclusion":
                    case "hard-light":
                    case "hue":
                    case "lighten":
                    case "lighter":
                    case "luminosity":
                    case "multiply":
                    case "overlay":
                    case "saturation":
                    case "screen":
                    case "soft-light":
                    case "source-atop":
                    case "source-in":
                    case "source-out":
                    case "source-over":
                    case "xor":
                        this.style.mode = mode;
                        return true;

                    default:
                        throw "Composite mode " + mode + " is not supported";
                }
            }

            this.setOpacity = function(opacity)
            {
                if (typeof opacity !== "number") {
                    throw "Opacity must be a number";
                }

                if (opacity < 0) {
                    throw "Opacity must be a number greater than 0";
                }

                if (opacity > 1) {
                    throw "Opacity must be a number less than 1";
                }

                this.style.opacity = opacity;
                return true;
            }

        // Target
            this.getTarget = function()
            {
                return this.target.canvas;
            }

            this.setTarget = function(canvas)
            {
                var dimensions;

                if (canvas instanceof Canvas === false) {
                    throw "Entity target must be a Canvas class object";
                }

                this.target.canvas = canvas;

                dimensions = canvas.getDimensionsAsObject();
                this.setBasis(dimensions.width, dimensions.height);

                return true;
            }

        // Text
            this.getTextString = function()
            {
                switch (this.text.transform) {
                    case "lowercase":
                        return this.text.string.toLowerCase();

                    case "uppercase":
                        return this.text.string.toUpperCase();

                    default:
                        return this.text.string;
                }
            }

            this.getTextAlignment = function()
            {
                return this.text.alignment;
            }

            this.getTextTransform = function()
            {
                return this.text.transform;
            }

            this.setTextString = function(string)
            {
                if (typeof string !== "string") {
                    throw "Entity text must be a string";
                }

                this.text.string = string;
                return true;
            }

            this.setTextAlignment = function(alignment)
            {
                switch (alignment) {
                    case "left":
                    case "right":
                    case "center":
                        this.text.alignment = alignment;
                        return true;

                    default:
                        throw "Text alignment must be left, right, or center";
                }
            }

            this.setTextTransform = function(transform)
            {
                switch (transform) {
                    case "lowercase":
                    case "uppercase":
                        this.text.transform = transform;
                        return true;

                    default:
                        throw "Transform " + transform + " is not supported";
                }
            }
    }
});
