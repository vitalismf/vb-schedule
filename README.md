# VB Schedule

Embeddable schedule widget for Vitalist Bay. Serves the schedule data and UI components via GitHub Pages.

## Live URLs

- **Widget:** https://vitalismf.github.io/vb-schedule/
- **Embedded on:** https://vitalistbay.com

## How It Works

The schedule is embedded on vitalistbay.com using three files served from this repo:

```html
<link rel="stylesheet" href="https://vitalismf.github.io/vb-schedule/schedule.css">
<div id="vb-schedule"></div>
<script src="https://vitalismf.github.io/vb-schedule/schedule-data.js"></script>
<script src="https://vitalismf.github.io/vb-schedule/schedule.js"></script>
<script>
  new VitalistBaySchedule('vb-schedule', SCHEDULE_DATA);
</script>
```

## File Structure

```
├── schedule-data.json   # Source of truth (human-editable JSON)
├── schedule-data.js     # Production file (generated from JSON)
├── schedule.js          # Widget logic
├── schedule.css         # Widget styles
├── index.html           # Local preview page
├── json-to-js.sh        # Regenerate .js from .json
└── sheet-to-json.js     # Sync from Google Sheet → .json + .js
```

## Updating the Schedule

### Option 1: Manual Edit

Edit `schedule-data.json` directly, then regenerate the production file:

```bash
./json-to-js.sh
git add schedule-data.json schedule-data.js
git commit -m "Update schedule"
git push
```

### Option 2: Sync from Google Sheet

Pull latest data from the master spreadsheet:

```bash
node sheet-to-json.js --fetch
git add schedule-data.json schedule-data.js
git commit -m "Sync schedule from sheet"
git push
```

This fetches the CSV export, converts it to JSON, and generates both `.json` and `.js` files.

### Option 3: From Local CSV

If you have a CSV export:

```bash
node sheet-to-json.js your-export.csv
git add schedule-data.json schedule-data.js
git commit -m "Update schedule from CSV"
git push
```

## Data Format

`schedule-data.json` structure:

```json
{
  "event": {
    "name": "Vitalist Bay 2026",
    "dates": ["2026-05-14", "2026-05-15", "2026-05-16", "2026-05-17"],
    "timezone": "America/Los_Angeles"
  },
  "tracks": [
    { "id": "main", "name": "Main", "color": "#1437D0" }
  ],
  "sessions": [
    {
      "id": "unique-id",
      "title": "Session Title",
      "date": "2026-05-14",
      "startTime": "09:00",
      "endTime": "10:00",
      "track": "main",
      "speakers": [
        { "name": "Speaker Name", "image": "https://..." }
      ]
    }
  ]
}
```

## Local Preview

Open `index.html` in a browser to preview the schedule locally.

## Deployment

Push to `main` branch → GitHub Pages auto-deploys → Live in ~1 minute.
