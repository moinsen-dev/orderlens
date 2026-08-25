# Security Policy

## Reporting a vulnerability

Please report security issues privately through GitHub's
[security advisory form](https://github.com/moinsen-dev/orderlens/security/advisories/new)
rather than in a public issue. Expect an acknowledgement within a few days.

**Do not attach your Amazon export** to a report. If a specific input triggers the problem,
send an anonymised row that reproduces it.

## Threat model

OrderLens is a static, client-side application. It has no server, no accounts and no network
calls: the data you import is read with the File API, kept in your browser's IndexedDB, and
never transmitted. The interesting attack surface is therefore small but real:

- **Anything that would send data off the device.** A dependency that phones home, an
  accidental `fetch`, an external font or CDN script — all of these are treated as security
  bugs, not style issues.
- **Untrusted input from the export.** Product names and other cells are attacker-influenced
  in principle (a seller controls their listing title). Rendering happens through React's
  escaping; a way around that is a vulnerability.
- **Supply chain.** Reports about a compromised or malicious dependency in the lockfile are
  in scope.

Out of scope: anything that requires an attacker to already have access to the machine or
the browser profile — the data is stored locally by design.

## Supported versions

The `main` branch is the supported version.
