/**
 * Users model
 */
var app = app || {};

app.Users = (function () {
    'use strict';
    
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

app.Users.load();
            
