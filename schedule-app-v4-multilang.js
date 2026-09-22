import React, { useState, useEffect, useRef } from 'react';

const ABSENCE_PROJECT_ID = '__ABSENCE__';

// --- SŁOWNIKI TŁUMACZEŃ (i18n) ---
const TRANSLATIONS = {
  en: {
    title: "Team Allocation Schedule",
    viewLabel: "View",
    roleManager: "Manager (Edit)",
    roleWorker: "Worker (View)",
    view4Weeks: "4 weeks (1 prev, 2 next)",
    view3Months: "3 months",
    viewYear: "Full year",
    btnPrev: "← Previous",
    btnToday: "Today",
    btnNext: "Next →",
    btnExport: "📊 Export Year {year} (.csv)",
    navTips: "💡 Excel Navigation: Arrows ↑ ↓ ← → | Shift + Arrows / Click space (range) | Ctrl+C / Ctrl+V",
    selectedCells: "Selection: {count} cells",
    copiedItem: "Copied: {name}",
    colEmployee: "Employee",
    colNotes: "📝 Notes",
    addNotePrompt: "+ Add note...",
    savingNoteTip: "Click outside field to save",
    notePlaceholder: "Enter note for this week...",
    modalExportTitle: "Export Schedule",
    modalExportDesc: "Generate and download CSV file for year {year}?",
    modalExportTip: "Recommended to open in MS Excel with UTF-8 support.",
    btnCancel: "Cancel",
    btnDownload: "Download File",
    vacationLabel: "[VACATION] Leave / Absence",
    vacationShort: "VACATION",
    vacationConflictWarning: "⚠️ VACATION (was: {project})",
    projectDeleted: "[Project deleted]",
    deletedShort: "DELETED",
    openProjectTitle: "Open project {name} in new tab",
    accessErrorTitle: "Permission Error",
    accessErrorDesc: "Access denied for [{login}]. Application searched for groups: \"{managerGroup}\" and \"{workerGroup}\".",
    loadingTitle: "Loading application...",
    optNone: "-- None --",
    archivedTag: " [Archived]"
  },
  pl: {
    title: "Grafik Alokacji Zespołu",
    viewLabel: "Widok",
    roleManager: "Manager (Edycja)",
    roleWorker: "Pracownik (Podgląd)",
    view4Weeks: "4 tygodnie (1 poprz., 2 nast.)",
    view3Months: "3 miesiące",
    viewYear: "Pełny rok",
    btnPrev: "← Poprzedni",
    btnToday: "Dzisiaj",
    btnNext: "Następny →",
    btnExport: "📊 Eksportuj Rok {year} (.csv)",
    navTips: "💡 Nawigacja Excela: Strzałki ↑ ↓ ← → | Shift + Strzałki / Klik w pustą przestrzeń (zakres) | Ctrl+C / Ctrl+V",
    selectedCells: "Zaznaczenie: {count} kom.",
    copiedItem: "Skopiowano: {name}",
    colEmployee: "Pracownik",
    colNotes: "📝 Notatki",
    addNotePrompt: "+ Dodaj notatkę...",
    savingNoteTip: "Kliknij poza polem, aby zapisać",
    notePlaceholder: "Wpisz notatkę do tego tygodnia...",
    modalExportTitle: "Eksport grafiku",
    modalExportDesc: "Czy wygenerować oraz pobrać plik Excel (.csv) dla roku {year}?",
    modalExportTip: "Zalecamy otwieranie pobranego pliku w programie MS Excel.",
    btnCancel: "Anuluj",
    btnDownload: "Pobierz Plik",
    vacationLabel: "[WOLNE] Urlop / Nieobecność",
    vacationShort: "WOLNE",
    vacationConflictWarning: "⚠️ WOLNE (był: {project})",
    projectDeleted: "[Projekt usunięty]",
    deletedShort: "USUNIĘTY",
    openProjectTitle: "Otwórz projekt {name} w nowej karcie",
    accessErrorTitle: "Wystąpił błąd dostępu",
    accessErrorDesc: "Brak uprawnień dla [{login}]. Aplikacja szukała grup: \"{managerGroup}\" oraz \"{workerGroup}\".",
    loadingTitle: "Ładowanie aplikacji...",
    optNone: "-- Brak --",
    archivedTag: " [Zarch.]"
  },
  de: {
    title: "Team-Zuweisungsplan",
    viewLabel: "Ansicht",
    roleManager: "Manager (Bearbeiten)",
    roleWorker: "Mitarbeiter (Anzeigen)",
    view4Weeks: "4 Wochen (1 davor, 2 danach)",
    view3Months: "3 Monate",
    viewYear: "Ganzes Jahr",
    btnPrev: "← Zurück",
    btnToday: "Heute",
    btnNext: "Weiter →",
    btnExport: "📊 Jahr {year} exportieren (.csv)",
    navTips: "💡 Excel-Navigation: Pfeile ↑ ↓ ← → | Shift + Pfeile (Bereich) | Ctrl+C / Ctrl+V",
    selectedCells: "Auswahl: {count} Zellen",
    copiedItem: "Kopiert: {name}",
    colEmployee: "Mitarbeiter",
    colNotes: "📝 Notizen",
    addNotePrompt: "+ Notiz hinzufügen...",
    savingNoteTip: "Klicken Sie außerhalb zum Speichern",
    notePlaceholder: "Notiz für diese Woche eingeben...",
    modalExportTitle: "Zeitplan exportieren",
    modalExportDesc: "CSV-Datei für das Jahr {year} generieren und herunterladen?",
    modalExportTip: "Empfohlen für MS Excel.",
    btnCancel: "Abbrechen",
    btnDownload: "Datei herunterladen",
    vacationLabel: "[URLAUB] Abwesenheit",
    vacationShort: "URLAUB",
    vacationConflictWarning: "⚠️ URLAUB (war: {project})",
    projectDeleted: "[Projekt gelöscht]",
    deletedShort: "GELÖSCHT",
    openProjectTitle: "Projekt {name} in neuem Tab öffnen",
    accessErrorTitle: "Zugriffsfehler",
    accessErrorDesc: "Zugriff verweigert für [{login}]. Nach Gruppen gesucht: \"{managerGroup}\" und \"{workerGroup}\".",
    loadingTitle: "Anwendung wird geladen...",
    optNone: "-- Keine --",
    archivedTag: " [Archiviert]"
  },
  es: {
    title: "Planificación de Asignación del Equipo",
    viewLabel: "Vista",
    roleManager: "Manager (Editar)",
    roleWorker: "Empleado (Ver)",
    view4Weeks: "4 semanas (1 ant., 2 sig.)",
    view3Months: "3 meses",
    viewYear: "Año completo",
    btnPrev: "← Anterior",
    btnToday: "Hoy",
    btnNext: "Siguiente →",
    btnExport: "📊 Exportar Año {year} (.csv)",
    navTips: "💡 Navegación tipo Excel: Flechas ↑ ↓ ← → | Shift + Flechas (rango) | Ctrl+C / Ctrl+V",
    selectedCells: "Selección: {count} celdas",
    copiedItem: "Copiado: {name}",
    colEmployee: "Empleado",
    colNotes: "📝 Notas",
    addNotePrompt: "+ Añadir nota...",
    savingNoteTip: "Haz clic fuera para guardar",
    notePlaceholder: "Escribir nota para esta semana...",
    modalExportTitle: "Exportar planificación",
    modalExportDesc: "¿Generar y descargar archivo CSV para el año {year}?",
    modalExportTip: "Recomendado para abrir en MS Excel.",
    btnCancel: "Cancelar",
    btnDownload: "Descargar Archivo",
    vacationLabel: "[VACACIONES] Ausencia",
    vacationShort: "VACACIONES",
    vacationConflictWarning: "⚠️ VACACIONES (era: {project})",
    projectDeleted: "[Proyecto eliminado]",
    deletedShort: "ELIMINADO",
    openProjectTitle: "Abrir proyecto {name} en nueva pestaña",
    accessErrorTitle: "Error de acceso",
    accessErrorDesc: "Acceso denegado para [{login}]. Se buscaron los grupos: \"{managerGroup}\" y \"{workerGroup}\".",
    loadingTitle: "Cargando aplicación...",
    optNone: "-- Ninguno --",
    archivedTag: " [Archivad.]"
  }
};

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getEasterDate = (year) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
};

