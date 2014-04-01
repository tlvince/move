'use strict';

angular.module('stockCountMocks', [])
  .value('stockData', [
    {
      confirmation: {},
      day: 11,
      facility: 'd48a39fb-6d37-4472-9983-bc0720403719',
      month: '03',
      used_opened: {
        '0': 20,
        '1': 200,
        '2': 9949,
        '3': 98943,
        '4': 112,
        '5': 1223,
        '6': 1000,
        '7': 234,
        '8': 998,
        '9': 2333,
        '10': 234,
        '11': 12233,
        '12': 22334
      },
      used_unopened: {
        '0': 233,
        '1': 1223,
        '2': 993,
        '3': 999,
        '4': 223,
        '5': 233,
        '6': 233,
        '7': 234,
        '8': 999,
        '9': 2234,
        '10': 1233,
        '11': 2334,
        '12': 23
      },
      year: 2014
    }
  ])
  .value('$window', {
    chrome: {
      storage: {
        local: {
          get: function() {},
          set: function() {},
          clear: function() {},
          remove: function() {}
        }
      },
      i18n: {
        getMessage: function() {}
      }
    }
  });
