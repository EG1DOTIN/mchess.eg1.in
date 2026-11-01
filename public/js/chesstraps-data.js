/**
 * @file chesstraps-data.js
 * @description Educational metadata and tactical breakdown for chess opening traps.
 * Maps by trap name or index to provide the Bait, Blunder, Refutation, and Defense lessons.
 * Includes precise move indices (baitPly, blunderPly, refutationPly) for interactive stepper synchronization.
 * @project Marwadi Chess
 */

(function () {
    'use strict';

    const CHESS_TRAPS_DATA = [
        {
            name: "Fishing Pole Trap",
            eco: "C65",
            opening: "Ruy Lopez: Berlin Defense, Fishing Pole Variation",
            setter: "black",
            category: "e4",
            baitPly: 7,       // 4...Ng4
            blunderPly: 10,   // 6. hxg4??
            refutationPly: 11,// 6...hxg4
            bait: "Black plays 4...Ng4 and 5...h5, boldly dangling the knight as 'bait' on g4.",
            blunder: "6. hxg4?? White gets greedy and captures the knight, opening the h-file for Black's rook.",
            refutation: "7...Qh4! brings Black's queen into the open h-file, forcing unstoppable checkmate (8.f3 g3 9.Bxc6 Qh1#).",
            defense: "6. d3 or 6. Re1 safely develops pieces and keeps the kingside completely secure.",
            tags: ["Ruy Lopez", "h-file Attack", "Checkmate"]
        },
        {
            name: "Lasker Trap",
            eco: "D08",
            opening: "Queen's Gambit Declined: Albin Countergambit",
            setter: "black",
            category: "d4",
            baitPly: 5,       // 3...d4
            blunderPly: 6,    // 4. e3?
            refutationPly: 7, // 4...Bb4+
            bait: "Black plays 2...e5 and 3...d4, establishing an advanced pawn wedge deep in White's territory.",
            blunder: "4. e3? Bb4+ 5. Bd2 dxe3! 6. Bxb4? exf2+ 7. Ke2 walks into a famous underpromotion trap.",
            refutation: "7...fxg1=N+! Underpromoting to a knight with check wins White's queen (if 8.Rxg1 Bg4+ skewers Ke2 to Qd1).",
            defense: "4. Nf3 Nc6 5. a3 or 5. g3 consolidates White's extra pawn with a solid advantage.",
            tags: ["Albin Countergambit", "Underpromotion", "Queen Skewer"]
        },
        {
            name: "Budapest Trap",
            eco: "A45",
            opening: "Indian Game: Lazard Gambit",
            setter: "black",
            category: "d4",
            baitPly: 5,       // 3...Ng4
            blunderPly: 6,    // 4. h3??
            refutationPly: 7, // 4...Ne3!
            bait: "Black gambits the e5 pawn and plays 3...Ng4, tempting White to kick the knight.",
            blunder: "4. h3?? White instinctively attacks the knight, failing to realize the e3 square is fatally undefended.",
            refutation: "4...Ne3! attacks White's queen; if 5. fxe3 Qh4+ 6. g3 Qxg3# checkmate on move 6!",
            defense: "4. Nf3 or 4. Bf4 comfortably guards the e5 pawn while developing soundly.",
            tags: ["Budapest Defense", "Queen Infiltration", "Quick Mate"]
        },
        {
            name: "Monticelli Trap",
            eco: "E11",
            opening: "Bogo-Indian Defense: Monticelli Trap",
            setter: "white",
            category: "d4",
            baitPly: 16,      // 9. Qc2
            blunderPly: 19,   // 10...Qxg5?
            refutationPly: 20,// 11. Bxb7
            bait: "White plays 9. Qc2 and fianchettos the bishop on g2, enticing Black into trades.",
            blunder: "10...Qxg5? Black accepts the knight sacrifice without noticing the deadly dual threats on h7 and b7.",
            refutation: "10. Ng5!? hits h7 with the queen and b7 with the g2 bishop; 11. Bxb7 wins the a8 rook!",
            defense: "10...Ne4 11. Bxe4 Bxe4 12. Qxe4 Qxg5 13. Qxa8 Nc6 traps White's queen with dynamic equality.",
            tags: ["Bogo-Indian", "Double Attack", "Exchange Win"]
        },
        {
            name: "Monticelli Trap (Capablanca vs Euwe)",
            eco: "E11",
            opening: "Bogo-Indian Defense: Monticelli Trap",
            setter: "white",
            category: "d4",
            baitPly: 16,      // 9. Qc2
            blunderPly: 19,   // 10...Qxg5?
            refutationPly: 20,// 11. Bxb7
            bait: "A historic masterclass between two World Champions in Amsterdam, 1931.",
            blunder: "Euwe tests Capablanca with 9...Nxc3, inviting the venomous 10. Ng5!? continuation.",
            refutation: "Capablanca executes the knight leap and wins the exchange on a8, but Euwe defends tenaciously to draw.",
            defense: "Precise coordination and counterplay against White's stray queen on a8 keeps Black in the game.",
            tags: ["Capablanca", "World Champions", "Grandmaster Trap"]
        },
        {
            name: "Kieninger Trap",
            eco: "A52",
            opening: "Budapest Defense: Rubinstein Variation",
            setter: "black",
            category: "d4",
            baitPly: 13,      // 7...Ngxe5
            blunderPly: 14,   // 8. axb4??
            refutationPly: 15,// 8...Nd3#
            bait: "Black pins White's knight with 6...Qe7 and 7...Ngxe5, leaving the b4 bishop loose.",
            blunder: "8. axb4?? White gets greedy and captures Black's bishop, leaving the critical d3 square undefended.",
            refutation: "8...Nd3# Smothered checkmate! The White king is completely suffocated by his own surrounding pieces.",
            defense: "8. Nxe5 Nxe5 9. e3 safely breaks the pin and keeps White in control.",
            tags: ["Budapest Defense", "Smothered Mate", "Pin Exploitation"]
        },
        {
            name: "Blackburne-Shilling Trap",
            eco: "C50",
            opening: "Blackburne Shilling Gambit (Italian Game)",
            setter: "black",
            category: "e4",
            baitPly: 5,       // 3...Nd4!?
            blunderPly: 6,    // 4. Nxe5?
            refutationPly: 7, // 4...Qg5!
            bait: "Black plays the pseudo-blunder 3...Nd4, breaking opening principles and hanging the e5 pawn.",
            blunder: "4. Nxe5? Qg5! followed by 5. Nxf7?? White greedily forks Black's queen and rook.",
            refutation: "5...Qxg2! 6. Rf1 Qxe4+ 7. Be2 Nf3# delivers a picture-perfect smothered mate with queen and knight.",
            defense: "4. Nxd4 exd4 5. O-O gives White a dominating central majority and superior development.",
            tags: ["Italian Game", "Queen Counter-attack", "Smothered Mate"]
        },
        {
            name: "Philidor Legal Mate Trap",
            eco: "C41",
            opening: "Philidor Defense: Legal's Mate",
            setter: "white",
            category: "e4",
            baitPly: 8,       // 5. Nxe5!
            blunderPly: 9,    // 5...Bxd1??
            refutationPly: 10,// 6. Bxf7+
            bait: "White plays 5. Nxe5!, seemingly blundering the prized queen on d1.",
            blunder: "5...Bxd1?? Black eagerly captures the queen without calculating the lethal coordination on f7.",
            refutation: "6. Bxf7+ Ke7 7. Nd5# Checkmate delivered purely by minor pieces while Black's queen watches helplessly.",
            defense: "5...dxe5 6. Qxg4 gives White an extra pawn, but avoids instant checkmate for Black.",
            tags: ["Philidor Defense", "Queen Sacrifice", "Minor Piece Mate"]
        },
        {
            name: "Elephant Trap",
            eco: "D51",
            opening: "Queen's Gambit Declined: Modern Variation",
            setter: "black",
            category: "d4",
            baitPly: 9,       // 5...exd5
            blunderPly: 10,   // 6. Nxd5?
            refutationPly: 11,// 6...Nxd5!
            bait: "5...exd5 appears to blunder a pawn because Black's d7 knight seems pinned to the queen.",
            blunder: "6. Nxd5?? White assumes the pin prevents Black from capturing back on d5.",
            refutation: "6...Nxd5! 7. Bxd8 Bb4+! 8. Qd2 Kxd8 wins a full minor piece after the dust settles.",
            defense: "6. e3 quietly develops the light-squared bishop and holds a solid positional edge.",
            tags: ["Queen's Gambit", "Intermezzo Check", "Piece Win"]
        },
        {
            name: "Rubinstein Trap",
            eco: "D63",
            opening: "Queen's Gambit Declined: Orthodox Defense",
            setter: "white",
            category: "d4",
            baitPly: 22,      // 12. Bf4
            blunderPly: 23,   // 12...f5?
            refutationPly: 24,// 13. Nxd5!
            bait: "White plays 11. O-O and 12. Bf4, encouraging Black to overcommit minor pieces in the center.",
            blunder: "12...f5? Black tries to solidify the e4 knight, critically weakening the d8 queen's escape squares.",
            refutation: "13. Nxd5! cxd5 14. Bc7! traps Black's queen right on d8 with no legal moves left.",
            defense: "12...Ndf6 or 12...Bf6 safely reinforces the center without compromising queen safety.",
            tags: ["Queen's Gambit", "Trapped Queen", "Central Tactic"]
        },
        {
            name: "Mortimer Trap",
            eco: "C65",
            opening: "Ruy Lopez: Berlin Defense, Mortimer Trap",
            setter: "black",
            category: "e4",
            baitPly: 7,       // 4...Ne7
            blunderPly: 8,    // 5. Nxe5?
            refutationPly: 9, // 5...c6!
            bait: "Black plays 4...Ne7, intentionally hanging the central e5 pawn.",
            blunder: "5. Nxe5? falls for the bait: Black plays 5...c6! hitting the bishop on b5.",
            refutation: "If 6. Ba4 Qa5+ forks king and knight; if 6. Nc4 Ng6 parries 7.Nd6# and traps White's pieces.",
            defense: "5. Nc3 or 5. O-O continues normal Ruy Lopez pressure with no tactics allowed.",
            tags: ["Ruy Lopez", "Double Attack", "Fork Tactic"]
        },
        {
            name: "Noah's Ark Trap",
            eco: "C71",
            opening: "Ruy Lopez: Modern Steinitz Variation",
            setter: "black",
            category: "e4",
            baitPly: 13,      // 7...Nxd4
            blunderPly: 14,   // 8. Qxd4?
            refutationPly: 15,// 8...c5
            bait: "Black sets up 5...b5 and 6...d6, driving White's bishop back to the b3 square.",
            blunder: "8. Qxd4? c5 9. Qd5 Be6 10. Qc6+ Bd7 11. Qd5? White refuses to admit the danger on the flank.",
            refutation: "11...c4! The historic Noah's Ark pawn chain slams the cage shut on White's b3 bishop.",
            defense: "8. Nxd4 avoids queen exposure and maintains a healthy initiative.",
            tags: ["Ruy Lopez", "Trapped Bishop", "Pawn Chain"]
        },
        {
            name: "Tarrasch Trap",
            eco: "C83",
            opening: "Ruy Lopez: Open Variations",
            setter: "white",
            category: "e4",
            baitPly: 20,      // 11. Nd4
            blunderPly: 21,   // 11...Qd7??
            refutationPly: 22,// 12. Nxe6!
            bait: "White plays 11. Nd4, provoking Black to bring the queen to d7 to defend e6.",
            blunder: "11...Qd7?? fatally miscalculates the overloaded e6 bishop and the open d-file pin.",
            refutation: "12. Nxe6! Qxe6 13. Rxe4! skewers and wins Black's pinned e4 knight or queen.",
            defense: "11...Nxd4 12. cxd4 c6 defends against White's threats with equal chances.",
            tags: ["Ruy Lopez", "Overloaded Defender", "Pin & Skewer"]
        },
        {
            name: "Siberian Trap",
            eco: "B21",
            opening: "Sicilian Defense: Smith-Morra Gambit",
            setter: "black",
            category: "e4",
            baitPly: 15,      // 8...Ng4
            blunderPly: 16,   // 9. h3??
            refutationPly: 17,// 9...Nd4!
            bait: "Black coordinates with 6...Qc7 and 8...Ng4, aiming the heavy artillery directly at h2.",
            blunder: "9. h3?? White instinctively attempts to kick the pesky knight away.",
            refutation: "9...Nd4!! A devastating deflection! If 10. Nxd4 Qh2# checkmate; if 10. hxg4 Nxe2+ wins the queen!",
            defense: "9. Bf4 or 9. Rd1 neutralizes the Queen battery and maintains White's gambit initiative.",
            tags: ["Smith-Morra", "Deflection Sacrifice", "Mating Battery"]
        },
        {
            name: "Fishing Pole Trap (Spanish Exchange)",
            eco: "C69",
            opening: "Ruy Lopez: Exchange Variation",
            setter: "black",
            category: "e4",
            baitPly: 11,      // 6...h5
            blunderPly: 12,   // 7. hxg4?
            refutationPly: 13,// 7...hxg4
            bait: "Black pins with 5...Bg4 and anchors the defense with 6...h5.",
            blunder: "7. hxg4? White cannot resist taking the piece, blowing open the kingside.",
            refutation: "7...hxg4 8. Nxe5 Qh4 9. f3 g3 10. Ng4 Qh1# culminates in an inescapable checkmate.",
            defense: "7. d3 or 7. c3 ignores the bait and focuses on central expansion.",
            tags: ["Ruy Lopez", "Exchange Variation", "King Hunt Mate"]
        },
        {
            name: "Budapest Fajarowicz Trap",
            eco: "A51",
            opening: "Budapest Defense: Fajarowicz Variation",
            setter: "black",
            category: "d4",
            baitPly: 9,       // 5...Bxd6
            blunderPly: 10,   // 6. g3?
            refutationPly: 11,// 6...Nxf2!
            bait: "Black plays 3...Ne4 and 5...Bxd6, sacrificing a pawn to seize the initiative on the dark squares.",
            blunder: "6. g3? White prepares to fianchetto, completely ignoring the fragile f2 square.",
            refutation: "6...Nxf2! 7. Kxf2 Bxg3+! 8. Kxg3 (or Ke3) Qxd1 wins White's queen cleanly.",
            defense: "6. Nf3 or 6. e3 shores up the kingside diagonals and keeps the extra pawn.",
            tags: ["Budapest Defense", "f2 Breakthrough", "Queen Decoy"]
        },
        {
            name: "Frankenstein-Dracula Trap",
            eco: "C27",
            opening: "Vienna Game: Frankenstein-Dracula Variation",
            setter: "white",
            category: "e4",
            baitPly: 4,       // 3. Bc4
            blunderPly: 5,    // 3...Nxe4?
            refutationPly: 6, // 4. Bxf7+!
            bait: "White plays 3. Bc4, tempting Black to snatch the 'free' e4 pawn.",
            blunder: "3...Nxe4? walks into an immediate tactical storm on f7.",
            refutation: "4. Bxf7+! Kxf7 5. Nxe4 followed by 6. Qf3+ and 7. Ng5! threatening unstoppable mate on f7.",
            defense: "3...Nc6 transposes safely into standard Vienna Game lines.",
            tags: ["Vienna Game", "Bxf7 Sacrifice", "Fierce King Attack"]
        },
        {
            name: "Sicilian Dragon Trap",
            eco: "B72",
            opening: "Sicilian Defense: Classical Dragon",
            setter: "white",
            category: "e4",
            baitPly: 10,      // 6. Be3
            blunderPly: 11,   // 6...Ng4?
            refutationPly: 12,// 7. Bb5+!
            bait: "White plays 6. Be3, tempting Black into a premature knight attack on the bishop.",
            blunder: "6...Ng4? overlooks the cross-board check from the light-squared bishop.",
            refutation: "7. Bb5+! Bd7 8. Qxg4! Black's d7 bishop is pinned to the king, winning the g4 knight for free!",
            defense: "6...Bg7 followed by 7...O-O adheres to solid dragon principles with strong counterplay.",
            tags: ["Sicilian Dragon", "Absolute Pin", "Piece Win"]
        },
        {
            name: "Smith-Morra Gambit Trap",
            eco: "B21",
            opening: "Sicilian Defense: Smith-Morra Gambit",
            setter: "white",
            category: "e4",
            baitPly: 10,      // 6. e5
            blunderPly: 11,   // 6...dxe5?
            refutationPly: 12,// 7. Bxf7+!
            bait: "White plays 6. e5, offering a pawn trade along the central highway.",
            blunder: "6...dxe5? leaves the d8 queen completely exposed on the open d-file.",
            refutation: "7. Bxf7+! Kxf7 8. Qxd8 deflecting the king and winning Black's queen on the spot.",
            defense: "6...Nfd7 counter-attacks the e5 pawn safely while keeping the queen protected.",
            tags: ["Smith-Morra", "Queen Deflection", "Open File Attack"]
        },
        {
            name: "Legal Scotch Gambit Trap",
            eco: "C44",
            opening: "Scotch Game: Sea-cadet Mate",
            setter: "white",
            category: "e4",
            baitPly: 14,      // 8. Nxe5!
            blunderPly: 15,   // 8...Bxd1??
            refutationPly: 16,// 9. Bxf7+
            bait: "White offers the full queen sacrifice with 8. Nxe5! in the center.",
            blunder: "8...Bxd1?? Black snatches the queen without calculating the mating net around e7.",
            refutation: "9. Bxf7+ Ke7 10. Nd5# delivers the classic Sea-cadet minor piece checkmate.",
            defense: "8...dxe5 9. Qxg4 safely recovers the material and keeps Black in the game.",
            tags: ["Scotch Gambit", "Sea-cadet Mate", "Minor Piece Symphony"]
        },
        {
            name: "From's Gambit Trap",
            eco: "A02",
            opening: "Bird Opening: From's Gambit, Lasker Variation",
            setter: "black",
            category: "flank",
            baitPly: 7,       // 4...g5!
            blunderPly: 8,    // 5. e4?
            refutationPly: 9, // 5...g4!
            bait: "Black plays 4...g5!, aggressively sacrificing pawns to smash open White's kingside.",
            blunder: "5. e4? (or 5.h3?? Bg3#) allows 5...g4! 6. e5 gxf3.",
            refutation: "7...Qh4+ 8. g3 Qe4+ 9. Kf2 Qd4+ 10. Kxf3 Bg4+ skewers the king and wins White's queen!",
            defense: "5. d4! halts the g4 push in its tracks and consolidates White's extra pawn.",
            tags: ["From's Gambit", "King Skewer", "Queen Capture"]
        },
        {
            name: "Bird's Opening Lasker Trap",
            eco: "A02",
            opening: "Bird Opening: From's Gambit, Lasker Variation",
            setter: "black",
            category: "flank",
            baitPly: 7,       // 4...g5
            blunderPly: 8,    // 5. h3??
            refutationPly: 9, // 5...Bg3#
            bait: "Black plays 4...g5, threatening to advance with tempo to g4.",
            blunder: "5. h3?? fatally weakens the e1-h4 diagonal leading straight to the White monarch.",
            refutation: "5...Bg3# delivers checkmate in just 5 moves!",
            defense: "5. d4 or 5. g3 blunts Black's attack and protects the light squares.",
            tags: ["Bird Opening", "5-Move Checkmate", "Diagonal Weakness"]
        },
        {
            name: "Tricky Mate Trap (Fajarowicz)",
            eco: "A51",
            opening: "Budapest Defense: Fajarowicz Variation",
            setter: "black",
            category: "d4",
            baitPly: 7,       // 4...b6!?
            blunderPly: 12,   // 7. Qa6??
            refutationPly: 13,// 7...Bb4+
            bait: "Black plays 4...b6 and allows 6. Qxb7, baiting White's queen deep behind enemy lines.",
            blunder: "5. Qd5? Bb7 6. Qxb7 Nc6 7. Qa6?? White greedily hoards material.",
            refutation: "7...Bb4+ 8. Bd2 Nc5 9. Qb5 Bxd2+ 10. Nbxd2 a6! Trapping White's queen on b5!",
            defense: "5. e3 or 5. a3 avoids greedy queen excursions and stabilizes the center.",
            tags: ["Budapest Defense", "Queen Hunt", "Piece Coordination"]
        }
    ];

    // Export globally for browser use
    window.CHESS_TRAPS_DATA = CHESS_TRAPS_DATA;

    // CommonJS / Node export for automated tests if needed
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = CHESS_TRAPS_DATA;
    }
})();
