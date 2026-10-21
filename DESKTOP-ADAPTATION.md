# DSH 0.2.1-rc.2 桌面布局适配

当前补丁：`1.3.1-patch.7`，日期：2026-10-21。源码与构建产物随本仓库提供。

## 修复内容

- 新版桌面主栏 `centerCol` 会绘制基础背景。增加 `data-dsh-center` 标记和限定在主题开启时的透明化规则，避免它覆盖流体、壁纸与环境装饰。
- 恢复随深浅色及磨砂度变化的侧栏玻璃配方，恢复 12px 悬浮留白。Windows 云母效果下收起后显示 72px 图标栏，主栏预留 96px；网页版保留 56px 图标栏。
- 通过 `conversation.header` 槽位定位活动会话顶栏。首页保留原生按钮和拖拽功能，不再装饰为空玻璃卡片。
- 保留背景层在框架下方的正确堆叠，恢复原版流体 canvas 透明度与备用渐变配色。
- 更新插件版本与 DSH peer/engine 声明至本次检查的 `0.2.1-rc.2`；移除实际主插件未使用的旧 invariant peer。没有修改宿主的兼容性检查或添加豁免。
- 修正宿主入口类型声明，与实际空 `apply()` 保持一致。
- Windows 侧栏的模糊移到独立伪元素，避免祖先 `backdrop-filter` 重定位固定菜单。展开时收起按钮位于鲸鱼品牌行右侧；收起时将原生按钮排列到图标栏，顶部鲸鱼点击展开，macOS 继续使用独立的展开入口。
- 右侧普通停靠和放大后的全屏面板均采用同款悬浮玻璃卡片：12px 留白、20px 圆角、同一玻璃配方、镜像边框和阴影，包含窄屏自动全屏。“开始”入口也使用玻璃材质。留白放在宿主计算的面板边界内，继续使用宿主的尺寸和 Windows 标题栏避让；Windows 全屏首栏的单侧圆角覆盖为卡片四角。兼容模式保持原生几何，两种状态均使用半透明背景。

## 在当前电脑生效

桌面 profile 已将 `dsh-client-ui-aqua` 链接到当前文件夹。`lib/client.js` 已同步，完整退出 Harness（包括托盘驻留）后重新打开即可加载新的元数据和前端产物。无需重装或修改会话、模型配置。

## 后续修改与同步

```powershell
npm run sync:visual
npm run check:visual
node --check lib/client.js
```

也可运行 `./build.ps1`，或 `./build.ps1 -Check`。需要 Node 22.13 及以上。

这是视觉修改专用同步：只更新已有模块包装内的 `aqua.module.css` 与 `seam-stamper.ts`，保留设置 API、字体和其他运行代码。修改其他 TypeScript 文件仍需完整构建或单独同步，不能将此工具视为完整 TS 构建。原来的 tsdown 配置仍依赖上游 monorepo。

## 本轮收起图标栏的验证

### 品牌行收起按钮（patch.7）

Windows 云母模式下将展开态原生收起按钮从 fixed 改为品牌行内的相对定位，不更换按钮与监听器。品牌行向两侧各扩展 12px，保留完整的 188px 品牌标识及 28px 按钮；去掉标识原有 1px 下移使其垂直居中。其他侧栏内容保持原有留白。

隔离同版本实例实测：品牌标识中心 y=89，按钮中心 y=89，按钮 (228,75)、28×28px、命中正常；品牌宽度与 scrollWidth 同为 188px。收起后鲸鱼入口仍为 48×48px，点击可重新展开。“应用 / 编辑”坐标在两种状态均保持 (48,6)/(98,6)，console error 为空。测试范围仍为 Windows 布局与菜单模拟，未测试 Electron 原生 IPC。

本节为已有隔离实例的验证记录；相关截图与测量数据保存在本地测试环境，未随仓库分发。

### 标题栏位置补充修复（patch.6）

宿主侧栏收起时会在 html 设置 `--dsh-windows-menu-start:84px`，为原生标题栏的展开、新建会话按钮留位。Aqua 已将两个按钮放入图标栏，因此云母模式下将该变量固定为展开时的 48px。变量在根元素设置，可传入桌面 preload 的菜单 Shadow DOM；兼容模式或关闭主题后恢复宿主行为。

隔离的同版本网页实例复用安装包 `preload-app.cjs` 中的实际 `installWindowsMenu()` 函数，原生 IPC 仅设置为空实现，未调用原生菜单。展开、收起、再次展开三次测量中，“应用”按钮均为 (48,6)、“编辑”均为 (98,6)，侧栏均从 (12,52) 开始；宽度由 256px 切为 72px 再恢复。Console error 为空。此测试验证菜单定位，未验证 Electron 原生菜单弹出。

本节为已有隔离实例的验证记录；相关截图与测量数据保存在本地测试环境，未随仓库分发。

### 图标栏（patch.5）

使用本机 `0.2.1-rc.2` 运行时与独立的 DSH_HOME，加载当前插件副本，预置 Windows 标题栏布局属性。没有使用用户账号、会话或调用模型，未模拟原生 Electron IPC。

