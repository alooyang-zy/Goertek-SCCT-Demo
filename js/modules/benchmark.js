// ===== 绩效对比 — 左选项目 · 右选指标 · 中间对比 =====
(function(){
"use strict";

var ALL_INDICATORS = [
  {id:'score',name:'综合评分',unit:'分',icon:'fa-star'},
  {id:'otd',name:'OTD准时率',unit:'%',icon:'fa-truck-fast'},
  {id:'kitRate',name:'齐套率',unit:'%',icon:'fa-check-double'},
  {id:'otsTotal',name:'OTS周期',unit:'天',icon:'fa-clock'},
  {id:'ito',name:'库存周转',unit:'次/月',icon:'fa-arrows-rotate'},
  {id:'costAchieve',name:'成本达成率',unit:'%',icon:'fa-coins'},
  {id:'hiddenCostRate',name:'隐性成本率',unit:'%',icon:'fa-eye-slash'},
  {id:'invAmount',name:'库存金额',unit:'万',icon:'fa-warehouse'},
  {id:'rmDos',name:'原材料周转',unit:'天',icon:'fa-boxes-stacked'},
  {id:'fgDos',name:'成品周转',unit:'天',icon:'fa-store'}
];

function initPage_benchmark(container){
  container = container || document.getElementById('page-benchmark');
  if(!container) return;
  var fp = (typeof getFilteredProjects==='function') ? getFilteredProjects() : (typeof projects!=='undefined'?projects:[]);
  if(!fp.length) return;

  // 选中的项目（最多5个）和选中的指标
  stBmState.selectedPids = fp.slice(0,3).map(function(p){return p.id;});
  stBmState.selectedIndicators = ['score','otd','kitRate','otsTotal'];

  renderBenchmarkLayout(container, fp);
  updateBenchmarkContent(container);
}

var stBmState = {
  selectedPids: [],
  selectedIndicators: []
};

function renderBenchmarkLayout(container, fp){
  container.innerHTML =
    '<div style="display:grid;grid-template-columns:280px 1fr 260px;gap:14px;min-height:calc(100vh - 160px)">'

    // 左侧：项目选择
    + '<div class="chart-card" style="overflow-y:auto">'
    + '<div class="card-header"><h3 style="font-size:14px"><i class="fas fa-folder-tree" style="color:var(--primary)"></i> 选择对比项目</h3></div>'
    + '<div class="card-body" style="padding:8px">'
    + '<div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;padding:0 4px">最多选择5个项目（已选 <span id="bmProjCount" style="font-weight:700;color:var(--primary)">0</span>）</div>'
    + '<div id="bmProjList">' + fp.map(function(p,i){
        var checked = stBmState.selectedPids.indexOf(p.id)>=0 ? 'checked' : '';
        return '<label class="bm-proj-item" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;cursor:pointer;transition:background .15s;margin-bottom:2px" onmouseover="this.style.background=\'var(--primary-bg)\'" onmouseout="this.style.background=\'\'">'
          + '<input type="checkbox" value="'+p.id+'" '+checked+' onchange="window._bmToggleProj(\''+p.id+'\')" style="accent-color:var(--primary);width:16px;height:16px">'
          + '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+p.name+'</div><div style="font-size:10px;color:var(--text-muted)">'+p.bg+' · '+p.customer+'</div></div>'
          + '</label>';
      }).join('') + '</div>'
    + '</div></div>'

    // 中间：对比内容
    + '<div id="bmCenterPanel" style="overflow-y:auto"></div>'

    // 右侧：指标选择
    + '<div class="chart-card" style="overflow-y:auto">'
    + '<div class="card-header"><h3 style="font-size:14px"><i class="fas fa-sliders" style="color:var(--primary)"></i> 选择对比指标</h3></div>'
    + '<div class="card-body" style="padding:8px">'
    + '<div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;padding:0 4px">勾选要对比的指标</div>'
    + '<div id="bmIndList">' + ALL_INDICATORS.map(function(ind){
        var checked = stBmState.selectedIndicators.indexOf(ind.id)>=0 ? 'checked' : '';
        return '<label class="bm-ind-item" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;cursor:pointer;transition:background .15s;margin-bottom:2px" onmouseover="this.style.background=\'var(--primary-bg)\'" onmouseout="this.style.background=\'\'">'
          + '<input type="checkbox" value="'+ind.id+'" '+checked+' onchange="window._bmToggleInd(\''+ind.id+'\')" style="accent-color:var(--primary);width:16px;height:16px">'
          + '<i class="fas '+ind.icon+'" style="color:var(--primary);font-size:12px;width:16px"></i>'
          + '<span style="font-size:12px;font-weight:600;color:var(--text)">'+ind.name+'</span>'
          + '</label>';
      }).join('') + '</div>'
    + '</div></div>'

    + '</div>';

  // 更新已选项目计数
  var countEl = container.querySelector('#bmProjCount');
  if(countEl) countEl.textContent = stBmState.selectedPids.length;

  // 暴露切换函数
  window._bmToggleProj = function(pid){
    var idx = stBmState.selectedPids.indexOf(pid);
    if(idx >= 0){
      stBmState.selectedPids.splice(idx, 1);
    } else {
      if(stBmState.selectedPids.length >= 5){
        alert('最多选择5个项目进行对比');
        // 恢复checkbox
        var cb = container.querySelector('input[value="'+pid+'"]');
        if(cb) cb.checked = false;
        return;
      }
      stBmState.selectedPids.push(pid);
    }
    var c = container.querySelector('#bmProjCount');
    if(c) c.textContent = stBmState.selectedPids.length;
    updateBenchmarkContent(container);
  };

  window._bmToggleInd = function(indId){
    var idx = stBmState.selectedIndicators.indexOf(indId);
    if(idx >= 0){
      if(stBmState.selectedIndicators.length <= 1){
        alert('至少选择1个指标');
        var cb = container.querySelector('input[value="'+indId+'"]');
        if(cb) cb.checked = true;
        return;
      }
      stBmState.selectedIndicators.splice(idx, 1);
    } else {
      stBmState.selectedIndicators.push(indId);
    }
    updateBenchmarkContent(container);
  };
}

function updateBenchmarkContent(container){
  if(!container) container = document.getElementById('page-benchmark');
  if(!container) return;
  var center = container.querySelector('#bmCenterPanel');
  if(!center) return;

  var dsList = [];
  if(window.DS){
    stBmState.selectedPids.forEach(function(pid){ var d = DS.get(pid); if(d) dsList.push(d); });
  }

  if(!dsList.length){
    center.innerHTML = '<div class="chart-card" style="display:grid;place-items:center;min-height:400px"><div style="text-align:center;color:var(--text-muted)"><i class="fas fa-hand-pointer" style="font-size:32px;margin-bottom:10px;display:block"></i>请从左侧选择项目进行对比</div></div>';
    return;
  }

  var selectedInds = ALL_INDICATORS.filter(function(ind){
    return stBmState.selectedIndicators.indexOf(ind.id) >= 0;
  });

  // KPI对比卡片
  var kpiHtml = '<div class="kpi-grid" style="margin-bottom:14px">' + selectedInds.map(function(ind){
    var cards = dsList.map(function(d){
      var v = d[ind.id] !== undefined ? d[ind.id] : '--';
      var health = d.health;
      var color = health==='r' ? 'var(--danger)' : health==='y' ? 'var(--warning)' : 'var(--success)';
      var displayV = typeof v === 'number' ? (v>10000 ? (v/10000).toFixed(1)+'万' : v) : v;
      return '<div style="text-align:center;flex:1"><div style="font-size:10px;color:var(--text-muted);margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+d.proj.name.substring(0,10)+'</div><div style="font-size:20px;font-weight:800;color:'+color+'">'+displayV+'<span style="font-size:11px;color:var(--text-muted)"> '+ind.unit+'</span></div></div>';
    }).join('');
    return '<div class="kpi-card" style="border-top:3px solid var(--primary);padding:12px"><div style="display:flex;align-items:center;gap:6px;margin-bottom:8px"><i class="fas '+ind.icon+'" style="color:var(--primary);font-size:12px"></i><span style="font-size:11px;color:var(--text-sec);font-weight:600">'+ind.name+'</span></div><div style="display:flex;justify-content:space-around;gap:4px">'+cards+'</div></div>';
  }).join('') + '</div>';

  // 雷达图（固定使用SCOR五维）
  var radarHtml = '<div class="chart-row" style="grid-template-columns:1fr 1fr;gap:14px">'
    + '<div class="chart-card"><div class="card-header"><h3 style="font-size:13px"><i class="fas fa-chart-pie" style="color:var(--primary)"></i> SCOR五维雷达对比</h3></div><div class="card-body"><div style="height:300px"><canvas id="bmRadarChart"></canvas></div></div></div>'
    + '<div class="chart-card"><div class="card-header"><h3 style="font-size:13px"><i class="fas fa-chart-line" style="color:var(--primary)"></i> 综合评分趋势对比</h3></div><div class="card-body"><div style="height:300px"><canvas id="bmTrendChart"></canvas></div></div></div>'
    + '</div>';

  // 热力矩阵（选中指标×项目）
  var heatHtml = '<div class="chart-row" style="grid-template-columns:1fr;margin-top:14px">'
    + '<div class="chart-card"><div class="card-header"><h3 style="font-size:13px"><i class="fas fa-table-cells" style="color:var(--primary)"></i> 指标对比矩阵 · 红黄绿灯</h3></div><div class="card-body" style="padding:0;overflow-x:auto"><table class="data-table" id="bmHeatTable"><thead></thead><tbody></tbody></table></div></div>'
    + '</div>';

  center.innerHTML = kpiHtml + radarHtml + heatHtml;

  // 雷达图
  if(window.Chart && dsList.length){
    var radarCtx = container.querySelector('#bmRadarChart');
    if(radarCtx){
      if(App.charts.bmRadar) App.charts.bmRadar.destroy();
      var colors = ['rgba(59,130,246,0.15)','rgba(239,68,68,0.15)','rgba(34,197,94,0.15)','rgba(245,158,11,0.15)','rgba(139,92,246,0.15)'];
      var borderColors = ['rgba(59,130,246,1)','rgba(239,68,68,1)','rgba(34,197,94,1)','rgba(245,158,11,1)','rgba(139,92,246,1)'];
      App.charts.bmRadar = new Chart(radarCtx,{
        type:'radar',
        data:{labels:['可靠①','响应②','成本③','资产④','韧性⑤'],datasets:dsList.map(function(d,i){
          return{label:d.proj.name,data:d.dims,backgroundColor:colors[i%5],borderColor:borderColors[i%5],borderWidth:2,pointRadius:4};
        })},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{size:10,padding:8}}}},scales:{r:{beginAtZero:true,max:100}}}
      });
    }
    // 趋势图
    var trendCtx = container.querySelector('#bmTrendChart');
    if(trendCtx){
      if(App.charts.bmTrend) App.charts.bmTrend.destroy();
      var weeks = Array.from({length:12},function(_,i){return 'W'+(i+1);});
      App.charts.bmTrend = new Chart(trendCtx,{
        type:'line',
        data:{labels:weeks,datasets:dsList.map(function(d,i){
          var base=d.score;
          return{label:d.proj.name,data:Array.from({length:12},function(_,j){return Math.round(base+Math.sin(i*2+j)*5);}),borderColor:borderColors[i%5],backgroundColor:colors[i%5],borderWidth:2,tension:0.3,fill:false};
        })},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{size:10,padding:8}}}}}
      });
    }
  }

  // 热力矩阵
  var heatTable = container.querySelector('#bmHeatTable');
  if(heatTable){
    var inds = selectedInds;
    var thead = '<tr><th>项目</th>'+inds.map(function(i){return'<th style="text-align:center">'+i.name+'</th>';}).join('')+'<th style="text-align:center">健康</th></tr>';
    var tbody = dsList.map(function(d){
      var cells = inds.map(function(ind){
        var v = d[ind.id] !== undefined ? d[ind.id] : 0;
        var st = 'green';
        if(ind.id==='score'||ind.id==='otd'||ind.id==='kitRate'||ind.id==='costAchieve') st = v>=85?'green':v>=70?'amber':'red';
        if(ind.id==='otsTotal'||ind.id==='rmDos'||ind.id==='fgDos') st = v<=30?'green':v<=45?'amber':'red';
        if(ind.id==='hiddenCostRate') st = v<=2?'green':v<=5?'amber':'red';
        if(ind.id==='ito') st = v>=5?'green':v>=3?'amber':'red';
        var bg = st==='red'?'var(--danger-bg)':st==='amber'?'var(--warning-bg)':'var(--success-bg)';
        var color = st==='red'?'var(--danger)':st==='amber'?'var(--warning)':'var(--success)';
        var displayV = typeof v === 'number' ? (v>10000 ? (v/10000).toFixed(0)+'万' : v) : v;
        return '<td style="text-align:center;background:'+bg+';color:'+color+';font-weight:700">'+displayV+'</td>';
      }).join('');
      var hColor = d.health==='r'?'var(--danger)':d.health==='y'?'var(--warning)':'var(--success)';
      var hText = d.health==='r'?'异常':d.health==='y'?'预警':'正常';
      return '<tr><td><strong>'+d.proj.name+'</strong><br><span style="font-size:11px;color:var(--text-muted)">'+d.proj.bg+' · '+d.proj.customer+'</span></td>'+cells+'<td style="text-align:center;color:'+hColor+';font-weight:700">'+hText+'</td></tr>';
    }).join('');
    heatTable.querySelector('thead').innerHTML = thead;
    heatTable.querySelector('tbody').innerHTML = tbody;
  }
}

registerModule('benchmark', initPage_benchmark);
})();
