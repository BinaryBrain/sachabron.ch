/*
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
*/

Vue.use(VueRouter)

var Foo = { template: '<div>foo</div>' }
var Bar = { template: '<div>bar</div>' }

var routes = [
	{ path: '/foo', component: Foo },
	{ path: '/bar', component: Bar }
]

var router = new VueRouter({
	routes
})

var app = new Vue({
	router,
	el: '#app',
	data: {
		message: 'Hello Vue!'
	},
	mounted: function () {
		console.log(123);
		initWebGL();
	}
})
