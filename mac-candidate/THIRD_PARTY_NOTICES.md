# Third-party licenses

Candidate code, the project skin, and supplied whale/avatar artwork use the root MIT license.

- `payload/plugins/ds-bot/`: DS Bot 0.2.4, Apache-2.0. Original LICENSE, copyright headers and README preserved; runtime code unchanged.
- `payload/plugins/deep-view/`: deep-view 0.1.0, Apache-2.0. Original LICENSE, copyright headers and README preserved; runtime code unchanged.
- Official DeepSeek Harness is not bundled or modified. Its MIT license, Copyright (c) 2026 DeepSeek, is retained at `third_party/deepseek-harness/LICENSE` for attribution and research.
- A built candidate App includes its own Electron 45.1.0 runtime. The builder preserves the SDK's complete LICENSE and Chromium license notices inside the new App before ad-hoc signing; packaging fails if Chromium notices are missing. This does not sign or modify official DSH.
- Build dependencies, including @electron/packager, retain their original installed licenses and are not embedded as development tools in the App.

No third-party license is replaced by the project's MIT grant.
