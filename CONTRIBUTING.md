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

3. **Setup your environmental variables for the dev server**

```sh
cp dev/.env.example dev/.env
```


> [!TIP]
> The top-level directories `src` and `dev` contain, respectively, the plugin source code and a mock server used for testing. You can start the mock dev server with `pnpm dev`. It comes with Payload CMS, Next.js, and SQLite, and will automatically load the plugin with hot-reloading enabled. Feel free to modify anything in the dev directory for testing; just be sure not to include those changes in your commit.

4. **Build the plugin**

```sh
pnpm build
```

> [!IMPORTANT]
> Unit/integration tests and a plugin build will be run locally on each commit. Your commit will be blocked locally if anything fails. You can directly run tests with `pnpm test:unit`, `pnpm test:int`, or `pnpm test` to run both. Should your contribution require adding testcases, please feel free to take ownership.

5. **Push and create a PR!** Thank you for your contribution.

## License

This project is licensed under [The MIT License](https://github.com/atlasgong/payload-sentinel/blob/main/LICENSE) and any contributions are assumed to be under it.
