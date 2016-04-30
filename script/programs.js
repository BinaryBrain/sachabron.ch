[].forEach.call(document.querySelectorAll('#programs a.project-link'), (elem) => {
	elem.addEventListener('click', (event) => {
		event.preventDefault();
		glitch = true;

		var pageName = elem.getAttribute('href').substring(1);
		history.replaceState('rewrite', '', '#!/programs/' + pageName);

		showProject(pageName);
	})
})

function showProject(name) {
	getReadme(name, function (html) {
		changeTerrain = true;

		document.querySelector('#container').innerHTML = html;

		var srcs = document.querySelectorAll('#container [src]');
		for (var i = 0; i < srcs.length; i++) {
			var url = srcs[i].getAttribute('src');
			url = convertURL(url, 'https://raw.githubusercontent.com/BinaryBrain/Hz/master');
			srcs[i].setAttribute('src', url);
		}

		var hrefs = document.querySelectorAll('#container [href]');
		for (var i = 0; i < hrefs.length; i++) {
			var url = hrefs[i].getAttribute('href');
			url = convertURL(url, 'https://raw.githubusercontent.com/BinaryBrain/Hz/master');
			hrefs[i].setAttribute('href', url);
		}

		addSpans();

		// convert relative URLs
		function convertURL(url, base) {
			if (!/^(?:[a-z]+:)?\/\//i.test(url)) {
				url = base + '/' + url
			}

			return url;
		}
	})
}