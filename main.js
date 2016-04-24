document.addEventListener("load", function () {
	addSpans()
});

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
			if (nodes[i].nodeType === 3) {
				var text = nodes[i].textContent;

				var span = document.createElement("span");
				span.setAttribute('class', 'text');

				nodes[i].parentNode.replaceChild(span, nodes[i]);

				var newTextNode = document.createTextNode(text);
				span.appendChild(newTextNode);
			} else {
				dfs(nodes[i].childNodes)
			}
		}
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