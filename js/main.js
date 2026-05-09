/* ==========================================================================
   EMISSÕES DE CO₂ NO BRASIL POR REGIÃO - Script Principal
   Tema: Governança Corporativa Ambiental
   Fontes: SEEG / Observatório do Clima | Geometria: IBGE
   Dependências: D3.js v7, d3-geo v3, Chart.js v4, Bootstrap 5, Font Awesome 6
   ========================================================================== */

/* ==========================================================================
   1. DADOS DAS REGIÕES (SEEG / Observatório do Clima 2024)
   ========================================================================== */
const REGIOES_DATA = {
    'Norte': {
        slug: 'norte',
        emissao: '6,5',
        percent: '0,7',
        cor: '#58a957',
        faixa: 'Baixo (abaixo de 10)',
        estados: ['AC','AM','AP','PA','RO','RR','TO']
    },
    'Nordeste': {
        slug: 'nordeste',
        emissao: '132,1',
        percent: '13,9',
        cor: '#f1c40f',
        faixa: 'Muito Alto (acima de 100)',
        estados: ['AL','BA','CE','MA','PB','PE','PI','RN','SE']
    },
    'Centro-Oeste': {
        slug: 'centro-oeste',
        emissao: '242,4',
        percent: '25,6',
        cor: '#e67e22',
        faixa: 'Muito Alto (acima de 100)',
        estados: ['DF','GO','MS','MT']
    },
    'Sudeste': {
        slug: 'sudeste',
        emissao: '466,2',
        percent: '49,1',
        cor: '#c0392b',
        faixa: 'Muito Alto (acima de 100)',
        estados: ['ES','MG','RJ','SP']
    },
    'Sul': {
        slug: 'sul',
        emissao: '102,4',
        percent: '10,8',
        cor: '#58a957',
        faixa: 'Muito Alto (acima de 100)',
        estados: ['PR','RS','SC']
    }
};

const UF_TO_REGIAO = {};
Object.entries(REGIOES_DATA).forEach(([nome, dados]) => {
    dados.estados.forEach(uf => UF_TO_REGIAO[uf] = nome);
});

/** Maiores emissores por região: `cidade` no eixo; `empresa` aparece ao passar o mouse (CO₂, referência SEEG/setor). */
const EMPRESAS_POR_REGIAO = {
    'Sudeste': [
        { cidade: 'Cubatão (SP)', empresa: 'Petrobras — Refinaria de Cubatão', valor: 10.4 },
        { cidade: 'Rio de Janeiro (RJ)', empresa: 'Vale — operações mineradoras (MG/RJ)', valor: 7.8 },
        { cidade: 'Serra (ES)', empresa: 'ArcelorMittal — Tubarão', valor: 5.2 },
        { cidade: 'Volta Redonda (RJ)', empresa: 'CSN — Volta Redonda', valor: 4.9 },
        { cidade: 'Ipatinga (MG)', empresa: 'Usiminas — Ipatinga', valor: 4.1 }
    ],
    'Centro-Oeste': [
        { cidade: 'Campo Grande (MS)', empresa: 'JBS — complexo frigorífico (GO/MS)', valor: 9.5 },
        { cidade: 'Rio Verde (GO)', empresa: 'Raízen — etanol e bioenergia (GO)', valor: 6.2 },
        { cidade: 'Lucas do Rio Verde (MT)', empresa: 'Amaggi — grãos e logística (MT)', valor: 5.8 },
        { cidade: 'Três Lagoas (MS)', empresa: 'Suzano — celulose (MS)', valor: 4.5 },
        { cidade: 'Cuiabá (MT)', empresa: 'Petrobras — logística e unidades (MT)', valor: 3.9 }
    ],
    'Nordeste': [
        { cidade: 'Camaçari (BA)', empresa: 'Petrobras — RLAM Camaçari', valor: 2.8 },
        { cidade: 'Dias d\'Ávila (BA)', empresa: 'Braskem — pólo petroquímico (BA)', valor: 2.4 },
        { cidade: 'Múltiplas cidades (NE)', empresa: 'Setor cimenteiro — múltiplas unidades', valor: 1.9 },
        { cidade: 'Ipojuca (PE)', empresa: 'Complexo industrial — Suape (PE)', valor: 1.6 },
        { cidade: 'Cabo de Santo Agostinho (PE)', empresa: 'Gerdau — aços longos (PE)', valor: 1.5 }
    ],
    'Sul': [
        { cidade: 'Araucária (PR)', empresa: 'Petrobras — REPAR – Araucária', valor: 2.1 },
        { cidade: 'Guaíba (RS)', empresa: 'Gerdau — siderurgia (RS)', valor: 1.8 },
        { cidade: 'São José dos Pinhais (PR)', empresa: 'Stellantis — montadora (PR)', valor: 1.4 },
        { cidade: 'Telêmaco Borba (PR)', empresa: 'Klabin — papel e celulose (PR)', valor: 1.2 },
        { cidade: 'Caxias do Sul (RS)', empresa: 'Marcopolo — ônibus e carrocerias (RS)', valor: 0.9 }
    ],
    'Norte': [
        { cidade: 'Manaus (AM)', empresa: 'Polo Industrial de Manaus — conjunto (AM)', valor: 0.45 },
        { cidade: 'Barcarena (PA)', empresa: 'Hydro Alunorte — alumínio (PA)', valor: 0.38 },
        { cidade: 'Porto Velho (RO)', empresa: 'Termelétricas — Porto Velho (RO)', valor: 0.28 },
        { cidade: 'Parauapebas (PA)', empresa: 'Mineração — complexo Carajás (PA)', valor: 0.22 },
        { cidade: 'Belém (PA)', empresa: 'Distribuição e logística — Belém (PA)', valor: 0.17 }
    ]
};

