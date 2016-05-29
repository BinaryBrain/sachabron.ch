var fadeOutText = false
var changeTerrain = false;
var glitch = false;

function initWebGL() {
	var USE_COMPOSER = true;
	var GLITCH_DURATION = 400;
	var TERRAIN_DURATION = 800;

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);

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
	var terrain = new Terrain(2000, 5, 500, 10);
	terrain.object.position.y = -300;
	terrain.object.position.z = -1000;
	terrain.object.rotation.x -= Math.PI/2;
	scene.add(terrain.object);

	// terrain.applyNewHeightMap();

	var loader = new THREE.FontLoader();
	// loader.load('font/ostrich-sans-bold-regular.js', function (response) {
	loader.load('font/geo-regular.js', function (response) {
		createText(response);
	});

	function createText(font) {
		textGeometry = new THREE.TextGeometry("Sacha Bron", {
			font: font,
			size: 200,
			height: 120
		});

		textMesh = new THREE.Mesh(textGeometry, mat);
		textMesh.geometry.center();
		textMesh.position.z = -2000;
		textMesh.position.y = 800;
		textMesh.rotation.x = 0;

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
			changeTerrain = false;
			terrain.changeHeightMap(TERRAIN_DURATION);
		}

		terrain.animate(timestamp);
		fadeOutTextAnimate(timestamp);

		var cameraAngleX = Math.pow(Math.sin(timestamp / 11000) / 2, 4) - 0.1;
		var cameraAngleY = Math.sin(timestamp / 10000) / 5;
		var radius = 700;

		camera.rotation.x = cameraAngleX;
		camera.rotation.y = cameraAngleY;

		camera.position.x = radius * Math.cos(cameraAngleX) * Math.sin(cameraAngleY);
		camera.position.y = -radius * Math.sin(cameraAngleX) + 100;
		camera.position.z = radius * Math.cos(cameraAngleX) * Math.cos(cameraAngleY) - 200;

		if (USE_COMPOSER) {
			composer.render();
		} else {
			renderer.render(scene, camera);
		}
	}

	function fadeOutTextAnimate(timestamp) {
		if (fadeOutText) {
			textMesh.position.z -= 100;
			textMesh.position.y *= 1.05;
			textMesh.rotation.x += 0.2;
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
}