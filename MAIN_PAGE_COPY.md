<!-- Kassiber main page copy. Source heading levels are preserved exactly. -->
<!-- Source: src/pages/index.astro and src/layouts/Layout.astro -->

**Page metadata**

- **Title:** Kassiber · Private Bitcoin Accounting
- **Description:** Keep one book for on-chain, Lightning, and Liquid on your own machine. No account, no upload, no one else's server.

<!-- Section: Navigation -->

- Kassiber.app
- Star on GitHub
- Download

<!-- Section: Hero -->

# Private Bitcoin accounting on your machine.

One book for on-chain, Lightning, and Liquid. Transfers between your own wallets are matched, not taxed, and reports carry the formulas that prove them.

**Actions**

- Download for macOS (changes to Windows or Linux when detected)
- View source on GitHub

Watch-only. Kassiber never sees your private keys.

**Assistant prompt:** Ask anything

**Selected model:** omlx · Qwen3.6-35B-A3B-4bit

<!-- Section: Local-first. Anchor: connections -->

## Connect what you already run.

Sync wallets, nodes, BTCPay, and exchange exports through your own node or Tor, so nobody learns which addresses you query. Wallets you retired years ago count too.

Missing yours? [Open an issue](https://github.com/bitcoinaustria/kassiber/issues) or [send a PR](https://github.com/bitcoinaustria/kassiber/pulls).

**Connection dialog**

- Add connection
- Watch-only wallets, your node, merchant tools, files.
- Categories: Wallets, Exchanges, Nodes, Lightning, Merchant, Files
- Actions: Cancel, Continue
- Note: Third-party brands and logos belong to their respective owners.

<!-- Section: Bird's eye: money in, money out, and the internal moves. Anchor: history -->

## Raw transactions in. A classified book out.

Everything lands in one searchable history, each row with its source and its accounting treatment.

<!-- Section: Pairing. Anchor: pairing -->

## A move between your own wallets isn't a sale.

Kassiber pairs both legs of a transfer, swap, or wallet migration, so your cost basis travels with the coins.

**Swap example**

- Spent leg — Liquid — ₿ 0.04200000
- Received leg — Bitcoin — ₿ 0.04195800
- Transaction graph
- Inputs
- Outputs

<!-- Section: Tax and reports. Anchor: tax -->

## Reports you can verify.

[RP2](https://github.com/eprbell/rp2) computes FIFO, HIFO, or moving-average reports locally. The export re-derives every gain and checks it against Kassiber, for you and your advisor to verify. An Austrian § 27b EStG preset is included.

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

**Demo label:** Illustrative demo data.

<!-- Section: Privacy scoring. Anchor: privacy -->

## Your payments were always public. Your name was not.

Bitcoin never wrote your name on the ledger, but one exchange or leak ties you to an address, and the chain supplies the rest. Kassiber shows you what your wallets give away.

**Card label:** synthetic data (shown in the leaked-data card's header)

<!-- Section: Agents. Anchor: agents -->

## Ask your books anything. On a local model, the answer never leaves your machine.

Point your agent at the book. It reads and prepares, never signs or broadcasts.

Works with OpenCode, Claude Code, and Codex CLI via [the Kassiber skill](https://github.com/bitcoinaustria/kassiber-skill); local models through oMLX or Ollama.

**Agent examples**

- What did I actually earn last year?
- Which of my wallets leak the most about me?
- My bank wants proof of where the coins came from. Build it.

<!-- Section: Open source. Anchor: open -->

## Don't trust. Audit.

Cypherpunks write code.

```console
$ gh repo fork bitcoinaustria/kassiber --clone
✓ Cloned kassiber into ./kassiber
$ cd kassiber && ./scripts/bootstrap-dev-env.sh
✓ deps ready · quality gate: ./scripts/quality-gate.sh
$ ./scripts/integration-harness.sh demo-up
✓ regtest up · 13 wallets · demo books seeded
```

- **Inspect it.** The code is on GitHub.
- **Run it.** One script starts a throwaway regtest with demo books.
- **Keep your exit.** Export your ledger or the full database at any time.

**License:** AGPL-3.0 licensed

**Actions**

- Fork on GitHub
- Browse source

<!-- Section: Screenshots. Anchor: screens -->

## See for yourself.

- Balance, cost basis, and price.
- Incoming, outgoing, and transfers, quarter by quarter.
- Booked, priced, and marked taxable.
- An L-BTC → BTC swap, paired as a move.
- Liquid amounts hidden. Pairing still resolves.
- Every wallet and source feeds the same book.
- Watch-only. Never keys.
- Filing fields and lot audits.

<!-- Section: Final call to action. Anchor: download -->

## Keep your books to yourself.

No account, no subscription, no company. Free and AGPL, built by the nonprofit Bitcoin Austria.

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

**Are my books encrypted?**

Yes, when you set a passphrase. The database is encrypted with SQLCipher; only your passphrase opens it.

**What happens if I lose my passphrase?**

Kassiber cannot recover your passphrase. Lose it and the encrypted books stay locked, so store it with your seed backups.

**Can Kassiber spend my coins?**

No. Kassiber reads descriptors and watch-only addresses; it never holds spending keys. Connected agents can inspect the book. They cannot sign or broadcast transactions.

**What does it cost?**

Nothing. Kassiber is free and AGPL-3.0 licensed, built by [Bitcoin Austria](https://bitcoin-austria.at), a nonprofit based in Austria. There is no paid tier and nothing to upsell.

**Why does my OS warn me about the download?**

Pre-alpha builds are not yet code-signed, so macOS and Windows warn on first launch. The source is public if you would rather build it yourself.

**Was this built with AI?**

Yes. Agents write the code, humans direct and review it, and the commit history names the agent on every commit. The same rule applies as everywhere else here: don't trust, audit.

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

AGPL-3.0 open source · Built and maintained by Bitcoin Austria · llms.txt
