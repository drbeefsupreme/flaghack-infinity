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

### Key Principles
- Variable reward schedules work (random drug drops, random enchantments)
- Loss aversion drives engagement (hippies steal YOUR flags)
- Near-miss dynamics are untapped (could add close-call pentagram formations)
- Mystery/discovery not yet fully explored (Geomantica divination system is perfect for this)

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
- To be determined after reviewing remaining FLAG_DOCS (Poster B, FLAGISTAN AWAITS 2, LOGOS/, Art Assets/)
