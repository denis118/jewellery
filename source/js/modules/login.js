'use strict';

//
// login
//

(function () {
  var loginLinks = Array.from(document.querySelectorAll('.login-link'));
  var loginModal = document.querySelector('#modal-login');

  if (!loginLinks.length || !loginModal) {
    return;
  }

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
