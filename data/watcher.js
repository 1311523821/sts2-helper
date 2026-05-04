// 观者数据
const WATCHER_DATA = {
    name: "观者",
    nameEn: "Watcher",
    
    cards: {
        attacks: [
            { id: "strike", name: "打击", type: "attack", rarity: "basic" },
            { id: "eruption", name: "爆发", type: "attack", rarity: "basic" },
            { id: "alpha", name: "阿尔法", type: "attack", rarity: "uncommon" },
            { id: "beta", name: "贝塔", type: "attack", rarity: "uncommon" },
            { id: "omega", name: "欧米伽", type: "attack", rarity: "uncommon" },
            { id: "battle_hymn", name: "战歌", type: "attack", rarity: "uncommon" },
            { id: "carve_reality", name: "刻划现实", type: "attack", rarity: "uncommon" },
            { id: "conclude", name: "终结", type: "attack", rarity: "rare" },
            { id: "consecrate", name: "圣化", type: "attack", rarity: "common" },
            { id: "crush_joints", name: "粉碎关节", type: "attack", rarity: "common" },
            { id: "cut_through_fate", name: "斩断命运", type: "attack", rarity: "common" },
            { id: "dash", name: "冲刺", type: "attack", rarity: "common" },
            { id: "defiant_roar", name: "挑衅怒吼", type: "attack", rarity: "uncommon" },
            { id: "drain_divine", name: "汲取神圣", type: "attack", rarity: "uncommon" },
            { id: "fall", name: "坠落", type: "attack", rarity: "uncommon" },
            { id: "flurry_of_blows", name: "连击风暴", type: "attack", rarity: "uncommon" },
            { id: "flying_sleeves", name: "飞袖", type: "attack", rarity: "common" },
            { id: "headbutt", name: "头槌", type: "attack", rarity: "common" },
            { id: "judgement", name: "审判", type: "attack", rarity: "rare" },
            { id: "just_lucky", name: "幸运", type: "attack", rarity: "common" },
            { id: "lesson_learned", name: "学到教训", type: "attack", rarity: "uncommon" },
            { id: "miracle", name: "奇迹", type: "attack", rarity: "uncommon" },
            { id: "reach_heaven", name: "触天", type: "attack", rarity: "uncommon" },
            { id: "signature_move", name: "签名招式", type: "attack", rarity: "uncommon" },
            { id: "talk_to_the_hand", name: "对话", type: "attack", rarity: "uncommon" },
            { id: "tantrum", name: "发怒", type: "attack", rarity: "uncommon" },
            { id: "thalassophobia", name: "深海恐惧", type: "attack", rarity: "uncommon" },
            { id: "wheel_kick", name: "回旋踢", type: "attack", rarity: "common" },
            { id: "windmill_strike", name: "风车击", type: "attack", rarity: "uncommon" },
            { id: "with_it_time", name: "此时此刻", type: "attack", rarity: "rare" }
        ],
        skills: [
            { id: "defend", name: "防御", type: "skill", rarity: "basic" },
            { id: "vigilance", name: "警惕", type: "skill", rarity: "basic" },
            { id: "accept_darkness", name: "接受黑暗", type: "skill", rarity: "uncommon" },
            { id: "attunement", name: "调谐", type: "skill", rarity: "uncommon" },
            { id: "clear_the_mind", name: "清心", type: "skill", rarity: "common" },
            { id: "commune", name: "冥想", type: "skill", rarity: "uncommon" },
            { id: "cry_of_terror", name: "恐惧之泪", type: "skill", rarity: "uncommon" },
            { id: "deceive_reality", name: "欺骗现实", type: "skill", rarity: "uncommon" },
            { id: "empty_body", name: "空身", type: "skill", rarity: "common" },
            { id: "empty_fist", name: "空拳", type: "skill", rarity: "common" },
            { id: "empty_mind", name: "空心", type: "skill", rarity: "common" },
            { id: "evaluate", name: "评估", type: "skill", rarity: "common" },
            { id: "fear_no_evil", name: "无惧邪恶", type: "skill", rarity: "common" },
            { id: "foreign_influence", name: "外来影响", type: "skill", rarity: "uncommon" },
            { id: "halt", name: "停止", type: "skill", rarity: "common" },
            { id: "indignation", name: "义愤", type: "skill", rarity: "uncommon" },
            { id: "inner_peace", name: "内心平静", type: "skill", rarity: "uncommon" },
            { id: "insight", name: "洞察", type: "skill", rarity: "uncommon" },
            { id: "like_water", name: "如水", type: "skill", rarity: "uncommon" },
            { id: "mental_fortress", name: "精神堡垒", type: "skill", rarity: "uncommon" },
            { id: "meditate", name: "冥想", type: "skill", rarity: "rare" },
            { id: "nirvana", name: "涅槃", type: "skill", rarity: "uncommon" },
            { id: "prayer", name: "祈祷", type: "skill", rarity: "uncommon" },
            { id: "prostrate", name: "跪拜", type: "skill", rarity: "common" },
            { id: "protect", name: "保护", type: "skill", rarity: "common" },
            { id: "rushdown", name: "急攻", type: "skill", rarity: "uncommon" },
            { id: "scrawl", name: "涂鸦", type: "skill", rarity: "uncommon" },
            { id: "simulate_dao", name: "模拟道", type: "skill", rarity: "uncommon" },
            { id: "spirit_shield", name: "灵盾", type: "skill", rarity: "rare" },
            { id: "swivel", name: "回旋", type: "skill", rarity: "uncommon" },
            { id: "third_eye", name: "第三眼", type: "skill", rarity: "common" },
            { id: "vault", name: "金库", type: "skill", rarity: "rare" },
            { id: "wave_of_the_hand", name: "挥手", type: "skill", rarity: "uncommon" },
            { id: "wish", name: "许愿", type: "skill", rarity: "rare" },
            { id: "worship", name: "崇拜", type: "skill", rarity: "uncommon" }
        ],
        powers: [
            { id: "alpha_power", name: "阿尔法", type: "power", rarity: "uncommon" },
            { id: "battle_hymn_power", name: "战歌", type: "power", rarity: "uncommon" },
            { id: "blasphemy", name: "亵渎", type: "power", rarity: "uncommon" },
            { id: "bottled_tornado", name: "龙卷风之瓶", type: "power", rarity: "uncommon" },
            { id: "collect", name: "收集", type: "power", rarity: "uncommon" },
            { id: "constancy", name: "恒定", type: "power", rarity: "uncommon" },
            { id: "deva_form", name: "天神形态", type: "power", rarity: "rare" },
            { id: "establishment", name: "建立", type: "power", rarity: "uncommon" },
            { id: "foresight", name: "远见", type: "power", rarity: "uncommon" },
            { id: "master_reality", name: "主宰现实", type: "power", rarity: "rare" },
            { id: "omega_power", name: "欧米伽", type: "power", rarity: "uncommon" },
            { id: "pressure_points", name: "穴位", type: "power", rarity: "uncommon" },
            { id: "ragnarok", name: "诸神黄昏", type: "power", rarity: "rare" },
            { id: "spirit_loop", name: "灵循环", type: "power", rarity: "uncommon" }
        ]
    },
    
    archetypes: [
        {
            id: "divinity",
            name: "神格流",
            description: "快速进入神格状态，造成巨额伤害",
            keyCards: ["blasphemy", "deva_form", "worship", "prostrate", "prayer", "omniscience"],
            supportCards: ["inner_peace", "meditate", "commune", "miracle", "establishment"],
            evaluate: function(ownedCards) {
                let score = 0;
                let keyOwned = 0;
                let supportOwned = 0;
                
                this.keyCards.forEach(card => {
                    if (ownedCards.includes(card)) {
                        keyOwned++;
                        score += 22;
                    }
                });
                
                this.supportCards.forEach(card => {
                    if (ownedCards.includes(card)) {
                        supportOwned++;
                        score += 8;
                    }
                });
                
                // 神格核心组合
                if (ownedCards.includes("blasphemy") && ownedCards.includes("omniscience")) {
                    score += 25;
                }
                if (ownedCards.includes("deva_form")) {
                    score += 15;
                }
                
                return {
                    score: Math.min(score, 100),
                    keyOwned: keyOwned,
                    supportOwned: supportOwned,
                    keyTotal: this.keyCards.length,
                    supportTotal: this.supportCards.length
                };
            },
            guide: {
                core: ["亵渎 (Blasphemy)", "天神形态 (Deva Form)", "崇拜 (Worship)"],
                important: ["跪拜 (Prostrate)", "祈祷 (Prayer)", "全知 (Omniscience)"],
                support: ["内心平静 (Inner Peace)", "冥想 (Meditate)", "奇迹 (Miracle)"],
                tips: "神格状态提供三倍伤害。亵渎是最强的爆发手段，但回合结束会死亡。天神形态每回合自动获得神格能量。需要学会切换姿态。"
            }
        },
        {
            id: "stance_switch",
            name: "姿态切换流",
            description: "频繁切换平静/愤怒姿态触发效果",
            keyCards: ["mental_fortress", "flurry_of_blows", "rushdown", "empty_body", "empty_mind", "cry_of_terror"],
            supportCards: ["eruption", "vigilance", "tantrum", "fear_no_evil", "indignation"],
            evaluate: function(ownedCards) {
                let score = 0;
                let keyOwned = 0;
                let supportOwned = 0;
                
                this.keyCards.forEach(card => {
                    if (ownedCards.includes(card)) {
                        keyOwned++;
                        score += 20;
                    }
                });
                
                this.supportCards.forEach(card => {
                    if (ownedCards.includes(card)) {
                        supportOwned++;
                        score += 8;
                    }
                });
                
                // 姿态切换核心
                if (ownedCards.includes("mental_fortress") && ownedCards.includes("rushdown")) {
                    score += 25;
                }
                if (ownedCards.includes("flurry_of_blows")) {
                    score += 15;
                }
                
                return {
                    score: Math.min(score, 100),
                    keyOwned: keyOwned,
                    supportOwned: supportOwned,
                    keyTotal: this.keyCards.length,
                    supportTotal: this.supportCards.length
                };
            },
            guide: {
                core: ["精神堡垒 (Mental Fortress)", "连击风暴 (Flurry of Blows)", "急攻 (Rushdown)"],
                important: ["空身 (Empty Body)", "空心 (Empty Mind)", "恐惧之泪 (Cry of Terror)"],
                support: ["爆发 (Eruption)", "警惕 (Vigilance)", "发怒 (Tantrum)"],
                tips: "每切换一次姿态就触发效果。精神堡垒提供护甲，连击风暴打人，急攻抽牌。需要低费用牌组来支持频繁切换。"
            }
        },
        {
            id: "retain",
            name: "保留流",
            description: "利用保留机制积蓄力量，一回合爆发",
            keyCards: ["establishment", "meditate", "master_reality", "foresight", "like_water"],
            supportCards: ["third_eye", "prayer", "insight", "constancy", "collect"],
            evaluate: function(ownedCards) {
                let score = 0;
                let keyOwned = 0;
                let supportOwned = 0;
                
                this.keyCards.forEach(card => {
                    if (ownedCards.includes(card)) {
                        keyOwned++;
                        score += 20;
                    }
                });
                
                this.supportCards.forEach(card => {
                    if (ownedCards.includes(card)) {
                        supportOwned++;
                        score += 8;
                    }
                });
                
                // 保留组合
                if (ownedCards.includes("establishment") && ownedCards.includes("meditate")) {
                    score += 25;
                }
                if (ownedCards.includes("master_reality")) {
                    score += 15;
                }
                
                return {
                    score: Math.min(score, 100),
                    keyOwned: keyOwned,
                    supportOwned: supportOwned,
                    keyTotal: this.keyCards.length,
                    supportTotal: this.supportCards.length
                };
            },
            guide: {
                core: ["建立 (Establishment)", "冥想 (Meditate)", "主宰现实 (Master Reality)"],
                important: ["远见 (Foresight)", "如水 (Like Water)", "第三眼 (Third Eye)"],
                support: ["祈祷 (Prayer)", "洞察 (Insight)", "恒定 (Constancy)"],
                tips: "保留牌到下一回合可以触发各种效果。建立让保留牌减费，冥想可以回收关键牌。如水在保留时获得护甲。"
            }
        },
        {
            id: "pressure_points",
            name: "穴位流",
            description: "给敌人叠加穴位标记，一次性引爆",
            keyCards: ["pressure_points", "pressure_points_card", "lesson_learned", "crush_joints", "wave_of_the_hand"],
            supportCards: ["talk_to_the_hand", "consecrate", "judgement", "drain_divine"],
            evaluate: function(ownedCards) {
                let score = 0;
                let keyOwned = 0;
                let supportOwned = 0;
                
                this.keyCards.forEach(card => {
                    if (ownedCards.includes(card)) {
                        keyOwned++;
                        score += 20;
                    }
                });
                
                this.supportCards.forEach(card => {
                    if (ownedCards.includes(card)) {
                        supportOwned++;
                        score += 8;
                    }
                });
                
                // 穴位核心
                if (ownedCards.includes("pressure_points")) {
                    score += 20;
                }
                
                return {
                    score: Math.min(score, 100),
                    keyOwned: keyOwned,
                    supportOwned: supportOwned,
                    keyTotal: this.keyCards.length,
                    supportTotal: this.supportCards.length
                };
            },
            guide: {
                core: ["穴位 (Pressure Points)", "学到教训 (Lesson Learned)", "粉碎关节 (Crush Joints)"],
                important: ["挥手 (Wave of the Hand)", "对话 (Talk to the Hand)"],
                support: ["圣化 (Consecrate)", "审判 (Judgement)", "汲取神圣 (Drain Divine)"],
                tips: "穴位流是观者的特殊流派，叠加穴位后一次引爆。适合对付单体敌人。需要多张穴位牌才能生效。"
            }
        },
        {
            id: "scry",
            name: "预视流",
            description: "利用预视机制控制抽牌和触发效果",
            keyCards: ["foresight", "third_eye", "evaluate", "cut_through_fate", "weave"],
            supportCards: ["insight", "halt", "just_lucky", "nirvana", "scrawl"],
            evaluate: function(ownedCards) {
                let score = 0;
                let keyOwned = 0;
                let supportOwned = 0;
                
                this.keyCards.forEach(card => {
                    if (ownedCards.includes(card)) {
                        keyOwned++;
                        score += 18;
                    }
                });
                
                this.supportCards.forEach(card => {
                    if (ownedCards.includes(card)) {
                        supportOwned++;
                        score += 7;
                    }
                });
                
                // 预视组合
                if (ownedCards.includes("foresight") && ownedCards.includes("third_eye")) {
                    score += 20;
                }
                
                return {
                    score: Math.min(score, 100),
                    keyOwned: keyOwned,
                    supportOwned: supportOwned,
                    keyTotal: this.keyCards.length,
                    supportTotal: this.supportCards.length
                };
            },
            guide: {
                core: ["远见 (Foresight)", "第三眼 (Third Eye)", "评估 (Evaluate)"],
                important: ["斩断命运 (Cut Through Fate)", "洞察 (Insight)", "涅槃 (Nirvana)"],
                support: ["停止 (Halt)", "幸运 (Just Lucky)", "涂鸦 (Scrawl)"],
                tips: "预视让你看到并控制接下来抽到的牌。远见是核心能力牌。配合洞察等触发效果的牌更好。"
            }
        },
        {
            id: "wrath",
            name: "愤怒爆发流",
            description: "利用愤怒状态的双倍伤害快速击杀",
            keyCards: ["tantrum", "eruption", "ragnarok", "carve_reality", "reach_heaven"],
            supportCards: ["conclude", "judgement", "wreath_of_flame", "bloodletting"],
            evaluate: function(ownedCards) {
                let score = 0;
                let keyOwned = 0;
                let supportOwned = 0;
                
                this.keyCards.forEach(card => {
                    if (ownedCards.includes(card)) {
                        keyOwned++;
                        score += 20;
                    }
                });
                
                this.supportCards.forEach(card => {
                    if (ownedCards.includes(card)) {
                        supportOwned++;
                        score += 8;
                    }
                });
                
                // 愤怒核心
                if (ownedCards.includes("tantrum") && ownedCards.includes("carve_reality")) {
                    score += 20;
                }
                
                return {
                    score: Math.min(score, 100),
                    keyOwned: keyOwned,
                    supportOwned: supportOwned,
                    keyTotal: this.keyCards.length,
                    supportTotal: this.supportCards.length
                };
            },
            guide: {
                core: ["发怒 (Tantrum)", "爆发 (Eruption)", "诸神黄昏 (Ragnarok)"],
                important: ["刻划现实 (Carve Reality)", "触天 (Reach Heaven)", "审判 (Judgement)"],
                support: ["终结 (Conclude)", "签名招式 (Signature Move)"],
                tips: "愤怒状态让你造成双倍伤害。发怒让你进入愤怒并攻击，爆发是基础愤怒牌。诸神黄昏是高爆发终结技。需要控制好切换时机。"
            }
        }
    ]
};
