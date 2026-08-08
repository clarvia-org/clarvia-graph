# Update Lex Cloud Run processing switches without redeploying the image.
#
# Human-operated only. europe-west1 only. Never prints secret values.
param(
    [ValidateSet("disabled", "allowlist", "public")]
    [string]$ProcessingMode,
    [ValidateSet("true", "false")]
    [string]$ProcessingEnabled,
    [string]$AllowlistSenders = "",
    [string]$ProjectId = "fleet-garage-502110-g6",
    [string]$Region = "europe-west1",
    [string]$ServiceName = "lex-email-service"
)

if ($Region -ne "europe-west1") {
    Write-Error "REGION must be europe-west1 (got '$Region')."
    exit 1
}

if (-not $ProcessingMode -and -not $ProcessingEnabled -and -not $AllowlistSenders) {
    Write-Host @"
Usage:
  .\scripts\set-processing-mode.ps1 -ProcessingMode allowlist -ProcessingEnabled true -AllowlistSenders "a@x.com,b@y.com"
  .\scripts\set-processing-mode.ps1 -ProcessingEnabled false

Kill switch (no redeploy):
  .\scripts\set-processing-mode.ps1 -ProcessingEnabled false
  .\scripts\set-processing-mode.ps1 -ProcessingMode disabled
"@
    exit 1
}

$envVars = @()
if ($ProcessingMode) { $envVars += "PROCESSING_MODE=$ProcessingMode" }
if ($ProcessingEnabled) { $envVars += "PROCESSING_ENABLED=$ProcessingEnabled" }
if ($AllowlistSenders) { $envVars += "ALLOWLIST_SENDERS=$AllowlistSenders" }
$joined = $envVars -join ","

Write-Host "Updating $ServiceName env in $Region (no image rebuild)"
gcloud run services update $ServiceName `
    --project=$ProjectId `
    --region=$Region `
    --update-env-vars=$joined

Write-Host "Done."
