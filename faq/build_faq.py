"""Build the FAQ section of index.html from the AI4DigiT knowledge base (wiki).

    python3 faq/build_faq.py

Source: faq/faq_source.json, exported from the wiki (tiddlers tagged FAQ, with the
Albanian versions from lib/faq-sq.js). The section is written between the
<!-- FAQ:START --> and <!-- FAQ:END --> markers in index.html, so the script can
be re-run whenever the FAQ changes in the wiki.

Website adaptations of the wiki text: wiki links become plain text or in-page
links, service codes (S01...) are dropped from names, the paragraph about the
wiki itself is left out, and the privacy notice points to privacy.html.
"""
import html
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.join(HERE, "..", "index.html")

# Display order on the website (by English title).
ORDER = [
    "Who can use AI4DigiT services?",
    "Which services does AI4DigiT provide?",
    "Do the services cost anything?",
    "Does AI4DigiT give me money?",
    "How do I start working with AI4DigiT?",
    "What is DMAT and why does it come first?",
    "What is the difference between the AI Act and the GDPR assessment?",
    "Can public institutions use the services?",
    "Are services delivered in person or online?",
    "In which language are the services delivered?",
    "Do I get a certificate for the training courses?",
    "What data does AI4DigiT collect about my organisation, and how is it protected?",
    "How is AI4DigiT funded?",
]


# Website versions of answers whose wiki tables do not read well on the page
# (narrow screens, accordion). Short paragraphs instead; same content.
OVERRIDE = {
    "What is the difference between the AI Act and the GDPR assessment?": {
        "en": (
            "They cover different regulations and different risks, and are often delivered together.\n\n"
            "The ''AI Act assessment'' looks at the AI systems you use: which ones you have, how risky each one is "
            "under Regulation (EU) 2024/1689, and what obligations follow for each system.\n\n"
            "The ''GDPR assessment'' looks at the personal data you process: whose data you hold and on what legal "
            "basis, under the GDPR and the aligned Albanian framework. It ends with a record of processing and a "
            "remediation plan.\n\n"
            "The overlap is substantial: most AI systems process personal data, so an AI deployment usually triggers "
            "both sets of obligations. AI4DigiT therefore uses a single combined Albanian-language assessment covering "
            "both. In neither case does AI4DigiT act as a certification body or a supervisory authority: the result "
            "is expert advice, not a compliance certificate."),
        "sq": (
            "Ato mbulojnë rregullore dhe rreziqe të ndryshme, dhe shpesh ofrohen së bashku.\n\n"
            "''Vlerësimi për AI Act'' shqyrton sistemet e IA-së që përdorni: cilat janë, sa i rrezikshëm është secili "
            "sipas Rregullores (BE) 2024/1689 dhe çfarë detyrimesh rrjedhin për secilin sistem.\n\n"
            "''Vlerësimi për GDPR'' shqyrton të dhënat personale që përpunoni: të kujt janë të dhënat që mbani dhe mbi "
            "çfarë baze ligjore, sipas GDPR-së dhe kornizës shqiptare të përafruar. Rezultati është një regjistër "
            "përpunimi dhe një plan veprimi.\n\n"
            "Mbivendosja është e konsiderueshme: shumica e sistemeve të IA-së përpunojnë të dhëna personale, ndaj një "
            "vendosje e IA-së zakonisht aktivizon të dyja grupet e detyrimeve. Prandaj AI4DigiT përdor një instrument "
            "të vetëm vlerësimi në shqip që mbulon të dyja. Në asnjë rast AI4DigiT nuk vepron si organ certifikimi apo "
            "autoritet mbikëqyrës: rezultati është këshillë eksperti, jo një certifikatë pajtueshmërie."),
    },
    "How is AI4DigiT funded?": {
        "en": (
            "AI4DigiT (Artificial Intelligence for DIGItal Transformation in Albania Innovation Hub) is a European "
            "Digital Innovation Hub co-funded by the European Union through the Digital Europe Programme, under the call "
            "DIGITAL-2025-EDIH-AC-08 (project number 101268847). The project runs for three years.\n\n"
            "Because delivery is grant-funded, all services are free to beneficiaries for the project's duration. "
            "Sustaining the Hub beyond the grant period is an explicit objective for year three."),
        "sq": (
            "AI4DigiT (Artificial Intelligence for DIGItal Transformation in Albania Innovation Hub) është një Qendër "
            "Evropiane e Inovacionit Digjital, e bashkëfinancuar nga Bashkimi Evropian përmes Programit Digital Europe, "
            "në kuadër të thirrjes DIGITAL-2025-EDIH-AC-08 (numri i projektit 101268847). Projekti zgjat tre vjet.\n\n"
            "Meqë ofrimi financohet nga granti, të gjitha shërbimet janë pa pagesë për përfituesit gjatë kohëzgjatjes "
            "së projektit. Qëndrueshmëria e Qendrës përtej periudhës së grantit është një objektiv i qartë për vitin e tretë."),
    },
}


def slug(title):
    return "faq-" + re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")[:48]


SLUGS = {t: slug(t) for t in ORDER}


def drop_wiki_paragraph(text):
    # The wiki explains its own language; not relevant on the website.
    paras = re.split(r"\n\s*\n", text.strip())
    keep = [p for p in paras if not re.search(r"\bwiki\b", p, re.I)]
    return "\n\n".join(keep)


