# Grant Lex runtime SA the project roles needed for poll/process.
# Run as Clarvia-admin (needs resourcemanager.projects.setIamPolicy).
# europe-west1 / fleet-garage-502110-g6 only. No secrets printed.

param(
    [string]$ProjectId = "fleet-garage-502110-g6",
    [string]$RuntimeSa = "lex-email@fleet-garage-502110-g6.iam.gserviceaccount.com"
)

$member = "serviceAccount:$RuntimeSa"
$roles = @(
    "roles/datastore.user",
    "roles/cloudtasks.enqueuer",
    "roles/logging.logWriter",
    "roles/secretmanager.secretAccessor"
)

foreach ($role in $roles) {
    Write-Host "Granting $role"
    gcloud projects add-iam-policy-binding $ProjectId `
        --member=$member `
        --role=$role `
        --condition=None `
        --quiet
}

# Token Creator on self: IAM Credentials signJwt for Gmail domain-wide delegation.
Write-Host "Granting roles/iam.serviceAccountTokenCreator on $RuntimeSa"
gcloud iam service-accounts add-iam-policy-binding $RuntimeSa `
    --project=$ProjectId `
    --member=$member `
    --role="roles/iam.serviceAccountTokenCreator" `
    --quiet

# serviceAccountUser (actAs) on self: Cloud Tasks OIDC tokens for /internal/*.
Write-Host "Granting roles/iam.serviceAccountUser on $RuntimeSa"
gcloud iam service-accounts add-iam-policy-binding $RuntimeSa `
    --project=$ProjectId `
    --member=$member `
    --role="roles/iam.serviceAccountUser" `
    --quiet

Write-Host "Done. Re-run Cloud Run poll smoke after this."
