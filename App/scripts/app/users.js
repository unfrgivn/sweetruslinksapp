/**
 * Users model
 */
var app = app || {};

app.Users = (function () {
    'use strict';
    
  
    /*
    var usersModel = (function () {
        
        var currentUser = kendo.observable({ data: null });
        var usersData;
        
        // Retrieve current user and all users data from Everlive
        var loadUsers = function () {
            
            //alert(window.localStorage.getItem("guid"));
            
            // Get the data about the currently logged in user
            return app.everlive.Users.currentUser()
            .then(function (data) {
                var currentUserData = data.result;
                //currentUserData.PictureUrl = app.helper.resolveProfilePictureUrl(currentUserData.Picture);
                //currentUser.set('data', currentUserData);
                
                // Get the data about all registered users
                return app.everlive.Users.get();
            })
            .then(function (data) {
                
                usersData = new kendo.data.ObservableArray(data.result);
            })
            .then(null,
                  function (err) {
                      app.showError(err.message);
                  }
            );
        };
        
        return {
            load: loadUsers,
            users: function () {
                return usersData;
            },
            currentUser: currentUser
        };
        
    }());*/
    
    var usersModel = (function () {
        var currentUser;
        var usersData;
        
        // Retrieve current user and all users data from API
        var loadUsers = function () {
            
            var usersDataSource = new kendo.data.DataSource({
                 transport: {
                     read: {
                         url: appSettings.api.url + '/user/search',
                         dataType: "jsonp",
                         data: {
                             guid: window.localStorage.getItem("guid"),
                             srlkey: appSettings.api.srlKey,
                         }
                     }
                 },
                schema: {
                    data: function(response) {
                       	currentUser = response.data.current_user;
                        return response.data.users;
                    }     
                }
            });
            
            usersDataSource.fetch(function(){
              	usersData = this.data();
            });
        }
        
        return {
            load: loadUsers,
            users: function () {
                return usersData;
            },
            currentUser: currentUser
        };
        
    }());
    
    return usersModel;
    
}());
