# FLAG GUIDE - Persistent Memory for Flaghack Infinity

## Lore Bible

### Core Theology
- Flags symbolize symbolism itself. Sign and signifier become one in the Flags.
- Each Flag is itself a Flag, and each Flag is every Flag.
- Flags are "the non-caking agent of the psyche" - they preserve free will.
- Seekers are born Flagless and spend life discovering flags.
- Flags move individuals, not individuals moving flags.
- All faiths represent "incomplete projections of correct, higher dimensional Flag truths."
- All locations which can be signified are holy.
- The Signifier's Salute: "Glorious."

### Origin Story (from The Yellow Flags tract)
- It started at Alchemy IX.
- In the beginning there were 6 FLAGS, each a mix of Red, Blue and Yellow.
- The terrible STENCH of the hippies caused a great hurricane.
- The FLAG MAKER walked among them and taught that by FINDING and MOVING FLAGS the rain could be stopped.
- The ALL YELLOW FLAG was placed on the Effigy; the rain stopped entirely.
- When the Effigy burned and flames reached the Flag, the FIRMAMENT OPENED and rain returned.
- The Yellow Flag would be raised again... 50, then 100 times!
- FLAGS are the HEART and SOUL of the Burn itself. Speaking against them is BLASPHEME.

### Geomantica Vexillorum
- An I Ching-style divination system using pentagram flag configurations.
- 6 points on a pentagram labeled: alpha, beta, gamma, delta, epsilon, zeta.
- Axes: v. aurum / v. crocus (vertical), signifiant / signifie (diagonal).
- Different configurations of filled/empty points yield different hexagram-readings.
- Examples: Qian (The Creative), Guai (Breakthrough), Da You (Great Possession), Da Zhuang (Great Power).

### Null-time & The Great Chronoschism
- Null-time is anti-time where time is nullified. Extremely rare.
- The Time Crystal prevents null-time from occurring.
- The Great Chronoschism was the singular occurrence of null-time.

### Physical Flag Construction
- Diamond-shaped (rotated square) yellow cotton cloth on untreated furring lumber.
- Deep golden yellow, 30"x36" cotton duck canvas.
- Tacked to staff with carpet tacks: top, bottom, middle order.

### Practitioner Terminology
- Vexillomancer: Flag wizard, the player character class.
- Pratyekavexillian: One who independently discovers flags.
- Flagic: Magical energy harvested from pentagram formations.
- 1st Vexillians: The original flag followers.

---

## Lineage

### Flaghack 2 (Origin)
- **Genre**: 2D top-down sandbox/roguelike
- **Engine**: Rust + Macroquad
- **Theme**: Burning Man festival with flag magic
- **Mechanics**: Flag placement/pickup, ley lines (distance-based connections), pentagram detection (5-flag pentagons), Flagic meter, hippie NPCs with AI state machines (wander/chase/flee/steal), camps with scenery, the Effigy, procedural terrain
- **Strengths**: Solid core loop (place flags -> form pentagrams -> gain Flagic), fun hippie interactions, flag state invariant tracking, good procedural camps with Voronoi cells
- **What to improve**: No spells/abilities, Flagic has no spending mechanism, limited visual variety, no progression system

### Flaghack 3 (3D Sequel)
- **Genre**: 3D action-sandbox
- **Engine**: Three.js (ES modules + importmap from esm.sh)
- **Theme**: Enhanced Burning Man with magic combat and altered states
- **Mechanics**: Everything from FH2 plus: 5 spells (Flag Bolt, Ley Blast, Pentagram Shield, Flag Summon, Vexillo Storm), 5 drugs with visual effects (Peyote, Playa Dust, Shrooms, Cactus Juice, DMT), 5 flag enchantments (Flame, Frost, Beacon, Chaos, Gravity), day/night cycle (5 min), XP/leveling (20 levels), combo multipliers, 10 main quests + procedural side quests, 19 achievements
- **Architecture**: Single gameState object, functional modules (create/update pattern), constants.js for tuning, DOM-based HUD, no build step
- **Strengths**: Rich systems that interact (drugs boost spells, pentagrams enchant flags, combos reward speed), strong progression hooks, visual spectacle (particles, day/night, drug overlays)
- **What to improve**: Same core genre as FH2 (sandbox exploration), no tower defense / strategic layer, no Geomantica system, limited replayability (no roguelike runs), hippies lack strategic variety

