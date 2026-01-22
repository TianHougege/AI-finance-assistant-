# 投资助手APP产品方案



# 一、产品目标

成为用户的股市投资助手。通过AI技术帮助用户梳理投资计划、疏解市场焦虑，并且定期复盘投资行为。让AI技术成为用户在股票投资行为中可以反复依赖的工具，使用户减少冲动交易、坚持自己的长期原则，逐步形成有耐心、有纪律的投资者。

关于对客户的服务范围划定详细边界：

1.❌不给客户提供具体投资建议；

2.❌不做任何未来可能性的承诺；

3.❌不给任何违反市场法律或者规则的方案和建议。



# 二、用户画像（我自己）

1. **痛点**（+ 发生场景/触发器一句）

   1.1 每当美股开盘前，我都想看看我的整体投资情况，现在却只能临时拼凑。

   1.2 在我存款定期到期那几天，我总是只在笔记软件上枚举各种情况，缺乏更好看的展现方式让我更深度的思考，我需要有一个乙方给我漂亮ppt进行汇报一样，让我饶有兴致的投入进去做好规划。

   1.3 当我浏览新闻，被某条信息吓到的时候，很羞愧和同事或者朋友谈论，需要人帮我拆解情绪。

   1.4 当我周末或者下班独处，想进行投资复盘的时候，总是需要临时去搜集我的投资情况，并且回忆自己的各种操作，刚准备好复盘资料心态就涣散掉，并没有真正做复盘。

   1.5 被错误的操作和亏损气到无法入眠的时候，需要理智的对话。

2. **期望状态**

   2.1 全局驾驶舱。图表展现整体投资状态和目标投资计划。

   2.2 助手对话界面。一个情绪出口的【对话框】，让我可以把恐惧与焦虑倾倒其中，并得到理智。

   2.3 想法收集器。所有的决策或者想法都写出来，可以选择让ai分析拆解，也可以只是记录。形成想法列表。

   2.4 复盘总结界面。看到过往每次的决策，无论买或者克制；月或者周形成一个情绪分布图，在对话框里说过的关键测情绪词被渲染到一个很酷的概率分布图中。

   

3. **使用场景**

   - 场景 A：美股开盘前 10 分钟，我想快速看一眼全局。早上醒来以后，看看当天营收的情况。
   - 场景 B：有资金可以进行投资时，我想从AI那里拿到几种配置方案。
   - 场景 C：被新闻吓到、很想砍仓的时候，打开聊聊这件事情。
   - 场景 D：周末想复盘这一个月都干了什么。
   - 场景 E：因为某次亏损很难受，想找人理论。



# 三、产品功能设计

## 3.1 投资框架页面

客户的投资“故事主线”，由客户自己设定投资目标、投资态度和具体标的物偏好等，通过AI分析后优化、提炼出优质内容。该价值观将作为prompt提示词，在其他与客户交流互动的模块中来提醒和引导客户。在使用app过程中价值观提示词将客户临时的情绪或者决策与该prompt融合输出新的表达内容，让客户看到比自己临时写的内容更优质的总结，或者说是一份能让客户理智下来的文字内容。

### 3.1.1 数据结构

| 目标配置     |          |          |               |          |          |
| ------------ | -------- | -------- | ------------- | -------- | -------- |
| 简称         | 名字     | 类型     | 活动类型      | 投资金额 | 投资占比 |
| **投资任务** |          |          |               |          |          |
| 投资金额     | 投资目的 | 投资年限 | 总收益/年收益 | 任务备注 |          |
| **风险防御** |          |          |               |          |          |
| 清仓底线     | 单笔底线 | 持仓限额 | 自定义风险    |          |          |

```js
// 价值观设定页面数据结构
//收集用户的基础投资偏好和目的，形成永久性字段。主要用于几个方面：投喂给AI进行初次的对话沟通，AI用这些字段数据进行回复，总结梳理用户的投资偏好和价值观，给出不合理的方面，改进的建议。第二层是用于规范以后AI的回答内容，例如客户在某次对话时希望在这只股票中得到100%的收益，但是客户的风险偏好是低，AI就要给出提醒。
//这部分数据是客户提供的内容，在数据库层面再添加【AI答复】、【回答时间】字段。
const data = {
  id: string;
  createdAt：string；
  targetRow: [{
    id: string;
    symbol: string;
    name: string;
    category: string;
    strategyType: string;
    amount: string;
    targetweight: string;
  }]; //目标配置（简称/名字/类型/活动类型/投资金额/投资占比）
  planBaseCapital:string;
  investmentPurpose: string;  //投资目的
  investmentYear: string;  //投资年限
  returnPurpose： string； //总收益
  taskNotes：string；  //任务备注
  exitLine： string； //清仓底线
  singleLine: string; //单笔底线
  holdMax: string; //持仓限额
  riskNotes: string; //自定义风险
}

```



