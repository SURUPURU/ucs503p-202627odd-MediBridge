$ErrorActionPreference = 'Stop'
$base = 'C:\Users\surya\Desktop\ucs503p-202627odd-MediBridge\project-report-final'
$htmlPath = Join-Path $base 'MediBridge_Final_Report.html'
$docxPath = Join-Path $base 'MediBridge_Final_Report.docx'
$pdfPath = Join-Path $base 'MediBridge_Final_Report.pdf'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$document = $null
try {
    $document = $word.Documents.Open($htmlPath)
    $document.SaveAs2($docxPath, 16)
    $document.ExportAsFixedFormat($pdfPath, 17)
}
finally {
    if ($null -ne $document) { $document.Close(0) }
    $word.Quit()
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($word)
}
