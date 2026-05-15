# Magyar — Language Learning App

A self-hosted Hungarian language reference served from a Docker container,
with content loaded from a TrueNAS dataset at runtime.

---

## Architecture

```
Registry image (nginx:alpine + app shell)
└── /usr/share/nginx/html/
    ├── index.html          ← baked into the image
    ├── css/                ← baked into the image
    ├── js/                 ← baked into the image
    └── data/               ← MOUNTED at runtime from a TrueNAS dataset
        ├── manifest.json
        ├── verbs.json
        ├── irregular.json
        └── (add more files here without rebuilding)
```

The image contains only the app shell. All content lives on the NAS.
Edit a JSON file → refresh browser. No restart, no rebuild.

---

## Deployment on TrueNAS SCALE

TrueNAS SCALE doesn't run `docker compose` — it pulls images from a registry
and configures them through the **Custom App** UI (or a Helm chart).

### Step 1 — Push the image to a registry

Choose one option:

**Option A — GitHub Container Registry (free, no account needed beyond GitHub)**

Push directly from this repo:
1. Fork or push this repo to GitHub
2. GitHub Actions (`.github/workflows/build.yml`) builds and pushes automatically
   on every commit to `main`
3. Your image will be at:
   `ghcr.io/YOUR_GITHUB_USERNAME/hu-learn:latest`

**Option B — Docker Hub**

```bash
docker login
./build.sh your-dockerhub-username/hu-learn
```

**Option C — Build and push manually (any registry)**

```bash
./build.sh ghcr.io/you/hu-learn          # latest
./build.sh ghcr.io/you/hu-learn 1.0.0    # specific version
```

The script prompts whether to push and prints the image URL at the end.

---

### Step 2 — Create the dataset on TrueNAS

In **TrueNAS SCALE → Datasets → Add Dataset**:
- Name: `hu-learn-data`
- Suggested path: `/mnt/tank/appdata/hu-learn-data`
- Permissions: readable by the `nginx` user (uid 101), or just `755`

Copy the data files to it:
```bash
scp app/data/*.json admin@truenas.local:/mnt/tank/appdata/hu-learn-data/
```

---

### Step 3 — Add as a Custom App in TrueNAS SCALE

Go to **Apps → Discover Apps → Custom App** and fill in:

| Field | Value |
|---|---|
| Application Name | `hu-learn` |
| Image Repository | `ghcr.io/you/hu-learn` (your image from Step 1) |
| Image Tag | `latest` |
| Container Port | `80` |
| Node Port | `8420` (or whatever you prefer) |

Under **Storage → Add Volume Mount**:

| Field | Value |
|---|---|
| Host Path | `/mnt/tank/appdata/hu-learn-data` |
| Mount Path | `/usr/share/nginx/html/data` |
| Read Only | ✓ |

Leave everything else as default and click **Install**.

Open `http://truenas-ip:8420` in your browser.

---

### Step 4 — Update content (no rebuild needed)

Edit any JSON file on the dataset (via SMB share, SSH, or TrueNAS file manager)
and refresh the browser. The container reads the files directly on each request.

### Step 5 — Update the app (new features)

```bash
./build.sh ghcr.io/you/hu-learn 1.1.0
```

Then in TrueNAS → Apps → hu-learn → **Edit** → change the tag to `1.1.0` → Save.
TrueNAS will pull the new image and restart the container. Your data is untouched.

---

---

## Local development (without TrueNAS)

```bash
# Build and run locally, mounting the local app/data/ directory
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# Open http://localhost:8420
# Edit app/data/*.json → refresh browser
```

---

## Adding a new module (e.g. Nouns)

### 1. Create the data file

Copy `app/data/verbs.json` as a starting point, or create a new schema.
Place it at `/mnt/tank/appdata/hu-learn/data/nouns.json`.

### 2. Register in manifest.json

Add an entry to `modules` in `manifest.json` on your NAS:
```json
{
  "id": "nouns",
  "type": "nouns",
  "label": "Nouns",
  "icon": "📖",
  "description": "Hungarian nouns with cases and examples.",
  "file": "nouns.json",
  "categories": [
    { "id": "body", "label": "Body parts", "icon": "🫁", "description": "..." }
  ]
}
```

### 3. Write a renderer

Create `app/js/renderers/nouns.js` — look at `verbs.js` as a template.
The function signature is always:
```js
export function renderNouns(data, categoryId, container, modMeta) { … }
```

### 4. Register the renderer

In `app/js/app.js`, add one line to the RENDERERS map:
```js
const RENDERERS = {
  verbs:      renderVerbs,
  irregular:  renderIrregular,
  nouns:      renderNouns,    // ← add this
};
```
And import it at the top of `app.js`.

### 5. Rebuild the image

```bash
docker compose up -d --build
```

The data stays on the NAS. Only the JS/CSS changes need a rebuild.

---

## Data file schemas

### manifest.json

```json
{
  "version": "1.0.0",
  "description": "...",
  "modules": [
    {
      "id": "string",           // used in URL hash: #moduleId/categoryId
      "type": "string",         // maps to a renderer in app.js
      "label": "string",
      "icon": "emoji",
      "description": "string",
      "file": "filename.json",  // relative to /data/
      "categories": [
        {
          "id": "string",
          "label": "string",
          "icon": "emoji",
          "description": "string"
        }
      ]
    }
  ]
}
```

### verbs.json

```json
{
  "categories": {
    "categoryId": {
      "label": "string",
      "note": "HTML string shown in note box",
      "families": [
        {
          "base": "megy — to go",
          "sub": "subtitle",
          "members": [
            {
              "p": "meg-",
              "hu": "megmegy",
              "en": "English meaning",
              "ex": [
                ["Hungarian sentence.", "English translation."],
                ["Another sentence.", "Another translation."]
              ]
            }
          ]
        }
      ]
    }
  }
}
```

### irregular.json

```json
{
  "verbs": [
    {
      "inf": "lenni",
      "base": "van / lesz / volt",
      "sub": "subtitle",
      "pattern": "HTML explanation of the irregularity",
      "forms": [
        { "label": "Present", "rows": [["én","vagyok"], …] }
      ],
      "keyforms": [
        { "l": "infinitive", "f": "lenni" }
      ],
      "prefixes": [ /* same shape as verbs.json members */ ],
      "examples": [
        { "tag": "present", "hu": "Magyar vagyok.", "en": "I am Hungarian." }
      ]
    }
  ]
}
```

---

## Port

Default: **8420**. Change in `docker-compose.yml`:
```yaml
ports:
  - "YOUR_PORT:80"
```
