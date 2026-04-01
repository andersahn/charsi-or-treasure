<template>
  <div class="app">
    <header>
      <h1>Charsi or Treasure?</h1>
      <p>Diablo II: Resurrected — Quick item lookup</p>
    </header>

    <main>
      <div class="tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'search' }" @click="activeTab = 'search'">Search</button>
        <button class="tab-btn" :class="{ active: activeTab === 'magic' }" @click="activeTab = 'magic'">Magic Items</button>
        <button class="tab-btn" :class="{ active: activeTab === 'jewels' }" @click="activeTab = 'jewels'">Jewels &amp; Charms</button>
        <button class="tab-btn" :class="{ active: activeTab === 'bases' }" @click="activeTab = 'bases'">Base Items</button>
        <button class="tab-btn" :class="{ active: activeTab === 'commodities' }" @click="activeTab = 'commodities'">Commodities</button>
        <div class="ladder-toggle">
          <button class="ladder-btn" :class="{ active: !ladder }" @click="ladder = false">NL</button>
          <button class="ladder-btn" :class="{ active: ladder }" @click="ladder = true">Ladder</button>
        </div>
      </div>

      <template v-if="activeTab === 'search'">
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
          <span class="legend-item">
            <span class="legend-dot magic" />Magic / Rare — Specific Names
          </span>
          <span class="legend-item">
            <span class="legend-dot base" />Base Item — Eth / Superior / Socketed
          </span>
          <span class="legend-item">
            <span class="legend-dot commodity" />Commodity — Gems, Keys, Essences
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
                <div v-if="item.base" class="result-base">Base: {{ item.base }}</div>
              </div>
              <div class="result-right">
                <div v-if="item.value" class="result-value">
                  {{ ladder && item.valueLadder ? (item.ladderProjected ? '~' : '') + item.valueLadder : item.value }}
                </div>
                <span class="result-badge" :class="`badge-${item.tier}`">
                  {{ item.label }}
                </span>
              </div>
            </div>
          </template>
        </div>
      </template>

      <template v-else-if="activeTab === 'magic'">
        <p class="magic-intro">
          These magic and rare items have significant value due to their <strong>specific prefixes, suffixes, and stats</strong>.
          Look for them by their full name. 🐳 = whale-tier value. <strong>Price estimates are non-ladder.</strong>
        </p>
        <div role="list">
          <div
            v-for="item in MAGIC_ITEMS"
            :key="item.name"
            class="result-card magic"
            role="listitem"
          >
            <div>
              <div class="result-name">{{ item.name }}</div>
              <div v-if="item.note" class="result-note">{{ item.note }}</div>
            </div>
            <div class="result-right">
              <div class="result-value">{{ item.value }}</div>
              <span class="result-badge badge-magic">Magic Item</span>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="activeTab === 'jewels'">
        <p class="magic-intro">
          <strong>Rainbow Facets</strong> are unique jewels — value depends on element, trigger type (Die &gt; Level), and roll (5/5 &gt; 5/X &gt; 4/5). ▲ = price trending up. <strong>Price estimates are non-ladder.</strong>
        </p>

        <h2 class="magic-section-title">Rainbow Facets (Unique Jewels)</h2>
        <div role="list">
          <div
            v-for="item in RAINBOW_FACETS"
            :key="item.name"
            class="result-card hdhv"
            role="listitem"
          >
            <div>
              <div class="result-name">{{ item.name }}</div>
              <div v-if="item.note" class="result-note">{{ item.note }}</div>
            </div>
            <div class="result-right">
              <div class="result-value">{{ item.value }}</div>
              <span class="result-badge badge-hdhv">Rainbow Facet</span>
            </div>
          </div>
        </div>

        <h2 class="magic-section-title">Magic Jewels</h2>
        <div role="list">
          <div
            v-for="item in MAGIC_JEWELS"
            :key="item.name"
            class="result-card magic"
            role="listitem"
          >
            <div>
              <div class="result-name">{{ item.name }}</div>
              <div v-if="item.note" class="result-note">{{ item.note }}</div>
            </div>
            <div class="result-right">
              <div class="result-value">{{ item.value }}</div>
              <span class="result-badge badge-magic">Magic Jewel</span>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="activeTab === 'bases'">
        <p class="magic-intro">
          Valuable base items for runewords and trading — Eth, Superior, and specific socket counts.
          Showing <strong>{{ ladder ? 'Ladder' : 'Non-Ladder' }}</strong> prices.
          🐳 = whale-tier. ▲ = trending up.
        </p>
        <template v-for="section in BASE_SECTIONS" :key="section.title">
          <h2 class="magic-section-title">{{ section.title }}</h2>
          <div role="list">
            <div
              v-for="item in section.items"
              :key="item.name"
              class="result-card base"
              role="listitem"
            >
              <div>
                <div class="result-name">{{ item.name }}</div>
                <div v-if="item.note" class="result-note">{{ item.note }}</div>
              </div>
              <div class="result-right">
                <div class="result-value">{{ ladder && item.valueLadder ? item.valueLadder : item.value }}</div>
                <span class="result-badge badge-base">Base Item</span>
              </div>
            </div>
          </div>
        </template>
      </template>

      <template v-else>
        <p class="magic-intro">
          Relative values for common trade goods — gems, gold, keys, essences, and tokens.
          Showing <strong>{{ ladder ? 'Ladder' : 'Non-Ladder' }}</strong> prices.
          {{ ladder ? 'Values marked ~projected~ are estimates.' : '' }} ▲ = trending up.
        </p>
        <template v-for="section in COMMODITY_SECTIONS" :key="section.title">
          <h2 class="magic-section-title">{{ section.title }}</h2>
          <div role="list">
            <div
              v-for="item in section.items"
              :key="item.name"
              class="result-card commodity"
              role="listitem"
            >
              <div>
                <div class="result-name">{{ item.name }}</div>
                <div v-if="item.note" class="result-note">{{ item.note }}</div>
              </div>
              <div class="result-right">
                <div class="result-value">
                  {{ ladder && item.valueLadder ? (item.ladderProjected ? '~' : '') + item.valueLadder : item.value }}
                </div>
                <span class="result-badge badge-commodity">Commodity</span>
              </div>
            </div>
          </div>
        </template>
      </template>
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
        &nbsp;·&nbsp;
        <a
          href="https://docs.google.com/spreadsheets/d/1S4Augoamhf0by_tkiOIT4D1HFItzSeXMrZz_OqTBrCo"
          target="_blank"
          rel="noopener"
        >Magic Items Price List (Google Sheets)</a>
      </p>
      <p class="footer-sub">Not affiliated with Blizzard Entertainment. Fan project.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ITEMS, MAGIC_ITEMS, MAGIC_JEWELS, RAINBOW_FACETS, BASE_SECTIONS, COMMODITY_SECTIONS } from './data/items.js'

