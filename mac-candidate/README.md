# Mac 0.1.0 隔离候选

**本候选使用独立数据目录，原有 DSH 会话、设置和 Bot 不会显示，需要重新配置。尚未支持接入现有 DSH_HOME。目前没有通过 Mac 原生验收的可用 App；Windows 1.0.2 保持不变。**

候选复用已安装官方 DSH 的 Node 模式本地宿主，显示相同鲸鱼皮肤、DS Bot 和 36 张头像。自己的 Electron 窗口有独立 bundle ID、userData 和单实例锁；不运行官方桌面 lib/main.js，不修改官方 ASAR、签名、协议处理器或更新器，不注册 dsh:，不导入原 Keychain 凭据。

## 已实现与验证边界

- 精确样本：Apple Silicon rc.5 / Intel rc.4。核对 ASAR、主可执行文件、Electron Framework 三个 SHA256 与 RunAsNode fuse；macOS 还须完成 codesign 完整性验证。
- 独立工作区在同一父目录暂存，全部准备成功后原子重命名。已有未标记目录拒绝，候选工作区重复启动不重写头像、会话和设置。
- 子进程 HOME、DSH_HOME、DSH_AGENTS_HOME、cwd 均隔离，不继承 API key、NODE_OPTIONS 或代理。普通候选保留 DS Bot memory 默认，仅在本候选 profile 关闭自动更新检查，不更改官方全局配置。
- macOS 不调用 setShape。以鼠标命中配合 setIgnoreMouseEvents 的移动转发探索透明区穿透；拖拽中保持响应，结束/失焦后恢复命中。仅有模块测试，尚无真实桌面验收。
- 仅本窗口的主框架、同源 renderer 能调用白名单窗口接口。可信点击的 HTTP(S) anchor 链接交给系统浏览器，其他协议、合成点击和自动弹窗拒绝。本轮未自行打开任何链接。
- 退出只通知自己创建的宿主进程，等待退出并检查它的进程组及已跟踪子进程；不强杀其他 DSH。残留会使检查失败，而不是伪报通过。

## 原数据边界

rc.5 的 dsh-home-paths 和 dsh-base/cordis.patch.yml 表明 sessions/、storages/、.credentials.yaml 等属于公共 DSH_HOME；profile 分开插件和配置覆盖层。DS Bot 默认位于 DSH_HOME/bot，但 config.home 可另指目录。Electron userData 另存设备设置、快捷键；DSH_AGENTS_HOME 默认还独立指向 ~/.agents。

直接复用原 DSH_HOME 会形成实际共享写入。并发写者、desktop/web 配置差异、加密凭据与自定义 Bot home 的迁移尚未核验；本候选暂不提供原目录接入或自动复制。正式接入前需识别并停止相关写者、完整备份、在副本上核验配置与恢复，再由用户决定。这些步骤当前没有执行，也没有读取任何真实聊天。

## 模块检查

在此目录运行 npm ci --ignore-scripts --no-audit --no-fund，然后 npm test。

Windows 上仅执行跨平台逻辑和 mock；POSIX 目录链接留给 Mac/Linux 实测。src/build-status.json 的已验证架构默认空，直接启动源码不会打开未验收窗口。

## 标准免费 Mac runner

把完整目录放在仓库根的 mac-candidate/，把 ci/mac-candidate.yml 复制为 .github/workflows/mac-candidate.yml。它只有手动 workflow_dispatch，使用公开仓库标准 macos-15 / macos-15-intel，不创建 Release。

维护者审阅后从 Actions 手动触发，选择 arm64、x64 或 both（默认先 arm64）。两个官方 download.deepseek.com ZIP 的地址与整包 SHA512 均固定，不接受外部域名或重定向。actions 依赖已核验并固定完整 commit SHA，不使用 npm cache。官方输入只落在 runner 临时目录，不进入源码、候选包或上传产物。

流程依次进行模块测试、官方签名/三重散列检查、Node 模式真实 web 宿主 cookie 与 36 头像 API、只停止自己进程的检查。本架构 native 报告通过后才构建该架构 App，并写入验证状态。

候选包含自身 Electron 运行时，具有独立身份，仅对新 App 做本地 ad-hoc 签名。上传仅含候选 ZIP、校验和与准确说明，不含官方 DSH、日志或测试工作区。ad-hoc 不是 Developer ID，也不是公证；没有请求 Apple 凭证。Gatekeeper、真实穿透、焦点、透明窗口和关闭/后台任务交互仍待以后另行授权及验收。

匹配 Mac 上可设置 DSH_OFFICIAL_APP 为官方 App 路径，设置 DSH_TEST_REPORT 与 DSH_NATIVE_REPORT 指向同一新报告文件，然后 npm run test:native、npm run build:mac。native 命令不创建 BrowserWindow、不使用 GUI 自动化、不发送模型请求，不能冒充桌面通过。