---

## Addictiveness Learnings

### From FH2
- Core flag placement loop is satisfying - immediate visual feedback (ley lines appearing)
- Hippie interactions create tension and emergent stories
- Freedom to explore and place flags anywhere = flow state

### From FH3
- Progression system (XP/levels) drives long sessions
- Combo multiplier rewards fast, skillful play
- Drug effects provide novelty and power spikes (variable rewards)
- Quest system provides direction in sandbox
- Achievements give collection/completion compulsion
- Multiple interacting systems create depth

### From FH4-FH8
- Tower defense wave structure creates "one more wave" compulsion
- Roguelike permadeath raises stakes on every decision
- Base building creates sunk-cost investment
- Boss-rush pattern mastery drives flow-state replays
- RTS management creates optimization puzzles

### Key Principles
- Variable reward schedules work (random drug drops, random enchantments)
- Loss aversion drives engagement (hippies steal YOUR flags)
- Near-miss dynamics are untapped (could add close-call pentagram formations)
- Mystery/discovery not yet fully explored (Geomantica divination system is perfect for this)
- Factory/automation creates "just one more optimization" compulsion
- Tech trees with meaningful unlocks create discovery dopamine hits
- Idle/passive income generation creates return-to-play hooks

---

## Inspiration Log

### Alch3my Wiki
- **Survey Flags page**: Core theology - flags as recursive self-referential symbols, Pratyekavexillians, unified knowledge theory
- **Talk:Advanced_Knowledge**: Psywar theory, hyperdimensional flag navigation, signal broadcasting, unbounded fields
- **Null-time page**: Anti-time concept, Time Crystal artifact, Great Chronoschism event
- **Geomantica Vexillorum book**: Full I Ching divination system using pentagram configurations

### FLAG_DOCS
- **The Yellow Flags (tract)**: Origin story at Alchemy IX, the 6 primordial flags, Effigy burning miracle, firmament mechanic
- **Flag Instructions**: Physical flag construction details - diamond-shaped cloth, lumber poles, tacking method
- **Geomantica V**: Pentagram-based divination with I Ching hexagram mappings (Qian/Creative, Guai/Breakthrough, Da You/Great Possession, Da Zhuang/Great Power)
- **How to use this folder.txt**: Survey Flags was an "interactive art installation" / standalone video game trapping crystal manifestation points in pentagram formations

---

## FLAGHACK 4: GEOMANTICA (Current)

### Concept
- **Genre**: Roguelike Tower Defense + Divination System
- **Theme**: The Vexillomancer defends the Effigy from escalating waves of hippies using Geomantica pentagram configurations as tower-spells
- **Key Innovation**: The Geomantica Vexillorum becomes the core mechanic - different flag configurations produce different defensive powers
- **Addictiveness Hooks**: Wave survival (loss aversion), Geomantica discovery (mystery), flag crafting (collection), prestige resets (sunk-cost + fresh starts), near-miss waves

### What improves over FH3
- Genre shift to tower defense adds strategic depth
- Geomantica system adds discovery/mystery layer
- Wave-based structure adds clear progression + tension
- Roguelike elements add replayability
- Firmament mechanic (from Yellow Flags tract) as weather threat system

### Completion Status: BUILT
- **Folder**: `flaghack4/`
- **Files**: 15 source modules + index.html (87KB total)
- **Architecture**: Three.js ES modules + importmap (same pattern as FH3)
- **Core Systems**: Flag placement, ley lines, pentagram detection, Geomantica tower effects (8 types), wave-based hippie spawning, 4 spells, day/night cycle, camps, particles, effigy defense
- **Geomantica Types Implemented**: Qian (damage aura), Guai (knockback), Da You (flag generation), Da Zhuang (ley boost), Xu (effigy healing), Lu (enemy slow), Tai (flagic boost), Tong Ren (pentagram chaining)
- **Lore Compliance**: All core lore rules followed (yellow flags, Vexillomancer, Flagic, pentagrams, hippies, Effigy)

