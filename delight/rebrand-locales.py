#!/usr/bin/env python3
"""Show "Delight" instead of "Fluxer" in UI strings, in every locale.

Rewrites msgstr (falling back to msgid for untranslated/source entries) in fluxer_app's lingui catalogs.
Leaves placeholders like {exampleFluxerTagFull} alone, also catches inflected forms
(Fluxeru, Fluxerin, Fluxerの…), rewords the few English strings that describe the upstream
project's own push relay neutrally, and calls the domain-verification file "the verification
file" (its real name stays fluxer-verification because the API fetches that path). Safe to re-run.
"""
import glob, os, re

ROOT = os.path.join(os.path.dirname(__file__), '..', 'fluxer_app', 'src', 'features', 'i18n', 'locales')
# The domain-verification file must keep its real name (the API fetches /.well-known/fluxer-verification),
# so the two strings that name it describe it as "the verification file" instead. The downloaded file keeps its name.
VERIFY_SENTENCE = 'Download <0>fluxer-verification</0> and place it in your <1>.well-known</1> folder so we can validate the domain.'
VERIFY_BUTTON = 'Download fluxer-verification'
VERIFY = {  # locale: (sentence, button)
    'en': ('Download the verification file and place it in your <1>.well-known</1> folder so we can validate the domain.', 'Download verification file'),
    'ar': ('نزّل ملف التحقق وضعه في مجلد <1>.well-known</1> حتى نتمكن من التحقق من النطاق.', 'تنزيل ملف التحقق'),
    'bg': ('Изтегли файла за потвърждение и го постави в папката си <1>.well-known</1>, за да можем да потвърдим домейна.', 'Изтегляне на файла за потвърждение'),
    'cs': ('Stáhněte si ověřovací soubor a umístěte jej do složky <1>.well-known</1>, abychom mohli ověřit doménu.', 'Stáhnout ověřovací soubor'),
    'da': ('Download verifikationsfilen, og læg den i din <1>.well-known</1>-mappe, så vi kan validere domænet.', 'Download verifikationsfil'),
    'de': ('Lade die Verifizierungsdatei herunter und lege sie in deinem Ordner <1>.well-known</1> ab, damit wir die Domain überprüfen können.', 'Verifizierungsdatei herunterladen'),
    'el': ('Κατεβάστε το αρχείο επαλήθευσης και τοποθετήστε το στον φάκελο <1>.well-known</1>, ώστε να μπορούμε να επικυρώσουμε τον τομέα.', 'Λήψη αρχείου επαλήθευσης'),
    'es': ('Descarga el archivo de verificación y colócalo en tu carpeta <1>.well-known</1> para que podamos validar el dominio.', 'Descargar archivo de verificación'),
    'fi': ('Lataa vahvistustiedosto ja siirrä se <1>.well-known</1>-kansioosi, jotta voimme vahvistaa verkkotunnuksen.', 'Lataa vahvistustiedosto'),
    'fr': ('Téléchargez le fichier de vérification et placez-le dans votre dossier <1>.well-known</1> afin que nous puissions valider le domaine.', 'Télécharger le fichier de vérification'),
    'he': ('הורד את קובץ האימות והנח אותו בתיקיית <1>.well-known</1> כדי שנוכל לאמת את הדומיין.', 'הורד את קובץ האימות'),
    'hi': ('डोमेन को वैलिडेट करने के लिए सत्यापन फ़ाइल डाउनलोड करें और इसे अपने <1>.well-known</1> फ़ोल्डर में रखें।', 'सत्यापन फ़ाइल डाउनलोड करें'),
    'hr': ('Preuzmite datoteku za provjeru i smjestite je u mapu <1>.well-known</1> kako bismo mogli potvrditi domenu.', 'Preuzmi datoteku za provjeru'),
    'hu': ('Töltsd le az ellenőrző fájlt, és helyezd el a <1>.well-known</1> mappádba, hogy érvényesíteni tudjuk a domaint.', 'Ellenőrző fájl letöltése'),
    'id': ('Unduh file verifikasi dan letakkan di folder <1>.well-known</1> agar kami dapat memvalidasi domainnya.', 'Unduh file verifikasi'),
    'it': ('Scarica il file di verifica e posizionalo nella tua cartella <1>.well-known</1> per consentirci di convalidare il dominio.', 'Scarica il file di verifica'),
    'ja': ('認証ファイルをダウンロードして <1>.well-known</1> フォルダーに配置してください。ドメインの検証に使用します。', '認証ファイルをダウンロード'),
    'ko': ('도메인 유효성 검사를 위해 인증 파일을 다운로드하여 <1>.well-known</1> 폴더에 넣어주세요.', '인증 파일 다운로드'),
    'lt': ('Atsisiųskite patvirtinimo failą ir įdėkite jį į savo <1>.well-known</1> aplanką, kad galėtume patvirtinti domeną.', 'Atsisiųsti patvirtinimo failą'),
    'nl': ('Download het verificatiebestand en plaats het in je <1>.well-known</1>-map, zodat we het domein kunnen valideren.', 'Verificatiebestand downloaden'),
    'no': ('Last ned verifiseringsfilen og legg den i <1>.well-known</1>-mappen din, slik at vi kan validere domenet.', 'Last ned verifiseringsfil'),
    'pl': ('Pobierz plik weryfikacyjny i umieść go w folderze <1>.well-known</1>, abyśmy mogli zweryfikować domenę.', 'Pobierz plik weryfikacyjny'),
    'pt': ('Baixe o arquivo de verificação e coloque-o na sua pasta <1>.well-known</1> para que possamos validar o domínio.', 'Baixar arquivo de verificação'),
    'ro': ('Descarcă fișierul de verificare și plasează-l în folderul tău <1>.well-known</1> pentru a putea valida domeniul.', 'Descarcă fișierul de verificare'),
    'ru': ('Скачайте файл подтверждения и поместите его в папку <1>.well-known</1>, чтобы мы могли подтвердить домен.', 'Скачать файл подтверждения'),
    'sv': ('Ladda ner verifieringsfilen och placera den i din <1>.well-known</1>-mapp så att vi kan validera domänen.', 'Ladda ner verifieringsfil'),
    'th': ('ดาวน์โหลดไฟล์ยืนยัน แล้ววางในโฟลเดอร์ <1>.well-known</1> ของคุณ เพื่อให้เราตรวจสอบยืนยันโดเมนได้', 'ดาวน์โหลดไฟล์ยืนยัน'),
    'tr': ('Doğrulama dosyasını indirin ve alan adını doğrulayabilmemiz için <1>.well-known</1> klasörünüze yerleştirin.', 'Doğrulama dosyasını indir'),
    'uk': ('Завантажте файл підтвердження та помістіть його до папки <1>.well-known</1>, щоб ми могли перевірити домен.', 'Завантажити файл підтвердження'),
    'vi': ('Tải xuống tệp xác minh và đặt vào thư mục <1>.well-known</1> để chúng tôi có thể xác minh tên miền.', 'Tải xuống tệp xác minh'),
    'zh-CN': ('请下载验证文件并放到你的 <1>.well-known</1> 文件夹中，以便我们验证域名。', '下载验证文件'),
    'zh-TW': ('請下載驗證檔案並將其放置在您的 <1>.well-known</1> 資料夾中，以便我們驗證網域。', '下載驗證檔案'),
}


def verify_text(locale, msgid):
    pair = VERIFY.get(locale) or VERIFY.get(locale.split('-')[0]) or VERIFY['en']
    return pair[0] if msgid == VERIFY_SENTENCE else pair[1]


# Every "Fluxer" outside {placeholders}, including inflected forms (Fluxeru, Fluxerin, Fluxerの…).
WORD = re.compile(r'Fluxer')


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
    locale = os.path.basename(os.path.dirname(path))
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
        if msgid in (VERIFY_SENTENCE, VERIFY_BUTTON):
            end = i_str + 1
            while end < len(lines) and lines[end].startswith('"'):
                end += 1
            new = verify_text(locale, msgid)
            if unq(lines[i_str:end]) != new:
                lines[i_str:end] = ['msgstr "' + q(new) + '"']
                blocks[bi] = '\n'.join(lines)
                changed += 1
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
