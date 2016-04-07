var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
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

var textGeometry, textMesh;

var mat = new THREE.MultiMaterial([
	new THREE.MeshPhongMaterial({ color: 0xffffff, shading: THREE.FlatShading }), // front
	new THREE.MeshPhongMaterial({ color: 0xffffff, shading: THREE.SmoothShading }) // side
]);

var terrain = new THREE.Group();

function generateTerrain() {
	var planeGeom = new THREE.PlaneGeometry(size, size, nbNodes - 1, nbNodes - 1);
	var planeMatWireframe = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide, wireframe: true });
	var planeMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })
	var planeMeshWireframe = new THREE.Mesh(planeGeom, planeMatWireframe);
	var planeMesh = new THREE.Mesh(planeGeom, planeMat);

	// Avoid wireframe to be inside the mask
	planeMeshWireframe.position.z = 2;
	planeMeshWireframe.position.y = -2;

	terrain.position.y = -300;
	terrain.position.z = -1000;
	terrain.rotation.x -= Math.PI/2;

	terrain.add(planeMesh);
	terrain.add(planeMeshWireframe);
	scene.add(terrain);

	return planeMesh;
}

function generateHeightMap() {
	var flatGeom = new THREE.PlaneGeometry(size, size, nbNodes - 1, nbNodes - 1);
	var terrainVertices = flatGeom.vertices;

	function setHeight(x, y, h) {
		terrainVertices[x + nbNodes * y].z = h;
	}

	function incrementXY(x, y, X, Y) {
		terrainVertices[x + nbNodes * y].x += X;
		terrainVertices[x + nbNodes * y].y += Y;
	}

	function getHeight(x, y) {
		return terrainVertices[x + nbNodes * y].z;
	}

	function divide(size) {
		var x, y, half = size / 2;
		var scale = roughness * size / nbNodes * 10;

		if (half < 1) {
			return;
		}

		for (var x = half; x < nbNodes; x += size) {
			for (var y = half; y < nbNodes - 1; y += size) {
				square(x, y, half, scale);
			}
		}

		for (var x = 0; x < nbNodes; x += half) {
			for (var y = (x + half) % size; y < nbNodes - 1; y += size) {
				diamond(x, y, half, scale);
			}
		}

		divide(size / 2);
	}

	function square(x, y, size, scale) {
		var sum = getHeight(x - size, y - size) +
				getHeight(x + size, y - size) +
				getHeight(x + size, y + size) +
				getHeight(x - size, y + size);

		var flatMid = Math.abs(x - nbNodes / 2) * 5 / nbNodes;
		var flatFront = (nbNodes - y) * 2 / nbNodes;
		var flatCenter = (flatMid * flatMid) + (flatFront * flatFront) + 1;

		var offset = (Math.random() * scale * 2 - scale) * flatCenter;
		// var offset = (Math.random() * scale * 2 - scale) * Math.pow(1.1, sum / 50);
		setHeight(x, y, sum / 4 + offset);
		var incX = Math.random() * Math.pow(1.3, sum / 200);
		var incY = Math.random() * Math.pow(1.3, sum / 200);
		incrementXY(x, y, incX, incY);
	}

	function diamond(x, y, size, scale) {
		function get(x, y) {
			if (x >= 0 && x < nbNodes && y >= 0 && y < nbNodes) {
				sum += getHeight(x, y);
				nb++;
			}
		}

		var sum = 0;
		var nb = 0;

		get(x, y - size);
		get(x + size, y);
		get(x, y + size);
		get(x - size, y);

		var flatMid = Math.abs(x - nbNodes / 2) * 5 / nbNodes;
		var flatFront = (nbNodes - y) * 2 / nbNodes;
		var flatCenter = (flatMid * flatMid) + (flatFront * flatFront) + 1;

		var offset = (Math.random() * scale * 2 - scale) * flatCenter;
		// var offset = (Math.random() * scale * 2 - scale) * Math.pow(1.1, sum / 50);
		setHeight(x, y, sum / nb + offset);
		var incX = Math.random() * Math.pow(1.3, sum / 200);
		var incY = Math.random() * Math.pow(1.3, sum / 200);
		incrementXY(x, y, incX, incY);
	}

	setHeight(0, 0, initHeight); // back left
	setHeight(nbNodes - 1, 0, initHeight); // back right
	setHeight(0, nbNodes - 1, 0); // front left
	setHeight(nbNodes - 1, nbNodes - 1, 0); // front right

	divide(nbNodes - 1);

	return terrainVertices;
}

function getHeightMap(planeMesh) {
	return planeMesh.geometry.vertices;
}

function applyHeightMap(planeMesh, heightMap) {
	delete planeMesh.geometry.__directGeometry;
	planeMesh.geometry.vertices = heightMap.slice();
	planeMesh.geometry.verticesNeedUpdate = true;
}

function changeHeightMap(timestamp, totalTime, startHeight, endHeight) {
	var currentHeight = [];

	for (var i = 0, len = startHeight.length; i < len; i++) {
		currentHeight[i] = {};
		currentHeight[i].z = endHeight[i].z * (timestamp / totalTime) + startHeight[i].z * (1 - (timestamp / totalTime));
		currentHeight[i].x = endHeight[i].x * (timestamp / totalTime) + startHeight[i].x * (1 - (timestamp / totalTime));
		currentHeight[i].y = endHeight[i].y * (timestamp / totalTime) + startHeight[i].y * (1 - (timestamp / totalTime));
	}

	applyHeightMap(planeMesh, currentHeight);
}

// Terrain params
var size = 2000;
var initHeight = 500;
var nbNodes = Math.pow(2, 6) + 1;
var roughness = 10;

var planeMesh = generateTerrain();
var heightMap = generateHeightMap();
applyHeightMap(planeMesh, heightMap);

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

	composer.render();
	renderer.clear();
	renderer.render(scene, camera);

	scene.add(textMesh);

	animate();
}

var doIt = true;
var f = 0;
var newHeightMap = generateHeightMap();
var oldHeightMap = getHeightMap(planeMesh);

function animate(timestamp) {
	requestAnimationFrame(animate);

	/*
	if (Math.random() < 0.02) {
		rgbShiftEffect.uniforms['amount'].value = Math.random() * 0.02;
		rgbShiftEffect.uniforms['angle'].value = Math.random() * Math.PI * 2;
	} else {
		rgbShiftEffect.uniforms['amount'].value = 0;
	}
	*/

	if (timestamp > 2000 && timestamp < 3000) {
		changeHeightMap(timestamp - 2000, 1000, oldHeightMap, newHeightMap);
	}

//	if (timestamp > 1000 && doIt) {
//		doIt = false;
//		var heightMap = generateHeightMap();
//		applyHeightMap(planeMesh, heightMap);
//	}

	// textMesh.rotation.x += 0.01 * Math.PI;
	// terrain.rotation.z += 0.01 * Math.PI;
	
	composer.render();
	//renderer.render(scene, camera);
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
	
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	
	renderer.setSize(window.innerWidth, window.innerHeight);
	composer.setSize(window.innerWidth, window.innerHeight);

	composer.render();
	// renderer.setSize(window.innerWidth, window.innerHeight);
	// renderer.render(scene, camera);
}