#### 3.1.1.1 数据契约冻结

字段清单

camelCase：id/createdAt/targetRow/planBaseCapital/investmentPurpose/investmentYear/returnPurpose/taskNotes/ExitLine/singleLine/holdMax/riskNotes

数据库映射

snake_case: id/created_at/target_row/plan_base_capital/investment_purpose/investment_year/return_purpose/task_notes/exit_line/single_line/hold_max/risk_notes



#### 3.1.1.2 接口契约

该页面主要收集用户相关信息后与数据库、AI进行交互，涉及到如下几种接口的使用：

1. 页面--->数据库的POST

   目的：将用户输入数据存入数据库；

   触发：自主设置tab里面的保存按钮；

   请求输入：body: snake_case全部内容，除了id和created_at；

   响应：返回保存后的row；

   幂等性：通过upsert方式进行数据修改；

   成功UI：按键切换到【编辑】；toast：已保存；

   失败分支：toast：保存失败；不触发ai分析

   

2. 数据库--->页面对话框持久化GET

   目的：跨刷新/设备的持久化显示，数据回填页面；

   触发：useEffect，页面加载时候即刻获取；保存更新后再次获取

   响应内容：createvalue 整段词条（form + targetRow + 可选 ai_reply）

   失败分支：toast：获取失败；

   

3. 数据库---> ai接口的输入问题（与1共用POST）

   目的：将createvalue词条传输给AI并得到回复；

   触发：用户点击保存后；

   请求输入：将createvalue用户输入部分的字段传输进ai的api接口；

   输入模型：限定一段对ai输出内容有明确要求的提示词段落； 

   






### 3.1.2 页面设计

投资框架页面，涵盖两个Tab，分别是AI聊天对话框的Tab；自主设置投资框架Tab；代表着与用户两种不同的交互模式。

#### 3.1.2.1 AI聊天对话框Tab

上下双层结构，顶部设置一个ai的reply区域，底部设置一个textarea区域并配置一个黑色的send按钮。该tabs专门为还没有明确投资框架的用户准备，随意输出一些想法，ai来帮助总结出投资框架。



#### 3.1.2.2 自主设置框架Tab

设置4个区域上下摆放，最上方是AI的reply区域用于显示ai的回复内容；接下来偏好标的物区域包含targetrow的所有内容，还有按钮可以增加行；接下来是投资任务区域，包含投资目的、投资年限、目标收益、任务备注这几个input；最下方是风险管理一个区域，包含清仓底线、单笔跌幅底线、持仓限额、自定义风险这些input。最后再有一个保存/编辑按钮。



### 3.1.3 交互功能设计

AI聊天功能。在AI对话框Tab中进行1次的对话，设置一个一问一答功能，输入一轮内容，反馈一轮内容。暂时不做多轮的对话，后面版本再做。

数据提交功能。自主设置页面的用户输入内容点击保存后提交到数据库。

AI数据处理功能。将数据库的数据传递给AI接口，AI处理以后返回建议内容。

数据持久化功能。自主设置Tab中，用户所有填写的数据在保存以后全部保留在页面里，并且是不可修改的模式，当客户再次点击按钮时，才可以重新编辑。

两个button来触发上述四个功能的实现：

Button1: 设置在AI聊天Tab的textarea右下角，通过点击触发ai接收信息并且反馈信息。

Button2: 设置在自助设置框架Tab界面最下方， 保存/编辑 模式点击切换，填写完毕点击保存后，将数据提交到supabase，将数据提交给ai进行处理，渲染ai的reply，并且切换到编辑字样，数据保留在对话框里持久化。



### 3.1.4 用户状态机

#### 3.1.4.1 Tabs切换功能（activeTab）

用于切换该页面中的【AI聊天对话框】和【自主框架设置对话框】

状态变量：activeTab；

#### 3.1.4.2 AI聊天对话框分析禁用状态

在将用户输入内容传输给AI接口的同时，禁用input和传输按钮，避免重复提交。在AI接口异步函数完成时修改isSending状态为false回复正常状态。

状态变量：isSending

#### 3.1.4.3 自主框架设置分析禁用状态

