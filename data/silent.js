// 静默猎人数据
const SILENT_DATA = {
    name: "静默猎人",
    nameEn: "Silent",
    
    cards: {
        attacks: [
            { id: "strike", name: "打击", type: "attack", rarity: "basic" },
            { id: "neutralize", name: "中和", type: "attack", rarity: "basic" },
            { id: "bane", name: "祸根", type: "attack", rarity: "common" },
            { id: "cloak_and_dagger", name: "暗器", type: "attack", rarity: "common" },
            { id: "dagger_throw", name: "飞刀投掷", type: "attack", rarity: "common" },
            { id: "flying_knee", name: "飞膝", type: "attack", rarity: "common" },
            { id: "poisoned_stab", name: "毒刺", type: "attack", rarity: "common" },
            { id: "quick_slash", name: "快斩", type: "attack", rarity: "common" },
            { id: "slice", name: "切裂", type: "attack", rarity: "common" },
            { id: "stiletto", name: "细剑", type: "attack", rarity: "common" },
            { id: "throat_slit", name: "割喉", type: "attack", rarity: "common" },
            { id: "blade_dance", name: "刀舞", type: "attack", rarity: "common" },
            { id: "catalyst", name: "催化剂", type: "attack", rarity: "uncommon" },
            { id: "choking_cloud", name: "窒息之云", type: "attack", rarity: "common" },
            { id: "skewer", name: "串刺", type: "attack", rarity: "uncommon" },
            { id: "dash", name: "冲刺", type: "attack", rarity: "common" },
            { id: "sneaky_strike", name: "偷袭", type: "attack", rarity: "common" },
            { id: "outmaneuver", name: "声东击西", type: "attack", rarity: "common" },
            { id: "piercing_wail", name: "刺耳尖叫", type: "attack", rarity: "common" },
            { id: "glass_knife", name: "玻璃刀", type: "attack", rarity: "uncommon" },
            { id: "masterful_stab", name: "大师之刺", type: "attack", rarity: "uncommon" },
            { id: "grand_finale", name: "终曲", type: "attack", rarity: "rare" },
            { id: "die_die_die", name: "去死吧", type: "attack", rarity: "rare" },
            { id: "bullet_time", name: "子弹时间", type: "attack", rarity: "rare" },
            { id: "storm_of_steel", name: "钢铁风暴", type: "attack", rarity: "rare" }
        ],
        skills: [
            { id: "defend", name: "防御", type: "skill", rarity: "basic" },
            { id: "survivor", name: "幸存者", type: "skill", rarity: "basic" },
            { id: "acrobatics", name: "杂技", type: "skill", rarity: "common" },
            { id: "backflip", name: "后空翻", type: "skill", rarity: "common" },
            { id: "blade_dance_skill", name: "刀舞", type: "skill", rarity: "common" },
            { id: "blur", name: "模糊", type: "skill", rarity: "uncommon" },
            { id: "calculated_gamble", name: "计算赌注", type: "skill", rarity: "uncommon" },
            { id: "concentrate", name: "集中", type: "skill", rarity: "uncommon" },
            { id: "dodge_and_roll", name: "闪避翻滚", type: "skill", rarity: "common" },
            { id: "draw_cards", name: "抽牌", type: "skill", rarity: "common" },
            { id: "escape_plan", name: "逃跑计划", type: "skill", rarity: "common" },
            { id: "expertise", name: "专精", type: "skill", rarity: "uncommon" },
            { id: "footwork", name: "脚步", type: "skill", rarity: "uncommon" },
            { id: "infinit_blade", name: "无限刀刃", type: "skill", rarity: "uncommon" },
            { id: "outmaneuver_skill", name: "声东击西", type: "skill", rarity: "common" },
            { id: "prepared", name: "准备", type: "skill", rarity: "common" },
            { id: "reflex", name: "反射", type: "skill", rarity: "uncommon" },
            { id: "setup", name: "布局", type: "skill", rarity: "uncommon" },
            { id: "tactics", name: "战术", type: "skill", rarity: "uncommon" },
            { id: "blind", name: "致盲", type: "skill", rarity: "uncommon" },
            { id: "distraction", name: "分心", type: "skill", rarity: "uncommon" },
            { id: "forethought", name: "预谋", type: "skill", rarity: "uncommon" },
            { id: "planning", name: "计划", type: "skill", rarity: "uncommon" },
            { id: "furtive", name: "潜行", type: "skill", rarity: "uncommon" },
            { id: "nightmare", name: "噩梦", type: "skill", rarity: "rare" },
            { id: "wraith_form", name: "幽灵形态", type: "skill", rarity: "rare" },
            { id: "malaise", name: "不适", type: "skill", rarity: "rare" },
            { id: "unload", name: "卸载", type: "skill", rarity: "rare" }
        ],
        powers: [
            { id: "after_image", name: "残影", type: "power", rarity: "uncommon" },
            { id: "accuracy", name: "精准", type: "power", rarity: "uncommon" },
            { id: "catalyst_power", name: "催化剂", type: "power", rarity: "uncommon" },
            { id: "corpse_explosion", name: "尸爆", type: "power", rarity: "rare" },
            { id: "envenom", name: "涂毒", type: "power", rarity: "uncommon" },
            { id: "noxious_fumes", name: "毒雾", type: "power", rarity: "uncommon" },
            { id: "infinite_blades", name: "无限刀刃", type: "power", rarity: "uncommon" },
            { id: "nightmare_power", name: "噩梦", type: "power", rarity: "rare" },
            { id: "phantasmal_killer", name: "幻影杀手", type: "power", rarity: "rare" },
            { id: "poison_cloud", name: "毒云", type: "power", rarity: "uncommon" },
            { id: "well_laid_plans", name: "周密计划", type: "power", rarity: "uncommon" },
            { id: "bouncing_flask", name: "弹跳烧瓶", type: "power", rarity: "uncommon" }
        ]
    },
    
    archetypes: [
        {
            id: "poison",
            name: "毒流",
            description: "通过叠加毒层数持续造成伤害",
            keyCards: ["catalyst", "noxious_fumes", "bouncing_flask", "corpse_explosion", "envenom", "malaise"],
            supportCards: ["poisoned_stab", "bane", "catalyst", "choking_cloud", "deadly_poison"],
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
                
                // 核心组合
                if (ownedCards.includes("catalyst") && ownedCards.includes("noxious_fumes")) {
                    score += 25;
                }
                if (ownedCards.includes("corpse_explosion")) {
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
                core: ["催化剂 (Catalyst)", "毒雾 (Noxious Fumes)", "弹跳烧瓶 (Bouncing Flask)"],
                important: ["尸爆 (Corpse Explosion)", "涂毒 (Envenom)", "不适 (Malaise)"],
                support: ["毒刺 (Poisoned Stab)", "祸根 (Bane)", "窒息之云 (Choking Cloud)"],
                tips: "毒流的核心是催化剂，可以翻倍或三倍毒层数。毒雾每回合自动上毒，尸爆对小怪有奇效。不需要高力量，毒会自动生效。"
            }
        },
        {
            id: "shiv",
            name: "小刀流",
            description: "生成并利用小刀进行多次攻击",
            keyCards: ["blade_dance", "infinite_blades", "accuracy", "storm_of_steel", "cloack_and_dagger"],
            supportCards: ["shiv", "finisher", "thousand_cuts", "after_image", "envenom"],
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
                if (ownedCards.includes("accuracy") && ownedCards.includes("blade_dance")) {
                    score += 20;
                }
                if (ownedCards.includes("infinite_blades")) {
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
                core: ["刀舞 (Blade Dance)", "精准 (Accuracy)", "无限刀刃 (Infinite Blades)"],
                important: ["钢铁风暴 (Storm of Steel)", "暗器 (Cloak and Dagger)"],
                support: ["终结技 (Finisher)", "千刀万剐 (Thousand Cuts)", "残影 (After Image)"],
                tips: "精准是小刀流的核心能力，让小刀伤害从4变成更高。刀舞和无限刀刃提供稳定的小刀来源。配合涂毒或终结技效果更好。"
            }
        },
        {
            id: "discard",
            name: "弃牌流",
            description: "通过弃牌触发效果，实现循环抽牌",
            keyCards: ["reflex", "tactician", "prepared", "calculated_gamble", "concentrate", "acrobatics"],
            supportCards: ["survivor", "expertise", "setup", "nightmare", "distraction"],
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
                
                // 组合加分
                let discardSynergy = ["reflex", "tactician", "prepared"].filter(c => ownedCards.includes(c)).length;
                if (discardSynergy >= 2) score += 20;
                
                return {
                    score: Math.min(score, 100),
                    keyOwned: keyOwned,
                    supportOwned: supportOwned,
                    keyTotal: this.keyCards.length,
                    supportTotal: this.supportCards.length
                };
            },
            guide: {
                core: ["反射 (Reflex)", "战术 (Tactician)", "准备 (Prepared)"],
                important: ["计算赌注 (Calculated Gamble)", "集中 (Concentrate)", "杂技 (Acrobatics)"],
                support: ["幸存者 (Survivor)", "专精 (Expertise)", "布局 (Setup)"],
                tips: "弃牌流的核心是让弃牌变成收益。反射和战术在弃牌时触发效果。计算赌注可以重置手牌。需要精简牌组。"
            }
        },
        {
            id: "block",
            name: "防毒流",
            description: "高防御配合毒或小刀慢慢磨死敌人",
            keyCards: ["footwork", "after_image", "blur", "dodge_and_roll", "wraith_form"],
            supportCards: ["backflip", "deflect", "piercing_wail", "ghostly_armor", "wall_of_slashes"],
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
                
                // 组合
                if (ownedCards.includes("footwork") && ownedCards.includes("after_image")) {
                    score += 20;
                }
                if (ownedCards.includes("wraith_form")) {
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
                core: ["脚步 (Footwork)", "残影 (After Image)", "模糊 (Blur)"],
                important: ["闪避翻滚 (Dodge and Roll)", "幽灵形态 (Wraith Form)"],
                support: ["后空翻 (Backflip)", "刺耳尖叫 (Piercing Wail)"],
                tips: "防毒流通过高防御拖住战局，配合毒或小刀慢慢消耗敌人。脚步增加基础防御，模糊保留护甲。幽灵形态提供无敌但会持续掉血。"
            }
        },
        {
            id: "draw_combo",
            name: "抽牌爆发流",
            description: "大量抽牌，一回合打出高额伤害",
            keyCards: ["nightmare", "bullet_time", "grand_finale", "acrobatics", "expertise", "concentrate"],
            supportCards: ["prepared", "reflex", "draw_cards", "adrenaline"],
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
                
                // 特殊组合
                if (ownedCards.includes("grand_finale") && ownedCards.includes("acrobatics")) {
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
                core: ["噩梦 (Nightmare)", "子弹时间 (Bullet Time)", "终曲 (Grand Finale)"],
                important: ["杂技 (Acrobatics)", "专精 (Expertise)", "集中 (Concentrate)"],
                support: ["准备 (Prepared)", "反射 (Reflex)"],
                tips: "抽牌爆发流需要精准的牌组控制。终曲在牌库为空时打出巨量伤害。子弹时间让你打出更多牌。噩梦可以复制关键牌。"
            }
        }
    ]
};
