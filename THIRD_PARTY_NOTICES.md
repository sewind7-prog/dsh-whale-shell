# Licenses and provenance

Project-owned code and the supplied whale/avatar artwork in `implementation/`, `refs/`, and the project documentation are offered under the root MIT license. This does not relicense the vendored packages below.

| Package | Version | Original license | Upstream |
| --- | --- | --- | --- |
| DS Bot | 0.2.4 | Apache-2.0, original LICENSE preserved | https://github.com/Fei2411/DS-Bot |
| deep-view | 0.1.0 | Apache-2.0, original LICENSE preserved | https://github.com/Fei2411/deep-view |

Original package LICENSE and README files are retained under `vendor/<package-version>/package/`. Neither upstream package supplied a separate NOTICE file in the verified package archive; no original NOTICE was removed. Their copyright and license headers remain intact. Vendored runtime code has not been changed.

DeepSeek Harness itself, its full ASAR, Electron, and any official DSH application bundle are not redistributed here. The installer patches a separately installed, explicitly supported DSH copy. Playwright is a development dependency and is not bundled in the user installer; see its own installed package license.

The version-guarded `patch-shell.cjs` contains matching fragments derived from DeepSeek Harness. Its original MIT license, Copyright (c) 2026 DeepSeek, is retained separately at `third_party/deepseek-harness/LICENSE`. Source: https://github.com/deepseek-ai/deepseek-harness/blob/master/LICENSE . This attribution is separate from the project's MIT grant and the two Apache-2.0 packages.
