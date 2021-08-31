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

  var getCurrentMode = function () {
    var width = document.documentElement.clientWidth;

    if (width >= DESKTOP_WIDTH) {
      return 'desktop';
    }

    if (width >= TABLET_WIDTH) {
      return 'tablet';
    }

    return 'mobile';
  };

  // useMethod
  var useMethod = function (objectName, method) {
    return function () {
      Object.keys(window[objectName]).forEach(function (key) {
        window[objectName][key][method]();
      });
    };
  };

  // export
  window.utility = {
    Maybe: Maybe,
    isEscEvent: isEscEvent,
    isTabEvent: isTabEvent,
    focusableSelectors: focusableSelectors,
    isPreDesktopWidth: isPreDesktopWidth,
    isPreTabletWidth: isPreTabletWidth,
    getCurrentMode: getCurrentMode,
    useMethod: useMethod
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
  var IGNORED_SWIPE_DISTANCE = 20;

  var initSlider = function (rootElement) {
    var that = {};

    that.activate = function () {
      var _ = that;

      _.root = rootElement;
      _.sliderList = _.root.querySelector('.slider__list');
      _.slides = Array.from(_.root.querySelectorAll('.slider__item'));
      _.buttonPrevious = _.root.querySelector('.slider__arrow--previous');
      _.buttonNext = _.root.querySelector('.slider__arrow--next');
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
      _.verifyArrows();

      return _;
    };

    that.rebuild = function () {
      var _ = that;

      _.slideSets = [];
      _.slideSetIndex = START_INDEX;
      _.activeSetIndex = START_INDEX;

      _.normalizeClass();
      _.buildSlideSets();

      _.slideSets[_.slideSetIndex].forEach(function (slide) {
        slide.classList.add('hidden-entity');
      });

      _.slideSets[_.activeSetIndex].forEach(function (slide) {
        slide.classList.remove('hidden-entity');
      });

      _.slideSetIndex = _.activeSetIndex;

      _.defineSetsQuantity();
      _.defineCurrentSetNumber();
      _.insertNumbers();
      _.verifyArrows();
    };

    that.normalizeClass = function () {
      var _ = that;

      _.slides.forEach(function (slide, index) {
        slide.setAttribute('class', 'slider__item');

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

        if (!isPreDesktopWidth()) {
          takenSlides[takenSlides.length - 1].classList.add('last-slide');
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

    that.verifyArrows = function () {
      var _ = that;

      if (_.slideSets.length === 0) {
        return 'canceled';
      }

      if (_.slideSets.length < 0) {
        return -1;
      }

      if (_.slideSets.length === 1) {
        [
          _.buttonPrevious,
          _.buttonNext
        ].forEach(function (item) {
          item.disabled = true;
        });
      } else {
        [
          _.buttonPrevious,
          _.buttonNext
        ].forEach(function (item) {
          item.removeAttribute('disabled');
        });
      }

      return 'done';
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
      switch (true) {
        case evt.target.matches('.slider__arrow--previous'):
        case evt.target.parentNode.matches('.slider__arrow--previous'):
          that.showNextSlideSet(true);
          break;

        case evt.target.matches('.slider__arrow--next'):
        case evt.target.parentNode.matches('.slider__arrow--next'):
          that.showNextSlideSet();
          break;

        default:
          break;
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

      var ignore = clientX1 - clientX2 < IGNORED_SWIPE_DISTANCE
        && clientX1 - clientX2 > -IGNORED_SWIPE_DISTANCE
        ? true
        : false;

      if (clientX1 - clientX2 === 0 || ignore) {
        return;
      }

      if (clientX1 - clientX2 < 0) {
        _.showNextSlideSet(true);
      }

      if (clientX1 - clientX2 > 0) {
        _.showNextSlideSet();
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
      switch (true) {
        case evt.target.matches('.slider__arrow'):
        case evt.target.parentNode.matches('.slider__arrow'):
          that.onArrowClick(evt);
          break;

        case evt.target.matches('.slider__frame-button'):
          that.onNumbersClick(evt);
          break;

        default:
          break;
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
  var firstLoading = false;
  var isPreDesktopWidth = window.utility.isPreDesktopWidth;
  var isPreTabletWidth = window.utility.isPreTabletWidth;
  var getCurrentMode = window.utility.getCurrentMode;
  var useMethod = window.utility.useMethod;
  var mode = getCurrentMode();
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

    var rebuild = useMethod('slider', 'rebuild');
    var manageNumbers = useMethod('slider', 'manageNumbers');

    var onWindowResize = (function () {
      var isWorkedOnPreDesktopWidth = false;
      var isWorkedOnDesktopWidth = false;
      var currentMode = '';

      return function () {
        currentMode = getCurrentMode();

        if (currentMode !== mode && firstLoading) {
          firstLoading = false;
        }

        if (isPreDesktopWidth()) {
          manageNumbers();
        }

        if (!isPreDesktopWidth() && !isWorkedOnDesktopWidth && !firstLoading) {
          rebuild();
          isWorkedOnPreDesktopWidth = false;
          isWorkedOnDesktopWidth = true;
          return;
        }

        if (isPreDesktopWidth() && !isWorkedOnPreDesktopWidth && !firstLoading) {
          rebuild();
          isWorkedOnPreDesktopWidth = true;
          isWorkedOnDesktopWidth = false;
        }
      };
    })();

    var onWindowBeforeunload = useMethod('slider', 'eraseEventListeners');

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('beforeunload', onWindowBeforeunload);

    firstLoading = true;
  }
})();

//
// accordeon
//

(function () {
  var initAccordeon = function (rootElement) {
    var that = {};

    that.activate = function () {
      var _ = that;

      _.root = rootElement;
      _.buttons = Array.from(_.root.querySelectorAll('.accordeon__button'));
      _.contents = Array.from(_.root.querySelectorAll('.accordeon__content'));

      _.addContentJsStyles();

      return _;
    };

    that.addContentJsStyles = function () {
      that.contents.forEach(function (item) {
        that.hideContent(item);
      });
    };

    that.hideContent = function (item) {
      item.classList.add('accordeon__content--js');
    };

    that.onAccordeonClick = function (evt) {
      if (!evt.target.closest('.accordeon__button')) {
        return;
      }

      var _ = that;

      var target = evt.target.closest('.accordeon__button');
      var isButtonInactive = !target.classList.contains('accordeon__button--active');

      _.buttons.forEach(function (item) {
        item.classList.remove('accordeon__button--active');
      });

      if (isButtonInactive) {
        target.classList.toggle('accordeon__button--active');
      }
    };

    that.setEventListener = function () {
      that.root.addEventListener('click', that.onAccordeonClick);
    };

    that.eraseEventListener = function () {
      that.root.removeEventListener('click', that.onAccordeonClick);
    };

    return that;
  };

  var accordeons = null;
  var useMethod = window.utility.useMethod;
  window.accordeon = {};

  var findAccordeons = function () {
    var Maybe = window.utility.Maybe;
    accordeons = new Maybe(document.querySelectorAll('.accordeon'));
    accordeons = accordeons.operand.length
      ? Array.from(accordeons.operand)
      : null;
  };

  findAccordeons();

  if (accordeons.length) {
    accordeons.forEach(function (it) {
      var accordeon = initAccordeon(it);
      accordeon.activate().setEventListener();
      window.accordeon[accordeon.root.id] = accordeon;
    });

    var onWindowBeforeunload = useMethod('accordeon', 'eraseEventListener');
    window.addEventListener('beforeunload', onWindowBeforeunload);
  }
})();
