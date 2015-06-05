'use strict';

angular.module('lmisChromeApp').config(function ($stateProvider) {
  $stateProvider.state('takeSurvey', {
    url: '/take-survey?surveyUUID',
    parent: 'root.index',
    templateUrl: '/views/survey/take-survey.html',
    data: {
      label: 'Survey'
    },
    resolve: {
      appConfig: function(appConfigService){
          return appConfigService.getCurrentAppConfig();
        }
    },
    controller: function ($stateParams, $state, $scope, surveyFactory, growl, appConfig, messages, alertFactory) {

      if(!$stateParams.surveyUUID){
        growl.error(messages.surveyNotFound, {persistent: true});
        return;
      }

      //load survey
      $scope.survey = surveyFactory.surveys[$stateParams.surveyUUID];
      $scope.surveyResponse = [];
      $scope.responses = {};

      if(typeof $scope.survey === 'undefined'){
        growl.error(messages.surveyNotFound, {persistent: true});
        return;
      }

      $scope.newValue = function(questionId, newValue){
        $scope.responses[questionId] = newValue;
      };

      $scope.clear = function(){
        $scope.responses = {};
        $scope.surveyResponse = [];
      };

      $scope.save = function () {

        $scope.isSaving = true;

        var surveyResponse = {
          survey: $scope.survey.uuid,
          facility: appConfig.appFacility.uuid,
          respondent: appConfig.contactPerson,
          responses: $scope.responses,
          isComplete: false
        };

        //set survey completed flag
        surveyResponse.isComplete = $scope.survey.questions.length === Object.keys($scope.responses).length;

        if (!surveyResponse.isComplete) {
          $scope.isSaving = false;
          growl.error(messages.incompleteSurveyErrorMsg);
          return;
        }

        surveyFactory.saveSurveyResponse(surveyResponse)
            .then(function (result) {
              if (result) {
                var successMsg = messages.surveySuccessMsg($scope.survey.name);
                alertFactory.success(successMsg);
                $state.go('home.index.home.mainActivity');
                $scope.isSaving = false;
              } else {
                growl.error(messages.surveyFailedMsg);
                $scope.isSaving = false;
              }
            }, function () {
              growl.error(messages.surveyFailedMsg);
              $scope.isSaving = false;
            });
      };

    }
  });
});
