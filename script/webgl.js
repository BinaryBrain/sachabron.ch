var USE_COMPOSER = true;
var GLITCH_DURATION = 400;
var TERRAIN_DURATION = 800;


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 0);
document.body.appendChild(renderer.domElement);

// RGB Shift
var composer = new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene, camera));
var customShiftEffect = new THREE.ShaderPass(THREE.CustomColorShift);
customShiftEffect.uniforms['amount'].value = 0;

setShiftColor(74, 54, 140, 0.1, 'left');
setShiftColor(44, 170, 86, 1,'center');
setShiftColor(150, 47, 63, 0.1, 'right');

function setShiftColor(r, g, b, a, position) {
	customShiftEffect.uniforms[position + 'R'].value = r / 255;
	customShiftEffect.uniforms[position + 'G'].value = g / 255;
	customShiftEffect.uniforms[position + 'B'].value = b / 255;
	customShiftEffect.uniforms[position + 'A'].value = a;
}

customShiftEffect.renderToScreen = true;
composer.addPass(customShiftEffect);

var pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(70, -200, 500);
scene.add(pointLight);

var textGeometry, textMesh;

var mat = new THREE.MultiMaterial([
	new THREE.MeshPhongMaterial({ color: 0xbbbbbb, shading: THREE.FlatShading }), // front
	new THREE.MeshPhongMaterial({ color: 0xddbbee, shading: THREE.SmoothShading }) // side
]);

// Terrain
var terrain = new Terrain(2000, 6, 500, 10);
terrain.object.position.y = -300;
terrain.object.position.z = -1000;
terrain.object.rotation.x -= Math.PI/2;
scene.add(terrain.object);

// terrain.applyNewHeightMap();

camera.position.x = 0;
camera.position.y = -40;
camera.position.z = 200;

var loader = new THREE.FontLoader();
// loader.load('font/ostrich-sans-bold-regular.js', function (response) {
loader.load('font/geo-regular.js', function (response) {
	createText(response);
});

function createText(font) {
	textGeometry = new THREE.TextGeometry("Sacha Bron", {
		font: font,
		size: 300,
		height: 200
	});

	textMesh = new THREE.Mesh(textGeometry, mat);
	textMesh.geometry.center();
	textMesh.position.z = -3000;
	textMesh.position.y = 1500;
	textMesh.rotation.x = 0.41;

	if (USE_COMPOSER) {
		composer.render();
	}

	renderer.clear();
	renderer.render(scene, camera);

	scene.add(textMesh);

	// Trick to start the animation on page load
	setTimeout(function () {
		terrain.changeHeightMap(TERRAIN_DURATION * 1.5);
	}, 0);

	animate();
}

var changeTerrain = false;
var glitch = false;
var glitchTime;

function animate(timestamp) {

	requestAnimationFrame(animate);

	if (glitch) {
		glitchTime = timestamp;
		glitch = false;
		customShiftEffect.uniforms['angle'].value = Math.PI/2;
		customShiftEffect.uniforms['angle'].value = Math.random() * Math.PI * 2;
	}
	if (timestamp - glitchTime < GLITCH_DURATION) {
		// t: current time, b: begInnIng value, c: change In value, d: duration
		function ease (x, t, b, c, d) {
			return -c * ((t=t/d-1)*t*t*t - 1) + b;
		}

		var max = 0.08;
		customShiftEffect.uniforms['amount'].value = ease(0, timestamp - glitchTime, max, -max, GLITCH_DURATION);
		customShiftEffect.uniforms['angle'].value -= 0.2;
	} else {
		customShiftEffect.uniforms['amount'].value = 0;
	}
	
	if (changeTerrain) {
		console.log("CHANGE");
		changeTerrain = false;
		terrain.changeHeightMap(TERRAIN_DURATION);
	}
	
	terrain.animate(timestamp);

	// textMesh.rotation.x -= 0.0 * Math.PI;
	// textMesh.rotation.y -= 0.01 * Math.PI;
	// 
	// if (textMesh.rotation.y < -Math.PI / 2) {
	// 	textMesh.rotation.y = Math.PI / 2;
	// 	// glitch = true;
	// }

	terrain.object.rotation.z = Math.sin(timestamp / 10000) / 5;
	terrain.object.rotation.x = Math.pow(Math.sin(timestamp / 11000) / 2, 4) - Math.PI/2;

	if (USE_COMPOSER) {
		composer.render();
	} else {
		renderer.render(scene, camera);
	}
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
	
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	
	renderer.setSize(window.innerWidth, window.innerHeight);
	composer.setSize(window.innerWidth, window.innerHeight);

	if (USE_COMPOSER) {
		composer.render();
	} else {
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.render(scene, camera);
	}
}
