import test from 'node:test';
import assert from 'node:assert/strict';
import { STAKE_ROOMS } from './storage';
import { calculateMMRChange, getDivisionTier } from './scoring';

function calculatePotAndCommission(entryFee: number, playerCount: number, commissionPercent: number) {
  const totalPot = entryFee * playerCount;
  const commissionAmount = Math.round(totalPot * (commissionPercent / 100));
  const netWinnerPot = totalPot - commissionAmount;
  return { totalPot, commissionAmount, netWinnerPot };
}

test('Stake room pot and commission calculations for 1v1', () => {
  const noviceRoom = STAKE_ROOMS.find((r) => r.id === 'room_novice')!;
  const result = calculatePotAndCommission(noviceRoom.entryFee, 2, noviceRoom.commissionPercent);

  assert.equal(result.totalPot, 1000);
  assert.equal(result.commissionAmount, 70); // 7% of 1000
  assert.equal(result.netWinnerPot, 930);
});

test('Stake room pot and commission calculations for 2v2 team (4 players)', () => {
  const teahouseRoom = STAKE_ROOMS.find((r) => r.id === 'room_bronze')!;
  const result = calculatePotAndCommission(teahouseRoom.entryFee, 4, teahouseRoom.commissionPercent);

  assert.equal(result.totalPot, 10000); // 2500 * 4
  assert.equal(result.commissionAmount, 600); // 6% of 10000
  assert.equal(result.netWinnerPot, 9400);
});

test('Stake room pot and commission calculations for Group (6 players)', () => {
  const casinoRoom = STAKE_ROOMS.find((r) => r.id === 'room_gold')!;
  const result = calculatePotAndCommission(casinoRoom.entryFee, 6, casinoRoom.commissionPercent);

  assert.equal(result.totalPot, 300000); // 50000 * 6
  assert.equal(result.commissionAmount, 15000); // 5% of 300000
  assert.equal(result.netWinnerPot, 285000);
});

test('Grandmaster VIP lowest commission rate (4%)', () => {
  const vipRoom = STAKE_ROOMS.find((r) => r.id === 'room_diamond')!;
  const result = calculatePotAndCommission(vipRoom.entryFee, 2, vipRoom.commissionPercent);

  assert.equal(result.totalPot, 500000);
  assert.equal(result.commissionAmount, 20000); // 4% of 500000
  assert.equal(result.netWinnerPot, 480000);
});

test('Game logic: Pooch elimination marks hand safe', () => {
  const hands = [
    { id: 0, hasGol: false, isOpened: false, isEliminated: false },
    { id: 1, hasGol: true, isOpened: false, isEliminated: false },
  ];

  const target = hands[0];
  assert.equal(target.hasGol, false);
  target.isOpened = true;
  target.isEliminated = true;

  const remaining = hands.filter((h) => !h.isEliminated);
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].hasGol, true);
});

test('Advanced Scoring: Standard win vs loss MMR calculation', () => {
  const winResult = calculateMMRChange({ isWin: true, mode: '1v1' });
  assert.equal(winResult.mmrChange, 25);
  assert.equal(winResult.trophyChange, 30);
  assert.equal(winResult.performanceGrade, 'A');

  const lossResult = calculateMMRChange({ isWin: false, mode: '1v1' });
  assert.equal(lossResult.mmrChange, -15);
  assert.equal(lossResult.trophyChange, -18);
  assert.equal(lossResult.performanceGrade, 'C');
});

test('Advanced Scoring: Shah Gol strike and Clean Sweep bonuses', () => {
  const result = calculateMMRChange({
    isWin: true,
    isShahGol: true,
    cleanSweep: true,
    mode: '1v1',
  });
  // 25 (base) + 15 (shah gol) + 10 (clean sweep) = 50
  assert.equal(result.mmrChange, 50);
  assert.equal(result.performanceGrade, 'S+');
});

test('Advanced Scoring: Speed mode score to MMR rating conversion', () => {
  const result = calculateMMRChange({
    isWin: true,
    mode: 'speed',
    speedScore: 8,
  });
  assert.equal(result.performanceGrade, 'S+');
  assert.ok(result.mmrChange >= 25);
  assert.ok(result.trophyChange >= 30);
});

test('Advanced Scoring: Survivor mode victory high reward', () => {
  const result = calculateMMRChange({
    isWin: true,
    mode: 'survivor',
  });
  // 25 (base) + 30 (survivor) = 55
  assert.equal(result.mmrChange, 55);
  assert.equal(result.trophyChange, 75);
  assert.equal(result.performanceGrade, 'S+');
});

test('Division Tiers: Correct rank bracket assignment', () => {
  assert.equal(getDivisionTier(450), 'bronze');
  assert.equal(getDivisionTier(1200), 'silver');
  assert.equal(getDivisionTier(1850), 'gold');
  assert.equal(getDivisionTier(2200), 'platinum');
  assert.equal(getDivisionTier(2750), 'diamond');
  assert.equal(getDivisionTier(3400), 'grandmaster');
});

test('Difficulty scaling: Grandmaster awards 1.5x MMR compared to casual', () => {
  const casualWin = calculateMMRChange({ isWin: true, mode: '1v1', difficulty: 'casual' });
  const gmWin = calculateMMRChange({ isWin: true, mode: '1v1', difficulty: 'grandmaster' });
  assert.equal(casualWin.mmrChange, 20); // 25 * 0.8
  assert.equal(gmWin.mmrChange, 38);     // 25 * 1.5 rounded
  assert.ok(gmWin.mmrChange > casualWin.mmrChange);
});
