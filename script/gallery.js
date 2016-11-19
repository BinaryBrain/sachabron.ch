var Gallery = {}

function initGallery() {
	Gallery = {
		isFullscreen: false,
		waitForFullscreen: false,
		fullscreenContainer: document.querySelector('#fullscreen-photo'),
		fullscreenPhoto:  document.querySelector('#fullscreen-current-photo'),
		prevBtn: document.querySelector('#fullscreen-photo .prev'),
		nextBtn: document.querySelector('#fullscreen-photo .next'),
		caption: document.querySelector('#fullscreen-photo figcaption'),
		close: document.querySelector('#fullscreen-photo .close'),
		thumbnails: document.querySelectorAll('#photos .thumbnail'),
		thumbnailsSrc: [],
		photosSrc: [],
		altTextes: [],
		currentIndex: 0,
		size: 0,
		hideCursorInterval: null,
	}

	;[].forEach.call(Gallery.thumbnails, function (thumb) {
		Gallery.thumbnailsSrc.push(thumb.src);
		Gallery.photosSrc.push(thumbToPhoto(thumb.src));
		Gallery.altTextes.push(thumb.alt);
		Gallery.size++;
	});

	addEvents();
}

function addEvents() {
	;[].forEach.call(Gallery.thumbnails, function (elem) {
		elem.addEventListener('click', function (event) {
			event.preventDefault();
			showPhoto(elem);
		})
	});

	document.addEventListener('fullscreenchange', function (event) {
		if (Gallery.isFullscreen && !Gallery.waitForFullscreen) {
			quitFullscreen();
		} else if (Gallery.waitForFullscreen) {
			Gallery.waitForFullscreen = false;
		}
	});

	document.addEventListener('webkitfullscreenchange', function (event) {
		if (Gallery.isFullscreen && !Gallery.waitForFullscreen) {
			quitFullscreen();
		} else if (Gallery.waitForFullscreen) {
			Gallery.waitForFullscreen = false;
		}
	});

	document.addEventListener('mozfullscreenchange', function (event) {
		if (Gallery.isFullscreen && !Gallery.waitForFullscreen) {
			quitFullscreen();
		} else if (Gallery.waitForFullscreen) {
			Gallery.waitForFullscreen = false;
		}
	});

	document.addEventListener('msfullscreenchange', function (event) {
		if (Gallery.isFullscreen && !Gallery.waitForFullscreen) {
			quitFullscreen();
		} else if (Gallery.waitForFullscreen) {
			Gallery.waitForFullscreen = false;
		}
	});

	document.addEventListener('keydown', function (event) {
		var key = event.which || event.keyCode || 0;
		if (key === 37) {
			prev();
		} else if (key === 39) {
			next();
		}
	})

	Gallery.prevBtn.addEventListener('click', function (event) {
		prev();
	});

	Gallery.nextBtn.addEventListener('click', function (event) {
		next();
	});

	Gallery.close.addEventListener('click', function (event) {
		quitFullscreen();
	});

	Gallery.fullscreenContainer.addEventListener("mousemove", showCursor);
}

function thumbToPhoto(path) {
	var parts = path.split('/');
	parts.splice(parts.length - 2, 1);
	return parts.join('/');
}

function showPhoto(img) {
	var newSource = thumbToPhoto(img.src);

	Gallery.fullscreenPhoto.src = newSource;
	document.querySelector('#fullscreen-photo figcaption').textContent = img.alt;

	Gallery.currentIndex = Gallery.thumbnailsSrc.indexOf(img.src);

	updateBtnDisplay();

	setFullscreen();
}

function setFullscreen() {
	Gallery.waitForFullscreen = true;
	Gallery.isFullscreen = true;
	Gallery.fullscreenContainer.style.display = "block";

	runPrefixMethod(Gallery.fullscreenContainer, "RequestFullScreen");

	showCursor();
}

function quitFullscreen() {
	Gallery.fullscreenContainer.style.display = "none";
	Gallery.isFullscreen = false;
	Gallery.waitForFullscreen = false;
	Gallery.fullscreenPhoto.src = "";

	runPrefixMethod(document, "ExitFullscreen");
	runPrefixMethod(document, "CancelFullScreen");
}

function prev() {
	if (Gallery.currentIndex <= 0) {
		return;
	}

	Gallery.fullscreenPhoto.src = Gallery.photosSrc[Gallery.currentIndex - 1];
	Gallery.currentIndex--;
	Gallery.caption.innerText = Gallery.altTextes[Gallery.currentIndex];

	updateBtnDisplay();
}

function next() {
	if (Gallery.currentIndex >= Gallery.size - 1) {
		return;
	}

	Gallery.fullscreenPhoto.src = Gallery.photosSrc[Gallery.currentIndex + 1];
	Gallery.currentIndex++;
	Gallery.caption.innerText = Gallery.altTextes[Gallery.currentIndex];

	updateBtnDisplay();
}

function updateBtnDisplay() {
	Gallery.prevBtn.style.display = (Gallery.currentIndex > 0) ? "block" : "none";
	Gallery.nextBtn.style.display = (Gallery.currentIndex < Gallery.size - 1) ? "block" : "none";
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

function hideCursor() {
	clearInterval(Gallery.hideCursorInterval);
	Gallery.fullscreenContainer.style.cursor = 'none';
}

function showCursor() {
	Gallery.fullscreenContainer.style.cursor = '';
	Gallery.lastMouseMove = (new Date()).getTime();

	clearInterval(Gallery.hideCursorInterval);
	Gallery.hideCursorInterval = setInterval(hideCursor, 1000);
}
