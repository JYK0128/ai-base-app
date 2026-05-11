$ErrorActionPreference = 'Stop'

$AllApps = @('auth', 'core', 'gateway', 'admin')

function Convert-Selection {
  param([string[]]$Selection)

  $Apps = foreach ($Item in $Selection) {
    switch ($Item) {
      '1' { 'auth' }
      '2' { 'gateway' }
      '3' { 'core' }
      '4' { 'admin' }
      default { $Item }
    }
  }

  if ($Apps.Count -eq 1 -and $Apps[0] -eq 'all') {
    return $AllApps
  }

  return $Apps
}

function Resolve-Deployment {
  param([string]$App)

  switch ($App) {
    { $_ -in @('auth', 'platform-auth-service') } { return @{ Namespace = 'dev-api'; Deployment = 'platform-auth-service-deploy'; App = 'auth' } }
    { $_ -in @('core', 'platform-core-service') } { return @{ Namespace = 'dev-api'; Deployment = 'platform-core-service-deploy'; App = 'core' } }
    { $_ -in @('gateway', 'platform-gateway') } { return @{ Namespace = 'dev-web'; Deployment = 'platform-gateway-deploy'; App = 'gateway' } }
    { $_ -in @('admin', 'web', 'platform-admin-web') } { return @{ Namespace = 'dev-web'; Deployment = 'platform-admin-web-deploy'; App = 'admin' } }
    default { return $null }
  }
}

$SelectedApps = if ($args.Count -eq 0) {
  Write-Host 'Select apps to deploy:'
  Write-Host '  1) auth    (platform-auth-service)'
  Write-Host '  2) gateway (platform-gateway)'
  Write-Host '  3) core    (platform-core-service)'
  Write-Host '  4) admin   (platform-admin-web)'
  Write-Host ''

  $Selection = Read-Host 'Enter numbers or names separated by spaces/commas. Press [Enter] for all'
  Write-Host ''

  if ([string]::IsNullOrWhiteSpace($Selection)) {
    $AllApps
  }
  else {
    Convert-Selection ($Selection -split '[,\s]+' | Where-Object { $_ })
  }
}
else {
  Convert-Selection $args
}

$Deployments = foreach ($App in $SelectedApps) {
  $Deployment = Resolve-Deployment $App
  if (-not $Deployment) {
    Write-Host "Unknown app: $App" -ForegroundColor Red
    Write-Host 'Available apps: all, auth, gateway, core, admin'
    exit 1
  }
  $Deployment
}

Write-Host '--------------------------------------------------'
Write-Host 'Deploying application manifests...'
Write-Host '--------------------------------------------------'
Write-Host "Targets: $($Deployments.App -join ' ')"
Write-Host ''

kubectl apply -k .k8s/overlays/dev

Write-Host ''
Write-Host 'Restarting application deployments...'

foreach ($Target in $Deployments) {
  kubectl rollout restart "deployment/$($Target.Deployment)" -n $Target.Namespace
}

Write-Host ''
Write-Host 'Waiting for rollouts...'

foreach ($Target in $Deployments) {
  kubectl rollout status "deployment/$($Target.Deployment)" -n $Target.Namespace --timeout=180s
}

Write-Host ''
Write-Host 'Deployment complete.'
Write-Host '--------------------------------------------------'
