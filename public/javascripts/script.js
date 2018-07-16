function init_oauthio() {
	OAuth.initialize(credentials.key);
}

function retrieve_token(callback) {
	$.ajax({
		url: '/oauth/token',
		success: function(data, status) {
			console.log(" retreive token succes! token is " + data.token)
			callback(null, data.token);
		},
		error: function(data) {
			console.log("retreive token error :( data is ")
			console.log(data);
			callback(data);
		}
	});
}

function authenticate(token, callback) {
	console.log("token is " + token);
	OAuth.popup('foursquare', {
		state: token,
		// Google requires the following field 
		// to get a refresh token
		// authorize: {
		//     approval_prompt: 'force'
		// }
	})
		.done(function(r) {
			$.ajax({
				url: '/oauth/signin',
				method: 'POST',
				data: {
					code: r.code
				},
				success: function(data, status) {
					callback(null, data);
				},
				error: function(data) {
					callback(data);
				}
			});
		})
		.fail(function(e) {
			console.log(e);
		});
}

function retrieve_user_info(callback) {
	$.ajax({
		url: '/me',
		success: function (data, status) {
			callback(data);
		},
		error: function (data) {

		}
	});
}

$('#fs-button').click(function() {
	init_oauthio();
	retrieve_token(function(err, token) {
		authenticate(token, function(err) {
			if (!err) {
				retrieve_user_info(function(user_data) {
					$('#name_box').html(user_data.name)
					$('#email_box').html(user_data.email);
					$('#img_box').attr('src', user_data.avatar);
				});
			}
		});
	});
});
