import React, { useMemo, useState } from 'react';
import Holidays from 'date-holidays';

// Holiday editor for managers. This module is lazy-loaded (React.lazy in
// App.jsx), so the date-holidays library ends up in a separate JS file that is
// downloaded only when the editor is opened. The schedule view uses nothing
// but the saved, ready-made list of dates.

const UI_LANGS = ['en', 'pl', 'de', 'es'];
const HOLIDAY_TYPES = ['public', 'bank', 'optional', 'observance'];
const DAY_MS = 24 * 60 * 60 * 1000;

const TEXTS = {
  en: {
    title: 'Holidays and days off',
    back: 'Back to schedule',
    year: 'Year',
    yearNew: '{year} (new)',
    country: 'Country',
    state: 'State / province',
    region: 'Region',
    any: '— all —',
    choose: '— choose —',
    types: 'Holiday types',
    type_public: 'Public',
    type_bank: 'Bank',
    type_optional: 'Optional',
    type_observance: 'Observance',
    load: 'Load from date-holidays',
    statusStored: 'Saved list for {year}: {count} days.',
    statusGenerated: 'Not saved yet: list for {year} generated from date-holidays. Review it and click Save.',
    statusDirty: 'You have unsaved changes.',
    chooseCountry: 'Choose a country to generate public holidays.',
    colDate: 'Date',
    colDay: 'Day',
    colName: 'Name',
    colSource: 'Source',
    srcImport: 'date-holidays',
    srcCustom: 'Custom',
    remove: 'Remove',
    empty: 'No days off in this year.',
    addTitle: 'Add a custom day off',
    addNamePlaceholder: 'e.g. Day off in lieu of 15 August',
    add: 'Add',
    errDate: 'Choose a date within {year}.',
    errName: 'Enter a name.',
    errDuplicate: 'This day off is already on the list.',
    errLibrary: 'date-holidays could not generate holidays: {msg}',
    errSave: 'Saving failed: {msg}',
    deleteYear: 'Delete year {year}',
    discard: 'Discard changes',
    save: 'Save',
    saving: 'Saving…',
    saved: 'Saved.',
    cancel: 'Cancel',
    reloadTitle: 'Reload holidays from date-holidays?',
    reloadBody: 'The saved list for {year} will be replaced with data from the library. Changes take effect after you click Save.',
    reloadKeepCustom: 'Replace imported, keep custom',
    reloadAll: 'Replace everything',
    switchTitle: 'Discard unsaved changes?',
    switchBody: 'Changes to the list for {year} have not been saved.',
    switchConfirm: 'Discard',
    deleteTitle: 'Delete holidays for {year}?',
    deleteBody: 'The schedule will show only weekends for this year until a new list is saved.',
    deleteConfirm: 'Delete',
    attribution: 'Holiday data: date-holidays (CC BY 3.0).'
  },
  pl: {
    title: 'Święta i dni wolne',
    back: 'Wróć do grafiku',
    year: 'Rok',
    yearNew: '{year} (nowy)',
    country: 'Kraj',
    state: 'Województwo / stan',
    region: 'Region',
    any: '— wszystkie —',
    choose: '— wybierz —',
    types: 'Rodzaje świąt',
    type_public: 'Ustawowe',
    type_bank: 'Bankowe',
    type_optional: 'Opcjonalne',
    type_observance: 'Okolicznościowe',
    load: 'Pobierz z date-holidays',
    statusStored: 'Zapisana lista na {year}: {count} dni.',
    statusGenerated: 'Jeszcze niezapisane: lista na {year} wygenerowana z date-holidays. Przejrzyj ją i kliknij Zapisz.',
    statusDirty: 'Masz niezapisane zmiany.',
    chooseCountry: 'Wybierz kraj, aby wygenerować święta ustawowe.',
    colDate: 'Data',
    colDay: 'Dzień',
    colName: 'Nazwa',
    colSource: 'Źródło',
    srcImport: 'date-holidays',
    srcCustom: 'Własny',
    remove: 'Usuń',
    empty: 'Brak dni wolnych w tym roku.',
    addTitle: 'Dodaj własny dzień wolny',
    addNamePlaceholder: 'np. Dzień wolny za 15 sierpnia',
    add: 'Dodaj',
    errDate: 'Wybierz datę z roku {year}.',
    errName: 'Wpisz nazwę.',
    errDuplicate: 'Ten dzień wolny jest już na liście.',
    errLibrary: 'date-holidays nie wygenerowało świąt: {msg}',
    errSave: 'Zapis nie powiódł się: {msg}',
    deleteYear: 'Usuń rok {year}',
    discard: 'Odrzuć zmiany',
    save: 'Zapisz',
    saving: 'Zapisywanie…',
    saved: 'Zapisano.',
    cancel: 'Anuluj',
    reloadTitle: 'Pobrać święta ponownie z date-holidays?',
    reloadBody: 'Zapisana lista na {year} zostanie zastąpiona danymi z biblioteki. Zmiany zaczną obowiązywać po kliknięciu Zapisz.',
    reloadKeepCustom: 'Zastąp importowane, zachowaj własne',
    reloadAll: 'Zastąp wszystko',
    switchTitle: 'Odrzucić niezapisane zmiany?',
    switchBody: 'Zmiany na liście na {year} nie zostały zapisane.',
    switchConfirm: 'Odrzuć',
    deleteTitle: 'Usunąć święta na {year}?',
    deleteBody: 'Do czasu zapisania nowej listy grafik pokaże w tym roku tylko weekendy.',
    deleteConfirm: 'Usuń',
    attribution: 'Dane o świętach: date-holidays (CC BY 3.0).'
  },
  de: {
    title: 'Feiertage und freie Tage',
    back: 'Zurück zum Plan',
    year: 'Jahr',
    yearNew: '{year} (neu)',
    country: 'Land',
    state: 'Bundesland / Staat',
    region: 'Region',
    any: '— alle —',
    choose: '— auswählen —',
    types: 'Feiertagsarten',
    type_public: 'Gesetzlich',
    type_bank: 'Bankfeiertag',
    type_optional: 'Optional',
    type_observance: 'Gedenktag',
    load: 'Aus date-holidays laden',
    statusStored: 'Gespeicherte Liste für {year}: {count} Tage.',
    statusGenerated: 'Noch nicht gespeichert: Liste für {year} aus date-holidays erzeugt. Prüfen und auf Speichern klicken.',
    statusDirty: 'Es gibt ungespeicherte Änderungen.',
    chooseCountry: 'Wählen Sie ein Land, um die Feiertage zu erzeugen.',
    colDate: 'Datum',
    colDay: 'Tag',
    colName: 'Name',
    colSource: 'Quelle',
    srcImport: 'date-holidays',
    srcCustom: 'Eigener',
    remove: 'Entfernen',
    empty: 'Keine freien Tage in diesem Jahr.',
    addTitle: 'Eigenen freien Tag hinzufügen',
    addNamePlaceholder: 'z. B. Brückentag',
    add: 'Hinzufügen',
    errDate: 'Wählen Sie ein Datum im Jahr {year}.',
    errName: 'Geben Sie einen Namen ein.',
    errDuplicate: 'Dieser freie Tag ist bereits in der Liste.',
    errLibrary: 'date-holidays konnte keine Feiertage erzeugen: {msg}',
    errSave: 'Speichern fehlgeschlagen: {msg}',
    deleteYear: 'Jahr {year} löschen',
    discard: 'Änderungen verwerfen',
    save: 'Speichern',
    saving: 'Wird gespeichert…',
    saved: 'Gespeichert.',
    cancel: 'Abbrechen',
    reloadTitle: 'Feiertage erneut aus date-holidays laden?',
    reloadBody: 'Die gespeicherte Liste für {year} wird durch Daten der Bibliothek ersetzt. Die Änderungen gelten nach dem Speichern.',
    reloadKeepCustom: 'Importierte ersetzen, eigene behalten',
    reloadAll: 'Alles ersetzen',
    switchTitle: 'Ungespeicherte Änderungen verwerfen?',
    switchBody: 'Die Änderungen an der Liste für {year} wurden nicht gespeichert.',
    switchConfirm: 'Verwerfen',
    deleteTitle: 'Feiertage für {year} löschen?',
    deleteBody: 'Bis eine neue Liste gespeichert wird, zeigt der Plan für dieses Jahr nur Wochenenden.',
    deleteConfirm: 'Löschen',
    attribution: 'Feiertagsdaten: date-holidays (CC BY 3.0).'
  },
  es: {
    title: 'Festivos y días libres',
    back: 'Volver al calendario',
    year: 'Año',
    yearNew: '{year} (nuevo)',
    country: 'País',
    state: 'Provincia / estado',
    region: 'Región',
    any: '— todas —',
    choose: '— elegir —',
    types: 'Tipos de festivos',
    type_public: 'Oficiales',
    type_bank: 'Bancarios',
    type_optional: 'Opcionales',
    type_observance: 'Conmemorativos',
    load: 'Cargar desde date-holidays',
    statusStored: 'Lista guardada para {year}: {count} días.',
    statusGenerated: 'Aún sin guardar: lista para {year} generada con date-holidays. Revísela y pulse Guardar.',
    statusDirty: 'Hay cambios sin guardar.',
    chooseCountry: 'Elija un país para generar los festivos oficiales.',
    colDate: 'Fecha',
    colDay: 'Día',
    colName: 'Nombre',
    colSource: 'Origen',
    srcImport: 'date-holidays',
    srcCustom: 'Propio',
    remove: 'Quitar',
    empty: 'No hay días libres en este año.',
    addTitle: 'Añadir un día libre propio',
    addNamePlaceholder: 'p. ej. Día puente',
    add: 'Añadir',
    errDate: 'Elija una fecha del año {year}.',
    errName: 'Introduzca un nombre.',
    errDuplicate: 'Este día libre ya está en la lista.',
    errLibrary: 'date-holidays no pudo generar los festivos: {msg}',
    errSave: 'Error al guardar: {msg}',
    deleteYear: 'Eliminar el año {year}',
    discard: 'Descartar cambios',
    save: 'Guardar',
    saving: 'Guardando…',
    saved: 'Guardado.',
    cancel: 'Cancelar',
    reloadTitle: '¿Volver a cargar los festivos desde date-holidays?',
    reloadBody: 'La lista guardada para {year} se sustituirá por los datos de la biblioteca. Los cambios se aplican al pulsar Guardar.',
    reloadKeepCustom: 'Sustituir importados, conservar propios',
    reloadAll: 'Sustituir todo',
    switchTitle: '¿Descartar los cambios sin guardar?',
    switchBody: 'Los cambios en la lista para {year} no se han guardado.',
    switchConfirm: 'Descartar',
    deleteTitle: '¿Eliminar los festivos de {year}?',
    deleteBody: 'Hasta que se guarde una nueva lista, el calendario mostrará solo los fines de semana de este año.',
    deleteConfirm: 'Eliminar',
    attribution: 'Datos de festivos: date-holidays (CC BY 3.0).'
  }
};

