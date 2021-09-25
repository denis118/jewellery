'use strict';

//
// slider
//

(function () {
  var START_INDEX = 0;
  var DESKTOP_SLIDES_AMOUNT = 4;
  var PREDESKTOP_SLIDES_AMOUNT = 2;
  var IGNORED_SWIPE_DISTANCE = 30;

  var sliders = Array.from(document.querySelectorAll('#slider-main'));

  if (!sliders.length) {
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
      if (isPreTabletWidth()) {
        that.defineCurrentSetNumber();
      } else {
        that.highlightNumber();
      }
    };

    that.showNextSlideSet = function (previous) {
      var _ = that;

      _.slideSets[_.slideSetIndex].forEach(function (slide) {
        slide.classList.add('hidden-entity');
      });

      if (previous) {
        _.slideSetIndex = (_.slideSetIndex - 1) % _.slideSets.length;

        if (_.slideSetIndex < 0) {
          _.slideSetIndex += _.slideSets.length;
        }
      } else {
        _.slideSetIndex = (_.slideSetIndex + 1) % _.slideSets.length;
      }

      _.slideSets[_.slideSetIndex].forEach(function (slide) {
        slide.classList.remove('hidden-entity');
      });

      _.specifyActiveSetIndex();
      _.manageNumbers();
    };

    that.onArrowClick = function (evt) {
      if (evt.target.closest('.slider__arrow--previous')) {
        that.showNextSlideSet(true);
      }

      if (evt.target.closest('.slider__arrow--next')) {
        that.showNextSlideSet();
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
      if (evt.target.closest('.slider__arrow')) {
        that.onArrowClick(evt);
      }

      if (evt.target.matches('.slider__frame-button')) {
        that.onNumbersClick(evt);
      }
    };

    that.onSliderPointerup = function (evt) {
      if (evt.pointerType === 'mouse' || evt.pointerType === 'touch') {
        that.processMouse(evt);
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

      if (currentMode !== 'desktop') {
        manageNumbers();
      }

      if (currentMode === 'desktop' && !isWorkedOnDesktopWidth && !firstLoading) {
        rebuild();
        isWorkedOnPreDesktopWidth = false;
        isWorkedOnDesktopWidth = true;
        return;
      }

      if (currentMode !== 'desktop' && !isWorkedOnPreDesktopWidth && !firstLoading) {
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
