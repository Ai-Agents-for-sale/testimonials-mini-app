const tg = typeof window !== 'undefined' && window.Telegram ? window.Telegram.WebApp : null;

export function initTelegram() {
  if (tg) {
    try { tg.ready(); } catch (_) {}
    try { tg.expand(); } catch (_) {}
  }
}

export function getClientInfo() {
  const info = { chatId: '', clientName: '' };

  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    const user = tg.initDataUnsafe.user;
    info.chatId = String(user.id || '');
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    info.clientName = (firstName + ' ' + lastName).trim();
  }

  const params = new URLSearchParams(window.location.search);
  if (!info.chatId) info.chatId = params.get('chatId') || '';
  if (!info.clientName) info.clientName = params.get('clientName') || '';

  return info;
}

export function haptic(type = 'light') {
  if (tg && tg.HapticFeedback) {
    try { tg.HapticFeedback.impactOccurred(type); } catch (_) {}
  }
}
