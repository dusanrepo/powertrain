define(function()
{
	return function ImageManager()
	{
		this.list = [];
		this.loadedImages = [];
		this.totalLoaded = 0;
	    this.callback;

		// Setup
			this.loadImages = function(){
				var current;
				var count = this.list.length;

				for(current = 0; current < count; current++){
					this.loadImage(this.list[current]);
				}
			}

			this.loadImage = function(item){
				var image;

	            image = new Image();
				image.addEventListener("load", this.loadComplete.bind(this));
				image.id = item.id;
				image.src = item.src;

				this.loadedImages.push(image);
			}

			this.loadComplete = function(){
				this.totalLoaded++;

				if(this.totalLoaded >= this.list.length){
					this.callback();
				}

	            return false;
			}

	    // Input
	        this.addImage = function(id)
	        {
	            var item = {};
	            item.id = id;
	            item.src = "assets/themes/jlr/assets/img/note-camera/" + id + ".png";

	            this.list.push(item);
	            return true;
	        }

	        this.setCallback = function(callback)
	        {
	            if (typeof callback !== "function") {
	                throw "Callback must be a function";
	            }

	            this.callback = callback;
	            return true;
	        }

		// Output
			this.getImage = function(id){
				var current = 0;
				var count = this.loadedImages.length;

				for(current = 0; current < count; current++){
					if(this.loadedImages[current].id == id){
						return this.loadedImages[current];
					}
				}

				throw "Unable to load image " + id;
				return false;
			}
	}
});