与isSending相同的功能，用户填写完自主框架内容，数据传输并且获取ai回复过程中，用状态变量控制按钮和input框避免重复输入。

状态变量：isFrameworkSaving



### 3.1.5 页面数据流

#### 3.1.5.1 AI聊天界面（POST）

动态变量：chatInput，chatReply，分别负责用户输入数据的处理、AI回复数据的处理。

数据流函数：handleSend() 

触发方式：点击【发送】按钮进行函数触发

状态验证：chatinput为空时直接返回；⭐️要进行错误/故障的数据返回，if（！res.ok）表示http网络通了但是接口本身有错误（或者body不对or效验失败）；catch（e）表示无法通过http网络将请求传输到接口，重点检查网络。

获取数据：ai接口在接收到body数据以后，会返回答复键值对，在请求成功后同步将res.reply数据塞入chatReply这个动态变量中去。



#### 3.1.5.2 投资框架设置界面（POST+GET）

> [!IMPORTANT]
>
> 该部分较为复杂，是典型的一个用户动作触发多重副作用的情况（DB+外部AI+再回写+再渲染）

1.用户数据的获取与存储（POST）

状态机调控：isFramworkSaving 切换按钮显示（禁止按钮并显示‘分析中。。。’）；isEdit切换该tabs的输入框可编辑状态

数据流函数：handleSaveFramework（）

数据动态变量： rows，form, frameworkReply

触发方式：点击【保存】后，将数据传给数据库，再同步GET AI接口的回复

状态验证：isFramworkSaving【AI接口返回数据前禁止操作】；用try/catch验证网络问题；用res.ok验证接口问题。



2.获取AI回复并渲染（GET）

获取内容：输入框持久化数据、AI接收框架数据后的回复内容；

触发位置：在POST接口成功以后，开始获取supabase里面的相关字段数据。

状态机调控：获取全部数据成功以后，isEdit设置为false（禁止编辑模式）

获取数据：rows、form、AIreply

状态验证：用try/catch验证网络问题；用res.ok验证接口问题。



### 3.1.6 页面所用路由

作为与数据库、AI接口相联系的中转地带，主要定义数据交互过程中的契约（data type）、工具和具体的交互方法。

1.数据库POST函数

传输内容： insertData，ai_reply;

连接对象：supabase、google_ai;

Request： 用户输入数据，从investment-plan组件里获取；

Response：包含响应结果三要素（状态码、返回内容（ai_reply)、失败原因）

特殊化设计：在POST函数里专门做了AI接口的post和ai_reply的get。直接将payload传输到ai接口，并且直接拿到ai_reply输入到supabase数据库里，让组件从supabse里去取ai_reply数据



2.数据库GET函数

传输内容： 数据库的createvalue数据；

状态验证：用try/catch验证网络问题；用res.ok验证接口问题。



## 3.2 驾驶舱页面

该页面分为【现有持仓填写页】、【现有持仓分布图】、【目标持仓分布图】、【现金流油表】、【复利效应动态图】这几大内容。

数据在该组件的四层传递：

1. **组件 state（HoldingForm）**
2. **组件输出 payload（onSave 参数）**
3. **Next.js API 接口契约（POST body 形状）**
4. **SQL function 参数 + 表字段（p_portfolio / p_holdings → 两张表）**

3.2.1 现有持仓表单

首次登录时弹出一个【现有持仓】的必填表格，填写完毕后显示驾驶舱主页。请帮我设计表单字段，可以让客户对自己的持仓有直观感受。

supabase数据库端新建holding、portfolio table，做如下字段内容：

holding：

| **字段**   | **类型** | **示例**                                                     | **用来干嘛**   |
| ---------- | -------- | ------------------------------------------------------------ | -------------- |
| id         | string   | 001                                                          | 记录条目       |
| user_id    | string   |                                                              | 数据隔离       |
| *name      | string   | VOO / AAPL / S&P                                             | 人能看懂       |
| *category  | enum     | stock / etf / bond / cash / gold / crypto / real_estate / other | 分类分布图     |
| market     | text     | US / CN / HK / Global / Other                                | 地域暴露       |
| *currency  | text     | USD / CNY / HKD / JPY / Other                                | 币种暴露       |
| *value     | number   | 12000                                                        | 核心：权重计算 |
| created_at | Time     |                                                              | 创建时间       |



portfolio：

