// 铁甲战士数据
const IRONCLAD_DATA = {
    name: "铁甲战士",
    nameEn: "Ironclad",
    
    // 卡牌列表
    cards: {
        attacks: [
            { id: "strike", name: "打击", type: "attack", rarity: "basic", cost: 1, desc: "造成6点伤害。" },
            { id: "bash", name: "痛击", type: "attack", rarity: "basic", cost: 2, desc: "造成8点伤害。施加2层易伤。" },
            { id: "cleave", name: "劈砍", type: "attack", rarity: "common", cost: 1, desc: "对随机敌人造成7点伤害。" },
            { id: "iron_wave", name: "铁波", type: "attack", rarity: "common", cost: 1, desc: "造成5点伤害。获得5点护甲。" },
            { id: "clothesline", name: "晒衣绳", type: "attack", rarity: "common", cost: 2, desc: "造成12点伤害。施加1层脆弱。" },
            { id: "pommel_strike", name: "剑柄打击", type: "attack", rarity: "common", cost: 1, desc: "造成9点伤害。抽1张牌。" },
            { id: "twin_strike", name: "双击", type: "attack", rarity: "common", cost: 1, desc: "造成5点伤害2次。抽1张牌。" },
            { id: "anger", name: "愤怒", type: "attack", rarity: "common", cost: 0, desc: "造成6点伤害。获得1层力量。" },
            { id: "uppercut", name: "上勾拳", type: "attack", rarity: "common", cost: 2, desc: "造成13点伤害。施加1层虚弱和1层易伤。" },
            { id: "metallicize", name: "金属化", type: "attack", rarity: "uncommon", cost: 1, desc: "造成8点伤害。在本回合结束时获得4点护甲。" },
            { id: "rampage", name: "狂暴", type: "attack", rarity: "uncommon", cost: 1, desc: "造成8点伤害。1次升级：伤害+4。" },
            { id: "searing_blow", name: "灼热打击", type: "attack", rarity: "uncommon", cost: 2, desc: "造成12点伤害。12次升级：伤害+4。" },
            { id: "headbutt", name: "头槌", type: "attack", rarity: "common", cost: 1, desc: "造成9点伤害。将1张牌移至抽牌堆顶部。" },
            { id: "blood_blade", name: "血刃", type: "attack", rarity: "common", cost: 1, desc: "造成8点伤害。失去3点生命，改为获得3层力量。" },
            { id: "carnage", name: "屠杀", type: "attack", rarity: "uncommon", cost: 2, desc: "造成20点伤害。" },
            { id: "hemokinesis", name: "放血", type: "attack", rarity: "uncommon", cost: 1, desc: "造成11点伤害。失去3点最大生命。" },
            { id: "pummel", name: "连击", type: "attack", rarity: "uncommon", cost: 1, desc: "造成4点伤害4次。消耗你的手牌。" },
            { id: "sword_boomerang", name: "回旋镖", type: "attack", rarity: "common", cost: 1, desc: "造成3点伤害3次，随机目标。" },
            { id: "wild_strike", name: "野性打击", type: "attack", rarity: "common", cost: 1, desc: "造成12点伤害。抽1张牌。施加1层易伤。" },
            { id: "bloodletting", name: "放血术", type: "attack", rarity: "uncommon", cost: 0, desc: "失去3点生命，改为获得3层力量和3点能量。" },
            { id: "reckless_charge", name: "鲁莽冲锋", type: "attack", rarity: "common", cost: 0, desc: "造成7点伤害。施加2层易伤。" },
            { id: "entrench", name: "壕沟", type: "attack", rarity: "uncommon", cost: 2, desc: "将你的护甲翻倍。" },
            { id: "heavy_blade", name: "重刃", type: "attack", rarity: "common", cost: 2, desc: "造成14点伤害。力量对你攻击的加成x3。" },
            { id: "perfected_strike", name: "完美打击", type: "attack", rarity: "common", cost: 2, desc: "造成6点伤害。每张其他攻击牌使此伤害+3。" },
            { id: "body_slam", name: "身体撞击", type: "attack", rarity: "common", cost: 1, desc: "造成等于你当前护甲值的伤害。" },
            { id: "fiend_fire", name: "恶魔之火", type: "attack", rarity: "rare", cost: 2, desc: "消耗你的手牌，造成2倍消耗卡牌费用的伤害。" },
            { id: "impervious", name: "无敌", type: "attack", rarity: "rare", cost: 2, desc: "获得30点护甲。" },
            { id: "bludgeon", name: "重击", type: "attack", rarity: "rare", cost: 3, desc: "造成32点伤害。" },
            { id: "offering", name: "献祭", type: "attack", rarity: "rare", cost: 0, desc: "失去6点生命，改为获得6点能量，抽6张牌，本回合所有攻击变为无费用。" }
        ],
        skills: [
            { id: "defend", name: "防御", type: "skill", rarity: "basic" },
            { id: "shrug_it_off", name: "耸肩无视", type: "skill", rarity: "common" },
            { id: "armaments", name: "武装", type: "skill", rarity: "common" },
            { id: "flex", name: "屈伸", type: "skill", rarity: "common" },
            { id: "war_cry", name: "战争怒吼", type: "skill", rarity: "common" },
            { id: "barricade", name: "堡垒", type: "skill", rarity: "rare" },
            { id: "flame_barrier", name: "火焰屏障", type: "skill", rarity: "uncommon" },
            { id: "ghostly_armor", name: "幽灵护甲", type: "skill", rarity: "common" },
            { id: "rage", name: "狂怒", type: "skill", rarity: "uncommon" },
            { id: "blood_testing", name: "验血", type: "skill", rarity: "uncommon" },
            { id: "disarm", name: "缴械", type: "skill", rarity: "uncommon" },
            { id: "dual_wield", name: "双持", type: "skill", rarity: "uncommon" },
            { id: "dropkick", name: "飞踢", type: "skill", rarity: "common" },
            { id: "flash_of_steel", name: "钢铁闪光", type: "skill", rarity: "common" },
            { id: "infernal_blade", name: "地狱之刃", type: "skill", rarity: "uncommon" },
            { id: "fire_breathing", name: "火焰吐息", type: "skill", rarity: "uncommon" },
            { id: "inflame", name: "燃烧", type: "skill", rarity: "uncommon" },
            { id: "power_through", name: "硬撑", type: "skill", rarity: "uncommon" },
            { id: "reaper", name: "死神", type: "skill", rarity: "rare" },
            { id: "sever_soul", name: "斩魂", type: "skill", rarity: "uncommon" },
            { id: "spot_weakness", name: "发现弱点", type: "skill", rarity: "common" },
            { id: "shockwave", name: "冲击波", type: "skill", rarity: "uncommon" },
            { id: "true_grit", name: "真汉子", type: "skill", rarity: "common" },
            { id: "warcry", name: "战争怒吼", type: "skill", rarity: "common" },
            { id: "battle_trance", name: "战斗恍惚", type: "skill", rarity: "uncommon" },
            { id: "bloodletting", name: "放血", type: "skill", rarity: "uncommon" },
            { id: "burning_pact", name: "燃烧契约", type: "skill", rarity: "uncommon" },
            { id: "evolve", name: "进化", type: "skill", rarity: "uncommon" },
            { id: "feel_no_pain", name: "无痛", type: "skill", rarity: "uncommon" },
            { id: "second_wind", name: "回气", type: "skill", rarity: "uncommon" }
        ],
        powers: [
            { id: "inflame_power", name: "燃烧", type: "power", rarity: "uncommon" },
            { id: "metallicize_power", name: "金属化", type: "power", rarity: "uncommon" },
            { id: "barricade_power", name: "堡垒", type: "power", rarity: "rare" },
            { id: "demon_form", name: "恶魔形态", type: "power", rarity: "rare" },
            { id: "corruption", name: "腐败", type: "power", rarity: "rare" },
            { id: "brutality", name: "残暴", type: "power", rarity: "rare" },
            { id: "rupture", name: "破裂", type: "power", rarity: "uncommon" },
            { id: "juggernaut", name: "主宰", type: "power", rarity: "rare" },
            { id: "combust", name: "燃烧", type: "power", rarity: "uncommon" },
            { id: "dark_embrace", name: "黑暗拥抱", type: "power", rarity: "uncommon" },
            { id: "fire_breathing_power", name: "火焰吐息", type: "power", rarity: "uncommon" },
            { id: "no_draw", name: "不抽牌", type: "power", rarity: "rare" }
        ]
    },
    
    // 流派定义
    archetypes: [
        {
            id: "strength",
            name: "力量流",
            description: "通过叠加力量来大幅提升攻击伤害，是最直接的流派",
            keyCards: ["demon_form", "inflame", "spot_weakness", "limbs_from_leeches", "heavy_blade", "sword_boomerang"],
            supportCards: ["flex", "offering", "bloodletting", "rupture", "brutality"],
            evaluate: function(ownedCards) {
                let score = 0;
                let keyOwned = 0;
                let supportOwned = 0;
                
                this.keyCards.forEach(card => {
                    if (ownedCards.includes(card)) {
                        keyOwned++;
                        score += 25;
                    }
                });
                
                this.supportCards.forEach(card => {
                    if (ownedCards.includes(card)) {
                        supportOwned++;
                        score += 10;
                    }
                });
                
                // 额外加分：高伤害攻击牌
                if (ownedCards.includes("heavy_blade")) score += 15;
                if (ownedCards.includes("sword_boomerang")) score += 10;
                if (ownedCards.includes("bludgeon")) score += 8;
                
                return {
                    score: Math.min(score, 100),
                    keyOwned: keyOwned,
                    supportOwned: supportOwned,
                    keyTotal: this.keyCards.length,
                    supportTotal: this.supportCards.length
                };
            },
            guide: {
                core: ["恶魔形态 (Demon Form)", "燃烧 (Inflame)", "发现弱点 (Spot Weakness)"],
                important: ["重刃 (Heavy Blade)", "回旋镖 (Sword Boomerang)", "屈伸 (Flex)"],
                support: ["放血 (Bloodletting)", "献祭 (Offering)", "破裂 (Rupture)"],
                tips: "力量流是最直观的伤害流派。恶魔形态是核心，每回合获得力量。配合重刃、回旋镖等多次攻击牌能最大化力量收益。"
            }
        },
        {
            id: "block",
            name: "防战流",
            description: "利用高额护甲和堡垒能力持续防守并反击",
            keyCards: ["barricade", "body_slam", "entrench", "impervious", "feel_no_pain", "juggernaut"],
            supportCards: ["flame_barrier", "rage", "ghostly_armor", "shrug_it_off", "armaments"],
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
                
                // 核心组合加分
                if (ownedCards.includes("barricade") && ownedCards.includes("body_slam")) {
                    score += 30; // 经典组合
                }
                if (ownedCards.includes("entrench") && ownedCards.includes("barricade")) {
                    score += 20;
                }
                if (ownedCards.includes("feel_no_pain") && ownedCards.includes("power_through")) {
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
                core: ["堡垒 (Barricade)", "身体撞击 (Body Slam)", "壕沟 (Entrench)"],
                important: ["无敌 (Impervious)", "无痛 (Feel No Pain)", "主宰 (Juggernaut)"],
                support: ["火焰屏障 (Flame Barrier)", "硬撑 (Power Through)", "幽灵护甲 (Ghostly Armor)"],
                tips: "堡垒是核心，保留护甲到下一回合。配合壕沟翻倍护甲，再用身体撞击造成巨额伤害。无痛和主宰是优秀的辅助能力。"
            }
        },
        {
            id: "infinite",
            name: "无限流",
            description: "通过低费用的循环牌组实现无限回合",
            keyCards: ["dropkick", "flash_of_steel", "anger", "pommel_strike", "shrug_it_off"],
            supportCards: ["corruption", "battle_trance", "true_grit", "rage"],
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
                
                // 核心循环组合
                let lowCostAttacks = ["dropkick", "flash_of_steel", "anger"].filter(c => ownedCards.includes(c)).length;
                if (lowCostAttacks >= 2) score += 20;
                
                if (ownedCards.includes("corruption")) {
                    score += 15; // 腐败让技能牌免费
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
                core: ["飞踢 (Dropkick)", "钢铁闪光 (Flash of Steel)", "愤怒 (Anger)"],
                important: ["剑柄打击 (Pommel Strike)", "腐败 (Corruption)"],
                support: ["战斗恍惚 (Battle Trance)", "真汉子 (True Grit)"],
                tips: "无限流需要极低的牌组（5-10张）。飞踢对虚弱敌人可以回收，钢铁闪光抽牌并造成伤害。腐败让技能牌免费，加速循环。"
            }
        },
        {
            id: "self_damage",
            name: "自残流",
            description: "通过消耗自身生命来获得强大效果",
            keyCards: ["rupture", "bloodletting", "offering", "hemokinesis", "brutality", "reaper"],
            supportCards: ["combust", "self_forming_clay", "rupture", "rage"],
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
                
                // 组合加分
                if (ownedCards.includes("rupture") && ownedCards.includes("bloodletting")) {
                    score += 25;
                }
                if (ownedCards.includes("reaper")) {
                    score += 15; // 恢复生命的关键
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
                core: ["破裂 (Rupture)", "放血 (Bloodletting)", "献祭 (Offering)"],
                important: ["放血术 (Hemokinesis)", "残暴 (Brutality)", "死神 (Reaper)"],
                support: ["燃烧 (Combust)", "自粘黏土 (Self-Forming Clay)"],
                tips: "破裂是核心，每次受伤获得力量。配合放血和献祭主动扣血。死神用于恢复生命值。需要注意生命管理。"
            }
        },
        {
            id: "exhaust",
            name: "消耗流",
            description: "通过消耗卡牌来触发各种效果",
            keyCards: ["feel_no_pain", "dark_embrace", "sever_soul", "fiend_fire", "second_wind"],
            supportCards: ["evolve", "fire_breathing", "corruption", "power_through"],
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
                        score += 8;
                    }
                });
                
                // 组合加分
                if (ownedCards.includes("feel_no_pain") && ownedCards.includes("second_wind")) {
                    score += 20;
                }
                if (ownedCards.includes("dark_embrace") && ownedCards.includes("corruption")) {
                    score += 25;
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
                core: ["无痛 (Feel No Pain)", "黑暗拥抱 (Dark Embrace)", "斩魂 (Sever Soul)"],
                important: ["恶魔之火 (Fiend Fire)", "回气 (Second Wind)", "腐败 (Corruption)"],
                support: ["进化 (Evolve)", "火焰吐息 (Fire Breathing)"],
                tips: "消耗牌库而不是消耗卡组。无痛提供护甲，黑暗拥抱抽牌。腐败让技能牌免费消耗，是强力组合。"
            }
        }
    ]
};
