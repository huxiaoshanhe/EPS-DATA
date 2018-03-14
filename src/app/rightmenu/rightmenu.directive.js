(function() {
  'use strict';
  // 右键菜单指令, 通过右键服务控制

  angular
    .module('pf.condition')
    .directive('rightmenu', rightmenuDirective);

  function rightmenuDirective() {
    return {
      replace: true,
      controller: RightMenuCtrl,
      templateUrl: 'app/rightmenu/rightmenu.html',
      link: function(scope, element, attr, ctrl) {
        // 监听属性变化
        scope.$watch('property', function(property) {
          if (property) {
            var css = {
              'top': property.top,
              'left': property.left,
              'display': property.show === true ? 'block' : 'none'
            };
            element.css(css);
          }
        }, true);

        $(window).mouseup(function() {
          ctrl.hide();
          scope.$digest();
        });
      }
    };
  }

  RightMenuCtrl.$inject = ['$scope', 'rightmenuService', 'coreCF'];
  function RightMenuCtrl($scope, rightmenuService, config) {
    var _spk = config.spreadKey;
    var that = this;
    that.hide = rightmenuService.hide;

    $scope.property = {show: false};
    rightmenuService.register($scope);

    // 点击接口
    $scope.click = function(key,e) {
      if (key) { rightmenuService.click(key); }
      e.stopPropagation();
    };

    // 监听创建
    $scope.$on('createRightMenu', function(e, data) {
      $scope.data = data;
    });

    // 监听属性変更通知, 更改属性
    $scope.$on(_spk.toggleRightMenu, function(e, property) {
      $scope.property = property;
    });
  }

})();