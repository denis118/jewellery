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
        this.togglePadding();
        this.burger.addEventListener('click', this.onBurgerClick);

        return this;
      };

      that.togglePadding = function () {
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
              main.style.paddingTop = height + UNITS;
            }

            break;

          case false:
            if (nextSibling && main && Object.is(nextSibling, main)) {
              main.style.paddingTop = 0;
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

        headerManager.togglePadding();
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
