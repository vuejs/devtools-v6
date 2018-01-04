export function installToast (window) {
  let toastEl = null
  let toastTimer = 0

  const colors = {
    normal: '#3BA776',
    warn: '#DB6B00',
    error: '#DB2600'
  }

  window.__VUE_DEVTOOLS_TOAST__ = (message, type) => {
    const color = colors[type] || colors.normal
    console.log(`%c vue-devtools %c ${message} %c `,
      'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
      `background: ${color}; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff`,
      'background:transparent')
    if (!toastEl) {
      toastEl = document.createElement('div')
      toastEl.addEventListener('click', removeToast)
      toastEl.innerHTML = `
      <div id="vue-devtools-toast" style="
        position: fixed;
        bottom: 6px;
        left: 0;
        right: 0;
        height: 0;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        z-index: 999999999999999999999;
        font-family: Menlo, Consolas, monospace;
        font-size: 14px;
      ">
        <div class="vue-wrapper" style="
          padding: 6px 12px;
          background: ${color};
          color: white;
          border-radius: 3px;
          flex: auto 0 1;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        ">
          <div class="vue-content"></div>
        </div>
      </div>
      `
      document.body.appendChild(toastEl)
    } else {
      toastEl.querySelector('.vue-wrapper').style.background = color
    }

    toastEl.querySelector('.vue-content').innerText = message

    clearTimeout(toastTimer)
    toastTimer = setTimeout(removeToast, 5000)
  }

  function removeToast () {
    clearTimeout(toastTimer)
    if (toastEl) {
      document.body.removeChild(toastEl)
      toastEl = null
    }
  }
}
