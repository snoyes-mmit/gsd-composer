# GitHub PR GUI (HTML/CSS/JS)

This is a small client-side application that helps non-developers create a branch, commit a file, and open a pull request on GitHub using a Personal Access Token (PAT).

Getting started

- Open `index.html` in your browser (no server required).
- Fill in your GitHub Personal Access Token (needs `repo` scope for private repositories).
- Enter repository owner and name, base branch, file path/content, and click "Create PR".

Security

- This app runs entirely in the browser and uses your token to call the GitHub API. Do not share tokens; revoke them when finished.

Files

- `index.html` — main GUI
- `styles.css` — styling
- `app.js` — application logic (GitHub API calls)
- `help.html` — help and usage notes

Notes

- The app will attempt to create the branch; if it already exists it will use it.
- For text files containing non-ASCII characters, the content is encoded as UTF-8 and sent base64-encoded to GitHub.

If you'd like, I can:
- Add file upload support instead of paste
- Add token storage options (with warnings)
- Package as a tiny Electron app for improved token safety
