/** 
 * Author: Shadow Themes
 * Author URL: http://shadow-themes.com
 */
"use strict";

var shadowcore_el = {
    elements: {
        countdown: Array(),
        tns: Array(),
        pswp_gallery: Array()
    },
    inView: function(this_el) {
        // Check if Element is in View
        var rect = this_el.getBoundingClientRect()
        return (
            ( rect.height > 0 || rect.width > 0) &&
            rect.bottom >= 0 &&
            rect.right >= 0 &&
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth)
        )
    },
    preloadImage: function(this_img) {
        const src = this_img.getAttribute('data-src');
		if (!src) {
			console.log('Can not load image. Image data-src error.');
			return
		}
		this_img.src = src;
		this_img.addEventListener('load', function(e) {
            e.target.classList.remove('shadowcore-lazy');
			if (e.target.classList.contains('shadowcore-masonry-image')) {
				shadow_masonry_layout(jQuery(e.target).parents('.shadowcore-is-masonry'));
            }
			if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
				if (jQuery(this_img).parents('div').hasClass('shadowcore-justified-gallery')) {
					setTimeout(function() {
						jQuery(this_img).parent('a').addClass('is-ready');
					}, 100, this_img);
					setTimeout(function() {
						jQuery(this_img).parents('.shadowcore-justified-gallery').justifiedGallery();
					}, 500, this_img);
				}
			}
		});
    }
}
if ('IntersectionObserver' in window) {
    var shadowcore_lazyObserver = new IntersectionObserver((entries, shadowcore_lazyObserver) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                shadowcore_el.preloadImage(entry.target);
                shadowcore_lazyObserver.unobserve(entry.target);
            } else {
                return;
            }
        });
    });
}

var shadowcore_circle_progress = {
    layout: function(this_el) {
        let $this = jQuery(this_el);
        if ($this.find('svg').length) {
            let this_size = this.getSize(this_el),
                $svg = $this.find('svg'),
                $barBg = $this.find('.shadowcore-progress-circle--bg'),
                $bar = $this.find('.shadowcore-progress-circle--bar');
            $svg.attr('width', this_size.svgSize)
                .attr('height', this_size.svgSize)
                .attr('viewPort', '0 0 '+ this_size.barSize +' '+ this_size.barSize);
            $barBg.css({
                'r' : this_size.r,
                'cx' : this_size.barSize,
                'cy' : this_size.barSize,
                'stroke-dasharray': this_size.dashArray,
            });
            $bar.css({
                'r' : this_size.r,
                'cx' : this_size.barSize,
                'cy' : this_size.barSize,
                'stroke-dasharray': this_size.dashArray,
            }).attr('transform', 'rotate(-90, '+ this_size.barSize +', '+ this_size.barSize +')');
            if (!$this.hasClass('is-done')) {
                $bar.css('stroke-dashoffset', this_size.dashArray);
            } else {
                //
            }
        }
    },
    getSize: function(this_el) {
		let $this = jQuery(this_el),
			$wrap = $this.find('.shadowcore-progress-item-wrap'),
			sizes = {
				percent: parseInt($this.data('percent'), 10),
				svgSize: $wrap.width(),
				stroke: parseInt($wrap.css('stroke-width'), 10),
			}
			sizes.barSize = Math.floor(sizes.svgSize/2);
			sizes.r = sizes.barSize - sizes.stroke;
			sizes.dashArray = parseFloat(Math.PI*(sizes.r*2)).toFixed(2);
			sizes.dashOffset = parseFloat(sizes.dashArray - (sizes.dashArray*sizes.percent)/100).toFixed(2);
		return sizes;
	},
	animate: function(this_el) {
		let $this = jQuery(this_el),
			$this_counter = $this.find('span.shadowcore-progress-counter'),
			this_size = this.getSize(this_el),
            $bar = $this.find('.shadowcore-progress-circle--bar');
        $this.addClass('is-done');
		$bar.css('stroke-dashoffset', this_size.dashOffset);
		$this_counter.prop('Counter', 0).animate({
			Counter: $this_counter.text()
		}, {
			duration: parseInt($this_counter.parents('.shadowcore-progress-item').data('delay'), 10),
			easing: 'swing',
			step: function (now) {
				$this_counter.text(Math.ceil(now)+'%');
			}
		});

	}
}

