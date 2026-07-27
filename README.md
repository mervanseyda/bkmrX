# bkmrX

**English** | [Türkçe](README.tr.md)

A privacy-first, local web app for reviewing, organizing, exporting, and cleaning up your X (formerly Twitter) bookmarks.

Your imported data stays in a SQLite database on your computer. bkmrX does not require an account, analytics service, cloud database, or X session cookies.

## What it does

- Exports bookmarks directly from your open X tab with a browser-console script
- Imports the generated JSON file (plus compatible ZIP, JS, and CSV files)
- Provides a keyboard-friendly review flow: keep, delete candidate, export, or decide later
- Groups bookmarks by author and keeps every review decision local
- Exports selected items as a Raindrop.io-compatible CSV file
- Generates an optional browser-console script for removing queued bookmarks from X
- Supports English and Turkish, plus light and dark themes

Marking a bookmark as **Delete** only adds it to a local queue. Nothing is removed from X until you explicitly generate the deletion script and run it while signed in on `x.com`.

## Requirements

- Node.js 20.9 or newer
- npm

## Quick start

```bash
# Clone this repository, then enter its directory:
git clone https://github.com/mervanseyda/bkmrX.git
cd bkmrX
npm ci
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To create a production build:

```bash
npm run build
npm start
```

## Importing bookmarks

1. Start bkmrX and open **Import Data**.
2. Open [x.com/i/bookmarks](https://x.com/i/bookmarks) while signed in.
3. Open Developer Tools (`F12`) and select **Console**.
4. Copy the extraction script from bkmrX, paste it into the Console, and keep the tab open.
5. Upload the downloaded `bkmrx-bookmarks.json` file to bkmrX.

The script scrolls through the bookmarks page and collects the post ID, URL, visible text, author, and date. It runs only in your browser and does not send the export to another server. Compatible ZIP, `bookmarks.js`, JSON, and CSV files remain supported as fallback import formats.

### Switching X accounts

After finishing one account, download any exports and run the X deletion script if needed. Then open **Import Data → Start with another X account** and clear the app's local data before importing the next account. This reset affects only bkmrX's local SQLite data; it does not delete anything from X.

## Review shortcuts

| Key | Action |
| --- | --- |
| `K` | Keep |
| `D` | Add to the deletion queue |
| `E` | Add to the Raindrop export queue |
| `U` | Decide later |
| `O` | Open the current bookmark |
| `←` / `→` | Previous / next |

## Data and privacy

- Application data is stored in `local.db` in the project directory.
- `local.db`, SQLite sidecar files, environment files, dependencies, and build output are excluded from Git.
- Imported raw metadata can contain private information. Back up or delete `local.db` according to your own needs.
- The optional deletion script runs in your browser on `x.com` and uses that tab's existing session. bkmrX does not store your X cookies.

## Deletion script warning

The bulk-deletion helper uses X's undocumented web API. X may change that API without notice, which can break the script. Review the generated code and the queued bookmark count before running it. Use it at your own risk and in accordance with X's terms.

## Development

```bash
npm run lint
npm test
npm run build
```

Database commands:

```bash
npm run db:migrate  # create or update local.db
npm run db:seed     # add demo data (optional)
```

Main directories:

```text
src/app/       Next.js pages and server actions
src/components Reusable interface components
src/db/        SQLite schema, migrations, and seed data
src/lib/       Import parsers and local analysis helpers
drizzle/       Versioned database migrations
```

## Disclaimer

bkmrX is an independent project and is not affiliated with, endorsed by, or sponsored by X Corp. or Raindrop.io. X and Twitter are trademarks of their respective owners.

## License

[MIT](LICENSE)