def inline(s, lang):
    s = html.escape(s, quote=False)
    s = s.replace("~", "")                                   # TiddlyWiki no-link marker
    s = re.sub(r"''(.+?)''", r"<strong>\1</strong>", s)
    s = re.sub(r"//(.+?)//", r"<em>\1</em>", s)

    def link(m):
        target = m.group(1)
        if target in SLUGS:                                    # another FAQ question
            return f'<a href="#{SLUGS[target]}{"" if lang == "sq" else "-en"}">{target}</a>'
        if target == "Services":
            return f'<a href="#services">{"shërbimet" if lang == "sq" else "Services"}</a>'
        return re.sub(r"^S\d{2}\s+", "", target)               # a service page: plain name
    s = re.sub(r"\[\[([^\]|]+)\]\]", link, s)
    # Privacy notice: the website page is privacy.html
    s = re.sub(r"(?:https?://)?(?:www\.)?ai4digit\.eu/privacy(?:\.html)?",
               '<a href="privacy.html">ai4digit.eu/privacy</a>', s)
    s = re.sub(r"(?<![\w@/])info@ai4digit\.eu", '<a href="mailto:info@ai4digit.eu">info@ai4digit.eu</a>', s)
    return s


def block(text, lang):
    """TiddlyWiki markup (paragraphs, * and # lists, !! headings, |tables|) to HTML."""
    out, lines, i = [], drop_wiki_paragraph(text).split("\n"), 0
    while i < len(lines):
        ln = lines[i].rstrip()
        if not ln.strip():
            i += 1
            continue
        if ln.startswith("!"):
            out.append(f"<h4>{inline(ln.lstrip('!').strip(), lang)}</h4>")
            i += 1
        elif ln.startswith(("* ", "# ")):
            tag = "ul" if ln.startswith("*") else "ol"
            items = []
            while i < len(lines) and lines[i].startswith(("* ", "# ")):
                items.append(f"<li>{inline(lines[i][2:].strip(), lang)}</li>")
                i += 1
            out.append(f"<{tag}>{''.join(items)}</{tag}>")
        elif ln.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = lines[i].strip().strip("|").split("|")
                rows.append("<tr>" + "".join(
                    f"<th>{inline(c[1:].strip(), lang)}</th>" if c.startswith("!")
                    else f"<td>{inline(c.strip(), lang)}</td>" for c in cells) + "</tr>")
                i += 1
            out.append('<div class="faq-table"><table>' + "".join(rows) + "</table></div>")
        else:
            para = [ln.strip()]
            i += 1
            while i < len(lines) and lines[i].strip() and not lines[i].startswith(("* ", "# ", "|", "!")):
                para.append(lines[i].strip())
                i += 1
            out.append(f"<p>{inline(' '.join(para), lang)}</p>")
    return "\n".join(out)


def main():
    src = json.load(open(os.path.join(HERE, "faq_source.json"), encoding="utf-8"))
    en = {e["title"]: e["text"] for e in src["en"]}
    sq = {e["en"].strip(): e for e in src["sq"]}
    missing = [t for t in ORDER if t not in en or t not in sq]
    assert not missing, f"missing in source: {missing}"

    lists, ld = {}, []
    for lang in ("sq", "en"):
        items = []
        for t in ORDER:
            q = sq[t]["q"] if lang == "sq" else t
            src_text = OVERRIDE.get(t, {}).get(lang) or (sq[t]["a"] if lang == "sq" else en[t])
            a = block(src_text, lang)
            items.append(f'<details class="faq-item" id="{SLUGS[t]}{"" if lang == "sq" else "-en"}">'
                         f'<summary>{html.escape(q)}</summary><div class="faq-answer">{a}</div></details>')
            if lang == "sq":
                plain = re.sub(r"<[^>]+>", " ", a)
                ld.append({"@type": "Question", "name": q,
                           "acceptedAnswer": {"@type": "Answer", "text": re.sub(r"\s+", " ", plain).strip()}})
        lists[lang] = "\n".join(items)

    section = f'''<!-- FAQ:START (generated by faq/build_faq.py from the AI4DigiT knowledge base; do not edit by hand) -->
    <section id="faq">
      <div class="container">
        <p class="eyebrow" data-i18n="faq.eyebrow">Pyetje të shpeshta</p>
        <h2 data-i18n="faq.title">Pyetjet më të shpeshta për AI4DigiT</h2>
        <p class="lead" data-i18n="faq.lead">Përgjigje të shkurtra për pyetjet që na bëjnë më shpesh NVM-të dhe institucionet publike. Nuk e gjeni përgjigjen? Na shkruani në <a href="mailto:info@ai4digit.eu">info@ai4digit.eu</a>.</p>
        <div class="faq-list" data-faq-lang="sq">
{lists["sq"]}
        </div>
        <div class="faq-list" data-faq-lang="en" hidden>
{lists["en"]}
        </div>
      </div>
      <script type="application/ld+json">{json.dumps({"@context": "https://schema.org", "@type": "FAQPage", "inLanguage": "sq", "mainEntity": ld}, ensure_ascii=False)}</script>
    </section>
    <!-- FAQ:END -->'''

    page = open(INDEX, encoding="utf-8").read()
    if "<!-- FAQ:START" in page:
        page = re.sub(r"<!-- FAQ:START.*?<!-- FAQ:END -->", lambda m: section, page, flags=re.S)
    else:
        anchor = "    <!-- ================= CONTACT ================= -->"
        assert anchor in page, "contact anchor not found"
        page = page.replace(anchor, "    " + section + "\n\n" + anchor, 1)
    open(INDEX, "w", encoding="utf-8").write(page)
    print(f"FAQ section written: {len(ORDER)} questions x 2 languages")


if __name__ == "__main__":
    main()