function shadow_masonry_layout(this_id) {
    let $this = jQuery('[data-id="' + this_id + '"]').find('.shadowcore-is-masonry');
    if ($this.hasClass('shadowcore-masonry-active')) {
        $this.masonry('layout');
    } else {
        $this.addClass('shadowcore-masonry-active');
        $this.masonry();
    }
}

class ShadowCore_Before_After {
	constructor($obj) {
		if ($obj instanceof jQuery) {
			let this_class = this;
			this.$el = {
				$wrap: $obj,
				$before : jQuery('<div class="shadowcore-before-after-img shadowcore-before-img"/>').appendTo($obj),
				$after : jQuery('<div class="shadowcore-before-after-img shadowcore-after-img"/>').appendTo($obj),
                $divider : jQuery('<div class="shadowcore-before-after-divider">\
                    <svg xmlns="http://www.w3.org/2000/svg" width="23.813" height="13.875" viewBox="0 0 23.813 13.875">\
                        <path d="M-5.062-15.937l1.125,1.125L-9.047-9.75H9.047L3.938-14.812l1.125-1.125,6.375,6.375L11.906-9l-.469.563L5.063-2.062,3.938-3.187,9.047-8.25H-9.047l5.109,5.063L-5.062-2.062l-6.375-6.375L-11.906-9l.469-.562Z" transform="translate(11.906 15.938)" fill="#fff"/>\
                    </svg>\
                </div>').appendTo($obj),
			};
			this.offset = this.$el.$wrap.offset().left;
			this.size = this.$el.$wrap.width();
			this.current = 50;
			this.target = 50;
			this.isDown = false;
			
			this.$el.$before.css('background-image', 'url('+ this.$el.$wrap.data('img-before') +')');
			this.$el.$after.css('background-image', 'url('+ this.$el.$wrap.data('img-after') +')');
			
			// Mouse Events
			this.$el.$wrap.on('mousedown', function(e) {
				e.preventDefault();
				this_class.isDown = true;
			}).on('mousemove', function(e) {
				e.preventDefault();
				if (this_class.isDown) {
					let position = e.pageX - this_class.offset,
						newTarget = position/this_class.size;
					if (newTarget > 1)
						newTarget = 1;
					if (newTarget < 0)
						newTarget = 0;
					this_class.target = newTarget * 100;
				}
			}).on('mouseleave', function(e) {
				e.preventDefault();
				this_class.isDown = false;
			}).on('mouseup', function(e) {
				e.preventDefault();
				this_class.isDown = false;
			});
			
			// Touch Events
			this.$el.$wrap[0].addEventListener('touchstart', function(e) {
				this_class.isDown = true;
			}, false);
			this.$el.$wrap[0].addEventListener('touchmove', function(e) {
				if (this_class.isDown) {
					let position = e.touches[0].clientX - this_class.offset,
						newTarget = position/this_class.size;
					if (newTarget > 1)
						newTarget = 1;
					if (newTarget < 0)
						newTarget = 0;
					this_class.target = newTarget * 100;
				}				
			}, false);
			this.$el.$wrap[0].addEventListener('touchend', function(e) {
				this_class.isDown = false;
			}, false);
			
			// Window Events
			jQuery(window).on('resize', function() {
				this_class.layout();
				this_class.reset();
			}).on('load', function() {
				this_class.layout();
			});

			// Layout
			this.layout();

			// Run Animation
			this.requestAnimation();
		} else {
			return false;
		}
	}
	
