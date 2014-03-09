/**
 * Links view model
 */

var app = app || {};

app.Links = (function () {
    'use strict'
    
    // Links model
    var linksModel = (function () {
        // Links data source. The Everlive dialect of the Kendo UI DataSource component
        // supports filtering, sorting, paging, and CRUD operations. 
        var linksDataSource = new kendo.data.DataSource({
             transport: {
                 read: {
                     url: appSettings.api.url + '/link/search',
                     dataType: "jsonp",
                     data: {
                         guid: window.localStorage.getItem("guid"),
                         srlkey: appSettings.api.srlKey,
                         'columns' : ['l.srl_id', 'title', 'link', 'l.created', 'link_id', 'nsfw', 'description', 'orig_image', 'preview_text', 'username', 'u.user_id'],
                         'start' : 0,
                         'limit' : 5,
                         'q' : null,
                         'issortable' : true,
                         'sortcolindex' : 3,
                         'sortdir' : 'desc'
                     }
                 }
             },
            schema: {
                /*data: function(response) {
                    return response.data.links;
                }*/                
                parse: function(response) {
                  var links = [];
                  for (var i = 0; i < response.data.links.length; i++) {
                      var userId = response.data.links[i].user_id;
                            //console.debug(app.Users.users());
                         var user = $.grep(app.Users.users(), function (e) {
                       		return e.user_id === userId;
                    	})[0];
                      
                      	var username = user ? user.username : 'Anonymous';
                        var avatar = app.helper.resolveProfilePictureUrl(user);
                      
                    var link = {
                      	'id': response.data.links[i].srl_id,
                        'link_id': response.data.links[i].link_id,
                        'link': response.data.links[i].link,
                    	'title': response.data.links[i].title,
                        //created: app.helper.formatDate(response.data.links[i].created)
                        'created': response.data.links[i].relativetime,
                        'views': response.data.links[i].views ? response.data.links[i].views : 0,
                        'votes': response.data.links[i].numvotes  ? response.data.links[i].numvotes  : 0,
                        'voteStatus': response.data.links[i].user_voted == 1 ? 'on' : '',
                        'user_id': userId,
                        'username': username,
                        'avatar': avatar
                    };
                    links.push(link);
                  }
                  return links;
                }
            },
            change: function (e) {
                
                if (e.items && e.items.length > 0) {
                    $('#no-links-span').hide();
                } else {
                    $('#no-links-span').show();
                }
            }
        });
        
        return {
            links: linksDataSource
        };
        
    }());

    // Links view model
    var linksViewModel = (function () {
        
         var linkVote = function (e) {
             var data = e.data;
             var voteup = e.data.voteStatus == '' ? true : false;
              
         	$.getJSON(appSettings.api.url + '/link/vote?callback=?', { 
                guid: window.localStorage.getItem("guid"),
             	srlkey: appSettings.api.srlKey,
                srlid: e.data.id
            }).done(function(response) {
                if (response.data) {
                  if (voteup) data.votes++;  //New vote so incremement vote count
                  else if (parseInt(data.votes) > 0) data.votes--; //Vote down so remove vote if counter is > 0
                 
                  data.set('voteStatus', voteup ? 'on' : '');
                }
            }).fail(function( jqxhr, textStatus, error ) {
                
            });
        };
        
        // Navigate to linkView When some link is selected
        var linkSelected = function (e) {
            var linkUrl = e.data.link;
            
            $.getJSON(appSettings.api.url + '/link/increment-view?callback=?', { 
                guid: window.localStorage.getItem("guid"),
             	srlkey: appSettings.api.srlKey,
                srlid: e.data.id
            }).fail(function( jqxhr, textStatus, error ) {
                
            }).always(function() { //Redirect even if the increment fails
               var ref = window.open(linkUrl, "_blank", 'location=yes'); 
                /*ref.addEventListener('loadstart', function() {
                ref.insertCSS({
                        code: "body { background: #fff; }" 
                    });
            	});*/
            });
        };
        
        // Navigate to app home
        var navigateHome = function () {
            
            app.mobileApp.navigate('#welcome');
        };
        
        // Logout user
        var logout = function () {
            
            app.helper.logout()
            .then(navigateHome, function (err) {
                app.showError(err.message);
                navigateHome();
            });
        };
        
        return {
            links: linksModel.links,
            vote: linkVote,
            linkSelected: linkSelected,
            logout: logout
        };
        
    }());
    
    return linksViewModel;
    
}());