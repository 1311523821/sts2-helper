$filePath = "src\pages\EncyclopediaPage.tsx"
$content = Get-Content $filePath -Raw
$lines = $content -split "`r`n|`n"
Write-Output "Line 55: '$($lines[54])'"
Write-Output "Line 56: '$($lines[55])'"
Write-Output "Line 57: '$($lines[56])'"
Write-Output "Line 58: '$($lines[57])'"
Write-Output "Length of line 56: $($lines[55].Length)"
Write-Output "Total lines: $($lines.Length)"
