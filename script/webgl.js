var USE_COMPOSER = true;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 0);
document.body.appendChild(renderer.domElement);

// RGB Shift
var composer = new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene, camera));
var rgbShiftEffect = new THREE.ShaderPass(THREE.RGBShiftShader);
rgbShiftEffect.uniforms['amount'].value = 0.0001;
rgbShiftEffect.renderToScreen = true;
composer.addPass(rgbShiftEffect);

var pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(70, -200, 500);
scene.add(pointLight);

var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 1);
// scene.add(directionalLight);

var hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
// scene.add(hemiLight);

var textGeometry, textMesh;

var mat = new THREE.MultiMaterial([
	new THREE.MeshPhongMaterial({ color: 0xffffff, shading: THREE.FlatShading }), // front
	new THREE.MeshPhongMaterial({ color: 0xffffff, shading: THREE.SmoothShading }) // side
]);

// Terrain
var terrain = new Terrain(2000, 6, 500, 10);
terrain.object.position.y = -300;
terrain.object.position.z = -1000;
terrain.object.rotation.x -= Math.PI/2;
scene.add(terrain.object);

terrain.applyNewHeightMap();

camera.position.x = 0;
camera.position.y = -40;
camera.position.z = 200;

var loader = new THREE.FontLoader();
loader.load('font/ostrich-sans-bold-regular.js', function (response) {
	createText(response);
});

function createText(font) {
	textGeometry = new THREE.TextGeometry("Sacha Bron", {
		font: font,
		size: 20,
		height: 10
	});

	textMesh = new THREE.Mesh(textGeometry, mat);
	textMesh.geometry.center();

	if (USE_COMPOSER) {
		composer.render();
	}

	renderer.clear();
	renderer.render(scene, camera);

	scene.add(textMesh);

	animate();
}

var changeTerrain = false;
var glitch = false;
var glitchTime;

var glithDuration = 400;
var terrainDuration = 800;

function animate(timestamp) {
	requestAnimationFrame(animate);

	if (glitch) {
		glitchTime = timestamp;
		glitch = false;
	}
	if (timestamp - glitchTime < glithDuration) {
		// t: current time, b: begInnIng value, c: change In value, d: duration
		function ease (x, t, b, c, d) {
			return -c * ((t=t/d-1)*t*t*t - 1) + b;
		}

		rgbShiftEffect.uniforms['amount'].value = ease(0, timestamp - glitchTime, 0.05, -0.05, glithDuration);
		rgbShiftEffect.uniforms['angle'].value = Math.random() * Math.PI * 2;
	} else {
		if (Math.random() < 0.02) {
			// rgbShiftEffect.uniforms['amount'].value = Math.random() * 0.02;
			// rgbShiftEffect.uniforms['angle'].value = Math.random() * Math.PI * 2;
		} else {
			rgbShiftEffect.uniforms['amount'].value = 0;
		}
	}
	
	if (changeTerrain) {
		changeTerrain = false;
		terrain.changeHeightMap(terrainDuration);
	}
	
	terrain.animate(timestamp);

	// textMesh.rotation.x += 0.01 * Math.PI;
	//terrain.object.rotation.z += 0.01 * Math.PI;

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
