$filePath = "src\pages\EncyclopediaPage.tsx"
$content = Get-Content $filePath -Raw
$lines = $content -split "`r`n|`n"
for ($i = 54; $i -lt 60; $i++) {
    Write-Output "Line $($i+1): [$([int][char]($lines[$i][0]))][$([int][char]($lines[$i][1]))] $($lines[$i])"
}
