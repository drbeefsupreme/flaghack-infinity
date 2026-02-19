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

### Next Sequel Seed: FLAGHACK 6
- **Concept**: "FLAGHACK 6: THE BAN" - A survival/base-building game where the Anti-Flag Faction ("The Ban") has outlawed flags from all Burns. The Vexillomancer must build a hidden flag sanctuary, recruit Signifiers, and lead a resistance. Inspired by "Ban Flags from Burns" propaganda and "Find Your Flags" open-world imagery.
- **Genre Shift**: Survival base builder (from dungeon crawler)
- **Key Innovation**: Faction reputation system (Vexillians vs The Ban), stealth flag placement, Signifier recruitment
- **Addictiveness Hooks**: Base building (sunk cost), faction reputation (social hooks), stealth tension (loss aversion), Signifier collection (collection compulsion)
