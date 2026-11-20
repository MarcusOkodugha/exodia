# Run it on your Mac

Exodia runs straight from `public/`: no build step. Edit a file, save, and the page reloads by itself.

1. Terminal on your Mac, get the latest version:

   ```
   cd ~/code/exodia && git pull
   ```

2. Start it (the first time, npx asks to install live-server: type `y`):

   ```
   cd ~/code/exodia && npx live-server public --port=8765
   ```

   The browser opens http://127.0.0.1:8765 with a log named **Test**: half a year of training, a body (88 kg, 182 cm,
   male, 30) so the anatomy and the strength levels show. It's only on this computer and never touches your real log.
   Every save in VS Code reloads the page. Stop it with Ctrl+C.

On localhost the app knows it's on your Mac:

- No service worker, so a reload always shows your latest edit.
- There's no server: simple lines still log on the computer ("bench 144 1 deadlift 299 1 squat 189 1", "squat 140x5x3").
  Anything else shows "Needs the server" above the box. Friends, sync and Admin stay quiet.
- To start the Test log again: Chrome → View → Developer → Developer Tools → Application → Storage → Clear site data,
  then reload.

## Where the colours are

- `public/styles.css`, at the top in `:root`: `--clay` (the orange accent), `--tierBeg`, `--tierNov`, `--tierInt` (the
  strength levels grey, sage, purple; Advanced is `--clay`, Elite is `--exodiaBlue`), `--bg`, `--card`, `--text`.
- `public/app.js`: `TIER_COLOURS` (the same level colours, for the 3D body and the charts) and `RECOVERY_HEX` (the four
  recovery steps, just trained to recovered). Change a level colour in both `styles.css` and `TIER_COLOURS`.
- `public/body3d.js`: `HEADS` (the whole-body colour when every muscle is Advanced or Elite).

Your edits only go live when they're committed and pushed to `main`; until then the live site stays as it is.
