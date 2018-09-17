requirejs.config({
    paths : {
        // the left side is the module ID,
        // the right side is the path to
        // the jQuery file, relative to baseUrl.
        // Also, the path should NOT include
        // the '.js' file extension. This example
        // is using jQuery 1.9.0 located at
        // js/lib/jquery-1.9.0.js, relative to
        // the HTML page.
        jquery : 'lib/jquery'
    }
});

requirejs(["DrawModule", "AudioModule", "PlayList", "jquery"], function(DrawModule, AudioModule, PlayListModule, jq) {
	console.log("Main | init | state = ", document.readyState);

	var canvas = document.getElementById("canvas");
	var arrow = document.getElementById("arrow");
	var container = document.getElementById("container");

	var core = new DrawModule(
		canvas,
		{
			vs : document.getElementById("main-vs"),
			fs : document.getElementById("main-fs")
		},
		{
			vs : document.getElementById("texture-vs"),
			fs : document.getElementById("texture-fs")
		}
	);
	core.init();

	try {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		var context = new AudioContext();

		var audio = new AudioModule(
			context,
			core.animate
		);
	} catch(e) {
		alert('Opps.. Your browser do not support audio API');
	}

	document.getElementById("input").addEventListener(
		'change',
		audio.setFile,
		false
	);

	// var PlayList = new PlayListModule();
	var playListUrl = "https://api.soundcloud.com/playlists/206905729?client_id=449395b3fd04617b4dae48a9e9ae1f78";

		jq.get(playListUrl, function(data) {
			if (DEBUG) console.log("PlayList.js | response : ", data);
		});

	function center() {
		var newWidth = window.innerWidth;

		canvas.style.left    = ( (newWidth < canvas.style.width)    ? 0 : ( (newWidth - canvas.width)    / 2) );
		container.style.left = ( (newWidth < container.style.width) ? 0 : ( (newWidth - container.width) / 2) );
		arrow.style.left     = ( (newWidth < arrow.style.width)     ? 0 : ( (newWidth - arrow.width)     / 2) );
	};

	window.onresize = center;

	var direction = true;
	arrow.addEventListener("click", function() {

		if (direction) {
			arrow.style.background = "url('img/arrow_down.png')";
			arrow.style.backgroundSize = "cover";

			arrow.style.top = 0;
			container.style.top = -30;
		} else {
			arrow.style.background = "url('img/arrow_up.png')";
			arrow.style.backgroundSize = "cover";

			arrow.style.top = 30;
			container.style.top = 0;
		}

		direction = !direction;
	});

	document.getElementById('volume').addEventListener('change', function() {
		audio.changeVolume(this.value);
	});

	document.getElementById("analyse").addEventListener('change', function() {
		audio.changeAnalyseMode(this.value == "frequency");
	});

	document.getElementById("drawType").addEventListener('change', function() {
		core.setDrawType(this.value);
	});

	center();
});