/**
 * @author felixturner / http://airtight.cc/
 *
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 */

THREE.CustomColorShift = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"amount":   { type: "f", value: 0.005 },
		"angle":    { type: "f", value: 0.0 },

		"leftR":    { type: "f", value: 1.0 },
		"leftG":    { type: "f", value: 0.0 },
		"leftB":    { type: "f", value: 0.0 },
		"leftA":    { type: "f", value: 0.0 },

		"centerR":  { type: "f", value: 0.0 },
		"centerG":  { type: "f", value: 1.0 },
		"centerB":  { type: "f", value: 0.0 },
		"centerA":  { type: "f", value: 1.0 },

		"rightR":   { type: "f", value: 0.0 },
		"rightG":   { type: "f", value: 0.0 },
		"rightB":   { type: "f", value: 1.0 },
		"rightA":   { type: "f", value: 0.0 },

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float amount;",
		"uniform float angle;",

		"uniform float leftR;",
		"uniform float leftG;",
		"uniform float leftB;",
		"uniform float leftA;",

		"uniform float centerR;",
		"uniform float centerG;",
		"uniform float centerB;",
		"uniform float centerA;",

		"uniform float rightR;",
		"uniform float rightG;",
		"uniform float rightB;",
		"uniform float rightA;",

		"varying vec2 vUv;",

		"void main() {",
			"if (amount < 0.003) {",
				"gl_FragColor = texture2D(tDiffuse, vUv);",
			"} else {",
				//"vec2 offset = 0.1 * vec2( cos(0.0), sin(0.0));",
				"vec2 offset = amount * vec2( cos(angle), sin(angle));",
				"vec4 cLeft = texture2D(tDiffuse, vUv + offset);",
				"vec4 cCenter = texture2D(tDiffuse, vUv);",
				"vec4 cRight = texture2D(tDiffuse, vUv - offset);",

				"float red   = cRight.r * rightR + cLeft.r * leftR + cCenter.r * centerR;",
				"float green = cRight.g * rightG + cLeft.g * leftG + cCenter.g * centerG;",
				"float blue  = cRight.b * rightB + cLeft.b * leftB + cCenter.b * centerB;",
				"float alpha = cRight.a * rightA + cLeft.a * leftA + cCenter.a * centerA;",
				
				"gl_FragColor = vec4(red, green, blue, alpha);",
			"}",
		"}"

	].join( "\n" )

};
