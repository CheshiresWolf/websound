define(function(require, exports, module) {

	var Base64Module = require("lib/Base64Binary");
	//var base64Binary = new Base64Module();

	function Audio(context, redraw) {
		var self = this;

		var analyser, gainNode;
		var frequencyData;

		var mode = true, volume = 0.5;

		self.buffer = [];

		self.play = function() {
			var source = context.createBufferSource();
			source.buffer = self.buffer;

			analyser = context.createAnalyser();
			analyser.fftSize = 64;

			frequencyData = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(frequencyData);

			var destination = context.destination;
			gainNode = context.createGain();

			source.connect(analyser);
			analyser.connect(gainNode);
			gainNode.connect(destination);
			// воспроизводим
			source.start(0);

			tick();
		};

		function loadSoundFile(value) {
            context.decodeAudioData(value, function(decodedArrayBuffer) {
              	self.buffer = decodedArrayBuffer;
            	self.play();
            }, function(e) {
              	console.log('Error decoding file');
            });
        };

        function tick() {
            requestAnimFrame(tick);

            gainNode.gain.value = volume;

            if (mode) {
            	analyser.getByteFrequencyData(frequencyData);
            } else {
            	analyser.getByteTimeDomainData(frequencyData);
            }

            redraw(frequencyData);
        }

		self.setFile = function(e) {
			var reader = new FileReader();

			reader.onload = function(e) {
				loadSoundFile(this.result);
			};

			console.log("File choosed = ", this.files[0]);

			reader.readAsArrayBuffer(this.files[0]);
		};

		self.setBase64 = function(data) {
			loadSoundFile(Base64Module.decodeArrayBuffer(data));
		};

		self.changeVolume = function(value) {
			volume = value;
		};

		self.changeAnalyseMode = function(value) {
			mode = value;
		};

		return self;
	}

	return Audio;
});