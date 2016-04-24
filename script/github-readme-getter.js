'use strict';

function getReadme(repo, callback) {
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
		callback(data);
	})
	.catch(function(error) {
		console.error('Request failed', error)
	})
}
