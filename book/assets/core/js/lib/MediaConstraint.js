define(function()
{
    return function MediaConstraint()
    {
        this.audio = false;
        this.video = false;

        // Setup

        // Input
            this.setAudioDevice = function(deviceID, exact)
            {
                if (typeof this.audio !== "object") {
                    this.audio = {};
                }

                if (exact === true) {
                    if (typeof this.audio.deviceId !== "object") {
                        this.audio.deviceId = {};
                    }

                    this.audio.deviceId.exact = deviceID;
                } else {
                    this.audio.deviceId = deviceID;
                }
            }

            this.setVideoDevice = function(deviceID, exact)
            {
                if (typeof this.video !== "object") {
                    this.video = {};
                }

                if (exact === true) {
                    if (typeof this.video.deviceId !== "object") {
                        this.video.deviceId = {};
                    }

                    this.video.deviceId.exact = deviceID;
                } else {
                    this.video.deviceId = deviceID;
                }
            }

        // Output
            this.getAsObject = function()
            {
                var object = {};

                object.audio = this.audio;
                object.video = this.video;

                return object;
            }

            this.getAudioObject = function()
            {
                return this.audio;
            }

            this.getVideoObject = function()
            {
                return this.video;
            }

        // Utility
    }
});
