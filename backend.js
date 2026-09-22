exports.httpHandler = {
  endpoints: [
    {
      method: 'GET',
      path: 'schedule-api',
      scope: 'global',
      handle: function(ctx) {
        var data = {};
        try {
          var raw = ctx.globalStorage.extensionProperties.scheduleData;
          data = raw ? JSON.parse(raw) : {};
        } catch (e) {}
        ctx.response.json(data);
      }
    },
    {
      method: 'POST',
      path: 'schedule-api',
      scope: 'global',
      handle: function(ctx) {
        try {
          var body = ctx.request.json();
          var jsonStr = typeof body === 'string' ? body : JSON.stringify(body || {});
          ctx.globalStorage.extensionProperties.scheduleData = jsonStr;
          ctx.response.json({ success: true });
        } catch (e) {
          ctx.response.status = 500;
          ctx.response.json({ error: 'Błąd zapisu: ' + e.toString() });
        }
      }
    },
    {
      method: 'GET',
      path: 'config-api',
      scope: 'global',
      handle: function(ctx) {
        var language = (ctx.settings && ctx.settings.language) ? ctx.settings.language : 'pl';
        var managerGroup = (ctx.settings && ctx.settings.managerGroup) ? ctx.settings.managerGroup : 'Managerowie';
        var workerGroup = (ctx.settings && ctx.settings.workerGroup) ? ctx.settings.workerGroup : 'Pracownicy';
        var absenceProjectName = (ctx.settings && ctx.settings.absenceProjectName) ? ctx.settings.absenceProjectName : '[WOLNE] Urlop / Nieobecność';
        
        ctx.response.json({
          language: language,
          managerGroup: managerGroup,
          workerGroup: workerGroup,
          absenceProjectName: absenceProjectName
        });
      }
    }
  ]
};