$filePath = "src\pages\EncyclopediaPage.tsx"
$content = Get-Content $filePath -Raw
$lines = $content -split "`r`n|`n"
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "showFavOnly") {
        Write-Output "Line $($i+1): $($lines[$i])"
    }
}