### Post-Build FLAG_DOCS Review
- **ChakraVexillomantia4.png**: Maps 7 chakra points to flag pole positions (Crown/Gold Yellow at tip through Root/Goldenrod at base). Each nail position = different chakra. INSPIRATION FOR FH5: Chakra-based progression/upgrade system tied to flag anatomy.
- **FLAGISTAN AWAITS.png**: Beach covered in flags under palm tree. "La Societe du Troisieme Etage." INSPIRATION FOR FH5: Flagistan as a location/biome, tropical flag deployment.

---

## FLAGHACK 5: CHAKRA VEXILLOMANTIA

### Concept
- **Genre**: Roguelike Dungeon Crawler
- **Theme**: Descend through 7 floors of Flagistan (a hyperbolic pentagonal realm of pure Flag energy) to reach the Omega Configuration
- **Key Innovation**: The flag is a melee weapon with 7 chakra upgrade slots (Root through Crown). Crystals of Implied Flag unlock chakras. Each floor corresponds to one chakra.
- **Addictiveness Hooks**: Permadeath tension, chakra build variety (7 upgrades affecting combat/movement/vision/economy), floor-by-floor progression with themed environments, crystal collection compulsion

### What improves over FH4
- Genre shift to dungeon crawler adds exploration/discovery
- Flag as melee weapon (not just placed) = direct combat engagement
- Chakra system provides meaningful upgrades with distinct playstyle effects
- 7 themed floors with distinct aesthetics (Playa Depths -> Heart of Flagistan)
- 5 enemy types with different behaviors (melee, ranged, fast, flag-stealing, tanky)
- Dash mechanic with i-frames for skillful play
- Crystal collection gives clear goals per floor

### Lore Integration
- **Flagistan**: Hyperbolic pentagonal realm with Crystals as "infinite-order implied Flags" (from wiki)
- **Omega Configuration**: The ultimate arrangement flags move toward (from Vexillomancy wiki)
- **Flag Psychosis**: Referenced in enemy behavior (Psychosis Wraith enemy type)
- **The Great Chronoschism**: Floor 6 theme - temporal fractures
- **Geomantic Command Center**: Built by Dr. Beef Supreme (from wiki)

### Completion Status: BUILT
- **Folder**: `flaghack5/`
- **Files**: 9 source modules + index.html
- **Architecture**: Three.js ES modules + importmap (consistent pattern)
- **Core Systems**: Procedural dungeon generation, melee combat with flag weapon, 7 chakra upgrades, 5 enemy types, 7 themed floors, flag placement/ley lines/pentagrams (in dungeon), crystal pickups, dash mechanic, room-based enemy spawning, floor transitions
- **Lore Compliance**: All rules followed

### Alch3my Wiki Fetches
- **Flagistan page**: Hyperbolic pentagonal tiling, Crystals as infinite-order implied flags, waves of understanding emanating between Flag configurations, Geomantic Command Center
- **Vexillomancy page**: Casting = spreading flags into observable area, Signifiers channel will of the Crystal, Flag Psychosis trance state, Omega Configuration as ultimate goal
- **Null-time** (again): Time Crystal, Great Chronoschism

### Post-Build FLAG_DOCS Review
- **Ban Flags.jpg**: "BAN FLAGS FROM BURNS" - anti-Flag propaganda poster. INSPIRATION FOR FH6: An enemy faction of Flag Banners (anti-Vexillomancers) as antagonists. Political faction warfare mechanic.
- **Find Your Flags.png**: Beautiful meadow scene with golden flags everywhere. "La Societe du Troisieme Etage." INSPIRATION FOR FH6: Open-world exploration collecting scattered flags across biomes. The Third Floor Society as a faction/questgiver.

---

## FLAGHACK 6: THE BAN

### Concept
- **Genre**: Survival Base Builder + Stealth Resistance
- **Theme**: Set in 2042 after the Noospheric Munitions Act banned all memes except Flags. Build a hidden flag sanctuary in the wasteland, recruit Signifiers, and resist Ban Patrols.
- **Key Innovation**: Heat system (flag placement attracts patrols), decoy flags to misdirect raids, Signifier recruitment as autonomous helpers, resource gathering + crafting 6 building types
- **Addictiveness Hooks**: Base building (sunk cost), patrol tension (loss aversion), Signifier collection (collection compulsion), day/night cycle risk management, reputation progression

