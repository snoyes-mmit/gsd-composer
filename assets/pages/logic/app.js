// Register UI and helper implementations
const helpers = {
  containsAny: {
    sig: '#containsAll [list] [field name] [target[]]',
    doc: 'Checks whether any of the provided target values exist in the specified field for items inside the list. Useful to show sections when a category or plan type is present. Accepts any number of target values; if any matches, the block is rendered with the matching item as context inside the inner loop. <br><br> list: list that will be searched <br><br> field name: the name of the field in the list to search through <br><br> target (any number of arguments after the first three): All of the target items must be in the list <br><br> {{#containsAny plans "name" "TRICARE East" "TRICARE West" "TRICARE Overseas" "Department of Veterans  Affairs" "Indian Health"}} <br><!-- html --> <br> {{else}} <br> <!-- html --> <br> {{/containsAny}}',
    impl: function(list, fieldName, ...targets) {
      const options = targets.pop();
      if (!Array.isArray(list)) return options.inverse(this);
      for (const item of list) {
        for (const t of targets) {
          if (String((item && item[fieldName]) || '') === String(t)) return options.fn(item);
        }
      }
      return options.inverse(this);
    }
  },
  containsAll: {
    sig: '#containsAll [list] [field name] [target[]]',
    doc: 'Ensures that every provided target value appears at least once in the list for the given field. Use when you only want to render content if multiple required categories/values are all present (e.g., both Commercial and Health Exchange exist). <br><br> list: list that will be searched <br><br> field name: the name of the field in the list to search through <br><br> target (any number of arguments after the first three): All of the target items must be in the list <br><br> {{#containsAll plans "channel" "Commercial"}} <br><!-- html --> <br> {{else}} <br><!-- html --> <br> {{/containsAll}}',
    impl: function(list, fieldName, ...targets) {
      const options = targets.pop();
      if (!Array.isArray(list)) return options.inverse(this);
      const found = new Set();
      for (const item of list) {
        for (const t of targets) {
          if (String((item && item[fieldName]) || '') === String(t)) found.add(String(t));
        }
      }
      for (const t of targets) if (!found.has(String(t))) return options.inverse(this);
      return options.fn(this);
    }
  },
  containsNone: {
    sig: '#containsNone [list] [field name] [target[]]',
    doc: 'Renders its block only when none of the supplied target values are found in the list for the requested field. Useful for excluding categories (e.g., show "pure commercial" content when no government plans exist). list: list that will be searched <br><br> field name: the name of the field in the list to search through <br><br> target (any number of arguments after the first three): None of the target items can be in the list <br><br> {{#containsNone plans "channel" "Government" "Medicare Advantage"}} <br><!-- html --> <br> {{else}} <br><!-- html --> <br> {{/containsNone}}',
    impl: function(list, fieldName, ...targets) {
      const options = targets.pop();
      if (!Array.isArray(list)) return options.fn(this);
      for (const item of list) {
        for (const t of targets) {
          if (String((item && item[fieldName]) || '') === String(t)) return options.inverse(this);
        }
      }
      return options.fn(this);
    }
  },
  classByLength: {
    sig: '#classByLength value "class1,min,max" ...',
    doc: 'Returns a CSS class name based on the character count of the provided value. Pass one or more range specs as strings of the form "className,min,max" (inclusive). Useful for responsive font-sizing and show/hide patterns based on presence/length of text. <br><br> Example usage: <br> {{#classByLength var "lrgFont,1,10" "medFont,11,20" "smFont,21,999"}} <br> where `var` is the value to evaluate, and the ranges specify which class to return based on length. <br><br> In this example, if `var` has 5 characters, "lrgFont" is returned; if 15 characters, "medFont"; if 25 characters, "smFont". If no ranges match, an empty string is returned.<br> CSS: <br> .lrgFont { font-size: 2em; } <br> .medFont { font-size: 1.5em; } <br> .smFont { font-size: 1em; }',
    impl: function(value) {
      const options = Array.prototype.slice.call(arguments).pop();
      const ranges = Array.prototype.slice.call(arguments, 1, -1);
      const len = String(value || '').length;
      for (const r of ranges) {
        const parts = r.split(',').map(s => s.trim());
        const cls = parts[0];
        const min = parseInt(parts[1],10);
        const max = parseInt(parts[2],10);
        if (len >= min && len <= max) return cls;
      }
      return '';
    }
  },
  isNotExcluded: {
    sig: '#isNotExcluded "productName"',
    doc: 'Used in multi-product templates: reads `excluded` from the current context and renders the block only if the named product is NOT excluded. Handy for dynamically adding/removing product columns or sections selected on the plan select page. <br><br> Example usage: <br> {{#isNotExcluded "ais"}} <br><!-- html --> <br> {{/isNotExcluded}} <br> where "ais" is the product name to check against the `excluded` array in context. If "ais" is NOT in the `excluded` list, the block renders; otherwise, it is skipped.',
    impl: function(prodName, options) {
      try {
        const ctx = this || {};
        const excluded = (ctx.excluded || []);
        if (!Array.isArray(excluded)) return options.fn(this);
        if (excluded.map(String).includes(String(prodName))) return options.inverse(this);
        return options.fn(this);
      } catch (e) { return options.fn(this); }
    }
  },
  equalsAny: {
    sig: '#equalsAny plans.[0].PlanType "PPO" "HMO" "Employer"',
    doc: 'Compares a single value against multiple literal options. If the first argument equals any of the remaining arguments, the block renders. Throws an error when fewer than two arguments are supplied. Use for compact category checks (e.g., plan types). <br><br> Example usage: <br> {{#equalsAny PlanType "PPO" "HMO"}} <br><!-- html --> <br> {{/equalsAny}} <br> where `PlanType` is compared against "PPO" and "HMO"; if it matches either, the block renders.',
    impl: function() {
      const args = Array.prototype.slice.call(arguments);
      const options = args.pop();
      if (args.length < 2) throw new Error('{{#equalsAny}} requires at least 2 args');
      const val = args.shift();
      for (const t of args) if (String(val) === String(t)) return options.fn(this);
      return options.inverse(this);
    }
  },
  when: {
    sig: '#when operand1 operator operand2 ["AND" operand3 operator operand4]',
    doc: 'Powerful comparator helper supporting operators `eq`, `neq`/`ne`, `gt`, `gteq`, `lt`, `lteq`. You can combine two comparisons with `"AND"` or `"OR"`. Pass literal strings/numbers or context paths. Use to implement tiered messages or threshold logic (coverage %). <br><br> Example usage: <br> {{#when coveragePercentage "gteq" "80"}} <br><!-- html --> <br> {{else}}{{#when coveragePercentage "gteq" "60" "AND" coveragePercentage "lt" "80"}} <br><!-- html --> <br> {{else}} <br><!-- html --> <br> {{/when}}{{/when}} <br> In this example, if `coveragePercentage` is 85, the first block renders; if 75, the second block; if 50, the final block.',
    impl: function() {
      const args = Array.prototype.slice.call(arguments);
      const options = args.pop();
      // Helper supports many layouts; we'll evaluate a simple expression builder
      function compare(a, op, b) {
        const A = isNaN(a) ? String(a) : Number(a);
        const B = isNaN(b) ? String(b) : Number(b);
        switch(op) {
          case 'eq': return A == B;
          case 'neq': case 'ne': return A != B;
          case 'gt': return Number(A) > Number(B);
          case 'gteq': return Number(A) >= Number(B);
          case 'lt': return Number(A) < Number(B);
          case 'lteq': return Number(A) <= Number(B);
          default: return false;
        }
      }
      // flatten args to strings
      if (args.length < 3) return options.inverse(this);
      // basic first comparison
      const a1 = args[0]; const op1 = args[1]; const b1 = args[2];
      let res1 = compare(a1, op1, b1);
      if (args.length === 3) return res1 ? options.fn(this) : options.inverse(this);
      // combine
      const logic = String(args[3]).toUpperCase();
      const a2 = args[4]; const op2 = args[5]; const b2 = args[6];
      const res2 = compare(a2, op2, b2);
      let final = logic === 'AND' ? (res1 && res2) : (res1 || res2);
      return final ? options.fn(this) : options.inverse(this);
    }
  },
  if: {
    sig: '#if condition',
    doc: 'Standard conditional: renders the block if the given value is truthy. Behaves like Handlebars built-in `if` helper; use `{{#if value}}...{{else}}...{{/if}}` to show/hide content based on presence/boolean checks. <br><br> Example usage: <br> {{#if ftv_mp_medical}} <br><!-- html --> <br> {{else}} <br><!-- html --> <br> {{/if}} <br> In this example, if `ftv_mp_medical` is truthy (e.g., non-empty string, true), the first block renders; otherwise, the else block renders.',
    impl: function(value, options) {
      // allow usage with no explicit value (treat as falsy)
      if (arguments.length === 1) {
        // only options passed
        options = value;
        return options.inverse(this);
      }
      const truthy = !!value && value !== '';
      return truthy ? options.fn(this) : options.inverse(this);
    }
  }
};

