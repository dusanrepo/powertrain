define(["core/js/lib/Device", "core/js/lib/MediaConstraint"], function(Device, MediaConstraint)
{
    return function DeviceManager()
    {
        var self = this;

        this.videoInputs = [];
        this.audioInputs = [];

        this.stream;

        this.constraints;
        this.activeVideoInput = null;
        this.activeAudioInput = null;
        this.ready = false;

        // Setup
            this.setup = function()
            {
                this.constraints = new MediaConstraint;
            }

            this.findDevices = function()
            {
                var findPromise;

                this.setReady(false);

                findPromise = new Promise(function(resolve, reject)
                {
                    navigator.mediaDevices.enumerateDevices()
                    .then(function(deviceList){
                        self.processDevices(deviceList);
                        self.setReady(true);
                        resolve(deviceList);
                    })
                    .catch(function(error){
                        self.setReady(false);
                        reject(error);
                    });
                });

                return findPromise;
            }

        // Input
            this.setInitialInputs = function(audio, video)
            {
                if (audio === false || this.audioInputs.length === 0) {
                    this.activeAudioInput = null;
                } else if (audio >= this.audioInputs.length) {
                    this.activeAudioInput = 0;
                } else {
                    this.activeAudioInput = audio;
                }

                if (video === false || this.videoInputs.length === 0) {
                    this.activeVideoInput = null;
                } else if (video >= this.videoInputs.length) {
                    this.activeVideoInput = 0;
                } else {
                    this.activeVideoInput = video;
                }

                if (this.activeVideoInput === null && this.activeAudioInput === null) {
                    throw "Unable to set initial inputs";
                }

                if (this.activeAudioInput !== null) {
                    this.constraints.setAudioDevice(this.audioInputs[this.activeAudioInput].getDeviceID());
                }

                if (this.activeVideoInput !== null) {
                    this.constraints.setVideoDevice(this.videoInputs[this.activeVideoInput].getDeviceID());
                }

                return true;
            }

        // Output
            this.getStream = function()
            {
                if (this.stream instanceof MediaStream) {
                    return this.stream;
                }

                return false;
            }

            this.getVideoInputCount = function()
            {
                return this.videoInputs.length;
            }

        // Devices
            this.nextVideoInput = function()
            {
                var exact = false;
                var video;

                var test = document.createElement("p");
                test.innerHTML = "Not safari"

                if (this.activeVideoInput < this.videoInputs.length - 1) {
                    this.activeVideoInput++;
                } else {
                    this.activeVideoInput = 0;
                }

                video = this.videoInputs[this.activeVideoInput];

                if (this.isBrowser("safari") === true) {
                    exact = true;
                    test.innerHTML = "safari";
                }

                this.constraints.setVideoDevice(video.getDeviceID(), exact);

                document.body.appendChild(test)
            }

            this.flagAllDevices = function(flag, list)
            {
                var current;
                var count;

                count = list.length;
                for (current = 0; current < count; current++) {
                    list[current].setPresent(flag);
                }

                return true;
            }

            this.removeMissingDevices = function(list)
            {
                var current;
                var count;

                count = list.length;
                for (current = 0; current < count; current++) {
                    if (list[current].isPresent() === false) {
                        list.splice(current, 1);
                        count--;
                        current--;
                    }
                }

                return true;
            }

        // Ready
            this.isReady = function()
            {
                return this.ready;
            }

            this.setReady = function(ready)
            {
                if (ready === true || ready === false) {
                    this.ready = ready;
                }
            }

        // Utility
            this.checkBrowserCompatability = function()
            {
                if (typeof navigator.mediaDevices !== "object") {
                    return false;
                }
            }

            this.findDevice = function(id, list)
            {
                var current;
                var count;

                count = list.length;
                for (current = 0; current < count; current++) {
                    if (list[current].getDeviceID() === id) {
                        list[current].setPresent(true);
                        return list[current];
                    }
                }

                return false;
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

            this.isStreaming = function()
            {
                if (this.stream instanceof MediaStream === true) {
                    return true;
                }

                return false;
            }

            this.processDevices = function(deviceList)
            {
                var current = 0;
                var count = deviceList.length;
                var device;

                this.flagAllDevices(false, this.audioInputs);
                this.flagAllDevices(false, this.videoInputs);

                for (current = 0; current < count; current++) {
                    device = new Device;
                    device.setup(deviceList[current]);

                    switch (device.getKind()) {
                        case "videoinput":
                            if (this.findDevice(device.getDeviceID(), this.videoInputs) === false) {
                                this.videoInputs.push(device);
                            }
                            break;

                        case "audioinput":
                            if (this.findDevice(device.getDeviceID(), this.audioInputs) === false) {
                                this.audioInputs.push(device);
                            }
                            break;
                    }
                }

                this.removeMissingDevices(this.audioInputs);
                this.removeMissingDevices(this.videoInputs);
            }

            this.startStream = function()
            {
                var constraints;
                var streamPromise;

                if (this.videoInputs.length === 0 && this.audioInputs.length === 0) {
                    throw "No audio or video devices to show";
                }

                constraints = this.constraints.getAsObject();

                streamPromise = new Promise(function(resolve, reject)
                {
                    navigator.mediaDevices.getUserMedia(constraints)
                    .then(function(stream){
                        self.stream = stream;
                        resolve(stream);
                    })
                    .catch(function(error){
                        reject(error);
                        throw(error)
                    });
                });

                return streamPromise;
            }

            this.stopStream = function()
            {
                var tracks;
                var current;
                var count;

                if (this.stream instanceof MediaStream === false) {
                    return false;
                }

                tracks = this.stream.getTracks();
                count = tracks.length;

                for (current = 0; current < count; current++) {
                    tracks[current].stop();
                }

                this.stream = null;

                return true;
            }
    }
});
