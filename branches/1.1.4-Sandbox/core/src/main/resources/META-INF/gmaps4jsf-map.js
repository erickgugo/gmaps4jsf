(function (window) {

    var google = window.google;
    var gmaps4jsf = window.gmaps4jsf;

    if (!gmaps4jsf.createMap) {

        gmaps4jsf.maps = {};

        gmaps4jsf.createMap = function(map, callback) {
            var id = map.id;
            map.gmaps4jsf = this;
            var themap = this.getMap(id);
            if (!themap) {
                var container = document.getElementById(id);
                if (container) {
                    themap = this.maps[id] = new google.maps.Map(container);
                    themap.properties = map;
                    if (map.jsVariable) {
                        this.window[map.jsVariable] = themap;
                    }
                }
            }
            if (map.enableScrollWheelZoom) {
                themap.enableScrollWheelZoom();
            } else {
                themap.disableScrollWheelZoom();
            }
            themap.center(map, callback);
        };

        gmaps4jsf.getMap = function (map) {
            var id = typeof map === "object" ? map.id : map;
            return this.maps[id];
        };

    }

    if (!google.maps.Map.prototype.center) {

        google.maps.Map.prototype.center = function (map, callback) {
            var self = this;
            var props = map ? map : self.properties;
            if (props.location.address) {
                props.gmaps4jsf.geocode(props.location.address, function (location) {
                    if (location) {
                        self._center(location, props.zoom, callback)
                    }
                });
            } else {
                self._center(new google.maps.LatLng(props.location.latitude, props.location.longitude), props.zoom, callback);
            }
        };

        google.maps.Map.prototype._center = function (latlng, zoom, callback) {
            this.setCenter(latlng, zoom);
            this._createMapCallback(callback);
        };

        google.maps.Map.prototype._createMapCallback = function(callback) {
            callback(this);
        };

        google.maps.Map.prototype.reshape = function(latlng) {
            this.setBounds(latlng);
            if (this.properties.autoReshape && (this.markers.length > 1)) {
                var sw = this.bounds.getSouthWest();
                sw = new google.maps.LatLng(sw.lat() - 0.005, sw.lng() - 0.005);
                var ne = this.bounds.getNorthEast();
                ne = new google.maps.LatLng(ne.lat() + 0.005, ne.lng() + 0.005);
                var extra = new google.maps.LatLngBounds(sw, ne);
                this.setZoom(this.getBoundsZoomLevel(extra));
                this.setCenter(extra.getCenter());
            }
        };

        google.maps.Map.prototype.setBounds = function(latlng) {
            if (!this.bounds) {
                this.bounds = new google.maps.LatLngBounds();
            }
            this.bounds.extend(latlng);
        };

    }

    if (!google.maps.Map.prototype.buildIcon) {

        google.maps.Map.prototype.buildIcon = function (icon) {
            var iconObject = new google.maps.Icon(G_DEFAULT_ICON);
            iconObject.image = icon.image;
            iconObject.shadow = icon.shadow;
            iconObject.iconSize = new google.maps.Size(icon.iconSize.width, icon.iconSize.height);
            iconObject.shadowSize = new google.maps.Size(icon.shadowSize.width, icon.shadowSize.height);
            iconObject.iconAnchor = new google.maps.Point(icon.iconAnchor.x, icon.iconAnchor.y);
            iconObject.infoWindowAnchor = new google.maps.Point(icon.infoWindowAnchor.x, icon.infoWindowAnchor.y);
            return iconObject;
        };

    }

    if (!google.maps.Map.prototype.markers) {

        google.maps.Map.prototype.markers = new Array();    

        google.maps.Map.prototype.createMarker = function(marker, callback) {
            var self = this;
            if (marker.address) {
                self.properties.gmaps4jsf.geocode(marker.address, function(location) {
                    if (location) {
                        var m = new google.maps.Marker(location, marker.markerOptions);
                        self._markerCreationCallback(m, marker, callback);
                        
                        /* add a drag-end listener to the marker */
                        var dragEndFunction = function (m) {
                        	
                        	return function(latlng) {                    	
                                var markersState = document.getElementById(m.stateHiddenFieldID).value;
                                
                                if (markersState.indexOf(m.markerID + '=') != -1) {    
	                          		 var markersArray = markersState.split('&'); 
	                          		 var updatedMarkersState = ""; 
	                          		 
	                          		 for (i = 0; markersArray.length > i; ++i) {  
	                          			if (markersArray[i].indexOf(m.markerID + '=') == -1) {    
	                          			
	                          				updatedMarkersState += markersArray[i];    
	                          				if (markersArray.length != 1 && ((markersArray.length - 1) > i)) {   
	                          					updatedMarkersState += '&';     
	                          				}     
	                          			
	                          			}   
	                          		 }    
	                          							
	                          		 markersState = updatedMarkersState;   
                                }                          
                                                              
                                if (markersState != '' && markersState.charAt(markersState.length - 1) != '&') { 
                                    markersState += '&'; 
                                }    
                                                              
                                markersState += m.markerID + '=' + latlng;
                                                              
                                /* Save the marker state. */
                                document.getElementById(m.stateHiddenFieldID).value = markersState;
                                                              
                          	    /* Submit the form on marker value change if required. */
                                if (marker.submitOnValueChange == 'true') {
                                	setTimeout( function() { 
                                					document.getElementById(marker.parentFormID).submit();
                                				}, 500);
                                }                                                                         		
                        	}
                        
                        };
                        
                        GEvent.addListener(themarker, 'dragend', dragEndFunction(marker) );                        
                    }
                });
            } else {
                var themarker;
                if (marker.latitude) {
                    themarker = new google.maps.Marker(new google.maps.LatLng(marker.latitude, marker.longitude), marker.markerOptions);
                } else {
                    themarker = new google.maps.Marker(self.getCenter(), marker.markerOptions);
                }
                self._markerCreationCallback(themarker, marker, callback);
                
                /* add a drag-end listener to the marker */
                var dragEndFunction = function (m) {
                	
                	return function(latlng) {                    	
                        var markersState = document.getElementById(m.stateHiddenFieldID).value;
                        
                        if (markersState.indexOf(m.markerID + '=') != -1) {    
	                  		 var markersArray = markersState.split('&'); 
	                  		 var updatedMarkersState = ""; 
	                  		 
	                  		 for (i = 0; markersArray.length > i; ++i) {  
	                  			if (markersArray[i].indexOf(m.markerID + '=') == -1) {    
	                  			
	                  				updatedMarkersState += markersArray[i];    
	                  				if (markersArray.length != 1 && ((markersArray.length - 1) > i)) {   
	                  					updatedMarkersState += '&';     
	                  				}     
	                  			
	                  			}   
	                  		 }    
	                  							
	                  		 markersState = updatedMarkersState;   
                        }  
                                                      
                        if (markersState != '' && markersState.charAt(markersState.length - 1) != '&') { 
                            markersState += '&'; 
                        }    
                                                      
                        markersState += m.markerID + '=' + latlng;
                                                      
                        /* Save the marker state. */
                        document.getElementById(m.stateHiddenFieldID).value = markersState;
                                                      
                  	    /* Submit the form on marker value change if required. */
                        if (marker.submitOnValueChange == 'true') {
                        	setTimeout( function() { 
                        					document.getElementById(marker.parentFormID).submit();
                        				}, 500);
                        }                                       		
                	}
                
                };
                
                GEvent.addListener(themarker, 'dragend', dragEndFunction(marker) );
            }
        };

        google.maps.Map.prototype._markerCreationCallback = function(marker, markerOptions, callback) {
            this.addMarker(marker);
            var latlng = marker.getLatLng();
            if (!markerOptions.latitude) {
                markerOptions.latitude = latlng.lat();
                markerOptions.longitude = latlng.lng();
            }
            marker.properties = markerOptions;
            marker.parentMap = this;
            if (markerOptions.jsVariable) {
                this.properties.gmaps4jsf.window[markerOptions.jsVariable] = marker;
            }
            callback(this, marker);
            this.reshape(latlng);
        };

        google.maps.Map.prototype.getMarkers = function() {
            return this.markers;
        };

        google.maps.Map.prototype.clearMarkers = function() {
            for (var i = 0; i < this.markers.length; i++) {
                this.markers[i].set_map(null);
            }
            this.markers = new Array();
        };

    }

    if (!google.maps.Map.prototype.createInfoWindow) {

        google.maps.Map.prototype.createInfoWindow = function(infoWindow, callback) {
            var pos = infoWindow.latitude ? new google.maps.LatLng(infoWindow.latitude, infoWindow.longitude) : this.getCenter();
            this.openInfoWindowHtml(pos, infoWindow.htmlText);
            callback(this.getInfoWindow());
        };

    }

    if (!google.maps.Marker.prototype.createInfoWindow) {

        google.maps.Marker.prototype.createInfoWindow = function(infoWindow, callback) {
            this.openInfoWindowHtml(infoWindow.htmlText);
            callback(this.parentMap.getInfoWindow());
        };
    }

    if (!google.maps.Map.prototype.createPolyline) {

        google.maps.Map.prototype.createPolyline = function (polyline, getContained) {
            var contained = getContained({});
            var line = new google.maps.Polyline(contained.points, polyline.hexaColor, polyline.lineWidth, polyline.opacity, {geodesic: polyline.geodesic});
            this.addOverlay(line);
            if (polyline.jsVariable) {
                this.gmaps4jsf.window[polyline.jsVariable] = line;
            }
            contained.callback(line);
            return line;
        };

    }

    if (!google.maps.Map.prototype.createPolygon) {

        google.maps.Map.prototype.createPolygon = function(polygon, getContained) {
            var contained = getContained();
            var poly = new google.maps.Polygon(contained.points, polygon.hexStrokeColor, polygon.lineWidth, polygon.strokeOpacity, polygon.hexFillColor, polygon.fillOpacity);
            this.addOverlay(poly);
            if (polygon.jsVariable) {
                this.gmaps4jsf.window[polygon.jsVariable] = poly;
            }
            contained.callback(poly);
            return poly;
        };

    }

    if (!google.maps.Map.prototype.addDirection) {

        google.maps.Map.prototype.addDirection = function (direction, callback) {
            var panel = this.properties.gmaps4jsf.window.document.getElementById(direction.attachNodeId);
            var directions = new google.maps.Directions(this, panel);
            directions.load("from: " + direction.fromAddress + " to: " + direction.toAddress, direction);
        };

    }

})(window);