const query = ref('')
const activeTab = ref('search')
const ladder = ref(false)

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
  const nameHits = words.filter(w => n.includes(w))
  if (nameHits.length === words.length) return 40
  if (nameHits.length > 0) return nameHits.length * 10

  // base item name — medium priority (people search "shako", "monarch", "tower shield")
  const base = normalise(item.base || '')
  if (base) {
    if (base === q || base.startsWith(q) || base.includes(q)) return 45
    const baseHits = words.filter(w => base.includes(w))
    if (baseHits.length === words.length) return 35
    if (baseHits.length > 0) return baseHits.length * 8
  }

  // note / description — lower priority (catches "enhanced damage", "fervor", etc.)
  const note = normalise(item.note || '')
  if (note.includes(q)) return 30
  const noteHits = words.filter(w => note.includes(w))
  if (noteHits.length === words.length) return 25
  if (noteHits.length > 0) return noteHits.length * 5

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

  --purple:    #7c4dbd;
  --purple-bg: #150d26;
  --purple-fg: #b594f0;

  --orange:    #c0712a;
  --orange-bg: #1e0e04;
  --orange-fg: #e8a060;

  --sky:    #2a9cb8;
  --sky-bg: #041418;
  --sky-fg: #60d0e8;
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
.legend-dot.magic  { background: var(--purple); }
.legend-dot.base      { background: var(--orange); }
.legend-dot.commodity { background: var(--sky); }

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
.result-card.magic  { border-left-color: var(--purple); }
.result-card.base      { border-left-color: var(--orange); }
.result-card.commodity { border-left-color: var(--sky); }

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

.result-base {
  color: var(--orange-fg);
  font-size: 0.75rem;
  margin-top: 0.15rem;
  font-family: sans-serif;
  opacity: 0.75;
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

.badge-hdhv   { background: var(--gold-bg);   color: var(--gold-fg);   border: 1px solid var(--gold); }
.badge-hdmv   { background: var(--green-bg); color: var(--green-fg);  border: 1px solid var(--green); }
.badge-ldlv   { background: var(--teal-bg);  color: var(--teal-fg);   border: 1px solid var(--teal); }
.badge-charsi { background: var(--red-bg);   color: var(--red-fg);    border: 1px solid var(--red); }
.badge-magic  { background: var(--purple-bg); color: var(--purple-fg); border: 1px solid var(--purple); }
.badge-base      { background: var(--orange-bg); color: var(--orange-fg); border: 1px solid var(--orange); }
.badge-commodity { background: var(--sky-bg);    color: var(--sky-fg);    border: 1px solid var(--sky); }

.tabs {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1.4rem;
  border-bottom: 2px solid var(--border);
  padding-bottom: 0;
  align-items: flex-end;
}

.ladder-toggle {
  margin-left: auto;
  display: flex;
  gap: 0;
  margin-bottom: -2px;
}

.ladder-btn {
  background: none;
  border: 1px solid var(--border);
  padding: 0.3rem 0.7rem;
  font-family: sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.2s, background 0.2s, border-color 0.2s;
}

.ladder-btn:first-child { border-radius: 3px 0 0 3px; border-right: none; }
.ladder-btn:last-child  { border-radius: 0 3px 3px 0; }

.ladder-btn.active {
  background: var(--gold-bg);
  color: var(--gold-fg);
  border-color: var(--gold);
}

.tab-btn {
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  padding: 0.5rem 1.1rem;
  font-family: 'Georgia', serif;
  font-size: 0.9rem;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.tab-btn:hover { color: var(--text); }
.tab-btn.active { color: var(--gold-fg); border-bottom-color: var(--gold); }

.result-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
  flex-shrink: 0;
}

.result-value {
  font-size: 0.82rem;
  font-family: sans-serif;
  color: var(--purple-fg);
  white-space: nowrap;
}

.result-value-ladder {
  font-size: 0.75rem;
  font-family: sans-serif;
  color: var(--muted);
  white-space: nowrap;
}

.magic-intro {
  color: var(--muted);
  font-size: 0.85rem;
  font-style: italic;
  line-height: 1.6;
  margin-bottom: 1.2rem;
  padding: 0.75rem 1rem;
  background: var(--purple-bg);
  border: 1px solid var(--purple);
  border-radius: 4px;
}

.magic-intro strong { color: var(--purple-fg); font-style: normal; }

.magic-section-title {
  font-size: 0.8rem;
  font-family: sans-serif;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--purple-fg);
  margin: 1.2rem 0 0.6rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--purple);
  opacity: 0.8;
}

.magic-section-title:first-of-type { margin-top: 0; }

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
