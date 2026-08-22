#!/usr/bin/env python3
"""Contrôle de cohérence de la version freemium."""
import os, re, sys, glob
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = os.path.join(ROOT, "freemium")
VOID = {"area","base","br","col","embed","hr","img","input","link","meta",
        "param","source","track","wbr"}
FREE = {"fondamentaux":3,"chat":3,"prompting":3,"cowork":3,
        "claude-code":3,"api":3,"integrations":2,"bonnes-pratiques":3}
TOTAL = {"fondamentaux":9,"chat":9,"prompting":9,"cowork":9,
         "claude-code":10,"api":10,"integrations":8,"bonnes-pratiques":8}
errors, warns = [], []

class B(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True); self.st=[]; self.pb=[]
    def handle_starttag(self,t,a):
        if t not in VOID: self.st.append((t,self.getpos()[0]))
    def handle_endtag(self,t):
        if t in VOID: return
        if not self.st: self.pb.append(f"</{t}> sans ouverture l.{self.getpos()[0]}"); return
        if self.st[-1][0]==t: self.st.pop(); return
        for i in range(len(self.st)-1,-1,-1):
            if self.st[i][0]==t:
                self.pb.append(f"</{t}> l.{self.getpos()[0]} : non fermés {[x for x,_ in self.st[i+1:]]}")
                del self.st[i:]; return
        self.pb.append(f"</{t}> orphelin l.{self.getpos()[0]}")

def check(path):
    n = os.path.basename(path)[:-5]
    s = open(path, encoding="utf-8").read()
    E = lambda m: errors.append(f"{n}: {m}")
    W = lambda m: warns.append(f"{n}: {m}")

    b = B(); b.feed(s)
    for p in b.pb: E("HTML " + p)
    if b.st: E(f"HTML non fermé : {[t for t,_ in b.st]}")

    for needle, lab in [("data-plan-pill","pastille de formule"),
                        ("demo-banner","bandeau de démonstration"),
                        ("assets/js/app.js","script"), ("assets/css/style.css","style"),
                        ('lang="fr"','lang=fr')]:
        if needle not in s: E(f"manque {lab}")

    # la mention de démonstration doit être présente partout
    if "émonstration" not in s: E("aucune mention de démonstration")

    if n in FREE:
        les = re.findall(r'<section class="lesson"([^>]*)>', s)
        if len(les) != TOTAL[n]: E(f"{len(les)} leçons au lieu de {TOTAL[n]}")
        free = sum(1 for a in les if 'data-level="debutant"' in a)
        if free != FREE[n]: E(f"{free} leçons gratuites au lieu de {FREE[n]}")
        locked = len(re.findall(r'<section class="lesson-locked"', s))
        if locked != TOTAL[n] - FREE[n]:
            E(f"{locked} cartes verrouillées au lieu de {TOTAL[n]-FREE[n]}")
        # chaque carte verrouillée cible une leçon existante
        for slug in re.findall(r'data-locked-for="([^"]+)"', s):
            if f'data-lesson="{slug}"' not in s:
                E(f"carte verrouillée orpheline : {slug}")
        # chaque carte a un aperçu non vide
        for m in re.finditer(r'<div class="locked-teaser">(.*?)</div>', s, re.S):
            txt = re.sub(r'<[^>]+>','',m.group(1)).strip()
            if len(txt) < 40: E(f"aperçu trop court sur une carte verrouillée ({len(txt)} car.)")
        # corrigés
        prem = len(re.findall(r'<details class="solution" data-premium hidden>', s))
        lock = len(re.findall(r'class="solution-locked"', s))
        if prem != 3: E(f"{prem} corrigés premium au lieu de 3")
        if lock != 3: E(f"{lock} corrigés verrouillés au lieu de 3")
        if 'data-value-teaser' not in s: E("manque le compteur de valeur")
        if 'data-upsell-bar' not in s: E("manque la barre d'incitation")

    # liens internes — hors blocs <script>, où les href sont construits en JS
    base = os.path.dirname(path)
    markup = re.sub(r'<script\b.*?</script>', '', s, flags=re.S)
    for h in set(re.findall(r'(?:href|src)="([^"#:]+\.(?:html|css|js))"', markup)):
        if not os.path.exists(os.path.normpath(os.path.join(base, h))):
            E(f"lien cassé -> {h}")

    # aucun lien vers un vrai paiement
    for u in set(re.findall(r'href="(https?://[^"]+)"', markup)):
        host = re.sub(r'^https?://','',u).split('/')[0]
        if any(x in host for x in ("stripe","paypal","gumroad","lemonsqueezy")):
            E(f"lien de paiement réel détecté : {host}")

for p in sorted(glob.glob(f"{F}/*.html")) + sorted(glob.glob(f"{F}/pages/*.html")):
    check(p)

print("\n" + "="*64)
if errors:
    print(f"❌ {len(errors)} ERREUR(S)\n")
    for e in errors: print("  •", e)
else:
    print("✅ Aucune erreur bloquante.")
if warns:
    print(f"\n⚠️  {len(warns)} avertissement(s)")
    for w in warns[:20]: print("  •", w)
print("="*64)
sys.exit(1 if errors else 0)
