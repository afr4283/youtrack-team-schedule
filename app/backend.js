var entities = null;
try {
  entities = require('@jetbrains/youtrack-scripting-api/entities');
} catch (e) {
  entities = null;
}

// ctx.currentUser is documented as an alias for entities.User.current, but it
// is not populated in every YouTrack version, so fall back to the entity API.
function getCurrentUser(ctx) {
  if (ctx.currentUser) return ctx.currentUser;
  try {
    if (entities && entities.User && entities.User.current) return entities.User.current;
  } catch (e) {
    // ignore
  }
  return null;
}

// Defaults must match settings.json so the backend and the settings UI agree.
var DEFAULTS = {
  language: 'en',
  managerGroup: 'Managers',
  workerGroup: 'Employees',
  absenceProjectName: '[VACATION] Leave / Absence'
};

var ABSENCE_PROJECT_ID = '__ABSENCE__';
var NOTE_KEY_PREFIX = 'note_';
var MAX_DIRECTORY_PROJECTS = 5000;
var MAX_SCHEDULE_CHANGES = 5000;
var MAX_SCHEDULE_VALUE_LENGTH = 10000;
// Cell keys are "<userKey>_<YYYY-MM-DD>"; note keys are "note_<YYYY-MM-DD>".
var SCHEDULE_KEY_PATTERN = /^.{1,255}_\d{4}-\d{2}-\d{2}$/;
// YouTrack REST entity IDs (e.g. "1-23") used as user keys before 4.5.0.
var LEGACY_USER_ID_PATTERN = /^\d+-\d+$/;

function getConfig(ctx) {
  var s = ctx.settings || {};
  return {
    language: s.language || DEFAULTS.language,
    managerGroup: s.managerGroup || DEFAULTS.managerGroup,
    workerGroup: s.workerGroup || DEFAULTS.workerGroup,
    absenceProjectName: s.absenceProjectName || DEFAULTS.absenceProjectName
  };
}

// Checks group membership of a user. Uses User.isInGroup() first and falls
// back to a case-insensitive scan of user.groups (YouTrack 2025.3+), so the
// check matches the case-insensitive lookup used in the widget.
function userInGroup(user, groupName) {
  if (!user || !groupName) return false;

  try {
    if (user.isInGroup(groupName)) return true;
  } catch (e) {
    // Group does not exist or API unavailable - fall through to the scan.
  }

  var target = String(groupName).trim().toLowerCase();
  var found = false;
  try {
    if (user.groups && typeof user.groups.forEach === 'function') {
      user.groups.forEach(function (g) {
        if (g && g.name && String(g.name).trim().toLowerCase() === target) {
          found = true;
        }
      });
    }
  } catch (e) {
    return false;
  }
  return found;
}

function isAnonymous(user) {
  if (!user) return true;
  try {
    if (user.isGuest === true) return true;
  } catch (e) {
    // property not available in this YouTrack version
  }
  return String(user.login || '').toLowerCase() === 'guest';
}

// Who may open the widget is decided by YouTrack itself through the app's
// "Visibility" setting (Administration > Apps). The backend therefore only
// distinguishes managers (edit) from everyone else (read-only) and rejects
// anonymous calls. The worker group defines whose rows are shown, not who
// may look at the schedule.
function resolveRole(ctx, config) {
  var user = getCurrentUser(ctx);
  if (isAnonymous(user)) return null;
  if (userInGroup(user, config.managerGroup)) return 'MANAGER';
  return 'WORKER';
}

function sendError(ctx, code, message) {
  ctx.response.code = code;
  ctx.response.json({ error: message });
}

function readBody(ctx) {
  var body = ctx.request.json();
  if (typeof body === 'string') {
    body = JSON.parse(body);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Payload must be a JSON object.');
  }
  return body;
}

