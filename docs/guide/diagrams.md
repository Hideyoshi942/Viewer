# Diagrams

Fenced `mermaid` blocks are drawn as diagrams. The diagram library is only downloaded on pages that use it.

## How a save works

```mermaid
sequenceDiagram
  participant B as Browser
  participant S as Local server
  participant D as Disk
  B->>S: PUT /api/file (content, baseVersion)
  S->>D: compare version
  alt unchanged since loaded
    S->>D: backup, then atomic write
    S-->>B: 200 new version
  else changed by someone else
    S-->>B: 409 conflict
  end
```

## Deploy flow

```mermaid
flowchart LR
  A[Edit in browser] -->|commit| B[GitHub repo]
  B -->|push triggers| C[GitHub Actions]
  C -->|build:static| D[GitHub Pages]
```

## Notes

### Theme

Diagrams follow the light/dark theme when the page is drawn.

### Errors

A block with invalid syntax stays as code with a red border; hover it to see the error.
