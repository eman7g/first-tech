/*!
    jQuery.kinetic v1.8.2
    Dave Taylor http://the-taylors.org/jquery.kinetic

    The MIT License (MIT)
    Copyright (c) <2011> <Dave Taylor http://the-taylors.org>
*/
/*global define,require */
(function($){
    'use strict';

    var DEFAULT_SETTINGS = {
            cursor: 'move',
            decelerate: true,
            triggerHardware: false,
            y: true,
            x: true,
            axisTolerance: 7,
            slowdown: 0.9,
            maxvelocity: 40,
            throttleFPS: 60,
            movingClass: {
                up: 'kinetic-moving-up',
                down: 'kinetic-moving-down',
                left: 'kinetic-moving-left',
                right: 'kinetic-moving-right'
            },
            deceleratingClass: {
                up: 'kinetic-decelerating-up',
                down: 'kinetic-decelerating-down',
                left: 'kinetic-decelerating-left',
                right: 'kinetic-decelerating-right'
            }
        },
        SETTINGS_KEY = 'kinetic-settings',
        ACTIVE_CLASS = 'kinetic-active';
    /**
     * Provides requestAnimationFrame in a cross browser way.
     * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
     */
    if ( !window.requestAnimationFrame ) {

        window.requestAnimationFrame = ( function() {

            return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
                window.setTimeout( callback, 1000 / 60 );
            };

        }());

    }

    // add touch checker to jQuery.support
    $.support = $.support || {};
    $.extend($.support, {
        touch: "ontouchend" in document
    });
    var selectStart = function() { return false; };

    var decelerateVelocity = function(velocity, slowdown) {
        return Math.floor(Math.abs(velocity)) === 0 ? 0 // is velocity less than 1?
               : velocity * slowdown; // reduce slowdown
    };

    var capVelocity = function(velocity, max) {
        var newVelocity = velocity;
        if (velocity > 0) {
            if (velocity > max) {
                newVelocity = max;
            }
        } else {
            if (velocity < (0 - max)) {
                newVelocity = (0 - max);
            }
        }
        return newVelocity;
    };

    var setMoveClasses = function(settings, classes) {
        this.removeClass(settings.movingClass.up)
            .removeClass(settings.movingClass.down)
            .removeClass(settings.movingClass.left)
            .removeClass(settings.movingClass.right)
            .removeClass(settings.deceleratingClass.up)
            .removeClass(settings.deceleratingClass.down)
            .removeClass(settings.deceleratingClass.left)
            .removeClass(settings.deceleratingClass.right);

        if (settings.velocity > 0) {
            this.addClass(classes.right);
        }
        if (settings.velocity < 0) {
            this.addClass(classes.left);
        }
        if (settings.velocityY > 0) {
            this.addClass(classes.down);
        }
        if (settings.velocityY < 0) {
            this.addClass(classes.up);
        }

    };

    var stop = function($scroller, settings) {
        settings.velocity = 0;
        settings.velocityY = 0;
        settings.decelerate = true;
        if (typeof settings.stopped === 'function') {
            settings.stopped.call($scroller, settings);
        }
    };

    /** do the actual kinetic movement */
    var move = function($scroller, settings) {
        var scroller = $scroller[0];
        // set scrollLeft
        if (settings.x && scroller.scrollWidth > 0){
            scroller.scrollLeft = settings.scrollLeft = scroller.scrollLeft + settings.velocity;
            if (Math.abs(settings.velocity) > 0) {
                settings.velocity = settings.decelerate ?
                    decelerateVelocity(settings.velocity, settings.slowdown) : settings.velocity;
            }
        } else {
            settings.velocity = 0;
        }

        // set scrollTop
        if (settings.y && scroller.scrollHeight > 0){
            scroller.scrollTop = settings.scrollTop = scroller.scrollTop + settings.velocityY;
            if (Math.abs(settings.velocityY) > 0) {
                settings.velocityY = settings.decelerate ?
                    decelerateVelocity(settings.velocityY, settings.slowdown) : settings.velocityY;
            }
        } else {
            settings.velocityY = 0;
        }

        setMoveClasses.call($scroller, settings, settings.deceleratingClass);

        if (typeof settings.moved === 'function') {
            settings.moved.call($scroller, settings);
        }

        if (Math.abs(settings.velocity) > 0 || Math.abs(settings.velocityY) > 0) {
            // tick for next movement
            window.requestAnimationFrame(function(){ move($scroller, settings); });
        } else {
            stop($scroller, settings);
        }
    };

    var callOption = function(method, options) {
        var methodFn = $.kinetic.callMethods[method],
            args = Array.prototype.slice.call(arguments)
        ;
        if (methodFn) {
            this.each(function(){
                var opts = args.slice(1), settings = $(this).data(SETTINGS_KEY);
                opts.unshift(settings);
                methodFn.apply(this, opts);
            });
        }
    };

    var attachListeners = function($this, settings) {
        var element = $this[0];
        if ($.support.touch) {
            $this.bind('touchstart', settings.events.touchStart)
                .bind('touchend', settings.events.inputEnd)
                .bind('touchmove', settings.events.touchMove)
            ;
        } else {
            $this
                .mousedown(settings.events.inputDown)
                .mouseup(settings.events.inputEnd)
                .mousemove(settings.events.inputMove)
            ;
        }
        $this
            .click(settings.events.inputClick)
            .scroll(settings.events.scroll)
            .bind("selectstart", selectStart) // prevent selection when dragging
            .bind('dragstart', settings.events.dragStart);
    };
    var detachListeners = function($this, settings) {
        var element = $this[0];
        if ($.support.touch) {
            $this.unbind('touchstart', settings.events.touchStart)
                .unbind('touchend', settings.events.inputEnd)
                .unbind('touchmove', settings.events.touchMove);
        } else {
            $this
            .unbind('mousedown', settings.events.inputDown)
            .unbind('mouseup', settings.events.inputEnd)
            .unbind('mousemove', settings.events.inputMove)
            .unbind('scroll', settings.events.scroll);
        }
        $this.unbind('click', settings.events.inputClick)
        .unbind("selectstart", selectStart); // prevent selection when dragging
        $this.unbind('dragstart', settings.events.dragStart);
    };

    /**
     * Initialises all the elements bound to the jQuery
     * object
     * @param  {Object} options
     * @return {jQueryInstance}
     */
    var initElements = function(options) {
        this.each(function(){

            var self = this,
                $this = $(this);

            if ($this.data(SETTINGS_KEY)){
                return;
            }

            $this.addClass(ACTIVE_CLASS);

            var settings = $.extend({}, DEFAULT_SETTINGS, options),
                xpos,
                prevXPos = false,
                ypos,
                prevYPos = false,
                mouseDown = false,
                scrollLeft,
                scrollTop,
                throttleTimeout = 1000 / settings.throttleFPS,
                lastMove,
                gesture,
                elementFocused
            ;

            settings.velocity = 0;
            settings.velocityY = 0;

            // make sure we reset everything when mouse up
            var resetMouse = function() {
                xpos = false;
                ypos = false;
                mouseDown = false;
                gesture = false;
                elementFocused = null;
            };
            $(document).mouseup(resetMouse).click(resetMouse);

            var calculateVelocities = function() {
                settings.velocity    = capVelocity(prevXPos - xpos, settings.maxvelocity);
                settings.velocityY   = capVelocity(prevYPos - ypos, settings.maxvelocity);
            };
            var useTarget = function(target) {
                if ($.isFunction(settings.filterTarget)) {
                    return settings.filterTarget.call(self, target) !== false;
                }
                return true;
            };
            var start = function(clientX, clientY) {
                mouseDown = true;
                settings.velocity = prevXPos = 0;
                settings.velocityY = prevYPos = 0;
                xpos = clientX;
                ypos = clientY;
            };
            var end = function() {
                if (!gesture && xpos && prevXPos && settings.decelerate === false) {
                    settings.decelerate = true;
                    calculateVelocities();
                    xpos = prevXPos = mouseDown = false;
                    move($this, settings);
                }
            };
            var inputmove = function(clientX, clientY) {
                if (gesture){
                    return false;
                } else {
                    if (!lastMove || new Date() > new Date(lastMove.getTime() + throttleTimeout)) {
                        lastMove = new Date();

                        if (mouseDown && (xpos || ypos)) {
                            if (elementFocused) {
                                $(elementFocused).blur();
                                elementFocused = null;
                                $this.focus();
                            }
                            settings.decelerate = false;
                            settings.velocity   = settings.velocityY  = 0;
                            $this[0].scrollLeft = settings.scrollLeft = settings.x ? $this[0].scrollLeft - (clientX - xpos) : $this[0].scrollLeft;
                            $this[0].scrollTop  = settings.scrollTop  = settings.y ? $this[0].scrollTop - (clientY - ypos)  : $this[0].scrollTop;
                            prevXPos = xpos;
                            prevYPos = ypos;
                            xpos = clientX;
                            ypos = clientY;

                            calculateVelocities();
                            setMoveClasses.call($this, settings, settings.movingClass);

                            if (typeof settings.moved === 'function') {
                                settings.moved.call($this, settings);
                            }
                        }
                    }

                    // if turned off y and x velocity < 5
                    if (!settings.y && Math.abs(settings.velocityY) > settings.axisTolerance && Math.abs(settings.velocity) < settings.axisTolerance){
                        gesture = true;
                        return false;

                    // if turned off x and y velocity < 5
                    } else if (!settings.x && Math.abs(settings.velocity) > settings.axisTolerance && Math.abs(settings.velocityY) < settings.axisTolerance){
                        gesture = true;
                        return false;

                    } else {
                        return true;
                    }
                }
            };

            /**
             * Various events which get attached to the element
             */
            settings.events = {
                touchStart: function(e){
                    var touch;
                    if (useTarget(e.target)) {
                        touch = e.originalEvent.touches[0];
                        start(touch.clientX, touch.clientY);
                        e.stopPropagation();
                    }
                },
                touchMove: function(e){
                    var touch;
                    if (mouseDown) {
                        touch = e.originalEvent.touches[0];
                        if (inputmove(touch.clientX, touch.clientY)) {
                            if (e.preventDefault) { e.preventDefault(); }
                        }
                    }
                },
                inputDown: function(e){
                    if (useTarget(e.target)) {
                        start(e.clientX, e.clientY);
                        elementFocused = e.target;
                        if (e.target.nodeName === 'IMG'){
                            e.preventDefault();
                        }
                        e.stopPropagation();
                    }
                },
                inputEnd: function(e){
                    end();
                    resetMouse();
                    if (e.preventDefault) {e.preventDefault();}
                },
                inputMove: function(e) {
                    if (mouseDown){
                        if (inputmove(e.clientX, e.clientY)) {
                            if (e.preventDefault) { e.preventDefault(); }
                        }
                    }
                },
                scroll: function(e) {
                    if (typeof settings.moved === 'function') {
                        settings.moved.call($this, settings);
                    }
                    if (e.preventDefault) {e.preventDefault();}
                },
                inputClick: function(e){
                    if (Math.abs(settings.velocity) > 0) {
                        e.preventDefault();
                        return false;
                    }
                },
                // prevent drag and drop images in ie
                dragStart: function(e) {
                    if (elementFocused) {
                        return false;
                    }
                }
            };

            attachListeners($this, settings);
            $this.data(SETTINGS_KEY, settings)
                .css("cursor", settings.cursor);

            if (settings.triggerHardware) {
                $this.css({
                    '-webkit-transform': 'translate3d(0,0,0)',
                    '-webkit-perspective': '1000',
                    '-webkit-backface-visibility': 'hidden'
                });
            }
        });
    };

    $.kinetic = {
        settingsKey: SETTINGS_KEY,
        callMethods: {
            start: function(settings, options){
                var $this = $(this);
                settings = $.extend(settings, options);
                if (settings) {
                    settings.decelerate = false;
                    move($this, settings);
                }
            },
            end: function(settings, options){
                var $this = $(this);
                if (settings) {
                    settings.decelerate = true;
                }
            },
            stop: function(settings, options){
                var $this = $(this);
                stop($this, settings);
            },
            detach: function(settings, options) {
                var $this = $(this);
                detachListeners($this, settings);
                $this
                .removeClass(ACTIVE_CLASS)
                .css("cursor", "");
            },
            attach: function(settings, options) {
                var $this = $(this);
                attachListeners($this, settings);
                $this
                .addClass(ACTIVE_CLASS)
                .css("cursor", "move");
            }
        }
    };
    $.fn.kinetic = function(options) {
        if (typeof options === 'string') {
            callOption.apply(this, arguments);
        } else {
            initElements.call(this, options);
        }
        return this;
    };

}(window.jQuery || window.Zepto));