// The widget sends per-cell changes, each with the value it expects the cell
// to hold right now ("from") and the new value ("to"; empty clears the cell).
// The server merges them into the current schedule, so managers editing
// different cells never overwrite each other. Whole-schedule bodies from
// widget versions before 4.5.0 are rejected, because saving them would revert
// other managers' changes.
function parseScheduleChanges(ctx) {
  var body = readBody(ctx);
  if (!Array.isArray(body.changes)) {
    throw new Error('Outdated widget version: reload the page to continue editing.');
  }
  if (body.changes.length > MAX_SCHEDULE_CHANGES) throw new Error('Too many changes.');

  return body.changes.map(function (change, index) {
    if (!change || typeof change !== 'object') throw new Error('Change #' + index + ' is not an object.');
    var key = change.key;
    if (typeof key !== 'string' || !SCHEDULE_KEY_PATTERN.test(key)) {
      throw new Error('Change #' + index + ' has an invalid key.');
    }
    ['from', 'to'].forEach(function (field) {
      var value = change[field];
      if (value !== undefined && value !== null && typeof value !== 'string') {
        throw new Error('Change #' + index + ': "' + field + '" must be a string.');
      }
      if (typeof value === 'string' && value.length > MAX_SCHEDULE_VALUE_LENGTH) {
        throw new Error('Change #' + index + ': "' + field + '" is too long.');
      }
    });
    return { key: key, from: change.from || '', to: change.to || '' };
  });
}

// Applies changes in order. A change whose cell already holds the target value
// counts as applied (this makes client retries safe). A change whose cell
// holds neither the expected nor the target value was edited by someone else
// in the meantime; it is skipped and reported as a conflict.
function applyScheduleChanges(schedule, changes) {
  var conflicts = [];
  var changed = false;
  changes.forEach(function (change) {
    var current = schedule[change.key] || '';
    if (current === change.to) return;
    if (current !== change.from) {
      conflicts.push(change.key);
      return;
    }
    if (change.to) {
      schedule[change.key] = change.to;
    } else {
      delete schedule[change.key];
    }
    changed = true;
  });
  return { conflicts: conflicts, changed: changed };
}