const TOP20_CIDADES = [
    { pos: 1,  nome: 'São Paulo',       uf: 'SP', valor: 54.8, regiao: 'Sudeste' },
    { pos: 2,  nome: 'Brasília',        uf: 'DF', valor: 20.2, regiao: 'Centro-Oeste' },
    { pos: 3,  nome: 'Rio de Janeiro',  uf: 'RJ', valor: 16.5, regiao: 'Sudeste' },
    { pos: 4,  nome: 'Belo Horizonte',  uf: 'MG', valor: 13.4, regiao: 'Sudeste' },
    { pos: 5,  nome: 'Goiânia',         uf: 'GO', valor: 12.5, regiao: 'Centro-Oeste' },
    { pos: 6,  nome: 'Cuiabá',          uf: 'MT', valor: 11.0, regiao: 'Centro-Oeste' },
    { pos: 7,  nome: 'Cubatão',         uf: 'SP', valor: 10.4, regiao: 'Sudeste' },
    { pos: 8,  nome: 'Fortaleza',       uf: 'CE', valor: 7.8,  regiao: 'Nordeste' },
    { pos: 9,  nome: 'Rondonópolis',    uf: 'MT', valor: 7.2,  regiao: 'Centro-Oeste' },
    { pos: 10, nome: 'Salvador',        uf: 'BA', valor: 7.1,  regiao: 'Nordeste' },
    { pos: 11, nome: 'Campo Grande',    uf: 'MS', valor: 6.7,  regiao: 'Centro-Oeste' },
    { pos: 12, nome: 'Curitiba',        uf: 'PR', valor: 6.6,  regiao: 'Sul' },
    { pos: 13, nome: 'Porto Alegre',    uf: 'RS', valor: 5.7,  regiao: 'Sul' },
    { pos: 14, nome: 'Vitória',         uf: 'ES', valor: 5.6,  regiao: 'Sudeste' },
    { pos: 15, nome: 'Suape (Ipojuca)', uf: 'PE', valor: 5.2,  regiao: 'Nordeste' },
    { pos: 16, nome: 'Camaçari',        uf: 'BA', valor: 4.6,  regiao: 'Nordeste' },
    { pos: 17, nome: 'Recife',          uf: 'PE', valor: 3.8,  regiao: 'Nordeste' },
    { pos: 18, nome: 'Canoas',          uf: 'RS', valor: 3.4,  regiao: 'Sul' },
    { pos: 19, nome: 'Joinville',       uf: 'SC', valor: 3.2,  regiao: 'Sul' },
    { pos: 20, nome: 'Caxias do Sul',   uf: 'RS', valor: 2.8,  regiao: 'Sul' }
];

