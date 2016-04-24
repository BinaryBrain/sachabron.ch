'use strict';

function getReadme(repo) {
	var username = 'BinaryBrain';
	var secrets = "?client_id=893e4578ea3d2ae682a6&client_secret=2295a08d3545182af494410a7a516cc36090bc13";
	var waitingRequests = 0; // Used to sync requests

	fetch('https://api.github.com/repos/' + username + '/' + repo + '/readme' + secrets, {
		mode: 'cors',
		headers: {
			Accept: 'application/vnd.github.html'
		}
	})  
	.then(function(response) {
		return response.text();
	})
	.then(function(data) {
		document.querySelector('#container').innerHTML = data;

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
	})
	.catch(function(error) {
		console.error('Request failed', error)
	})

	// convert relative URLs
	function convertURL(url, base) {
		if (!/^(?:[a-z]+:)?\/\//i.test(url)) {
			url = base + '/' + url
		}

		return url;
	}
}