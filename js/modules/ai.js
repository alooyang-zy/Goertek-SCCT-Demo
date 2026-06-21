// Module: ai — 智能员工助手 v10.13

function initChatInput(){
  var input=document.getElementById('chatInput');if(!input)return;
  input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}});
}

function sendMessage(){
  var input=document.getElementById('chatInput');var msg=input.value.trim();if(!msg)return;
  addChatMessage(msg,'user');input.value='';showTypingIndicator();
  setTimeout(function(){hideTypingIndicator();addChatMessage(getAiReplyV3(msg),'ai');},1200+Math.random()*800);
}

function sendQuickMsg(msg){document.getElementById('chatInput').value=msg;sendMessage();}

function addChatMessage(text,sender){
  var c=document.getElementById('chatMessages'),d=document.createElement('div');
  d.className='chat-msg '+sender+'-msg';
  d.innerHTML='<div class="msg-avatar"><i class="fas fa-'+(sender==='ai'?'robot':'user')+'"></i></div><div class="msg-body">'+formatMd(text)+'</div>';
  c.appendChild(d);c.scrollTop=c.scrollHeight;
}

function _escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function formatMd(t){
  return t.replace(/\*\*(.*?)\*\*/g,function(m,p1){return '<strong>'+_escHtml(p1)+'</strong>';})
    .replace(/\n/g,'<br>')
    .replace(/\|(.+)\|/g,function(m,p1){
      var cells=p1.split('|').map(function(c){return c.trim();});
      if(cells.every(function(c){return /^[-:]+$/.test(c);}))return '';
      return '<table style="width:100%;border-collapse:collapse;font-size:12px;margin:6px 0">'+cells.map(function(c){return '<td style="border:1px solid var(--border);padding:4px 8px">'+_escHtml(c)+'</td>';}).join('')+'</table>';
    });
}

function showTypingIndicator(){
  var c=document.getElementById('chatMessages'),d=document.createElement('div');d.className='chat-msg ai-msg';d.id='typingIndicator';
  d.innerHTML='<div class="msg-avatar"><i class="fas fa-robot"></i></div><div class="msg-body"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';c.appendChild(d);c.scrollTop=c.scrollHeight;
}

function hideTypingIndicator(){var e=document.getElementById('typingIndicator');if(e)e.remove();}