	layout() {
		this.offset = this.$el.$wrap.offset().left;
		this.size = this.$el.$wrap.width();
	}
	reset() {
		this.current = 50;
		this.target = 50;
	}
	requestAnimation() {
		this.animation = requestAnimationFrame(() => this.animate());
	}
	animate() {
		this.current += ((this.target - this.current) * 0.1);
		this.$el.$after.css('width', parseFloat(this.current).toFixed(1) +'%');
		this.$el.$divider.css('left', parseFloat(this.current).toFixed(1) +'%');
		this.requestAnimation();
	}
}

class ShadowCore_Countdown {
    constructor($this_el) {
        if ($this_el instanceof jQuery) {
            let this_class = this;
            this_class.time = new Date( $this_el.find('time').text() + 'T00:00:00'),
            $this_el.find('time').remove();
            this_class.$el = {
                wrap: $this_el,
                d: $this_el.find('.shadowcore-coming-soon--days > .shadowcore-coming-soon__count'),
                h: $this_el.find('.shadowcore-coming-soon--hours > .shadowcore-coming-soon__count'),
                m: $this_el.find('.shadowcore-coming-soon--minutes > .shadowcore-coming-soon__count'),
                s: $this_el.find('.shadowcore-coming-soon--seconds > .shadowcore-coming-soon__count'),
            }
            this_class.update( this_class.time );

            if ( this_class.interval ) {
                clearInterval( this_class.interval );
            }
    
            this_class.interval = setInterval( function() {
                this_class.update( this_class.time );
            }, 1000);
        }
    }

    update( endDate ) {
        let this_class = this;
        let now = new Date();
		let difference = endDate.getTime() - now.getTime();

		if (difference <= 0) {
			clearInterval( this_class.interval );
		} else {
			let seconds = Math.floor(difference / 1000);
			let minutes = Math.floor(seconds / 60);
			let hours = Math.floor(minutes / 60);
			let days = Math.floor(hours / 24);

			hours %= 24;
			minutes %= 60;
			seconds %= 60;

			if (days < 10) {
				days = ("0" + days).slice(-2);
			}

			this_class.$el.d.text(days);
			this_class.$el.h.text(("0" + hours).slice(-2));
			this_class.$el.m.text(("0" + minutes).slice(-2));
			this_class.$el.s.text(("0" + seconds).slice(-2));
		}
    }
}

