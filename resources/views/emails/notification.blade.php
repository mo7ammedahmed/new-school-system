<!doctype html>
<html lang="{{ $locale }}" dir="{{ $locale === 'ar' ? 'rtl' : 'ltr' }}">
<head><meta charset="utf-8"><title>{{ $title }}</title></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#222;max-width:680px;margin:32px auto;padding:0 20px">
    <h1>{{ $title }}</h1>
    <p style="white-space:pre-wrap">{{ $body }}</p>
    <p style="color:#666;font-size:12px">{{ config('app.name') }}</p>
</body>
</html>
