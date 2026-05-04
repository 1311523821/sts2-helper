import json, os, re

CARDS_DIR = r'D:\Agent\sts2-helper\src\data\cards'

def get_upgrade_desc(desc, card_name, card_id):
    """Generate upgraded description based on game mechanics"""
    # Damage increase (typical: +3 for low, +4-5 for mid, +8-10 for high)
    if '造成' in desc and '点伤害' in desc:
        def replace_damage(m):
            num = int(m.group(1))
            if num >= 30:
                new_num = num + 10
            elif num >= 20:
                new_num = num + 6
            elif num >= 15:
                new_num = num + 5
            elif num >= 10:
                new_num = num + 3
            else:
                new_num = num + 3
            return f'造成{new_num}点伤害'
        new_desc = re.sub(r'造成(\d+)点伤害', replace_damage, desc)
        if new_desc != desc:
            return new_desc
    
    # Block increase (typical: +3-4)
    if '获得' in desc and '点格挡' in desc:
        def replace_block(m):
            num = int(m.group(1))
            if num >= 20:
                new_num = num + 6
            elif num >= 10:
                new_num = num + 3
            else:
                new_num = num + 3
            return f'获得{new_num}点格挡'
        new_desc = re.sub(r'获得(\d+)点格挡', replace_block, desc)
        if new_desc != desc:
            return new_desc
    
    # Stack count increase (poison, vulnerable, weak etc.)
    if '给予' in desc and '层' in desc:
        def replace_give_stack(m):
            num = int(m.group(1))
            new_num = num + 1 if num < 5 else num + 2
            return f'给予{new_num}层'
        new_desc = re.sub(r'给予(\d+)层', replace_give_stack, desc)
        if new_desc != desc:
            return new_desc
    
    # Draw increase
    if '抽' in desc and '张牌' in desc:
        def replace_draw(m):
            num = int(m.group(1))
            return f'抽{num+1}张牌'
        new_desc = re.sub(r'抽(\d+)张牌', replace_draw, desc)
        if new_desc != desc:
            return new_desc
    
    # Multi-hit damage
    if '造成' in desc and '点伤害' in desc:
        def replace_damage2(m):
            num = int(m.group(1))
            new_num = num + 2 if num < 10 else num + 3
            return f'造成{new_num}点伤害'
        new_desc = re.sub(r'造成(\d+)点伤害', replace_damage2, desc)
        if new_desc != desc:
            return new_desc
    
    return None

def main():
    total = 0
    skipped = 0
    for fname in sorted(os.listdir(CARDS_DIR)):
        if not fname.endswith('.json'):
            continue
        fpath = os.path.join(CARDS_DIR, fname)
        with open(fpath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        char = data.get('character', 'unknown')
        count = 0
        for card in data['cards']:
            # Skip if already has upgraded description
            if card.get('upgradedDescription'):
                skipped += 1
                continue
            
            desc = card.get('description', '')
            cid = card.get('id', '')
            cname = card.get('name', '')
            
            upgrade = get_upgrade_desc(desc, cname, cid)
            if upgrade:
                card['upgradedDescription'] = upgrade
                count += 1
                total += 1
                print(f'  [{char}] #{cid}: "{desc}" -> "{upgrade}"')
        
        with open(fpath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f'{fname}: {count} cards updated (was {skipped} skipped)')
    
    print(f'\nTotal: {total} cards updated')

if __name__ == '__main__':
    main()
