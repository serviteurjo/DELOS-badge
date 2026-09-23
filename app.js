const canvas = document.getElementById('badgeCanvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('photoInput');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const zoomSlider = document.getElementById('zoomSlider');
const zoomValue = document.getElementById('zoomValue');
const photoControls = document.getElementById('photoControls');
const emptyOverlay = document.getElementById('emptyOverlay');
const previewTip = document.getElementById('previewTip');
const resetBtn = document.getElementById('resetBtn');
const removeBtn = document.getElementById('removeBtn');

const TEMPLATE = 'assets/template.png';
const PHOTO = { x:280, y:298, w:520, h:520, r:30 };

const template = new Image();
let photo = new Image();
let hasPhoto = false;
let templateReady = false;
let zoom = 1;
let imageScale = 1;
let imageX = 0;
let imageY = 0;
let drag = null;

function setTip(msg){ previewTip.textContent = msg; }
setTip('Chargement du modèle…');

template.onload = () => {
  templateReady = true;
  render();
  if (!hasPhoto) setTip('Après ajout : fais glisser la photo pour la positionner.');
  // Re-render once premium script font is ready (for "J'y serai !").
  if (document.fonts?.ready) document.fonts.ready.then(() => render());
};
template.onerror = () => {
  setTip("Modèle introuvable (assets/template.png). Ouvre le site depuis la racine du projet ou via le lien Netlify.");
  const label = emptyOverlay.querySelector('strong');
  if (label) label.textContent = 'Modèle introuvable';
};
template.src = TEMPLATE;

function fitScale(img){
  return Math.max(PHOTO.w / img.naturalWidth, PHOTO.h / img.naturalHeight);
}
function resetPhoto(){
  if(!hasPhoto) return;
  imageScale = fitScale(photo);
  zoom = 1;
  imageX = PHOTO.x + PHOTO.w/2;
  imageY = PHOTO.y + PHOTO.h/2;
  zoomSlider.value = zoom;
  zoomValue.value = `${zoom.toFixed(2)}×`;
  render();
}
function roundedRectPath(c,x,y,w,h,r){
  c.beginPath();
  c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r);
  c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath();
}
function drawPhoto(c){
  if(!hasPhoto) return;
  const s=imageScale*zoom;
  const w=photo.naturalWidth*s, h=photo.naturalHeight*s;
  // Soft premium glow behind photo (like reference, no hard frames).
  c.save();
  roundedRectPath(c,PHOTO.x,PHOTO.y,PHOTO.w,PHOTO.h,PHOTO.r);
  c.shadowColor='rgba(255,255,255,.85)';
  c.shadowBlur=55;
  c.fillStyle='rgba(255,255,255,.18)';
  c.fill();
  c.restore();
  c.save();
  roundedRectPath(c,PHOTO.x,PHOTO.y,PHOTO.w,PHOTO.h,PHOTO.r); c.clip();
  // gentle depth shadow under photo for premium lift
  c.shadowColor='rgba(40,10,40,.35)'; c.shadowBlur=40; c.shadowOffsetY=14;
  c.drawImage(photo,imageX-w/2,imageY-h/2,w,h);
  c.shadowColor='transparent'; c.shadowBlur=0; c.shadowOffsetY=0;
  // very light cinematic veil, keeps skin tones natural
  const g=c.createLinearGradient(0,PHOTO.y,0,PHOTO.y+PHOTO.h);
  g.addColorStop(0,'rgba(255,255,255,.03)'); g.addColorStop(1,'rgba(31,20,54,.10)');
  c.fillStyle=g; c.fillRect(PHOTO.x,PHOTO.y,PHOTO.w,PHOTO.h);
  c.restore();
  // NO stroke: no double frames, clean insertion like the reference.
}
function drawJySerai(c){
  // Premium script caption under the photo. Only text kept on badge.
  const label = "J'y serai !";
  const cx = PHOTO.x + PHOTO.w / 2;
  const cy = PHOTO.y + PHOTO.h + 78;
  c.save();
  c.textAlign='center'; c.textBaseline='middle';
  c.shadowColor='rgba(60,10,40,.45)'; c.shadowBlur=18; c.shadowOffsetY=4;
  c.fillStyle='#ffffff';
  // Great Vibes (premium script) with elegant fallbacks
  let size = 104;
  c.font = `${size}px "Great Vibes","Playfair Display","Brush Script MT","Snell Roundhand",cursive`;
  // shrink if too wide for badge
  const maxW = 640;
  const w = c.measureText(label).width;
  if (w > maxW) {
    size = Math.floor(size * maxW / w);
    c.font = `${size}px "Great Vibes","Playfair Display","Brush Script MT","Snell Roundhand",cursive`;
  }
  c.fillText(label, cx, cy);
  c.restore();
}
function render(){
  ctx.clearRect(0,0,1080,1080);
  if(templateReady) ctx.drawImage(template,0,0,1080,1080);
  drawPhoto(ctx);
  if(hasPhoto) drawJySerai(ctx);
}
function pointerPosition(e){
  const rect=canvas.getBoundingClientRect();
  return {x:(e.clientX-rect.left)*1080/rect.width,y:(e.clientY-rect.top)*1080/rect.width};
}
canvas.addEventListener('pointerdown',e=>{
  if(!hasPhoto) return;
  drag={...pointerPosition(e),startX:imageX,startY:imageY};
  canvas.setPointerCapture(e.pointerId); canvas.classList.add('dragging');
});
canvas.addEventListener('pointermove',e=>{
  if(!drag) return;
  const p=pointerPosition(e); imageX=drag.startX+(p.x-drag.x); imageY=drag.startY+(p.y-drag.y); render();
});
canvas.addEventListener('pointerup',()=>{drag=null;canvas.classList.remove('dragging')});
canvas.addEventListener('pointercancel',()=>{drag=null;canvas.classList.remove('dragging')});
zoomSlider.addEventListener('input',()=>{zoom=Number(zoomSlider.value);zoomValue.value=`${zoom.toFixed(2)}×`;render()});
resetBtn.addEventListener('click',resetPhoto);
removeBtn.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',e=>{
  const file=e.target.files?.[0]; if(!file) return;
  if(!file.type.startsWith('image/')) return;
  const url=URL.createObjectURL(file);
  const img=new Image();
  img.onload=()=>{
    photo=img; hasPhoto=true; photoControls.hidden=false; emptyOverlay.style.display='none';
    downloadBtn.disabled=false; shareBtn.disabled=false; setTip('Glisse la photo pour la positionner · utilise le zoom si nécessaire.');
    resetPhoto(); URL.revokeObjectURL(url);
  };
  img.onerror=()=>{
    URL.revokeObjectURL(url);
    setTip("Cette image est illisible. Essaie un fichier JPG ou PNG.");
  };
  img.src=url;
});
function makeBlob(){
  return new Promise(resolve=>canvas.toBlob(resolve,'image/png',1));
}
function exportFailed(){
  if (location.protocol === 'file:') {
    alert("Export bloqué : la page a été ouverte en fichier local. Ouvre-la via un serveur local (python3 -m http.server) ou via le lien Netlify, puis réessaie.");
  } else {
    alert("L'export a échoué. Recharge la page et réessaie.");
  }
}
downloadBtn.addEventListener('click',async()=>{
  const blob=await makeBlob(); if(!blob){ exportFailed(); return; }
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='badge-delos-2026.png'; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
});
shareBtn.addEventListener('click',async()=>{
  const blob=await makeBlob(); if(!blob){ exportFailed(); return; }
  const file=new File([blob],'badge-delos-2026.png',{type:'image/png'});
  if(navigator.canShare?.({files:[file]}) && navigator.share){
    try{ await navigator.share({title:'Je serai à la Conférence DELOS 2026',text:'Rendez-vous à la Conférence DELOS — Média, Cinéma & IA.',files:[file]}); }catch(e){}
  }else{
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='badge-delos-2026.png'; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    alert('Le partage direct n’est pas disponible sur ce navigateur. Le badge a été préparé pour téléchargement.');
  }
});
