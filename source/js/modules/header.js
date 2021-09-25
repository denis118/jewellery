'use strict';

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
