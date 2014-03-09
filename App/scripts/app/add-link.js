/**
 * AddLink view model
 */

var app = app || {};

app.AddLink = (function () {
    'use strict'

    var addLinkViewModel = (function () {
        
        var $url, $title, $nsfw;
        var validator;
        
        var init = function () {
            
            validator = $('#txtUrl').kendoValidator().data("kendoValidator");
            $url = $('#txtUrl');
            $title = $('#txtTitle');
            $nsfw = $('#chkNsfw');
        };
        
        var show = function () {
            
            // Clear field on view show
           	$url.val('');
            $title.val('');
            $nsfw.prop('checked', false);
            validator.hideMessages();
        };
        
        var saveLink = function () {
            
            // Validating of the required fields
            if (validator.validate()) {
                
                $.getJSON(appSettings.api.url + '/link/post?callback=?', { 
                    guid: window.localStorage.getItem("guid"),
                    srlkey: appSettings.api.srlKey,
                    link_url: $url.val(),
                    link_title: $title.val() != '' ? $title.val() : null,
                    link_nsfw: $nsfw.prop('checked'),
                    link_groups: 3
                }).done(function(response) {
                    if (response.data) {
                      app.mobileApp.navigate('#:back');
                    }
                }).fail(function( jqxhr, textStatus, error ) {
                    
                });
                
                // Adding new link to Links model
                /*
                var links = app.Links.links;
                
                
                var link = links.add();
                
                link.Text = $newStatus.val();
                link.UserId = app.Users.currentUser.get('data').Id;
                
                links.one('sync', function () {
                    app.mobileApp.navigate('#:back');
                });*/
                
                //links.sync();
            }
        };
        
        return {
            init: init,
            show: show,
            saveLink: saveLink
        };
        
    }());
    
    return addLinkViewModel;
    
}());
