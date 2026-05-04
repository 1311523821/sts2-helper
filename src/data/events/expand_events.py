import json

fpath = r'D:\Agent\sts2-helper\src\data\events\all.json'
with open(fpath, 'r', encoding='utf-8') as f:
    data = json.load(f)

existing_ids = {e['id'] for e in data['events']}
print(f'Current events: {len(data["events"])}')

new_events = [
    # === Act 2 events ===
    {
        "id": "ancient_writing",
        "name": "古代书写",
        "nameEn": "Ancient Writing",
        "act": 2,
        "description": "你发现了一面刻满古代文字的墙壁。",
        "options": [
            { "id": "writing_read", "text": "阅读", "results": [{"type": "upgrade", "value": 2, "description": "升级2张牌"}] },
            { "id": "writing_leave", "text": "离开", "results": [] }
        ]
    },
    {
        "id": "council_of_ghosts",
        "name": "幽灵议会",
        "nameEn": "Council of Ghosts",
        "act": 2,
        "description": "一群幽灵般的议会成员出现在你面前，提出交易。",
        "options": [
            { "id": "ghosts_accept", "text": "接受（获得5层无实体，失去6点最大生命）", "results": [{"type": "max_hp", "value": -6, "description": "失去6点最大生命"}, {"type": "upgrade", "value": 5, "description": "获得5层无实体"}] },
            { "id": "ghosts_refuse", "text": "拒绝", "results": [] }
        ]
    },
    {
        "id": "drug_dealer",
        "name": "药贩",
        "nameEn": "Drug Dealer",
        "act": 2,
        "description": "一个神秘人向你兜售可疑的药水。",
        "options": [
            { "id": "dealer_buy", "text": "购买（花费75金币，获得1瓶药水）", "results": [{"type": "gold", "value": -75, "description": "花费75金币"}, {"type": "potion", "value": 1, "description": "获得1瓶随机药水"}] },
            { "id": "dealer_steal", "text": "抢夺", "results": [{"type": "potion", "value": 2, "description": "获得2瓶药水"}, {"type": "damage", "value": 10, "description": "受到10点伤害"}] },
            { "id": "dealer_leave", "text": "离开", "results": [] }
        ]
    },
    {
        "id": "forgotten_altar",
        "name": "被遗忘的祭坛",
        "nameEn": "Forgotten Altar",
        "act": 2,
        "description": "你发现了一座被遗忘的祭坛，上面摆放着各种祭品。",
        "options": [
            { "id": "altar_sacrifice", "text": "献祭（失去5点最大生命，获得1件遗物）", "results": [{"type": "max_hp", "value": -5, "description": "失去5点最大生命"}, {"type": "relic", "value": 1, "description": "获得1件遗物"}] },
            { "id": "altar_pray", "text": "祈祷（获得15金币）", "results": [{"type": "gold", "value": 15, "description": "获得15金币"}] },
            { "id": "altar_leave", "text": "离开", "results": [] }
        ]
    },
    {
        "id": "hypnotizing_eye",
        "name": "催眠之眼",
        "nameEn": "Hypnotizing Eye",
        "act": 2,
        "description": "一只巨大的眼睛出现在你面前，散发着诡异的光芒。",
        "options": [
            { "id": "eye_stare", "text": "直视", "results": [{"type": "damage", "value": 8, "description": "受到8点伤害"}, {"type": "card", "value": 0, "description": "获得1张随机无色牌"}] },
            { "id": "eye_look_away", "text": "转移视线", "results": [] }
        ]
    },
    {
        "id": "knowing_skull",
        "name": "知晓头颅",
        "nameEn": "Knowing Skull",
        "act": 2,
        "description": "一个漂浮的头颅以谜语形式向你提出交易。",
        "options": [
            { "id": "skull_ask_gold", "text": "询问金币", "results": [{"type": "gold", "value": 50, "description": "获得50金币"}, {"type": "damage", "value": 3, "description": "受到3点伤害"}] },
            { "id": "skull_ask_card", "text": "询问卡牌", "results": [{"type": "upgrade", "value": 2, "description": "升级2张牌"}, {"type": "curse", "value": 1, "description": "获得1张诅咒"}] },
            { "id": "skull_ask_relic", "text": "询问遗物", "results": [{"type": "relic", "value": 1, "description": "获得1件遗物"}, {"type": "max_hp", "value": -3, "description": "失去3点最大生命"}] },
            { "id": "skull_leave", "text": "离开", "results": [] }
        ]
    },
    {
        "id": "library",
        "name": "图书馆",
        "nameEn": "Library",
        "act": 2,
        "description": "你发现了一座古老的图书馆，里面藏有大量知识。",
        "options": [
            { "id": "library_read", "text": "阅读（选择1张牌加入牌组）", "results": [{"type": "card", "value": 1, "description": "从3张随机牌中选择1张加入牌组"}] },
            { "id": "library_burn", "text": "焚烧（移除所有牌，获得50金币）", "results": [{"type": "gold", "value": 50, "description": "获得50金币"}, {"type": "remove_card", "value": 0, "description": "移除牌组中所有牌"}] },
            { "id": "library_leave", "text": "离开", "results": [] }
        ]
    },
    {
        "id": "masked_bandits",
        "name": "蒙面强盗",
        "nameEn": "Masked Bandits",
        "act": 2,
        "description": "一群蒙面强盗拦住了你的去路。",
        "options": [
            { "id": "bandits_fight", "text": "战斗", "results": [{"type": "combat", "value": 1, "description": "与强盗战斗"}, {"type": "gold", "value": 50, "description": "胜利后获得50金币"}] },
            { "id": "bandits_pay", "text": "支付过路费（失去75金币）", "results": [{"type": "gold", "value": -75, "description": "失去75金币"}] }
        ]
    },
    {
        "id": "mausoleum_2",
        "name": "地下陵墓",
        "nameEn": "Underground Mausoleum",
        "act": 2,
        "description": "一座更为宏伟的地下陵墓出现在你面前。",
        "options": [
            { "id": "mausoleum_explore", "text": "探索", "results": [{"type": "relic", "value": 1, "description": "获得1件遗物"}, {"type": "curse", "value": 1, "description": "获得1张诅咒"}] },
            { "id": "mausoleum_leave", "text": "离开", "results": [] }
        ]
    },
    {
        "id": "nest",
        "name": "巢穴",
        "nameEn": "Nest",
        "act": 2,
        "description": "你发现了一个巨大的鸟巢，里面似乎有值钱的东西。",
        "options": [
            { "id": "nest_search", "text": "搜索", "results": [{"type": "gold", "value": 100, "description": "获得100金币"}, {"type": "damage", "value": 8, "description": "受到8点伤害"}] },
            { "id": "nest_leave", "text": "离开", "results": [] }
        ]
    },
    # === Act 3 events ===
    {
        "id": "beyond_the_grave",
        "name": "墓外之地",
        "nameEn": "Beyond the Grave",
        "act": 3,
        "description": "你穿越了生与死的边界，来到一片诡异的领域。",
        "options": [
            { "id": "grave_take", "text": "接受馈赠", "results": [{"type": "relic", "value": 1, "description": "获得1件遗物"}, {"type": "curse", "value": 1, "description": "获得1张诅咒"}] },
            { "id": "grave_leave", "text": "退回", "results": [] }
        ]
    },
    {
        "id": "mind_bloom",
        "name": "心灵绽放",
        "nameEn": "Mind Bloom",
        "act": 3,
        "description": "你的心灵在一片花海中绽放，各种幻象涌现。",
        "options": [
            { "id": "bloom_heal", "text": "恢复全部生命", "results": [{"type": "heal_percent", "value": 100, "description": "恢复全部生命"}] },
            { "id": "bloom_gold", "text": "获得200金币", "results": [{"type": "gold", "value": 200, "description": "获得200金币"}] },
            { "id": "bloom_relic", "text": "获得1件稀有遗物", "results": [{"type": "relic", "value": 1, "description": "获得1件稀有遗物"}] }
        ]
    },
    {
        "id": "sensory_stone",
        "name": "感知之石",
        "nameEn": "Sensory Stone",
        "act": 3,
        "description": "一块散发着奇异光芒的石头触及了你的感官。",
        "options": [
            { "id": "stone_touch", "text": "触摸", "results": [{"type": "gold", "value": 50, "description": "获得50金币"}, {"type": "upgrade", "value": 1, "description": "升级1张牌"}] },
            { "id": "stone_leave", "text": "离开", "results": [] }
        ]
    },
    {
        "id": "the_divine_fountain",
        "name": "神圣喷泉",
        "nameEn": "The Divine Fountain",
        "act": 3,
        "description": "你发现了一座神圣的喷泉，清澈的泉水散发着光芒。",
        "options": [
            { "id": "fountain_drink", "text": "饮用泉水", "results": [{"type": "remove_card", "value": 1, "description": "移除1张牌"}, {"type": "heal_percent", "value": 50, "description": "恢复50%生命"}] },
            { "id": "fountain_leave", "text": "离开", "results": [] }
        ]
    },
    {
        "id": "tomb_of_lord",
        "name": "领主之墓",
        "nameEn": "Tomb of the Lord",
        "act": 3,
        "description": "你发现了一位古代领主的坟墓，周围布满了机关。",
        "options": [
            { "id": "tomb_open", "text": "打开棺材", "results": [{"type": "relic", "value": 2, "description": "获得2件遗物"}, {"type": "damage", "value": 15, "description": "受到15点伤害"}] },
            { "id": "tomb_leave", "text": "离开", "results": [] }
        ]
    },
    {
        "id": "moai_head",
        "name": "摩艾石像",
        "nameEn": "Moai Head",
        "act": 3,
        "description": "一尊巨大的摩艾石像矗立在你面前，似乎在等待什么。",
        "options": [
            { "id": "moai_offer", "text": "献祭（失去50%生命，最大生命+5）", "results": [{"type": "max_hp", "value": 5, "description": "最大生命+5"}, {"type": "damage", "value": 0, "description": "失去50%当前生命"}] },
            { "id": "moai_leave", "text": "离开", "results": [] }
        ]
    },
    {
        "id": "winding_halls",
        "name": "蜿蜒大厅",
        "nameEn": "Winding Halls",
        "act": 3,
        "description": "你进入了一座迷宫般的大厅，左右两侧都是无尽的走廊。",
        "options": [
            { "id": "halls_left", "text": "走左边", "results": [{"type": "damage", "value": 5, "description": "受到5点伤害"}, {"type": "card", "value": 1, "description": "获得1张随机卡牌"}] },
            { "id": "halls_right", "text": "走右边", "results": [{"type": "gold", "value": 30, "description": "获得30金币"}] },
            { "id": "halls_straight", "text": "直走", "results": [{"type": "upgrade", "value": 1, "description": "升级1张牌"}, {"type": "damage", "value": 3, "description": "受到3点伤害"}] }
        ]
    },
    {
        "id": "the_joust",
        "name": "骑士比武",
        "nameEn": "The Joust",
        "act": 3,
        "description": "两名骑士正在进行比武决斗，你可以下注。",
        "options": [
            { "id": "joust_bet_red", "text": "押注红骑士（50金币）", "results": [{"type": "gold", "value": 100, "description": "如果获胜获得100金币"}, {"type": "gold", "value": -50, "description": "如果失败损失50金币"}] },
            { "id": "joust_bet_blue", "text": "押注蓝骑士（50金币）", "results": [{"type": "gold", "value": 100, "description": "如果获胜获得100金币"}, {"type": "gold", "value": -50, "description": "如果失败损失50金币"}] },
            { "id": "joust_leave", "text": "离开", "results": [] }
        ]
    },
    {
        "id": "the_abandoned_tower",
        "name": "废弃塔楼",
        "nameEn": "The Abandoned Tower",
        "act": 3,
        "description": "一座废弃的塔楼矗立在你面前，大门敞开。",
        "options": [
            { "id": "tower_enter", "text": "进入", "results": [{"type": "relic", "value": 1, "description": "获得1件遗物"}, {"type": "combat", "value": 1, "description": "与塔楼守卫战斗"}] },
            { "id": "tower_leave", "text": "离开", "results": [] }
        ]
    }
]

for event in new_events:
    if event['id'] not in existing_ids:
        data['events'].append(event)

print(f'After adding: {len(data["events"])} events')

with open(fpath, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('Done!')