const DESCRICOES_REGIAO = {
    'Sudeste': 'Maior região emissora do país, concentra polos industriais, refinarias e os principais centros urbanos. Responsável por quase metade das emissões nacionais de CO₂.',
    'Centro-Oeste': 'Segundo maior emissor, com forte influência da agropecuária, queima de combustíveis fósseis no transporte e expansão urbana acelerada em Brasília e Goiânia.',
    'Nordeste': 'Emissões impulsionadas por indústrias petroquímicas (Bahia e Pernambuco), refinarias e polos portuários como Suape e Camaçari.',
    'Sul': 'Polos industriais consolidados no Paraná e Rio Grande do Sul, com destaque para refinarias, siderúrgicas e o setor automotivo.',
    'Norte': 'Menor região emissora de CO₂ por queima de combustíveis fósseis (não contabilizadas mudanças de uso da terra), com Manaus liderando devido ao Polo Industrial.'
};

const CIDADES = [
    { num: 1,  nome: 'São Paulo',       uf: 'SP', lng: -46.6333, lat: -23.5505, emissao: '54,8' },
    { num: 2,  nome: 'Rio de Janeiro',  uf: 'RJ', lng: -43.1729, lat: -22.9068, emissao: '16,5' },
    { num: 3,  nome: 'Cuiabá',          uf: 'MT', lng: -56.0974, lat: -15.6014, emissao: '11,0' },
    { num: 4,  nome: 'Goiânia',         uf: 'GO', lng: -49.2643, lat: -16.6864, emissao: '12,5' },
    { num: 5,  nome: 'Brasília',        uf: 'DF', lng: -47.9292, lat: -15.7801, emissao: '20,2' },
    { num: 6,  nome: 'Fortaleza',       uf: 'CE', lng: -38.5267, lat: -3.7327,  emissao: '7,8'  },
    { num: 7,  nome: 'Belo Horizonte',  uf: 'MG', lng: -43.9378, lat: -19.9208, emissao: '13,4' },
    { num: 8,  nome: 'Curitiba',        uf: 'PR', lng: -49.2733, lat: -25.4284, emissao: '6,6'  },
    { num: 9,  nome: 'Salvador',        uf: 'BA', lng: -38.5108, lat: -12.9714, emissao: '7,1'  },
    { num: 10, nome: 'Manaus',          uf: 'AM', lng: -60.0242, lat: -3.1190,  emissao: '1,2'  },
    { num: 11, nome: 'Porto Alegre',    uf: 'RS', lng: -51.2300, lat: -30.0331, emissao: '5,7'  }
];

/* ==========================================================================
   2. CANVAS + GeoJSON DO IBGE (estados do Brasil)
   ========================================================================== */
const canvas = document.getElementById('mapaCanvas');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('tooltip');
const mapLoader = document.getElementById('mapLoader');
const mapaContainer = document.querySelector('.mapa-canvas-container');

let geoData = null;
let regioesGeo = {};
let projection = null;
let pathGenerator = null;
let hoveredRegion = null;
let hoveredCidade = null;
let dpr = window.devicePixelRatio || 1;
let cidadesScreen = [];

function resizeCanvas() {
    const rect = mapaContainer.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);

    if (geoData) {
        setupProjection(rect.width, rect.height);
        draw();
    }
}

function setupProjection(w, h) {
    projection = d3.geoMercator().fitSize([w, h], geoData);
    pathGenerator = d3.geoPath().projection(projection).context(ctx);
}