/* Elementor Shadow Core */
/* --------------------- */
jQuery(window).on('elementor/frontend/init', function () {
    /* Editor */
    if (elementorFrontend.isEditMode()) {
        /* Gallery Masonry */
        elementor.hooks.addAction( 'panel/open_editor/widget/shadow-gallery-masonry', function( panel, model, view ) {
            let this_id = view.$el.data('id');
            panel.$el.on('mouseup', '.elementor-control-item_spacing', function() {
                shadow_masonry_layout(this_id);
            }).on('mouseleave', '.elementor-control-item_spacing', function() {
                shadow_masonry_layout(this_id);
            }).on('mousemove', '.elementor-control-item_spacing', function() {
                if (jQuery(this).find('.noUi-handle').hasClass('noUi-active')) {
                    shadow_masonry_layout(this_id);
                }
            });
            panel.$el.on('change', '.elementor-control-item_spacing input', function() {
                shadow_masonry_layout(this_id);
            });

            panel.$el.on('mouseup', '.elementor-control-caption_spacing--under', function() {
                shadow_masonry_layout(this_id);
            }).on('mouseleave', '.elementor-control-caption_spacing--under', function() {
                shadow_masonry_layout(this_id);
            }).on('mousemove', '.elementor-control-caption_spacing--under', function() {
                if (jQuery(this).find('.noUi-handle').hasClass('noUi-active')) {
                    shadow_masonry_layout(this_id);
                }
            });
            panel.$el.on('change', '.elementor-control-caption_spacing--under input', function() {
                shadow_masonry_layout(this_id);
            });

            panel.$el.on('change', '.elementor-control-grid_columns select', function() {
                shadow_masonry_layout(this_id);
            });
            panel.$el.on('change', '.elementor-control-captions select', function() {
                shadow_masonry_layout(this_id);
            });
        });

        /* Testimonials Grid */
        elementor.hooks.addAction( 'panel/open_editor/widget/shadow-testimonials-grid', function( panel, model, view ) {
            let this_id = view.$el.data('id');
            panel.$el.on('mouseup', '.elementor-control-item_spacing', function() {
                shadow_masonry_layout(this_id);
            }).on('mouseleave', '.elementor-control-item_spacing', function() {
                shadow_masonry_layout(this_id);
            }).on('mousemove', '.elementor-control-item_spacing', function() {
                shadow_masonry_layout(this_id);
            });
            
            panel.$el.on('mouseup', '.elementor-control-image_size', function() {
                shadow_masonry_layout(this_id);
            }).on('mouseleave', '.elementor-control-image_size', function() {
                shadow_masonry_layout(this_id);
            }).on('mousemove', '.elementor-control-image_size', function() {
                if (jQuery(this).find('.noUi-handle').hasClass('noUi-active')) {
                    shadow_masonry_layout(this_id);
                }
            });
            panel.$el.on('change', '.elementor-control-image_size input', function() {
                shadow_masonry_layout(this_id);
            });

            panel.$el.on('mouseup', '.elementor-control-oc_spacing', function() {
                shadow_masonry_layout(this_id);
            }).on('mouseleave', '.elementor-control-oc_spacing', function() {
                shadow_masonry_layout(this_id);
            }).on('mousemove', '.elementor-control-oc_spacing', function() {
                if (jQuery(this).find('.noUi-handle').hasClass('noUi-active')) {
                    shadow_masonry_layout(this_id);
                }
            });
            panel.$el.on('change', '.elementor-control-oc_spacing', function() {
                shadow_masonry_layout(this_id);
            });
            
            panel.$el.on('mouseup', '.elementor-control-rating_spacing', function() {
                shadow_masonry_layout(this_id);
            }).on('mouseleave', '.elementor-control-rating_spacing', function() {
                shadow_masonry_layout(this_id);
            }).on('mousemove', '.elementor-control-rating_spacing', function() {
                if (jQuery(this).find('.noUi-handle').hasClass('noUi-active')) {
                    shadow_masonry_layout(this_id);
                }
            });
            panel.$el.on('change', '.elementor-control-rating_spacing', function() {
                shadow_masonry_layout(this_id);
            });
            
            panel.$el.on('click', '.elementor-control-head_layout .elementor-choices', function() {
                shadow_masonry_layout(this_id);
            });
            panel.$el.on('click', '.elementor-control-card_swap .elementor-switch', function() {
                shadow_masonry_layout(this_id);
            });
            panel.$el.on('change', '.elementor-control-heading_spacing input', function() {
                shadow_masonry_layout(this_id);
            });
            panel.$el.on('change', '.elementor-control-content_margin input', function() {
                shadow_masonry_layout(this_id);
            });
            panel.$el.on('change', '.elementor-control-content_padding input', function() {
                shadow_masonry_layout(this_id);
            });
			
            panel.$el.on('change', '.elementor-control-grid_columns select', function() {
                shadow_masonry_layout(this_id);
            });
			panel.$el.on('change', '.elementor-control-grid_columns_tablet select', function() {
                shadow_masonry_layout(this_id);
            });
			panel.$el.on('change', '.elementor-control-grid_columns_mobile select', function() {
                shadow_masonry_layout(this_id);
            });
        });

        /* Circle Progress Bar */
        elementor.hooks.addAction( 'panel/open_editor/widget/shadow-circle-progress', function( panel, model, view ) {
            panel.$el.on('mouseup', '.elementor-control-side_spacing', function() {
                shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
            }).on('mouseleave', '.elementor-control-side_spacing', function() {
                shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
            }).on('mousemove', '.elementor-control-side_spacing', function() {
                if (jQuery(this).find('.noUi-handle').hasClass('noUi-active')) {
                    shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
                }
            });
            panel.$el.on('change', '.elementor-control-side_spacing input', function() {
                shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
            });
			
			panel.$el.on('mouseup', '.elementor-control-side_spacing_tablet', function() {
                shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
            }).on('mouseleave', '.elementor-control-side_spacing_tablet', function() {
                shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
            }).on('mousemove', '.elementor-control-side_spacing_tablet', function() {
                if (jQuery(this).find('.noUi-handle').hasClass('noUi-active')) {
                    shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
                }
            });
            panel.$el.on('change', '.elementor-control-side_spacing_tablet input', function() {
                shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
            });
			
			panel.$el.on('mouseup', '.elementor-control-side_spacing_mobile', function() {
                shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
            }).on('mouseleave', '.elementor-control-side_spacing_mobile', function() {
                shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
            }).on('mousemove', '.elementor-control-side_spacing_mobile', function() {
                if (jQuery(this).find('.noUi-handle').hasClass('noUi-active')) {
                    shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
                }
            });
            panel.$el.on('change', '.elementor-control-side_spacing_mobile input', function() {
                shadowcore_circle_progress.layout(view.$el.find('.shadowcore-progress-item')[0]);
            });
        });
        
        /*  ----------------------------
            Sections and Columns Edition 
            ----------------------------  */
        elementor.hooks.addAction( 'panel/open_editor/section', function( panel, model, view ) {
            // Editing Section
        });
        elementor.hooks.addAction( 'panel/open_editor/column', function( panel, model, view ) {
            // Editing Column
        });
        elementor.hooks.addAction( 'panel/remove/column', function( panel, model, view ) {
            // Remove Column
        });
    }

    /*  ----------------
        Frontend Scripts
        ----------------  */
    elementorFrontend.hooks.addAction('frontend/element_ready/global', function ($scope) {
		// Masonry Init
        if (jQuery('.shadowcore-is-masonry').length) {
            jQuery('.shadowcore-is-masonry').each(function() {
                jQuery(this).addClass('shadowcore-masonry-active');
                jQuery(this).masonry();
            });
        }

        // Justified Init
        if (jQuery('.shadowcore-justified-gallery').length) {
            jQuery('.shadowcore-justified-gallery').each(function() {
				let $this = jQuery(this);
				if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && jQuery('img.shadowcore-lazy').length) {
					var options = {
						rowHeight : parseInt($this.attr('data-row-height'), 10),
						lastRow: 'nojustify',
						margins : parseInt($this.attr('data-spacing'), 10),
						captions: false,
						selector: 'a.is-ready',
						waitThumbnailsLoad: true
					}
				} else {
					var options = {
						rowHeight : parseInt($this.attr('data-row-height'), 10),
						lastRow: 'nojustify',
						margins : parseInt($this.attr('data-spacing'), 10),
						captions: false,
						waitThumbnailsLoad: true
					}
				}
                if ('yes' == $this.attr('data-last-row')) {
                    options.lastRow = 'justify';
                }
                $this.justifiedGallery(options);
            });
        }

        // Images Lazy Loading
        if ($scope.find('img.shadowcore-lazy').length) {
            $scope.find('img.shadowcore-lazy').each(function() {
                if ('IntersectionObserver' in window) {
                    shadowcore_lazyObserver.observe(this);
                } else {
                    shadowcore_el.preloadImage(this);
                }
            });
        }

        // PSWP Preparing
        if ($scope.find('a.shadowcore-lightbox-link:not(.pswp-done)').length) {
            $scope.find('a.shadowcore-lightbox-link:not(.pswp-done)').each(function() {
                let $this = jQuery(this),
                    this_item = {},
                    this_gallery = 'default';

                if ($this.data('size')) {
                    let item_size = $this.attr('data-size').split('x');
                    this_item.w = item_size[0];
                    this_item.h = item_size[1];
                }
                this_item.src = $this.attr('href');
                
                if ( $this.data('caption') ) {
                    this_item.title = $this.data('caption');
                }
                
                if ( $this.data('gallery') ) {
                    this_gallery = $this.data('gallery');
                }
                
                if ( shadowcore_el.elements.pswp_gallery[this_gallery] ) {
                    shadowcore_el.elements.pswp_gallery[this_gallery].push(this_item);
                } else {
                    shadowcore_el.elements.pswp_gallery[this_gallery] = [];
                    shadowcore_el.elements.pswp_gallery[this_gallery].push(this_item);
                }

                $this.attr('data-count', shadowcore_el.elements.pswp_gallery[this_gallery].length - 1).addClass('pswp-done');
            });
        }
    });

    /* Count Down Widget */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-countdown.default', function ($scope) {
        $scope.find('.shadowcore-wait').removeClass('shadowcore-wait');
        let $this_el = $scope.find('.shadowcore-coming-soon'), 
            this_id = $scope.find('.shadowcore-coming-soon').attr('id');
        shadowcore_el.elements.countdown[this_id] = new ShadowCore_Countdown($this_el);
    });

    /* Testimonials Grid */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-testimonials-grid.default', function ($scope) {
        
    });

    /* Before After */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-before-after.default', function ($scope) {
        var $this_el = $scope.find('.shadowcore-before-after');
        new ShadowCore_Before_After($this_el);
    });
    
    /* Testimonials Carousel */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-testimonials-carousel.default', function ($scope) {
		var $this_el = $scope.find('.shadowcore-owl-container');
		$this_el.owlCarousel(
			{
                margin: parseInt($this_el.data('gutter'), 10),
                loop: true,
                center: true,
                nav: false,
                dots: true,
				dotsEach: true,
				autoHeight: true,
				autoplay: false,
                items: 1,
                navSpeed: parseInt($this_el.data('speed'), 10),
				
			}
		);
    });

    /* Circle Progress Bar Widget */
    elementorFrontend.hooks.addAction('frontend/element_ready/shadow-circle-progress.default', function ($scope) {
        $scope.find('.shadowcore-wait').removeClass('shadowcore-wait');
        let $this_el = $scope.find('.shadowcore-progress-item');
        shadowcore_circle_progress.layout($this_el[0]);
        if (elementorFrontend.isEditMode()) {
            shadowcore_circle_progress.animate($this_el[0]);
        } else {
            if (shadowcore_el.inView($this_el[0]))
                shadowcore_circle_progress.animate($this_el[0]);
        }
    });
});