const EDITOR_CSS = `
  .ts-hol { max-width: 960px; }
  .ts-hol__controls { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px 16px; margin-bottom: 12px; }
  .ts-hol__field { display: flex; flex-direction: column; gap: 4px; color: var(--ts-text-secondary); font-size: 12px; }
  .ts-hol__types { display: flex; flex-wrap: wrap; gap: 4px 12px; color: var(--ts-text); font-size: 13px; }
  .ts-hol__types label { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }
  .ts-hol__status { margin-bottom: 12px; }
  .ts-hol__status_warn { color: var(--ts-warning, var(--ts-text)); font-weight: 600; }
  .ts-hol__table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  .ts-hol__table th, .ts-hol__table td { padding: 6px 8px; border-bottom: 1px solid var(--ts-border); text-align: left; vertical-align: middle; }
  .ts-hol__table th { color: var(--ts-text-secondary); font-weight: 600; font-size: 12px; }
  .ts-hol__weekend { color: var(--ts-text-secondary); }
  .ts-hol__source { color: var(--ts-text-secondary); font-size: 12px; }
  .ts-hol__input {
    height: 28px; padding: 0 8px;
    border: 1px solid var(--ts-border); border-radius: var(--ts-radius);
    background: var(--ts-bg); color: var(--ts-text); font: inherit;
  }
  .ts-hol__input:focus { outline: none; border-color: var(--ts-accent); }
  .ts-hol__input_wide { width: 100%; min-width: 240px; }
  .ts-hol__add { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 8px; }
  .ts-hol__add h4 { width: 100%; margin: 0; font-size: 14px; font-weight: 600; }
  .ts-hol__error { color: var(--ts-error); margin-bottom: 8px; }
  .ts-hol__ok { color: var(--ts-success); }
  .ts-hol__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 16px 0; }
  .ts-hol__spacer { flex: 1; }
  .ts-hol__link { padding: 0; border: 0; background: none; color: var(--ts-error); font: inherit; cursor: pointer; }
  .ts-hol__link:hover { text-decoration: underline; }
  .ts-hol__footer { color: var(--ts-text-disabled); font-size: 11px; }
  .ts-modal_wide { width: 480px; }
`;

