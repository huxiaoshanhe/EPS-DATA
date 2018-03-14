(function() {
  'use strict';

  angular
    .module('pf.workbook')
    .controller('SheetCtrl', SheetCtrl);

  SheetCtrl.$inject = ['$rootScope', '$scope', 'coreCF', 'dataService'];
  function SheetCtrl($rootScope, $scope, config, dataService) {
   	var that = this;
    that.sheet='';
    $rootScope.$on('workbook',function(event,data) {
    	that.sheet = data;
      $rootScope.loading=false;
    });
  }

})();