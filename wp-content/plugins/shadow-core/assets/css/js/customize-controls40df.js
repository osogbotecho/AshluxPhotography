"use strict";
jQuery(document).on('click', '.cc-switcher-wrapper input[type="checkbox"]', function() {
	let $this = jQuery(this),
		$wrap = $this.parent(),
		$switcher = $wrap.find('.cc-switcher');
	
	if ($this.is(":checked")) {
		$switcher.addClass('toggled_on');
	} else {
		$switcher.removeClass('toggled_on');
	}
});

jQuery(document).on( 'click', '.cc-choose-item', function() {
	var $this = jQuery(this),
		$parent = $this.parent(),
		$input = $parent.find('input');
	$parent.find('.active').removeClass('active');
	$this.addClass('active');
	$input.val($this.attr('data-value')).trigger('change');
	
});

jQuery(document).ready(function(){
    // Reset Tabs Choose Items
    jQuery('.cc-choose-wrapper-tab').each( function() {
        jQuery(this).find('.cc-choose-item').eq(0).trigger('click');
    });
    
    // Add Custom Class to Option LI
    jQuery("[data-class]").each(function(){
        var $this = jQuery(this);
        $this.parents('li').addClass($this.attr('data-class'));
    });
    
	// Setting Up Controls
	jQuery('.cc-choose-wrapper-image').each( function() {
		var $this = jQuery(this);
		$this.css({
			'margin' : '-' + parseInt( $this.attr('data-margin') , 10 ) + 'px',
			'width' : 'calc(100% + ' + parseInt( $this.attr('data-margin'), 10 ) * 2 + 'px)',
		});
		$this.find('.cc-choose-item').css('padding', $this.attr('data-margin') + 'px');
	});
    
    jQuery('.cc-choose-color').each( function() {
        jQuery(this).find('span').css('background', jQuery(this).attr('data-value'));
        jQuery(this).css('border-color', jQuery(this).attr('data-value'));
    });
	
	jQuery('.cc_control_divider').each( function() {
		var $this = jQuery(this);
		if ($this.attr('data-top')) {
			$this.css('margin-top', parseInt( $this.attr('data-top'), 10 ) + 'px');
		}
		if ($this.attr('data-bottom')) {
			$this.css('margin-bottom', parseInt( $this.attr('data-bottom'), 10 ) + 'px');
		}
	});
	
	jQuery('.cc_control_title').each( function() {
		var $this = jQuery(this);
		if ($this.attr('data-bottom')) {
			$this.css('margin-bottom', parseInt( $this.attr('data-bottom'), 10 ) + 'px');
		}
		if ($this.attr('data-font-size')) {
			$this.css('font-size', parseInt( $this.attr('data-font-size'), 10 ) + 'px');
		}
		if ($this.attr('data-line-height')) {
			$this.css('line-height', parseInt( $this.attr('data-line-height'), 10 ) + 'px');
		}
		if ($this.attr('data-color')) {
			$this.css('color', $this.attr('data-color'));
		}
		if ($this.attr('data-font-family')) {
			$this.css('font-family', $this.attr('data-font-family'));
		}
	});
    
    // Tab Toggler 
    jQuery('.cc-toggle-tab-start').each(function() {
        var $this = jQuery(this);
        $this.parents('li').addClass('shadow_toggle_tab_start');
    });
    
    jQuery('.cc-toggle-tab-end').each(function() {
        var $this = jQuery(this);
        $this.parents('li').addClass('shadow_toggle_tab_end');        
    });
    
    jQuery('.shadow_toggle_tab_start').each(function(){
        var $this = jQuery(this),
            $this_content = jQuery($this.nextUntil('.shadow_toggle_tab_end'));
        
        $this_content.addClass('cc-toggle-tab-off cc-toggle-tab-content');
        $this_content.first().addClass('cc-tt-first');
        $this_content.last().addClass('cc-tt-last');
        
    });
    
    jQuery('.cc-toggle-tab-start').on( 'click', function() {
        var $this = jQuery(this),
            $this_li = $this.parents('li');
        
        $this_li.toggleClass('active');
        $this_li.nextUntil('.shadow_toggle_tab_end').toggleClass('cc-toggle-tab-off');
    });
    
    // Dimensions Control
    jQuery('.cc-dimension-lock').on( 'click', function() {
        var $this = jQuery(this),
            $wrapper = $this.parents('.cc-dimension-wrapper'),
            $first = $wrapper.find('.cc-dimension-input:enabled:visible:first'),
            $input = $wrapper.find('.cc-dimension-value');
        
        $wrapper.toggleClass('cc-dimension-locked');
        
        if ( $wrapper.hasClass('cc-dimension-locked') ) {
            $wrapper.find('.cc-dimension-input').not($first[0]).val( $first.val() );
            $input.val( $first.val() + '/' + $first.val() + '/' + $first.val() + '/' + $first.val() ).trigger('change');
        }
    });
    
    jQuery('.cc-dimension-input').on( 'change', function() {
        change_dimension_value( jQuery(this) );
    });
    
    jQuery('.cc-dimension-input').on( 'keyup', function() {
        change_dimension_value( jQuery(this) );
    });
    
    // Slider Control
    jQuery('.customize-control-slider').each(function(){
        var $this = jQuery(this),
            $slider = $this.find('.cc-number-slider'),
            $input = $this.find('.cc-number-value'),
            this_min = $input.attr('min'),
            this_max = $input.attr('max'),
            this_step = $input.attr('step');
        
        if ( $slider.attr('data-step') ) {
            this_step = parseFloat( $slider.attr('data-step') );
        }
        
        $slider.slider({
            value: parseFloat( $input.val() ),
            min: parseFloat( this_min ),
            max: parseFloat( this_max ),
            step: parseFloat( this_step ),
            range: 'min',
            slide: function( event, ui ) {
                $input.val( ui.value ).trigger('change');
            }
        });
        
        $input.on( 'change', function() {
            $slider.slider('value', $input.val());
        });
    });
    
    jQuery('.cc-number-reset').on( 'click', function() {
        var $this = jQuery(this),
            $wrapper = $this.parents('.customize-control-slider'),
            default_value = $wrapper.attr('data-default'),
            $input = $wrapper.find('.cc-number-value');
        
        $input.val(default_value).trigger('change');
    });
    
	// Check Dependency and Bind Dependency
	jQuery('.customize_condition').each(function(){
		var $this = jQuery(this),
			$this_parent = $this.parents('li.customize-control'),
			this_id_array = $this.attr('data-id').split('|'),
			this_value_array = $this.attr('data-value').split('|'),
			final_result = check_custom_depend( this_id_array, this_value_array);
		
        parent_depend_event( $this_parent, final_result );
		
		this_id_array.forEach( function( item,i ) {		
			var $this_el = jQuery('#_customize-input-'+item);

			if ( !$this_el.length && jQuery('#customize-control-'+item).length ) {
				// Radio Button
				var $radio_parent = jQuery('#customize-control-'+item);
				$radio_parent.find('input[type=radio]').on( 'click', function() {
					var action = check_custom_depend( this_id_array, this_value_array);
                    parent_depend_event( $this_parent, action );
				});
			} else {				 
				if ($this_el.is('div') && $this_el.hasClass('cc-switcher-wrapper')) {
					// Switcher
					$this_el.find('input').on('change', function() {
						var action = check_custom_depend( this_id_array, this_value_array);
                        parent_depend_event( $this_parent, action );
					});					
				}
				if ($this_el.is('div') && $this_el.hasClass('cc-choose-wrapper')) {
					// Choose
					$this_el.find('input').on('change', function() {
						var action = check_custom_depend( this_id_array, this_value_array);
                        parent_depend_event( $this_parent, action );
					});					
				}
				if ($this_el.is('input') && $this_el.attr('type') == 'checkbox') {
					// Checkbox
					$this_el.on('click', function() {
						var action = check_custom_depend( this_id_array, this_value_array);
                        parent_depend_event( $this_parent, action );
					});
				}
				if ($this_el.is('select')) {
					// Select
					$this_el.on('change', function() {
						var action = check_custom_depend( this_id_array, this_value_array);
                        parent_depend_event( $this_parent, action );
					});
				}				
			}
		});
	});
});

