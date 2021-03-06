'use strict';

angular.module('lmisChromeApp')
    .config(function($stateProvider) {
      $stateProvider
        .state('syncStockCount', {
          parent: 'root.index',
          abstract: true,
          templateUrl: 'views/stock-count/sync.html'
        })
        .state('syncStockCount.detail', {
          data: {
            label: 'Sync stock count'
          },
          url: '/sync-stock-count',
          resolve: {
            localDocs: function(pouchDB) {
              var db = pouchDB('stock-count');
              // XXX: db#info returns incorrect doc_count, see item:333
              return db.allDocs();
            }
          },
          views: {
            'stats': {
              templateUrl: 'views/stock-count/sync/stats.html',
              controller: function($q, $log, $scope, messages, config, pouchDB, localDocs, growl, ehaRetriable) {
                var dbName = 'stock-count',
                    remote = config.api.url + '/' + dbName;

                var updateCounts = ehaRetriable(function() {
                  $scope.local = {
                    // jshint camelcase: false
                    doc_count: localDocs.total_rows
                  };

                  $scope.remoteSyncing = true;
                  var _remote = pouchDB(remote);
                  _remote.info()
                    .then(function(info) {
                      $scope.remote = info;
                      $scope.remoteSyncing = false;
                    })
                    .catch(function(reason) {
                      $log.error(reason);
                    });
                });

                updateCounts();

                var sync = ehaRetriable(function(source) {
                  var deferred = $q.defer();
                  growl.info(messages.syncing(source.label));
                  $scope.syncing = true;
                  var cb = {
                    error: function(err) {
                      deferred.reject(err);
                    },
                    complete: function() {
                      $scope.syncing = false;
                      growl.success(messages.syncSuccess(source.label));
                      deferred.resolve();
                    }
                  };
                  var db = pouchDB(source.from);
                  db.replicate.to(source.to, cb);
                  return deferred.promise;
                });

                $scope.sync = function() {
                  var promises = [
                    sync({
                      from: dbName,
                      to: remote,
                      label: messages.local
                    }),
                    sync({
                      from: remote,
                      to: dbName,
                      label: messages.remote
                    }),
                  ];

                  $q.all(promises)
                    .then(function() {
                      updateCounts();
                    });
                };
              }
            },
            'status': {
              templateUrl: 'views/stock-count/sync/status.html',
              controller: function($log, $scope, localDocs, config, pouchDB) {
                $scope.locals = localDocs.rows.map(function(local) {
                  return local.id;
                });

                $scope.compare = function() {
                  $scope.syncing = true;
                  var remote = pouchDB(config.api.url + '/stock-count');
                  remote.allDocs()
                    .then(function(remotes) {
                      remotes = remotes.rows.map(function(remote) {
                        return remote.id;
                      });
                      $scope.synced = [];
                      $scope.unsynced = {
                        local: [],
                        remote: []
                      };

                      for (var i = 0, len = $scope.locals.length; i < len; i++) {
                        if(remotes.indexOf($scope.locals[i]) !== -1) {
                          $scope.synced.push($scope.locals[i]);
                        }
                        else {
                          $scope.unsynced.local.push($scope.locals[i]);
                        }
                      }

                      for (var j = remotes.length - 1; j >= 0; j--) {
                        if($scope.locals.indexOf(remotes[j]) === -1) {
                          $scope.unsynced.remote.push(remotes[j]);
                        }
                      }
                    })
                    .catch(function(reason) {
                      $log.error(reason);
                    })
                    .finally(function() {
                      $scope.syncing = false;
                    });
                };
              }
            }
          }
        });
    });