### What improves over FH5
- Genre shift to survival/base-building adds persistent strategic investment
- Heat/patrol system creates dynamic tension - more flags = more danger
- Signifier recruitment adds NPC management and autonomous helpers
- Resource gathering loop (wood, cloth, crystal) drives exploration
- Decoy flags add strategic deception layer
- Day/night cycle affects patrol danger
- 6 building types with distinct functions (flag, tent, workshop, beacon, wall, decoy)
- Reputation system provides progression across sessions
- Victory condition combines flag count + Signifier recruitment

### Lore Integration
- **Noospheric Munitions Act of 2042**: From Alch3my wiki - banned memes but exempted flags
- **President Jaguar**: Signed the Act
- **Signifiers**: From Vexillomancy wiki - persons who carry flags and channel the will of the Crystal
- **The Ban**: Anti-flag faction inspired by "BAN FLAGS FROM BURNS" propaganda
- **La Societe du Troisieme Etage**: Third Floor Society referenced in FLAG_DOCS posters

### Completion Status: BUILT
- **Folder**: `flaghack6/`
- **Files**: 7 source modules + index.html
- **Architecture**: Three.js ES modules + importmap
- **Core Systems**: Resource gathering (3 types), building placement (6 types), heat/raid system, Ban Patrol AI, Signifier recruitment/auto-gathering, day/night cycle, ley lines/pentagrams, reputation levels, decoy flag misdirection

### Alch3my Wiki Fetches
- **Noospheric Munitions Act of 2042**: Ban on memes, flags exempted, President Jaguar, Qualia OS

### Post-Build FLAG_DOCS Review
- **Triumph of Flags over Covid.jpg**: Epic angelic figure wielding yellow flag, standing atop defeated virus monster. "THE TRIUMPH OF FLAGS." INSPIRATION FOR FH7: Boss-rush action game where Vexillomancer-angel battles cosmic threats with flag powers. Triumphant/epic tone.

---

## FLAGHACK 7: TRIUMPH OF FLAGS

### Concept
- **Genre**: Boss-Rush Bullet Hell
- **Theme**: The Vexillomancer ascends as a Flag Angel to battle five cosmic manifestations of anti-Flag forces in a sacred pentagram arena
- **Key Innovation**: 5 unique boss phases with distinct bullet patterns, 3 special attacks (Flag Storm, Pentagram Blast, Ley Beam) costing Flagic, dodge with i-frames, no-hit bonus scoring
- **Addictiveness Hooks**: Boss mastery (flow state), pattern memorization (near-miss), power escalation per phase, glory moments (climax design), no-hit bonus chase

### What improves over FH6
- Genre shift to boss-rush bullet hell adds intense action focus
- 5 bosses with multi-phase AI and unique bullet patterns
- Dodge mechanic with i-frames for skillful play
- 3 special attacks with Flagic cost/reward tradeoff
- Sacred pentagram arena with pillar flags
- Score system with no-hit bonuses per boss
- Phase transitions with visual feedback

### Lore Integration
- **Flag Angel**: Winged Vexillomancer with halo, golden robes, flag weapon held aloft
- **THE STENCH**: Hippie King of Filth - green miasma, spreading cloud pattern
- **THE CENSOR**: Enforcer of the Ban - red angular shield, barrier wall bullets
- **THE ENTROPY**: Heat Death of Meaning - dissolving grey, spiral patterns
- **NULL-TIME**: The Great Chronoschism - blue temporal rings, time-freeze bullet rings
- **THE ANTI-FLAG**: Negation of the Signifier - purple void, chaos bullets + aimed bursts
- **Pentagram Arena**: Sacred arena with pentagram inscriptions and 5 pillar flags

### Completion Status: BUILT
- **Folder**: `flaghack7/`
- **Files**: 4 source modules + index.html
- **Architecture**: Three.js ES modules + importmap
- **Core Systems**: Flag Angel player (wings, halo, dodge), 5 bosses with multi-phase AI, bullet pattern system (aimed, spiral, ring, cloud, chaos, barrier), 3 special attacks (Flag Storm/Pentagram Blast/Ley Beam), particle effects, boss sequencing, scoring with no-hit bonus, HUD with boss HP bar

