'use strict';

//
// utility
//

(function () {
  var DESKTOP_WIDTH = 1024;

  // monade
  var Maybe = function (operand) {
    this.operand = operand;
  };

  Maybe.prototype.map = function (operator) {
    if (this.operand && operator) {
      return new Maybe(operator(this.operand));
    } else {
      return new Maybe(null);
    }
  };

  // ESC event
  var isEscEvent = function (evt) {
    return evt.key === ('Escape' || 'Esc');
  };

  // TAB event
  var isTabEvent = function (evt) {
    return evt.key === 'Tab';
  };

  // focusable elements' selectors
  var focusableSelectors = [
    'a[href]:not([tabindex^="-"])',
    'area[href]:not([tabindex^="-"])',
    'input:not([type="hidden"]):not([type="radio"]):not([disabled]):not([tabindex^="-"])',
    'input[type="radio"]:not([disabled]):not([tabindex^="-"]):checked',
    'select:not([disabled]):not([tabindex^="-"])',
    'textarea:not([disabled]):not([tabindex^="-"])',
    'button:not([disabled]):not([tabindex^="-"])',
    'iframe:not([tabindex^="-"])',
    'audio[controls]:not([tabindex^="-"])',
    'video[controls]:not([tabindex^="-"])',
    '[contenteditable]:not([tabindex^="-"])',
    '[tabindex]:not([tabindex^="-"])',
  ];

  // isPreDesktopWidth
  var isPreDesktopWidth = function () {
    return document.documentElement.clientWidth < DESKTOP_WIDTH;
  };

  // export
  window.utility = {
    Maybe: Maybe,
    isEscEvent: isEscEvent,
    isTabEvent: isTabEvent,
    isPreDesktopWidth: isPreDesktopWidth,
    focusableSelectors: focusableSelectors
  };
})();

//
// header
//

(function () {
  var UNITS = 'px';

  var header = null;

  var findHeader = function () {
    var Maybe = window.utility.Maybe;
    header = new Maybe(document.querySelector('.header'));
    header = header.operand
      ? header.operand
      : null;
  };

  findHeader();

  if (header) {
    var manageHeader = function () {
      var that = {};

      that.activate = function () {
        this.header = header;
        this.burger = this.header.querySelector('.header__burger');
        this.lowerContainer = this.header.querySelector('.header__container--lower');
        this.body = document.querySelector('body') || document.body;

        this.header.classList.add('header--js');
        this.attributeSet = {
          'role': 'dialog',
          'aria-modal': true
        };

        this.isShown = false;
        this.toggleMargin();
        this.burger.addEventListener('click', this.onBurgerClick);

        return this;
      };

      that.toggleMargin = function () {
        var nextSibling = this.header.nextElementSibling
          ? this.header.nextElementSibling
          : null;

        var main = document.querySelector('main')
          ? document.querySelector('main')
          : null;

        switch (isPreDesktopWidth()) {
          case true:
            if (nextSibling && main && Object.is(nextSibling, main)) {
              var height = this.header.scrollHeight;
              main.style.marginTop = height + UNITS;
            }

            break;

          case false:
            if (nextSibling && main && Object.is(nextSibling, main)) {
              main.style.marginTop = 0;
            }

            break;

          default:
            return;
        }
      };

      that.setAttributes = function () {
        if (isPreDesktopWidth()) {
          for (var attribute in this.attributeSet) {
            if (this.attributeSet.hasOwnProperty(attribute)) {
              this.header.setAttribute(attribute, this.attributeSet[attribute]);
            }
          }

          this.lowerContainer.setAttribute('tabindex', '-1');
        }

        return this;
      };

      that.resetAttributes = function () {
        if (!isPreDesktopWidth()) {
          for (var attribute in this.attributeSet) {
            if (this.attributeSet.hasOwnProperty(attribute)) {
              this.header.removeAttribute(attribute);
            }
          }

          this.lowerContainer.removeAttribute('tabindex');
        }
      };

      that.show = function () {
        this.isShown = true;
        this.previouslyFocused = document.activeElement;

        this.body.classList.add('scroll-stop');
        this.header.classList.add('menu-open');

        this.moveFocusIn();
        this.setEventListeners();
      };

      that.hide = function () {
        if (this.previouslyFocused && this.previouslyFocused.focus) {
          this.previouslyFocused.focus();
        }

        this.isShown = false;
        this.body.classList.remove('scroll-stop');
        this.header.classList.remove('menu-open');

        this.eraseEventListeners();
      };

      that.moveFocusIn = function () {
        var target = this.header.querySelector('[autofocus]')
          || this.getFocusableChildren()[0];

        if (target) {
          target.focus();
        }
      };

      that.trapTabKey = function (node, evt) {
        var focusableChildren = this.getFocusableChildren(node);
        var focusedItemIndex = focusableChildren.indexOf(document.activeElement);
        var lastIndex = focusableChildren.length - 1;
        var withShift = evt.shiftKey;

        if (withShift && focusedItemIndex === 0) {
          focusableChildren[lastIndex].focus();
          evt.preventDefault();
        } else if (!withShift && focusedItemIndex === lastIndex) {
          focusableChildren[0].focus();
          evt.preventDefault();
        }
      };

      that.isVisible = function (node) {
        return node.offsetWidth
          || node.offsetHeight
          || node.getClientRects().length
          ? true
          : false;
      };

      that.getFocusableChildren = function () {
        return Array.from(
            this.header
                .querySelectorAll(window.utility.focusableSelectors.join(','))
        ).filter(this.isVisible);
      };

      that.onBurgerClick = function () {
        if (!that.isShown) {
          that.show();
        } else {
          that.hide();
        }
      };

      that.onBodyFocus = function (evt) {
        var isInDialog = evt.target.closest('[aria-modal="true"]');

        if (!isInDialog) {
          that.moveFocusIn();
        }
      };

      that.onDocumentKeyDown = function (evt) {
        if (isTabEvent(evt)) {
          that.trapTabKey(that.header, evt);
        }
      };

      that.setEventListeners = function () {
        document.addEventListener('keydown', this.onDocumentKeyDown);
        this.body.addEventListener('focus', this.onBodyFocus, true);
      };

      that.eraseEventListeners = function () {
        document.removeEventListener('keydown', this.onDocumentKeyDown);
        this.body.removeEventListener('focus', this.onBodyFocus, true);
      };

      that.destroy = function () {
        this.burger.removeEventListener('click', this.onBurgerClick);
        this.body.removeEventListener('focus', this.onBodyFocus, true);
        document.removeEventListener('keydown', this.onDocumentKeyDown);
      };

      return that;
    };

    var isPreDesktopWidth = window.utility.isPreDesktopWidth;
    var isTabEvent = window.utility.isTabEvent;

    var headerManager = manageHeader();
    headerManager
        .activate()
        .setAttributes();

    var onWindowResize = (function () {
      var isWorkedOnPreDesktopWidth = false;
      var isWorkedOnDesktopWidth = false;

      return function () {
        if (!isPreDesktopWidth() && !isWorkedOnDesktopWidth) {
          headerManager.resetAttributes();
          headerManager.hide();
          isWorkedOnPreDesktopWidth = false;
          isWorkedOnDesktopWidth = true;
          return;
        }

        if (isPreDesktopWidth() && !isWorkedOnPreDesktopWidth) {
          headerManager.setAttributes();
          isWorkedOnPreDesktopWidth = true;
          isWorkedOnDesktopWidth = false;
        }

        headerManager.toggleMargin();
      };
    })();

    var onWindowBeforeunload = function () {
      headerManager.destroy();
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('beforeunload', onWindowBeforeunload);
    };

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('beforeunload', onWindowBeforeunload);
  }
})();

