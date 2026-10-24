# Le Labo SRU — CUB

Ouvrir **labo-sru-bnf.html** dans un navigateur moderne. Le fichier contient l’ensemble du HTML, du CSS et du JavaScript : aucune installation, compilation ou dépendance externe. Une connexion Internet est nécessaire pour interroger la BnF. Le fichier peut également être placé sur un hébergement statique HTTP ou HTTPS.

## Utilisation

1. Choisir un contexte, un critère et une valeur (par exemple Auteur / tous les mots / Victor Hugo).
2. Vérifier le CQL, son explication et l’URL, puis sélectionner **Tester la requête**.
3. Parcourir les résultats, ouvrir une notice et ses vues lisible, UNIMARC, XML et Radial. Dans le radial, le panneau affiche les valeurs complètes dès la sélection d’un bloc ou d’un champ (par exemple `200$a` pour le titre), en séparant les occurrences. Les boutons de sous-champs présentent un aperçu ; leur sélection affiche la valeur intégrale.
4. Dans le radial, sélectionner un bloc, un champ, une occurrence puis un sous-champ. La valeur complète apparaît à droite. Les boutons sous le dessin offrent la même navigation au clavier.
5. Le mode CQL permet une saisie directe. Les exemples et rebonds préparent une recherche sans l’exécuter. Le bouton Relancer de l’historique exécute explicitement la requête sauvegardée.

Les exports XML et JSON concernent la réponse et les notices de la page reçue, pas l’ensemble des résultats du catalogue. Le filtre local porte également sur cette page seulement. L’historique garde les cinq derniers appels réussis en mémoire et disparaît au rechargement.

## Sources et configuration

Sources consultées le **24 octobre 2026** :

- [Documentation officielle SRU BnF](https://api.bnf.fr/fr/api-sru-catalogue-general).
- [Tableau officiel des critères](https://www.bnf.fr/sites/default/files/2024-03/Documentation_SRU_2024_tableau_criteres.pdf).
- [Formulaire officiel](https://catalogue.bnf.fr/api/test.do).

La page documentaire présente le tableau comme mis à jour en juillet 2026 ; le PDF effectivement lié porte une date interne de janvier 2024. Le registre reprend les critères, relations et valeurs de ce PDF, recoupés avec le formulaire. Les index `bib.gmr` / `aut.gmr` ne sont pas extrapolés ; aucun index supplémentaire non documenté dans le tableau n’a été ajouté.

Dans le script du HTML, `BIB_CRITERIA`, `AUT_CRITERIA`, `OUTPUT_SCHEMAS` et `SORT_OPTIONS` contiennent les paramètres modifiables. `bib.abstract` signifie **présence d’un résumé**, avec la seule valeur `true` ; ce critère ne recherche pas un mot dans le résumé. `bib.date` n’accepte ici que les relations effectivement documentées, dont `=`, et pas les comparateurs de `bib.publicationdate`. Les index de notices liées portent le préfixe documenté `bib.`.

`CONFIG.sruEndpoint` désigne exclusivement `https://catalogue.bnf.fr/api/SRU`. `CONFIG.proxyEndpoint` reste vide. Aucun proxy n’est fourni, car les appels réels ont réussi dans Chromium depuis HTTP local, `file://` et une origine HTTPS. L’en-tête CORS de la BnF était `Access-Control-Allow-Origin: *`. Le test HTTPS a été exécuté depuis la page officielle HTTPS BnF ; aucune publication de l’application n’a été faite.

## Vérification du 24 octobre 2026

Les rapports détaillés sont regroupés dans **labo-sru-bnf-tests.json**. Les tests ont utilise Playwright uniquement pour piloter Chromium ; aucune dependance de test ne fait partie de cette application autonome.

- Auteur Victor Hugo : 9 267 résultats, 20 notices reçues ; pagination réelle vers le résultat 21.
- Recherche libre Julien Gracq : 435 résultats.
- ISBN, ARK, ISNI, autorité Victor Hugo, sujet, date avec comparateur : réponses réelles exploitées.
- Six tris officiels et cinq schémas : contrôlés contre le service réel.
- Aucun résultat et diagnostic SRU : affichages contrôlés.
- Inspecteur, UNIMARC, XML et radial jusqu’à la valeur : vérifiés dans Chromium.
- Namespaces, champs et sous-champs répétés, absence d’auteur ou d’ISBN, XML invalide, encodage des caractères spéciaux et absence d’injection HTML : vérifiés. Les fixtures synthétiques de robustesse ne sont jamais affichées comme résultats BnF.
- Onglets au clavier ; absence de débordement global à 390, 768 et 1 440 pixels ; aucune exception JavaScript dans le parcours testé.

### Limite observée côté BnF

L’exemple officiel `(bib.author all "romain gary") and (bib.title all "la promesse de l'aube")`, demandé en UNIMARC avec dix notices, a renvoyé à plusieurs reprises le diagnostic **131 — erreur de traitement, détails -20;**. La même recherche avec `maximumRecords=1`, sans schéma explicitement demandé, a renvoyé **21 résultats** sans diagnostic. Ces deux situations sont conservées dans le rapport. L’application affiche le diagnostic reçu et donne accès au XML ; elle ne remplace pas les résultats par une démonstration et ne réécrit pas silencieusement la recherche.

## Limites de la V1

- Le validateur local ne constitue pas un parseur CQL complet. Il détecte les anomalies courantes ; le serveur reste la référence pour la syntaxe et les fonctionnalités avancées.
- La présentation documentaire et le radial sont fondés sur UNIMARC. Intermarc conserve une vue de ses champs et du XML sans appliquer des correspondances UNIMARC à ses données. Dublin Core dispose d’une synthèse dédiée.
- Le modèle garde les occurrences et les sous-champs dans leur ordre. Le XML complet de chaque notice et de la réponse reste disponible, y compris les données analytiques. La synthèse n’interprète pas toute la sémantique des sous-notices imbriquées.
- « Pourquoi ce résultat ? » recherche des correspondances textuelles dans les données reçues ; cette fonction n’explique pas l’indexation interne de la BnF.
- Le navigateur ne permet pas au JavaScript de distinguer de manière fiable un échec réseau d’un refus CORS. Le message précise cette incertitude, tandis que les erreurs HTTP, XML et diagnostics SRU sont traités séparément.
- Vérifications d’accessibilité pratiques effectuées, sans prétendre à une certification ou à un audit RGAA complet. Les essais ont été réalisés dans Chromium ; pas de validation spécifique Safari ou Firefox.

Le code n’utilise aucune IA, aucun compte et aucun service de télémétrie.
