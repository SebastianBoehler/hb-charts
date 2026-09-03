# Contributing

Issues and focused pull requests are welcome.

1. Open an issue before changing the public interface.
2. Keep the external interface small and describe all invariants and error modes.
3. Add behavior tests at the interface seam.
4. Keep source files at or below 300 lines unless a focused exception is discussed.
5. Run `bun run check` before opening a pull request.

Do not include exchange credentials, customer data, proprietary indicators, or
code copied from charting libraries with incompatible licenses.