const pickName = (names, lang) =>
  (names && (names[lang] || names.en || Object.values(names)[0])) || '';

const sortEntries = (entries) =>
  [...entries].sort((a, b) =>
    a.date === b.date ? pickName(a.names, 'en').localeCompare(pickName(b.names, 'en')) : (a.date < b.date ? -1 : 1));

const addDaysToKey = (key, days) => {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().substring(0, 10);
};

// A holiday can span several days (start/end); expand it into single dates.
const expandDays = (holiday, year) => {
  const first = String(holiday.date || '').substring(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(first)) return [];
  let span = 1;
  if (holiday.start instanceof Date && holiday.end instanceof Date) {
    span = Math.min(31, Math.max(1, Math.round((holiday.end - holiday.start) / DAY_MS)));
  }
  const days = [];
  for (let i = 0; i < span; i++) {
    const key = addDaysToKey(first, i);
    if (key.startsWith(String(year))) days.push(key);
  }
  return days;
};

// Generates holidays from the library with names in every UI language.
// When the library has no translation it returns the local name; for
// languages other than the country's own we use the English name instead.
const generateEntries = (year, country, state, region, types) => {
  if (!country) return [];
  const hd = new Holidays();
  hd.init(country, state || undefined, region || undefined, { types });

  const localLang = (hd.getLanguages() || [])[0] || 'en';
  const lists = {};
  UI_LANGS.forEach(l => { lists[l] = hd.getHolidays(year, l) || []; });
  const localList = hd.getHolidays(year, localLang) || [];
  const base = lists.en;

  const seen = new Set();
  const entries = [];
  base.forEach((holiday, i) => {
    const names = {};
    UI_LANGS.forEach(l => {
      const item = lists[l][i];
      let name = item && item.date === holiday.date ? item.name : holiday.name;
      const local = localList[i] && localList[i].date === holiday.date ? localList[i].name : null;
      if (l !== 'en' && l !== localLang && local && name === local) name = holiday.name;
      names[l] = name;
    });

    expandDays(holiday, year).forEach(date => {
      const key = `${date}|${names.en}`;
      if (seen.has(key)) return;
      seen.add(key);
      entries.push({ date, names: { ...names }, source: 'import', type: holiday.type || '' });
    });
  });
  return sortEntries(entries);
};