async function loadGeoData() {
    const URLS = [
        'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson',
        'https://cdn.jsdelivr.net/gh/codeforamerica/click_that_hood@master/public/data/brazil-states.geojson'
    ];

    let lastError = null;
    for (const url of URLS) {
        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            geoData = await resp.json();

            const ufKeys = ['sigla', 'SIGLA_UF', 'UF', 'postal', 'iso3166_2', 'NAME_1'];
            const NAME_TO_UF = {
                'Acre':'AC','Alagoas':'AL','Amapá':'AP','Amazonas':'AM','Bahia':'BA',
                'Ceará':'CE','Distrito Federal':'DF','Espírito Santo':'ES','Goiás':'GO',
                'Maranhão':'MA','Mato Grosso':'MT','Mato Grosso do Sul':'MS','Minas Gerais':'MG',
                'Pará':'PA','Paraíba':'PB','Paraná':'PR','Pernambuco':'PE','Piauí':'PI',
                'Rio de Janeiro':'RJ','Rio Grande do Norte':'RN','Rio Grande do Sul':'RS',
                'Rondônia':'RO','Roraima':'RR','Santa Catarina':'SC','São Paulo':'SP',
                'Sergipe':'SE','Tocantins':'TO'
            };

            geoData.features.forEach(f => {
                let uf = null;
                for (const k of ufKeys) {
                    if (f.properties[k]) { uf = f.properties[k]; break; }
                }
                if (!uf && f.properties.name) uf = NAME_TO_UF[f.properties.name];
                f.properties.uf = uf;
                f.properties.regiao = UF_TO_REGIAO[uf];
            });

            Object.keys(REGIOES_DATA).forEach(r => {
                regioesGeo[r] = {
                    ...REGIOES_DATA[r],
                    features: geoData.features.filter(f => f.properties.regiao === r)
                };
            });

            mapLoader.style.display = 'none';
            resizeCanvas();
            iniciarAnimacaoEntrada();
            return;
        } catch (err) {
            lastError = err;
            console.warn('Falha ao carregar', url, err);
        }
    }

    mapLoader.innerHTML = '<div style="color:#c0392b;"><i class="fas fa-exclamation-triangle"></i> Não foi possível carregar o mapa.<br>Verifique sua conexão com a internet.</div>';
    console.error('Falha total ao carregar GeoJSON:', lastError);
}

/* ==========================================================================
   3. DESENHO DO MAPA NO CANVAS (animações + render)
   ========================================================================== */
let entradaProgress = 0;
let pulseTime = 0;

function iniciarAnimacaoEntrada() {
    const start = performance.now();
    const duration = 1200;

    function step(now) {
        entradaProgress = Math.min((now - start) / duration, 1);
        draw();
        if (entradaProgress < 1) requestAnimationFrame(step);
        else {
            entradaProgress = 1;
            iniciarLoopPulse();
        }
    }
    requestAnimationFrame(step);
}