/* Dimension Change Function */
function change_dimension_value( $this ) {
    var $wrapper = $this.parents('.cc-dimension-wrapper'),
        this_val = $this.val(),
        $top = $wrapper.find('.cc-dimension-top'),
        $right = $wrapper.find('.cc-dimension-right'),
        $bottom = $wrapper.find('.cc-dimension-bottom'),
        $left = $wrapper.find('.cc-dimension-left'),
        $input = $wrapper.find('.cc-dimension-value'),
        final_val = '';

    if ( $wrapper.hasClass('cc-dimension-locked') ) {
        $wrapper.find('.cc-dimension-input:enabled').not(this).val( $this.val() );
    }

    $wrapper.find('.cc-dimension-input').each(function() {
        if ( !jQuery(this).attr('disabled') ) {
            final_val = final_val + jQuery(this).val()+'/';
        } else {
            final_val = final_val + 'd/';
        }
    });
    
    final_val = final_val.substring( 0, final_val.length - 1 );

    $input.val( final_val ).trigger('change');
}

/* Show or Hide Dependency Parent */
function parent_depend_event( $this_parent, action) {
    if ( action == 'hide' ) {
        $this_parent.hide();
        if ($this_parent.hasClass('shadow_toggle_tab_start')) {
            $this_parent.nextUntil('.shadow_toggle_tab_end').hide();
        }
    } else {
        $this_parent.show();
        if ($this_parent.hasClass('shadow_toggle_tab_start')) {
            $this_parent.nextUntil('.shadow_toggle_tab_end').show();
        }
    }
}