function readSchedule(ctx) {
  try {
    var raw = ctx.globalStorage.extensionProperties.scheduleData;
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

// Since 4.5.0 workers are identified by their Hub ID (User.ringId), which the
// backend can read for every group member. Earlier versions keyed cells by
// YouTrack REST IDs, which only the browser knew; the roster cached in the
// directory maps those IDs to logins, and logins map to Hub IDs. Unmapped
// keys are kept as they are. The migrated schedule is persisted on the next
// write.
function migrateLegacyKeys(ctx, schedule) {
  var legacyKeys = Object.keys(schedule).filter(function (key) {
    return LEGACY_USER_ID_PATTERN.test(key.substring(0, key.length - 11));
  });
  if (legacyKeys.length === 0 || !entities || !entities.User) return false;

  var loginByRestId = {};
  readDirectory(ctx).workers.forEach(function (w) {
    if (w && w.id && w.login) loginByRestId[w.id] = w.login;
  });

  var hubIdByRestId = {};
  var migrated = false;
  legacyKeys.forEach(function (key) {
    var restId = key.substring(0, key.length - 11);
    if (!(restId in hubIdByRestId)) {
      hubIdByRestId[restId] = null;
      var login = loginByRestId[restId];
      if (login) {
        try {
          var user = entities.User.findByLogin(login);
          if (user) hubIdByRestId[restId] = workerKey(user);
        } catch (e) {
          // leave unmapped
        }
      }
    }
    var newUserKey = hubIdByRestId[restId];
    if (!newUserKey) return;
    var newKey = newUserKey + key.substring(key.length - 11);
    if (!(newKey in schedule)) schedule[newKey] = schedule[key];
    delete schedule[key];
    migrated = true;
  });
  return migrated;
}

function writeSchedule(ctx, schedule) {
  ctx.globalStorage.extensionProperties.scheduleData = JSON.stringify(schedule);
}

// --- WORKER ROSTER ---
//
// The roster is read live from the worker group on the server. This does not
// depend on the viewer's permissions (reading groups through the REST API
// requires Low-level Admin Read or Update Project in some project).

function workerKey(user) {
  var hubId = '';
  try {
    hubId = user.ringId || '';
  } catch (e) {
    hubId = '';
  }
  return hubId || ('login:' + user.login);
}

function readWorkerRoster(groupName) {
  var result = { groupFound: false, workers: [] };
  if (!entities || !entities.UserGroup || !groupName) return result;

  var group = null;
  try {
    group = entities.UserGroup.findByName(String(groupName).trim());
  } catch (e) {
    group = null;
  }
  if (!group) return result;

  result.groupFound = true;
  try {
    group.users.forEach(function (user) {
      if (!user || !user.login) return;
      result.workers.push({
        id: workerKey(user),
        login: user.login,
        fullName: user.fullName || user.visibleName || user.login
      });
    });
  } catch (e) {
    // keep what was collected
  }
  result.workers.sort(function (a, b) {
    var x = a.fullName.toLowerCase();
    var y = b.fullName.toLowerCase();
    return x < y ? -1 : (x > y ? 1 : 0);
  });
  return result;
}

// Weekly notes are manager-only content, so they are not sent to other roles.
function withoutNotes(schedule) {
  var result = {};
  Object.keys(schedule || {}).forEach(function (key) {
    if (key.indexOf(NOTE_KEY_PREFIX) !== 0) result[key] = schedule[key];
  });
  return result;
}

// --- SHARED DIRECTORY (project names and worker roster) ---
//
// The schedule stores YouTrack REST IDs. The scripting API cannot list all
// projects or expose REST IDs, so the widget of every manager publishes the
// projects and worker-group members it can see. The union is kept in global
// storage and served to every viewer, independent of their own permissions.
// The backend refreshes names and the archived flag from live entities, which
// it can read regardless of the caller's project permissions.

function cleanString(value, maxLength) {
  if (typeof value !== 'string') return '';
  var trimmed = value.trim();
  return trimmed.length > maxLength ? trimmed.substring(0, maxLength) : trimmed;
}

function sanitizeProject(p) {
  if (!p || typeof p !== 'object') return null;
  var id = cleanString(p.id, 64);
  var name = cleanString(p.name, 255);
  if (!id || !name || id === ABSENCE_PROJECT_ID) return null;
  return {
    id: id,
    name: name,
    shortName: cleanString(p.shortName, 64),
    archived: p.archived === true,
    deleted: false
  };
}

function readDirectory(ctx) {
  var data = null;
  try {
    var raw = ctx.globalStorage.extensionProperties.directoryData;
    data = raw ? JSON.parse(raw) : null;
  } catch (e) {
    data = null;
  }
  data = data && typeof data === 'object' ? data : {};
  return {
    projects: Array.isArray(data.projects) ? data.projects : [],
    workers: Array.isArray(data.workers) ? data.workers : []
  };
}

function writeDirectory(ctx, directory) {
  var serialized = JSON.stringify({
    projects: directory.projects,
    workers: directory.workers
  });
  // Avoid a write transaction on every manager visit when nothing changed.
  if (ctx.globalStorage.extensionProperties.directoryData !== serialized) {
    ctx.globalStorage.extensionProperties.directoryData = serialized;
  }
}

function findLiveProject(entry) {
  if (!entities || !entities.Project) return null;
  try {
    if (entry.shortName) {
      var byKey = entities.Project.findByKey(entry.shortName);
      if (byKey) return byKey;
    }
  } catch (e) {
    // ignore and try by name
  }
  try {
    if (entry.name) {
      var byName = entities.Project.findByName(entry.name);
      if (byName) return byName;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function refreshFromLive(entry, project) {
  var key = '';
  try {
    key = project.key || project.shortName || '';
  } catch (e) {
    key = '';
  }
  return {
    id: entry.id,
    name: project.name || entry.name,
    shortName: key || entry.shortName,
    archived: project.isArchived === true,
    deleted: false
  };
}

function byId(a, b) {
  return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
}

// Incoming entries come from a manager who can see these projects right now,
// so they win. Stored entries the manager could not see are kept (another
// manager published them) unless the project no longer exists - those are
// flagged as deleted instead of removed, so the schedule still shows a label.
function mergeProjects(stored, incoming) {
  var map = {};
  incoming.forEach(function (p) { map[p.id] = p; });

  stored.forEach(function (old) {
    if (!old || !old.id || map[old.id]) return;
    var live = findLiveProject(old);
    if (live) {
      map[old.id] = refreshFromLive(old, live);
    } else {
      map[old.id] = {
        id: old.id,
        name: old.name,
        shortName: old.shortName || '',
        archived: old.archived === true,
        deleted: true
      };
    }
  });

  return Object.keys(map).map(function (k) { return map[k]; }).sort(byId);
}

function parseDirectoryPayload(ctx) {
  var body = readBody(ctx);
  var result = {};

  if (body.projects !== undefined) {
    if (!Array.isArray(body.projects)) throw new Error('"projects" must be an array.');
    if (body.projects.length > MAX_DIRECTORY_PROJECTS) throw new Error('Too many projects.');
    result.projects = body.projects.map(sanitizeProject).filter(Boolean);
  }
  // "workers" from widget versions before 4.5.0 is ignored: the roster is now
  // read on the server, and the stored copy is only used to migrate old keys.
  return result;
}

// --- HOLIDAYS ---
//
// Managers generate public holidays per year in the widget (date-holidays,
// loaded only in the editor) and save them here as a fixed list, so the
// schedule never computes holidays at runtime. Names are stored in every UI
// language; custom company days off carry a single name.

var HOLIDAY_LANGUAGES = ['en', 'pl', 'de', 'es'];
var HOLIDAY_SOURCES = ['import', 'custom'];
var MAX_HOLIDAYS_PER_YEAR = 366;

function emptyHolidays() {
  return { country: '', state: '', region: '', types: ['public'], years: {} };
}

function readHolidays(ctx) {
  var data = null;
  try {
    var raw = ctx.globalStorage.extensionProperties.holidaysData;
    data = raw ? JSON.parse(raw) : null;
  } catch (e) {
    data = null;
  }
  if (!data || typeof data !== 'object') return emptyHolidays();
  var result = emptyHolidays();
  result.country = typeof data.country === 'string' ? data.country : '';
  result.state = typeof data.state === 'string' ? data.state : '';
  result.region = typeof data.region === 'string' ? data.region : '';
  result.types = Array.isArray(data.types) ? data.types : ['public'];
  result.years = data.years && typeof data.years === 'object' ? data.years : {};
  return result;
}

function sanitizeHolidayEntry(entry, year) {
  if (!entry || typeof entry !== 'object') return null;
  var date = cleanString(entry.date, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date.substring(0, 4) !== year) return null;

  var names = {};
  var hasName = false;
  if (entry.names && typeof entry.names === 'object') {
    HOLIDAY_LANGUAGES.forEach(function (lang) {
      var name = cleanString(entry.names[lang], 200);
      if (name) {
        names[lang] = name;
        hasName = true;
      }
    });
  }
  if (!hasName) return null;

  return {
    date: date,
    names: names,
    source: HOLIDAY_SOURCES.indexOf(entry.source) >= 0 ? entry.source : 'custom',
    type: cleanString(entry.type, 20)
  };
}

function parseHolidaysPayload(ctx) {
  var body = readBody(ctx);
  var year = cleanString(String(body.year || ''), 4);
  var yearNum = parseInt(year, 10);
  if (!/^\d{4}$/.test(year) || yearNum < 1970 || yearNum > 2100) {
    throw new Error('"year" must be a year between 1970 and 2100.');
  }

  var entries = null;
  if (body.entries !== null) {
    if (!Array.isArray(body.entries)) throw new Error('"entries" must be an array or null.');
    if (body.entries.length > MAX_HOLIDAYS_PER_YEAR) throw new Error('Too many holidays.');
    entries = body.entries
      .map(function (e) { return sanitizeHolidayEntry(e, year); })
      .filter(Boolean)
      .sort(function (a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
  }

  var types = Array.isArray(body.types)
    ? body.types.map(function (t) { return cleanString(t, 20); }).filter(Boolean).slice(0, 10)
    : null;

  return {
    year: year,
    entries: entries,
    country: cleanString(body.country, 10),
    state: cleanString(body.state, 20),
    region: cleanString(body.region, 20),
    types: types
  };
}

exports.httpHandler = {
  endpoints: [
    {
      method: 'GET',
      path: 'schedule-api',
      scope: 'global',
      handle: function (ctx) {
        var config = getConfig(ctx);
        var role = resolveRole(ctx, config);
        if (!role) {
          sendError(ctx, 403, 'Access denied: the caller could not be identified.');
          return;
        }

        var data = readSchedule(ctx);
        migrateLegacyKeys(ctx, data);
        ctx.response.json(role === 'MANAGER' ? data : withoutNotes(data));
      }
    },
    {
      method: 'POST',
      path: 'schedule-api',
      scope: 'global',
      handle: function (ctx) {
        var config = getConfig(ctx);
        if (resolveRole(ctx, config) !== 'MANAGER') {
          sendError(ctx, 403, 'Access denied: only members of the manager group can modify the schedule.');
          return;
        }

        var changes;
        try {
          changes = parseScheduleChanges(ctx);
        } catch (e) {
          sendError(ctx, 400, 'Invalid request: ' + e.message);
          return;
        }

        try {
          // Read, merge and write happen in this request's transaction, so
          // the merge always starts from the latest saved schedule.
          var schedule = readSchedule(ctx);
          var migrated = migrateLegacyKeys(ctx, schedule);
          var result = applyScheduleChanges(schedule, changes);
          if (result.changed || migrated) writeSchedule(ctx, schedule);
          // The full current schedule lets the widget pick up other managers'
          // changes along with its own.
          ctx.response.json({ success: true, conflicts: result.conflicts, schedule: schedule });
        } catch (e) {
          sendError(ctx, 500, 'Failed to save the schedule: ' + e.toString());
        }
      }
    },
    {
      method: 'GET',
      path: 'directory-api',
      scope: 'global',
      handle: function (ctx) {
        var config = getConfig(ctx);
        if (!resolveRole(ctx, config)) {
          sendError(ctx, 403, 'Access denied: the caller could not be identified.');
          return;
        }

        var directory = readDirectory(ctx);

        var projects = directory.projects.map(function (p) {
          if (!p || !p.id) return null;
          if (p.deleted) return p;
          var live = findLiveProject(p);
          return live ? refreshFromLive(p, live) : p;
        }).filter(Boolean);

        var roster = readWorkerRoster(config.workerGroup);

        ctx.response.json({
          projects: projects,
          workers: roster.workers,
          workerGroup: config.workerGroup,
          workerGroupFound: roster.groupFound
        });
      }
    },
    {
      method: 'POST',
      path: 'directory-api',
      scope: 'global',
      handle: function (ctx) {
        var config = getConfig(ctx);
        if (resolveRole(ctx, config) !== 'MANAGER') {
          sendError(ctx, 403, 'Access denied: only members of the manager group can update the directory.');
          return;
        }

        var payload;
        try {
          payload = parseDirectoryPayload(ctx);
        } catch (e) {
          sendError(ctx, 400, 'Invalid request: ' + e.message);
          return;
        }

        try {
          var current = readDirectory(ctx);
          writeDirectory(ctx, {
            projects: payload.projects
              ? mergeProjects(current.projects, payload.projects)
              : current.projects,
            workers: current.workers
          });
          ctx.response.json({ success: true });
        } catch (e) {
          sendError(ctx, 500, 'Failed to save the directory: ' + e.toString());
        }
      }
    },
    {
      method: 'POST',
      path: 'holidays-api',
      scope: 'global',
      handle: function (ctx) {
        var config = getConfig(ctx);
        if (resolveRole(ctx, config) !== 'MANAGER') {
          sendError(ctx, 403, 'Access denied: only members of the manager group can edit holidays.');
          return;
        }

        var payload;
        try {
          payload = parseHolidaysPayload(ctx);
        } catch (e) {
          sendError(ctx, 400, 'Invalid request: ' + e.message);
          return;
        }

        try {
          var data = readHolidays(ctx);
          if (payload.entries === null) {
            delete data.years[payload.year];
          } else {
            data.years[payload.year] = {
              entries: payload.entries,
              country: payload.country,
              state: payload.state,
              region: payload.region
            };
          }
          // The last region and types used become the editor defaults.
          if (payload.country) {
            data.country = payload.country;
            data.state = payload.state;
            data.region = payload.region;
          }
          if (payload.types) data.types = payload.types;

          ctx.globalStorage.extensionProperties.holidaysData = JSON.stringify(data);
          ctx.response.json({ success: true, holidays: data });
        } catch (e) {
          sendError(ctx, 500, 'Failed to save holidays: ' + e.toString());
        }
      }
    },
    {
      method: 'GET',
      path: 'config-api',
      scope: 'global',
      handle: function (ctx) {
        var config = getConfig(ctx);
        var user = getCurrentUser(ctx);

        ctx.response.json({
          language: config.language,
          managerGroup: config.managerGroup,
          workerGroup: config.workerGroup,
          absenceProjectName: config.absenceProjectName,
          // Role is resolved on the server so the widget and the API use
          // exactly the same authorization rule.
          role: resolveRole(ctx, config),
          currentUserLogin: user ? user.login : null,
          // Saved holidays travel with the configuration, so the schedule
          // needs no extra request and computes nothing at runtime.
          holidays: readHolidays(ctx),
          // Diagnostics: false means the backend could not identify the caller.
          userResolved: !!user
        });
      }
    }
  ]
};
