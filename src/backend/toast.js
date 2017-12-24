export function installToast (window) {
  let toastEl = null
  let toastTimer = 0

  window.__VUE_DEVTOOLS_TOAST = (message) => {
    console.log('%c vue-devtools ', 'background:#35495e ; padding: 1px; border-radius: 3px;  color: #fff', message)
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
        font-family: monospace;
        font-size: 14px;
      ">
        <div style="
          padding: 6px 12px;
          background: #3BA776;
          color: white;
          border-radius: 3px;
          flex: auto 0 0;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        ">
          <div class="vue-content"></div>
        </div>
      </div>
      `
      document.body.appendChild(toastEl)
    }

    toastEl.querySelector('.vue-content').innerHTML = message

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
