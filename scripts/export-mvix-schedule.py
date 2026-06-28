#!/usr/bin/env python3
"""Export MVIX schedule 709794 into repo-managed signage assets."""

from __future__ import annotations

import base64
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
MEDIA_DIR = PUBLIC / 'signage' / 'media'
DATA_DIR = ROOT / 'data'
SCHEDULE_ID = os.environ.get('MVIX_SCHEDULE_ID', '709794')
PLAYLIST_FILE = ROOT / 'signage-playlist.json'
SNAPSHOT_FILE = DATA_DIR / f'mvix-schedule-{SCHEDULE_ID}.snapshot.json'

WEB_URL_MAP = {
    'https://firehouse-dashboards.web.app/roster': '/daily-roster',
    'https://firehouse-dashboards.web.app/daily-roster': '/daily-roster',
    'https://firehouse-dashboards.web.app/weather': '/weather',
    'https://firehouse-dashboards.web.app/analytics': '/analytics',
    'https://firehouse-dashboards.web.app/events': '/events',
    'https://firehouse-dashboards.web.app/live-document': '/live-document',
    'https://firehouse-dashboards.web.app/live-doc': '/live-document',
    'https://firehouse-dashboards.web.app/ems-expiration-dates': '/ems-expiration-dates',
    'https://firehouse-dashboards.web.app/training-schedule': '/training-schedule',
    'https://firehouse-dashboards.web.app/hydrants': '/hydrants',
    'https://firehouse-dashboards.web.app/traffic-cameras': '/traffic-cameras',
    'https://firehouse-dashboards.web.app/goodman-horn-lake-cameras': '/goodman-horn-lake-cameras',
}

CAMERA_PAGE_MAP = {
    'hwy 301 & goodman rd': '/traffic-cameras',
    'goodman rd & horn lake rd': '/goodman-horn-lake-cameras',
    'goodman rd & tulane rd': '/goodman-tulane-cameras',
    'goodman rd & hwy 51': '/goodman-hwy51-cameras',
    'goodman rd & interstate blvd': '/goodman-interstate-cameras',
}


def token() -> str:
    raw = os.environ.get('MVIX_ACCESS_TOKEN', '').strip()
    if not raw:
        sys.exit('Set MVIX_ACCESS_TOKEN to a Bearer token from cms.mvix.com')
    return raw if raw.lower().startswith('bearer ') else f'Bearer {raw}'


def api_get(path: str) -> dict:
    url = f'https://api.cms.mvix.com/api/v1/org/{path.lstrip("/")}'
    req = urllib.request.Request(url, headers={'Authorization': token(), 'Accept': 'application/json'})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())


def sniff_extension(data: bytes, fallback: str = '.bin') -> str:
    if data.startswith(b'%PDF'):
        return '.pdf'
    if data.startswith(b'\x89PNG'):
        return '.png'
    if data.startswith(b'\xff\xd8\xff'):
        return '.jpg'
    if data[:4] == b'RIFF' and data[8:12] == b'WEBP':
        return '.webp'
    if data[4:8] == b'ftyp':
        return '.mp4'
    return fallback


def download(url: str, dest: Path) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={'User-Agent': 'ForgePS-Dashboard/1.0'})
    with urllib.request.urlopen(req) as response:
        data = response.read()

    ext = sniff_extension(data, dest.suffix or '.bin')
    if dest.suffix.lower() != ext:
        dest = dest.with_suffix(ext)

    dest.write_bytes(data)
    return dest


