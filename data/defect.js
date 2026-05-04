// 故障机器人数据
const DEFECT_DATA = {
    name: "故障机器人",
    nameEn: "Defect",
    
    cards: {
        attacks: [
            { id: "strike", name: "打击", type: "attack", rarity: "basic" },
            { id: "beam_cell", name: "光束", type: "attack", rarity: "common" },
            { id: "claw", name: "爪击", type: "attack", rarity: "common" },
            { id: "compile_driver", name: "编译驱动", type: "attack", rarity: "common" },
            { id: "go_for_the_eyes", name: "直击要害", type: "attack", rarity: "common" },
            { id: "streamline", name: "流线", type: "attack", rarity: "common" },
            { id: "ball_lightning", name: "球状闪电", type: "attack", rarity: "common" },
            { id: "barrage", name: "弹幕", type: "attack", rarity: "common" },
            { id: "cold_snap", name: "寒潮", type: "attack", rarity: "common" },
            { id: "dark_shackle", name: "黑暗枷锁", type: "attack", rarity: "uncommon" },
            { id: "dramatic_entrance", name: "戏剧性登场", type: "attack", rarity: "uncommon" },
            { id: "heatsinks", name: "散热器", type: "attack", rarity: "common" },
            { id: "melter", name: "熔解", type: "attack", rarity: "common" },
            { id: "reprogram", name: "重新编程", type: "attack", rarity: "uncommon" },
            { id: "sunder", name: "分裂", type: "attack", rarity: "uncommon" },
            { id: "tempest", name: "风暴", type: "attack", rarity: "uncommon" },
            { id: "thunder_strike", name: "雷击", type: "attack", rarity: "rare" },
            { id: "meteor_strike", name: "陨石打击", type: "attack", rarity: "rare" },
            { id: "hyperbeam", name: "超能光束", type: "attack", rarity: "rare" },
            { id: "thunderclap", name: "雷鸣", type: "attack", rarity: "common" }
        ],
        skills: [
            { id: "defend", name: "防御", type: "skill", rarity: "basic" },
            { id: "zap", name: "电击", type: "skill", rarity: "basic" },
            { id: "ascenders_bane", name: "攀登者之咒", type: "skill", rarity: "common" },
            { id: "auto_shields", name: "自动护盾", type: "skill", rarity: "common" },
            { id: "boot_sequence", name: "启动程序", type: "skill", rarity: "common" },
            { id: "charge_battery", name: "充电电池", type: "skill", rarity: "common" },
            { id: "cold_snap_skill", name: "寒潮", type: "skill", rarity: "common" },
            { id: "compile_driver_skill", name: "编译驱动", type: "skill", rarity: "common" },
            { id: "cooled_engine", name: "冷却引擎", type: "skill", rarity: "uncommon" },
            { id: "dark_shackles", name: "黑暗枷锁", type: "skill", rarity: "uncommon" },
            { id: "defragment", name: "碎片整理", type: "skill", rarity: "uncommon" },
            { id: "equilibrium", name: "平衡", type: "skill", rarity: "uncommon" },
            { id: "force_field", name: "力场", type: "skill", rarity: "uncommon" },
            { id: "genetic_algorithm", name: "遗传算法", type: "skill", rarity: "uncommon" },
            { id: "glacier", name: "冰川", type: "skill", rarity: "uncommon" },
            { id: "go_for_the_eyes_skill", name: "直击要害", type: "skill", rarity: "common" },
            { id: "heat_shields", name: "热盾", type: "skill", rarity: "uncommon" },
            { id: "hologram", name: "全息图", type: "skill", rarity: "uncommon" },
            { id: "lock_on", name: "锁定", type: "skill", rarity: "uncommon" },
            { id: "melter_skill", name: "熔解", type: "skill", rarity: "common" },
            { id: "overclock", name: "超频", type: "skill", rarity: "uncommon" },
            { id: "recurse", name: "递归", type: "skill", rarity: "uncommon" },
            { id: "repel", name: "排斥", type: "skill", rarity: "uncommon" },
            { id: "restart", name: "重启", type: "skill", rarity: "rare" },
            { id: "scrape", name: "刮擦", type: "skill", rarity: "uncommon" },
            { id: "skim", name: "略读", type: "skill", rarity: "common" },
            { id: "stack", name: "堆叠", type: "skill", rarity: "common" },
            { id: "steam_barrier", name: "蒸汽屏障", type: "skill", rarity: "common" },
            { id: "sweeping_beam", name: "横扫光束", type: "skill", rarity: "common" },
            { id: "white_noise", name: "白噪音", type: "skill", rarity: "uncommon" },
            { id: "reboot", name: "重启", type: "skill", rarity: "rare" },
            { id: "seek", name: "搜寻", type: "skill", rarity: "rare" },
            { id: "amplify", name: "放大", type: "skill", rarity: "rare" },
            { id: "emergency", name: "紧急", type: "skill", rarity: "rare" }
        ],
        powers: [
            { id: "static_discharge", name: "静电放电", type: "power", rarity: "uncommon" },
            { id: "storm", name: "风暴", type: "power", rarity: "uncommon" },
            { id: "hello_world", name: "你好世界", type: "power", rarity: "uncommon" },
            { id: "self_repair", name: "自我修复", type: "power", rarity: "uncommon" },
            { id: "buffer", name: "缓冲", type: "power", rarity: "rare" },
            { id: "core_memory", name: "核心记忆", type: "power", rarity: "uncommon" },
            { id: "creative_ai", name: "创造AI", type: "power", rarity: "rare" },
            { id: "echo_form", name: "回声形态", type: "power", rarity: "rare" },
            { id: "electrodynamics", name: "电动力学", type: "power", rarity: "rare" },
            { id: "biased_cognition", name: "偏见认知", type: "power", rarity: "rare" },
            { id: "capacitor", name: "电容器", type: "power", rarity: "uncommon" },
            { id: "defragment", name: "碎片整理", type: "power", rarity: "uncommon" },
            { id: "all_for_one", name: "合二为一", type: "power", rarity: "rare" },
            { id: "fusion_turbine", name: "聚变涡轮", type: "power", rarity: "uncommon" }
        ]
    },
    
    archetypes: [
        {
            id: "lightning",
            name: "电球流",
            description: "利用电球进行高频伤害输出",
            keyCards: ["electrodynamics", "ball_lightning", "tempest", "defragment", "static_discharge", "thunder_strike"],
            supportCards: ["zap", "capacitor", "loop", "storm", "barrage"],
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
                if (ownedCards.includes("defragment") && ownedCards.includes("ball_lightning")) {
                    score += 20;
                }
                if (ownedCards.includes("electrodynamics")) {
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
                core: ["电动力学 (Electrodynamics)", "球状闪电 (Ball Lightning)", "碎片整理 (Defragment)"],
                important: ["风暴 (Tempest)", "雷击 (Thunder Strike)", "静电放电 (Static Discharge)"],
                support: ["电击 (Zap)", "电容器 (Capacitor)", "弹幕 (Barrage)"],
                tips: "电球流是机器人的基础流派。电动力学让电球攻击所有敌人。碎片整理提升球位，让你能存储更多球。配合弹幕多次触发球效果。"
            }
        },
        {
            id: "frost",
            name: "冰球流",
            description: "利用冰球堆叠护甲，稳扎稳打",
            keyCards: ["glacier", "coolheaded", "force_field", "frost_orbs", "equilibrium", "capacitor"],
            supportCards: ["cold_snap", "loop", "genetic_algorithm", "auto_shields", "steam_barrier"],
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
                if (ownedCards.includes("glacier") && ownedCards.includes("capacitor")) {
                    score += 20;
                }
                if (ownedCards.includes("loop")) {
                    score += 15; // 让冰球多次触发
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
                core: ["冰川 (Glacier)", "冷静 (Coolheaded)", "力场 (Force Field)"],
                important: ["平衡 (Equilibrium)", "电容器 (Capacitor)", "循环 (Loop)"],
                support: ["寒潮 (Cold Snap)", "遗传算法 (Genetic Algorithm)", "自动护盾 (Auto Shields)"],
                tips: "冰球流非常稳定，冰川提供冰球和护甲。电容器增加球位是关键。配合循环可以让冰球多次触发。适合稳扎稳打。"
            }
        },
        {
            id: "dark",
            name: "黑暗球流",
            description: "蓄力黑暗球打出巨额伤害",
            keyCards: ["darkness", "doom_and_gloom", "meteor_strike", "multicast", "recursion"],
            supportCards: ["defragment", "capacitor", "core_memory", "seek", "amplify"],
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
                
                // 黑暗球蓄力组合
                if (ownedCards.includes("multicast") && ownedCards.includes("darkness")) {
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
                core: ["黑暗 (Darkness)", "末日凶兆 (Doom and Gloom)", "陨石打击 (Meteor Strike)"],
                important: ["多重施法 (Multicast)", "递归 (Recursion)", "搜寻 (Seek)"],
                support: ["碎片整理 (Defragment)", "核心记忆 (Core Memory)", "放大 (Amplify)"],
                tips: "黑暗球每回合蓄力，伤害会越来越高。多重施法可以一次性释放多个球。递归可以让黑暗球回到球位继续蓄力。是一套高爆发流派。"
            }
        },
        {
            id: "power",
            name: "能力流",
            description: "大量能力牌叠加各种效果",
            keyCards: ["creative_ai", "echo_form", "hello_world", "heatsinks", "storm", "static_discharge"],
            supportCards: ["amplify", "magnetism", "core_memory", "self_repair", "buffer"],
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
                
                // 能力数量加分
                let powerCount = ownedCards.filter(c => 
                    ["creative_ai", "echo_form", "hello_world", "heatsinks", "storm", "static_discharge", "self_repair", "buffer"].includes(c)
                ).length;
                if (powerCount >= 3) score += 20;
                
                return {
                    score: Math.min(score, 100),
                    keyOwned: keyOwned,
                    supportOwned: supportOwned,
                    keyTotal: this.keyCards.length,
                    supportTotal: this.supportCards.length
                };
            },
            guide: {
                core: ["创造AI (Creative AI)", "回声形态 (Echo Form)", "你好世界 (Hello World)"],
                important: ["散热器 (Heatsinks)", "风暴 (Storm)", "静电放电 (Static Discharge)"],
                support: ["放大 (Amplify)", "自我修复 (Self Repair)", "缓冲 (Buffer)"],
                tips: "能力流通过大量能力牌叠加效果。创造AI每回合获得新能力，回声形态让牌打出两次。需要大量能量支持。"
            }
        },
        {
            id: "claw",
            name: "爪击流",
            description: "利用爪击和0费牌进行爆发",
            keyCards: ["claw", "reprogram", "scrape", "all_for_one", "compile_driver", "steam_barrier"],
            supportCards: ["beam_cell", "go_for_the_eyes", "lock_on", "hologram", "sunder"],
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
                
                // 爪击核心
                let clawCount = ownedCards.filter(c => c === "claw").length || (ownedCards.includes("claw") ? 3 : 0);
                score += clawCount * 5;
                
                if (ownedCards.includes("all_for_one") && ownedCards.includes("claw")) {
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
                core: ["爪击 (Claw)", "重新编程 (Reprogram)", "合二为一 (All For One)"],
                important: ["刮擦 (Scrape)", "编译驱动 (Compile Driver)", "光束 (Beam Cell)"],
                support: ["蒸汽屏障 (Steam Barrier)", "全息图 (Hologram)", "分裂 (Sunder)"],
                tips: "爪击流是个梗流派但也很实用。爪击每次打出都会让所有爪击伤害+2。合二为一可以回收用过的0费牌。重新编程让你获得力量和敏捷。"
            }
        },
        {
            id: "focus",
            name: "专注流",
            description: "通过提升专注来强化所有球效果",
            keyCards: ["defragment", "biased_cognition", "genetic_algorithm", "capacitor", "loop"],
            supportCards: ["glacier", "ball_lightning", "darkness", "coolheaded", "equilibrium"],
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
                
                // 专注核心
                if (ownedCards.includes("biased_cognition")) {
                    score += 15;
                }
                if (ownedCards.includes("defragment") && ownedCards.includes("capacitor")) {
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
                core: ["碎片整理 (Defragment)", "偏见认知 (Biased Cognition)", "电容器 (Capacitor)"],
                important: ["遗传算法 (Genetic Algorithm)", "循环 (Loop)"],
                support: ["冰川 (Glacier)", "球状闪电 (Ball Lightning)", "黑暗 (Darkness)"],
                tips: "专注提升所有球的效果。偏见认知每回合增加专注但会衰减。碎片整理直接增加专注。配合任意球流派都非常强力。"
            }
        }
    ]
};
