#!/usr/bin/env python3
"""Creates the Delight community server on a fresh instance (idempotent: skips if a guild named Delight exists)."""
import base64, json, sys, time, urllib.request

BASE = 'http://localhost:3131/api/v1'
TOKEN = open('/tmp/fx-demo-token').read().strip()


def api(method, path, body=None):
    for _ in range(20):
        req = urllib.request.Request(BASE + path, method=method, data=json.dumps(body).encode() if body is not None else None)
        req.add_header('Authorization', TOKEN)
        req.add_header('Origin', 'http://localhost:3131')
        req.add_header('content-type', 'application/json')
        try:
            with urllib.request.urlopen(req) as r:
                raw = r.read()
                return json.loads(raw) if raw else None
        except urllib.error.HTTPError as e:
            text = e.read().decode()
            if e.code == 429:
                wait = 2.0
                try:
                    wait = float(json.loads(text).get('retry_after', 2)) + 0.3
                except Exception:
                    pass
                time.sleep(min(wait, 30))
                continue
            print(method, path, e.code, text[:400], file=sys.stderr)
            raise
    raise RuntimeError('rate limited too long: ' + path)


P = dict(VIEW=1 << 10, SEND=1 << 11, REACT=1 << 6, HISTORY=1 << 16, THREADS=0)
EVERYONE_READONLY_DENY = str(P['SEND'])

existing = [g for g in api('GET', '/users/@me/guilds') if g['name'] == 'Delight']
if existing:
    gid = existing[0]['id']
    print('resuming guild', gid)
else:
    icon = 'data:image/png;base64,' + base64.b64encode(open('/Users/ziad/delight-fluxer/delight/icon.png', 'rb').read()).decode()
    gid = api('POST', '/guilds', {'name': 'Delight', 'icon': icon, 'empty_features': False})['id']
    print('guild', gid)
    # Remove the default channels so the layout below is the whole server.
    for c in api('GET', f'/guilds/{gid}/channels'):
        api('DELETE', f"/channels/{c['id']}")

ROLES = {r['name']: r for r in api('GET', f'/guilds/{gid}/roles')}
CHANNELS = {(c['name'], c.get('parent_id')): c for c in api('GET', f'/guilds/{gid}/channels')}


def role(body):
    if body['name'] in ROLES:
        return ROLES[body['name']]
    r = api('POST', f'/guilds/{gid}/roles', body)
    ROLES[body['name']] = r
    return r


def channel(body):
    key = (body['name'], body.get('parent_id'))
    if key in CHANNELS:
        return CHANNELS[key], False
    c = api('POST', f'/guilds/{gid}/channels', body)
    CHANNELS[key] = c
    return c, True

everyone = gid  # @everyone role id == guild id

# Roles (created bottom-up; later ones end up higher).
member = role({'name': 'Member', 'color': 0xCFCFCF, 'hoist': False, 'mentionable': False})
mod_perms = (1 << 1) | (1 << 2) | (1 << 13) | (1 << 22) | (1 << 23) | (1 << 24) | (1 << 27) | (1 << 40) | (1 << 51) | (1 << 7)
mod = role({'name': 'Moderator', 'color': 0x9A6BC9, 'hoist': True, 'mentionable': True, 'permissions': str(mod_perms)})
admin = role({'name': 'Admin', 'color': 0x7F49B4, 'hoist': True, 'mentionable': True, 'permissions': str(1 << 3)})

me = api('GET', '/users/@me')
api('PUT', f"/guilds/{gid}/members/{me['id']}/roles/{admin['id']}")


def ch(name, type_, parent=None, topic=None, readonly=False):
    body = {'name': name, 'type': type_}
    if parent:
        body['parent_id'] = parent
    if topic:
        body['topic'] = topic
    if readonly:
        body['permission_overwrites'] = [{'id': everyone, 'type': 0, 'allow': '0', 'deny': EVERYONE_READONLY_DENY}]
    c, created = channel(body)
    c['_new'] = created
    return c


TEXT, VOICE, CAT, ANN = 0, 2, 4, 5
info = ch('Information', CAT)
welcome = ch('welcome', TEXT, info['id'], 'Start here.', readonly=True)
rules = ch('rules', TEXT, info['id'], 'Read before posting.', readonly=True)
try:
    news = ch('announcements', ANN, info['id'], 'News about Delight.', readonly=True)
except Exception:
    news = ch('announcements', TEXT, info['id'], 'News about Delight.', readonly=True)

community = ch('Community', CAT)
general = ch('general', TEXT, community['id'], 'Talk about anything.')
ch('introductions', TEXT, community['id'], 'Say hi and tell us about yourself.')
ch('media', TEXT, community['id'], 'Screenshots, clips, art.')
ch('off-topic', TEXT, community['id'], 'Everything else.')

product = ch('Delight', CAT)
ch('feedback', TEXT, product['id'], 'What should we change?')
ch('ideas', TEXT, product['id'], 'Features you want.')
ch('bug-reports', TEXT, product['id'], 'Something broken? Steps, screenshots, what you expected.')

voice = ch('Voice', CAT)
ch('Lounge', VOICE, voice['id'])
ch('Gaming', VOICE, voice['id'])
ch('Music', VOICE, voice['id'])

staff, _ = channel({
    'name': 'Staff', 'type': CAT,
    'permission_overwrites': [
        {'id': everyone, 'type': 0, 'allow': '0', 'deny': str(P['VIEW'])},
        {'id': mod['id'], 'type': 0, 'allow': str(P['VIEW']), 'deny': '0'},
        {'id': admin['id'], 'type': 0, 'allow': str(P['VIEW']), 'deny': '0'},
    ],
})
for n in ('staff-chat', 'mod-log'):
    channel({'name': n, 'type': TEXT, 'parent_id': staff['id'], 'permission_overwrites': staff.get('permission_overwrites', [])})

api('PATCH', f'/guilds/{gid}', {'system_channel_id': general['id'], 'description': 'The official Delight community.'})

if not api('GET', f"/channels/{welcome['id']}/messages?limit=1"): api('POST', f"/channels/{welcome['id']}/messages", {'content': (
    '# Welcome to Delight\n'
    'This is the official community for Delight.\n\n'
    f"- Read <#{rules['id']}> first\n"
    f"- Say hi in <#{general['id']}>\n"
    '- Found a bug or have an idea? Post it in the Delight category.\n\n'
    'Have fun.'
)})
if not api('GET', f"/channels/{rules['id']}/messages?limit=1"): api('POST', f"/channels/{rules['id']}/messages", {'content': (
    '# Rules\n'
    '1. Be respectful. No harassment, hate speech or threats.\n'
    '2. No spam, scams or unsolicited advertising.\n'
    '3. Keep content safe for work outside channels marked otherwise.\n'
    '4. No sharing other people\'s private information.\n'
    '5. Use the right channel for the topic.\n'
    '6. Follow moderator instructions. Appeals go to a Moderator or Admin by DM.\n\n'
    'Breaking these can get you muted, kicked or banned.'
)})
if not api('GET', f"/channels/{news['id']}/messages?limit=1"): api('POST', f"/channels/{news['id']}/messages", {'content': 'Delight is live. Welcome, everyone.'})

inv = api('POST', f"/channels/{general['id']}/invites", {'max_age': 0, 'max_uses': 0})
print(json.dumps({'guild_id': gid, 'general': general['id'], 'invite': inv.get('code')}))
