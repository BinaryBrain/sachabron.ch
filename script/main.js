window.onload = function () {
	onPageLoad();
}

function onPageLoad() {
	isHome = true;

	document.querySelector('.link.refresh').addEventListener('click', function (event) {
		event.preventDefault();
		glitch = true;
		changeTerrain = true;
	});

	initWebGL();
};

var app = new Vue({
	el: '#app',
	data: {
		message: 'Hello Vue!'
	}
})
