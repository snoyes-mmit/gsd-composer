const form = document.getElementById('pr-form');
const logEl = document.getElementById('log');

function log(...args){
  const line = args.map(a=> (typeof a==='object'?JSON.stringify(a):String(a))).join(' ');
  logEl.textContent += line + '\n';
  logEl.scrollTop = logEl.scrollHeight;
}

function base64EncodeUnicode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

async function apiFetch(url, token, opts={}){
  const headers = Object.assign({'Authorization': `token ${token}`, 'Accept':'application/vnd.github.v3+json'}, opts.headers || {});
  const res = await fetch(url, Object.assign({}, opts, {headers}));
  if(!res.ok){
    const txt = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${txt}`);
  }
  return res.json();
}

async function getRefSha(owner, repo, branch, token){
  const url = `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`;
  const data = await apiFetch(url, token);
  return data.object.sha;
}

async function createBranch(owner, repo, newBranch, baseSha, token){
  const url = `https://api.github.com/repos/${owner}/${repo}/git/refs`;
  try{
    const body = {ref: `refs/heads/${newBranch}`, sha: baseSha};
    const res = await apiFetch(url, token, {method:'POST', body:JSON.stringify(body)});
    return res;
  }catch(err){
    // If branch already exists, ignore and continue
    if(/Reference already exists/.test(err.message) || /Reference.*already exists/.test(err.message)){
      log('Branch exists, using existing branch:', newBranch);
      return null;
    }
    throw err;
  }
}

async function getFileSha(owner, repo, path, branch, token){
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
  try{
    const data = await apiFetch(url, token);
    return data.sha;
  }catch(err){
    // Not found -> return null
    if(/404/.test(err.message)) return null;
    throw err;
  }
}

async function createOrUpdateFile(owner, repo, path, content, message, branch, token){
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
  const encoded = base64EncodeUnicode(content);
  const existingSha = await getFileSha(owner, repo, path, branch, token);
  const body = {message, content: encoded, branch};
  if(existingSha) body.sha = existingSha;
  const res = await apiFetch(url, token, {method:'PUT', body:JSON.stringify(body)});
  return res;
}

async function createPullRequest(owner, repo, title, head, base, bodyText, token){
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls`;
  const body = {title, head, base, body: bodyText};
  return apiFetch(url, token, {method:'POST', body:JSON.stringify(body)});
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  logEl.textContent = '';
  try{
    const token = document.getElementById('token').value.trim();
    const owner = document.getElementById('owner').value.trim();
    const repo = document.getElementById('repo').value.trim();
    const baseBranch = document.getElementById('base-branch').value.trim() || 'main';
    let newBranch = document.getElementById('new-branch').value.trim();
    const path = document.getElementById('file-path').value.trim();
    const content = document.getElementById('file-content').value;
    const commitMessage = document.getElementById('commit-message').value.trim() || 'Add file via GUI';
    const prTitle = document.getElementById('pr-title').value.trim() || commitMessage;
    const prBody = document.getElementById('pr-body').value.trim() || '';

    if(!token || !owner || !repo || !path){
      log('Please provide token, owner, repo, and file path.');
      return;
    }

    log('Fetching base branch SHA...');
    const baseSha = await getRefSha(owner, repo, baseBranch, token);
    log('Base SHA:', baseSha);

    if(!newBranch) newBranch = `pr-from-gui-${Date.now()}`;
    log('Creating branch:', newBranch);
    try{
      await createBranch(owner, repo, newBranch, baseSha, token);
      log('Branch created or already exists:', newBranch);
    }catch(err){
      log('Error creating branch:', err.message);
      return;
    }

    log('Creating or updating file:', path);
    const putRes = await createOrUpdateFile(owner, repo, path, content, commitMessage, newBranch, token);
    log('Commit created:', putRes.commit && putRes.commit.sha ? putRes.commit.sha : JSON.stringify(putRes));

    log('Opening pull request...');
    const pr = await createPullRequest(owner, repo, prTitle, newBranch, baseBranch, prBody, token);
    log('Pull request created:', pr.html_url);
    log('\nDone. Open the PR in your browser: ' + pr.html_url);
  }catch(err){
    log('Error:', err.message || err);
  }
});
