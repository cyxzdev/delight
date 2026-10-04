#!/usr/bin/env python3
"""Show "Delight" instead of "Fluxer" in UI strings, in every locale.

Rewrites msgstr (falling back to msgid for untranslated/source entries) in fluxer_app's lingui catalogs.
Leaves placeholders like {exampleFluxerTagFull} alone, and rewords the few
that describe the upstream project's own push relay neutrally. Safe to re-run.
"""
import glob, os, re

ROOT = os.path.join(os.path.dirname(__file__), '..', 'fluxer_app', 'src', 'features', 'i18n', 'locales')
SKIP = re.compile(r'fluxer-verification', re.I)  # a real file name the server checks
WORD = re.compile(r'(?<![\w{])Fluxer(?![\w}])')


NEUTRAL = [
    (re.compile(r"Fluxer(?:'|’)s push relay"), 'the hosted push relay'),
    (re.compile(r'official Fluxer '), 'official '),
]


def swap(text):
    # don't touch inside {placeholders}
    parts = re.split(r'(\{[^}]*\})', text)
    out = []
    for p in parts:
        if not p.startswith('{'):
            for rx, rep in NEUTRAL:
                p = rx.sub(rep, p)
            p = WORD.sub('Delight', p)
        out.append(p)
    return ''.join(out)




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
        if SKIP.search(msgid):
            continue
        if 'Fluxer' not in msgid and 'Fluxer' not in unq(lines[i_str:i_str + 1] + [l for l in lines[i_str + 1:] if l.startswith('"')]):
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
