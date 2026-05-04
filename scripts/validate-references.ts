#!/usr/bin/env tsx
/**
 * Data Reference Integrity Validator
 *
 * Validates that all card references in archetypes and combos
 * point to existing cards in the card database.
 */

import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const DATA_DIR = resolve(import.meta.dirname ?? __dirname, '../src/data');

interface Card {
  id: string;
  name: string;
  character: string;
}

interface ArchetypeCoreCard {
  cardId: string;
}

interface Archetype {
  id: string;
  character: string;
  coreCards: ArchetypeCoreCard[];
  importantCards: ArchetypeCoreCard[];
  supportCards: ArchetypeCoreCard[];
  combos?: { id: string; cards: string[] }[];
}

interface Combo {
  id: string;
  character: string;
  cards: string[];
}

// Collect all card IDs from all character card files
function loadAllCardIds(): Set<string> {
  const cardIds = new Set<string>();
  const cardsDir = join(DATA_DIR, 'cards');

  const files = readdirSync(cardsDir).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const data = JSON.parse(readFileSync(join(cardsDir, file), 'utf-8'));
    const cards: Card[] = data.cards ?? data;
    if (Array.isArray(cards)) {
      for (const card of cards) {
        if (card.id) cardIds.add(card.id);
      }
    }
  }

  return cardIds;
}

// Load archetypes from all character files
function loadArchetypes(): Archetype[] {
  const archetypes: Archetype[] = [];
  const archetypesDir = join(DATA_DIR, 'archetypes');

  const files = readdirSync(archetypesDir).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const data = JSON.parse(readFileSync(join(archetypesDir, file), 'utf-8'));
    if (Array.isArray(data)) {
      archetypes.push(...data);
    }
  }

  return archetypes;
}

// Load combos
function loadCombos(): Combo[] {
  const combosFile = join(DATA_DIR, 'combos', 'all.json');
  const data = JSON.parse(readFileSync(combosFile, 'utf-8'));
  return data.combos ?? [];
}

interface ValidationError {
  type: 'archetype' | 'combo' | 'inline_combo';
  sourceId: string;
  missingCardId: string;
}

function validate(): ValidationError[] {
  const errors: ValidationError[] = [];
  const cardIds = loadAllCardIds();
  const archetypes = loadArchetypes();
  const combos = loadCombos();

  console.log(`📋 Loaded ${cardIds.size} cards from database`);
  console.log(`🏗️  Found ${archetypes.length} archetypes`);
  console.log(`🔗 Found ${combos.length} combos\n`);

  // Validate archetype card references
  for (const archetype of archetypes) {
    const allCardRefs = [
      ...(archetype.coreCards ?? []),
      ...(archetype.importantCards ?? []),
      ...(archetype.supportCards ?? []),
    ];

    for (const ref of allCardRefs) {
      if (!cardIds.has(ref.cardId)) {
        errors.push({
          type: 'archetype',
          sourceId: archetype.id,
          missingCardId: ref.cardId,
        });
      }
    }

    // Validate inline combos within archetypes
    if (archetype.combos) {
      for (const combo of archetype.combos) {
        for (const cardId of combo.cards) {
          if (!cardIds.has(cardId)) {
            errors.push({
              type: 'inline_combo',
              sourceId: `${archetype.id} → combo:${combo.id}`,
              missingCardId: cardId,
            });
          }
        }
      }
    }
  }

  // Validate standalone combos
  for (const combo of combos) {
    for (const cardId of combo.cards) {
      if (!cardIds.has(cardId)) {
        errors.push({
          type: 'combo',
          sourceId: combo.id,
          missingCardId: cardId,
        });
      }
    }
  }

  return errors;
}

// Main
const errors = validate();

if (errors.length === 0) {
  console.log('✅ All data references are valid!');
  process.exit(0);
} else {
  console.error(`❌ Found ${errors.length} broken reference(s):\n`);
  for (const err of errors) {
    const label =
      err.type === 'archetype'
        ? 'Archetype'
        : err.type === 'inline_combo'
          ? 'Archetype Combo'
          : 'Combo';
    console.error(`  • [${label}] "${err.sourceId}" references missing card: "${err.missingCardId}"`);
  }
  console.error(`\n💡 Hint: Check if the card ID is spelled correctly or if the card has been removed.`);
  process.exit(1);
}
