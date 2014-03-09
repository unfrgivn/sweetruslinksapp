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
            serverPaging: true,
    		pageSize: 20,
            transport: {
                 read: {
                     url: appSettings.api.url + '/link/search',
                     dataType: "jsonp"
                     /*,
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
                     }*/
                 },
                parameterMap: function(options) {
                    return {
                        guid: window.localStorage.getItem("guid"),
                        srlkey: appSettings.api.srlKey,
                        'columns' : ['l.srl_id', 'title', 'link', 'l.created', 'link_id', 'nsfw', 'u.user_id'],
                        'start' : (options.page - 1) * options.pageSize,
                        'limit' : options.pageSize,
                        'q' : null,
                        'issortable' : true,
                        'sortcolindex' : 3,
                        'sortdir' : 'desc'
                    };
                }
            },
            schema: {
                /*data: function(response) {
                    return response.data.links;
                }*/        
                total: function (response) { return 500; },
                parse: function(response) {
                  var links = [];
                  for (var i = 0; i < response.data.links.length; i++) {
                      var userId = response.data.links[i].user_id;
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
                          'nsfw': response.data.links[i].nsfw,
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
                
                /*
                // create a template instance
                var template = kendo.template($("#linkTemplate").html());
                // render a view by passing the data to a template
                kendo.render(template, this);*/
                
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
             var target = e.touch.target;
             var voteup = e.data.voteStatus == '' ? true : false;
             var votes = parseInt(data.votes);
             
         	$.getJSON(appSettings.api.url + '/link/vote?callback=?', { 
                guid: window.localStorage.getItem("guid"),
             	srlkey: appSettings.api.srlKey,
                srlid: e.data.id
            }).done(function(response) {
                if (response.data) {
                  if (voteup) data.set('votes', votes + 1);  //New vote so incremement vote count
                  else if (parseInt(data.votes) > 0) data.set('votes', votes - 1); //Vote down so remove vote if counter is > 0
                 
                  target.find('a').toggleClass('on');
                  data.set('voteStatus', voteup ? 'on' : '');
                }
            }).fail(function( jqxhr, textStatus, error ) {
                
            });
        };
        
        // Navigate to linkView When some link is selected
        var linkSelected = function (e) {
            var data = e.data;
            var linkUrl = data.link;
            var views = parseInt(data.views);
            
            $.getJSON(appSettings.api.url + '/link/increment-view?callback=?', { 
                guid: window.localStorage.getItem("guid"),
             	srlkey: appSettings.api.srlKey,
                srlid: e.data.id
            }).fail(function( jqxhr, textStatus, error ) {
                
            }).always(function() { //Redirect even if the increment fails
               var ref = window.open(linkUrl, "_blank", 'location=yes'); 
                data.set('views', views+1); //Increment view counter
                /*ref.addEventListener('loadstart', function() {
                ref.insertCSS({
                        code: "body { background: #fff; }" 
                    });
            	});*/
            });
        };

        // Logout user
        var logout = function () {            
            app.helper.logout();
            app.mobileApp.navigate('views/loginView.html');
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