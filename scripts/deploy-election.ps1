param(
  [ValidateSet('status', 'deploy')]
  [string]$Mode = 'status',

  [string]$WorkspaceRoot = '',

  [string]$CommitMessage = 'chore: deploy election updates'
)

$LegacyScript = Join-Path $PSScriptRoot 'legacy\deploy-election.ps1'

if (-not $WorkspaceRoot) {
  & $LegacyScript -Mode $Mode -CommitMessage $CommitMessage
} else {
  & $LegacyScript -Mode $Mode -WorkspaceRoot $WorkspaceRoot -CommitMessage $CommitMessage
}

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
