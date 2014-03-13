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
					$('.loan-landing .nav').on('click', function(e){
						showSubContent();					
						return false;
					});					
					$('.loan-options .expanded').on('click', function(e){
						showRateOptions();					
						return false;
					});
					$('.loan-rates').on('click', function(e){
						showRateBenefits();
						return false;
					});					
					$('.nav-fixed').on('click', function(e){
						resetLoans();
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

					$('.loan-benefits').fadeOut(300);
					$('.loan-rates').fadeOut(300);

					TweenMax.allTo([$('.loan-landing h2'), $('p.description')], 0.5, {opacity: '1', ease: Power2.easeOut, delay: 0.1});
					TweenMax.allTo([$('.loan-landing .nav')], 0.5, {opacity: '1', ease: Power2.easeOut, delay: 0});
					
					$('.quick-links, .loan-center, .nav-fixed').fadeOut(600);
					
					TweenMax.allTo([$('.quick-links'), $('.loan-center')], 0.5, {marginTop: '0', ease: Power2.easeOut, delay: 0.1});

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
				showSubContent = function(){
					//$('.loan-landing a.nav').slideUp();	

					TweenMax.allTo([$('.loan-landing h2'), $('p.description')], 0.5, {opacity: '0', ease: Power2.easeOut, delay: 0.1});
					TweenMax.allTo([$('.loan-landing .nav')], 0.5, {opacity: '0', ease: Power2.easeOut, delay: 0});
					
					$('.quick-links, .loan-center, .nav-fixed').fadeIn(600);
					
					TweenMax.allTo([$('.quick-links'), $('.loan-center')], 0.5, {marginTop: '-100px', ease: Power2.easeOut, delay: 0.1});


				},
				showRateOptions = function(){
					//$('.loan-options a.default').slideFadeToggle(200);
					//$('.loan-options a.expanded').slideFadeToggle(300);		
					$('.loan-benefits').fadeOut(300);
					$('.loan-rates').fadeOut(300);
					$('.loan-rates').fadeIn(300);
					var $scrollheight = $('#slide-loans').height();


					TweenLite.to(".loan-landing h1", 1, {fontSize:"40px", top:"126px", left:"407px", ease:Power2.easeInOut});

					//$("#slide-loans").height($scrollheight);


					var $screenWidth = $('body').width();
					var $loanCenterOffset = $('.loan-center').position().left;

					$('.scrollWrapper').stop().animate({
						scrollLeft: $loanCenterOffset
						}, 1000);
				},		
				showRateBenefits = function(){
					$('.loan-benefits').fadeOut(300);
					$('.loan-benefits').fadeIn(300);

					var $screenWidth = $('body').width();
					var $scrollAreaWidth = $('.scrollableArea').width();
					var $loanRatesOffset = $scrollAreaWidth - $screenWidth - 20;

					
					$('.scrollWrapper').stop().animate({
						scrollLeft: $loanRatesOffset
						}, 1000);
				},
				resetLoans = function(){
					$('.loan-benefits').fadeOut(300);
					$('.loan-rates').fadeOut(300);

					TweenMax.allTo([$('.loan-landing h2'), $('p.description')], 0.5, {opacity: '1', ease: Power2.easeOut, delay: 0.8});
					TweenMax.allTo([$('.loan-landing .nav')], 0.5, {opacity: '1', ease: Power2.easeOut, delay: 0.8});
					
					$('.loan-center, .nav-fixed').fadeOut(600);

					TweenLite.to(".loan-landing h1", 1, {fontSize:"56px", top:"240px", left:"215px", ease:Power2.easeInOut});

					
					TweenMax.allTo([$('.loan-center')], 0.5, {marginTop: '0', ease: Power2.easeOut, delay: 0.1});

					$('.scrollWrapper').stop().animate({
						scrollLeft: 0
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