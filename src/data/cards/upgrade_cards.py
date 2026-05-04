import json, os, re

# Card upgrade rules - damage+3, block+3, buff/debuff+1, etc.
CARDS_DIR = r'D:\Agent\sts2-helper\src\data\cards'

def get_upgrade(description):
    """Generate upgraded description based on game mechanics"""
    if '造成' in description and '伤害' in description:
        # Extract damage numbers and increase by ~3 or ~50%
        def replace_damage(m):
            num = int(m.group(1))
            if num >= 30:
                new_num = num + 10
            elif num >= 20:
                new_num = num + 8
            elif num >= 15:
                new_num = num + 5
            elif num >= 10:
                new_num = num + 4
            else:
                new_num = num + 3
            return f'造成{new_num}点伤害'
        desc = re.sub(r'造成(\d+)点伤害', replace_damage, description)
        if desc != description:
            return desc
    
    if '获得' in description and '格挡' in description:
        def replace_block(m):
            num = int(m.group(1))
            if num >= 20:
                new_num = num + 6
            elif num >= 10:
                new_num = num + 4
            else:
                new_num = num + 3
            return f'获得{new_num}点格挡'
        desc = re.sub(r'获得(\d+)点格挡', replace_block, description)
        if desc != description:
            return desc
    
    if '层' in description and ('中毒' in description or '易伤' in description or '虚弱' in description):
        def replace_layers(m):
            num = int(m.group(1))
            new_num = num + 1
            return f'{new_num}层'
        desc = re.sub(r'(\d+)层', replace_layers, description)
        if desc != description:
            return desc
    
    if '抽' in description and '张牌' in description:
        def replace_draw(m):
            num = int(m.group(1))
            new_num = num + 1
            return f'抽{new_num}张牌'
        desc = re.sub(r'抽(\d+)张牌', replace_draw, description)
        if desc != description:
            return desc
    
    if '能量' in description and '获得' in description:
        def replace_energy(m):
            num = int(m.group(1))
            new_num = num + 1
            return f'获得{new_num}点能量'
        desc = re.sub(r'获得(\d+)点能量', replace_energy, description)
        if desc != description:
            return desc
    
    # Default: generic upgrade marker
    # Many cards don't change description text but cost decreases
    return None  # Will be handled by cost reduction pattern

def process_card_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    count = 0
    for card in data['cards']:
        # Skip if already has upgraded description
        if 'upgradedDescription' in card and card['upgradedDescription']:
            continue
        # Skip basic strikes/defends that already have descriptions
        if card.get('upgradedDescription'):
            continue
        
        desc = card.get('description', '')
        if not desc:
            continue
        
        upgrade = get_upgrade(desc)
        if upgrade:
            card['upgradedDescription'] = upgrade
            count += 1
        elif '虚无' not in desc and '消耗' in desc and '获得' in desc:
            # Energy-providing exhaust cards - reduce cost
            card['upgradedCost'] = max(0, card.get('cost', 1) - 1) if card.get('cost', 0) > 0 else 0
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    return count

total = 0
for fname in os.listdir(CARDS_DIR):
    if fname.endswith('.json') and fname != 'index.ts':
        fpath = os.path.join(CARDS_DIR, fname)
        c = process_card_file(fpath)
        print(f'{fname}: {c} cards updated')
        total += c

print(f'\nTotal: {total} cards updated')
