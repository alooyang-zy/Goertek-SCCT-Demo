// ===== 角色权限 =====
(function(){
"use strict";
var ROLES = [
  {name:'供应链总监',desc:'全量数据查看+审批权限',users:3,scope:'全部BG/BU',menus:'全部菜单',status:'启用'},
  {name:'项目经理',desc:'项目级数据管理',users:18,scope:'指定BU',menus:'项目运营+计划交付',status:'启用'},
  {name:'计划员',desc:'计划与库存管理',users:12,scope:'指定BG',menus:'计划交付+项目运营',status:'启用'},
  {name:'采购员',desc:'供应商协同管理',users:15,scope:'指定BU',menus:'供应协同',status:'启用'},
  {name:'SQE',desc:'供应商质量管理',users:8,scope:'指定BG',menus:'供应协同+风险闭环',status:'启用'},
  {name:'物料员',desc:'库存与物料管理',users:10,scope:'指定BU',menus:'项目运营-库存',status:'启用'},
  {name:'高管',desc:'只读总览',users:5,scope:'全部BG/BU',menus:'控制塔总览',status:'启用'},
  {name:'IT管理员',desc:'系统配置管理',users:2,scope:'全部',menus:'配置管理',status:'启用'}
];
var USERS = [
  {name:'张三',role:'供应链总监',bg:'全部',bu:'全部',status:'在线',last:'2026-06-22 08:30'},
  {name:'李四',role:'项目经理',bg:'消费电子BG',bu:'声学BU',status:'在线',last:'2026-06-22 08:25'},
  {name:'王五',role:'计划员',bg:'智能硬件BG',bu:'光学BU',status:'离线',last:'2026-06-21 18:00'},
  {name:'赵六',role:'采购员',bg:'消费电子BG',bu:'整机BU',status:'在线',last:'2026-06-22 08:20'},
  {name:'孙七',role:'SQE',bg:'零组件BG',bu:'微电子BU',status:'在线',last:'2026-06-22 08:15'},
  {name:'周八',role:'物料员',bg:'智能硬件BG',bu:'精密结构BU',status:'离线',last:'2026-06-21 17:30'},
  {name:'吴九',role:'高管',bg:'全部',bu:'全部',status:'在线',last:'2026-06-22 07:00'},
  {name:'郑十',role:'IT管理员',bg:'全部',bu:'全部',status:'在线',last:'2026-06-22 08:00'}
];
function initPage_configRoles(container){
  container = container || document.getElementById('page-config-roles');
  if(!container) return;
  container.innerHTML =
    '<div class="chart-row" style="grid-template-columns:1fr">'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-users-gear"></i> 角色定义</h3><button class="btn btn-sm btn-primary" style="font-size:11px">+ 新增角色</button></div><div class="card-body" style="padding:0;overflow-x:auto"><table class="data-table" id="crRoleTable"><thead></thead><tbody></tbody></table></div></div>'
    + '</div>'
    + '<div class="chart-row" style="grid-template-columns:1fr;margin-top:14px">'
    + '<div class="chart-card"><div class="card-header"><h3><i class="fas fa-user"></i> 用户列表</h3><button class="btn btn-sm btn-primary" style="font-size:11px">+ 新增用户</button></div><div class="card-body" style="padding:0;overflow-x:auto"><table class="data-table" id="crUserTable"><thead></thead><tbody></tbody></table></div></div>'
    + '</div>';
  var rt = container.querySelector('#crRoleTable');
  if(rt){rt.querySelector('thead').innerHTML='<tr><th>角色名</th><th>描述</th><th>用户数</th><th>数据范围</th><th>菜单权限</th><th>状态</th><th>操作</th></tr>';
    rt.querySelector('tbody').innerHTML=ROLES.map(function(r){return '<tr><td style="font-weight:700">'+r.name+'</td><td>'+r.desc+'</td><td>'+r.users+'</td><td>'+r.scope+'</td><td>'+r.menus+'</td><td style="color:var(--success);font-weight:600">'+r.status+'</td><td><button class="btn btn-sm btn-outline" style="font-size:11px">编辑</button></td></tr>';}).join('');}
  var ut = container.querySelector('#crUserTable');
  if(ut){ut.querySelector('thead').innerHTML='<tr><th>用户名</th><th>角色</th><th>BG</th><th>BU</th><th>状态</th><th>最近登录</th><th>操作</th></tr>';
    ut.querySelector('tbody').innerHTML=USERS.map(function(u){var stColor=u.status==='在线'?'var(--success)':'var(--text-muted)';return '<tr><td style="font-weight:600">'+u.name+'</td><td>'+u.role+'</td><td>'+u.bg+'</td><td>'+u.bu+'</td><td style="color:'+stColor+';font-weight:600">'+u.status+'</td><td>'+u.last+'</td><td><button class="btn btn-sm btn-outline" style="font-size:11px">编辑</button></td></tr>';}).join('');}
}
registerModule('config-roles', initPage_configRoles);
})();
