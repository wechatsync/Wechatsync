const r=`
  @keyframes wcs-pulse {
    0%, 100% { box-shadow: 0 4px 12px rgba(7,193,96,0.35); }
    50% { box-shadow: 0 4px 20px rgba(7,193,96,0.6), 0 0 0 8px rgba(7,193,96,0.1); }
  }
`;function p(n){const{onClick:a,bottom:i="88px"}=n,t=document.createElement("div");t.id="wechatsync-fab",t.title="同步文章",t.style.cssText=`
    position: fixed !important;
    right: 24px !important;
    bottom: ${i} !important;
    height: 40px !important;
    padding: 0 16px !important;
    border-radius: 20px !important;
    background: linear-gradient(135deg, #07c160 0%, #06ad56 100%) !important;
    box-shadow: 0 4px 12px rgba(7, 193, 96, 0.35) !important;
    cursor: pointer !important;
    z-index: 2147483646 !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s !important;
    user-select: none !important;
    color: white !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    border: none !important;
  `,t.innerHTML=`
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
    </svg>
    <span style="color:white;font-size:14px;font-weight:500;">同步</span>
  `;const e=document.createElement("style");e.textContent=r,document.head.appendChild(e),t.style.animation="wcs-pulse 1.2s ease-in-out 3";const o=document.createElement("div");return o.textContent="点击同步文章到多平台",o.style.cssText=`
    position: absolute !important;
    right: 100% !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    margin-right: 10px !important;
    padding: 6px 12px !important;
    background: rgba(0,0,0,0.75) !important;
    color: white !important;
    font-size: 12px !important;
    border-radius: 6px !important;
    white-space: nowrap !important;
    pointer-events: none !important;
    opacity: 0 !important;
    transition: opacity 0.2s !important;
  `,t.appendChild(o),t.addEventListener("mouseenter",()=>{t.style.transform="scale(1.05)",t.style.boxShadow="0 6px 20px rgba(7, 193, 96, 0.45)",o.style.opacity="1"}),t.addEventListener("mouseleave",()=>{t.style.transform="scale(1)",t.style.boxShadow="0 4px 12px rgba(7, 193, 96, 0.35)",o.style.opacity="0"}),t.addEventListener("click",a),t}export{p as c};