function registerHelpers(){
  Object.keys(helpers).forEach(name => {
    try{
      Handlebars.registerHelper(name, helpers[name].impl);
    }catch(e){ consoleEl('Error registering '+name+': '+e.message); }
  });
  consoleEl('Helpers registered: '+Object.keys(helpers).join(', '));
}

// UI glue
function $(id){return document.getElementById(id)}
function consoleEl(msg){ const c=$('console'); c.textContent += msg + '\n'; c.scrollTop = c.scrollHeight; }

function populateHelperList(){
  const ul=$('helper-list'); ul.innerHTML='';
  for (const k of Object.keys(helpers)){
    const li=document.createElement('li'); li.className='helper-item'; li.textContent=k; li.onclick=()=> showDoc(k); ul.appendChild(li);
  }
}

function showDoc(name){ const d=$('helper-doc'); d.innerHTML = '<strong>'+name+'</strong> — '+helpers[name].sig + '<br/><em>'+helpers[name].doc+'</em>'; }

function insertSample(){
  const sel = $('sample-select') ? $('sample-select').value : 'default';
  const t = sampleTemplates[sel] || sampleTemplates['default'];
  $('template').value = t.template;
  $('data').value = JSON.stringify(t.data, null, 2);
  consoleEl('Inserted sample: ' + t.title);
}

