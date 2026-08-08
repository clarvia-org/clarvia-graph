"""Find unhandled tags in remaining failing laws."""

from __future__ import annotations

from collections import Counter
from pathlib import Path

from lxml import etree

AKN = "http://docs.oasis-open.org/legaldocml/ns/akn/3.0/CSD13"


def test_diag_loi2015_tags() -> None:
    law = Path("countries/lu/laws/loi-2015-03-25-n3/source.xml")
    root = etree.fromstring(law.read_bytes(), parser=etree.XMLParser(huge_tree=True, recover=True))
    body = root.xpath(f"//*[local-name()='body' and namespace-uri()='{AKN}']")[0]
    tags: Counter[str] = Counter()
    for el in body.iter():
        tags[etree.QName(el).localname] += 1
    print("top tags", tags.most_common(40))
    for t in (
        "img",
        "image",
        "formula",
        "table",
        "toc",
        "authorialNote",
        "embeddedStructure",
        "omissis",
        "eol",
        "br",
        "crossHeading",
        "hcontainer",
        "foreign",
        "subFlow",
        "tblock",
    ):
        if tags[t]:
            print(t, tags[t])