//
// slider
//

(function () {
  var START_INDEX = 0;
  var DESKTOP_SLIDES_AMOUNT = 4;
  var PREDESKTOP_SLIDES_AMOUNT = 2 ;

  var initSlider = function (rootElement) {
    var that = {};

    that.activate = function () {
      var _ = that;

      _.root = rootElement;
      _.inner = _.root.querySelector('.slider__inner');
      _.sliderList = _.root.querySelector('.slider__list');
      _.slides = Array.from(_.root.querySelectorAll('.slider__item'));
      _.buttonPrevious = _.root.querySelector('.slider__arrow--previous');
      _.buttonNext = _.root.querySelector('.slider__arrow--next');

      _.slideIndex = START_INDEX;
      _.cursorPosition = {};
      _.slideSets = [];

      _.normalizeClass();

      return _;
    };

    that.execute = function (selector, functions) {
      var _ = that;

      _.root.querySelectorAll(selector).forEach(function (it) {
        functions.forEach(function (func) {
          func(it);
        });
      });
    };

    that.normalizeClass = function () {
      var _ = that;

      _.slides.forEach(function (slide, index) {
        slide.classList.remove('hidden-before-desktop');

        var hiddenIndex = isPreDesktopWidth()
          ? PREDESKTOP_SLIDES_AMOUNT
          : DESKTOP_SLIDES_AMOUNT;

        if (index >= hiddenIndex) {
          slide.classList.add('hidden-entity');
        }
      });
    };

    that.buildSlideSets = function () {
      var _ = that;

      var takenSlides = null;
      var copiedSlides = _.slides.slice();

      var slidesAmount = isPreDesktopWidth()
        ? PREDESKTOP_SLIDES_AMOUNT
        : DESKTOP_SLIDES_AMOUNT;

      while (copiedSlides.length) {
        if (copiedSlides.length < 0) {
          return -1;
        }

        if (copiedSlides.length < slidesAmount) {
          slidesAmount = copiedSlides.length;
        }

        takenSlides = copiedSlides.splice(0, slidesAmount);
        _.slideSets.push(takenSlides);
      }
    };

    that.manageNumbers = function () {
      var _ = that;

      var activeSlides = _.root.querySelectorAll('.slider__item.active');
      var activeSlide = activeSlides[0];

      _.activeSlideNumber.innerText = _.slides.indexOf(activeSlide) + 1;
    };

    that.highlightDot = function () {
      var _ = that;

      var activeSlide = _.root.querySelector('.slider__item.active');
      var activeIndex = activeSlide.getAttribute('data-index');

      _.execute('.slider__dot-btn', [function (dot) {
        dot.classList.remove('active');

        var dotIndex = dot.getAttribute('data-index');
        if (dotIndex === activeIndex) {
          dot.classList.add('active');
        }
      }]);
    };

    that.showNextSlide = function (previous) {
      var _ = that;

      _.slides[_.slideIndex].setAttribute('class', 'slider__item');

      if (previous) {
        _.slideIndex = (--_.slideIndex) % _.slides.length;

        if (_.slideIndex < 0) {
          _.slideIndex += _.slides.length;
        }
      } else {
        _.slideIndex = (++_.slideIndex) % _.slides.length;
      }

      _.slides[_.slideIndex].setAttribute('class', 'slider__item active');

      _.highlightDot();
      _.manageNumbers();
    };

    that.onArrowClick = function (evt) {
      if (!evt.target.matches('.slider__arrow')) {
        return;
      }

      var _ = that;

      if (evt.target.matches('.slider__arrow--previous')) {
        _.showNextSlide(true);
      }

      if (evt.target.matches('.slider__arrow--next')) {
        _.showNextSlide();
      }
    };

    that.onSliderTouchstart = function (evt) {
      evt.preventDefault();
      that.cursorPosition.clientX1 = evt.touches[0].clientX;
    };

    that.onSliderTouchend = function (evt) {
      var _ = that;

      evt.preventDefault();
      _.cursorPosition.clientX2 = evt.changedTouches[0].clientX;

      var clientX1 = _.cursorPosition.clientX1;
      var clientX2 = _.cursorPosition.clientX2;

      if (clientX1 - clientX2 === 0) {
        return;
      }

      if (clientX1 - clientX2 < 0) {
        _.showNextSlide(true);
      }

      if (clientX1 - clientX2 > 0) {
        _.showNextSlide();
      }
    };

    that.onDotsClick = function (evt) {
      if (!evt.target.matches('.slider__dot-btn')) {
        return;
      }

      var _ = that;

      var dataIndex = evt.target.getAttribute('data-index');
      var slideToShow = _.root.querySelector('.slider__item[data-index="' + dataIndex + '"]');
      var activeSlide = _.root.querySelector('.slider__item.active');

      activeSlide.classList.remove('active');
      slideToShow.classList.add('active');

      _.slideIndex = _.slides.indexOf(slideToShow);

      _.highlightDot();
      _.manageNumbers();
    };

    that.processMouse = function (evt) {
      if (evt.target.matches('.slider__arrow')) {
        that.onArrowClick(evt);
      } else if (evt.target.matches('.slider__dot-btn')) {
        that.onDotsClick(evt);
      }
    };

    that.onSliderPointerup = function (evt) {
      switch (evt.pointerType) {
        case 'mouse':
        case 'touch':
          that.processMouse(evt);
          break;
        default:
          return;
      }
    };

    that.setEventListeners = function () {
      var _ = that;

      _.root.addEventListener('pointerup', _.onSliderPointerup);
      _.root.addEventListener('touchstart', _.onSliderTouchstart);
      _.root.addEventListener('touchend', _.onSliderTouchend);
    };

    that.eraseEventListeners = function () {
      var _ = that;

      _.root.removeEventListener('pointerup', _.onSliderPointerup);
      _.root.removeEventListener('touchstart', _.onSliderTouchstart);
      _.root.removeEventListener('touchend', _.onSliderTouchend);
    };

    return that;
  };

  var sliders = null;
  var isPreDesktopWidth = window.utility.isPreDesktopWidth;
  window.slider = {};

  var findSliders = function () {
    var Maybe = window.utility.Maybe;
    sliders = new Maybe(document.querySelectorAll('.slider'));
    sliders = sliders.operand.length
      ? Array.from(sliders.operand)
      : null;
  };

  findSliders();

  if (sliders.length) {
    sliders.forEach(function (it) {
      var slider = initSlider(it);
      slider.activate().setEventListeners();
      window.slider[slider.root.id] = slider;
    });

    var createWindowEventsHandler = function (method) {
      return function () {
        Object.keys(window.slider).forEach(function (key) {
          window.slider[key][method]();
        });
      };
    };

    var onWindowResize = createWindowEventsHandler('hideScrollbar');
    var onWindowBeforeunload = createWindowEventsHandler('eraseEventListeners');

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('beforeunload', onWindowBeforeunload);
  }
})();