function sampleData(){
  return {
    var: 'Short title',
    excluded: ['gel-one'],
    plans: [
      {name:'Plan A', channel:'Commercial', coveragePercentage:85},
      {name:'Plan B', channel:'Commercial', coveragePercentage:72},
      {name:'Plan C', channel:'Government', coveragePercentage:55}
    ]
  };
}

const sampleTemplates = {
  default: {
    title: 'Default Table',
    template: `\n<table border=1 style="border-collapse:collapse;padding:6px">\n  <thead>\n    <tr><th>Plan</th><th>Channel</th><th>Notes</th></tr>\n  </thead>\n  <tbody>\n  {{#each plans}}\n    <tr>\n      <td>{{name}}</td>\n      <td>{{channel}}</td>\n      <td>{{#when coveragePercentage "gteq" "80"}}High coverage{{else}}{{#when coveragePercentage "gteq" "60" "AND" coveragePercentage "lt" "80"}}Medium{{else}}Low{{/when}}{{/when}}</td>\n    </tr>\n  {{/each}}\n  </tbody>\n</table>\n`,
    data: sampleData()
  },
  containsAny: {
    title: 'containsAny Example',
    template: `\n<h3>Plans matching containsAny</h3>\n{{#containsAny plans "channel" "Commercial"}}\n  <ul>\n  {{#each plans}}\n    {{#equalsAny channel "Commercial"}}\n      <li>{{name}} — {{channel}}</li>\n    {{/equalsAny}}\n  {{/each}}\n  </ul>\n{{else}}\n  <div>No commercial plans found.</div>\n{{/containsAny}}\n`,
    data: sampleData()
  },
  classByLength: {
    title: 'classByLength Example',
    template: `\n<style>\n.lrgFont { font-size: 2em; }\n.medFont { font-size: 1.5em; }\n.smFont { font-size: 1em; }\n.show { display: block; }\n.hide { display: none; }\n</style>\n\n<h3 class="{{#classByLength var 'lrgFont,1,10' 'medFont,11,20' 'smFont,21,999'}}">Title: {{var}}</h3>\n<p class="{{#classByLength var 'show,1,999' 'hide,0,0'}}">This paragraph shows when var has content.</p>\n`,
    data: sampleData()
  }
  ,
  containsAll: {
    title: 'containsAll Example',
    template: `\n<h3>containsAll demo</h3>\n{{#containsAll plans "channel" "Commercial" "Health Exchange"}}\n  <div class="alert alert-info">Both Commercial and Health Exchange channels are present.</div>\n  <ul>\n    {{#each plans}}\n      <li>{{name}} — {{channel}}</li>\n    {{/each}}\n  </ul>\n{{else}}\n  <div class="alert alert-warning">Required channels not found.</div>\n{{/containsAll}}\n`,
    data: {
      plans:[
        {name:'Plan X', channel:'Commercial'},
        {name:'Plan Y', channel:'Health Exchange'},
        {name:'Plan Z', channel:'Government'}
      ]
    }
  },
  containsNone: {
    title: 'containsNone Example',
    template: `\n<h3>containsNone demo</h3>\n{{#containsNone plans "channel" "Government" "Medicare Advantage"}}\n  <div class="alert alert-success">No government or Medicare Advantage plans found — show commercial content.</div>\n{{else}}\n  <div class="alert alert-error">Government plans are present — switch to government view.</div>\n{{/containsNone}}\n`,
    data: {
      plans:[
        {name:'Plan A', channel:'Commercial'},
        {name:'Plan B', channel:'Commercial'}
      ]
    }
  },
  isNotExcluded: {
    title: 'isNotExcluded Example',
    template: `\n<table>\n  <thead><tr><th>Plan</th><th>Norstella</th>{{#isNotExcluded "ais"}}<th>AIS</th>{{/isNotExcluded}}{{#isNotExcluded "citeline"}}<th>Citeline</th>{{/isNotExcluded}}</tr></thead>\n  <tbody>\n    {{#each plans}}\n      <tr>\n        <td>{{name}}</td>\n        <td>{{ftv_norstella}}</td>\n        {{#isNotExcluded "ais"}}<td>{{ftv_ais}}</td>{{/isNotExcluded}}\n        {{#isNotExcluded "citeline"}}<td>{{ftv_citeline}}</td>{{/isNotExcluded}}\n      </tr>\n    {{/each}}\n  </tbody>\n</table>\n`,
    data: {
      excluded:['citeline'],
      plans:[
        {name:'Plan 1', ftv_norstella:'Yes', ftv_ais:'No', ftv_citeline:'Yes'},
        {name:'Plan 2', ftv_norstella:'No', ftv_ais:'Yes', ftv_citeline:'No'}
      ]
    }
  },
  equalsAny: {
    title: 'equalsAny Example',
    template: `\n<h3>equalsAny demo</h3>\n{{#each plans}}\n  {{#equalsAny PlanType "PPO" "HMO"}}\n    <div>{{name}} is a common plan type: {{PlanType}}</div>\n  {{/equalsAny}}\n{{/each}}\n`,
    data: {
      plans:[
        {name:'Alpha', PlanType:'PPO'},
        {name:'Beta', PlanType:'HMO'},
        {name:'Gamma', PlanType:'EMBEDDED'}
      ]
    }
  },
  when: {
    title: 'when Example',
    template: `\n<h3>when helper demo (coverage tiers)</h3>\n<ul>\n{{#each plans}}\n  <li>{{name}}: {{#when coveragePercentage "gteq" "80"}}Excellent{{else}}{{#when coveragePercentage "gteq" "60" "AND" coveragePercentage "lt" "80"}}Good{{else}}Limited{{/when}}{{/when}}</li>\n{{/each}}\n</ul>\n`,
    data: {
      plans:[
        {name:'HighPlan', coveragePercentage:92},
        {name:'MedPlan', coveragePercentage:75},
        {name:'LowPlan', coveragePercentage:45}
      ]
    }
  },
  if: {
    title: 'if Example',
    template: `\n<h3>If helper demo</h3>\n{{#each plans}}\n  {{#if ftv_mp_medical}}\n    <div>{{name}} has medical benefit: {{ftv_mp_medical}}</div>\n  {{else}}\n    <div>{{name}} has no medical benefit info.</div>\n  {{/if}}\n{{/each}}\n`,
    data: {
      plans:[
        {name:'Plan M', ftv_mp_medical:'Included'},
        {name:'Plan N', ftv_mp_medical:''}
      ]
    }
  }
};