/* Customizer Dependency Functions */
function check_custom_depend( this_id_array, this_value_array) {
	var result = '';
	for (var i = 0; i < this_id_array.length; i++) {
		var $this_item = jQuery('#_customize-input-'+this_id_array[i]);
		
		if ( !$this_item.length && jQuery('#customize-control-'+this_id_array[i]).length ) {
			// Radio Button
			$this_item = 'radio';
		}
	
		var state = check_custom_depend_state( $this_item, i, this_id_array, this_value_array);
		if (result == '') {
			result = state;
		} else if ( result == 'show' && state == 'hide' ) {
			result = 'hide';
		} else if ( result == 'hide' && state == 'show' ) {
			result = 'hide';
		}		
	}
	return result;
}

function check_custom_depend_state( $this_item, i, this_id_array, this_value_array) {
	var result = '';
	if ($this_item == 'radio') {
		// Radio Button
		var $radio_parent = jQuery('#customize-control-'+this_id_array[i]),
			val = '';
		$radio_parent.find('input[type=radio]').each( function() {
			if (jQuery(this).attr('checked')) {
				val = jQuery(this).val();
			}
		});
		result = check_custom_depend_value( val, this_value_array[i] );
	} else {
		if ($this_item.is('div') && $this_item.hasClass('cc-choose-wrapper')) {
			// Choose
			result = check_custom_depend_value( $this_item.find('input').val(), this_value_array[i] );
		}
		if ($this_item.is('div') && $this_item.hasClass('cc-switcher-wrapper')) {
			// Switcher
			if ($this_item.find('input').is(":checked")) {
				var this_val = 1;
			} else {
				var this_val = 0;
			}
			if (this_val == this_value_array[i]) {
				result = 'show';
			} else {
				result = 'hide';
			}
		}
		if ( $this_item.is('input') && $this_item.attr('type') == 'checkbox' ) {
			// Checkbox
			if ( $this_item.attr('checked')) {
				if ( this_value_array[i] == 'checked' ) {
					result = 'show';
				} else {
					result = 'hide';
				}
			} else {
				if ( this_value_array[i] !== 'checked' ) {
					result = 'show';
				} else {
					result = 'hide';
				}						
			}
		}
		if ( $this_item.is('select') ) {
			// Select
			result = check_custom_depend_value( $this_item.val(), this_value_array[i] );
		}		
	}
	return result;
}

function check_custom_depend_value( val, this_value ) {
	var result = '';
	
	if ( this_value.indexOf(',') > 0 ) {
		this_value = this_value.split(',');
		if ( search_in_array( val, this_value ) > -1 ) {
			result = 'show';
		} else {
			result = 'hide';
		}
	} else {
		if ( val == this_value ) {
			result = 'show';
		} else {
			result = 'hide';
		}			
	}
	return result;
}