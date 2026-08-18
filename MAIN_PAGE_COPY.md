<!-- Kassiber main page copy. Source heading levels are preserved exactly. -->
<!-- Source: src/pages/index.astro and src/layouts/Layout.astro -->

**Page metadata**

- **Title:** Kassiber · Private Bitcoin Accounting
- **Description:** Keep on-chain, Lightning, and Liquid books on your machine. Your wallet history stays off SaaS servers.

<!-- Section: Navigation -->

- Kassiber.app
- Star on GitHub
- Download

<!-- Section: Hero -->

# Private Bitcoin accounting on your machine.

Keep one book for on-chain, Lightning, and Liquid. Sync directly, match transfers, review wallet privacy, and export reports without uploading your history to a SaaS.

**Actions**

- Download for macOS (changes to Windows or Linux when detected)
- View source on GitHub

Kassiber reads watch-only wallet data, never private keys. Local AI access through oMLX or Ollama stays read-only.

**Assistant prompt:** Ask anything

**Selected model:** omlx · Qwen3.6-35B-A3B-4bit

<!-- Section: Local-first. Anchor: connections -->

## Connect anything Bitcoin.

Sync watch-only wallets, nodes, BTCPay, and exchange exports. Use your own Bitcoin Core, Electrum, Esplora, or Tor route so third parties do not learn which addresses you query. Retired wallets count too: import the export of a wallet you left years ago and its history lands in the same book.

