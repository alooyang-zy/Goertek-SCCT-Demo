// Module: forecast — 需求预测模型 v8.0 (单项目·四维联动·准确率/波动率/基线预测)
(function(){

// ═══════════════ 数据生成 ═══════════════
var _fcCache = {};
function getForecastData(pid){
  if(_fcCache[pid]) return _fcCache[pid];
  var p = projects.find(function(x){return x.id===pid;});
  if(!p){ _fcCache[pid]={history:[],forecast:[],weekly:[]}; return _fcCache[pid]; }
  var seed = parseInt(pid.replace(/\D/g,'')||'1');
  function rng(){seed=(seed*9301+49297)%233280;return seed/233280;}

  // 生成24周数据: 前12周有实际值, 后12周是预测
  var baseVolume = Math.floor(p.volume / 4); // 周均
  var history = [];
  var actuals = [];
  var forecasts = [];
  var baselines = [];

  for(var w=0;w<24;w++){
    var weekNum = 14+w;
    // 基线预测 (平滑历史均值)
    var baseVal = Math.floor(baseVolume * (0.85+rng()*0.3));
    baselines.push(baseVal);

    if(w<12){
      // 有实际值
      var actual = Math.floor(baseVal * (0.8+rng()*0.4));
      actuals.push(actual);
      history.push({week:'W'+weekNum,weekNum:weekNum,actual:actual,forecast:null,baseline:baseVal});
    } else {
      // 未来预测
      var custFc = Math.floor(baseVal * (0.7+rng()*0.6));
      forecasts.push({week:'W'+weekNum,weekNum:weekNum,actual:null,forecast:custFc,baseline:baseVal});
    }
  }

  // 计算准确率和偏差
  var accuracy = 0, bias = 0, mape = 0, cv = 0;
  if(actuals.length){
    // 用前12周实际和基线算准确率
    var sumAbsErr = 0, sumErr = 0, sumAct = 0;
    actuals.forEach(function(a,i){
      var b = baselines[i];
      sumAbsErr += Math.abs(a-b);
      sumErr += (a-b);
      sumAct += a;
    });
    accuracy = Math.round((1 - sumAbsErr/sumAct)*1000)/10;
    if(accuracy>100) accuracy = 100;
    if(accuracy<50) accuracy = 50+rng()*20;
    accuracy = Math.round(accuracy*10)/10;
    bias = Math.round((sumErr/sumAct)*1000)/10;
    mape = Math.round((sumAbsErr/sumAct)*1000)/10;
    // CV
    var mean = sumAct/actuals.length;
    var sumSq = actuals.reduce(function(s,a){return s+Math.pow(a-mean,2);},0);
    cv = Math.round(Math.sqrt(sumSq/actuals.length)/mean*1000)/10;
  }

  // 预测特征
  var features = [];
  if(bias>5) features.push({name:'偏乐观',desc:'客户预测偏高',cls:'red'});
  else if(bias<-5) features.push({name:'偏保守',desc:'客户预测偏低',cls:'blue'});
  else features.push({name:'较准确',desc:'预测偏差小',cls:'green'});
  if(cv>30) features.push({name:'高波动',desc:'CV>'+cv.toFixed(1)+'%',cls:'amber'});
  else if(cv>15) features.push({name:'中波动',desc:'CV>'+cv.toFixed(1)+'%',cls:'blue'});
  else features.push({name:'稳定',desc:'CV<15%',cls:'green'});
  if(accuracy>90) features.push({name:'高准确率',desc:'准确率>'+accuracy+'%',cls:'green'});
  else if(accuracy<75) features.push({name:'低准确率',desc:'准确率<75%',cls:'red'});

  // 周度明细
  var weekly = [];
  for(w=0;w<12;w++){
    var a = actuals[w];
    var b = baselines[w];
    var dev = a?Math.round((a-b)/b*1000)/10:0;
    weekly.push({
      week:'W'+(14+w),
      actual:a,
      baseline:b,
      deviation:dev,
      accuracy:a?Math.round((1-Math.abs(a-b)/a)*1000)/10:0
    });
  }
  // 未来12周
  for(w=0;w<12;w++){
    var f = forecasts[w];
    var b2 = baselines[12+w];
    var dev2 = Math.round((f.forecast-b2)/b2*1000)/10;
    weekly.push({
      week:f.week,
      actual:null,
      baseline:b2,
      custForecast:f.forecast,
      deviation:dev2,
      accuracy:null
    });
  }

  _fcCache[pid] = {
    history: history,
    forecasts: forecasts,
    actuals: actuals,
    baselines: baselines,
    weekly: weekly,
    accuracy: accuracy,
    bias: bias,
    mape: mape,
    cv: cv,
    features: features,
    rollingWeeks: 13,
    totalActual: actuals.reduce(function(s,a){return s+a;},0),
    totalBaseline: baselines.slice(0,12).reduce(function(s,b){return s+b;},0)
  };
  return _fcCache[pid];
}

// ═══════════════ 渲染 ═══════════════
function initPage_forecast(){
  try{
  var fp = getFilteredProjects();
  var sel = document.getElementById('forecastProjectSelect');
  if(sel) fillProjectSelect(sel, fp);
  var pid = sel ? sel.value : '';
  var p = pid ? projects.find(function(x){return x.id===pid;}) : null;
  if(!p && fp.length){ p=fp[0]; pid=p.id; if(sel) sel.value=pid; }
  if(!p) return;

  var data = getForecastData(pid);

  // 项目信息
  var info = document.getElementById('fcInfoBar');
  if(info) info.innerHTML =
    '<span class="fc-info-name">'+p.name+'</span>'
    +'<span class="fc-info-items">'
    +'<span class="fc-info-item"><b>客户</b> '+p.customer+'</span>'
    +'<span class="fc-info-item"><b>产品线</b> '+p.productLine+'</span>'
    +'<span class="fc-info-item"><b>生命周期</b> '+p.lifecycle+'</span>'
    +'<span class="fc-info-item"><b>滚动预测</b> 13周</span>'
    +'</span>';

  // KPI
  var kg = document.getElementById('fcCards');
  if(kg) kg.innerHTML = [
    {label:'预测准确率',value:data.accuracy+'%',sub:'FA = 1-MAPE',accent:data.accuracy>=90?'green':data.accuracy>=80?'amber':'red'},
    {label:'波动率 CV',value:data.cv+'%',sub:'变异系数',accent:data.cv>30?'red':data.cv>15?'amber':'green'},
    {label:'MAPE',value:data.mape+'%',sub:'平均绝对百分误差',accent:data.mape<10?'green':data.mape<20?'amber':'red'},
    {label:'预测偏差',value:(data.bias>0?'+':'')+data.bias+'%',sub:data.bias>5?'客户偏乐观':data.bias<-5?'客户偏保守':'偏差可控',accent:Math.abs(data.bias)>10?'red':Math.abs(data.bias)>5?'amber':'green'},
    {label:'滚动周期',value:data.rollingWeeks+'周',sub:'预测窗口',accent:'blue'},
    {label:'预测判定',value:data.features[0]?data.features[0].name:'-',sub:data.features[0]?data.features[0].desc:'',accent:data.features[0]?data.features[0].cls:'blue'},
  ].map(function(k){return '<div class="fc-card"><div class="fc-card-accent '+k.accent+'"></div><div class="fc-card-label">'+k.label+'</div><div class="fc-card-value">'+k.value+'</div><div class="fc-card-sub">'+k.sub+'</div></div>';}).join('');

  // 预测趋势图
  renderTrendChart(data);

  // 预测判定 & 客户对比
  renderJudgePanel(data);

  // 周度明细表
  renderTable(data);

  }catch(e){console.error('forecast init error:',e);}
}

function renderTrendChart(data){
  try{
  var ctx = document.getElementById('fcBaselineChart');
  if(!ctx) return;
  if(App.charts.fcBaseline){App.charts.fcBaseline.destroy();App.charts.fcBaseline=null;}
  var labels = data.weekly.map(function(w){return w.week;});
  App.charts.fcBaseline = new Chart(ctx,{
    type:'line',
    data:{
      labels:labels,
      datasets:[
        {label:'实际值',data:data.weekly.map(function(w){return w.actual;}),borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,0.1)',borderWidth:2,pointRadius:3,tension:0.3,fill:true},
        {label:'基线预测',data:data.weekly.map(function(w){return w.baseline;}),borderColor:'#16a34a',backgroundColor:'rgba(22,163,74,0.05)',borderWidth:2,borderDash:[5,3],pointRadius:2,tension:0.3,fill:false},
        {label:'客户预测',data:data.weekly.map(function(w){return w.custForecast||null;}),borderColor:'#f59e0b',backgroundColor:'rgba(245,158,11,0.05)',borderWidth:2,borderDash:[2,2],pointRadius:3,pointStyle:'triangle',tension:0.3,fill:false}
      ]
    },
    options:{
      responsive:false,maintainAspectRatio:false,
      plugins:{legend:{position:'top',labels:{usePointStyle:true,font:{size:11}}}},
      scales:{y:{grid:{color:'#f1f5f9'},title:{display:true,text:'数量'}},x:{grid:{display:false}}}
    }
  });

  // Second chart: accuracy per week
  var ctx2 = document.getElementById('fcAccuracyChart');
  if(ctx2){
    if(App.charts.fcAccuracy){App.charts.fcAccuracy.destroy();App.charts.fcAccuracy=null;}
    App.charts.fcAccuracy = new Chart(ctx2,{
      type:'bar',
      data:{
        labels:labels.slice(0,12),
        datasets:[
          {label:'周准确率',data:data.weekly.slice(0,12).map(function(w){return w.accuracy||0;}),backgroundColor:data.weekly.slice(0,12).map(function(w){var a=w.accuracy||0;return a>=90?'rgba(34,197,94,0.7)':a>=80?'rgba(234,179,8,0.7)':'rgba(239,68,68,0.7)';}),borderRadius:4}
        ]
      },
      options:{
        responsive:false,maintainAspectRatio:false,
        plugins:{legend:{display:false}},
        scales:{y:{min:0,max:100,grid:{color:'#f1f5f9'},title:{display:true,text:'准确率%'}},x:{grid:{display:false}}}
      }
    });
  }
  }catch(e){console.error('fc chart error:',e);}
}

function renderJudgePanel(data){
  var el = document.getElementById('fcJudgePanel');
  if(!el) return;
  
  // Part 1: feature tags
  var part1 = '<div class="fc-judge-title">预测判定</div><div class="fc-judge-grid">'+data.features.map(function(f){
    return '<div class="fc-judge-card"><div class="fc-judge-card-title"><span class="x-pill '+f.cls+'">'+f.name+'</span></div><div class="fc-judge-card-body">'+f.desc+'</div></div>';
  }).join('')+'</div>';
  
  // Part 2: comparison cards
  var futureWeeks = data.forecasts.slice(0,8);
  var part2 = futureWeeks.length>0
    ?'<div class="fc-judge-title" style="margin-top:12px">客户预测 vs 基线 · 未来8周</div><div class="fc-judge-grid">'+futureWeeks.map(function(f){
      var diff = f.forecast - f.baseline;
      var pct = Math.round(diff/f.baseline*100);
      var judge = diff>0?'客户偏乐观':'客户偏保守';
      var judgeCls = Math.abs(pct)>20?'red':Math.abs(pct)>10?'amber':'green';
      return '<div class="fc-judge-card">'
        +'<div class="fc-judge-card-title"><span>'+f.week+'</span><span class="x-pill '+judgeCls+'">'+judge+'</span></div>'
        +'<div class="fc-judge-card-body">'
        +'<div>基线 <b>'+f.baseline.toLocaleString()+'</b> · 客户 <b>'+f.forecast.toLocaleString()+'</b></div>'
        +'<div>差异 <b style="color:'+(diff>0?'var(--danger)':'var(--primary-light)')+'">'+(diff>0?'+':'')+diff.toLocaleString()+' ('+pct+'%)</b></div>'
        +'</div></div>';
    }).join('')+'</div>'
    :'';
  
  el.innerHTML = part1 + part2;
}

function renderTable(data){
  var thead = document.getElementById('fcTHead');
  var tbody = document.getElementById('fcTBody');
  if(!thead||!tbody) return;
  thead.innerHTML = '<tr><th>周次</th><th>实际值</th><th>基线预测</th><th>客户预测</th><th>偏差%</th><th>准确率%</th><th>区间</th></tr>';
  tbody.innerHTML = data.weekly.map(function(w){
    var isFuture = w.actual===null;
    var devColor = Math.abs(w.deviation)>20?'var(--danger)':Math.abs(w.deviation)>10?'var(--warning)':'var(--success)';
    var accColor = w.accuracy===null?'var(--text-muted)':w.accuracy>=90?'var(--success)':w.accuracy>=80?'var(--warning)':'var(--danger)';
    return '<tr style="'+(isFuture?'background:#fefce8;':'')+'">'
      +'<td><strong>'+w.week+'</strong></td>'
      +'<td>'+(w.actual!==null?w.actual.toLocaleString():'<span style="color:var(--text-muted)">-</span>')+'</td>'
      +'<td>'+w.baseline.toLocaleString()+'</td>'
      +'<td>'+(w.custForecast?w.custForecast.toLocaleString():'<span style="color:var(--text-muted)">-</span>')+'</td>'
      +'<td style="color:'+devColor+';font-weight:600">'+(w.deviation>0?'+':'')+w.deviation+'%</td>'
      +'<td style="color:'+accColor+';font-weight:600">'+(w.accuracy!==null?w.accuracy+'%':'-')+'</td>'
      +'<td>'+(isFuture?'<span class="fc-pill amber">预测</span>':'<span class="fc-pill green">实际</span>')+'</td>'
      +'</tr>';
  }).join('');
  var countEl = document.getElementById('fcTableCount');
  if(countEl) countEl.textContent = '共 '+data.weekly.length+' 周';
}


window.initPage_forecast = initPage_forecast;
})();
registerModule('forecast', initPage_forecast);
