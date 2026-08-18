# Kassiber.app messaging review

Reviewed against the copy on `main` (mirrored in `MAIN_PAGE_COPY.md`), the source of
`src/pages/index.astro` and all interactive mocks, and the README of
`bitcoinaustria/kassiber`. The graphics and interactions were read from the component
source, including the author comments that explain what each one is arguing.

The short version: the page is unusually honest and unusually well-made, and its
weaknesses are the mirror image of its strengths. Almost every sentence is a polished
aphorism, so the page has one rhythm and no plain ground to stand on. It shows seven
proofs but never states the problem, the audience, or who builds it and why. And two
headlines promise slightly more than the body delivers, which is exactly the kind of
gap the page's own "Don't trust. Audit." reader will find.

---

## 1. What sounds AI

Very little of this copy is sloppy, and none of it has the classic tells (no hype
words, no "seamless", no rule-of-three padding for its own sake). What reads as
generated is not any single line but the **uniform cadence**: nearly every heading and
caption is a clipped two-beat aphorism, and stacked aphorisms are a machine rhythm
even when each one is good.

**The clipped-imperative run at the bottom of the page:**

> Don't trust. Audit. → See for yourself. → Keep your books to yourself. → Before you ask.

Four punchline headings in a row — but each one is captioning its visual, and by
that measure they all earn their form: "See for yourself." sits on the
screenshots, "Don't trust. Audit." on a terminal you can retype, "Before you
ask." heads the FAQ. Don't flatten these; a heading like "Screenshots" would fit
the visual less well, not better. The cadence problem is real but lives in the
*accumulation*: by the fourth clipped imperative the register has stopped
signaling emphasis. If anything gives, make it the CTA heading ("Keep your books
to yourself." is the one not anchored to a demonstration), or break the rhythm
earlier in the page so the ending run reads as a crescendo instead of a default.

**Fragment captions in the screenshot strip:**

> "Booked, priced, and marked taxable." · "Watch-only. Never keys." · "Liquid amounts hidden. Pairing still resolves."

Individually fine; eight in a row is the tell. Two or three full sentences among
them ("Every row keeps the source it came from") would break the pattern.

**The privacy section's mic-drop chain:**

> "The chain is already public. The picture says which of it is yours. Hosted, it
> becomes a honeypot that only has to leak once."

The argument is the strongest on the page, and "a honeypot that only has to leak
once" is a genuinely good, concrete line. But the two paragraphs around it are
wall-to-wall short declaratives, every sentence a closer. Let one or two sentences
be ordinary connective prose and the closers will hit harder.

**Feature-list compression in the hero sub:**

> "Sync directly, match transfers, review wallet privacy, and export reports without
> uploading your history to a SaaS."

Four verbs in a row is a spec sheet folded into a sentence. Nobody talks like this;
it is how models (and marketers) compress. See §4 for a rewrite direction.

**Lowercase card poetry:** "every lot traced to its origin" · "built here, sent by
you". On-brand, but it is the same device again.

Not AI-sounding, keep as-is: "A move between your own wallets isn't a sale" (plain,
factual, the best feature headline on the page), "Pre-alpha, rough edges and all.
We'd rather tell you." ("We'd rather tell you" is the most human sentence on the
site), and the FAQ answers, which are direct and unhedged.

---

## 2. What is too complicated or confusing

**The single most confusing sentence on the page** is in the hero:

> "Local AI access through oMLX or Ollama stays read-only."

It introduces three unexplained ideas at once (the product has AI; something called
oMLX exists; access has a permission model), before the visitor knows what the
product is. oMLX is obscure even among bitcoiners. This line belongs in the agents
section; the hero boundary line should carry only the one boundary that matters to
everyone: *watch-only, never private keys*.

