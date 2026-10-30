# DSH Whale Shell / 鲸鱼外壳

Windows 一键安装器与鲸鱼皮肤源码，包含 DS Bot 0.2.4、deep-view 0.1.0 和 36 张拼贴头像。**不包含 DSH 主程序、用户聊天、配置或凭证。**

<img src="refs/透明腹窗纸艺蓝鲸.png" width="420" alt="项目提供的蓝鲸纸艺外壳原画">

## Windows 下载与范围

[下载 1.0.2 单文件安装器](downloads/windows-1.0.2/DSH鲸鱼外壳一键安装器-1.0.2.exe) · [SHA256](downloads/windows-1.0.2/SHA256SUMS.txt)

这是未做 Authenticode 签名的 Windows x64 安装器。仅接受 DSH **0.2.1-rc.3** 的以下精确 `app.asar`，不以版本文字猜测兼容性：

- 原版：`04b32e3a872826ba15cfb2081c6a929a8d4ecaa65e09a2543e5a6b30e2eff1f0`
- 对应鲸鱼外壳：`e146b65f293baf9595005f56c124ce568b95c2a4ab998604be6b638528c3f318`

其他版本（包括 rc.4/rc.5）会拒绝安装。目标电脑须另行安装合法取得的 DSH。安装前退出目标 DSH 及后台任务；安装器不会强停它们。成功安装、还原或恢复检查后显示完成状态，2 秒后仅关闭安装器，不自动重启 DSH。失败保留错误和恢复入口。

保留原有 Bot、头像、草稿、聊天、其他插件、provider、模型和路由。备份在实际数据目录 `whale-shell-installer/backups/`；还原只恢复安装前外壳和皮肤，保留 DS Bot、头像与新增用户数据。不同或损坏的同版插件、自定义动态/不安全目录会安全拒绝而不覆盖。

1.0.2 的 PE 图标、内嵌窗口 ICO、编译后完成/失败路径和无窗口隔离安装回归已验证；本轮没有实际 GUI 验证自动关闭与任务栏显示，也没有第二台物理电脑验收。

## 从源码构建 Windows

需要 Windows x64、Node.js、Microsoft Edge、.NET Framework 4 的 C# 编译器，以及 Playwright 开发包。构建不调用模型。可使用已安装的 Playwright（设置 `NODE_PATH`），或在自己的环境安装 `package.json` 中固定的开发依赖。

从仓库根目录执行 PowerShell：

```powershell
node implementation/build-skin.mjs build/client.js
$env:DSH_SKIN_CLIENT = (Resolve-Path build/client.js).Path
node implementation/installer/build-payload.cjs build/payload-1.0.2 vendor
& implementation/installer/build-setup.ps1 -PayloadDirectory build/payload-1.0.2 -OutputDirectory build/windows-1.0.2
$env:DSH_TEST_OUTPUT = Join-Path $PWD 'build/resource-check'
node implementation/installer/test-ui-resources.cjs build/windows-1.0.2 build/payload-1.0.2
```

输出目录必须是新目录，避免替换已有构建。`build/` 为生成文件，不应提交。构建出的 EXE 可以因 ZIP 时间戳等元数据与已下载版本具有不同总散列；源码、资源和测试记录分别校验。

需要真实 DSH 运行时的无窗口隔离检查时，提供自己机器上的两个只读输入：

```powershell
$env:DSH_RUNTIME_EXE = '你自己的DSH目录/DeepSeek Harness.exe'
$env:DSH_STOCK_ASAR = '你自己的原版rc.3/app.asar'
node implementation/installer/test-windows.cjs build/windows-1.0.2 build/payload-1.0.2
```

测试只在 `build/` 新建带标记的 fixture，DSH 运行时仅以 Electron Node 模式执行本地安装引擎，不显示客户端，不发模型请求，不读取真实聊天。不允许用用户数据目录作为 fixture。测试用 ASAR 不能提交到本仓库。

## Mac 状态

提供 [Mac 隔离候选源码与验证说明](mac-candidate/README.md)。Apple 芯片版针对官方 DSH 0.2.1-rc.5，Intel 版针对官方 DSH 0.2.1-rc.4；各自都已在 GitHub 标准 Mac runner 通过本地宿主与 36 张头像的无界面检查，并生成候选包。它们使用独立数据目录，不显示已有 DSH 会话、设置或 Bot，需要重新配置，也不会覆盖或重签官方 DSH。

候选尚未完成真实 Mac 桌面交互、透明区域点击穿透或 Gatekeeper 验收，也没有 Apple Developer ID 签名和公证。[测试运行与候选产物](https://github.com/sewind7-prog/dsh-whale-shell/actions/runs/41003158350)中的 Actions 下载保留 1 天；日后可按候选说明重新构建。

## 源码和许可

`implementation/` 为皮肤、精确版本外壳补丁与 Windows 打包器；`refs/` 为原鲸鱼和 36 张头像；`vendor/` 为离线第三方运行源码。项目自有代码和素材按 MIT，DS Bot/deep-view 保留 Apache-2.0。详见 [LICENSE](LICENSE)、[NOTICE](NOTICE) 和 [第三方说明](THIRD_PARTY_NOTICES.md)。
