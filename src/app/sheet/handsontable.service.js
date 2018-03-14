(function() {
  'use strict';
  // handsontable指令服务, 我觉得渲染可能要一个中间的协调者

  angular
    .module('pf.workbook')
    .factory('handsontableService', handsontableService);

  handsontableService.$inject = ['workbookService','$rootScope','coreCF'];
  function handsontableService(workbookService,$rootScope,config) {
    var _hd = null; // 没有人说抱歉
    var _table = null;
    var _hoverIcon = null; // 唯一激活判断
    var _pive = { // 中转私有
      rmcodes: [],
      afterSelectionEndCallback: [] // 选中结束鼠标抬起回调数组
    };
    var fixeNum = {};
    var _settings = { // 默认参数
      manualRowResize: true, // 调整大小
      manualColumnResize: true, // 调整大小
      outsideClickDeselects: false, // 点击不去掉选中
      //rowHeaders: true,
      colHeaders: true,
    };
    var service = {
      'trtb': function() { return _table; },
      'settings': createSettings,
      'adjustFloatSize': adjustFloatSize,
      'addSelectedAreaCalc':addSelectedAreaCalc,
      'addAfterSelectionEnd': addAfterSelectionEndCallback,
      'addSelectedAreaStyle':addSelectedAreaStyle,
      'getSelected':getSelected,
      'getAreaCood': getAreaCood,
      'routineMode':routineMode,
      'moneyStyle':moneyStyle,
      'setHandsontable': function(handsontable){ _hd = handsontable; },
      'getFixedNum':function() {return fixeNum;}
    };
    return service;

    /**
     * 根据表格类创建handsontable配置对象
     * @param  {Table} table 表格类
     * @return {Object} handsontable配置
     */
    function createSettings(table) {
      _table = table;
      fixeNum = {top:table.fixedRowsTop,left:table.fixedColumnsLeft};
      var colWidths = getColWidths(table.data,table.fixedColumnsLeft);
      var settings = {
        data: table.data,
        mergeCells: table.mergeCells,
        fixedRowsTop: table.fixedRowsTop,
        fixedColumnsLeft: table.fixedColumnsLeft,
        colWidths:table.tdWidth,
        cells: function(row, col, prop) {
          var cellProperties = {};
          cellProperties.readOnly = true;
          cellProperties.renderer = PolicemenRenderer;
          return cellProperties;
        },
        afterSelectionEnd: function(r, c, r2, c2) {
          var cbary = _pive.afterSelectionEndCallback;
          for (var i = 0, ilen = cbary.length; i < ilen; i++) { cbary[i](r, c, r2, c2); }
        }
      };
      return angular.extend(_settings, settings);
    }

    /**
     * 获取搜选中的单元格坐标
     * @returns []
     */
    function getSelected() {
      var area = null;
      area = _hd.getSelected();
      if(!area) {
        var a1 = _table.fixedRowsTop;
        var a2 = _table.fixedColumnsLeft;
        var a3 = _table.data.length-1;
        var a4 = _table.data[0].length-1;
        area = [a1,a2,a3,a4];
      }
      return area;
    }

    /**
     * 调节小数点的位数
     * @param  {Number} direction -1 左 1 右
     */
    function adjustFloatSize(direction) {
      addSelectedAreaCalc({percent:false});
      if(direction==0) {
        _table.floatNum = 2;
      } else {
        var value = _table.floatNum + direction;
        if (value >= 0&&value<9) { 
          _table.floatNum = value;
        }
      }      
      _hd.render();
    }

    function routineMode(flag) {
      if(flag) {
        _table.floatNum = 0;
      } else {
        _table.floatNum = 2;
      }
      _hd.render();
    }

    function moneyStyle(flag) {
      _table.moneyStyle = flag;
      _hd.render();
    }



    /**
     * 添加选中事件回调函数
     * @param {Function} callback 回调方法
     */
    function addAfterSelectionEndCallback(callback) {
      if (angular.isFunction(callback)) {
        _pive.afterSelectionEndCallback.push(callback);
      }
    }

    

    /**
     * 为选中的区域添加计算的数据
     * @param {Object} calc 计算方法标示
     */
    function addSelectedAreaCalc(calc) {
      var area = [];
      var a1 = _table.fixedRowsTop;
      var a2 = _table.fixedColumnsLeft;
      var a3 = _table.data.length-1;
      var a4 = _table.data[0].length-1;
      area = [a1,a2,a3,a4];
      getAreaCood(area[0], area[1], area[2], area[3], function(r, c){
        if (_table.special[r] && _table.special[r][c] && _table.special[r][c].calc) {
          calc = angular.extend({}, _table.special[r][c].calc, calc);
        }
        _table.addCellSpecial(r, c, {'calc': calc});
      });
      _hd.render();
    }


    

    /***表格渲染***/
    function PolicemenRenderer(instance, td, row, col, prop, value, properties) {
      var that = this;
      var fs = (new Array(_table.floatNum + 1)+'').replace(/,/g, '0');
      if (fs) { fs = '.' + fs; }
      properties.format = '0,0' + fs;
      if((typeof value)=='number'&&config.basicCtrl.moneyStyle) {
        properties.format = '$0,0' + fs;
      }
      if((typeof value)=='number'&&config.basicCtrl.percentStyle) {
        properties.format = '0,0' + fs+'%';
      }
      
        
      window.Handsontable.renderers.NumericRenderer.apply(this, arguments);
      if (_table.special[row] && _table.special[row][col]) {
        var colSpecial = _table.special[row][col];
        properties['mydata'] = colSpecial;
        switch(colSpecial.type) {
          case 'indicator': 
          case 'region':         
          case 'industry': 
          case 'classify':
          case 'country':
          case 'commodity':
          case 'booth':
          case 'entnature':
          case 'market':
          case 'sex':
          IndicatorRenderer.apply(that, arguments);
          break;
          case 'time':
          TimeRenderer.apply(that, arguments);
          break;
          default:
          break;
        }
        if (colSpecial.style) { StyleRenderer.apply(that, arguments); }
        if (colSpecial.calc) { CalcRenderer.apply(that, arguments); }
      }
      RowRenderer.apply(this, arguments);      
    }

    function RowRenderer(instance, td, row, col) {
      //偶数行白色相间
      if (row % 2 !== 0) {
        if(col<_table.fixedColumnsLeft) {
          td.style.backgroundColor = '#fff';
        }
      }
      if(config.cubeId==1115) {
        $(td).css('max-width','150px');
      }
      //
      if(row<_table.fixedRowsTop) {//头部固定栏单元格居中，并添加下边框
        $(td).css('text-align','center').css('border-bottom','1px solid #134f7a');
      }
      var bgColor = _table.conStyles[row][col].bgColor;
      var conIcon = _table.conStyles[row][col].icon;
      var fontStyles = _table.fontStyles[row][col].fontStyle;
      /*var showFontStyles = _table.showFontStyles[row][col].fontStyle;
      var fontStyles8020 = _table.fontStyles8020[row][col].fontStyle;*/
      if(bgColor) {//添加条件样式背景
        $(td).css('background',bgColor);
      }
      if(conIcon) {//添加条件样式数据分段图表
        var con_icon = $('<i class="icon-constyle icon-'+conIcon+'"></i>');
        $(td).prepend(con_icon);
      }
      if(fontStyles) {
        $(td).css(fontStyles);
      }
      /*if(showFontStyles) {
        $(td).css(showFontStyles);
      }
      if(fontStyles8020) {
        $(td).css(fontStyles8020);
      }*/      
      
      if(row == _table.fixedRowsTop-1) {//添加排序图表
        if(col>=_table.fixedColumnsLeft) {
          var icon = $('<i class="icon-btn icon-sort"></i>');
          if(col===config.sorts.index) {
            icon.addClass('current');
            if(config.sorts.type==='gt') {
              icon.addClass('gt');
            } else if(config.sorts.type==='lt') {
              icon.addClass('lt');
            }
          }
          
          icon.click(function() {
            if(config.sorts.type==='gt') {
              workbookService.sort(col,'lt');
            } else if(config.sorts.type==='lt') {
              workbookService.sort('','');
            } else {
              workbookService.sort(col,'gt');
            }
          });
          $(td).css('height','40px').css('text-align','center');
          icon.appendTo($(td));
        }        
      }
    }

    function IndicatorRenderer(instance, td) {
      window.Handsontable.renderers.HtmlRenderer.apply(this, arguments);
      if ($(td).children('.icon-btn').length) { return td; }
      var code = arguments[6]['mydata'].code;
      var type = arguments[6]['mydata'].type;
      var icon = $('<i class="icon-btn icon-info"></i>');
      icon.appendTo($(td)).click(function(e) {
        $rootScope.$emit('showWindow',true);
        $rootScope.$broadcast('showInfomation',{type:type,code:code});
      }).mousedown(function(e) {
        e.stopPropagation();
      });
    }
    function TimeRenderer(instance, td){
      var value = null;
      var string = $(td).text();
      if(string.indexOf(',')!==-1) {
        value = parseInt(string.replace(/,/g, ''));
      } else {
        value = string;
      }
      var result = value.toString();
      $(td).text(result);
    }

    // 计算渲染器
    function CalcRenderer(instance, td, row, col, prop, value) {
      var calc = arguments[6]['mydata'].calc;
      if (!value || isNaN(value)) { return; }
      if (calc.e === true) { value = Math.log(value); }
      if (calc.percent === true) {
        //value = value * 100;
        arguments[6].format = '0,0%';
      }
      arguments[5] = value;
      window.Handsontable.renderers.NumericRenderer.apply(this, arguments); // 数字格式化
    }


    /**
     * 获取一个区域的坐标, 提供每个点的回调, 不分开始结束
     * @param  {Object}   start 起点
     * @param  {Object}   end 终点
     * @param  {Function} callback 回调
     */
    function getAreaCood(r1, c1, r2, c2, callback) {
      var start = {row:r1, col:c1}, end = {row:r2, col:c2};
      for(var r = (start.row < end.row ? start.row : end.row),
           rlen = r + Math.abs(start.row - end.row); r <= rlen; r++) {
        for(var c = (start.col < end.col ? start.col : end.col),
             clen = c + Math.abs(start.col - end.col); c<=clen; c++) {
          var pop = callback(r, c);
          if (pop === false) { return; } // 出口, 查找不希望都找一遍
        }
      }
    }

    function StyleRenderer(instance, td) {
      var style = arguments[6]['mydata'].style;
      angular.forEach(style, function(val, key) {
        if (key === 'font-size' && val .indexOf('px') === -1) { val += 'px'; }
        td.style[key] = val;
      });
    }

    /**
     * 对选中的区域添加样式
     * @param {Object} style
     */
    function addSelectedAreaStyle(style) {
      var area = _hd.getSelected();
      if (!area) { return; }

      var syList = tableService.getTempRecord('syList') || {};
      getAreaCood(area[0], area[1], area[2], area[3], function(r, c){
        var cellId = _table.getCellId(r, c);
        syList[cellId] = angular.extend(syList[cellId] || {}, style);
      });

      tableService.setTempRecord('syList', syList);
      pushCellStyleSpecial();
      _hd.render();
    }

    /**
     * 填入单元格样式特殊定义
     * @return {[type]} [description]
     */
    function pushCellStyleSpecial() {
      var syList = tableService.getTempRecord('syList');
      angular.forEach(syList, function(style, id) {
        // 后台id无法定位问题, 日, 只有在计算时才能保存已定义样式.
        var coor = _table.getCellCoor(id);
        if (coor) {
          coor = coor.split(',');
          _table.addCellSpecial(coor[0], coor[1], {'style': style});
        }
      });
    }



    function getColWidths(data,num) {
      var arr = [];
      angular.forEach(data[0],function(value,key) {
        if(key<num) {
          arr.push(200);
        } else {
          arr.push(80);
        }        
      });
      return arr;
    }

    /*function getData(data) {
      var arr = [];
      angular.forEach(data,function(value,key) {
        if(key>0) {
          arr.push(value);
        }
      });
      return arr;
    }*/


    
  }

})();