### Post-Build FLAG_DOCS Review
- **2024 Flag Poster.jpg**: Person holding two flags aloft, "FLAGS - The Flags Survey Experience art & FLAGS OF FLAGS ARE Art." Recursive flags-of-flags concept. La Societe du Troisieme Etage.
- **FLAG SCHEMATICS (UPDATED) - TOP SECRET.jpg**: Detailed construction diagram by "Geomantic Survey Committee." Address sticker: "IF FOUND PLEASE LOSE / IF LOST RETURN TO TEMPLE." Confirms rectangular cloth on furring lumber.
- **Spain Poster.jpg**: Lone figure kneeling in desert/playa with massive golden flag in wind. "FLAGS! FIND THEM! - MOVE THEM!" Dramatic, solitary devotion.
- **2016 Propaganda poster.jpg**: Soviet-style propaganda art, masses behind flag bearer. "FIND THEM! MOVE THEM!" Ian T.M. Elmore, Lead Vexillomancer. Geomantic Survey Committee 2016.
- **Poster A - Unsigned.jpg**: "I did MY part, & found a Flag!" Crystal hanging as pendulum. "Manifest your Quantum Destiny with FLAGS." Introduces FOOP (Flags Out Of Place) - flags found laying on ground, leaning on tents, not aligned with 5th dimensional Ley facets. Third Floor Society.

### New Lore Discovered
- **FOOP**: Flags Out Of Place - at any moment the burn is full of misaligned flags
- **Ian T.M. Elmore**: Lead Vexillomancer
- **Geomantic Survey Committee**: The organizational body behind flag operations
- **"Manifest your Quantum Destiny with FLAGS"**: Quantum destiny concept
- **"IF FOUND PLEASE LOSE / IF LOST RETURN TO TEMPLE"**: Flag instructions on address sticker
- **5th dimensional Ley facet**: Flags must be aligned with higher-dimensional Ley facets

---

## FLAGHACK 8: THE GREAT SURVEY

### Concept
- **Genre**: Real-Time Strategy / Puzzle
- **Theme**: Lead the Geomantic Survey Committee across the playa, finding and correcting Flags Out Of Place (FOOPs), aligning them to 5th-dimensional Ley facets, and manifesting Quantum Destiny
- **Key Innovation**: FOOP detection and realignment as core mechanic, 4 recruitable Vexillomancer types with autonomous AI, Quantum Destiny progression meter, wave-based FOOP spawning
- **Addictiveness Hooks**: Optimization puzzle (alignment perfection), recruitment cascade, FOOP discovery (collection), Quantum Destiny meter (6 levels from Flagless to Lead Vexillomancer)

### What improves over FH7
- Genre shift to RTS/puzzle adds strategic depth and management
- FOOP system (5 types: Fallen, Leaning, Reversed, Misaligned, Buried) as discovery mechanic
- 4 Vexillomancer types (Seeker, Mover, Aligner, Surveyor) with autonomous AI
- 5th-dimensional Ley facet alignment system
- Quantum Destiny progression (6 levels) replaces simple scoring
- Wave-based FOOP spawning with day/night multiplier
- Propaganda slogans from real FLAG_DOCS materials
- Playa world with camps, structures, Effigy, dust particles

### Lore Integration
- **FOOP**: Flags Out Of Place - directly from Poster A ("FLAGS OUT OF PLACE (FOOP)")
- **Geomantic Survey Committee**: From FLAG SCHEMATICS document
- **Ian T.M. Elmore**: Lead Vexillomancer, from 2016 Propaganda poster
- **"FIND THEM! MOVE THEM!"**: From Spain Poster and 2016 Propaganda poster
- **"I did MY part, & found a Flag!"**: From Poster A
- **"Manifest your Quantum Destiny with FLAGS"**: From Poster A
- **5th dimensional Ley facet**: From Poster A
- **La Societe du Troisieme Etage**: The Third Floor Society, from multiple posters
- **"IF FOUND PLEASE LOSE / IF LOST RETURN TO TEMPLE"**: From FLAG SCHEMATICS

### Completion Status: BUILT
- **Folder**: `flaghack8/`
- **Files**: 6 source modules + index.html
- **Architecture**: Three.js ES modules + importmap
- **Core Systems**: FOOP spawning (5 types), flag fix/align/pickup/place, Ley facet alignment, ley lines between aligned flags, pentagram detection, 4 Vexillomancer AI types, Quantum Destiny meter (6 levels), wave system with day/night, playa world with camps/structures/Effigy, recruitment system