jQuery(window).on('resize', function() {

}).on('load', function() {
    
}).on('scroll', function() {
    if (jQuery('.shadowcore-progress-item:not(.is-done)').length) {
        jQuery('.shadowcore-progress-item:not(.is-done)').each(function() {
            if (shadowcore_el.inView(this))
                shadowcore_circle_progress.animate(this);
        });
    }
});

// PSWP Open Lightbox
jQuery(document).on('click', 'a.shadowcore-lightbox-link', function(e) {
    e.preventDefault();
    
    let $this = jQuery(this),
        this_index = parseInt($this.data('count'), 10),
        this_gallery = 'default',
        this_options = {
            index: this_index,
            bgOpacity: 0.85,
            showHideOpacity: true,
            getThumbBoundsFn: function(index) {
                var thumbnail = $this[0],
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect(); 
                
                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            },
        };
    
    if ( $this.data('gallery') ) {
        this_gallery = $this.data('gallery');
    }
    
    if (jQuery('body').find('.pswp').length) {
        shadowcore_el.elements.pswp = new PhotoSwipe(jQuery('body').find('.pswp')[0], PhotoSwipeUI_Default, shadowcore_el.elements.pswp_gallery[this_gallery], this_options);
        shadowcore_el.elements.pswp.init();
    } else {
        console.log('ERROR: PSWP Container not found');
    }
});

jQuery(window).on('resize', function() {
	if (jQuery('.shadowcore-progress-item').length) {
		jQuery('.shadowcore-progress-item').each(function(){
			shadowcore_circle_progress.layout(this);
		});
	}
});