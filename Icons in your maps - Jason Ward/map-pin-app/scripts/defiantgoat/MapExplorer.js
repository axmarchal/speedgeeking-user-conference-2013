define([
	"dojo/dom",
	"dojo/_base/connect",
	"dojo/query",
	"dojo/on",
	"dojo/dom-attr",
	"dojo/dom-class",		
	"dojo/_base/lang",
	"dojo/dom-construct",
	"esri/map",
	"esri/graphic",
	"esri/geometry/Point",
	"esri/symbols/PictureMarkerSymbol",
	"esri/SpatialReference",
	"esri/tasks/locator",
	"dojo/domReady"],
	function(dom, connect, query, on, domAttr, domClass, lang, domConstruct, Map, Graphic, Point, PictureMarkerSymbol, SpatialReference, Locator) {	
		var mapObj;	
		var self;
		//var locateURL = "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Locators/ESRI_Geocode_USA/GeocodeServer";
		return {
			startup: function() {	
				mapObj = new Map("map", {
				basemap: initBasemap,
				displayGraphicsOnPan: false,
				fadeOnZoom: true,
				force3DTransforms: true,
				navigationMode: "css-transforms",
				zoom: 4,
				slider: false
				}); 
				this.setBasemapButtons();
				this.initMapPins();
				//this.drawOnCanvasTest();
				self = this;
				self.toggleBasemapButton(initBasemap);
			},
			setBasemapButtons: function(){
				query("[data-basemap]").forEach(function(node){
					var _bM = domAttr.get(node, "data-basemap");
					on(node, "click", function(){
							mapObj.setBasemap(_bM);
							self.toggleBasemapButton(_bM);							
						});
			  });				
			},
			initMapPins: function() {	
				if(this.isSupported()){
					document.getElementById("files").addEventListener("change", this.addPins, false);
					on(dojo.byId("clearMap"), "click", function(){ mapObj.graphics.clear(); });
					self = this;
				}				
			},
			isSupported: function(){
				if (window.File && window.FileReader && window.FileList) {
				  return true;
				} else {
				  dom.byId("map-pin-tester").innerHTML = "HTML 5 File Upload Not Supported.";
				  return false;
				}	
			},
			toggleBasemapButton: function(bm){
				query("[data-basemap]").forEach(function(node){					
					domClass.remove(node, "active");
					if( domAttr.get(node, "data-basemap") == bm ){ 
						domClass.add(node, "active"); 
					}
				});		
			},
			addPins: function(evt){
				var _pins = evt.target.files; // FileList array		
				for(var i = 0; i < _pins.length; i++){
					var pin = _pins[i];
					if (!pin.type.match('image.*')) {
						continue;
					}
					var reader = new FileReader();	
					reader.onload = (function(thisPin){						
						return function(e){ // this simply returns the following function, which would be all you needed if you didn't need info about the file such as name		
							var _li = domConstruct.create("li",{
								"data-map-pin" : thisPin.name
								}, dom.byId("pins"));	
							var _img = domConstruct.create("img",{
								"onload": function(){
											if(this.width > 50 || this.height > 50 || (this.width > 50 && this.height > 50)){
												domAttr.set(_img, "width", 50); 
												domAttr.set(_img, "height", 50);
											}
											domAttr.set(_img, "width", this.width); 
											domAttr.set(_img, "height", this.height);
										},
								"src": e.target.result
							},_li);
							var _btn = domConstruct.create("button",{
								innerHTML: "Add to Map",
								"class": "float-right"	
								},_li);
							on( _btn, "click", function(){ self.addPinToMap (_img); });
							var _btn2 = domConstruct.create("button",{
								innerHTML: "Delete",
								"class": "float-right"	
								},_li);
							on( _btn2, "click", function(){ domConstruct.destroy(_li); });
							var _br = domConstruct.create("br",{
								"class": "clearer"
								},_li);
							domClass.remove(dom.byId("clearMap"), "off");
						}
					})(pin);
					reader.readAsDataURL(pin);
				}	
				domAttr.set(dom.byId("files"), "value", null);	
			},
			addPinToMap: function(img){
				var _addPin = on(mapObj, "click", function(e){						
					 var point = new Point(e.mapPoint.x, e.mapPoint.y, new SpatialReference({wkid:e.mapPoint.spatialReference.wkid}));
					 var pictureMarkerSymbol = new PictureMarkerSymbol(img.src, img.width, img.height);
					 var graphic = new Graphic(point, pictureMarkerSymbol);
					 mapObj.graphics.add(graphic);		
					 _addPin.remove();					 
				});
			},
			initLocator: function(){	
				var locator = new esri.tasks.Locator(locateURL);
				on(locator, "address-to-locations-complete", function(candidates){ console.log(candidates); });
				var address = { Address: "", City: "", State: "", Zip: "" } 
				locator.outSpatialReference= map.spatialReference;
				var options = {
				  address:address,
				  outFields:["*"]
				}
				locator.addressToLocations(options);
			},
			drawOnCanvasTest: function(){
					var c = document.getElementById("canvas");
					var ctx = c.getContext("2d");
					ctx.beginPath();
					ctx.moveTo(18.9, 9.4);
					ctx.bezierCurveTo(18.9, 14.6, 9.4, 24.6, 9.4, 24.6);
					ctx.bezierCurveTo(9.4, 24.6, 0.0, 14.6, 0.0, 9.4);
					ctx.bezierCurveTo(0.0, 4.2, 4.2, 0.0, 9.4, 0.0);
					ctx.bezierCurveTo(14.6, 0.0, 18.9, 4.2, 18.9, 9.4);
					ctx.closePath();
					ctx.fillStyle = "rgb(25, 25, 25)";
					ctx.fill();
					var dataURL = canvas.toDataURL();					
					document.getElementById('canvas-img').src = dataURL;
			}
	}; //end main	
});//end define