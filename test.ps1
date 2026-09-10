 $line = Select-String -Path ".env.local" -Pattern "^INDEXNOW_WEBHOOK_SECRET="
if (-not $line) { Write-Host "Secret nahi mila! Pehle env check karo." -ForegroundColor Red; exit }
 $secret = $line.Line.Split("=", 2)[1].Trim()
Write-Host "Secret mila! Test chal raha hai..." -ForegroundColor Cyan
try {
  $res = Invoke-RestMethod -Uri "https://livinginwest.com/api/indexnow" -Method Post -ContentType "application/json" -Headers @{"x-webhook-secret"=$secret} -Body '{"urls":["/"]}'
  Write-Host "SUCCESS!" -ForegroundColor Green
  $res | ConvertTo-Json
} catch {
  Write-Host "FAIL HUA!" -ForegroundColor Red
  Write-Host $($_.Exception.Message)
  if ($_.Exception.Response) { Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" }
}
