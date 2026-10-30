# DSH 鲸鱼外壳 Windows 安装器 1.0.3

内含鲸鱼外壳、DS Bot 0.2.4、deep-view 0.1.0、36 张默认头像与原图。目标电脑已安装 DSH 即可，无需另外安装 DS Bot；不分发 DSH 主程序。安装器未签名，只支持经完整散列核验的 Windows x64 DSH 0.2.1-rc.3 / rc.5 及对应鲸鱼外壳。其他版本、混合版本或未知修改版安全拒绝，不按版本名称猜测兼容性。

`src/supported-shells.cjs` 是白名单的单一来源，含原 EXE、原 ASAR 与鲸鱼 ASAR 的 SHA256。C# 启动目标运行时前检查 EXE+ASAR，引擎再次校验；补丁仅接受精确原始文件，且输出必须命中目标散列。`src/patch-shell.cjs` 是新版实际使用的补丁。

| DSH | 原 ASAR SHA256 | 鲸鱼 ASAR SHA256 |
| --- | --- | --- |
| rc.3 | `04B32E3A872826BA15CFB2081C6A929A8D4ECAA65E09A2543E5A6B30E2EFF1F0` | `E146B65F293BAF9595005F56C124CE568B95C2A4AB998604BE6B638528C3F318` |
| rc.5 | `E1B6F25FA937DA98086C3E77AF77AA14791105963C4D337A1C42179D232C6915` | `DCBF1CBFE255C40A77DB4946989170CFF46327E57C9C2169A095AF327F59631F` |

## 维护与回退

皮肤配置基线和 DSH 程序基线分开保存。已有 rc.3 安装记录、DSH 已升级 rc.5 时，先用 1.0.3 安装以建立 rc.5 备份，再还原；恢复最早安装前的皮肤注册与对应 rc.5 程序，不会写回 rc.3。DS Bot、头像与用户之后新增数据保留，不自动降级 DS Bot。

安装器默认使用当前用户 `.dsh`，遵守 `DSH_HOME` 及 DS Bot 静态绝对 home 配置；通过目标 DSH 原生 `composeEntries` 解析 bundle→profile→根补丁顺序。未知插件版本、同版本损坏/定制变体、动态/相对/网络 home 和不安全链接父目录会停止，保留原配置。

备份在实际数据目录 `whale-shell-installer/backups/<交易编号>`。逐项记录目标、原指纹、候选与备份；中断后可用修复按钮恢复，遇到外部修改则保留目标、备份和 pending 记录，不强行覆盖。这些本地备份可能包含目标机原配置，应按个人数据保管。

成功安装、还原、修复检查均显示完成状态 2 秒后关闭安装器。失败保留明确错误和恢复入口。文件、窗口/任务栏绑定同一七档鲸鱼头部 ICO；原画和头像不修改。安装器不启动、重启、退出或强制停止 DSH。

## 离线复用资源构建

开发构建需要 Windows x64、Node.js 和系统 .NET Framework 4 x64 C# 编译器。最终用户不需要这些开发依赖。以下方法只读可信 EXE 内的资源，不调用安装器 Main、不创建窗口，避免为相同头像重新编码。

```powershell
# 先确认 SetupPath 和 ExpectedSha256 对应已核验的安装器；OutputDirectory 必须全新。
& .\implementation\installer\extract-payload.ps1 -SetupPath <安装器EXE路径> -ExpectedSha256 <已核验SHA256> -OutputDirectory .\implementation\installer\build\payload-1.0.3
& .\implementation\installer\build-setup.ps1 -PayloadDirectory .\implementation\installer\build\payload-1.0.3 -OutputDirectory .\build\windows-1.0.3
```