const guessCountry = (countries, lang) => {
  const fromBrowser = (typeof navigator !== 'undefined' && navigator.language || '').split('-')[1];
  const candidates = [fromBrowser, lang === 'pl' ? 'PL' : null, lang === 'de' ? 'DE' : null, lang === 'es' ? 'ES' : null];
  const hit = candidates.find(c => c && countries[c.toUpperCase()]);
  return hit ? hit.toUpperCase() : '';
};

export default function HolidaysEditor({ host, lang, initialYear, holidays, onSaved, onClose }) {
  const tx = (key, params = {}) => {
    let text = (TEXTS[lang] || TEXTS.en)[key] || TEXTS.en[key] || key;
    Object.keys(params).forEach(p => { text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]); });
    return text;
  };

  const lookup = useMemo(() => new Holidays(), []);
  const countries = useMemo(() => {
    const list = lookup.getCountries(lang) || {};
    return Object.keys(list)
      .map(code => ({ code, name: list[code] }))
      .sort((a, b) => a.name.localeCompare(b.name, lang));
  }, [lookup, lang]);

  const stored = (holidays && holidays.years) || {};
  const currentYear = new Date().getFullYear();

  const [country, setCountry] = useState(() =>
    (holidays && holidays.country) || guessCountry(lookup.getCountries() || {}, lang));
  const [stateCode, setStateCode] = useState(() => (holidays && holidays.state) || '');
  const [regionCode, setRegionCode] = useState(() => (holidays && holidays.region) || '');
  const [types, setTypes] = useState(() =>
    (holidays && Array.isArray(holidays.types) && holidays.types.length) ? holidays.types : ['public']);

  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newName, setNewName] = useState('');

  // No setState here: this also runs in a useState initializer, i.e. during render.
  const tryGenerate = (year, c, s, r, ty) => {
    try {
      return { entries: generateEntries(year, c, s, r, ty), genError: null };
    } catch (e) {
      return { entries: [], genError: tx('errLibrary', { msg: e && e.message ? e.message : String(e) }) };
    }
  };

  const loadYearState = (year, c = country, s = stateCode, r = regionCode, ty = types) => {
    const saved = stored[String(year)];
    if (saved && Array.isArray(saved.entries)) {
      return { year, entries: sortEntries(saved.entries), isStored: true, touched: false, genError: null };
    }
    return { year, ...tryGenerate(year, c, s, r, ty), isStored: false, touched: false };
  };

  const [view, setView] = useState(() => loadYearState(initialYear || currentYear));
  const { year, entries, isStored, touched, genError } = view;
  const edit = (nextEntries) => setView({ ...view, entries: nextEntries, touched: true });

  const savedJson = isStored ? JSON.stringify(sortEntries(stored[String(year)].entries)) : null;
  const isDirty = !isStored || JSON.stringify(entries) !== savedJson;

  const states = useMemo(() => (country ? lookup.getStates(country, lang) : null) || {}, [lookup, country, lang]);
  const regions = useMemo(
    () => (country && stateCode ? lookup.getRegions(country, stateCode, lang) : null) || {},
    [lookup, country, stateCode, lang]
  );

  const yearOptions = useMemo(() => {
    const set = new Set(Object.keys(stored).map(Number));
    for (let y = currentYear - 1; y <= currentYear + 2; y++) set.add(y);
    set.add(year);
    return [...set].filter(Number.isFinite).sort((a, b) => a - b);
  }, [stored, currentYear, year]);

  const mergeImported = (imported, keepCustom) =>
    sortEntries([...imported, ...(keepCustom ? entries.filter(e => e.source === 'custom') : [])]);

  // Region or type change: an unsaved year is regenerated right away (custom
  // days are kept); a saved year changes only after "Load from date-holidays".
  const applySettings = (c, s, r, ty) => {
    setCountry(c); setStateCode(s); setRegionCode(r); setTypes(ty);
    setMessage(null);
    if (!isStored) {
      const generated = tryGenerate(year, c, s, r, ty);
      setView({ ...view, ...generated, entries: mergeImported(generated.entries, true) });
    }
  };

  const changeYear = (nextYear) => {
    const go = () => { setConfirm(null); setMessage(null); setError(null); setView(loadYearState(nextYear)); };
    if (touched && isDirty && nextYear !== year) {
      setConfirm({
        title: tx('switchTitle'),
        body: tx('switchBody', { year }),
        actions: [{ label: tx('switchConfirm'), primary: true, onClick: go }]
      });
    } else {
      go();
    }
  };

  const reload = (keepCustom) => {
    setConfirm(null);
    setMessage(null);
    const generated = tryGenerate(year, country, stateCode, regionCode, types);
    setView({ ...view, ...generated, entries: mergeImported(generated.entries, keepCustom), touched: true });
  };

  const handleLoadClick = () => {
    if (isStored || entries.some(e => e.source === 'custom')) {
      setConfirm({
        title: tx('reloadTitle'),
        body: tx('reloadBody', { year }),
        actions: [
          { label: tx('reloadAll'), onClick: () => reload(false) },
          { label: tx('reloadKeepCustom'), primary: true, onClick: () => reload(true) }
        ]
      });
    } else {
      reload(true);
    }
  };

  const removeEntry = (index) => {
    setMessage(null);
    edit(entries.filter((_, i) => i !== index));
  };

  const renameCustom = (index, value) => {
    setMessage(null);
    edit(entries.map((e, i) => (i === index ? { ...e, names: { [lang]: value } } : e)));
  };

  const addCustom = () => {
    const name = newName.trim();
    if (!newDate || !newDate.startsWith(String(year))) { setError(tx('errDate', { year })); return; }
    if (!name) { setError(tx('errName')); return; }
    if (entries.some(e => e.date === newDate && pickName(e.names, lang) === name)) {
      setError(tx('errDuplicate'));
      return;
    }
    setError(null);
    setMessage(null);
    edit(sortEntries([...entries, { date: newDate, names: { [lang]: name }, source: 'custom', type: '' }]));
    setNewDate('');
    setNewName('');
  };

  const post = async (payloadEntries) => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const result = await host.fetchApp('backend/holidays-api', {
        method: 'POST',
        body: {
          year: String(year),
          entries: payloadEntries,
          country,
          state: stateCode,
          region: regionCode,
          types
        }
      });
      if (!result || !result.holidays) throw new Error('Unexpected response');
      onSaved(result.holidays);
      return result.holidays;
    } catch (e) {
      setError(tx('errSave', { msg: e && e.message ? e.message : String(e) }));
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    const cleaned = entries
      .map(e => ({ ...e, names: Object.fromEntries(Object.entries(e.names).filter(([, v]) => v && v.trim())) }))
      .filter(e => Object.keys(e.names).length > 0);
    const saved = await post(cleaned);
    if (saved) {
      const savedYear = saved.years && saved.years[String(year)];
      setView({
        year,
        entries: sortEntries((savedYear && savedYear.entries) || cleaned),
        isStored: true,
        touched: false,
        genError: null
      });
      setMessage(tx('saved'));
    }
  };

  const handleDeleteYear = () => {
    setConfirm({
      title: tx('deleteTitle', { year }),
      body: tx('deleteBody'),
      actions: [{
        label: tx('deleteConfirm'),
        primary: true,
        onClick: async () => {
          setConfirm(null);
          const saved = await post(null);
          if (saved) {
            setView({ year, ...tryGenerate(year, country, stateCode, regionCode, types), isStored: false, touched: false });
          }
        }
      }]
    });
  };

  const handleDiscard = () => {
    setMessage(null);
    setError(null);
    setView(loadYearState(year));
  };

  const toggleType = (type) => {
    const next = types.includes(type) ? types.filter(t => t !== type) : [...types, type];
    applySettings(country, stateCode, regionCode, next.length ? next : ['public']);
  };

  const weekday = (key) => new Date(`${key}T00:00:00`).toLocaleDateString(lang, { weekday: 'short' });
  const isWeekendKey = (key) => [0, 6].includes(new Date(`${key}T00:00:00`).getDay());
  const formatDate = (key) => new Date(`${key}T00:00:00`).toLocaleDateString(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="ts-hol">
      <style>{EDITOR_CSS}</style>

      <div className="ts-header">
        <h2 className="ts-title">{tx('title')}</h2>
        <div className="ts-toolbar">
          <button type="button" className="ts-button" onClick={onClose}>{tx('back')}</button>
        </div>
      </div>

      <div className="ts-hol__controls">
        <label className="ts-hol__field">
          {tx('year')}
          <select className="ts-select" value={year} onChange={(e) => changeYear(Number(e.target.value))}>
            {yearOptions.map(y => (
              <option key={y} value={y}>{stored[String(y)] ? y : tx('yearNew', { year: y })}</option>
            ))}
          </select>
        </label>

        <label className="ts-hol__field">
          {tx('country')}
          <select
            className="ts-select"
            value={country}
            onChange={(e) => applySettings(e.target.value, '', '', types)}
          >
            <option value="">{tx('choose')}</option>
            {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </label>

        {Object.keys(states).length > 0 && (
          <label className="ts-hol__field">
            {tx('state')}
            <select
              className="ts-select"
              value={stateCode}
              onChange={(e) => applySettings(country, e.target.value, '', types)}
            >
              <option value="">{tx('any')}</option>
              {Object.keys(states).map(code => <option key={code} value={code}>{states[code]}</option>)}
            </select>
          </label>
        )}

        {Object.keys(regions).length > 0 && (
          <label className="ts-hol__field">
            {tx('region')}
            <select
              className="ts-select"
              value={regionCode}
              onChange={(e) => applySettings(country, stateCode, e.target.value, types)}
            >
              <option value="">{tx('any')}</option>
              {Object.keys(regions).map(code => <option key={code} value={code}>{regions[code]}</option>)}
            </select>
          </label>
        )}

        <div className="ts-hol__field">
          {tx('types')}
          <div className="ts-hol__types">
            {HOLIDAY_TYPES.map(type => (
              <label key={type}>
                <input type="checkbox" checked={types.includes(type)} onChange={() => toggleType(type)} />
                {tx(`type_${type}`)}
              </label>
            ))}
          </div>
        </div>

        <button type="button" className="ts-button" onClick={handleLoadClick} disabled={!country || saving}>
          {tx('load')}
        </button>
      </div>

      <div className="ts-hol__status">
        {!country && <div>{tx('chooseCountry')}</div>}
        {isStored && <div>{tx('statusStored', { year, count: entries.length })}</div>}
        {!isStored && country && <div className="ts-hol__status_warn">{tx('statusGenerated', { year })}</div>}
        {isStored && isDirty && <div className="ts-hol__status_warn">{tx('statusDirty')}</div>}
      </div>

      {(error || genError) && <div className="ts-hol__error">{error || genError}</div>}

      <table className="ts-hol__table">
        <thead>
          <tr>
            <th>{tx('colDate')}</th>
            <th>{tx('colDay')}</th>
            <th>{tx('colName')}</th>
            <th>{tx('colSource')}</th>
            <th aria-label={tx('remove')} />
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 && (
            <tr><td colSpan={5} className="ts-hol__source">{tx('empty')}</td></tr>
          )}
          {entries.map((entry, index) => (
            <tr key={`${entry.date}-${index}`}>
              <td>{formatDate(entry.date)}</td>
              <td className={isWeekendKey(entry.date) ? 'ts-hol__weekend' : undefined}>{weekday(entry.date)}</td>
              <td>
                {entry.source === 'custom' ? (
                  <input
                    className="ts-hol__input ts-hol__input_wide"
                    value={pickName(entry.names, lang)}
                    onChange={(e) => renameCustom(index, e.target.value)}
                  />
                ) : pickName(entry.names, lang)}
              </td>
              <td className="ts-hol__source">{entry.source === 'custom' ? tx('srcCustom') : tx('srcImport')}</td>
              <td>
                <button type="button" className="ts-hol__link" onClick={() => removeEntry(index)}>{tx('remove')}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ts-hol__add">
        <h4>{tx('addTitle')}</h4>
        <input
          type="date"
          className="ts-hol__input"
          value={newDate}
          min={`${year}-01-01`}
          max={`${year}-12-31`}
          onChange={(e) => setNewDate(e.target.value)}
        />
        <input
          className="ts-hol__input ts-hol__input_wide"
          style={{ flex: 1 }}
          value={newName}
          placeholder={tx('addNamePlaceholder')}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addCustom(); }}
        />
        <button type="button" className="ts-button" onClick={addCustom}>{tx('add')}</button>
      </div>

      <div className="ts-hol__actions">
        {isStored && (
          <button type="button" className="ts-hol__link" onClick={handleDeleteYear} disabled={saving}>
            {tx('deleteYear', { year })}
          </button>
        )}
        <span className="ts-hol__spacer" />
        {message && <span className="ts-hol__ok">{message}</span>}
        {isStored && isDirty && (
          <button type="button" className="ts-button" onClick={handleDiscard} disabled={saving}>{tx('discard')}</button>
        )}
        <button
          type="button"
          className="ts-button ts-button_primary"
          onClick={handleSave}
          disabled={saving || !isDirty}
        >
          {saving ? tx('saving') : tx('save')}
        </button>
      </div>

      <div className="ts-hol__footer">{tx('attribution')}</div>

      {confirm && (
        <div className="ts-modal-overlay">
          <div className="ts-modal ts-modal_wide" role="dialog" aria-modal="true" aria-labelledby="ts-hol-confirm">
            <h3 id="ts-hol-confirm" className="ts-modal__title">{confirm.title}</h3>
            <p className="ts-modal__body">{confirm.body}</p>
            <div className="ts-modal__actions">
              <button type="button" className="ts-button" onClick={() => setConfirm(null)}>{tx('cancel')}</button>
              {confirm.actions.map(action => (
                <button
                  key={action.label}
                  type="button"
                  className={action.primary ? 'ts-button ts-button_primary' : 'ts-button'}
                  onClick={action.onClick}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
