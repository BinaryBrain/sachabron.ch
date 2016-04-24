var Terrain = function (size, exp, initHeight, roughness) {
	this.object = new THREE.Group();
	this.size = size;
	this.nbNodes = Math.pow(2, exp) + 1;
	this.initHeight = initHeight;
	this.roughness = roughness;

	this.animation = {
		requestNewHeightMap: false,
		oldHeightMap: null,
		newHeightMap: null,
		startTime: 0,
		duration: 0,
		timestamp: 0,
	}

	var planeGeom = new THREE.PlaneGeometry(size, size, this.nbNodes - 1, this.nbNodes - 1);
	var planeMatWireframe = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide, wireframe: true });
	
	var planeMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })
	// var planeMat = new THREE.MeshPhongMaterial({ color: 0x111111, shading: THREE.FlatShading })
	// var planeMat = new THREE.MeshPhongMaterial({ color: 0x111111 })
	// var planeMat = new THREE.MeshLambertMaterial({ color: 0xffffff, fog: false })
	
	var planeMeshWireframe = new THREE.Mesh(planeGeom, planeMatWireframe);
	var planeMesh = new THREE.Mesh(planeGeom, planeMat);

	this.mesh = planeMesh;

	// Avoid wireframe to be inside the mask
	planeMeshWireframe.position.z = 2;
	planeMeshWireframe.position.y = -2;

	this.object.add(planeMesh);
	this.object.add(planeMeshWireframe);
}

Terrain.prototype.generateHeightMap = function () {
	var size = this.size;
	var nbNodes = this.nbNodes;
	var initHeight = this.initHeight;
	var roughness = this.roughness;

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

Terrain.prototype.applyNewHeightMap = function () {
	this.applyHeightMap(this.generateHeightMap());
}

Terrain.prototype.getHeightMap = function () {
	return this.mesh.geometry.vertices;
}

Terrain.prototype.applyHeightMap = function (heightMap) {
	delete this.mesh.geometry.__directGeometry;
	this.mesh.geometry.vertices = heightMap.slice();
	this.mesh.geometry.verticesNeedUpdate = true;
}

// Animation
Terrain.prototype.changeHeightMap = function(duration) {
	this.animation = {
		requestNewHeightMap: true,
		newHeightMap: this.generateHeightMap(),
		oldHeightMap: this.getHeightMap(),
		startTime: this.animation.timestamp,
		duration: duration,
	}
};

Terrain.prototype.changeHeightMapTick = function (timestamp, startTime, duration, startHeight, endHeight) {
	var currentHeight = [];
	var timeRatio = (timestamp - startTime) / (duration);

	if (timeRatio > 1) {
		this.animation.requestNewHeightMap = false;
		return;
	}

	for (var i = 0, len = startHeight.length; i < len; i++) {
		currentHeight[i] = {};
		currentHeight[i].z = endHeight[i].z * timeRatio + startHeight[i].z * (1 - timeRatio);
		currentHeight[i].x = endHeight[i].x * timeRatio + startHeight[i].x * (1 - timeRatio);
		currentHeight[i].y = endHeight[i].y * timeRatio + startHeight[i].y * (1 - timeRatio);
	}

	this.applyHeightMap(currentHeight);
}

Terrain.prototype.changeHeightMapEasingTick = function (timestamp, startTime, duration, startHeight, endHeight) {
	var currentHeight = [];
	var timeRatio = (timestamp - startTime) / (duration);

	// t: current time, b: begInnIng value, c: change In value, d: duration
	function ease (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	}

	if (timeRatio > 1) {
		this.animation.requestNewHeightMap = false;
		return;
	}

	for (var i = 0, len = startHeight.length; i < len; i++) {
		currentHeight[i] = {};
		currentHeight[i].z = ease(endHeight[i].z, timeRatio, startHeight[i].z, endHeight[i].z - startHeight[i].z, 1);
		currentHeight[i].x = ease(endHeight[i].x, timeRatio, startHeight[i].x, endHeight[i].x - startHeight[i].x, 1);
		currentHeight[i].y = ease(endHeight[i].y, timeRatio, startHeight[i].y, endHeight[i].y - startHeight[i].y, 1);
	}

	this.applyHeightMap(currentHeight);
}

Terrain.prototype.changeHeightMapSwipeTick = function (timestamp, startTime, duration, startHeight, endHeight) {
	var currentHeight = startHeight;
	var timeRatio = (timestamp - startTime) / (duration);

	if (timeRatio > 1) {
		this.applyHeightMap(endHeight);
		this.animation.requestNewHeightMap = false;
		return;
	}

	var side = Math.sqrt(startHeight.length);

	for (var i = 0, len = Math.ceil(side * timeRatio); i < len; i++) {
		for (var j = 0; j < side; j++) {
			currentHeight[i + side * j].z = endHeight[i + side * j].z;
			currentHeight[i + side * j].x = endHeight[i + side * j].x;
			currentHeight[i + side * j].y = endHeight[i + side * j].y;
		}
	}
	
	this.applyHeightMap(currentHeight);
}

Terrain.prototype.animate = function(timestamp) {
	this.animation.timestamp = timestamp;

	if (this.animation.requestNewHeightMap) {
		this.changeHeightMapEasingTick(timestamp, this.animation.startTime, this.animation.duration, this.animation.oldHeightMap, this.animation.newHeightMap);
	}
}

this.requestNewHeightMap = false;
this.newHeightMap = null;