Missing yours? [Open an issue](https://github.com/bitcoinaustria/kassiber/issues) or [send a PR](https://github.com/bitcoinaustria/kassiber/pulls).

**Connection dialog**

- Add connection
- Watch-only wallets, your node, merchant tools, files.
- Categories: Wallets, Exchanges, Nodes, Lightning, Merchant, Files
- Actions: Cancel, Continue
- Note: Third-party brands and logos belong to their respective owners.

<!-- Section: Bird's eye: money in, money out, and the internal moves. Anchor: history -->

## One timeline for your whole Bitcoin stack.

On-chain, Lightning, Liquid, BTCPay, and exchange activity appear in one searchable history. Each row keeps its source, status, and accounting treatment.

<!-- Section: Pairing. Anchor: pairing -->

## A move between your own wallets isn't a sale.

Kassiber pairs transfers, channel opens, and Liquid pegs across layers instead of booking them as taxable sales. That includes wallet migrations: the sweep into a new wallet pairs up like any other move, and your cost basis travels with the coins.

**Swap example**

- Spent leg — Liquid — ₿ 0.04200000
- Received leg — Bitcoin — ₿ 0.04195800
- Transaction graph
- Inputs
- Outputs

<!-- Section: Tax and reports. Anchor: tax -->

## Reports you can verify.

Kassiber uses [RP2](https://github.com/eprbell/rp2) to compute FIFO, HIFO, or moving-average reports on your machine. The spreadsheet exports include live formulas you can inspect. Generic reports work anywhere; Kassiber includes an Austrian § 27b EStG preset.

**Report example**

- Disposals ledger (inputs reduce holdings)
- Occurred At
- Asset
- Proceeds
- Cost Basis
- Gain/Loss
- Kassiber
- Check
- Total gain
- ALL CHECKS OK
- Tax due · 27.5% § 27b EStG
- Workbook tabs: Overview, Portfolio, Capital Summary, Disposals, Verify, Control

**Demo label:** Illustrative demo data for auditable verification.

<!-- Section: Privacy scoring. Anchor: privacy -->

## Your payments were always public. Your name was not.

Bitcoin records every transaction without putting your name on the ledger. An exchange or another service can link your identity to an address and expose the rest of your history.

**Demo label:** Synthetic demonstration of on-chain identity clustering.

<!-- Section: Agents. Anchor: agents -->

## Ask your books anything. The answer never leaves your machine.

Point your agent at Kassiber to inspect the book and explain what your wallets reveal. It can prepare a document you choose to share. Kassiber ships [the skill](https://github.com/bitcoinaustria/kassiber-skill) that teaches it the data model. Run the agent through oMLX or Ollama to keep your questions on your machine.

Works with OpenCode, Claude Code, and Codex CLI. Local models through oMLX or Ollama.

**Agent examples**

- What did I actually earn last year?
- Which of my wallets leak the most about me?
- My bank wants proof of where the coins came from. Build it.

<!-- Section: Open source. Anchor: open -->

## Don't trust. Audit.

```console
$ gh repo fork bitcoinaustria/kassiber --clone
✓ Cloned kassiber into ./kassiber
$ cd kassiber && ./scripts/bootstrap-dev-env.sh
✓ deps ready · quality gate: ./scripts/quality-gate.sh
$ ./scripts/integration-harness.sh demo-up
✓ regtest up · 13 wallets · demo books seeded
```

- **Inspect it.** Read the code on GitHub or point your agent at it.
- **Run it.** One script spins up a throwaway regtest with demo books.
- **Keep your exit.** Export your raw ledger or database without vendor lock-in.

**License:** AGPL-3.0 licensed

**Actions**

- Fork on GitHub
- Browse source

<!-- Section: Screenshots. Anchor: screens -->

## See for yourself.

- Balance, cost basis, and price.
- Flows by quarter.
- Booked, priced, and marked taxable.
- An L-BTC → BTC swap, paired as a move.
- Liquid amounts hidden. Pairing still resolves.
- Wallets and sources.
- Watch-only. Never keys.
- Filing fields and lot audits.

<!-- Section: Final call to action. Anchor: download -->

## Keep your books to yourself.

Kassiber stores the database locally and works without an account or subscription.

**Actions**

- Download for macOS (changes to Windows or Linux when detected)
- Windows · Linux · other

Pre-alpha, rough edges and all. We'd rather tell you.

**Rather use Homebrew?**

- **Desktop app + CLI:** `brew install --cask bitcoinaustria/kassiber/kassiber`
- **CLI only, no GUI, no JavaScript:** `brew install bitcoinaustria/kassiber/kassiber-cli`

<!-- Section: FAQ. Anchor: faq -->

## Before you ask.

**Can I try it without connecting my own wallets?**

Yes, if you have Docker. The regtest script starts a disposable network with thirteen wallets, Lightning channels, Liquid, a BTCPay store, and years of activity. The teardown command deletes the demo data. It never touches mainnet or your wallets.

**Do I need to run my own node?**

No. Kassiber syncs through default backends after installation. Those services can see the addresses you query, so use your own Bitcoin Core, Electrum, or Esplora when that matters. You can route each backend through your Tor proxy.

**I've switched wallets over the years. Can Kassiber follow?**

Yes. Import each wallet's export, even ones you retired long ago. Kassiber pairs the migrations as transfers, so history and cost basis stay continuous across every wallet you have used.

**Does Kassiber replace my tax advisor?**

No. Kassiber computes the numbers and exposes each calculation for you or your advisor to check. You remain responsible for filing. Kassiber is pre-alpha software and provides no tax or legal advice. Ask a professional about unusual cases.

**What happens if I lose my passphrase?**

Kassiber cannot recover your passphrase. Lose it and the encrypted books stay locked, so store it with your seed backups.

**Can Kassiber spend my coins?**

No. Kassiber reads descriptors and watch-only addresses; it never holds spending keys. Connected agents can inspect the book. They cannot sign or broadcast transactions.

**I'm not in Austria. Is it still useful?**

Yes. Kassiber's books and generic exports work anywhere. The included filing preset covers Austria. Other jurisdictions can use generic reports or add a country ruleset.

<!-- Section: Footer -->

**Kassiber**

Watch-only Bitcoin accounting across on-chain, Lightning, and Liquid. Your books stay on your machine.

## Product

- Download
- GitHub
- Releases
- Report an issue

## Legal

- Terms
- Privacy
- Security
- Imprint

AGPL-3.0 open source · Built and maintained by Bitcoin Austria
