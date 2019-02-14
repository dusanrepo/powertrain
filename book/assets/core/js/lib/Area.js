define(function()
{
    return function Area()
    {
        this.source;

        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;

        this.minimumWidth = 0;
        this.minimumHeight = 0;

        //Input
            this.adjustArea = function(x, y , width, height)
            {
                if (typeof x !== 'number') {
                    x = 0;
                }

                if (typeof y !== 'number') {
                    y = 0;
                }

                if (typeof width !== 'number') {
                    width = 0;
                }

                if (typeof height !== 'number') {
                    height = 0;
                }

                if (this.width + width < this.minimumWidth) {
                    width = this.minimumWidth;
                }

                if (this.height + height < this.minimumHeight) {
                    height = this.minimumHeight;
                }

                this.x += x;
                this.y += y;
                this.width += width;
                this.height += height;
            }

            this.adjustPosition = function(x, y)
            {
                var bounds;
                var maxX
                var maxY

                bounds = this.source.getBounds();

                x = this.x + x;
                y = this.y + y;
                maxX = bounds.width - this.width;
                maxY = bounds.height - this.height;

                if (x < 0) {
                    x = 0;
                } else if (x > maxX) {
                    x = maxX;
                }

                if (y < 0) {
                    y = 0;
                } else if (y > maxY) {
                    y = maxY;
                }

                this.setArea(x, y);
            }

            this.setArea = function(x, y, width, height)
            {
                if (typeof x !== 'number') {
                    x = this.x;
                }

                if (typeof y !== 'number') {
                    y = this.x;
                }

                if (typeof width !== 'number') {
                    width = this.width;
                }

                if (typeof height !== 'number') {
                    height = this.height;
                }

                if (width < this.minimumWidth) {
                    width = this.minimumWidth;
                }

                if (height < this.minimumHeight) {
                    height = this.minimumHeight;
                }

                this.x = parseInt(x);
                this.y = parseInt(y);
                this.width = parseInt(width);
                this.height = parseInt(height);
            }

            this.setCornerToPosition = function(x, y, corner)
            {
                var heightOffset = 0;
                var widthOffset = 0;
                var position = {
                    x : this.x,
                    y : this.y,
                    height : this.height,
                    width : this.width
                };

                if (x < this.x) {
                    widthOffset = this.width + (this.x - x);
                } else {
                    widthOffset = this.width - (x - this.x);
                }

                if (y < this.y) {
                    heightOffset = this.height + (this.y - y);
                } else {
                    heightOffset = this.height - (y - this.y);
                }

                switch (corner) {
                    case "bl":
                        position.x = x;
                        position.height = y - this.y;
                        position.width = widthOffset;

                        if (position.width < this.minimumWidth) {
                            position.x = this.x + (this.width - this.minimumWidth);
                        }

                        break;

                    case "br":
                        position.height = y - this.y;
                        position.width = x - this.x;
                        break;

                    case "tl":
                        position.x = x;
                        position.y = y;
                        position.height = heightOffset;
                        position.width = widthOffset;

                        if (position.width < this.minimumWidth) {
                            position.x = this.x + (this.width - this.minimumWidth);
                        }

                        if (position.height <= this.minimumHeight) {
                            position.y = this.y + (this.height - this.minimumHeight);
                        }

                        break;

                    case "tr":
                        position.y = y;
                        position.width = x - this.x;
                        position.height = heightOffset;

                        if (position.height <= this.minimumHeight) {
                            position.y = this.y + (this.height - this.minimumHeight);
                        }

                        break;

                    default:
                        throw corner + " is not a valid corner designation";
                }

                this.setArea(position.x, position.y, position.width, position.height);
                return true;
            }

            this.setMinimumDimensions = function(width, height)
            {
                if (width < 0) {
                    return false;
                }

                if (height < 0) {
                    return false;
                }

                this.minimumWidth = width;
                this.minimumHeight = height;
            }

            this.setSource = function(source)
            {
                this.source = source;
            }

        //Output
            this.getDimensionsAsObject = function()
            {
                var object = {};

                object.x = this.x;
                object.y = this.y;
                object.width = this.width;
                object.height = this.height;

                object.top = this.y;
                object.right = this.x + this.width;
                object.bottom = this.y + this.height;
                object.left = this.x;

                object.centerX = this.width / 2;
                object.centerY = this.height / 2;

                return object;
            }

            this.getOrientation = function()
            {
                if (this.width > this.height) {
                    return 'landscape';
                }

                if (this.width < this.height) {
                    return 'portrait';
                }

                return 'square';
            }

        // Utility
            this.calculateBoundsDifferences = function()
            {
                var bounds = {};

                bounds.top = this.y;
                bounds.right = this.x + this.width - this.source.getWidth();
                bounds.bottom = this.y + this.height - this.source.getHeight();
                bounds.left = this.x;

                return bounds;
            }

            this.calculateIdeal = function(dimension, ratio)
            {
                return dimension / ratio;
            }

            this.calculateLetterboxAdjustment = function(leadingDifference, trailingDifference, offset)
            {
                var adjustment = 0;

                leadingDifference = Math.abs(leadingDifference);
                adjustment = Math.abs((leadingDifference - trailingDifference) / 2);

                if (offset > 0) {
                    adjustment += offset;
                }

                if (leadingDifference < trailingDifference) {
                    adjustment = -adjustment;
                }

                return adjustment;
            }

            this.calculateScaleMultipliers = function(source, target)
            {
                var scale = {};

                source = source.getDimensionsAsObject();
                target = target.getDimensionsAsObject();

                scale.width = target.width / source.width;
                scale.height = target.height / source.height;

                return scale;
            }

            this.calculateShiftAdjustment = function(leadingDifference, trailingDifference)
            {
                var adjustment = 0;

                if (leadingDifference < 0) {
                    adjustment = Math.abs(leadingDifference);
                }

                if (trailingDifference > 0) {
                    adjustment = -trailingDifference;
                }

                return adjustment;
            }

            this.centreToSource = function()
            {
                var source = this.source.getDimensionsAsObject();
                var widthOffset = (this.width - source.width) / 2;
                var heightOffset = (this.height - source.height) / 2;

                if (widthOffset > 0) {
                    widthOffset = -widthOffset;
                }

                if (heightOffset > 0) {
                    heightOffset = -heightOffset;
                }

                this.x = widthOffset;
                this.y = heightOffset;
            }

            this.compareOrientation = function(destination)
            {
                var areaOrientation;
                var destinationOrientation;

                areaOrientation = this.getOrientation();
                destinationOrientation = destination.getOrientation();

                if (areaOrientation == 'portrait'
                || (destinationOrientation == 'landscape' && areaOrientation == 'square')) {
                    return 'width';
                }

                if (areaOrientation == 'landscape'
                || (destinationOrientation == 'portrait' && areaOrientation == 'square')) {
                    return 'height';
                }

                return 'none';
            }

            this.fitAreaToSource = function()
            {
                var source;
                var bounds;
                var x = 0;
                var y = 0;

                source = this.source.getDimensionsAsObject();
                bounds = this.calculateBoundsDifferences();

                if (this.width > source.width && this.height > source.height){
                    this.scaleToSource();
                    this.centreToSource();
                    return true;
                }

                if (bounds.left < 0 || bounds.right > 0) {
                    if (this.width > source.width) {
                        x = this.calculateLetterboxAdjustment(bounds.left, bounds.right, this.x);

                    } else {
                        x = this.calculateShiftAdjustment(bounds.left, bounds.right);
                    }
                }

                if (bounds.top < 0 || bounds.bottom > 0) {
                    if (this.height > source.height) {
                        y = this.calculateLetterboxAdjustment(bounds.top, bounds.bottom, this.y);

                    } else {
                        y = this.calculateShiftAdjustment(bounds.top, bounds.bottom);
                    }
                }

                this.adjustArea(x, y);
                return true;
            }

            this.isWithinBounds = function(x, y, width, height)
            {
                var bounds = this.source.getDimensionsAsObject();

                if (typeof x !== 'number') {
                    x = this.x;
                    y = this.y;
                    width = this.width;
                    height = this.height;
                } else {
                    x = this.x + x;
                    y = this.y + y;
                    width = this.width + width;
                    height = this.height + height;
                }

                if (x < 0) {
                    return false;
                }

                if (y < 0) {
                    return false;
                }

                if (x + width > bounds.width) {
                    return false;
                }

                if (y + height > bounds.height) {
                    return false;
                }

                return true;
            }

            this.matchRatio = function(destination, orientation)
            {
                var ratio;
                var ideal;

                ratio = destination.getRatio();

                if (orientation != "width" && orientation != "height") {
                    orientation = this.compareOrientation(destination);
                }

                switch (orientation) {
                    case 'width':
                        ideal = this.calculateIdeal(this.height, ratio.height);

                        if (ideal < this.width) {
                            return this.matchRatio(destination, "height");
                        }

                        this.x -= (ideal - this.width) / 2;
                        this.width = ideal;
                        break;

                    case 'height':
                        ideal = this.calculateIdeal(this.width, ratio.width);

                        if (ideal < this.height) {
                            return this.matchRatio(destination, "width");
                        }

                        this.y -= (ideal - this.height) / 2;
                        this.height = ideal;
                        break;
                }

                return true;
            }

            this.applyRatio = function(side, adjacent, ratio)
            {
                ideal = this.calculateIdeal(adjacent, ratio);

                if (ideal < side) {
                    return false
                }

                this.x -= (ideal - side) / 2;
                side = ideal;
            }

            this.rotate = function(angle)
            {
                if (angle !== 90 && angle !== -90) {
                    throw "Rotation angle must be +/- 90 degrees";
                }

                var bounds;
                var dimensions;
                var width;

                bounds = this.source.getDimensionsAsObject();
                dimensions = this.getDimensionsAsObject();

                switch (angle) {
                    case 90:
                        this.x = bounds.width - dimensions.y - dimensions.height;
                        this.y = dimensions.x;
                        break;

                    case -90:
                        this.x = dimensions.y;
                        this.y = bounds.height - dimensions.x - dimensions.width;
                        break;
                }

                width = this.width;
                this.width = this.height;
                this.height = width;

                return true;
            }

            this.scale = function(scales)
            {
                this.x *= scales.width;
                this.y *= scales.height;
                this.width *= scales.width;
                this.height *= scales.height;
            }

            this.scaleToSource = function()
            {
                var scales = this.calculateScaleMultipliers(this, this.source);
                this.scale(scales);
            }

            this.scaleToDestination = function(destination)
            {
                var scales = this.calculateScaleMultipliers(this.source, destination);
                this.setSource(destination);
                this.scale(scales);
            }
    }
});
