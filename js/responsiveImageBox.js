/*
 * @file      : Simple lightweight image lightbox gallery
 * @@date     : 20/08/2014, 9:09:57 AM
 * @author    : bonin.c.m@gmail.com
 * @extras    : responsiveImageBox.css, font-awesome.css
 */

(function($) {

  $.fn.responsiveImageBox = function(options) {
    //options are... optional
    options = options || {};
    var $images = $(this),
            $alt = [],
            $overlay = [],
            $imageHolder = [],
            $imageWrap = [],
            $imageClose = [],
            $arrowLeft = [],
            $arrowRight = [],
            $body = $('body'),
            imageObj = {},
            viewPortDims = {},
            viewPortDims = {},
            imageMargin = 30,
            breakPoint = 768,
            imageBoxImages = {},
            currentIndex = 0,
            usesGallery = false,
            currentlyViewing = false;

    // set up methods
    var methods = {
      init: function() {
        var existingResizeFunction = window.onresize;

        // listen for width changes
        window.onresize = function() {
          if (existingResizeFunction != null) {
            // this way we update the existing resize functionality with ours & don't overwrite anything
            existingResizeFunction();
          }
          // now our new stuff
          if (currentlyViewing) {
            methods.resize.call(this, currentIndex);
          }
        };

        $images.each(function(i) {
          var $this = $(this),
                  galleryImage = false;

          if ($this.hasClass('imagebox-gallery')) {
            galleryImage = true;
            usesGallery = true;
          }

          // initiate object property for image & set some properties
          imageBoxImages[i] = {};
          imageBoxImages[i].altTag = $this.attr('alt');
          imageBoxImages[i].altText = (imageBoxImages[i].altTag != '' && imageBoxImages[i].altTag != undefined) ? imageBoxImages[i].altTag : 'Show image';
          imageBoxImages[i].imageSrc = $this.attr('src');
          imageBoxImages[i].imgPos = {};
          imageBoxImages[i].imgDims = {};
          imageBoxImages[i].imgOrigDims = {};
          imageBoxImages[i].galleryImage = galleryImage;

          // find our image
          imageObj[i] = {};
          imageObj[i] = new Image();
          imageObj[i].src = imageBoxImages[i].imageSrc;
          imageObj[i].onload = function() {
            //get original height and width of image
            imageBoxImages[i].imgOrigDims.width = imageObj[i].width;
            imageBoxImages[i].imgOrigDims.height = imageObj[i].height;
          };


          // hide the image so insert replace with alt
          $alt = $('<div>', {class: 'imagebox image-alt'});
          // insert with alt text
          $this.after($alt
                  .append($('<i>', {class: 'fa fa-image'})
                          .css({'padding-right': '5px'}))
                  .append(imageBoxImages[i].altText));

          // apply click listenter to alt
          $alt.bind('click', function() {
            // functionality occurs on smaller devices or in the gallery style
            if ($(window).width() < breakPoint || galleryImage) {
              methods.viewImage.call(this, i);
            }
          });

          //apply click listenter to image
          $this.bind('click', function() {
            // functionality occurs on smaller devices or in the gallery style
            if ($(window).width() < breakPoint || galleryImage) {
              methods.viewImage.call(this, i);
            }
          });
        });

      }
      ,
      /**
       * show the image in a lightbox
       */
      viewImage: function(i) {

        var imageRef = imageBoxImages[i];
        // reset our current Index
        currentIndex = i;

        // create elements
        $overlay = $('<div>', {class: 'imagebox imageboxview imagebox-overlay'});
        $imageWrap = $('<div>', {class: 'imagebox imageboxview imagebox-wrap'});
        $imageHolder = $('<img>', {class: 'imagebox imageboxview imagebox-image', src: imageRef.imageSrc});
        $imageClose = $('<div>', {class: 'imagebox imageboxview imagebox-close'}).html('X');
        $arrowLeft = $('<div>', {class: 'imagebox imageboxview imagebox-arrow imagebox-left'}).append($('<i>', {class: 'fa fa-chevron-left'}));
        $arrowRight = $('<div>', {class: 'imagebox imageboxview imagebox-arrow imagebox-right'}).append($('<i>', {class: 'fa fa-chevron-right'}));
        // add the image box elements
        $body
                .prepend($overlay)
                .prepend($imageWrap
                        .append($imageHolder)
                        .append($arrowLeft)
                        .append($arrowRight)
                        .append($imageClose));

        methods.calculateDimensions.call(this, i);
        methods.applyDimensions.call(this, i);

        // now fade it in nicely
        $overlay.fadeIn(400, function() {
          // apply handlers for closing
          $(this).click(function() {
            methods.clearImageBox.call(this);
          });

          $imageClose.click(function() {
            methods.clearImageBox.call(this);
          });

          $arrowLeft.click(function() {
            methods.changeImage.call(this, (currentIndex - 1));
          });

          $arrowRight.click(function() {
            methods.changeImage.call(this, (currentIndex + 1));
          });

        });

        $imageWrap.fadeIn(400, function() {
          currentlyViewing = true;
        });

      },
      /**
       * Change the image in the image box view
       */
      changeImage: function(i) {

        // check our index first
        i = methods.checkIndex.call(this, i);

        var imageRef = imageBoxImages[i];
        // reset our current Index
        currentIndex = i;

        // now check if we are using a gallery - not relevant if below our breakpoint
        if (usesGallery && $(window).width() > breakPoint) {
          // check now if the image is part of the gallery
          while (!imageRef.galleryImage) {
            currentIndex++;
            // now check our index is valid
            currentIndex = methods.checkIndex.call(this, currentIndex);
            imageRef = imageBoxImages[currentIndex];
          }
        }

        // checnge the source of the image
        $imageHolder.attr('src', imageRef.imageSrc);
        // resize the view to fit
        methods.resize.call(this, currentIndex);

      },
      /**
       * Checks that our index is within the bounds of the image array
       *
       * @param {int} i Current index
       * @returns {int} i Valid index
       */
      checkIndex: function(i) {
        // check if the index is valid
        if (i < 0) {
          i = $images.length - 1;
        }
        else if (i >= $images.length) {
          i = 0;
        }
        // reurn index
        return i;
      },
      /**
       * Calculates the dimensions and position of the image based on viewport
       */
      calculateDimensions: function(i) {

        var imageRef = imageBoxImages[i],
                scale = 0;

        // get our viewport & image dimensions
        viewPortDims.width = $(window).width();
        viewPortDims.height = $(window).height();
        imageRef.imgPos.x = (viewPortDims.width - imageRef.imgOrigDims.width) / 2;
        imageRef.imgPos.y = (viewPortDims.height - imageRef.imgOrigDims.height) / 2;
        imageRef.imgDims.width = imageRef.imgOrigDims.width;
        imageRef.imgDims.height = imageRef.imgOrigDims.height;

        // check if the image is too tall for the page
        if (imageRef.imgPos.y < imageMargin) {
          // scale image dimensions
          scale = (viewPortDims.height - (imageMargin * 2)) / imageRef.imgOrigDims.height;
          imageRef.imgDims.width = scale * imageRef.imgOrigDims.width;
          imageRef.imgDims.height = scale * imageRef.imgOrigDims.height;
          // get new  positions
          imageRef.imgPos.y = imageMargin;
          imageRef.imgPos.x = (viewPortDims.width - imageRef.imgDims.width) / 2;
          // now check that the image is not STILL wider than the page
          if (imageRef.imgPos.x < imageMargin) {
            // scale image dimensions - the difference here is we scale the the imgDIms not imgOrigDims
            scale = (viewPortDims.width - (imageMargin * 2)) / imageRef.imgDims.width;
            imageRef.imgDims.width = scale * imageRef.imgDims.width;
            imageRef.imgDims.height = scale * imageRef.imgDims.height;
            // get new  positions
            imageRef.imgPos.x = imageMargin;
            imageRef.imgPos.y = (viewPortDims.height - imageRef.imgDims.height) / 2;
          }

        }

        // now check if the image is too wide for the page
        if (imageRef.imgPos.x < imageMargin) {
          // scale image dimensions
          scale = (viewPortDims.width - (imageMargin * 2)) / imageRef.imgOrigDims.width;
          imageRef.imgDims.width = scale * imageRef.imgOrigDims.width;
          imageRef.imgDims.height = scale * imageRef.imgOrigDims.height;
          // get new  positions
          imageRef.imgPos.x = imageMargin;
          imageRef.imgPos.y = (viewPortDims.height - imageRef.imgDims.height) / 2;
          // now check that the image is not STILL taller than the page
          if (imageRef.imgPos.y < imageMargin) {
            // scale image dimensions - the difference here is we scale the the imgDIms not imgOrigDims
            scale = (viewPortDims.height - (imageMargin * 2)) / imageRef.imgDims.height;
            imageRef.imgDims.width = scale * imageRef.imgDims.width;
            imageRef.imgDims.height = scale * imageRef.imgDims.height;
            // get new  positions
            imageRef.imgPos.y = imageMargin;
            imageRef.imgPos.x = (viewPortDims.width - imageRef.imgDims.width) / 2;
          }


        }
      },
      /**
       * Apllies dimension and position styles to imagebox
       */
      applyDimensions: function(i) {
        var imageRef = imageBoxImages[i],
                scroll = methods.getPageScroll.call(this);

        $imageWrap.css({
          top: Math.round(imageRef.imgPos.y) + scroll[1],
          left: Math.round(imageRef.imgPos.x),
          width: Math.round(imageRef.imgDims.width),
          height: Math.round(imageRef.imgDims.height)
        });

      },
      /**
       * Removes the image box
       */
      clearImageBox: function() {
        $body.find('.imageboxview').fadeOut(200, function() {
          $(this).remove();
          currentlyViewing = false;
        });
      },
      /**
       * Scales the image and position as the browser resizes
       */
      resize: function(i) {
        methods.calculateDimensions.call(this, i);
        methods.applyDimensions.call(this, i);
      },
      /*
       * getPageScroll() by quirksmode.com
       */
      getPageScroll: function() {
        var xScroll, yScroll;
        if (self.pageYOffset) {
          yScroll = self.pageYOffset;
          xScroll = self.pageXOffset;
        }
        else if (document.documentElement && document.documentElement.scrollTop) {
          yScroll = document.documentElement.scrollTop;
          xScroll = document.documentElement.scrollLeft;
        }
        else if (document.body) {
          // all other Explorers
          yScroll = document.body.scrollTop;
          xScroll = document.body.scrollLeft;
        }
        return new Array(xScroll, yScroll);
      },
      /**
       * removes all plugin changes
       */
      destroy: function() {
        $body.find('.imageboxview').remove();
        $body.find('.imagebox').removeClass('imagebox');
      }
    };


    // check for plugin options. Default to init or apply method.
    if (methods[options]) {
      return methods[ options ].call(this, Array.prototype.slice.call(arguments, 1));
    }
    else if (typeof options === 'object' || !options) {
      // Default to init()
      return methods.init.apply(this, arguments);
    }
    else {
      $.error('Method ' + options + ' does not exist in this plugin');
    }
  };
})(jQuery);