const getPolishHolidayName = (date) => {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();

  if (m === 0 && d === 1) return 'Nowy Rok';
  if (m === 0 && d === 6) return 'Trzech Króli';
  if (m === 4 && d === 1) return 'Święto Pracy';
  if (m === 4 && d === 3) return 'Święto Konstytucji 3 Maja';
  if (m === 7 && d === 15) return 'Wniebowzięcie NMP';
  if (m === 10 && d === 1) return 'Wszystkich Świętych';
  if (m === 10 && d === 11) return 'Święto Niepodległości';
  if (m === 11 && d === 25) return 'Boże Narodzenie (I dzień)';
  if (m === 11 && d === 26) return 'Boże Narodzenie (II dzień)';

  const easter = getEasterDate(y);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);

  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60);

  if (m === easterMonday.getMonth() && d === easterMonday.getDate()) return 'Poniedziałek Wielkanocny';
  if (m === corpusChristi.getMonth() && d === corpusChristi.getDate()) return 'Boże Ciało';

  return null;
};

const stringHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getProjectColors = (project) => {
  if (!project || !project.name) {
    return { bg: 'transparent', text: 'inherit', border: 'transparent' };
  }

  if (project.id === ABSENCE_PROJECT_ID) {
    return { bg: '#e5e7eb', text: '#374151', border: '#9ca3af' };
  }

  const nameParts = project.name.trim().split(/\s+/);
  const clientName = nameParts[0].toLowerCase();

  const clientHash = stringHash(clientName);
  const projectHash = stringHash(project.id || project.name);

  const baseHue = clientHash % 360;
  const hueOffset = (projectHash % 61) - 30;
  const hue = (baseHue + hueOffset + 360) % 360;

  const saturation = 45 + (projectHash % 36);
  const lightness = 65 + (projectHash % 19);

  const bgColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const borderColor = `hsl(${hue}, ${saturation}%, ${lightness - 18}%)`;
  const textColor = lightness < 48 ? '#ffffff' : '#111827';

  return { bg: bgColor, text: textColor, border: borderColor };
};