### Post-Build FLAG_DOCS Review
- **Poster B - Unsigned.jpg**: Not yet reviewed
- **FLAGISTAN AWAITS 2.png**: Not yet reviewed
- **2016 Propoganda poster - unsigned.jpg**: Not yet reviewed (variant of signed version)
- **LOGOS/**: Directory not yet reviewed
- **Art Assets/**: Directory not yet reviewed

### New Lore Discovered
- **FOOP (Flags Out Of Place)**: Central concept - flags misaligned with 5th dimensional Ley facets
- **Ian T.M. Elmore**: Lead Vexillomancer of the Geomantic Survey Committee
- **"Manifest your Quantum Destiny"**: Quantum destiny as a spiritual/gameplay concept
- **FLAG SCHEMATICS**: Detailed flag construction from Geomantic Survey Committee, "TOP SECRET" classification
- **Address sticker protocol**: "IF FOUND PLEASE LOSE / IF LOST RETURN TO TEMPLE"

### Next Sequel Seed: FLAGHACK 9
- The Vexilloramanomicon (grimoire) as tech tree driver
- Factory automation genre - flag production lines
- "Flags are the end of Flags and the beginning of 10,000 Flags" = factory scaling

---

## FLAGHACK 9: THE VEXILLORAMANOMICON

### Concept
- **Genre**: Factory Automation / Idle Crafting
- **Theme**: The Vexilloramanomicon (Book of FLAGs) has been unearthed. Build automated flag production lines on a grid — conveyors, crafters, enchanters, pentagram forges — to reach the Omega Configuration
- **Key Innovation**: The Vexilloramanomicon grimoire IS the tech tree. Each page unlocks a new machine type. 10 pages from basic resources to the Omega Configuration. Grid-based factory with directional conveyors
- **Addictiveness Hooks**: Factory optimization (flow state), idle production scaling, grimoire page unlocking (discovery/mystery), Flagic economy management, Omega Configuration as ultimate goal

### What improves over FH8
- Genre shift to factory automation adds optimization depth and idle satisfaction
- Grid-based building with directional conveyors creates spatial puzzles
- Vexilloramanomicon as grimoire/tech-tree merges lore with progression
- 6 machine types (Source, Conveyor, Crafter, Enchanter, Assembler, Harvester)
- 4 raw resources (cloth, lumber, dye, crystal) → flags → enchanted flags → pentagrams
- Recipe chains create crafting depth (3-input flag crafting, 5-input pentagram assembly)
- Flagic economy: earn by selling products, spend on machines and grimoire pages
- Omega Configuration as ultimate victory condition

### Lore Integration
- **The Vexilloramanomicon**: Grimoire of Vexillomancy, "The Book of FLAGs" / "The FLAG Bible"
- **Omega Configuration**: The ultimate arrangement all flags move toward (from wiki)
- **"Flags are the end of Flags and the beginning of 10,000 Flags"**: Factory scaling
- **"True and Eternal is the Flag within"**: Page quote for Flagic Harvester
- **"Flags are a gateless gate, the invitation to all Madness"**: Ambient quote
- **"Manifest your Quantum Destiny with FLAGS"**: Ambient quote
- **Crystals of Implied Flag**: Crystal resource for enchantment
- **Diamond-shaped cloth on lumber**: Flag crafting recipe
- **Effigy**: Present as world landmark behind factory grid
- **Pentagram formations**: Pentagram Forge assembles 5 flags into pentagrams

### Completion Status: BUILT
- **Folder**: `flaghack9/`
- **Files**: 5 source modules + index.html (1438 lines total)
- **Architecture**: Three.js ES modules + importmap
- **Core Systems**: 20x20 grid, 6 machine types, 4 resources, directional conveyors, recipe processing (crafter/enchanter/assembler), Flagic economy, Vexilloramanomicon grimoire (10 pages), item movement/animation, Effigy landmark, playa world with camps/flags/dust, hover/build/delete UI, Omega Configuration victory

### Alch3my Wiki Fetches
- **Talk:Survey_Flags**: "Flags are the end of Flags and the beginning of 10,000 Flags", "Flags are a gateless gate", "True and Eternal is the Flag within", "Flags as a voluntary virus", The Vexilloramanomicon reference
- **Vexilloramanomicon page**: Confirmed as grimoire of Vexillomancy, alternate names "Book of FLAGs" and "FLAG Bible"
- **Ideas page**: "The idea is a living form" (Giordano Bruno) — thematic for flags-as-ideas

### New Lore Discovered
- **The Vexilloramanomicon**: Sacred grimoire, Book of FLAGs, FLAG Bible
- **"Flags are a gateless gate, the invitation to all Madness"**: From Talk:Survey_Flags
- **"Flags as a voluntary virus"**: Spreading values through social mechanisms
- **"Every idea is an idol, if not reborn in living experience"**: Hamann quote, thematic

### Next Sequel Seed: FLAGHACK 10
- Card Battler with Congress of the Flags theme
- Vexillisainthood as ultimate achievement (from wiki)
- Faction-based opponents from accumulated lore

---

## FLAGHACK 10: CONGRESS OF THE FLAGS

### Concept
- **Genre**: Card Battler / Deck Builder
- **Theme**: The Congress of the Flags has convened. As a Vexillomancer delegate, battle four rival factions with flag-themed spell cards. Build your deck, climb Congress ranks, achieve Vexillisainthood.
- **Key Innovation**: 16 unique flag-themed cards with damage/heal/shield/draw/special effects. 4 faction opponents with unique decks and escalating difficulty. Deck building via post-battle card rewards. Congress rank progression.
- **Addictiveness Hooks**: Deck optimization (collection), faction progression (near-miss), card discovery (mystery), Vexillisainthood chase (prestige), risk/reward card play

### What improves over FH9
- Genre shift to card battler adds strategic depth and replayability
- 16 cards with 4 rarities (common/rare/epic/legendary) and 5 special effects (burn/poison/skip/steal/none)
- 4 factions with distinct personalities, strategies, and escalating HP
- Deck building between battles — choose reward cards to strengthen deck
- 3D pentagram arena with animated combatants and particle effects
- Congress rank system (Initiate → Delegate → Orator → Legislator → High Delegate → Vexillisaint)
- Flagic as card resource with growth per victory

### Lore Integration
- **Congress of the Flags**: Real event from Alchemy 2017, "attended by whoever showed up"
- **Vexillisainthood**: From Congress wiki - "must be recognized in others to attain"
- **Flag Commandments**: Two laws from the Congress (no entering tents for flags, mediation disputes)
- **Hippie Delegation**: Classic antagonist faction
- **The Ban Enforcers**: From FH6 lore (Noospheric Munitions Act)
- **Schismmancers**: From wiki - renegade Vexillomancers
- **The Anti-Flag**: From FH7 lore - negation of the Signifier
- **Omega Configuration**: Legendary card (from wiki)
- **Chronoschism**: Epic card - null-time skip mechanic
- **Effigy Flame**: Rare card - burn DOT
- **Voluntary Virus**: Rare card - poison DOT (from Talk:Survey_Flags)
- **Vexilloramanomicon**: Referenced in battle quotes
- **Geomantica**: Rare card - draw 3

### Completion Status: BUILT
- **Folder**: `flaghack10/`
- **Files**: 4 source modules + index.html (1182 lines total)
- **Architecture**: Three.js ES modules + importmap
- **Core Systems**: 16 card types, 4 faction opponents, deck shuffling/draw/discard, Flagic cost/turn system, 5 special effects (burn/poison/skip/steal), enemy AI (prioritizes expensive cards), 3D pentagram arena with animated figures, Congress rank progression (6 ranks), post-battle card rewards, defeat/restart, Vexillisainthood victory

### Alch3my Wiki Fetches
- **Congress of the Flags**: Event at Alchemy 2017, Flag Commandments (no tent searching, mediation), Vexillisainthood tradition (reciprocal, non-hierarchical)
- **Order of the Golden FLAG**: Secret society, founding part of Hermetic Order of the Golden Dawn
- **Special:AllPages**: ~170 pages including Schismmancer, Time Piracy, Egregore, Congress of the Flags, Forbidden Knowledge, 2040 Election Platform

### New Lore Discovered
- **Congress of the Flags**: Real vexillomantic summit, open attendance
- **Flag Commandments**: No entering tents for flags; mediation for disputes
- **Vexillisainthood**: Must be "recognized in others to attain" — reciprocal divinity
- **Order of the Golden FLAG**: Secret society linked to Golden Dawn
- **Schismmancers**: Renegade Vexillomancers (from wiki page list)

### Next Sequel Seed: FLAGHACK 11
- Rhythm game with Time Piracy theme
- "Thick Time" and "Time Crystallization" as reward mechanics
- 5 lanes = pentagram ley lines

---

## FLAGHACK 11: TIME PIRACY

### Concept
- **Genre**: Rhythm Game
- **Theme**: Time Piracy — flag placement creates temporal rhythms. Hit notes on 5 ley line lanes to the beat, form pentagrams across all lanes, accumulate Thick Time to crystallize Time Crystals
- **Key Innovation**: Thick Time meter fills with perfect/great hits, crystallizes into Time Crystals at threshold (500 bonus points). Pentagram bonus for hitting all 5 lanes. Procedural beat generation + Web Audio API percussion. Hippie notes must be AVOIDED (penalty for hitting them)
- **Addictiveness Hooks**: Rhythm flow state, combo chasing, score perfection, song unlocking (gated by Time Crystals), Thick Time → Crystal crystallization dopamine

### What improves over FH10
- Genre shift to rhythm game adds flow-state engagement and muscle memory
- Procedural audio (Web Audio API) — no external audio files needed
- 5 songs with escalating BPM and difficulty (100-180 BPM)
- 4 note types (flag, crystal, effigy, hippie-avoid) with distinct 3D visuals and sounds
- Thick Time / Time Crystal mechanic creates secondary reward loop
- Pentagram bonus across all 5 lanes creates strategic hit patterns
- 6-tier pirate rank progression
- Timing windows (Perfect/Great/Good/Miss) with visual feedback

### Lore Integration
- **Time Piracy**: "The process of stealing time, especially simultaneously" (from wiki)
- **Thick Time**: "Rapid and exponential inflation of time" leading to crystallization
- **Time Crystals**: Formed from thick time, gatekeep song unlocks
- **"Over 90% of real time originates from time piracy"**: Song description
- **"Bootlegged time is more true than its source material"**: Subtitle quote
- **Flags as time piracy**: "Flags are a known example of time piracy" (from wiki)
- **The Great Chronoschism**: Song 3 theme (null-time)
- **5 ley line lanes**: Pentagram configuration mapped to rhythm lanes
- **Hippies**: Avoid-notes (green dodecahedrons)
- **Effigy**: High-value note type

### Completion Status: BUILT
- **Folder**: `flaghack11/`
- **Files**: 4 source modules + index.html (1068 lines total)
- **Architecture**: Three.js ES modules + importmap + Web Audio API
- **Core Systems**: 5-lane rhythm game, procedural note chart generation, Web Audio percussion (kick/hihat/chime/crystal/effigy sounds), 4 timing windows, combo system, Thick Time meter + crystallization, pentagram bonus, 5 songs (100-180 BPM), song select/unlock, results screen, 6 pirate ranks, 3D lane visuals with particles and decorative flags

### Alch3my Wiki Fetches
- **Time Piracy**: Stealing/bootlegging time, thick time, time crystallization, 90% of real time is bootlegged, flags as time piracy example
- **Forbidden Knowledge**: Gatekept behind comprehension/subscription tier — "HALT!" (used as design inspiration for locked songs)

### New Lore Discovered
- **Time Piracy**: Process of stealing/bootlegging time to "over-stuff reality"
- **Thick Time**: Time inflated through piracy, precursor to crystallization
- **"Bootlegged time is more true than its source material"**: Temporal recursion
- **"The past's capacity to hold time remains unknown"**: Philosophical depth
- **Reverse Time Piracy**: Operating on the future (skeptics call it "causality")

### Next Sequel Seed: FLAGHACK 12
- Dating sim / visual novel genre shift
- Egregore (collective consciousness) as character or mechanic
- "Forbidden Knowledge" tiered progression
- "Advanced Knowledge" / "More Advanced Knowledge" / "Even More Advanced Knowledge" as unlock tiers
- Open world exploration of Flagistan with NPC relationships
