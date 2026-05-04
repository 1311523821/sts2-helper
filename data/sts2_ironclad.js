// 杀戮尖塔2 - 铁甲战士数据
// 注意：STS2目前处于Early Access，数据可能不完整，欢迎补充！

const IRONCLAD_STS2_DATA = {
    name: "铁甲战士",
    nameEn: "Ironclad",
    game: "sts2",
    version: "early-access",
    lastUpdate: "2026-05-02",
    
    // 卡牌列表（待补充）
    cards: {
        attacks: [
            { id: "strike", name: "打击", type: "attack", rarity: "basic", desc: "造成6点伤害" },
            { id: "bash", name: "痛击", type: "attack", rarity: "basic", desc: "造成8点伤害，施加2层易伤" },
            // TODO: 补充更多卡牌
        ],
        skills: [
            { id: "defend", name: "防御", type: "skill", rarity: "basic", desc: "获得5点护甲" },
            // TODO: 补充更多卡牌
        ],
        powers: [
            // TODO: 补充能力牌
        ]
    },
    
    // 流派定义（基于STS1，待验证）
    archetypes: [
        {
            id: "strength",
            name: "力量流",
            description: "通过叠加力量大幅提升攻击伤害",
            status: "待验证",
            keyCards: [], // TODO: 补充关键卡
            supportCards: [],
            evaluate: function(ownedCards) {
                // TODO: 实现评估逻辑
                return { score: 0, keyOwned: 0, keyTotal: 0 };
            },
            guide: {
                core: [],
                important: [],
                support: [],
                tips: "力量流是经典流派，预计在STS2中仍然强力。"
            }
        },
        {
            id: "block",
            name: "防战流",
            description: "利用高额护甲和堡垒能力持续防守反击",
            status: "待验证",
            keyCards: [],
            supportCards: [],
            evaluate: function(ownedCards) {
                return { score: 0, keyOwned: 0, keyTotal: 0 };
            },
            guide: {
                core: [],
                important: [],
                support: [],
                tips: "防战流需要堡垒和护甲相关卡牌。"
            }
        },
        {
            id: "exhaust",
            name: "消耗流",
            description: "通过消耗卡牌触发各种效果",
            status: "待验证",
            keyCards: [],
            supportCards: [],
            evaluate: function(ownedCards) {
                return { score: 0, keyOwned: 0, keyTotal: 0 };
            },
            guide: {
                core: [],
                important: [],
                support: [],
                tips: "消耗流依赖消耗机制相关卡牌。"
            }
        }
    ]
};
