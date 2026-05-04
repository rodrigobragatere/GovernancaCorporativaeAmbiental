# Emissões de CO₂ no Brasil por região

Página estática de apoio à disciplina **Governança Corporativa Ambiental** (doutorado 2026/1): infográfico interativo com mapa do Brasil, dados por região e cidades, gráficos e referências ao **SEEG** e à geometria **IBGE**.

## Como abrir

Abra o arquivo `emissoes_co2_brasil.html` no navegador (duplo clique ou arrastar para o Chrome, Edge, Firefox, etc.).

> **Conexão com a internet:** o mapa carrega um GeoJSON dos estados brasileiros (CDN externo). As bibliotecas (Bootstrap, D3, Chart.js, Font Awesome, Google Fonts) também vêm de CDN.

## Estrutura do projeto

```
código/
├── emissoes_co2_brasil.html   # página principal
├── cabecalho.png               # banner do cabeçalho
├── logoNovoPng.png             # logo no rodapé do site
├── css/
│   └── style.css               # estilos
├── js/
│   └── main.js                 # mapa (canvas), tooltips, gráficos, ranking
└── README.md
```

## Funcionalidades

- Mapa em **Canvas** com estados agrupados por região e cores por faixa de emissão.
- **Hover** e **clique** nas regiões: painel com estatísticas e gráficos (**Chart.js**).
- Listas de principais cidades emissoras e **Top 20** municípios.
- Link para a plataforma: [https://seeg.eco.br/](https://seeg.eco.br/)

## Fontes dos dados

- **Emissões:** SEEG / Observatório do Clima, ano-base **2021** (conforme indicado na página).
- **Geometria dos estados:** GeoJSON público (ex.: *click that hood* / IBGE), carregado em tempo de execução.

## Créditos

Conteúdo e desenho da página alinhados ao trabalho acadêmico; **© 2026 Rodrigo Braga** — [rodrigobragatere.com](https://rodrigobragatere.com)
