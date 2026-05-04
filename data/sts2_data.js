// 杀戮尖塔2 数据文件
// 数据来源：B站攻略视频、Steam社区
// 最后更新：2026-05-02

const STS2_DATA = {
    version: "0.2.0",
    lastUpdate: "2026-05-02",
    status: "early-access",
    
    // 角色列表
    characters: {
        // 原有角色
        ironclad: {
            id: "ironclad",
            name: "铁甲战士",
            nameEn: "Ironclad",
            isNew: false,
            description: "经典角色，高生命值，擅长力量叠加和护甲",
            archetypes: ["力量流", "防战流", "无限流", "消耗流"],
            dataFile: "data/ironclad.js" // 暂用STS1数据
        },
        silent: {
            id: "silent",
            name: "静默猎人",
            nameEn: "Silent",
            isNew: false,
            description: "经典角色，擅长毒、小刀、弃牌",
            archetypes: ["毒流", "小刀流", "弃牌流"],
            dataFile: "data/silent.js"
        },
        defect: {
            id: "defect",
            name: "故障机器人",
            nameEn: "Defect",
            isNew: false,
            description: "经典角色，利用各种球进行战斗",
            archetypes: ["电球流", "冰球流", "黑暗球流", "专注流"],
            dataFile: "data/defect.js"
        },
        watcher: {
            id: "watcher",
            name: "观者",
            nameEn: "Watcher",
            isNew: false,
            description: "经典角色，擅长姿态切换和神格",
            archetypes: ["神格流", "姿态切换流", "保留流"],
            dataFile: "data/watcher.js"
        },
        // 新角色
        necromancer: {
            id: "necromancer",
            name: "亡灵契约师",
            nameEn: "Necromancer",
            isNew: true,
            description: "STS2新角色，擅长契约和亡灵机制",
            archetypes: ["契约流", "亡灵流", "骨灰流"],
            dataFile: null, // 待补充
            videoGuide: "https://www.bilibili.com/video/BV1tyNNzxEpK/"
        },
        prince: {
            id: "prince",
            name: "储君",
            nameEn: "Prince",
            isNew: true,
            description: "STS2新角色，擅长攻击卡组合",
            archetypes: ["攻击流", "连胜流"],
            dataFile: null, // 待补充
            videoGuide: "https://www.bilibili.com/video/BV1tyNNzxEpK/"
        }
    },
    
    // 攻略资源
    resources: {
        videos: [
            {
                title: "杀戮尖塔2 全英雄基础流派攻略【完结】",
                url: "https://www.bilibili.com/video/BV1tyNNzxEpK/",
                author: "真国中生",
                description: "包含所有角色的基础流派介绍"
            },
            {
                title: "杀戮尖塔2 战士4种无限轮椅构筑大全",
                url: "搜索: 杀戮尖塔2 战士 无限构筑",
                description: "战士流派详解"
            },
            {
                title: "杀戮尖塔2 亡灵契约师攻略",
                url: "搜索: 杀戮尖塔2 亡灵契约师",
                description: "新角色亡灵的玩法"
            },
            {
                title: "杀戮尖塔2 储君攻略",
                url: "搜索: 杀戮尖塔2 储君",
                description: "新角色储君的玩法"
            }
        ]
    },
    
    // 新机制说明（待补充）
    newMechanics: [
        {
            name: "契约",
            description: "亡灵契约师特有机制"
        },
        {
            name: "骨灰",
            description: "亡灵契约师资源"
        }
    ]
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = STS2_DATA;
}
