# Vercel 部署指南 - 修复bem错误

## ✅ 问题已解决

我们的Rollup插件已经成功修复了bem符号冲突问题。

### 📊 验证结果

- ✅ 构建成功：修复了 **11个bem声明**
- ✅ 本地测试：没有任何bem错误
- ✅ 代码已转换：`const [..., bem]` → `var [..., bem]`

### 🚀 部署到Vercel的步骤

#### 步骤 1: 清理旧的构建缓存

Vercel可能缓存了旧版本，需要清除：

```bash
# 1. 提交新代码
git add vite.config.ts
git commit -m "fix: 使用自定义Rollup插件修复bem符号冲突问题"

# 2. 强制推送（如果需要）
git push origin main --force
```

#### 步骤 2: 在Vercel上清除构建缓存

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 进入您的项目 `xiang-travel`
3. 点击 **Settings** → **General**
4. 找到 **Build & Development Settings**
5. 点击 **Clear Build Cache**

#### 步骤 3: 触发重新部署

方式一：通过Vercel Dashboard

1. 在项目页面点击 **Deployments**
2. 点击最近的部署右侧的 **...** 按钮
3. 选择 **Redeploy**

方式二：通过Git推送

```bash
# 空提交触发部署
git commit --allow-empty -m "chore: trigger vercel rebuild"
git push
```

### 🔍 验证部署

部署完成后，访问：

- <https://xiang-travel.vercel.app/>

打开浏览器控制台，应该只看到Supabase环境变量的错误，**不应该有bem错误**。

### 📝 技术细节

我们的解决方案：

- 创建了一个自定义Rollup插件 `fixVantBemConflict`
- 在构建时将所有 `const [name, bem] = createNamespace(...)` 替换为 `var [name, bem] = createNamespace(...)`
- `var` 允许重复声明，不会报错
- 共修复了11个文件中的bem声明

### ⚠️ 如果问题仍然存在

如果清除缓存后仍有问题：

1. **检查Vercel构建日志**：
   - 查看是否有类似 `✓ Fixed X bem declarations` 的日志
   - 如果没有，说明插件未运行

2. **强制重新安装依赖**：
   在Vercel项目设置中添加环境变量：

   ```
   VERCEL_FORCE_NO_BUILD_CACHE=1
   ```

3. **检查Node版本**：
   确保Vercel使用Node 18或更高版本

### 💡 需要帮助？

如果还有问题，请提供：

- Vercel的构建日志
- 浏览器控制台的完整错误信息
- 错误发生的文件名和行号
