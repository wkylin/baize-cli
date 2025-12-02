# 发布与部署指南

本文档记录了 Baize CLI 的本地调试、构建及发布到 npm 的完整流程。

## 1. 本地开发与调试

在发布之前，建议在本地进行全局安装测试，以确保 CLI 工具运行正常。

### 方法 A: 使用 `npm link` (推荐)

`npm link` 会在全局 `node_modules` 中创建一个指向本地项目的软链接。任何代码修改都会立即生效，无需重新安装。

```bash
# 1. 在项目根目录下建立链接
npm link

# 2. 验证命令是否生效
baize -v

# 3. 在任意目录下测试创建项目
cd ~/Desktop
baize init
```

**取消链接：**
```bash
npm unlink -g baize-cli
```

### 方法 B: 本地全局安装

模拟真实用户的安装过程，将当前目录打包并安装到全局。

```bash
npm install -g .
```

---

## 2. 发布前检查

在发布新版本前，请确保代码质量符合规范。

```bash
# 1. 运行代码风格检查
npm run lint

# 2. 运行单元测试
npm run test
```

---

## 3. 构建与发布到 npm

### 前置条件

1.  拥有 [npm](https://www.npmjs.com/) 账号。
2.  在终端登录 npm：
    ```bash
    npm login
    # 按提示输入用户名、密码、邮箱和 OTP
    ```
3.  确保 `package.json` 中的 `name` 字段在 npm 上是唯一的（未被占用）。

### 发布流程

本项目使用 `standard-version` 自动化管理版本号和变更日志。

#### 步骤 1: 生成新版本

根据修改内容的类型（Patch/Minor/Major），运行相应的命令：

```bash
# 发布补丁版本 (例如: 1.0.0 -> 1.0.1) - 用于 bug 修复
npm run release

# 发布次版本 (例如: 1.0.0 -> 1.1.0) - 用于新功能
npm run release -- --release-as minor

# 发布主版本 (例如: 1.0.0 -> 2.0.0) - 用于破坏性更新
npm run release -- --release-as major
```

此命令会自动执行以下操作：
1.  更新 `package.json` 中的版本号。
2.  更新 `CHANGELOG.md`。
3.  提交代码并打上 Git Tag。

#### 步骤 2: 推送代码到仓库

将代码和标签推送到 GitHub：

```bash
git push --follow-tags origin main
```

#### 步骤 3: 发布到 npm

```bash
npm publish
```

> **注意**：如果是首次发布 Scoped Package (例如 `@wkylin/baize-cli`)，需要添加访问参数：
> ```bash
> npm publish --access public
> ```

---

## 4. 常用命令速查

| 命令 | 说明 |
|Data | Description |
| `npm link` | 本地软链调试 |
| `npm run lint` | 代码检查 |
| `npm run test` | 运行测试 |
| `npm run release` | 生成新版本 (Patch) |
| `npm publish` | 发布到 npm |