| **字段**       | **类型** | **示例**                      | **用来干嘛** |
| -------------- | -------- | ----------------------------- | ------------ |
| id             | string   | 001                           | 记录条目     |
| user_id        | string   |                               | 数据隔离     |
| *cash-value    | enum     | 12000                         | 人能看懂     |
| *cash-currency | string   | USD / CNY / HKD / JPY / Other | 分类分布图   |
| Created_at     | time     |                               | 创建时间     |





3.2.2 现有/目标持仓分布图

做两种不同颜色背景的echarts分布图（最好是3D的），靠左上下摆放，有科技感，让客户能直观看出差异。



3.2.3 现金流油表

有一个汽车油表类似的图，提示客户持有现金的多少，如果太少指针或者仪表盘就变红。



3.2.4 复利效应动态图

分5、10、20年的一个单柱状图，切换来看，让客户看到价值投资在多年以后的惊人成绩。

# 四、技术选型与实现



## 4.1 数据交互技术

1. **路由/服务端框架**：Next.js Route Handlers（决定请求进来怎么处理）
2. **数据传输协议**：HTTP + JSON（GET/POST/PATCH + 状态码）
3. **数据校验与类型**：TS（编译期）+ 最小运行时校验（typeof/Array.isArray）
4. **数据持久化**：Supabase（CRUD + 约束/唯一键）

### 4.1.1 界面分工

#### 交互页面端（REACT/NEXTJS）

**职责（做事范围）**

- 收集用户输入（inputs / textarea / 表格 rows）
- 维护 UI 状态（编辑/只读、loading、error、aiReply 展示）
- 发请求给路由端（GET 拉数据、POST 保存、PATCH 回写 AI）
- 把返回的数据渲染出来（回填表单、显示 AI 回复、overview 图表）

**用到的技术**

- React：useState / useReducer（你现在准备整合成 formState）
- shadcn/ui：Tabs / Card / Input / Textarea / Button / Select
- fetch：请求 /api/investment-plan
- （可选）表单校验：最小化即可（比如必填提示），别做重逻辑

**页面端不该做**

- 不直接连 Supabase（避免泄露 key & 权限混乱）
- 不做“决定插入还是更新”的逻辑（这属于路由端/DB）



#### 路由端（route.ts/API）

**职责**

- 接住 HTTP 请求（GET/POST/PATCH）
- 解析 body：await req.json()
- 做最小运行时校验（typeof / Array.isArray，防脏数据进库）
- 做字段映射（camelCase → snake_case）
- 调用 Supabase Server Client 写入/读取
- 统一错误处理与状态码（400/404/500）
- 返回标准 JSON 响应给页面端（Response.json）

**用到的技术**

- Next.js Route Handlers：export async function POST(req: Request)
- Web 标准 Request/Response：req.json() / Response.json()
- TypeScript：interface/type（payload/row）、最小 type narrowing
- Supabase server client：from().select()/update()/upsert()

**路由端不该做（v0）**

- 不在这里写复杂业务规则（先别做“智能纠错”）
- 不在这里做 UI 逻辑（比如按钮状态）



#### 数据库端（Supabase/postgres）

**职责**

- 存“真实数据源”（用户输入 + AI 结果）
- 提供约束保证数据稳定（主键、unique、默认值）
- 让幂等成立（靠 unique + upsert）
- 存结构化字段（target_rows jsonb、ai_reply_json jsonb）

**用到的技术**

- 表结构（columns types）：text / jsonb / timestamptz
- 约束（constraints）：
  - primary key：id
  - default：created_at default now()
  - unique：plan_key unique（v0 demo 特别关键）
- （可选）RLS 权限（你接登录后再搞）

**数据库端不该做（v0）**

- 不做复杂计算（先别触发器/存储过程）
- 不强制每个字段都 numeric（先 text，跑通再优化）



## 4.2 AI技术

### 4.2.1 将数据传输进入AI接口

第一部分为投资框架分析的AI数据传输部分，核心思路为：

**一次“保存投资框架”动作 = 先把用户框架写进 Supabase → 再把同一份数据喂给 AI → 把 AI 回复写回同一条记录 → 前端 GET 拉取并渲染**

【**设计原则**

契约优先：/api/test-ai 固定返回 { ai_reply }，下游全部变简单

幂等写入：upsert + unique(plan_key) 才能避免“越存越多条”

写回必须精准：用 id 写回最稳，少用“猜测条件”

调试要显性：页面显示 (ai_reply is null / empty) 能让你立刻判断问题在 DB 还是 UI】



定义喂给AI的数据模式，主要分为两部分（V0）：

