(function initActive911Config(global) {
  const params = new URLSearchParams(global.location?.search || '');
  const fromQuery = Number(params.get('takeoverMinutes') || params.get('durationMinutes'));
  const takeoverMinutes = Number.isFinite(fromQuery) && fromQuery > 0 ? fromQuery : 5;
  const pollMs = Number(params.get('pollMs'));
  const monitorPollMs = Number.isFinite(pollMs) && pollMs >= 1000 ? pollMs : 5000;

  global.ACTIVE911_CONFIG = {
    takeoverMinutes,
    takeoverMs: takeoverMinutes * 60 * 1000,
    pollMs: monitorPollMs
  };
})(window);