**The hero chat composer raises a question the page answers six sections later.**
The first thing floating over the product screenshot is "Ask anything" and a model
ID ("omlx · Qwen3.6-35B-A3B-4bit") that the CSS deliberately enlarges into a hero
element. For the local-AI crowd this is a wink; for everyone else it says "this is
an AI product?" while the headline says accounting. The OpenCode logo also floats
among Bitcoin/Lightning/Liquid/BTCPay in the ambient animation — the observer-that-
only-polls choreography is lovely, but nobody decodes it on first view. Either the
hero should say one honest sentence about the assistant ("comes with an assistant
that can run entirely on local models") or the composer should carry less visual
weight than the accounting.

**"One timeline for your whole Bitcoin stack."** To bitcoiners, "stack" means their
sats, not their tooling. "Your whole Bitcoin stack" can read as "all your coins",
which is a different (also true) claim. If the pun is intended, fine; if not,
"across every layer you use" avoids it.

**"Connect anything Bitcoin."** Grammatically startup-flavored, and "anything" is
immediately walked back by "Missing yours? Open an issue." The hedge is charming
and honest; the absolute headline is what makes it a contradiction.

**Jargon load per section is uneven.** The pairing section headline is plain
language, then the body jumps to "channel opens and Liquid pegs across layers".
The tax section assumes FIFO/HIFO/§ 27b literacy (acceptable — that reader is the
target). The agents section assumes the reader owns "an agent" and knows what a
"skill" is. Pattern to adopt: plain claim first, jargon second, in every section —
the pairing headline already does this perfectly.

**FAQ: "Can I try it without connecting my own wallets?" — "Yes, if you have
Docker."** For most people that conditional yes is a no. If the app can open a
bundled demo book without Docker, say that first and keep regtest as the deep
option. If it can't, this FAQ is quietly telling you what the onboarding gap is.

**The passphrase FAQ answers a question the page never raised.** Nothing above it
mentions that books are encrypted. Encryption (SQLCipher, per the README) is a
selling point being paid for as a support burden.

---

## 3. Where the words and the visuals diverge

The page's rule should be: the text claims exactly what the mock demonstrates.
Judged that way, the bottom-of-page sections are fine and the gaps are elsewhere —
and they run in both directions.

**Hero — the visual outclaims the text.** The headline says "Private Bitcoin
accounting"; the picture foregrounds an AI composer with a deliberately enlarged
model name, and OpenCode floats among the protocol marks. The most prominent
interactive element on first view is the one thing the hero copy never mentions.
Either the text acknowledges the assistant in one honest sentence, or the
composer cedes visual weight to the accounting.

**History — the visual outclaims the text.** The animation's argument is
classification: raw rows arrive at the bottom and resolve into a booked, compressed
deck at the top. The heading claims only aggregation ("one timeline"). The mock is
demonstrating something stronger than the words ask credit for — the heading could
name the resolving, e.g. "Raw transactions in. A classified book out."

**Tax — the prose underclaims the mock.** "Live formulas you can inspect" is the
weak version of what the sheet is doing on screen: cycling through
`=IF(ABS(E3-F3)<=Verify!$B$3,"OK",…)` — the export re-derives every gain and
audits Kassiber's own figures. Only the aria-label states this. One visible
sentence ("the workbook re-computes every number and checks it against Kassiber")
would let the copy claim what the visual already proves.

**Agents — the headline fits its own mock but clashes with its neighbors.** "The
answer never leaves your machine" is true of what's shown: the mock's badge reads
"Qwen3.6-35B · oMLX **local**". The contradiction comes from the caption ("Works
with OpenCode, Claude Code, and Codex CLI" — two of which are remote) and from the
hero's picker mock, which honestly shows remote dots on those providers. Two valid
fixes: soften the headline ("On a local model, the answer never leaves your
machine"), or keep it and scope the harness line instead ("with a local model, as
shown; remote harnesses work too, with their tradeoffs"). Either way the page
stops making the careful reader reconcile it.

**Connections — the text outclaims the visual, mildly.** "Connect anything
Bitcoin." over a finite roster. The "Missing yours? Open an issue" line already
absorbs most of this; smallest gap on the page.

**Connections and pairing — the visuals claim a use case the text never names:
wallet migrations.** The Add-connection dialog lists migration artifacts ("Address
list — a flat list of addresses, e.g. a pre-HD Core keypool", old Samourai /
Specter / Sparrow exports) — things you import because you *used* to run them. And
the pairing section's headline is the migration story in miniature: sweeping an
old wallet into its successor is the most relatable "move between your own wallets"
a bitcoiner ever makes, and the one where carried-over cost basis matters most.
Neither section says it. Say it in both halves, where each is already shown:
connections gets "retired wallets count too — import the export of a wallet you
left years ago and its history lands in the same book"; pairing gets "that
includes the big one: sweeping an old wallet into its successor — the move pairs
up, and your cost basis travels with the coins." No new section needed; it's the
same engine applied to the most familiar event.

---

## 4. Trust: what builds it, what leaks it

**Already strong — keep and protect:**

- The pre-alpha admission next to the download button, phrased as a choice
  ("We'd rather tell you").
- Demo labels on every fabricated visual ("Illustrative demo data", "Synthetic
  demonstration of on-chain identity clustering").
- The watch-only boundary, repeated at hero, screenshots, and FAQ, including
  "agents can inspect the book; they cannot sign or broadcast".
- Crediting RP2 by name with a link, instead of claiming the tax engine.
- The spreadsheet mock's real point: the export re-derives every gain with its own
  formulas and audits Kassiber's numbers (`=IF(ABS(E3-F3)<=Verify!$B$3,"OK",…)`).
- Real, checked CLI commands in the agent demo (per the component's own comment:
  guessed flags would be found out by exactly the people the section addresses).
- AGPL + fork + one-script regtest + "Keep your exit" + imprint/legal pages.
- "Missing yours? Open an issue or send a PR."

**Trust leaks — each one is a promise slightly larger than the mechanism:**

1. **"Ask your books anything. The answer never leaves your machine."** Two
   sentences later: "Works with OpenCode, Claude Code, and Codex CLI." Claude Code
   and Codex are remote models, and the page's own model-picker mock marks them
   with remote dots. The headline *does* fit the section's own mock (its badge
   reads "Qwen3.6-35B · oMLX local") — the clash is with the caption and the hero
   picker. So either soften the headline ("On a local model, the answer never
   leaves your machine") or keep it and scope the caption to match what's shown.
   The careful reader this page courts will notice the conditional either way;
   better it be yours.

2. **Hero absolutism vs. FAQ defaults.** The hero says "without uploading your
   history", the FAQ admits default backends see which addresses you query. These
   are compatible (the *database* never leaves; *queries* reveal addresses), but
   the page makes the reader do that reconciliation. One clause in the hero or the
   connections section ("your book stays local; who sees your queries is your
   choice of backend") closes the gap before a skeptic opens it.

3. **"ALL CHECKS OK" and "Tax due · 27.5 %" in a pre-alpha product.** The
   verification story is the answer to the pre-alpha problem — but the two facts
   sit six sections apart. One line in the tax section ("pre-alpha: the export
   exists so you and your advisor can check every number") turns the caveat into
   the feature.

4. **No funding story.** A privacy product with no visible business model makes
   people ask what the catch is. The actual answer — built by a,
   donation-funded, Bitcoin-only nonprofit with nothing to sell — is the strongest
   trust asset the project has, and it appears only as a footer credit.

5. **Unsigned binaries.** The README says prerelease binaries are unsigned; macOS
   will throw a scary warning the page never prepared the visitor for. A one-line
   FAQ ("Why does macOS warn me about the download?") converts a trust-destroying
   surprise into more of the "we'd rather tell you" posture.

6. **"…it is also the only thing worth stealing."** (privacy note) The skeptical
   reader immediately thinks: keys. The honest, stronger claim is that the picture
   is the *most damaging* theft, not the most tempting one — a stolen key costs
   one wallet, a stolen picture gives away every wallet, amount, and counterparty
   at once, and unlike keys it can't be rotated. Coins move to new addresses; a
   leaked history never stops being true.

---

## 5. What's missing to understand the intent

The page shows seven proofs and never states the case. Missing, roughly in order of
importance:

1. **The problem, before the solution.** Nowhere does the page say plainly: *if
   you hold bitcoin in Austria you owe capital-gains tax, and every existing tool
   for computing it wants your complete wallet history uploaded to its servers.*
   Every section is an answer to that sentence; the sentence itself never appears.
   (This is also the house style: problem before solution.)

2. **Who it's for.** Individuals filing § 27b? Merchants running BTCPay?
   Advisors? "Whatever you keep books for" is the only hint. One sentence fixes it.

3. **Who builds it, and why.** "Built and maintained by Bitcoin Austria" is
   footer-only, unlinked, unexplained. The real story — a Bitcoin-only nonprofit
   built the accounting tool it wished existed, and gives it away — is the missing
   spine of the whole page. It answers "why free", "why AGPL", "why watch-only",
   and "why should I trust you" in one move.

4. **The name.** A Kassiber is a secret note smuggled past the guards. That is a
   perfect one-line embodiment of the product's whole worldview, and the page
   never says it. Non-German speakers see an unpronounceable word; Germans see
   prison slang with no anchor. One sentence in the footer or an about block.

5. **Encryption.** Watch-only is everywhere; encrypted-at-rest is nowhere except
   implied by the passphrase FAQ. "Your books are an encrypted database only your
   passphrase opens" belongs next to "stores the database locally".

6. **Where prices come from.** Tax reports need EUR prices; fetching them is a
   network call. The audience that cares about Tor routing will ask. One FAQ line.

7. **The CLI as a first-class thing.** The README's dual-interface architecture
   (GUI and CLI over one daemon, JSON output) surfaces only as a Homebrew variant
   and inside the agent demo. For the audit-minded audience the CLI *is* evidence.

---

## 6. The honest, cohesive story

Everything above collapses into one narrative the page already half-tells. Spelled
out:

> **Your bitcoin history is a complete map of your finances — and you're being
> asked to hand it over.** Tax season pushes every holder toward SaaS accounting
> tools that aggregate exactly this map on their servers. The chain was always
> public; the map of which of it is *yours* is the only secret left, and hosted
> maps leak. (The leak demo already argues this beautifully.)
>
> **Kassiber builds the map where it belongs: on your machine.** Watch-only, so
> there are no keys to steal. Encrypted, so the file is yours alone. One book
> across on-chain, Lightning, and Liquid, with moves between your own wallets
> paired instead of taxed.
>
> **And it shows its work.** Reports re-derive every number in formulas you can
> audit; the code is AGPL; a script gives you a disposable demo network; your
> data exports without lock-in. Ask it questions — on a local model, even the
> questions stay home.
>
> **It's pre-alpha, and it's built by Bitcoin Austria** — a Bitcoin-only nonprofit with nothing to sell you. A Kassiber is a note passed
> under the guards' noses. That's the design goal.

The current page has all four beats but in proof-first order, with beat 1 (the
why) buried mid-page as section six and beat 4 (the who) reduced to a footer line.
Two ways to fix it, one cheap and one structural:

- **Cheap:** keep the section order. Add one problem/why sentence to the hero, one
  "what Kassiber does about it" sentence to the privacy section head, and a short
  "who builds this and why it's free" block near the final CTA. Fix the agents
  headline. Done.
- **Structural:** move the "Your payments were always public" section to directly
  after the hero, so the page runs why → what → proofs. The leak demo is the
  emotional core and currently plays to an audience that already scrolled past
  five feature sections.

---

## 7. Concrete line-level suggestions

Kept minimal; these are directions, not final copy.

**Status:** everything below is applied in this PR, with four exceptions that
need facts or decisions only the team has: the price-source FAQ (which service
supplies EUR rates?), the Docker demo answer (does the app bundle a demo book?),
the "Hardware wallet: Yes" row in the leak card (make the 2020 leak reference
legible, or drop it), and the structural option of moving the privacy section
after the hero (the cheap alternative — a product sentence in its section head —
is applied instead). For the agents fix, option A (softened headline) was chosen.

| Where | Current | Suggestion |
|---|---|---|
| Hero sub | "Sync directly, match transfers, review wallet privacy, and export reports without uploading your history to a SaaS." | Lead with the problem or the promise, not four verbs. E.g. "One book for on-chain, Lightning, and Liquid, built and kept on your own computer. Transfers between your wallets are matched, not taxed; reports export with the formulas that prove them." |
| Hero boundary | "Kassiber reads watch-only wallet data, never private keys. Local AI access through oMLX or Ollama stays read-only." | Drop sentence two here; move it to the agents section. |
| Meta description | "Keep on-chain, Lightning, and Liquid **books**…" | Align with the hero's "one book". |
| Connections H2 | "Connect anything Bitcoin." | "Connect what you already run." (keeps the hedge line honest) — or keep, accepting the wink. |
| Connections body | (ends with the Tor sentence) | Add: "Retired wallets count too — import the export of a wallet you left years ago and its history lands in the same book." (the dialog mock already shows the artifacts) |
| History H2 | "One timeline for your whole Bitcoin stack." | The mock demonstrates classification, not just aggregation — claim it: "Raw transactions in. A classified book out." (also resolves the stack/sats ambiguity). |
| Tax prose | "The spreadsheet exports include live formulas you can inspect." | Claim what the mock shows: "The workbook re-computes every gain with its own formulas and checks it against Kassiber's figures." |
| Tax section | (no caveat) | Add: "Kassiber is pre-alpha — the export exists so you and your advisor can check every number, not take ours." |
| Pairing body | "Kassiber pairs transfers, channel opens, and Liquid pegs across layers instead of booking them as taxable sales." | Add: "That includes the big one: sweeping an old wallet into its successor. The move pairs up, and your cost basis travels with the coins." |
| Privacy head | (no product tie-in) | Add one sentence: "Kassiber builds that picture on your machine only — and shows you what your wallets already give away." |
| Privacy note | "…that complete picture is what makes the numbers useful, and it is also the only thing worth stealing." | "…that complete picture is what makes the numbers useful. It is also the theft that does the most damage: a stolen key costs you one wallet, a stolen picture gives away all of them at once — every address, every amount, every counterparty. And unlike keys it can't be rotated: coins move to new addresses, a leaked history never stops being true." |
| Agents H2 or caption | "Ask your books anything. The answer never leaves your machine." | Either soften the headline ("On a local model, the answer never leaves your machine") or keep it and scope the caption: "Shown on a local model via oMLX. Remote harnesses (Claude Code, Codex CLI) work too — then your questions travel." |
| Final CTA | "…works without an account or subscription." | Add the who/why: "Free and AGPL, built by Bitcoin Austria — a nonprofit with nothing to sell you." Link the name. |
| Footer or About | — | "A Kassiber is a secret note passed under the guards' noses. Your books, kept the same way." |
| FAQ | — | Add: "What does it cost?" / "Are my books encrypted?" / "Why does my OS warn me about the download?" / "Where do the EUR prices come from?" / "I've switched wallets over the years. Can Kassiber reconstruct that?" → "Yes. Import each wallet's export, even retired ones. Migrations pair as transfers, so history and cost basis stay continuous." |
| FAQ demo | "Yes, if you have Docker." | If a bundled demo book exists, lead with it; if not, consider building one — this answer is the onboarding gap talking. |

---

## 8. What not to touch

- "A move between your own wallets isn't a sale." — the model for every other headline.
- "Your payments were always public. Your name was not."
- "Don't trust. Audit." and the whole open-source section.
- "Pre-alpha, rough edges and all. We'd rather tell you."
- The demo-data disclaimers, the RP2 credit, the trademark note, the FAQ's direct
  no's ("Can Kassiber spend my coins? No.").
- The leak demo itself, including the synthetic Max Mustermann card and the
  "3rd of 812 in Vienna" wealth-rank join — that inference *is* the argument. One
  legibility note: "Hardware wallet: Yes" in the doxx card is a nod to the 2020
  hardware-wallet customer-list leak; readers who know that history shiver, and
  everyone else is confused. Consider making the reference explicit or dropping
  the row.
