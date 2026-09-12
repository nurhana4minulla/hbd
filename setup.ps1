# Birthday Website Setup Script
# Run this once to copy the generated meme images into your project.
# Right-click this file and select "Run with PowerShell"

Write-Host "🎂 Birthday Website Setup" -ForegroundColor Magenta
Write-Host "Copying meme images..." -ForegroundColor Cyan

$artifactDir = "$env:USERPROFILE\.gemini\antigravity-ide\brain\45692150-6c81-4702-95cb-0b6a67d15d88"
$imgDir = "$PSScriptRoot\assets\images"

# Create directory if needed
if (-not (Test-Path $imgDir)) {
    New-Item -ItemType Directory -Path $imgDir -Force | Out-Null
}

# Image mapping: source filename -> destination filename
$images = @{
    "meme_1_1789220580123.png" = "meme-1.png"
    "meme_2_1789220592724.png" = "meme-2.png"
    "meme_3_1789220607965.png" = "meme-3.png"
    "meme_4_1789220627738.png" = "meme-4.png"
}

$success = 0
foreach ($src in $images.Keys) {
    $srcPath = Join-Path $artifactDir $src
    $dstPath = Join-Path $imgDir $images[$src]
    if (Test-Path $srcPath) {
        try {
            [System.IO.File]::WriteAllBytes($dstPath, [System.IO.File]::ReadAllBytes($srcPath))
            Write-Host "  ✓ Copied $($images[$src])" -ForegroundColor Green
            $success++
        } catch {
            Write-Host "  ✗ Failed to copy $($images[$src]): $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  ✗ Source not found: $srcPath" -ForegroundColor Yellow
    }
}

Write-Host ""
if ($success -eq 4) {
    Write-Host "✅ All done! Open index.html in your browser to preview the site." -ForegroundColor Green
} else {
    Write-Host "⚠️  $success/4 images copied. The site will use placeholder images for the rest." -ForegroundColor Yellow
}
Write-Host ""
Read-Host "Press Enter to close"
