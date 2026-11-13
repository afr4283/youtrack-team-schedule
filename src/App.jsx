import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';

// The holiday editor (with the date-holidays library) is a separate JS file
// loaded only when a manager opens it; the schedule view never downloads it.
const HolidaysEditor = lazy(() => import('./HolidaysEditor.jsx'));

const ABSENCE_PROJECT_ID = '__ABSENCE__';

// --- TRANSLATIONS (i18n) ---
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
    accessErrorDesc: "Access denied for [{login}]. The application could not identify a logged-in user.",
    loadingTitle: "Loading application...",
    optNone: "-- None --",
    archivedTag: " [Archived]",
    deletedTag: " [Deleted]",
    btnHolidays: "Holidays",
    holidaysMissing: "No holidays defined for {years}.",
    holidaysMissingAction: "Define holidays",
    holidaysEditorLoading: "Loading the holiday editor…",
    saveError: "Changes could not be saved. The schedule has been reloaded from the server; please repeat your last edit.",
    saveConflict: "{count} change(s) were not saved because another manager changed the same cells in the meantime. The schedule now shows their version.",
    roster_groupNotFound: "The workers group \"{group}\" was not found, so the schedule has no rows. Check the group name in the app settings.",
    roster_empty: "The workers group \"{group}\" has no members, so the schedule has no rows. Add people to the group in YouTrack.",
    roster_loadError: "The list of employees could not be loaded. Refresh the page; if the problem persists, contact your YouTrack administrator.",
    saveForbidden: "You don't have permission to edit the schedule."
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
    accessErrorDesc: "Brak dostępu dla [{login}]. Aplikacja nie rozpoznała zalogowanego użytkownika.",
    loadingTitle: "Ładowanie aplikacji...",
    optNone: "-- Brak --",
    archivedTag: " [Zarch.]",
    deletedTag: " [Usunięty]",
    btnHolidays: "Dni wolne",
    holidaysMissing: "Brak zdefiniowanych świąt na {years}.",
    holidaysMissingAction: "Zdefiniuj święta",
    holidaysEditorLoading: "Ładowanie edytora świąt…",
    saveError: "Nie udało się zapisać zmian. Grafik został ponownie wczytany z serwera; powtórz ostatnią zmianę.",
    saveConflict: "Nie zapisano zmian: {count}, bo w międzyczasie inny manager zmienił te same komórki. Grafik pokazuje teraz jego wersję.",
    roster_groupNotFound: "Nie znaleziono grupy pracowników „{group}”, więc grafik nie ma wierszy. Sprawdź nazwę grupy w ustawieniach aplikacji.",
    roster_empty: "Grupa pracowników „{group}” nie ma członków, więc grafik nie ma wierszy. Dodaj osoby do grupy w YouTracku.",
    roster_loadError: "Nie udało się wczytać listy pracowników. Odśwież stronę; jeśli problem się powtarza, skontaktuj się z administratorem YouTracka.",
    saveForbidden: "Nie masz uprawnień do edycji grafiku."
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
    accessErrorDesc: "Zugriff verweigert für [{login}]. Die Anwendung konnte keinen angemeldeten Benutzer erkennen.",
    loadingTitle: "Anwendung wird geladen...",
    optNone: "-- Keine --",
    archivedTag: " [Archiviert]",
    deletedTag: " [Gelöscht]",
    btnHolidays: "Feiertage",
    holidaysMissing: "Keine Feiertage für {years} festgelegt.",
    holidaysMissingAction: "Feiertage festlegen",
    holidaysEditorLoading: "Feiertagseditor wird geladen…",
    saveError: "Änderungen konnten nicht gespeichert werden. Der Plan wurde vom Server neu geladen; bitte wiederholen Sie die letzte Änderung.",
    saveConflict: "{count} Änderung(en) wurden nicht gespeichert, weil ein anderer Manager dieselben Zellen inzwischen geändert hat. Der Plan zeigt jetzt dessen Version.",
    roster_groupNotFound: "Die Mitarbeitergruppe „{group}“ wurde nicht gefunden, daher hat der Plan keine Zeilen. Prüfen Sie den Gruppennamen in den App-Einstellungen.",
    roster_empty: "Die Mitarbeitergruppe „{group}“ hat keine Mitglieder, daher hat der Plan keine Zeilen. Fügen Sie der Gruppe in YouTrack Personen hinzu.",
    roster_loadError: "Die Mitarbeiterliste konnte nicht geladen werden. Laden Sie die Seite neu; wenn das Problem bleibt, wenden Sie sich an Ihren YouTrack-Administrator.",
    saveForbidden: "Sie haben keine Berechtigung, den Plan zu bearbeiten."
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
    accessErrorDesc: "Acceso denegado para [{login}]. La aplicación no pudo identificar a un usuario conectado.",
    loadingTitle: "Cargando aplicación...",
    optNone: "-- Ninguno --",
    archivedTag: " [Archivad.]",
    deletedTag: " [Eliminado]",
    btnHolidays: "Festivos",
    holidaysMissing: "No hay festivos definidos para {years}.",
    holidaysMissingAction: "Definir festivos",
    holidaysEditorLoading: "Cargando el editor de festivos…",
    saveError: "No se pudieron guardar los cambios. El calendario se ha vuelto a cargar desde el servidor; repita su último cambio.",
    saveConflict: "{count} cambio(s) no se guardaron porque otro responsable modificó las mismas celdas mientras tanto. El calendario muestra ahora su versión.",
    roster_groupNotFound: "No se encontró el grupo de empleados «{group}», por lo que el calendario no tiene filas. Compruebe el nombre del grupo en la configuración de la aplicación.",
    roster_empty: "El grupo de empleados «{group}» no tiene miembros, por lo que el calendario no tiene filas. Añada personas al grupo en YouTrack.",
    roster_loadError: "No se pudo cargar la lista de empleados. Recargue la página; si el problema continúa, contacte con el administrador de YouTrack.",
    saveForbidden: "No tienes permiso para editar el calendario."
  }
};

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const stringHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// --- THEME (Ring UI) ---
// Colors come from Ring UI CSS variables (--ring-*) loaded in index.html from
// @jetbrains/ring-ui-built. The dark theme is enabled by the .ring-ui-theme-dark
// class on <html>, kept in sync with the system preference (YouTrack's default
// "same as system" setting).
const DARK_THEME_CLASS = 'ring-ui-theme-dark';
const LIGHT_THEME_CLASS = 'ring-ui-theme-light';

