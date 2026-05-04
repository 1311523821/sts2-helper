// 杀戮尖塔2数据框架
// 用于存储和更新STS2的卡牌数据

const STS2_DATA = {
    version: "0.1.0",
    lastUpdate: "2026-05-02",
    status: "early-access",
    
    // 角色列表
    characters: [
        {
            id: "ironclad",
            name: "铁甲战士",
            nameEn: "Ironclad",
            unlocked: true,
            dataFile: "sts2_ironclad.js"
        },
        {
            id: "silent",
            name: "静默猎人", 
            nameEn: "Silent",
            unlocked: true,
            dataFile: "sts2_silent.js"
        },
        {
            id: "defect",
            name: "故障机器人",
            nameEn: "Defect",
            unlocked: true,
            dataFile: "sts2_defect.js"
        },
        {
            id: "watcher",
            name: "观者",
            nameEn: "Watcher",
            unlocked: true,
            dataFile: "sts2_watcher.js"
        },
        // 新角色占位
        {
            id: "new_character",
            name: "新角色",
            nameEn: "New Character",
            unlocked: false,
            dataFile: "sts2_new_character.js",
            note: "待确认STS2新角色"
        }
    ],
    
    // 新机制说明
    newMechanics: [
        // TODO: 补充STS2新机制
    ],
    
    // 变更说明
    changes: [
        // TODO: 补充与STS1的差异
    ]
};

// 卡牌数据模板
const CARD_TEMPLATE = {
    id: "card_id",
    name: "卡牌名称",
    nameEn: "English Name",
    type: "attack|skill|power|curse|status",
    rarity: "basic|common|uncommon|rare|special",
    cost: 1,
    desc: "卡牌效果描述",
    upgrade: {
        name: "升级后名称",
        desc: "升级后效果",
        cost: null // 升级后费用变化
    },
    tags: [], // 标签：attack, block, strength, etc.
    note: "" // 备注
};

// 流派数据模板
const ARCHETYPE_TEMPLATE = {
    id: "archetype_id",
    name: "流派名称",
    description: "流派描述",
    status: "confirmed|likely|speculative", // 确认/可能/猜测
    keyCards: [], // 核心卡牌ID
    supportCards: [], // 辅助卡牌ID
    relics: [], // 推荐遗物
    evaluate: function(ownedCards) {
        // 评估逻辑
        return {
            score: 0, // 匹配度 0-100
            keyOwned: 0, // 已拥有关键卡数量
            keyTotal: 0, // 关键卡总数
            supportOwned: 0,
            supportTotal: 0
        };
    },
    guide: {
        core: [], // 核心卡牌说明
        important: [], // 重要卡牌
        support: [], // 辅助卡牌
        relics: [], // 推荐遗物
        tips: "流派技巧说明"
    }
};