const getMondayKey = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return `note_${formatDateKey(d)}`;
};

export default function ScheduleApp({ hostPromise, customTranslations = {} }) {
  const [ytHost, setYtHost] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('Initializing connection...');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);

  const [lang, setLang] = useState('en');

  const allTranslations = {
    ...TRANSLATIONS,
    ...customTranslations
  };

  const t = (key, params = {}, activeLang = lang) => {
    const langDict = allTranslations[activeLang] || allTranslations['en'];
    let text = langDict[key] || allTranslations['en'][key] || key;

    Object.keys(params).forEach(param => {
      text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
    });
    return text;
  };

  const [viewMode, setViewMode] = useState('4WEEKS');
  const [baseDate, setBaseDate] = useState(new Date());

  const [selectedCells, setSelectedCells] = useState([]);
  const [anchorCell, setAnchorCell] = useState(null);
  const [clipboardProjectId, setClipboardProjectId] = useState(null);

  const [showExportModal, setShowExportModal] = useState(false);
  const [editingNoteKey, setEditingNoteKey] = useState(null);

  const todayHeaderRef = useRef(null);

  useEffect(() => {
    initApp();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (userRole !== 'MANAGER') return;
      if (editingNoteKey) return;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && e.key.toLowerCase() === 'c') {
        if (selectedCells.length > 0) {
          const primaryKey = selectedCells[0];
          const valToCopy = schedule[primaryKey] || '';
          setClipboardProjectId(valToCopy);
        }
        return;
      }

      if (isCtrlOrCmd && e.key.toLowerCase() === 'v') {
        if (clipboardProjectId !== null && selectedCells.length > 0) {
          e.preventDefault();
          pasteClipboardToSelected(clipboardProjectId);
        }
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && anchorCell) {
        if (e.target && e.target.tagName === 'SELECT') {
          e.target.blur();
        }

        e.preventDefault();

        let { userIdx, dateIdx } = anchorCell;
        const visibleDates = getVisibleDates();

        if (e.key === 'ArrowUp' && userIdx > 0) userIdx--;
        if (e.key === 'ArrowDown' && userIdx < users.length - 1) userIdx++;
        if (e.key === 'ArrowLeft' && dateIdx > 0) dateIdx--;
        if (e.key === 'ArrowRight' && dateIdx < visibleDates.length - 1) dateIdx++;

        const targetUser = users[userIdx];
        const targetDate = visibleDates[dateIdx];

        if (targetUser && targetDate) {
          const targetDateStr = formatDateKey(targetDate);
          const targetKey = `${targetUser.id}_${targetDateStr}`;

          if (e.shiftKey) {
            const minUserIdx = Math.min(anchorCell.userIdx, userIdx);
            const maxUserIdx = Math.max(anchorCell.userIdx, userIdx);
            const minDateIdx = Math.min(anchorCell.dateIdx, dateIdx);
            const maxDateIdx = Math.max(anchorCell.dateIdx, dateIdx);

            const newSelection = [];
            for (let u = minUserIdx; u <= maxUserIdx; u++) {
              for (let d = minDateIdx; d <= maxDateIdx; d++) {
                const uObj = users[u];
                const dStr = formatDateKey(visibleDates[d]);
                if (uObj) newSelection.push(`${uObj.id}_${dStr}`);
              }
            }
            setSelectedCells(newSelection);
          } else {
            setAnchorCell({ userIdx, dateIdx, key: targetKey });
            setSelectedCells([targetKey]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userRole, selectedCells, anchorCell, users, baseDate, viewMode, schedule, clipboardProjectId, editingNoteKey]);

  const withTimeout = (promise, ms, stepName) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout (${ms / 1000}s) on step: ${stepName}`)), ms)
      )
    ]);
  };

  const initApp = async () => {
    try {
      setStatusMsg('Connecting...');
      const host = await hostPromise;
      if (!host) throw new Error("Host registration returned an empty object.");

      setYtHost(host);
      await loadData(host);
    } catch (err) {
      console.error("YTApp Registration error:", err);
      setErrorMsg(`YouTrack registration error: ${err.message}`);
      setLoading(false);
    }
  };

  const loadData = async (host) => {
    try {
      const fetchApi = async (endpoint) => {
        let cleanPath = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        if (cleanPath.startsWith('api/')) cleanPath = cleanPath.substring(4);
        return await host.fetchYouTrack(cleanPath);
      };

      let config = {
        language: 'en',
        managerGroup: 'Managerowie',
        workerGroup: 'Pracownicy',
        absenceProjectName: null
      };

      try {
        const loadedConfig = await host.fetchApp('backend/config-api', {});
        if (loadedConfig && typeof loadedConfig === 'object') {
          config = { ...config, ...loadedConfig };
        }
      } catch (e) {
        console.warn("Using default config:", e.message);
      }

      const activeLang = config.language || 'en';
      setLang(activeLang);

      const currentUser = await withTimeout(
        fetchApi('users/me?fields=id,login,fullName,groups(id,name)'),
        5000,
        'Fetching user profile'
      );

      const currentUserId = currentUser.id;
      if (!currentUserId) throw new Error("No session ID for current user.");

      let allSystemGroups = [];
      try {
        allSystemGroups = await withTimeout(
          fetchApi('groups?fields=id,name,users(id,login,fullName)&$top=1000'),
          5000,
          'Fetching groups'
        );
      } catch (e) {
        allSystemGroups = await withTimeout(
          fetchApi('admin/groups?fields=id,name,users(id,login,fullName)&$top=1000'),
          5000,
          'Fetching admin/groups'
        );
      }

      const findGroup = (targetName) => {
        return allSystemGroups.find(g => g.name.trim().toLowerCase() === targetName.trim().toLowerCase());
      };

      const managerGroupObj = findGroup(config.managerGroup) || findGroup('Managerowie');
      const workerGroupObj = findGroup(config.workerGroup) || findGroup('Pracownicy');

      let isManager = false;
      let isWorker = false;

      const userGroupNames = currentUser.groups?.map(g => g.name.toLowerCase()) || [];
      if (userGroupNames.includes(config.managerGroup.toLowerCase()) || userGroupNames.includes('managerowie')) {
        isManager = true;
      }
      if (userGroupNames.includes(config.workerGroup.toLowerCase()) || userGroupNames.includes('pracownicy')) {
        isWorker = true;
      }

      if (managerGroupObj?.users?.some(u => u.id === currentUserId || u.login === currentUser.login)) {
        isManager = true;
      }
      if (workerGroupObj?.users?.some(u => u.id === currentUserId || u.login === currentUser.login)) {
        isWorker = true;
      }

      if (isManager) {
        setUserRole('MANAGER');
      } else if (isWorker) {
        setUserRole('WORKER');
      } else {
        setErrorMsg(t('accessErrorDesc', {
          login: currentUser.login,
          managerGroup: config.managerGroup,
          workerGroup: config.workerGroup
        }, activeLang));
        setLoading(false);
        return;
      }

      const workersList = workerGroupObj?.users || [];
      setUsers(workersList.filter(u => u.id));

      let fetchedProjects = [];
      try {
        let skip = 0;
        const pageSize = 100;
        let hasMore = true;

        while (hasMore) {
          const page = await fetchApi(`admin/projects?fields=id,name,shortName,archived&$skip=${skip}&$top=${pageSize}`);
          if (page && page.length > 0) {
            fetchedProjects = [...fetchedProjects, ...page];
            skip += page.length;
            if (page.length < pageSize) {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }

        fetchedProjects.sort((a, b) => a.name.localeCompare(b.name, activeLang));

        const absenceLabel = (config.absenceProjectName && config.absenceProjectName !== '[VACATION] Leave / Absence')
          ? config.absenceProjectName
          : t('vacationLabel', {}, activeLang);

        const absenceProject = {
          id: ABSENCE_PROJECT_ID,
          name: absenceLabel,
          shortName: t('vacationShort', {}, activeLang),
          archived: false
        };

        setProjects([absenceProject, ...fetchedProjects]);
      } catch (e) {
        console.warn("Failed to fetch projects:", e.message);
      }

      try {
        const storedSchedule = await withTimeout(
          host.fetchApp('backend/schedule-api', {}),
          5000,
          'Read from storage'
        );
        setSchedule(storedSchedule || {});
      } catch (e) {
        console.warn("Failed to read schedule storage:", e.message);
        setSchedule({});
      }

    } catch (err) {
      console.error(err);
      setErrorMsg(`Data loading error: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(scrollToToday, 200);
    }
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const getVisibleDates = () => {
    const dates = [];
    const today = new Date();

    if (userRole === 'WORKER') {
      for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d);
      }
      return dates;
    }

    if (userRole === 'MANAGER') {
      if (viewMode === '4WEEKS') {
        const dayOfWeek = baseDate.getDay();
        const diffToMonday = baseDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const currentMonday = new Date(baseDate);
        currentMonday.setDate(diffToMonday);

        const startMonday = new Date(currentMonday);
        startMonday.setDate(currentMonday.getDate() - 7);

        for (let i = 0; i < 28; i++) {
          const d = new Date(startMonday);
          d.setDate(startMonday.getDate() + i);
          dates.push(d);
        }
      } else if (viewMode === '3MONTHS') {
        const startMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1);
        const endMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 2, 0);

        let curr = new Date(startMonth);
        while (curr <= endMonth) {
          dates.push(new Date(curr));
          curr.setDate(curr.getDate() + 1);
        }
      } else if (viewMode === 'YEAR') {
        const year = baseDate.getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);

        let curr = new Date(startOfYear);
        while (curr <= endOfYear) {
          dates.push(new Date(curr));
          curr.setDate(curr.getDate() + 1);
        }
      }
    }
    return dates;
  };

  const getWeekChunks = (dates) => {
    const chunks = [];
    let currentChunk = [];

    dates.forEach((date, idx) => {
      currentChunk.push(date);
      const isSunday = date.getDay() === 0;
      const isLast = idx === dates.length - 1;

      if (isSunday || isLast) {
        chunks.push(currentChunk);
        currentChunk = [];
      }
    });

    return chunks;
  };

  const changeDate = (direction) => {
    const newDate = new Date(baseDate);
    if (viewMode === '4WEEKS') newDate.setDate(baseDate.getDate() + (direction * 14));
    else if (viewMode === '3MONTHS') newDate.setMonth(baseDate.getMonth() + (direction * 2));
    else if (viewMode === 'YEAR') newDate.setFullYear(baseDate.getFullYear() + direction);
    setBaseDate(newDate);
  };

  const scrollToToday = () => {
    if (todayHeaderRef.current) {
      todayHeaderRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  };

  const handleTodayClick = () => {
    setBaseDate(new Date());
    setTimeout(scrollToToday, 100);
  };

  const handleExportConfirmed = () => {
    try {
      const exportYear = baseDate.getFullYear();

      const startOfYear = new Date(exportYear, 0, 1);
      const endOfYear = new Date(exportYear, 11, 31);
      const yearDates = [];
      let curr = new Date(startOfYear);
      while (curr <= endOfYear) {
        yearDates.push(new Date(curr));
        curr.setDate(curr.getDate() + 1);
      }

      const headerRow = [
        t('colEmployee'),
        ...yearDates.map(d => d.toLocaleDateString(lang, { day: '2-digit', month: '2-digit', year: 'numeric' }))
      ];

      const rowsData = users.map(user => {
        const userRow = [user.fullName || user.login];
        yearDates.forEach(date => {
          const dateStr = formatDateKey(date);
          const cellKey = `${user.id}_${dateStr}`;

          let projId = schedule[cellKey];
          if (projId && projId.startsWith('!!!__ABSENCE__')) {
            projId = '__ABSENCE__';
          }

          const proj = projects.find(p => p.id === projId);
          userRow.push(proj ? proj.name : '');
        });
        return userRow;
      });

      const csvContent = [
        headerRow.join(';'),
        ...rowsData.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(';'))
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Schedule_${exportYear}_${lang.toUpperCase()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowExportModal(false);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  const handleCellClick = (userIdx, dateIdx, cellKey, event) => {
    if (userRole !== 'MANAGER') return;

    const visibleDates = getVisibleDates();

    if (event.shiftKey && anchorCell) {
      const minUserIdx = Math.min(anchorCell.userIdx, userIdx);
      const maxUserIdx = Math.max(anchorCell.userIdx, userIdx);
      const minDateIdx = Math.min(anchorCell.dateIdx, dateIdx);
      const maxDateIdx = Math.max(anchorCell.dateIdx, dateIdx);

      const newSelection = [];
      for (let u = minUserIdx; u <= maxUserIdx; u++) {
        for (let d = minDateIdx; d <= maxDateIdx; d++) {
          const user = users[u];
          const dateStr = formatDateKey(visibleDates[d]);
          if (user) {
            newSelection.push(`${user.id}_${dateStr}`);
          }
        }
      }
      setSelectedCells(newSelection);
    } else {
      setAnchorCell({ userIdx, dateIdx, key: cellKey });
      setSelectedCells([cellKey]);
    }
  };

  const pasteClipboardToSelected = async (projId) => {
    if (selectedCells.length === 0 || userRole !== 'MANAGER' || !ytHost) return;

    const updatedSchedule = { ...schedule };
    selectedCells.forEach(cellKey => {
      if (!projId) {
        delete updatedSchedule[cellKey];
      } else {
        updatedSchedule[cellKey] = projId;
      }
    });

    setSchedule(updatedSchedule);

    try {
      const res = await ytHost.fetchApp('backend/schedule-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSchedule),
      });

      if (res && res.error) console.error("Server save error:", res.error);
    } catch (e) {
      console.error("Save network error:", e);
    }
  };

  const handleCellChange = async (userId, dateString, projectId) => {
    if (userRole !== 'MANAGER' || !ytHost) return;

    const cellKey = `${userId}_${dateString}`;
    const updatedSchedule = { ...schedule };

    if (!projectId) {
      delete updatedSchedule[cellKey];
    } else {
      updatedSchedule[cellKey] = projectId;
    }

    setSchedule(updatedSchedule);

    try {
      const res = await ytHost.fetchApp('backend/schedule-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSchedule),
      });

      if (res && res.error) console.error(res.error);
    } catch (e) {
      console.error("Backend save error:", e);
    }
  };

  const handleSaveNote = async (noteKey, noteValue) => {
    if (userRole !== 'MANAGER' || !ytHost) return;

    const updatedSchedule = { ...schedule };
    if (!noteValue.trim()) {
      delete updatedSchedule[noteKey];
    } else {
      updatedSchedule[noteKey] = noteValue;
    }

    setSchedule(updatedSchedule);
    setEditingNoteKey(null);

    try {
      const res = await ytHost.fetchApp('backend/schedule-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSchedule),
      });

      if (res && res.error) console.error(res.error);
    } catch (e) {
      console.error("Save note error:", e);
    }
  };

  const renderProjectLink = (projectId, weekend) => {
    if (!projectId) return <span style={{ color: '#aaa' }}>-</span>;

    const project = projects.find(p => p.id === projectId);

    if (!project) {
      return (
        <span
          style={{
            ...linkStyle,
            backgroundColor: '#f3f4f6',
            color: '#6b7280',
            border: '1px solid #d1d5db',
            fontSize: weekend ? '11px' : '12px',
            fontStyle: 'italic'
          }}
          title={t('projectDeleted')}
        >
          {weekend ? t('deletedShort') : t('projectDeleted')}
        </span>
      );
    }

    const colors = getProjectColors(project);

    if (project.id === ABSENCE_PROJECT_ID) {
      return (
        <span
          style={{
            ...linkStyle,
            backgroundColor: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            fontSize: weekend ? '11px' : '12px',
            cursor: 'default'
          }}
          title={project.name}
        >
          {weekend ? t('vacationShort') : project.name}
        </span>
      );
    }

    const projectUrl = `/projects/${project.shortName || project.id}`;

    return (
      <a
        href={projectUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          ...linkStyle,
          backgroundColor: colors.bg,
          color: colors.text,
          border: `1px solid ${colors.border}`,
          fontSize: weekend ? '11px' : '12px'
        }}
        title={t('openProjectTitle', { name: project.name })}
      >
        {weekend ? (project.shortName || project.name) : project.name}
      </a>
    );
  };

  const getDynamicCellStyle = (date, isHeader = false, isLastRow = false, cellKey = null) => {
    const day = date.getDay();
    const isSunday = day === 0;
    const isSaturday = day === 6;
    const weekend = isSaturday || isSunday;
    const holidayName = getPolishHolidayName(date);
    const isHoliday = !!holidayName;
    const today = isToday(date);
    const isSelected = cellKey && selectedCells.includes(cellKey);

    const colWidth = weekend ? '65px' : '150px';

    let bgColor = isHeader ? '#f9f9f9' : '#ffffff';
    let textColor = '#333333';

    if (isHoliday || isSunday) {
      bgColor = isHeader ? '#fde8e8' : '#fff5f5';
      textColor = '#991b1b';
    } else if (isSaturday) {
      bgColor = isHeader ? '#e4edf5' : '#edf4fa';
      textColor = '#004085';
    }

    if (isSelected && !isHeader) {
      bgColor = '#dbeafe';
    }

    let style = {
      ...cellStyle,
      backgroundColor: bgColor,
      minWidth: colWidth,
      width: colWidth,
      maxWidth: colWidth,
      padding: isHeader ? '8px 4px' : (weekend ? '6px 2px' : '10px 6px'),
      fontSize: weekend ? '11px' : '13px',
      color: textColor,
      overflow: 'hidden'
    };

    if (isSelected) {
      style.outline = '2px solid #2563eb';
      style.outlineOffset = '-2px';
    }

    if (today) {
      style.borderLeft = '2px solid #0066cc';
      style.borderRight = '2px solid #0066cc';
      if (isHeader) style.borderTop = '2px solid #0066cc';
      if (isLastRow) style.borderBottom = '2px solid #0066cc';
      style.fontWeight = 'bold';
    }

    return style;
  };

  if (loading) {
    return (
      <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
        <h3>{t('loadingTitle')}</h3>
        <p style={{ color: '#0066cc', fontWeight: 'bold' }}>{statusMsg}</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ padding: '30px', color: '#c53929', fontFamily: 'sans-serif' }}>
        <h2>{t('accessErrorTitle')}</h2>
        <p style={{ backgroundColor: '#ffebe8', padding: '12px', borderRadius: '4px', border: '1px solid #dd4b39' }}>
          {errorMsg}
        </p>
      </div>
    );
  }

  const visibleDates = getVisibleDates();
  const weekChunks = getWeekChunks(visibleDates);
  const tableCalculatedMinWidth = 160 + visibleDates.reduce((sum, d) => sum + (isWeekend(d) ? 65 : 150), 0);
  const copiedProjectObj = projects.find(p => p.id === clipboardProjectId);

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'sans-serif',
      minHeight: '100vh',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '100%'
    }}>
      <style>{`
        .cell-container { position: relative; }
        .project-link-icon {
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease-in-out;
        }
        .cell-container:hover .project-link-icon {
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>

      {/* NAGŁÓWEK GŁÓWNY */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexShrink: 0, flexWrap: 'wrap', gap: '10px' }}>
        <h2>{t('title')}</h2>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {userRole === 'MANAGER' && (
            <>
              <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} style={inputStyle}>
                <option value="4WEEKS">{t('view4Weeks')}</option>
                <option value="3MONTHS">{t('view3Months')}</option>
                <option value="YEAR">{t('viewYear')}</option>
              </select>

              <button onClick={() => changeDate(-1)} style={btnStyle}>{t('btnPrev')}</button>
              <button onClick={handleTodayClick} style={{ ...btnStyle, fontWeight: 'bold', color: '#0066cc' }}>{t('btnToday')}</button>
              <button onClick={() => changeDate(1)} style={btnStyle}>{t('btnNext')}</button>

              <button
                onClick={() => setShowExportModal(true)}
                style={{ ...btnStyle, backgroundColor: '#10b981', color: '#ffffff', border: 'none', fontWeight: 'bold', marginLeft: '5px' }}
              >
                {t('btnExport', { year: baseDate.getFullYear() })}
              </button>
            </>
          )}

          <div style={{ color: '#555', fontSize: '13px', marginLeft: '10px' }}>
            {t('viewLabel')}: <strong>{userRole === 'MANAGER' ? t('roleManager') : t('roleWorker')}</strong>
          </div>
        </div>
      </div>

      {showExportModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0 }}>{t('modalExportTitle')}</h3>
            <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '20px' }}>
              {t('modalExportDesc', { year: baseDate.getFullYear() })}<br/><br/>
              <em>{t('modalExportTip')}</em>
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowExportModal(false)} style={btnStyle}>{t('btnCancel')}</button>
              <button onClick={handleExportConfirmed} style={{ ...btnStyle, backgroundColor: '#10b981', color: '#fff', border: 'none', fontWeight: 'bold' }}>
                {t('btnDownload')}
              </button>
            </div>
          </div>
        </div>
      )}

      {userRole === 'MANAGER' && (
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '8px 12px',
          borderRadius: '4px',
          marginBottom: '12px',
          fontSize: '12px',
          color: '#4b5563',
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          <span>{t('navTips')}</span>
          {selectedCells.length > 0 && (
            <span style={{ color: '#2563eb', fontWeight: '600' }}>
              {t('selectedCells', { count: selectedCells.length })}
            </span>
          )}
          {clipboardProjectId !== null && (
            <span style={{ color: '#059669', fontWeight: '600' }}>
              {t('copiedItem', { name: copiedProjectObj ? copiedProjectObj.name : t('optNone') })}
            </span>
          )}
        </div>
      )}

      <div style={{
        overflowX: 'auto',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 160px)',
        width: '100%',
        minWidth: 0,
        border: '1px solid #ddd',
        borderRadius: '4px',
        alignSelf: 'flex-start'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: `${tableCalculatedMinWidth}px`,
          tableLayout: 'fixed',
          userSelect: 'none'
        }}>
          <thead>
            <tr>
              <th style={{
                ...cellStyle,
                position: 'sticky',
                left: 0,
                backgroundColor: '#f0f0f0',
                zIndex: 3,
                width: '160px',
                minWidth: '160px',
                maxWidth: '160px'
              }}>
                {t('colEmployee')}
              </th>
              {visibleDates.map(date => {
                const today = isToday(date);
                const holidayName = getPolishHolidayName(date);
                const dateLabel = date.toLocaleDateString(lang, { weekday: 'short', day: '2-digit', month: '2-digit' });

                return (
                  <th
                    key={date.toISOString()}
                    ref={today ? todayHeaderRef : null}
                    style={getDynamicCellStyle(date, true, false)}
                    title={holidayName ? holidayName : undefined}
                  >
                    <div>{dateLabel}</div>
                    {holidayName && (
                      <div style={{ fontSize: '9px', fontWeight: 'normal', color: '#991b1b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {holidayName}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {users.map((user, userIdx) => {
              const isLastUserRow = userIdx === users.length - 1 && userRole !== 'MANAGER';

              return (
                <tr key={user.id}>
                  <td style={{
                    ...cellStyle,
                    position: 'sticky',
                    left: 0,
                    backgroundColor: '#fff',
                    fontWeight: 'bold',
                    zIndex: 2,
                    width: '160px',
                    minWidth: '160px',
                    maxWidth: '160px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user.fullName || user.login}
                  </td>
                  {visibleDates.map((date, dateIdx) => {
                    const dateString = formatDateKey(date);
                    const cellKey = `${user.id}_${dateString}`;

                    const rawProjectId = schedule[cellKey] || '';
                    const isConflict = rawProjectId.startsWith('!!!__ABSENCE__');
                    const currentProjectId = isConflict ? rawProjectId.replace('!!!__ABSENCE__', '') : rawProjectId;

                    const weekend = isWeekend(date);
                    const selectedProject = projects.find(p => p.id === currentProjectId);
                    const colors = getProjectColors(selectedProject);

                    return (
                      <td
                        key={dateString}
                        onClick={(e) => handleCellClick(userIdx, dateIdx, cellKey, e)}
                        style={getDynamicCellStyle(date, false, isLastUserRow, cellKey)}
                        className="cell-container"
                      >
                        {userRole === 'MANAGER' ? (
                          <>
                            <select
                              value={rawProjectId}
                              onChange={(e) => handleCellChange(user.id, dateString, e.target.value)}
                              style={{
                                width: '100%',
                                padding: weekend ? '2px 0' : '4px',
                                border: isConflict ? '2px solid #ef4444' : `1px solid ${currentProjectId ? colors.border : '#ccc'}`,
                                borderRadius: '4px',
                                fontSize: weekend ? '11px' : '12px',
                                backgroundColor: isConflict ? '#fee2e2' : (currentProjectId ? colors.bg : '#ffffff'),
                                color: isConflict ? '#991b1b' : (currentProjectId ? colors.text : '#333333'),
                                fontWeight: (currentProjectId || isConflict) ? '600' : 'normal',
                                boxSizing: 'border-box'
                              }}
                            >
                              <option value="" style={{ backgroundColor: '#fff', color: '#333' }}>{t('optNone')}</option>

                              {isConflict && (
                                <option value={rawProjectId} style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 'bold' }}>
                                  {t('vacationConflictWarning', { project: selectedProject ? (selectedProject.shortName || selectedProject.name) : 'Project' })}
                                </option>
                              )}

                              {projects
                                .filter(p => !p.archived || p.id === currentProjectId)
                                .map(p => {
                                  const optColors = getProjectColors(p);
                                  const isArchived = p.archived;
                                  return (
                                    <option
                                      key={p.id}
                                      value={p.id}
                                      style={{ backgroundColor: optColors.bg, color: optColors.text }}
                                    >
                                      {(weekend ? (p.shortName || p.name) : p.name) + (isArchived ? t('archivedTag') : '')}
                                    </option>
                                  );
                                })}
                            </select>

                            {selectedProject && selectedProject.id !== ABSENCE_PROJECT_ID && (
                              <a
                                href={`/projects/${selectedProject.shortName || selectedProject.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={t('openProjectTitle', { name: selectedProject.name })}
                                className="project-link-icon"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  position: 'absolute',
                                  right: '8px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #2563eb',
                                  color: '#2563eb',
                                  borderRadius: '3px',
                                  width: '18px',
                                  height: '18px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  textDecoration: 'none',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                  zIndex: 5
                                }}
                              >
                                ↗
                              </a>
                            )}
                          </>
                        ) : (
                          <div style={{ padding: '0 2px', textAlign: 'center', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
                            {isConflict ? (
                              <span
                                style={{
                                  ...linkStyle,
                                  backgroundColor: '#fee2e2',
                                  color: '#991b1b',
                                  border: '1px solid #ef4444',
                                  fontSize: weekend ? '11px' : '12px',
                                  cursor: 'default'
                                }}
                              >
                                {weekend ? `⚠️${t('vacationShort')}` : `⚠️ ${t('vacationShort')} (${selectedProject?.shortName || 'Project'})`}
                              </span>
                            ) : (
                              renderProjectLink(currentProjectId, weekend)
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {userRole === 'MANAGER' && (
              <tr key="notes-row">
                <td style={{
                  ...cellStyle,
                  position: 'sticky',
                  left: 0,
                  backgroundColor: '#f8fafc',
                  fontWeight: 'bold',
                  zIndex: 2,
                  width: '160px',
                  minWidth: '160px',
                  maxWidth: '160px',
                  color: '#475569',
                  fontSize: '12px',
                  borderBottom: '2px solid #0066cc'
                }}>
                  {t('colNotes')}
                </td>
                {weekChunks.map((chunk, chunkIdx) => {
                  const weekdays = chunk.filter(d => d.getDay() !== 0 && d.getDay() !== 6);
                  const weekendDays = chunk.filter(d => d.getDay() === 0 || d.getDay() === 6);

                  const firstDate = chunk[0];
                  const noteKey = getMondayKey(firstDate);
                  const currentNote = schedule[noteKey] || '';
                  const isEditing = editingNoteKey === noteKey;

                  return (
                    <React.Fragment key={`chunk_${chunkIdx}`}>
                      {weekdays.length > 0 && (
                        <td
                          colSpan={weekdays.length}
                          onClick={() => !isEditing && setEditingNoteKey(noteKey)}
                          style={{
                            ...cellStyle,
                            backgroundColor: isEditing ? '#ffffff' : '#fefea8',
                            border: '1px solid #cbd5e1',
                            padding: '6px',
                            textAlign: 'left',
                            verticalAlign: 'top',
                            cursor: 'pointer',
                            borderBottom: weekdays.some(d => isToday(d)) ? '2px solid #0066cc' : '1px solid #cbd5e1'
                          }}
                        >
                          {isEditing ? (
                            <div onClick={(e) => e.stopPropagation()}>
                              <textarea
                                rows={3}
                                defaultValue={currentNote}
                                autoFocus
                                placeholder={t('notePlaceholder')}
                                onBlur={(e) => handleSaveNote(noteKey, e.target.value)}
                                style={{
                                  width: '100%',
                                  boxSizing: 'border-box',
                                  fontFamily: 'inherit',
                                  fontSize: '12px',
                                  padding: '4px',
                                  borderRadius: '4px',
                                  border: '1px solid #0066cc',
                                  resize: 'vertical'
                                }}
                              />
                              <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'right', marginTop: '2px' }}>
                                {t('savingNoteTip')}
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              minHeight: '54px',
                              fontSize: '12px',
                              color: currentNote ? '#1e293b' : '#94a3b8',
                              fontStyle: currentNote ? 'normal' : 'italic',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              lineHeight: '1.4'
                            }}>
                              {currentNote || t('addNotePrompt')}
                            </div>
                          )}
                        </td>
                      )}

                      {weekendDays.length > 0 && (
                        <td
                          colSpan={weekendDays.length}
                          style={{
                            ...cellStyle,
                            backgroundColor: '#edf4fa',
                            border: '1px solid #cbd5e1',
                            borderBottom: weekendDays.some(d => isToday(d)) ? '2px solid #0066cc' : '1px solid #cbd5e1'
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cellStyle = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'center',
  boxSizing: 'border-box'
};

const inputStyle = {
  padding: '6px 10px',
  borderRadius: '4px',
  border: '1px solid #ccc'
};

const btnStyle = {
  padding: '6px 12px',
  backgroundColor: '#f0f0f0',
  border: '1px solid #ccc',
  borderRadius: '4px',
  cursor: 'pointer'
};

const linkStyle = {
  textDecoration: 'none',
  fontWeight: '600',
  display: 'inline-block',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  verticalAlign: 'middle',
  padding: '3px 6px',
  borderRadius: '3px',
  maxWidth: '100%',
  boxSizing: 'border-box'
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  backgroundColor: '#fff',
  padding: '24px',
  borderRadius: '6px',
  width: '380px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
};