1.snapshot：用户自定义投资框架数据；

2.prompt：对ai进行角色明确，并对输出内容进行明确限定。

数据输入ai接口分为如下几个步骤：

1.聚合内容，通过一个函数将内容统一return出去。内容组成为snapshot+prompt集合，snapshot必须要包含createvalue数据的键与值内容，否则描述不清晰。

2.内容格式，prompt为string格式，snapshot为object格式，在传输前需要做个json.stringfy()把格式统一转换成用于http传输的json格式。

3.prompt内容：

```
你是“投资框架分析助手”，不是理财顾问。你只能基于用户提供的 SNAPSHOT 进行分析，不得编造用户偏好或事实，不得给出买卖点/具体价格预测。

【输入】
- SNAPSHOT：用户已保存的投资框架数据（包含目标配置、投资任务、风险防御等字段）

【输出要求（必须遵守）】
1) 语言：中文
2) 逻辑结构固定为 1)2)3)4) 四段，标题必须完全一致
3) 篇幅控制：
   - 第1段 <= 60字
   - 第2段最多3条，每条<=35字
   - 第3段表格最多5行（不含表头），每格尽量短
   - 第4段只允许1个问题（<=25字）
4) 禁止内容：
   - 不要长篇免责声明
   - 不要“保证收益/必涨/翻倍”等承诺
   - 不要给出具体买入卖出点位、目标价
5) 选股参考的定位：
   - 只能给“标的/方向/类型”层面的参考（例如ETF/行业方向/因子风格），并解释与用户关键词/风险边界的匹配原因
6) 若用户信息不足：
   - 不要瞎猜，在第4段提出1个最关键的确认问题

【你必须使用下面模板输出】

1) 投资框架摘要
- 用一句话概括：投资目的/年限/收益目标/风险边界（<=60字）

2) 一致性检查（最多3条）
- 每条格式：冲突点/风险点 + 为什么重要 + 一句改进建议

3) 选股参考（Markdown表格，最多5行）
说明：基于用户的关键词与风险边界给“候选标的/方向”，不要给买卖点。
表格列固定为：
| 标的/方向 | 类型 | 适配理由 | 主要风险 | 需要用户确认的前提 |

4) 你需要我确认的1个关键问题
- 只问1个问题，用来补齐缺失信息

最后一行（<=20字）：不构成投资建议
```



4.将数据传输到AI接口：

1. 输入层：拿 payload（前端表单数据）
    •const payload = await req.json()
    这一步只负责拿到“用户输入”，不做业务推理。

  

2. 持久化层：写入 Supabase（权威存储）
    •upsert(insertData, { onConflict: 'plan_key' })
    •关键意义：你把“保存”变成幂等操作（同一个 plan_key 永远是一条记录）

这一步完成后，即使 AI 后面失败，你也至少保存了用户的数据，这是非常正确的设计。

3) AI 层：构建 snapshot + 调 test-ai
	•buildSnapshot(payload)：裁剪字段，保证 AI 输入干净、可控
	•fetch('/api/test-ai')：把 prompt + snapshot 发过去
	•parse { ai_reply }

这里的核心是：你把“AI 交互细节”封装在 test-ai，investment-plan 只认统一契约。

4) 写回层：把 AI 回复写回“同一条记录”
	•update({ ai_reply, ai_reply_at }).eq('id', data.id)（你现在已经稳定了）
	•关键意义：避免“写错行 / 写多行 / 更新不到行”。



## 4.3 登录、认证与权限

（auth&authorization)



### 4.3.1 目标与边界

```
`Browser (Client)
   ↓
Next.js Server (Route / Layout)
   ↓
Supabase Auth
   ↓
Supabase Database (Postgres + RLS)`
```



- 用户可以注册/登录，v0版本只做邮箱密码；不做社交登录；不做复杂 RBAC

- 登录状态可持久化（刷新仍识别用户）

- /dashboard 及其子路由需要登录才能访问

- 数据层面隔离：用户只能读/写自己的数据（数据库强制）

  

### 4.3.2 认证方式选择（Supabase Auth：SSR cookie session + RLS）

```
`用户输入邮箱/密码
   ↓
POST /api/auth/sign-in
   ↓
Supabase Auth 校验身份
   ↓
创建 Session
   ↓
Session 写入浏览器 Cookie
   ↓
跳转到 /dashboard`
```

