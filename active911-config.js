(function initActive911Config(global) {
  const params = new URLSearchParams(global.location?.search || '');
  const fromQuery = Number(params.get('takeoverMinutes') || params.get('durationMinutes'));
  const takeoverMinutes = Number.isFinite(fromQuery) && fromQuery > 0 ? fromQuery : 5;

  global.ACTIVE911_CONFIG = {
    takeoverMinutes,
    takeoverMs: takeoverMinutes * 60 * 1000
  };
})(window);