从 1.0.2 资源升级时，先提取到另一目录，再执行 `clone-payload.cjs <已验证旧资源目录> <新资源目录> 1.0.3`。该工具检查旧清单每个文件，复用原头像、原画、第三方插件与皮肤运行代码，只更新版本元数据和明确列出的安装器代码/许可。`sync-engine.cjs` 拒绝改写旧 1.0.2 资源；其他资源意外变化时停止。源码构建可复现资源与行为；EXE/ZIP 时间和编译标识可能导致每次二进制总散列不同，须记录各自校验值。

## 从原素材生成资源

```powershell
npm ci
npm run build:skin
node .\implementation\installer\build-payload.cjs .\implementation\installer\build\payload-1.0.3 .\vendor
& .\implementation\installer\build-setup.ps1 -PayloadDirectory .\implementation\installer\build\payload-1.0.3 -OutputDirectory .\build\windows-1.0.3
```

此路径另需锁定的 Playwright 开发依赖与 Microsoft Edge，头像按 DS Bot 原生规则居中生成 160px WebP。1.0.3 实际交付复用原先已验证的 36 张 WebP、36 张原 PNG，未重新编码或生图。当前 `refs/icons` 还包含 9 个界面图标，属于按钮素材；bot-01 至 bot-36 才是头像集，已逐图比对原始散列。

皮肤输入是 `DSH_SKIN_CLIENT` 指定文件，或根目录 `build/client.js`；原项目 dist 仅作兼容输入。必须命中皮肤 SHA256 `4ACC9C1EA0DBCEE422C8BD6F551492D952E7D005AB5A54653157216ED5CB40D3`。离线包目录可用第三个位置参数或 `DSH_INSTALLER_PACKAGES` 指定，默认根目录 `vendor/`。

## 不操作桌面的验证

- `node --test implementation/installer/test-state-policy.cjs`：基线选择、跨版本重建、结账重入、还原后重装。
- `node implementation/installer/test-ui-resources.cjs <构建目录>`：PE 七档鲸鱼图标、ICO、IL 中的窗口绑定、成功关闭/失败保留路径、启动前身份检查、并发独立解压。只读程序集，不创建 Form。
- `test-1.0.3.cjs <新EXE>`：须提供 `DSH_RC3_APP`、`DSH_RC3_STOCK_ASAR`、`DSH_RC5_APP`。可设置 `DSH_RC5_STOCK_ASAR`、`DSH_PREVIOUS_SETUP`、`DSH_PREVIOUS_PAYLOAD`、`DSH_TEST_ROOT`。复制真正的 EXE/DLL/ASAR/解包资源到全新目录，再检查 CLI 安装/重装/还原、1.0.2→1.0.3 与 rc.3→rc.5、配置/头像/其他插件保留、拒绝、故障恢复及进程保护；不运行官方安装程序，不读取原用户数据。
- `test-native-http.cjs <成功的regression-report.json>`：在该真实 rc.5 副本中再建独立 home/web profile；最小 Windows PATH、127.0.0.1 宿主、原生会话认证、36 张 WebP 头像、`__DSH_BOOT__` 的清单 URL 和组合脚本完整鲸鱼源内容，最后仅停止自己创建的宿主并核对无跟踪残留。不开浏览器或桌面，不调用模型。
- `test-patch-integrity.cjs`：设置两个 `DSH_RC*_STOCK_ASAR`，先把补丁生成到 `installer/build/rc3-patch-proof-1.0.3/candidate.asar` 与对应 rc5 目录；除 main/preload 外所有条目元数据、原 body 和新增完整性都须通过。

当前已通过同机隔离 CLI、原生 HTTP 和资源/编译路径检查。新版桌面渲染、真实窗口自动关闭、Explorer/任务栏实际显示和另一台 Windows 电脑未验收；这些检查不冒充 GUI 结果。Mac 是另一个独立候选项目，不在此 Windows 安装器内。

代码与素材按根 MIT 许可提供；DS Bot/deep-view 原 Apache-2.0 保留。DeepSeek Harness 匹配片段的完整 MIT 版权许可在 `licenses/DeepSeek-Harness-LICENSE.txt`。不携带本机凭证、聊天或个人设置。
