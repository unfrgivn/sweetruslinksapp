/**
 * Login view model
 */

var app = app || {};

app.Login = (function () {
    'use strict';

    var loginViewModel = (function () {
        
        var isInMistSimulator = (location.host.indexOf('icenium.com') > -1);
        
        var $loginUsername;
        var $loginPassword;
        var isFacebookLogin = (appSettings.facebook.appId !== '$FACEBOOK_APP_ID$' && appSettings.facebook.redirectUri !== '$FACEBOOK_REDIRECT_URI$');
        var isGoogleLogin = (appSettings.google.clientId !== '$GOOGLE_CLIENT_ID$' && appSettings.google.redirectUri !== '$GOOGLE_REDIRECT_URI$');
        var isAnalytics = analytics.isAnalytics();
        
        var init = function () {
            $loginUsername = $('#loginUsername');
            $loginPassword = $('#loginPassword');
            
            if (!isFacebookLogin) {
                $('#loginWithFacebook').addClass('disabled');
                console.log('Facebook App ID and/or Redirect URI not set. You cannot use Facebook login.');
            }
            if (!isGoogleLogin) {
                $('#loginWithGoogle').addClass('disabled');
                console.log('Google Client ID and/or Redirect URI not set. You cannot use Google login.');
            }
            if (!isAnalytics) {
                console.log('EQATEC product key is not set. You cannot use EQATEC Analytics service.');
            }
        };
        
        var show = function () {
            $loginUsername.val('');
            $loginPassword.val('');
        };
        
        var getYear = function () {
            var currentTime = new Date();
            return currentTime.getFullYear();
        };

        // Authenticate to use Everlive as a particular user
        var login = function () {
			app.mobileApp.showLoading();
            
            var username = $loginUsername.val();
            var password = $loginPassword.val();
			var guid = null;
               
            $.getJSON(appSettings.api.url + '/user/login?callback=?', { 
                username: username,
                md5pass: $.md5(password) 
            })
              .done(function(response) {
              		guid = response.data;
                  	window.localStorage.setItem("guid", guid);
              })
              .fail(function( jqxhr, textStatus, error ) {
                var err = textStatus + ", " + error;
                console.log( "Request Failed: " + err );
            }).then(function () {
                // EQATEC analytics monitor - track login type
                if (isAnalytics) {
                    analytics.TrackFeature('Login.Regular');
                }
                
                return app.Users.load();
            }).then(function () {
                app.mobileApp.hideLoading();
                app.mobileApp.navigate('views/linksView.html');
            })
            .then(null,
                  function (err) {
                      app.showError(err.message);
                  }
            );
            
            
/*                             
            // Authenticate using the username and password
            app.everlive.Users.login(username, password)
            .then(function () {
                // EQATEC analytics monitor - track login type
                if (isAnalytics) {
                    analytics.TrackFeature('Login.Regular');
                }
                
                return app.Users.load();
            })
            .then(function () {

                app.mobileApp.navigate('views/activitiesView.html');
            })
            .then(null,
                  function (err) {
                      app.showError(err.message);
                  }
            );*/
        };

        // Authenticate using Facebook credentials
        var loginWithFacebook = function() {
            var guid = null;
            
            if (!isFacebookLogin) {
                return;
            }
            if (isInMistSimulator) {
                showMistAlert();
                return;
            }
            var facebookConfig = {
                name: 'Facebook',
                loginMethodName: 'loginWithFacebook',
                endpoint: 'https://www.facebook.com/dialog/oauth',
                response_type: 'token',
                client_id: appSettings.facebook.appId,
                redirect_uri: appSettings.facebook.redirectUri,
                access_type: 'online',
                scope: 'email',
                display: 'touch'
            };
            var facebook = new IdentityProvider(facebookConfig);
            app.mobileApp.showLoading();
            
            facebook.getAccessToken(function(token) {
                 $.getJSON('https://graph.facebook.com/me?callback=?', { 
                    client_id: appSettings.facebook.appId,
                    access_token: token
                 }).fail(function( jqxhr, textStatus, error ) {
                
                 }).done(function(response){
                     var userId = response.id;
                     var username = response.username;
                     var email = response.email;
                     
                     $.getJSON('https://graph.facebook.com/' + username  + '/picture?type=square&redirect=false')
                     	.fail(function( jqxhr, textStatus, error ) {
                         
                     }).done(function(response){  
                         var avatar = !response.is_silhouette ? response.data.url : '';
                         $.getJSON(appSettings.api.url + '/user/login?callback=?', { 
                            'email': email,
                            'provider': 'facebook',
                            'identifier': userId,
                            'avatar': avatar
                        }).done(function(response) {
                          		guid = response.data;
                              	window.localStorage.setItem("guid", guid);
                          }).fail(function( jqxhr, textStatus, error ) {
                            	var err = 'Login Failed';
                         })
                         .then(function () {
                            // EQATEC analytics monitor - track login type
                            if (isAnalytics) {
                                analytics.TrackFeature('Login.Facebook');
                            }
                             
                            return app.Users.load();
                        })
                        .then(function () {
                            app.mobileApp.hideLoading();
                            app.mobileApp.navigate('views/linksView.html');
                        })
                        .then(null, function (err) {
                            app.mobileApp.hideLoading();
                            if (err.code == 214) {
                                app.showError('The specified identity provider is not enabled in the backend portal.');
                            } else {
                                app.showError(err.message);
                            }
                        });
                     });
                 });
        	});
        };
        
        var loginWithGoogle = function () {
            var guid = null;
            
            if (!isGoogleLogin) {
                return;
            }
            if (isInMistSimulator) {
                showMistAlert();
                return;
            }
            var googleConfig = {
                name: 'Google',
                loginMethodName: 'loginWithGoogle',
                endpoint: 'https://accounts.google.com/o/oauth2/auth',
                response_type: 'code',
                client_id: appSettings.google.clientId,
                redirect_uri: appSettings.google.redirectUri,
                scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                access_type: 'online',
                display: 'touch'
            };
            var google = new IdentityProvider(googleConfig);
            app.mobileApp.showLoading();
            
            google.getAccessToken(function(code) {
                $.post('https://accounts.google.com/o/oauth2/token', { 
                    code: code,
                    client_id: appSettings.google.clientId,
                    client_secret: appSettings.google.clientSecret,
                    redirect_uri: 'http://localhost',
                    grant_type: 'authorization_code'
                }).fail(function( jqxhr, textStatus, error ) {
                    var err = 'Login Failed';
                }).done(function(response){
                    var token = response.access_token;
                    
                    $.ajax({
                        url: "https://www.googleapis.com/oauth2/v2/userinfo",
                        dataType: 'json',
                        headers: {"Authorization": "Bearer " + token}
                    })           
                    .done(function (data) {
                        $.getJSON(appSettings.api.url + '/user/login?callback=?', { 
                            'email': data.email,
                            'provider': 'google',
                            'identifier': data.id,
                            'avatar': data.picture
                        }).done(function(response) {
                            guid = response.data;
                            window.localStorage.setItem("guid", guid);
                        }).fail(function( jqxhr, textStatus, error ) {
                            var err = 'Login Failed';
                        })
                        .then(function () {
                            // EQATEC analytics monitor - track login type
                            if (isAnalytics) {
                                analytics.TrackFeature('Login.Google');
                            }
                            
                            return app.Users.load();
                        })
                        .then(function () {
                            app.mobileApp.hideLoading();
                            app.mobileApp.navigate('views/linksView.html');
                        })
                        .then(null, function (err) {
                            app.mobileApp.hideLoading();
                            if (err.code == 214) {
                                app.showError('The specified identity provider is not enabled in the backend portal.');
                            } else {
                                app.showError(err.message);
                            }
                        });
                    })
                    .fail(function (jqXHR, textStatus) {
                        var err = 'Login Failed';
                    });
               });               
        	});
        };
        
        var showMistAlert = function () {
            alert(appSettings.messages.mistSimulatorAlert);
        };

        return {
            init: init,
            show: show,
            getYear: getYear,
            login: login,
            loginWithFacebook: loginWithFacebook,
            loginWithGoogle: loginWithGoogle
        };

    }());

    return loginViewModel;

}());
