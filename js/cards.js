// 卡牌渲染系统

class CardRenderer {
    constructor() {
        this.cardIcons = {
            attack: '⚔️',
            skill: '🛡️',
            power: '⚡'
        };
    }
    
    // 渲染单个卡牌
    renderCard(card, isSelected = false) {
        const typeIcon = this.cardIcons[card.type] || '📋';
        const selectedClass = isSelected ? 'selected' : '';
        
        return `
            <div class="card-display ${card.type} ${card.rarity} ${selectedClass}" 
                 data-card-id="${card.id}" onclick="toggleCardSelection('${card.id}')">
                <div class="card-border"></div>
                <div class="card-header">
                    <span class="card-name">${card.name}</span>
                    <span class="card-cost ${card.cost === 'X' ? 'x-cost' : ''}">${card.cost}</span>
                </div>
                <div class="card-image-area">
                    ${card.image 
                        ? `<img src="${card.image}" alt="${card.name}" class="card-image">` 
                        : `<span class="card-image-placeholder">${typeIcon}</span>`
                    }
                </div>
                <div class="card-effect">
                    <span class="card-effect-text">${this.formatEffect(card.desc)}</span>
                </div>
                <div class="card-footer">
                    <span class="card-type">${this.getTypeName(card.type)}</span>
                    <span class="card-rarity">${this.getRarityName(card.rarity)}</span>
                </div>
            </div>
        `;
    }
    
    // 格式化效果文本
    formatEffect(text) {
        if (!text) return '';
        
        // 高亮数值
        text = text.replace(/(\d+)/g, '<span class="value">$1</span>');
        
        // 高亮关键字
        const keywords = ['力量', '敏捷', '护甲', '易伤', '虚弱', '中毒', '燃烧', '消耗', '保留', '固有', '虚无'];
        keywords.forEach(kw => {
            const regex = new RegExp(kw, 'g');
            text = text.replace(regex, `<span class="keyword">${kw}</span>`);
        });
        
        return text;
    }
    
    // 获取类型名称
    getTypeName(type) {
        const types = {
            attack: '攻击',
            skill: '技能',
            power: '能力'
        };
        return types[type] || type;
    }
    
    // 获取稀有度名称
    getRarityName(rarity) {
        const rarities = {
            basic: '基础',
            common: '普通',
            uncommon: '罕见',
            rare: '稀有',
            special: '特殊'
        };
        return rarities[rarity] || rarity;
    }
    
    // 渲染卡牌网格
    renderCardsGrid(cards, selectedCards = []) {
        return `
            <div class="cards-grid">
                ${cards.map(card => this.renderCard(card, selectedCards.includes(card.id))).join('')}
            </div>
        `;
    }
}

// 创建全局实例
const cardRenderer = new CardRenderer();