function escapeHtml(str){
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function prettyPrintHtml(html){
  // naive pretty-printer: insert line breaks then indent
  let formatted = html.replace(/>\s*</g, '><');
  formatted = formatted.replace(/></g, '>\n<');
  const lines = formatted.split('\n');
  let indent = 0; const out = [];
  for (let line of lines){
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^<\//.test(trimmed)) { indent = Math.max(indent-1,0); }
    out.push('  '.repeat(indent) + trimmed);
    if (/^<[^!\/][^>]*[^\/]?>$/.test(trimmed) && !/^<.*<.*>.*$/.test(trimmed) && !/^<.*\/>$/.test(trimmed) && !/^<\/?(br|img|input|meta|link)\b/.test(trimmed)) {
      if (!/^<\//.test(trimmed) && !/\/>$/.test(trimmed) && !/\/$/.test(trimmed)) indent++;
    }
  }
  return out.join('\n');
}

function render(){
  const tplText = $('template').value; const dataText = $('data').value;
  $('console').textContent = '';
  try{
    const data = JSON.parse(dataText);
    const tpl = Handlebars.compile(tplText);
    const html = tpl(data);
    // Rendered output area removed from the UI; show rendered HTML as text in the console for inspection
    consoleEl('Rendered successfully. (HTML output follows)');
    consoleEl('---BEGIN RENDERED HTML (escaped & pretty)---');
    consoleEl(prettyPrintHtml(escapeHtml(html)));
    consoleEl('---END RENDERED HTML---');
  }catch(e){
    consoleEl('Error: '+e.message);
  }
}

// init
window.addEventListener('DOMContentLoaded', ()=>{
  populateHelperList();
  $('insert-sample').addEventListener('click', insertSample);
  $('register-helpers').addEventListener('click', registerHelpers);
  $('toggle-data').addEventListener('click', ()=>{
    const pane = document.querySelector('.editor .pane:nth-child(3)');
    if (pane) pane.classList.toggle('hidden');
  });
  $('toggle-console').addEventListener('click', ()=>{
    const c = $('console'); if (c) c.classList.toggle('hidden');
  });
  // populate sample select (in case options are changed)
  const sel = $('sample-select');
  if (sel){
    sel.innerHTML = '';
    for (const k of Object.keys(sampleTemplates)){
      const o = document.createElement('option'); o.value = k; o.textContent = sampleTemplates[k].title; sel.appendChild(o);
    }
  }
  $('render-btn').addEventListener('click', ()=>{ try{ render(); }catch(e){ consoleEl('Render exception: '+e.message); } });
  // pre-populate with short template/data
  $('template').value = '<h2>Handlebars Explorer</h2>\n<p>Click "Insert Sample Template" to load examples.</p>';
  $('data').value = JSON.stringify({plans:[]}, null, 2);
});
