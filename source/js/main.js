'use strict';

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
