# 📚 Portal de Cartilhas UNINASSAU

Página web moderna, responsiva e dinâmica para visualização e consulta de cartilhas e materiais educativos em formato PDF.

---

## ✨ Funcionalidades

- **Visualizador de PDF Integrado:** Leitor incorporado com suporte a zoom, paginação nativa e tela cheia.
- **Barra Lateral Dinâmica:**
  - Lista com os títulos, categorias, tags e descrição de cada material.
  - Indicador visual ativo com destaque em degradê e realce.
  - Busca em tempo real por palavras-chave no título ou conteúdo.
  - Filtro interativo por categorias (Todas, Segurança, Comunidade, etc.).
- **Ações Rápidas do Documento:**
  - 📥 **Baixar PDF:** Download direto com o clique de um botão.
  - ↗️ **Nova Aba:** Abertura direta do arquivo no visualizador completo do navegador.
  - ⛶ **Tela Cheia:** Foco total na leitura com suporte nativo à Fullscreen API.
- **Totalmente Responsivo:**
  - No desktop: menu lateral recolhível para aumentar a área de leitura.
  - No celular/tablet: menu lateral no estilo gaveta (drawer) com overlay suave.
- **Links Diretos (Deep Linking):** Cada cartilha possui um identificador (#hash) na URL, permitindo compartilhar o link direto para um material específico.

---

## 📁 Estrutura do Projeto

```text
NatyUninassau/
├── index.html          # Estrutura semântica da página
├── style.css           # Estilos modernos, design system e responsividade
├── app.js              # Lógica de controle, busca, filtros e visualizador
├── cartilhas.js        # Cadastro e lista de cartilhas disponíveis
└── cartilhas/          # Pasta onde ficam os arquivos .pdf
    ├── Cartilha_Estrada_Segura_UNINASSAU_v3.pdf
    ├── Cartilha_Bate_Papo_de_Esquina_UNINASSAU_v3.pdf
    ├── Cartilha_Beneficios_Entregadores_UNINASSAU_v1.pdf
    ├── Cartilha_Motorista_de_App_Palmas_Tocantins_UNINASSAU_v1.pdf
    └── Cartilha_Passo_a_Passo_UNINASSAU_v3.pdf
```

---

## 🚀 Como Executar Localmente

### Método 1: Servidor Local Rápido (Recomendado)

No terminal dentro da pasta do projeto, execute:

```bash
# Com Python 3:
python3 -m http.server 3000
```

Depois, acesse no seu navegador:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## ➕ Como Adicionar Novas Cartilhas

1. Coloque o arquivo PDF dentro da pasta `cartilhas/`.
2. Abra o arquivo `cartilhas.js` e adicione um novo bloco no formato:

```javascript
{
  id: "nome-identificador",
  title: "Título da Cartilha",
  description: "Breve resumo do assunto abordado.",
  category: "Categoria",
  file: "cartilhas/nome-do-arquivo.pdf",
  pages: "UNINASSAU",
  date: "2026",
  badge: "Novo" // Opcional: "Destaque", "Novo", "Importante", etc.
}
```

A página atualiza os filtros de categoria e a lista automaticamente!
