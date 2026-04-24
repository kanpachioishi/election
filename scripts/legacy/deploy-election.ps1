param(
  [ValidateSet('status', 'deploy')]
  [string]$Mode = 'status',

  [string]$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path,

  [string]$CommitMessage = 'chore: deploy election updates'
)

$ErrorActionPreference = 'Stop'

function Assert-Workspace {
  param(
    [string]$Root
  )

  if (-not (Test-Path $Root)) {
    throw "Workspace root not found: $Root"
  }

  if (-not (Test-Path (Join-Path $Root '.git'))) {
    throw "Git repository not found under: $Root"
  }
}

function Invoke-WorkspaceCommand {
  param(
    [string]$Root,
    [string]$Command,
    [string[]]$Arguments
  )

  Push-Location $Root
  try {
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
      throw "Command failed: $Command $($Arguments -join ' ')"
    }
  } finally {
    Pop-Location
  }
}

function Get-RepoStatus {
  param(
    [string]$Root
  )

  Push-Location $Root
  try {
    $statusLines = git status --short
    if ($LASTEXITCODE -ne 0) {
      throw 'Failed to read git status.'
    }

    return @($statusLines)
  } finally {
    Pop-Location
  }
}

function Get-CurrentBranch {
  param(
    [string]$Root
  )

  Push-Location $Root
  try {
    $branch = git branch --show-current
    if ($LASTEXITCODE -ne 0) {
      throw 'Failed to read current branch.'
    }

    return ($branch | Select-Object -First 1)
  } finally {
    Pop-Location
  }
}

Assert-Workspace -Root $WorkspaceRoot

if ($Mode -eq 'status') {
  $branch = Get-CurrentBranch -Root $WorkspaceRoot
  $statusLines = Get-RepoStatus -Root $WorkspaceRoot

  Write-Output "Branch: $branch"
  Write-Output ''
  if ($statusLines.Count -eq 0) {
    Write-Output 'Working tree is clean.'
  } else {
    Write-Output 'Working tree changes:'
    $statusLines | ForEach-Object { Write-Output $_ }
  }

  exit 0
}

Invoke-WorkspaceCommand -Root $WorkspaceRoot -Command 'node' -Arguments @('.\scripts\validate-data-v1.mjs')
Invoke-WorkspaceCommand -Root $WorkspaceRoot -Command 'node' -Arguments @('.\scripts\generate-site-data.mjs')

$statusBeforeStage = Get-RepoStatus -Root $WorkspaceRoot
if ($statusBeforeStage.Count -eq 0) {
  Write-Output 'No deployable changes found.'
  exit 0
}

Invoke-WorkspaceCommand -Root $WorkspaceRoot -Command 'git' -Arguments @('add', '.')
Invoke-WorkspaceCommand -Root $WorkspaceRoot -Command 'git' -Arguments @('commit', '-m', $CommitMessage)
Invoke-WorkspaceCommand -Root $WorkspaceRoot -Command 'git' -Arguments @('push', 'origin', 'main')

Write-Output 'Deploy completed.'
