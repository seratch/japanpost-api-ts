# Contributing Guide

## 🚀 リリースプロセス / Release Process

このプロジェクトは**semantic-release**を使用してリリースプロセスを自動化しています。  
This project uses **semantic-release** to automate the release process.

### コミットメッセージ規約 / Commit Message Convention

リリースは[Conventional Commits](https://www.conventionalcommits.org/)に基づいたコミットメッセージによって自動的に決定されます。  
Releases are automatically determined by commit messages based on [Conventional Commits](https://www.conventionalcommits.org/).

#### 形式 / Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### 主なタイプ / Main Types

- `feat`: 新機能 / New feature → **Minor version** アップ
- `fix`: バグ修正 / Bug fix → **Patch version** アップ  
- `perf`: パフォーマンス改善 / Performance improvement → **Patch version** アップ
- `docs`: ドキュメント変更 / Documentation changes → リリースなし / No release
- `style`: コードスタイル変更 / Code style changes → リリースなし / No release
- `refactor`: リファクタリング / Refactoring → リリースなし / No release
- `test`: テスト追加・修正 / Test additions/fixes → リリースなし / No release
- `chore`: その他 / Other → リリースなし / No release

#### BREAKING CHANGE

**Major version**アップには以下のいずれかが必要です:
For **Major version** bump, one of the following is required:

1. フッターに`BREAKING CHANGE: `を含める / Include `BREAKING CHANGE: ` in footer
2. タイプに`!`を追加（例：`feat!:`, `fix!:`）/ Add `!` to type (e.g., `feat!:`, `fix!:`)

#### 例 / Examples

```bash
# Patch release (0.1.0 → 0.1.1)
git commit -m "fix: resolve token refresh issue"

# Minor release (0.1.0 → 0.2.0)  
git commit -m "feat: add retry functionality"

# Major release (0.1.0 → 1.0.0)
git commit -m "feat!: change API response format

BREAKING CHANGE: Response structure has been changed"

# No release
git commit -m "docs: update README with examples"
```

### 自動リリースフロー / Automated Release Flow

1. **mainブランチにプッシュ** / Push to main branch
2. **GitHub Actions が自動実行** / GitHub Actions automatically runs:
   - テスト実行 / Run tests
   - ビルド / Build
   - semantic-release実行 / Run semantic-release
3. **semantic-releaseが自動実行** / semantic-release automatically:
   - コミットメッセージを解析 / Analyze commit messages
   - 新しいバージョン番号を決定 / Determine new version number
   - CHANGELOG.mdを更新 / Update CHANGELOG.md
   - package.jsonのバージョンを更新 / Update version in package.json
   - Gitタグを作成 / Create Git tag
   - GitHubリリースを作成 / Create GitHub release
   - npmにパッケージを公開 / Publish package to npm

### 必要な設定 / Required Setup

リポジトリの管理者は以下のGitHub Secretsを設定する必要があります:  
Repository administrators need to configure the following GitHub Secrets:

- `NPM_TOKEN`: npmへの公開用トークン / Token for npm publishing
- `JAPAN_POST_CLIENT_ID`: テスト用 / For testing
- `JAPAN_POST_SECRET_KEY`: テスト用 / For testing

### 手動リリース / Manual Release

必要に応じて、ローカルでリリースを実行することも可能です:  
If needed, you can run releases locally:

```bash
npm run semantic-release
```

## 🧪 開発ワークフロー / Development Workflow

1. **フォーク & クローン** / Fork & Clone
2. **機能ブランチを作成** / Create feature branch: `git checkout -b feature/your-feature`
3. **開発** / Develop
4. **テスト** / Test: `npm test`
5. **フォーマット** / Format: `npm run format`
6. **コミット（規約に従って）** / Commit (following convention)
7. **プルリクエスト作成** / Create pull request
8. **レビュー & マージ** / Review & merge
9. **自動リリース** / Automatic release

## 📋 その他のガイドライン / Other Guidelines

- TypeScriptの型安全性を保つ / Maintain TypeScript type safety
- 新機能にはテストを追加 / Add tests for new features
- READMEの更新が必要な場合は日英両方を更新 / Update both English and Japanese READMEs when needed
- 破壊的変更は慎重に検討 / Consider breaking changes carefully 