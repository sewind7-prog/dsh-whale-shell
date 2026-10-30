// DSH whale skin. The app remains the owner of chat, sidebar, and window state.
window.__ModuleLoader__.load({
  id: 'dsh-ui-skin',
  factory: () => {
    const assets = __ASSETS_JSON__;
    const ART_W = 1448, ART_H = 1086;
    const HOLE = { left: 350, top: 338, right: 1448 - 1285, bottom: 1086 - 952 };
    const SAFE = 42, EXPAND = 12;
    const STYLE = 'dsh-whale-style', PAPER = 'dsh-whale-paper', SHELL = 'dsh-whale-shell', STAGE = 'dsh-whale-stage';
    const FRAME_ATTR = 'data-dsh-whale-frame', READY_ATTR = 'data-dsh-whale-ready';
    const CSS = `
      html:not([${READY_ATTR}]) :is(#${PAPER},#${SHELL},#${STAGE},body > .whale-drag-region,.whale-drawer-tools) { display:none!important; }
      #dsh-whale-mode { position:fixed; z-index:6000; right:154px; top:6px; padding:5px 12px; border:1px solid #d5c39a; border-radius:13px 16px 12px 15px; background:linear-gradient(155deg,#fffdf5,#f4e8cd); color:#1a2340; box-shadow:1px 2px 0 #cbb990,2px 3px 5px #35487924; font:600 12px/1.4 'Microsoft YaHei UI',system-ui,sans-serif; cursor:pointer; -webkit-app-region:no-drag; }
      #dsh-whale-mode:focus-visible { outline:2px solid #1d5bfc; outline-offset:2px; }
      html[${READY_ATTR}] #dsh-whale-mode { right:auto; top:var(--whale-mode-top); left:var(--whale-mode-left); box-sizing:border-box; width:var(--whale-mode-width); height:var(--whale-mode-height); padding:0; border:0; border-radius:0; background:transparent; color:#fff; box-shadow:none; font-size:min(14px,calc(var(--whale-mode-width) / 4.5)); }
      html[${READY_ATTR}] #dsh-whale-mode:focus-visible { outline-color:#fff; }
      html[${READY_ATTR}] #dsh-whale-mode,#${STAGE} :is(.whale-sidebar,.whale-details) { transition:transform .12s ease,opacity .12s ease,text-shadow .12s ease; }
      html[${READY_ATTR}] #dsh-whale-mode:hover,#${STAGE} :is(.whale-sidebar,.whale-details):hover { transform:translateY(-2px); opacity:.85; text-shadow:0 1px 4px #09228188; }
      html[${READY_ATTR}] #dsh-whale-mode:active,#${STAGE} :is(.whale-sidebar,.whale-details):active { transform:translateY(1px) scale(.95); opacity:.65; }
      html[data-dsh-ui-mode='default'] #dsh-whale-fallback { inset:0 0 auto auto; width:138px; height:40px; background:transparent; }
      html[data-dsh-ui-mode='default'] #dsh-whale-fallback button:hover { background:#8796ac24; }
      html[data-dsh-ui-mode='default'] #dsh-whale-fallback button:last-child:hover { color:white; background:#c42b1c; }
      html[${READY_ATTR}],html[${READY_ATTR}] body { background:transparent!important; overflow:hidden!important; user-select:none; -webkit-user-select:none; }
      html[${READY_ATTR}] :is([data-conversation-scroll], [data-conversation-scroll] *,input,textarea,[contenteditable='true'],[contenteditable='true'] *) { user-select:text; -webkit-user-select:text; -webkit-app-region:no-drag; }
      html[${READY_ATTR}] :is(button,[role='button'],[role='menu'],.bt-settings) { -webkit-app-region:no-drag; }
      html[${READY_ATTR}] body {
        --bt-main:#FBF8EE!important; --bt-sidebar:#F4EFE3!important;
        --bt-bubble:#F4EFE3!important; --bt-user:#DEE6FA!important; --bt-user-ink:#1A2340!important;
        --bt-ink:#1A2340!important; --bt-ink-2:#5C6478!important; --bt-card:#FBF8EE!important;
        --bt-accent:#1D5BFC!important; --dsw-alias-bg-base:#FBF8EE!important;
        --dsw-alias-brand-primary:#1D5BFC!important; --dsw-alias-button-primary-fill:#1D5BFC!important;
      }
      #${PAPER},#${SHELL} { position:fixed; inset:0; pointer-events:none; background-position:center; background-repeat:no-repeat; background-size:contain; }
      #${PAPER} { z-index:0; background-image:url('${assets.paper}'); }
      #${SHELL} { z-index:2; background-image:url('${assets.shell}'); }
      [${FRAME_ATTR}] { position:fixed!important; left:var(--whale-left)!important; top:var(--whale-top)!important;
        width:var(--whale-width)!important; height:var(--whale-height)!important; margin:0!important;
        box-sizing:border-box!important; padding:0!important; background:transparent!important; z-index:1!important;
        grid-template-columns:0 minmax(0,1fr) 0!important; }
      [${FRAME_ATTR}] > [class*='_sidebarCol'] { position:absolute!important; inset:0 auto 0 0; width:min(320px,90%); z-index:30;
        display:flex; flex-direction:column; box-sizing:border-box; padding:46px 8px 10px;
        background:linear-gradient(130deg,#fffdf5,#f0e9d8)!important; color:#1A2340;
        border:1px solid #b8c6e9!important; border-radius:18px 24px 22px 16px;
        box-shadow:5px 4px 0 #d7e0f2,9px 8px 18px rgba(50,63,145,.22); }
      [${FRAME_ATTR}][data-sidebar-collapsed] > [class*='_sidebarCol'] { display:none!important; }
      [${FRAME_ATTR}] > [class*='_sidebarCol'] > :not(.whale-drawer-tools) { min-height:0; flex:1; }
      [${FRAME_ATTR}] > [class*='_handle'] { display:none!important; }
      [${FRAME_ATTR}] > [class*='_rightbarCol'] { position:absolute!important; inset:0 0 0 auto; width:min(440px,100%); z-index:31; background:#FBF8EE!important; border-radius:18px; box-shadow:-6px 3px 18px rgba(50,63,145,.2); }
      [${FRAME_ATTR}][data-rightbar-collapsed] > [class*='_rightbarCol'] { display:none!important; }
      [${FRAME_ATTR}] .whale-drawer-tools { position:absolute; top:8px; left:10px; right:10px; display:flex; justify-content:space-between; gap:8px; }
      [${FRAME_ATTR}] .whale-drawer-tools button { font:600 12px system-ui; border:1px solid #bcc8e3; color:#1A2340; background:#fffdf5; border-radius:12px; padding:6px 10px; cursor:pointer; }
      [${FRAME_ATTR}] .bt-head > .bt-pill { display:none!important; }
      [${FRAME_ATTR}] > [class*='_sidebarCol'] :is(.bt-sidebar,.bt-list) { background:transparent!important; }
      html[${READY_ATTR}] :is(.bt-menu,.bt-popover,[role='menu']) { background:#FFFBF1!important; color:#1A2340!important; border:1px solid #c7cddd!important; border-radius:14px!important; box-shadow:3px 4px 0 #e4dcc7,6px 8px 18px rgba(50,63,145,.2)!important; backdrop-filter:none!important; }
      html[${READY_ATTR}] .bt-settings-layer { z-index:5000; }
      html[${READY_ATTR}] :is(.bt-settings-layer,.bt-panel) { mask-image:var(--whale-panel-mask,none); mask-position:var(--whale-panel-mask-x,0px) var(--whale-panel-mask-y,0px); mask-size:var(--whale-panel-mask-width,100%) var(--whale-panel-mask-height,100%); mask-repeat:no-repeat; }
      html[${READY_ATTR}] .bt-settings-layer > .bt-scrim { background:transparent!important; backdrop-filter:none!important; }
      html[${READY_ATTR}] .bt-settings { position:fixed!important; left:var(--dsh-whale-dialog-left)!important; top:var(--dsh-whale-dialog-top)!important; width:var(--dsh-whale-dialog-width)!important; height:var(--dsh-whale-dialog-height)!important; max-width:none!important; max-height:none!important; margin:0!important; transform:none!important; background:#fffaf0!important; border:1px solid #bccbe6!important; border-radius:20px!important; box-shadow:4px 5px 0 #d7e0f2,8px 9px 20px rgba(50,63,145,.2)!important; }
      html[${READY_ATTR}] .bt-settings-nav { background:#eee7d7!important; }
      html[${READY_ATTR}] .bt-settings { --bt-set-w:var(--dsh-whale-dialog-width)!important; --bt-set-h:var(--dsh-whale-dialog-height)!important; }
      html[${READY_ATTR}] .bt-settings-nav { min-height:0; overflow-y:auto; width:170px!important; padding:32px 18px!important; }
      html[${READY_ATTR}] .bt-settings-head { padding-top:28px; }
      html[${READY_ATTR}] .bt-settings-close { top:28px; right:32px; }
      html[${READY_ATTR}] .bt-settings-scroll { padding-right:28px; padding-bottom:32px; }
      html[${READY_ATTR}] .bt-settings-main { background:#fffaf0!important; min-width:0; min-height:0!important; height:100%!important; width:auto!important; flex:1 1 0!important; overflow:hidden; }
      html[${READY_ATTR}] .bt-settings-scroll { min-height:0!important; flex:1 1 0!important; overflow:auto!important; overscroll-behavior:contain; }
      html[${READY_ATTR}] .bt-settings-scroll > * { flex-shrink:0; }
      html[${READY_ATTR}] [${FRAME_ATTR}]:before { display:none!important; }
      html[${READY_ATTR}] [${FRAME_ATTR}] [class*='_centerCol'] { background:transparent!important; border-radius:0!important; }
      [${FRAME_ATTR}] > [class*='_centerCol'] { grid-column:2!important; grid-row:1!important; }
      [${FRAME_ATTR}] > [class*='_centerCol'] { padding-inline:var(--whale-expand); box-sizing:border-box; }
      /* DS Bot 0.2.4 portals its own sidebar to the document body and reserves
         a left margin. Keep it mounted as the source of real Bot rows. */
      html[${READY_ATTR}] .bt-leftcol { opacity:0!important; pointer-events:none!important; }
      html[${READY_ATTR}]:has(.bt-leftcol) .bt-title-toggle { opacity:0!important; pointer-events:none!important; }
      html[${READY_ATTR}] [${FRAME_ATTR}] > [class*='_centerCol'] { margin-left:0!important; }
      html[${READY_ATTR}] .bt-panel { right:calc(100vw - var(--dsh-whale-dialog-left) - var(--dsh-whale-dialog-width))!important; top:var(--dsh-whale-dialog-top)!important; bottom:auto!important; height:var(--dsh-whale-dialog-height)!important; width:min(var(--bt-panel-w,320px),var(--dsh-whale-dialog-width))!important; border-radius:18px; box-shadow:-6px 3px 18px rgba(50,63,145,.2);
        mask-image:var(--whale-panel-mask,none); mask-position:var(--whale-panel-mask-x,0px) var(--whale-panel-mask-y,0px); mask-size:var(--whale-panel-mask-width,100%) var(--whale-panel-mask-height,100%); mask-repeat:no-repeat; }
      [${FRAME_ATTR}] [data-conversation-scroll] { margin-inline:calc(-1 * var(--whale-expand)); width:calc(100% + 2 * var(--whale-expand)); box-sizing:border-box; }
      html[${READY_ATTR}] [${FRAME_ATTR}] [data-conversation-scroll] { background:transparent!important; }
      html[${READY_ATTR}] [${FRAME_ATTR}] [class*='_centerCol'] [class*='_root']:has([data-conversation-scroll]) { background:transparent!important; }
      html[${READY_ATTR}] [${FRAME_ATTR}] header[class*='_header']:has(.bt-head):before { background:none!important; }
      html[${READY_ATTR}] [${FRAME_ATTR}] [class*='_composerSeat'] { background:transparent!important; }
      html[${READY_ATTR}] [${FRAME_ATTR}] .bt-bubble { background:transparent!important; color:#1A2340!important; border-radius:18px!important; }
      html[${READY_ATTR}] [${FRAME_ATTR}] [data-composer-card] { background:#FBF8EE!important; border:1px solid rgba(4,28,158,.12)!important; border-radius:28px!important; }
      html[${READY_ATTR}] [${FRAME_ATTR}] .bt-plus { background:transparent url('${assets.inputAdd}') center/contain no-repeat!important; box-shadow:none!important; }
      html[${READY_ATTR}] [${FRAME_ATTR}] .bt-mic { background:transparent url('${assets.inputMicrophone}') center/contain no-repeat!important; }
      html[${READY_ATTR}] [${FRAME_ATTR}] :is(.bt-plus,.bt-mic) svg { opacity:0; }
      #${STAGE} { position:fixed; z-index:3; pointer-events:none; }
      #${STAGE} .whale-drag { position:absolute; left:17%; top:13%; width:51%; height:16%; pointer-events:auto; -webkit-app-region:drag; cursor:grab; }
      #${STAGE} .whale-drag-head { left:8%; top:30%; width:14%; height:32%; }
      #${STAGE} .whale-drag-tail { left:80%; top:7%; width:15%; height:8%; }
      html[${READY_ATTR}] body > .whale-drag-region { position:fixed; z-index:3; pointer-events:auto; -webkit-app-region:drag; app-region:drag; user-select:none; -webkit-user-select:none; cursor:grab; }
      html[data-dsh-whale-pointer-drag] body > .whale-drag-region { -webkit-app-region:no-drag; app-region:no-drag; }
      #${STAGE} .whale-bot, #${STAGE} .whale-sidebar, #${STAGE} .whale-details { position:absolute; pointer-events:auto; -webkit-app-region:no-drag; cursor:pointer; }
      #${STAGE} .whale-bot { padding:0; border:0; background:transparent; display:grid; place-items:center; }
      #${STAGE} img { -webkit-user-drag:none; user-select:none; }
      #${STAGE} .whale-bot img { width:100%; height:100%; object-fit:contain; }
      #${STAGE} .whale-bot-exiting { pointer-events:none!important; }
      #${STAGE} .whale-bot-exiting:after { display:none!important; }
      #${STAGE} .whale-native-avatar { width:100%!important; height:100%!important; pointer-events:none; }
      #${STAGE} .whale-native-avatar :is(svg,img) { width:100%!important; height:100%!important; }
      #${STAGE} .whale-bot .bt-mark-img { box-shadow:none!important; }
      #${STAGE} .whale-more-panel .whale-native-avatar { width:32px!important; height:32px!important; flex:none; }
      #${STAGE} .whale-bot[data-room] { background:transparent; border:0; }
      #${STAGE} .whale-bot .whale-group-part { position:absolute; width:65%; height:65%; object-fit:contain; filter:drop-shadow(1px 2px 1px rgba(30,60,130,.18)); }
      #${STAGE} .whale-group-part :is(svg,img) { width:100%!important; height:100%!important; }
      #${STAGE} .whale-group-avatar { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%) scale(var(--whale-group-scale,1)); transform-origin:center; pointer-events:none; }
      #${STAGE} .whale-window { position:absolute; padding:0; border:0; background:transparent; pointer-events:auto; -webkit-app-region:no-drag; cursor:pointer; }
      #${STAGE} .whale-window svg { width:100%; height:100%; display:block; pointer-events:none; }
      #${STAGE} .whale-window:focus-visible { outline:2px solid #fff; outline-offset:1px; border-radius:4px; }
      #${STAGE} .whale-more { position:absolute; width:34px; height:34px; border:1px solid #c4cfea; border-radius:12px; background:#fffaf0; color:#1A2340; font:bold 20px system-ui; cursor:pointer; pointer-events:auto; -webkit-app-region:no-drag; }
      #${STAGE} .whale-more-panel { position:absolute; z-index:40; width:220px; max-height:280px; overflow:auto; padding:8px; border:1px solid #b9c8e5; border-radius:16px; background:#fffaf0; box-shadow:4px 5px 0 #d7e0f2,8px 9px 16px rgba(50,63,145,.2); pointer-events:auto; -webkit-app-region:no-drag; }
      #${STAGE} .whale-more-panel[hidden] { display:none; }
      #${STAGE} .whale-more-panel button { display:block; width:100%; text-align:left; padding:10px 12px; border:0; border-radius:9px; background:transparent; color:#1A2340; cursor:pointer; }
      #${STAGE} .whale-more-panel button:hover { background:#e3ebfa; }
      #${STAGE} .whale-more-panel button { display:flex; align-items:center; gap:10px; }
      #${STAGE} .whale-more-panel button > img { width:32px; height:32px; object-fit:contain; }
      #${STAGE} .whale-next { position:absolute; width:30px; height:38px; padding:0; border:0; background:transparent; pointer-events:auto; -webkit-app-region:no-drag; cursor:pointer; filter:drop-shadow(2px 3px 1px rgba(19,41,110,.28)); }
      #${STAGE} .whale-next:before { content:''; display:block; width:100%; height:100%; background:linear-gradient(130deg,#fffef8 0 55%,#e8e4d7 56% 75%,#fffaf0 76%); clip-path:polygon(67% 3%,84% 18%,49% 48%,84% 80%,67% 97%,12% 50%); }
      #${STAGE} .whale-next:disabled { opacity:.4; cursor:default; }
      #${STAGE} .whale-bot:hover img { transform:translateY(-3px); }
      #${STAGE} .whale-bot:hover, #${STAGE} .whale-bot:focus-visible { z-index:30!important; }
      #${STAGE} .whale-bot:hover:after, #${STAGE} .whale-bot:focus-visible:after { content:attr(data-name); position:absolute; top:calc(100% + 6px); left:50%; transform:translateX(-50%); width:max-content; max-width:240px; padding:6px 10px; border:1px solid #c4cfea; border-radius:10px; background:#fffaf0; color:#1A2340; font:12px/1.5 system-ui; box-shadow:0 3px 10px rgba(50,63,145,.2); pointer-events:none; }
      #${STAGE} .whale-bot:focus-visible, #${STAGE} :is(.whale-sidebar,.whale-details):focus-visible { outline:2px solid #1D5BFC; outline-offset:2px; }
      #${STAGE} :is(.whale-sidebar,.whale-details,.whale-more) { box-sizing:border-box; border:0; border-radius:0; padding:0;
        color:#fff; background:transparent; font:600 14px/1.3 'Microsoft YaHei UI',system-ui,sans-serif; box-shadow:none; }
      #${STAGE} :is(.whale-sidebar,.whale-details):focus-visible { outline-color:#fff; }
      #${STAGE} .whale-more { display:grid; place-items:center; padding:0; border:0; border-radius:0; background:none; box-shadow:none; }
      #${STAGE} .whale-more:before { content:''; display:block; width:5px; height:5px; border-radius:50%; background:#fff; box-shadow:-8px 0 #fff,8px 0 #fff; }
      #${STAGE} .whale-more:focus-visible { outline:2px solid #fff; outline-offset:2px; }
      #${STAGE} .whale-add-bot { position:absolute; width:36px; height:36px; padding:0; border:0; background:transparent; pointer-events:auto; -webkit-app-region:no-drag; cursor:pointer; }
      #${STAGE} .whale-add-bot img { width:100%;height:100%;object-fit:contain;filter:drop-shadow(1px 2px 2px rgba(50,63,145,.2)); }
      @media (prefers-reduced-motion:reduce) { #${STAGE} .whale-bot:hover img { transform:none; } html[${READY_ATTR}] #dsh-whale-mode,#${STAGE} :is(.whale-sidebar,.whale-details) { transition:none; } }
    `;

    let disposed = false, frame = null, stage = null, menu = null, menuSaved = null;
    let observer = null, resizeObserver = null, scheduled = false, collapseTimer = null;
    let started = false, applied=false, lastBotSignature = '', context = null;
    let dragRects=[], shapeRects=[], dragZones=[], avatarSerial=0, activeDrag=null, moveFrame=0, shapeFrame=0, panelMotionFrame=0, lastShape='';
    let avatarMotionRects=[], avatarMotionAnimations=[], avatarMotionGeneration=0, shapePending=Promise.resolve();
    const avatarExits=new Set();
    let shapeImage=null, bellyMask=null, panelMaskKey='', panelMaskUrl='';
    let mode='whale', modeButton=null, modePending=false, sidebarBeforeWhale=null;

    function report(error) { console.error('[DSH whale skin]', error); }
    function loadImage(url) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('无法加载鲸鱼界面素材'));
        image.src = url;
      });
    }
    function findFrame() {
      return Array.from(document.querySelectorAll("[class*='_frame']")).find((element) =>
        element.querySelector(":scope > [class*='_centerCol']") &&
        element.querySelector(":scope > [class*='_sidebarCol']")) || null;
    }
    function findSidebar() { return frame && frame.querySelector(":scope > [class*='_sidebarCol']"); }
    function createElement(id, tag = 'div') {
      const element = document.createElement(tag); element.id = id; return element;
    }
    function silhouetteDragRegions(image,forShape=false) {
      const width=forShape?724:362,height=forShape?543:272,canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
      const paint=canvas.getContext('2d',{willReadFrequently:true});paint.drawImage(image,0,0,width,height);
      const pixels=paint.getImageData(0,0,width,height).data,rectangles=[];let active=new Map();
      // Native menu buttons live in a preload shadow root. Exclude their whole
      // strip from drag geometry; Chromium may not subtract shadow no-drag regions.
      const solid=(x,y)=>forShape ? pixels[(y*width+x)*4+3]>0 : !(x>=85&&x<=180&&y>=60&&y<=84)&&pixels[(y*width+x)*4+3]>=32;
      for(let y=0;y<height;y++){
        const next=new Map();let x=0;
        while(x<width){while(x<width&&!solid(x,y))x++;const start=x;while(x<width&&solid(x,y))x++;if(x===start)continue;
          const key=start+':'+(x-start),prior=active.get(key);
          const rect=prior||{x:start,y,width:x-start,height:0};rect.height++;if(!prior)rectangles.push(rect);next.set(key,rect);
        }active=next;
      }
      return rectangles.map(r=>({left:r.x/width*100,top:r.y/height*100,width:r.width/width*100,height:r.height/height*100}));
    }
    function scheduleShape(){
      if(shapeFrame || disposed || modePending || mode!=='whale' || typeof window.dshWindow?.setShape!=='function')return;
      shapeFrame=requestAnimationFrame(()=>{shapeFrame=0;updateShape();});
    }
    function createBellyMask(image){
      // Use the enclosed transparent belly, rather than the opaque outer silhouette.
      // Flood filling rejects the exterior; row spans fill tiny artwork specks inside.
      const canvas=document.createElement('canvas');canvas.width=ART_W;canvas.height=ART_H;
      const paint=canvas.getContext('2d',{willReadFrequently:true});paint.drawImage(image,0,0,ART_W,ART_H);
      const pixels=paint.getImageData(0,0,ART_W,ART_H),seen=new Uint8Array(ART_W*ART_H),queue=new Uint32Array(ART_W*ART_H);
      let head=0,tail=0;const seed=Math.round((HOLE.top+ART_H-HOLE.bottom)/2)*ART_W+Math.round((HOLE.left+ART_W-HOLE.right)/2);
      queue[tail++]=seed;seen[seed]=1;
      const visit=i=>{if(i>=0&&i<seen.length&&!seen[i]&&pixels.data[i*4+3]<128){seen[i]=1;queue[tail++]=i;}};
      while(head<tail){const i=queue[head++],x=i%ART_W;if(x>0)visit(i-1);if(x<ART_W-1)visit(i+1);visit(i-ART_W);visit(i+ART_W);}
      if(seen[0] || tail<ART_W*ART_H*.2)throw new Error('鲸鱼腹部边界无法识别');
      paint.clearRect(0,0,ART_W,ART_H);paint.fillStyle='#fff';
      for(let y=0;y<ART_H;y++){let left=ART_W,right=-1;for(let x=0;x<ART_W;x++)if(seen[y*ART_W+x]){left=Math.min(left,x);right=x;}if(right>=left)paint.fillRect(left,y,right-left+1,1);}
      return canvas;
    }
    function updatePanelMask(art){
      const panels=document.querySelectorAll('.bt-panel,.bt-settings-layer');if(!panels.length || !bellyMask)return;
      const w=Math.max(1,Math.ceil(art.width)),h=Math.max(1,Math.ceil(art.height)),key=w+'x'+h;
      if(key!==panelMaskKey){
        const blurred=document.createElement('canvas');blurred.width=w;blurred.height=h;const paint=blurred.getContext('2d');paint.filter='blur(1px)';paint.drawImage(bellyMask,0,0,w,h);
        panelMaskUrl=blurred.toDataURL('image/png');panelMaskKey=key;
      }
      for(const panel of panels){const box=panel.getBoundingClientRect();
        panel.style.setProperty('--whale-panel-mask',`url("${panelMaskUrl}")`);
        panel.style.setProperty('--whale-panel-mask-x',`${art.left-box.left}px`);panel.style.setProperty('--whale-panel-mask-y',`${art.top-box.top}px`);
        panel.style.setProperty('--whale-panel-mask-width',`${art.width}px`);panel.style.setProperty('--whale-panel-mask-height',`${art.height}px`);
      }
    }
    function followPanelMotion(event){
      if(mode!=='whale' || !event.target?.matches?.('.bt-panel,.bt-settings,.bt-settings-layer') || panelMotionFrame)return;
      const tick=()=>{panelMotionFrame=0;if(disposed || mode!=='whale')return;const panel=document.querySelector('.bt-panel,.bt-settings-layer'),art=artRect();if(!panel || !art)return;
        updatePanelMask(art);
        if(Array.from(document.querySelectorAll('.bt-panel,.bt-settings')).some(el=>el.getAnimations().some(animation=>animation.playState==='running')))panelMotionFrame=requestAnimationFrame(tick);};
      panelMotionFrame=requestAnimationFrame(tick);
    }
    function animationBounds(before,after){
      const left=Math.min(before.left,after.left),top=Math.min(before.top,after.top);
      const right=Math.max(before.right,after.right),bottom=Math.max(before.bottom,after.bottom);
      return {left,top,width:right-left,height:bottom-top};
    }
    function updateShape(){
      const art=artRect(),width=window.innerWidth,height=window.innerHeight;
      if(modePending || mode!=='whale' || !art || !stage || !width || !height || !shapeRects.length)return;
      const rects=[];
      const add=(x,y,w,h,pad=0)=>{
        const left=Math.max(0,x-pad),top=Math.max(0,y-pad),right=Math.min(width,x+w+pad),bottom=Math.min(height,y+h+pad);
        if(right>left && bottom>top)rects.push({x:left,y:top,width:right-left,height:bottom-top});
      };
      // Include the faint antialiased outline as well as the filled artwork.
      shapeRects.forEach(r=>add(art.left+r.left*art.width/100,art.top+r.top*art.height/100,r.width*art.width/100,r.height*art.height/100,Math.max(2,art.width/724)));
      add(art.left+HOLE.left*art.width/ART_W,art.top+HOLE.top*art.height/ART_H,(ART_W-HOLE.left-HOLE.right)*art.width/ART_W,(ART_H-HOLE.top-HOLE.bottom)*art.height/ART_H,3);
      stage.querySelectorAll('.whale-bot,.whale-next,.whale-sidebar,.whale-details,.whale-window,.whale-more,.whale-more-panel:not([hidden]),.whale-add-bot').forEach(el=>{
        const b=el.getBoundingClientRect();if(b.width && b.height)add(b.left,b.top,b.width,b.height,el.classList.contains('whale-bot')?5:2);
        if(el.classList.contains('whale-bot') && (el.matches(':hover') || el.matches(':focus-visible'))) {
          const name=el.dataset.name||'',ctx=document.createElement('canvas').getContext('2d');ctx.font='12px system-ui';
          const tw=Math.min(240,ctx.measureText(name).width)+22;add(b.left+b.width/2-tw/2,b.bottom+6,tw,32,2);
        }
      });
      avatarMotionRects.forEach(r=>add(r.left,r.top,r.width,r.height,5));
      avatarExits.forEach(({bounds:r})=>add(r.left,r.top,r.width,r.height,5));
      const host=document.querySelector('[data-windows-menu]');if(host){const b=host.getBoundingClientRect();add(b.left,b.top,b.width,b.height,2);}
      if(modeButton){const b=modeButton.getBoundingClientRect();add(b.left,b.top,b.width,b.height,3);}
      updatePanelMask(art);
      const shape={width,height,rects},signature=JSON.stringify(shape);
      if(signature!==lastShape){lastShape=signature;shapePending=Promise.resolve(window.dshWindow.setShape(shape)).catch(e=>{lastShape='';report(e);});}
      return shapePending;
    }
    function windowGlyph(action) {
      const cuts={
        minimize:['M12 26.8 35 26.3 36 30.3 12.8 31.4 11.6 30.2Z'],
        maximize:['M13 12.5 35 12 35.8 16.2 13.5 16.8 12.5 15Z','M12.7 14 16.6 14.2 16 35 12 35.5 11.8 31.5Z','M32 13.8 35.9 13 36.4 35.1 32.1 35.6 31.7 32Z','M13 32 35 31.5 35.8 35.6 13 36.2 12.3 34.6Z'],
        close:['M15 11.9 36 32.7 33.4 36 11.8 14.8 12.4 13.2Z','M32.6 11.9 36.2 14.7 15.2 36.1 12 33.3 12.6 31.8Z'],
      };
      const folds={minimize:'M13 27.2 34.5 26.9 34.8 27.7 13.1 28.4Z',maximize:'M14 13 34.6 12.7 34.8 13.6 14.1 14Z',close:'M15.1 12.8 34.8 32.6 34.1 33.3 14.4 13.4Z'};
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('viewBox','0 0 48 48');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
      for(const [d,fill] of [...cuts[action].map(d=>[d,'#fffbea']),[folds[action],'#ffffff']]){
        const strip=document.createElementNS('http://www.w3.org/2000/svg','path');strip.setAttribute('d',d);strip.setAttribute('fill',fill);svg.appendChild(strip);
      }
      return svg;
    }
    function buildLayers(ctx) {
      const style = createElement(STYLE, 'style'); style.textContent = CSS; document.head.appendChild(style);
      const paper = createElement(PAPER), shell = createElement(SHELL);
      paper.setAttribute('aria-hidden', 'true'); shell.setAttribute('aria-hidden', 'true');
      stage = createElement(STAGE);
      // Keep native drag regions outside the pointer-transparent control stage.
      dragZones=dragRects.map(()=>{const zone=document.createElement('div');zone.className='whale-drag-region';zone.setAttribute('aria-hidden','true');return zone;});
      if(typeof window.dshWindow?.beginMove==='function'){
        document.documentElement.setAttribute('data-dsh-whale-pointer-drag','');
        dragZones.forEach(zone=>zone.addEventListener('pointerdown',beginWindowMove));
        window.addEventListener('pointermove',moveWindow);
        window.addEventListener('pointerup',endWindowMove);
        window.addEventListener('pointercancel',endWindowMove);
        window.addEventListener('blur',endWindowMove);
      }
      const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'whale-sidebar';
      toggle.textContent = '设置'; toggle.title = 'DS Bot 设置'; toggle.setAttribute('aria-label', '打开 DS Bot 设置');
      toggle.addEventListener('click', openBotSettings); stage.appendChild(toggle);
      const details=document.createElement('button');details.type='button';details.className='whale-details';
      details.textContent='侧栏';details.title='当前对话详情';details.setAttribute('aria-label','打开当前对话详情侧栏');
      details.addEventListener('click',()=>{const pill=frame?.querySelector('.bt-head > .bt-pill');if(pill)pill.click();else report('未找到当前对话详情入口');});stage.appendChild(details);
      const next=document.createElement('button');next.type='button';next.className='whale-next';next.title='切换到下一个对话';next.setAttribute('aria-label','切换到下一个对话');
      next.addEventListener('click',()=>{const list=rows();if(list.length<2)return;const current=list.findIndex(row=>row.getAttribute('aria-current')==='page');list[(current+1)%list.length].click();});stage.appendChild(next);
      const add=document.createElement('button');add.type='button';add.className='whale-add-bot';add.title='添加 Bot';add.setAttribute('aria-label','添加 Bot');
      const addImage=document.createElement('img');addImage.src=assets.inputAdd;addImage.alt='';add.appendChild(addImage);add.addEventListener('click',openAddBot);stage.appendChild(add);
      if (window.dshWindow) {
        for (const [action,label] of [['minimize','最小化'],['maximize','最大化或还原'],['close','关闭窗口']]) {
          const button = document.createElement('button'); button.type='button'; button.className='whale-window'; button.dataset.action=action;
          button.title=label; button.setAttribute('aria-label',label);
          button.appendChild(windowGlyph(action));
          button.addEventListener('click',()=>Promise.resolve(window.dshWindow[action==='maximize'?'toggleMaximize':action]()).catch(report));
          stage.appendChild(button);
        }
      }
      document.body.append(paper, shell, ...dragZones, stage);
      document.addEventListener('pointerover',scheduleShape);document.addEventListener('pointerout',scheduleShape);
      document.addEventListener('focusin',scheduleShape);document.addEventListener('focusout',scheduleShape);document.addEventListener('click',scheduleShape);
      document.addEventListener('animationstart',followPanelMotion,true);document.addEventListener('transitionrun',followPanelMotion,true);
    }
    function beginWindowMove(event){
      if(event.button!==0 || !event.isPrimary || activeDrag)return;
      event.preventDefault();
      const drag={id:event.pointerId,element:event.currentTarget,ready:Promise.resolve(window.dshWindow.beginMove())};
      activeDrag=drag;drag.element.setPointerCapture(drag.id);drag.ready.catch(report);
    }
    function moveWindow(event){
      const drag=activeDrag;if(!drag || event.pointerId!==drag.id || moveFrame)return;
      moveFrame=requestAnimationFrame(()=>{moveFrame=0;drag.ready.then(ok=>{if(ok && activeDrag===drag)return window.dshWindow.move();}).catch(report);});
    }
    function endWindowMove(event){
      const drag=activeDrag;if(!drag || (event?.pointerId!==undefined && event.pointerId!==drag.id))return;
      activeDrag=null;if(moveFrame){cancelAnimationFrame(moveFrame);moveFrame=0;}
      if(drag.element.hasPointerCapture(drag.id))drag.element.releasePointerCapture(drag.id);
      drag.ready.then(async ok=>{if(ok)await window.dshWindow.move();await window.dshWindow.endMove();}).catch(report);
    }
    function artRect() {
      const vw = window.innerWidth, vh = window.innerHeight;
      if (!vw || !vh) return null;
      let width = vw, height = width * ART_H / ART_W;
      if (height > vh) { height = vh; width = height * ART_W / ART_H; }
      return { width, height, left:(vw - width)/2, top:(vh - height)/2 };
    }
    function menuMetrics(rect) {
      const scale=rect.width/ART_W;
      return {left:Math.round(370*scale+10),top:Math.round(296*scale),width:Math.round(48*scale),height:Math.round(32*scale),gap:Math.max(4,Math.round(6*scale)),modeWidth:Math.round(80*scale)};
    }
    function updateMenu(rect) {
      const host = document.querySelector('[data-windows-menu]');
      if (!host || !host.shadowRoot) return;
      if (menu !== host) {
        restoreMenu(); menu = host;
        host.shadowRoot.querySelectorAll('#dsh-whale-menu-style').forEach(element=>element.remove());
        menuSaved = ['left','top','height','--whale-menu-size','--whale-menu-height','--whale-menu-gap'].map((key) => [key, host.style.getPropertyValue(key), host.style.getPropertyPriority(key)]);
        const style = document.createElement('style'); style.id = 'dsh-whale-menu-style';
        style.textContent = `
          [role=menubar]{gap:var(--whale-menu-gap)!important}
          button{width:var(--whale-menu-size)!important;height:var(--whale-menu-height)!important;padding:0!important;
            box-sizing:border-box!important;color:#fff!important;background:transparent!important;border:0!important;border-radius:0!important;font:600 14px/1.3 'Microsoft YaHei UI',system-ui,sans-serif!important;box-shadow:none!important;cursor:pointer!important;transition:transform .12s ease,opacity .12s ease,text-shadow .12s ease!important;}
          button:focus-visible{outline:2px solid #fff!important;outline-offset:1px!important;}
          button:hover{transform:translateY(-2px);opacity:.85;text-shadow:0 1px 4px #09228188!important;}
          button[aria-expanded=true]{text-decoration:underline;text-underline-offset:4px;}
          button:active{transform:translateY(1px) scale(.95);opacity:.65;}
          @media(prefers-reduced-motion:reduce){button{transition:none!important;}}
        `;
        host.shadowRoot.appendChild(style);
      }
      const metrics=menuMetrics(rect);
      menu.style.setProperty('left', `${rect.left+metrics.left}px`, 'important');
      menu.style.setProperty('top', `${rect.top+metrics.top}px`, 'important');
      menu.style.setProperty('height', `${metrics.height}px`, 'important');
      menu.style.setProperty('--whale-menu-size', `${metrics.width}px`);
      menu.style.setProperty('--whale-menu-height', `${metrics.height}px`);
      menu.style.setProperty('--whale-menu-gap', `${metrics.gap}px`);
    }
    function restoreMenu() {
      if (!menu) return;
      const injected = menu.shadowRoot && menu.shadowRoot.getElementById('dsh-whale-menu-style');
      if (injected) injected.remove();
      for (const [key, value, priority] of menuSaved || []) {
        if (value) menu.style.setProperty(key, value, priority); else menu.style.removeProperty(key);
      }
      menu = null; menuSaved = null;
    }
    function openBotSettings() {
      const existing=document.querySelector('.bt-settings');
      if(existing){existing.querySelector('button[aria-label="关闭设置"],button[aria-label="Close settings"]')?.click();return;}
      const account=document.querySelector('button.bt-account');
      if(!account){report('未找到 DS Bot 设置入口');return;}
      let watch=null,timer=null;
      const pick=()=>{
        const button=Array.from(document.querySelectorAll('.bt-account-menu button[role="menuitem"]')).find(el=>['Bot 设置','Bot settings'].includes(el.textContent.trim()));
        if(!button)return false;
        watch?.disconnect();if(timer)clearTimeout(timer);button.click();return true;
      };
      if(pick())return;
      watch=new MutationObserver(()=>pick());watch.observe(document.body,{childList:true,subtree:true});
      timer=setTimeout(()=>{watch.disconnect();report('DS Bot 设置入口未出现');},1500);
      account.click();
    }
    function openAddBot() {
      let phase=0,timer=null;
      const watch=new MutationObserver(advance);
      function advance(){
        const panel=document.querySelector('.bt-settings');if(!panel)return;
        if(phase===0){const tab=Array.from(panel.querySelectorAll('.bt-settings-nav button')).find(button=>button.textContent.trim()==='Bot');if(!tab)return;phase=1;tab.click();}
        const create=Array.from(panel.querySelectorAll('.bt-settings-main button')).find(button=>['新 Bot','New Bot'].includes(button.textContent.trim()));
        if(create){watch.disconnect();clearTimeout(timer);create.click();}
      }
      watch.observe(document.body,{childList:true,subtree:true});timer=setTimeout(()=>{watch.disconnect();report('添加 Bot 入口未出现');},3000);
      if(!document.querySelector('.bt-settings'))openBotSettings();advance();
    }
    function layout() {
      const rect = artRect(); if (!rect || !frame || !stage) return;
      stage.style.left = `${rect.left}px`; stage.style.top = `${rect.top}px`;
      stage.style.width = `${rect.width}px`; stage.style.height = `${rect.height}px`;
      const scale = rect.width / ART_W;
      dragZones.forEach((zone,index)=>{const r=dragRects[index];zone.style.cssText=`left:${rect.left+r.left*rect.width/100}px;top:${rect.top+r.top*rect.height/100}px;width:${r.width*rect.width/100}px;height:${r.height*rect.height/100}px`;});
      frame.style.setProperty('--whale-expand', `${EXPAND*scale}px`);
      frame.style.setProperty('--whale-left', `${Math.round(rect.left + (HOLE.left + SAFE - EXPAND) * scale)}px`);
      frame.style.setProperty('--whale-top', `${Math.round(rect.top + (HOLE.top + SAFE - EXPAND) * scale)}px`);
      frame.style.setProperty('--whale-width', `${Math.max(0, Math.round((ART_W - HOLE.left - HOLE.right - 2 * SAFE + 2 * EXPAND) * scale))}px`);
      frame.style.setProperty('--whale-height', `${Math.max(0, Math.round((ART_H - HOLE.top - HOLE.bottom - 2 * SAFE + EXPAND) * scale))}px`);
      const dialog={left:rect.left+HOLE.left*scale,top:rect.top+HOLE.top*scale,width:(ART_W-HOLE.left-HOLE.right)*scale,height:(ART_H-HOLE.top-HOLE.bottom)*scale};
      for(const key of ['left','top','width','height'])document.documentElement.style.setProperty('--dsh-whale-dialog-'+key,`${dialog[key]}px`);
      const toggle = stage.querySelector('.whale-sidebar');
      const metrics=menuMetrics(rect),step=metrics.width+metrics.gap;
      toggle.style.left = `${metrics.left+2*step}px`; toggle.style.top = `${metrics.top}px`;
      toggle.style.width=`${metrics.width}px`; toggle.style.height=`${metrics.height}px`;
      const details=stage.querySelector('.whale-details');details.style.left=`${metrics.left+3*step}px`;details.style.top=toggle.style.top;details.style.width=toggle.style.width;details.style.height=toggle.style.height;
      document.documentElement.style.setProperty('--whale-mode-left',`${rect.left+metrics.left+4*step}px`);
      document.documentElement.style.setProperty('--whale-mode-top',`${rect.top+metrics.top}px`);
      document.documentElement.style.setProperty('--whale-mode-width',`${metrics.modeWidth}px`);
      document.documentElement.style.setProperty('--whale-mode-height',toggle.style.height);
      stage.querySelectorAll('.whale-window').forEach((button,index)=>{
        button.style.cssText=`left:${(1268+index*52)*scale}px;top:${(158-index*14)*scale}px;width:${48*scale}px;height:${48*scale}px`;
      });
      updateMenu(rect); positionBots(rect);
    }
    function rows() {
      const sidebar = document.querySelector('.bt-leftcol') || findSidebar(); if (!sidebar) return [];
      const seen = new Set();
      return Array.from(sidebar.querySelectorAll('button[data-bot-id],button[data-room-id]')).filter((row) => {
        const id = rowId(row);
        if (!id || seen.has(id)) return false; seen.add(id); return true;
      });
    }
    function rowId(row) { return row.dataset.botId ? 'bot:'+row.dataset.botId : 'room:'+row.dataset.roomId; }
    function rowName(row) { return row.querySelector('.bt-row-title,.bt-tile-name')?.textContent || row.title || row.getAttribute('aria-label') || 'Bot'; }
    function avatarKey(mark) { if(!mark)return '';return (mark.dataset.shape||'')+'|'+(mark.querySelector('img')?.getAttribute('src')||Array.from(mark.querySelectorAll('svg [fill]')).map(el=>el.getAttribute('fill').replace(/url\(.*?\)/g,'url')).join('|')); }
    function cloneMark(mark) {
      const copy=mark.cloneNode(true),ids=new Map();
      // SVG mask/gradient IDs must belong to the visible clone. Reusing the IDs
      // of the hidden sidebar makes Chromium resolve masks against hidden SVGs.
      copy.querySelectorAll('[id]').forEach(el=>{const old=el.id,next='dsh-whale-avatar-'+(++avatarSerial);ids.set(old,next);el.id=next;});
      copy.querySelectorAll('*').forEach(el=>{
        for(const attr of Array.from(el.attributes)){
          if(attr.name==='id')continue;let value=attr.value;
          for(const [old,next] of ids){value=value.replaceAll('url(#'+old+')','url(#'+next+')');if(value==='#'+old)value='#'+next;}
          if(value!==attr.value)el.setAttribute(attr.name,value);
        }
      });
      // The built-in eyes are cut out by masks. Give the silhouette a paper
      // backing so those eyes remain legible on the blue whale, without a tile.
      copy.querySelectorAll('svg > .bt-b').forEach(body=>{
        const backing=body.cloneNode(true);backing.removeAttribute('class');
        backing.querySelectorAll('[mask]').forEach(el=>el.removeAttribute('mask'));
        backing.querySelectorAll('path,rect,circle,ellipse,polygon,polyline').forEach(el=>el.setAttribute('fill','#FBF8EE'));
        body.prepend(backing);
      });
      copy.querySelectorAll('img').forEach(img=>img.draggable=false);
      return copy;
    }
    function nativeAvatar(row) {
      const mark=row.querySelector('.bt-mark[data-shape]');
      const copy=mark ? cloneMark(mark) : document.createElement('span');
      copy.classList.add('whale-native-avatar');copy.setAttribute('aria-hidden','true');
      if(!mark)copy.textContent=rowName(row).slice(0,1);
      copy.querySelectorAll('img').forEach(img=>img.draggable=false);
      return copy;
    }
    function installDrawerTools(ctx) {
      const sidebar=findSidebar(); if (!sidebar || sidebar.querySelector('.whale-drawer-tools')) return;
      const tools=document.createElement('div'); tools.className='whale-drawer-tools';
      const details=document.createElement('button'); details.type='button'; details.textContent='当前对话详情';
      details.addEventListener('click',()=>{ const pill=frame.querySelector('.bt-head > .bt-pill'); if (pill) { pill.click(); if (!frame.hasAttribute('data-sidebar-collapsed')) ctx.layout.toggleSidebar(); } });
      const close=document.createElement('button'); close.type='button'; close.textContent='收起'; close.setAttribute('aria-label','收起侧栏');
      close.addEventListener('click',()=>ctx.layout.toggleSidebar()); tools.append(details,close); sidebar.appendChild(tools);
    }
    function clearAvatarExits(){
      for(const exit of avatarExits){exit.animation.cancel();exit.element.remove();}
      avatarExits.clear();
    }
    function createAvatarExit(button,before,opacity){
      const ghost=button.cloneNode(true),origin=stage.getBoundingClientRect(),scale=(artRect()?.width||ART_W)/ART_W;
      ghost.classList.add('whale-bot-exiting');ghost.setAttribute('aria-hidden','true');ghost.removeAttribute('aria-current');ghost.removeAttribute('title');ghost.tabIndex=-1;ghost.inert=true;
      Object.assign(ghost.style,{left:`${before.left-origin.left}px`,top:`${before.top-origin.top}px`,width:`${before.width}px`,height:`${before.height}px`,transform:'none',transformOrigin:'top left'});
      stage.appendChild(ghost);
      const dx=20*scale,dy=4*scale,shrink=.86;
      const after={left:before.left-dx,top:before.top-dy,right:before.left-dx+before.width*shrink,bottom:before.top-dy+before.height*shrink};
      const animation=ghost.animate([{opacity,transform:'none'},{opacity:0,transform:`translate(${-dx}px,${-dy}px) scale(${shrink})`}],{duration:280,easing:'cubic-bezier(.4,0,.8,1)',fill:'forwards'});
      animation.pause();
      const exit={element:ghost,animation,bounds:animationBounds(before,after)};avatarExits.add(exit);
      const remove=()=>{ghost.remove();avatarExits.delete(exit);scheduleShape();};animation.finished.then(remove,remove);
      return exit;
    }
    function renderBots() {
      if (!stage) return;
      const source = rows();
      const signature = source.map((row) => [rowId(row), row.getAttribute('aria-label'), row.getAttribute('aria-current'),avatarKey(row.querySelector('.bt-mark[data-shape]'))].join('|')).join('\n');
      if (signature === lastBotSignature) return;
      lastBotSignature = signature;
      const previousButtons=Array.from(stage.querySelectorAll('.whale-bot:not(.whale-bot-exiting)'));
      const previous=previousButtons.map(button=>({button,bounds:button.getBoundingClientRect(),opacity:Number(getComputedStyle(button).opacity)}));
      const previousRects=new Map(previous.map(({button,bounds})=>[button.dataset.conversationId,bounds]));
      const active=Math.max(0,source.findIndex(row=>row.getAttribute('aria-current')==='page'));
      const ordered=source.slice(active).concat(source.slice(0,active)),visibleIds=new Set(ordered.slice(0,5).map(rowId));
      const animate=!modePending && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const motionGeneration=++avatarMotionGeneration;avatarMotionAnimations.forEach(animation=>animation.cancel());avatarMotionAnimations=[];avatarMotionRects=[];
      const focused = stage.contains(document.activeElement) ? document.activeElement.dataset.conversationId : null;
      const exits=animate?previous.filter(({button,bounds,opacity})=>!visibleIds.has(button.dataset.conversationId)&&bounds.width&&bounds.height&&opacity>0).map(({button,bounds,opacity})=>createAvatarExit(button,bounds,opacity)):[];
      stage.querySelectorAll('.whale-bot:not(.whale-bot-exiting),.whale-more,.whale-more-panel').forEach((button) => button.remove());
      ordered.slice(0,5).forEach((row) => {
        const id=rowId(row);
        const button = document.createElement('button'); button.type = 'button'; button.className = 'whale-bot';
        button.dataset.conversationId = id;
        const label = rowName(row);
        button.setAttribute('aria-label', label); button.title = label; button.dataset.name=label;
        if (row.getAttribute('aria-current')) button.setAttribute('aria-current', row.getAttribute('aria-current'));
        const originalGroup=row.dataset.roomId && row.querySelector('.bt-cluster,.bt-stack');
        if (originalGroup) {
          button.dataset.room='';
          Array.from(originalGroup.querySelectorAll('.bt-mark[data-shape]')).slice(0,4).forEach((mark,index)=>{
            const part=cloneMark(mark);part.style.width='65%';part.style.height='65%';
            part.classList.add('whale-group-part');part.setAttribute('aria-hidden','true');
            part.style.left=[0,35,18,35][index]+'%';part.style.top=[0,16,35,35][index]+'%';part.style.zIndex=String(index);button.appendChild(part);
          });
        } else {
          button.appendChild(nativeAvatar(row));
        }
        button.addEventListener('click', () => { const current = rows().find((item) => rowId(item) === id); if (current) { current.click(); if (context && !frame.hasAttribute('data-sidebar-collapsed')) context.layout.toggleSidebar(); } });
        button.addEventListener('dragstart',event=>event.preventDefault());
        stage.appendChild(button);
      });
      if(ordered.length) {
        const more=document.createElement('button');more.type='button';more.className='whale-more';more.setAttribute('aria-label','其他对话');more.setAttribute('aria-haspopup','dialog');more.setAttribute('aria-expanded','false');
        const panel=document.createElement('div');panel.className='whale-more-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','其他对话');panel.hidden=true;
        ordered.slice(5).forEach(row=>{
          const entry=document.createElement('button');entry.type='button';entry.textContent=rowName(row);
          entry.prepend(nativeAvatar(row));
          entry.addEventListener('click',()=>{const current=rows().find(item=>rowId(item)===rowId(row));current?.click();panel.hidden=true;more.setAttribute('aria-expanded','false');});panel.appendChild(entry);
        });
        if(ordered.length<=5){const empty=document.createElement('div');empty.textContent='暂无其他 Bot';empty.style.cssText='padding:12px;color:#626b80;font:13px system-ui';panel.appendChild(empty);}
        more.addEventListener('click',()=>{panel.hidden=!panel.hidden;more.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)panel.querySelector('button')?.focus();});
        stage.append(more,panel);
      }
      if(focused) Array.from(stage.querySelectorAll('.whale-bot:not(.whale-bot-exiting)')).find(button=>button.dataset.conversationId===focused)?.focus({preventScroll:true});
      const rect = artRect(); if (rect) positionBots(rect);
      const animations=[];
      if(animate && previousRects.size) {
        stage.querySelectorAll('.whale-bot:not(.whale-bot-exiting)').forEach(button=>{
          const before=previousRects.get(button.dataset.conversationId),after=button.getBoundingClientRect();
          if(!after.width || !after.height)return;
          const start=before && before.width && before.height ? before : {left:after.left+20,top:after.top,right:after.right+20,bottom:after.bottom};
          avatarMotionRects.push(animationBounds(start,after));
          const animation=before && before.width ? button.animate([{transform:`translate(${before.left-after.left}px,${before.top-after.top}px) scale(${before.width/after.width})`},{transform:'none'}],{duration:320,easing:'cubic-bezier(.22,.7,.25,1)',fill:'none'}) : button.animate([{opacity:0,transform:'translateX(20px)'},{opacity:1,transform:'none'}],{duration:260,easing:'ease-out'});
          animation.pause();animations.push(animation);
        });
      }
      if(animations.length || exits.length){
        avatarMotionAnimations=animations;
        const ready=typeof window.dshWindow?.setShape==='function' ? updateShape() : undefined;
        Promise.resolve(ready).then(()=>{
          if(disposed)return;
          if(motionGeneration===avatarMotionGeneration)animations.forEach(animation=>animation.play());
          exits.forEach(exit=>{if(avatarExits.has(exit))exit.animation.play();});
        });
        Promise.allSettled(animations.map(animation=>animation.finished)).then(()=>{if(!disposed && motionGeneration===avatarMotionGeneration){avatarMotionAnimations=[];avatarMotionRects=[];scheduleShape();}});
      }
    }
    function positionBots(rect) {
      const buttons = Array.from(stage.querySelectorAll('.whale-bot:not(.whale-bot-exiting)')).sort((a,b)=>Number(b.getAttribute('aria-current')==='page')-Number(a.getAttribute('aria-current')==='page')); if (!buttons.length) return;
      const factors = [1, .80, .65, .55, .48];
      const gap = Math.max(3, rect.width * .005), available = rect.width * .40;
      const base = Math.min(rect.width * .095, (available - gap * 4) / factors.reduce((a, b) => a + b, 0));
      const startX=rect.width*415/ART_W+10-base/2;
      const backTop=x=>{const t=Math.max(0,Math.min(1,(x-startX)/(rect.width*.40)));return rect.height*.065+(x-startX)*.30+rect.height*.014*t*t;};
      let x = startX;
      const next=stage.querySelector('.whale-next');next.disabled=rows().length<2;next.style.left=`${Math.round(startX-38)}px`;next.style.top=`${Math.round(rect.height*.065+base*.5-19)}px`;
      buttons.forEach((button, index) => {
        const size = base * factors[index];
        button.style.zIndex=String(12-index);
        button.style.transformOrigin='top left';
        button.style.left = `${Math.round(x)}px`;
        button.style.top = `${Math.round(backTop(x))}px`;
        button.style.width = `${Math.round(size)}px`; button.style.height = `${Math.round(size)}px`;
        x += size + gap;
      });
      x=startX+base*factors.reduce((sum,factor)=>sum+factor,0)+gap*5;
      const more=stage.querySelector('.whale-more'),panel=stage.querySelector('.whale-more-panel');
      if(more){more.style.left=`${Math.round(x)}px`;more.style.top=`${Math.round(backTop(x)+24)}px`;panel.style.left=`${Math.min(Math.round(x),rect.width-240)}px`;panel.style.top=`${Math.round(backTop(x)+66)}px`;}
      const add=stage.querySelector('.whale-add-bot');if(add){add.style.left=`${Math.round(x+44)}px`;add.style.top=`${Math.round(backTop(x+44)+24)}px`;}
    }
    function schedule(ctx) {
      if (scheduled || disposed) return; scheduled = true;
      requestAnimationFrame(() => { scheduled = false; sync(ctx); });
    }
    function sync(ctx) {
      if (disposed) return;
      const found = findFrame(); if (!found) return;
      if(mode!=='whale'){if(frame)clearFrame(frame);return;}
      if (frame !== found) {
        if (frame) clearFrame(frame);
        frame = found; frame.setAttribute(FRAME_ATTR, ''); lastBotSignature = '';
      }
      frame.setAttribute(FRAME_ATTR,'');
      if (!started) {
        buildLayers(ctx); document.documentElement.setAttribute(READY_ATTR, ''); started = true;
        sidebarBeforeWhale=frame.hasAttribute('data-sidebar-collapsed');
        collapseTimer = setTimeout(() => {
          if (!disposed && frame && !frame.hasAttribute('data-sidebar-collapsed')) ctx.layout.toggleSidebar();
        }, 300);
      }
      installDrawerTools(ctx); layout(); renderBots(); scheduleShape();
    }
    function clearFrame(element) {
      element.removeAttribute(FRAME_ATTR);
      ['--whale-left','--whale-top','--whale-width','--whale-height'].forEach((key) => element.style.removeProperty(key));
    }
    async function setMode(next){
      if(modePending || disposed || next===mode)return;
      modePending=true;modeButton.disabled=true;
      const previous=mode;endWindowMove();
      try {
        if(collapseTimer){clearTimeout(collapseTimer);collapseTimer=null;}
        avatarMotionGeneration++;avatarMotionAnimations.forEach(a=>a.cancel());avatarMotionAnimations=[];avatarMotionRects=[];clearAvatarExits();
        if(next==='default'){
          mode='default';if(shapeFrame)cancelAnimationFrame(shapeFrame);shapeFrame=0;
          await shapePending;await window.dshWindow?.setShape?.(null);lastShape='';
          restoreMenu();if(frame)clearFrame(frame);document.documentElement.removeAttribute(READY_ATTR);
          document.documentElement.removeAttribute('data-dsh-whale-pointer-drag');
          if(frame && sidebarBeforeWhale!==null && frame.hasAttribute('data-sidebar-collapsed')!==sidebarBeforeWhale)context.layout.toggleSidebar();
        }else{
          sidebarBeforeWhale=findFrame()?.hasAttribute('data-sidebar-collapsed')??true;
          mode='whale';document.documentElement.setAttribute(READY_ATTR,'');
          if(typeof window.dshWindow?.beginMove==='function')document.documentElement.setAttribute('data-dsh-whale-pointer-drag','');
          if(!sidebarBeforeWhale)context.layout.toggleSidebar();lastBotSignature='';sync(context);
          // Let the transparent whale paint before the OS clips the old rectangular
          // surface. Clipping first briefly exposes the old white surface as a whale.
          await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
          modePending=false;await updateShape();
        }
        document.documentElement.dataset.dshUiMode=mode;
        modeButton.textContent=mode==='whale'?'默认界面':'鲸鱼界面';modeButton.setAttribute('aria-label',mode==='whale'?'切换到默认界面':'切换到鲸鱼界面');
        try{localStorage.setItem('dsh-whale-ui-mode',mode);}catch(error){report(error);}
      }catch(error){mode=previous;report(error);}
      finally{modePending=false;modeButton.disabled=false;}
    }
    function apply(ctx) {
      if(applied)return;applied=true;
      window.__dshWhaleSkin?.dispose();
      // Remove legacy hot-reload layers that predate the singleton cleanup contract.
      [STYLE,PAPER,SHELL,STAGE].forEach(id=>document.querySelectorAll('[id="'+id+'"]').forEach(element=>element.remove()));
      document.querySelectorAll('body > .whale-drag-region').forEach(element=>element.remove());
      context=ctx;
      modeButton=createElement('dsh-whale-mode','button');modeButton.type='button';modeButton.textContent='默认界面';modeButton.setAttribute('aria-label','切换到默认界面');
      modeButton.addEventListener('pointerdown',event=>event.preventDefault());modeButton.addEventListener('click',()=>setMode(mode==='whale'?'default':'whale'));document.body.appendChild(modeButton);
      document.documentElement.dataset.dshUiMode='whale';
      function closeMore(event) {
        const more=stage?.querySelector('.whale-more'),panel=stage?.querySelector('.whale-more-panel');
        if(panel && !panel.hidden && (event.key==='Escape' || (event.type==='pointerdown' && !panel.contains(event.target) && !more.contains(event.target)))) {panel.hidden=true;more.setAttribute('aria-expanded','false');if(event.key==='Escape')more.focus();}
      }
      document.addEventListener('pointerdown',closeMore);document.addEventListener('keydown',closeMore);
      if (!ctx || !ctx.layout || typeof ctx.layout.toggleSidebar !== 'function') { report('缺少 DSH 布局服务，保持原界面'); return; }
      Promise.all([loadImage(assets.shell), loadImage(assets.paper)]).then(([shellImage]) => {
        if (disposed) return;
        shapeImage=shellImage;bellyMask=createBellyMask(shellImage);dragRects=silhouetteDragRegions(shellImage);shapeRects=silhouetteDragRegions(shellImage,true);
        observer = new MutationObserver((changes) => {
          if(changes.some(change=>Array.from([...change.addedNodes,...change.removedNodes]).some(node=>node.nodeType===1 && (node.matches?.('.bt-panel,.bt-settings-layer') || node.querySelector?.('.bt-panel,.bt-settings-layer')))))scheduleShape();
          if (changes.some((change) => {
            const target = change.target.nodeType === 1 ? change.target : change.target.parentElement;
            if (stage && target && stage.contains(target)) return false;
            if (!frame || !frame.isConnected) return true;
            const sidebar = findSidebar(),botSidebar=document.querySelector('.bt-leftcol');
            return target === frame || !!(sidebar && target && sidebar.contains(target)) || !!(botSidebar && target && botSidebar.contains(target)) ||
              Array.from(change.addedNodes || []).some((node) => node.nodeType === 1 && (node.hasAttribute('data-windows-menu') || node.matches?.('.bt-leftcol') || node.querySelector?.('[data-windows-menu],.bt-leftcol')));
          })) schedule(ctx);
        });
        observer.observe(document.documentElement, { childList:true, subtree:true, attributes:true, attributeFilter:['aria-current','aria-label','data-sidebar-collapsed','src'] });
        window.addEventListener('resize', onResize);
        if (typeof ResizeObserver === 'function') { resizeObserver = new ResizeObserver(onResize); resizeObserver.observe(document.documentElement); }
        sync(ctx);
        try{if(localStorage.getItem('dsh-whale-ui-mode')==='default')setMode('default');}catch(error){report(error);}
      }).catch(report);
      function onResize() { schedule(ctx); }
      function cleanup() {
        if(disposed)return;
        disposed = true;avatarMotionGeneration++;avatarMotionAnimations.forEach(animation=>animation.cancel());avatarMotionAnimations=[];avatarMotionRects=[];clearAvatarExits(); if (collapseTimer) clearTimeout(collapseTimer);
        if(shapeFrame)cancelAnimationFrame(shapeFrame);shapeFrame=0;
        if(panelMotionFrame)cancelAnimationFrame(panelMotionFrame);panelMotionFrame=0;
        document.removeEventListener('pointerover',scheduleShape);document.removeEventListener('pointerout',scheduleShape);
        document.removeEventListener('focusin',scheduleShape);document.removeEventListener('focusout',scheduleShape);document.removeEventListener('click',scheduleShape);
        document.removeEventListener('animationstart',followPanelMotion,true);document.removeEventListener('transitionrun',followPanelMotion,true);
        for(const panel of document.querySelectorAll('.bt-panel,.bt-settings-layer'))for(const key of ['mask','mask-x','mask-y','mask-width','mask-height'])panel.style.removeProperty('--whale-panel-'+key);
        if(typeof window.dshWindow?.setShape==='function')Promise.resolve(window.dshWindow.setShape(null)).catch(report);
        endWindowMove();
        window.removeEventListener('pointermove',moveWindow);window.removeEventListener('pointerup',endWindowMove);window.removeEventListener('pointercancel',endWindowMove);window.removeEventListener('blur',endWindowMove);
        document.documentElement.removeAttribute('data-dsh-whale-pointer-drag');
        document.removeEventListener('pointerdown',closeMore);document.removeEventListener('keydown',closeMore);
        if (observer) observer.disconnect(); if (resizeObserver) resizeObserver.disconnect(); window.removeEventListener('resize', onResize);
        restoreMenu(); if (frame) clearFrame(frame); document.documentElement.removeAttribute(READY_ATTR);
        for(const key of ['left','top','width','height'])document.documentElement.style.removeProperty('--dsh-whale-dialog-'+key);
        document.querySelectorAll('.whale-drawer-tools').forEach(element=>element.remove());
        [STYLE, PAPER, SHELL, STAGE].forEach((id) => { const element = document.getElementById(id); if (element) element.remove(); });
        dragZones.forEach(zone=>zone.remove());dragZones=[];
        modeButton?.remove();document.documentElement.removeAttribute('data-dsh-ui-mode');
        if(window.__dshWhaleSkin?.dispose===cleanup)delete window.__dshWhaleSkin;
      }
      window.__dshWhaleSkin={dispose:cleanup};
      if (typeof ctx.on === 'function') ctx.on('dispose', cleanup);
    }
    return { apply, inject:['layout'] };
  }
});
