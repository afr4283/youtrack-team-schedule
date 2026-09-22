# Team Allocation Schedule for YouTrack

> **Effortlessly plan, track, and manage team project allocations and absences directly inside YouTrack.**

**Team Allocation Schedule** brings an intuitive, spreadsheet-like planning board right into your YouTrack instance. Designed for project managers, team leads, and resource managers, it eliminates the need for external tools by offering a clear, centralized view of team capacity and project assignments.

---

## Key Features

* **Excel-Style Interactive Grid**
  * **Fast Navigation:** Use arrow keys (`↑` `↓` `←` `→`) to move seamlessly across schedule cells.
  * **Bulk Selection:** Select range of cells using `Shift` + arrow keys or mouse drag.
  * **Copy & Paste:** Quickly duplicate project allocations across multiple days/employees using standard keyboard shortcuts (`Ctrl+C` / `Ctrl+V` or `Cmd+C` / `Cmd+V`).

* **Flexible View Modes**
  * **4-Week View:** Operational short-term planning (1 week past, 2 weeks ahead).
  * **3-Month View:** Mid-term capacity planning and resource allocation.
  * **Full Year View:** Long-term roadmap and annual project distribution.

* **Role-Based Access Control**
  * **Managers:** Full editing rights to assign projects, manage notes, and export data.
  * **Workers:** Clean, read-only view of individual and team schedules.

* **Absence & Leave Management**
  * Integrated handling for vacations and holidays.
  * Visual collision alerts when scheduling project work during approved leave.
  * Automatic highlight of weekends and national public holidays.

* **Smart Visual Styling & Direct Links**
  * Automatic hue-based color generation for distinct project visualization.
  * Direct one-click links to jump straight into YouTrack project pages.

* **Weekly Manager Notes**
  * Dedicated notes row for weekly team context, shift updates, or reminders.

* **Full Year CSV Export**
  * Export complete annual schedules to UTF-8 encoded `.csv` files for Excel or executive reporting.

* **Multi-Language Support (i18n)**
  * Localized in **English**, **Polish**, **German**, and **Spanish**.

---

## Configuration

Configure the plugin directly in YouTrack's App Settings page:

1. **Language:** Choose your preferred UI language (`English`, `Polish`, `German`, `Spanish`).
2. **User Groups:** Define custom group names for **Managers** (edit access) and **Workers** (view access).
3. **Absence Project:** Set the custom name for your leave/vacation project label.

---

## Security & Data Storage

All schedule data is stored internally within your instance's secure **YouTrack App Storage** (`globalStorage`). 

* No external backend dependencies.
* No third-party API calls.
* Zero data leaves your YouTrack environment.

### Known issues
Roles for display type (Manager/Employee) verified on frontend.

---

## License

Distributed under the **Apache License 2.0**. See `LICENSE` for more information.

# Build
```
cp schedule-app-v4-multilang.js  src/App.jsx
for i in "manifest.json" "entity-extensions.json" "backend.js" "settings.json" ; do cp $i public/ ; done
npm run build
cd dist/ ; mkdir widgets ; mv assets favicon.svg icons.svg index.html widgets/ ; zip -r ../schedule-app.zip .
```
