// window.addEventListener("hashchange", function () {
// 	onPageLoad();
// })

window.onload = function () {
	// alert(1); // FIXME makes terrain not

	onPageLoad();
}

function onPageLoad() {
	var parts = window.location.href.split("#!/");
	
	if (parts.length > 1) {
		var path = parts[1];
		var folders = path.split("/");

		if (folders.length === 1) {
			showPage(folders[0], false);
		} else {
			if (folders[0] === 'programs' || folders[0] === 'web') {
				showProject(folders[1], false);
			}
		}
	}
	
	;[].forEach.call(document.querySelectorAll('nav a'), (elem) => {
		elem.addEventListener('click', (event) => {
			event.preventDefault();
			glitch = true;

			var pageName = elem.getAttribute('href').substring(1);
			showPage(pageName);
		})
	})
};


function showPage(pageName, shouldChangeTerrain) {
	fetch('pages/' + pageName + '.html', { mode: 'cors' })  
	.then(function(response) {
		return response.text();
	})
	.then(function(text) {
		if (typeof shouldChangeTerrain !== 'undefined') {
			changeTerrain = shouldChangeTerrain;
		} else {
			changeTerrain = true;
		}

		history.pushState('rewrite', '', '#!/' + pageName);
		document.querySelector('#container').innerHTML = text;
		addSpans();
		addLinksEvents();
	})
	.catch(function(error) {
		console.error('Request failed', error);
	})
}

/**
  * This function will surround every single text node in the DOM with some <span class="text"></span>
  * The purpose is to be able to apply a nice background to the text without having a background on blocks.
  */
function addSpans() {
	var container = document.querySelector('#container');
	dfs(container.childNodes);

	function dfs(nodes) {
		for (var i = 0; i < nodes.length; i++) {
			// Type 3 is a Text Node
			if (nodes[i].nodeType === 3 && nodes[i].parentNode.tagName.toLowerCase() !== 'script') {
				var text = nodes[i].textContent;
				if (/\S/.test(text)) {
					var span = document.createElement("span");
					span.setAttribute('class', 'text');

					nodes[i].parentNode.replaceChild(span, nodes[i]);

					var newTextNode = document.createTextNode(text);
					span.appendChild(newTextNode);
				}
			} else {
				dfs(nodes[i].childNodes);
			}
		}
	}

	// Re-add script tags so they are eval
	var scripts = document.querySelectorAll('#container script');
	for (var i = 0; i < scripts.length; i++) {
		var newScript = document.createElement('script');
		var src = scripts[i].getAttribute('src');

		if (src && src != '') {
			newScript.src = scripts[i].src;
		} else {
			newScript.appendChild(scripts[i].childNodes[0]);
		}

		scripts[i].parentNode.removeChild(scripts[i]);

		container.appendChild(newScript);
	}
}

function isInline(elem) {
	var displayStyle;

	if (elem) {
		if (window.getComputedStyle) {
			displayStyle = window.getComputedStyle(elem, null).getPropertyValue('display');
		} else {
			displayStyle = elem.currentStyle.display;
		}
	}

	return displayStyle === "inline";
}