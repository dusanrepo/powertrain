define(function()
{
    return function Device()
    {
        this.deviceID;
        this.groupID;
        this.kind;
        this.label;
        this.present = false;

        // Setup
            this.setup = function(deviceInfo)
            {
                this.deviceID = deviceInfo.deviceId;
                this.groupID = deviceInfo.groupId;
                this.kind = deviceInfo.kind;
                this.label = deviceInfo.label;
                this.present = true;
            }

        // Input
            this.setPresent = function(present)
            {
                if (present === true) {
                    this.present = true;
                } else {
                    this.present = false;
                }

                return true;
            }

        // Output
            this.getDeviceID = function()
            {
                return this.deviceID;
            }

            this.getKind = function()
            {
                return this.kind;
            }

        // Utility
            this.isPresent = function()
            {
                return this.present;
            }
    }
});
