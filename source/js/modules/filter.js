'use strict';

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
