<template>
  <div class="app">
    <header>
      <h1>Charsi or Treasure?</h1>
      <p>Diablo II: Resurrected — Quick item lookup</p>
    </header>

    <main>
      <div class="search-wrap">
        <input
          v-model="query"
          type="search"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          placeholder="Search for an item… e.g. Chance Guards, Shako, Ali Baba"
          aria-label="Search items"
        />
      </div>

      <div class="legend" aria-hidden="true">
        <span class="legend-item">
          <span class="legend-dot hdhv" />Godly / GG — High Runes
        </span>
        <span class="legend-item">
          <span class="legend-dot hdmv" />High Demand — Mid Runes
        </span>
        <span class="legend-item">
          <span class="legend-dot ldlv" />Stash It — Low Value
        </span>
        <span class="legend-item">
          <span class="legend-dot charsi" />Charsi Food — Sell It
        </span>
      </div>

      <div role="list" aria-live="polite">
        <template v-if="!query.trim()">
          <p class="empty-state">Type an item name to look it up.</p>
        </template>

        <template v-else-if="results.length === 0">
          <div class="not-found">
            <strong>"{{ query.trim() }}"</strong> wasn't found in our list.<br />
            It may be missing from this guide — check the source wiki or the D2R community.
          </div>
        </template>

        <template v-else>
          <div
            v-for="item in results"
            :key="item.name"
            class="result-card"
            :class="item.tier"
            role="listitem"
          >
            <div>
              <div class="result-name">{{ item.name }}</div>
              <div v-if="item.note" class="result-note">{{ item.note }}</div>
            </div>
            <span class="result-badge" :class="`badge-${item.tier}`">
              {{ item.label }}
            </span>
          </div>
        </template>
      </div>
    </main>

    <footer>
      <p>Item data sourced from:</p>
      <p>
        <a
          href="https://www.reddit.com/r/Diablo_2_Resurrected/wiki/items-to-keep-in-d2r"
          target="_blank"
          rel="noopener"
        >r/Diablo_2_Resurrected — Items to Keep in D2R</a>
        &nbsp;·&nbsp;
        <a
          href="https://www.reddit.com/r/Diablo_2_Resurrected/comments/r5t8co/trash_it_or_stash_it_nokks_guide_on_what_to_keep/"
          target="_blank"
          rel="noopener"
        >Nokk's Guide: Trash It or Stash It</a>
      </p>
      <p class="footer-sub">Not affiliated with Blizzard Entertainment. Fan project.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ITEMS } from './data/items.js'

const query = ref('')

function normalise(s) {
  return s.toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^a-z0-9' ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function score(q, item) {
  const n = normalise(item.name)
  if (n === q) return 100
  if (n.startsWith(q)) return 80
  if (n.includes(q)) return 60
  const words = q.split(' ').filter(Boolean)
  const hits = words.filter(w => n.includes(w))
  if (hits.length === words.length) return 40
  if (hits.length > 0) return hits.length * 10
  return 0
}

const results = computed(() => {
  const q = normalise(query.value.trim())
  if (!q) return []
  return ITEMS
    .map(item => ({ item, s: score(q, item) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 15)
    .map(({ item }) => item)
})
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:      #0d0b0a;
  --surface: #1a1612;
  --border:  #3a2e22;
  --text:    #d4c5a9;
  --muted:   #7a6a52;

  --gold:     #c89b3c;
  --gold-bg:  #2a1f08;
  --gold-fg:  #f0c060;

  --green:    #27ae60;
  --green-bg: #0a2010;
  --green-fg: #6eda95;

  --teal:    #2980b9;
  --teal-bg: #081828;
  --teal-fg: #70b8e8;

  --red:    #c0392b;
  --red-bg: #280808;
  --red-fg: #e07070;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Georgia', serif;
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: linear-gradient(180deg, #1a1209 0%, var(--bg) 100%);
  border-bottom: 2px solid var(--gold);
  padding: 2rem 1rem 1.5rem;
  text-align: center;
}

header h1 {
  font-size: 2.2rem;
  color: var(--gold-fg);
  text-shadow: 0 0 20px rgba(200, 155, 60, 0.4);
  letter-spacing: 0.05em;
}

header p {
  color: var(--muted);
  margin-top: 0.4rem;
  font-size: 0.9rem;
  font-style: italic;
}

main {
  flex: 1;
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
  padding: 1.8rem 1rem;
}

.search-wrap { margin-bottom: 1rem; }

.search-wrap input {
  width: 100%;
  padding: 0.85rem 1.1rem;
  font-size: 1.05rem;
  font-family: 'Georgia', serif;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  outline: none;
  transition: border-color 0.2s;
}

.search-wrap input:focus { border-color: var(--gold); }
.search-wrap input::placeholder { color: var(--muted); }

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.2rem;
  margin-bottom: 1.4rem;
  font-size: 0.78rem;
  font-family: sans-serif;
  color: var(--muted);
}

.legend-item { display: flex; align-items: center; gap: 0.35rem; }

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.legend-dot.hdhv   { background: var(--gold); }
.legend-dot.hdmv   { background: var(--green); }
.legend-dot.ldlv   { background: var(--teal); }
.legend-dot.charsi { background: var(--red); }

.result-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 4px solid var(--border);
  border-radius: 4px;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.55rem;
}

.result-card.hdhv   { border-left-color: var(--gold); }
.result-card.hdmv   { border-left-color: var(--green); }
.result-card.ldlv   { border-left-color: var(--teal); }
.result-card.charsi { border-left-color: var(--red); }

.result-name {
  font-size: 0.97rem;
  color: var(--gold-fg);
}

.result-note {
  color: var(--muted);
  font-size: 0.8rem;
  margin-top: 0.2rem;
  font-style: italic;
}

.result-badge {
  font-size: 0.72rem;
  font-family: sans-serif;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.22rem 0.6rem;
  border-radius: 3px;
  white-space: nowrap;
  flex-shrink: 0;
}

.badge-hdhv   { background: var(--gold-bg);  color: var(--gold-fg);  border: 1px solid var(--gold); }
.badge-hdmv   { background: var(--green-bg); color: var(--green-fg); border: 1px solid var(--green); }
.badge-ldlv   { background: var(--teal-bg);  color: var(--teal-fg);  border: 1px solid var(--teal); }
.badge-charsi { background: var(--red-bg);   color: var(--red-fg);   border: 1px solid var(--red); }

.not-found {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--muted);
  line-height: 1.7;
}
.not-found strong { color: var(--text); }

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--muted);
  font-style: italic;
}

footer {
  border-top: 1px solid var(--border);
  padding: 1.5rem 1rem;
  text-align: center;
  font-size: 0.78rem;
  color: var(--muted);
  line-height: 1.8;
}

footer a { color: var(--gold); text-decoration: none; }
footer a:hover { text-decoration: underline; }

.footer-sub {
  margin-top: 0.5rem;
  font-size: 0.72rem;
}
</style>
