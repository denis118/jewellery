'use strict';

//
// accordeon
//

(function () {
  var accordeons = Array.from(document.querySelectorAll('.accordeon'));

  if (!accordeons.length) {
    return;
  }

  var useMethod = window.utility.useMethod;
  window.accordeon = {};

  var initAccordeon = function (rootElement) {
    var that = {};

    that.activate = function () {
      that.root = rootElement;
      that.items = Array.from(that.root.querySelectorAll('.accordeon__item'));
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
