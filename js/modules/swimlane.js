(function(){
  "use strict";

  function initPage_swimlane(container) {
    container = container || document.getElementById('page-swimlane');
    if (!container) return;
    // 如果已初始化过，清理旧定时器
    if (container._swimlaneTimers) {
      container._swimlaneTimers.forEach(function(t){ clearInterval(t); });
      container._swimlaneTimers = null;
    }
    // 移除旧的事件监听
    if (container._swimlaneResizeHandler) {
      window.removeEventListener("resize", container._swimlaneResizeHandler);
      container._swimlaneResizeHandler = null;
    }

    // 常量
    var RAIL_W = 150, GUT = 16, LANE_W = 322, LANE_GAP = 12;
    var LANES_X0 = RAIL_W + GUT;
    var laneLeft = function(i) { return LANES_X0 + i * (LANE_W + LANE_GAP); };
    var laneCx = function(i) { return laneLeft(i) + LANE_W / 2; };
    var HEAD_H = 50, ROW_Y0 = HEAD_H + 40, ROW_GAP = 94;
    var rowY = function(r) { return ROW_Y0 + r * ROW_GAP; };
    var NODE_W = 164, NODE_H = 54, WH_W = 74, WH_H = 80;
    var CANVAS_W = laneLeft(4) + LANE_W + 6;
    var CANVAS_H = rowY(5) + NODE_H + 22;

    function trendHtml(m) {
      var map = { flow:["\u2191","up"], slowflow:["\u2191","up"], drain:["\u2193","down"], slow:["\u2191","up"], fixed:["\u2013","flat"], stock:["\u2195","osc"] };
      var t = map[m] || map.stock;
      return '<u class="tr ' + t[1] + '">' + t[0] + '</u>';
    }

    // ===== 构建 HTML =====
    var KPI = [
      ["需求总量","12,544","件","","fixed"],
      ["订单总量","11,200","件","","slowflow"],
      ["未交付","4,000","件","warn","drain"],
      ["成品可发","1,920","件","ok","stock"],
      ["承诺缺口","1,340","件","alert","drain"],
      ["超期订单","680","件","alert","slow"]
    ];

    var kribbonHTML = KPI.map(function(k){
      return '<div class="kc ' + k[3] + '"><span class="sheen"></span><label>' + k[0] + '</label><b data-num="' + k[1] + '" data-mode="' + k[4] + '">0<i>' + k[2] + '</i>' + trendHtml(k[4]) + '</b></div>';
    }).join("");

    var LANES = [
      {code:"1",name:"需求\u2192订单",main:[
        {id:"1.1",name:"客户预测",m:["客户预测总量","12,544","件"]},
        {id:"1.2",name:"交期承诺",m:["已承诺SO数量","9,860","件"]},
        {id:"1.3",name:"客户PO",m:["客户PO总量","11,200","件"]},
        {id:"1.4",name:"销售SO",m:["SO总数量","11,200","件"]}],side:[]},
      {code:"2",name:"计划\u2192备料",main:[
        {id:"2.1",name:"S&OP计划",m:["计划数量","12,544","件"]},
        {id:"2.2",name:"主生产计划",m:["MPS数量","9,860","件"]},
        {id:"2.3",name:"MDS主需求",m:["主需求数量","12,293","件"]},
        {id:"2.4",name:"物料计划",m:["物料需求","40,320","件"]},
        {id:"2.5",name:"齐套检查",m:["缺料影响订单","2","单"],risk:"warn"}],side:[]},
      {code:"3",name:"采购\u2192入库",main:[
        {id:"3.1",name:"采购订单",m:["采购订单数量","35,840","件"]},
        {id:"3.2",name:"供方协同",m:["未回复要货","3","项"]},
        {id:"3.4",name:"要货计划",m:["要货数量","13,440","件"]},
        {id:"3.5",name:"到货接收",m:["收货数量","12,096","件"],risk:"red"},
        {id:"3.6",name:"检验入库",m:["待检数量","536","件"]},
        {id:"3.7",name:"材料在库",m:["在库数量","7,420","件"],wh:true}],
        side:[{id:"3.3",name:"供方库存",m:["VMI库存","6,480","件"],wh:true,dir:"right",row:2}]},
      {code:"4",name:"生产\u2192成品",main:[
        {id:"4.1",name:"生产工单",m:["工单覆盖","11,200","件"]},
        {id:"4.2",name:"物料配送",m:["已配送","740","件"]},
        {id:"4.3",name:"生产在制",m:["在制数量","740","件"]},
        {id:"4.5",name:"质量检验",m:["FQC待检","240","件"]},
        {id:"4.6",name:"完工入库",m:["完工入库","1,920","件"]},
        {id:"4.7",name:"成品在库",m:["成品在库","1,920","件"],wh:true}],
        side:[{id:"4.4",name:"半成品库",m:["半成品库存","1,260","件"],wh:true,dir:"left",row:3}]},
      {code:"5",name:"物流\u2192客户",main:[
        {id:"5.1",name:"发货指令",m:["发货指令","4,000","件"]},
        {id:"5.2",name:"出货拣配",m:["拣配差异","0","件"]},
        {id:"5.3",name:"报关/订舱",m:["待报关","1","票"]},
        {id:"5.4",name:"发运离厂",m:["已发运","7,200","件"]},
        {id:"5.6",name:"客户签收",m:["超期订单","680","件"],risk:"red"},
        {id:"5.7",name:"售后退换",m:["退换数量","12","件"]}],
        side:[{id:"5.5",name:"在途库存",m:["在途数量","3,180","件"],wh:true,dir:"left",row:3.5}]}
    ];

    var CONN = [
      ["1.1","1.2","v"],["1.3","1.4","v"],
      ["2.1","2.2","v"],["2.2","2.3","v"],["2.3","2.4","v"],["2.4","2.5","v"],
      ["3.1","3.2","v"],["3.2","3.4","v"],["3.4","3.5","v"],["3.5","3.6","v"],["3.6","3.7","v"],
      ["4.1","4.2","v"],["4.2","4.3","v"],["4.3","4.5","v"],["4.5","4.6","v"],["4.6","4.7","v"],
      ["5.1","5.2","v"],["5.2","5.3","v"],["5.3","5.4","v"],["5.4","5.6","v"],["5.6","5.7","v"],
      ["1.1","2.1","x"],["2.4","3.1","x"],["2.2","4.1","topR"],["2.5","3.4","x"],["3.7","4.2","x"],["4.7","5.2","x"],
      ["3.2","3.3","wh"],["3.3","3.5","whO"],["4.3","4.4","wh"],["4.4","4.6","whO"],["5.4","5.5","wh"],["5.5","5.6","whO"],
      ["1.4","5.1","loop"]
    ];

    // 计算节点位置
    var POS = {};
    LANES.forEach(function(L, i) {
      L.main.forEach(function(n, r) {
        if (n.wh) POS[n.id] = { x: laneCx(i) - WH_W/2, y: rowY(r) + (NODE_H-WH_H)/2, w: WH_W, h: WH_H };
        else POS[n.id] = { x: laneCx(i) - NODE_W/2, y: rowY(r), w: NODE_W, h: NODE_H };
      });
      L.side.forEach(function(s) {
        var x = s.dir === "right" ? laneLeft(i) + LANE_W - WH_W + 12 : laneLeft(i) - 12;
        POS[s.id] = { x: x, y: rowY(s.row) + (NODE_H-WH_H)/2, w: WH_W, h: WH_H, side: true };
      });
    });

    var box = function(id) {
      var p = POS[id];
      return { cx: p.x + p.w/2, cy: p.y + p.h/2, left: p.x, right: p.x + p.w, top: p.y, bottom: p.y + p.h };
    };

    function pathFor(a, b, off) {
      var A = box(a), B = box(b);
      off = off || 0;
      if (Math.abs(A.cx - B.cx) < 6) {
        var y1 = A.cy < B.cy ? A.bottom : A.top;
        var y2 = A.cy < B.cy ? B.top - 1 : B.bottom + 1;
        return 'M ' + A.cx + ' ' + y1 + ' L ' + B.cx + ' ' + y2;
      }
      var goRight = B.cx > A.cx;
      var sx = goRight ? A.right : A.left;
      var tx = goRight ? B.left - 1 : B.right + 1;
      var midX = (sx + tx) / 2 + off;
      return 'M ' + sx + ' ' + A.cy + ' H ' + midX + ' V ' + B.cy + ' H ' + tx;
    }

    var yTop = rowY(0) - 18;
    function loopPath(a, b) {
      var A = box(a), B = box(b);
      var yBot = CANVAS_H - 8, xR = laneLeft(4) + LANE_W - 8;
      return 'M ' + A.cx + ' ' + A.bottom + ' V ' + yBot + ' H ' + xR + ' V ' + B.cy + ' H ' + (B.right + 1);
    }
    function topRight(a, b) {
      var A = box(a), B = box(b);
      return 'M ' + A.right + ' ' + A.cy + ' H ' + (A.right + 20) + ' V ' + yTop + ' H ' + B.cx + ' V ' + (B.top - 1);
    }
    function whOut(a, b) {
      var W = box(a), T = box(b);
      var side = W.cx > T.cx ? (T.right + 1) : (T.left - 1);
      return 'M ' + W.cx + ' ' + W.bottom + ' V ' + T.cy + ' H ' + side;
    }
    function whIn(a, b) {
      var S = box(a), W = box(b);
      var sx = W.cx < S.cx ? S.left : S.right;
      return 'M ' + sx + ' ' + S.cy + ' H ' + W.cx + ' V ' + (W.top - 1);
    }

    var special = { loop: loopPath, topR: topRight };
    var xOff = { "2.4>3.1": -12, "2.5>3.4": 12 };

    var paths = "", pkts = "";
    var pktColor = { v: "#00f3ff", x: "#0066ff", wh: "#00f7d2" };

    CONN.forEach(function(c, i) {
      var isWh = (c[2] === "wh" || c[2] === "whO");
      var cls = isWh ? "wh" : (special[c[2]] ? "x" : c[2]);
      var d;
      if (c[2] === "wh") d = whIn(c[0], c[1]);
      else if (c[2] === "whO") d = whOut(c[0], c[1]);
      else if (special[c[2]]) d = special[c[2]](c[0], c[1]);
      else d = pathFor(c[0], c[1], xOff[c[0] + ">" + c[1]] || 0);
      var mk = isWh ? "arwW" : "arw";
      paths += '<path class="lnk ' + cls + '" d="' + d + '" marker-end="url(#' + mk + ')"/>';
      var dur = (c[2] === "loop" ? 4.5 : (1.5 + Math.random() * 1.2)).toFixed(2);
      var beg = (-Math.random() * 2.5).toFixed(2);
      var col = pktColor[cls] || pktColor.x;
      var r = isWh ? 3.5 : 2.5;
      pkts += '<circle class="pkt" r="' + r + '" fill="' + col + '" style="color:' + col + '"><animateMotion dur="' + dur + 's" begin="' + beg + 's" repeatCount="indefinite" path="' + d + '"/></circle>';
    });

    var svg = '<svg class="links" width="' + CANVAS_W + '" height="' + CANVAS_H + '" viewBox="0 0 ' + CANVAS_W + ' ' + CANVAS_H + '">'
      + '<defs>'
      + '<marker id="arw" markerWidth="9" markerHeight="9" refX="6.5" refY="3.4" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#00f3ff"/></marker>'
      + '<marker id="arwW" markerWidth="12" markerHeight="12" refX="7.4" refY="4.2" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#00f7d2"/></marker>'
      + '</defs>' + paths + pkts + '</svg>';

    var BEH = {
      "1.1":"fixed","1.2":"slowflow","1.3":"slowflow","1.4":"slowflow",
      "2.1":"fixed","2.2":"fixed","2.3":"fixed","2.4":"fixed","2.5":"stock",
      "3.1":"flow","3.2":"stock","3.4":"fixed","3.5":"flow","3.6":"stock","3.7":"stock","3.3":"stock",
      "4.1":"fixed","4.2":"flow","4.3":"stock","4.5":"stock","4.6":"flow","4.7":"stock","4.4":"stock",
      "5.1":"flow","5.2":"fixed","5.3":"stock","5.4":"flow","5.6":"slow","5.7":"slow","5.5":"stock"
    };

    var whSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 9.5l9-5 9 5V20H3z"/><rect x="9" y="13" width="6" height="7"/></svg>';

    function whboxMarkup(id, name, m, p) {
      return '<button class="node whbox" style="left:' + p.x + 'px;top:' + p.y + 'px;width:' + p.w + 'px;height:' + p.h + 'px;">'
        + '<span class="barL"></span><span class="whico">' + whSvg + '</span><span class="nid">' + id + '</span><span class="nnm">' + name + '</span>'
        + '<span class="mv" data-num="' + m[1] + '" data-mode="' + (BEH[id] || "stock") + '">0<i>' + m[2] + '</i></span></button>';
    }

    var cols = "", heads = "", nodes = "";
    LANES.forEach(function(L, i) {
      cols += '<div class="lane-col c' + i + '" style="left:' + laneLeft(i) + 'px;top:' + (HEAD_H+6) + 'px;width:' + LANE_W + 'px;height:' + (CANVAS_H-HEAD_H-12) + 'px;"></div>';
      heads += '<div class="lane-head" style="left:' + laneLeft(i) + 'px;top:0;width:' + LANE_W + 'px;height:' + HEAD_H + 'px;">'
        + '<div class="lh"><span class="num">' + L.code + '</span><strong>' + L.name + '</strong></div><span class="sub">TGT // ACT // TRD</span></div>';
      L.main.forEach(function(n, r) {
        var p = POS[n.id], d = (r * 0.12).toFixed(2);
        if (n.wh) { nodes += whboxMarkup(n.id, n.name, n.m, p); return; }
        var st = n.risk || "ok";
        nodes += '<button class="node s-' + st + '" style="left:' + p.x + 'px;top:' + p.y + 'px;width:' + p.w + 'px;height:' + p.h + 'px;--d:' + d + 's">'
          + '<span class="barL"></span>'
          + '<span class="nh"><span class="led"></span><span class="nid">' + n.id + '</span><span class="nnm">' + n.name + '</span></span>'
          + '<span class="nb"><span class="ml">' + n.m[0] + '</span><span class="mv" data-num="' + n.m[1] + '" data-mode="' + (BEH[n.id] || "stock") + '">0<i>' + n.m[2] + '</i>' + trendHtml(BEH[n.id] || "stock") + '</span></span></button>';
      });
      L.side.forEach(function(s) { nodes += whboxMarkup(s.id, s.name, s.m, POS[s.id]); });
    });

    var rail = '<div class="rail" style="width:' + RAIL_W + 'px;">'
      + '<div class="rail-ots" style="height:' + HEAD_H + 'px;"><span class="t">OTS 周期</span><span class="nums"><span>TGT <b>14</b></span><span>ACT <b class="act">16</b></span></span></div>'
      + '<div class="rail-card"><h4>矩阵角色矩阵</h4><div class="roles">' + ["OC","PC","MC","Buyer","IP","OPM","WH"].map(function(r) { return '<span class="role">' + r + '</span>'; }).join("") + '<span class="role dim">...</span></div></div>'
      + '<div class="rail-card"><h4>运营管理支撑</h4><div class="roles">' + ["GCM","SPM","SQE","运营","央仓","物流","关务"].map(function(r) { return '<span class="role">' + r + '</span>'; }).join("") + '<span class="role dim">...</span></div></div>'
      + '<div class="rail-card warnrail"><h4>控制中心状态</h4>'
      + '<div class="wr"><span class="led2 r"></span>极端高危 · 2</div>'
      + '<div class="wr"><span class="led2 y"></span>次级异常 · 1</div>'
      + '<div class="wr"><span class="led2 g"></span>全线正常 · 26</div></div>'
      + '</div>';

    // ===== 设置容器 HTML =====
    container.innerHTML = '<div class="swimlane-shell">'
      + '<div class="wrap">'
      + '<header class="topbar brk">'
      + '<span class="c tl"></span><span class="c tr"></span><span class="c bl"></span><span class="c br"></span>'
      + '<div class="brand"><div class="logo">G</div><div><h1>歌尔供应链控制塔</h1><p>SUPPLY&nbsp;CHAIN&nbsp;CONTROL&nbsp;TOWER&nbsp;\u00B7&nbsp;端到端节点泳道图</p></div></div>'
      + '<div class="top-meta"><div class="run"><span class="gear"></span>SYSTEM RUNNING</div><div class="chip">REFRESH \u00B7 2026-05-28</div><div class="chip chip-live"><span class="dot"></span><span id="sw-clock">LIVE</span></div></div>'
      + '</header>'
      + '<div class="filters">'
      + '<div class="fl"><b>BG</b><span class="val">智能声学BG</span></div>'
      + '<div class="fl"><b>BU</b><span class="val">声学整机BU</span></div>'
      + '<div class="fl"><b>客户</b><span class="val">客户A</span></div>'
      + '<div class="fl"><b>产品线</b><span class="val">TWS整机</span></div>'
      + '<div class="fl"><b>项目号</b><span class="val">PJ-A01-2605</span></div>'
      + '<div class="fl"><b>项目阶段</b><span class="val">量产 MP</span></div>'
      + '<div class="fl"><b>重大项目</b><span class="val major">是</span></div>'
      + '</div>'
      + '<div class="kribbon" id="sw-kribbon">' + kribbonHTML + '</div>'
      + '<div class="board brk">'
      + '<span class="c tl"></span><span class="c tr"></span><span class="c bl"></span><span class="c br"></span>'
      + '<div class="board-head">'
      + '<div class="t"><i></i>端到端节点拓扑 \u00B7 量子主链路<em>A01 智能整机项目 \u00B7 高危红色预警</em></div>'
      + '<div class="legend">'
      + '<span class="lg ok"><i></i>正常级</span><span class="lg warn"><i></i>次高风险</span><span class="lg red"><i></i>极端风险</span><span class="lg wh"><i></i>仓储节点</span>'
      + '</div></div>'
      + '<div class="canvas-wrap"><div class="canvas" id="sw-canvas"><span class="beam"></span></div></div>'
      + '</div>'
      + '<div class="foot">'
      + '<div class="pills">'
      + '<span class="pill">核心节点: 29</span><span class="pill">缓存中枢: 3</span><span class="pill" style="border-color:var(--red);color:var(--red)">红灾中断: 2</span><span class="pill" style="border-color:var(--warn);color:var(--warn)">异常波动: 1</span>'
      + '</div>'
      + '<span>Data Node Stream Alignment Matrix \u00B7 Virtual Simulation Demo Data</span>'
      + '</div></div></div>';

    // ===== 渲染 Canvas 内容 =====
    var canvas = container.querySelector("#sw-canvas");
    canvas.style.width = CANVAS_W + "px";
    canvas.style.height = CANVAS_H + "px";
    canvas.insertAdjacentHTML("beforeend", cols + svg + heads + rail + nodes);

    // ===== 数值动画引擎 =====
    var FRAMES = 8, FRAME = 0;
    var fmt = function(n) { return Math.round(n).toLocaleString("zh-CN"); };

    function deltaFor(base) {
      var d = base * 0.012;
      if (base >= 2000) d = Math.round(d / 10) * 10;
      else if (base >= 200) d = Math.round(d / 5) * 5;
      else d = Math.round(d);
      return Math.max(1, d);
    }

    var NUMS = [].map.call(container.querySelectorAll("[data-num]"), function(el) {
      return {
        el: el,
        base: parseFloat(el.dataset.num.replace(/,/g, "")) || 0,
        mode: el.dataset.mode || "stock",
        cur: 0,
        seed: Math.random() * 6.28
      };
    }).map(function(o) { o.delta = deltaFor(o.base); return o; });

    function targetFor(o, f) {
      if (f === 0) return o.base;
      var b = o.base, d = o.delta;
      switch (o.mode) {
        case "fixed": return b;
        case "flow": return b + d * f;
        case "slowflow": return b + Math.max(1, Math.round(d * 0.4)) * f;
        case "drain": return Math.max(Math.round(b * 0.35), b - d * f);
        case "slow": return b + Math.max(1, Math.round(d * 0.25)) * Math.floor(f / 2);
        default: { var amp = Math.max(1, Math.round(b * 0.05)); return Math.max(0, Math.round(b + amp * Math.sin(f * 1.3 + o.seed))); }
      }
    }

    function animateTo(o, to, dur) {
      var from = o.cur, t0 = performance.now();
      function step(t) {
        var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3), v = from + (to - from) * e;
        o.cur = v;
        o.el.firstChild.nodeValue = fmt(v);
        if (p < 1) requestAnimationFrame(step);
        else { o.cur = to; o.el.firstChild.nodeValue = fmt(to); }
      }
      requestAnimationFrame(step);
    }

    // ===== 首次动画 =====
    NUMS.forEach(function(o) { animateTo(o, o.base, 950); });

    // ===== 5秒周期刷新 =====
    function refreshSweep() {
      FRAME = (FRAME + 1) % FRAMES;
      var kcs = container.querySelectorAll(".kc");
      [].forEach.call(kcs, function(c, i) {
        setTimeout(function() { c.classList.remove("flash"); void c.offsetWidth; c.classList.add("flash"); }, i * 50);
      });
      var nds = container.querySelectorAll(".node");
      [].forEach.call(nds, function(nd, i) {
        setTimeout(function() { nd.classList.remove("tick"); void nd.offsetWidth; nd.classList.add("tick"); }, 150 + i * 30);
      });
      NUMS.forEach(function(o, i) {
        setTimeout(function() { animateTo(o, targetFor(o, FRAME), 650); }, (i % 6) * 50);
      });
    }

    var sweepTimer = setInterval(refreshSweep, 5000);

    // ===== 自适应缩放 =====
    function fit() {
      var wrap = container.querySelector(".canvas-wrap");
      var s = Math.min(1, wrap.clientWidth / CANVAS_W);
      canvas.style.transform = "scale(" + s + ")";
      wrap.style.height = (CANVAS_H * s) + "px";
    }
    fit();
    var resizeHandler = function() { fit(); };
    window.addEventListener("resize", resizeHandler);

    // ===== 时钟 =====
    function tick() {
      var d = new Date();
      var p = function(x) { return String(x).padStart(2, "0"); };
      var clockEl = container.querySelector("#sw-clock");
      if (clockEl) clockEl.textContent = p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
    }
    tick();
    var clockTimer = setInterval(tick, 1000);

    // ===== 存储定时器供清理 =====
    container._swimlaneTimers = [sweepTimer, clockTimer];
    container._swimlaneResizeHandler = resizeHandler;
  }

  registerModule('swimlane', initPage_swimlane);
})();
