// ==================== Storage Module ====================
const Storage = {
    KEY_SELECTED_CARDS: 'sts2_helper_selected_cards',
    KEY_CURRENT_CHAR: 'sts2_helper_current_char',
    KEY_VERSION: 'sts2_helper_version',
    
    saveSelectedCards(cards) {
        try { localStorage.setItem(this.KEY_SELECTED_CARDS, JSON.stringify(cards)); } 
        catch (e) { console.warn('Storage save failed:', e); }
    },
    
    loadSelectedCards() {
        try { const data = localStorage.getItem(this.KEY_SELECTED_CARDS); return data ? JSON.parse(data) : []; } 
        catch (e) { return []; }
    },
    
    saveCurrentCharacter(char) { try { localStorage.setItem(this.KEY_CURRENT_CHAR, char); } catch (e) {} },
    loadCurrentCharacter() { return localStorage.getItem(this.KEY_CURRENT_CHAR) || null; },
    saveVersion(ver) { try { localStorage.setItem(this.KEY_VERSION, ver); } catch (e) {} },
    loadVersion() { return localStorage.getItem(this.KEY_VERSION) || 'sts1'; },
    
    clear() {
        try { localStorage.removeItem(this.KEY_SELECTED_CARDS); localStorage.removeItem(this.KEY_CURRENT_CHAR); } 
        catch (e) {}
    }
};

// ==================== Main App State ====================
let currentCharacter = null;
let selectedCards = [];

// DOM elements
const cardInputSection = document.getElementById('cardInput');
const cardCategories = document.getElementById('cardCategories');
const selectedCardsList = document.getElementById('selectedCardsList');
const selectedCount = document.getElementById('selectedCount');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsSection = document.getElementById('results');
const archetypeResults = document.getElementById('archetypeResults');
const archetypeGuide = document.getElementById('archetypeGuide');
const guideContent = document.getElementById('guideContent');
const cardSearch = document.getElementById('cardSearch');

// 角色数据映射
const CHARACTER_DATA = {
    ironclad: IRONCLAD_DATA,
    silent: SILENT_DATA,
    defect: DEFECT_DATA,
    watcher: WATCHER_DATA
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载保存的状态
    const savedVersion = Storage.loadVersion();
    if (savedVersion === 'sts2') {
        window.switchVersion('sts2');
    }
    
    initCharacterButtons();
    initSearch();
    initAnalyzeButton();
    initResetButton();
});

// 重置按钮
function initResetButton() {
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('确定要清空所有选择吗？')) {
                Storage.clear();
                selectedCards = [];
                currentCharacter = null;
                updateSelectedCards();
                renderCharacterList();
                document.getElementById('cardInput').style.display = 'none';
                document.getElementById('results').style.display = 'none';
                document.getElementById('archetypeGuide').style.display = 'none';
            }
        });
    }
}

