'use strict';

//
// polyfills
//

(function (elementPrototype) {
  // polyfill for 'matches' method
  (function (element) {
    var matches = element.matches
      || element.matchesSelector
      || element.webkitMatchesSelector
      || element.mozMatchesSelector
      || element.msMatchesSelector
      || element.oMatchesSelector;

    if (!matches) {
      element.matches = element.matchesSelector = function (selector) {
        var allMatches = document.querySelectorAll(selector);
        var self = this;
        return Array.prototype.some.call(allMatches, function (searchedElement) {
          return searchedElement === self;
        });
      };
    } else {
      element.matches = element.matchesSelector = matches;
    }
  })(elementPrototype);

  // polyfill for 'closest' method
  (function (element) {
    element.closest = element.closest || function (selector) {
      var node = this;

      while (node) {
        if (node.matches(selector)) {
          return node;
        } else {
          node = node.parentElement;
        }
      }
      return null;
    };
  })(elementPrototype);
})(Element.prototype);

//
// utility
//

(function () {
  var DESKTOP_WIDTH = 1024;
  var TABLET_WIDTH = 768;

  var isPreDesktopWidth = function () {
    return document.documentElement.clientWidth < DESKTOP_WIDTH;
  };

  var isPreTabletWidth = function () {
    return document.documentElement.clientWidth < TABLET_WIDTH;
  };

  var isEscEvent = function (evt) {
    return evt.key === 'Escape' || evt.key === 'Esc';
  };

  var isTabEvent = function (evt) {
    return evt.key === 'Tab';
  };

  var makeArray = function (object) {
    return Array.prototype.slice.call(object);
  };

  var attributeSet = {
    'role': 'dialog',
    'aria-modal': true
  };

  var setAttributes = function (element) {
    for (var attribute in attributeSet) {
      if (attributeSet.hasOwnProperty(attribute)) {
        element.setAttribute(attribute, attributeSet[attribute]);
      }
    }
  };

  var resetAttributes = function (element) {
    for (var attribute in attributeSet) {
      if (attributeSet.hasOwnProperty(attribute)) {
        element.removeAttribute(attribute);
      }
    }
  };

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

  var isVisible = function (element) {
    return element.offsetWidth
      || element.offsetHeight
      || element.getClientRects().length
      ? true
      : false;
  };

  var getFocusableChildren = function (element) {
    return makeArray(
        element
            .querySelectorAll(focusableSelectors.join(','))
    ).filter(isVisible);
  };

  var moveFocusIn = function (element) {
    var target = element.querySelector('[autofocus]')
      || getFocusableChildren(element)[0];

    if (target) {
      target.focus();
    }
  };

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

  var onBodyFocus = function (evt, element) {
    var isInDialog = evt.target.closest('[aria-modal="true"]');

    if (!isInDialog) {
      moveFocusIn(element);
    }
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

  var useMethod = function (objectName, method) {
    return function () {
      Object.keys(window[objectName]).forEach(function (key) {
        window[objectName][key][method]();
      });
    };
  };

  // export
  window.utility = {
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
    useMethod: useMethod,
    makeArray: makeArray,
  };
})();

//
// header
//

(function () {
  var UNITS = 'px';

  var header = document.querySelector('.header');

  if (!header) {
    return;
  }

  var isTabEvent = window.utility.isTabEvent;
  var isPreDesktopWidth = window.utility.isPreDesktopWidth;
  var setAttributes = window.utility.setAttributes;
  var resetAttributes = window.utility.resetAttributes;
  var moveFocusIn = window.utility.moveFocusIn;
  var trapTabKey = window.utility.trapTabKey;
  var onBodyFocus = window.utility.onBodyFocus;
  var getCurrentMode = window.utility.getCurrentMode;

  var manageHeader = function () {
    var that = {};

    that.activate = function () {
      var _ = that;

      _.header = header;
      _.burger = _.header.querySelector('.header__burger');
      _.lowerContainer = _.header.querySelector('.header__container--lower');
      _.body = document.body;

      _.header.classList.add('header--js');
      _.isHidden = true;
      _.toggleMargin(getCurrentMode());
      _.burger.addEventListener('click', _.onBurgerClick);
      return that;
    };

    that.toggleMargin = function (currentMode) {
      var nextElementSibling = that.header.nextElementSibling;

      if (!nextElementSibling) {
        return;
      }

      if (currentMode === 'desktop') {
        nextElementSibling.style.marginTop = 0;
      } else {
        var height = that.header.scrollHeight;
        nextElementSibling.style.marginTop = height + UNITS;
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

      _.isHidden = false;
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

      _.isHidden = true;
      _.body.classList.remove('scroll-stop');
      _.header.classList.remove('menu-open');

      _.eraseEventListeners();
    };

    that.onBurgerClick = function () {
      if (that.isHidden) {
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
  headerManager.activate().setAttributes();

  var onWindowResize = (function () {
    var isWorkedOnPreDesktopWidth = false;
    var isWorkedOnDesktopWidth = false;
    var mode = getCurrentMode();
    var currentMode = '';

    return function () {
      currentMode = getCurrentMode();

      if (currentMode !== mode) {
        mode = currentMode;
        headerManager.toggleMargin(currentMode);
      }

      if (currentMode === 'desktop' && !isWorkedOnDesktopWidth) {
        headerManager.resetAttributes().hide();
        isWorkedOnPreDesktopWidth = false;
        isWorkedOnDesktopWidth = true;
        return;
      }

      if (currentMode !== 'desktop' && !isWorkedOnPreDesktopWidth) {
        headerManager.setAttributes();
        isWorkedOnPreDesktopWidth = true;
        isWorkedOnDesktopWidth = false;
      }
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
  var sliderMain = document.querySelector('#slider-main');
  var sliderCatalog = document.querySelector('#slider-catalog');

  if ((!sliderMain && !sliderCatalog) || !window.Swiper) {
    return;
  }

  var getCurrentMode = window.utility.getCurrentMode;
  var makeArray = window.utility.makeArray;

  var manageSlider = function (rootElement) {
    var that = {};

    that.activate = function () {
      var _ = that;

      _.root = rootElement;
      _.inner = _.root.querySelector('.slider__inner');
      _.swiper = _.root.querySelector('.slider__swiper');
      _.pagination = _.root.querySelector('.swiper-pagination');
      _.numbersElement = _.root.querySelector('.slider__numbers');
      _.slides = makeArray(_.root.querySelectorAll('.slider__item'));
      _.frameButtonList = _.root.querySelector('.slider__frame-button-list');

      return _;
    };

    that.saveDivider = function () {
      var _ = that;

      if (_.numbersElement) {
        _.divider = _.numbersElement
            .querySelector('.slider__divider').textContent;
      }

      return _;
    };

    that.normalizeClasses = function () {
      var _ = that;

      _.root.classList.remove('no-js');
      _.swiper.classList.add('swiper');
      _.inner.classList.add('swiper-wrapper');
      _.pagination.classList.remove('hidden-entity');
      _.slides.forEach(function (slide) {
        slide.setAttribute('class', 'swiper-slide');
      });

      [
        _.frameButtonList,
        _.numbersElement
      ].forEach(function (element) {
        if (!element) {
          return;
        }

        element.classList.add('hidden-entity');
      });

      return _;
    };

    that.renderBullet = function (index, className) {
      return '<button class="' + className + ' button" type="button">' + (index + 1) + '</button>';
    };

    that.getPropertySet = function (flag) {
      var mainPropertySet = {
        common: {
          spaceBetween: 30,
          loop: true,
          loopFillGroupWithBlank: true,
          navigation: {
            nextEl: '.slider__arrow--next',
            prevEl: '.slider__arrow--previous',
          },
        },

        desktop: {
          slidesPerView: 4,
          slidesPerGroup: 4,
          pagination: {
            el: '.swiper-pagination',
            clickable: 'true',
            type: 'bullets',
            renderBullet: that.renderBullet,
          },
        },

        tablet: {
          slidesPerView: 2,
          slidesPerGroup: 2,
          pagination: {
            el: '.swiper-pagination',
            clickable: 'true',
            type: 'bullets',
            renderBullet: that.renderBullet,
          },
        },

        mobile: {
          slidesPerView: 2,
          slidesPerGroup: 2,
          pagination: {
            el: '.swiper-pagination',
            clickable: 'true',
            type: 'fraction',
          },
        },
      };

      var catalogPropertySet = {
        common: {
          loop: true,
          pagination: {
            el: '.swiper-pagination',
            clickable: 'true',
            type: 'bullets',
            renderBullet: that.renderBullet,
          },
          navigation: {
            nextEl: '.slider__arrow--forward',
            prevEl: '.slider__arrow--backward',
          },
        },

        desktop: {},
        tablet: {},
        mobile: {},
      };

      return (flag === 'catalog' && catalogPropertySet)
        || (flag === 'main' && mainPropertySet)
        || {};
    };

    that.makeSwiperSettings = function (flag) {
      var isEmpty = true;
      var mode = getCurrentMode();
      var propertySet = that.getPropertySet(flag);

      for (var property in propertySet) {
        if (propertySet.hasOwnProperty(property)) {
          isEmpty = false;
        }
      }

      if (isEmpty) {
        throw Error('ID mismatch');
      }

      if (mode === 'desktop') {
        return Object.assign({}, propertySet.common, propertySet.desktop);
      }

      if (mode === 'tablet') {
        return Object.assign({}, propertySet.common, propertySet.tablet);
      }

      if (mode === 'mobile') {
        return Object.assign({}, propertySet.common, propertySet.mobile);
      }

      throw Error('Mode mismatch');
    };

    that.correctMainPaginaton = function () {
      var _ = that;
      var regex = /^ \/ $/;

      if (getCurrentMode() !== 'mobile') {
        return;
      }

      if (_.pagination.hasChildNodes()) {
        _.pagination.querySelector('.swiper-pagination-current')
            .classList.add('slider__current-set-number');

        _.pagination.querySelector('.swiper-pagination-total')
            .classList.add('slider__slideset-quantity');

        _.pagination.childNodes.forEach(function (child) {
          if (child.nodeType !== 3) {
            return;
          }

          if (regex.test(child.textContent)) {
            child.textContent = _.divider;
          }
        });
      }
    };

    that.buildSwiper = function () {
      var _ = that;
      var flag = null;
      var callback = null;
      var propertySet = null;

      if (_.root.id === 'slider-main') {
        flag = 'main';
        callback = _.correctMainPaginaton;
      }

      if (_.root.id === 'slider-catalog') {
        flag = 'catalog';
      }

      try {
        propertySet = _.makeSwiperSettings(flag);
      } catch (error) {
        return error.message;
      }

      _.swiperInstance = new window.Swiper(_.swiper, propertySet);

      if (callback) {
        callback();
      }

      return that;
    };

    return that;
  };

  var sliderManager = manageSlider(sliderMain || sliderCatalog);
  sliderManager
      .activate()
      .saveDivider()
      .normalizeClasses()
      .buildSwiper();

  var onWindowResize = (function () {
    var mode = getCurrentMode();

    return function () {
      if (mode !== getCurrentMode()) {
        sliderManager.swiperInstance.destroy();
        sliderManager.buildSwiper();
        mode = getCurrentMode();
      }
    };
  })();

  window.addEventListener('resize', onWindowResize);

  var onWindowBeforeunload = function () {
    window.removeEventListener('resize', onWindowResize);
  };

  // export
  window.sliderDestroyer = {
    onWindowBeforeunload: onWindowBeforeunload
  };
})();

//
// accordeon
//

(function () {
  var makeArray = window.utility.makeArray;
  var accordeons = makeArray(document.querySelectorAll('.accordeon'));

  if (!accordeons.length) {
    return;
  }

  var useMethod = window.utility.useMethod;
  window.accordeon = {};

  var initAccordeon = function (rootElement) {
    var that = {};

    that.activate = function () {
      that.root = rootElement;
      that.items = makeArray(that.root.querySelectorAll('.accordeon__item'));
      that.id = that.root.id;

      that.addContentJsStyles();
      return that;
    };

    that.addContentJsStyles = function () {
      that.items.forEach(function (item) {
        that.hideContent(item);
      });
    };

    that.hideContent = function (item) {
      var jsClass = null;
      var isMaterialItem = item.matches('.accordeon__item--material');
      var isProductItem = item.matches('.accordeon__item--product');
      var isPriceItem = item.matches('.accordeon__item--price');

      if (that.id === 'accordeon-main') {
        jsClass = 'accordeon__item--opened';
      }

      if (that.id === 'accordeon-catalog') {
        jsClass = 'accordeon__item--disclosed';
      }

      item.classList.remove(jsClass);

      switch (true) {
        case that.id === 'accordeon-main' && isMaterialItem:
        case that.id === 'accordeon-catalog' && (isProductItem || isPriceItem):
          item.classList.add(jsClass);
          break;

        default:
          break;
      }
    };

    that.onAccordeonClick = function (evt) {
      if (!evt.target.closest('.accordeon__button')) {
        return;
      }

      if (that.id === 'accordeon-main') {
        evt.target
            .closest('.accordeon__item')
            .classList.toggle('accordeon__item--opened');
      }

      if (that.id === 'accordeon-catalog') {
        evt.target
            .closest('.accordeon__item')
            .classList.toggle('accordeon__item--disclosed');
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
  var filter = document.querySelector('.filter');

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
      if (evt.target !== that.inner) {
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
  filterManager.activate().setAttributes();

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

  var makeArray = window.utility.makeArray;

  var filterId = filterCleaner.dataset.for;
  var filter = document.querySelector(filterId);
  var checkboxes = makeArray(filter.querySelectorAll('input[type="checkbox"]'));

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
      if (item.hasAttribute('data-checked')) {
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
  var makeArray = window.utility.makeArray;
  var loginLinks = makeArray(document.querySelectorAll('.login-link'));
  var loginModal = document.querySelector('#modal-login');

  if (!loginLinks.length || !loginModal) {
    return;
  }

  var getCurrentMode = window.utility.getCurrentMode;

  if (window.localStorage) {
    var email = loginModal.querySelector('.login__input--email')
      ? loginModal.querySelector('.login__input--email')
      : null;

    if (email) {
      var name = email.getAttribute('name');
      email.value = localStorage.getItem(name) || email.value;
      email.onkeyup = function () {
        localStorage.setItem(name, email.value);
      };
    }
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

      if (getCurrentMode() === 'desktop') {
        _.body.classList.remove('scroll-stop');
      }

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
      if (evt.target !== that.loginModal) {
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
  loginManager.activate().setAttributes();

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
      if (window[item]) {
        window[item].onWindowBeforeunload();
      }
    });

    window.removeEventListener('beforeunload', onWindowBeforeunload);
  };

  window.addEventListener('beforeunload', onWindowBeforeunload);
})();