var aiResponses_v3 = {
  '\u9884\u8b66': [
    '\uD83D\uDD34 **\u5F53\u524D\u98CE\u9669\u9884\u8B66 (\u8DE8\u9879\u76EE)**',
    '',
    '| \u7EA7\u522B | \u9879\u76EE | \u7C7B\u578B | \u63CF\u8FF0 |',
    '|------|------|------|------|',
    '| \u4E25\u91CD | Meta Quest 4 VR | \u7F3A\u6599 | BES2300\u82AF\u7247\u7F3A\u53E38000pcs |',
    '| \u4E25\u91CD | Buds 5 Pro | \u8D28\u91CF | MEMS\u6765\u6599\u4E0D\u5408\u683C\u73873.2% |',
    '| \u4E25\u91CD | Meta Quest 4 VR | \u7F3A\u6599 | Micro-OLED\u7F3A\u53E3135pcs |',
    '| \u8B66\u544A | AirPods Pro 3 | \u4EA7\u80FD | SMT\u7A3C\u52A8\u738778.3% |',
    '| \u8B66\u544A | WH-1000XM6 | \u7269\u6D41 | DHL\u822A\u73ED\u5EF6\u8BEF1\u5929 |',
    '',
    '**\u5EFA\u8BAE\u4F18\u5148\u5904\u7406Meta Quest 4 VR\u53CC\u6599\u7F3A\u6599\u95EE\u9898\u3002** \u9700\u8981\u6211\u534F\u8C03OC/PC/MC/Buyer\u5417\uFF1F'
  ].join('\n'),

  '\u9879\u76EE': [
    '\uD83D\uDCCB **Meta Quest 4 VR \u9879\u76EE\u72B6\u6001**',
    '',
    '- \u9636\u6BB5: NPI\u2192MP (DVT\u9636\u6BB5)',
    '- \u8FDB\u5EA6: 55%',
    '- OTD: 91.2% (\u76EE\u6807\u226593%)',
    '- \u7269\u6599\u9F50\u5957\u7387: 88.7%',
    '- \u5173\u952E\u98CE\u9669: BES2300+Micro-OLED\u53CC\u6599\u7F3A\u6599',
    '- \u9884\u8BA1\u5F71\u54CD: \u4EA4\u671F\u5EF6\u8FDF\u81F306-20',
    '',
    '**\u7D27\u6025\u52A8\u4F5C\u5EFA\u8BAE:**',
    '1. MC: \u786E\u8BA4BES2300\u66FF\u4EE3\u65B9\u6848(\u6052\u7384\u79D1\u6280BK2700)',
    '2. Buyer: \u52A0\u901F\u7D22\u5C3C\u534A\u5BFC\u4F53Micro-OLED\u4EA4\u671F\u786E\u8BA4',
    '3. PC: \u8C03\u6574SMT-B2\u6392\u7A0B\uFF0C\u5148\u505A\u5DF2\u9F50\u5957\u90E8\u5206'
  ].join('\n'),

  '\u62A5\u544A': [
    '\uD83D\uDCCB **\u6B4C\u5C14\u4F9B\u5E94\u94FE\u5468\u62A5 (05/16 - 05/22)**',
    '',
    '**\uD83C\uDFAF \u6574\u4F53\u8BC4\u5206: 85/100**',
    '',
    '**BG\u7EF4\u5EA6:**',
    '- A01\u58F0\u5B66BG (7\u9879\u76EE): 5\u6B63\u5E38 / 2\u6709\u98CE\u9669 \u2192 \u8BC4\u520687',
    '- SAC\u667A\u80FD\u786C\u4EF6BG (3\u9879\u76EE): 2\u6B63\u5E38 / 1\u9AD8\u98CE\u9669 \u2192 \u8BC4\u520678',
    '- CEP\u7CBE\u5BC6\u96F6\u7EC4\u4EF6BG (4\u9879\u76EE): 4\u6B63\u5E38 \u2192 \u8BC4\u520695',
    '',
    '**\u9700\u5173\u6CE8:**',
    '\u26A0\uFE0F Meta Quest 4 VR\u53CC\u6599\u7F3A\u6599\uFF0C\u9700\u8DE8BG\u8D44\u6E90\u534F\u8C03',
    '\u26A0\uFE0F Buds 5 Pro\u6765\u6599\u8D28\u91CF\u5F02\u5E38\uFF0C\u9700\u4F9B\u65B9\u534F\u540C\u5904\u7406',
    '\u26A0\uFE0F AirPods Pro 3 SMT\u7A3C\u52A8\u7387\u4E0D\u8DB3\uFF0C\u5DF2\u5B89\u6392\u5468\u672B\u7EF4\u4FDD'
  ].join('\n')
};

function initPage_ai(){
  initChatInput();
}

function getAiReplyV3(msg){
  var lm=msg.toLowerCase();
  if(lm.indexOf('\u9884\u8B66')>=0||lm.indexOf('\u98CE\u9669')>=0)return aiResponses_v3['\u9884\u8B66'];
  if(lm.indexOf('\u9879\u76EE')>=0||lm.indexOf('quest')>=0||lm.indexOf('meta')>=0)return aiResponses_v3['\u9879\u76EE'];
  if(lm.indexOf('\u5468\u62A5')>=0||lm.indexOf('\u62A5\u544A')>=0)return aiResponses_v3['\u62A5\u544A'];
  return '\u611F\u8C22\u63D0\u95EE\uFF01\u5173\u4E8E **"'+_escHtml(msg)+'"**\uFF1A\n\n\u2705 \u5DF2\u5173\u8054 **'+Math.floor(Math.random()*20+5)+'** \u6761\u9879\u76EE\u6570\u636E\n\uD83D\uDCCA \u6D89\u53CABG: **'+['\u58F0\u5B66BG','VR/AR BG','\u534A\u5BFC\u4F53BG'][Math.floor(Math.random()*3)]+'**\n\n\u5982\u9700\u4E13\u9879\u5206\u6790\uFF0C\u8BF7\u544A\u77E5\u5177\u4F53\u9879\u76EE\u540D\u79F0\u3002';
}
registerModule('ai', initPage_ai);
