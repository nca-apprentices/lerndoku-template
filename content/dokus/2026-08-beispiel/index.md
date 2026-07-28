+++
title = "Beispiel: HTTP-Grundlagen"
date = 2026-08-15
description = "Was ich diesen Monat über HTTP gelernt habe."

[extra]
tags = ["HTTP", "DevTools"]
+++

Diesen Monat habe ich an einem internen Tool gearbeitet und dabei die Grundlagen
von HTTP vertieft: Request-Methoden, Statuscodes und wie ich Requests im Browser
analysiere.

<!-- more -->

## Vorgehen

Mit den DevTools habe ich die Requests unserer Anwendung untersucht und
dokumentiert, welche Endpunkte aufgerufen werden.

{{ img(src="screenshot.png", alt="DevTools Netzwerk-Tab mit einem GET-Request",
caption="Ein Request im Netzwerk-Tab der DevTools") }}

Ein Beispiel-Request mit `curl`:

```sh
curl -i https://example.com/api/status
```

Dasselbe in JavaScript mit `fetch`:

```js,linenos
const response = await fetch("https://example.com/api/status");
console.log(response.status, response.headers.get("content-type"));
const data = await response.json();
```

Und in Python:

```python,linenos
import urllib.request

with urllib.request.urlopen("https://example.com/api/status") as response:
    print(response.status, response.headers["content-type"])
```

## Reflexion

Am meisten überrascht hat mich, wie viel Information in den Response-Headern
steckt. Beim nächsten Mal möchte ich früher mit den DevTools arbeiten, statt
Fehler nur im Code zu suchen.
