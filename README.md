# Lume Apple

Réplica local multipágina do site LumiStore, com a home e todas as categorias do menu. A versão estilizada anterior foi preservada em `index-reserva.html` para reutilização posterior.

## Como rodar localmente

Abra o `index.html` no navegador ou sirva a pasta com qualquer servidor estático. Por exemplo, com Node.js:

```bash
npx serve .
```

O projeto pode ser publicado diretamente na Vercel como site estático. O `vercel.json` mantém as rotas Apple apontando para os respectivos arquivos HTML.

## Antes de publicar

- Troque o link de WhatsApp em `index.html` pelo número real da loja.
- A cópia atual usa apenas produtos Apple.
- Imagens da referência continuam apontando para o CDN original; depois podemos baixá-las para `assets/` se você quiser deixar tudo independente.
