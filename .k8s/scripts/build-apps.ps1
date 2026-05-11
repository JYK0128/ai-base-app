$ErrorActionPreference = 'Stop'

$LogDir = '.k8s/build-logs'
$AllApps = @('auth', 'gateway', 'core', 'admin')

function Resolve-Image {
  param([string]$App)

  switch ($App) {
    { $_ -in @('auth', 'platform-auth-service') } {
      return @{
        App = 'auth'
        Image = 'platform-auth-service'
        Dockerfile = 'apps/platform-auth-service/Dockerfile'
      }
    }
    { $_ -in @('gateway', 'platform-gateway') } {
      return @{
        App = 'gateway'
        Image = 'platform-gateway'
        Dockerfile = 'apps/platform-gateway/Dockerfile'
      }
    }
    { $_ -in @('core', 'platform-core-service') } {
      return @{
        App = 'core'
        Image = 'platform-core-service'
        Dockerfile = 'apps/platform-core-service/Dockerfile'
      }
    }
    { $_ -in @('admin', 'web', 'platform-admin-web') } {
      return @{
        App = 'admin'
        Image = 'platform-admin-web'
        Dockerfile = 'web/platform-admin-web/Dockerfile'
      }
    }
    default { return $null }
  }
}

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

Write-Host '--------------------------------------------------'
Write-Host 'Building application Docker images...'
Write-Host '--------------------------------------------------'
Write-Host "Logs: $LogDir"
Write-Host ''

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$SelectedApps = if ($args.Count -eq 0) {
  Write-Host 'Select images to build:'
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

$SelectedImages = foreach ($App in $SelectedApps) {
  $Image = Resolve-Image $App
  if (-not $Image) {
    Write-Host "Unknown app: $App" -ForegroundColor Red
    Write-Host 'Available apps: all, auth, gateway, core, admin'
    exit 1
  }
  $Image
}

Write-Host 'Starting parallel builds...'
Write-Host "Targets: $(($SelectedImages | ForEach-Object { $_.Image }) -join ' ')"
Write-Host ''

$Root = (Get-Location).Path
$DockerBuildKit = if ($env:DOCKER_BUILDKIT) { $env:DOCKER_BUILDKIT } else { '1' }

$Jobs = foreach ($Target in $SelectedImages) {
  $LogFile = Join-Path $Root (Join-Path $LogDir "$($Target.Image).log")

  Start-Job -Name $Target.Image -ScriptBlock {
    param(
      [string]$Root,
      [string]$Image,
      [string]$Dockerfile,
      [string]$LogFile,
      [string]$DockerBuildKit
    )

    Set-Location $Root
    $env:DOCKER_BUILDKIT = $DockerBuildKit

    docker build --progress=plain -t "${Image}:latest" -f $Dockerfile . *> $LogFile
    if ($LASTEXITCODE -ne 0) {
      throw "docker build failed with exit code $LASTEXITCODE"
    }
  } -ArgumentList $Root, $Target.Image, $Target.Dockerfile, $LogFile, $DockerBuildKit
}

$Failed = $false

foreach ($Job in $Jobs) {
  Wait-Job $Job | Out-Null
  Receive-Job $Job -ErrorAction SilentlyContinue | Out-Null

  $LogFile = Join-Path $LogDir "$($Job.Name).log"
  if ($Job.State -eq 'Completed') {
    Write-Host "OK $($Job.Name)" -ForegroundColor Green
  }
  else {
    Write-Host "FAIL $($Job.Name) (see $LogFile)" -ForegroundColor Red
    $Failed = $true
  }

  Remove-Job $Job -Force
}

if ($Failed) {
  Write-Host ''
  Write-Host 'One or more image builds failed.' -ForegroundColor Red
  Write-Host 'Open the log file shown above for full Docker output.'
  exit 1
}

Write-Host ''
Write-Host 'All images built successfully.' -ForegroundColor Green
Write-Host '--------------------------------------------------'

$Deploy = Read-Host 'Do you want to deploy these images to Kubernetes now? (y/N)'
if ($Deploy -match '^[Yy]$') {
  Write-Host 'Deploying to Kubernetes...'
  & powershell -NoProfile -ExecutionPolicy Bypass -File .k8s/scripts/deploy-apps.ps1 @($SelectedImages | ForEach-Object { $_.App })
  exit $LASTEXITCODE
}

Write-Host 'Skipping deployment.'
Write-Host 'If you are using Docker Desktop, these images are now available to your local Kubernetes cluster.'
Write-Host "If you are using Minikube, run 'minikube image load <image_name>' or build inside the Minikube Docker environment."
