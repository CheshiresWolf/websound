define(function(require, exports, module) {
    
    require("jquery");

    function Utils() {
        var self = this;

        self.readTextFile = function(filePath) {
            var rawFile = new XMLHttpRequest();

            rawFile.open("GET", filePath, false);

            rawFile.onreadystatechange = function () {
                if(rawFile.readyState === 4) {
                    if(rawFile.status === 200 || rawFile.status == 0) {
                        var allText = rawFile.responseText;
                        console.log("text = ", allText);
                    }
                }
            }

            rawFile.send(null);
        }

        self.sendData = function(data) {
            $.ajax({
                url: "http://192.168.0.55:8888/",
                dataType: 'json',
                data: {"info": data},
                success: function() {
                    console.log("Sending done");
                }
            });
        }

        return self;
    }

    return Utils;
});