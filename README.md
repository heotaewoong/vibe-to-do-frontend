# NeuroLink-style Landing (HTML/CSS/JS)

A responsive landing page inspired by the attached design. Includes a canvas-based animated wireframe brain, dark gradient background, and mobile menu.

## Files
- `index.html` – markup and structure
- `styles.css` – styling with responsive layout and fonts
- `script.js` – mobile nav + animated canvas brain

## Preview (Windows / PowerShell)
You can open `index.html` directly or serve it locally for best results.

- Option A: Double-click `index.html` to open in your browser.
- Option B: Serve with Python (if installed):

```powershell
# from the project folder
python -m http.server 5173
```
Then open http://localhost:5173 in your browser.

## Customize
- Change titles and text in `index.html`.
- Tweak colors/sizes in `styles.css` (see CSS variables at the top).
- Adjust animation density in `script.js` by changing `POINTS`.

## Notes
- Fonts use Google Fonts (Orbitron + Inter).
- The canvas scales to device pixel ratio for crisp lines on retina screens.