// 角色按钮初始化
function initCharacterButtons() {
    document.querySelectorAll('.char-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const char = btn.dataset.char;
            selectCharacter(char);
            
            // 更新按钮状态
            document.querySelectorAll('.char-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// 选择角色
function selectCharacter(char) {
    currentCharacter = char;
    // 加载该角色保存的卡牌
    const saved = Storage.loadSelectedCards();
    selectedCards = Array.isArray(saved) ? saved : [];
    
    Storage.saveCurrentCharacter(char);
    
    // 显示卡牌输入区域
    cardInputSection.style.display = 'block';
    resultsSection.style.display = 'none';
    archetypeGuide.style.display = 'none';
    
    // 渲染卡牌列表
    renderCardCategories();
    updateSelectedCards();
    Storage.saveSelectedCards(selectedCards);
}

// 渲染卡牌分类
function renderCardCategories() {
    const data = CHARACTER_DATA[currentCharacter];
    if (!data) return;
    
    cardCategories.innerHTML = '';
    
    // 攻击牌
    if (data.cards.attacks && data.cards.attacks.length > 0) {
        const category = createCardCategory('攻击牌', data.cards.attacks, 'attack');
        cardCategories.appendChild(category);
    }
    
    // 技能牌
    if (data.cards.skills && data.cards.skills.length > 0) {
        const category = createCardCategory('技能牌', data.cards.skills, 'skill');
        cardCategories.appendChild(category);
    }
    
    // 能力牌
    if (data.cards.powers && data.cards.powers.length > 0) {
        const category = createCardCategory('能力牌', data.cards.powers, 'power');
        cardCategories.appendChild(category);
    }
}

// 创建卡牌分类
function createCardCategory(title, cards, type) {
    const category = document.createElement('div');
    category.className = 'card-category';
    category.dataset.type = type;
    
    const titleEl = document.createElement('h4');
    titleEl.textContent = title;
    category.appendChild(titleEl);
    
    const list = document.createElement('div');
    list.className = 'card-list';
    
    cards.forEach(card => {
        const item = document.createElement('div');
        item.className = 'card-item';
        item.dataset.id = card.id;
        if (selectedCards.includes(card.id)) {
            item.classList.add('selected');
        }
        
        // 稀有度颜色
        const rarityColors = { basic: '#888', common: '#ccc', uncommon: '#4ecdc4', rare: '#ffd93d' };
        const rarityColor = rarityColors[card.rarity] || '#ccc';
        
        // 费用显示
        const costDisplay = card.cost !== undefined ? (card.cost === 0 ? 'X' : card.cost) : '?';
        
        // 详细描述（如果有）
        const cardDesc = card.desc || '暂无描述';
        
        item.innerHTML = `
            <input type="checkbox" ${selectedCards.includes(card.id) ? 'checked' : ''}>
            <span class="card-name">${card.name}</span>
            <span class="card-type ${type}" style="background: ${rarityColor}33; color: ${rarityColor}">${getTypeName(type)}</span>
            
            <!-- 悬浮详情提示 -->
            <div class="card-tooltip">
                <div class="tooltip-header">
                    <span class="tooltip-name">${card.name}</span>
                    <span class="tooltip-cost">${costDisplay}</span>
                </div>
                <div>
                    <span class="tooltip-type ${type}">${getTypeName(type)}</span>
                    <span class="tooltip-rarity" style="color: ${rarityColor}">${card.rarity || '普通'}</span>
                </div>
                <div class="tooltip-desc">${cardDesc}</div>
                ${card.effect ? `<div class="tooltip-extra">${card.effect}</div>` : ''}
            </div>
        `;
        
        item.addEventListener('click', () => toggleCard(card.id, item));
        list.appendChild(item);
    });
    
    category.appendChild(list);
    return category;
}

// 获取类型名称
function getTypeName(type) {
    const names = {
        attack: '攻击',
        skill: '技能',
        power: '能力'
    };
    return names[type] || type;
}

// 切换卡牌选择
function toggleCard(cardId, element) {
    const index = selectedCards.indexOf(cardId);
    
    if (index === -1) {
        selectedCards.push(cardId);
        element.classList.add('selected');
        element.querySelector('input').checked = true;
    } else {
        selectedCards.splice(index, 1);
        element.classList.remove('selected');
        element.querySelector('input').checked = false;
    }
    
    updateSelectedCards();
}

// 更新已选卡牌显示
function updateSelectedCards() {
    selectedCount.textContent = selectedCards.length;
    
    if (selectedCards.length === 0) {
        selectedCardsList.innerHTML = '<span style="color: #888;">暂无选择</span>';
        return;
    }
    
    const data = CHARACTER_DATA[currentCharacter];
    selectedCardsList.innerHTML = '';
    
    selectedCards.forEach(cardId => {
        const card = findCardById(cardId, data);
        if (card) {
            const tag = document.createElement('span');
            tag.className = 'selected-card-tag';
            tag.innerHTML = `${card.name}<span class="remove" data-id="${cardId}">✕</span>`;
            tag.querySelector('.remove').addEventListener('click', (e) => {
                e.stopPropagation();
                removeCard(cardId);
            });
            selectedCardsList.appendChild(tag);
        }
    });
}

// 根据ID查找卡牌
function findCardById(id, data) {
    for (const type of ['attacks', 'skills', 'powers']) {
        if (data.cards[type]) {
            const card = data.cards[type].find(c => c.id === id);
            if (card) return card;
        }
    }
    return null;
}

// 移除卡牌
function removeCard(cardId) {
    const index = selectedCards.indexOf(cardId);
    if (index !== -1) {
        selectedCards.splice(index, 1);
        
        // 更新UI
        const item = document.querySelector(`.card-item[data-id="${cardId}"]`);
        if (item) {
            item.classList.remove('selected');
            item.querySelector('input').checked = false;
        }
        
        updateSelectedCards();
        Storage.saveSelectedCards(selectedCards);
    }
}

// 搜索功能
function initSearch() {
    cardSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        document.querySelectorAll('.card-item').forEach(item => {
            const name = item.querySelector('.card-name').textContent.toLowerCase();
            if (query === '' || name.includes(query)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

// 分析按钮
function initAnalyzeButton() {
    analyzeBtn.addEventListener('click', analyzeDeck);
}

// 分析牌组
function analyzeDeck() {
    if (selectedCards.length === 0) {
        alert('请至少选择一张卡牌！');
        return;
    }
    
    const data = CHARACTER_DATA[currentCharacter];
    if (!data) return;
    
    // 计算各流派匹配度
    const results = data.archetypes.map(archetype => {
        const evalResult = archetype.evaluate(selectedCards);
        return {
            ...archetype,
            ...evalResult
        };
    });
    
    // 按分数排序
    results.sort((a, b) => b.score - a.score);
    
    // 显示结果
    renderResults(results);
    
    resultsSection.style.display = 'block';
    archetypeGuide.style.display = 'none';
    
    // 滚动到结果
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// 渲染结果
function renderResults(results) {
    archetypeResults.innerHTML = '';
    
    results.forEach((result, index) => {
        const level = result.score >= 60 ? 'high' : (result.score >= 30 ? 'medium' : 'low');
        
        const div = document.createElement('div');
        div.className = `archetype-result ${level}`;
        div.addEventListener('click', () => showArchetypeGuide(result));
        
        // 显示已拥有的关键卡
        const keyCardsOwned = result.keyCards.filter(c => selectedCards.includes(c));
        const keyCardsPreview = keyCardsOwned.slice(0, 4).map(cardId => {
            const card = findCardById(cardId, CHARACTER_DATA[currentCharacter]);
            return `<span class="key-card-badge owned">${card ? card.name : cardId}</span>`;
        }).join('');
        
        // 显示缺少的关键卡
        const keyCardsMissing = result.keyCards.filter(c => !selectedCards.includes(c)).slice(0, 2);
        const missingPreview = keyCardsMissing.map(cardId => {
            const card = findCardById(cardId, CHARACTER_DATA[currentCharacter]);
            return `<span class="key-card-badge">${card ? card.name : cardId}</span>`;
        }).join('');
        
        div.innerHTML = `
            <div class="archetype-header">
                <span class="archetype-name">${result.name}</span>
                <span class="archetype-score ${level}">${result.score}%</span>
            </div>
            <div class="match-bar">
                <div class="match-fill ${level}" style="width: ${result.score}%"></div>
            </div>
            <div class="archetype-desc">${result.description}</div>
            <div class="key-cards-preview">
                ${keyCardsPreview}
                ${missingPreview}
            </div>
        `;
        
        archetypeResults.appendChild(div);
    });
}

// 显示流派详情
function showArchetypeGuide(archetype) {
    guideContent.innerHTML = '';
    
    // 核心卡
    if (archetype.guide.core && archetype.guide.core.length > 0) {
        guideContent.appendChild(createGuideSection('核心卡牌', archetype.guide.core, 'core'));
    }
    
    // 重要卡
    if (archetype.guide.important && archetype.guide.important.length > 0) {
        guideContent.appendChild(createGuideSection('重要卡牌', archetype.guide.important, 'important'));
    }
    
    // 辅助卡
    if (archetype.guide.support && archetype.guide.support.length > 0) {
        guideContent.appendChild(createGuideSection('辅助卡牌', archetype.guide.support, 'support'));
    }
    
    // 提示
    if (archetype.guide.tips) {
        const tipsSection = document.createElement('div');
        tipsSection.className = 'guide-section';
        tipsSection.innerHTML = `
            <h3>💡 流派提示</h3>
            <p style="color: #aaa; line-height: 1.6;">${archetype.guide.tips}</p>
        `;
        guideContent.appendChild(tipsSection);
    }
    
    // 显示匹配情况
    const matchSection = document.createElement('div');
    matchSection.className = 'guide-section';
    matchSection.innerHTML = `
        <h3>📊 匹配情况</h3>
        <p style="color: #aaa;">
            已拥有关键卡: ${archetype.keyOwned} / ${archetype.keyTotal}<br>
            已拥有辅助卡: ${archetype.supportOwned} / ${archetype.supportTotal}
        </p>
    `;
    guideContent.appendChild(matchSection);
    
    archetypeGuide.style.display = 'block';
    archetypeGuide.scrollIntoView({ behavior: 'smooth' });
}

// 创建指南区块
function createGuideSection(title, cards, importance) {
    const section = document.createElement('div');
    section.className = 'guide-section';
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    section.appendChild(titleEl);
    
    const grid = document.createElement('div');
    grid.className = 'guide-cards';
    
    cards.forEach(cardName => {
        const cardDiv = document.createElement('div');
        // 检查是否已拥有
        const data = CHARACTER_DATA[currentCharacter];
        const owned = checkCardOwned(cardName, data);
        cardDiv.className = `guide-card ${owned ? 'owned' : ''}`;
        
        cardDiv.innerHTML = `
            <span class="guide-card-name">${cardName}</span>
            <span class="guide-card-importance ${importance}">${getImportanceLabel(importance)}</span>
        `;
        
        grid.appendChild(cardDiv);
    });
    
    section.appendChild(grid);
    return section;
}

// 检查卡牌是否拥有
function checkCardOwned(cardName, data) {
    for (const type of ['attacks', 'skills', 'powers']) {
        if (data.cards[type]) {
            const card = data.cards[type].find(c => c.name === cardName || c.name.includes(cardName));
            if (card && selectedCards.includes(card.id)) {
                return true;
            }
        }
    }
    return false;
}

// 获取重要性标签
function getImportanceLabel(importance) {
    const labels = {
        core: '核心',
        important: '重要',
        support: '辅助'
    };
    return labels[importance] || importance;
}