function iniciarLoopPulse() {
    function loop(now) {
        pulseTime = now;
        draw();
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function draw() {
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
    oceanGrad.addColorStop(0, 'rgba(180, 240, 230, 0.4)');
    oceanGrad.addColorStop(1, 'rgba(220, 245, 195, 0.4)');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(4, 6);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    geoData.features.forEach(f => pathGenerator(f));
    ctx.fill();
    ctx.restore();

    const easedProgress = easeOutCubic(entradaProgress);
    Object.entries(regioesGeo).forEach(([nome, dados]) => {
        const isHovered = hoveredRegion === nome;
        const baseColor = dados.cor;

        ctx.save();
        ctx.globalAlpha = easedProgress * (hoveredRegion && !isHovered ? 0.55 : 1);

        if (isHovered) {
            const pulse = 1 + Math.sin(pulseTime * 0.005) * 0.015;
            const cx = w / 2, cy = h / 2;
            ctx.translate(cx, cy);
            ctx.scale(pulse, pulse);
            ctx.translate(-cx, -cy);
        }

        ctx.beginPath();
        dados.features.forEach(f => pathGenerator(f));

        ctx.fillStyle = baseColor;
        ctx.fill();

        if (isHovered) {
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fill();
        }

        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 0.5;
        dados.features.forEach(f => {
            ctx.beginPath();
            pathGenerator(f);
            ctx.stroke();
        });

        ctx.restore();
    });

    Object.entries(regioesGeo).forEach(([nome, dados]) => {
        const isHovered = hoveredRegion === nome;
        ctx.save();
        ctx.globalAlpha = easedProgress;
        ctx.beginPath();
        dados.features.forEach(f => pathGenerator(f));
        ctx.strokeStyle = isHovered ? '#1a252f' : '#2c3e50';
        ctx.lineWidth = isHovered ? 2.2 : 1.2;
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();
    });

    if (entradaProgress > 0.7) {
        const labelOpacity = (entradaProgress - 0.7) / 0.3;
        Object.entries(regioesGeo).forEach(([nome, dados]) => {
            const centroide = calcularCentroide(dados.features);
            if (!centroide) return;
            desenharLabelRegiao(centroide[0], centroide[1], nome, dados, labelOpacity);
        });
    }

    if (entradaProgress > 0.85) {
        const cidadeOp = (entradaProgress - 0.85) / 0.15;
        cidadesScreen = [];
        CIDADES.forEach(c => {
            const proj = projection([c.lng, c.lat]);
            if (!proj) return;
            const [x, y] = proj;
            cidadesScreen.push({ ...c, x, y });
            desenharCidade(x, y, c, cidadeOp);
        });
    }
}

function calcularCentroide(features) {
    const fc = { type: 'FeatureCollection', features };
    const path = d3.geoPath().projection(projection);
    return path.centroid(fc);
}

function desenharLabelRegiao(x, y, nome, dados, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity * (hoveredRegion && hoveredRegion !== nome ? 0.4 : 1);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';

    const isSmall = nome === 'Norte' || nome === 'Sul' || nome === 'Sudeste';
    const titleSize = 12;
    const valueSize = isSmall ? 13 : 16;

    ctx.shadowColor = 'rgba(0,0,0,0.75)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;

    ctx.font = `800 ${titleSize}px Montserrat, sans-serif`;
    ctx.fillText(nome.toUpperCase(), x, y - 16);

    ctx.font = `900 ${valueSize}px Montserrat, sans-serif`;
    ctx.fillText(dados.emissao, x, y + 4);

    ctx.shadowBlur = 2;
    ctx.font = `italic 9px Montserrat, sans-serif`;
    ctx.fillText('milhões t CO₂', x, y + 17);

    ctx.font = `700 10px Montserrat, sans-serif`;
    ctx.fillText(`(${dados.percent}%)`, x, y + 30);

    ctx.restore();
}

function desenharCidade(x, y, cidade, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity;
    const isHovered = hoveredCidade && hoveredCidade.num === cidade.num;
    const r = isHovered ? 13 : 10;

    if (isHovered) {
        const pulse = 1 + Math.sin(pulseTime * 0.008) * 0.15;
        ctx.beginPath();
        ctx.arc(x, y, r + 6 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 245, 0, 0.4)';
        ctx.fill();
    }

    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = isHovered ? '#ffd700' : '#2c3e50';
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = isHovered ? '#2c3e50' : '#fff';
    ctx.font = `800 11px Montserrat, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cidade.num, x, y);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `700 11px Montserrat, sans-serif`;
    ctx.fillStyle = '#2c3e50';
    ctx.shadowColor = 'rgba(255,255,255,0.95)';
    ctx.shadowBlur = 4;
    ctx.fillText(cidade.nome, x + r + 5, y);

    ctx.restore();
}

/* ==========================================================================
   4. DETECÇÃO DE HOVER E CLIQUE NO CANVAS (point-in-path)
   ========================================================================== */
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let cidadeHit = null;
    for (const c of cidadesScreen) {
        const dx = c.x - mx, dy = c.y - my;
        if (Math.sqrt(dx*dx + dy*dy) <= 12) { cidadeHit = c; break; }
    }

    if (cidadeHit) {
        if (!hoveredCidade || hoveredCidade.num !== cidadeHit.num) {
            hoveredCidade = cidadeHit;
            hoveredRegion = null;
            showCidadeTooltip(cidadeHit);
            canvas.style.cursor = 'pointer';
        }
        positionTooltip(e);
        return;
    }
    hoveredCidade = null;

    let hit = null;
    for (const [nome, dados] of Object.entries(regioesGeo)) {
        ctx.beginPath();
        dados.features.forEach(f => pathGenerator(f));
        if (ctx.isPointInPath(mx * dpr, my * dpr)) {
            hit = nome;
            break;
        }
    }

    if (hit !== hoveredRegion) {
        hoveredRegion = hit;
        if (hit) {
            showRegiaoTooltip(hit);
            canvas.style.cursor = 'pointer';
        } else {
            tooltip.classList.remove('visible');
            canvas.style.cursor = 'default';
        }
    }
    if (hit) positionTooltip(e);
    draw();
});

canvas.addEventListener('mouseleave', () => {
    hoveredRegion = null;
    hoveredCidade = null;
    tooltip.classList.remove('visible');
    canvas.style.cursor = 'default';
    draw();
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (const [nome, dados] of Object.entries(regioesGeo)) {
        ctx.beginPath();
        dados.features.forEach(f => pathGenerator(f));
        if (ctx.isPointInPath(mx * dpr, my * dpr)) {
            abrirDetalheRegiao(nome);
            return;
        }
    }
});

function showRegiaoTooltip(nome) {
    const d = regioesGeo[nome];
    tooltip.innerHTML = `
        <h4><i class="fas fa-map"></i> ${nome}</h4>
        <div class="big-num">${d.emissao}</div>
        <div class="small-info">milhões de t CO₂ (${d.percent}%)</div>
        <div class="small-info" style="margin-top:6px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.2);">
            <i class="fas fa-chart-line"></i> Faixa: <strong>${d.faixa}</strong><br>
            <i class="fas fa-flag"></i> ${d.estados.length} estados
        </div>
    `;
    tooltip.classList.add('visible');
}

function showCidadeTooltip(c) {
    tooltip.innerHTML = `
        <h4><i class="fas fa-map-marker-alt"></i> ${c.nome} (${c.uf})</h4>
        <div class="big-num">${c.emissao}</div>
        <div class="small-info">milhões de t CO₂ em 2024</div>
        <div class="small-info" style="margin-top:6px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.2);">
            <i class="fas fa-trophy"></i> #${c.num} no ranking nacional
        </div>
    `;
    tooltip.classList.add('visible');
}

function positionTooltip(e) {
    const rect = mapaContainer.getBoundingClientRect();
    let x = e.clientX - rect.left + 15;
    let y = e.clientY - rect.top + 15;
    if (x + 250 > rect.width) x = e.clientX - rect.left - 250;
    if (y + 140 > rect.height) y = e.clientY - rect.top - 140;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
}

/* ==========================================================================
   5. HIGHLIGHT VIA LEGENDA LATERAL (hover/click)
   ========================================================================== */
const slugToNome = {};
Object.entries(REGIOES_DATA).forEach(([n, d]) => slugToNome[d.slug] = n);

document.querySelectorAll('.legenda-row[data-regiao]').forEach(row => {
    row.addEventListener('mouseenter', () => {
        hoveredRegion = slugToNome[row.dataset.regiao];
        draw();
    });
    row.addEventListener('mouseleave', () => {
        hoveredRegion = null;
        draw();
    });
    row.addEventListener('click', () => {
        abrirDetalheRegiao(slugToNome[row.dataset.regiao]);
    });
    row.style.cursor = 'pointer';
});

/* ==========================================================================
   6. PAINEL DETALHE DA REGIÃO + GRÁFICOS (Chart.js)
   ========================================================================== */
const detalhePanel       = document.getElementById('detalheRegiao');
const detalheNome        = document.getElementById('detalheNome');
const detalheBadgeCor    = document.getElementById('detalheBadgeCor');
const detalheClose       = document.getElementById('detalheClose');
const detalheInfo        = document.getElementById('detalheInfo');
const statEmissao        = document.getElementById('statEmissao');
const statPercent        = document.getElementById('statPercent');
const statEstados        = document.getElementById('statEstados');

let chartCidadesInstance = null;
let chartParticipacaoInstance = null;

function abrirDetalheRegiao(nome) {
    const d = REGIOES_DATA[nome];
    if (!d) return;

    detalhePanel.className = 'detalhe-regiao-panel ativo ' + d.slug;
    ['statCardEmissao','statCardPercent','statCardEstados'].forEach(id => {
        document.getElementById(id).className = 'stat-card ' + d.slug;
    });

    detalheNome.textContent = nome.toUpperCase();
    detalheBadgeCor.style.background = d.cor;

    animateNumberFloat(statEmissao, parseFloat(d.emissao.replace(',','.')), 1, 'pt');
    animateNumberFloat(statPercent, parseFloat(d.percent.replace(',','.')), 1, 'pt', '%');
    animateNumberInt(statEstados, d.estados.length);

    detalheInfo.textContent = DESCRICOES_REGIAO[nome] || '';

    setTimeout(() => {
        detalhePanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    criarGraficoEmpresas(nome, d);
    criarGraficoParticipacao(nome, d);
}

function fecharDetalhe() {
    detalhePanel.className = 'detalhe-regiao-panel';
    if (chartCidadesInstance) { chartCidadesInstance.destroy(); chartCidadesInstance = null; }
    if (chartParticipacaoInstance) { chartParticipacaoInstance.destroy(); chartParticipacaoInstance = null; }
}

detalheClose.addEventListener('click', fecharDetalhe);

function animateNumberFloat(el, target, decimals, locale, suffix = '') {
    const start = 0;
    const startTime = performance.now();
    const dur = 1000;
    function update(now) {
        const t = Math.min((now - startTime) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const cur = start + (target - start) * eased;
        el.textContent = cur.toLocaleString(locale === 'pt' ? 'pt-BR' : 'en', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }) + suffix;
        if (t < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function animateNumberInt(el, target) {
    const startTime = performance.now();
    const dur = 800;
    function update(now) {
        const t = Math.min((now - startTime) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function criarGraficoEmpresas(nome, d) {
    const empresas = EMPRESAS_POR_REGIAO[nome] || [];
    const ctxBar = document.getElementById('chartCidades').getContext('2d');

    if (chartCidadesInstance) chartCidadesInstance.destroy();

    chartCidadesInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: empresas.map(c => c.cidade),
            datasets: [{
                label: 'Emissões (milhões t CO₂)',
                data: empresas.map(c => c.valor),
                backgroundColor: empresas.map((_, i) => {
                    const alpha = 1 - (i * 0.12);
                    return hexToRgba(d.cor, alpha);
                }),
                borderColor: d.cor,
                borderWidth: 1.5,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { left: 10, right: 14, top: 8, bottom: 8 }
            },
            animation: {
                duration: 1200,
                easing: 'easeOutCubic'
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(44,62,80,0.95)',
                    titleColor: '#ffd700',
                    bodyColor: '#fff',
                    padding: 12,
                    borderColor: d.cor,
                    borderWidth: 2,
                    titleFont: { size: 13, weight: '700' },
                    bodyFont: { size: 12 },
                    titleSpacing: 8,
                    callbacks: {
                        title: (items) => {
                            const i = items[0]?.dataIndex;
                            return (i != null && empresas[i]) ? empresas[i].empresa : '';
                        },
                        label: ctx => `${ctx.parsed.x.toLocaleString('pt-BR', {minimumFractionDigits:1})} milhões t CO₂`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { font: { size: 10, weight: 600 }, color: '#666' }
                },
                y: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: {
                        autoSkip: false,
                        font: { size: 10, weight: 600, family: "'Montserrat', sans-serif" },
                        color: '#2c3e50',
                        padding: 10,
                        mirror: false
                    }
                }
            }
        }
    });
}

function criarGraficoParticipacao(nome, d) {
    const ctxPie = document.getElementById('chartParticipacao').getContext('2d');
    if (chartParticipacaoInstance) chartParticipacaoInstance.destroy();

    const totalBrasil = 949.6;
    const valorRegiao = parseFloat(d.emissao.replace(',', '.'));
    const restoNacional = totalBrasil - valorRegiao;

    chartParticipacaoInstance = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: [nome, 'Demais regiões'],
            datasets: [{
                data: [valorRegiao, restoNacional],
                backgroundColor: [d.cor, 'rgba(200, 200, 200, 0.5)'],
                borderColor: ['#fff', '#fff'],
                borderWidth: 3,
                hoverOffset: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            animation: {
                duration: 1200,
                easing: 'easeOutCubic',
                animateRotate: true,
                animateScale: true
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 10, weight: 700 },
                        color: '#2c3e50',
                        boxWidth: 12,
                        padding: 8
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(44,62,80,0.95)',
                    titleColor: '#ffd700',
                    bodyColor: '#fff',
                    padding: 10,
                    callbacks: {
                        label: ctx => {
                            const v = ctx.parsed;
                            const pct = ((v / totalBrasil) * 100).toFixed(1);
                            return `${v.toLocaleString('pt-BR', {minimumFractionDigits:1})} milhões t CO₂ (${pct}%)`;
                        }
                    }
                }
            }
        },
        plugins: [{
            id: 'centerText',
            beforeDraw(chart) {
                const { width, height, ctx } = chart;
                ctx.save();
                const cx = width / 2;
                const cy = height / 2 - 10;

                ctx.textAlign = 'center';
                ctx.fillStyle = d.cor;
                ctx.font = '900 22px Montserrat, sans-serif';
                ctx.fillText(d.percent + '%', cx, cy);

                ctx.fillStyle = '#666';
                ctx.font = '700 9px Montserrat, sans-serif';
                ctx.fillText('do total Brasil', cx, cy + 16);
                ctx.restore();
            }
        }]
    });
}

function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ==========================================================================
   7. ANIMAÇÃO DAS BARRAS DAS CIDADES (coluna direita)
   ========================================================================== */
function animateBars() {
    const bars = document.querySelectorAll('.cidade-bar');
    bars.forEach((bar, i) => {
        const w = bar.dataset.width;
        setTimeout(() => bar.style.width = w + '%', 500 + i * 40);
    });
}

/* ==========================================================================
   8. RANKING TOP 20 CIDADES MAIS POLUENTES
   ========================================================================== */
const REGIAO_TO_SLUG = {
    'Sudeste': 'sudeste',
    'Centro-Oeste': 'centro-oeste',
    'Nordeste': 'nordeste',
    'Sul': 'sul',
    'Norte': 'norte'
};

function renderTop20Cidades() {
    const container = document.getElementById('ranking20-container');
    const totalBrasil = 949.6;
    const maxValor = TOP20_CIDADES[0].valor;
    let somaTop20 = 0;

    container.innerHTML = TOP20_CIDADES.map(c => {
        somaTop20 += c.valor;
        const slug = REGIAO_TO_SLUG[c.regiao];
        const widthPct = (c.valor / maxValor) * 100;
        const isTop3 = c.pos <= 3;
        const medalClass = c.pos === 1 ? 'medal-gold'
                         : c.pos === 2 ? 'medal-silver'
                         : c.pos === 3 ? 'medal-bronze' : '';

        return `
            <div class="ranking-row ${slug} ${isTop3 ? 'top3' : ''}" data-regiao="${c.regiao}" title="Clique para ver detalhes da região ${c.regiao}">
                <span class="ranking-numero ${medalClass}">${c.pos}</span>
                <span class="ranking-nome">${c.nome} <span class="ranking-uf">(${c.uf})</span></span>
                <div class="ranking-bar-container">
                    <div class="ranking-bar ${slug}" data-width="${widthPct.toFixed(1)}"></div>
                </div>
                <span class="ranking-valor">${c.valor.toLocaleString('pt-BR', {minimumFractionDigits:1})}</span>
            </div>
        `;
    }).join('');

    document.getElementById('ranking-total').textContent = somaTop20.toLocaleString('pt-BR', {minimumFractionDigits:1});
    document.getElementById('ranking-percent').textContent = ((somaTop20 / totalBrasil) * 100).toFixed(1).replace('.', ',');

    const bars = container.querySelectorAll('.ranking-bar');
    bars.forEach((bar, i) => {
        setTimeout(() => bar.style.width = bar.dataset.width + '%', 200 + i * 50);
    });

    container.querySelectorAll('.ranking-row').forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
            abrirDetalheRegiao(row.dataset.regiao);
        });
    });
}

/* ==========================================================================
   9. INICIALIZAÇÃO
   ========================================================================== */
window.addEventListener('load', () => {
    loadGeoData();
    setTimeout(animateBars, 1000);
    setTimeout(renderTop20Cidades, 1200);
});

window.addEventListener('resize', () => {
    dpr = window.devicePixelRatio || 1;
    resizeCanvas();
});