本项目采用 Supabase Auth 的 Session 机制，通过浏览器 cookie 持久化登录态；Next.js 服务端使用 createServerClient 读取 cookie 来识别用户；数据库层开启 RLS，用 user_id = auth.uid() 强制数据隔离。目前版本下的验证方式核心内容：

- **认证提供方**：Supabase Auth

- **身份载体**：Session（由 Supabase 维护），通过 **cookies** 在浏览器端持久化

- **服务端识别方式**：Next.js 服务端通过 createServerClient 读取 cookies，从而知道当前用户是谁

- **数据库隔离方式**：RLS（auth.uid()）+ 表字段 user_id

  

### 4.3.3 路由守卫

```
`进入 /dashboard
   ↓
Server Layout 执行
   ↓
createServerClient()
   ↓
supabase.auth.getUser()
   ↓
有用户 → 渲染页面
无用户 → redirect('/auth')`
```

当前V0版本采用 **Dashboard 受保护、Landing Page 开放** 的路由结构设计：

- /（3000）：作为公开的 Landing Page，仅用于产品介绍与入口引导
- /dashboard/**：作为用户核心使用区域，仅允许已登录用户访问

所有与用户数据、投资决策、AI 分析相关的功能页面，均位于 /dashboard 路径下，并统一受路由守卫控制。

#### 4.3.3.1 **路由守卫的核心原则**

- **访问控制统一在服务端完成**
- **客户端不参与登录态判定**（避免被绕过）
- **是否允许访问的唯一依据是当前请求中是否存在有效的用户 Session**

#### 4.3.3.2 **实现方式说明**

本项目在 /dashboard/layout.tsx 中实现统一的路由守卫逻辑。该 layout 为 **Server Component**，具备以下能力：

1. 通过 createServerClient 创建 Supabase Server Client
2. 从当前请求中读取浏览器携带的 cookies
3. 调用 supabase.auth.getUser() 获取当前用户信息

路由守卫逻辑遵循以下规则：

- 若成功获取到用户（存在有效 Session）：

  - 允许渲染 dashboard 下的所有子页面

- 若未获取到用户（未登录 / Session 失效）：

  - 立即重定向至 /auth 页面，引导用户完成登录

  该判断逻辑在页面渲染前即完成，避免了未授权内容的短暂暴露。

#### 4.3.3.3 **设计收益**

采用该路由守卫方案带来以下好处：

- **单点控制**：所有 dashboard 页面天然受保护，无需在每个页面重复校验
- **SSR 安全性**：在服务端即阻断未登录访问，提升安全性与一致性
- **清晰的路由边界**：公开页面与私有页面职责明确，结构清晰
- **良好的扩展性**：后续可在此基础上扩展角色、权限等级等控制逻辑

#### 4.3.3. 4 **与认证与权限体系的关系**

- 路由守卫解决的是「**用户是否可以进入某一功能区域**」的问题

- 数据层安全由数据库的 **Row Level Security（RLS）** 进一步兜底

- 即使路由守卫逻辑失误，数据库层仍可防止跨用户数据访问

  

### **4.3.4  登录 / 注册 / 退出的 API 路由契约**



```
点击“退出登录”
   ↓
POST /api/auth/sign-out
   ↓
Supabase Auth 销毁 Session
   ↓
清除浏览器 Cookie
   ↓
redirect('/auth')
```

本项目将用户的 **登录、注册与退出行为**统一封装为服务端 API 路由，集中管理认证逻辑，避免在客户端直接处理 Supabase Auth 细节。所有认证相关接口位于 /api/auth/* 路径下。

#### 4.3.4.1 **接口定义**

| **接口**           | **方法** | **说明**               |
| ------------------ | -------- | ---------------------- |
| /api/auth/sign-in  | POST     | 用户登录，建立 Session |
| /api/auth/sign-up  | POST     | 用户注册，触发邮箱验证 |
| /api/auth/sign-out | POST     | 用户退出，清除 Session |

#### 4.3.4.2 **统一行为说明**

- 接口均由服务端调用 Supabase Auth SDK 完成实际认证操作
- 登录成功后：
  - Supabase Auth 创建 Session
  - Session 通过 SSR 机制写入浏览器 cookie
- 退出登录时：
  - 服务端销毁 Session 并清除 cookie
- 客户端仅负责发起请求与页面跳转，不直接处理认证状态

#### 4.3.4.3 **设计目的**

- 统一认证入口，避免逻辑分散
- 支持服务端识别登录态（路由守卫、API 权限）
- 提升安全性与可维护性
- 为后续权限扩展预留空间
