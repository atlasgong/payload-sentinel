> [!WARNING]
> **Under development.** Use at your own risk. Please report bugs [here](https://github.com/atlasgong/payload-sentinel/issues).

# Payload Sentinel (A PayloadCMS Plugin)

Payload Sentinel is a lightweight, opinionated audit logger for Payload CMS. It automatically logs user CRUD operations in a centralized audit log, allowing you to track who did what and when, because “I don’t know who changed that” isn’t good enough. Sentinel ensures complete traceability across all user activity; you’ll never lose sight of critical changes again.

Say goodbye to mystery edits forever.

- Works right out of the box — no configuration is needed.
- Minimal and self-contained — zero external dependencies.
- Natively integrates with Payload's versioning support.

## Installation

Requires Payload CMS v3.29.0 or above.

Using **npm**:

```
npm i payload-sentinel
```

Using **pnpm**:

```
pnpm add payload-sentinel
```

Then add the plugin to your `payload.config.ts`:

```
import { payloadSentinel } from "payload-sentinel";

export default buildConfig({
  plugins: [
    payloadSentinel(),
  ],
});
```

You're good to go! Payload Sentinel will automatically start logging all user **create**, **update**, and **delete** operations. To enable logging for **read** operations, see [Configuration](#configuration).

> [!TIP]
> To enable diff viewing in audit logs, make sure versioning is enabled for the relevant collections or globals. Sentinel doesn’t handle diffs itself, nor is it planned to, because Payload already provides built-in versioning, which Sentinel natively integrates with.
>
> **Note:** Versioning is optional; audit logging still works without it. You just won't be able to view diffs.

## Configuration

Payload Sentinel works without any configuration. If you want to customize its behavior, there are minimal configuration options, which you can check here: [`config.ts`](./src/config.ts). If there is a feature not currently configurable that you would like to see configurable, you may submit a feature request [here](https://github.com/atlasgong/payload-sentinel/issues).

## Roadmap

- [ ] Analytics panel for usage insights
- [ ] I18n support
- [ ] Logging console (API) operations
- [ ] Seamless native integration with version diffs
- [ ] Tamper-evident audit logs using cryptographic hash chaining

## Issues & Feature Requests

Please report issues and request features by opening a Github issue. PRs are welcome; see [CONTRIBUTING.md](./CONTRIBUTING.md) (coming soon).
