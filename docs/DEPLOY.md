# Publishing a map

Your edited map becomes **one self-contained `index.html`** — the whole viewer, your data and the
map image inlined into a single file. There are two ways to get it online.

## Option 1 — Publish (download) and drop it on any host  ·  easiest

1. In the editor, click **Publish**. A file like `green-park-fair.html` downloads.
2. Put that one file anywhere that serves static files:
   - **Netlify Drop** — drag the file onto <https://app.netlify.com/drop>. Instant URL.
   - **GitHub Pages** — add the file to a repo, then Settings → Pages (see below).
   - Any web host / S3 / an intranet folder — it's just one HTML file, works offline too.

No accounts or tokens needed. This is the simplest path and works with every host.

## Option 2 — Deploy (one click to GitHub Pages)  ·  from inside the editor

The **Deploy** button commits the generated `index.html` straight to a GitHub repo for you.

**One-time setup**
1. **Create a repo** on GitHub (empty is fine), e.g. `my-festival-map`.
2. **Create a token** with write access to that repo:
   <https://github.com/settings/tokens?type=beta> → *Generate new token (fine-grained)* →
   pick the repo under *Repository access* → *Repository permissions* → **Contents: Read and write** →
   generate and copy it (starts with `github_pat_`).
3. **Turn on Pages:** repo → **Settings → Pages** → *Source:* Deploy from a branch → branch `main`,
   folder `/ (root)` → Save.

**Each time you publish**
1. Click **Deploy** in the editor.
2. Fill in: **Repo owner** (your username), **Repo name**, **Branch** (`main`), **File path**
   (`index.html`), and paste your **token**.
3. Press **Deploy**. It commits the file and shows the link.
4. Your map is live at **`https://<owner>.github.io/<repo>/`** (give Pages a minute the first time).

**Notes**
- Your token is used **only in your browser** to call `api.github.com`. It is never stored, logged,
  or sent anywhere else. (For safety, prefer a fine-grained token scoped to that one repo.)
- GitHub's API allows this directly from the browser; Netlify/Cloudflare/etc. would need a small
  proxy, so for those use **Option 1** (download, then drop/upload).

## QR "you are here" standees

In the editor's **QR standees** panel, set *Published URL* to the address your map will live at
(e.g. `https://<owner>.github.io/<repo>/`). Each place gets a QR encoding `…#at-<place-id>` — print
one and put it at that spot so visitors scan it and see "you are here".