const useRingTheme = () => {
  const getMedia = () =>
    (typeof window !== 'undefined' && window.matchMedia)
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  const [isDark, setIsDark] = useState(() => {
    const mq = getMedia();
    return mq ? mq.matches : false;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle(DARK_THEME_CLASS, isDark);
    root.classList.toggle(LIGHT_THEME_CLASS, !isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark]);

  useEffect(() => {
    const mq = getMedia();
    if (!mq) return undefined;
    const onChange = (e) => setIsDark(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  return isDark;
};

// All UI colors go through --ts-* tokens that point to Ring UI variables.
// The values after the comma are fallbacks in case the Ring UI stylesheet
// fails to load.
const APP_CSS = `
  .ts-app {
    --ts-bg: var(--ring-content-background-color, #fff);
    --ts-bg-secondary: var(--ring-sidebar-background-color, #f7f8fa);
    --ts-text: var(--ring-text-color, #1f2023);
    --ts-text-secondary: var(--ring-secondary-color, #6c707e);
    --ts-text-disabled: var(--ring-disabled-color, #a8adbd);
    --ts-line: var(--ring-line-color, #ebecf0);
    --ts-border: var(--ring-borders-color, #c9ccd6);
    --ts-border-hover: var(--ring-border-hover-color, #3574f0);
    --ts-accent: var(--ring-main-color, #3574f0);
    --ts-accent-hover: var(--ring-main-hover-color, #315fbd);
    --ts-on-accent: var(--ring-white-text-color, #fff);
    --ts-link: var(--ring-link-color, #2e55a3);
    --ts-selected-bg: var(--ring-selected-background-color, #d4e2ff);
    --ts-hover-bg: var(--ring-hover-background-color, #edf3ff);
    --ts-error: var(--ring-error-color, #cc3645);
    --ts-error-bg: var(--ring-removed-background-color, #fff7f7);
    --ts-holiday-bg: var(--ring-removed-subtle-background-color, #fff7f7);
    --ts-note-bg: var(--ring-warning-subtle-background-color, #fdf8e8);
    --ts-success: var(--ring-success-color, #208a3c);
    --ts-tag-bg: var(--ring-tag-background-color, #ebecf0);
    --ts-popup-bg: var(--ring-popup-background-color, #fff);
    --ts-radius: var(--ring-border-radius, 4px);

    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 100%;
    min-height: 100vh;
    padding: 16px 24px;
    background: var(--ts-bg);
    color: var(--ts-text);
    font-family: var(--ring-font-family, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
    font-size: var(--ring-font-size, 13px);
  }
  .ts-app *, .ts-app *::before, .ts-app *::after { box-sizing: border-box; }

  .ts-state { padding: 24px; }
  .ts-state__message { color: var(--ts-text-secondary); }
  .ts-roster-message { margin: 0 0 12px; }
  .ts-state__error {
    padding: 12px;
    border: 1px solid var(--ts-error);
    border-radius: var(--ts-radius);
    background: var(--ts-error-bg);
    color: var(--ts-text);
  }

  .ts-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
    flex-shrink: 0;
  }
  .ts-title { margin: 0; font-size: 20px; line-height: 28px; font-weight: 600; color: var(--ring-heading-color, var(--ts-text)); }
  .ts-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .ts-role { margin-left: 8px; color: var(--ts-text-secondary); }
  .ts-role strong { color: var(--ts-text); font-weight: 600; }

  .ts-button {
    height: 28px;
    padding: 0 16px;
    border: 0;
    border-radius: var(--ts-radius);
    background: var(--ts-bg);
    box-shadow: inset 0 0 0 1px var(--ts-border);
    color: var(--ts-text);
    font: inherit;
    line-height: 28px;
    white-space: nowrap;
    cursor: pointer;
  }
  .ts-button:hover { box-shadow: inset 0 0 0 1px var(--ts-border-hover); }
  .ts-button:active { background: var(--ts-selected-bg); }
  .ts-button:focus-visible { outline: none; box-shadow: inset 0 0 0 1px var(--ts-border-hover), 0 0 0 1px var(--ts-border-hover); }
  .ts-button_primary { background: var(--ts-accent); box-shadow: none; color: var(--ts-on-accent); }
  .ts-button_primary:hover { background: var(--ts-accent-hover); box-shadow: none; }

  .ts-select, .ts-textarea {
    border: 1px solid var(--ts-border);
    border-radius: var(--ts-radius);
    background: var(--ts-bg);
    color: var(--ts-text);
    font: inherit;
  }
  .ts-select { height: 28px; padding: 0 8px; }
  .ts-select:hover, .ts-textarea:hover { border-color: var(--ts-border-hover); }
  .ts-select:focus, .ts-textarea:focus { outline: none; border-color: var(--ts-accent); }

  .ts-hint-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
    padding: 8px 12px;
    border-radius: var(--ts-radius);
    background: var(--ts-bg-secondary);
    color: var(--ts-text-secondary);
    font-size: var(--ring-font-size-smaller, 12px);
  }
  .ts-hint-bar__selection { color: var(--ts-accent); font-weight: 600; }
  .ts-hint-bar_warning { color: var(--ts-text); box-shadow: inset 3px 0 0 var(--ts-error); }
  .ts-hint-bar__clipboard { color: var(--ts-success); font-weight: 600; }

  .ts-grid-wrapper {
    align-self: flex-start;
    width: 100%;
    min-width: 0;
    max-height: calc(100vh - 160px);
    overflow: auto;
    border: 1px solid var(--ts-line);
    border-radius: var(--ts-radius);
  }
  .ts-grid { width: 100%; border-collapse: collapse; table-layout: fixed; user-select: none; }

  .ts-cell {
    position: relative;
    overflow: hidden;
    border: 1px solid var(--ts-line);
    padding: 10px 6px;
    background: var(--ts-bg);
    color: var(--ts-text);
    text-align: center;
  }
  .ts-cell_header { padding: 8px 4px; background: var(--ts-bg-secondary); font-weight: 600; }
  .ts-cell_weekend { padding: 6px 2px; font-size: 11px; }
  .ts-cell_header.ts-cell_weekend { padding: 8px 2px; }
  .ts-cell_saturday { background: var(--ts-bg-secondary); color: var(--ts-text-secondary); }
  .ts-cell_holiday { background: var(--ts-holiday-bg); color: var(--ts-error); }
  .ts-cell_selected { background: var(--ts-selected-bg); outline: 2px solid var(--ts-accent); outline-offset: -2px; }
  .ts-cell_today { border-left: 2px solid var(--ts-accent); border-right: 2px solid var(--ts-accent); font-weight: 600; }
  .ts-cell_header.ts-cell_today { border-top: 2px solid var(--ts-accent); }
  .ts-cell_today-last { border-bottom: 2px solid var(--ts-accent); }

  .ts-holiday-name {
    overflow: hidden;
    color: var(--ts-error);
    font-size: 9px;
    font-weight: 400;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .ts-sticky-col {
    position: sticky;
    left: 0;
    z-index: 2;
    width: 160px;
    min-width: 160px;
    max-width: 160px;
    overflow: hidden;
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .ts-sticky-col.ts-cell_header { z-index: 3; }
  .ts-employee { font-weight: 600; }

  .ts-cell-select {
    width: 100%;
    padding: 4px;
    border: 1px solid var(--ts-border);
    border-radius: var(--ts-radius);
    background: var(--ts-bg);
    color: var(--ts-text);
    font: inherit;
    font-size: 12px;
  }
  .ts-cell_weekend .ts-cell-select { padding: 2px 0; font-size: 11px; }
  .ts-cell-select_filled { font-weight: 600; }
  .ts-cell-select_conflict { border: 2px solid var(--ts-error); background: var(--ts-error-bg); color: var(--ts-error); font-weight: 600; }
  .ts-cell-select:focus { outline: none; box-shadow: 0 0 0 1px var(--ts-accent); }

  .ts-chip {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    padding: 3px 6px;
    border: 1px solid transparent;
    border-radius: 3px;
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
    text-overflow: ellipsis;
    vertical-align: middle;
  }
  .ts-cell_weekend .ts-chip { font-size: 11px; }
  .ts-chip_muted { border-color: var(--ts-border); background: var(--ts-tag-bg); color: var(--ts-text-secondary); font-style: italic; }
  .ts-chip_conflict { border-color: var(--ts-error); background: var(--ts-error-bg); color: var(--ts-error); cursor: default; }
  .ts-empty { color: var(--ts-text-disabled); }

  .ts-project-link {
    position: absolute;
    top: 50%;
    right: 8px;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: 1px solid var(--ts-accent);
    border-radius: 3px;
    background: var(--ts-popup-bg);
    color: var(--ts-accent);
    font-size: 11px;
    font-weight: 600;
    text-decoration: none;
    transform: translateY(-50%);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease-in-out;
  }
  .ts-cell:hover .ts-project-link, .ts-project-link:focus-visible { opacity: 1; pointer-events: auto; }

  .ts-notes-label { color: var(--ts-text-secondary); font-size: 12px; font-weight: 600; background: var(--ts-bg-secondary); }
  .ts-note-cell { padding: 6px; background: var(--ts-note-bg); text-align: left; vertical-align: top; cursor: pointer; }
  .ts-note-cell_editing { background: var(--ts-bg); cursor: default; }
  .ts-note-cell_weekend { background: var(--ts-bg-secondary); }
  .ts-note-cell_today { border-bottom: 2px solid var(--ts-accent); }
  .ts-note-text { min-height: 54px; font-size: 12px; line-height: 1.4; white-space: pre-wrap; word-break: break-word; }
  .ts-note-text_empty { color: var(--ts-text-disabled); font-style: italic; }
  .ts-textarea { width: 100%; padding: 4px; font-size: 12px; resize: vertical; }
  .ts-note-tip { margin-top: 2px; color: var(--ts-text-secondary); font-size: 10px; text-align: right; }

  .ts-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--ring-dialog-overlay-components, 0, 0, 0), var(--ring-dialog-overlay-opacity, 0.4));
  }
  .ts-modal {
    width: 400px;
    max-width: calc(100vw - 32px);
    padding: 24px 32px;
    border-radius: var(--ts-radius);
    background: var(--ts-popup-bg);
    box-shadow: var(--ring-dialog-shadow, 0 4px 16px rgba(0, 0, 0, 0.15));
    color: var(--ts-text);
  }
  .ts-modal__title { margin: 0 0 8px; font-size: 20px; line-height: 28px; font-weight: 600; }
  .ts-modal__body { margin: 0 0 20px; color: var(--ts-text-secondary); }
  .ts-modal__actions { display: flex; justify-content: flex-end; gap: 8px; }
`;

// Project colors are derived from a hash of the client name (first word) and
// the project name. In the dark theme backgrounds are darker and text lighter
// to keep the contrast.
const getProjectColors = (project, isDark = false) => {
  if (!project || !project.name) {
    return null;
  }

  if (project.id === ABSENCE_PROJECT_ID) {
    return { bg: 'var(--ts-tag-bg)', text: 'var(--ts-text)', border: 'var(--ts-border)' };
  }

  const nameParts = project.name.trim().split(/\s+/);
  const clientName = nameParts[0].toLowerCase();

  const clientHash = stringHash(clientName);
  const projectHash = stringHash(project.id || project.name);

  const baseHue = clientHash % 360;
  const hueOffset = (projectHash % 61) - 30;
  const hue = (baseHue + hueOffset + 360) % 360;

  if (isDark) {
    const saturation = 30 + (projectHash % 26);
    const lightness = 24 + (projectHash % 13);
    return {
      bg: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      border: `hsl(${hue}, ${saturation}%, ${lightness + 16}%)`,
      text: '#eef0f3'
    };
  }

  const saturation = 45 + (projectHash % 36);
  const lightness = 65 + (projectHash % 19);
  return {
    bg: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    border: `hsl(${hue}, ${saturation}%, ${lightness - 18}%)`,
    text: '#111827'
  };
};

const getMondayKey = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return `note_${formatDateKey(d)}`;
};

const cx = (...classes) => classes.filter(Boolean).join(' ');

export default function ScheduleApp({ hostPromise, customTranslations = {} }) {
  const isDark = useRingTheme();

  const [ytHost, setYtHost] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('Initializing connection...');
  const [users, setUsers] = useState([]);
  // 'ok' | 'empty' | 'groupNotFound' | 'loadError'
  const [rosterStatus, setRosterStatus] = useState('ok');
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

  // Holidays saved by managers (from config-api); the editor replaces the schedule view while open.
  const [holidays, setHolidays] = useState(null);
  const [holidaysEditorYear, setHolidaysEditorYear] = useState(null);

  // Map "YYYY-MM-DD" -> list of names (objects {en, pl, de, es}).
  const holidayIndex = useMemo(() => {
    const index = new Map();
    const years = (holidays && holidays.years) || {};
    Object.values(years).forEach(yearData => {
      ((yearData && yearData.entries) || []).forEach(entry => {
        if (!entry || !entry.date || !entry.names) return;
        if (!index.has(entry.date)) index.set(entry.date, []);
        index.get(entry.date).push(entry.names);
      });
    });
    return index;
  }, [holidays]);

  const todayHeaderRef = useRef(null);

  // Saving state lives in refs so that queued edits and in-flight requests
  // always see the latest values, independent of React render timing.
  const confirmedScheduleRef = useRef({});   // last schedule confirmed by the server
  const pendingChangesRef = useRef([]);      // batches of { key, from, to } not yet confirmed
  const savingRef = useRef(false);
  const lastScheduleSyncRef = useRef(0);

  const [workerGroupName, setWorkerGroupName] = useState('');

  useEffect(() => {
    initApp();
  }, []);

  // Pick up other managers' changes when the user comes back to the tab.
  useEffect(() => {
    if (!ytHost || !userRole) return undefined;
    const refresh = async () => {
      if (document.visibilityState === 'hidden') return;
      if (savingRef.current || pendingChangesRef.current.length > 0) return;
      if (Date.now() - lastScheduleSyncRef.current < 15000) return;
      lastScheduleSyncRef.current = Date.now();
      try {
        const fresh = await ytHost.fetchApp('backend/schedule-api', {});
        if (!savingRef.current && pendingChangesRef.current.length === 0) replaceConfirmedSchedule(fresh);
      } catch (e) {
        console.warn("Failed to refresh the schedule:", e && e.message);
      }
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [ytHost, userRole]);

  // Keep the document language and the tab title in line with the app language.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t('title');
  }, [lang]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (userRole !== 'MANAGER') return;
      if (editingNoteKey) return;
      if (holidaysEditorYear !== null) return;

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
  }, [userRole, selectedCells, anchorCell, users, baseDate, viewMode, schedule, clipboardProjectId, editingNoteKey, holidaysEditorYear]);

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

      // Configuration and the user's role come from the backend, which uses the
      // same rule to authorize writes, so the UI and the API always agree.
      // Who can open the widget at all is decided by YouTrack (the app's
      // "Visibility" setting); the backend only tells managers from viewers.
      const config = await withTimeout(
        host.fetchApp('backend/config-api', {}),
        5000,
        'Loading configuration'
      );

      const activeLang = config.language || 'en';
      setLang(activeLang);

      if (config.role !== 'MANAGER' && config.role !== 'WORKER') {
        setErrorMsg(t('accessErrorDesc', {
          login: config.currentUserLogin || '?'
        }, activeLang));
        return;
      }
      const role = config.role;
      setUserRole(role);
      setHolidays(config.holidays || null);
      setWorkerGroupName(config.workerGroup || '');

      // 1. Shared directory from the backend: project names published by
      //    managers and the worker roster read live from the worker group.
      //    Neither depends on the viewer's own permissions.
      let directory = { projects: [], workers: [] };
      try {
        const fetched = await withTimeout(
          host.fetchApp('backend/directory-api', {}),
          10000,
          'Loading project directory'
        );
        if (fetched && typeof fetched === 'object') {
          directory = {
            projects: Array.isArray(fetched.projects) ? fetched.projects : [],
            workers: Array.isArray(fetched.workers) ? fetched.workers : []
          };
          setRosterStatus(
            fetched.workerGroupFound === false ? 'groupNotFound'
              : (directory.workers.length === 0 ? 'empty' : 'ok')
          );
        } else {
          setRosterStatus('loadError');
        }
      } catch (e) {
        console.warn("Failed to load shared directory:", e.message);
        setRosterStatus('loadError');
      }
      setUsers(directory.workers.filter(u => u && u.id));

      // 2. Projects the current user can see (live, limited by their permissions).
      const ownProjects = await fetchVisibleProjects(fetchApi);

      const mergedProjects = mergeProjectLists(directory.projects, ownProjects || []);
      mergedProjects.sort((a, b) => a.name.localeCompare(b.name, activeLang));

      const absenceLabel = (config.absenceProjectName && config.absenceProjectName !== '[VACATION] Leave / Absence')
        ? config.absenceProjectName
        : t('vacationLabel', {}, activeLang);

      const absenceProject = {
        id: ABSENCE_PROJECT_ID,
        name: absenceLabel,
        shortName: t('vacationShort', {}, activeLang),
        archived: false
      };

      setProjects([absenceProject, ...mergedProjects]);

      // 3. Managers publish the projects they can see, so everyone else
      //    (including managers with narrower permissions) gets names and links.
      if (role === 'MANAGER' && ownProjects && ownProjects.length > 0) {
        const payload = {
          projects: ownProjects.map(p => ({
            id: p.id,
            name: p.name,
            shortName: p.shortName || '',
            archived: !!p.archived
          }))
        };
        host.fetchApp('backend/directory-api', { method: 'POST', body: payload })
          .catch(e => console.warn("Failed to publish shared directory:", e && e.message));
      }

      try {
        const storedSchedule = await withTimeout(
          host.fetchApp('backend/schedule-api', {}),
          5000,
          'Read from storage'
        );
        replaceConfirmedSchedule(storedSchedule);
      } catch (e) {
        console.warn("Failed to read schedule storage:", e.message);
        replaceConfirmedSchedule({});
      }
      lastScheduleSyncRef.current = Date.now();

    } catch (err) {
      console.error(err);
      setErrorMsg(`Data loading error: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(scrollToToday, 200);
    }
  };

  // Projects visible to the current user; null when they cannot be read.
  const fetchVisibleProjects = async (fetchApi) => {
    try {
      let fetched = [];
      let skip = 0;
      const pageSize = 100;

      while (true) {
        const page = await withTimeout(
          fetchApi(`admin/projects?fields=id,name,shortName,archived&$skip=${skip}&$top=${pageSize}`),
          10000,
          'Fetching projects'
        );
        if (!page || page.length === 0) break;
        fetched = [...fetched, ...page];
        skip += page.length;
        if (page.length < pageSize) break;
      }
      return fetched.filter(p => p && p.id && p.name);
    } catch (e) {
      console.warn("Failed to fetch projects:", e.message);
      return null;
    }
  };

  // Backend directory merged with the user's own list; the own list wins as it is fresher.
  const mergeProjectLists = (directoryProjects, ownProjects) => {
    const byId = new Map();
    (directoryProjects || []).forEach(p => {
      if (p && p.id && p.name) byId.set(p.id, { ...p, archived: !!p.archived, deleted: !!p.deleted });
    });
    (ownProjects || []).forEach(p => {
      byId.set(p.id, {
        id: p.id,
        name: p.name,
        shortName: p.shortName || '',
        archived: !!p.archived,
        deleted: false
      });
    });
    return Array.from(byId.values());
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

  // --- SAVING ---
  //
  // The widget never sends the whole schedule. Each edit becomes a list of
  // per-cell changes { key, from, to } that the backend merges into the latest
  // saved schedule, so managers editing different cells cannot overwrite each
  // other. Requests are sent one at a time (edits made meanwhile are queued
  // and sent together), every response carries the current server schedule,
  // and the view is rebuilt as "server state + edits still queued".

  const replaceConfirmedSchedule = (serverSchedule) => {
    confirmedScheduleRef.current = serverSchedule || {};
    rebuildDisplayedSchedule();
  };

  const currentDisplayedSchedule = () => {
    let view = confirmedScheduleRef.current;
    pendingChangesRef.current.forEach(batch => {
      view = { ...view };
      batch.forEach(({ key, to }) => {
        if (to) view[key] = to; else delete view[key];
      });
    });
    return view;
  };

  const rebuildDisplayedSchedule = () => setSchedule(currentDisplayedSchedule());

  const showSaveMessage = (message) => {
    try { ytHost.alert(message); } catch (alertErr) { /* host.alert unavailable */ }
  };

  // Several queued batches collapse into one list: per key the first "from"
  // and the last "to".
  const mergeBatches = (batches) => {
    const byKey = new Map();
    batches.forEach(batch => batch.forEach(change => {
      const prev = byKey.get(change.key);
      byKey.set(change.key, prev ? { ...prev, to: change.to } : { ...change });
    }));
    return [...byKey.values()].filter(c => c.from !== c.to);
  };

  const errorStatus = (e) => e && (e.status || (e.response && e.response.status));

  // One automatic retry covers transient failures, e.g. two first-ever writes
  // creating the storage property at the same moment. Retrying is safe: the
  // backend treats a cell that already holds the target value as applied.
  const sendScheduleChanges = async (changes) => {
    for (let attempt = 0; ; attempt++) {
      try {
        const res = await ytHost.fetchApp('backend/schedule-api', { method: 'POST', body: { changes } });
        if (!res || res.error || typeof res.schedule !== 'object') {
          throw new Error((res && res.error) || 'Unexpected response');
        }
        return res;
      } catch (e) {
        const status = errorStatus(e);
        if (attempt >= 1 || status === 400 || status === 403) throw e;
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      }
    }
  };

  const flushPendingChanges = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    let conflictCount = 0;

    try {
      while (pendingChangesRef.current.length > 0) {
        const batchCount = pendingChangesRef.current.length;
        const changes = mergeBatches(pendingChangesRef.current);

        if (changes.length === 0) {
          pendingChangesRef.current = pendingChangesRef.current.slice(batchCount);
          continue;
        }

        let result;
        try {
          result = await sendScheduleChanges(changes);
        } catch (e) {
          console.error("Schedule save error:", e);
          pendingChangesRef.current = [];
          showSaveMessage(errorStatus(e) === 403 ? t('saveForbidden') : t('saveError'));
          try {
            replaceConfirmedSchedule(await ytHost.fetchApp('backend/schedule-api', {}));
          } catch (reloadErr) {
            console.warn("Failed to reload schedule after save error:", reloadErr);
            rebuildDisplayedSchedule();
          }
          return;
        }

        pendingChangesRef.current = pendingChangesRef.current.slice(batchCount);
        conflictCount += (result.conflicts || []).length;
        confirmedScheduleRef.current = result.schedule;
        lastScheduleSyncRef.current = Date.now();
        rebuildDisplayedSchedule();
      }
    } finally {
      savingRef.current = false;
    }

    if (conflictCount > 0) showSaveMessage(t('saveConflict', { count: conflictCount }));
  };

  // newValues: { cellOrNoteKey: newValue }, where an empty value clears the cell.
  const submitScheduleChanges = (newValues) => {
    if (userRole !== 'MANAGER' || !ytHost) return;
    const displayed = currentDisplayedSchedule();
    const batch = Object.keys(newValues)
      .map(key => ({ key, from: displayed[key] || '', to: newValues[key] || '' }))
      .filter(change => change.from !== change.to);
    if (batch.length === 0) return;

    pendingChangesRef.current = [...pendingChangesRef.current, batch];
    rebuildDisplayedSchedule();
    flushPendingChanges();
  };

  const pasteClipboardToSelected = (projId) => {
    if (selectedCells.length === 0) return;

    const newValues = {};
    selectedCells.forEach(cellKey => { newValues[cellKey] = projId || ''; });
    submitScheduleChanges(newValues);
  };

  const handleCellChange = (userId, dateString, projectId) => {
    submitScheduleChanges({ [`${userId}_${dateString}`]: projectId || '' });
  };

  const handleSaveNote = (noteKey, noteValue) => {
    setEditingNoteKey(null);
    submitScheduleChanges({ [noteKey]: noteValue.trim() ? noteValue : '' });
  };

  const chipStyle = (colors) => colors
    ? { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }
    : undefined;

  const renderProjectLink = (projectId, weekend) => {
    if (!projectId) return <span className="ts-empty">-</span>;

    const project = projects.find(p => p.id === projectId);

    if (!project || project.deleted) {
      const deletedTitle = project ? `${t('projectDeleted')} ${project.name}` : t('projectDeleted');
      return (
        <span className="ts-chip ts-chip_muted" title={deletedTitle}>
          {weekend ? t('deletedShort') : t('projectDeleted')}
        </span>
      );
    }

    const colors = getProjectColors(project, isDark);

    if (project.id === ABSENCE_PROJECT_ID) {
      return (
        <span className="ts-chip" style={{ ...chipStyle(colors), cursor: 'default' }} title={project.name}>
          {weekend ? t('vacationShort') : project.name}
        </span>
      );
    }

    return (
      <a
        href={`/projects/${project.shortName || project.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="ts-chip"
        style={chipStyle(colors)}
        title={t('openProjectTitle', { name: project.name })}
      >
        {weekend ? (project.shortName || project.name) : project.name}
      </a>
    );
  };

  const getCellClassName = (date, { isHeader = false, isLastRow = false, cellKey = null } = {}) => {
    const day = date.getDay();
    const isSunday = day === 0;
    const isSaturday = day === 6;
    const isHoliday = holidayIndex.has(formatDateKey(date));
    const today = isToday(date);
    const isSelected = !isHeader && cellKey && selectedCells.includes(cellKey);

    return cx(
      'ts-cell',
      isHeader && 'ts-cell_header',
      (isSaturday || isSunday) && 'ts-cell_weekend',
      isSaturday && !isHoliday && 'ts-cell_saturday',
      (isSunday || isHoliday) && 'ts-cell_holiday',
      isSelected && 'ts-cell_selected',
      today && 'ts-cell_today',
      today && isLastRow && 'ts-cell_today-last'
    );
  };

  const getHolidayName = (date) => {
    const list = holidayIndex.get(formatDateKey(date));
    if (!list) return null;
    return list
      .map(names => names[lang] || names.en || Object.values(names)[0])
      .filter(Boolean)
      .join(' / ') || null;
  };

  const getColumnWidthStyle = (date) => {
    const width = isWeekend(date) ? '65px' : '150px';
    return { width, minWidth: width, maxWidth: width };
  };

  if (loading) {
    return (
      <div className="ts-app ts-state">
        <style>{APP_CSS}</style>
        <h3 className="ts-title">{t('loadingTitle')}</h3>
        <p className="ts-state__message">{statusMsg}</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="ts-app ts-state">
        <style>{APP_CSS}</style>
        <h2 className="ts-title">{t('accessErrorTitle')}</h2>
        <p className="ts-state__error">{errorMsg}</p>
      </div>
    );
  }

  if (holidaysEditorYear !== null && userRole === 'MANAGER') {
    return (
      <div className="ts-app">
        <style>{APP_CSS}</style>
        <Suspense fallback={<p className="ts-state__message">{t('holidaysEditorLoading')}</p>}>
          <HolidaysEditor
            host={ytHost}
            lang={lang}
            initialYear={holidaysEditorYear}
            holidays={holidays}
            onSaved={setHolidays}
            onClose={() => setHolidaysEditorYear(null)}
          />
        </Suspense>
      </div>
    );
  }

  const visibleDates = getVisibleDates();
  const weekChunks = getWeekChunks(visibleDates);
  const definedHolidayYears = (holidays && holidays.years) || {};
  const missingHolidayYears = [...new Set(visibleDates.map(d => d.getFullYear()))]
    .filter(y => !definedHolidayYears[String(y)]);
  const tableCalculatedMinWidth = 160 + visibleDates.reduce((sum, d) => sum + (isWeekend(d) ? 65 : 150), 0);
  const copiedProjectObj = projects.find(p => p.id === clipboardProjectId);

  return (
    <div className="ts-app">
      <style>{APP_CSS}</style>

      {/* MAIN HEADER */}
      <div className="ts-header">
        <h2 className="ts-title">{t('title')}</h2>

        <div className="ts-toolbar">
          {userRole === 'MANAGER' && (
            <>
              <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} className="ts-select">
                <option value="4WEEKS">{t('view4Weeks')}</option>
                <option value="3MONTHS">{t('view3Months')}</option>
                <option value="YEAR">{t('viewYear')}</option>
              </select>

              <button type="button" onClick={() => changeDate(-1)} className="ts-button">{t('btnPrev')}</button>
              <button type="button" onClick={handleTodayClick} className="ts-button">{t('btnToday')}</button>
              <button type="button" onClick={() => changeDate(1)} className="ts-button">{t('btnNext')}</button>

              <button type="button" onClick={() => setHolidaysEditorYear(baseDate.getFullYear())} className="ts-button">
                {t('btnHolidays')}
              </button>

              <button type="button" onClick={() => setShowExportModal(true)} className="ts-button ts-button_primary">
                {t('btnExport', { year: baseDate.getFullYear() })}
              </button>
            </>
          )}

          <div className="ts-role">
            {t('viewLabel')}: <strong>{userRole === 'MANAGER' ? t('roleManager') : t('roleWorker')}</strong>
          </div>
        </div>
      </div>

      {showExportModal && (
        <div className="ts-modal-overlay">
          <div className="ts-modal" role="dialog" aria-modal="true" aria-labelledby="ts-export-title">
            <h3 id="ts-export-title" className="ts-modal__title">{t('modalExportTitle')}</h3>
            <p className="ts-modal__body">
              {t('modalExportDesc', { year: baseDate.getFullYear() })}<br/><br/>
              <em>{t('modalExportTip')}</em>
            </p>
            <div className="ts-modal__actions">
              <button type="button" onClick={() => setShowExportModal(false)} className="ts-button">{t('btnCancel')}</button>
              <button type="button" onClick={handleExportConfirmed} className="ts-button ts-button_primary">
                {t('btnDownload')}
              </button>
            </div>
          </div>
        </div>
      )}

      {userRole === 'MANAGER' && missingHolidayYears.length > 0 && (
        <div className="ts-hint-bar ts-hint-bar_warning">
          <span>{t('holidaysMissing', { years: missingHolidayYears.join(', ') })}</span>
          <button type="button" className="ts-button" onClick={() => setHolidaysEditorYear(missingHolidayYears[0])}>
            {t('holidaysMissingAction')}
          </button>
        </div>
      )}

      {userRole === 'MANAGER' && (
        <div className="ts-hint-bar">
          <span>{t('navTips')}</span>
          {selectedCells.length > 0 && (
            <span className="ts-hint-bar__selection">
              {t('selectedCells', { count: selectedCells.length })}
            </span>
          )}
          {clipboardProjectId !== null && (
            <span className="ts-hint-bar__clipboard">
              {t('copiedItem', { name: copiedProjectObj ? copiedProjectObj.name : t('optNone') })}
            </span>
          )}
        </div>
      )}

      {rosterStatus !== 'ok' && (
        <p className="ts-state__error ts-roster-message" role="alert">
          {t(`roster_${rosterStatus}`, { group: workerGroupName })}
        </p>
      )}

      <div className="ts-grid-wrapper">
        <table className="ts-grid" style={{ minWidth: `${tableCalculatedMinWidth}px` }}>
          <thead>
            <tr>
              <th className="ts-cell ts-cell_header ts-sticky-col">
                {t('colEmployee')}
              </th>
              {visibleDates.map(date => {
                const today = isToday(date);
                const holidayName = getHolidayName(date);
                const dateLabel = date.toLocaleDateString(lang, { weekday: 'short', day: '2-digit', month: '2-digit' });

                return (
                  <th
                    key={date.toISOString()}
                    ref={today ? todayHeaderRef : null}
                    className={getCellClassName(date, { isHeader: true })}
                    style={getColumnWidthStyle(date)}
                    title={holidayName ? holidayName : undefined}
                  >
                    <div>{dateLabel}</div>
                    {holidayName && <div className="ts-holiday-name">{holidayName}</div>}
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
                  <td className="ts-cell ts-sticky-col ts-employee">
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
                    const colors = getProjectColors(selectedProject, isDark);

                    return (
                      <td
                        key={dateString}
                        onClick={(e) => handleCellClick(userIdx, dateIdx, cellKey, e)}
                        className={getCellClassName(date, { isLastRow: isLastUserRow, cellKey })}
                        style={getColumnWidthStyle(date)}
                      >
                        {userRole === 'MANAGER' ? (
                          <>
                            <select
                              value={rawProjectId}
                              onChange={(e) => handleCellChange(user.id, dateString, e.target.value)}
                              className={cx(
                                'ts-cell-select',
                                currentProjectId && 'ts-cell-select_filled',
                                isConflict && 'ts-cell-select_conflict'
                              )}
                              style={!isConflict && currentProjectId ? chipStyle(colors) : undefined}
                            >
                              <option value="">{t('optNone')}</option>

                              {isConflict && (
                                <option value={rawProjectId}>
                                  {t('vacationConflictWarning', { project: selectedProject ? (selectedProject.shortName || selectedProject.name) : 'Project' })}
                                </option>
                              )}

                              {projects
                                .filter(p => (!p.archived && !p.deleted) || p.id === currentProjectId)
                                .map(p => {
                                  const optColors = getProjectColors(p, isDark);
                                  return (
                                    <option
                                      key={p.id}
                                      value={p.id}
                                      style={optColors ? { backgroundColor: optColors.bg, color: optColors.text } : undefined}
                                    >
                                      {(weekend ? (p.shortName || p.name) : p.name)
                                        + (p.deleted ? t('deletedTag') : (p.archived ? t('archivedTag') : ''))}
                                    </option>
                                  );
                                })}
                            </select>

                            {selectedProject && selectedProject.id !== ABSENCE_PROJECT_ID && !selectedProject.deleted && (
                              <a
                                href={`/projects/${selectedProject.shortName || selectedProject.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={t('openProjectTitle', { name: selectedProject.name })}
                                className="ts-project-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                ↗
                              </a>
                            )}
                          </>
                        ) : (
                          <div style={{ padding: '0 2px', textAlign: 'center', width: '100%', overflow: 'hidden' }}>
                            {isConflict ? (
                              <span className="ts-chip ts-chip_conflict">
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
                <td className="ts-cell ts-sticky-col ts-notes-label" style={{ borderBottom: '2px solid var(--ts-accent)' }}>
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
                          className={cx(
                            'ts-cell ts-note-cell',
                            isEditing && 'ts-note-cell_editing',
                            weekdays.some(d => isToday(d)) && 'ts-note-cell_today'
                          )}
                        >
                          {isEditing ? (
                            <div onClick={(e) => e.stopPropagation()}>
                              <textarea
                                rows={3}
                                defaultValue={currentNote}
                                autoFocus
                                placeholder={t('notePlaceholder')}
                                onBlur={(e) => handleSaveNote(noteKey, e.target.value)}
                                className="ts-textarea"
                              />
                              <div className="ts-note-tip">{t('savingNoteTip')}</div>
                            </div>
                          ) : (
                            <div className={cx('ts-note-text', !currentNote && 'ts-note-text_empty')}>
                              {currentNote || t('addNotePrompt')}
                            </div>
                          )}
                        </td>
                      )}

                      {weekendDays.length > 0 && (
                        <td
                          colSpan={weekendDays.length}
                          className={cx(
                            'ts-cell ts-note-cell_weekend',
                            weekendDays.some(d => isToday(d)) && 'ts-note-cell_today'
                          )}
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
