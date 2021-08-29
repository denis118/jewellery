'use strict';

//
// utility
//

(function () {
  var DESKTOP_WIDTH = 1024;
  var TABLET_WIDTH = 768;

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

  // isPreTabletWidth
  var isPreTabletWidth = function () {
    return document.documentElement.clientWidth < TABLET_WIDTH;
  };

  // export
  window.utility = {
    Maybe: Maybe,
    isEscEvent: isEscEvent,
    isTabEvent: isTabEvent,
    focusableSelectors: focusableSelectors,
    isPreDesktopWidth: isPreDesktopWidth,
    isPreTabletWidth: isPreTabletWidth
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
            break;
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
  var PREDESKTOP_SLIDES_AMOUNT = 2;

  var initSlider = function (rootElement) {
    var that = {};

    that.activate = function () {
      var _ = that;

      _.root = rootElement;
      _.sliderList = _.root.querySelector('.slider__list');
      _.slides = Array.from(_.root.querySelectorAll('.slider__item'));
      _.currentSetNumber = _.root.querySelector('.slider__current-set-number');
      _.slidesetQuantity = _.root.querySelector('.slider__slideset-quantity');

      _.slideSetIndex = START_INDEX;
      _.activeSetIndex = null;
      _.cursorPosition = {};
      _.slideSets = [];
      _.numbers = null;

      _.normalizeClass();
      _.buildSlideSets();
      _.defineSetsQuantity();
      _.defineCurrentSetNumber();
      _.specifyActiveSetIndex();
      _.insertNumbers();

      return _;
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

        if (isPreDesktopWidth()) {
          takenSlides[0].classList.add('first-slide');
        }

        _.slideSets.push(takenSlides);
      }

      return 'done';
    };

    that.defineSetsQuantity = function () {
      that.slidesetQuantity.innerText = that.slideSets.length;
    };

    that.defineCurrentSetNumber = function () {
      that.currentSetNumber.innerText = that.slideSetIndex + 1;
    };

    that.specifyActiveSetIndex = function () {
      that.activeSetIndex = that.slideSetIndex;
    };

    that.highlightNumber = function () {
      that.numbers.forEach(function (number, index) {
        number.setAttribute('class', 'slider__frame-button button');

        if (index === that.slideSetIndex) {
          number.setAttribute('class', 'slider__frame-button button active');
        }
      });
    };

    that.insertNumbers = function () {
      var _ = that;

      var list = _.root.querySelector('.slider__frame-button-list');
      var listItem = list
          .querySelector('.slider__frame-button-item')
          .cloneNode(true);

      while (list.firstChild) {
        list.removeChild(list.firstChild);
      }

      var number = null;
      var button = listItem.querySelector('button');
      var buttonAttributeSet = {
        'class': 'slider__frame-button button',
        'type': 'button'
      };

      Object.keys(buttonAttributeSet).forEach(function (key) {
        button.setAttribute(key, buttonAttributeSet[key]);
      });

      for (var i = 0; i < _.slideSets.length; i++) {
        number = i + 1;
        button.setAttribute('aria-label', 'Button to enable the ' + number + ' set of products');
        button.innerText = number;
        list.appendChild(listItem.cloneNode(true));
      }

      _.numbers = Array.from(_.root.querySelectorAll('.slider__frame-button'));
      _.highlightNumber();
    };

    that.hideSlides = function (array) {
      array.forEach(function (element) {
        element.classList.add('hidden-entity');
      });
    };

    that.showSlides = function (array) {
      array.forEach(function (element) {
        element.classList.remove('hidden-entity');
      });
    };

    that.manageNumbers = function () {
      var _ = that;

      switch (isPreTabletWidth()) {
        case true:
          _.defineCurrentSetNumber();
          break;

        case false:
          _.highlightNumber();
          break;

        default:
          break;
      }
    };

    that.showNextSlideSet = function (previous) {
      var _ = that;

      _.slideSets[_.slideSetIndex].forEach(function (slide) {
        slide.classList.add('hidden-entity');
      });

      if (previous) {
        _.slideSetIndex = (--_.slideSetIndex) % _.slideSets.length;

        if (_.slideSetIndex < 0) {
          _.slideSetIndex += _.slideSets.length;
        }
      } else {
        _.slideSetIndex = (++_.slideSetIndex) % _.slideSets.length;
      }

      _.slideSets[_.slideSetIndex].forEach(function (slide) {
        slide.classList.remove('hidden-entity');
      });

      _.specifyActiveSetIndex();
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

    that.onNumbersClick = function (evt) {
      if (!evt.target.matches('.slider__frame-button')) {
        return;
      }

      var _ = that;

      _.slideSetIndex = _.numbers.indexOf(evt.target);

      _.hideSlides(_.slideSets[_.activeSetIndex]);
      _.showSlides(_.slideSets[_.slideSetIndex]);

      _.specifyActiveSetIndex();
      _.manageNumbers();
    };

    that.processMouse = function (evt) {
      if (evt.target.matches('.slider__arrow')) {
        that.onArrowClick(evt);
      } else if (evt.target.matches('.slider__frame-button')) {
        that.onNumbersClick(evt);
      }
    };

    that.onSliderPointerup = function (evt) {
      switch (evt.pointerType) {
        case 'mouse':
        case 'touch':
          that.processMouse(evt);
          break;

        default:
          break;
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
  var isPreTabletWidth = window.utility.isPreTabletWidth;
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

    var onWindowBeforeunload = createWindowEventsHandler('eraseEventListeners');
    window.addEventListener('beforeunload', onWindowBeforeunload);
  }
})();
