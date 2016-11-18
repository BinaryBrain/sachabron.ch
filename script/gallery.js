var isFullscreen = false;

document.addEventListener("fullscreenchange", function (event) {
	if (isFullscreen) {
		quitFullscreen();
	} else {
		isFullscreen = true;
	}
});

document.addEventListener("webkitfullscreenchange", function (event) {
	if (isFullscreen) {
		quitFullscreen();
	} else {
		isFullscreen = true;
	}
});

document.addEventListener("mozfullscreenchange", function (event) {
	if (isFullscreen) {
		quitFullscreen();
	} else {
		isFullscreen = true;
	}
});

document.addEventListener("msfullscreenchange", function (event) {
	if (isFullscreen) {
		quitFullscreen();
	} else {
		isFullscreen = true;
	}
});

function addThumbnailsEvents() {
	;[].forEach.call(document.querySelectorAll('#photos .thumbnail'), function (elem) {
		elem.addEventListener('click', function (event) {
			event.preventDefault();
			showPhoto(elem);
		})
	})
}

function showPhoto(name) {
	var parts = name.src.split('/');
	parts.splice(parts.length - 2, 1);
	var newSource = parts.join('/');

	document.querySelector('#fullscreen-current-photo').src = newSource;

	// TODO set photo

	setFullscreen();
}

function setFullscreen() {
	FULLSCREEN_PHOTO_ELEM.style.display = "block";
	
	runPrefixMethod(FULLSCREEN_PHOTO_ELEM, "RequestFullScreen");
}

function quitFullscreen() {
	console.log("quitFullscreen", isFullscreen)
	FULLSCREEN_PHOTO_ELEM.style.display = "none";

	isFullscreen = false;

	document.querySelector('#fullscreen-current-photo').src = "";
}

function runPrefixMethod(obj, method) {
	var pfx = ["webkit", "moz", "ms", "o", ""];

	var p = 0, m, t;
	while (p < pfx.length && !obj[m]) {
		m = method;
		if (pfx[p] == "") {
			m = m.substr(0,1).toLowerCase() + m.substr(1);
		}
		m = pfx[p] + m;
		t = typeof obj[m];
		if (t != "undefined") {
			pfx = [pfx[p]];
			return (t == "function" ? obj[m]() : obj[m]);
		}
		p++;
	}
}
