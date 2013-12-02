/*!
	Messier Bingo - Javascript Version
	(c) Stuart Lowe/LCOGT
*/
/*
	USAGE:
		<!--[if lt IE 9]><script src="js/excanvas.js" type="text/javascript"></script><![endif]-->
		<script src="js/jquery-1.10.0.min.js" type="text/javascript"></script>
		<script src="js/messier.js" type="text/javascript"></script>
		<script type="text/javascript">
		<!--
			$(document).ready(function(){
				bingo = $.messierbingo({id:'starmapper',projection:'polar'});
			});
		// -->
		</script>
		
	OPTIONS (default values in brackets):
*/
var catalogue = [{
	'id': 'M1',
	'ngc': 'NGC 1952',
	'alt': 'Crab Nebula',
	'src': 'http://lcogt.net/observations/coj/2m0a/633742',
	'img': 'http://rti.lcogt.net/observations/2013/01/10/process-378-2.jpg',
	'type': ''
},{
}];

(function ($) {

	/*@cc_on
	// Fix for IE's inability to handle arguments to setTimeout/setInterval
	// From http://webreflection.blogspot.com/2007/06/simple-settimeout-setinterval-extra.html
	(function(f){
		window.setTimeout =f(window.setTimeout);
		window.setInterval =f(window.setInterval);
	})(function(f){return function(c,t){var a=[].slice.call(arguments,2);return f(function(){c.apply(this,a)},t)}});
	@*/
	// Define a shortcut for checking variable types
	function is(a,b){ return (typeof a == b) ? true : false; }

	$.extend($.fn.addTouch = function(){
		// Adapted from http://code.google.com/p/rsslounge/source/browse/trunk/public/javascript/addtouch.js?spec=svn115&r=115
		this.each(function(i,el){
			// Pass the original event object because the jQuery event object
			// is normalized to w3c specs and does not provide the TouchList.
			$(el).bind('touchstart touchmove touchend touchcancel touchdbltap',function(){ handleTouch(event); });
		});
		var handleTouch = function(event){
			event.preventDefault();
	
			var simulatedEvent;
			var touches = event.changedTouches,
			first = touches[0],
			type = '';
			switch(event.type){
				case 'touchstart':
					type = ['mousedown','click'];
					break;
				case 'touchmove':
					type = ['mousemove'];
					break;        
				case 'touchend':
					type = ['mouseup'];
					break;
				case 'touchdbltap':
					type = ['dblclick'];
					break;
				default:
					return;
			}
			for(var i = 0; i < type.length; i++){
				simulatedEvent = document.createEvent('MouseEvent');
				simulatedEvent.initMouseEvent(type[i], true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0/*left*/, null);
				first.target.dispatchEvent(simulatedEvent);
			}
		};
	});

	/*! Messier Bingo */
	function MessierBingo(inp){

		this.version = "0.1";
	
		this.id = 'paper';
		this.container = $('#'+this.id);
		this.outer = $('#outer');
		this.ie = false;
		this.excanvas = (typeof G_vmlCanvasManager != 'undefined') ? true : false;
		/*@cc_on
		this.ie = true
		@*/
		this.wide = 1024;
		this.tall = 768;
		this.width = 1024;
		this.height = 768;
		this.aspect = 1024/768;	// The aspect ratio



		// Process the input parameters/query string
		this.init(inp);

		//this.loadConfig();

		$(window).resize({me:this},function(e){ e.data.me.resize(); });


		return this;
	}

	MessierBingo.prototype.init = function(){

		this.todo = new Array(110);
		for(var i = 0; i < this.todo.length; i++){ this.todo[i] = i+1; }

		// Country codes at http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
		this.language = (navigator.language) ? navigator.language : navigator.userLanguage;			// Set the user language
		this.langcode = this.language.substring(0,2);
		this.phrasebook = {
			"code": "en",
			"name": "English",
			"messier": "Msr Charles Messier",
			"title": "Messier Bingo",
			"instructions": "Instructions",
			"power": "Powered by LCOGT"
		};
		this.keys = new Array();

		this.catalogue = [
			{ 'm': 'M1', 'ngc': 'NGC 1952', 'name': 'Crab Nebula', 'type':'Supernova remnant', 'distance': 6.3, 'constellation': 'Taurus', 'mag': 8.2 },
			{ 'm': 'M2', 'ngc': 'NGC 7089', 'name': '', 'type':'Cluster, globular', 'distance': 36, 'constellation': 'Aquarius', 'mag': 6.5 },
			{ 'm': 'M3', 'ngc': 'NGC 5272', 'name': '', 'type':'Cluster, globular', 'distance': 31, 'constellation': 'Canes Venatici', 'mag': 6.4 },
			{ 'm': 'M4', 'ngc': 'NGC 6121', 'name': '', 'type':'Cluster, globular', 'distance': 7, 'constellation': 'Scorpius', 'mag': 5.9 },
			{ 'm': 'M5', 'ngc': 'NGC 5904', 'name': '', 'type':'Cluster, globular', 'distance': 23, 'constellation': 'Serpens', 'mag': 7.0 },
			{ 'm': 'M6', 'ngc': 'NGC 6405', 'name': 'Butterfly Cluster', 'type':'Cluster, open', 'distance': 2, 'constellation': 'Scorpius', 'mag': 4.5 },
			{ 'm': 'M7', 'ngc': 'NGC 6475', 'name': 'Ptolemy Cluster', 'type':'Cluster, open', 'distance': 1, 'constellation': 'Scorpius', 'mag': 3.5 },
			{ 'm': 'M8', 'ngc': 'NGC 6523', 'name': 'Lagoon Nebula', 'type':'Nebula with cluster', 'distance': 6.5, 'constellation': 'Sagittarius', 'mag': 6.0 },
			{ 'm': 'M9', 'ngc': 'NGC 6333', 'name': '', 'type':'Cluster, globular', 'distance': 26, 'constellation': 'Ophiuchus', 'mag': 9.0 },
			{ 'm': 'M10', 'ngc': 'NGC 6254', 'name': '', 'type':'Cluster, globular', 'distance': 13, 'constellation': 'Ophiuchus', 'mag': 7.5 },
			{ 'm': 'M11', 'ngc': 'NGC 6705', 'name': 'Wild Duck Cluster', 'type':'Cluster, open', 'distance': 6, 'constellation': 'Scutum', 'mag': 7.0 },
			{ 'm': 'M12', 'ngc': 'NGC 6218', 'name': '', 'type':'Cluster, globular', 'distance': 18, 'constellation': 'Ophiuchus', 'mag': 8.0 },
			{ 'm': 'M13', 'ngc': 'NGC 6205', 'name': 'Great Globular Cluster in Hercules', 'type':'Cluster, globular', 'distance': 22, 'constellation': 'Hercules', 'mag': 5.8 },
			{ 'm': 'M14', 'ngc': 'NGC 6402', 'name': '', 'type':'Cluster, globular', 'distance': 27, 'constellation': 'Ophiuchus', 'mag': 9.5 },
			{ 'm': 'M15', 'ngc': 'NGC 7078', 'name': '', 'type':'Cluster, globular', 'distance': 33, 'constellation': 'Pegasus', 'mag': 6.2 },
			{ 'm': 'M16', 'ngc': 'NGC 6611', 'name': 'Eagle Nebula', 'type':'Nebula, H II region with cluster', 'distance': 7, 'constellation': 'Serpens', 'mag': 6.5 },
			{ 'm': 'M17', 'ngc': 'NGC 6618', 'name': 'Omega, Swan, Horseshoe, or Lobster Nebula', 'type':'Nebula, H II region with cluster', 'distance': 5, 'constellation': 'Sagittarius', 'mag': 6.0 },
			{ 'm': 'M18', 'ngc': 'NGC 6613', 'name': '', 'type':'Cluster, open', 'distance': 6, 'constellation': 'Sagittarius', 'mag': 8.0 },
			{ 'm': 'M19', 'ngc': 'NGC 6273', 'name': '', 'type':'Cluster, globular', 'distance': 27, 'constellation': 'Ophiuchus', 'mag': 8.5 },
			{ 'm': 'M20', 'ngc': 'NGC 6514', 'name': 'Trifid Nebula', 'type':'Nebula, H II region with cluster', 'distance': 5.2, 'constellation': 'Sagittarius', 'mag': 6.3 },
			{ 'm': 'M21', 'ngc': 'NGC 6531', 'name': '', 'type':'Cluster, open', 'distance': 3, 'constellation': 'Sagittarius', 'mag': 7.0 },
			{ 'm': 'M22', 'ngc': 'NGC 6656', 'name': 'Sagittarius Cluster', 'type':'Cluster, globular', 'distance': 10, 'constellation': 'Sagittarius', 'mag': 5.1 },
			{ 'm': 'M23', 'ngc': 'NGC 6494', 'name': '', 'type':'Cluster, open', 'distance': 4.5, 'constellation': 'Sagittarius', 'mag': 6.0 },
			{ 'm': 'M24', 'ngc': 'IC 4715', 'name': 'Sagittarius Star Cloud', 'type':'Milky Way star cloud', 'distance': 10.0, 'constellation': 'Sagittarius', 'mag': 4.6 },
			{ 'm': 'M25', 'ngc': 'IC 4725', 'name': '', 'type':'Cluster, open', 'distance': 2, 'constellation': 'Sagittarius', 'mag': 4.9 },
			{ 'm': 'M26', 'ngc': 'NGC 6694', 'name': '', 'type':'Cluster, open', 'distance': 5, 'constellation': 'Scutum', 'mag': 9.5 },
			{ 'm': 'M27', 'ngc': 'NGC 6853', 'name': 'Dumbbell Nebula', 'type':'Nebula, planetary', 'distance': 1.25, 'constellation': 'Vulpecula', 'mag': 7.5 },
			{ 'm': 'M28', 'ngc': 'NGC 6626', 'name': '', 'type':'Cluster, globular', 'distance': 18, 'constellation': 'Sagittarius', 'mag': 8.5 },
			{ 'm': 'M29', 'ngc': 'NGC 6913', 'name': '', 'type':'Cluster, open', 'distance': 7.2, 'constellation': 'Cygnus', 'mag': 9.0 },
			{ 'm': 'M30', 'ngc': 'NGC 7099', 'name': '', 'type':'Cluster, globular', 'distance': 25, 'constellation': 'Capricornus', 'mag': 8.5 },
			{ 'm': 'M31', 'ngc': 'NGC 224', 'name': 'Andromeda Galaxy', 'type':'Galaxy, spiral', 'distance': 2500, 'constellation': 'Andromeda', 'mag': 3.4 },
			{ 'm': 'M32', 'ngc': 'NGC 221', 'name': '', 'type':'Galaxy, dwarf elliptical', 'distance': 2900, 'constellation': 'Andromeda', 'mag': 8.1 },
			{ 'm': 'M33', 'ngc': 'NGC 598', 'name': 'Triangulum Galaxy', 'type':'Galaxy, spiral', 'distance': 2810, 'constellation': 'Triangulum', 'mag': 5.7 },
			{ 'm': 'M34', 'ngc': 'NGC 1039', 'name': '', 'type':'Cluster, open', 'distance': 1.4, 'constellation': 'Perseus', 'mag': 6.0 },
			{ 'm': 'M35', 'ngc': 'NGC 2168', 'name': '', 'type':'Cluster, open', 'distance': 2.8, 'constellation': 'Gemini', 'mag': 5.5 },
			{ 'm': 'M36', 'ngc': 'NGC 1960', 'name': '', 'type':'Cluster, open', 'distance': 4.1, 'constellation': 'Auriga', 'mag': 6.5 },
			{ 'm': 'M37', 'ngc': 'NGC 2099', 'name': '', 'type':'Cluster, open', 'distance': 4.6, 'constellation': 'Auriga', 'mag': 6.0 },
			{ 'm': 'M38', 'ngc': 'NGC 1912', 'name': '', 'type':'Cluster, open', 'distance': 4.2, 'constellation': 'Auriga', 'mag': 7.0 },
			{ 'm': 'M39', 'ngc': 'NGC 7092', 'name': '', 'type':'Cluster, open', 'distance': 0.8, 'constellation': 'Cygnus', 'mag': 5.5 },
			{ 'm': 'M40', 'ngc': '', 'name': 'Winnecke 4', 'type':'Double star WNC4', 'distance': 0.5, 'constellation': 'Ursa Major', 'mag': 9.0 },
			{ 'm': 'M41', 'ngc': 'NGC 2287', 'name': '', 'type':'Cluster, open', 'distance': 2.3, 'constellation': 'Canis Major', 'mag': 4.5 },
			{ 'm': 'M42', 'ngc': 'NGC 1976', 'name': 'Orion Nebula', 'type':'Nebula, H II region', 'distance': 1.6, 'constellation': 'Orion', 'mag': 4.0 },
			{ 'm': 'M43', 'ngc': 'NGC 1982', 'name': 'De Mairan\'s Nebula', 'type':'Nebula, H II region (part of the Orion Nebula)', 'distance': 1.6, 'constellation': 'Orion', 'mag': 7.0 },
			{ 'm': 'M44', 'ngc': 'NGC 2632', 'name': 'Beehive Cluster', 'type':'Cluster, open', 'distance': 0.6, 'constellation': 'Cancer', 'mag': 3.7 },
			{ 'm': 'M45', 'ngc': '', 'name': 'Pleiades', 'type':'Cluster, open', 'distance': 0.4, 'constellation': 'Taurus', 'mag': 1.6 },
			{ 'm': 'M46', 'ngc': 'NGC 2437', 'name': '', 'type':'Cluster, open', 'distance': 5.4, 'constellation': 'Puppis', 'mag': 6.5 },
			{ 'm': 'M47', 'ngc': 'NGC 2422', 'name': '', 'type':'Cluster, open', 'distance': 1.6, 'constellation': 'Puppis', 'mag': 4.5 },
			{ 'm': 'M48', 'ngc': 'NGC 2548', 'name': '', 'type':'Cluster, open', 'distance': 1.5, 'constellation': 'Hydra', 'mag': 5.5 },
			{ 'm': 'M49', 'ngc': 'NGC 4472', 'name': '', 'type':'Galaxy, elliptical', 'distance': 60000, 'constellation': 'Virgo', 'mag': 10.0 },
			{ 'm': 'M50', 'ngc': 'NGC 2323', 'name': '', 'type':'Cluster, open', 'distance': 3, 'constellation': 'Monoceros', 'mag': 7.0 },
			{ 'm': 'M51', 'ngc': 'NGC 5194, NGC 5195', 'name': 'Whirlpool Galaxy', 'type':'Galaxy, spiral', 'distance': 37000, 'constellation': 'Canes Venatici', 'mag': 8.4 },
			{ 'm': 'M52', 'ngc': 'NGC 7654', 'name': '', 'type':'Cluster, open', 'distance': 7, 'constellation': 'Cassiopeia', 'mag': 8.0 },
			{ 'm': 'M53', 'ngc': 'NGC 5024', 'name': '', 'type':'Cluster, globular', 'distance': 56, 'constellation': 'Coma Berenices', 'mag': 8.5 },
			{ 'm': 'M54', 'ngc': 'NGC 6715', 'name': '', 'type':'Cluster, globular', 'distance': 83, 'constellation': 'Sagittarius', 'mag': 8.5 },
			{ 'm': 'M55', 'ngc': 'NGC 6809', 'name': '', 'type':'Cluster, globular', 'distance': 17, 'constellation': 'Sagittarius', 'mag': 7.0 },
			{ 'm': 'M56', 'ngc': 'NGC 6779', 'name': '', 'type':'Cluster, globular', 'distance': 32, 'constellation': 'Lyra', 'mag': 9.5 },
			{ 'm': 'M57', 'ngc': 'NGC 6720', 'name': 'Ring Nebula', 'type':'Nebula, planetary', 'distance': 2.3, 'constellation': 'Lyra', 'mag': 8.8 },
			{ 'm': 'M58', 'ngc': 'NGC 4579', 'name': '', 'type':'Galaxy, barred spiral', 'distance': 60000, 'constellation': 'Virgo', 'mag': 11.0 },
			{ 'm': 'M59', 'ngc': 'NGC 4621', 'name': '', 'type':'Galaxy, elliptical', 'distance': 60000, 'constellation': 'Virgo', 'mag': 11.5 },
			{ 'm': 'M60', 'ngc': 'NGC 4649', 'name': '', 'type':'Galaxy, elliptical', 'distance': 60000, 'constellation': 'Virgo', 'mag': 10.5 },
			{ 'm': 'M61', 'ngc': 'NGC 4303', 'name': '', 'type':'Galaxy, spiral', 'distance': 60000, 'constellation': 'Virgo', 'mag': 10.5 },
			{ 'm': 'M62', 'ngc': 'NGC 6266', 'name': '', 'type':'Cluster, globular', 'distance': 22, 'constellation': 'Ophiuchus', 'mag': 8.0 },
			{ 'm': 'M63', 'ngc': 'NGC 5055', 'name': 'Sunflower Galaxy', 'type':'Galaxy, spiral', 'distance': 37000, 'constellation': 'Canes Venatici', 'mag': 8.5 },
			{ 'm': 'M64', 'ngc': 'NGC 4826', 'name': 'Black Eye Galaxy', 'type':'Galaxy, spiral', 'distance': 12000, 'constellation': 'Coma Berenices', 'mag': 9.0 },
			{ 'm': 'M65', 'ngc': 'NGC 3623', 'name': 'Leo Triplet', 'type':'Galaxy, barred spiral', 'distance': 35000, 'constellation': 'Leo', 'mag': 10.5 },
			{ 'm': 'M66', 'ngc': 'NGC 3627', 'name': 'Leo Triplet', 'type':'Galaxy, barred spiral', 'distance': 35000, 'constellation': 'Leo', 'mag': 10.0 },
			{ 'm': 'M67', 'ngc': 'NGC 2682', 'name': '', 'type':'Cluster, open', 'distance': 2.25, 'constellation': 'Cancer', 'mag': 7.5 },
			{ 'm': 'M68', 'ngc': 'NGC 4590', 'name': '', 'type':'Cluster, globular', 'distance': 32, 'constellation': 'Hydra', 'mag': 9.0 },
			{ 'm': 'M69', 'ngc': 'NGC 6637', 'name': '', 'type':'Cluster, globular', 'distance': 25, 'constellation': 'Sagittarius', 'mag': 9.0 },
			{ 'm': 'M70', 'ngc': 'NGC 6681', 'name': '', 'type':'Cluster, globular', 'distance': 28, 'constellation': 'Sagittarius', 'mag': 9.0 },
			{ 'm': 'M71', 'ngc': 'NGC 6838', 'name': '', 'type':'Cluster, globular', 'distance': 12, 'constellation': 'Sagitta', 'mag': 8.5 },
			{ 'm': 'M72', 'ngc': 'NGC 6981', 'name': '', 'type':'Cluster, globular', 'distance': 53, 'constellation': 'Aquarius', 'mag': 10.0 },
			{ 'm': 'M73', 'ngc': 'NGC 6994', 'name': '', 'type':'Asterism', 'distance': -1, 'constellation': 'Aquarius', 'mag': 9.0 },
			{ 'm': 'M74', 'ngc': 'NGC 628', 'name': '', 'type':'Galaxy, spiral', 'distance': 35000, 'constellation': 'Pisces', 'mag': 10.5 },
			{ 'm': 'M75', 'ngc': 'NGC 6864', 'name': '', 'type':'Cluster, globular', 'distance': 58, 'constellation': 'Sagittarius', 'mag': 9.5 },
			{ 'm': 'M76', 'ngc': 'NGC 650, NGC 651', 'name': 'Little Dumbbell Nebula', 'type':'Nebula, planetary', 'distance': 3.4, 'constellation': 'Perseus', 'mag': 10.1 },
			{ 'm': 'M77', 'ngc': 'NGC 1068', 'name': 'Cetus A', 'type':'Galaxy, spiral', 'distance': 60000, 'constellation': 'Cetus', 'mag': 10.5 },
			{ 'm': 'M78', 'ngc': 'NGC 2068', 'name': '', 'type':'Nebula, diffuse', 'distance': 1.6, 'constellation': 'Orion', 'mag': 8.0 },
			{ 'm': 'M79', 'ngc': 'NGC 1904', 'name': '', 'type':'Cluster, globular', 'distance': 40, 'constellation': 'Lepus', 'mag': 8.5 },
			{ 'm': 'M80', 'ngc': 'NGC 6093', 'name': '', 'type':'Cluster, globular', 'distance': 27, 'constellation': 'Scorpius', 'mag': 8.5 },
			{ 'm': 'M81', 'ngc': 'NGC 3031', 'name': 'Bode\'s Galaxy', 'type':'Galaxy, spiral', 'distance': 12000, 'constellation': 'Ursa Major', 'mag': 6.9 },
			{ 'm': 'M82', 'ngc': 'NGC 3034', 'name': 'Cigar Galaxy', 'type':'Galaxy, starburst', 'distance': 11000, 'constellation': 'Ursa Major', 'mag': 9.5 },
			{ 'm': 'M83', 'ngc': 'NGC 5236', 'name': 'Southern Pinwheel Galaxy', 'type':'Galaxy, barred spiral', 'distance': 10000, 'constellation': 'Hydra', 'mag': 8.5 },
			{ 'm': 'M84', 'ngc': 'NGC 4374', 'name': '', 'type':'Galaxy, lenticular', 'distance': 60000, 'constellation': 'Virgo', 'mag': 11.0 },
			{ 'm': 'M85', 'ngc': 'NGC 4382', 'name': '', 'type':'Galaxy, lenticular', 'distance': 60000, 'constellation': 'Coma Berenices', 'mag': 10.5 },
			{ 'm': 'M86', 'ngc': 'NGC 4406', 'name': '', 'type':'Galaxy, lenticular', 'distance': 60000, 'constellation': 'Virgo', 'mag': 11.0 },
			{ 'm': 'M87', 'ngc': 'NGC 4486', 'name': 'Virgo A', 'type':'Galaxy, elliptical', 'distance': 60000, 'constellation': 'Virgo', 'mag': 11.0 },
			{ 'm': 'M88', 'ngc': 'NGC 4501', 'name': '', 'type':'Galaxy, spiral', 'distance': 60000, 'constellation': 'Coma Berenices', 'mag': 11.0 },
			{ 'm': 'M89', 'ngc': 'NGC 4552', 'name': '', 'type':'Galaxy, elliptical', 'distance': 60000, 'constellation': 'Virgo', 'mag': 11.5 },
			{ 'm': 'M90', 'ngc': 'NGC 4569', 'name': '', 'type':'Galaxy, spiral', 'distance': 60000, 'constellation': 'Virgo', 'mag': 11.0 },
			{ 'm': 'M91', 'ngc': 'NGC 4548', 'name': '', 'type':'Galaxy, barred spiral', 'distance': 60000, 'constellation': 'Coma Berenices', 'mag': 11.0 },
			{ 'm': 'M92', 'ngc': 'NGC 6341', 'name': '', 'type':'Cluster, globular', 'distance': 26, 'constellation': 'Hercules', 'mag': 7.5 },
			{ 'm': 'M93', 'ngc': 'NGC 2447', 'name': '', 'type':'Cluster, open', 'distance': 4.5, 'constellation': 'Puppis', 'mag': 6.5 },
			{ 'm': 'M94', 'ngc': 'NGC 4736', 'name': '', 'type':'Galaxy, spiral', 'distance': 14500, 'constellation': 'Canes Venatici', 'mag': 9.5 },
			{ 'm': 'M95', 'ngc': 'NGC 3351', 'name': '', 'type':'Galaxy, barred spiral', 'distance': 38000, 'constellation': 'Leo', 'mag': 11.0 },
			{ 'm': 'M96', 'ngc': 'NGC 3368', 'name': '', 'type':'Galaxy, spiral', 'distance': 38000, 'constellation': 'Leo', 'mag': 10.5 },
			{ 'm': 'M97', 'ngc': 'NGC 3587', 'name': 'Owl Nebula', 'type':'Nebula, planetary', 'distance': 2.6, 'constellation': 'Ursa Major', 'mag': 9.9 },
			{ 'm': 'M98', 'ngc': 'NGC 4192', 'name': '', 'type':'Galaxy, spiral', 'distance': 60000, 'constellation': 'Coma Berenices', 'mag': 11.0 },
			{ 'm': 'M99', 'ngc': 'NGC 4254', 'name': '', 'type':'Galaxy, spiral', 'distance': 60000, 'constellation': 'Coma Berenices', 'mag': 10.5 },
			{ 'm': 'M100', 'ngc': 'NGC 4321', 'name': '', 'type':'Galaxy, spiral', 'distance': 60000, 'constellation': 'Coma Berenices', 'mag': 10.5 },
			{ 'm': 'M101', 'ngc': 'NGC 5457', 'name': 'Pinwheel Galaxy', 'type':'Galaxy, spiral', 'distance': 27000, 'constellation': 'Ursa Major', 'mag': 7.9 },
			{ 'm': 'M102', 'ngc': '(Not conclusively identified)', 'name': '', 'type':' ', 'distance': -1, 'constellation': '', 'mag': -30 },
			{ 'm': 'M103', 'ngc': 'NGC 581', 'name': '', 'type':'Cluster, open', 'distance': 8, 'constellation': 'Cassiopeia', 'mag': 7.0 },
			{ 'm': 'M104', 'ngc': 'NGC 4594', 'name': 'Sombrero Galaxy', 'type':'Galaxy, spiral', 'distance': 50000, 'constellation': 'Virgo', 'mag': 9.5 },
			{ 'm': 'M105', 'ngc': 'NGC 3379', 'name': '', 'type':'Galaxy, elliptical', 'distance': 38000, 'constellation': 'Leo', 'mag': 11.0 },
			{ 'm': 'M106', 'ngc': 'NGC 4258', 'name': '', 'type':'Galaxy, spiral', 'distance': 25000, 'constellation': 'Canes Venatici', 'mag': 9.5 },
			{ 'm': 'M107', 'ngc': 'NGC 6171', 'name': '', 'type':'Cluster, globular', 'distance': 20, 'constellation': 'Ophiuchus', 'mag': 10.0 },
			{ 'm': 'M108', 'ngc': 'NGC 3556', 'name': '', 'type':'Galaxy, barred spiral', 'distance': 45000, 'constellation': 'Ursa Major', 'mag': 11.0 },
			{ 'm': 'M109', 'ngc': 'NGC 3992', 'name': '', 'type':'Galaxy, barred spiral', 'distance': 55000, 'constellation': 'Ursa Major', 'mag': 11.0 },
			{ 'm': 'M110', 'ngc': 'NGC 205', 'name': '', 'type':'Galaxy, dwarf elliptical', 'distance': 2200, 'constellation': 'Andromeda', 'mag': 10.0 }
		]
		
		this.resize();

		$(document).on('mousemove',{mb:this},function(e){
			var now = new Date();
			mb.moveEyes(e.clientX,e.clientY);
			//console.log('Time '+(new Date()-now)+' ms')
		});

		$(document).on('keypress',{mb:this},function(e){
			if(!e) e = window.event;
			var code = e.keyCode || e.charCode || e.which || 0;
			console.log(code)
			e.data.mb.keypress(code,e);
		});

		this.registerKey('s',function(){  console.log(this); });
		this.registerKey('i',function(){ this.toggleDial(); });
		this.registerKey('1',function(){ this.loadMessierObject(1); });
		this.registerKey('2',function(){ this.loadMessierObject(2); });
		this.registerKey('3',function(){ this.loadMessierObject(3); });
		this.registerKey('4',function(){ this.loadMessierObject(4); });
		this.registerKey('5',function(){ this.loadMessierObject(5); });
		this.registerKey('6',function(){ this.loadMessierObject(6); });
		this.registerKey('7',function(){ this.loadMessierObject(7); });
		this.registerKey('8',function(){ this.loadMessierObject(8); });
		this.registerKey('n',function(){ this.next(); });
		this.registerKey(39,function(){ this.next(); });

		// Set the information toggle to on
		this.setDial(true);

		this.tick();

		return this;
	}
	MessierBingo.prototype.tick = function(){
		this.setTime();
		var _obj = this;
		this.eAnim = setTimeout(function () { _obj.tick(); }, 10000);
	}

	MessierBingo.prototype.resize = function(w,h){
		// Set the width and height (taking into account the borders/padding of the container)
		if(typeof w!=="number") w = $(window).width()-(this.outer.outerWidth() - this.outer.width());
		if(typeof h!=="number") h = $(window).height()-(this.outer.outerHeight() - this.outer.height());
		if(w/h != this.aspect) w = h*this.aspect;
		if(w > $(window).width()){
			w = $(window).width();
			h = parseInt(w/this.aspect);
		}
		this.wide = Math.round(w);
		this.tall = Math.round(h);

		this.outer.css({'width':w+'px','height':h+'px'});
		$('body').css({'font-size':Math.round(h/30)+'px'});
		var attr = {'left':Math.round(0.425*this.wide)+'px','width':Math.round(0.44*this.wide)+'px','top':Math.round(0.299*this.tall)+'px','height':Math.round(0.582*this.tall)+'px'};
		$('#sky').css(attr);
		$('#glass').css(attr);
		
		this.drawBox();

		return this;
	}

	MessierBingo.prototype.loadConfig = function(){
		var lang;
		// Loop over to see if the current language shortcode is valid
		for(var i = 0; i < this.langs.length; i++){
			if(this.langs[i].code==this.langshort || this.langs[i].code==this.lang){
				lang = this.langs[i];
				break;
			}
		}
		lang = this.langs[0];
		if(!lang) return this;

		var dataurl = "config/"+lang.code+".json";

		$.ajax({
			url: dataurl,
			method: 'POST',
			dataType: 'json',
			context: this,
			error: function(){
				$('#loader').show().removeClass('done').addClass('loading').html('<div class="error">Error: couldn\'t load the language/mode at '+dataurl+'.</div>').delay(3000).fadeOut();
			},
			success: function(data){
				this.stages = data.stages;
				$.extend(this.phrasebook, data.phrasebook);
				this.setupMode();
			}
		});
		return this;
	}

	MessierBingo.prototype.updateText = function(){
		// Update title
		if(this.phrasebook.title && $('h1').length > 0) $('h1').html(this.phrasebook.title);

		return this;
	}

	MessierBingo.prototype.getScale = function(){
		return this.wide/1024;
	}

	MessierBingo.prototype.scaleBox = function(){

		var scale = this.getScale();
		var attr = {'transform':'s '+scale+','+scale+',0,0'};

		this.texture.attr(attr);
		this.texture2.attr(attr);
		this.pipes.attr(attr);
		this.frame.attr(attr);
		this.clock.attr(attr);
		this.overlay.attr(attr);
		this.messier.attr(attr);
		this.portal.attr(attr);
		this.nuts.attr(attr);
		this.screws.attr(attr);
		this.dial.attr(attr);
		this.nextbutton.attr(attr);
		//this.glass.attr(attr);

		// We need to be careful scaling things that have a rotation applied
		var todo = new Array();
		for(var h = 0 ; h < this.hands.length ; h++) todo.push(this.hands[h]);
		for(var h = 0 ; h < this.dialhandle.length ; h++) todo.push(this.dialhandle[h]);
		
		var h, t, m, i;
		for(var h = 0 ; h < todo.length ; h++){
			t = todo[h].attr('transform');
			m = false;
			for(i = 0; i < t.length ; i++){
				if(t[i][0] == 's' || t[i][0] == 'S'){
					t[i] = ['S',scale,scale,0,0];
					m = true;
				}
			}
			if(!m) t.push(['S',scale,scale,0,0]);
			todo[h].attr({'transform':t})
		}

		return this;
	}

	MessierBingo.prototype.drawBox = function(){

		if(typeof this.box!=="undefined"){
			this.box.setSize(this.wide,this.tall)
			this.scaleBox();
			return this;
		}

		// Create a canvas to draw on
		this.box = Raphael(this.id, this.wide, this.tall);

		this.texture = this.box.image('images/texture2.jpg',0,0,this.width,this.height);
		this.texture2 = this.box.rect(0,0,this.width,this.height).attr({'fill':'#536814','opacity':0.1});

		// pipes
		this.pipes = this.box.set();
		this.makePipe(860,532,100,100,14);
		this.makePipe(860,562,75,70,14);

		this.frame = this.box.set();
		this.frame.push(
			this.box.path('M 0 0 m 3,4 0,762 1018,0 0,-762 z m 45.21875,19 56.96875,0 c 1.32408,0.12356 2.57855,0.428701 4.125,1.1875 1.81907,0.90954 3.19216,2.97945 3.34375,4.34375 0.15159,1.3643 0.15625,10.71685 0.15625,12.6875 0,1.97066 -0.13259,3.46718 -1.5,5.0625 -1.36741,1.59532 -3.34375,1.96875 -3.34375,1.96875 l 0.3125,0 c -28.842923,8.998584 -51.685182,31.523995 -61.0625,60.09375 l 0,-0.21875 c 0,0 -0.373431,1.97634 -1.96875,3.34375 -1.595318,1.36741 -3.123095,1.5 -5.09375,1.5 -1.970656,0 -10.29195,0.0266 -11.65625,-0.125 C 27.1357,112.69216 25.065784,111.31907 24.15625,109.5 23.492015,108.14627 23.160968,107.02215 23,105.875 l 0,-52.4375 c 14.22898,-1.416 25.34375,-13.42602 25.34375,-28 0,-0.826 -0.055,-1.6295 -0.125,-2.4375 z m 119.21875,0 807,0 c -0.07,0.808 -0.125,1.6115 -0.125,2.4375 0,15.02798 11.8255,27.31775 26.6875,28.09375 L 1001,78 c -0.1827,1.295066 -0.5994,2.835159 -1.59375,4.1875 -1.65727,2.253903 -5.20528,2.721349 -6.875,2.8125 L 870.25,85 c -0.58693,-0.06762 -2.77061,-0.395606 -4.125,-1.75 -1.5625,-1.5625 -1.1875,-2.375 -4.875,-6.4375 C 857.5625,72.75 854.32284,70.44435 851.0625,69 847.80216,67.55565 844.20747,67.20903 843,65.625 841.79253,64.04097 842,63 842,63 l -0.0625,-5.1875 c 0,0 0.39894,-2.40853 -1.3125,-4.4375 C 838.91356,51.34603 835.5,51.5 835.5,51.5 l -354.5,0 c 0,0 -0.21574,-0.01727 -0.5625,0 -1.04029,0.0518 -3.27892,0.353273 -4.5625,1.875 -1.71144,2.02897 -1.3125,4.4375 -1.3125,4.4375 L 474.5,63 c 0,0 0.20747,1.04097 -1,2.625 -1.20747,1.58403 -4.80216,1.93065 -8.0625,3.375 -3.26034,1.44435 -6.5,3.75 -10.1875,7.8125 -3.6875,4.0625 -3.3125,4.875 -4.875,6.4375 -1.35439,1.354394 -3.53807,1.682377 -4.125,1.75 l -72.4375,0 c -0.9805,-0.225281 -2.15168,-0.639449 -3.21875,-1.5 -2.42677,-1.957107 -3.34375,-4.75 -3.34375,-4.75 0,0 -10,-19.25 -34.5,-19.25 -24.5,0 -34.1875,19.53125 -34.1875,19.53125 0,0 -1.13665,3.094669 -3.09375,4.625 -0.93778,0.733284 -2.28345,1.129667 -3.4375,1.34375 l -74.8125,0 C 216.29356,84.89116 214.88055,84.689876 214,84.3125 213.62193,84.150469 213.27715,83.878175 212.96875,83.59375 201.23656,67.039584 184.25231,54.441683 164.40625,48.25 l 0.25,0 c 0,0 -1.97634,-0.37343 -3.34375,-1.96875 -1.36741,-1.59532 -1.5,-3.09184 -1.5,-5.0625 0,-1.97065 0.005,-11.3232 0.15625,-12.6875 0.15159,-1.3643 1.52468,-3.43421 3.34375,-4.34375 1.54645,-0.758799 2.80092,-1.06394 4.125,-1.1875 z m 61.625,92 62.15625,0 c 1.27325,0.16978 3.05748,0.53626 4.25,1.46875 1.9571,1.53033 3.09375,3.875 3.09375,3.875 0,0 9.6875,19.5625 34.1875,19.5625 24.5,0 34.5,-19.25 34.5,-19.25 0,0 0.91698,-2.10539 3.34375,-4.0625 1.21339,-0.97855 2.57679,-1.40089 3.625,-1.59375 L 446,115 l 1.28125,0 c 0.94688,0.0817 2.21484,0.37109 3.09375,1.25 1.5625,1.5625 1.1875,2.375 4.875,6.4375 3.6875,4.0625 6.92716,6.36815 10.1875,7.8125 3.26034,1.44435 6.85503,1.79097 8.0625,3.375 1.20747,1.58403 1,2.625 1,2.625 l 0.0625,5.1875 c 0,0 -0.39894,2.40853 1.3125,4.4375 C 477.58644,148.15397 481,148 481,148 l 124.03125,0 c 8.99518,1.02017 15.14287,4.69754 15.96875,12.65625 l 0,3.96875 0,1.375 c -0.85036,6.63819 -6.11024,11.26693 -12.46875,13.78125 -129.39534,24.62339 -227.21875,138.30887 -227.21875,274.875 0,138.38124 100.4478,253.30291 232.40625,275.84375 l 1.78125,0.375 c 0,0 4.67195,1.66607 5.5,4.75 0.82805,3.08393 0.53206,5.65774 -0.375,7.875 -0.90706,2.21726 -3.625,3.5 -6.875,3.5 l -439.71875,0 -3.28125,0 c -1.84074,-0.17534 -4.08173,-0.70137 -5.65625,-2.0625 -3.14905,-2.72228 -3.25,-5.4375 -3.25,-5.4375 l 0.1875,-15.0625 c 0,0 -0.5553,-2.86612 3.59375,-5.5 1.74862,-1.11005 3.30777,-1.65769 4.5625,-1.9375 l 31.6875,0 c 2.861,0 5.15625,-2.69475 5.15625,-5.59375 l -0.0625,-2.5 c 8.81834,-1.31096 12.48815,-7.89442 12.40625,-14.5625 0,-7.016 -5.78475,-13.1985 -13.09375,-13.6875 l -0.21875,0 -0.0312,-1.40625 c 0,-2.899 -2.29425,-5.25 -5.15625,-5.25 l -126,0 c -0.2745,-0.008 -0.555801,-0.0156 -0.8125,0 -3.850488,0.23457 -5.6875,3.03219 -5.6875,5.75 l 0,0.53125 -0.25,0 c -7.749998,0.693 -13.75775,7.29325 -14.09375,15.03125 0.334,8.144 6.069002,13.1985 13.125,13.6875 l 1.21875,0 0,2.40625 c 0,2.899 2.639,5.59375 5.5,5.59375 l 30.71875,0 c 1.25473,0.27981 2.81388,0.82745 4.5625,1.9375 4.14905,2.63388 3.59375,5.5 3.59375,5.5 l 0.15625,15.0625 c 0,0 -0.10095,2.71522 -3.25,5.4375 -1.57452,1.36113 -3.79207,1.88716 -5.625,2.0625 l -3.28125,0 -52.59375,0 c 0.113,-1.021 0.1875,-2.04375 0.1875,-3.09375 0,-14.575 -11.11477,-26.583 -25.34375,-28 l 0,-548.3125 c 0.160968,-1.14715 0.492015,-2.27127 1.15625,-3.625 0.909534,-1.81907 2.97945,-3.19216 4.34375,-3.34375 1.3643,-0.15159 9.685594,-0.15625 11.65625,-0.15625 1.970655,0 3.498432,0.16384 5.09375,1.53125 0.39883,0.34185 0.709399,0.71911 0.96875,1.09375 9.216969,32.0417 35.206662,56.99636 67.90625,64.90625 0.72294,0.21187 1.87811,0.63578 2.375,1.5 0.73614,1.28033 0.5,2 0.5,3 0,1 0.0327,1.95521 -0.6875,2.75 -0.72015,0.79479 -4.0625,0.78125 -4.0625,0.78125 L 73.5,236 c 0,0 -2.775412,-0.27189 -4.65625,1.53125 -1.880837,1.80314 -1.53125,5.125 -1.53125,5.125 0,0 -13.28125,0.39958 -13.28125,13.8125 0,13.41291 12.40625,14.5 12.40625,14.5 0,0 -0.573224,3.98391 1,5.96875 1.573223,1.98483 4.09375,2.03125 4.09375,2.03125 l 129.09375,0 c 0,0 2.52053,-0.0464 4.09375,-2.03125 1.57323,-1.98484 1,-5.96875 1,-5.96875 0,0 13.10448,-0.57636 13.28125,-13.8125 0.17678,-13.23615 -14.1875,-14.5 -14.1875,-14.5 0,0 0.34958,-3.32186 -1.53125,-5.125 -1.88084,-1.80314 -4.625,-1.53125 -4.625,-1.53125 l -36.75,0.0312 c 0,0 -3.3736,0.0135 -4.09375,-0.78125 -0.72018,-0.79479 -0.65625,-1.75 -0.65625,-2.75 0,-1 -0.23614,-1.71967 0.5,-3 0.51793,-0.9008 1.80302,-1.54796 2.53125,-1.875 40.23161,-10.49383 69.90625,-46.93466 69.90625,-90.28125 0,-7.17018 -0.83507,-14.16694 -2.375,-20.875 -0.005,-0.0199 0.005,-0.0426 0,-0.0625 0.0332,-0.24031 0.11742,-0.49778 0.25,-0.71875 0.21428,-0.35714 0.63926,-0.56066 1.09375,-0.6875 z m 640.15625,0 1.28125,0 122.34375,0 c 1.75534,0.18917 4.96333,0.74413 6.46875,2.375 2.1213,2.2981 1.5937,6.96875 1.5937,6.96875 l 0.094,0 0,592.46875 c -14.861,0.775 -26.6875,13.0345 -26.6875,28.0625 0,0.713 0.0408,1.426 0.0937,2.125 L 708.5,747 c -3.25,0 -5.96794,-1.28274 -6.875,-3.5 -0.90706,-2.21726 -1.20305,-4.79107 -0.375,-7.875 0.82805,-3.08393 5.5,-4.75 5.5,-4.75 l 1.53125,-0.3125 C 840.39394,708.15064 941,593.14734 941,454.65625 941,392.99055 921.04023,335.99957 887.25,289.75 c 7.32474,2.55276 15.18036,3.96875 23.375,3.96875 39.236,0 71.03125,-31.8265 71.03125,-71.0625 0,-39.235 -31.79525,-71.03125 -71.03125,-71.03125 -39.236,0 -71.03125,31.79625 -71.03125,71.03125 0,6.38525 0.82681,12.58252 2.40625,18.46875 -36.96772,-31.34114 -82.1679,-53.25199 -131.90625,-62.03125 -4.86404,-2.37026 -8.38174,-6.5756 -9.09375,-11.5625 l 0,-3.6875 c 0,-11.1 6.00163,-15.59874 16.21875,-15.84375 L 835.5,148 c 0,0 3.41356,0.15397 5.125,-1.875 1.71144,-2.02897 1.3125,-4.4375 1.3125,-4.4375 L 842,136.5 c 0,0 -0.20747,-1.04097 1,-2.625 1.20747,-1.58403 4.80216,-1.93065 8.0625,-3.375 3.26034,-1.44435 6.5,-3.75 10.1875,-7.8125 3.6875,-4.0625 3.3125,-4.875 4.875,-6.4375 0.87891,-0.87891 2.14687,-1.16829 3.09375,-1.25 z'),
			this.box.path('M 0 0 m 204,681 -1,0 0,-1 c 0,-2.762 -2.239,-5 -5,-5 l -125,0 c -2.761,0 -5,2.238 -5,5 l 0,1 c -7,0.666 -13,5.82 -13,13 0,7.18 5.82,13 13,13 l 0,3 c 0,2.762 2.239,5 5,5 l 31.922,0 c 5.228,0.793 9.285,4.506 10.078,9.775 l 0,13.805 c -1,5.413 -5.571,9.42 -11,10.42 l -11,0 0,19 84,0 0,-19 -8,0 c -5.429,-1 -10,-5.007 -11,-10.42 l 0,-13.805 c 0.793,-5.27 4.85,-8.982 10.078,-9.775 l 29.922,0 c 2.761,0 5,-2.238 5,-5 l 0,-3 1,0 c 7.833,-0.666 13,-5.82 13,-13 0,-7.18 -5.167,-12.334 -13,-13 m 22.999,-545 c 0,-7.565 -0.929,-14.913 -2.669,-21.94 0.617,-1.217 2.033,-2.06 4.45,-2.06 l 0.386,-16.584 -14.386,-9.416 c -1.664,0 -2.845,-0.55 -3.631,-1.324 -0.279,-0.408 -0.56,-0.816 -0.845,-1.219 -0.142,-0.322 -0.305,-0.424 -0.305,-0.424 -11.422,-15.93 -27.858,-28.021 -47.002,-33.961 -3.055,-1.883 -5.328,-4.87 -5.998,-8.492 l 0,-11.806 c 0.794,-5.269 4.851,-8.981 10.079,-9.774 l 12.921,0 0,-18 -88,0 0,18 11.922,0 c 5.228,0.793 9.285,4.505 10.078,9.774 l 0,11.806 c -0.783,4.242 -3.765,7.613 -7.629,9.357 -0.745,0.257 -1.485,0.523 -2.22,0.798 -0.379,0.102 -0.762,0.193 -1.151,0.265 l 0.455,0 c -24.982,9.571 -44.666,29.833 -53.455,55.191 l 0,-0.347 c 0,0.135 -0.012,0.268 -0.019,0.402 -0.437,1.263 -0.845,2.54 -1.227,3.827 -1.269,1.992 -3.4,3.451 -5.904,3.927 l -14.68,0 c -4.05,-1 -7.421,-4.943 -8.17,-9.005 l 0,-13.995 -19,0 0,81 19,0 0,-7 c 0.749,-4.062 4.12,-7 8.17,-8 l 13.68,0 c 5.234,0.083 7.15,5.756 7.15,5.756 9.068,29.518 32.745,52.639 62.595,60.929 -0.15,-0.012 -0.294,-0.019 -0.428,-0.019 l 0.436,0.022 c 0.861,0.238 1.729,0.463 2.601,0.678 1.928,0.828 3.796,2.425 3.796,4.967 l 0,2.68 c -0.078,3.388 -1.077,4.591 -3.081,4.987 l -41.919,0 c -2.761,0 -5,2.238 -5,5 l 0,1 c -7,0.666 -13,5.82 -13,13 0,7.179 5.821,13 13,13 l 0,3 c 0,2.761 2.239,5 5,5 l 125,0 c 2.762,0 5,-2.239 5,-5 l 0,-3 1,0 c 7.834,-0.667 13,-5.821 13,-13 0,-7.18 -5.166,-12.334 -13,-13 l -1,0 0,-1 c 0,-2.762 -2.238,-5 -5,-5 l -37.833,0 c -3.938,-0.455 -5.533,-1.331 -6.167,-4.738 l 0,-2.262 c 0,-2.616 1.212,-4.579 3.424,-5.543 0.747,-0.181 1.49,-0.37 2.23,-0.569 0.119,-0.014 0.224,-0.044 0.346,-0.055 l -0.158,0.004 c 38.694,-10.477 67.158,-45.83 67.158,-87.837 m 797.001,-136 -1024,0 0,768 1024,0 z m -47,746.667 c 0,0.786 0.041,1.563 0.104,2.333 l -931.64,0 c 0.129,-1.094 0.202,-2.205 0.202,-3.333 0,-14.749 -11.269,-26.859 -25.666,-28.204 l 0,-667.592 c 14.397,-1.345 25.666,-13.456 25.666,-28.204 0,-0.9 -0.047,-1.789 -0.129,-2.667 l 931.592,0 c -0.082,0.878 -0.129,1.767 -0.129,2.667 0,15.201 11.972,27.603 27,28.299 l 0,668.401 c -15.028,0.697 -27,13.099 -27,28.3 m 27,-680.667 0,11.423 c -0.666,5.41 -1.999,7.91 -9.173,8.577 l -780.047,0 c -3.03,0 -4.509,-1.792 -4.78,-3.524 l 0,3.524 -1,0 7.909,26 7.091,0 0,3.048 c 0.271,-1.732 1.75,-3.048 4.78,-3.048 l 765.772,0 c 5.651,-0.154 9.203,1.982 9.447,9.569 l 0,1.969 0,16.462 20,0 0,-74 z m -630,19.895 c -4,-0.464 -5.192,-1.916 -6.761,-4.327 -6.354,-12.443 -19.311,-20.968 -34.24,-20.968 -14.989,0 -27.977,8.592 -34.302,21.115 -1.517,2.323 -2.608,3.725 -6.617,4.18 l -0.006,26.006 c 3.644,0.413 4.869,1.608 6.202,3.566 6.165,12.967 19.381,21.932 34.695,21.932 15.277,0 28.524,-8.921 34.708,-21.838 1.358,-2.013 2.321,-3.24 6.321,-3.66 z m 494.562,0.105 c 0,0 -2.125,0.188 -3.301,-0.31 -0.257,-0.108 -0.453,-0.285 -0.646,-0.438 -4.292,-8.473 -12.305,-14.74 -21.894,-16.645 -0.83,-0.276 -1.949,-0.75 -2.731,-1.471 -0.609,-0.561 -0.876,-1.519 -0.991,-2.343 l 0,-5.928 c 0,-3.044 -1.97,-5.865 -5.013,-5.865 l -351.413,0 c -3.044,0 -5.574,2.821 -5.574,5.865 l 0,5.457 -0.025,-0.87 c 0.01,0.654 -0.041,2.734 -1.059,3.684 -0.799,0.745 -1.949,1.224 -2.777,1.496 -8.881,1.805 -16.395,7.359 -20.835,14.933 -0.4,0.579 -1.092,1.457 -1.887,1.935 -0.736,0.441 -3.104,0.5 -3.104,0.5 l -4.5,13.063 3.354,12.937 c 0,0 2.466,0.035 3.5,0.5 1.667,0.75 2.667,3.167 2.667,3.167 l -0.108,-0.367 c 4.368,7.536 11.772,13.09 20.543,14.985 0.697,0.207 2.079,0.704 2.904,1.588 0.925,0.991 1.228,2.431 1.327,3.169 l 0,4.093 c 0,3.044 2.53,5.865 5.574,5.865 l 351.414,0 c 3.043,0 5.013,-2.821 5.013,-5.865 l 0,-4.017 c 0.088,-0.749 0.384,-2.383 1.358,-3.483 0.544,-0.614 1.455,-0.993 2.264,-1.224 0.421,-0.082 0.837,-0.176 1.253,-0.275 0.254,-0.039 0.414,-0.054 0.414,-0.054 l -0.221,0.01 c 8.744,-2.142 16.051,-7.937 20.208,-15.68 0.313,-0.467 0.907,-1.16 1.947,-1.741 1.651,-0.924 2.714,-0.733 2.714,-0.733 l 3.125,-12.875 z m 68.937,367.794 c 0,-135.604 -97.49,-248.421 -226.202,-272.225 -7.906,-2.557 -13.946,-7.853 -14.283,-17.955 0.404,-12.353 6.729,-18.614 18.672,-18.614 l 11.314,0 -137,0 14.911,0 c 12.94,1.318 19.266,6.882 19.086,18.45 -0.929,9.427 -9.057,16.338 -18.356,18.949 -126.562,25.507 -221.873,137.316 -221.873,271.395 0,135.916 97.941,248.951 227.096,272.396 l -0.072,0.013 c 9.937,1.528 13.026,3.543 13.204,11.343 -0.51,9.476 -3.221,11.497 -12.934,11.362 l 1.099,0.093 -15.161,0 0,17 127,0 0,-17 -16.237,0 c -5.827,-0.297 -10.413,-2.119 -10.735,-10.963 0.203,-5.913 2.163,-9.243 7.586,-10.868 2.064,-0.329 4.122,-0.677 6.17,-1.052 0.191,-0.016 0.366,-0.037 0.562,-0.053 l -0.166,-0.022 c 128.77,-23.759 226.319,-136.606 226.319,-272.249 m -27.499,-300.60654 c -38.016,0 -68.8125,30.82975 -68.8125,68.84375 0,9.58796 1.958,18.70666 5.5,27 5.1309,4.74343 11.1041,10.54055 16.375,16.40625 5.1869,5.77213 10.3052,11.99332 14.5313,17.3125 9.6658,5.17442 20.676,8.125 32.4062,8.125 38.014,0 68.8438,-30.82875 68.8438,-68.84375 0,-38.014 -30.8308,-68.84375 -68.8438,-68.84375 z')
		)
		this.frame[0].attr({'fill':'#2a2521','opacity':0.8,'stroke':0});
		this.frame[1].attr({'fill':'0-#998675-#816f60:100','stroke':0});
		this.frame[1].attr({'fill':"url('images/texture3.jpg')",'stroke':0});

		this.clock = this.box.set();
		this.clock.push(
			this.box.circle(910.1875,222,63).attr({'fill':'270-#534741-#5c5048:25-#766a5c:66-#857968:87-#857968:100','stroke':0}),
			this.box.circle(910.1875,222,59).attr({'fill':'#534741','stroke':0}),
			this.box.circle(910.1875,222,57).attr({'fill':'90-#ad8a57-#be9c67:34-#ddbc83:100','stroke':0}),
			this.box.circle(910.1875,222,55).attr({'fill':'#f8f7f6','stroke':0}),
			this.box.path('M 910 167 C 895.5955 167.4375 881.8825 173.1195 871.5625 183.4375 C 861.2445 193.7575 855.5625 207.4675 855.5625 222.0625 C 855.5625 236.6555 861.2445 250.3675 871.5625 260.6875 C 881.8815 271.0065 895.5955 276.6875 910.1875 276.6875 C 924.7825 276.6875 938.52475 271.0065 948.84375 260.6875 C 959.16575 250.3675 964.84375 236.6555 964.84375 222.0625 C 964.84375 207.4675 959.16575 193.7565 948.84375 183.4375 C 938.52575 173.1195 924.7825 167.4375 910.1875 167.4375 z M 909.625 167.8125 L 909.625 172.125 C 908.084 172.142 906.54525 172.221 905.03125 172.375 L 904.59375 168.09375 C 906.24775 167.92275 907.933 167.8305 909.625 167.8125 z M 910.78125 167.8125 C 912.37725 167.8295 913.97125 167.9105 915.53125 168.0625 L 915.125 172.34375 C 913.694 172.20575 912.23225 172.141 910.78125 172.125 L 910.78125 167.8125 z M 915.9375 168.125 C 917.6995 168.311 919.416 168.5875 921.125 168.9375 L 920.28125 173.125 C 918.70025 172.803 917.08375 172.543 915.46875 172.375 L 915.9375 168.125 z M 904.1875 168.15625 L 904.65625 172.40625 C 903.03925 172.58325 901.454 172.8585 899.875 173.1875 L 899 168.96875 C 900.706 168.60875 902.4235 168.35125 904.1875 168.15625 z M 921.53125 169 C 923.26125 169.368 924.96 169.81375 926.625 170.34375 L 925.34375 174.4375 C 923.80675 173.9485 922.24425 173.5235 920.65625 173.1875 L 921.53125 169 z M 898.59375 169.0625 L 899.5 173.25 C 897.912 173.594 896.3485 174.03625 894.8125 174.53125 L 893.5 170.4375 C 895.164 169.8985 896.86475 169.4415 898.59375 169.0625 z M 927.03125 170.5 C 928.70725 171.048 930.3345 171.67 931.9375 172.375 L 930.21875 176.28125 C 928.73875 175.63225 927.2265 175.0625 925.6875 174.5625 L 927.03125 170.5 z M 893.125 170.5625 L 894.46875 174.625 C 892.93275 175.133 891.4165 175.718 889.9375 176.375 L 888.1875 172.46875 C 889.7895 171.75575 891.449 171.1175 893.125 170.5625 z M 910.1875 172.5 C 937.5175 172.5 959.75 194.7335 959.75 222.0625 C 959.751 249.3915 937.5175 271.625 910.1875 271.625 C 882.8595 271.625 860.625 249.3915 860.625 222.0625 C 860.625 194.7335 882.8595 172.5 910.1875 172.5 z M 932.3125 172.53125 C 933.8405 173.21525 935.33225 173.96425 936.78125 174.78125 L 934.65625 178.5 C 933.32125 177.748 931.9565 177.0625 930.5625 176.4375 L 932.3125 172.53125 z M 887.84375 172.65625 L 889.59375 176.53125 C 888.26375 177.13225 886.9565 177.782 885.6875 178.5 L 883.65625 174.78125 C 885.01525 174.01525 886.41475 173.30425 887.84375 172.65625 z M 882.65625 175.34375 L 884.6875 179.09375 C 883.3885 179.86675 882.13825 180.69775 880.90625 181.59375 L 878.40625 178.15625 C 879.77825 177.16125 881.19425 176.20975 882.65625 175.34375 z M 937.78125 175.375 C 939.15625 176.191 940.48925 177.072 941.78125 178 L 939.3125 181.4375 C 938.1345 180.5915 936.9225 179.7995 935.6875 179.0625 L 937.78125 175.375 z M 912.78125 176 L 910.53125 176.03125 L 910.5625 176.5625 C 910.5625 176.5625 910.77732 176.59881 910.9375 176.71875 C 911.09768 176.83866 911.19275 177.03285 911.28125 177.1875 C 911.36969 177.34213 911.375 177.875 911.375 177.875 L 911.3125 190 C 911.3125 190 911.3162 190.78814 911.25 191.03125 C 911.18383 191.27435 911.0731 191.36905 910.9375 191.46875 C 910.80191 191.56841 910.46875 191.625 910.46875 191.625 L 910.46875 192.125 L 912.71875 192.125 L 912.71875 191.59375 C 912.71875 191.59375 912.57763 191.56967 912.40625 191.46875 C 912.23486 191.36788 912.06505 191.1849 911.96875 191 C 911.87248 190.81513 911.84375 189.84375 911.84375 189.84375 L 911.90625 178.1875 C 911.90625 178.1875 911.92945 177.72206 911.96875 177.4375 C 912.00802 177.15293 912.05498 177.08793 912.25 176.84375 C 912.445 176.59953 912.78125 176.5625 912.78125 176.5625 L 912.78125 176 z M 915.84375 176 L 913.59375 176.03125 L 913.625 176.5625 C 913.625 176.5625 913.83982 176.59881 914 176.71875 C 914.16018 176.83866 914.25525 177.03285 914.34375 177.1875 C 914.43219 177.34213 914.4375 177.875 914.4375 177.875 L 914.375 190 C 914.375 190 914.3787 190.78814 914.3125 191.03125 C 914.24633 191.27435 914.1356 191.36905 914 191.46875 C 913.86441 191.56841 913.53125 191.625 913.53125 191.625 L 913.53125 192.125 L 915.78125 192.125 L 915.78125 191.59375 C 915.78125 191.59375 915.64013 191.56967 915.46875 191.46875 C 915.29736 191.36788 915.12755 191.1849 915.03125 191 C 914.93498 190.81513 914.90625 189.84375 914.90625 189.84375 L 914.96875 178.1875 C 914.96875 178.1875 914.99195 177.72206 915.03125 177.4375 C 915.07052 177.15293 915.11748 177.08793 915.3125 176.84375 C 915.5075 176.59953 915.84375 176.5625 915.84375 176.5625 L 915.84375 176 z M 904.28125 176.03125 L 904.28125 176.53125 C 904.28125 176.53125 904.51562 176.625 904.71875 176.8125 C 904.92187 177 904.9375 177.125 905.09375 177.4375 C 905.25005 177.75 905.34375 178.4375 905.34375 178.4375 L 906.78125 184.28125 L 905.15625 190.3125 C 905.15625 190.3125 904.875 191.125 904.71875 191.34375 C 904.5625 191.5625 904.25 191.625 904.25 191.625 L 904.21875 192.15625 L 906.0625 192.15625 L 906.0625 191.65625 C 906.0625 191.65625 905.75 191.625 905.625 191.5 C 905.5 191.375 905.34375 191.09375 905.34375 190.875 C 905.34375 190.65625 905.46875 190.03125 905.46875 190.03125 L 906.625 185.21875 L 907 185.21875 L 908.0625 190.34375 C 908.0625 190.34375 908.15625 190.81255 908.15625 190.90625 C 908.15625 191 908.125 191.125 907.96875 191.375 C 907.8125 191.62505 907.375 191.65625 907.375 191.65625 L 907.375 192.15625 L 909.75 192.15625 L 909.75 191.65625 C 909.75 191.65625 909.5 191.625 909.34375 191.5 C 909.1875 191.375 908.75 189.96875 908.75 189.96875 L 907.1875 183.4375 L 908.6875 177.71875 C 908.6875 177.71875 908.84477 177.13356 909.0625 176.875 C 909.3125 176.57812 909.53125 176.5625 909.53125 176.5625 L 909.5625 176.03125 L 907.75 176.03125 L 907.75 176.53125 C 907.75 176.53125 907.9375 176.5938 908.09375 176.6875 C 908.25 176.78125 908.34375 176.90625 908.40625 177.375 C 908.46875 177.84375 908.21875 178.65625 908.21875 178.65625 L 907.21875 182.59375 L 906.96875 182.59375 L 905.9375 178 C 905.9375 178 905.75056 177.25236 906.09375 176.8125 C 906.29717 176.56949 906.59375 176.5625 906.59375 176.5625 L 906.59375 176.03125 L 904.28125 176.03125 z M 942.125 178.21875 C 943.547 179.25575 944.90575 180.36425 946.21875 181.53125 L 943.375 184.71875 C 942.16 183.63575 940.89575 182.6365 939.59375 181.6875 L 942.125 178.21875 z M 878.0625 178.375 L 880.59375 181.8125 C 879.30175 182.7685 878.05275 183.81625 876.84375 184.90625 L 873.96875 181.71875 C 875.27475 180.54575 876.6465 179.42 878.0625 178.375 z M 891.46875 179.21875 L 889.53125 180.375 L 889.8125 180.84375 C 889.8125 180.84375 890.01987 180.75915 890.21875 180.78125 C 890.41762 180.80334 890.62657 180.9116 890.78125 181 C 890.93593 181.08839 891.21875 181.53125 891.21875 181.53125 L 897.28125 192.03125 C 897.28125 192.03125 897.6837 192.69443 897.75 192.9375 C 897.81629 193.18057 897.78505 193.34532 897.71875 193.5 C 897.65246 193.65468 897.375 193.84375 897.375 193.84375 L 897.6875 194.28125 L 899.59375 193.15625 L 899.34375 192.6875 C 899.34375 192.6875 899.19888 192.71875 899 192.71875 C 898.80113 192.71875 898.55178 192.67299 898.375 192.5625 C 898.19823 192.45202 897.6875 191.625 897.6875 191.625 L 891.8125 181.5625 C 891.8125 181.5625 891.61049 181.10892 891.5 180.84375 C 891.3895 180.57859 891.3933 180.49686 891.4375 180.1875 C 891.48169 179.87814 891.75 179.71875 891.75 179.71875 L 891.46875 179.21875 z M 888.84375 180.78125 L 887.25 181.6875 L 887.53125 182.125 C 887.53125 182.125 887.72408 182.0595 887.90625 182.0625 C 888.08844 182.06556 888.24275 182.1253 888.53125 182.5 C 888.81975 182.8747 888.96875 183.71875 888.96875 183.71875 L 890.09375 187.625 L 889.875 187.75 L 886.6875 184.28125 C 886.6875 184.28125 886.14145 183.74003 886.21875 183.1875 C 886.27342 182.87534 886.5625 182.71875 886.5625 182.71875 L 886.28125 182.25 L 884.25 183.40625 L 884.53125 183.875 C 884.53125 183.875 884.76159 183.8142 885.03125 183.875 C 885.30091 183.93582 885.39594 184.05749 885.6875 184.25 C 885.97911 184.44248 886.375 184.96875 886.375 184.96875 L 890.5625 189.3125 L 892.15625 195.34375 C 892.15625 195.34375 892.30715 196.20118 892.28125 196.46875 C 892.25531 196.73632 892.03125 196.9375 892.03125 196.9375 L 892.28125 197.40625 L 893.875 196.5 L 893.625 196.0625 C 893.625 196.0625 893.32701 196.1708 893.15625 196.125 C 892.9855 196.07925 892.70313 195.93944 892.59375 195.75 C 892.48438 195.56056 892.28125 194.9375 892.28125 194.9375 L 890.875 190.1875 L 891.21875 190 L 894.6875 193.90625 C 894.6875 193.90625 895.0156 194.26265 895.0625 194.34375 C 895.1094 194.42494 895.1353 194.54912 895.125 194.84375 C 895.1147 195.13842 894.75 195.375 894.75 195.375 L 895 195.8125 L 897.0625 194.65625 L 896.8125 194.21875 C 896.8125 194.21875 896.57281 194.31135 896.375 194.28125 C 896.17718 194.25112 895.09375 193.25 895.09375 193.25 L 890.46875 188.375 L 888.90625 182.65625 C 888.90625 182.65625 888.7532 182.08278 888.8125 181.75 C 888.88056 181.36789 889.09375 181.25 889.09375 181.25 L 888.84375 180.78125 z M 932.0625 181.09375 L 931.75 181.59375 C 931.75 181.59375 932.01831 181.75314 932.0625 182.0625 C 932.1067 182.37186 932.14175 182.45359 932.03125 182.71875 C 931.92076 182.98392 931.6875 183.4375 931.6875 183.4375 L 925.8125 193.5 C 925.8125 193.5 925.30177 194.32702 925.125 194.4375 C 924.94822 194.54799 924.69887 194.59375 924.5 194.59375 C 924.30112 194.59375 924.1875 194.5625 924.1875 194.5625 L 923.90625 195.03125 L 925.84375 196.15625 L 926.125 195.71875 C 926.125 195.71875 925.84754 195.52968 925.78125 195.375 C 925.71495 195.22032 925.68371 195.05557 925.75 194.8125 C 925.8163 194.56943 926.21875 193.90625 926.21875 193.90625 L 932.28125 183.40625 C 932.28125 183.40625 932.56407 182.96339 932.71875 182.875 C 932.87343 182.7866 933.08238 182.67834 933.28125 182.65625 C 933.48013 182.63415 933.6875 182.71875 933.6875 182.71875 L 933.96875 182.25 L 932.0625 181.09375 z M 946.53125 181.8125 C 947.83525 182.9905 949.062 184.23425 950.25 185.53125 L 947.09375 188.40625 C 946.57875 187.84425 946.07525 187.292 945.53125 186.75 C 944.92425 186.144 944.28725 185.54075 943.65625 184.96875 L 946.53125 181.8125 z M 873.6875 182 L 876.5625 185.15625 C 875.9935 185.67525 875.422 186.204 874.875 186.75 C 874.273 187.352 873.691 187.96775 873.125 188.59375 L 869.96875 185.71875 C 871.14875 184.41475 872.3905 183.184 873.6875 182 z M 950.53125 185.8125 C 951.70825 187.1165 952.828 188.49325 953.875 189.90625 L 950.4375 192.4375 C 949.4785 191.1435 948.43475 189.8975 947.34375 188.6875 L 950.53125 185.8125 z M 869.6875 186.03125 L 872.875 188.875 C 871.792 190.088 870.7635 191.326 869.8125 192.625 L 866.375 190.125 C 867.413 188.704 868.5175 187.34225 869.6875 186.03125 z M 954.09375 190.21875 C 955.10375 191.60675 956.0625 193.04925 956.9375 194.53125 L 953.1875 196.59375 C 952.4055 195.27875 951.56625 193.998 950.65625 192.75 L 954.09375 190.21875 z M 866.15625 190.4375 L 869.59375 192.9375 C 868.73675 194.1265 867.9325 195.33975 867.1875 196.59375 L 863.5 194.5 C 864.324 193.111 865.21625 191.7435 866.15625 190.4375 z M 910.1875 194.59375 C 895.0395 194.59375 882.71875 206.9145 882.71875 222.0625 C 882.71875 237.2085 895.0405 249.53125 910.1875 249.53125 C 925.3355 249.53125 937.65625 237.2085 937.65625 222.0625 C 937.65625 206.9145 925.3355 194.59375 910.1875 194.59375 z M 862.90625 195.5 L 866.625 197.625 C 865.883 198.946 865.1795 200.27725 864.5625 201.65625 L 860.6875 199.90625 C 861.3655 198.39525 862.09625 196.933 862.90625 195.5 z M 957.5 195.53125 C 958.253 196.87225 958.95075 198.24825 959.59375 199.65625 L 955.71875 201.4375 C 955.12575 200.1305 954.48625 198.84875 953.78125 197.59375 L 957.5 195.53125 z M 910.1875 196.90625 C 924.0485 196.90625 935.34375 208.1985 935.34375 222.0625 C 935.34375 235.9255 924.0485 247.21875 910.1875 247.21875 C 896.3235 247.21875 885.0625 235.9255 885.0625 222.0625 C 885.0625 208.1995 896.3245 196.90625 910.1875 196.90625 z M 871 196.9375 L 870.09375 198.5 L 870.53125 198.75 C 870.53125 198.75 870.68446 198.5885 870.84375 198.5 C 871.00307 198.41153 871.15654 198.4135 871.59375 198.59375 C 872.03096 198.77398 872.59375 199.40625 872.59375 199.40625 L 875.5 202.25 L 875.375 202.46875 L 870.875 201.0625 C 870.875 201.0625 870.14683 200.86091 869.9375 200.34375 C 869.82876 200.04609 870 199.75 870 199.75 L 869.53125 199.5 L 868.34375 201.5 L 868.8125 201.75 C 868.8125 201.75 868.98604 201.5822 869.25 201.5 C 869.51395 201.4178 869.65122 201.4791 870 201.5 C 870.34876 201.52089 870.96875 201.78125 870.96875 201.78125 L 876.75 203.46875 L 881.15625 207.875 C 881.15625 207.875 881.73239 208.53656 881.84375 208.78125 C 881.95489 209.02593 881.84375 209.3125 881.84375 209.3125 L 882.28125 209.625 L 883.21875 208.03125 L 882.78125 207.78125 C 882.78125 207.78125 882.57701 208.0168 882.40625 208.0625 C 882.2355 208.1083 881.93944 208.10938 881.75 208 C 881.56056 207.89064 881.0625 207.46875 881.0625 207.46875 L 877.46875 204.0625 L 877.65625 203.75 L 882.625 205.375 C 882.625 205.375 883.07505 205.54685 883.15625 205.59375 C 883.23747 205.64063 883.33035 205.70843 883.46875 205.96875 C 883.60717 206.22909 883.4375 206.625 883.4375 206.625 L 883.875 206.875 L 885.0625 204.8125 L 884.625 204.59375 C 884.625 204.59375 884.46757 204.77095 884.28125 204.84375 C 884.09486 204.91658 882.65625 204.59375 882.65625 204.59375 L 876.21875 202.6875 L 872.03125 198.53125 C 872.03125 198.53125 871.58379 198.0991 871.46875 197.78125 C 871.33668 197.4163 871.46875 197.21875 871.46875 197.21875 L 871 196.9375 z M 949.3125 197.21875 L 948.8125 197.46875 C 948.8125 197.46875 948.9061 197.67734 948.875 197.875 C 948.84401 198.07269 948.68905 198.2557 948.59375 198.40625 C 948.49847 198.55674 948.0625 198.84375 948.0625 198.84375 L 937.3125 204.4375 C 937.3125 204.4375 936.62081 204.78845 936.375 204.84375 C 936.12919 204.89905 935.96408 204.85445 935.8125 204.78125 C 935.66096 204.70807 935.46875 204.4375 935.46875 204.4375 L 935.03125 204.71875 L 936.09375 206.6875 L 936.53125 206.4375 C 936.53125 206.4375 936.52225 206.29246 936.53125 206.09375 C 936.54017 205.89508 936.63169 205.67163 936.75 205.5 C 936.86832 205.3284 937.6875 204.84375 937.6875 204.84375 L 948 199.4375 C 948 199.4375 948.44888 199.2234 948.71875 199.125 C 948.98862 199.0265 949.06794 199.0669 949.375 199.125 C 949.6821 199.18305 949.875 199.4375 949.875 199.4375 L 950.375 199.1875 L 949.3125 197.21875 z M 959.78125 200.03125 C 960.49525 201.63125 961.1285 203.2625 961.6875 204.9375 L 957.625 206.3125 C 957.117 204.7755 956.531 203.25825 955.875 201.78125 L 959.78125 200.03125 z M 950.8125 200.21875 L 950.3125 200.46875 C 950.3125 200.46875 950.4061 200.67734 950.375 200.875 C 950.34401 201.07269 950.18905 201.2557 950.09375 201.40625 C 949.99847 201.55674 949.5625 201.84375 949.5625 201.84375 L 938.8125 207.4375 C 938.8125 207.4375 938.12081 207.78845 937.875 207.84375 C 937.62919 207.89905 937.46408 207.85445 937.3125 207.78125 C 937.16096 207.70807 936.96875 207.4375 936.96875 207.4375 L 936.53125 207.71875 L 937.59375 209.6875 L 938.03125 209.4375 C 938.03125 209.4375 938.02225 209.29246 938.03125 209.09375 C 938.04017 208.89508 938.13169 208.67163 938.25 208.5 C 938.36832 208.3284 939.1875 207.84375 939.1875 207.84375 L 949.5 202.4375 C 949.5 202.4375 949.94888 202.2234 950.21875 202.125 C 950.48862 202.0265 950.56794 202.0669 950.875 202.125 C 951.1821 202.18305 951.375 202.4375 951.375 202.4375 L 951.875 202.1875 L 950.8125 200.21875 z M 860.53125 200.28125 L 864.4375 202 C 863.7875 203.482 863.1875 204.99125 862.6875 206.53125 L 858.625 205.21875 C 859.175 203.54175 859.82525 201.88525 860.53125 200.28125 z M 961.8125 205.34375 C 962.3555 207.00575 962.8085 208.7095 963.1875 210.4375 L 959 211.34375 C 958.655 209.75875 958.246 208.19325 957.75 206.65625 L 961.8125 205.34375 z M 858.5 205.59375 L 862.59375 206.90625 C 862.10475 208.44625 861.68075 210.00475 861.34375 211.59375 L 857.15625 210.6875 C 857.52625 208.9585 857.968 207.25875 858.5 205.59375 z M 963.28125 210.8125 C 963.64125 212.5175 963.927 214.26925 964.125 216.03125 L 959.84375 216.5 C 959.66675 214.883 959.3925 213.29575 959.0625 211.71875 L 963.28125 210.8125 z M 857.0625 211.09375 L 861.28125 211.96875 C 860.95825 213.54675 860.70325 215.135 860.53125 216.75 L 856.25 216.3125 C 856.438 214.5485 856.7105 212.80275 857.0625 211.09375 z M 964.15625 216.4375 C 964.32225 218.0395 964.4175 219.64425 964.4375 221.28125 L 960.15625 221.28125 C 960.13325 219.79825 960.026 218.335 959.875 216.875 L 964.15625 216.4375 z M 856.21875 216.71875 L 860.5 217.125 C 860.361 218.536 860.27 219.97325 860.25 221.40625 L 855.96875 221.40625 C 855.98875 219.82825 856.06775 218.26175 856.21875 216.71875 z M 956.28125 216.96875 L 955.75 217 C 955.75 217 955.71086 217.21275 955.59375 217.375 C 955.47666 217.53725 955.27809 217.62755 955.125 217.71875 C 954.97193 217.80987 954.4375 217.84375 954.4375 217.84375 L 942.34375 218 C 942.34375 218 941.55674 217.9994 941.3125 217.9375 C 941.06827 217.87558 940.94579 217.75886 940.84375 217.625 C 940.74168 217.49117 940.6875 217.15625 940.6875 217.15625 L 940.15625 217.1875 L 940.21875 219.4375 L 940.75 219.4375 C 940.75 219.4375 940.7773 219.29824 940.875 219.125 C 940.97286 218.95188 941.16058 218.787 941.34375 218.6875 C 941.52692 218.58803 942.46875 218.53125 942.46875 218.53125 L 954.125 218.375 C 954.125 218.375 954.62104 218.4032 954.90625 218.4375 C 955.19146 218.4718 955.25245 218.52802 955.5 218.71875 C 955.74753 218.90946 955.78125 219.21875 955.78125 219.21875 L 956.34375 219.21875 L 956.28125 216.96875 z M 879.65625 218.46875 C 879.65625 218.46875 879.62495 218.71877 879.5 218.875 C 879.375 219.03126 877.96875 219.46875 877.96875 219.46875 L 871.4375 221.03125 L 865.71875 219.53125 C 865.71875 219.53125 865.13355 219.374 864.875 219.15625 C 864.57815 218.90623 864.5625 218.65625 864.5625 218.65625 L 864.03125 218.65625 L 864.03125 220.46875 L 864.53125 220.46875 C 864.53125 220.46875 864.5938 220.25004 864.6875 220.09375 C 864.78124 219.93748 864.90624 219.84375 865.375 219.78125 C 865.84375 219.71873 866.65625 220 866.65625 220 L 870.59375 221 L 870.59375 221.25 L 866 222.28125 C 866 222.28125 865.25237 222.46821 864.8125 222.125 C 864.56951 221.92159 864.5625 221.59375 864.5625 221.59375 L 864.03125 221.59375 L 864.03125 223.9375 L 864.53125 223.9375 C 864.53125 223.9375 864.625 223.67191 864.8125 223.46875 C 864.99999 223.26559 865.12499 223.28129 865.4375 223.125 C 865.74998 222.96871 866.4375 222.875 866.4375 222.875 L 872.28125 221.4375 L 878.3125 223.0625 C 878.3125 223.0625 879.12497 223.34378 879.34375 223.5 C 879.56234 223.65634 879.625 223.96875 879.625 223.96875 L 880.15625 224 L 880.15625 222.15625 L 879.65625 222.15625 C 879.65625 222.15625 879.62503 222.46879 879.5 222.59375 C 879.37502 222.71878 879.09375 222.875 878.875 222.875 C 878.65626 222.87501 878.03125 222.75 878.03125 222.75 L 873.21875 221.59375 L 873.21875 221.21875 L 878.34375 220.15625 C 878.34375 220.15625 878.81245 220.06252 878.90625 220.0625 C 879.00003 220.06249 879.12498 220.09376 879.375 220.25 C 879.62505 220.40625 879.65625 220.8125 879.65625 220.8125 L 880.15625 220.8125 L 880.15625 218.46875 L 879.65625 218.46875 z M 910.1875 218.8125 C 908.4005 218.8125 906.96875 220.2765 906.96875 222.0625 C 906.96875 223.8485 908.4005 225.28125 910.1875 225.28125 C 911.9755 225.28125 913.4375 223.8485 913.4375 222.0625 C 913.4375 220.2765 911.9745 218.8125 910.1875 218.8125 z M 956.34375 220.21875 L 955.8125 220.25 C 955.8125 220.25 955.77337 220.46275 955.65625 220.625 C 955.53916 220.78725 955.3406 220.87755 955.1875 220.96875 C 955.03444 221.05986 954.5 221.09375 954.5 221.09375 L 942.375 221.25 C 942.375 221.25 941.58799 221.2494 941.34375 221.1875 C 941.09953 221.12559 941.00829 221.00886 940.90625 220.875 C 940.80419 220.74117 940.75 220.40625 940.75 220.40625 L 940.21875 220.4375 L 940.28125 222.6875 L 940.78125 222.6875 C 940.78125 222.6875 940.8398 222.54823 940.9375 222.375 C 941.03536 222.20188 941.22307 222.037 941.40625 221.9375 C 941.58942 221.83804 942.53125 221.78125 942.53125 221.78125 L 954.1875 221.625 C 954.1875 221.625 954.68353 221.6532 954.96875 221.6875 C 955.25395 221.7218 955.31496 221.77803 955.5625 221.96875 C 955.81005 222.15945 955.84375 222.46875 955.84375 222.46875 L 956.40625 222.46875 L 956.34375 220.21875 z M 960.15625 222.4375 L 964.4375 222.4375 C 964.4245 224.1325 964.3515 225.81675 964.1875 227.46875 L 959.90625 227.0625 C 960.05725 225.5435 960.14425 223.9825 960.15625 222.4375 z M 855.96875 222.5625 L 860.25 222.5625 C 860.265 224.1215 860.343 225.6525 860.5 227.1875 L 856.25 227.625 C 856.081 225.954 855.98475 224.2745 855.96875 222.5625 z M 956.40625 223.46875 L 955.84375 223.5 C 955.84375 223.5 955.83587 223.71275 955.71875 223.875 C 955.60165 224.03724 955.4031 224.12755 955.25 224.21875 C 955.09693 224.30987 954.5625 224.34375 954.5625 224.34375 L 942.4375 224.5 C 942.4375 224.5 941.65049 224.4994 941.40625 224.4375 C 941.16202 224.37558 941.03954 224.25885 940.9375 224.125 C 940.83544 223.99117 940.8125 223.65625 940.8125 223.65625 L 940.28125 223.6875 L 940.34375 225.9375 L 940.84375 225.9375 C 940.84375 225.9375 940.9023 225.79824 941 225.625 C 941.09787 225.45188 941.25431 225.287 941.4375 225.1875 C 941.62066 225.08803 942.59375 225.03125 942.59375 225.03125 L 954.25 224.875 C 954.25 224.875 954.74604 224.9032 955.03125 224.9375 C 955.31645 224.9718 955.37745 225.02802 955.625 225.21875 C 955.87263 225.40946 955.90625 225.71875 955.90625 225.71875 L 956.46875 225.71875 L 956.40625 223.46875 z M 879.59375 224.65625 C 879.59375 224.65625 879.5684 224.98942 879.46875 225.125 C 879.36905 225.26064 879.27436 225.37135 879.03125 225.4375 C 878.78815 225.5037 877.96875 225.5 877.96875 225.5 L 865.875 225.59375 C 865.875 225.59375 865.34214 225.5572 865.1875 225.46875 C 865.03284 225.38025 864.8074 225.28521 864.6875 225.125 C 864.56752 224.96485 864.5625 224.75 864.5625 224.75 L 864 224.71875 L 864 226.96875 L 864.5625 226.96875 C 864.5625 226.96875 864.56829 226.66376 864.8125 226.46875 C 865.05668 226.27374 865.12167 226.1955 865.40625 226.15625 C 865.69081 226.11695 866.1875 226.09375 866.1875 226.09375 L 877.84375 226.0625 C 877.84375 226.0625 878.81512 226.09124 879 226.1875 C 879.18487 226.2839 879.36791 226.45359 879.46875 226.625 C 879.56993 226.79623 879.59375 226.90625 879.59375 226.90625 L 880.125 226.90625 L 880.125 224.6875 L 879.59375 224.65625 z M 959.875 227.4375 L 964.125 227.875 C 963.936 229.638 963.6675 231.38675 963.3125 233.09375 L 959.125 232.21875 C 959.448 230.64075 959.705 229.0525 959.875 227.4375 z M 860.5625 227.5625 C 860.7375 229.1805 860.9835 230.796 861.3125 232.375 L 857.125 233.25 C 856.767 231.542 856.47225 229.79125 856.28125 228.03125 L 860.5625 227.5625 z M 881.40625 231.71875 L 868.125 237.09375 C 868.125 237.09375 867.41562 237.39767 866.96875 237.375 C 866.52189 237.3523 866.34375 237.21875 866.34375 237.21875 L 865.875 237.46875 L 866.78125 239.03125 L 867.25 238.75 C 867.25 238.75 867.139 238.41876 867.25 238.125 C 867.36105 237.83123 867.32708 237.70454 867.84375 237.40625 C 868.36045 237.10793 869.34375 236.71875 869.34375 236.71875 L 878.21875 233.09375 L 878.375 233.34375 L 869.90625 239.875 C 869.90625 239.875 869.18925 240.43694 868.9375 240.53125 C 868.68577 240.62555 868.54992 240.6361 868.34375 240.5 C 868.13756 240.36387 868.03125 240.25 868.03125 240.25 L 867.625 240.46875 L 868.65625 242.25 L 869.09375 242 C 869.09375 242 869.0812 241.68302 869.1875 241.46875 C 869.29342 241.25449 869.48395 240.99331 869.71875 240.78125 C 869.95355 240.56912 870.3125 240.28125 870.3125 240.28125 L 881.4375 231.75 L 881.40625 231.71875 z M 938.90625 232.5625 L 937.84375 234.53125 L 938.3125 234.78125 C 938.3125 234.78125 938.39127 234.69493 938.5625 234.59375 C 938.73381 234.49274 938.97912 234.4325 939.1875 234.4375 C 939.39587 234.44294 940.25 234.875 940.25 234.875 L 950.4375 240.5625 C 950.4375 240.5625 950.83265 240.82769 951.0625 241 C 951.29235 241.17231 951.31848 241.2423 951.4375 241.53125 C 951.55655 241.82018 951.4375 242.125 951.4375 242.125 L 951.90625 242.40625 L 953 240.4375 L 952.5 240.1875 C 952.5 240.1875 952.37004 240.3556 952.1875 240.4375 C 952.00497 240.5195 951.77193 240.498 951.59375 240.5 C 951.41562 240.50237 950.9375 240.28125 950.9375 240.28125 L 940.40625 234.34375 C 940.40625 234.34375 939.71182 233.95698 939.53125 233.78125 C 939.35069 233.60551 939.30265 233.44819 939.28125 233.28125 C 939.25977 233.11431 939.375 232.8125 939.375 232.8125 L 938.90625 232.5625 z M 959.03125 232.59375 L 963.25 233.46875 C 962.875 235.19875 962.408 236.8995 961.875 238.5625 L 957.8125 237.28125 C 958.3025 235.74225 958.69125 234.18075 959.03125 232.59375 z M 861.40625 232.71875 C 861.74825 234.30375 862.16225 235.87025 862.65625 237.40625 L 858.59375 238.71875 C 858.05475 237.05575 857.59575 235.38425 857.21875 233.65625 L 861.40625 232.71875 z M 882.71875 234.59375 L 882.28125 234.84375 C 882.28125 234.84375 882.3105 234.98863 882.3125 235.1875 C 882.3143 235.38638 882.26479 235.6345 882.15625 235.8125 C 882.04735 235.99021 881.21875 236.5 881.21875 236.5 L 871.21875 242.46875 C 871.21875 242.46875 870.79542 242.6996 870.53125 242.8125 C 870.26712 242.9254 870.15351 242.88515 869.84375 242.84375 C 869.53394 242.80244 869.375 242.5625 869.375 242.5625 L 868.875 242.84375 L 870.0625 244.75 L 870.5 244.46875 C 870.5 244.46875 870.4172 244.26161 870.4375 244.0625 C 870.45776 243.86341 870.6001 243.65533 870.6875 243.5 C 870.77449 243.34455 871.21875 243.0625 871.21875 243.0625 L 881.625 236.90625 C 881.625 236.90625 882.2888 236.47475 882.53125 236.40625 C 882.77373 236.33776 882.93849 236.40385 883.09375 236.46875 C 883.24906 236.53361 883.46875 236.78125 883.46875 236.78125 L 883.90625 236.5 L 882.71875 234.59375 z M 937.21875 235.59375 L 936.15625 237.53125 L 936.625 237.78125 C 936.625 237.78125 936.70377 237.69493 936.875 237.59375 C 937.04631 237.49274 937.29162 237.4325 937.5 237.4375 C 937.70837 237.44294 938.5625 237.90625 938.5625 237.90625 L 948.75 243.5625 C 948.75 243.5625 949.14515 243.8277 949.375 244 C 949.60485 244.17231 949.63098 244.27355 949.75 244.5625 C 949.86905 244.85143 949.75 245.125 949.75 245.125 L 950.21875 245.40625 L 951.3125 243.4375 L 950.8125 243.1875 C 950.8125 243.1875 950.68254 243.3555 950.5 243.4375 C 950.31747 243.5194 950.08443 243.52925 949.90625 243.53125 C 949.72812 243.53363 949.25 243.28125 949.25 243.28125 L 938.71875 237.34375 C 938.71875 237.34375 938.02432 236.95698 937.84375 236.78125 C 937.66319 236.60551 937.61515 236.4482 937.59375 236.28125 C 937.57227 236.11431 937.6875 235.8125 937.6875 235.8125 L 937.21875 235.59375 z M 884.40625 237.375 L 883.96875 237.625 C 883.96875 237.625 883.998 237.76987 884 237.96875 C 884.00182 238.16761 883.92104 238.41576 883.8125 238.59375 C 883.7036 238.77146 882.90625 239.28125 882.90625 239.28125 L 872.90625 245.25 C 872.90625 245.25 872.45167 245.48085 872.1875 245.59375 C 871.92335 245.70665 871.84098 245.69765 871.53125 245.65625 C 871.22149 245.6149 871.03125 245.34375 871.03125 245.34375 L 870.5625 245.625 L 871.71875 247.53125 L 872.1875 247.25 C 872.1875 247.25 872.1047 247.04286 872.125 246.84375 C 872.14534 246.64474 872.25635 246.43658 872.34375 246.28125 C 872.43073 246.12583 872.875 245.84375 872.875 245.84375 L 883.28125 239.6875 C 883.28125 239.6875 883.97629 239.28725 884.21875 239.21875 C 884.46121 239.15025 884.626 239.1851 884.78125 239.25 C 884.93656 239.31488 885.125 239.5625 885.125 239.5625 L 885.5625 239.28125 L 884.40625 237.375 z M 957.6875 237.625 L 961.75 238.96875 C 961.197 240.64575 960.55175 242.273 959.84375 243.875 L 955.9375 242.15625 C 956.5895 240.67425 957.1845 239.165 957.6875 237.625 z M 862.75 237.78125 C 863.258 239.31925 863.843 240.8335 864.5 242.3125 L 860.59375 244.03125 C 859.88275 242.43225 859.27375 240.801 858.71875 239.125 L 862.75 237.78125 z M 935.65625 238.4375 L 934.59375 240.375 L 935.03125 240.625 C 935.03125 240.625 935.14127 240.53867 935.3125 240.4375 C 935.48381 240.33648 935.72911 240.27625 935.9375 240.28125 C 936.14586 240.2867 937 240.75 937 240.75 L 947.15625 246.40625 C 947.15625 246.40625 947.58264 246.67144 947.8125 246.84375 C 948.04234 247.01606 948.06849 247.11732 948.1875 247.40625 C 948.30656 247.69518 948.15625 247.96875 948.15625 247.96875 L 948.65625 248.25 L 949.71875 246.28125 L 949.25 246.03125 C 949.25 246.03125 949.12005 246.19925 948.9375 246.28125 C 948.75497 246.36315 948.52194 246.373 948.34375 246.375 C 948.16565 246.37738 947.6875 246.125 947.6875 246.125 L 937.125 240.1875 C 937.125 240.1875 936.43057 239.80073 936.25 239.625 C 936.06944 239.44928 936.05265 239.29194 936.03125 239.125 C 936.00978 238.95807 936.125 238.65625 936.125 238.65625 L 935.65625 238.4375 z M 886.0625 240.15625 L 885.625 240.4375 C 885.625 240.4375 885.65425 240.55112 885.65625 240.75 C 885.65807 240.94885 885.60853 241.19702 885.5 241.375 C 885.39111 241.55273 884.5625 242.0625 884.5625 242.0625 L 874.5625 248.03125 C 874.5625 248.03125 874.13916 248.2621 873.875 248.375 C 873.61085 248.4879 873.49724 248.4789 873.1875 248.4375 C 872.87775 248.39613 872.71875 248.125 872.71875 248.125 L 872.21875 248.40625 L 873.40625 250.3125 L 873.84375 250.03125 C 873.84375 250.03125 873.76095 249.8241 873.78125 249.625 C 873.8015 249.42592 873.94385 249.24908 874.03125 249.09375 C 874.11825 248.9383 874.5625 248.625 874.5625 248.625 L 884.96875 242.46875 C 884.96875 242.46875 885.66379 242.0685 885.90625 242 C 886.14872 241.9315 886.28225 241.96635 886.4375 242.03125 C 886.59283 242.09612 886.8125 242.375 886.8125 242.375 L 887.25 242.0625 L 886.0625 240.15625 z M 934.09375 241.25 L 933 243.21875 L 933.46875 243.46875 C 933.46875 243.46875 933.54752 243.38243 933.71875 243.28125 C 933.89007 243.18025 934.13535 243.12 934.34375 243.125 C 934.55211 243.13044 935.40625 243.59375 935.40625 243.59375 L 945.59375 249.25 C 945.59375 249.25 945.9889 249.51519 946.21875 249.6875 C 946.44859 249.85981 946.47473 249.96105 946.59375 250.25 C 946.71289 250.53897 946.59375 250.8125 946.59375 250.8125 L 947.09375 251.09375 L 948.15625 249.125 L 947.65625 248.875 C 947.65625 248.875 947.55755 249.043 947.375 249.125 C 947.19247 249.207 946.92819 249.21675 946.75 249.21875 C 946.57188 249.22113 946.125 248.96875 946.125 248.96875 L 935.5625 243.03125 C 935.5625 243.03125 934.86806 242.64448 934.6875 242.46875 C 934.50694 242.29302 934.4589 242.13569 934.4375 241.96875 C 934.41602 241.80182 934.5625 241.5 934.5625 241.5 L 934.09375 241.25 z M 955.8125 242.5 L 959.6875 244.25 C 959.0185 245.74 958.299 247.209 957.5 248.625 L 953.78125 246.5 C 954.51625 245.195 955.1995 243.862 955.8125 242.5 z M 864.65625 242.65625 C 865.25525 243.98025 865.907 245.26225 866.625 246.53125 L 862.90625 248.59375 C 862.14125 247.23575 861.42525 245.83325 860.78125 244.40625 L 864.65625 242.65625 z M 893.375 246.65625 L 884.5625 257.96875 C 884.5625 257.96875 884.11709 258.57745 883.71875 258.78125 C 883.32041 258.98502 883.09375 258.96875 883.09375 258.96875 L 882.8125 259.40625 L 884.375 260.3125 L 884.625 259.84375 C 884.625 259.84375 884.36325 259.59116 884.3125 259.28125 C 884.2618 258.97132 884.2017 258.89166 884.5 258.375 C 884.79832 257.8583 885.4375 257.03125 885.4375 257.03125 L 891.3125 249.46875 L 891.5625 249.59375 L 887.5 259.46875 C 887.5 259.46875 887.17086 260.35495 887 260.5625 C 886.82914 260.77003 886.71535 260.82728 886.46875 260.8125 C 886.22212 260.7977 886.0625 260.71875 886.0625 260.71875 L 885.8125 261.15625 L 887.59375 262.1875 L 887.84375 261.75 C 887.84375 261.75 887.67133 261.45746 887.65625 261.21875 C 887.64085 260.98024 887.68394 260.67605 887.78125 260.375 C 887.87855 260.07389 888.0625 259.625 888.0625 259.625 L 893.4375 246.6875 L 893.375 246.65625 z M 953.1875 247.5 L 956.90625 249.625 C 956.07225 251.032 955.17275 252.39775 954.21875 253.71875 L 950.75 251.21875 C 951.621 250.01375 952.4325 248.768 953.1875 247.5 z M 867.21875 247.53125 C 867.99075 248.83025 868.82275 250.11175 869.71875 251.34375 L 866.28125 253.84375 C 865.28725 252.47075 864.33175 251.05775 863.46875 249.59375 L 867.21875 247.53125 z M 924.90625 247.90625 L 924.84375 247.9375 L 930.25 261.21875 C 930.25 261.21875 930.52267 261.92815 930.5 262.375 C 930.4773 262.82186 930.34375 263 930.34375 263 L 930.59375 263.46875 L 932.15625 262.5625 L 931.90625 262.09375 C 931.90625 262.09375 931.54376 262.20477 931.25 262.09375 C 930.95623 261.98269 930.82956 261.98543 930.53125 261.46875 C 930.23294 260.95206 929.84375 260 929.84375 260 L 926.21875 251.09375 L 926.46875 250.96875 L 933 259.4375 C 933 259.4375 933.59318 260.15452 933.6875 260.40625 C 933.7818 260.65799 933.7611 260.79383 933.625 261 C 933.48887 261.20617 933.375 261.3125 933.375 261.3125 L 933.625 261.71875 L 935.40625 260.6875 L 935.125 260.25 C 935.125 260.25 934.80801 260.26255 934.59375 260.15625 C 934.3795 260.05031 934.11833 259.85977 933.90625 259.625 C 933.69415 259.39023 933.40625 259.03125 933.40625 259.03125 L 924.90625 247.90625 z M 896.28125 248.65625 L 896.03125 249.09375 C 896.03125 249.09375 896.12105 249.20176 896.21875 249.375 C 896.31677 249.54805 896.384 249.79178 896.375 250 C 896.36594 250.20826 895.90625 251.0625 895.90625 251.0625 L 890.03125 261.125 C 890.03125 261.125 889.77006 261.55446 889.59375 261.78125 C 889.41743 262.00798 889.32222 262.01105 889.03125 262.125 C 888.74025 262.23898 888.46875 262.09375 888.46875 262.09375 L 888.1875 262.59375 L 890.125 263.6875 L 890.375 263.21875 C 890.375 263.21875 890.2038 263.09018 890.125 262.90625 C 890.0462 262.72232 890.06181 262.4907 890.0625 262.3125 C 890.06324 262.13438 890.3125 261.65625 890.3125 261.65625 L 896.4375 251.21875 C 896.4375 251.21875 896.82112 250.52117 897 250.34375 C 897.17883 250.16629 897.36397 250.1438 897.53125 250.125 C 897.6985 250.10648 898 250.21875 898 250.21875 L 898.21875 249.75 L 896.28125 248.65625 z M 898.9375 250.1875 L 898.6875 250.625 C 898.6875 250.625 898.7773 250.733 898.875 250.90625 C 898.97304 251.07929 899.04025 251.32293 899.03125 251.53125 C 899.02217 251.73947 898.53125 252.59375 898.53125 252.59375 L 892.6875 262.65625 C 892.6875 262.65625 892.4263 263.08574 892.25 263.3125 C 892.07366 263.53925 891.97847 263.5423 891.6875 263.65625 C 891.39651 263.77024 891.125 263.625 891.125 263.625 L 890.84375 264.125 L 892.78125 265.21875 L 893.03125 264.75 C 893.03125 264.75 892.86005 264.62142 892.78125 264.4375 C 892.70245 264.25356 892.71806 264.02195 892.71875 263.84375 C 892.71947 263.66562 892.96875 263.1875 892.96875 263.1875 L 899.09375 252.75 C 899.09375 252.75 899.47737 252.05242 899.65625 251.875 C 899.83508 251.69754 899.98897 251.67505 900.15625 251.65625 C 900.32351 251.63775 900.65625 251.75 900.65625 251.75 L 900.875 251.28125 L 898.9375 250.1875 z M 950.53125 251.53125 L 954 254.0625 C 952.963 255.4805 951.8555 256.84525 950.6875 258.15625 L 947.46875 255.3125 C 948.55275 254.0985 949.57825 252.82725 950.53125 251.53125 z M 869.9375 251.65625 C 870.8955 252.95425 871.91 254.19625 873 255.40625 L 869.84375 258.25 C 868.66975 256.945 867.545 255.6035 866.5 254.1875 L 869.9375 251.65625 z M 908.6875 251.875 L 906.71875 266.09375 C 906.71875 266.09375 906.61806 266.8431 906.375 267.21875 C 906.13193 267.5944 905.90625 267.6875 905.90625 267.6875 L 905.90625 268.21875 L 907.71875 268.21875 L 907.71875 267.6875 C 907.71875 267.6875 907.35512 267.58681 907.15625 267.34375 C 906.95737 267.10068 906.84375 267.06537 906.84375 266.46875 C 906.84375 265.87213 906.96875 264.8125 906.96875 264.8125 L 908.3125 255.3125 L 908.59375 255.3125 L 910 265.90625 C 910 265.90625 910.13793 266.82859 910.09375 267.09375 C 910.04955 267.35892 909.97097 267.48327 909.75 267.59375 C 909.52903 267.70424 909.375 267.71875 909.375 267.71875 L 909.375 268.21875 L 911.4375 268.21875 L 911.4375 267.6875 C 911.4375 267.6875 911.16383 267.54263 911.03125 267.34375 C 910.89867 267.14488 910.75379 266.87186 910.6875 266.5625 C 910.6212 266.25314 910.5625 265.78125 910.5625 265.78125 L 908.75 251.875 L 908.6875 251.875 z M 911.90625 252.125 L 911.90625 252.65625 C 911.90625 252.65625 912.23941 252.68159 912.375 252.78125 C 912.5106 252.88095 912.62133 253.0069 912.6875 253.25 C 912.7537 253.49311 912.75 254.28125 912.75 254.28125 L 912.8125 266.375 C 912.8125 266.375 912.80719 266.90787 912.71875 267.0625 C 912.63025 267.21715 912.53518 267.44259 912.375 267.5625 C 912.21482 267.68244 912 267.71875 912 267.71875 L 911.96875 268.25 L 914.21875 268.25 L 914.21875 267.6875 C 914.21875 267.6875 913.8825 267.68172 913.6875 267.4375 C 913.49248 267.19332 913.44552 267.12832 913.40625 266.84375 C 913.36695 266.55919 913.34375 266.0625 913.34375 266.0625 L 913.28125 254.40625 C 913.28125 254.40625 913.30998 253.46612 913.40625 253.28125 C 913.50255 253.09635 913.67236 252.91337 913.84375 252.8125 C 914.01513 252.71158 914.15625 252.65625 914.15625 252.65625 L 914.15625 252.15625 L 911.90625 252.125 z M 947.25 255.59375 L 950.40625 258.4375 C 949.22625 259.7375 947.9865 261.0025 946.6875 262.1875 L 943.8125 259.03125 C 944.3945 258.50025 944.97125 257.935 945.53125 257.375 C 946.12125 256.785 946.693 256.20575 947.25 255.59375 z M 873.25 255.6875 C 873.775 256.2615 874.32 256.819 874.875 257.375 C 875.469 257.969 876.0675 258.565 876.6875 259.125 L 873.84375 262.28125 C 872.54075 261.10325 871.27675 259.8635 870.09375 258.5625 L 873.25 255.6875 z M 943.53125 259.28125 L 946.375 262.4375 C 945.068 263.6105 943.69525 264.73925 942.28125 265.78125 L 939.75 262.34375 C 941.047 261.38875 942.32025 260.36825 943.53125 259.28125 z M 876.96875 259.375 C 878.18475 260.46 879.451 261.45525 880.75 262.40625 L 878.25 265.875 C 876.83 264.836 875.46525 263.7315 874.15625 262.5625 L 876.96875 259.375 z M 939.46875 262.5625 L 941.96875 266 C 940.63275 266.967 939.2365 267.87275 937.8125 268.71875 L 935.78125 265 C 937.03725 264.248 938.27575 263.4275 939.46875 262.5625 z M 881.0625 262.625 C 882.2665 263.494 883.51225 264.3095 884.78125 265.0625 L 882.65625 268.78125 C 881.24725 267.94825 879.8835 267.04775 878.5625 266.09375 L 881.0625 262.625 z M 934.78125 265.5625 L 936.8125 269.3125 C 935.4165 270.1035 934.00425 270.833 932.53125 271.5 L 930.75 267.625 C 932.119 267.004 933.47225 266.3055 934.78125 265.5625 z M 885.78125 265.65625 C 887.08325 266.38825 888.42125 267.0785 889.78125 267.6875 L 888.03125 271.5625 C 886.53925 270.8905 885.07325 270.171 883.65625 269.375 L 885.78125 265.65625 z M 930.40625 267.78125 L 932.15625 271.65625 C 930.55525 272.36725 928.89875 273.0055 927.21875 273.5625 L 925.875 269.5 C 927.415 268.993 928.92725 268.43525 930.40625 267.78125 z M 890.125 267.8125 C 891.607 268.4645 893.11925 269.0605 894.65625 269.5625 L 893.34375 273.625 C 891.66375 273.076 890.01025 272.456 888.40625 271.75 L 890.125 267.8125 z M 925.53125 269.625 L 926.84375 273.6875 C 925.18075 274.2255 923.48 274.6865 921.75 275.0625 L 920.84375 270.875 C 922.42875 270.531 923.99325 270.119 925.53125 269.625 z M 895.03125 269.65625 C 896.57025 270.14425 898.13175 270.57025 899.71875 270.90625 L 898.8125 275.09375 C 897.0805 274.72275 895.38575 274.284 893.71875 273.75 L 895.03125 269.65625 z M 920.46875 270.96875 L 921.34375 275.15625 C 919.63575 275.51425 917.91825 275.77575 916.15625 275.96875 L 915.6875 271.71875 C 917.3045 271.54375 918.89075 271.29575 920.46875 270.96875 z M 900.0625 271 C 901.6445 271.323 903.259 271.54875 904.875 271.71875 L 904.40625 276 C 902.64325 275.813 900.92775 275.5405 899.21875 275.1875 L 900.0625 271 z M 915.3125 271.75 L 915.75 276.03125 C 914.115 276.19725 912.45525 276.2945 910.78125 276.3125 L 910.78125 272 C 912.30125 271.984 913.8165 271.902 915.3125 271.75 z M 905.25 271.78125 C 906.696 271.92325 908.154 271.985 909.625 272 L 909.625 276.3125 C 908.009 276.2945 906.3935 276.18925 904.8125 276.03125 L 905.25 271.78125 z').attr({'fill':'rgb(83,71,65)','stroke':0})
		);

		this.overlay = this.box.set();
		this.overlay.push(
			// White banners
			// Main title
			this.box.path('M 858.801,97 c 0,-12.957 -11.542,-22.51 -26.424,-23.836 v -6.494 c 0,-2.465 -3.014,-4.67 -5.935,-4.67 h -337.572 c -2.923,0 -6.494,2.205 -6.494,4.67 v 6.511 c -14.797,1.384 -26.25,10.913 -26.25,23.819 0,12.906 11.453,24.139 26.25,25.785 v 6.986 c 0,2.465 3.571,4.229 6.494,4.229 h 337.572 c 2.921,0 5.935,-1.764 5.935,-4.229 v -6.966 c 14.881,-1.577 26.423,-12.848 26.423,-25.805').attr({'fill':'#534741','stroke':0}),
			this.box.path('M 858.801,99 c 0,-12.957 -11.542,-22.51 -26.424,-23.836 v -6.494 c 0,-2.465 -3.014,-4.67 -5.935,-4.67 h -335.572 c -2.923,0 -6.494,2.205 -6.494,4.67 v 6.511 c -14.797,1.384 -26.25,10.913 -26.25,23.819 0,12.906 11.453,24.139 26.25,25.785 v 6.986 c 0,2.465 3.571,4.229 6.494,4.229 h 335.572 c 2.921,0 5.935,-1.764 5.935,-4.229 v -6.966 c 14.881,-1.577 26.423,-12.848 26.423,-25.805').attr({'fill':'#f8f7f6','stroke':0}),

			// Messier Name label
			this.box.path('M 80.46875 244 C 76.49275 244 74.125 245.705 74 248.875 L 74 249 L 72.15625 249 C 67.892251 249 62.46875 250.81925 62.46875 257.15625 C 62.46875 263.49625 67.892251 265 72.15625 265 L 74 265 L 74 266.625 C 74 269.597 77.44475 272 80.46875 272 L 191.53125 272 C 194.55525 272 198 269.597 198 266.625 L 198 265 L 199.84375 265 C 204.10675 265 209.53125 263.095 209.53125 257 C 209.53125 250.905 204.10675 249 199.84375 249 L 198 249 L 198 248.875 C 198 245.903 195.13225 244 191.53125 244 L 80.46875 244 z').attr({'fill':'#534741','stroke':0}).transform('t -0.5 -0.5 s1.01'),
			this.box.path('M 80.46875 244 C 76.49275 244 74.125 245.705 74 248.875 L 74 249 L 72.15625 249 C 67.892251 249 62.46875 250.81925 62.46875 257.15625 C 62.46875 263.49625 67.892251 265 72.15625 265 L 74 265 L 74 266.625 C 74 269.597 77.44475 272 80.46875 272 L 191.53125 272 C 194.55525 272 198 269.597 198 266.625 L 198 265 L 199.84375 265 C 204.10675 265 209.53125 263.095 209.53125 257 C 209.53125 250.905 204.10675 249 199.84375 249 L 198 249 L 198 248.875 C 198 245.903 195.13225 244 191.53125 244 L 80.46875 244 z').attr({'fill':'#f8f7f6','stroke':0}),

			// Info label
			this.box.path('m 200.222,702.863 h -127.69 c -4.264,0 -9.682,-1.512 -9.682,-7.852 0,-6.338 5.418,-8.148 9.682,-8.148 h 127.69 c 4.263,0 9.681,1.904 9.681,8 0,6.096 -5.418,8 -9.681,8 m -1.845,1.619 c 0,2.972 -3.452,5.381 -6.476,5.381 h -111.048 c -3.024,0 -6.476,-2.409 -6.476,-5.381 v -17.738 c 0.125,-3.17 2.5,-4.881 6.476,-4.881 h 111.048 c 3.601,0 6.476,1.909 6.476,4.881 v 17.738 z').attr({'fill':'#f8f7f6','stroke':0}).attr({'fill':'#534741','stroke':0}).transform('t -0.5 -0.5 s1.005'),
			this.box.path('m 200.222,702.863 h -127.69 c -4.264,0 -9.682,-1.512 -9.682,-7.852 0,-6.338 5.418,-8.148 9.682,-8.148 h 127.69 c 4.263,0 9.681,1.904 9.681,8 0,6.096 -5.418,8 -9.681,8 m -1.845,1.619 c 0,2.972 -3.452,5.381 -6.476,5.381 h -111.048 c -3.024,0 -6.476,-2.409 -6.476,-5.381 v -17.738 c 0.125,-3.17 2.5,-4.881 6.476,-4.881 h 111.048 c 3.601,0 6.476,1.909 6.476,4.881 v 17.738 z').attr({'fill':'#f8f7f6','stroke':0}),

			this.box.circle(135,135,82).attr({'fill':'90-#534741-#5c5048:29-#766a5c:76-#857968','stroke':0}),
			this.box.circle(135,135,78).attr({'fill':'r#ffffff:0-#bdccd4:42-#bbcbd3:65-#b4c7ce:73-#a8bfc7:79-#98b5bc:84-#82a7ad:88-#66969c:92-#468286:95-#226c6f:98-#005759','stroke':0})
		)

		this.messier = this.box.set();
		this.messier.push(
			this.box.image('images/messier_eyes.png',110,121,28,6),
			this.box.image('images/messier.png',95,80,90,110)
		);

		this.portal = this.box.set();
		this.portal.push(
			this.box.circle(661,455,266).attr({'fill':'270-#d8cda9:0-#cfc4a2:15-#b7ab8f:41-#8f8470:52-#857968:60-#817565:66-#74685b:71-#5f534a:80-#534741:82','stroke':0}),
			this.box.circle(661,455,234).attr({'fill':'#2a2521','stroke':0}),
			this.box.circle(661,455,231).attr({'fill':'90-#d8cda9:0-#cfc4a2:1-#b7ab8f:5-#8f8470:15-#857968:20-#817565:30-#74685b:51-#5f534a:85-#534741','stroke':0}),
			this.box.path('m 661,193 c -144,0 -260.737,116.735 -260.737,260.737 0,144.001 116.737,260.736 260.737,260.736 143.997,0 260.734,-116.735 260.734,-260.736 0,-144.002 -116.737,-260.737 -260.734,-260.737 m 0,490.184 c -126.723,0 -229.449,-102.727 -229.449,-229.447 0,-126.722 102.726,-229.448 229.449,-229.448 126.718,0 229.446,102.726 229.446,229.448 0,126.72 -102.729,229.447 -229.446,229.447').attr({'fill':'#534741','stroke':0,'opacity':0.76})
		);
		
		
		this.nuts = this.box.set();
		this.makeNut(21.25,23,15);
		this.makeNut(1001,25,15);
		this.makeNut(21.25,742,15);
		this.makeNut(1001,742,15);
		this.makeNut(660,741,12);
		this.makeNut(660,164,12);


		this.screws = this.box.set();		
		this.makeScrew(34,136,10);
		this.makeScrew(136,32,10);
		this.makeScrew(136,731,10);
		// Title bar
		this.makeScrew(481,99,10);
		this.makeScrew(834,99,10);
		// Portal surround
		this.makeScrew(570,225,8);
		this.makeScrew(754,225,8);
		this.makeScrew(754,684,8);
		this.makeScrew(570,684,8);
		this.makeScrew(887,356,8);
		this.makeScrew(436,555,8);
		this.makeScrew(435,356,8);
		this.makeScrew(887,555,8);

		// Messier label
		this.makeScrew(70,257,4);
		this.makeScrew(202,257,4);
		this.makeScrew(70,694,4);
		this.makeScrew(202,694,4);

		this.hands = this.box.set();
		this.hands.push(
			this.box.path('m 910.31243,188.94261 c -0.47751,1.8318 -0.93459,3.35179 -0.93103,6.07418 0.0272,2.19329 0.51826,5.10581 0.51826,5.10581 0,0 -0.066,-0.0785 -0.58054,-0.26794 -0.51447,-0.18954 -1.22189,0.0946 -1.38435,0.44657 -0.16247,0.352 0.10117,0.70358 0.66985,0.89313 0.56863,0.18954 1.11641,-0.17863 1.11641,-0.17863 0,0 -0.63994,1.08941 -0.93779,1.11642 -0.29786,0.027 -0.58435,-0.37866 -1.07175,-0.89314 -0.4874,-0.51448 -0.6427,-1.0675 -0.66985,-1.47366 -0.027,-0.40616 0.0893,-0.49123 0.0893,-0.49123 l -1.20573,0.40191 c 0,0 -0.43842,0.0946 -0.35725,0.44657 0.0813,0.35202 0.95777,1.13924 1.60764,1.51832 0.64987,0.37909 1.51832,0.80382 1.51832,0.80382 0,0 0.11404,0.065 -0.53588,-0.17862 -0.64986,-0.24369 -3.12979,-0.093 -3.61718,1.96489 -0.48741,2.0579 1.09032,2.98916 1.87557,3.25993 0.78526,0.27084 1.6523,0 1.6523,0 0,0 -0.71025,0.44372 -1.11642,0.7145 -0.40616,0.27077 -1.28553,1.02428 -1.33969,1.29504 -0.0542,0.27084 0.17862,0.35726 0.17862,0.35726 l 1.38436,0.49122 c 0,0 -0.1339,-0.30026 -0.1339,-0.62519 0,-0.32493 0.27461,-0.77391 0.49122,-1.07176 0.21662,-0.29786 1.06084,-1.18808 1.25039,-1.16107 0.18954,0.027 0.39099,0.17578 0.58053,0.44656 0.18955,0.27079 0.35725,0.71451 0.35725,0.71451 0,0 -0.36249,-0.18677 -0.7145,-0.26794 -0.35201,-0.0812 -1.06226,0.12832 -1.11642,0.66985 -0.0542,0.54155 0.49647,0.67799 0.84848,0.75916 0.35201,0.0812 1.11641,-0.26794 1.11641,-0.26794 0,0 -0.35589,1.58679 -0.49122,2.72405 -0.13533,1.13727 -0.10557,3.26731 -0.0514,4.72951 0.15374,1.25786 0.31832,3.18276 0.85523,6.0277 0.44364,-2.8217 0.50914,-4.27428 0.70364,-6.1035 0.0542,-1.4622 0.23549,-3.51644 0.10019,-4.65371 -0.13533,-1.13726 -0.49122,-2.72405 -0.49122,-2.72405 0,0 0.7644,0.34911 1.11641,0.26794 0.35201,-0.0812 0.90264,-0.21761 0.84848,-0.75916 -0.0542,-0.54153 -0.76441,-0.75102 -1.11642,-0.66985 -0.35201,0.0812 -0.7145,0.26794 -0.7145,0.26794 0,0 0.1677,-0.44372 0.35725,-0.71451 0.18954,-0.27078 0.39099,-0.41955 0.58053,-0.44656 0.18955,-0.027 1.03377,0.86321 1.25039,1.16107 0.21661,0.29785 0.49122,0.74683 0.49122,1.07176 0,0.32493 -0.1339,0.62519 -0.1339,0.62519 l 1.38436,-0.49122 c 0,0 0.23278,-0.0865 0.17862,-0.35726 -0.0542,-0.27076 -0.93353,-1.02427 -1.33969,-1.29504 -0.40617,-0.27078 -1.11642,-0.7145 -1.11642,-0.7145 0,0 0.86704,0.27084 1.6523,0 0.78525,-0.27077 2.36298,-1.20203 1.87557,-3.25993 -0.48739,-2.05792 -2.96732,-2.20858 -3.61718,-1.96489 -0.64992,0.24364 -0.53588,0.17862 -0.53588,0.17862 0,0 0.86845,-0.42473 1.51832,-0.80382 0.64987,-0.37908 1.52633,-1.1663 1.60764,-1.51832 0.0812,-0.35197 -0.35725,-0.44657 -0.35725,-0.44657 l -1.20573,-0.40191 c 0,0 0.11632,0.085 0.0893,0.49123 -0.0271,0.40616 -0.18245,0.95918 -0.66985,1.47366 -0.4874,0.51448 -0.77389,0.92014 -1.07175,0.89314 -0.29785,-0.027 -0.93779,-1.11642 -0.93779,-1.11642 0,0 0.54778,0.36817 1.11641,0.17863 0.56868,-0.18955 0.83232,-0.54113 0.66985,-0.89313 -0.16246,-0.35197 -0.86988,-0.63611 -1.38435,-0.44657 -0.51452,0.18949 -0.54264,0.30584 -0.54264,0.30584 0,0 0.71849,-3.06411 0.74564,-5.2574 -0.12991,-2.63861 -0.31502,-4.01329 -0.90679,-5.96049 z m -0.14489,11.89449 0.0893,0.0446 c 0,0 0.12304,0.50454 0.3126,0.93779 0.18954,0.43323 0.31124,0.74966 0.44656,0.80382 0.13533,0.0542 0.35726,0 0.35726,0 0,0 -0.34634,0.33683 -0.53588,0.58053 -0.18955,0.24369 -0.54524,0.76877 -0.58054,1.38436 -0.0353,0.61559 -0.14033,1.36659 0.35725,2.0542 0.22221,0.22178 0.43692,0.33353 0.49123,0.35725 -0.0304,-0.003 -0.0662,-0.023 -0.1339,0.0446 -0.13533,0.13533 -0.57104,0.9891 -0.6252,1.20573 -0.0542,0.21661 -0.17862,0.58053 -0.17862,0.58053 0,0 -0.12447,-0.36392 -0.17863,-0.58053 -0.0542,-0.21663 -0.48986,-1.0704 -0.62519,-1.20573 -0.0677,-0.0676 -0.1036,-0.048 -0.1339,-0.0446 0.0543,-0.0237 0.26901,-0.13547 0.49122,-0.35725 0.49766,-0.68761 0.39252,-1.43861 0.35726,-2.0542 -0.0353,-0.61559 -0.39099,-1.14067 -0.58054,-1.38436 -0.18954,-0.2437 -0.53588,-0.58053 -0.53588,-0.58053 0,0 0.22193,0.0542 0.35725,0 0.13533,-0.0542 0.25703,-0.37059 0.44657,-0.80382 0.1896,-0.43325 0.3126,-0.93779 0.3126,-0.93779 l 0.0893,-0.0446 z m -2.90268,1.78627 c 0.275,-0.0146 0.50312,0.0687 1.07176,0.53588 0.75816,0.62279 0.46167,1.8699 -0.1339,2.41145 -0.59571,0.54157 -1.61954,0.2817 -2.18817,-0.17862 -0.56865,-0.46032 -0.50357,-1.45849 -0.17863,-2.05421 0.32493,-0.59578 1.11641,-0.66984 1.11641,-0.66984 0.11432,-0.01 0.22093,-0.04 0.3126,-0.0446 z m 5.80536,0 c 0.0917,0.004 0.19827,0.0346 0.31259,0.0446 0,0 0.79149,0.074 1.11642,0.66985 0.32494,0.59571 0.39002,1.59389 -0.17863,2.05421 -0.56863,0.46032 -1.59246,0.72019 -2.18817,0.17862 -0.59564,-0.54155 -0.89213,-1.78866 -0.1339,-2.41145 0.56863,-0.46715 0.79676,-0.55046 1.07176,-0.53588 z').attr({'fill':'#534741','stroke':0}).transform('R0,910,222'),
			this.box.path('m 910.13637,168.90537 c -0.13259,0 -0.1875,0.125 -0.1875,0.125 l 0,2.21875 c 0,0 -0.4565,2.21516 -0.4375,3.75 0.019,1.53483 0.46875,3.28125 0.46875,3.28125 0,0 -0.0462,-0.0549 -0.40625,-0.1875 -0.36002,-0.13264 -0.85506,0.0662 -0.96875,0.3125 -0.11369,0.24633 0.0708,0.49236 0.46875,0.625 0.39792,0.13264 0.78125,-0.125 0.78125,-0.125 0,0 -0.44782,0.76235 -0.65625,0.78125 -0.20844,0.0189 -0.40892,-0.26498 -0.75,-0.625 -0.34107,-0.36003 -0.44975,-0.74702 -0.46875,-1.03125 -0.0189,-0.28422 0.0625,-0.34375 0.0625,-0.34375 l -0.84375,0.28125 c 0,0 -0.3068,0.0662 -0.25,0.3125 0.0569,0.24634 0.67023,0.79722 1.125,1.0625 0.45477,0.26528 1.0625,0.5625 1.0625,0.5625 0,0 0.0798,0.0455 -0.375,-0.125 -0.45476,-0.17053 -2.19018,-0.0651 -2.53125,1.375 -0.34108,1.44009 0.76299,2.09177 1.3125,2.28125 0.54951,0.18953 1.15625,0 1.15625,0 0,0 -0.49702,0.31051 -0.78125,0.5 -0.28423,0.18948 -0.8996,0.71677 -0.9375,0.90625 -0.0379,0.18953 0.125,0.25 0.125,0.25 l 0.96875,0.34375 c 0,0 -0.0937,-0.21012 -0.0937,-0.4375 0,-0.22738 0.19217,-0.54157 0.34375,-0.75 0.15159,-0.20844 0.74236,-0.8314 0.875,-0.8125 0.13264,0.0189 0.27361,0.12301 0.40625,0.3125 0.13264,0.18949 0.25,0.5 0.25,0.5 0,0 -0.25367,-0.1307 -0.5,-0.1875 -0.24633,-0.0568 -0.74335,0.0898 -0.78125,0.46875 -0.0379,0.37897 0.34742,0.47445 0.59375,0.53125 0.24633,0.0568 0.78125,-0.1875 0.78125,-0.1875 0,0 -0.24905,1.11041 -0.34375,1.90625 -0.0947,0.79584 -0.1004,2.44553 -0.0625,3.46875 0.0379,1.02323 0.20745,4.39882 0.21875,5.25 0.0113,0.85118 -0.21315,13.50978 -0.15625,16.75 0,2.04644 0.1917,6.67245 0.34375,9.375 0.0383,0.0687 -0.0784,0.2392 0.21875,0.25 0.29715,-0.0108 0.18045,-0.1813 0.21875,-0.25 0.15205,-2.70255 0.34375,-7.32856 0.34375,-9.375 0.0569,-3.24022 -0.16755,-15.89882 -0.15625,-16.75 0.0113,-0.85118 0.18085,-4.22677 0.21875,-5.25 0.0379,-1.02322 0.0322,-2.67291 -0.0625,-3.46875 -0.0947,-0.79584 -0.34375,-1.90625 -0.34375,-1.90625 0,0 0.53492,0.2443 0.78125,0.1875 0.24633,-0.0568 0.63165,-0.15228 0.59375,-0.53125 -0.0379,-0.37895 -0.53492,-0.52555 -0.78125,-0.46875 -0.24633,0.0568 -0.5,0.1875 -0.5,0.1875 0,0 0.11736,-0.31051 0.25,-0.5 0.13264,-0.18949 0.27361,-0.2936 0.40625,-0.3125 0.13264,-0.0189 0.72341,0.60406 0.875,0.8125 0.15158,0.20843 0.34375,0.52262 0.34375,0.75 0,0.22738 -0.0937,0.4375 -0.0937,0.4375 l 0.96875,-0.34375 c 0,0 0.1629,-0.0605 0.125,-0.25 -0.0379,-0.18948 -0.65327,-0.71677 -0.9375,-0.90625 -0.28423,-0.18949 -0.78125,-0.5 -0.78125,-0.5 0,0 0.60674,0.18953 1.15625,0 0.54951,-0.18948 1.65358,-0.84116 1.3125,-2.28125 -0.34107,-1.4401 -2.07649,-1.54553 -2.53125,-1.375 -0.4548,0.1705 -0.375,0.125 -0.375,0.125 0,0 0.60773,-0.29722 1.0625,-0.5625 0.45477,-0.26528 1.0681,-0.81616 1.125,-1.0625 0.0568,-0.2463 -0.25,-0.3125 -0.25,-0.3125 l -0.84375,-0.28125 c 0,0 0.0814,0.0595 0.0625,0.34375 -0.019,0.28423 -0.12768,0.67122 -0.46875,1.03125 -0.34108,0.36002 -0.54156,0.6439 -0.75,0.625 -0.20843,-0.0189 -0.65625,-0.78125 -0.65625,-0.78125 0,0 0.38333,0.25764 0.78125,0.125 0.39795,-0.13264 0.58244,-0.37867 0.46875,-0.625 -0.11369,-0.2463 -0.60873,-0.44514 -0.96875,-0.3125 -0.36005,0.1326 -0.40625,0.1875 -0.40625,0.1875 0,0 0.44975,-1.74642 0.46875,-3.28125 0.019,-1.53484 -0.4375,-3.75 -0.4375,-3.75 l 0,-2.21875 c 0,0 -0.0549,-0.125 -0.1875,-0.125 -0.0156,0 -0.0178,0.0274 -0.0312,0.0312 -0.0135,-0.004 -0.0156,-0.0312 -0.0312,-0.0312 z m 0.0312,9.875 0.0625,0.0312 c 0,0 0.0861,0.35307 0.21875,0.65625 0.13264,0.30317 0.2178,0.5246 0.3125,0.5625 0.0947,0.0379 0.25,0 0.25,0 0,0 -0.24236,0.23571 -0.375,0.40625 -0.13264,0.17053 -0.38155,0.53797 -0.40625,0.96875 -0.0247,0.43078 -0.0982,0.95632 0.25,1.4375 0.1555,0.1552 0.30575,0.2334 0.34375,0.25 -0.0213,-0.002 -0.0463,-0.0161 -0.0937,0.0312 -0.0947,0.0947 -0.3996,0.69216 -0.4375,0.84375 -0.0379,0.15158 -0.125,0.40625 -0.125,0.40625 0,0 -0.0871,-0.25467 -0.125,-0.40625 -0.0379,-0.15159 -0.3428,-0.74905 -0.4375,-0.84375 -0.0474,-0.0473 -0.0725,-0.0336 -0.0937,-0.0312 0.038,-0.0166 0.18825,-0.0948 0.34375,-0.25 0.34825,-0.48118 0.27468,-1.00672 0.25,-1.4375 -0.0247,-0.43078 -0.27361,-0.79822 -0.40625,-0.96875 -0.13264,-0.17054 -0.375,-0.40625 -0.375,-0.40625 0,0 0.1553,0.0379 0.25,0 0.0947,-0.0379 0.17986,-0.25933 0.3125,-0.5625 0.13268,-0.30318 0.21875,-0.65625 0.21875,-0.65625 l 0.0625,-0.0312 z m -2.03125,1.25 c 0.19244,-0.0102 0.35208,0.0481 0.75,0.375 0.53055,0.43582 0.32307,1.30853 -0.0937,1.6875 -0.41687,0.37898 -1.13333,0.19713 -1.53125,-0.125 -0.39793,-0.32212 -0.35239,-1.02063 -0.125,-1.4375 0.22738,-0.41692 0.78125,-0.46875 0.78125,-0.46875 0.08,-0.007 0.1546,-0.028 0.21875,-0.0312 z m 4.0625,0 c 0.0642,0.003 0.13875,0.0242 0.21875,0.0312 0,0 0.55387,0.0518 0.78125,0.46875 0.22739,0.41687 0.27293,1.11538 -0.125,1.4375 -0.39792,0.32213 -1.11438,0.50398 -1.53125,0.125 -0.41682,-0.37897 -0.6243,-1.25168 -0.0937,-1.6875 0.39792,-0.3269 0.55756,-0.3852 0.75,-0.375 z').attr({'fill':'#534741','stroke':0}).transform('R0,910,222')
//			this.box.path('M 910,222 m -1,10 l 2 0 l -1 -64 z').attr({'fill':'#534741','stroke':0}).transform('R0,910,222')
		);

		// Dial
		this.dial = this.box.set();
		var ox = 333;
		var oy = 100;
		this.dial.push(
			this.box.circle(ox,oy+0.5,26).attr({'fill':'#2a2521','stroke':0}),
			this.box.circle(ox,oy,25).attr({'fill':'270-#ddbc83-#be9c67:66-#ad8a57','stroke':0}),
			this.box.circle(ox,oy,20).attr({'fill':'#ddbc83','stroke':0,'cursor':'pointer'})
		)
		this.dialhandle = this.box.set();
		this.dialhandle.push(
			this.box.path("M "+(ox+0.5)+" "+(oy-6+0.5)+" l 5 10 t -5 30 l 0 0 t -5 -30 z").attr({'fill':'#2a2521','stroke':0,'cursor':'pointer'}).transform('R0,'+ox+','+oy),
			this.box.path("M "+ox+" "+(oy-6)+" l 5 10 t -5 27 l 0 0 t -5 -27 z").attr({'fill':'0-#2a2521-#ddbc83-#2a2521','stroke':0,'cursor':'pointer'}).transform('R0,'+ox+','+oy)
		);
		this.dial.data('mb',this).click(function(e){ this.data('mb').toggleDial(); });
		this.dialhandle.data('mb',this).click(function(e){ this.data('mb').toggleDial(); });


		this.nextbutton = this.box.set();
		var ox = 941;
		var oy = 640;
		var r = 40;
		this.nextbutton.push(
			this.box.circle(ox,oy+0.5,r).attr({'fill':'#534741','stroke':0}),
			this.box.circle(ox,oy,r*0.95).attr({'fill':'#ddbc83','stroke':0}),
			this.box.circle(ox,oy,r*0.81).attr({'fill':'90-#ddbc83-#be9c67:66-#ad8a57','stroke':0}),
			this.box.circle(ox,oy,r*0.75).attr({'fill':'#f8f7f6','stroke':0,'cursor':'pointer'}),
			this.box.path('M'+ox+','+oy+'m'+(-r*0.5)+','+(-r*0.2)+' l'+(r*0.5)+',0 l0,'+(-r*0.2)+' l'+(r*0.5)+','+(r*0.4)+' l'+(-r*0.5)+','+(r*0.4)+' l0,'+(-r*0.2)+'l'+(-r*0.5)+',0 z').attr({'fill':'#534741','stroke':0,'cursor':'pointer'})
		);
		this.nextbutton.data('mb',this).click(function(e){ this.data('mb').next(); });
			
		this.scaleBox();
	}
	
	MessierBingo.prototype.next = function(){
		if(this.todo.length == 0) return this;
		var i;
		if(this.todo.length > 1){
			i = Math.round((this.todo.length-1)*Math.random());
		}else if(this.todo.length == 1){
			i = 0;
		}
		this.loadMessierObject(this.todo[i]);
		this.todo.splice(i,1);
		console.log(i,this.todo.length);
	}
	MessierBingo.prototype.loadMessierObject = function(i){
		this.updateInfo(i);
		$.ajax({
			url: 'db/M'+i+'.json',
			method: 'GET',
			dataType: 'json',
			context: this,
			error: function(){
				this.updateInfo(i,{'error':'error'});
			},
			success: function(data){
				this.updateInfo(i,data);
			}
		});
		return this;
	}

	MessierBingo.prototype.updateInfo = function(i,data){
		var m = this.catalogue[i-1];
		$('#sky img').attr('src','images/iris.png');
		if(data && data.observation){
			$('#sky img').attr('src',data.observation.image.thumb);
		}
		if($('#panel .messier').length == 0){
			$('#panel').html('<h3 class="messier"></h3><p class="altname"></p><p class="type"></p><p class="distance"></p><p class="credit"></p><p class="date"></p>');
		}
		$('#panel .messier').html(m.m);
		$('#panel .altname').html((m.name) ? '('+m.name+')' : '');
		$('#panel .distance').html('<strong>Distance:</strong> '+(m.distance >= 60000 ? '>' : '')+(m.distance*1000)+' lyr');
		$('#panel .type').html('<strong>Type:</strong> '+m.type);
		if(data){
			if(data.observation){
				$('#sky img').attr('src',data.observation.image.thumb);
				cache = new Image();
				var fn = function(){ $('#sky img').attr('src',cache.src); }
				cache.onload = fn;
				cache.src = data.observation.image.about;
				if(cache.complete) fn();

				$('#panel .credit').html('<strong>Image by:</strong> <em>'+data.observation.observer.label+'</em> using '+data.observation.instr.tel)
			}else{
				$('#sky img').attr('src','images/missing.png');
				$('#panel .credit').html('');
			}
		}
	}
	
	MessierBingo.prototype.toggleDial = function(){
		if(typeof this.dialon!=="boolean") this.dialon = true;
		this.dialon = !this.dialon;
		this.setDial(this.dialon);
	}

	MessierBingo.prototype.setDial = function(on){
		var ang = (on) ? 30 : -30;
		var d,i;
		for(d = 0 ; d < this.dialhandle.length; d++) this.updateRotation(this.dialhandle[d],ang,333,100);
	}
	
	MessierBingo.prototype.updateRotation = function(el,ang,ox,oy){
		var t = el.attr('transform');
		var m = false;
		for(var i = 0; i < t.length ; i++){
			if(t[i][0] == 'r' || t[i][0] == 'R'){
				t[i] = ['R',ang,ox,oy];
				m = true;
			}
		}
		if(!m) t.push(['R',ang,ox,oy]);
		el.attr({'transform':t});
		return this;
	}
	
	MessierBingo.prototype.setTime = function(){
		var now = new Date();
		var h = (((now.getUTCHours()+now.getUTCMinutes()/60) % 12)*360/12);
		var m = ((now.getUTCMinutes() % 60)*360/60);
		var s = (((now.getUTCSeconds()+now.getUTCMilliseconds()/1000) % 60)*360/60);
		var angs = [h,m,s];
		for(var h = 0 ; h < this.hands.length ; h++) this.updateRotation(this.hands[h],angs[h],910,222);
		return this;
	}

	MessierBingo.prototype.moveEyes = function(x,y){
		var eye = { x:109.5, y: 121, dx: 2, dy: 2 };
		var dx = x-eye.x;
		var dy = y-eye.y;
		this.messier[0].attr({x:eye.x+eye.dx*((dx < 0) ? dx/eye.x : dx/(this.wide-eye.x)),y:eye.y+eye.dy*((dy < 0) ? dy/eye.y : dy/(this.tall-eye.y))})
		return this;
	}
	
	MessierBingo.prototype.makePipe = function(x,y,dx,dy,t){
		var r = t;
		this.pipes.push(
			this.box.path('M '+x+','+y+' h '+(dx-r)+' c '+(r/2)+',0 '+r+','+(r/3)+' '+r+','+r+' v '+(dy-r)+' h -'+t+' v -'+(dy-r-t)+' c 0,-'+(t*0.75)+' 0,-'+t+' -'+t+',-'+t+' h -78.139 z').attr({'fill':'#534741','stroke':0}),
			this.box.path('M '+x+','+(y+t*0.15)+' h '+(dx-r*1.05)+' c '+(r/2)+',0 '+r+','+(r/3)+' '+(r*0.9)+','+(r*0.9)+' v '+(dy-r-(t*0.1))+' h -'+(t*0.75)+' v -'+(dy-r-t*0.9)+' c 0,-'+(t*0.75)+' 0,-'+t+' -'+t+',-'+t+' h -72.139 z').attr({'fill':'#ad8a57','stroke':0}),
			this.box.path('M '+x+','+(y+t*0.3)+' h '+(dx-r*1.3)+' c '+(r/2)+',0 '+r+','+(r/3)+' '+(r*0.85)+','+(r*0.85)+' v '+(dy-r-t*0.3)+' h -'+(t/7)+' v -'+(dy-r-t*0.5)+' c 0,-'+(t*0.75)+' 0,-'+t+' -'+(t*0.95)+',-'+(t*0.95)+' h -73.139 z').attr({'fill':'#ddbc83','stroke':0})
		);
		return this;
	}
	
	MessierBingo.prototype.makeScrew = function(ox,oy,r,ang){
		var rad = r*1.0
		if(typeof ang!=="number") ang = Math.random()*180;
		var a = 12;
		var d2r = Math.PI/180;
		var dx = r/10;
		var dy = r/7;
		var x1,y1,x2,y2,x3,y3,x4,y4;
		x1 = ox + r*Math.cos((ang+a)*d2r);	
		y1 = oy + r*Math.sin((ang+a)*d2r);
		x2 = ox + r*Math.cos((ang+180-a)*d2r);
		y2 = oy + r*Math.sin((ang+180-a)*d2r);
		x3 = ox + r*Math.cos((ang-a)*d2r);	
		y3 = oy + r*Math.sin((ang-a)*d2r);
		x4 = ox + r*Math.cos((ang+180+a)*d2r);
		y4 = oy + r*Math.sin((ang+180+a)*d2r);
		var path = 'M '+x1+','+y1+' a'+rad+','+rad+' 0 0,1 '+(x2-x1)+','+(y2-y1)+' M '+x3+','+y3+' a'+rad+','+rad+' 0 0,0 '+(x4-x3)+','+(y4-y3)+' z';
		var path2 = 'M '+(x1+dx)+','+(y1+dy)+' a'+rad+','+rad+' 0 0,1 '+(x2-x1)+','+(y2-y1)+' M '+(x3+dx)+','+(y3+dy)+' a'+rad+','+rad+' 0 0,0 '+(x4-x3)+','+(y4-y3)+' z';
		this.screws.push(
			this.box.circle(ox+dx,oy+dy,r).attr({'fill':'#bc8550','stroke':0,'opacity':0.7}),
			this.box.path(path2).attr({'fill':'#534741','stroke':0}),
			this.box.path('M '+x1+' '+y1+' L '+(x1+dx)+' '+(y1+dy)+' L '+(x2+dx)+' '+(y2+dy)+' L '+(x2)+' '+(y2)+' z M '+x3+' '+y3+' L '+(x3+dx)+' '+(y3+dy)+' L '+(x4+dx)+' '+(y4+dy)+' L '+(x4)+' '+(y4)+' z').attr({'fill':'#534741','stroke':0	}),
			this.box.path(path).attr({'fill':'#d1a974','stroke':0})
		)
		return this;
	}

	MessierBingo.prototype.makeNut = function(ox,oy,r,ang){
		var path = "";
		var path2 = "";
		var a = Math.PI/3;
		var da = a/20;
		var xf,yf,xb,yb;
		if(typeof ang!=="number") ang = Math.random()*a;
		for(var i = 0; i < 6 ; i++){
			xb = r*Math.cos((i*a)-da+ang);
			yb = r*Math.sin((i*a)-da+ang);
			path += (i==0 ? 'M ' : 'L')+(xb+ox)+' '+(yb+oy);
			path2 += (i==0 ? 'M ' : 'L')+(xb+ox+r/12)+' '+(yb+oy+r/7);
			xf = r*Math.cos((i*a)+da+ang);
			yf = r*Math.sin((i*a)+da+ang);
			path += ' '+(xf+ox)+' '+(yf+oy)+' '
			path2 += ' '+(xf+ox+r/12)+' '+(yf+oy+r/7)+' '
		}
		this.nuts.push(
			this.box.path(path2+'z').attr({'fill':'#2a2521','stroke':0,'opacity':0.7}),
			this.box.path(path+'z').attr({'fill':'315-#fff-#EDD089:46-#E0B96D:68-#BF8329','stroke':0}),
			this.box.circle(ox,oy,r*0.7,r*0.7).attr({'fill':'#d1a974','stroke':0})
		)
		return this;		
	}

	MessierBingo.prototype.keypress = function(charCode,event){
		if(!event) event = { altKey: false };
		for(var i = 0 ; i < this.keys.length ; i++){
			if(this.keys[i].charCode == charCode && event.altKey == this.keys[i].altKey){
				this.keys[i].fn.call(this,{event:event});
				break;
			}
		}
	}

	// Register keyboard commands and associated functions
	MessierBingo.prototype.registerKey = function(charCode,fn,txt){
		if(typeof fn!="function") return this;
		if(typeof charCode!="object") charCode = [charCode];
		var aok, ch, c, i, alt, str;
		for(c = 0 ; c < charCode.length ; c++){
			alt = false;
			if(typeof charCode[c]=="string"){
				if(charCode[c].indexOf('alt')==0){
					str = charCode[c];
					alt = true;
					charCode[c] = charCode[c].substring(4);
				}else str = charCode[c];
				ch = charCode[c].charCodeAt(0);
			}else{
				ch = charCode[c];
				if(ch==37) str = "&larr;";
				else if(ch==32) str = "space";
				else if(ch==38) str = "up";
				else if(ch==39) str = "&rarr;";
				else if(ch==40) str = "down";
				else str = String.fromCharCode(ch);
			}
			aok = true;
			for(i = 0 ; i < this.keys.length ; i++){ if(this.keys.charCode == ch && this.keys.altKey == alt) aok = false; }
			if(aok) this.keys.push({'str':str,'charCode':ch,'char':String.fromCharCode(ch),'fn':fn,'txt':txt,'altKey':alt});
		}
		return this;
	}
	$.messierbingo = function(placeholder,input) {
		if(typeof input=="object") input.container = placeholder;
		else {
			if(placeholder){
				if(typeof placeholder=="string") input = { container: placeholder };
				else input = placeholder;
			}else{
				input = {};
			}
		}
		input.plugins = $.messierbingo.plugins;
		return new MessierBingo(input);
	};

	$.messierbingo.plugins = [];

})(jQuery);

var mb;
$(document).ready(function(){

	mb = $.messierbingo();
});