# Contributing

PRs are welcome! If you would like to suggest a particularly large change, you may want to contact me (contact@atlasgong.com) to discuss it prior to implementation.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download) (see engines in package.json for version)
- [pnpm](https://pnpm.io/)

### Steps

1. **Clone the repository**

2. **Install dependencies**

```sh
pnpm install
```

**Optionally, for local testing**

> [!TIP]
> The top-level directories `src` and `dev` contain, respectively, the plugin source code and a mock server used for testing.

**Setup your environmental variables for the dev server**

```sh
cp dev/.env.example dev/.env
```

**Run the dev server**

```sh
pnpm dev
```

5. **Build the plugin**

```sh
pnpm build
```

> [!IMPORTANT]
> Unit/integration tests and a plugin build will be run locally on each commit. Your commit will be blocked locally if anything fails. You can directly run tests with `pnpm test:unit`, `pnpm test:int`, or `pnpm test` to run both. Should your contribution require adding testcases, please feel free to take ownership.

6. **Push and create a PR!** Thank you for your contribution.

## License

This project is licensed under [The MIT License](https://github.com/atlasgong/payload-sentinel/blob/main/LICENSE) and any contributions are assumed to be under it.