| 检查 | 结果 |
| --- | --- |
| 图标栏几何 | 1280×720 下为 x=12、y=52、宽 72px、高 656px、圆角 20px |
| 原生按钮 | 七个入口均为 48×48px、水平对齐、可见且命中 |
| 展开往返 | 点击鲸鱼恢复展开侧栏；搜索自动展开并显示搜索框 |
| 主栏与右侧栏 | 主栏从 x=96 开始；右侧全屏同样避让至 x=96，图标栏保持可见 |
| 深浅色 | 两种材质均完成视觉检查 |
| 兼容模式 | 原生零宽侧栏与主栏 x=0 恢复；重新开启云母效果恢复图标栏 |
| 页面 console error | 检查时为空 |

相关截图与测量数据保存在本地测试环境，未随仓库分发。源码/产物一致性与 JavaScript 语法另行检查；原生窗口拖拽、Electron 菜单及多屏缩放仍需桌面客户端验证。

## 前轮右侧栏放大修复的验证

放大后面板的 `data-sidebar-right-panel` 从 `push` 切为 `fullscreen`，此前所有右侧栏材质规则只匹配 `push`。现在两种状态共用材质和悬浮卡片几何：在面板内部增加 12px 留白，停靠内容使用 20px 圆角、边框和阴影。放大时不覆盖面板的宿主宽度、最大宽度或顶边定位，Windows 首个全屏停靠栏的四角则明确覆盖为 20px，避免原生单侧圆角规则因样式加载顺序影响卡片。

本轮已完成视觉产物同步、源码与产物一致性检查、JavaScript 语法、包元数据和差异格式检查；通过当前连接页面的 Inspect 确认右侧栏和 Aqua 设置槽位正常注册，当前安装也是指向本工作区的目录链接。当前没有窗口操作或截图工具，因此没有重新进行普通/放大往返、深浅色和窄屏的视觉验收。下表为前一轮的隔离实例记录。

### 本次构建的权限处理与恢复

经授权在沙箱外运行权限诊断脚本，检查了工作区、被拒绝写入的前端产物及其祖先路径。脚本分别为工作区根目录和 `lib` 目录补上当前用户的完全控制，权限复读验证均通过；未发现需删除的外来应用包权限项，没有更改文件内容或所有者，也未执行回滚。受限环境仍拒绝覆盖前端产物，最终经授权将同一同步与语法检查命令在沙箱外运行并成功完成。

完整报告：[工作区检查](../dsh-background-permission-recovery/acl-report-5715553d373e40a980bfd84cb12b2bcb.jsonl)、[前端产物检查](../dsh-background-permission-recovery/acl-report-c29ede40405441ffacbfa10f5e5b361e.jsonl)。如需撤销这两次权限改动，先恢复子目录，再恢复根目录：

```powershell
pwsh -NoProfile -File 'D:\software\harness\dsh-background-permission-recovery\acl-backup-67121a30a71d4b0db1deec6d462a49ab.json.ps1' -Path 'D:\software\harness\dsh-background\lib' -AllowRoot 'D:\software\harness\dsh-background' -Restore 'D:\software\harness\dsh-background-permission-recovery\acl-backup-67121a30a71d4b0db1deec6d462a49ab.json'
pwsh -NoProfile -File 'D:\software\harness\dsh-background-permission-recovery\acl-backup-55378617f9284f6588bdaecc80b6d935.json.ps1' -Path 'D:\software\harness\dsh-background' -AllowRoot 'D:\software\harness\dsh-background' -Restore 'D:\software\harness\dsh-background-permission-recovery\acl-backup-55378617f9284f6588bdaecc80b6d935.json'
```

## 前一轮实际验证

从本机安装包只读提取 `0.2.1-rc.2` 运行时，在工作区内独立的 DSH_HOME 启动真实网页应用，加载当前插件副本；未使用用户的账号和会话，也未调用模型。

| 检查 | 结果 |
| --- | --- |
| 正常宿主版本检查 | 插件成功加载，无需版本豁免 |
| 全屏流体 | 截图可见，主栏计算背景为 `rgba(0,0,0,0)` |
| 深浅色 | 正常切换，侧栏使用对应的半透明材质 |
| 磨砂联动 | 浅色模式 7% → 70%，侧栏 alpha 从 0.0588 → 0.588 |
| 首页顶栏 | 背景透明、边框 0，导航按钮保留 |
| 网页侧栏折叠 | 实测宽度 56px，展开可恢复 |
| Windows 布局模拟 | 真实 UI 预置 `data-windows-titlebar` 与 40px 标题栏高度，未模拟桌面 IPC |
| Windows 折叠往返 | 收起时侧栏宽度 0、展开按钮位于 (12,6)、28×28px、可见且命中；点击后恢复 256px 玻璃卡片 |
| 右侧悬浮卡片 | 1280×720 的 Windows 布局模拟中，左右顶边同为 y=52、高度 656px、圆角 20px；右侧保留 12px 边缘留白 |
| 左右玻璃一致 | 深浅色下左右计算背景色分别一致，磨砂参数继续共用 |
| 右侧收起/全屏 | 实际点击收起后可重新打开；全屏 padding 恢复为 0px，退出后回到悬浮卡片 |
| 兼容模式 | 右侧 padding、圆角均恢复 0px，保持原生布局 |
| 总开关 | 关闭后 ambient 移除、侧栏 margin 归零；重新开启恢复效果 |
| 页面 console error | 检查时为空 |
| 源码/产物同步与 JS 语法 | 通过 |

Windows 侧栏分支已在隔离网页实例中按桌面布局属性完成定位与实际点击验证，原生 Electron 菜单、窗口拖拽和活动会话没有通过原生窗口交互验收。壁纸、视频、文档预览和多屏缩放没有进行专项回归，不应视为已经验证。
