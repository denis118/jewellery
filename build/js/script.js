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

  // isPreDesktopWidth
  var isPreDesktopWidth = function () {
    return document.documentElement.clientWidth < DESKTOP_WIDTH;
  };

  // isPreTabletWidth
  var isPreTabletWidth = function () {
    return document.documentElement.clientWidth < TABLET_WIDTH;
  };

  // ESC event
  var isEscEvent = function (evt) {
    return evt.key === ('Escape' || 'Esc');
  };

  // TAB event
  var isTabEvent = function (evt) {
    return evt.key === 'Tab';
  };

  // attributeSet
  var attributeSet = {
    'role': 'dialog',
    'aria-modal': true
  };

  // setAttributes
  var setAttributes = function (element) {
    for (var attribute in attributeSet) {
      if (attributeSet.hasOwnProperty(attribute)) {
        element.setAttribute(attribute, attributeSet[attribute]);
      }
    }
  };

  // resetAttributes
  var resetAttributes = function (element) {
    for (var attribute in attributeSet) {
      if (attributeSet.hasOwnProperty(attribute)) {
        element.removeAttribute(attribute);
      }
    }
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

  // isVisible
  var isVisible = function (element) {
    return element.offsetWidth
      || element.offsetHeight
      || element.getClientRects().length
      ? true
      : false;
  };

  // getFocusableChildren
  var getFocusableChildren = function (element) {
    return Array.from(
        element
            .querySelectorAll(focusableSelectors.join(','))
    ).filter(isVisible);
  };

  // moveFocusIn
  var moveFocusIn = function (element) {
    var target = element.querySelector('[autofocus]')
      || getFocusableChildren(element)[0];

    if (target) {
      target.focus();
    }
  };

  // trapTabKey
  var trapTabKey = function (evt, element) {
    var focusableChildren = getFocusableChildren(element);
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

  // onBodyFocus
  var onBodyFocus = function (evt, element) {
    var isInDialog = evt.target.closest('[aria-modal="true"]');

    if (!isInDialog) {
      moveFocusIn(element);
    }
  };

  // getCurrentMode
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
    isPreDesktopWidth: isPreDesktopWidth,
    isPreTabletWidth: isPreTabletWidth,
    isEscEvent: isEscEvent,
    isTabEvent: isTabEvent,
    setAttributes: setAttributes,
    resetAttributes: resetAttributes,
    trapTabKey: trapTabKey,
    moveFocusIn: moveFocusIn,
    onBodyFocus: onBodyFocus,
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

  if (!header) {
    return;
  }

  var isPreDesktopWidth = window.utility.isPreDesktopWidth;
  var isTabEvent = window.utility.isTabEvent;
  var setAttributes = window.utility.setAttributes;
  var resetAttributes = window.utility.resetAttributes;
  var moveFocusIn = window.utility.moveFocusIn;
  var trapTabKey = window.utility.trapTabKey;
  var onBodyFocus = window.utility.onBodyFocus;

  var manageHeader = function () {
    var that = {};

    that.activate = function () {
      var _ = that;

      _.header = header;
      _.burger = _.header.querySelector('.header__burger');
      _.lowerContainer = _.header.querySelector('.header__container--lower');
      _.body = document.body;

      _.header.classList.add('header--js');
      _.isShown = false;
      _.toggleMargin();
      _.burger.addEventListener('click', _.onBurgerClick);
      return that;
    };

    that.toggleMargin = function () {
      var nextSibling = that.header.nextElementSibling
        ? that.header.nextElementSibling
        : null;

      var main = document.querySelector('main')
        ? document.querySelector('main')
        : null;

      switch (isPreDesktopWidth()) {
        case true:
          if (nextSibling && main && Object.is(nextSibling, main)) {
            var height = that.header.scrollHeight;
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
        setAttributes(that.header);
        that.lowerContainer.setAttribute('tabindex', '-1');
      }

      return that;
    };

    that.resetAttributes = function () {
      if (!isPreDesktopWidth()) {
        resetAttributes(that.header);
        that.lowerContainer.removeAttribute('tabindex');
      }

      return that;
    };

    that.show = function () {
      var _ = that;

      _.isShown = true;
      _.previouslyFocused = document.activeElement;

      _.body.classList.add('scroll-stop');
      _.header.classList.add('menu-open');

      _.setEventListeners();
      moveFocusIn(_.header);
    };

    that.hide = function () {
      var _ = that;

      if (_.previouslyFocused && _.previouslyFocused.focus) {
        _.previouslyFocused.focus();
      }

      _.isShown = false;
      _.body.classList.remove('scroll-stop');
      _.header.classList.remove('menu-open');

      _.eraseEventListeners();
    };

    that.onBurgerClick = function () {
      if (!that.isShown) {
        that.show();
      } else {
        that.hide();
      }
    };

    that.onBodyFocus = function (evt) {
      onBodyFocus(evt, that.header);
    };

    that.onDocumentKeyDown = function (evt) {
      if (isTabEvent(evt)) {
        trapTabKey(evt, that.header);
      }
    };

    that.setEventListeners = function () {
      document.addEventListener('keydown', that.onDocumentKeyDown);
      that.body.addEventListener('focus', that.onBodyFocus, true);
    };

    that.eraseEventListeners = function () {
      document.removeEventListener('keydown', that.onDocumentKeyDown);
      that.body.removeEventListener('focus', that.onBodyFocus, true);
    };

    that.destroy = function () {
      that.burger.removeEventListener('click', that.onBurgerClick);
      that.body.removeEventListener('focus', that.onBodyFocus, true);
      document.removeEventListener('keydown', that.onDocumentKeyDown);
    };

    return that;
  };

  var headerManager = manageHeader();
  headerManager
      .activate()
      .setAttributes();

  var onWindowResize = (function () {
    var isWorkedOnPreDesktopWidth = false;
    var isWorkedOnDesktopWidth = false;

    return function () {
      if (!isPreDesktopWidth() && !isWorkedOnDesktopWidth) {
        headerManager.resetAttributes().hide();
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

  window.addEventListener('resize', onWindowResize);

  var onWindowBeforeunload = function () {
    headerManager.destroy();
    window.removeEventListener('resize', onWindowResize);
  };

  // export
  window.headerDestroyer = {
    onWindowBeforeunload: onWindowBeforeunload
  };
})();

//
// slider
//

(function () {
  var START_INDEX = 0;
  var DESKTOP_SLIDES_AMOUNT = 4;
  var PREDESKTOP_SLIDES_AMOUNT = 2;
  var IGNORED_SWIPE_DISTANCE = 30;

  var sliders = null;

  var findSliders = function () {
    var Maybe = window.utility.Maybe;
    sliders = new Maybe(document.querySelectorAll('#slider-main'));
    sliders = sliders.operand.length
      ? Array.from(sliders.operand)
      : null;
  };

  findSliders();

  if (!(sliders && sliders.length)) {
    return;
  }

  var firstLoading = false;
  var isPreDesktopWidth = window.utility.isPreDesktopWidth;
  var isPreTabletWidth = window.utility.isPreTabletWidth;
  var getCurrentMode = window.utility.getCurrentMode;
  var useMethod = window.utility.useMethod;
  var mode = getCurrentMode();
  window.slider = {};

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

      return that;
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
      that.slides.forEach(function (slide, index) {
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
      var takenSlides = null;
      var copiedSlides = that.slides.slice();

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

        that.slideSets.push(takenSlides);
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
      var fragment = document.createDocumentFragment();
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
        fragment.appendChild(listItem.cloneNode(true));
      }

      list.appendChild(fragment);
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
      switch (isPreTabletWidth()) {
        case true:
          that.defineCurrentSetNumber();
          break;

        case false:
          that.highlightNumber();
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

      var isIgnored = clientX1 - clientX2 < IGNORED_SWIPE_DISTANCE
        && clientX1 - clientX2 > -IGNORED_SWIPE_DISTANCE
        ? true
        : false;

      if (clientX1 - clientX2 === 0 || isIgnored) {
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
      that.root.addEventListener('pointerup', that.onSliderPointerup);
      that.root.addEventListener('touchstart', that.onSliderTouchstart);
      that.root.addEventListener('touchend', that.onSliderTouchend);
    };

    that.eraseEventListeners = function () {
      that.root.removeEventListener('pointerup', that.onSliderPointerup);
      that.root.removeEventListener('touchstart', that.onSliderTouchstart);
      that.root.removeEventListener('touchend', that.onSliderTouchend);
    };

    return that;
  };

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

  window.addEventListener('resize', onWindowResize);
  firstLoading = true;

  var onWindowBeforeunload = useMethod('slider', 'eraseEventListeners');

  // export
  window.sliderDestroyer = {
    onWindowBeforeunload: onWindowBeforeunload
  };
})();

//
// accordeon
//

(function () {
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

  if (!(accordeons && accordeons.length)) {
    return;
  }

  var initAccordeon = function (rootElement) {
    var that = {};

    that.activate = function () {
      that.root = rootElement;
      that.buttons = Array.from(that.root.querySelectorAll('.accordeon__button'));
      that.contents = Array.from(that.root.querySelectorAll('.accordeon__content'));

      that.addContentJsStyles();
      return that;
    };

    that.addContentJsStyles = function () {
      that.contents.forEach(function (item) {
        that.hideContent(item);
      });
    };

    that.hideContent = function (item) {
      item.classList.add('accordeon__content--js');

      switch (true) {
        case item.matches('.faq__first-answer'):
        case item.matches('.accordeon__content--products'):
        case item.matches('.accordeon__content--price'):
          item
              .previousElementSibling
              .classList
              .add('accordeon__button--active');
          break;

        default:
          break;
      }
    };

    // that.onAccordeonClick = function (evt) {
    //   if (!evt.target.closest('.accordeon__button')) {
    //     return;
    //   }

    //   var target = evt.target.closest('.accordeon__button');
    //   var isButtonInactive = !target.classList.contains('accordeon__button--active');

    //   that.buttons.forEach(function (item) {
    //     item.classList.remove('accordeon__button--active');
    //   });

    //   if (isButtonInactive) {
    //     target.classList.toggle('accordeon__button--active');
    //   }
    // };

    that.onAccordeonClick = function (evt) {
      if (!evt.target.closest('.accordeon__button')) {
        return;
      }

      evt.target
          .closest('.accordeon__button')
          .classList.toggle('accordeon__button--active');
    };

    that.setEventListener = function () {
      that.root.addEventListener('click', that.onAccordeonClick);
    };

    that.eraseEventListener = function () {
      that.root.removeEventListener('click', that.onAccordeonClick);
    };

    return that;
  };

  accordeons.forEach(function (it) {
    var accordeon = initAccordeon(it);
    accordeon.activate().setEventListener();
    window.accordeon[accordeon.root.id] = accordeon;
  });

  var onWindowBeforeunload = useMethod('accordeon', 'eraseEventListener');

  // export
  window.accordeonDestroyer = {
    onWindowBeforeunload: onWindowBeforeunload
  };
})();

//
// filter
//

(function () {
  var filter = null;

  var findFilter = function () {
    var Maybe = window.utility.Maybe;
    filter = new Maybe(document.querySelector('.filter'));
    filter = filter.operand
      ? filter.operand
      : null;
  };

  findFilter();

  if (!filter) {
    return;
  }

  var isPreDesktopWidth = window.utility.isPreDesktopWidth;
  var isTabEvent = window.utility.isTabEvent;
  var isEscEvent = window.utility.isEscEvent;
  var setAttributes = window.utility.setAttributes;
  var resetAttributes = window.utility.resetAttributes;
  var moveFocusIn = window.utility.moveFocusIn;
  var trapTabKey = window.utility.trapTabKey;
  var onBodyFocus = window.utility.onBodyFocus;

  var manageFilter = function () {
    var that = {};

    that.activate = function () {
      var _ = that;

      _.filter = filter;
      _.inner = _.filter.querySelector('.filter__inner');
      _.formBox = _.filter.querySelector('.filter__form-box');
      _.starter = _.filter.querySelector('.filter__starter');
      _.cross = _.filter.querySelector('.filter__cross');
      _.body = document.body;
      _.isShown = false;

      _.starter.addEventListener('click', _.onStarterClick);
      return that;
    };

    that.setAttributes = function () {
      if (isPreDesktopWidth()) {
        setAttributes(that.filter);
      }

      return that;
    };

    that.resetAttributes = function () {
      if (!isPreDesktopWidth()) {
        resetAttributes(that.filter);
      }

      return that;
    };

    that.show = function () {
      var _ = that;

      _.isShown = true;
      _.previouslyFocused = document.activeElement;

      _.body.classList.add('scroll-stop');
      _.inner.classList.add('overlay');
      _.filter.classList.add('filter--js');
      _.starter.setAttribute('tabindex', '-1');

      _.setEventListeners();
      moveFocusIn(_.filter);
    };

    that.hide = function () {
      var _ = that;

      if (_.previouslyFocused && _.previouslyFocused.focus) {
        _.previouslyFocused.focus();
      }

      _.isShown = false;
      _.body.classList.remove('scroll-stop');
      _.inner.classList.remove('overlay');
      _.filter.classList.remove('filter--js');
      _.starter.removeAttribute('tabindex');

      _.eraseEventListeners();
    };

    that.onStarterClick = function () {
      if (!that.isShown) {
        that.show();
      }
    };

    that.onCrossClick = function () {
      if (that.isShown) {
        that.hide();
      }
    };

    that.onInnerClick = function (evt) {
      if (!Object.is(evt.target, that.inner)) {
        return;
      }

      that.hide();
    };

    that.onBodyFocus = function (evt) {
      onBodyFocus(evt, that.filter);
    };

    that.onDocumentKeyDown = function (evt) {
      if (isTabEvent(evt)) {
        trapTabKey(evt, that.filter);
      }

      if (isEscEvent(evt)) {
        that.hide();
      }
    };

    that.setEventListeners = function () {
      that.cross.addEventListener('click', that.onCrossClick);
      that.inner.addEventListener('click', that.onInnerClick);
      that.body.addEventListener('focus', that.onBodyFocus, true);
      document.addEventListener('keydown', that.onDocumentKeyDown);
    };

    that.eraseEventListeners = function () {
      that.cross.removeEventListener('click', that.onCrossClick);
      that.inner.removeEventListener('click', that.onInnerClick);
      that.body.removeEventListener('focus', that.onBodyFocus, true);
      document.removeEventListener('keydown', that.onDocumentKeyDown);
    };

    that.destroy = function () {
      that.starter.removeEventListener('click', that.onStarterClick);
      that.eraseEventListeners();
    };

    return that;
  };

  var filterManager = manageFilter();
  filterManager
      .activate()
      .setAttributes()
      .setEventListeners();

  var onWindowResize = (function () {
    var isWorkedOnPreDesktopWidth = false;
    var isWorkedOnDesktopWidth = false;

    return function () {
      if (!isPreDesktopWidth() && !isWorkedOnDesktopWidth) {
        filterManager.resetAttributes().hide();
        isWorkedOnPreDesktopWidth = false;
        isWorkedOnDesktopWidth = true;
        return;
      }

      if (isPreDesktopWidth() && !isWorkedOnPreDesktopWidth) {
        filterManager.setAttributes().setEventListeners();
        isWorkedOnPreDesktopWidth = true;
        isWorkedOnDesktopWidth = false;
      }
    };
  })();

  window.addEventListener('resize', onWindowResize);

  var onWindowBeforeunload = function () {
    filterManager.destroy();
    window.removeEventListener('resize', onWindowResize);
  };

  // export
  window.filterDestroyer = {
    onWindowBeforeunload: onWindowBeforeunload
  };
})();

//
// filter cleaner
//

(function () {
  var filterCleaner = document.querySelector('#filter-cleaner')
    ? document.querySelector('#filter-cleaner')
    : null;

  if (!filterCleaner) {
    return;
  }

  var filterId = filterCleaner.dataset.for;
  var filter = document.querySelector(filterId);
  var checkboxes = filter.querySelectorAll('input[type="checkbox"]');

  var lowerCostSpan = filter.querySelector('#lower-cost-span');
  var upperCostSpan = filter.querySelector('#upper-cost-span');
  var lowerCostText = lowerCostSpan.innerText;
  var upperCostText = upperCostSpan.innerText;

  var lowerCostInput = filter.querySelector('#lower-cost-input');
  var upperCostInput = filter.querySelector('#upper-cost-input');
  var lowerCostValue = lowerCostInput.value;
  var upperCostValue = upperCostInput.value;

  var onFilterCleanerClick = function () {
    checkboxes.forEach(function (item) {
      var hasAttribute = item.getAttribute('data-checked')
        ? true
        : false;

      if (hasAttribute) {
        item.checked = item.dataset.checked;
      } else {
        item.checked = false;
      }
    });

    lowerCostSpan.innerText = lowerCostText;
    upperCostSpan.innerText = upperCostText;
    lowerCostInput.value = lowerCostValue;
    upperCostInput.value = upperCostValue;
  };

  filterCleaner.addEventListener('click', onFilterCleanerClick);

  var onWindowBeforeunload = function () {
    filterCleaner.removeEventListener('click', onFilterCleanerClick);
    window.removeEventListener('beforeunload', onWindowBeforeunload);
  };

  // export
  window.filterCleanerDestroyer = {
    onWindowBeforeunload: onWindowBeforeunload
  };
})();

//
// login
//

(function () {
  var loginLinks = null;
  var loginModal = null;
  var Maybe = window.utility.Maybe;

  var findLoginLinks = function () {
    loginLinks = new Maybe(document.querySelectorAll('.login-link'));
    loginLinks = loginLinks.operand
      ? Array.from(loginLinks.operand)
      : null;
  };

  findLoginLinks();

  var findLoginModal = function () {
    loginModal = new Maybe(document.querySelector('#modal-login'));
    loginModal = loginModal.operand
      ? loginModal.operand
      : null;
  };

  findLoginModal();

  if (!(loginLinks && loginLinks.length && loginModal)) {
    return;
  }

  var isTabEvent = window.utility.isTabEvent;
  var isEscEvent = window.utility.isEscEvent;
  var setAttributes = window.utility.setAttributes;
  var resetAttributes = window.utility.resetAttributes;
  var moveFocusIn = window.utility.moveFocusIn;
  var trapTabKey = window.utility.trapTabKey;
  var onBodyFocus = window.utility.onBodyFocus;

  var manageLogin = function () {
    var that = {};

    that.activate = function () {
      var _ = that;

      _.loginLinks = loginLinks;
      _.loginModal = loginModal;
      _.cross = _.loginModal.querySelector('.login__cross');
      _.body = document.body;
      _.isShown = false;

      _.loginLinks.forEach(function (link) {
        link.addEventListener('click', _.onLoginLinkClick);
      });
      return that;
    };

    that.setAttributes = function () {
      setAttributes(that.loginModal);
      return that;
    };

    that.resetAttributes = function () {
      resetAttributes(that.loginModal);
      return that;
    };

    that.show = function () {
      var _ = that;

      _.isShown = true;
      _.previouslyFocused = document.activeElement;

      _.body.classList.add('scroll-stop');
      _.loginModal.classList.remove('hidden-entity');

      _.setEventListeners();
      moveFocusIn(_.loginModal);
    };

    that.hide = function () {
      var _ = that;

      if (_.previouslyFocused && _.previouslyFocused.focus) {
        _.previouslyFocused.focus();
      }

      _.isShown = false;
      _.body.classList.remove('scroll-stop');
      _.loginModal.classList.add('hidden-entity');

      _.eraseEventListeners();
    };

    that.onLoginLinkClick = function (evt) {
      evt.preventDefault();
      if (!that.isShown) {
        that.show();
      }
    };

    that.onCrossClick = function () {
      if (that.isShown) {
        that.hide();
      }
    };

    that.onLoginModalClick = function (evt) {
      if (!Object.is(evt.target, that.loginModal)) {
        return;
      }

      that.hide();
    };

    that.onBodyFocus = function (evt) {
      onBodyFocus(evt, that.loginModal);
    };

    that.onDocumentKeyDown = function (evt) {
      if (isTabEvent(evt)) {
        trapTabKey(evt, that.loginModal);
      }

      if (isEscEvent(evt)) {
        that.hide();
      }
    };

    that.setEventListeners = function () {
      that.loginModal.addEventListener('click', that.onLoginModalClick);
      that.cross.addEventListener('click', that.onCrossClick);
      that.body.addEventListener('focus', that.onBodyFocus, true);
      document.addEventListener('keydown', that.onDocumentKeyDown);
    };

    that.eraseEventListeners = function () {
      that.loginModal.removeEventListener('click', that.onLoginModalClick);
      that.cross.removeEventListener('click', that.onCrossClick);
      that.body.removeEventListener('focus', that.onBodyFocus, true);
      document.removeEventListener('keydown', that.onDocumentKeyDown);
    };

    that.destroy = function () {
      that.loginLinks.forEach(function (link) {
        link.removeEventListener('click', that.onLoginLinkClick);
      });
      that.eraseEventListeners();
    };

    return that;
  };

  var loginManager = manageLogin();
  loginManager
      .activate()
      .setAttributes()
      .setEventListeners();

  var onWindowBeforeunload = function () {
    loginManager.destroy();
  };

  // export
  window.loginDestroyer = {
    onWindowBeforeunload: onWindowBeforeunload
  };
})();

//
// beforeunload
//

(function () {
  var onWindowBeforeunload = function () {
    [
      'headerDestroyer',
      'sliderDestroyer',
      'accordeonDestroyer',
      'filterDestroyer',
      'filterCleanerDestroyer',
      'loginDestroyer'
    ].forEach(function (item) {
      window[item].onWindowBeforeunload();
    });

    window.removeEventListener('beforeunload', onWindowBeforeunload);
  };

  window.addEventListener('beforeunload', onWindowBeforeunload);
})();
