(function($)
{
	/*
	*	author: Pierre Laveklint
	*			twitter: @laveklint
	*	as of now, give each div/article/li container for each image the class of '.image'
	*	
	*	<div id='#gallerywrapid'>
	*		<div class='image'><a href='linktofullsizeimage'><img src='linktothumbnail'/></a>
	*		<div class='image'><a href='linktofullsizeimage'><img src='linktothumbnail'/></a>
	*		<div class='image'><a href='linktofullsizeimage'><img src='linktothumbnail'/></a>
	*	</div>
	*
	*	$("#gallerywrapid").fsimgviewer();
	*
	*/
	var FSImageViewer = function( element, options )
	{
		var dummy,
		nextNav,
		prevNav,
		closeNav,
		fullNav,
		viewwrap,
		loader,
		container,
		IMAGE,
		IMAGEHEIGHT,
		IMAGEWIDTH,
		MAXWIDTH,
		MAXHEIGHT,
		cImgH,
		cImgW,
		fullsize,
		inFullsize		= false,
		IMAGEINDEX 		= 0,
		VIEWHEIGHT 		= $(window).height(),
		VIEWWIDTH 		= $(window).width(),
		IMGWRAP			= $('.image'),
		IMGLINK			= $('.image a'),
		ARTICLES 		= $(IMGWRAP).find('a').toArray(),
		elem 			= $(element),
		obj				= this,
		settings		= $.extend(
						{
							maxwidth:0,
							maxheight:0,
							fullsize:false
						}, 	options || {} );

		var _init = function()
		{
			_setParams();
			_createViewer();
			_createControls();
			_mapGallery();
		};

		var _setParams = function()
		{
			_getViewBounds();
			_getImageBounds();

			fullsize = settings.fullsize;
		}

		var _createViewer = function()
		{
			var wrap = '<div id="fs_viewwrap"></div>'
			$('body').prepend(wrap);
			viewwrap = $('#fs_viewwrap');

			var imgcontainer = '<div id="fs_container"></div>';
			$(viewwrap).prepend(imgcontainer);
			container = $('#fs_container');
		};

		var _createControls = function()
		{
			var navPrev 	= '<a href="#" id="fs_navprev"></a>';
			var navNext 	= '<a href="#" id="fs_navnext"></a>';
			var navClose	= '<a href="#" id="fs_navclose"></a>';
			var navFull		= '<a href="#" id="fs_navfull"></a>';
			var navCancel	= '<a href="#" id="fs_navfullcancel"></a>';
			var ldr			= '<div id="fs_loader" class="fs_loading"></div>';

			if( ARTICLES.length > 1 )
			{
				$(viewwrap).append(navPrev);
				$(viewwrap).append(navNext);
				prevNav 	= $('#fs_navprev');
				nextNav 	= $('#fs_navnext');

				$(nextNav).click(function()
				{
					IMAGEINDEX++;
					if( IMAGEINDEX == ARTICLES.length ) IMAGEINDEX = 0;

					if( inFullsize ) _exitFullsize();

					var newImage = ARTICLES[IMAGEINDEX];
					_setImage(newImage);
				});

				$(prevNav).click(function()
				{
					IMAGEINDEX--;
					if( IMAGEINDEX < 0 ) IMAGEINDEX = ARTICLES.length-1;

					if( inFullsize ) _exitFullsize();

					$(container).hide();
					var newImage = ARTICLES[IMAGEINDEX];
					_setImage(newImage);
				});
			}

			if( fullsize )
			{
				$(viewwrap).append(navFull);
				$(viewwrap).append(navCancel);
				fullNav		= $('#fs_navfull');
				fullCancel 	= $('#fs_navfullcancel');
			}

			$(viewwrap).append(navClose);
			$(viewwrap).append(ldr);
			closeNav	= $('#fs_navclose');
			loader 		= $('#fs_loader');

			$(closeNav).click(function()
			{
				$(elem).show();
				$(viewwrap).fadeOut('fast');
			});
		};

		var _mapGallery = function()
		{
			$(IMGLINK).each(function(index)
			{
				$(this).click(function()
				{
					IMAGEINDEX = index;
					var imageURL = $(this).attr('href');

					_setImage(imageURL);
					return false;
				});
			});
		};

		var _initViewer = function()
		{
			if( ARTICLES.length > 1 )
			{
				$(nextNav).css({'opacity' : '0.3'});
				$(prevNav).css({'opacity' : '0.3'});

				$(nextNav).hover(function(){
					$(this).css({'opacity' : '1'});
				}, function(){
					$(this).css({'opacity' : '0.3'});
				});

				$(prevNav).hover(function(){
					$(this).css({'opacity' : '1'});
				}, function(){
					$(this).css({'opacity' : '0.3'});
				});
			}
			
			$(closeNav).css({'opacity' : '0.3'});
			$(closeNav).hover(function(){
				$(this).css({'opacity' : '1'});
			}, function(){
				$(this).css({'opacity' : '0.3'});
			});

			if( fullsize )
			{
				$(fullNav).css({'opacity' : '0.3'}).hide();
				$(fullNav).hover(function(){
					$(this).css({'opacity' : '1'});
				}, function(){
					$(this).css({'opacity' : '0.3'});
				});

				$(fullCancel).css({'opacity' : '0.3'}).hide();
				$(fullCancel).hover(function(){
					$(this).css({'opacity' : '1'});
				}, function(){
					$(this).css({'opacity' : '0.3'});
				});
			}
		}

		var _setImage = function( url )
		{
			_initViewer();

			$(elem).hide();
			IMAGE = new Image();

			$(loader).show();
			$(viewwrap).css({ 'left' : 0, 'top' : 0 });
			$(viewwrap).fadeIn('normal');
			$(container).hide();

			IMAGE.onload = function()
			{
				IMAGEHEIGHT = IMAGE.height;
				IMAGEWIDTH = IMAGE.width;

				$(container).html(this);

				_resizeImage();

				_repositionImage();

				if( fullsize )
					_enableFullsize();
				
				$(loader).hide();
				$(container).fadeIn('fast');

				IMAGE.onload = IMAGE.onerror = null;
			};

			IMAGE.onerror = function(){
				// on error
			};

			$(IMAGE).attr('class', 'fs_image');
			IMAGE.src = url;
			
		};

		var _enableFullsize = function()
		{
			$(fullNav).show();
			$(fullNav).click(function()
			{
				if( IMAGEWIDTH > VIEWWIDTH || IMAGEHEIGHT > VIEWHEIGHT )
				{
					var x = ( VIEWWIDTH - IMAGEWIDTH ) * .5;
					var y = 0;
					$('.fs_image').stop().animate({width: IMAGEWIDTH, height: IMAGEHEIGHT }, 600, "easeInOutExpo" );
					$(container).stop().animate({ 'left' : x, 'top' : y }, 600, "easeInOutExpo");
	
					$(this).stop().hide();
	
					inFullsize = true;
					$(fullCancel).stop().show();
	
					_pan();
				}
				
			});
		}

		var _exitFullsize = function()
		{
			inFullsize = false;
	    	$('.fs_image').unbind("mousemove");
	    	$(fullCancel).hide();
		    $(fullNav).show();
		}

		var _pan = function()
		{
			$('.fs_image').bind("mousemove", function(event){
				var target = $(this);
       		 	_mouseMove( event,target );
    		});

    		$(fullCancel).click(function()
	    	{
	    		var px = ( VIEWWIDTH - cImgW ) * .5;
				var py = ( VIEWHEIGHT - cImgH ) * .5;

	    		$('.fs_image').stop().animate({width: cImgW, height: cImgH }, 600, "easeOutCirc" );
				$(container).stop().animate({ 'left' : px, 'top' : py }, 600, "easeOutCirc");

				_exitFullsize();
	    	});
		}

		var _mouseMove = function(e, target)
		{
			var img = target;
			
	        var mouseCoordsX=(e.pageX - $(viewwrap).offset().left);
	        var mouseCoordsY=(e.pageY - $(viewwrap).offset().top);
	        var mousePercentX=mouseCoordsX/VIEWWIDTH;
	        var mousePercentY=mouseCoordsY/VIEWHEIGHT;
	        var destX=-(((IMAGEWIDTH-(VIEWWIDTH))-VIEWWIDTH)*(mousePercentX));
	        var destY=-(((IMAGEHEIGHT-(VIEWHEIGHT))-VIEWHEIGHT)*(mousePercentY));
	        var thePosA=mouseCoordsX-destX;
	        var thePosB=destX-mouseCoordsX;
	        var thePosC=mouseCoordsY-destY;
	        var thePosD=destY-mouseCoordsY;
	        var marginL=$(container).css("marginLeft").replace("px", "");
	        var marginT=$(container).css("marginTop").replace("px", "");
	        var animSpeed=400;
	        var easeType="easeOutCirc";
	        if(mouseCoordsX>destX || mouseCoordsY>destY){
	            $(container).stop().animate({
		            left: ( $(container).width() > VIEWWIDTH ? (-thePosA-marginL) : $(container).offset().left ),
		            top: ( $(container).height() > VIEWHEIGHT ? (-thePosC-marginT) : $(container).offset().top ) },
		            animSpeed, 
		            easeType);
	        } else if(mouseCoordsX<destX || mouseCoordsY<destY){
	            $(container).stop().animate({
		            left: ( $(container).width() > VIEWWIDTH ? (thePosB-marginL) : $(container).offset().left ), 
		            top: ( $(container).height() > VIEWHEIGHT ? (thePosD-marginT) : $(container).offset().top ) },
		            animSpeed, 
		            easeType);
	        } else {
	            $(container).stop();
	        }
	    }


		var _resizeImage = function()
		{
			var heightRatio = MAXHEIGHT / IMAGEHEIGHT;
			var widthRatio	= MAXWIDTH / IMAGEWIDTH; 
			var mixRatioH 	= IMAGEHEIGHT * widthRatio;
			var mixRatioW	= IMAGEWIDTH * heightRatio;

			if( IMAGEWIDTH < MAXWIDTH && IMAGEHEIGHT >= MAXHEIGHT )
			{
				
				$('.fs_image').css({'width' : IMAGEWIDTH * heightRatio, 'height' : MAXHEIGHT });
				cImgW = IMAGEWIDTH * heightRatio;
				cImgH = MAXHEIGHT;
				return;
			}

			if( IMAGEWIDTH >= MAXWIDTH || IMAGEHEIGHT >= MAXHEIGHT )
			{
				if( IMAGEWIDTH > IMAGEHEIGHT )
				{	
					if( mixRatioH > MAXHEIGHT )
					{
						$('.fs_image').css({'width' : IMAGEWIDTH * heightRatio, 'height' : IMAGEHEIGHT * heightRatio });
						cImgW = IMAGEWIDTH * heightRatio;
						cImgH = IMAGEHEIGHT * heightRatio;
					} else
					{
						$('.fs_image').css({'width' : MAXWIDTH, 'height' : IMAGEHEIGHT * widthRatio  });
						cImgW = MAXWIDTH;
						cImgH = IMAGEHEIGHT * widthRatio;
					}
				} else
				{
					if( mixRatioW < MAXWIDTH )
					{ 
						$('.fs_image').css({'width' : IMAGEWIDTH * heightRatio, 'height' : MAXHEIGHT });
						cImgW = IMAGEWIDTH * heightRatio;
						cImgH = MAXHEIGHT;
					} else
					{
						$('.fs_image').css({'width' : MAXWIDTH, 'height' : IMAGEHEIGHT * widthRatio });
						cImgW = MAXWIDTH;
						cImgH = IMAGEHEIGHT * widthRatio;
					}
						
				}
			} 
			else
			{
				$('.fs_image').css({'width' : IMAGEWIDTH, 'height' : IMAGEHEIGHT });
			    cImgW = IMAGEWIDTH;
			    cImgH = IMAGEHEIGHT;
			}
		}

		var _repositionImage = function()
		{
			var px = ( VIEWWIDTH - $('.fs_image').width() ) * .5;
			var py = ( VIEWHEIGHT - $('.fs_image').height() ) * .5;
			$(container).css({ 'left' : px, 'top' : py });
			$(viewwrap).css({ 'left' : 0, 'top' : 0 });
		}

		var _getViewBounds = function()
		{
			var view 	= _getViewPort();
		  	VIEWHEIGHT 	= view[1];
		  	VIEWWIDTH 	= view[0];
		}

		var _getImageBounds = function()
		{
			MAXWIDTH 	= settings.maxwidth > 0 && settings.maxwidth <= VIEWWIDTH ? settings.maxwidth : VIEWWIDTH;
			MAXHEIGHT 	= settings.maxheight > 0 && settings.maxheight <= VIEWHEIGHT ? settings.maxheight : VIEWHEIGHT;
		}

		var _getViewPort = function()
		{
			return [ $(window).width(), $(window).height() ];
		}

		$(window).resize(function() 
		{
			_getViewBounds();
			_getImageBounds();

			if( !inFullsize )
			{
				_resizeImage();
				_repositionImage();
			}
		});

		_init();
	};

	$.fn.fsimgviewer = function( options )
	{
		return this.each( function()
		{
			var element = $(this);

			if( element.data( 'fsimgviewer' )) return;

			var fsimgviewer = new FSImageViewer( this, options );

			element.data( 'fsimgviewer', fsimgviewer );
		});
	};
})(jQuery);