def slugify(text: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-') or 'slot'


def parse_duration(schedule_duration: str | None, media: dict) -> int:
    for value in (schedule_duration, media.get('duration')):
        if not value:
            continue
        parts = str(value).split(':')
        if len(parts) == 3:
            hours, minutes, seconds = map(int, parts)
            total = hours * 3600 + minutes * 60 + seconds
            if total > 0:
                return total
    duration_total = media.get('durationTotal')
    if duration_total:
        return int(duration_total)
    return 30


def is_expired(expire_on: str | None) -> bool:
    if not expire_on:
        return False
    try:
        expires = datetime.fromisoformat(expire_on.replace('Z', '+00:00'))
        return expires < datetime.now(timezone.utc)
    except ValueError:
        return False


def decode_field(value: str) -> str:
    if not value:
        return ''
    try:
        return base64.b64decode(value).decode('utf-8')
    except Exception:
        return value


def normalize_camera_html(html: str) -> str:
    html = html.replace('https://cdn.jsdelivr.net/npm/hls.js@latest', 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js')
    return html


def export_camera_page(title: str, media_id: int, attrs: dict) -> str:
    content = attrs.get('content') or {}
    html = normalize_camera_html(decode_field(content.get('html') or ''))
    css = decode_field(content.get('css') or '')
    js = decode_field(content.get('js') or '')

    if css and '</head>' in html and '<style>' not in html[:1200]:
        html = html.replace('</head>', f'<style>\n{css}\n</style>\n</head>', 1)
    if js and '</body>' in html and js.strip() not in html:
        html = html.replace('</body>', f'<script>\n{js}\n</script>\n</body>', 1)

    filename = {
        'goodman rd & tulane rd': 'goodman-tulane-cameras.html',
        'goodman rd & hwy 51': 'goodman-hwy51-cameras.html',
        'goodman rd & interstate blvd': 'goodman-interstate-cameras.html',
    }.get(title.lower())

    if not filename:
        filename = f'signage-camera-{media_id}.html'

    path = ROOT / filename
    path.write_text(html, encoding='utf-8')
    return '/' + filename.replace('.html', '')


def main() -> None:
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    schedule = api_get(f'schedule/{SCHEDULE_ID}')
    snapshot = {
        'scheduleId': schedule.get('id'),
        'title': schedule.get('title'),
        'scheduleType': schedule.get('scheduleType'),
        'updatedAt': schedule.get('updatedAt'),
        'deviceList': schedule.get('deviceList'),
        'slotCount': len(schedule.get('scheduleContent') or []),
    }
    SNAPSHOT_FILE.write_text(json.dumps(snapshot, indent=2) + '\n', encoding='utf-8')

    slots = []
    for item in sorted(schedule.get('scheduleContent') or [], key=lambda row: row.get('sortOrder', 0)):
        media_id = item['playbackContentId']
        media = api_get(f'media/{media_id}')
        title = media.get('title') or f'media-{media_id}'
        feature = (media.get('feature') or {}).get('alias') or ''
        attrs = media.get('attributes') or {}
        expire_on = media.get('expireOn')

        slot = {
            'id': slugify(title),
            'title': title,
            'mvixMediaId': media_id,
            'feature': feature,
            'durationSeconds': parse_duration(item.get('duration'), media),
            'expireOn': expire_on,
            'disabled': is_expired(expire_on),
        }

        if feature == 'Web URL':
            web_url = attrs.get('web_page_url') or ''
            path = WEB_URL_MAP.get(web_url.rstrip('/'))
            if not path:
                parsed = urlparse(web_url)
                if parsed.netloc.endswith('firehouse-dashboards.web.app') and parsed.path:
                    path = parsed.path
            if path:
                slot.update({'type': 'page', 'path': path, 'sourceUrl': web_url})
            else:
                slot.update({'type': 'url', 'url': web_url})
        elif feature == 'Video':
            dest = download(media['mediaUrl'], MEDIA_DIR / f'{media_id}.mp4')
            slot.update({'type': 'video', 'path': f'/signage/media/{dest.name}'})
        elif feature == 'Image':
            original = media.get('originalName') or ''
            ext = '.' + original.rsplit('.', 1)[-1].lower() if '.' in original else '.webp'
            dest = download(media['mediaUrl'], MEDIA_DIR / f'{media_id}{ext}')
            repo_path = f'/signage/media/{dest.name}'
            slot.update({'type': 'image', 'path': repo_path})
            if dest.suffix.lower() == '.pdf':
                slot['assetType'] = 'pdf'
        elif feature == 'Canva':
            dest = download(media['mediaUrl'], MEDIA_DIR / f'{media_id}.webp')
            repo_path = f'/signage/media/{dest.name}'
            slot.update({'type': 'image', 'path': repo_path, 'canvaDesignId': attrs.get('canvaDesignId')})
            if dest.suffix.lower() == '.pdf':
                slot['assetType'] = 'pdf'
        elif feature == 'Weather Radar':
            slot.update({'type': 'page', 'path': '/weather', 'notes': 'MVIX weather radar slot'})
        elif feature == 'HTML5 Scripts':
            camera_path = CAMERA_PAGE_MAP.get(title.lower())
            if camera_path:
                export_camera_page(title, media_id, attrs)
                slot.update({'type': 'page', 'path': camera_path})
            else:
                slot.update({'type': 'page', 'path': '/traffic-cameras'})
        else:
            slot.update({'type': 'url', 'url': media.get('mediaUrl')})

        slots.append(slot)

    playlist = {
        'scheduleId': str(SCHEDULE_ID),
        'title': schedule.get('title'),
        'mvixCmsEditUrl': f'https://cms.mvix.com/org/schedule-library/list/{SCHEDULE_ID}/edit',
        'exportedAt': datetime.now(timezone.utc).isoformat(),
        'notes': 'Generated by scripts/export-mvix-schedule.py. Re-run with MVIX_ACCESS_TOKEN to refresh from CMS.',
        'stations': {
            '1': {'label': 'Station 1', 'address': '6770 Tulane Horn Lake, MS 38637', 'mvixDeviceAlias': 'Station 1'},
            '2': {'label': 'Station 2', 'address': '5711 Hwy 51 Horn Lake, MS 38637'},
            '3': {'label': 'Station 3', 'address': '6363 Hwy 301 Walls, MS 38680', 'mvixDeviceAlias': 'Station 3'},
        },
        'slots': slots,
    }

    PLAYLIST_FILE.write_text(json.dumps(playlist, indent=2) + '\n', encoding='utf-8')
    print(f'Wrote {PLAYLIST_FILE} with {len(slots)} slots')
    print(f'Wrote {SNAPSHOT_FILE}')


if __name__ == '__main__':
    main()
