#!/usr/bin/env python3
"""Show "Delight" instead of "Fluxer" in UI strings, in every locale.

Rewrites msgstr (falling back to msgid for untranslated/source entries) in fluxer_app's lingui catalogs.
Leaves placeholders like {exampleFluxerTagFull} alone, and skips strings that refer to Fluxer the company's own
services (push relay, official apps, fluxer.app links), where swapping the name would be untrue. Safe to re-run.
"""
import glob, os, re

ROOT = os.path.join(os.path.dirname(__file__), '..', 'fluxer_app', 'src', 'features', 'i18n', 'locales')
SKIP = re.compile(r'push relay|official Fluxer|Fluxer Platform|fluxer\.app|Fluxer\'s push|Fluxer’s push', re.I)
WORD = re.compile(r'(?<![\w{])Fluxer(?![\w}])')


def swap(text):
    # don't touch inside {placeholders}
    parts = re.split(r'(\{[^}]*\})', text)
    return ''.join(p if p.startswith('{') else WORD.sub('Delight', p) for p in parts)




def unq(lines):
    return ''.join(re.match(r'^(?:msgid|msgstr)?\s*"(.*)"\s*$', l).group(1) for l in lines).encode('raw_unicode_escape').decode('unicode_escape') if lines else ''


def q(text):
    return text.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n').replace('\t', '\\t')


total = 0
for path in sorted(glob.glob(os.path.join(ROOT, '*', 'messages.po'))):
    blocks = open(path, encoding='utf-8').read().split('\n\n')
    changed = 0
    for bi, block in enumerate(blocks):
        lines = block.split('\n')
        try:
            i_id = next(i for i, l in enumerate(lines) if l.startswith('msgid '))
            i_str = next(i for i, l in enumerate(lines) if l.startswith('msgstr '))
        except StopIteration:
            continue
        if any(l.startswith('msgid_plural') or l.startswith('msgctxt') for l in lines):
            continue
        msgid = unq(lines[i_id:i_str])
        if 'Fluxer' not in msgid or SKIP.search(msgid):
            continue
        end = i_str + 1
        while end < len(lines) and lines[end].startswith('"'):
            end += 1
        msgstr = unq(lines[i_str:end])
        new = swap(msgstr or msgid)
        if new != msgstr:
            lines[i_str:end] = ['msgstr "' + q(new) + '"']
            blocks[bi] = '\n'.join(lines)
            changed += 1
    if changed:
        open(path, 'w', encoding='utf-8').write('\n\n'.join(blocks))
        total += changed
print('rebranded', total, 'strings')
