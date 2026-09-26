# SHEMS – Smart Home Energy Management System

A simple web app for the SHEMS project. It can be added to the home screen of an iPhone or Android
phone and opens full screen like a normal app (a PWA – Progressive Web App).

## What SHEMS does

An ATS (Automatic Transfer Switch) switches the home to a battery when grid power fails. SHEMS is
built on top of that idea and adds four functions for three critical loads (a medical device, a
refrigerator and an air conditioner):

1. **Monitoring** – current and power of each load in real time
2. **Remote control** – turn loads on/off from the app or by SMS
3. **Alerting** – instant SMS when grid power is lost
4. **Load management** – keeps the total load under the battery's 60 W capacity

The hardware is not connected yet, so the app shows **System offline**: all loads read 0 and the
home runs on the grid. When the hardware is ready, set `SYSTEM_ONLINE = true` in `app.js`.

## Files

| File            | What it does                                                   |
| --------------- | -------------------------------------------------------------- |
| `index.html`    | The main screen: power source, load management, loads, alerts  |
| `how.html`      | "How SHEMS works" explanation page (the "?" icon in the header)|
| `style.css`     | Colors, layout, the on/off switches and the splash screen      |
| `app.js`        | The data (3 loads, power source, alerts) and the buttons       |
| `manifest.json` | App name, icon and colors, so it can be installed              |
| `sw.js`         | Service worker: saves the files so the app opens offline       |
| `icons/`        | App icon and iPhone launch screens                             |

## Run it on your computer

```bash
python3 -m http.server 5180
```

Then open http://localhost:5180.

## Put it online

Upload the folder to any free static host (GitHub Pages, Netlify, Cloudflare Pages). No build step.
Then open the link on the phone:

- **iPhone (Safari):** Share → Add to Home Screen
- **Android (Chrome):** ⋮ menu → Install app
