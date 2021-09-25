'use strict';

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
    return Array.from(
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
    useMethod: useMethod
  };
})();
