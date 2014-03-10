$(window).load(function(){
				
		// the main container
	var $GPContainer	= $('.feature-grid'),
		// the promos (the thumbs)
		$promos		= $GPContainer.find('.feature-promo'),
		// total number of promos
		totalPromos	= $promos.length,

		// the fullview container
		$fullview		= $('.full-view');
		// the overlay
		//$overlay		= $('<div class="overlay"></div>').prependTo( $('.main-container') );

		console.log(totalPromos);

		
		GridPromos	= (function() {
				// current will be the index of the current article
			var animspeed				= 500,
				animeasing				= 'jswing', // try easeOutExpo
				current					= -1,
				// indicates if certain elements can be animated or not at a given time
				animrun					= false,
				init = function() {
					initPlugins();
					initEventsHandler();
				},
				// initialize plugins
				initPlugins				= function() {
					// apply plugin functions	
				},
				// events
				initEventsHandler		= function() {
					// switch to fullview when we click the "View Project" link
					$promos.each( function(i) {
						$(this).bind('click.GridPromos', function(e) {

							var $promo	= $(this);
							// update the current value
							current	= $promo.index('.grid-item');

							// hide scrollbar
							//$('body').css( 'overflow', 'hidden' );
							// preload the fullview image and then start the animation (showArticle)

							showPromo( $promo );
							
							return false;
						});
					});
					
					// switch to thumbs view
					$('.full-view').find('span.full-view-exit').on('click',  function(e) {
						var $promo	= $promos.eq( current );
						hideFullView( $promo );
						e.stopPropagation();
					});

					$('a.flip').on('click', function(e){
						showLoans();
						return false;
					});
					$('.loan-options a.default').on('click', function(e){
						showBuyOptions();					
						return false;
					});					
					$('.loan-options a.expanded').on('click', function(e){
						showRateOptions();					
						return false;
					});
					$('.loan-rates').on('click', function(e){
						showRateBenefits();
						return false;
					});



					// window resize 
					// center the background image if in fullview
					// reinitialise jscrollpane
					/*$(window).bind('resize.GridPromos', function(e) {
						var $bgimage	= $fullview.find('img.bg-img');
					});*/
				},
				// Add class and animate to full view
				showPromo				= function( $promo ) {
					//console.log('showpromo');
					// clone the promo
					var	$clone	= $promo.clone().css({
						left	: $promo.offset().left + 'px',
						top		: $promo.offset().top + 'px',
						zIndex	: 1001,
						margin	: '0px',
						height	: $promo.height() + 'px'
					}).attr( 'id', 'promo-clone' );

					$fullview.fadeIn().addClass('in');
					
				},
				// close the fullview
				// this function will also be used when we close the fullview promo. 
				hideFullView = function( $promo ) {
					// remove class set back to grid view
					//console.log('hidefullview');
					$fullview.fadeOut().removeClass('in');
					$('.card').removeClass('flipped');
				},
				//enable card flip
				showLoans = function(){
					$('.card').addClass('flipped');
					$("#TouchScroller").smoothTouchScroll({ continuousScrolling: false });

					var $scrollheight = $('.scrollWrapper').height();
					//console.log($scrollheight);
					//$('#slide-loans').height($scrollheight);
					//$('.main-container').height($scrollheight);
				},
				showProducts = function(){
					//console.log('unflip');
					$('.card').removeClass('flipped');
				},
				showBuyOptions = function(){
					$('.loan-options a.default').slideFadeToggle(200);
					$('.loan-options a.expanded').slideToggle(400);		

					setTimeout(function() {
						$("img.hide").fadeIn();
					}, 500 );	

				},
				showRateOptions = function(){
					//$('.loan-options a.default').slideFadeToggle(200);
					//$('.loan-options a.expanded').slideFadeToggle(300);		
					$('.loan-rates').slideFadeToggle(300);
					var $scrollheight = $('#slide-loans').height();

					//$("#slide-loans").height($scrollheight);


					var $screenWidth = $('body').width();
					var $loanCenterOffset = $('.loan-center').position().left;

					$('.scrollWrapper').stop().animate({
						scrollLeft: $loanCenterOffset
						}, 1000);
				},		
				showRateBenefits = function(){
					$('.loan-benefits').fadeIn(400);
					var $screenWidth = $('body').width();
					var $scrollAreaWidth = $('.scrollableArea').width();
					var $loanRatesOffset = $scrollAreaWidth - $screenWidth - 20;

					
					$('.scrollWrapper').stop().animate({
						scrollLeft: $loanRatesOffset
						}, 1000);
				};

			
			return {
				init	: init
			};
			
		})();
	
	GridPromos.init();
	
});

$.fn.slideFadeToggle  = function(speed, easing, callback) {
        return this.animate({opacity: 'toggle', height: 'toggle'}, speed, easing, callback);
};