define(function()
{
    return function Canvas()
    {
        var self = this;
        this.canvas;
        this.context;

        this.copy = null;
        this.clone = null;

        this.fontFamily;
        this.fontSize;
        this.image = false;

        this.dimensions = {};
        this.ratio = {};
        this.bounds = {};

        // Setup
            this.setup = function()
            {
                this.canvas = document.createElement('canvas');
                this.context = this.canvas.getContext('2d');

                this.fontFamily = "sans-serif";
                this.fontSize = "1rem";
            }

        // Input
            this.setDimensions = function(width, height)
            {
                this.canvas.width = width;
                this.canvas.height = height;
            }

        // Output
            this.getCanvas = function()
            {
                return this.canvas;
            }

            this.getDimensionsAsObject = function()
            {
                this.dimensions.x = 0;
                this.dimensions.y = 0;
                this.dimensions.width = this.canvas.width;
                this.dimensions.height = this.canvas.height;

                this.dimensions.top = 0;
                this.dimensions.right = this.canvas.width;
                this.dimensions.bottom = this.canvas.height;
                this.dimensions.left = 0;

                this.dimensions.centerX = this.canvas.width / 2;
                this.dimensions.centerY = this.canvas.height / 2;

                return this.dimensions;
            }

            this.getHeight = function()
            {
                return this.canvas.height;
            }

            this.getImage = function()
            {
                return this.canvas.toDataURL("image/jpeg");
            }

            this.getOrientation = function()
            {
                if (this.canvas.width > this.canvas.height) {
                    return 'landscape';
                }

                if (this.canvas.width < this.canvas.height) {
                    return 'portrait';
                }

                return 'square';
            }

            this.getRatio = function()
            {
                this.ratio.width = this.canvas.width / this.canvas.height;
                this.ratio.height = this.canvas.height / this.canvas.width;

                return this.ratio;
            }

            this.getWidth = function()
            {
                return this.canvas.width;
            }

        // Utility
            this.addEvent = function(event, callback)
            {
                this.canvas.addEventListener(event, callback);
            }

            this.appendToElement = function(element)
            {
                element.appendChild(this.canvas);
            }

            this.clearCanvas = function()
            {
                this.clearArea(0, 0, this.canvas.width, this.canvas.height);
            }

            this.cloneCanvas = function(blank)
            {
                this.copy = new Canvas;
                this.copy.setup();
                this.copy.setDimensions(this.getWidth(), this.getHeight());

                if (blank === false) {
                    this.copy.drawImage(this.canvas, 0, 0);
                }

                return this.copy;
            }

            this.flip = function(flipHorizontal, flipVertical)
            {
                var translateX = 0;
                var translateY = 0;
                var scaleH = 1;
                var scaleV = 1;

                if (flipHorizontal === true) {
                    translateX = this.canvas.width;
                    scaleH = -1;
                }

                if (flipVertical === true) {
                    translateY = this.canvas.height;
                    scaleV = -1;
                }

                this.context.translate(translateX, translateY);
                this.context.scale(scaleH, scaleV);
            }

            this.getBounds = function()
            {
                var clientRect;

                clientRect = this.canvas.getBoundingClientRect();
                this.bounds = {
                    top : clientRect.top,
                    left : clientRect.left,
                    bottom : clientRect.bottom,
                    right : clientRect.right,
                    width : clientRect.width,
                    height : clientRect.height,
                    x : clientRect.x,
                    y : clientRect.y
                }

                return this.bounds;
            }

            this.getFullscreenElement = function()
            {
                if (document.fullscreenElement) {
                    return document.fullscreenElement;

                } else if (document.webkitFullscreenElement) {
                    return document.webkitFullscreenElement;

                } else if (document.mozFullScreenElement) {
                    return document.mozFullScreenElement;

                } else if (document.msFullscreenElement) {
                    return document.msFullscreenElement;
                }

                return false;
            }

            this.isFullscreen = function(element)
            {
                if (this.getFullscreenElement() === this.canvas) {
                    return true;
                }

                return false;
            }

            this.removeEvent = function(event, callback)
            {
                this.canvas.removeEventListener(event, callback);
            }

            this.resetContext = function()
            {
                this.context.setTransform(1, 0, 0, 1, 0, 0);
                this.context.globalCompositeOperation = "source-over";
                this.context.globalAlpha = 1;
                return true;
            }

            this.setCursor = function(cursor)
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
                        this.canvas.style.cursor = cursor;
                        return true;

                    default:
                        throw "Cursor type " + cursor + " is not supported";
                }
            }

            this.toggleFullscreen = function()
            {
                if (this.isFullscreen()) {
                    if (document.cancelFullScreen) {
                        document.cancelFullScreen();

                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();

                    } else if (document.webkitCancelFullScreen) {
                        document.webkitCancelFullScreen();

                    } else {
                        return false;
                    }

                    setTimeout(function(){self.canvas.scrollIntoView(false);}, 500);

                } else {
                    if (this.canvas.requestFullscreen) {
                        this.canvas.requestFullscreen();

                    } else if (this.canvas.mozRequestFullScreen) {
                        this.canvas.mozRequestFullScreen();

                    } else if (this.canvas.webkitRequestFullScreen) {
                        this.canvas.webkitRequestFullScreen();

                    } else {
                        return false;
                    }
                }
            }

        // Drawing
            this.beginPath = function()
            {
                this.context.beginPath();
            }

            this.closePath = function()
            {
                this.context.closePath();
            }

            this.clearArea = function(x, y, width, height)
            {
                this.context.clearRect(x, y, width, height);
            }

            this.drawCircle = function(x, y, radius)
            {
                this.context.arc(x, y, radius, 0, 2 * Math.PI);
            }

            this.drawHollowRectangle = function(x, y, width, height)
            {
                this.clone = this.cloneCanvas(true);
                this.clone.setFillColour(this.context.fillStyle);
                this.clone.fillWithColour();
                this.clone.clearArea(x, y, width, height);

                this.drawImage(this.clone, 0, 0);
            }

            this.drawImage = function(source, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight)
            {
                if (source instanceof Canvas) {
                    source = source.getCanvas();
                }

                switch (arguments.length) {
                    case 3:
                        this.context.drawImage(source, sourceX, sourceY);
                        break;

                    case 5:
                        this.context.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight);
                        break;

                    case 9:
                        this.context.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight);
                        break;

                    default:
                        throw "Invalid quantity of parameters sent to drawImage";
                        return false;
                }

                return true;
            }

            this.drawRectangle = function(x, y, width, height)
            {
                this.context.rect(x, y, width, height);
            }

            this.drawText = function(x, y, text)
            {
                this.context.font = this.fontSize + " " + this.fontFamily;
                this.context.fillText(text, x, y);
            }

            this.fillWithColour = function()
            {
                this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }

        // Image
            this.getImageState = function()
            {
                return this.image;
            }

            this.setImageState = function(state)
            {
                if (state === true) {
                    this.image = true;
                } else {
                    this.image = false;
                }

                return true;
            }

            this.hasImage = function()
            {
                return this.image;
            }

        // Rotation
            this.rotate = function(angle)
            {
                if (angle !== 90 && angle !== -90) {
                    throw "Rotation angle must be 90 degrees";
                }

                var copy;

                this.resetContext();
                copy = this.cloneCanvas(false);
                this.setDimensions(this.canvas.height, this.canvas.width);

                if (angle === 90) {
                    this.context.translate(this.canvas.width, 0);
                } else if (angle === -90) {
                    this.context.translate(0, this.canvas.height);
                }

                this.context.rotate(angle * Math.PI / 180);
                this.drawImage(copy, 0, 0);
            }

        // Styling
            this.applyStroke = function(colour, weight)
            {
                this.context.stroke();
            }

            this.applyFill = function()
            {
                this.context.fill();
            }

            this.applyOpacity = function(opacity)
            {
                this.context.globalAlpha = opacity;
            }

            this.applyCompositeMode = function(mode)
            {
                this.context.globalCompositeOperation = mode;
            }

            this.setFillColour = function(colour)
            {
                this.context.fillStyle = colour;
            }

            this.setStrokeColour = function(colour)
            {
                this.context.strokeStyle = colour;
            }

            this.setStrokeWeight = function(weight)
            {
                if (typeof weight != 'number') {
                    throw "Stroke weight must be a number";
                }

                this.context.lineWidth = weight;
                return true;
            }

        // Text
            this.measureText = function(text)
            {
                return this.context.measureText(text).width;
            }

            this.setFont = function(font, size)
            {
                this.setFontFamily(font);
                this.setFontSize(size);
            }

            this.setFontFamily = function(font)
            {
                this.fontFamily = font;
            }

            this.setFontSize = function(size)
            {
                this.fontSize = size;
            }

            this.setTextAlignment = function(alignment)
            {
                switch (alignment) {
                    case "center":
                    case "left":
                    case "right":
                        this.context.textAlign = alignment;
                        break;

                    default:
                        throw alignment + " is not a valid text alignment";
                }
            }
    }
});
