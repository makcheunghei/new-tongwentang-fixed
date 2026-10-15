window.show = function (platform, enabled, canOpenSettings) {
  document.body.dataset.platform = platform;
  document.querySelector('#open-settings').hidden = !canOpenSettings;
  if (platform === 'mac' && typeof enabled === 'boolean') {
    document.querySelector('#extension-state').textContent = enabled
      ? 'Safari 延伸功能已啟用。請在需要轉換的網站允許存取權限。'
      : 'Safari 延伸功能尚未啟用。請前往 Safari 延伸功能設定開啟。';
  }
};
window.settingsFailed = function () {
  document.querySelector('#notice').textContent = '暫時無法自動開啟設定，請依照上方步驟手動啟用。';
};
document.querySelector('#open-settings').addEventListener('click', () => {
  window.webkit.messageHandlers.controller.postMessage('open-settings');
});
