<?php

$path = __DIR__.'/../app/Http/Controllers/DashboardController.php';
$text = file_get_contents($path);
$pattern = '/\/\*\*\s*\* @return array\{metrics: array<string, mixed>, widgets: array<string, mixed>\}\s*\*\/\s*private function adminPayload\(School \$school\): array.*?\/\*\*\s*\* @param  Collection<int\|string, mixed>  \$counts/s';
$replacement = '/**'."\r\n".'     * @param  Collection<int|string, mixed>  $counts';

if ($text === false) {
    fwrite(STDERR, "Unable to read DashboardController.php\n");
    exit(1);
}

if (preg_match($pattern, $text) !== 1) {
    fwrite(STDERR, "Pattern not found\n");
    exit(1);
}

file_put_contents($path, preg_replace($pattern, $replacement, $text));
