<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
@foreach ($urls as $path)
    <url>
        <loc>{{ url($path) }}</loc>
        <changefreq>{{ $path === '/' ? 'weekly' : 'monthly' }}</changefreq>
    </url>
@endforeach
</urlset>
