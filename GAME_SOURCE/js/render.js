/* render.js — วาดโลก 2D ด้วย Canvas: ภูมิประเทศแบบแคชเป็นก้อน (chunk), สถาปัตยกรรมสำนักแยกตามตระกูลอาคารและระดับอัปเกรด,
 * ตัวละครและรูปประจำตัวที่ใช้ตัวระบุรูปลักษณ์ร่วมกัน (shared visual profile), อาวุธตามประเภทจริง, การแสดงผลกิจกรรมจากระบบ NPC,
 * แสงเงาตามเวลา/ฤดู/อากาศแบบแคชสไปรต์แสง และระดับคุณภาพกราฟิก (Auto/Low/Standard/High) โดยไม่แตะต้อง RNG หรือสถานะจำลอง */
(function (g) {
  'use strict';
  const U = g.U, MAP = g.MAP, HC = g.HC, CULT = g.CULT, SECT = g.SECT, AI = g.AI;
  const clamp = U.clamp, T = MAP.T, TS = 16;
  const R = { TILE_SIZE: TS };
  const FONT = '"Noto Sans Thai","Sarabun","Leelawadee UI",system-ui,sans-serif';
  // Art coordinates are relative to the beast's feet. Each layer uses the
  // species palette; lifted wings have their own pivot and animation.
  const wildModels = {
    wolf: { top: 24, layers: [
      ['shade', 'M-11-10Q-19-6-24-10L-19-12-14-17Z M-9-10-7-1-3-1-4-12Z M6-12 7-2 11-2 11-13Z'],
      ['body', 'M-15-11Q-15-19-5-18L3-18 7-21 9-27 13-22 17-24 17-19 23-15 21-12 13-12 10-6 8 0 4 0 4-9-6-8-11 0-15 0-12-9Z'],
      ['light','M-12-14Q-9-19 2-16L7-19 13-18 10-13 3-10-3-12Z'],
      ['eye','M15-18 18-17 15-16Z']
    ] },
    fox: { top: 26, layers: [
      ['shade','M-9-9Q-27-5-25-20Q-21-12-10-17Z'],
      ['light','M-25-20Q-25-13-21-12L-18-14Z'],
      ['body','M-13-12Q-10-19 2-15L7-18 7-26 13-22 16-26 17-18 23-13 16-12 11-8 10-1 7-1 6-9-5-8-9 0-13 0-11-7Z'],
      ['light','M9-17 16-17 23-13 16-12 11-8 6-9Z'],
      ['eye','M15-17 18-16 15-15Z']
    ] },
    cat: { top: 22, layers: [
      ['shade','M-11-13C-24-7-30-15-23-21L-21-20C-26-14-20-13-11-17Z M-9-12-5-2 0-2-3-10Z M8-13 11-2 15-2 14-12Z'],
      ['body','M-16-11Q-16-19-5-17Q3-15 8-18L12-18Q11-24 16-21L18-19Q23-19 23-14L20-10 14-10 12-1 7-1 8-9-6-8-12 0-17 0-13-8Z'],
      ['light','M-13-14Q-9-18 3-15L10-17 9-12Q-3-10-13-14Z M16-12 22-15 22-12 19-10Z'],
      ['eye','M17-17 21-16 18-15Z']
    ] },
    bear: { top: 25, layers: [
      ['shade','M-12-11-10-2-5-2-5-12Z M7-13 9-2 15-2 14-13Z'],
      ['body','M-20-10Q-22-20-12-20Q-6-27 7-22L12-21Q11-26 16-25L19-22 25-17 24-12 17-10 16-1 10-1 8-9-6-7-12 0-19 0-17-8Z'],
      ['light','M-14-19Q-4-27 7-21L12-17 7-11 0-12Z M18-17 25-17 24-12 19-12Z'],
      ['eye','M18-19 21-18 19-17Z']
    ] },
    boar: { top: 26, layers: [
      ['shade','M-14-10-12-2-8-2-7-11Z M5-12 6-2 11-2 13-12Z'],
      ['body','M-19-7Q-22-18-13-19L-8-23-4-20 0-26 4-21 7-24 10-19 12-23 17-18 24-15 24-9 16-7 13 0 8 0 8-7-9-7-11 0-17 0-16-6Z'],
      ['light','M-17-15-10-19-5-14-2-19 4-19 6-13 1-8-5-10-11-8Z M18-14 24-15 24-10 20-9Z'],
      ['ivory','M15-9Q22-9 24-15Q24-7 21-6Q18-5 15-9Z'],
      ['eye','M15-17 19-16 16-15Z']
    ] },
    stag: { top: 35, layers: [
      ['shade','M-11-12-9-1-6-1-7-12Z M5-14 8-2 11-2 9-15Z'],
      ['body','M-17-13Q-18-21-9-20L3-17 7-24 7-28 12-26 17-28 17-24 23-22 21-18 15-18 12-10 9 0 6 0 6-10-6-12-14 0-17 0-14-10Z'],
      ['light','M-14-16Q-7-21 4-15L6-18 8-13 3-11-7-13Z M12-23 17-25 22-21 16-20Z'],
      ['ivory','M13-26 10-31 4-33 2-37 6-35 9-35 7-39 11-36 13-31 16-32 19-37 19-32 17-29 15-25Z'],
      ['eye','M16-24 19-23 16-22Z']
    ] },
    goat: { top: 31, layers: [
      ['shade','M-12-11-9-1-6-1-7-12Z M8-13 10-2 13-2 12-13Z'],
      ['body','M-17-17-13-22-13-18Q-8-20 1-17L7-21 11-26 15-25 18-23 22-21 20-17 16-16 15-12 12-16 9-6 8 0 5 0 5-11-6-9-12 0-16 0-12-10Q-18-13-17-17Z'],
      ['ivory','M11-24Q6-29 8-34Q10-30 15-28L16-24Z M15-26Q14-32 19-34L18-29 19-25Z'],
      ['light','M-14-17Q-7-19 1-15L6-18 5-13-1-10-8-12Z'],
      ['eye','M16-23 19-22 16-21Z']
    ] },
    bull: { top: 28, layers: [
      ['shade','M-13-12-11-2-7-2-7-12Z M8-13 9-2 14-2 13-14Z'],
      ['body','M-20-7-17-16Q-10-22 1-21L10-24 16-21 21-22 25-17 24-10 19-8 13-11 11-1 6-1 7-10-7-10-13 0-18 0-15-9Z'],
      ['ivory','M12-21Q7-21 6-27Q11-24 16-24L19-21Q26-22 27-27Q30-20 23-18L18-19Z'],
      ['light','M-14-16 0-18 4-20 10-21 11-16 5-11-1-15-8-13Z'],
      ['eye','M20-17 23-16 20-15Z']
    ] },
    serpent: { top: 25, shadow: 18, layers: [
      ['body','M-23-7C-27-2-16 1-5-2C10-6 16-2 19-5C25-11 12-14 10-16C8-18 17-18 22-18L25-21 21-25 15-27 8-24C-3-18 3-12 10-10C-2-8-16-3-23-7Z'],
      ['light','M-24-6C-17-3-10-7 2-9C-1-16 4-22 12-24L18-24C10-22 8-19 10-16C12-13 23-13 20-7C13-5 10-8-4-4C-14-1-22-2-24-6Z'],
      ['eye','M18-24 22-22 19-21Z']
    ] },
    cobra: { top: 33, shadow: 16, layers: [
      ['body','M-21-5C-25 1-10 1-1-3L11-3C23-4 16-12 5-12C3-13 5-16 7-17Q0-18 0-25Q0-34 11-33Q23-33 24-25Q24-18 16-16C11-14 19-17 21-9C25 0-8 6-21-5Z'],
      ['light','M6-26Q1-29 10-31L19-29 21-25 17-20 13-22 10-19 4-22Z M14-14Q30-3 3-2L-8-2Q16-6 14-14Z'],
      ['shade','M9-29 16-30 21-27 21-24 16-22 9-24 7-26Z'],
      ['eye','M16-27 20-26 16-25Z']
    ] },
    bird: { top: 34, hover: 3, layers: [
      ['shade','M-6-14-19-12-24-4-11-7 1-14Z'],
      ['body','M-13-23Q-5-26 3-22L9-27 17-26 23-21 17-21 16-17 10-14 2-10-13-12-21-8-20-13-26-14Z'],
      ['wing','M-1-15Q-15-19-24-37Q-16-34-12-28L-15-37Q-6-32-4-25L-5-34Q3-30 7-23L6-19Z'],
      ['light','M-13-20Q-6-24 4-20L10-23 15-19 10-15 0-12Z M12-26 17-26 23-21 17-21Z'],
      ['eye','M15-24 18-23 15-22Z']
    ] },
    crane: { top: 33, hover: 2, layers: [
      ['shade','M-3-10-13-3-20-4-20-2-11-1 2-9Z'],
      ['body','M-22-14-12-22Q-6-23 4-17L8-18Q12-22 8-26Q8-34 18-34L25-31 19-29 15-30Q18-23 16-19Q12-9-3-9Z'],
      ['wing','M-4-12Q-18-13-24-28Q-14-27-10-23L-12-31Q-5-29 2-20L2-15Z'],
      ['light','M-11-17Q-8-21 4-16L9-19 12-17 4-12-5-12Z'],
      ['eye','M16-33 19-32 17-31Z']
    ] },
    bat: { top: 28, hover: 4, layers: [
      ['wing','M-1-15Q-13-12-29-28L-25-16-26-7Q-20-12-14-6Q-9-12-3-7Z M5-13Q16-26 27-28L23-18 26-8Q18-13 13-6Q9-12 5-7Z'],
      ['body','M-8-15-8-23-2-19Q2-22 6-19L12-23 11-16 13-12 8-8 4-3 1-8Q-9-8-8-15Z'],
      ['light','M-4-14 1-17 8-16 11-12 7-10 1-11Z'],
      ['eye','M7-15 10-14 7-13Z']
    ] },
    turtle: { top: 23, layers: [
      ['shade','M-12-11-15-2-8-2-5-11Z M6-12 9-2 15-2 14-11Z'],
      ['body','M-16-11Q-16-17-10-21L-2-24 7-22 13-18 16-12 17-15 23-16 26-13 25-9 15-7 14 0 8 0 6-6-7-5-11 0-17 0-15-5-23-5Z'],
      ['light','M-14-12-9-18-4-15-6-10Z M-6-19-1-22 6-20 3-16-3-16Z M-4-14 3-14 6-10 2-7-5-10Z M5-15 8-19 12-15 14-11 8-11Z'],
      ['eye','M21-14 24-13 22-12Z']
    ] },
    scorpion: { top: 30, layers: [
      ['shade','M-10-13-18-8-21-3-18-3-11-8-5-9Z M-5-12-14-3-14 0-10-1-4-7 6-8Z M1-11-3-1-1 1 4-5 10-7Z'],
      ['body','M-12-8Q-18-14-11-22Q-5-28 3-25L6-29 11-27 8-24 7-21C2-24-4-23-8-17L-9-14Q0-16 7-12L13-16 19-18 25-14 21-13 25-8 17-8 14-12 9-8 13-5 20-6 26-3 21-2 24 1 17 2 9-3 3-5-6-4Z'],
      ['light','M-11-12-7-13-4-10-7-7-10-8Z M-3-13 2-13 5-11 1-7-3-8Z M7-11 11-12 14-9 11-6 8-7Z'],
      ['eye','M9-10 11-10 10-8Z']
    ] },
    beetle: { top: 22, layers: [
      ['shade','M-12-13-21-15-18-10-11-8-19-4-18-1-8-5-10 0-7 1-2-6 3-5 7 1 10 0 6-7 12-6 19-3 20-5 11-11Z'],
      ['body','M-21-10Q-22-18-12-22Q-1-25 7-19L12-16 15-17 18-22 21-22 19-16 26-17 25-13 18-11 16-8 8-8 5-5Q-16 0-21-10Z'],
      ['light','M-18-11Q-20-18-10-20Q-1-22 5-17L-9-12-17-8Z M-12-8 6-15 8-12 3-8-12-5Z'],
      ['eye','M15-14 18-14 17-12Z']
    ] },
    spider: { top: 25, layers: [
      ['shade','M-11-14-22-23-28-13-26-9-22-17-13-8Z M-5-14-17-19-22-4-19-1-16-13-8-7Z M2-14 7-22 16-13 17-8 8-16 6-10Z M5-10 14-16 24-10 24-5 14-10 10-5Z'],
      ['body','M-22-13Q-22-23-11-24Q0-25 3-16Q8-18 14-14L17-12 22-11 19-7 13-9Q6-6 1-10Q-10-2-21-9Z'],
      ['light','M-18-14Q-19-21-10-22Q-4-21-1-17L-5-11-14-9Z'],
      ['eye','M11-14 16-12 13-10 11-12 8-11 8-13Z']
    ] },
    crawler: { top: 18, shadow: 19, layers: [
      ['shade','M-18-11-24-12-25-8-20-5-17-5-22-9Z M-11-10-15-3-12-2-7-8Z M-2-9-4-2-1-1 3-9Z M7-13 8-3 11-3 12-11Z M16-16 22-21 23-19 20-13Z'],
      ['body','M-24-10Q-18-14-13-10Q-9-15-4-11Q1-16 7-12Q8-19 15-16L20-18 25-15 25-11 19-7 13-8 9-6 3-6-4-4-10-4-15-5-22-6Z'],
      ['light','M-21-10-17-11-13-9-17-7Z M-11-10-7-12-4-10-7-7Z M-2-11 2-13 6-11 3-7Z M8-13 12-16 15-13 13-10Z'],
      ['eye','M19-15 23-14 20-12Z']
    ] },
    ant: { top: 21, layers: [
      ['shade','M-11-10-19-18-24-13-23-10-18-14-9-6Z M-3-12-9-2-6-1 1-10Z M5-12 9-3 13-2 10-11Z M12-14 21-22 19-22 12-17Z'],
      ['body','M-23-12Q-24-19-14-20Q-7-20-5-14L0-12Q0-17 6-17L11-13 13-18 19-17 22-13 25-17 26-13 23-8 19-7 13-9 9-9Q5-6 0-8L-6-9Q-14-3-22-8Z'],
      ['light','M-20-14Q-16-20-9-16L-9-13-16-9Z M1-13 6-15 8-12 5-10Z'],
      ['eye','M17-16 20-14 17-13Z']
    ] },
    mantis: { top: 26, layers: [
      ['shade','M-10-12-16-4-22-3-24-1-14-1-7-8Z M-1-12 4-5 8-3 10-5 5-10Z'],
      ['body','M-24-11Q-20-17-10-15L-2-11 6-17 8-23 14-26 19-24 20-20 13-17 11-12 16-9 21-17 24-17 21-7 16-5 9-9 3-8Q-10-5-24-11Z'],
      ['light','M-23-11Q-18-16-11-14L0-11-9-9Z M10-22 14-25 18-23 16-20Z'],
      ['eye','M14-23 17-22 15-21Z']
    ] },
    moth: { top: 31, hover: 4, layers: [
      ['shade','M-5-15Q-19-13-20-5Q-12 2-5-6L3-14Z M6-15Q23-15 24-5Q19 3 10-6Z'],
      ['wing','M-3-12Q-21-9-28-27Q-27-36-16-31Q-7-30 1-20Z M7-12Q23-10 29-27Q30-34 21-32Q11-29 4-20Z'],
      ['light','M-5-17Q-17-15-24-26Q-23-32-14-27Q-7-25-5-17Z M10-17Q24-16 25-26Q24-29 17-26Q12-22 10-17Z'],
      ['body','M-7-9-4-18 0-24-3-30 1-28 4-24 8-28 11-29 7-23Q13-20 10-15L5-10 0-4Z'],
      ['eye','M6-22 9-21 7-19Z']
    ] },
    treant: { top: 36, layers: [
      ['shade','M-6-16-13-5-23 0-13 1-9-1-4 2 0-6 4-4 12 1 17 0 9-4 7-16Z'],
      ['body','M-11-24-18-26-23-31-25-30-22-23-12-17-6-12-9-5-2-4 2-14 6-11 8-5 15-5 12-12 10-21 19-23 22-29 26-31 23-34 19-31 15-30 14-34 11-33 10-27 7-25 5-31 2-36-2-34-3-29-8-31-11-36-15-36-13-31-12-27Z'],
      ['light','M-9-27-2-29 3-26 8-26 9-21 5-19 2-21-2-17-6-19Z M-19-30-22-35-29-33-27-29Z M20-30 29-35 27-29Z'],
      ['eye','M0-23 3-23 2-20Z M5-23 8-24 8-21Z']
    ] },
    mushroom: { top: 24, layers: [
      ['body','M-8-13Q-20-12-17-18Q-11-26-1-25Q11-25 18-17Q21-13 12-12L5-13 7-2 13-1 7 2 1 0-4 2-12 0-6-4-5-12Z'],
      ['light','M-15-17Q-8-25-1-23Q11-24 17-17L11-15 1-16-6-15Z'],
      ['ivory','M-8-20-5-21-2-19-5-17Z M5-22 8-21 10-19 6-19Z'],
      ['eye','M-1-10 2-10 1-8Z M4-10 6-10 6-8Z']
    ] },
    flower: { top: 28, layers: [
      ['body','M-3-14Q-15-23-12-26Q-7-24-2-20L0-30 5-28 6-21 13-28 17-25 12-18Q26-21 22-16Q15-10 6-10L6-4 20-7 15-1 4 0-1 2-8 1-17-4-19-10-6-5-4-10Q-13-9-22-15Q-20-20-3-14Z'],
      ['light','M-12-15-3-15 3-20 8-17 16-17 10-12 4-11-1-10-8-12Z'],
      ['eye','M-1-16 1-18 6-17 8-15 4-13 0-14Z']
    ] },
    vine: { top: 29, shadow: 17, layers: [
      ['shade','M-4-11Q-8-21-16-24L-22-22-24-17-21-19-16-19-8-6-23-3-24 0-10-1-4-5 0 1 10 2 14 0 7-1 5-8Z'],
      ['body','M-8-7Q-13-15-7-23L-9-29-3-27 0-24 4-29 7-29 7-24 14-27 19-24 16-19 20-17Q25-21 24-26Q29-21 26-17Q22-11 13-12L7-16 9-7 17-5 24-5 19-1 8-2 2-9-2-8-7-1-14 0-12-4Z'],
      ['light','M-9-13-4-22 1-20 4-23 9-21 13-22 14-19 6-15 2-16-2-12Z'],
      ['eye','M6-20 10-20 8-18Z']
    ] },
    drake: { top: 26, shadow: 18, layers: [
      ['shade','M-9-11-13-3-8-2-4-10Z M6-14 10-2 15-2 14-12Z'],
      ['body','M-31-7Q-25-6-19-13L-14-17-13-22-8-19-6-24-1-21 4-25 9-22 13-25 16-23 18-20 23-21 25-18 29-17 28-12 20-12 15-10 13-1 7-1 6-9-7-8-15 0-21 0-17-8Q-25-3-31-7Z'],
      ['light','M-16-13-8-17-4-14 0-19 4-16 9-20 15-19 12-13 1-11-7-12Z'],
      ['eye','M20-19 24-18 21-16Z']
    ] },
    crocodile: { top: 17, shadow: 22, layers: [
      ['shade','M-12-9-16-1-11 0-6-7Z M8-10 10-1 17-1 15-9Z'],
      ['body','M-32-10Q-23-6-15-11L-13-16-7-14-4-18 2-16 6-18 11-14 17-15 22-12 32-11 33-9 21-7 32-6 31-3 17-3 10-7 4-6-12-6Q-27-2-32-10Z'],
      ['light','M-14-11-8-14-5-11-1-14 3-11 6-14 12-11 8-8-12-8Z'],
      ['eye','M16-14 19-13 17-11Z']
    ] },
    frog: { top: 20, layers: [
      ['shade','M-1-7-8-2-16 0-23 0-19-3-11-7Z M6-8 15-1 21-1 18 1 11 1 5-3Z'],
      ['body','M-22-8Q-23-17-14-18L-6-18Q1-25 7-19Q14-22 17-17L22-15 24-11 20-7 14-6 13-1 10 0 6-6-1-7-8-3-17-2-18-5Z'],
      ['light','M-18-10Q-17-17-10-17Q-4-17 0-12L-3-9-9-7Z M14-12 23-12 20-8 12-8Z'],
      ['eye','M14-17 18-16 16-14Z']
    ] },
    squirrel: { top: 31, layers: [
      ['shade','M-13-6Q-25-3-28-16Q-31-22-26-28Q-22-34-15-29Q-9-25-14-19Q-22-22-20-15L-11-13Z'],
      ['body','M-16-5Q-22-9-16-16L-7-18 1-15 6-23 7-29 12-30 14-23 18-23 23-18 21-14 16-14 12-9 12-4 19-3 19-1 8-1 5-9 0-6-10-3-8 0-17 0Z'],
      ['light','M-18-10Q-9-17 2-12L7-15 10-12 5-7-2-7-12-5Z'],
      ['eye','M16-21 19-20 17-18Z']
    ] },
    snail: { top: 22, layers: [
      ['body','M-25-1-22-5-18-6Q-24-11-18-21Q-13-29-2-24Q9-21 7-9L11-7 15-13 13-19 16-19 18-13 21-19 23-18 20-12 25-8 23-4 18-3 16 0Z'],
      ['light','M-17-12Q-20-17-14-21Q-10-24-5-20Q1-15-3-11Q-6-8-10-11Q-13-14-9-16L-7-13-5-14-6-18Q-16-20-16-13L-13-8Q-4-4 1-11Q4-17-1-21Q-10-27-17-20L-20-13Z'],
      ['eye','M19-11 22-10 21-8Z']
    ] },
    porcupine: { top: 25, layers: [
      ['body','M-21-8-27-14-19-14-26-22-15-19-17-27-8-21-5-28 1-21 6-25 8-18 13-21 16-17 23-13 25-9 20-6 12-6 11-1 6-1 5-6-10-6-13 0-18 0-17-6Z'],
      ['light','M-21-17-14-16-19-23-10-18-12-24-5-19-3-24 2-18 5-21 6-15-1-11-10-13Z'],
      ['eye','M16-15 19-14 17-12Z']
    ] },
    shark: { top: 29, hover: 4, shadow: 23, layers: [
      ['body','M-18-14-28-10-27-28-17-21-10-20Q-5-22-1-22L5-34 10-23Q24-24 32-16L29-12 17-10 13-4 6-4 10-11-7-11-18-9Z'],
      ['light','M-16-18Q-4-24 11-21Q25-22 31-16L24-14 11-15 0-13-9-15Z'],
      ['ivory','M14-13 28-14 25-10 22-13 20-10 18-12 16-10Z'],
      ['eye','M22-19 25-18 23-17Z']
    ] },
    crab: { top: 25, shadow: 20, layers: [
      ['shade','M-14-13-24-11-26-4-23-4-20-9-12-8Z M-5-10-12-5-12 1-9 0-7-4 1-9Z M5-11 14-5 16 0 19-1 19-6 12-12Z'],
      ['body','M-18-14Q-11-23 1-21Q14-20 18-12L21-14 22-20 28-24 31-20 28-16 32-15 29-10 22-10 17-7Q5-2-7-6L-19-8-25-12-32-14-31-21-27-23-27-17-22-20-19-17-22-13Z'],
      ['light','M-13-15Q-6-22 6-18L13-14 9-10 0-14-9-10Z'],
      ['eye','M11-18 13-16 11-14Z M5-19 7-17 5-15Z']
    ] },
    whale: { top: 30, hover: 2, shadow: 25, layers: [
      ['body','M-22-13-31-19-38-18-34-13-38-8-32-7-23-10Q-13-19-9-22Q8-32 23-25Q33-24 35-18L33-11 27-7 16-5-3-6Q-16-6-22-13Z'],
      ['light','M-19-12Q-5-8 8-10Q28-9 33-15L33-10 25-7 12-5-5-6Z'],
      ['shade','M-5-11Q3-13 10-11-1-4-15 1-13-3Z'],
      ['eye','M24-19 27-18 25-16Z']
    ] },
    dragon: { top: 37, hover: 4, shadow: 25, layers: [
      ['shade','M-29-7Q-35-10-30-19L-29-13Q-19-24-14-22-12-26-8-23-6-29-2-26 2-31 4-24 7-27 9-21 12-28 15-23 21-30 21-21Q18-10 7-9Q-7-13-16-12Z'],
      ['body','M-32-8Q-25-8-21-14Q-12-25-3-20Q5-16 11-22L14-30 17-32 19-35 22-31 26-32 28-29 33-28 34-24 27-22 21-22Q18-11 7-11Q-3-13-5-10L-5-4-11-1-12-4-8-7-8-13Q-14-15-18-11L-18-7-22-4-26-6-25-8Q-29-6-32-8Z'],
      ['light','M-24-10Q-14-24-4-18Q6-14 13-21L19-29 25-30 28-27 33-27 31-24 23-24 18-20Q11-12 0-15Q-12-19-24-10Z'],
      ['ivory','M19-30 14-35 9-36 7-40 12-38 16-37 17-39 19-35 23-33Z M26-24 30-24 28-20Z'],
      ['eye','M24-29 27-28 25-26Z']
    ] },
    phoenix: { top: 38, hover: 5, shadow: 21, layers: [
      ['shade','M-9-19Q-18-13-35-2Q-33-11-27-14Q-37-12-41-7Q-40-17-25-21Q-37-19-39-22Q-25-27-10-25Z'],
      ['light','M-10-16Q-19-10-32-5Q-25-13-19-16L-34-13Q-25-21-11-23Z'],
      ['body','M-19-20Q-6-27 5-22L9-27 10-32 15-30 16-35 19-31 23-32 24-28 31-26 24-23 20-20 14-15 4-15-5-11-17-14Z'],
      ['wing','M-2-16Q-14-15-25-30L-28-39Q-19-37-14-28L-16-39Q-8-36-4-26L-6-37Q4-32 6-25L12-31Q13-21 4-17Z'],
      ['ivory','M-3-20Q-9-23-13-29L-4-24Q-3-28-3-29L2-22 6-25 4-20Z M20-29 25-28 31-26 23-25Z'],
      ['eye','M20-29 23-28 21-26Z']
    ] },
    taotie: { top: 33, shadow: 22, layers: [
      ['shade','M-12-13-18-4-12-1-9-3-5-14Z M7-14 9-2 16-1 17-13Z M-16-15Q-24-10-28-16Q-21-16-22-24L-18-22Z'],
      ['body','M-22-14-19-23-13-22-14-29-6-25 0-31 4-26 12-27 17-23 22-25 28-20 29-10 23-5 15-7 12 1 5 1 6-10-9-9-15 1-21 1-19-9Z'],
      ['light','M-18-19-13-22-8-21-3-25 2-24 3-18 9-19 11-16 8-11 2-13-5-11-10-15-16-12Z M12-22 20-23 26-19 22-14 15-14Z'],
      ['shade','M13-14Q20-17 28-15L27-9Q23-3 16-9Z'],
      ['ivory','M15-15 20-15 18-11Z M23-15 27-15 25-11Z M19-8 21-11 23-7Z'],
      ['eye','M19-20 23-19 20-17Z']
    ] }
  };

  const wildFamilies = {
    CANINE: 'wolf', FELINE: 'cat', URSINE: 'bear', BOAR: 'boar', UNGULATE: 'stag',
    SERPENT: 'serpent', AVIAN: 'bird', SHELL: 'turtle', ARTHROPOD: 'beetle',
    PLANT: 'treant', PLANT_SPIRIT: 'treant', CHIMERA: 'drake', AQUATIC: 'shark'
  };
  // Explicit art overrides for hybrids, special anatomy and legacy species
  // whose combat archetype is broader than the animal described in the catalog.
  const wildSpeciesArt = {
    BEAST_MIST_WOLF: ['wolf', 'rime'],
    BEAST_IRON_BOAR: ['boar', 'plates'],
    BEAST_MIST_JADE_STAG: ['stag', 'leaves', null, ['#4f8174', '#c5f2ce']],
    BEAST_EMERALD_PYTHON: ['serpent', 'scales'],
    BEAST_SAND_SCORPION: ['scorpion', 'embers'],
    BEAST_THUNDER_DRAKE_LIZARD: ['drake', 'bolt'],
    BEAST_FROST_BEAR: ['bear', 'rime'],
    BEAST_FROST_MIST_KIRIN: ['stag', 'kirin', 'rime'],
    BEAST_THUNDER_ROC: ['bird', 'bolt'],
    BEAST_BLOOD_TIGER: ['cat', 'stripes', 'fangs', ['#833b49', '#f8ad92']],
    BEAST_ABYSSAL_DRAGON: ['dragon', null, 'hydra'],
    ECO2_BEAST_SHELL_5: ['turtle', 'plates', 'dragonHead'],
    ECO2_BEAST_AQUATIC_1: ['shark', 'scales'],
    ECO2_BEAST_AQUATIC_2: ['shark', 'spots'],
    ECO2_BEAST_AQUATIC_3: ['crocodile', 'spikes'],
    ECO2_BEAST_AQUATIC_4: ['shark', 'embers'],
    ECO2_BEAST_AQUATIC_5: ['whale', 'stars'],
    ECO2_BEAST_AQUATIC_6: ['dragon', 'scales'],
    ECO2_BEAST_MYTHIC_3: ['turtle', 'stars', 'dragonHead'],
    ECO2_BEAST_MYTHIC_6: ['whale', 'stars', 'wings'],
    BEAST_V222_FROST_GLACIER_WYRM: ['dragon', 'rime'],
    BEAST_V222_SOLAR_GOLD_TORTOISE: ['turtle', 'embers'],
    BEAST_V222_ABYSSAL_LEVIATHAN_CRAB: ['crab', 'rime'],
    BEAST_V222_CELESTIAL_LOTUS_CRANE: ['crane', 'leaves'],
    BEAST_V240_MAELSTROM_LEVIATHAN_SERPENT: ['serpent', 'rime', 'hydra'],
    BEAST_ABYSSAL_LEVIATHAN_TURTLE: ['turtle', 'spikes', 'dragonHead'],
    BEAST_YIN_SHADOW_BAT_3: ['bat'],
    BEAST_LAVA_FLAME_TORTOISE_4: ['turtle', 'embers'],
    BEAST_BLOOD_FIEND_HOUND_4: ['wolf', 'fangs'],
    BEAST_ANCIENT_TREANT_SERPENT_4: ['serpent', 'leaves'],
    BEAST_THUNDER_HORN_STAG_4: ['stag', 'bolt'],
    BEAST_ASTRAL_VOID_HAWK_5: ['bird', 'stars'],
    BEAST_MYTHIC_TAOTIE_SHADOW: ['taotie', 'stars'],
    BEAST_MYTHIC_CELESTIAL_QILIN_SOVEREIGN: ['stag', 'kirin', 'stars'],
    BEAST_V222_MIRAGE_SILK_MOTH: ['moth'],
    BEAST_V222_GALE_SABERTOOTH_TIGER: ['cat', 'stripes', 'fangs'],
    BEAST_V222_BLOOD_KIRIN_WOLF: ['wolf', 'kirin'],
    BEAST_V222_SHADOW_STALKER_PANTHER: ['cat', 'stars'],
    BEAST_V222_THUNDER_ROC_FALCON: ['bird', 'bolt'],
    BEAST_V222_FLAME_MANE_LION_BOAR: ['boar', 'embers'],
    BEAST_V222_THUNDER_HOOF_QILIN_STAG: ['stag', 'kirin', 'bolt'],
    BEAST_V222_NETHER_SCORPION_EMPEROR: ['scorpion', 'stars'],
    BEAST_V222_IRON_WING_GARUDA: ['phoenix', 'plates'],
    BEAST_V222_ASTRAL_NINE_TAIL_FOX: ['fox', 'stars', 'tails'],
    BEAST_V222_VOID_DEVOURING_CHIMERA: ['taotie', 'embers', 'wings'],
    BEAST_V240_ABYSSAL_IRON_BEAR: ['bear', 'plates'],
    BEAST_V240_THUNDER_TUSK_BOAR_KING: ['boar', 'bolt', 'spikes'],
    BEAST_V240_STARLIGHT_VOID_TORTOISE: ['turtle', 'stars', 'spikes'],
    BEAST_V240_CELESTIAL_JADE_QILIN_STAG: ['stag', 'kirin', 'leaves'],
    BEAST_V240_IMMORTAL_BODHI_TREANT: ['treant', 'stars', 'canopy'],
    KING_EMERALD_SERPENT_SOUTH: ['serpent', 'scales', 'hydra'],
    KING_FROST_SOVEREIGN_BEAR: ['bear', 'rime', 'spikes'],
    KING_SCORPION_EMPEROR_WEST: ['scorpion', 'embers', 'spikes'],
    KING_BLOOD_TIGER_CENTRAL: ['cat', 'stripes', 'spikes', ['#6e2939', '#f68e7f']],
    KING_THUNDER_ROC_EAST: ['phoenix', 'bolt'],
    KING_KUNLUN_DRAGON: ['dragon', 'plates', 'spikes'],
    ECO2_BEAST_ARTHROPOD_1: ['mantis'],
    ECO2_BEAST_ARTHROPOD_2: ['crawler', 'embers'],
    ECO2_BEAST_ARTHROPOD_4: ['spider'],
    ECO2_BEAST_ARTHROPOD_5: ['scorpion', 'bolt'],
    ECO2_BEAST_AVIAN_2: ['crane'],
    ECO2_BEAST_AVIAN_6: ['phoenix', 'embers'],
    ECO2_BEAST_CANINE_5: ['fox', 'rime', 'tails'],
    ECO2_BEAST_CHIMERA_1: ['fox', null, 'wings'],
    ECO2_BEAST_CHIMERA_2: ['cat', 'stripes', 'wings'],
    ECO2_BEAST_CHIMERA_3: ['goat', 'kirin', 'plates'],
    ECO2_BEAST_CHIMERA_4: ['cat', 'stripes', 'feathers'],
    ECO2_BEAST_CHIMERA_5: ['stag', 'kirin', 'embers'],
    ECO2_BEAST_CHIMERA_6: ['taotie', 'stars', 'crystals'],
    ECO2_BEAST_FELINE_1: ['cat', 'stripes'],
    ECO2_BEAST_FELINE_2: ['cat', 'spots'],
    ECO2_BEAST_FELINE_3: ['cat', 'stripes', 'fangs'],
    ECO2_BEAST_FELINE_4: ['cat', 'spots', 'embers'],
    ECO2_BEAST_FELINE_5: ['cat', 'stripes', 'rime'],
    ECO2_BEAST_FELINE_6: ['cat', 'stripes', 'bolt'],
    ECO2_BEAST_PLANT_SPIRIT_1: ['mushroom'],
    ECO2_BEAST_PLANT_SPIRIT_2: ['vine'],
    ECO2_BEAST_PLANT_SPIRIT_3: ['treant', 'leaves'],
    ECO2_BEAST_PLANT_SPIRIT_4: ['flower'],
    ECO2_BEAST_PLANT_SPIRIT_5: ['vine', 'spots', 'canopy'],
    ECO2_BEAST_PLANT_SPIRIT_6: ['treant', 'plates', 'canopy'],
    ECO2_BEAST_SERPENT_4: ['cobra', 'rime'],
    ECO2_BEAST_SERPENT_6: ['cobra', 'stars', 'crystals'],
    ECO2_BEAST_SHELL_1: ['turtle', 'leaves'],
    ECO2_BEAST_SHELL_2: ['turtle', 'leaves'],
    ECO2_BEAST_SHELL_3: ['turtle', 'plates', 'spikes'],
    ECO2_BEAST_SHELL_4: ['turtle', 'embers'],
    ECO2_BEAST_SHELL_6: ['turtle', 'plates', 'crystals'],
    ECO2_BEAST_UNGULATE_1: ['stag', 'spots'],
    ECO2_BEAST_UNGULATE_2: ['goat'],
    ECO2_BEAST_UNGULATE_3: ['bull', 'plates'],
    ECO2_BEAST_UNGULATE_5: ['bull', 'embers'],
    ECO2_BEAST_MYTHIC_1: ['dragon', 'scales', 'sun'],
    ECO2_BEAST_MYTHIC_2: ['phoenix', 'embers', 'sun'],
    ECO2_BEAST_MYTHIC_4: ['cat', 'stripes', 'crystals'],
    ECO2_BEAST_MYTHIC_5: ['stag', 'kirin', 'sun'],
    ECO2_BEAST_MYTHIC_7: ['taotie', 'stars', 'wings'],
    ECO2_BEAST_MYTHIC_8: ['treant', 'stars', 'canopy'],
    SRC110_MW_BEAST_001: ['serpent', 'leaves'],
    SRC110_MW_BEAST_002: ['squirrel'],
    SRC110_MW_BEAST_003: ['beetle', 'leaves'],
    SRC110_MW_BEAST_010: ['frog', 'spots'],
    SRC110_MW_BEAST_011: ['crocodile', 'plates'],
    SRC110_MW_BEAST_013: ['snail'],
    SRC110_MW_BEAST_018: ['goat', 'rime'],
    SRC110_MW_BEAST_026: ['porcupine', 'embers'],
    SRC110_MW_BEAST_034: ['ant'],
    SRC110_MW_BEAST_035: ['shark', 'plates']
  };
  const wildPalette = {
    WIND: ['#597a78', '#c8f2b8'], WOOD_LIFE: ['#4c7966', '#c1ed86'],
    FIRE: ['#9b4838', '#ffd17a'], LIGHTNING: ['#505a95', '#e0c6ff'],
    WATER_ICE: ['#688ca5', '#d7f7ff'], EARTH_METAL: ['#776451', '#ebc688'],
    ASTRAL: ['#554977', '#e8d6ff'], ASTRAL_VOID: ['#554977', '#e8d6ff'],
    YIN_SHADOW: ['#444259', '#e6b6e9'], BLOOD_DEMON: ['#782c40', '#ffac9c'],
    LIGHT_YANG: ['#967231', '#fff0a3'], NEUTRAL: ['#7c725e', '#efd8a6']
  };
  const wildMarkings = {
    stripes: ['shade','M-13-17-9-17-11-11Z M-7-17-2-16-4-11Z M1-16 6-16 3-11Z M14-19 16-18 14-15Z'],
    spots: ['ivory','M-13-15-10-16-9-14-11-12Z M-6-15-4-16-2-14-4-12Z M1-15 4-15 4-13 2-12Z'],
    scales: ['light','M-9-8-6-10-3-9-6-7Z M1-11 4-12 7-11 4-9Z M10-17 13-19 16-18 14-16Z'],
    plates: ['light','M-15-16-11-20-6-19-7-16-11-13Z M-4-17 0-21 5-18 3-15-1-13Z M7-18 11-21 15-19 12-14 8-14Z'],
    leaves: ['light','M-8-16Q-16-16-21-23Q-11-24-8-16Z M-4-17Q-11-20-12-26Q-3-24-4-17Z M-1-15Q5-24 10-24Q10-17-1-15Z'],
    stars: ['ivory','M-12-16-11-19-10-16-7-15-10-14-11-11-12-14-15-15Z M3-16 4-19 5-16 8-15 5-14 4-11 3-14 0-15Z'],
    rime: ['ivory','M-13-17-9-23-6-19-3-22 0-19 5-21 4-16-2-15-6-17-10-14Z'],
    embers: ['light','M-14-14Q-18-19-17-24Q-15-19-12-18Q-12-23-9-25Q-10-20-5-18Q-1-22 4-24Q0-19 1-15Z'],
    bolt: ['ivory','M-6-20 5-20-1-15 6-15-5-9-2-14-8-14Z'],
    kirin: ['ivory','M8-22Q4-30 8-38L10-29 13-26 14-21Z M-10-18-7-23-3-21-5-17Z M-4-17 1-22 5-20 2-16Z'],
    fangs: ['ivory','M16-13 19-13 19-7 17-6Z M20-12 23-13 22-8Z'],
    dragonHead: ['light','M16-12Q15-22 22-20L25-24 27-19 31-16 28-12Z'],
    crystals: ['light','M-18-18-20-26-14-31-11-24-13-18Z M-10-19-10-30-4-36 1-29-2-20Z M1-20 6-34 11-33 10-24 7-18Z'],
    spikes: ['light','M-16-18-16-27-10-21-8-31-2-23 0-34 7-26 10-30 14-22 9-19Z']
  };
  const wildBacks = {
    tails: ['shade','M-8-9Q-25-5-35-12L-24-13Q-34-15-37-20L-23-19Q-34-23-35-28L-22-24Q-31-31-30-35L-18-29Q-25-37-22-40L-13-32Q-16-40-13-42L-7-31Q-8-40-3-43L-1-30Q1-38 7-40L6-28Q9-34 16-36L11-24Q7-12-8-9Z'],
    wings: ['wing','M-6-10Q-28-16-32-32Q-19-29-10-24L-13-35Q2-32 6-17L7-13-4-14Z'],
    feathers: ['wing','M-8-9Q-24-11-34-30L-24-26-28-35-17-28-18-38Q-9-34-4-25L0-31 4-21 2-15Z'],
    sun: ['light','M-20-27-25-33-18-32-18-39-13-35-9-41-7-35-1-38-1-32 3-29-1-28Q-8-40-20-27Z'],
    canopy: ['light','M-26-26-31-31-24-36-21-34-19-41-11-39-7-43 0-40 8-43 13-38 21-41 26-35 32-35 35-30 28-24 22-30 14-28 6-33 0-29-9-34-16-30-22-31Z'],
    hydra: ['shade','M-13-7-9-10Q-11-15-29-16L-32-21-30-25-24-23-25-20Q-16-20-10-17Q-15-25-26-26L-28-30-24-34-19-32-20-29Q-14-29-10-24Q-12-35-18-35L-19-40-13-42-9-39-11-36Q-4-32-3-23Q-2-33-5-38L-3-43 3-43 6-39 2-37Q5-30 4-23Q6-30 9-33L7-37 11-41 16-40 17-36 14-34Q11-26 12-21Q20-27 23-33L22-37 27-40 31-37 32-33 27-31Q23-23 20-20Q29-25 33-26L35-31 39-30 42-26 40-22 35-22Q27-20 23-17Q36-19 38-17L43-20 46-16 46-12 41-10 36-12Q25-9 12-10L1-7Z']
  };
  const wildPaths = new Map();
  const wildSpecies = new Map();
  for (const species of g.JD.BEASTS.species || []) wildSpecies.set(species.id, species);
  for (const king of g.JD.BEASTS.kings || []) wildSpecies.set(king.id, { ...wildSpecies.get(king.species), ...king });
  const wildTierScale = [0, .77, .90, 1.01, 1.14, 1.29, 1.47, 1.69];
  const wildTierMark = { 3: 'spots', 4: 'plates', 5: 'crystals', 6: 'spikes', 7: 'stars' };
  const noWildOverrides = [];

  R.resolveWildBeastArt = b => {
    const id = b.speciesId || b.sp || '';
    const species = wildSpecies.get(id);
    const [shape, marking, trim, artPalette] = wildSpeciesArt[id] || noWildOverrides;
    const family = b.archetype || b.family || species?.archetype || species?.family;
    const model = wildModels[shape || wildFamilies[family] || 'drake'];
    const tier = clamp(Math.floor(Number(b.tier || species?.tier) || 1), 1, 7);
    const palette = artPalette || wildPalette[b.element || species?.element] || wildPalette.NEUTRAL;
    const visual = b.visual || species?.visual;
    const raid = g.WILD?.raidProfile(b);
    const raidScale = raid?.grade === 'TRANSCENDENT' ? 2.25 : raid?.grade === 'LEGENDARY' ? 1.6 : raid ? 1.16 : 1;
    const scale = raidScale * wildTierScale[tier] * clamp(.9 + .1 * (Number(visual?.scale) || 1), .95, 1.06)
      * (b.legendary ? 1.08 : 1);
    return { model, tier, scale, palette, visual, marking, trim, raid };
  };

  function paintWildLayer(ctx, layer, colors, flap) {
    const [role, d] = layer;
    if (!wildPaths.has(d)) wildPaths.set(d, new Path2D(d));
    const path = wildPaths.get(d);
    if (role === 'wing') {
      ctx.save();
      ctx.translate(1, -15);
      ctx.rotate(flap);
      ctx.translate(-1, 15);
    }
    ctx.fillStyle = colors[role];
    if (role === 'wing' || role === 'body') {
      ctx.lineWidth = 1.15;
      ctx.strokeStyle = '#17242a';
      ctx.stroke(path);
    }
    ctx.fill(path);
    if (role === 'wing') ctx.restore();
  }

  const TW_CACHE = new Map();
  function measureCached(ctx, font, text) {
    const k = font + '|' + text;
    let w = TW_CACHE.get(k);
    if (w === undefined) {
      if (TW_CACHE.size > 2000) TW_CACHE.clear();
      w = ctx.measureText(text).width;
      TW_CACHE.set(k, w);
    }
    return w;
  }

  const PATH_COL = { XIAN: '#5ab4d8', BODY: '#e07d5b', GOD: '#e6c055', DEMON: '#b28cd9', HEART_SOUL: '#8ec8d0', MECH_PUPPET: '#8ecae6', KARMA_SAMSARA: '#b5838d', BEAST_SOVEREIGN: '#e09f3e', SAGE_SUPPORT: '#76c893', CRAFT_CREATION: '#f4a261', ARRAY_TALISMAN: '#64c3ce', STRATEGY_GOVERNANCE: '#d4bb78', ASTRO_DIVINATION: '#74c0fc', BUDDHA_DHARMA: '#fcc419', VOID_SPACE: '#9775fa', SONIC_HARMONY: '#63e6be', VENOM_GU: '#a9e34b', PRIMORDIAL_SHIFTER: '#ff8787', CELESTIAL_WEATHER: '#4dabf7', WANDERING_DAO: '#69db7c', MERCANTILE_DAO: '#ffd43b', DRAGON_VEIN_GEOMANCY: '#d9a97c', GRAVITY_DAO: '#845ef7', CHRONO_EPOCH: '#e599f7', INK_LITERATI: '#adb5bd', SOUL_PUPPETRY: '#da77f2', PRIMORDIAL_CHAOS: '#ff6b6b', SHADOW_SAMURAI: '#e63946', NINPO_SHADOW: '#4a4e69', NINPO_ELEMENTAL: '#f77f00', DIVINE_SUMMONER: '#ffd166', DIVINE_POSSESSION: '#ff9f1c', DIVINE_CHANNELER: '#4cc9f0', VOID_HERETIC_PACT: '#7209b7', OCCULT_MAGE: '#d97706', DEVOURING_FLESH: '#9b2226', NETHER_GRAVE: '#6c757d', ANCESTRAL_RITUAL: '#e9c46a', TIDE_VOYAGER: '#0077b6', LORE_ARCHIVIST: '#8ecae6', FORTUNE_GAMBLER: '#ffb703', SPIRIT_HUSBANDRY: '#52b788', ARENA_GLORY: '#f4a261' };
  // Ordinary martial casts use the real weapon family for their motion language.
  // Legendary named arts deliberately keep their authored, higher-priority motifs.
  R.WEAPON_MOTION_VFX = Object.freeze({
    SWORD: { nameTh: 'กระบี่', primary: '#8be9fd', secondary: '#e8fbff', shape: 'crescent' },
    BLADE: { nameTh: 'ดาบ', primary: '#ffb86c', secondary: '#fff0cf', shape: 'broad_arc' },
    SPEAR: { nameTh: 'ทวน', primary: '#80d8ff', secondary: '#e1f5fe', shape: 'thrust' },
    FIST: { nameTh: 'หมัด/ฝ่ามือ', primary: '#ff8fa3', secondary: '#fff0b3', shape: 'impact' },
    BOW: { nameTh: 'ธนู', primary: '#ffd166', secondary: '#fff4cc', shape: 'arrow' },
    STAFF: { nameTh: 'พลอง', primary: '#c3a66b', secondary: '#f4e4bc', shape: 'staff_spiral' },
    FOCUS: { nameTh: 'สื่อปราณ', primary: '#b197fc', secondary: '#e5dbff', shape: 'focus_seal' },
    DAGGER: { nameTh: 'มีดสั้น', primary: '#a5d8ff', secondary: '#f1f8ff', shape: 'twin_cut' },
    ZITHER: { nameTh: 'พิณ', primary: '#63e6be', secondary: '#d3f9d8', shape: 'sound_wave' },
    BRUSH: { nameTh: 'พู่กัน', primary: '#adb5bd', secondary: '#f1f3f5', shape: 'ink_script' },
    WHIP: { nameTh: 'แส้', primary: '#f783ac', secondary: '#ffe3ec', shape: 'serpent' },
    ROSARY: { nameTh: 'ประคำ', primary: '#96f2d7', secondary: '#e6fcf5', shape: 'orbit_beads' },
    CLAW: { nameTh: 'กรงเล็บ', primary: '#ff6b6b', secondary: '#ffe3e3', shape: 'rake' },
    NEEDLE: { nameTh: 'เข็ม', primary: '#74c0fc', secondary: '#e7f5ff', shape: 'needles' },
    FAN: { nameTh: 'พัด', primary: '#b2f2bb', secondary: '#ebfbee', shape: 'fan_sweep' },
    ASTROLABE: { nameTh: 'จานดารา', primary: '#ffd43b', secondary: '#fff3bf', shape: 'star_dial' },
    ABACUS: { nameTh: 'ลูกคิด', primary: '#ffa94d', secondary: '#fff4e6', shape: 'counting_beads' }
  });
  const ROBE_MORTAL = '#cdb292';
  const hash2 = (x, y) => {
    let h = Math.imul(x, 73856093) ^ Math.imul(y, 19349663);
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995);
    return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
  };
  function meadowNoise(x, y) {
    const ix = Math.floor(x / 12), iy = Math.floor(y / 12), fx = x / 12 - ix, fy = y / 12 - iy;
    const a = fx * fx * (3 - 2 * fx), b = fy * fy * (3 - 2 * fy);
    return (hash2(ix, iy) * (1 - a) + hash2(ix + 1, iy) * a) * (1 - b) + (hash2(ix, iy + 1) * (1 - a) + hash2(ix + 1, iy + 1) * a) * b;
  }
  function shade(hex, f) {
    const clean = (hex && hex[0] === '#') ? hex.slice(1) : '888888';
    const n = parseInt(clean.length === 3 ? clean.replace(/(.)/g, '$1$1') : clean, 16) || 0;
    let r = (n >> 16) & 255, g2 = (n >> 8) & 255, b = n & 255;
    if (f >= 0) { r += (255 - r) * f; g2 += (255 - g2) * f; b += (255 - b) * f; }
    else { r *= 1 + f; g2 *= 1 + f; b *= 1 + f; }
    return 'rgb(' + (r | 0) + ',' + (g2 | 0) + ',' + (b | 0) + ')';
  }
  R.shade = shade;

  /* ---------- Distinct Visual Motifs for the 22 Legendary Arts ---------- */
  const LEGENDARY_MOTIFS = {
    legend_dugu_sword: { kind: 'cast', primary: '#b3e5fc', secondary: '#0288d1', accent: '#ffffff', shape: 'nine_sword_vectors', labelTh: 'เก้ากระบี่เดียวดายทลายกระบวน' },
    legend_dragon_palm: { kind: 'cast', primary: '#ffca28', secondary: '#e65100', accent: '#fff8e1', shape: 'coiling_dragon_shockwave', labelTh: 'สิบแปดฝ่ามือพิชิตมังกร' },
    legend_feixian_beam: { kind: 'cast', primary: '#e1f5fe', secondary: '#ffd54f', accent: '#ffffff', shape: 'heavenly_feixian_beam', labelTh: 'หนึ่งกระบี่เซียนเหินฟ้า' },
    legend_qiankun_taiji: { kind: 'cast', primary: '#f5f5f5', secondary: '#263238', accent: '#80cbc4', shape: 'yin_yang_taiji_disc', labelTh: 'เคล็ดเคลื่อนย้ายจักรวาล' },
    legend_lingxi_gold: { kind: 'cast', primary: '#ffd54f', secondary: '#ff8f00', accent: '#fffde7', shape: 'golden_phoenix_finger_clamp', labelTh: 'ดัชนีหงส์ทองรับคมไร้พ่าย' },
    legend_lingbo_afterimage: { kind: 'cast', primary: '#64ffda', secondary: '#0097a7', accent: '#e0f2f1', shape: 'bagua_ripple_footwork', labelTh: 'ย่างก้าวเหยียบคลื่นไร้เงา' },
    legend_moon_shadow: { kind: 'cast', primary: '#cfd8dc', secondary: '#78909c', accent: '#ffffff', shape: 'crescent_feather_plumes', labelTh: 'ท่าร่างเงาจันทร์ค้างคาวหยก' },
    legend_star_vortex: { kind: 'cast', primary: '#7c4dff', secondary: '#00e5ff', accent: '#e8eaf6', shape: 'abyssal_vortex_spiral', labelTh: 'มหาเวทดูดดาวกลืนชีพจร' },
    legend_blood_lotus: { kind: 'cast', primary: '#ff1744', secondary: '#880e4f', accent: '#ffcdd2', shape: 'crimson_blood_lotus', labelTh: 'บงกชโลหิตเผาอายุขัย' },
    legend_taixuan_runes: { kind: 'cast', primary: '#80d8ff', secondary: '#1e88e5', accent: '#e1f5fe', shape: 'taixuan_stele_runes', labelTh: 'คัมภีร์ไท่เสวียนจารึกผาหิน' },
    legend_six_meridian: { kind: 'cast', primary: '#40c4ff', secondary: '#ff4081', accent: '#e0f7fa', shape: 'six_meridian_lasers', labelTh: 'คัมภีร์ปราณกระบี่หกชีพจร' },
    legend_dragon_elephant: { kind: 'cast', primary: '#d4af37', secondary: '#cd7f32', accent: '#fff3cd', shape: 'twin_dharma_wheels', labelTh: 'มหาคัมภีร์นาคช้างปัญญาบารมี' },
    legend_vajra_bell: { kind: 'cast', primary: '#ffb300', secondary: '#ff6f00', accent: '#fff8e1', shape: 'vajra_indestructible_bell', labelTh: 'คัมภีร์กายาวัชรอมตะไม่บุบสลาย' },
    legend_eight_desolations: { kind: 'cast', primary: '#ff3d00', secondary: '#ffb300', accent: '#ffab91', shape: 'solar_corona_8directions', labelTh: 'คัมภีร์เทพบรรพกาลแปดทิศ' },
    legend_celestial_mandate: { kind: 'cast', primary: '#7e57c2', secondary: '#ffd740', accent: '#ede7f6', shape: 'celestial_mandate_pillars', labelTh: 'มหาคัมภีร์โองการสวรรค์' },
    legend_ashura_blood: { kind: 'cast', primary: '#d32f2f', secondary: '#4a0000', accent: '#ff8a80', shape: 'crimson_blood_tide', labelTh: 'คัมภีร์มารทะเลโลหิตอสูร' },
    legend_gu_monarch: { kind: 'cast', primary: '#00c853', secondary: '#8e24aa', accent: '#b9f6ca', shape: 'venom_hex_spores', labelTh: 'มหาคัมภีร์กู่จักรพรรดิหมื่นพิษ' },
    legend_nine_yin_mirror: { kind: 'cast', primary: '#80deea', secondary: '#b0bec5', accent: '#e0f7fa', shape: 'lunar_mirror_claws', labelTh: 'มหาคัมภีร์จิตเก้าหยินส่องวิญญาณ' },
    legend_little_li_dagger: { kind: 'cast', primary: '#fff59d', secondary: '#90caf9', accent: '#ffffff', shape: 'single_intent_flash', labelTh: 'มหาคัมภีร์จิตมีดบินไร้พลาด' },
    legend_aura_mingyu: { kind: 'aura', primary: '#80deea', secondary: '#e0f7fa', accent: '#b2ebf2', shape: 'jade_frost_lotus_aura', labelTh: 'เคล็ดปราณหยกใสไร้ราคี' },
    legend_aura_nine_yang: { kind: 'aura', primary: '#ffca28', secondary: '#ff7043', accent: '#fff8e1', shape: 'golden_solar_bell_aura', labelTh: 'คัมภีร์เก้าสุริยันคุ้มชีพจร' },
    legend_aura_dugu: { kind: 'aura', primary: '#b3e5fc', secondary: '#4fc3f7', accent: '#ffffff', shape: 'orbiting_sword_motes_aura', labelTh: 'จิตกระบี่ไร้พ่ายส่องใจ' },
    legend_guangling_zither: { kind: 'cast', primary: '#80ffdb', secondary: '#ff9e00', accent: '#ffffff', shape: 'nine_heavens_sonic_phoenix', labelTh: 'มหาคีตเวทย์กวงหลิงสะท้านเก้าสวรรค์' },
    legend_heaven_seal_brush: { kind: 'cast', primary: '#ffd166', secondary: '#ef476f', accent: '#fff8e1', shape: 'heaven_inscription_seal_array', labelTh: 'มหาพู่กันเทวะจารึกผนึกสวรรค์' },
    legend_samsara_threads: { kind: 'cast', primary: '#ff4d6d', secondary: '#9b5de5', accent: '#ffe5ec', shape: 'samsara_crimson_puppet_web', labelTh: 'ด้ายสวรรค์เชิดวัฏสงสารพันวิญญาณ' },
    legend_shennong_crucible: { kind: 'cast', primary: '#52b788', secondary: '#ff7b00', accent: '#d8f3dc', shape: 'shennong_emerald_flame_cauldron', labelTh: 'มหาคัมภีร์เตาหลอมหมื่นโอสถเสินหนง' },
    legend_imperial_eight_gates: { kind: 'cast', primary: '#ffd166', secondary: '#ef476f', accent: '#fff8e1', shape: 'imperial_eight_gates_array', labelTh: 'เคล็ดพิชัยสงครามแปดพยุหะอภิบาลหล้า' },
    legend_sovereign_edict: { kind: 'cast', primary: '#f4a261', secondary: '#9b5de5', accent: '#feefc3', shape: 'sovereign_heaven_jade_seal', labelTh: 'มหาคัมภีร์โองการจักรพรรดิพิชัยสวรรค์' },
    legend_jade_nirvana_lotus: { kind: 'cast', primary: '#52b788', secondary: '#ffd166', accent: '#d8f3dc', shape: 'nine_blossom_jade_nirvana', labelTh: 'กระบวนท่าพิณโอสถเก้าบุปผาชุบชีวา' },
    legend_kunpeng_wings: { kind: 'cast', primary: '#48cae4', secondary: '#7209b7', accent: '#caf0f8', shape: 'kunpeng_astral_wing_step', labelTh: 'ท่าร่างคุนเผิงเหินดาราข้ามขอบฟ้า' },
    legend_samsara_wheel_reversal: { kind: 'cast', primary: '#9b5de5', secondary: '#f15bb5', accent: '#fee440', shape: 'samsara_inverted_dharma_wheel', labelTh: 'วิชาต้องห้าม • พลิกผันกงล้อกรรมสังสารวัฏ' }
  };
  R.LEGENDARY_MOTIFS = LEGENDARY_MOTIFS;
  // Renderer-only identities. Authoritative rarity remains on the real technique/item.
  R.LEGENDARY_ART_VISUALS = Object.freeze(Object.fromEntries((g.JD.TECH.techniques || [])
    .filter(t => t.legendary).map(t => [t.id, Object.freeze({ id: t.id, nameTh: t.nameTh,
      path: t.path, motif: t.fxKind || null, passive: t.passive || t.cat === 'PASSIVE',
      signatureVfx: t.signatureVfx || null })])));
  const relicThemes = [
    ['vis_yitian_sword','sky_blade','#72efdd','#f4d35e'],
    ['vis_xuantie_heavy_sword','mountain','#8d99ae','#d4a373'],
    ['vis_tulong_saber','dragon','#f4a261','#e63946'],
    ['vis_full_moon_scimitar','moon','#e0fbfc','#9b5de5'],
    ['vis_xiaoli_dagger','heart_dart','#f8f9fa','#e63946'],
    ['vis_dagou_jade_staff','jade_bamboo','#80ed99','#2a9d8f'],
    ['vis_overlord_spear','war_banner','#ff595e','#ffd166'],
    ['vis_azure_dragon_lance','storm_dragon','#4ea8de','#caf0f8'],
    ['vis_wrathful_tiger_gauntlets','tiger','#f4a261','#ffe6a7'],
    ['vis_condor_meteor_bow','condor','#dda15e','#ffffff'],
    ['vis_peacock_plume_focus','peacock','#2ec4b6','#f4d35e'],
    ['vis_jiuxiao_phoenix_zither','phoenix_strings','#ff9e00','#72efdd'],
    ['vis_chunqiu_judgment_brush','judgment_script','#52b788','#ef476f'],
    ['vis_tiancan_fate_whip','fate_threads','#ff4d6d','#9b5de5'],
    ['vis_bodhi_nirvana_rosary','bodhi','#ffd166','#52b788'],
    ['vis_taotie_devouring_claw','devouring_maw','#9b2226','#ffccd5'],
    ['vis_baihua_soul_needle','flower_needles','#f15bb5','#d8f3dc'],
    ['vis_bajiao_tempest_fan','tempest_fan','#80ed99','#caf0f8'],
    ['vis_hetu_luoshu_astrolabe','nine_palaces','#74c0fc','#e9c46a'],
    ['vis_caishen_golden_abacus','golden_abacus','#ffb703','#fff3b0'],
    ['vis_celestial_crane_robe','crane_wings','#90e0ef','#ffffff'],
    ['vis_shadow_kirin_cuirass','kirin','#c77dff','#ffd166'],
    ['vis_immortal_tortoise_plate','tortoise','#00f5d4','#8d99ae'],
    ['vis_samsara_karma_ring','samsara','#e0aaff','#f15bb5'],
    ['vis_bodhi_starlight_beads','star_beads','#ffd166','#90e0ef'],
    ['vis_taichi_heaven_seal','imperial_seal','#f4a261','#feefc3'],
    ['vis_dragon_phoenix_bangle','dragon_phoenix','#2ec4b6','#ff9e00']
  ];
  const relicByVisual = Object.fromEntries(relicThemes.map(([visualKey, shape, primary, secondary]) =>
    [visualKey, Object.freeze({ visualKey, shape, primary, secondary })]));
  R.LEGENDARY_GEAR_VISUALS = Object.freeze(Object.fromEntries(((g.VC && g.VC.LEGENDARY_EQUIPMENT) || [])
    .filter(it => relicByVisual[it.visualKey]).map(it => [it.id, Object.freeze({ ...relicByVisual[it.visualKey],
      id: it.id, nameTh: it.nameTh, slot: it.slot })])));
  const v230RelicList = ((g.JD && g.JD.ITEMS && g.JD.ITEMS.items) || []).filter(it => it && /^REL_V230_/.test(it.id));
  R.GRAND_DAO_RELIC_VISUALS = Object.freeze(Object.fromEntries(v230RelicList.map(it => {
    const vk = it.visualKey || 'vis_yitian_sword';
    const base = relicByVisual[vk] || relicByVisual.vis_yitian_sword;
    return [it.id, Object.freeze({ ...base, id: it.id, nameTh: it.nameTh, slot: it.slot || 'WEAPON' })];
  })));
  R.APEX_PATH_ART_VISUALS = Object.freeze({
    LEG_V240_GOD: Object.freeze({ id: 'LEG_V240_GOD', motif: 'legend_celestial_mandate', path: 'GOD', primary: '#ffd166', secondary: '#ff9e00', accent: '#ffffff', passive: false }),
    LEG_V240_CRAFT_CREATION: Object.freeze({ id: 'LEG_V240_CRAFT_CREATION', motif: 'legend_qiankun_taiji', path: 'CRAFT_CREATION', primary: '#ff4d00', secondary: '#ffd166', accent: '#fff3b0', passive: false })
  });
  R.resolveLegendaryGearVisual = item => item && item.legendary === true
    ? (R.LEGENDARY_GEAR_VISUALS[item.id] || (R.GRAND_DAO_RELIC_VISUALS && R.GRAND_DAO_RELIC_VISUALS[item.id]) || null) : null;


  // Legendary apex presentation: exact identities, themed scenes, and bounded spectacle.
  const sceneByMotif = {
    legend_dugu_sword:'sword_constellation',legend_dragon_palm:'dragon_descent',legend_feixian_beam:'sky_lance',
    legend_qiankun_taiji:'taiji_court',legend_lingxi_gold:'phoenix_counter',legend_lingbo_afterimage:'moon_steps',
    legend_moon_shadow:'shadow_court',legend_star_vortex:'void_maw',legend_blood_lotus:'blood_bloom',
    legend_guangling_zither:'sonic_wings',legend_heaven_seal_brush:'seal_obelisk',legend_samsara_threads:'thread_loom',
    legend_imperial_eight_gates:'imperial_gates',legend_jade_nirvana_lotus:'jade_garden',
    legend_kunpeng_wings:'kunpeng_horizon',legend_samsara_wheel_reversal:'karma_orbit'
  };
  const sceneByPath = {
    ASTRO_DIVINATION:'star_orrery',BUDDHA_DHARMA:'lotus_sanctuary',VOID_SPACE:'void_maw',SONIC_HARMONY:'sonic_wings',
    VENOM_GU:'blood_bloom',PRIMORDIAL_SHIFTER:'beast_avatar',CELESTIAL_WEATHER:'storm_spire',WANDERING_DAO:'moon_steps',
    MERCANTILE_DAO:'imperial_gates',DRAGON_VEIN_GEOMANCY:'earth_bastion',GRAVITY_DAO:'star_orrery',CHRONO_EPOCH:'epoch_dial',
    INK_LITERATI:'ink_landscape',SOUL_PUPPETRY:'thread_loom',PRIMORDIAL_CHAOS:'taiji_court',SHADOW_SAMURAI:'sky_lance',
    NINPO_SHADOW:'shadow_court',NINPO_ELEMENTAL:'seal_obelisk',DIVINE_SUMMONER:'deity_throne',DIVINE_POSSESSION:'beast_avatar',
    DIVINE_CHANNELER:'storm_spire',VOID_HERETIC_PACT:'void_maw',OCCULT_MAGE:'seal_obelisk',DEVOURING_FLESH:'beast_avatar',
    NETHER_GRAVE:'grave_procession',ANCESTRAL_RITUAL:'grave_procession',TIDE_VOYAGER:'ocean_pillars',LORE_ARCHIVIST:'ink_landscape',
    FORTUNE_GAMBLER:'fortune_table',SPIRIT_HUSBANDRY:'jade_garden',ARENA_GLORY:'sword_constellation'
  };
  R.LEGENDARY_APEX_BUDGET = Object.freeze({ radiusMin:60,radiusMax:84,fieldMax:136,maxFull:2,maxFullLow:1,maxRecipients:8 });
  R.LEGENDARY_SCENES = Object.freeze(Object.fromEntries(Object.values(R.LEGENDARY_ART_VISUALS).filter(a=>!a.passive).map((a,i)=>{
    const family=sceneByMotif[a.motif]||sceneByPath[a.path]||'star_orrery';
    return [a.id,Object.freeze({id:a.id,family,variant:i+1,life:/garden|sanctuary|sonic/.test(family)?2500:/sword|lance|counter/.test(family)?2100:2300,
      gatherEnd:/garden|thread/.test(family)?.25:.18,releaseAt:/lance|counter/.test(family)?.38:.46})];
  })));
  const relicSceneFamilies={sky_blade:'sky_lance',mountain:'earth_bastion',dragon:'dragon_descent',moon:'shadow_court',heart_dart:'sky_lance',
    jade_bamboo:'jade_garden',war_banner:'imperial_gates',storm_dragon:'storm_spire',tiger:'beast_avatar',condor:'kunpeng_horizon',
    peacock:'sword_constellation',phoenix_strings:'sonic_wings',judgment_script:'ink_landscape',fate_threads:'thread_loom',bodhi:'lotus_sanctuary',
    devouring_maw:'void_maw',flower_needles:'blood_bloom',tempest_fan:'ocean_pillars',nine_palaces:'star_orrery',golden_abacus:'fortune_table',
    crane_wings:'kunpeng_horizon',kirin:'beast_avatar',tortoise:'earth_bastion',samsara:'karma_orbit',star_beads:'star_orrery',
    imperial_seal:'deity_throne',dragon_phoenix:'dragon_descent'};
  R.LEGENDARY_RELIC_SCENES = Object.freeze(Object.fromEntries(Object.values(R.LEGENDARY_GEAR_VISUALS).map((a,i)=>[a.id,Object.freeze({
    id:a.id,family:relicSceneFamilies[a.shape]||'star_orrery',variant:i+51,life:a.slot==='ARMOR'?2400:2100,gatherEnd:.18,releaseAt:.43
  })])));
  R.legendarySceneLife = fx => (fx && (R.LEGENDARY_SCENES[fx.techId] || R.LEGENDARY_RELIC_SCENES[fx.relicId]) || {}).life || 2300;

  /* ---------- สีภูมิประเทศตามฤดู ---------- */
  const GRASS = [
    ['#9ec37c', '#96bc74', '#a5c984'],
    ['#89b46d', '#82ad66', '#91ba75'],
    ['#c4b776', '#bdb06f', '#ccb97e'],
    ['#dfe9e3', '#d8e3de', '#e6ece8']
  ];
  function tileColor(t, x, y, season) {
    const v = hash2(Math.floor(x / 3), Math.floor(y / 3)), i = v < 0.34 ? 0 : v < 0.67 ? 1 : 2;
    switch (t) {
      case T.GRASS: return shade(GRASS[season][0], (meadowNoise(x, y) - 0.5) * 0.17);
      case T.ROAD: return ['#dfd1ad', '#d9cb9f', '#e5d8b6'][i];
      case T.WATER: return ['#55a9ad', '#4ea1a6', '#61b4b6'][i];
      case T.CLIFF: return ['#6d847c', '#657c75', '#778e86'][i];
      case T.FOREST: return ['#5a8564', '#537e5d', '#638f6b'][i];
      case T.WALL: return ['#a8ab96', '#9fa38e', '#b4b6a1'][i];
      case T.FLOOR: return ['#c8a675', '#c19f6e', '#d1b080'][i];
      case T.FARM: return ['#9c764d', '#946f48', '#a68056'][i];
      case T.DIRT: return ['#ccb180', '#c4a979', '#d4bb8b'][i];
      case T.PLAZA: return ['#e6dcc3', '#dfd5bc', '#ece3cc'][i];
      case T.ARCH: return ['#c5b38b', '#beab83', '#cdbb94'][i];
      case T.SAND: return ['#e4d3a2', '#ddcd9c', '#eadbb0'][i];
      case T.MOSS: return ['#81a882', '#7aa07c', '#89b089'][i];
    }
    return '#f0f';
  }

  /* ---------- ก้อนภูมิประเทศ (chunk cache) ---------- */
  const CH = 16;
  function newCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  function buildChunk(R_, cx, cy, S) {
    const M = R_.W.map, season = R_.W.season, px = TS * S;
    const cv = newCanvas(CH * px, CH * px), c = cv.getContext('2d');
    const pl = M.byId && M.byId.plaza;
    const plCx = pl ? (pl.x + pl.w / 2) : -999, plCy = pl ? (pl.y + pl.h / 2) : -999;

    for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
      const x = cx * CH + tx, y = cy * CH + ty;
      if (x >= MAP.W || y >= MAP.H) continue;
      const k = y * MAP.W + x, t = M.terrain[k];
      c.fillStyle = tileColor(t, x, y, season);
      c.fillRect(tx * px, ty * px, px + 0.5, px + 0.5);
      const v = hash2(x * 7 + 1, y * 13 + 5);

      if (t === T.GRASS || t === T.MOSS) {
        // Clustered grass tufts leaving calm open negative space in the meadow
        const cl = meadowNoise(x * 0.6, y * 0.6);
        if (cl > 0.52 && v < 0.24) {
          const gx = tx * px + (3 + (v * 37) % 9) * S, gy = ty * px + (6 + (v * 71) % 7) * S;
          c.strokeStyle = season === 3 ? 'rgba(118,145,144,.26)' : 'rgba(54,98,54,.30)';
          c.lineWidth = 0.85 * S;
          c.beginPath();
          c.moveTo(gx - 2 * S, gy); c.quadraticCurveTo(gx - 3 * S, gy - 3.2 * S, gx - 4.2 * S, gy - 2.8 * S);
          c.moveTo(gx, gy); c.lineTo(gx, gy - 4.2 * S);
          c.moveTo(gx + S, gy); c.quadraticCurveTo(gx + 2.2 * S, gy - 3 * S, gx + 3.2 * S, gy - 2.2 * S);
          c.stroke();
        }
        if (season !== 3 && cl > 0.58 && v > 0.965) {
          c.fillStyle = season === 0 ? 'rgba(255,222,232,.85)' : 'rgba(255,244,190,.82)';
          c.beginPath(); c.arc(tx * px + 6 * S, ty * px + 8 * S, 1.1 * S, 0, 7); c.fill();
        }
      } else if (t === T.ROAD || t === T.ARCH) {
        c.strokeStyle = 'rgba(116,100,70,.20)';
        c.lineWidth = 0.7 * S;
        c.beginPath();
        c.moveTo(tx * px, ty * px + px - 0.5 * S); c.lineTo(tx * px + px, ty * px + px - 0.5 * S);
        if ((x + (y & 1)) % 2 === 0) { c.moveTo(tx * px, ty * px); c.lineTo(tx * px, ty * px + px); }
        c.stroke();
        c.fillStyle = 'rgba(255,252,230,.22)';
        c.fillRect(tx * px + 2 * S, ty * px + S, px - 3 * S, 1.2 * S);
      } else if (t === T.PLAZA) {
        const isBorder = (x === pl?.x || x === (pl?.x + pl?.w - 1) || y === pl?.y || y === (pl?.y + pl?.h - 1));
        if (isBorder) {
          c.fillStyle = 'rgba(168,152,120,.22)';
          c.fillRect(tx * px, ty * px, px, px);
        }
        c.strokeStyle = 'rgba(128,118,92,.22)';
        c.lineWidth = 0.65 * S;
        c.strokeRect(tx * px + 0.5 * S, ty * px + 0.5 * S, px - S, px - S);
        c.fillStyle = 'rgba(255,255,240,.25)';
        c.fillRect(tx * px + S, ty * px + S, px - 2 * S, S);
      } else if (t === T.WATER) {
        c.fillStyle = 'rgba(255,255,255,.14)';
        if (v < 0.38) c.fillRect(tx * px + 2 * S, ty * px + ((v * 30) % 12) * S, 6 * S, 1.1 * S);
      } else if (t === T.FARM) {
        c.fillStyle = 'rgba(78,52,32,.22)';
        for (let i = 0; i < 3; i++) c.fillRect(tx * px + (1 + i * 5) * S, ty * px, 2.2 * S, px);
        c.strokeStyle = season === 3 ? '#dce3d0' : season === 2 ? '#e6c252' : '#9ed45b';
        c.lineWidth = 1.2 * S;
        if (season !== 3 || v < 0.5) {
          for (let i = 0; i < 3; i++) {
            const fx = tx * px + (3 + i * 5) * S, fy = ty * px + 12.5 * S;
            c.beginPath();
            c.moveTo(fx, fy); c.lineTo(fx, fy - 8 * S);
            c.moveTo(fx, fy - 3 * S); c.lineTo(fx - 2 * S, fy - 6 * S);
            c.moveTo(fx, fy - 5 * S); c.lineTo(fx + 2 * S, fy - 8 * S);
            c.stroke();
          }
        }
      } else if (t === T.DIRT) {
        if (v < 0.3) {
          c.fillStyle = 'rgba(65,45,25,.16)';
          c.fillRect(tx * px + ((v * 30) % 10) * S, ty * px + ((v * 71) % 12) * S, 3 * S, 2 * S);
        }
      } else if (t === T.WALL) {
        // Fortified stone sect wall with crenellation courses
        c.fillStyle = '#8b8e7c';
        c.fillRect(tx * px, ty * px, px, px);
        c.fillStyle = 'rgba(255,255,245,.24)';
        c.fillRect(tx * px, ty * px, px, 3.2 * S);
        c.fillStyle = 'rgba(30,36,32,.32)';
        c.fillRect(tx * px, ty * px + px - 3.5 * S, px, 3.5 * S);
        c.strokeStyle = 'rgba(40,38,32,.42)';
        c.lineWidth = 0.8 * S;
        c.strokeRect(tx * px + 0.5 * S, ty * px + 0.5 * S, px - S, px - S);
        if ((x + y) % 2 === 0) {
          c.fillStyle = 'rgba(255,250,230,.18)';
          c.fillRect(tx * px + 3 * S, ty * px + 4 * S, px - 6 * S, 3 * S);
        }
      } else if (t === T.CLIFF) {
        // Layered ink-wash mountain cliff strata
        c.fillStyle = 'rgba(32,48,44,.20)';
        if (v < 0.65) {
          c.beginPath();
          c.moveTo(tx * px, ty * px + 5 * S);
          c.lineTo(tx * px + px * 0.6, ty * px + 3 * S);
          c.lineTo(tx * px + px, ty * px + 6 * S);
          c.lineTo(tx * px + px, ty * px + 10 * S);
          c.lineTo(tx * px, ty * px + 9 * S);
          c.closePath();
          c.fill();
        }
        if (season === 3) {
          c.fillStyle = 'rgba(238,244,250,.52)';
          c.fillRect(tx * px, ty * px, px, 4.5 * S);
        }
      } else if (t === T.FLOOR) {
        c.strokeStyle = 'rgba(72,48,26,.22)';
        c.lineWidth = 0.7 * S;
        c.beginPath();
        c.moveTo(tx * px, ty * px + px / 2); c.lineTo(tx * px + px, ty * px + px / 2);
        c.stroke();
      } else if (t === T.SAND) {
        c.fillStyle = 'rgba(150,122,68,.20)';
        if (v < 0.25) c.fillRect(tx * px + 4 * S, ty * px + 5 * S, 2.2 * S, 1.8 * S);
      }

      // Neighbor-aware verge & shoreline transitions
      if (t === T.ROAD || t === T.PLAZA || t === T.WATER || t === T.FLOOR) {
        const edge = (nx, ny) => nx >= 0 && ny >= 0 && nx < MAP.W && ny < MAP.H && M.terrain[ny * MAP.W + nx] !== t;
        if (t === T.WATER) {
          c.fillStyle = 'rgba(175,232,226,.34)';
          if (edge(x - 1, y)) c.fillRect(tx * px, ty * px, 2.2 * S, px);
          if (edge(x + 1, y)) c.fillRect(tx * px + px - 2.2 * S, ty * px, 2.2 * S, px);
          if (edge(x, y - 1)) c.fillRect(tx * px, ty * px, px, 2.2 * S);
          if (edge(x, y + 1)) c.fillRect(tx * px, ty * px + px - 2.2 * S, px, 2.2 * S);
        } else {
          c.fillStyle = 'rgba(98,108,68,.18)';
          if (edge(x - 1, y)) c.fillRect(tx * px, ty * px, 1.2 * S, px);
          if (edge(x + 1, y)) c.fillRect(tx * px + px - 1.2 * S, ty * px, 1.2 * S, px);
          if (edge(x, y - 1)) c.fillRect(tx * px, ty * px, px, 1.2 * S);
          if (edge(x, y + 1)) c.fillRect(tx * px, ty * px + px - 1.2 * S, px, 1.2 * S);
        }
      }
    }

    // If this chunk intersects the central Plaza, draw the inlaid stone Bagua/Taiji sect medallion
    if (pl && plCx >= cx * CH - 6 && plCx <= (cx + 1) * CH + 6 && plCy >= cy * CH - 6 && plCy <= (cy + 1) * CH + 6) {
      const mx = (plCx - cx * CH) * px, my = (plCy - cy * CH) * px, rad = 4.2 * px;
      c.save();
      c.strokeStyle = 'rgba(124,108,76,0.32)';
      c.lineWidth = 1.4 * S;
      c.beginPath(); c.arc(mx, my, rad, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(mx, my, rad * 0.76, 0, Math.PI * 2); c.stroke();
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        c.beginPath();
        c.moveTo(mx + Math.cos(a) * rad * 0.76, my + Math.sin(a) * rad * 0.76);
        c.lineTo(mx + Math.cos(a) * rad, my + Math.sin(a) * rad);
        c.stroke();
      }
      c.restore();
    }

    // Pad decoration scan by 1 tile around chunk borders so wide tree canopies don't clip at chunk seams
    const x0 = cx * CH, y0 = cy * CH;
    M.decor.forEach(d => {
      if (d.x < x0 - 1 || d.x >= x0 + CH + 1 || d.y < y0 - 1 || d.y >= y0 + CH + 1) return;
      if (d.kind === 'lantern' || d.kind === 'banner' || d.kind === 'fountain') return;
      drawDecor(c, d, (d.x - x0) * px, (d.y - x0 * 0 - y0) * px, S, season);
    });
    // Outdoor station props
    M.stations.forEach(s => {
      if (s.inside || s.x < x0 || s.x >= x0 + CH || s.y < y0 || s.y >= y0 + CH) return;
      drawStationProp(c, s, (s.x - x0) * px, (s.y - y0) * px, S);
    });
    return cv;
  }

  function drawDecor(c, d, x, y, S, season) {
    const u = TS * S, cx = x + u / 2, base = y + u * 0.92, sc = d.s;
    const ellipse = (px, py, rx, ry, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(px, py, rx, ry, 0, 0, 7); c.fill(); };
    if (d.kind === 'pine' || d.kind === 'blossom' || d.kind === 'bamboo' || d.kind === 'rock') {
      ellipse(cx + 2 * S, base + S, u * 0.48 * sc, u * 0.16, 'rgba(36,68,50,.22)');
    }
    if (d.kind === 'pine') {
      c.fillStyle = '#755235';
      c.fillRect(cx - 1.2 * S, base - u * 0.45 * sc, 2.4 * S, u * 0.47 * sc);
      const cols = season === 2 ? ['#9c6f34', '#b88b44', '#cfa458'] : season === 3 ? ['#557d73', '#729b8d', '#b8cfc0'] : ['#326b54', '#468766', '#64a375'];
      for (let i = 0; i < 3; i++) {
        const w = u * (0.58 - i * 0.12) * sc, yy = base - u * (0.35 + i * 0.26) * sc, top = yy - u * 0.48 * sc;
        c.fillStyle = cols[i];
        c.beginPath();
        c.moveTo(cx, top);
        c.quadraticCurveTo(cx - w * 0.34, yy - u * 0.09, cx - w, yy + u * 0.06);
        c.quadraticCurveTo(cx - w * 0.5, yy + u * 0.27, cx, yy + u * 0.19);
        c.quadraticCurveTo(cx + w * 0.72, yy + u * 0.25, cx + w, yy + u * 0.05);
        c.quadraticCurveTo(cx + w * 0.32, yy - u * 0.09, cx, top);
        c.fill();
        c.strokeStyle = 'rgba(22,48,36,0.28)';
        c.lineWidth = 0.6 * S;
        c.stroke();
        c.fillStyle = season === 3 ? '#eef3ea' : 'rgba(188,226,150,.32)';
        c.beginPath();
        c.moveTo(cx, top + S);
        c.quadraticCurveTo(cx - w * 0.4, yy - u * 0.01, cx - w * 0.74, yy + u * 0.02);
        c.quadraticCurveTo(cx - w * 0.25, yy + u * 0.04, cx + w * 0.12, yy - u * 0.05);
        c.closePath();
        c.fill();
      }
    } else if (d.kind === 'blossom') {
      c.strokeStyle = '#785640';
      c.lineWidth = 2.4 * S;
      c.beginPath();
      c.moveTo(cx, base);
      c.quadraticCurveTo(cx + 2 * S, base - u * 0.4 * sc, cx - S, base - u * 0.85 * sc);
      c.moveTo(cx, base - u * 0.32);
      c.lineTo(cx - u * 0.24, base - u * 0.68 * sc);
      c.stroke();
      const cols = season === 0 ? ['#d4829d', '#e8a2ba', '#f6c4d2', '#ffe4e6'] : season === 1 ? ['#4e8864', '#6ea272', '#92be84', '#b8d496'] : season === 2 ? ['#b87c46', '#d69958', '#eab970', '#f5d28e'] : ['#aab9b2', '#c5d1c8', '#e2e7dd', '#f2f1e8'];
      ellipse(cx, base - u * 0.77 * sc, u * 0.49 * sc, u * 0.40 * sc, cols[0]);
      [[-0.27, -0.77, 0.29], [0.23, -0.82, 0.33], [0, -1.04, 0.3], [-0.13, -0.97, 0.27]].forEach((o, i) => ellipse(cx + o[0] * u * sc, base + o[1] * u * sc, o[2] * u * sc, o[2] * u * sc * 0.88, cols[1 + i % 3]));
      ellipse(cx - u * 0.19 * sc, base - u * 1.03 * sc, u * 0.14 * sc, u * 0.07 * sc, 'rgba(255,250,224,.45)');
    } else if (d.kind === 'bamboo') {
      for (let i = 0; i < 3; i++) {
        const bx = cx + (i - 1) * u * 0.2, top = base - u * (0.88 + i * 0.1) * sc;
        c.strokeStyle = '#588a5d';
        c.lineWidth = 1.6 * S;
        c.beginPath(); c.moveTo(bx, base); c.lineTo(bx + S, top); c.stroke();
        for (let j = 1; j <= 3; j++) {
          const yy = base - j * (base - top) / 4;
          c.fillStyle = '#c8dc98';
          c.fillRect(bx - S, yy, 2.3 * S, 0.75 * S);
          c.strokeStyle = j % 2 ? '#4c8058' : '#78a86b';
          c.lineWidth = S;
          c.beginPath();
          c.moveTo(bx, yy); c.quadraticCurveTo(bx + u * 0.2, yy - u * 0.22, bx + u * 0.3, yy - u * 0.13);
          c.moveTo(bx, yy - 2 * S); c.quadraticCurveTo(bx - u * 0.22, yy - u * 0.22, bx - u * 0.27, yy - u * 0.12);
          c.stroke();
        }
      }
    } else if (d.kind === 'rock') {
      c.fillStyle = '#768a81';
      c.beginPath();
      c.moveTo(cx - u * 0.36 * sc, base);
      c.lineTo(cx - u * 0.25 * sc, base - u * 0.31 * sc);
      c.quadraticCurveTo(cx, base - u * 0.55 * sc, cx + u * 0.22 * sc, base - u * 0.31 * sc);
      c.lineTo(cx + u * 0.36 * sc, base);
      c.closePath();
      c.fill();
      c.fillStyle = season === 3 ? '#ebeee3' : '#aebba3';
      c.beginPath();
      c.moveTo(cx - u * 0.25 * sc, base - u * 0.31 * sc);
      c.quadraticCurveTo(cx, base - u * 0.55 * sc, cx + u * 0.22 * sc, base - u * 0.31 * sc);
      c.lineTo(cx - u * 0.05, base - u * 0.12);
      c.closePath();
      c.fill();
      if (season !== 3) ellipse(cx - u * 0.19, base - S, u * 0.14, S, '#6e9262');
    } else if (d.kind === 'flower' && season !== 3) {
      const fx = x + d.r * u, fy = y + ((d.r * 7) % 1) * u;
      c.strokeStyle = '#62905a';
      c.lineWidth = 0.7 * S;
      c.beginPath(); c.moveTo(fx, fy + 2 * S); c.lineTo(fx, fy); c.stroke();
      const pCol = ['#f5bdcc', '#fff0bb', '#d3bdec', '#ffd6a4'][(d.r * 4) | 0];
      ellipse(fx - S, fy, 1.4 * S, S, pCol);
      ellipse(fx + S, fy - 0.7 * S, 1.3 * S, S, pCol);
      ellipse(fx, fy, 0.65 * S, 0.65 * S, '#f3d18a');
    }
  }

  function drawStationProp(c, s, x, y, S) {
    const u = TS * S, cx = x + u / 2, cy = y + u / 2;
    if (s.kind === 'dummy') {
      // Wooden martial dummy (木人桩) with cross-arms and base shadow
      c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(cx, cy + u * 0.32, u * 0.22, u * 0.09, 0, 0, 7); c.fill();
      c.fillStyle = '#6a4828'; c.fillRect(cx - u * 0.07, cy - u * 0.45, u * 0.14, u * 0.78);
      c.fillStyle = '#c49d62'; c.fillRect(cx - u * 0.24, cy - u * 0.32, u * 0.48, u * 0.12);
      c.fillStyle = '#8c3b2b'; c.fillRect(cx - u * 0.08, cy - u * 0.22, u * 0.16, u * 0.16);
      c.fillStyle = '#dfc38a'; c.beginPath(); c.arc(cx, cy - u * 0.48, u * 0.11, 0, 7); c.fill();
    } else if (s.kind === 'lift') {
      // Stone lock weights & barbell
      c.fillStyle = '#5a5f66'; c.fillRect(cx - u * 0.30, cy - u * 0.08, u * 0.60, u * 0.14);
      c.fillStyle = '#3e434a'; c.fillRect(cx - u * 0.36, cy - u * 0.20, u * 0.13, u * 0.38);
      c.fillRect(cx + u * 0.23, cy - u * 0.20, u * 0.13, u * 0.38);
    } else if (s.kind === 'spar') {
      c.strokeStyle = 'rgba(110,75,35,.55)'; c.lineWidth = 1.2 * S;
      c.strokeRect(cx - u * 0.42, cy - u * 0.42, u * 0.84, u * 0.84);
      c.beginPath(); c.arc(cx, cy, u * 0.24, 0, 7); c.stroke();
    } else if (s.kind === 'cauldron') {
      // Bronze three-legged pill cauldron (丹炉)
      c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(cx, cy + u * 0.24, u * 0.28, u * 0.12, 0, 0, 7); c.fill();
      c.fillStyle = '#6e5232'; c.beginPath(); c.arc(cx, cy, u * 0.26, 0, 7); c.fill();
      c.fillStyle = '#c89e52'; c.beginPath(); c.ellipse(cx, cy - u * 0.12, u * 0.22, u * 0.09, 0, 0, 7); c.fill();
      c.fillStyle = '#5ae098'; c.beginPath(); c.ellipse(cx, cy - u * 0.12, u * 0.14, u * 0.05, 0, 0, 7); c.fill();
    } else if (s.kind === 'herbtable') {
      c.fillStyle = '#825c38'; c.fillRect(cx - u * 0.36, cy - u * 0.16, u * 0.72, u * 0.32);
      c.fillStyle = '#62a865'; c.fillRect(cx - u * 0.24, cy - u * 0.10, u * 0.18, u * 0.16);
      c.fillStyle = '#e2c48e'; c.fillRect(cx + u * 0.04, cy - u * 0.10, u * 0.18, u * 0.16);
    } else if (s.kind === 'anvil') {
      // Blacksmith anvil & forge hearth
      c.fillStyle = '#3b3e45'; c.fillRect(cx - u * 0.24, cy - u * 0.12, u * 0.48, u * 0.24);
      c.fillStyle = '#686e78'; c.fillRect(cx - u * 0.30, cy - u * 0.18, u * 0.60, u * 0.10);
      c.fillStyle = '#ff7832'; c.beginPath(); c.arc(cx + u * 0.28, cy + u * 0.12, u * 0.10, 0, 7); c.fill();
    } else if (s.kind === 'mine') {
      c.fillStyle = '#5e646e'; c.beginPath(); c.arc(cx, cy, u * 0.32, 0, 7); c.fill();
      c.fillStyle = '#7ce0ff'; c.fillRect(cx - u * 0.08, cy - u * 0.14, u * 0.14, u * 0.14);
      c.fillStyle = '#b8f2ff'; c.fillRect(cx + u * 0.06, cy - u * 0.04, u * 0.10, u * 0.10);
    } else if (s.kind === 'fish') {
      c.fillStyle = '#735030'; c.fillRect(cx - u * 0.42, cy - u * 0.08, u * 0.84, u * 0.16);
    } else if (s.kind === 'meditate' || s.kind === 'worship') {
      // Woven straw/silk meditation cushion (蒲团)
      c.fillStyle = s.kind === 'worship' ? '#b84b39' : '#c9a658';
      c.beginPath(); c.ellipse(cx, cy + u * 0.1, u * 0.30, u * 0.16, 0, 0, 7); c.fill();
      c.strokeStyle = '#f0dca0'; c.lineWidth = 0.7 * S; c.stroke();
    } else if (s.kind === 'music') {
      c.fillStyle = '#7a4b2a'; c.fillRect(cx - u * 0.28, cy - u * 0.10, u * 0.56, u * 0.20);
      c.strokeStyle = '#f0e2b8'; c.lineWidth = 0.5 * S;
      c.beginPath(); c.moveTo(cx - u * 0.22, cy); c.lineTo(cx + u * 0.22, cy); c.stroke();
    } else if (s.kind === 'chat' || s.kind === 'eat') {
      c.fillStyle = '#785536'; c.fillRect(cx - u * 0.32, cy - u * 0.08, u * 0.64, u * 0.16);
      c.fillStyle = '#ebe3cc';
      c.beginPath(); c.arc(cx - u * 0.15, cy - u * 0.12, u * 0.07, 0, 7); c.arc(cx + u * 0.15, cy - u * 0.12, u * 0.07, 0, 7); c.fill();
    } else if (s.kind === 'read') {
      c.fillStyle = '#7a5434'; c.fillRect(cx - u * 0.28, cy - u * 0.10, u * 0.56, u * 0.20);
      c.fillStyle = '#f5ecd2'; c.fillRect(cx - u * 0.16, cy - u * 0.08, u * 0.32, u * 0.12);
    } else if (s.kind === 'stall') {
      c.fillStyle = '#8c5a32'; c.fillRect(cx - u * 0.38, cy - u * 0.16, u * 0.76, u * 0.30);
      c.fillStyle = '#d96b43'; c.fillRect(cx - u * 0.36, cy - u * 0.22, u * 0.72, u * 0.10);
    } else if (s.kind === 'board') {
      c.fillStyle = '#6a4628'; c.fillRect(cx - u * 0.34, cy - u * 0.36, u * 0.68, u * 0.42);
      c.fillStyle = '#f5ebd0'; c.fillRect(cx - u * 0.26, cy - u * 0.30, u * 0.20, u * 0.26);
      c.fillRect(cx + u * 0.04, cy - u * 0.28, u * 0.18, u * 0.22);
    } else if (s.kind === 'pray') {
      c.fillStyle = '#d8c488'; c.fillRect(cx - u * 0.16, cy - u * 0.26, u * 0.32, u * 0.32);
      c.fillStyle = '#e04030'; c.fillRect(cx - u * 0.04, cy - u * 0.38, u * 0.08, u * 0.12);
    } else if (s.kind === 'pantry') {
      // Peak Sanctuary food pantry table & steamer baskets
      c.fillStyle = '#7d5233'; c.fillRect(cx - u * 0.34, cy - u * 0.14, u * 0.68, u * 0.28);
      c.fillStyle = '#e8d5a7'; c.beginPath(); c.arc(cx - u * 0.14, cy - u * 0.08, u * 0.10, 0, 7); c.fill();
      c.fillStyle = '#c84b31'; c.beginPath(); c.arc(cx + u * 0.14, cy - u * 0.08, u * 0.09, 0, 7); c.fill();
    } else if (s.kind === 'practice') {
      // Peak Sanctuary stone martial post & formation ring
      c.strokeStyle = 'rgba(88,164,176,.55)'; c.lineWidth = 1.1 * S;
      c.beginPath(); c.arc(cx, cy, u * 0.34, 0, 7); c.stroke();
      c.fillStyle = '#6c584c'; c.fillRect(cx - u * 0.08, cy - u * 0.38, u * 0.16, u * 0.68);
      c.fillStyle = '#d4af37'; c.fillRect(cx - u * 0.20, cy - u * 0.24, u * 0.40, u * 0.10);
    }
  }

  /* ---------- Distinct Building Families, Silhouettes & Upgrade Stages ---------- */
  function buildingStyle(type) {
    switch (type) {
      case 'main_hall':
        return { family: 'palace', roof: '#2d7a72', ridge: '#f2cf66', wall: '#f4e0b2', wood: '#9e3228', accent: '#d94838', plaqueBg: '#1e3c38', plaqueInk: '#ffe89e' };
      case 'scripture':
        return { family: 'pagoda_library', roof: '#384d6e', ridge: '#d8be7c', wall: '#e8d8b8', wood: '#6e462c', accent: '#4a6b9c', plaqueBg: '#24324a', plaqueInk: '#f2dfb0' };
      case 'alchemy':
        return { family: 'alchemy', roof: '#3c7352', ridge: '#e5b95c', wall: '#ebd8b0', wood: '#855334', accent: '#62c485', plaqueBg: '#244734', plaqueInk: '#e8f7c8' };
      case 'forge':
        return { family: 'forge', roof: '#464a54', ridge: '#c97a4b', wall: '#cfc8bc', wood: '#5e4234', accent: '#e06b3c', plaqueBg: '#2e2a28', plaqueInk: '#ffcc99' };
      case 'canteen':
        return { family: 'canteen', roof: '#7d5033', ridge: '#dfba73', wall: '#eedbc0', wood: '#8f5838', accent: '#d4533b', plaqueBg: '#4a2e1e', plaqueInk: '#ffe6bd' };
      case 'infirmary':
        return { family: 'infirmary', roof: '#4c8c74', ridge: '#cde0c8', wall: '#f4f6ee', wood: '#7d6249', accent: '#68c49c', plaqueBg: '#285244', plaqueInk: '#e8fff2' };
      case 'treasury':
        return { family: 'treasury', roof: '#6b5828', ridge: '#f5d469', wall: '#d8d0c0', wood: '#5c4328', accent: '#eab842', plaqueBg: '#3d3014', plaqueInk: '#ffe885' };
      case 'market':
        return { family: 'market', roof: '#85582a', ridge: '#e6c275', wall: '#edd9b4', wood: '#8c5630', accent: '#d95338', plaqueBg: '#4d3018', plaqueInk: '#ffe6b0' };
      case 'discipline':
        return { family: 'discipline', roof: '#2e3846', ridge: '#9aa8b8', wall: '#c8cdd2', wood: '#454a54', accent: '#8c2d2d', plaqueBg: '#1c222b', plaqueInk: '#e0e6ed' };
      case 'meditation_hall':
        return { family: 'meditation', roof: '#2b6e78', ridge: '#a8e0e8', wall: '#eae2cc', wood: '#6e553e', accent: '#5cc8d8', plaqueBg: '#1c464d', plaqueInk: '#d8f8ff' };
      case 'ancestral':
        return { family: 'ancestral', roof: '#46445c', ridge: '#cfc8dc', wall: '#dcd8cf', wood: '#584842', accent: '#7c749c', plaqueBg: '#282636', plaqueInk: '#eae6f5' };
      case 'shrine':
        return { family: 'shrine', roof: '#9c7822', ridge: '#ffe074', wall: '#f4e4b8', wood: '#a33928', accent: '#f2b830', plaqueBg: '#523810', plaqueInk: '#fff0a8' };
      case 'tea_garden':
        return { family: 'pavilion', roof: '#4f8575', ridge: '#d8c690', wall: '#efe2c8', wood: '#8c5d42', accent: '#78b898', plaqueBg: '#2c4d43', plaqueInk: '#f5ebd0' };
      case 'mission_hall':
        return { family: 'mission', roof: '#35587a', ridge: '#deb968', wall: '#e8d6b4', wood: '#7a5234', accent: '#3d7ab8', plaqueBg: '#1f364d', plaqueInk: '#f5e2b8' };
      case 'elder_quarters':
        return { family: 'residence_elder', roof: '#7d3b2e', ridge: '#e8c474', wall: '#f2e4c6', wood: '#8a4832', accent: '#c44b38', plaqueBg: '#4a2018', plaqueInk: '#ffe8b8' };
      case 'dorm_core':
        return { family: 'residence', roof: '#4e587a', ridge: '#d6be82', wall: '#ede0c4', wood: '#7d553b', accent: '#7368a8', plaqueBg: '#2e344a', plaqueInk: '#f0e4c8' };
      case 'dorm_inner':
        return { family: 'residence', roof: '#3f6e78', ridge: '#cbb882', wall: '#ebe0c6', wood: '#82593e', accent: '#4d8a9c', plaqueBg: '#26434a', plaqueInk: '#ece2c8' };
      case 'dorm_outer':
        return { family: 'residence', roof: '#5c6e52', ridge: '#b8ae84', wall: '#e2d4b5', wood: '#78583c', accent: '#6c8558', plaqueBg: '#34402e', plaqueInk: '#e6dec4' };
      case 'mine':
        return { family: 'mine', roof: '#4c5054', ridge: '#8c9298', wall: '#b8b4a8', wood: '#664a32', accent: '#62c4e8', plaqueBg: '#2b2e30', plaqueInk: '#d8e8f0' };
      case 'gate':
        return { family: 'gate', roof: '#2e5866', ridge: '#f0cf68', wall: '#9e342c', wood: '#962e26', accent: '#e8b848', plaqueBg: '#1c343d', plaqueInk: '#ffe89e' };
      case 'tower':
        return { family: 'tower', roof: '#3c5260', ridge: '#d4b872', wall: '#d8ccb4', wood: '#735038', accent: '#c44b38', plaqueBg: '#24323b', plaqueInk: '#f0e0b8' };
      case 'peak_sword':
        return { family: 'peak_sword', roof: '#1e5f74', ridge: '#80deea', wall: '#e2ecf2', wood: '#2c5364', accent: '#00e5ff', plaqueBg: '#102a36', plaqueInk: '#b2ebf2' };
      case 'peak_body':
        return { family: 'peak_body', roof: '#6b4423', ridge: '#ffb703', wall: '#b8aa9a', wood: '#5c3a21', accent: '#fb8500', plaqueBg: '#2e1d10', plaqueInk: '#ffe082' };
      case 'peak_chaos':
        return { family: 'peak_chaos', roof: '#4a1525', ridge: '#ff4d6d', wall: '#78525e', wood: '#38101c', accent: '#ff1744', plaqueBg: '#240812', plaqueInk: '#ffccd5' };
      case 'peak_alchemy':
        return { family: 'peak_alchemy', roof: '#2d6a4f', ridge: '#ffd166', wall: '#e9d8b4', wood: '#6c4830', accent: '#52b788', plaqueBg: '#1b4332', plaqueInk: '#d8f3dc' };
      case 'peak_magic':
        return { family: 'peak_magic', roof: '#3c3b6e', ridge: '#e0aaff', wall: '#e6dff2', wood: '#4a3b6e', accent: '#c77dff', plaqueBg: '#241e42', plaqueInk: '#f3e5f5' };
      case 'peak_array':
        return { family: 'peak_array', roof: '#2b4c65', ridge: '#ffd166', wall: '#cfd8dc', wood: '#37474f', accent: '#48cae4', plaqueBg: '#182c3b', plaqueInk: '#caf0f8' };
      case 'peak_scholar':
        return { family: 'peak_scholar', roof: '#3b6e5c', ridge: '#e9c46a', wall: '#f4ebd6', wood: '#6d4c3d', accent: '#76c893', plaqueBg: '#1f3d32', plaqueInk: '#fefae0' };
      case 'peak_beast':
        return { family: 'peak_beast', roof: '#5c4028', ridge: '#f4a261', wall: '#c9b8a0', wood: '#4a321e', accent: '#e76f51', plaqueBg: '#2e1f12', plaqueInk: '#ffedd8' };
      default:
        return { family: 'hall', roof: '#528f86', ridge: '#dfc48b', wall: '#eddfbd', wood: '#946246', accent: '#528f86', plaqueBg: '#2c4d48', plaqueInk: '#f5ebd0' };
    }
  }

  function buildingMetrics(b) {
    const w = b.w * TS, h = b.h * TS;
    const roofRatio = b.type === 'main_hall' ? 0.65 : b.type === 'tower' ? 0.48 : b.type === 'gate' ? 0.56 : 0.60;
    const roofH = h * roofRatio, wallH = h - roofH + 6;
    return { w, h, roofH, wallH, wallTop: h - wallH, cols: Math.max(2, Math.round(w / 48)) };
  }

  function buildingWindows(c, m, lit, bType) {
    const bay = m.w / m.cols, wh = Math.max(8, m.wallH - 30), wy = m.wallTop + 17;
    const isRound = bType === 'infirmary' || bType === 'tea_garden' || bType === 'elder_quarters';
    const isVault = bType === 'treasury' || bType === 'discipline';
    for (let i = 0; i < m.cols; i++) {
      const wx = i * bay + bay * 0.2, ww = bay * 0.6;
      const cx = wx + ww / 2, cy = wy + wh / 2;
      if (isRound) {
        const rad = Math.min(ww, wh) * 0.46;
        c.fillStyle = '#9e744e';
        c.beginPath(); c.arc(cx, cy, rad + 1.8, 0, Math.PI * 2); c.fill();
        c.fillStyle = lit ? '#f7d89c' : '#587d78';
        c.beginPath(); c.arc(cx, cy, rad, 0, Math.PI * 2); c.fill();
        c.strokeStyle = lit ? '#b88648' : '#c8bc98';
        c.lineWidth = 0.85;
        c.beginPath();
        c.moveTo(cx - rad, cy); c.lineTo(cx + rad, cy);
        c.moveTo(cx, cy - rad); c.lineTo(cx, cy + rad);
        c.stroke();
      } else {
        const curWh = isVault ? Math.max(6, wh * 0.55) : wh;
        const curWy = isVault ? wy + 3 : wy;
        c.fillStyle = '#b0895a';
        c.fillRect(wx - 2, curWy - 2, ww + 4, curWh + 4);
        c.fillStyle = lit ? '#f5d496' : '#5a7f7b';
        c.fillRect(wx, curWy, ww, curWh);
        c.fillStyle = lit ? '#fff2cc' : '#80a399';
        c.fillRect(wx + 1, curWy + 1, ww - 2, Math.max(3, curWh * 0.28));
        c.strokeStyle = lit ? '#b5864c' : '#b5aa84';
        c.lineWidth = 0.9;
        c.beginPath();
        for (let j = 1; j < 4; j++) {
          c.moveTo(wx + ww * j / 4, curWy);
          c.lineTo(wx + ww * j / 4, curWy + curWh);
        }
        if (!isVault) {
          c.moveTo(wx, curWy + curWh * 0.35); c.lineTo(wx + ww, curWy + curWh * 0.35);
          c.moveTo(wx, curWy + curWh * 0.70); c.lineTo(wx + ww, curWy + curWh * 0.70);
        }
        c.stroke();
        // Scripture library scroll shelves visible inside windows
        if (bType === 'scripture' && !lit) {
          c.fillStyle = '#d8c28a';
          for (let s = 0; s < 3; s++) {
            c.fillRect(wx + 3 + s * (ww / 3), curWy + 3, ww / 4, 2);
            c.fillRect(wx + 3 + s * (ww / 3), curWy + curWh * 0.45, ww / 4, 2);
          }
        }
        c.fillStyle = '#92724e';
        c.fillRect(wx - 3, curWy + curWh + 2, ww + 6, 2);
      }
    }
  }

  R.getArchitecturalTierStage = function (lv) {
    const n = Number(lv) || 1;
    return n >= 5 ? 3 : n >= 3 ? 2 : 1;
  };

  function buildBuildingSprite(b, S) {
    S = S || 1;
    const m = buildingMetrics(b), { w, h, roofH, wallH, wallTop, cols } = m, style = buildingStyle(b.type);
    const lv = b.level || 1;
    const tierStage = b.tierStage || R.getArchitecturalTierStage(lv);
    const cv = newCanvas((w + 48) * S, (h + 68) * S), c = cv.getContext('2d');
    cv.tierStage = tierStage;
    cv.buildingLevel = lv;
    cv.buildingType = b.type;
    c.scale(S, S);
    c.translate(22, 44);

    // 1. Soft ambient contact shadow & stepped stone terrace foundation (台基)
    c.fillStyle = 'rgba(32,56,42,.18)';
    c.beginPath(); c.ellipse(w / 2 + 6, h + 7, w * 0.56, 11, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(38,54,44,.16)';
    c.beginPath(); c.moveTo(-2, h); c.lineTo(w + 6, h); c.lineTo(w + 14, h + 11); c.lineTo(8, h + 11); c.closePath(); c.fill();

    // Stepped stone plinth (higher/whiter for main_hall, shrine, ancestral)
    const isGrand = b.type === 'main_hall' || b.type === 'shrine' || b.type === 'ancestral' || b.type === 'scripture';
    c.fillStyle = isGrand ? '#c8c0a8' : '#afa484';
    c.fillRect(-4, h - 5, w + 8, 10);
    c.fillStyle = isGrand ? '#ece6d4' : '#dcd2b4';
    c.fillRect(-5, h - 6, w + 10, 3.5);
    if (lv >= 2 || isGrand) {
      c.strokeStyle = 'rgba(90,82,64,0.35)';
      c.lineWidth = 0.8;
      for (let sx = 0; sx < w; sx += 16) {
        c.beginPath(); c.moveTo(sx, h - 5); c.lineTo(sx, h + 4); c.stroke();
      }
    }

    // Special Gate Archway (ประตูสำนัก — 山门牌坊)
    if (b.type === 'gate') {
      const pxs = [8, w * 0.34, w * 0.66, w - 14];
      pxs.forEach(px => {
        c.fillStyle = '#cfc6b0'; c.fillRect(px - 2, h - 8, 10, 10);
        c.fillStyle = style.wood; c.fillRect(px, wallTop - 6, 6, wallH + 4);
        c.fillStyle = '#f0cf68'; c.fillRect(px + 1, wallTop - 4, 1.2, wallH);
      });
      // Crossbeams
      c.fillStyle = '#7a241e'; c.fillRect(4, wallTop + 2, w - 8, 7);
      c.strokeStyle = '#f0cf68'; c.lineWidth = 1; c.strokeRect(6, wallTop + 3, w - 12, 5);
    } else {
      // 2. Main Wall Facade
      const wg = c.createLinearGradient(0, wallTop, 0, h);
      wg.addColorStop(0, shade(style.wall, -0.10));
      wg.addColorStop(0.28, style.wall);
      wg.addColorStop(1, shade(style.wall, -0.06));
      c.fillStyle = wg;
      c.fillRect(0, wallTop, w, wallH - 5);

      // Stone masonry wainscoting for forge, treasury, discipline, mine
      if (['forge', 'treasury', 'discipline', 'mine'].includes(b.type)) {
        c.fillStyle = 'rgba(75,78,82,0.28)';
        c.fillRect(0, h - 18, w, 13);
        c.strokeStyle = 'rgba(40,42,46,0.3)';
        c.lineWidth = 0.7;
        for (let bx = 0; bx < w; bx += 14) {
          c.strokeRect(bx, h - 18, 14, 6.5);
          c.strokeRect(bx + 7, h - 11.5, 14, 6.5);
        }
      }

      c.fillStyle = 'rgba(64,62,42,.13)';
      c.fillRect(w - 9, wallTop, 9, wallH - 5);

      buildingWindows(c, m, false, b.type);

      // Structural timber columns & bracket capitals (斗拱)
      for (let i = 0; i <= cols; i++) {
        const px = i * (w - 5) / cols;
        c.fillStyle = style.wood;
        c.fillRect(px, wallTop, 5, wallH - 5);
        c.fillStyle = 'rgba(255,228,175,.32)';
        c.fillRect(px + 0.8, wallTop, 1, wallH - 6);
        // Column base drum (柱础)
        c.fillStyle = isGrand ? '#e5dec9' : '#c6aa74';
        c.fillRect(px - 1, h - 11, 7, 6);
        // Upper bracket (斗拱) under eaves
        c.fillStyle = isGrand ? '#d94838' : shade(style.wood, -0.15);
        c.fillRect(px - 2, wallTop, 9, 3.5);
        if (isGrand || lv >= 2) {
          c.fillStyle = '#f0cf68';
          c.fillRect(px - 1, wallTop + 1, 7, 1.2);
        }
      }
      c.fillStyle = style.wood;
      c.fillRect(0, h - 15, w, 2);

      // 3. Entrance Door & Forecourt Steps
      const dx = (b.door.x - b.x) * TS;
      if (b.type === 'main_hall') {
        // Imperial dragon-ramp stairway (丹墀)
        c.fillStyle = '#d8d0bc'; c.fillRect(dx - 16, h - 2, 48, 9);
        c.fillStyle = '#f0ead8'; c.fillRect(dx - 13, h - 1, 42, 7);
        c.fillStyle = '#c8be9e'; c.fillRect(dx - 4, h - 1, 24, 7);
        c.strokeStyle = '#9e8f68'; c.lineWidth = 0.8; c.strokeRect(dx - 4, h - 1, 24, 7);
      } else {
        c.fillStyle = '#bea983'; c.fillRect(dx - 9, h + 2, 34, 4);
        c.fillStyle = '#e5d6b1'; c.fillRect(dx - 6, h - 1, 28, 4);
      }
      c.fillStyle = style.wood; c.fillRect(dx - 5, h - 30, 26, 29);
      c.fillStyle = '#683f2b'; c.fillRect(dx - 2, h - 27, 20, 26);
      c.fillStyle = b.type === 'main_hall' || b.type === 'shrine' ? '#9e2e24' : '#9c6b46';
      c.fillRect(dx, h - 26, 8, 25);
      c.fillRect(dx + 10, h - 26, 6, 25);
      // Brass door studs & knockers
      c.fillStyle = '#f0d68a';
      c.fillRect(dx + 5, h - 16, 2, 2.2);
      c.fillRect(dx + 11, h - 16, 2, 2.2);

      // Inscribed Horizontal Plaque (匾额)
      if (w > 88) {
        c.fillStyle = style.plaqueBg;
        c.fillRect(dx - 8, h - 42, 32, 9.5);
        c.strokeStyle = '#e5c46c';
        c.lineWidth = 1.0;
        c.strokeRect(dx - 8, h - 42, 32, 9.5);
        c.fillStyle = style.plaqueInk;
        c.fillRect(dx - 3, h - 38, 6, 1.4);
        c.fillRect(dx + 5, h - 38, 6, 1.4);
        c.fillRect(dx + 13, h - 38, 5, 1.4);
      }
    }

    // 4. Family-Specific Forecourt & Facade Identifying Details
    if (b.type === 'market') {
      // Striped merchant awnings along the lower facade
      const stripeCount = Math.floor((w - 16) / 14);
      for (let i = 0; i < stripeCount; i++) {
        c.fillStyle = i % 2 === 0 ? '#c84b31' : '#f2e2b8';
        c.beginPath();
        c.moveTo(8 + i * 14, wallTop + 12);
        c.lineTo(22 + i * 14, wallTop + 12);
        c.lineTo(20 + i * 14, wallTop + 21);
        c.lineTo(6 + i * 14, wallTop + 21);
        c.closePath();
        c.fill();
      }
    } else if (b.type === 'forge') {
      // Tall brick-and-iron smelter chimney on the right side
      const chX = w - 22, chY = -16;
      c.fillStyle = '#5a463c';
      c.fillRect(chX, chY, 13, roofH + 22);
      c.fillStyle = '#383a40';
      c.fillRect(chX - 2, chY - 3, 17, 4);
      c.fillStyle = '#ff7034';
      c.beginPath(); c.arc(chX + 6.5, h - 8, 4.5, Math.PI, 0); c.fill();
    } else if (b.type === 'infirmary') {
      // Hanging herbal medicine gourd sign & white-jade cross emblem
      const dx = (b.door.x - b.x) * TS;
      c.fillStyle = '#e8f5e9';
      c.beginPath(); c.arc(dx - 14, h - 22, 5.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#2e7d5b';
      c.fillRect(dx - 15.2, h - 25.5, 2.4, 7);
      c.fillRect(dx - 17.5, h - 23.2, 7, 2.4);
    } else if (b.type === 'main_hall' || b.type === 'shrine' || b.type === 'ancestral') {
      // Flanking bronze tripod incense burners (鼎炉)
      const dx = (b.door.x - b.x) * TS;
      for (const side of [-26, 40]) {
        const bx = dx + side, by = h + 1;
        c.fillStyle = '#7a5c38';
        c.fillRect(bx - 4, by - 4, 8, 5);
        c.fillStyle = '#c9a452';
        c.beginPath(); c.ellipse(bx, by - 4, 5.5, 3, 0, 0, Math.PI * 2); c.fill();
      }
    }

    // 5. Roof Silhouette (Sweeping Curved Eaves + Tile Courses)
    const rx = -11, rw = w + 22, ry = -10, rb = roofH + 2, ridge = Math.min(32, w * 0.17);
    c.fillStyle = shade(style.roof, -0.32);
    c.beginPath();
    c.moveTo(rx - 4, rb - 3);
    c.quadraticCurveTo(rx + 9, rb + 5, w / 2, rb + 7);
    c.quadraticCurveTo(rx + rw - 9, rb + 5, rx + rw + 4, rb - 3);
    c.lineTo(rx + rw, rb + 7);
    c.quadraticCurveTo(w / 2, rb + 17, rx, rb + 7);
    c.closePath();
    c.fill();

    c.save();
    c.beginPath();
    c.moveTo(rx - 4, rb - 5);
    c.quadraticCurveTo(rx + 16, rb - 2, rx + 24, rb - 15);
    c.quadraticCurveTo(rx + ridge + 4, ry + 25, rx + ridge, ry + 4);
    c.quadraticCurveTo(w / 2, ry - 2, rx + rw - ridge, ry + 4);
    c.quadraticCurveTo(rx + rw - ridge - 4, ry + 25, rx + rw - 24, rb - 15);
    c.quadraticCurveTo(rx + rw - 16, rb - 2, rx + rw + 4, rb - 5);
    c.quadraticCurveTo(w / 2, rb + 10, rx - 4, rb - 5);
    c.closePath();
    c.clip();

    const rg = c.createLinearGradient(0, ry, w * 0.25, rb);
    rg.addColorStop(0, shade(style.roof, 0.26));
    rg.addColorStop(0.52, style.roof);
    rg.addColorStop(1, shade(style.roof, -0.18));
    c.fillStyle = rg;
    c.fillRect(rx - 5, ry - 3, rw + 10, rb - ry + 16);

    const rows = Math.max(4, Math.ceil((rb - ry) / 9.5));
    for (let row = 0; row <= rows; row++) {
      const yy = ry + 6 + row * 9.5, offset = (row % 2) * 5;
      c.strokeStyle = 'rgba(20,45,42,.32)';
      c.lineWidth = 0.9;
      c.beginPath(); c.moveTo(rx, yy); c.quadraticCurveTo(w / 2, yy + 5, rx + rw, yy); c.stroke();
      c.strokeStyle = 'rgba(215,240,210,.26)';
      c.beginPath(); c.moveTo(rx, yy + 1.2); c.quadraticCurveTo(w / 2, yy + 6.2, rx + rw, yy + 1.2); c.stroke();
      c.strokeStyle = 'rgba(20,45,42,.22)';
      c.lineWidth = 0.7;
      c.beginPath();
      for (let xx = rx + offset; xx < rx + rw; xx += 9.5) {
        c.moveTo(xx, yy + 1);
        c.lineTo(xx - (xx - w / 2) * 0.007, yy + 9.5);
      }
      c.stroke();
    }
    c.restore();

    // Eave trim & main ridge beam with upturned horn finials (鸱吻)
    c.strokeStyle = style.ridge;
    c.lineWidth = 1.9;
    c.beginPath(); c.moveTo(rx - 4, rb - 5); c.quadraticCurveTo(w / 2, rb + 10, rx + rw + 4, rb - 5); c.stroke();
    c.strokeStyle = style.ridge;
    c.lineWidth = 3.2;
    c.lineCap = 'round';
    c.beginPath(); c.moveTo(rx + ridge - 2, ry + 3); c.quadraticCurveTo(w / 2, ry - 2, rx + rw - ridge + 2, ry + 3); c.stroke();
    c.strokeStyle = '#f5e2ad';
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(rx + ridge - 4, ry + 3); c.quadraticCurveTo(rx + ridge - 11, ry - 1, rx + ridge - 13, ry - 6);
    c.moveTo(rx + rw - ridge + 4, ry + 3); c.quadraticCurveTo(rx + rw - ridge + 11, ry - 1, rx + rw - ridge + 13, ry - 6);
    c.stroke();

    // 6. Family-Specific Roof Superstructures & Upgrade Tiers (Lv.1 / Lv.2 / Lv.3+)
    const hasUpperTier = lv >= 2 || b.type === 'main_hall' || b.type === 'scripture' || b.type === 'tower';
    if (hasUpperTier) {
      const sw = rw * (b.type === 'tower' ? 0.62 : b.type === 'scripture' ? 0.52 : 0.46);
      const sx = w / 2 - sw / 2, sy = ry - 14;
      // Clerestory wall under upper eave
      c.fillStyle = shade(style.wall, -0.05);
      c.fillRect(sx + 8, sy + 9, sw - 16, 7);
      c.strokeStyle = style.wood;
      c.lineWidth = 1;
      c.strokeRect(sx + 8, sy + 9, sw - 16, 7);
      // Upper roof eave
      c.fillStyle = shade(style.roof, -0.10);
      c.beginPath();
      c.moveTo(sx - 8, sy + 13);
      c.quadraticCurveTo(sx + 6, sy + 10, sx + 10, sy + 2);
      c.lineTo(sx + sw - 10, sy + 2);
      c.quadraticCurveTo(sx + sw - 6, sy + 10, sx + sw + 8, sy + 13);
      c.quadraticCurveTo(w / 2, sy + 19, sx - 8, sy + 13);
      c.fill();
      c.strokeStyle = style.ridge;
      c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(sx - 8, sy + 13); c.quadraticCurveTo(w / 2, sy + 18, sx + sw + 8, sy + 13); c.stroke();
      c.fillStyle = style.ridge;
      c.fillRect(sx + 9, sy, sw - 18, 3);
    }

    // Alchemy Hall bronze gourd cupola (丹炉顶)
    if (b.type === 'alchemy') {
      const topY = hasUpperTier ? ry - 16 : ry - 2;
      c.fillStyle = '#d4a238';
      c.beginPath(); c.arc(w / 2, topY - 3, 5.2, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(w / 2, topY - 9.5, 3.4, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#fff0b3'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(w / 2, topY - 13); c.lineTo(w / 2, topY - 16); c.stroke();
    } else if (lv >= 3 || tierStage >= 2 || b.type === 'main_hall' || b.type === 'shrine') {
      // Imperial / Level-3+ Finial Orb & Flame Spire (宝顶)
      const topY = hasUpperTier ? ry - 17 : ry - 3;
      c.fillStyle = '#f5d77f';
      c.beginPath(); c.arc(w / 2, topY, 4.2, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fff6cc';
      c.beginPath(); c.moveTo(w / 2 - 2, topY - 2); c.lineTo(w / 2, topY - 9); c.lineTo(w / 2 + 2, topY - 2); c.closePath(); c.fill();
    }

    // 7. Patch v4.1.0 [Pillar 3]: 3-Tier Architectural Evolution & 8-Peak Sanctuary Iconic Superstructures
    if (tierStage === 1) {
      // Stage 1 (Lv.1-2): Rustic timber cross-braces & simple terracotta coping
      c.strokeStyle = 'rgba(92,64,40,0.45)';
      c.lineWidth = 1.0;
      c.beginPath();
      c.moveTo(0, h - 4); c.lineTo(w, h - 4);
      c.stroke();
    } if (tierStage >= 2) {
      // Stage 2 (Lv.3-4): Vermilion Dou-Gong bracket frieze, swallowtail flying eave horns & carved granite balustrade
      c.fillStyle = '#b8332a';
      for (let bx = 6; bx < w - 6; bx += 14) {
        c.fillRect(bx, wallTop - 1, 8, 3.2);
        c.fillStyle = '#f0cf68';
        c.fillRect(bx + 2, wallTop, 4, 1.4);
        c.fillStyle = '#b8332a';
      }
      // Upturned swallowtail flying eaves (飞檐)
      c.strokeStyle = style.ridge;
      c.lineWidth = 2.0;
      c.beginPath();
      c.moveTo(rx - 4, rb - 5); c.quadraticCurveTo(rx - 12, rb - 11, rx - 15, rb - 18);
      c.moveTo(rx + rw + 4, rb - 5); c.quadraticCurveTo(rx + rw + 12, rb - 11, rx + rw + 15, rb - 18);
      c.stroke();
    } if (tierStage >= 3) {
      // Stage 3 (Lv.5+): Celestial Immortality Architecture (วิมานเซียนอมตะ)
      // White-jade stepped foundation & Dan-Chi imperial dragon stairway (丹墀)
      const dx = (b.door.x - b.x) * TS;
      c.fillStyle = '#f4f1ea';
      c.fillRect(-6, h - 6, w + 12, 5);
      c.fillStyle = '#e2ece9';
      c.fillRect(dx - 14, h - 2, 44, 10);
      c.strokeStyle = '#d4af37';
      c.lineWidth = 1.1;
      c.strokeRect(dx - 12, h - 1, 40, 8);

      // Jade-and-Gold Dragon-Coiled Columns (盘龙玉柱)
      for (let i = 0; i <= cols; i++) {
        const px = i * (w - 5) / cols;
        c.strokeStyle = '#ffd54f';
        c.lineWidth = 1.1;
        c.beginPath();
        c.moveTo(px, h - 8);
        c.quadraticCurveTo(px + 6, wallTop + wallH * 0.6, px, wallTop + wallH * 0.35);
        c.quadraticCurveTo(px + 6, wallTop + wallH * 0.15, px + 2, wallTop + 2);
        c.stroke();
      }

      // Third Celestial Crown Roof Tier (重檐仙阁)
      const cw = rw * 0.32, cx0 = w / 2 - cw / 2, cy0 = ry - 26;
      c.fillStyle = shade(style.roof, 0.15);
      c.beginPath();
      c.moveTo(cx0 - 6, cy0 + 11);
      c.quadraticCurveTo(w / 2, cy0 - 3, cx0 + cw + 6, cy0 + 11);
      c.quadraticCurveTo(w / 2, cy0 + 16, cx0 - 6, cy0 + 11);
      c.fill();
      c.strokeStyle = '#ffd740';
      c.lineWidth = 1.6;
      c.stroke();

      // Floating Golden Dao Runes & Celestial Halo around roof crest (符文瑞气)
      c.strokeStyle = 'rgba(255,215,64,0.75)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.arc(w / 2, cy0 - 2, 11, 0, Math.PI * 2);
      c.stroke();
      for (let ri = -2; ri <= 2; ri++) {
        if (ri === 0) continue;
        c.fillStyle = '#ffe57f';
        c.fillRect(w / 2 + ri * 14 - 1.5, cy0 + Math.abs(ri) * 3, 3, 4.5);
      }
    }

    // 8. Iconic Motifs for the 8 Peak Sanctuaries
    const topCrestY = hasUpperTier ? ry - 18 : ry - 4;
    if (b.type === 'peak_sword') {
      // Giant Stone Sword Monument (巨剑碑)
      c.fillStyle = '#b0bec5';
      c.beginPath();
      c.moveTo(w / 2 - 4, topCrestY + 4);
      c.lineTo(w / 2, topCrestY - 22);
      c.lineTo(w / 2 + 4, topCrestY + 4);
      c.closePath();
      c.fill();
      c.strokeStyle = '#00e5ff';
      c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(w / 2 - 8, topCrestY - 2); c.lineTo(w / 2 + 8, topCrestY - 2); c.stroke();
    } else if (b.type === 'peak_body') {
      // Twin Bronze Vajra Pillars (金刚杵柱)
      for (const side of [10, w - 16]) {
        c.fillStyle = '#ffb703';
        c.fillRect(side, wallTop - 6, 6, wallH + 6);
        c.beginPath(); c.arc(side + 3, wallTop - 8, 4.5, 0, Math.PI * 2); c.fill();
      }
    } else if (b.type === 'peak_chaos') {
      // Crimson Soul Lanterns (魂灯) & Blood Crescent
      for (const side of [rx + 6, rx + rw - 6]) {
        c.fillStyle = '#ff1744';
        c.beginPath(); c.ellipse(side, rb + 5, 3.5, 4.8, 0, 0, Math.PI * 2); c.fill();
      }
      c.strokeStyle = '#ff4d6d'; c.lineWidth = 1.8;
      c.beginPath(); c.arc(w / 2, topCrestY - 6, 6, 0.4, Math.PI * 1.6); c.stroke();
    } else if (b.type === 'peak_alchemy') {
      // Giant Pill Cauldron Chimneys (天地丹炉)
      c.fillStyle = '#d4a238';
      c.beginPath(); c.arc(w / 2, topCrestY - 5, 7, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#52b788';
      c.beginPath(); c.ellipse(w / 2, topCrestY - 9, 5, 2.2, 0, 0, Math.PI * 2); c.fill();
    } else if (b.type === 'peak_magic') {
      // Samsara Mirror Ring (轮回宝镜)
      c.strokeStyle = '#e0aaff'; c.lineWidth = 1.8;
      c.beginPath(); c.arc(w / 2, topCrestY - 7, 7.5, 0, Math.PI * 2); c.stroke();
      c.fillStyle = '#c77dff';
      c.beginPath(); c.arc(w / 2, topCrestY - 7, 3.5, 0, Math.PI * 2); c.fill();
    } else if (b.type === 'peak_array') {
      // Astral Cogwheel & Armillary Ring (浑天星轮)
      c.strokeStyle = '#ffd166'; c.lineWidth = 1.6;
      c.beginPath(); c.arc(w / 2, topCrestY - 7, 8, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.ellipse(w / 2, topCrestY - 7, 10, 4, 0.4, 0, Math.PI * 2); c.stroke();
    } else if (b.type === 'peak_scholar') {
      // Scholarly Jade Scroll & Chess Pavilion Crest
      c.fillStyle = '#fefae0';
      c.fillRect(w / 2 - 9, topCrestY - 7, 18, 5);
      c.strokeStyle = '#2a9d8f'; c.lineWidth = 1.2;
      c.strokeRect(w / 2 - 9, topCrestY - 7, 18, 5);
    } else if (b.type === 'peak_beast') {
      // Primal Totem Horns & Dragon-Bone Ridge (万兽龙骨脊)
      c.strokeStyle = '#f4e1c1'; c.lineWidth = 2.0;
      c.beginPath();
      c.moveTo(w / 2 - 12, topCrestY + 2); c.quadraticCurveTo(w / 2 - 16, topCrestY - 12, w / 2 - 6, topCrestY - 14);
      c.moveTo(w / 2 + 12, topCrestY + 2); c.quadraticCurveTo(w / 2 + 16, topCrestY - 12, w / 2 + 6, topCrestY - 14);
      c.stroke();
    }

    return cv;
  }
  R.buildBuildingSprite = buildBuildingSprite;

  /* ---------- Pre-rendered Light Halo Sprite for Fast Night Rendering ---------- */
  function createLightSprite(rCol, gCol, bCol) {
    const sz = 128, cv = newCanvas(sz, sz), c = cv.getContext('2d');
    const gr = c.createRadialGradient(sz / 2, sz / 2, 2, sz / 2, sz / 2, sz / 2);
    gr.addColorStop(0, `rgba(${rCol},${gCol},${bCol},0.85)`);
    gr.addColorStop(0.45, `rgba(${rCol},${gCol},${bCol},0.32)`);
    gr.addColorStop(1, `rgba(${rCol},${gCol},${bCol},0)`);
    c.fillStyle = gr;
    c.fillRect(0, 0, sz, sz);
    return cv;
  }

  /* ---------- Patch v4.1.0 [Pillar 2, 4 & 5]: Sun Shadows, Peak Mist, Leylines & 5-Element Barrier Dome ---------- */
  R.computeSunShadow = function (tMinutes) {
    const hr = (((Number(tMinutes) || 0) % 1440) + 1440) % 1440 / 60;
    let offsetX = 0, offsetY = 4, alpha = 0.22;
    if (hr >= 6 && hr <= 10) {
      offsetX = -12;
      offsetY = 6;
    } else if (hr > 10 && hr < 11) {
      const u = hr - 10;
      offsetX = -12 * (1 - u);
      offsetY = 6 - 2 * u;
    } else if (hr >= 11 && hr <= 13) {
      offsetX = 0;
      offsetY = 4;
    } else if (hr > 13 && hr < 15) {
      const u = (hr - 13) / 2;
      offsetX = 14 * u;
      offsetY = 4 + 2 * u;
    } else if (hr >= 15 && hr <= 18) {
      offsetX = 14;
      offsetY = 6;
    } else {
      offsetX = hr < 6 ? -8 : 8;
      offsetY = 5;
      alpha = 0.14;
    }
    return {
      hour: hr,
      offsetX,
      offsetY,
      alpha,
      fillStyle: 'rgba(20,38,30,.22)'
    };
  };

  R.BARRIER_COLORS = Object.freeze({
    METAL: '#f1c40f',
    EARTH_METAL: '#f1c40f',
    WOOD: '#2ecc71',
    WOOD_LIFE: '#2ecc71',
    WATER: '#3498db',
    WATER_ICE: '#3498db',
    FIRE: '#e74c3c',
    LIGHTNING: '#e74c3c',
    EARTH: '#e67e22',
    ทอง: '#f1c40f',
    ไม้: '#2ecc71',
    น้ำ: '#3498db',
    ไฟ: '#e74c3c',
    ดิน: '#e67e22'
  });

  R.resolveBarrierColor = function (WOrEl) {
    if (typeof WOrEl === 'string') {
      return R.BARRIER_COLORS[WOrEl] || R.BARRIER_COLORS[WOrEl.toUpperCase()] || '#f1c40f';
    }
    const S = WOrEl && WOrEl.sect ? WOrEl.sect : WOrEl;
    const el = (S && (S.barrierElement || (S.elementalBarrier && S.elementalBarrier.element))) || 'EARTH_METAL';
    return R.BARRIER_COLORS[el] || R.BARRIER_COLORS[String(el).toUpperCase()] || '#f1c40f';
  };

  R.drawPeakMist = function (ctx, peakArea, alpha, timeSec) {
    if (!ctx || !peakArea) return false;
    const a = alpha == null ? 1.0 : clamp(alpha, 0, 1);
    if (a <= 0.01) return false;
    const x = (peakArea.x || 0) * TS, y = (peakArea.y || 0) * TS;
    const w = (peakArea.w || 14) * TS, h = ((peakArea.h || 8) + (peakArea.yard || 2)) * TS;
    const cx = x + w / 2, cy = y + h / 2;
    const t = Number(timeSec) || 0;

    ctx.save();
    ctx.globalAlpha = a;
    // Layered mountain crag silhouette & dense azure-white primordial qi mist
    ctx.fillStyle = 'rgba(42,68,78,0.52)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.72, h * 0.68, 0, 0, Math.PI * 2);
    ctx.fill();

    const puffs = [
      [-0.32, -0.18, 0.46, 0.34],
      [0.28, -0.14, 0.44, 0.32],
      [-0.18, 0.20, 0.48, 0.35],
      [0.24, 0.22, 0.45, 0.33],
      [0, 0, 0.56, 0.42]
    ];
    for (let i = 0; i < puffs.length; i++) {
      const pf = puffs[i];
      const drift = Math.sin(t * 0.9 + i * 1.4) * 6;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(218,242,252,0.78)' : 'rgba(182,224,242,0.72)';
      ctx.beginPath();
      ctx.ellipse(cx + pf[0] * w + drift, cy + pf[1] * h, pf[2] * w, pf[3] * h, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(130,210,235,0.55)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.62, h * 0.52, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (peakArea.nameTh) {
      ctx.font = '600 10px ' + FONT;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(18,38,46,0.85)';
      ctx.fillRect(cx - 72, cy - 8, 144, 16);
      ctx.fillStyle = '#e0f7fa';
      ctx.fillText('🌫️ ' + peakArea.nameTh + ' (หมอกปราณปิดกั้น)', cx, cy + 4);
    }
    ctx.restore();
    return true;
  };


  /* ---------- Patch v5.0.0 [Era 5: Grand Celestial Visual Overhaul — 6 Visual Pillars] ---------- */
  R.ERA5_VERSION = '5.0.0-celestial-visual-overhaul';

  // Pillar 1A: 9-Stage Realm Halo & Immortal Ascension Visual Tiers
  R.REALM_VISUAL_TIERS = Object.freeze({
    1: { stage: 1, tierGroup: 'QI_REFINING', nameTh: 'หลอมปราณ', haloType: 'breath_ring', color: '#80deea', secondary: '#e0f7fa', radius: 6.5, silkRibbon: false },
    2: { stage: 2, tierGroup: 'FOUNDATION', nameTh: 'สร้างรากฐาน', haloType: 'foundation_ring', color: '#4dd0e1', secondary: '#b2ebf2', radius: 7.5, silkRibbon: false },
    3: { stage: 3, tierGroup: 'CORE_FORMATION', nameTh: 'ก่อแก่นศักดิ์สิทธิ์', haloType: 'golden_core', color: '#ffd54f', secondary: '#ffecb3', radius: 8.5, silkRibbon: false },
    4: { stage: 4, tierGroup: 'GOLDEN_CORE', nameTh: 'จินตานทองคำ', haloType: 'golden_core_dual', color: '#ffb300', secondary: '#fff8e1', radius: 9.2, silkRibbon: false },
    5: { stage: 5, tierGroup: 'NASCENT_SOUL', nameTh: 'หยวนอิง (ทารกวิญญาณ)', haloType: 'trigram_halo', color: '#ba68c8', secondary: '#f3e5f5', radius: 10.2, silkRibbon: false },
    6: { stage: 6, tierGroup: 'SPIRIT_SEVERING', nameTh: 'แปรเปลี่ยนวิญญาณ', haloType: 'lotus_wheel', color: '#ab47bc', secondary: '#e1bee7', radius: 11.0, silkRibbon: false },
    7: { stage: 7, tierGroup: 'VOID_REFINING', nameTh: 'หลอมความว่างเปล่า', haloType: 'celestial_mandala', color: '#00e5ff', secondary: '#ffd740', radius: 12.0, silkRibbon: true },
    8: { stage: 8, tierGroup: 'MAHAYANA', nameTh: 'มหายานบรรพกาล', haloType: 'mahayana_crown', color: '#ffd740', secondary: '#ff4081', radius: 13.0, silkRibbon: true },
    9: { stage: 9, tierGroup: 'TRUE_IMMORTAL', nameTh: 'เซียนแท้จริงจุติ', haloType: 'immortal_divine_wheel', color: '#fff59d', secondary: '#00f5d4', radius: 14.2, silkRibbon: true }
  });

  // Pillar 1B & JS2-v2.5.0: Complete 43 Grand Dao Path Visual Signatures + Legacy 12 Aliases
  R.LEGACY_PATH_VISUAL_SIGNATURES = Object.freeze({
    SWORD:     { id: 'SWORD',     nameTh: 'วิถีกระบี่',     moteShape: 'jade_sword_feather',   apexCrownShape: 'taiji_sword_lotus',        family: 'BLADE_SWORD',     primary: '#4fc3f7', secondary: '#e1f5fe', accent: '#ffd166', maxStage: 9 },
    BODY:      { id: 'BODY',      nameTh: 'วิถีกายา',      moteShape: 'vajra_hex_plate',      apexCrownShape: 'vajra_blood_pillar',       family: 'BODY_FORTRESS',   primary: '#e07d5b', secondary: '#ffd166', accent: '#ff6f00', maxStage: 5 },
    MAGIC:     { id: 'MAGIC',     nameTh: 'วิถีเวทธาตุ',    moteShape: 'element_sparks',       apexCrownShape: 'elemental_storm_eye',      family: 'WEATHER_NATURE',  primary: '#ce93d8', secondary: '#7c4dff', accent: '#00f5d4', maxStage: 8 },
    ARRAY:     { id: 'ARRAY',     nameTh: 'วิถีค่ายกล',     moteShape: 'talisman_slip_bagua',  apexCrownShape: 'bagua_eight_gates',        family: 'ARRAY_GEOMANCY',  primary: '#ffd54f', secondary: '#fff9c4', accent: '#64c3ce', maxStage: 8 },
    PILL:      { id: 'PILL',      nameTh: 'วิถีโอสถ',      moteShape: 'jade_needle_dew',      apexCrownShape: 'shennong_gourd_canopy',    family: 'LIFE_ALCHEMY',    primary: '#66bb6a', secondary: '#b9f6ca', accent: '#ffd166', maxStage: 8 },
    TALISMAN:  { id: 'TALISMAN',  nameTh: 'วิถีอักขระยันต์', moteShape: 'talisman_slip_bagua',  apexCrownShape: 'bagua_eight_gates',        family: 'ARRAY_GEOMANCY',  primary: '#ffca28', secondary: '#ef5350', accent: '#64c3ce', maxStage: 8 },
    SOUL:      { id: 'SOUL',      nameTh: 'วิถีวิญญาณ',    moteShape: 'zen_mirror_petal',     apexCrownShape: 'bodhi_mind_mirror',        family: 'MIND_DHARMA',     primary: '#80cbc4', secondary: '#b388ff', accent: '#ffffff', maxStage: 9 },
    BEAST:     { id: 'BEAST',     nameTh: 'วิถีอสูร',      moteShape: 'primal_claw_fang',     apexCrownShape: 'four_symbols_totem',       family: 'BEAST_TOTEM',     primary: '#a1887f', secondary: '#ffcc80', accent: '#51cf66', maxStage: 8 },
    SOUND:     { id: 'SOUND',     nameTh: 'วิถีดนตรีปราณ',  moteShape: 'qin_ripple_wave',      apexCrownShape: 'nine_heavens_zither',      family: 'SONIC_LITERATI',  primary: '#80deea', secondary: '#f48fb1', accent: '#ffd166', maxStage: 8 },
    PUPPET:    { id: 'PUPPET',    nameTh: 'วิถีเชิดหุ่น',   moteShape: 'clockwork_cog',        apexCrownShape: 'clockwork_golem_Halo',     family: 'MECH_PUPPETRY',   primary: '#b0bec5', secondary: '#ea80fc', accent: '#ffb703', maxStage: 8 },
    POISON:    { id: 'POISON',    nameTh: 'วิถีพิษกู่',     moteShape: 'gu_centipede_spore',   apexCrownShape: 'myriad_gu_mandala',        family: 'SHADOW_VENOM',    primary: '#9ccc65', secondary: '#ab47bc', accent: '#00f5d4', maxStage: 8 },
    DIVINE:    { id: 'DIVINE',    nameTh: 'วิถีเทวะชะตา',   moteShape: 'faith_incense_lamp',   apexCrownShape: 'divine_pantheon_shrine',   family: 'DIVINE_PANTHEON', primary: '#ffe082', secondary: '#ffffff', accent: '#ff6d00', maxStage: 4 }
  });

  R.PATH_VISUAL_SIGNATURES = Object.freeze({
    XIAN:                 { id: 'XIAN',                 nameTh: 'วิถีเซียน',              moteShape: 'jade_sword_feather',     apexCrownShape: 'taiji_sword_lotus',          family: 'BLADE_SWORD',     primary: '#5ab4d8', secondary: '#e0f7fa', accent: '#ffd166', maxStage: 9 },
    BODY:                 { id: 'BODY',                 nameTh: 'วิถีกายา',              moteShape: 'vajra_hex_plate',        apexCrownShape: 'vajra_blood_pillar',         family: 'BODY_FORTRESS',   primary: '#e07d5b', secondary: '#ffd166', accent: '#ff5252', maxStage: 5 },
    GOD:                  { id: 'GOD',                  nameTh: 'วิถีเทพ',               moteShape: 'faith_incense_lamp',     apexCrownShape: 'divine_pantheon_shrine',     family: 'DIVINE_PANTHEON', primary: '#e6c055', secondary: '#fff8e1', accent: '#ff9e00', maxStage: 4 },
    DEMON:                { id: 'DEMON',                nameTh: 'วิถีมารอสูร',            moteShape: 'blood_crescent_horn',    apexCrownShape: 'eclipse_demon_throne',       family: 'ABYSS_DEMON',     primary: '#b28cd9', secondary: '#ef233c', accent: '#ff758f', maxStage: 9 },
    HEART_SOUL:           { id: 'HEART_SOUL',           nameTh: 'วิถีจิตวิญญาณ',          moteShape: 'zen_mirror_petal',       apexCrownShape: 'bodhi_mind_mirror',          family: 'MIND_DHARMA',     primary: '#8ec8d0', secondary: '#f3e5f5', accent: '#00f5d4', maxStage: 9 },
    MECH_PUPPET:          { id: 'MECH_PUPPET',          nameTh: 'วิถีกลจักรเชิดหุ่น',      moteShape: 'clockwork_cog',          apexCrownShape: 'clockwork_golem_halo',       family: 'MECH_PUPPETRY',   primary: '#8ecae6', secondary: '#d9a97c', accent: '#ffb703', maxStage: 8 },
    KARMA_SAMSARA:        { id: 'KARMA_SAMSARA',        nameTh: 'วิถีกรรมวัฏ',            moteShape: 'red_fate_knot',          apexCrownShape: 'six_paths_samsara_wheel',    family: 'MIND_DHARMA',     primary: '#b5838d', secondary: '#fcc419', accent: '#ff4d6d', maxStage: 8 },
    BEAST_SOVEREIGN:      { id: 'BEAST_SOVEREIGN',      nameTh: 'วิถีราชันย์อสูร',         moteShape: 'primal_claw_fang',       apexCrownShape: 'four_symbols_totem',         family: 'BEAST_TOTEM',     primary: '#e09f3e', secondary: '#51cf66', accent: '#ff6b6b', maxStage: 8 },
    SAGE_SUPPORT:         { id: 'SAGE_SUPPORT',         nameTh: 'วิถีปราชญ์หนุนนำ',        moteShape: 'jade_needle_dew',        apexCrownShape: 'shennong_gourd_canopy',      family: 'LIFE_ALCHEMY',    primary: '#76c893', secondary: '#b9f6ca', accent: '#ffd166', maxStage: 8 },
    CRAFT_CREATION:       { id: 'CRAFT_CREATION',       nameTh: 'วิถีรังสรรค์ศาสตรา',      moteShape: 'crucible_flame_hammer',  apexCrownShape: 'nine_dragon_cauldron',       family: 'LIFE_ALCHEMY',    primary: '#f4a261', secondary: '#ffd166', accent: '#ff4d00', maxStage: 8 },
    ARRAY_TALISMAN:       { id: 'ARRAY_TALISMAN',       nameTh: 'วิถีค่ายกลยันต์',         moteShape: 'talisman_slip_bagua',    apexCrownShape: 'bagua_eight_gates',          family: 'ARRAY_GEOMANCY',  primary: '#64c3ce', secondary: '#ffd54f', accent: '#ef5350', maxStage: 8 },
    STRATEGY_GOVERNANCE:  { id: 'STRATEGY_GOVERNANCE',  nameTh: 'วิถีพิชัยอภิบาล',        moteShape: 'command_pennant_seal',   apexCrownShape: 'imperial_war_chariot_flags', family: 'COMMAND_MARTIAL', primary: '#d4bb78', secondary: '#fff3b0', accent: '#e63946', maxStage: 8 },
    ASTRO_DIVINATION:     { id: 'ASTRO_DIVINATION',     nameTh: 'วิถีโหราดวงดาว',         moteShape: 'astrolabe_star_cross',   apexCrownShape: 'big_dipper_armillary',       family: 'COSMIC_TIME',     primary: '#74c0fc', secondary: '#e0fbfc', accent: '#ffd166', maxStage: 8 },
    BUDDHA_DHARMA:        { id: 'BUDDHA_DHARMA',        nameTh: 'วิถีพุทธธรรม',           moteShape: 'dharma_swastika_lotus',  apexCrownShape: 'thousand_palm_arhat_halo',   family: 'MIND_DHARMA',     primary: '#fcc419', secondary: '#fff9db', accent: '#ff9e00', maxStage: 8 },
    VOID_SPACE:           { id: 'VOID_SPACE',           nameTh: 'วิถีสุญญตามิติ',         moteShape: 'spatial_prism_shard',    apexCrownShape: 'dimensional_void_tesseract', family: 'COSMIC_TIME',     primary: '#9775fa', secondary: '#4cc9f0', accent: '#ffffff', maxStage: 8 },
    SONIC_HARMONY:        { id: 'SONIC_HARMONY',        nameTh: 'วิถีเสียงประสาน',        moteShape: 'qin_ripple_wave',        apexCrownShape: 'nine_heavens_zither',        family: 'SONIC_LITERATI',  primary: '#63e6be', secondary: '#f48fb1', accent: '#ffd166', maxStage: 8 },
    VENOM_GU:             { id: 'VENOM_GU',             nameTh: 'วิถีพิษกู่โบราณ',         moteShape: 'gu_centipede_spore',     apexCrownShape: 'myriad_gu_mandala',          family: 'SHADOW_VENOM',    primary: '#a9e34b', secondary: '#ab47bc', accent: '#00f5d4', maxStage: 8 },
    PRIMORDIAL_SHIFTER:   { id: 'PRIMORDIAL_SHIFTER',   nameTh: 'วิถีแปลงกายบรรพกาล',     moteShape: 'dragon_scale_feather',   apexCrownShape: 'primordial_chimera_wings',   family: 'BEAST_TOTEM',     primary: '#ff8787', secondary: '#ff7b00', accent: '#ffd166', maxStage: 8 },
    CELESTIAL_WEATHER:    { id: 'CELESTIAL_WEATHER',    nameTh: 'วิถีเทวอากาศ',           moteShape: 'thunder_cloud_snow',     apexCrownShape: 'four_seasons_storm_crown',   family: 'WEATHER_NATURE',  primary: '#4dabf7', secondary: '#ffd166', accent: '#c77dff', maxStage: 8 },
    WANDERING_DAO:        { id: 'WANDERING_DAO',        nameTh: 'วิถีจาริกพิภพ',          moteShape: 'wind_leaf_compass',      apexCrownShape: 'horizon_compass_cloud',      family: 'WEATHER_NATURE',  primary: '#69db7c', secondary: '#e9ecef', accent: '#4cc9f0', maxStage: 8 },
    MERCANTILE_DAO:       { id: 'MERCANTILE_DAO',       nameTh: 'วิถีพาณิชย์มรรคา',        moteShape: 'ancient_coin_ingot',     apexCrownShape: 'celestial_scales_coin_ring', family: 'FORTUNE_TRADE',   primary: '#ffd43b', secondary: '#f4a261', accent: '#ffffff', maxStage: 8 },
    DRAGON_VEIN_GEOMANCY: { id: 'DRAGON_VEIN_GEOMANCY', nameTh: 'วิถีมังกรธรณี',          moteShape: 'luopan_jade_pillar',     apexCrownShape: 'earth_dragon_luopan',        family: 'ARRAY_GEOMANCY',  primary: '#d9a97c', secondary: '#52b788', accent: '#ffd166', maxStage: 8 },
    GRAVITY_DAO:          { id: 'GRAVITY_DAO',          nameTh: 'วิถีแรงโน้มถ่วง',        moteShape: 'singularity_orbit_rock', apexCrownShape: 'trinary_gravity_rings',      family: 'COSMIC_TIME',     primary: '#845ef7', secondary: '#adb5bd', accent: '#4cc9f0', maxStage: 8 },
    CHRONO_EPOCH:         { id: 'CHRONO_EPOCH',         nameTh: 'วิถีกาลเวลา',            moteShape: 'hourglass_pendulum',     apexCrownShape: 'twelve_epoch_sundial',       family: 'COSMIC_TIME',     primary: '#e599f7', secondary: '#ffd60a', accent: '#e0fbfc', maxStage: 8 },
    INK_LITERATI:         { id: 'INK_LITERATI',         nameTh: 'วิถีอักษรปราชญ์',         moteShape: 'calligraphy_ink_stroke', apexCrownShape: 'imperial_scroll_brush',      family: 'SONIC_LITERATI',  primary: '#adb5bd', secondary: '#212529', accent: '#ffd166', maxStage: 8 },
    SOUL_PUPPETRY:        { id: 'SOUL_PUPPETRY',        nameTh: 'วิถีเชิดเงาวิญญาณ',      moteShape: 'shadow_marionette_cross',apexCrownShape: 'nine_shadow_marionette_beam',family: 'MECH_PUPPETRY',   primary: '#da77f2', secondary: '#495057', accent: '#00f5d4', maxStage: 8 },
    PRIMORDIAL_CHAOS:     { id: 'PRIMORDIAL_CHAOS',     nameTh: 'วิถีโกลาหลต้นกำเนิด',     moteShape: 'chaos_swirl_seed',       apexCrownShape: 'hundun_chaos_millstone',     family: 'COSMIC_TIME',     primary: '#ff6b6b', secondary: '#e0aaff', accent: '#ffd166', maxStage: 8 },
    SHADOW_SAMURAI:       { id: 'SHADOW_SAMURAI',       nameTh: 'วิถีซามูไรไร้เงา',        moteShape: 'katana_crescent_sakura', apexCrownShape: 'crimson_moon_iaijutsu',      family: 'BLADE_SWORD',     primary: '#e63946', secondary: '#f8f9fa', accent: '#ffd166', maxStage: 8 },
    NINPO_SHADOW:         { id: 'NINPO_SHADOW',         nameTh: 'วิถีนินจาเร้นเงา',        moteShape: 'shuriken_four_star',     apexCrownShape: 'shinobi_mirage_shuriken',    family: 'SHADOW_VENOM',    primary: '#4a4e69', secondary: '#c77dff', accent: '#e0fbfc', maxStage: 8 },
    NINPO_ELEMENTAL:      { id: 'NINPO_ELEMENTAL',      nameTh: 'วิถีนินจาคาถาธาตุ',       moteShape: 'explosive_kuji_tag',     apexCrownShape: 'five_chakra_magatama_drums', family: 'WEATHER_NATURE',  primary: '#f77f00', secondary: '#ffbe0b', accent: '#00f5d4', maxStage: 8 },
    DIVINE_SUMMONER:      { id: 'DIVINE_SUMMONER',      nameTh: 'วิถีอัญเชิญเทวะ',         moteShape: 'pantheon_pillar_rune',   apexCrownShape: 'five_pantheon_gate',         family: 'DIVINE_PANTHEON', primary: '#ffd166', secondary: '#ffffff', accent: '#4cc9f0', maxStage: 8 },
    DIVINE_POSSESSION:    { id: 'DIVINE_POSSESSION',    nameTh: 'วิถีเทวะสถิตร่าง',        moteShape: 'avatar_third_eye_flame', apexCrownShape: 'deity_avatar_six_arms',      family: 'DIVINE_PANTHEON', primary: '#ff9f1c', secondary: '#ff0055', accent: '#fff8d6', maxStage: 8 },
    DIVINE_CHANNELER:     { id: 'DIVINE_CHANNELER',     nameTh: 'วิถียืมพลังเทวะ',        moteShape: 'heaven_edict_lightning', apexCrownShape: 'celestial_law_conduit',      family: 'DIVINE_PANTHEON', primary: '#4cc9f0', secondary: '#ffd166', accent: '#c77dff', maxStage: 8 },
    VOID_HERETIC_PACT:    { id: 'VOID_HERETIC_PACT',    nameTh: 'วิถีสัญญานอกมิติ',       moteShape: 'eldritch_eye_tentacle',  apexCrownShape: 'outer_god_abyssal_eyes',     family: 'ABYSS_DEMON',     primary: '#7209b7', secondary: '#f72585', accent: '#4cc9f0', maxStage: 8 },
    OCCULT_MAGE:          { id: 'OCCULT_MAGE',          nameTh: 'วิถีจอมขมังเวท',         moteShape: 'sak_yant_takrut',        apexCrownShape: 'nine_spire_sacred_yantra',   family: 'ARRAY_GEOMANCY',  primary: '#d97706', secondary: '#fef08a', accent: '#ef4444', maxStage: 8 },
    DEVOURING_FLESH:      { id: 'DEVOURING_FLESH',      nameTh: 'วิถีกลืนหลอมสรีระ',       moteShape: 'abyss_maw_fang',         apexCrownShape: 'taotie_devouring_maw',       family: 'ABYSS_DEMON',     primary: '#9b2226', secondary: '#ff4d6d', accent: '#ffb703', maxStage: 8 },
    NETHER_GRAVE:         { id: 'NETHER_GRAVE',         nameTh: 'วิถีสุสานยมโลก',         moteShape: 'soul_lantern_bone',      apexCrownShape: 'yellow_springs_grave_gate',  family: 'ABYSS_DEMON',     primary: '#6c757d', secondary: '#48cae4', accent: '#80ffdb', maxStage: 8 },
    ANCESTRAL_RITUAL:     { id: 'ANCESTRAL_RITUAL',     nameTh: 'วิถีพิธีบรรพชน',          moteShape: 'ancestral_tablet_incense',apexCrownShape: 'ancestral_lineage_shrine',   family: 'DIVINE_PANTHEON', primary: '#e9c46a', secondary: '#f4a261', accent: '#ffffff', maxStage: 8 },
    TIDE_VOYAGER:         { id: 'TIDE_VOYAGER',         nameTh: 'วิถีนาวิกสมุทร',         moteShape: 'cresting_wave_ice',      apexCrownShape: 'nine_seas_maelstrom_trident',family: 'WEATHER_NATURE',  primary: '#0077b6', secondary: '#90e0ef', accent: '#00f5d4', maxStage: 8 },
    LORE_ARCHIVIST:       { id: 'LORE_ARCHIVIST',       nameTh: 'วิถีอาลักษณ์หอคัมภีร์',    moteShape: 'bamboo_slip_glyph',      apexCrownShape: 'myriad_canon_archive_wheel', family: 'SONIC_LITERATI',  primary: '#8ecae6', secondary: '#ffd166', accent: '#ffffff', maxStage: 8 },
    FORTUNE_GAMBLER:      { id: 'FORTUNE_GAMBLER',      nameTh: 'วิถีเดิมพันชะตา',         moteShape: 'fate_dice_card',         apexCrownShape: 'heavenly_roulette_dice',     family: 'FORTUNE_TRADE',   primary: '#ffb703', secondary: '#ef476f', accent: '#06d6a0', maxStage: 8 },
    SPIRIT_HUSBANDRY:     { id: 'SPIRIT_HUSBANDRY',     nameTh: 'วิถีเกษตรวิญญาณ',        moteShape: 'sprouting_vine_flower',  apexCrownShape: 'world_tree_canopy_roots',    family: 'LIFE_ALCHEMY',    primary: '#52b788', secondary: '#ffd166', accent: '#b7e4c7', maxStage: 8 },
    ARENA_GLORY:          { id: 'ARENA_GLORY',          nameTh: 'วิถีเกียรติยุทธ์ประลอง',   moteShape: 'champion_laurel_halberd',apexCrownShape: 'gladiator_champion_crown',   family: 'COMMAND_MARTIAL', primary: '#f4a261', secondary: '#e63946', accent: '#ffd166', maxStage: 8 }
  });

  R.resolvePathVisualSignature = pKey => {
    if (pKey && R.PATH_VISUAL_SIGNATURES[pKey]) return R.PATH_VISUAL_SIGNATURES[pKey];
    if (pKey && R.LEGACY_PATH_VISUAL_SIGNATURES[pKey]) return R.LEGACY_PATH_VISUAL_SIGNATURES[pKey];
    return R.PATH_VISUAL_SIGNATURES.XIAN;
  };

  R.resolveCultivationVisualState = n => {
    const c = n && n.cult;
    if (!c) {
      return { rawStage: 0, maxStage: 9, normStage: 0, tierBand: 'MORTAL', isApex: false, isPenultimate: false, isMidTier: false, pathId: 'MORTAL', sig: null };
    }
    const pKey = c.path || 'XIAN';
    const pathDef = (g.CULT && g.CULT.PATHS && g.CULT.PATHS[pKey]) || null;
    const sig = R.resolvePathVisualSignature(pKey);
    const maxStage = (pathDef && pathDef.maxStage) || (sig && sig.maxStage) || 9;
    const rawStage = clamp(c.stage || 1, 1, 9);
    const isApex = rawStage >= maxStage;
    let normStage = rawStage;
    if (pathDef && g.CULT && typeof g.CULT.normalizedStage === 'function') {
      normStage = clamp(Math.round(g.CULT.normalizedStage(n)), 1, 9);
    } else if (maxStage !== 9) {
      normStage = isApex ? 9 : clamp(Math.round(1 + ((rawStage - 1) / Math.max(1, maxStage - 1)) * 8), 1, 9);
    }
    if (isApex) normStage = 9;
    const isPenultimate = !isApex && (rawStage === maxStage - 1 || normStage >= 7);
    const isMidTier = !isApex && !isPenultimate && (normStage >= 4 || rawStage >= Math.ceil(maxStage * 0.5));
    const tierBand = isApex ? 'APEX' : isPenultimate ? 'PENULTIMATE' : isMidTier ? 'MID' : 'INITIATE';
    return { rawStage, maxStage, normStage, tierBand, isApex, isPenultimate, isMidTier, pathId: pKey, sig };
  };

  // Pillar 2A: 12 Elements, Canonical ELEM Keys & 34 Elemental Fusions VFX Palette
  R.ELEMENT_VFX_PALETTE = Object.freeze({
    METAL:       { primary: '#f8f9fa', secondary: '#ffd166', accent: '#90e0ef', style: 'razor_silver' },
    EARTH_METAL: { primary: '#d4a373', secondary: '#ffd166', accent: '#f8f9fa', style: 'razor_silver' },
    WOOD:        { primary: '#52b788', secondary: '#b7e4c7', accent: '#f8c2d8', style: 'vine_blossom' },
    WOOD_LIFE:   { primary: '#52b788', secondary: '#b7e4c7', accent: '#f8c2d8', style: 'vine_blossom' },
    WATER:       { primary: '#00b4d8', secondary: '#90e0ef', accent: '#caf0f8', style: 'tidal_wave' },
    WATER_ICE:   { primary: '#48cae4', secondary: '#90e0ef', accent: '#caf0f8', style: 'frost_crystal' },
    FIRE:        { primary: '#ff4d00', secondary: '#ffb703', accent: '#fff3b0', style: 'lotus_inferno' },
    EARTH:       { primary: '#d4a373', secondary: '#e9c46a', accent: '#ccd5ae', style: 'monolith_amber' },
    WIND:        { primary: '#80ed99', secondary: '#c7f9cc', accent: '#ffffff', style: 'gale_vortex' },
    LIGHTNING:   { primary: '#7209b7', secondary: '#4cc9f0', accent: '#f72585', style: 'thunder_arc' },
    ICE:         { primary: '#48cae4', secondary: '#ade8f4', accent: '#ffffff', style: 'frost_crystal' },
    LIGHT:       { primary: '#ffd60a', secondary: '#ffc300', accent: '#ffffff', style: 'radiant_sun' },
    LIGHT_YANG:  { primary: '#ffd60a', secondary: '#ffc300', accent: '#ffffff', style: 'radiant_sun' },
    DARK:        { primary: '#5a189a', secondary: '#9d4edd', accent: '#ff006e', style: 'abyss_eclipse' },
    YIN_SHADOW:  { primary: '#5a189a', secondary: '#9d4edd', accent: '#ff006e', style: 'abyss_eclipse' },
    DARK_YIN:    { primary: '#5a189a', secondary: '#9d4edd', accent: '#ff006e', style: 'abyss_eclipse' },
    SPACE:       { primary: '#3a0ca3', secondary: '#4361ee', accent: '#4cc9f0', style: 'void_rift' },
    VOID:        { primary: '#3a0ca3', secondary: '#4361ee', accent: '#4cc9f0', style: 'void_rift' },
    ASTRAL:      { primary: '#74c0fc', secondary: '#4361ee', accent: '#e0fbfc', style: 'void_rift' },
    BLOOD_DEMON: { primary: '#d90429', secondary: '#9b2226', accent: '#ffccd5', style: 'abyss_eclipse' },
    NEUTRAL:     { primary: '#a5d9df', secondary: '#e9cd85', accent: '#ffffff', style: 'razor_silver' },
    TIME:        { primary: '#f4a261', secondary: '#e9c46a', accent: '#e0fbfc', style: 'chrono_wheel' },
    FUSION_SAMADHI_FIRE:    { primary: '#ff0055', secondary: '#ffbe0b', accent: '#ffffff', style: 'fusion_dual_spiral' },
    FUSION_FROST_THUNDER:   { primary: '#00f5d4', secondary: '#9b5de5', accent: '#ffffff', style: 'fusion_dual_spiral' },
    FUSION_KARMA_BLOOD:     { primary: '#d90429', secondary: '#7209b7', accent: '#ffccd5', style: 'fusion_dual_spiral' },
    FUSION_ASTRAL_SWORD:    { primary: '#4cc9f0', secondary: '#ffd166', accent: '#ffffff', style: 'fusion_dual_spiral' }
  });

  // Pillar 3A: Equipment Tier Glows (T1-T7) & Star Attunement (★1-3)
  R.GEAR_TIER_GLOWS = Object.freeze({
    1: { tier: 1, nameTh: 'สามัญ',     color: '#9e9e9e', glowAlpha: 0.0,  orbitSword: false, weaponSoul: false },
    2: { tier: 2, nameTh: 'ชั้นดี',     color: '#66bb6a', glowAlpha: 0.16, orbitSword: false, weaponSoul: false },
    3: { tier: 3, nameTh: 'ปราณแท้',   color: '#42a5f5', glowAlpha: 0.24, orbitSword: false, weaponSoul: false },
    4: { tier: 4, nameTh: 'ล้ำเลิศ',    color: '#ab47bc', glowAlpha: 0.34, orbitSword: true,  weaponSoul: false },
    5: { tier: 5, nameTh: 'ปฐพีเทวะ',  color: '#ffa726', glowAlpha: 0.44, orbitSword: true,  weaponSoul: false },
    6: { tier: 6, nameTh: 'ตำนานสวรรค์', color: '#ffd54f', glowAlpha: 0.56, orbitSword: true,  weaponSoul: true },
    7: { tier: 7, nameTh: 'บรรพกาลอมตะ', color: '#ff1744', glowAlpha: 0.68, orbitSword: true,  weaponSoul: true }
  });

  // Pillar 5A: Celestial Phenomenon Atmospheric Shaders
  R.CELESTIAL_SHADERS = Object.freeze({
    AUTO: {
      id: 'AUTO',
      nameTh: 'ตามวัฏจักรโลกจริง (Auto)',
      icon: '☯️',
      tint: null,
      particleColor: null,
      descTh: 'เปลี่ยนบรรยากาศตามปรากฏการณ์ฟ้าดินและฤดูกาลในโลกจำลองอัตโนมัติ'
    },
    BLOOD_MOON: {
      id: 'BLOOD_MOON',
      nameTh: 'จันทร์โลหิตอาบยุทธภพ (Blood Moon)',
      icon: '🩸',
      tint: 'rgba(135,14,38,0.22)',
      beamColor: 'rgba(255,42,85,0.16)',
      particleColor: '#ff4d6d',
      descTh: 'จันทราสีชาดสาดแสงสีแดงทับทิมพร้อมละอองปราณโลหิตลอยตัวขึ้นจากพื้นพิภพ'
    },
    NINE_SUNS: {
      id: 'NINE_SUNS',
      nameTh: 'เก้าตะวันฉายส่อง (Nine Suns Corona)',
      icon: '☀️',
      tint: 'rgba(255,183,3,0.18)',
      beamColor: 'rgba(255,235,130,0.20)',
      particleColor: '#ffd166',
      descTh: 'ลำแสงสุริยันสีทองอร่ามสาดส่องทแยงมุมลงมาเหนือยอดเขาพร้อมประกายอัคคีทองคำ'
    },
    METEOR_SHOWER: {
      id: 'METEOR_SHOWER',
      nameTh: 'ฝนดาวตกดาราสวรรค์ (Astral Meteor Shower)',
      icon: '🌠',
      tint: 'rgba(28,20,68,0.24)',
      beamColor: 'rgba(114,239,221,0.14)',
      particleColor: '#72efdd',
      descTh: 'ดาราจักรเปิดออกพร้อมสายฝนดาวตกสีเงินครามพาดผ่านนภาเหนือสำนัก'
    },
    PRANA_TIDE: {
      id: 'PRANA_TIDE',
      nameTh: 'คลื่นปราณบรรพกาล (Primordial Qi Tide)',
      icon: '🌌',
      tint: 'rgba(16,88,78,0.18)',
      beamColor: 'rgba(82,183,136,0.16)',
      particleColor: '#80ed99',
      descTh: 'สายธารออโรราสีหยกมรกตพัดผ่านยอดเขาพร้อมฟองปราณทิพย์ลอยตัวทั่วสำนัก'
    }
  });


  // Patch v5.1.0 [Pillar 1 & 2]: Sect Ceremony & Martial Arena Spectacle Presets
  R.CEREMONY_PRESETS = Object.freeze({
    AUTO: {
      id: 'AUTO',
      nameTh: 'ตามเหตุการณ์จริงในสำนัก (Auto)',
      icon: '🏯',
      descTh: 'แสดงฉากงานเลี้ยง พิธีมงคล และเวทีประลองตามเหตุการณ์ที่กำลังเกิดขึ้นจริงในสำนัก'
    },
    BANQUET: {
      id: 'BANQUET',
      nameTh: 'งานเลี้ยงฉลองปราณโอชา & พลุดอกไม้ไฟเซียน',
      icon: '🎎',
      primary: '#ff4d6d',
      secondary: '#ffd166',
      descTh: 'จัดโต๊ะหยกปราณโอชา พรมไหมแดงมงคล โคมบัวสวรรค์ และจุดพลุปราณเซียน 5 สีเหนือลานแปดทิศ'
    },
    COMPANION_WEDDING: {
      id: 'COMPANION_WEDDING',
      nameTh: 'พิธีผูกวาสนาคู่บำเพ็ญมังกรหงส์',
      icon: '💞',
      primary: '#ff0055',
      secondary: '#ffd740',
      descTh: 'ตั้งแท่นพิธีมงคลมังกรหงส์ ด้ายแดงแห่งโชคชะตา และโปรยกลีบบุปผาสวรรค์ทั่วลานแปดทิศ'
    },
    ANCESTRAL_RITE: {
      id: 'ANCESTRAL_RITE',
      nameTh: 'พิธีบวงสรวงบูรพาจารย์ & บัวปราณบรรพชน',
      icon: '🕯️',
      primary: '#00f5d4',
      secondary: '#ffd166',
      descTh: 'ตั้งกระถางธูปสัมฤทธิ์โบราณ ป้ายวิญญาณศักดิ์สิทธิ์ และเสาแสงบัวทองคำเชื่อมฟ้าดิน'
    },
    TOURNAMENT_ARENA: {
      id: 'TOURNAMENT_ARENA',
      nameTh: 'ศึกชุมนุมประลองยุทธ์ & กระบี่ตัดสินฟ้า',
      icon: '🏆',
      primary: '#ffb703',
      secondary: '#00e5ff',
      descTh: 'กางม่านพลังเวทีประลองแปดเหลี่ยม ธงศึกพยัคฆ์มังกร 4 มุม และตราประทับกระบี่ตัดสินยุทธ์เหนือลานฝึก'
    }
  });

  /* ---------- สร้าง/จัดการ renderer ---------- */
  R.create = (canvas) => {
    const r = {
      canvas,
      ctx: canvas.getContext('2d'),
      W: null,
      cam: { x: 180 * TS, y: 122 * TS, z: 1.2 },
      chunks: new Map(),
      buildingSprites: new Map(),
      apCache: new Map(),
      castSeen: new Map(),
      castActive: new Map(),
      castClock: 0,
      castLastTime: null,
      animClock: 0,
      animLastTime: null,
      S: 1,
      rev: 0,
      selected: null,
      follow: false,
      alpha: 1,
      opts: { names: true, bubbles: true, weather: true, night: true, quality: 'auto', reducedMotion: false, realmHalos: true, flyingSwords: true, combatSlashes: true, sectSpectacles: true, livingFauna: true, celestialShaders: true, celestialPreview: 'AUTO', sacredSpectacles: true, ceremonyPreview: 'AUTO' },
      dpr: Math.min(2, g.devicePixelRatio || 1),
      effectiveQuality: 'standard',
      avgDrawMs: 8,
      _qualFrames: 0,
      t: 0,
      uiT: 0,
      mini: null,
      hover: null,
      buildQueue: 0,
      shake: 0,
      warmLightSprite: null
    };
    r.motionQuery = g.matchMedia ? g.matchMedia('(prefers-reduced-motion: reduce)') : null;
    Object.assign(r, R.methods);
    return r;
  };

  R.methods = {
    isReducedMotion() {
      return !!(this.opts.reducedMotion || (this.motionQuery && this.motionQuery.matches));
    },
    resolveQuality() {
      const q = this.opts && this.opts.quality;
      if (q === 'low' || q === 'standard' || q === 'high') {
        this.effectiveQuality = q;
        return q;
      }
      return this.effectiveQuality || 'standard';
    },
    updateAdaptiveQuality(drawMs) {
      if ((this.opts && this.opts.quality) && this.opts.quality !== 'auto') {
        this.effectiveQuality = this.opts.quality;
        return;
      }
      if (!Number.isFinite(drawMs) || drawMs <= 0 || this.buildQueue > 0) return;
      this.avgDrawMs = this.avgDrawMs * 0.9 + Math.min(drawMs, 45) * 0.1;
      this._qualFrames = (this._qualFrames || 0) + 1;
      if (this._qualFrames < 45) return;
      if (this.effectiveQuality === 'high' && this.avgDrawMs > 24) {
        this.effectiveQuality = 'standard';
        this._qualFrames = 0;
      } else if (this.effectiveQuality === 'standard' && this.avgDrawMs > 36) {
        this.effectiveQuality = 'low';
        this._qualFrames = 0;
      }
    },
    setWorld(W) {
      this.W = W;
      this.chunks.clear();
      this.buildingSprites.clear();
      this.apCache.clear();
      this.mini = null;
      this.rev++;
      this.lastSeason = W.season;
      this.castSeen.clear();
      this.castActive.clear();
      this.castClock = 0;
      this.castLastTime = null;
      this.animClock = 0;
      this.animLastTime = null;
      const baseline = (a, kind) => {
        if(a.castFx) this.castSeen.set(kind+':'+a.id,a.castFx.seq+'|'+a.castFx.t);
        if(a.lastWeaponProc) {const p=a.lastWeaponProc;this.castSeen.set('proc:'+kind+':'+a.id,p.t+'|'+p.weaponId+'|'+p.effectId);}
        if(a.lastItemEffectProc) {const p=a.lastItemEffectProc;this.castSeen.set('iproc:'+kind+':'+a.id,p.t+'|'+p.itemId+'|'+p.effectId);}
        if(a.lastResonanceTrigger) {const p=a.lastResonanceTrigger;this.castSeen.set('rproc:'+kind+':'+a.id,p.t+'|'+p.setId);}
        if(a.lastTrinitySurge) {const p=a.lastTrinitySurge;this.castSeen.set('tproc:'+kind+':'+a.id,p.t+'|trinity');}
        if(a.lastPathGaugeFinisher) {const p=a.lastPathGaugeFinisher;this.castSeen.set('fin:'+kind+':'+a.id,p.t+'|'+p.gaugeId);}
        if(a.lastDuetSkill) {const p=a.lastDuetSkill;this.castSeen.set('duet:'+kind+':'+a.id,p.t+'|'+p.duetId);}
        if(a.lastChargedRelease) {const p=a.lastChargedRelease;this.castSeen.set('chrg:'+kind+':'+a.id,p.t+'|'+p.skillId);}
        if(a.lastElementalReaction) {const p=a.lastElementalReaction;this.castSeen.set('elrx:'+kind+':'+a.id,p.t+'|'+p.reactionId);}
        if(a.lastMarkDetonation) {const p=a.lastMarkDetonation;this.castSeen.set('mdet:'+kind+':'+a.id,p.t+'|'+p.targetId);}
        if(a.lastAcupointStrike) {const p=a.lastAcupointStrike;this.castSeen.set('acup:'+kind+':'+a.id,p.t+'|'+p.pointId);}
        if(a.lastMantraCombatProc) {const p=a.lastMantraCombatProc;this.castSeen.set('mproc:'+kind+':'+a.id,p.t+'|'+p.kind);}
        if(a.lastDefensiveArtProc) {const p=a.lastDefensiveArtProc;this.castSeen.set('dproc:'+kind+':'+a.id,p.t+'|'+p.kind);}
        if(a.lastSupportArtProc) {const p=a.lastSupportArtProc;this.castSeen.set('sproc:'+kind+':'+a.id,p.t+'|'+p.kind);}
        if(a.lastForbiddenArtProc) {const p=a.lastForbiddenArtProc;this.castSeen.set('fproc:'+kind+':'+a.id,p.t+'|'+p.kind);}
        if(a.lastPetIntercept) {const p=a.lastPetIntercept;this.castSeen.set('petp:'+kind+':'+a.id,p.t+'|'+p.petId);}
        if(a.lastParryCounter) {const p=a.lastParryCounter;this.castSeen.set('parry:'+kind+':'+a.id,p.t+'|parry');}
        if(a.lastShadowCloneIntercept) {const p=a.lastShadowCloneIntercept;this.castSeen.set('scln:'+kind+':'+a.id,p.t+'|clone');}
        if(a.lastSubstitutionSave) {const p=a.lastSubstitutionSave;this.castSeen.set('subs:'+kind+':'+a.id,p.t+'|sub');}
      };
      W.npcs.forEach(a => baseline(a, 'npc'));
      (W.foes || []).forEach(a => baseline(a, 'foe'));
    },
    invalidate() {
      this.rev++;
      this.apCache.clear();
    },
    resize() {
      const c = this.canvas, w = c.clientWidth || 412, h = c.clientHeight || 860;
      const qual = this.resolveQuality();
      const rawDpr = g.devicePixelRatio || 1;
      const maxDpr = qual === 'low' ? 1 : (qual === 'standard' && w * h > 800000) ? 1.5 : 2;
      this.dpr = Math.min(maxDpr, rawDpr);
      const nw = Math.max(2, Math.round(w * this.dpr)), nh = Math.max(2, Math.round(h * this.dpr));
      if (c.width !== nw || c.height !== nh) {
        c.width = nw;
        c.height = nh;
      }
      this.vw = w;
      this.vh = h;
      this.clampCam();
    },
    minZoom() { return Math.max(0.1, Math.min(this.vw / (MAP.W * TS), this.vh / (MAP.H * TS)) * 0.98); },
    clampCam() {
      const c = this.cam;
      c.z = clamp(c.z, this.minZoom(), 4);
      const hw = this.vw / 2 / c.z, hh = this.vh / 2 / c.z;
      c.x = clamp(c.x, Math.min(hw, MAP.W * TS / 2), Math.max(MAP.W * TS - hw, MAP.W * TS / 2));
      c.y = clamp(c.y, Math.min(hh, MAP.H * TS / 2), Math.max(MAP.H * TS - hh, MAP.H * TS / 2));
    },
    s2w(sx, sy) { const c = this.cam; return { x: (sx - this.vw / 2) / c.z + c.x, y: (sy - this.vh / 2) / c.z + c.y }; },
    w2s(wx, wy) { const c = this.cam; return { x: (wx - c.x) * c.z + this.vw / 2, y: (wy - c.y) * c.z + this.vh / 2 }; },
    panBy(dx, dy) { this.cam.x -= dx / this.cam.z; this.cam.y -= dy / this.cam.z; this.follow = false; this.clampCam(); },
    zoomAt(sx, sy, f) { const before = this.s2w(sx, sy); this.cam.z *= f; this.clampCam(); const after = this.s2w(sx, sy); this.cam.x += before.x - after.x; this.cam.y += before.y - after.y; this.clampCam(); },
    focus(tx, ty, z) { this.cam.x = tx * TS; this.cam.y = ty * TS; if (z) this.cam.z = z; this.clampCam(); },
    npcPos(n) { const a = this.alpha; return { x: (n.px + (n.x - n.px) * a), y: (n.py + (n.y - n.py) * a) }; },
    pickAt(sx, sy) {
      const W = this.W; if (!W) return null;
      const w = this.s2w(sx, sy);
      const tx = w.x / TS, ty = w.y / TS;
      let best = null, bd = (22 / this.cam.z / TS) ** 2 + 0.6;
      for (const n of W.npcs) {
        if (n.dead || n.away || (n.hidden && !n.travel)) continue;
        const p = this.npcPos(n);
        const d = (p.x - tx) ** 2 + (p.y - 0.6 - ty) ** 2;
        if (d < bd) { bd = d; best = { kind: 'npc', id: n.id }; }
      }
      for (const f of W.foes || []) {
        if (f.dead || f.gone) continue;
        const d = (f.x - tx) ** 2 + (f.y - 0.5 - ty) ** 2;
        if (d < bd) { bd = d; best = { kind: 'foe', id: f.id }; }
      }
      for (const v of (W.world && Array.isArray(W.world.visitors) ? W.world.visitors : [])) {
        if (!v || (v.kind === 'guest' && !['admitted', 'restricted'].includes(v.state)) || v.untilDay < W.day) continue;
        if (!Number.isFinite(v.x) || !Number.isFinite(v.y)) continue;
        const d = (v.x - tx) ** 2 + (v.y - 0.6 - ty) ** 2;
        if (d < bd) { bd = d; best = { kind: 'visitor', id: v.id }; }
      }
      if (best) return best;
      for (const rn of (W.wildResources?.nodes || [])) {
        if (rn.remaining <= 0) continue;
        const d = (rn.x - tx) ** 2 + (rn.y - ty) ** 2;
        if (d < bd) { bd = d; best = { kind: 'resource', id: rn.id, res: rn }; }
      }
      if (best) return best;
      for (const b of W.map.buildings) {
        if (b.type === 'plaza') continue;
        if (tx >= b.x - 1 && tx <= b.x + b.w + 1 && ty >= b.y - 0.6 && ty <= b.y + b.h + 0.2 && !MAP.BTYPES[b.type].open) return { kind: 'building', id: b.id };
        if (MAP.BTYPES[b.type].open && tx >= b.x && tx < b.x + b.w && ty >= b.y && ty < b.y + b.h) return { kind: 'building', id: b.id };
      }
      return null;
    },
    getChunk(cx, cy) {
      const S = this.S, key = cx + ',' + cy;
      let e = this.chunks.get(key);
      if (e && e.rev === this.rev && e.S === S) return e.cv;
      const limit = this.chunks.size < 42 ? 32 : 8;
      if (this.buildQueue >= limit) return e ? e.cv : null;
      this.buildQueue++;
      const cv = buildChunk(this, cx, cy, S);
      if (this.chunks.size > 180) this.chunks.delete(this.chunks.keys().next().value);
      this.chunks.set(key, { cv, rev: this.rev, S });
      return cv;
    },
    getBuildingSprite(b) {
      const lv = b.level || 1, ts = b.tierStage || R.getArchitecturalTierStage(lv);
      const key = b.id + '|' + b.type + '|' + lv + '|T' + ts + '|' + this.S;
      let cv = this.buildingSprites.get(key);
      if (!cv) {
        if (this.buildingSprites.size >= 64) this.buildingSprites.delete(this.buildingSprites.keys().next().value);
        cv = buildBuildingSprite(b, this.S);
        this.buildingSprites.set(key, cv);
      }
      return cv;
    },
    getMini() {
      if (this.mini && this.mini.rev === this.rev) return this.mini.cv;
      const M = this.W.map, cv = newCanvas(MAP.W, MAP.H), c = cv.getContext('2d'), season = this.W.season;
      for (let y = 0; y < MAP.H; y++) for (let x = 0; x < MAP.W; x++) {
        c.fillStyle = tileColor(M.terrain[y * MAP.W + x], x, y, season);
        c.fillRect(x, y, 1, 1);
      }
      M.decor.forEach(d => {
        if (d.kind === 'pine' || d.kind === 'blossom') {
          c.fillStyle = season === 2 ? '#b8782a' : season === 3 ? '#e8eef2' : '#2f6a35';
          c.fillRect(d.x, d.y, 1, 1);
        }
      });
      this.mini = { cv, rev: this.rev };
      return cv;
    },

    /* ---------- วาดเฟรม ---------- */
    draw(time) {
      const W = this.W; if (!W) return;
      const drawStart = performance.now();
      const ctx = this.ctx, c = this.cam, qual = this.resolveQuality();
      const paused = (g.G && g.G.W === W ? g.G.speed === 0 : W.speed === 0) || (g.UI && g.UI.paused);
      const reduced = this.isReducedMotion();
      const dt = this.animLastTime === null ? 0 : time - this.animLastTime;
      this.animLastTime = time;
      if (!paused && !reduced && dt >= 0 && dt < 250) {
        this.animClock += dt;
      }
      this.t = this.animClock / 1000;
      this.uiT = (Number.isFinite(time) ? time : 0) / 1000;
      this.buildQueue = 0;

      this.updateCastEffects(time);
      if (W.season !== this.lastSeason) {
        this.lastSeason = W.season;
        this.rev++;
        this.mini = null;
      }
      const dpr = this.dpr;
      const S = clamp(Math.round(c.z * dpr), 1, 2);
      if (S !== this.S) {
        this.S = S;
        this.chunks.clear();
        this.buildingSprites.clear();
      }
      if (this.follow && this.selected) {
        const n = W.byId[this.selected];
        if (n && !n.dead && !n.away) {
          const p = this.npcPos(n);
          c.x += (p.x * TS - c.x) * 0.15;
          c.y += (p.y * TS - c.y) * 0.15;
          this.clampCam();
        }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.fillStyle = '#587a6e';
      ctx.fillRect(0, 0, this.vw, this.vh);

      ctx.save();
      ctx.translate(this.vw / 2, this.vh / 2);
      ctx.scale(c.z, c.z);
      ctx.translate(-c.x, -c.y);

      const hw = this.vw / 2 / c.z, hh = this.vh / 2 / c.z;
      const x0 = Math.max(0, Math.floor((c.x - hw) / (TS * CH))), x1 = Math.min(MAP.W / CH - 1, Math.floor((c.x + hw) / (TS * CH)));
      const y0 = Math.max(0, Math.floor((c.y - hh) / (TS * CH))), y1 = Math.min(MAP.H / CH - 1, Math.floor((c.y + hh) / (TS * CH)));
      const mini = this.getMini();
      for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
        const cv = this.getChunk(cx, cy);
        const dx = cx * CH * TS, dy = cy * CH * TS;
        if (cv) ctx.drawImage(cv, dx, dy, CH * TS + 0.4, CH * TS + 0.4);
        else ctx.drawImage(mini, cx * CH, cy * CH, CH, CH, dx, dy, CH * TS, CH * TS);
      }

      const hour = (W.t % 1440) / 60;
      const nightPre = this.nightFactor(hour);
      this.drawWater(ctx);
      this.drawLeylineVeins(ctx);
      if (this.opts.sectSpectacles !== false) {
        this.drawPlazaGrandArrayAndTotems(ctx);
        this.drawGrandFormationWarfareBeams(ctx);
        this.drawForbiddenVaultAltarSpectacles(ctx);
        this.drawPeakSanctuarySpectacles(ctx);
        this.drawSectCeremonySpectacles(ctx, hour, nightPre);
        this.drawMartialArenaSpectacles(ctx);
      }
      if (this.opts.sacredSpectacles !== false) {
        this.drawSacredSiteSpectacles(ctx, hour, nightPre);
        this.drawSecretRealmPortalSpectacles(ctx, hour, nightPre);
      }

      const items = [];
      W.map.buildings.forEach(b => {
        if ((b.x + b.w) * TS < c.x - hw - 32 || b.x * TS > c.x + hw + 32 || (b.y + b.h) * TS < c.y - hh - 32 || b.y * TS > c.y + hh + 64) return;
        items.push({ y: MAP.BTYPES[b.type].open ? b.y - 100 : b.y + b.h, b, k: 'b' });
      });
      W.npcs.forEach(n => {
        if (n.dead || n.away) return;
        const showIndoor = n.hidden && !n.travel && (c.z >= 1.65 || this.selected === n.id);
        if (n.hidden && !n.travel && !showIndoor) return;
        const p = this.npcPos(n);
        if (p.x * TS < c.x - hw - 40 || p.x * TS > c.x + hw + 40 || p.y * TS < c.y - hh - 60 || p.y * TS > c.y + hh + 40) return;
        items.push({ y: p.y + (showIndoor ? 6 : 0), n, p, k: 'n' });
      });
      (W.foes || []).forEach(f => {
        const margin = f.raidGrade ? 220 : f.wild ? 100 : 50;
        if (!f.gone && !f.dead && Math.abs(f.x * TS - c.x) < hw + margin && Math.abs(f.y * TS - c.y) < hh + margin) items.push({ y: f.y, f, k: 'f' });
      });
      (W.world && Array.isArray(W.world.visitors) ? W.world.visitors : []).forEach(v => {
        if (!v || v.untilDay < W.day) return;
        if (v.kind === 'guest' && !['admitted', 'restricted'].includes(v.state)) return;
        if (!Number.isFinite(v.x) || !Number.isFinite(v.y)) return;
        if (Math.abs(v.x * TS - c.x) < hw + 45 && Math.abs(v.y * TS - c.y) < hh + 55) items.push({ y: v.y, v, k: 'v' });
      });
      (W.wildlife?.beasts || []).forEach(b => {
        const margin = b.raidGrade ? 220 : 100;
        if (!b.fighting && !b.dead && !b.gone && Math.abs(b.x * TS - c.x) < hw + margin && Math.abs(b.y * TS - c.y) < hh + margin) items.push({ y: b.y, w: b, k: 'w' });
      });
      (W.wildResources?.nodes || []).forEach(rn => {
        if (rn.remaining > 0 && Math.abs(rn.x * TS - c.x) < hw + 40 && Math.abs(rn.y * TS - c.y) < hh + 40) items.push({ y: rn.y, res: rn, k: 'res' });
      });
      W.map.decor.forEach(d => {
        if (d.kind === 'lantern' || d.kind === 'banner' || d.kind === 'fountain') {
          if (Math.abs(d.x * TS - c.x) < hw + 40 && Math.abs(d.y * TS - c.y) < hh + 40) items.push({ y: d.y + 0.5, d, k: 'd' });
        }
      });
      items.sort((a, b) => a.y - b.y);

      const night = this.nightFactor(hour);
      const duskDawn = (hour >= 5 && hour < 7.5) ? (1 - Math.abs(hour - 6.25) / 1.25) : (hour >= 17 && hour < 19.5) ? (1 - Math.abs(hour - 18.25) / 1.25) : 0;

      for (const it of items) {
        if (it.k === 'b') this.drawBuilding(ctx, it.b, hour, night);
        else if (it.k === 'n') this.drawNpc(ctx, it.n, it.p, hour);
        else if (it.k === 'v') this.drawVisitor(ctx, it.v, hour);
        else if (it.k === 'f') { if (it.f.wild) this.drawWild(ctx, it.f); else this.drawFoe(ctx, it.f); }
        else if (it.k === 'w') this.drawWild(ctx, it.w);
        else if (it.k === 'res') this.drawWildResource(ctx, it.res);
        else this.drawDeco(ctx, it.d, night);
      }

      this.drawTranscendentScars(ctx);
      this.drawCastEffects(ctx);
      if (this.opts.livingFauna !== false) {
        this.drawLivingFloraAndFauna(ctx, hour, night);
      }
      this.drawDriftingMountainMist(ctx);
      this.drawSectBarrierDome(ctx);
      this.drawMarkers(ctx);

      // Dawn/Dusk warm golden-amber glaze & Night illumination with viewport-culled cached light sprites
      if (this.opts.night && (night > 0.02 || duskDawn > 0.05)) {
        ctx.restore();
        ctx.save();
        if (duskDawn > 0.05 && night < 0.4) {
          ctx.fillStyle = 'rgba(215,120,65,' + (duskDawn * 0.14).toFixed(3) + ')';
          ctx.fillRect(0, 0, this.vw, this.vh);
        }
        if (night > 0.02) {
          ctx.fillStyle = 'rgba(10,20,44,' + (night * 0.50).toFixed(3) + ')';
          ctx.fillRect(0, 0, this.vw, this.vh);
        }
        ctx.restore();
        ctx.save();
        ctx.translate(this.vw / 2, this.vh / 2);
        ctx.scale(c.z, c.z);
        ctx.translate(-c.x, -c.y);

        if (night > 0.05 && qual !== 'low') {
          if (!this.warmLightSprite) this.warmLightSprite = createLightSprite(255, 200, 115);
          const lSprite = this.warmLightSprite;
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = clamp(night * 0.58, 0.08, 0.58);

          // 1. Viewport-culled building warm glow
          W.map.buildings.forEach(b => {
            if (MAP.BTYPES[b.type].open || b.type === 'gate') return;
            const gx = (b.x + b.w / 2) * TS, gy = (b.y + b.h * 0.62) * TS;
            const rr = Math.max(b.w, b.h) * TS * 0.85;
            if (Math.abs(gx - c.x) > hw + rr || Math.abs(gy - c.y) > hh + rr) return;
            const occ = b.inside.length > 0 || b.type === 'main_hall' || b.type === 'canteen' || b.type === 'tea_garden';
            if (!occ) return;
            ctx.drawImage(lSprite, gx - rr, gy - rr, rr * 2, rr * 2);
          });

          // 2. Viewport-culled lantern halos (capped at 28 visible lanterns)
          let lCount = 0;
          for (let i = 0; i < W.map.decor.length && lCount < 28; i++) {
            const d = W.map.decor[i];
            if (d.kind !== 'lantern') continue;
            const gx = d.x * TS + 8, gy = d.y * TS - 2, rr = 42;
            if (Math.abs(gx - c.x) > hw + rr || Math.abs(gy - c.y) > hh + rr) continue;
            lCount++;
            ctx.drawImage(lSprite, gx - rr, gy - rr, rr * 2, rr * 2);
          }
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'source-over';
        }
      }

      ctx.restore();
      if (this.opts.weather) this.drawWeather(ctx, W.weather.kind, hour);
      if (this.opts.celestialShaders !== false) {
        this.drawCelestialPhenomena(ctx, hour, night);
      }
      this.drawHeavenlyTribulationSkyGlaze(ctx);
      this.drawTranscendentCutIn(ctx);
      this.drawOverlayText(ctx);
      this.updateAdaptiveQuality(performance.now() - drawStart);
    },

    // Cast events remain simulation data; their short real-time presentation lives here only.
    updateCastEffects(time) {
      const W = this.W; if (!W) return;
      const paused = (g.G && g.G.W === W ? g.G.speed === 0 : W.speed === 0) || (g.UI && g.UI.paused);
      const dt = this.castLastTime === null ? 0 : time - this.castLastTime;
      this.castLastTime = time;
      if (!paused && dt >= 0 && dt < 250) this.castClock += dt;
      for (const [key, fx] of this.castActive) {
        if (this.castClock - fx.start >= fx.life) this.castActive.delete(key);
      }
      const hw = this.vw / 2 / this.cam.z, hh = this.vh / 2 / this.cam.z;
      const present = new Set();
      const read = (a, kind) => {
        const key = kind + ':' + a.id;
        present.add(key);
        const pos = kind === 'npc' ? this.npcPos(a) : a;
        const proc = a.lastWeaponProc, procKey = 'proc:' + key;
        present.add(procKey);
        if (proc && proc.triggered) {
          const procStamp = proc.t + '|' + proc.weaponId + '|' + proc.effectId;
          if (this.castSeen.get(procKey) !== procStamp) {
            this.castSeen.set(procKey, procStamp);
            const item = Object.values(a.equip || {}).find(it => it && it.id === proc.weaponId);
            const spec = R.resolveLegendaryGearVisual(item);
            const usable = item && (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(a,item));
            if (spec && usable && !a.dead && !a.away && !a.gone && !a.hidden && Number.isFinite(proc.t) && W.t-proc.t >= 0 && W.t-proc.t <= 8 &&
                Number.isFinite(pos.x) && Number.isFinite(pos.y) && Math.abs(pos.x*TS-this.cam.x) <= hw+176 && Math.abs(pos.y*TS-this.cam.y) <= hh+176) {
              const useTgt = !!(proc.isOffensive && Number.isFinite(proc.targetX) && Number.isFinite(proc.targetY) && Math.hypot((proc.targetX - pos.x) * TS, (proc.targetY - pos.y) * TS) <= 160);
              const rx = (useTgt ? proc.targetX : pos.x) * TS, ry = (useTgt ? proc.targetY : pos.y) * TS;
              const ox = pos.x * TS, oy = pos.y * TS;
              this.castActive.delete(procKey);
              if(this.castActive.size>=24) {
                let evKey = null;
                for (const [k2, fx2] of this.castActive) { if (!fx2.transcendent && !fx2.legendary && !fx2.relicId && (fx2.tier || 1) <= 2) { evKey = k2; break; } }
                this.castActive.delete(evKey || this.castActive.keys().next().value);
              }
              this.castActive.set(procKey,{ownerId:a.id,relicId:spec.id,kind:'relic',x:rx,y:ry,originX:ox,originY:oy,angle:Math.atan2(ry-oy,rx-ox),start:this.castClock,life:R.legendarySceneLife({relicId:spec.id})});
            }
          }
        }
        this.ingestEquipAndActionProcs(a, kind, key, pos, hw, hh, present);
        const procs = g.COMBAT && g.COMBAT.transcendentVisualProcs && g.COMBAT.transcendentVisualProcs(a);
        if (procs) {
          for (const [type, proc] of procs) {
            const id = 'trans:' + key + ':' + type;
            present.add(id);
            if (this.castSeen.get(id) === proc) continue;
            this.castSeen.set(id, proc);
            const x = proc.x * TS, y = proc.y * TS;
            if (a.away || a.gone || a.hidden || W.t < proc.t || W.t - proc.t > 8 ||
                Math.abs(x - this.cam.x) > hw + 150 || Math.abs(y - this.cam.y) > hh + 150) continue;
            const art = R.transcendentProcSpec(proc);
            if (art) this.queueTranscendentCast(id, a, proc, art);
          }
        }
        const event = a.castFx;
        if (!event) return;
        const stamp = event.seq + '|' + event.t;
        if (this.castSeen.get(key) === stamp) return;
        this.castSeen.set(key, stamp);
        if (a.dead || a.away || a.gone || a.hidden || !Number.isFinite(event.t) || W.t - event.t < 0 || W.t - event.t > 8 || !Number.isFinite(event.x) || !Number.isFinite(event.y)) return;
        const actorPos = pos;
        const x = event.x * TS, y = event.y * TS;
        const techObj = (event.techId && g.CULT && g.CULT.tech) ? g.CULT.tech(event.techId) : null;
        const transcendent = R.transcendentCastSpec(techObj, event.techId, event.moveId);
        if (transcendent) {
          if (Math.abs(x - this.cam.x) <= hw + 150 && Math.abs(y - this.cam.y) <= hh + 150) {
            this.queueTranscendentCast(key, a, event, transcendent);
          }
          return;
        }
        const padding=event.legendary||(techObj&&techObj.legendary)||/^legend_/.test(event.motif||event.fxKind||'')?176:96;
        if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x - this.cam.x) > hw + padding || Math.abs(y - this.cam.y) > hh + padding) return;
        const authoredMove = techObj && (techObj.moveDefs || []).find(move => move.id === event.moveId);
        const automaticSignature = g.SK && g.SK.resolveSignatureVfx ? g.SK.resolveSignatureVfx(techObj || event, { ...(authoredMove || {}), arch: event.arch }) : null;
        // Preserve an explicit per-event override too; only demote the old automatic
        // high-tier heuristic for the selected basic curricula.
        const eventArtOverride = event.fxKind || (event.signatureVfx && event.signatureVfx !== automaticSignature);
        const commonVfx = !eventArtOverride && g.SK && g.SK.resolveCommonVfx ? g.SK.resolveCommonVfx(techObj || event, { id: event.moveId }) : null;
        const t6Vfx = !eventArtOverride && g.SK && g.SK.resolveT6Vfx ? g.SK.resolveT6Vfx(techObj || event,{id:event.moveId}) : null;
        const t6ExtVfx = !eventArtOverride && !t6Vfx && g.SK && g.SK.resolveT6ExtVfx ? g.SK.resolveT6ExtVfx(techObj || event,{id:event.moveId}) : null;
        const t7Vfx = !eventArtOverride && g.SK && g.SK.resolveT7Vfx ? g.SK.resolveT7Vfx(techObj || event, { id:event.moveId }) : null;
        const t5Vfx = !eventArtOverride && g.SK && g.SK.resolveT5Vfx ? g.SK.resolveT5Vfx(techObj || event, { id: event.moveId }) : null;
        const t4Vfx = !eventArtOverride && g.SK && g.SK.resolveT4Vfx ? g.SK.resolveT4Vfx(techObj || event, { id: event.moveId }) : null;
        const t3Vfx = !eventArtOverride && g.SK && g.SK.resolveT3Vfx ? g.SK.resolveT3Vfx(techObj || event, { id: event.moveId }) : null;
        const t3GroupVfx = !eventArtOverride && !t3Vfx && g.SK && g.SK.resolveT3GroupVfx ? g.SK.resolveT3GroupVfx(techObj || event, { id: event.moveId }) : null;
        const t2Vfx = !eventArtOverride && !commonVfx && g.SK && g.SK.resolveT2Vfx ? g.SK.resolveT2Vfx(techObj || event, { id: event.moveId }) : null;
        const t1Vfx = !eventArtOverride && !commonVfx && g.SK && g.SK.resolveT1Vfx ? g.SK.resolveT1Vfx(techObj || event, { id: event.moveId }) : null;
        const forbidden = event.kind === 'forbidden';
        const motif = event.motif || event.fxKind || (forbidden ? 'forbidden' : 'normal');
        const isLegend = !!(event.legendary || (techObj && techObj.legendary) || (motif && String(motif).startsWith('legend_')));
        const isSpecialtyArt = !!(techObj && (/^INNATE_|_GRAND_DAO$|MANTRA/.test(techObj.cat || "") || /^INNATE_/.test(techObj.id || "")));
        const subpathMotif = !isLegend && g.SK && g.SK.resolveSubpathVfxMotif ? g.SK.resolveSubpathVfxMotif(techObj || event, { id: event.moveId, tier: event.tier }) : null;
        const shown=this.castActive.get(key);
        // Coalesce rapid repeats of the same selected ordinary T6/T7/T5/T4 until release is visible.
        // Keep the original factual snapshot; a different art, explicit override or Legendary cast bypasses this.
        if(t7Vfx&&!isLegend&&shown&&shown.t7Vfx&&shown.techId===event.techId&&shown.kind===(forbidden?'forbidden':'normal')&&this.castClock-shown.start<shown.life*.55)return;
        if((t6Vfx||t6ExtVfx)&&!isLegend&&shown&&(shown.t6Vfx||shown.t6ExtVfx)&&shown.techId===event.techId&&shown.kind===(forbidden?'forbidden':'normal')&&this.castClock-shown.start<shown.life*.55)return;
        if(t5Vfx&&!isLegend&&shown&&shown.t5Vfx&&shown.techId===event.techId&&shown.kind===(forbidden?'forbidden':'normal')&&this.castClock-shown.start<shown.life*.52)return;
        if(t4Vfx&&!isLegend&&shown&&shown.t4Vfx&&shown.techId===event.techId&&shown.kind===(forbidden?'forbidden':'normal')&&this.castClock-shown.start<shown.life*.50)return;
        this.castActive.delete(key);
        if (this.castActive.size >= 24) {
          let evKey = null;
          for (const [k2, fx2] of this.castActive) { if (!fx2.transcendent && !fx2.legendary && !fx2.relicId && (fx2.tier || 1) <= 2) { evKey = k2; break; } }
          if (!evKey && isLegend) {
            for (const [k2, fx2] of this.castActive) { if (!fx2.transcendent && !fx2.legendary && !fx2.relicId) { evKey = k2; break; } }
          }
          this.castActive.delete(evKey || this.castActive.keys().next().value);
        }
        const elemKey = event.element || (techObj && techObj.element) || (a.cult && a.cult.element) || null;
        const fusionKey = event.fusionId || event.fusion || null;
        const originX = Number.isFinite(event.originX) ? event.originX * TS : actorPos.x * TS;
        const originY = Number.isFinite(event.originY) ? event.originY * TS : actorPos.y * TS;
        this.castActive.set(key, {
          ownerId: a.id,
          kind: forbidden ? 'forbidden' : 'normal',
          motif,
          fxKind: event.fxKind || (isLegend ? motif : null),
          signatureVfx: event.signatureVfx || (techObj && techObj.signatureVfx) || (g.SK && g.SK.resolveSignatureVfx ? g.SK.resolveSignatureVfx(techObj || event) : null) || null,
          commonVfx: forbidden || isLegend ? null : commonVfx,
          t1Vfx: forbidden || isLegend || commonVfx ? null : t1Vfx,
          t2Vfx: forbidden || isLegend || commonVfx ? null : t2Vfx,
          t3Vfx: forbidden || isLegend ? null : t3Vfx,
          t3GroupVfx: forbidden || isLegend || t3Vfx ? null : t3GroupVfx,
          t4Vfx: isLegend ? null : t4Vfx,
          t5Vfx: isLegend ? null : t5Vfx,
          t6Vfx: isLegend ? null : t6Vfx,
          t6ExtVfx: isLegend || t6Vfx ? null : t6ExtVfx,
          t7Vfx: isLegend ? null : (t7Vfx && event.techId),
          subpathMotif,
          isSpecialtyArt,
          legendary: isLegend,
          techId: event.techId || null,
          moveId: event.moveId || null,
          weaponType: R.WEAPON_MOTION_VFX[event.weaponType] ? event.weaponType : null,
          tier: clamp(event.tier || (techObj && techObj.tier) || 1, 1, 7),
          arch: event.arch || null,
          element: elemKey,
          fusion: fusionKey,
          path: event.path || (techObj && techObj.path) || (a.cult && a.cult.path) || null,
          subpath: event.subpath || (techObj && techObj.sub) || (a.cult && a.cult.sub) || null,
          cat: event.cat || (techObj && techObj.cat) || null,
          bandIndex: event.bandIndex || 1,
          rangeShape: event.rangeShape || 'SINGLE',
          isRanged: !!event.isRanged,
          isGapCloser: !!event.isGapCloser,
          castRole: event.castRole || null,
          fromEquipmentGrant: !!event.fromEquipmentGrant,
          stage: (a.cult && a.cult.stage) || 1,
          x,
          y,
          originX,
          originY,
          targetPoints: Array.isArray(event.targetPoints) ? event.targetPoints
            .filter(point => point && Number.isFinite(point.x) && Number.isFinite(point.y))
            .slice(0, 8).map(point => ({ x: point.x * TS, y: point.y * TS, team: point.team !== false })) : [],
          angle: Math.atan2(y - originY, x - originX),
          start: this.castClock,
          life: isLegend ? R.legendarySceneLife({techId:event.techId})
            : ((t6Vfx || t6ExtVfx) ? g.SK.NONLEGENDARY_VFX_BUDGET[6].life
            : (t7Vfx ? g.SK.NONLEGENDARY_VFX_BUDGET[7].life
            : (t5Vfx ? g.SK.NONLEGENDARY_VFX_BUDGET[5].life
            : (t4Vfx ? g.SK.NONLEGENDARY_VFX_BUDGET[4].life
            : ((t3Vfx || t3GroupVfx) && !forbidden ? g.SK.NONLEGENDARY_VFX_BUDGET[3].life
            : ((commonVfx || t2Vfx || t1Vfx) && !forbidden ? 540
            : ((event.signatureVfx || (g.SK && g.SK.resolveSignatureVfx && g.SK.resolveSignatureVfx(techObj || event))) ? 920 : (forbidden ? 650 : 450))))))))
        });
      };
      W.npcs.forEach(a => read(a, 'npc'));
      (W.foes || []).forEach(a => read(a, 'foe'));
      for (const key of this.castSeen.keys()) {
        if (!present.has(key)) this.castSeen.delete(key);
      }
    },

    drawLegendaryCastMotif(ctx, fx, p, r, reduced) {
      const mKey = fx.motif || fx.fxKind;
      const spec = LEGENDARY_MOTIFS[mKey] || { primary: '#ffd54f', secondary: '#ff6f00', accent: '#ffffff', shape: 'solar_corona_9rays' };
      const rot = reduced ? 0 : (p - 0.5) * 1.1;
      ctx.fillStyle = 'rgba(20,16,32,0.22)';
      ctx.beginPath(); ctx.ellipse(0, 5, r * 1.18, r * 0.52, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.ellipse(0, 5, r * 1.05, r * 0.45, 0, 0, 7); ctx.stroke();

      switch (mKey) {
        case 'legend_dugu_sword': {
          ctx.rotate(fx.angle);
          for (let i = 0; i < 9; i++) {
            const ang = ((i - 4) * 0.24) + rot * (i % 2 ? 0.4 : -0.4);
            const len = r * (0.85 + (i % 3) * 0.18);
            ctx.strokeStyle = i % 2 === 0 ? spec.primary : spec.accent;
            ctx.lineWidth = i === 4 ? 2.4 : 1.3;
            ctx.beginPath();
            ctx.moveTo(-len * 0.35, (i - 4) * 1.6);
            ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
            ctx.stroke();
          }
          break;
        }
        case 'legend_dragon_palm': {
          ctx.rotate(fx.angle);
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.6;
          ctx.beginPath();
          for (let i = 0; i <= 16; i++) {
            const u = i / 16, dx = (u - 0.15) * r * 1.45, dy = Math.sin(u * 8 + p * 6) * (4.5 + u * 4);
            i ? ctx.lineTo(dx, dy) : ctx.moveTo(dx, dy);
          }
          ctx.stroke();
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 1.6;
          for (let c = -1; c <= 1; c++) {
            ctx.beginPath(); ctx.arc(r * 0.65, c * 4.5, r * 0.48, -0.7, 0.7); ctx.stroke();
          }
          break;
        }
        case 'legend_six_meridian': {
          const cols = ['#ff5252', '#ffd740', '#69f0ae', '#40c4ff', '#7c4dff', '#ff4081'];
          ctx.rotate(fx.angle);
          for (let i = 0; i < 6; i++) {
            const a = (i - 2.5) * 0.22;
            ctx.strokeStyle = cols[i]; ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a) * r * 1.45, Math.sin(a) * r * 1.45);
            ctx.stroke();
            ctx.fillStyle = spec.accent;
            ctx.beginPath(); ctx.arc(Math.cos(a) * r * 1.45, Math.sin(a) * r * 1.45, 2.1, 0, 7); ctx.fill();
          }
          break;
        }
        case 'legend_qiankun_taiji': {
          ctx.save(); ctx.translate(0, 4); ctx.scale(1, 0.56); ctx.rotate(fx.angle + p * 2.2);
          ctx.fillStyle = spec.primary; ctx.beginPath(); ctx.arc(0, 0, r * 0.9, -Math.PI / 2, Math.PI / 2); ctx.fill();
          ctx.fillStyle = spec.secondary; ctx.beginPath(); ctx.arc(0, 0, r * 0.9, Math.PI / 2, Math.PI * 1.5); ctx.fill();
          ctx.fillStyle = spec.primary; ctx.beginPath(); ctx.arc(0, -r * 0.45, r * 0.45, 0, 7); ctx.fill();
          ctx.fillStyle = spec.secondary; ctx.beginPath(); ctx.arc(0, r * 0.45, r * 0.45, 0, 7); ctx.fill();
          ctx.fillStyle = spec.secondary; ctx.beginPath(); ctx.arc(0, -r * 0.45, r * 0.14, 0, 7); ctx.fill();
          ctx.fillStyle = spec.primary; ctx.beginPath(); ctx.arc(0, r * 0.45, r * 0.14, 0, 7); ctx.fill();
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, r * 0.92, 0, 7); ctx.stroke();
          ctx.restore();
          break;
        }
        case 'legend_taixuan_runes': {
          ctx.rotate(fx.angle - p * 1.6);
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 1.3;
          ctx.beginPath();
          for (let i = 0; i <= 7; i++) {
            const a = i * Math.PI * 2 / 7, rr = r * (0.55 + (i % 2) * 0.42);
            const sx = Math.cos(a) * rr, sy = Math.sin(a) * rr * 0.65;
            i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
          }
          ctx.stroke();
          for (let i = 0; i < 7; i++) {
            const a = i * Math.PI * 2 / 7, rr = r * (0.55 + (i % 2) * 0.42);
            ctx.fillStyle = i % 2 ? spec.accent : spec.primary;
            ctx.beginPath(); ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr * 0.65, 2.4, 0, 7); ctx.fill();
          }
          break;
        }
        case 'legend_lingbo_afterimage': {
          ctx.save(); ctx.translate(0, 5); ctx.scale(1, 0.52); ctx.rotate(p * 1.4);
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.8;
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const a = i * Math.PI / 4;
            const px = Math.cos(a) * r, py = Math.sin(a) * r;
            i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
          }
          ctx.stroke();
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.1;
          ctx.beginPath(); ctx.arc(0, 0, r * 0.65, 0, 7); ctx.stroke();
          ctx.restore();
          break;
        }
        case 'legend_moon_shadow': {
          ctx.rotate(fx.angle);
          ctx.fillStyle = spec.primary;
          ctx.beginPath(); ctx.arc(0, 0, r * 0.85, -1.1, 1.1); ctx.arc(-r * 0.28, 0, r * 0.72, 1.0, -1.0, true); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.4;
          for (let i = 0; i < 4; i++) {
            const fx2 = r * (0.4 + i * 0.22), fy2 = (i - 1.5) * 5;
            ctx.beginPath(); ctx.ellipse(fx2, fy2, 4.5, 1.6, 0.3, 0, 7); ctx.stroke();
          }
          break;
        }
        case 'legend_blood_lotus': {
          for (let ph = -1; ph <= 1; ph++) {
            ctx.fillStyle = ph === 0 ? 'rgba(255,23,68,0.38)' : 'rgba(213,0,249,0.22)';
            ctx.beginPath(); ctx.ellipse(ph * 8 * (0.5 + p), -4, 4.5, 9, ph * 0.2, 0, 7); ctx.fill();
          }
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.5;
          for (let i = 0; i < 12; i++) {
            const a = i * Math.PI / 6 + rot;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * r * 0.35, Math.sin(a) * r * 0.35);
            ctx.lineTo(Math.cos(a) * r * 1.25, Math.sin(a) * r * 1.25);
            ctx.stroke();
          }
          break;
        }
        case 'legend_eight_desolations': {
          ctx.save(); ctx.translate(0, 4); ctx.scale(1, 0.55); ctx.rotate(rot);
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.2;
          for (let t2 = 0; t2 < 2; t2++) {
            ctx.beginPath();
            for (let i = 0; i <= 3; i++) {
              const a = i * Math.PI * 2 / 3 + t2 * Math.PI / 3;
              const x2 = Math.cos(a) * r * 1.05, y2 = Math.sin(a) * r * 1.05;
              i ? ctx.lineTo(x2, y2) : ctx.moveTo(x2, y2);
            }
            ctx.stroke();
          }
          ctx.restore();
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 2.0;
          for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3;
            ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.3); ctx.lineTo(Math.cos(a) * r * 1.2, Math.sin(a) * r * 0.3 - 10); ctx.stroke();
          }
          break;
        }
        case 'legend_vajra_bell': {
          ctx.fillStyle = 'rgba(255,179,0,0.28)';
          ctx.beginPath(); ctx.arc(0, -2, r * 0.72, 0, 7); ctx.fill();
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.1;
          for (let i = 0; i < 9; i++) {
            const a = i * Math.PI * 2 / 9 + rot;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * r * 0.5, -2 + Math.sin(a) * r * 0.5);
            ctx.lineTo(Math.cos(a) * r * 1.25, -2 + Math.sin(a) * r * 1.25);
            ctx.stroke();
          }
          break;
        }
        case 'legend_star_vortex': {
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.9;
          for (let arm = 0; arm < 3; arm++) {
            ctx.beginPath();
            for (let s = 0; s <= 14; s++) {
              const u = s / 14, ang = arm * Math.PI * 2 / 3 + u * 4.2 - p * 3, rad = r * (1.15 - u * 0.85);
              const vx = Math.cos(ang) * rad, vy = 3 + Math.sin(ang) * rad * 0.55;
              s ? ctx.lineTo(vx, vy) : ctx.moveTo(vx, vy);
            }
            ctx.stroke();
          }
          break;
        }
        case 'legend_lingxi_gold': {
          ctx.save(); ctx.translate(0, 4); ctx.scale(1, 0.58);
          for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4 + rot * 0.5;
            ctx.save(); ctx.rotate(a);
            ctx.fillStyle = i % 2 ? 'rgba(255,213,79,0.42)' : 'rgba(255,143,0,0.38)';
            ctx.beginPath(); ctx.ellipse(r * 0.55, 0, r * 0.45, r * 0.22, 0, 0, 7); ctx.fill();
            ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.1; ctx.stroke();
            ctx.restore();
          }
          ctx.restore();
          break;
        }
        case 'legend_dragon_elephant': {
          for (const dir of [-1, 1]) {
            ctx.save(); ctx.translate(dir * 7, 2); ctx.scale(1, 0.6); ctx.rotate(dir * (0.6 + p * 2.4));
            ctx.strokeStyle = dir < 0 ? spec.primary : spec.secondary; ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.arc(0, 0, r * 0.68, 0, 7); ctx.stroke();
            for (let i = 0; i < 8; i++) {
              const a = i * Math.PI / 4;
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * 0.68, Math.sin(a) * r * 0.68); ctx.stroke();
            }
            ctx.restore();
          }
          break;
        }
        case 'legend_feixian_beam': {
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.arc(0, -5, r * 0.85, Math.PI * 0.85, Math.PI * 2.15); ctx.stroke();
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.3;
          for (let i = 0; i < 11; i++) {
            const a = Math.PI + (i / 10) * Math.PI;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * r * 0.55, -5 + Math.sin(a) * r * 0.55);
            ctx.lineTo(Math.cos(a) * r * 1.18, -5 + Math.sin(a) * r * 1.18);
            ctx.stroke();
          }
          break;
        }
        case 'legend_celestial_mandate': {
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.0;
          ctx.strokeRect(-r * 0.65, -r * 0.32, r * 1.3, r * 0.64);
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 1.6;
          for (const px2 of [-r * 0.72, -r * 0.25, r * 0.25, r * 0.72]) {
            ctx.beginPath(); ctx.moveTo(px2, 6); ctx.lineTo(px2, -14 - p * 8); ctx.stroke();
          }
          break;
        }
        case 'legend_ashura_blood': {
          ctx.fillStyle = 'rgba(211,47,47,0.34)';
          ctx.beginPath(); ctx.arc(0, 2, r * 0.95, 0, Math.PI); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.2;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath(); ctx.arc((i - 1) * 6, 0, r * (0.65 + i * 0.18), -0.8, 0.8); ctx.stroke();
          }
          break;
        }
        case 'legend_gu_monarch': {
          ctx.save(); ctx.translate(0, 4); ctx.scale(1, 0.54);
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.9;
          ctx.beginPath();
          for (let i = 0; i <= 6; i++) {
            const a = i * Math.PI / 3 + rot;
            const hx = Math.cos(a) * r * 0.95, hy = Math.sin(a) * r * 0.95;
            i ? ctx.lineTo(hx, hy) : ctx.moveTo(hx, hy);
          }
          ctx.stroke();
          ctx.restore();
          ctx.fillStyle = spec.secondary;
          for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3 + p * 2;
            ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.4 - p * 6, 2.3, 0, 7); ctx.fill();
          }
          break;
        }
        case 'legend_nine_yin_mirror': {
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.0;
          ctx.beginPath(); ctx.ellipse(0, -2, r * 0.58, r * 0.82, 0, 0, 7); ctx.stroke();
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.5;
          for (let c = -2; c <= 2; c++) {
            ctx.beginPath(); ctx.moveTo(-r * 0.6, c * 3); ctx.quadraticCurveTo(0, c * 3 - 4, r * 0.85, c * 3 + 2); ctx.stroke();
          }
          break;
        }
        case 'legend_guangling_zither': {
          const mScale = 1 + (fx.moveIndex || 0) * 0.14;
          ctx.rotate(fx.angle);
          for (let s = -3; s <= 3; s++) {
            ctx.strokeStyle = s === 0 ? spec.secondary : spec.primary;
            ctx.lineWidth = s === 0 ? 2.2 : 1.1;
            ctx.beginPath();
            ctx.moveTo(-r * 0.75, s * 2.2);
            ctx.quadraticCurveTo(0, s * 2.2 + Math.sin(p * 10 + s) * 3.5, r * 1.15 * mScale, s * 2.6);
            ctx.stroke();
          }
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.arc(r * 0.45, 0, r * 0.55 * mScale, -1.1, 1.1); ctx.stroke();
          break;
        }
        case 'legend_heaven_seal_brush': {
          const mScale = 1 + (fx.moveIndex || 0) * 0.14;
          ctx.save(); ctx.translate(0, 4); ctx.scale(1, 0.56); ctx.rotate(rot);
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.0;
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const a = i * Math.PI / 4;
            const sx = Math.cos(a) * r * 0.95 * mScale, sy = Math.sin(a) * r * 0.95 * mScale;
            i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
          }
          ctx.stroke();
          ctx.restore();
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 2.4;
          ctx.beginPath(); ctx.moveTo(-r * 0.6, -4); ctx.lineTo(r * 0.6, -4); ctx.moveTo(0, -r * 0.65); ctx.lineTo(0, r * 0.45); ctx.stroke();
          break;
        }
        case 'legend_samsara_threads': {
          const mScale = 1 + (fx.moveIndex || 0) * 0.14;
          ctx.rotate(fx.angle);
          for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4 + rot * 0.5;
            ctx.strokeStyle = i % 2 ? spec.primary : spec.secondary;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(Math.cos(a + 0.3) * r * 0.6, Math.sin(a + 0.3) * r * 0.6, Math.cos(a) * r * 1.15 * mScale, Math.sin(a) * r * 1.15 * mScale);
            ctx.stroke();
          }
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.1;
          ctx.beginPath(); ctx.arc(0, 0, r * 0.68 * mScale, 0, 7); ctx.stroke();
          break;
        }
        case 'legend_shennong_crucible': {
          ctx.save(); ctx.translate(0, 4); ctx.scale(1, 0.55); ctx.rotate(rot);
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.2;
          ctx.beginPath(); ctx.arc(0, 0, r * 0.92, 0, 7); ctx.stroke();
          ctx.restore();
          for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3 + p * 3;
            ctx.fillStyle = i % 2 ? spec.primary : spec.secondary;
            ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.38 - p * 8, 2.5, 0, 7); ctx.fill();
          }
          break;
        }
        case 'legend_imperial_eight_gates': {
          ctx.save(); ctx.translate(0, 4); ctx.scale(1, 0.56); ctx.rotate(rot);
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.1;
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const a = i * Math.PI / 4;
            const gx = Math.cos(a) * r * 1.05, gy = Math.sin(a) * r * 1.05;
            i ? ctx.lineTo(gx, gy) : ctx.moveTo(gx, gy);
          }
          ctx.stroke();
          ctx.restore();
          for (let i = 0; i < 4; i++) {
            const a = i * Math.PI / 2 + rot * 0.5;
            const bx = Math.cos(a) * r * 0.78, by2 = 2 + Math.sin(a) * r * 0.42;
            ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(bx, by2); ctx.lineTo(bx, by2 - 11); ctx.stroke();
            ctx.fillStyle = spec.secondary;
            ctx.beginPath(); ctx.moveTo(bx, by2 - 11); ctx.lineTo(bx + 6, by2 - 8.5); ctx.lineTo(bx, by2 - 6); ctx.closePath(); ctx.fill();
          }
          break;
        }
        case 'legend_sovereign_edict': {
          ctx.fillStyle = spec.primary;
          ctx.fillRect(-r * 0.42, -r * 0.42 - 4, r * 0.84, r * 0.65);
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.8;
          ctx.strokeRect(-r * 0.42, -r * 0.42 - 4, r * 0.84, r * 0.65);
          for (let i = 0; i < 4; i++) {
            const a = i * Math.PI / 2 + p * 2.5;
            ctx.fillStyle = spec.secondary;
            ctx.fillRect(Math.cos(a) * r * 0.85 - 2, Math.sin(a) * r * 0.45 - 3, 4, 6);
          }
          break;
        }
        case 'legend_jade_nirvana_lotus': {
          ctx.save(); ctx.translate(0, 3); ctx.scale(1, 0.58);
          for (let i = 0; i < 9; i++) {
            const a = i * Math.PI * 2 / 9 + rot * 0.6;
            ctx.save(); ctx.rotate(a);
            ctx.fillStyle = i % 2 ? spec.primary : spec.secondary;
            ctx.beginPath(); ctx.ellipse(r * 0.52, 0, r * 0.44, r * 0.19, 0, 0, 7); ctx.fill();
            ctx.restore();
          }
          ctx.restore();
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.5;
          for (let i = -1; i <= 1; i++) {
            ctx.beginPath(); ctx.moveTo(i * 5, 2); ctx.lineTo(i * 7, -11 - p * 5); ctx.stroke();
          }
          break;
        }
        case 'legend_kunpeng_wings': {
          ctx.rotate(fx.angle);
          for (const dir of [-1, 1]) {
            ctx.strokeStyle = dir < 0 ? spec.primary : spec.accent;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(r * 0.45, dir * r * 0.85, -r * 0.55, dir * r * 1.15);
            ctx.stroke();
          }
          ctx.fillStyle = spec.secondary;
          for (let i = 0; i < 5; i++) {
            ctx.beginPath(); ctx.arc((i - 2) * 4.5, Math.sin(i + p * 6) * 4, 2.0, 0, 7); ctx.fill();
          }
          break;
        }
        case 'legend_samsara_wheel_reversal': {
          ctx.save(); ctx.translate(0, 3); ctx.scale(1, 0.58); ctx.rotate(-p * 3.2);
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.2;
          ctx.beginPath(); ctx.arc(0, 0, r * 0.95, 0, 7); ctx.stroke();
          for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3;
            ctx.strokeStyle = i % 2 ? spec.secondary : spec.accent;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95); ctx.stroke();
          }
          ctx.restore();
          break;
        }
        case 'legend_little_li_dagger':
        default: {
          ctx.save(); ctx.rotate(fx.angle);
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 2.6;
          ctx.beginPath(); ctx.moveTo(-r * 0.8, 0); ctx.lineTo(r * 1.55, 0); ctx.stroke();
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.arc(r * 0.9, 0, r * 0.36, 0, 7); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(r * 0.9 - 6, 0); ctx.lineTo(r * 0.9 + 6, 0); ctx.moveTo(r * 0.9, -6); ctx.lineTo(r * 0.9, 6); ctx.stroke();
          ctx.restore();
          break;
        }
      }
    },

    // Larger, three-beat legendary presentation; signature presence never masks an authored motif.
    // A local apparition, distinct from the central legacy sigil. Normalized world-space geometry.
    drawLegendaryApparition(ctx, scene, ink, phase, radius, reduced, low) {
      const emerge=clamp((phase-scene.gatherEnd)/.22,0,1),decay=1-clamp((phase-.77)/.23,0,1);
      if(emerge<=0||decay<=0)return;
      const rot=reduced?0:phase*.35, n=low?4:8;
      ctx.save();ctx.scale(radius,radius);ctx.translate(0,(1-emerge)*.25);ctx.globalAlpha*=emerge*decay;
      ctx.strokeStyle=ink.primary;ctx.fillStyle=ink.secondary;ctx.lineWidth=1.65/radius;ctx.lineCap='round';ctx.lineJoin='round';
      const line=(points,close=false)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));if(close)ctx.closePath();ctx.stroke();};
      const oval=(x,y,rx,ry,a=0)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,a,0,Math.PI*2);ctx.stroke();};
      const disc=(x,y,r)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};
      const feather=(x,y,a,len)=>{ctx.save();ctx.translate(x,y);ctx.rotate(a);line([[0,0],[len*.35,-len*.17],[len,0],[len*.35,len*.17]],true);ctx.restore();};
      const pillar=(x,y,h)=>{line([[x-.07,y],[x-.07,y-h],[x+.07,y-h],[x+.07,y]],true);line([[x-.13,y-h],[x,y-h-.1],[x+.13,y-h]]);};
      const petal=(a,len)=>{ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-len*.5,-len*.4,-len*.3,-len*.85,0,-len);ctx.bezierCurveTo(len*.3,-len*.85,len*.5,-len*.4,0,0);ctx.stroke();ctx.restore();};
      switch(scene.family){
        case 'sword_constellation':
          for(let i=0;i<n;i++){const a=(i/(n-1)-.5)*2.7;ctx.save();ctx.translate(Math.sin(a)*.92,-.36-Math.cos(a)*.65);ctx.rotate(a*.65);line([[0,.3],[0,-.3],[-.06,-.18],[0,-.4],[.06,-.18],[0,-.3]]);line([[-.1,.15],[.1,.15]]);ctx.restore();}break;
        case 'dragon_descent':
          ctx.beginPath();ctx.moveTo(-1,.3);ctx.bezierCurveTo(-1.05,-.55,-.22,-.9,.5,-.46);ctx.bezierCurveTo(1.12,-.05,.4,.42,.12,-.05);ctx.stroke();
          line([[.5,-.46],[.5,-.7],[.72,-.56],[.9,-.6],[1.05,-.39],[.76,-.32],[.5,-.46]]);line([[.61,-.63],[.57,-.89],[.76,-.7]]);
          for(let i=0;i<(low?3:6);i++){const x=-.86+i*.2;line([[x,-.28-Math.sin(i*.5)*.35],[x-.1,-.54-Math.sin(i*.5)*.35]]);}oval(.88,-.45,.03,.03);break;
        case 'sky_lance':
          ctx.save();ctx.rotate(-.5);line([[-.1,.75],[-.1,-1.05],[0,-1.34],[.1,-1.05],[.1,.75]],true);line([[-.34,.45],[.34,.45]]);ctx.restore();
          for(let i=0;i<3;i++){const x=(i-1)*.35;line([[x+.35,-.85],[x-.05,.6]]);}break;
        case 'taiji_court':
          oval(0,-.1,.88,.48,rot);ctx.beginPath();ctx.moveTo(0,-.58);ctx.bezierCurveTo(-.65,-.58,-.65,-.1,0,-.1);ctx.bezierCurveTo(.65,-.1,.65,.38,0,.38);ctx.stroke();
          disc(-.22,-.3,.06);disc(.22,.1,.06);for(let i=0;i<4;i++){const a=i*Math.PI/2;pillar(Math.cos(a),.36+Math.sin(a)*.18,.34);}break;
        case 'phoenix_counter':
        case 'sonic_wings':
        case 'kunpeng_horizon':
          for(const dir of [-1,1]){ctx.beginPath();ctx.moveTo(0,-.24);ctx.quadraticCurveTo(dir*.6,-1.05,dir*1.2,-.64);ctx.quadraticCurveTo(dir*.55,-.24,dir*.18,.2);ctx.stroke();for(let i=0;i<(low?3:6);i++)feather(dir*(.25+i*.14),-.44-i*.045,dir*(.4+i*.09),.25+i*.04);}
          line([[0,.36],[0,-.55],[.14,-.75],[.22,-.55],[0,-.55]]);
          if(scene.family==='sonic_wings')for(let i=0;i<3;i++)oval(0,.25+i*.12,.45+i*.19,.13+i*.04);
          if(scene.family==='phoenix_counter')oval(0,-.3,.23,.34);break;
        case 'moon_steps':
          for(let i=0;i<(low?3:6);i++){const a=i*.66+rot,x=Math.cos(a)*(.3+i*.1),y=Math.sin(a)*.35;oval(x,y,.16,.065,-.4);line([[x-.07,y-.13],[x+.07,y-.13]]);}oval(0,.5,.98,.22);break;
        case 'shadow_court':
          ctx.beginPath();ctx.arc(0,-.4,.72,-2.2,.65);ctx.arc(.24,-.54,.62,.65,-2.2,true);ctx.stroke();
          for(let i=0;i<3;i++){const x=(i-1)*.62;line([[x,.2],[x-.13,-.02],[x,-.2],[x+.13,-.02],[x,.2],[x-.25,.55],[x+.25,.55],[x,.2]]);}break;
        case 'void_maw':
          oval(0,-.2,.85,.52,-.3);oval(0,-.2,.61,.37,.25);
          for(let i=0;i<n;i++){const a=i*Math.PI*2/n+rot;line([[Math.cos(a)*1.06,Math.sin(a)*.7-.2],[Math.cos(a)*.71,Math.sin(a)*.44-.2],[Math.cos(a+.18)*.5,Math.sin(a+.18)*.3-.2]]);}break;
        case 'blood_bloom':
        case 'jade_garden':
        case 'lotus_sanctuary':
          ctx.save();ctx.translate(0,-.14);for(let i=0;i<n;i++)petal(i*Math.PI*2/n,.85);ctx.restore();
          if(scene.family==='jade_garden')for(let i=0;i<3;i++){const x=(i-1)*.74;line([[x,.45],[x,.05]]);oval(x-.1,.04,.15,.065,-.5);oval(x+.1,-.08,.15,.065,.5);}
          if(scene.family==='lotus_sanctuary'){line([[-.44,.25],[-.35,-.55],[0,-.75],[.35,-.55],[.44,.25]],true);oval(0,.25,.44,.12);}break;
        case 'seal_obelisk':
        case 'deity_throne':
          for(let i=0;i<3;i++){const x=(i-1)*.6;pillar(x,.4,.95-(i%2)*.22);line([[x-.04,-.3],[x+.05,-.2],[x-.05,-.08],[x+.05,.03]]);}
          if(scene.family==='deity_throne'){oval(0,-.91,.22,.22);line([[-.5,-.55],[0,-.7],[.5,-.55]]);}else line([[-.88,-.8],[0,-1.12],[.88,-.8]]);break;
        case 'thread_loom':
          line([[-.95,-.86],[.95,-.86]]);for(let i=0;i<(low?3:7);i++){const x=(i/(low?2:6)-.5)*1.6;ctx.beginPath();ctx.moveTo(x,-.86);ctx.bezierCurveTo(x*.7,-.32,-x*.5,.05,x*.65,.55);ctx.stroke();oval(x,-.86,.04,.04);}line([[-.64,.55],[.64,.55]]);break;
        case 'imperial_gates':
          for(let i=0;i<(low?3:5);i++){const x=(i/(low?2:4)-.5)*1.8,y=.2+Math.abs(x)*.2;pillar(x,y,.48);line([[x-.12,y-.45],[x,y-.62],[x+.12,y-.45]]);}line([[-1,.55],[1,.55]]);break;
        case 'karma_orbit':
        case 'star_orrery':
          for(let i=0;i<3;i++)oval(0,-.2,.83,.23,i*Math.PI/3+rot);
          for(let i=0;i<(low?4:8);i++){const a=i*Math.PI*2/(low?4:8)+rot;oval(Math.cos(a)*.95,Math.sin(a)*.58-.2,.07,.07);}
          if(scene.family==='karma_orbit')line([[0,-.9],[.24,-.62],[-.24,-.62],[0,-.9]]);break;
        case 'storm_spire':
          line([[-.55,-.8],[-.17,-.85],[.1,-.7],[.6,-.76],[.85,-.54],[-.8,-.54]],true);
          for(let i=0;i<3;i++){const x=(i-1)*.45;line([[x,-.53],[x-.19,-.1],[x+.08,-.18],[x-.15,.52]]);}break;
        case 'beast_avatar':
          line([[-.75,-.2],[-.72,-.85],[-.37,-.58],[0,-.68],[.37,-.58],[.72,-.85],[.75,-.2],[.45,.25],[0,.6],[-.45,.25]],true);
          line([[-.5,-.25],[-.17,-.15],[0,.02],[.17,-.15],[.5,-.25]]);line([[-.18,.22],[0,.32],[.18,.22]]);
          for(const d of [-1,1])line([[d*.2,.2],[d*.27,.48],[d*.38,.2]]);break;
        case 'earth_bastion':
          line([[-1,.45],[-.78,-.28],[-.5,-.12],[-.1,-.95],[.2,-.55],[.42,-.75],[.68,-.02],[1,.45]],true);
          line([[-.1,-.95],[-.24,.2],[.08,.04],[.22,.45]]);line([[-1,.52],[1,.52]]);break;
        case 'epoch_dial':
          oval(0,-.2,.8,.8);for(let i=0;i<(low?6:12);i++){const a=i*Math.PI*2/(low?6:12);line([[Math.cos(a)*.67,Math.sin(a)*.67-.2],[Math.cos(a)*.8,Math.sin(a)*.8-.2]]);}
          line([[-.28,-.48],[0,-.2],[.43,-.2]]);line([[-.2,-.64],[.2,-.64],[-.12,.22],[.12,.22],[-.2,-.64]]);break;
        case 'ink_landscape':
          line([[-.9,-.65],[.9,-.65],[.9,.45],[-.9,.45]],true);oval(-.9,-.1,.08,.66);oval(.9,-.1,.08,.66);
          line([[-.75,.1],[-.4,-.45],[-.1,-.05],[.2,-.5],[.68,.13]]);ctx.beginPath();ctx.moveTo(.3,-.02);ctx.bezierCurveTo(-.4,.13,.5,.23,-.2,.35);ctx.stroke();break;
        case 'grave_procession':
          for(let i=0;i<(low?3:5);i++){const x=(i/(low?2:4)-.5)*1.6,y=Math.abs(x)*.2;line([[x-.12,y+.35],[x-.12,y-.45],[x,y-.6],[x+.12,y-.45],[x+.12,y+.35]],true);line([[x,y-.3],[x,y+.05]]);}oval(0,.5,1,.16);break;
        case 'ocean_pillars':
          for(let i=0;i<3;i++){const y=i*.25-.12;ctx.beginPath();ctx.moveTo(-1,y);ctx.bezierCurveTo(-.5,y-.48,.2,y+.35,1,y-.2);ctx.stroke();}
          for(const d of [-1,1]){ctx.beginPath();ctx.moveTo(d*.84,.35);ctx.bezierCurveTo(d*1.14,-.85,d*.3,-1,d*.48,-.45);ctx.stroke();}break;
        case 'fortune_table':
          for(const d of [-1,1]){const x=d*.45;line([[x-.24,-.7],[x+.24,-.7],[x+.24,-.22],[x-.24,-.22]],true);for(let i=0;i<(d<0?3:5);i++)disc(x+(i%2-.5)*.2,-.62+Math.floor(i/2)*.15,.025);}
          line([[-.85,.05],[.85,.05],[.65,.45],[-.65,.45]],true);for(let i=0;i<3;i++)oval((i-1)*.35,.2,.08,.08);break;
      }
      ctx.restore();
    },

    legendaryApexFrame(scene, p, reduced, compact) {
      const phase=reduced?.55:clamp(p,0,1);
      const reveal=clamp((phase-scene.gatherEnd)/.22,0,1),release=clamp((phase-scene.releaseAt)/.18,0,1);
      return {phase,reveal,release,radius:compact?32:(reduced?66:60+24*Math.sin(Math.min(1,reveal)*Math.PI/2))};
    },

    // Conductors and recipient seals use only authoritative snapshot positions.
    drawLegendaryConduits(ctx, fx, frame, ink, low, reduced) {
      if(frame.phase<.2||frame.phase>.78)return;
      const pts=Array.isArray(fx.targetPoints)?fx.targetPoints:[],cap=low?3:R.LEGENDARY_APEX_BUDGET.maxRecipients;
      ctx.save();ctx.lineWidth=1.1;ctx.globalAlpha*=.36;
      if(Number.isFinite(fx.originX)&&Number.isFinite(fx.originY)&&Number.isFinite(fx.x)&&Number.isFinite(fx.y)){
        let dx=fx.originX-fx.x,dy=fx.originY-fx.y;const len=Math.hypot(dx,dy),crop=len>180?180/len:1;
        if(len>10){ctx.strokeStyle=ink.primary;ctx.beginPath();ctx.moveTo(dx*crop,dy*crop+7);ctx.quadraticCurveTo(dx*crop*.5,dy*crop*.5-16,0,0);ctx.stroke();}
      }
      for(let i=0;i<pts.length&&i<cap;i++){
        const pt=pts[i];if(!pt||!Number.isFinite(pt.x)||!Number.isFinite(pt.y)||!Number.isFinite(fx.x)||!Number.isFinite(fx.y))continue;
        const x=pt.x-fx.x,y=pt.y-fx.y+7;ctx.strokeStyle=pt.team?'#b3ffe3':'#ffc0ca';
        ctx.beginPath();ctx.ellipse(x,y,9+frame.release*5,4+frame.release*2,0,0,Math.PI*2);ctx.stroke();
        if(pt.team&&Math.hypot(x,y)>12){ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(x*.5,y*.5-18,x,y);ctx.stroke();}
        if(!reduced){ctx.beginPath();ctx.moveTo(x,y-5);ctx.lineTo(x,y-12-frame.release*6);ctx.stroke();}
      }
      ctx.restore();
    },

    drawLegendaryRelease(ctx,scene,ink,frame,angle,reduced,low){
      const q=clamp((frame.phase-scene.releaseAt)/.23,0,1),strength=reduced?.5:Math.sin(q*Math.PI);
      if(strength<=.01)return;
      ctx.save();ctx.globalAlpha*=strength*.76;ctx.strokeStyle=ink.accent||ink.primary;ctx.fillStyle=ink.primary;ctx.lineWidth=low?1.5:2.1;
      const r=frame.radius,d=reduced?.65:q,n=low?3:6;
      if(/sword|lance|counter|shadow/.test(scene.family)){
        ctx.rotate(Number.isFinite(angle)?angle:0);
        for(let i=0;i<n;i++){const y=(i-(n-1)/2)*9,front=r*(.25+d*.8);ctx.beginPath();ctx.moveTo(-r*.6,y);ctx.lineTo(front,y*.3);ctx.lineTo(front-9,y*.3-4);ctx.stroke();}
      }else if(/garden|sanctuary|sonic|bloom/.test(scene.family)){
        for(let i=0;i<n;i++){const a=i*Math.PI*2/n,x=Math.cos(a)*r*.7,y=Math.sin(a)*r*.25;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-10,y-r*d*.6,x+12,y-r*d,x,y-r*(.25+d*.55));ctx.stroke();}
      }else if(/void|karma|orrery|epoch/.test(scene.family)){
        for(let i=0;i<n;i++){const a=i*Math.PI*2/n+(reduced?0:d*.5),outer=r*(1.2-d*.45),inner=r*.16;ctx.beginPath();ctx.moveTo(Math.cos(a)*outer,Math.sin(a)*outer*.6);ctx.quadraticCurveTo(Math.cos(a+.3)*r*.5,Math.sin(a+.3)*r*.35,Math.cos(a+.5)*inner,Math.sin(a+.5)*inner);ctx.stroke();}
      }else if(/gates|obelisk|throne|spire|landscape|procession/.test(scene.family)){
        for(let i=0;i<n;i++){const x=(i-(n-1)/2)*r*.25;ctx.beginPath();ctx.moveTo(x,r*.4);ctx.lineTo(x,r*(.2-d*1.1));ctx.stroke();}
      }else{
        for(let i=0;i<(low?2:3);i++){ctx.beginPath();ctx.ellipse(0,12,r*(.7+d*.65+i*.13),r*(.22+d*.15+i*.06),0,.12,Math.PI*1.9);ctx.stroke();}
      }
      ctx.restore();
    },

    drawLegendaryArtVfx(ctx, fx, p, reduced, full = true) {
      if(!ctx||!fx)return false;
      const art=R.LEGENDARY_ART_VISUALS[fx.techId],scene=R.LEGENDARY_SCENES[fx.techId]||{family:'star_orrery',variant:0,gatherEnd:.18,releaseAt:.46};
      const path=art&&R.resolvePathVisualSignature(art.path),ink=LEGENDARY_MOTIFS[(art&&art.motif)||fx.motif||fx.fxKind]||path||{primary:'#ffd166',secondary:'#9378c9',accent:'#fff8dd'};
      const low=this.resolveQuality()==='low',frame=this.legendaryApexFrame(scene,p,reduced,!full);
      ctx.save();ctx.globalAlpha*=frame.phase>.72?(1-frame.phase)/.28:1;
      if(full){
        // Transparent local ground reflection; it is decorative, not an AoE/range indicator.
        ctx.save();ctx.fillStyle=ink.secondary;ctx.globalAlpha*=.11;ctx.beginPath();ctx.ellipse(0,12,frame.radius*1.3,frame.radius*.44,0,0,Math.PI*2);ctx.fill();ctx.restore();
        if(!low&&!reduced){ctx.shadowColor=ink.primary;ctx.shadowBlur=4;}
        this.drawLegendaryApparition(ctx,scene,ink,frame.phase,frame.radius,reduced,low);
        this.drawLegendaryConduits(ctx,fx,frame,ink,low,reduced);
        this.drawLegendaryRelease(ctx,scene,ink,frame,fx.angle,reduced,low);
      }
      // Preserve the authored identity as an inner sigil, not the whole new spectacle.
      const coreScale=full?(.38+frame.reveal*.18):.48;
      ctx.save();ctx.scale(coreScale,coreScale);
      this.drawLegacyLegendaryArtVfx(ctx,fx,frame.phase,reduced);ctx.restore();
      if(full&&!low&&frame.phase>.3&&frame.phase<.85){
        ctx.strokeStyle=ink.accent||'#fff4ce';ctx.lineWidth=1.2;ctx.globalAlpha*=.55;
        const count=5+scene.variant%4;
        for(let i=0;i<count;i++){const a=i*Math.PI*2/count+(reduced?0:frame.phase*.45),d=frame.radius*(.9+frame.release*.38);ctx.beginPath();ctx.moveTo(Math.cos(a)*d,Math.sin(a)*d*.44+10);ctx.lineTo(Math.cos(a)*(d+7),Math.sin(a)*(d+7)*.44+10);ctx.stroke();}
      }
      ctx.restore();return true;
    },

    drawLegendaryRelicScene(ctx, fx, p, reduced, full = true) {
      const spec=R.LEGENDARY_GEAR_VISUALS[fx.relicId];if(!ctx||!spec)return false;
      const scene=R.LEGENDARY_RELIC_SCENES[spec.id],low=this.resolveQuality()==='low',frame=this.legendaryApexFrame(scene,p,reduced,!full);
      const ink={primary:spec.primary,secondary:spec.secondary,accent:'#fff4da'};
      ctx.save();
      if(full){
        ctx.globalAlpha*=.8*(frame.phase>.72?(1-frame.phase)/.28:1);
        if(!low&&!reduced){ctx.shadowColor=spec.primary;ctx.shadowBlur=3;}
        this.drawLegendaryApparition(ctx,scene,ink,frame.phase,frame.radius*.9,reduced,low);
        this.drawLegendaryRelease(ctx,scene,ink,frame,fx.angle,reduced,low);
        ctx.strokeStyle=spec.secondary;ctx.lineWidth=1.4;
        if(spec.slot==='ARMOR'){ctx.beginPath();ctx.arc(0,-7,frame.radius*.55,Math.PI,0);ctx.stroke();}
        else if(spec.slot==='ACCESSORY'){ctx.save();ctx.rotate(reduced?Math.PI/4:Math.PI/4+frame.phase*.2);ctx.strokeRect(-27,-27,54,54);ctx.restore();}
      }
      this.drawLegendaryRelicGlyph(ctx,spec,full?24+frame.reveal*10:19,reduced?0:frame.phase*2,reduced);
      ctx.restore();return true;
    },

    drawLegendaryPassiveCrown(ctx, lp, phase, reduced, low) {
      const spec=LEGENDARY_MOTIFS[lp.fxKind];if(!spec)return;
      const t=reduced?.5:phase;
      ctx.save();ctx.strokeStyle=spec.primary;ctx.fillStyle=spec.accent;ctx.lineWidth=1.1;ctx.globalAlpha*=.72;
      if(lp.fxKind==='legend_aura_mingyu'){
        for(let i=0;i<(low?3:5);i++){const a=i*Math.PI*2/(low?3:5)+t*.4,x=Math.cos(a)*13,y=Math.sin(a)*4;ctx.beginPath();ctx.ellipse(x,y,3,6,a,0,Math.PI*2);ctx.stroke();}
        ctx.beginPath();ctx.arc(0,-13,8,0,Math.PI*2);ctx.stroke();
      }else if(lp.fxKind==='legend_aura_nine_yang'){
        ctx.beginPath();ctx.arc(0,-10,16,Math.PI,Math.PI*2);ctx.stroke();
        for(let i=0;i<(low?3:9);i++){const a=Math.PI+i*Math.PI/(low?2:8);ctx.beginPath();ctx.moveTo(Math.cos(a)*18,-10+Math.sin(a)*18);ctx.lineTo(Math.cos(a)*21,-10+Math.sin(a)*21);ctx.stroke();}
      }else if(lp.fxKind==='legend_aura_dugu'){
        for(let i=0;i<(low?3:5);i++){const a=i*Math.PI*2/(low?3:5)+t*.5,x=Math.cos(a)*17,y=-11+Math.sin(a)*7;ctx.beginPath();ctx.moveTo(x-3,y+3);ctx.lineTo(x+3,y-3);ctx.moveTo(x-3,y);ctx.lineTo(x,y+3);ctx.stroke();}
      }
      ctx.restore();
    },

    drawLegacyLegendaryArtVfx(ctx, fx, p, reduced) {
      const art = R.LEGENDARY_ART_VISUALS[fx.techId];
      const low = this.resolveQuality() === 'low';
      const phase = reduced ? 0.5 : p;
      const r = reduced ? 42 : 34 + Math.sin(Math.min(1, p / 0.75) * Math.PI / 2) * 19;
      const motif = (art && art.motif) || fx.motif || fx.fxKind;
      const path = art && R.resolvePathVisualSignature(art.path);
      const ink = LEGENDARY_MOTIFS[motif] || path || { primary: '#ffd166', secondary: '#90e0ef' };
      ctx.save();
      ctx.strokeStyle = ink.primary; ctx.lineWidth = 2.2;
      ctx.globalAlpha *= p < 0.18 ? 0.5 + p * 2 : 0.75;
      ctx.beginPath(); ctx.ellipse(0, 5, r * 1.25, r * 0.52, 0, 0, 7); ctx.stroke();
      if (!low) {
        ctx.strokeStyle = ink.secondary; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(0, 5, r * 1.45, r * 0.61, 0, 0, 7); ctx.stroke();
      }
      if (p >= 0.13 || reduced) {
        if (LEGENDARY_MOTIFS[motif] && LEGENDARY_MOTIFS[motif].kind === 'cast') {
          this.drawLegendaryCastMotif(ctx, { ...fx, motif }, phase, r, reduced);
        } else {
          if (art && path) {
            ctx.save(); ctx.scale(2.2, 2.2);
            this.drawPathApexCrownGeometry(ctx, art.path, path, -13, phase * 2.2, true, low || reduced);
            ctx.restore();
          }
          if (fx.signatureVfx) this.drawSignatureSkillVfx(ctx, fx, phase, r * 0.82, reduced);
          else this.drawLegendaryCastMotif(ctx, fx, phase, r, reduced);
        }
      }
      ctx.restore();
    },

    // Twenty-seven authored silhouettes, shared by ambient manifestation and real proc bursts.
    drawLegendaryRelicGlyph(ctx, spec, r, phase, reduced) {
      if (!spec) return false;
      const low = this.resolveQuality() === 'low';
      const t = reduced ? 0 : phase;
      const line = (points, close = false) => {
        ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x * r, y * r) : ctx.moveTo(x * r, y * r));
        if (close) ctx.closePath(); ctx.stroke();
      };
      const circle = (x, y, radius) => { ctx.beginPath(); ctx.arc(x * r, y * r, radius * r, 0, Math.PI * 2); ctx.stroke(); };
      const wing = (side, lift) => line([[0,0],[side * .35,-lift],[side,-.4],[side*.7,.05],[side*.4,-.05]]);
      ctx.save();ctx.strokeStyle = spec.primary;ctx.fillStyle = spec.secondary;ctx.lineWidth = 1.5;
      switch (spec.shape) {
        case 'sky_blade': line([[0,.9],[0,-1.2],[.18,-.7],[0,-1.2],[-.18,-.7]]);line([[-.4,.4],[.4,.4]]);circle(0,0,.65);break;
        case 'mountain': line([[-1,.8],[-.4,-.7],[0,-1.15],[.4,-.4],[1,.8]],true);line([[-.3,.7],[0,-.6],[.3,.7]]);break;
        case 'dragon':
        case 'storm_dragon': {
          const storm = spec.shape === 'storm_dragon';
          const points = Array.from({length:13},(_,i)=>[(i/6-1),Math.sin(i*.8+t)*.4]);line(points);
          line([[.6,-.3],[1.15,-.5],[1,.1],[.6,.3]]);
          if(storm) line([[-.2,-1],[.15,-.4],[-.15,-.2],[.3,.8]]);
          else {circle(-.45,.3,.35);line([[-.6,.7],[-.8,1],[-.2,.75]]);}break;
        }
        case 'moon': ctx.beginPath();ctx.arc(0,0,r,-1.5,1.5);ctx.arc(-r*.45,0,r*.8,1.2,-1.2,true);ctx.stroke();break;
        case 'heart_dart': line([[-1,.45],[.9,-.7],[.45,-.1],[.9,-.7],[.15,-.65]]);circle(-.55,.2,.25);break;
        case 'jade_bamboo': line([[0,1],[0,-1]]);for(const y of [-.6,0,.6]){line([[-.18,y],[.18,y]]);line([[0,y],[.6,y-.35],[.3,y-.4]]);}break;
        case 'war_banner': line([[-.6,1],[-.6,-1.1],[.65,-.9],[.35,-.4],[-.6,-.5]]);line([[.1,.9],[.1,-.3],[.4,-.6]]);break;
        case 'tiger': line([[-.9,-.4],[-.7,-1],[-.3,-.6],[.3,-.6],[.7,-1],[.9,-.4],[.65,.6],[0,1],[-.65,.6]],true);line([[-.6,-.1],[-.2,.1]]);line([[.6,-.1],[.2,.1]]);line([[-.3,.5],[.3,.5]]);break;
        case 'condor': wing(-1,1);wing(1,1);line([[-.3,.4],[0,.9],[.3,.4]]);break;
        case 'peacock': for(let i=0;i<5;i++){const a=(i-2)*.5;line([[0,.8],[Math.sin(a),-Math.cos(a)]]);circle(Math.sin(a),-Math.cos(a),.14);}break;
        case 'phoenix_strings': wing(-1,.65);wing(1,.65);for(let i=-1;i<=1;i++)line([[-.7,i*.22],[.7,i*.22]]);line([[-.4,.4],[0,1.2],[.4,.4]]);break;
        case 'judgment_script': line([[-.7,.8],[.5,-.9],[.75,-1],[.7,-.7]]);line([[-.9,-.6],[-.2,-.6],[-.2,.1],[.4,.1]]);line([[-.8,-.2],[.1,-.2]]);break;
        case 'fate_threads': for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(-r,(k-1)*r*.35);ctx.bezierCurveTo(-r*.3,-r*(1-k*.25),r*.3,r*(1-k*.25),r,(k-1)*r*.35);ctx.stroke();}circle(.6,-.3,.2);break;
        case 'bodhi': circle(0,0,.85);for(let i=0;i<8;i++){const a=i*Math.PI/4;circle(Math.cos(a)*.85,Math.sin(a)*.85,.13);}line([[-.3,1],[0,1.35],[.3,1]]);break;
        case 'devouring_maw': line([[-1,-.7],[-.7,.7],[0,1],[.7,.7],[1,-.7],[.5,-.2],[.3,-.7],[0,0],[-.3,-.7],[-.5,-.2]],true);circle(0,.4,.25);break;
        case 'flower_needles': for(let i=0;i<5;i++){const a=i*Math.PI*2/5;circle(Math.cos(a)*.5,Math.sin(a)*.5,.38);line([[0,0],[Math.cos(a)*1.25,Math.sin(a)*1.25]]);}break;
        case 'tempest_fan': line([[-1,-.6],[0,1],[1,-.6]]);ctx.beginPath();ctx.arc(0,r,r*1.8,-2.2,-.94);ctx.stroke();for(let i=-1;i<=1;i++)line([[0,1],[i*.5,-.65]]);break;
        case 'nine_palaces': ctx.strokeRect(-r,-r,r*2,r*2);for(let i=-1;i<=1;i++){line([[i/3,-1],[i/3,1]]);line([[-1,i/3],[1,i/3]]);}circle(0,0,.4);break;
        case 'golden_abacus': ctx.strokeRect(-r,-r*.7,r*2,r*1.4);for(let i=-1;i<=1;i++){line([[i*.55,-.7],[i*.55,.7]]);circle(i*.55,i*.17,.17);}break;
        case 'crane_wings': wing(-1,1.25);wing(1,1.25);line([[0,.6],[0,-.9],[.3,-1.1]]);break;
        case 'kirin': line([[-.7,.7],[-.6,-.2],[-.3,-.7],[0,-1.2],[.3,-.7],[.6,-.2],[.7,.7],[0,1]],true);line([[-.8,-.8],[-.3,-.4],[.3,-.4],[.8,-.8]]);circle(0,.15,.3);break;
        case 'tortoise': ctx.beginPath();ctx.ellipse(0,0,r,r*.8,0,0,7);ctx.stroke();line([[-.5,0],[-.25,-.45],[.25,-.45],[.5,0],[.25,.45],[-.25,.45]],true);for(let i=0;i<4;i++){const a=i*Math.PI/2+.6;line([[Math.cos(a)*.8,Math.sin(a)*.65],[Math.cos(a)*1.35,Math.sin(a)*1.1]]);}break;
        case 'samsara': circle(0,0,1);circle(0,0,.4);for(let i=0;i<6;i++){const a=i*Math.PI/3+t*.2;line([[Math.cos(a)*.4,Math.sin(a)*.4],[Math.cos(a),Math.sin(a)]]);}break;
        case 'star_beads': for(let i=0;i<7;i++){const a=i*Math.PI*2/7;circle(Math.cos(a)*.85,Math.sin(a)*.85,.12);}line([[-.3,0],[.3,0],[0,-.4],[0,.4]]);break;
        case 'imperial_seal': ctx.strokeRect(-r*.7,-r*.65,r*1.4,r*1.3);line([[-.35,-.35],[.35,-.35],[0,-.35],[0,.4]]);line([[-.4,.1],[.4,.1]]);line([[-.4,-.8],[0,-1.15],[.4,-.8]]);break;
        case 'dragon_phoenix': ctx.beginPath();ctx.arc(0,0,r,-.3,2.7);ctx.stroke();ctx.strokeStyle=spec.secondary;ctx.beginPath();ctx.arc(0,0,r*.7,2.7,6);ctx.stroke();wing(1,.8);line([[-.8,.5],[-.4,.1],[-.65,-.5]]);break;
        default: circle(0,0,.8);
      }
      if (!low && !reduced) {
        ctx.strokeStyle=spec.secondary;ctx.lineWidth=.8;
        for(let i=0;i<3;i++){const a=t*.7+i*Math.PI*2/3;circle(Math.cos(a)*1.45,Math.sin(a)*1.1,.055);}
      }
      ctx.restore();return true;
    },

    drawLegendaryEquipmentAura(ctx, n, ap, by) {
      const gear = (ap && ap.legendaryGear) || [];
      if (!gear.length) return false;
      const reduced = this.isReducedMotion();
      const phase = reduced ? 0 : this.t + (n.n || 0) * .37;
      ctx.save();
      for (const spec of gear) {
        ctx.save();
        if(spec.slot === 'WEAPON') ctx.translate(11, -12 + by);
        else if(spec.slot === 'ARMOR') ctx.translate(0, -10 + by);
        else ctx.translate(-12, -18 + by);
        ctx.globalAlpha *= spec.slot === 'ARMOR' ? .42 : .8;
        this.drawLegendaryRelicGlyph(ctx,spec,spec.slot==='ARMOR'?15:9,phase,reduced);
        ctx.restore();
      }
      ctx.restore();return true;
    },

    // Weapon-family flourishes keep ordinary attacks readable and distinct without
    // changing combat results. Geometry is deterministic and uses only cast snapshots.
    drawWeaponMotionVfx(ctx, fx, p, r, reduced, intensity) {
      if (!ctx || !fx) return false;
      const spec = R.WEAPON_MOTION_VFX[fx.weaponType];
      if (!spec) return false;
      const low = this.resolveQuality ? this.resolveQuality() === 'low' : false;
      const phase = reduced ? 0.5 : clamp(p, 0, 1);
      const scale = (0.72 + clamp(fx.tier || 1, 1, 7) * 0.055) * (0.82 + phase * 0.2);
      const reach = r * scale, alpha = clamp(intensity === undefined ? 1 : intensity, 0, 1);
      const rot = reduced ? 0 : (phase - 0.5) * 0.38;
      const ticks = low || reduced ? 4 : 7;
      ctx.save();
      ctx.globalAlpha *= alpha;
      ctx.translate(0, 3);
      ctx.rotate((Number.isFinite(fx.angle) ? fx.angle : 0) + rot);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = spec.primary; ctx.fillStyle = spec.primary;
      ctx.lineWidth = Math.max(1, 1.25 + scale * 0.45);
      switch (spec.shape) {
        case 'crescent':
          ctx.beginPath(); ctx.arc(0, 0, reach, -1.08, 0.86); ctx.stroke();
          ctx.strokeStyle = spec.secondary; ctx.lineWidth *= 0.62;
          ctx.beginPath(); ctx.arc(0, 0, reach * 0.82, -0.84, 0.55); ctx.stroke();
          break;
        case 'broad_arc':
          ctx.beginPath(); ctx.moveTo(-reach * 0.68, -reach * 0.8);
          ctx.quadraticCurveTo(reach * 0.82, -reach * 0.72, reach * 0.95, reach * 0.24);
          ctx.quadraticCurveTo(reach * 0.2, reach * 0.04, -reach * 0.68, -reach * 0.8);
          ctx.fill(); ctx.strokeStyle = spec.secondary; ctx.lineWidth *= 0.5;
          ctx.beginPath(); ctx.arc(0, 0, reach * 0.94, -0.78, 0.45); ctx.stroke();
          break;
        case 'thrust':
          for (let i = -1; i <= 1; i++) {
            ctx.beginPath(); ctx.moveTo(-reach * (0.9 - Math.abs(i) * 0.18), i * 4);
            ctx.lineTo(reach * (0.62 + phase * 0.48), i * 1.4); ctx.stroke();
          }
          ctx.beginPath(); ctx.moveTo(reach * 0.72, -4); ctx.lineTo(reach, 0); ctx.lineTo(reach * 0.72, 4); ctx.stroke();
          break;
        case 'impact':
          ctx.lineWidth *= 1.2;
          for (let i = 0; i < (low ? 5 : 8); i++) {
            const a = i * Math.PI * 2 / (low ? 5 : 8), d0 = reach * 0.18, d1 = reach * (0.48 + (i % 2) * 0.14);
            ctx.beginPath(); ctx.moveTo(Math.cos(a) * d0, Math.sin(a) * d0); ctx.lineTo(Math.cos(a) * d1, Math.sin(a) * d1); ctx.stroke();
          }
          ctx.fillStyle = spec.secondary; ctx.beginPath(); ctx.arc(reach * 0.16, 0, 3.2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = spec.secondary; ctx.beginPath(); ctx.arc(reach * 0.16, 0, reach * 0.32, 0, Math.PI * 2); ctx.stroke();
          break;
        case 'arrow':
          ctx.beginPath(); ctx.moveTo(-reach * 0.95, 0); ctx.lineTo(reach, 0); ctx.lineTo(reach * 0.65, -4); ctx.moveTo(reach, 0); ctx.lineTo(reach * 0.65, 4); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-reach * 0.72, -4); ctx.lineTo(-reach * 0.5, 0); ctx.lineTo(-reach * 0.72, 4); ctx.stroke();
          if (!low && !reduced) { ctx.globalAlpha *= 0.55; ctx.beginPath(); ctx.moveTo(-reach * 0.7, 3); ctx.lineTo(reach * 0.72, 3); ctx.stroke(); }
          break;
        case 'staff_spiral':
          ctx.beginPath(); ctx.arc(0, 0, reach * 0.7, -1.2 + phase * 0.25, 1.15 + phase * 0.25); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-reach * 0.7, -reach * 0.36); ctx.lineTo(reach * 0.72, reach * 0.36); ctx.stroke();
          ctx.strokeStyle = spec.secondary; ctx.beginPath(); ctx.arc(reach * 0.68, reach * 0.3, 3.2, 0, Math.PI * 2); ctx.stroke();
          break;
        case 'focus_seal':
          ctx.save(); ctx.rotate(Math.PI / 4); ctx.strokeRect(-reach * 0.45, -reach * 0.45, reach * 0.9, reach * 0.9); ctx.restore();
          ctx.beginPath(); ctx.arc(0, 0, reach * 0.68, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-reach * 0.82, 0); ctx.lineTo(reach * 0.82, 0); ctx.moveTo(0, -reach * 0.82); ctx.lineTo(0, reach * 0.82); ctx.stroke();
          break;
        case 'twin_cut':
          ctx.beginPath(); ctx.moveTo(-reach * 0.72, -reach * 0.52); ctx.lineTo(reach * 0.72, reach * 0.1); ctx.stroke();
          ctx.strokeStyle = spec.secondary; ctx.beginPath(); ctx.moveTo(-reach * 0.48, -reach * 0.82); ctx.lineTo(reach * 0.92, -reach * 0.16); ctx.stroke();
          break;
        case 'sound_wave':
          for (let i = 0; i < (low ? 3 : 5); i++) {
            const span = reach * (0.42 + i * 0.14);
            ctx.beginPath(); ctx.moveTo(-span, 0);
            ctx.quadraticCurveTo(-span * 0.35, -4 - i, 0, 0);
            ctx.quadraticCurveTo(span * 0.35, 4 + i, span, 0); ctx.stroke();
          }
          break;
        case 'ink_script':
          ctx.lineWidth *= 1.35;
          ctx.beginPath(); ctx.moveTo(-reach * 0.68, -reach * 0.64);
          ctx.bezierCurveTo(-reach * 0.15, -reach * 0.18, -reach * 0.35, reach * 0.44, reach * 0.62, reach * 0.55); ctx.stroke();
          ctx.strokeStyle = spec.secondary; ctx.lineWidth *= 0.52;
          ctx.beginPath(); ctx.moveTo(-reach * 0.4, reach * 0.48); ctx.lineTo(reach * 0.46, -reach * 0.58); ctx.stroke();
          break;
        case 'serpent':
          ctx.beginPath(); ctx.moveTo(-reach, 0);
          ctx.bezierCurveTo(-reach * 0.52, -reach * 0.82, -reach * 0.22, reach * 0.76, reach * 0.18, 0);
          ctx.bezierCurveTo(reach * 0.52, -reach * 0.72, reach * 0.7, reach * 0.42, reach, -reach * 0.08); ctx.stroke();
          break;
        case 'orbit_beads':
          ctx.beginPath(); ctx.ellipse(0, 0, reach * 0.68, reach * 0.38, 0, 0.2, Math.PI * 1.8); ctx.stroke();
          for (let i = 0; i < ticks; i++) {
            const a = i * Math.PI * 2 / ticks + phase * 0.5, bx = Math.cos(a) * reach * 0.68, by = Math.sin(a) * reach * 0.38;
            ctx.beginPath(); ctx.arc(bx, by, 1.8 + (i % 2) * 0.5, 0, Math.PI * 2); ctx.fill();
          }
          break;
        case 'rake':
          for (let i = -1; i <= 1; i++) {
            ctx.beginPath(); ctx.moveTo(-reach * 0.68, i * 5 - 2);
            ctx.quadraticCurveTo(0, i * 4 + 2, reach * (0.78 + phase * 0.12), i * 5 - 3); ctx.stroke();
          }
          break;
        case 'needles':
          for (let i = -2; i <= 2; i++) {
            ctx.beginPath(); ctx.moveTo(-reach * 0.62, i * 3.1); ctx.lineTo(reach * (0.78 + phase * 0.16), i * 5.2); ctx.stroke();
          }
          break;
        case 'fan_sweep':
          ctx.beginPath(); ctx.moveTo(-reach * 0.42, 0); ctx.arc(0, 0, reach, -1.05, 1.05); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = spec.secondary; ctx.lineWidth *= 0.6;
          for (let i = -2; i <= 2; i++) { const a = i * 0.34; ctx.beginPath(); ctx.moveTo(-reach * 0.42, 0); ctx.lineTo(Math.cos(a) * reach, Math.sin(a) * reach); ctx.stroke(); }
          break;
        case 'star_dial':
          ctx.beginPath(); ctx.arc(0, 0, reach * 0.54, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, reach * 0.28, 0, Math.PI * 2); ctx.stroke();
          for (let i = 0; i < ticks; i++) { const a = i * Math.PI * 2 / ticks, d0 = reach * 0.62, d1 = reach * (i % 2 ? 0.76 : 0.9); ctx.beginPath(); ctx.moveTo(Math.cos(a) * d0, Math.sin(a) * d0); ctx.lineTo(Math.cos(a) * d1, Math.sin(a) * d1); ctx.stroke(); }
          break;
        case 'counting_beads':
          ctx.strokeRect(-reach * 0.62, -reach * 0.32, reach * 1.24, reach * 0.64);
          for (let row = -1; row <= 1; row++) {
            const by = row * reach * 0.18; ctx.beginPath(); ctx.moveTo(-reach * 0.52, by); ctx.lineTo(reach * 0.52, by); ctx.stroke();
            for (let bead = 0; bead < 3; bead++) { const bx = -reach * 0.34 + bead * reach * 0.34 + (reduced ? 0 : Math.sin(phase * 5 + row + bead) * reach * 0.035); ctx.beginPath(); ctx.arc(bx, by, 1.7, 0, Math.PI * 2); ctx.fill(); }
          }
          break;
        default: ctx.beginPath(); ctx.arc(0, 0, reach * 0.5, -1, 1); ctx.stroke();
      }
      ctx.restore();
      return true;
    },

    drawCastEffects(ctx) {
      const reduced = this.isReducedMotion();
      const sceneLimit=this.resolveQuality()==='low'?R.LEGENDARY_APEX_BUDGET.maxFullLow:R.LEGENDARY_APEX_BUDGET.maxFull;
      const fullScenes=new Set(),sceneOwners=new Set();
      const candidates=[...this.castActive.values()].reverse();
      const transcendentFull = new Set();
      for (const f of candidates) {
        if (transcendentFull.size >= sceneLimit) break;
        if (!f.transcendent || (f.transcendent.presentationRank || 3) < 3 || sceneOwners.has(f.ownerId)) continue;
        transcendentFull.add(f);
        sceneOwners.add(f.ownerId);
      }
      for(const f of candidates){
        if(fullScenes.size + transcendentFull.size>=sceneLimit)break;
        if(!(f.relicId||f.legendary||(f.motif&&String(f.motif).startsWith('legend_'))))continue;
        if(f.ownerId&&sceneOwners.has(f.ownerId))continue;
        fullScenes.add(f);if(f.ownerId)sceneOwners.add(f.ownerId);
      }
      const t7Full=new Set(),t7Owners=new Set(),t7Limit=fullScenes.size?1:(this.resolveQuality()==='low'?1:3);
      for(const f of candidates){if(t7Full.size>=t7Limit)break;if(!f.t7Vfx||f.legendary||f.relicId||(f.ownerId&&(t7Owners.has(f.ownerId)||sceneOwners.has(f.ownerId))))continue;t7Full.add(f);if(f.ownerId)t7Owners.add(f.ownerId);}
      const t6Full=new Set(),t6Owners=new Set(),t6Limit=fullScenes.size||t7Full.size?1:(this.resolveQuality()==='low'?1:3);
      for(const f of candidates){if(t6Full.size>=t6Limit)break;if(!(f.t6Vfx||f.t6ExtVfx)||f.legendary||f.relicId||(f.ownerId&&(t6Owners.has(f.ownerId)||t7Owners.has(f.ownerId)||sceneOwners.has(f.ownerId))))continue;t6Full.add(f);if(f.ownerId)t6Owners.add(f.ownerId);}
      const t5Full=new Set(),t5Owners=new Set(),t5Limit=fullScenes.size||t7Full.size||t6Full.size?2:(this.resolveQuality()==='low'?1:4);
      for(const f of candidates){if(t5Full.size>=t5Limit)break;if(!f.t5Vfx||f.legendary||f.relicId||(f.ownerId&&(t5Owners.has(f.ownerId)||t6Owners.has(f.ownerId)||t7Owners.has(f.ownerId)||sceneOwners.has(f.ownerId))))continue;t5Full.add(f);if(f.ownerId)t5Owners.add(f.ownerId);}
      const t4Full=new Set(),t4Owners=new Set(),t4Limit=fullScenes.size||t7Full.size?2:(this.resolveQuality()==='low'?2:4);
      for(const f of candidates){if(t4Full.size>=t4Limit)break;if(!f.t4Vfx||f.legendary||f.relicId||(f.ownerId&&(t4Owners.has(f.ownerId)||t5Owners.has(f.ownerId)||t6Owners.has(f.ownerId)||t7Owners.has(f.ownerId)||sceneOwners.has(f.ownerId))))continue;t4Full.add(f);if(f.ownerId)t4Owners.add(f.ownerId);}
      for (const fx of this.castActive.values()) {
        const p = clamp((this.castClock - fx.start) / fx.life, 0, 1), fade = Math.min(1, (1 - p) * 2.8), r = reduced ? 23 : 18 + p * 13;
        if (fx.transcendent) {
          this.drawTranscendentDelivery(ctx, fx, p);
          ctx.save();
          ctx.translate(fx.x, fx.y - 7);
          this.drawTranscendentScene(ctx, fx, p, reduced, transcendentFull.has(fx));
          ctx.restore();
          continue;
        }
        this.drawCastTargetMarks(ctx, fx, p, reduced);
        this.drawRangedAndSpatialDeliveryVfx(ctx, fx, p, reduced);
        ctx.save(); ctx.translate(fx.x, fx.y - 7); ctx.globalAlpha = fade; ctx.lineCap = 'round';
        if (fx.equipEffectVfx) {
          this.drawEquipEffectVfx(ctx, fx, p, reduced);
        } else if (fx.combatActionVfx) {
          this.drawCombatActionVfx(ctx, fx, p, reduced);
        } else if (fx.relicId && (R.LEGENDARY_GEAR_VISUALS[fx.relicId] || (R.GRAND_DAO_RELIC_VISUALS && R.GRAND_DAO_RELIC_VISUALS[fx.relicId]))) {
          this.drawLegendaryRelicScene(ctx,fx,p,reduced,fullScenes.has(fx));
        } else if (fx.legendary || (fx.motif && String(fx.motif).startsWith('legend_'))) {
          this.drawLegendaryArtVfx(ctx,fx,p,reduced,fullScenes.has(fx));
        } else if (fx.t6Vfx) {
          this.drawT6SkillVfx(ctx,fx,p,reduced,t6Full.has(fx));
        } else if (fx.t6ExtVfx) {
          this.drawT6ExtSkillVfx(ctx,fx,p,reduced,t6Full.has(fx));
        } else if (fx.t7Vfx) {
          this.drawT7SkillVfx(ctx,fx,p,reduced,t7Full.has(fx));
        } else if (fx.t5Vfx) {
          this.drawT5SkillVfx(ctx,fx,p,reduced,t5Full.has(fx));
        } else if (fx.t4Vfx) {
          this.drawT4SkillVfx(ctx,fx,p,reduced,t4Full.has(fx));
        } else if (fx.t3Vfx) {
          const budget = g.SK.NONLEGENDARY_VFX_BUDGET[3];
          this.drawT3SkillVfx(ctx, fx.t3Vfx, p, reduced ? 18 : budget.rMin + (budget.rMax - budget.rMin) * p, reduced, fx.angle, fx.arch);
        } else if (fx.t3GroupVfx) {
          const budget = g.SK.NONLEGENDARY_VFX_BUDGET[3];
          this.drawT3ExtSkillVfx(ctx, fx.t3GroupVfx, p, reduced ? 18 : budget.rMin + (budget.rMax - budget.rMin) * p, reduced, fx.angle, fx.arch);
        } else if (fx.commonVfx) {
          this.drawCommonSkillVfx(ctx, fx.commonVfx, p, reduced ? 12 : 11 + p * 4, reduced, fx.angle);
        } else if (fx.t2Vfx) {
          this.drawT2SkillVfx(ctx, fx.t2Vfx, p, reduced ? 13 : 12 + p * 3, reduced, fx.angle, fx.arch);
        } else if (fx.t1Vfx) {
          this.drawT1ExtSkillVfx(ctx, fx.t1Vfx, p, reduced ? 12 : 11 + p * 3.5, reduced, fx.angle);
        } else if (fx.signatureVfx) {
          this.drawSignatureSkillVfx(ctx, fx, p, r, reduced);
          if (!fx.legendary && fx.weaponType) this.drawWeaponMotionVfx(ctx, fx, p, r * 0.82, reduced, 0.42);
          if (fx.element || fx.fusion) this.drawElementalCastAndFusionVfx(ctx, fx, p, r);
        } else if (fx.kind === 'normal') {
          if (fx.weaponType && this.drawWeaponMotionVfx(ctx, fx, p, r, reduced, 0.9)) {
            if (fx.element || fx.fusion) this.drawElementalCastAndFusionVfx(ctx, fx, p, r * 0.72);
          } else {
            if (fx.element || fx.fusion) this.drawElementalCastAndFusionVfx(ctx, fx, p, r);
            ctx.fillStyle = 'rgba(109,223,181,.14)'; ctx.beginPath(); ctx.ellipse(0, 4, r * 0.9, r * 0.38, 0, 0, 7); ctx.fill();
            ctx.strokeStyle = 'rgba(236,213,133,.78)'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.ellipse(0, 4, r * 0.8, r * 0.34, 0, 0, 7); ctx.stroke();
            ctx.rotate(fx.angle + (reduced ? 0 : (p - 0.5) * 0.7));
            ctx.fillStyle = 'rgba(113,221,184,.58)'; ctx.beginPath(); ctx.arc(0, 0, r, -0.95, 0.95); ctx.quadraticCurveTo(r * 0.36, 0, Math.cos(-0.95) * r, Math.sin(-0.95) * r); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#fff0b7'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.arc(0, 0, r, -0.95, 0.95); ctx.stroke();
            ctx.strokeStyle = 'rgba(174,245,210,.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(-2, 0, r + 4, -0.68, 0.68); ctx.stroke();
            if (!reduced) { ctx.fillStyle = '#f8e5a1'; for (let i = 0; i < 3; i++) { const a = (i - 1) * 0.63, d = r + 3 + p * (5 + i * 2); ctx.fillRect(Math.cos(a) * d, Math.sin(a) * d, 1.8, 1.8); } }
          }
        } else {
          ctx.fillStyle = 'rgba(88,40,104,.19)'; ctx.beginPath(); ctx.ellipse(0, 6, r * 1.1, r * 0.58, 0, 0, 7); ctx.fill();
          ctx.strokeStyle = '#be8de1'; ctx.lineWidth = 1.9; ctx.beginPath(); ctx.ellipse(0, 6, r, r * 0.52, 0, 0, 7); ctx.stroke();
          ctx.strokeStyle = 'rgba(224,102,131,.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 6, r * 0.78, r * 0.4, 0, 0, 7); ctx.stroke();
          ctx.save(); ctx.translate(0, 6); ctx.scale(1, 0.52); ctx.rotate(fx.angle + (reduced ? 0 : p * 0.6));
          ctx.strokeStyle = '#dd7c9b'; ctx.lineWidth = 1.6; ctx.beginPath(); for (let triangle = 0; triangle < 2; triangle++) for (let i = 0; i <= 3; i++) { const a = i * Math.PI * 2 / 3 + triangle * Math.PI / 3; const x = Math.cos(a) * r * 0.75, y = Math.sin(a) * r * 0.75; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
          ctx.strokeStyle = '#d8adea'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.moveTo(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9); ctx.lineTo(Math.cos(a) * r * 1.1, Math.sin(a) * r * 1.1); } ctx.stroke(); ctx.restore();
          ctx.rotate(fx.angle); ctx.strokeStyle = '#e989a0'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, 0, r * 1.05, -0.5, 0.5); ctx.stroke();
          if (!reduced) { ctx.fillStyle = '#c79be2'; for (let i = 0; i < 4; i++) { const a = i * 1.7, d = r * (0.6 + i * 0.1); ctx.fillRect(Math.cos(a) * d, Math.sin(a) * d * 0.5 - p * (10 + i * 2), 1.7, 2.5); } }
          if (fx.weaponType) this.drawWeaponMotionVfx(ctx, fx, p, r * 0.7, reduced, 0.32);
        }
        if (fx.isSpecialtyArt && fx.subpathMotif && !fx.legendary) {
          this.drawSubpathMotifOverlay(ctx, fx, p, r * 0.68, reduced);
        }
        ctx.restore();
      }
    },

    // Recipients are snapshotted by combat resolution so team buffs and area casts
    // mark every actual affected unit instead of implying a single-target spell.
    drawCastTargetMarks(ctx, fx, p, reduced) {
      if (!ctx || !fx || !Array.isArray(fx.targetPoints) || fx.targetPoints.length < 2) return false;
      const phase = reduced ? 0.5 : clamp(p, 0, 1);
      for (const point of fx.targetPoints) {
        if (!point || Math.hypot(point.x - fx.x, point.y - fx.y) < 7) continue;
        const radius = reduced ? 8 : 7 + phase * 5;
        ctx.save(); ctx.translate(point.x, point.y - 4);
        ctx.globalAlpha *= reduced ? 0.62 : (0.72 * (1 - phase * 0.35));
        ctx.strokeStyle = point.team ? '#72efdd' : '#ff718f';
        ctx.fillStyle = point.team ? '#c7fff4' : '#ffd0dd';
        ctx.lineWidth = 1.25; ctx.beginPath(); ctx.ellipse(0, 4, radius, radius * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, -2, 1.7, 0, Math.PI * 2); ctx.fill();
        if (!reduced) {
          ctx.beginPath(); ctx.moveTo(-3, -2); ctx.lineTo(0, -5); ctx.lineTo(3, -2); ctx.stroke();
        }
        ctx.restore();
      }
      return true;
    },

    // Pure read-only active passive check: never mutates n.passiveLoadout during rendering
    readOnlyActivePassives(n) {
      if (!n || !n.cult || !Array.isArray(n.cult.techs)) return [];
      const M = g.MARTIAL;
      const unequipped = new Set(Array.isArray(n.passiveUnequipped) ? n.passiveUnequipped : []);
      if (Array.isArray(n.passiveLoadout) && n.passiveLoadout.length) {
        return n.passiveLoadout
          .filter(id => !unequipped.has(id) && n.cult.techs.includes(id))
          .map(id => CULT.tech(id))
          .filter(t => t && (!M || (M.isTechCompatible(n, t) && M.conditionMatches(n, t))));
      }
      return n.cult.techs
        .filter(id => !unequipped.has(id))
        .map(id => CULT.tech(id))
        .filter(t => t && (t.passive || t.cat === 'PASSIVE') && (!M || (M.isTechCompatible(n, t) && M.conditionMatches(n, t))))
        .slice(0, 3);
    },

    // Shared T6 group art: technique IDs never alter the silhouette, palette or ornament count.
    drawT6FamilyGlyph(ctx,key,p,radius,reduced,low=false){
      const spec=g.SK&&g.SK.T6_VFX_FAMILIES[key];if(!ctx||!spec)return false;
      const q=reduced?.5:clamp(p,0,1),r=clamp(radius,1,g.SK.NONLEGENDARY_VFX_BUDGET[6].rMax),count=low?3:5;
      ctx.save();ctx.scale(r,r);
      // Family-level motion only: no technique ID, RNG or unique seal seed.
      const beat=Math.sin(q*Math.PI),turn=(q-.5)*.12;
      if(spec.motion==='sweep')ctx.rotate(turn);
      else if(spec.motion==='rise')ctx.translate(0,-beat*.07);
      else if(spec.motion==='weave')ctx.scale(1,1-beat*.06);
      else if(spec.motion==='gather')ctx.scale(.9+beat*.1,.9+beat*.1);
      else if(spec.motion==='pulse')ctx.scale(.94+beat*.06,.94+beat*.06);
      ctx.strokeStyle=spec.primary;ctx.fillStyle=spec.accent;ctx.lineWidth=1.35/r;ctx.lineCap='round';ctx.lineJoin='round';
      const line=(ps,close=false)=>{ctx.beginPath();ps.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));if(close)ctx.closePath();ctx.stroke();};
      const oval=(x,y,rx,ry,a=0)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,a,0,Math.PI*2);ctx.stroke();};
      switch(key){
        case 'storm':
          for(let i=-1;i<=1;i++){const x=i*.47;line([[x+.14,-.8],[x-.13,-.12],[x+.12,-.2],[x-.1,.45]]);}oval(0,.58,.7,.16);break;
        case 'blood':
          for(const d of [-1,1]){ctx.beginPath();ctx.moveTo(d*.7,-.65);ctx.quadraticCurveTo(d*.22,-.12,d*.78,.55);ctx.stroke();line([[d*.68,-.52],[d*.45,-.22]]);}line([[0,-.65],[-.15,-.3],[0,-.05],[.15,-.3],[0,-.65]]);break;
        case 'void':
          line([[-.82,.55],[-.28,.15],[-.12,-.26],[.78,-.65]]);line([[-.62,.7],[-.12,.3],[.08,-.1],[.82,-.48]]);for(const d of [-1,1])line([[d*.7,-d*.35],[d*.85,-d*.08],[d*.62,d*.1]]);break;
        case 'bulwark':
          line([[-.65,.5],[-.65,-.45],[0,-.8],[.65,-.45],[.65,.5]],true);line([[-.4,-.28],[0,-.48],[.4,-.28],[.3,.3],[-.3,.3]],true);line([[-.85,.65],[.85,.65]]);break;
        case 'projectile':
          line([[-.86,0],[.54,0],[.32,-.16],[.86,0],[.32,.16],[.54,0]]);for(const d of [-1,1]){ctx.beginPath();ctx.moveTo(-.7,d*.42);ctx.quadraticCurveTo(-.12,d*.65,.45,d*.22);ctx.stroke();}break;
        case 'mirror':
          oval(0,-.05,.45,.66);oval(0,-.05,.32,.52);for(const d of [-1,1])line([[d*.7,-.5],[d*.82,-.12],[d*.62,.3],[d*.75,.55]]);break;
        case 'forge':
          line([[-.65,-.25],[-.5,.47],[.5,.47],[.65,-.25]],true);oval(0,-.25,.65,.15);for(let i=-1;i<=1;i++){const x=i*.34;line([[x,-.44],[x-.1,-.62],[x+.06,-.86]]);}break;
        case 'grove':
          for(let i=0;i<count;i++){const a=i*Math.PI*2/count;ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-.4,-.45,0,-.83);ctx.quadraticCurveTo(.4,-.45,0,0);ctx.stroke();ctx.restore();}oval(0,.52,.65,.15);break;
        case 'sound':
          for(let i=0;i<count;i++){const y=(i-(count-1)/2)*.25;ctx.beginPath();ctx.moveTo(-.8,y);ctx.bezierCurveTo(-.3,y-.21,.3,y+.21,.8,y);ctx.stroke();}for(const d of [-1,1])line([[d*.86,-.6],[d*.86,.6]]);break;
        case 'puppet':
          line([[-.8,-.65],[.8,-.65]]);for(let i=-1;i<=1;i++){const x=i*.5;oval(x,-.65,.055,.055);ctx.beginPath();ctx.moveTo(x,-.6);ctx.quadraticCurveTo(-x*.55,-.12,x*.8,.3);ctx.stroke();oval(x*.8,.4,.09,.13);}break;
        case 'seal':
          line([[-.6,-.65],[.6,-.65],[.6,.6],[-.6,.6]],true);line([[-.35,-.4],[.3,-.4],[-.12,0],[.35,.38],[-.3,.38]]);for(const d of [-1,1])line([[d*.78,-.25],[d*.78,.25]]);break;
        case 'banner':
          for(const d of [-1,1])line([[d*.65,.65],[d*.65,-.7],[d*.2,-.52],[d*.65,-.2]]);line([[-.35,.15],[0,-.1],[.35,.15],[0,.4]],true);break;
        case 'venom':
          for(let i=0;i<count;i++){const a=i*Math.PI*2/count;oval(Math.cos(a)*.65,Math.sin(a)*.45,.13,.075,a);}
          line([[0,-.55],[-.24,.02],[0,.42],[.24,.02],[0,-.55]]);break;
        case 'beast':
          line([[-.7,-.25],[-.65,-.7],[-.3,-.48],[0,-.6],[.3,-.48],[.65,-.7],[.7,-.25],[.4,.38],[0,.6],[-.4,.38]],true);for(const d of [-1,1])line([[d*.42,-.1],[d*.18,.02],[d*.25,.28]]);break;
        case 'jade_guard':
          for(let i=0;i<3;i++){const d=.78-i*.2;line([[-d,-d*.5],[0,-d],[d,-d*.5],[d*.8,d*.65],[0,d],[-d*.8,d*.65]],true);}break;
        case 'dawn_sword':
          line([[-.6,.65],[.55,-.72],[.43,-.32],[.1,-.17],[-.6,.65]]);ctx.beginPath();ctx.arc(-.05,.25,.65,Math.PI,Math.PI*2);ctx.stroke();for(let i=0;i<3;i++)line([[.15+i*.22,-.55],[.23+i*.22,-.72]]);break;
        case 'mist_palm':
          oval(0,0,.3,.4);for(let i=0;i<count;i++){const a=i*Math.PI*2/count;oval(Math.cos(a)*.62,Math.sin(a)*.52,.22,.1,a);}line([[-.45,.7],[0,.8],[.45,.7]]);break;
        case 'mist_veil':
          for(let i=0;i<3;i++){const y=(i-1)*.4;ctx.beginPath();ctx.moveTo(-.85,y);ctx.bezierCurveTo(-.4,y-.4,.3,y+.4,.85,y);ctx.stroke();}line([[-.32,-.1],[0,-.26],[.32,-.1],[0,.05]],true);break;
        case 'cleanse':
          line([[0,-.85],[-.38,-.16],[0,.24],[.38,-.16],[0,-.85]]);for(const d of [-1,1]){ctx.beginPath();ctx.moveTo(d*.6,-.3);ctx.quadraticCurveTo(d*.9,.6,0,.75);ctx.stroke();}line([[-.2,.48],[.2,.48],[0,.3],[0,.65]]);break;
        case 'qi_siphon':
          for(let i=0;i<count;i++){const a=i*Math.PI*2/count;ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(.1,.1);ctx.bezierCurveTo(.1,-.35,.85,-.1,.7,-.55);ctx.stroke();ctx.restore();}oval(0,0,.12,.12);break;
        case 'array_ruin':
          for(let i=0;i<4;i++){ctx.save();ctx.rotate(i*Math.PI/2);line([[.12,-.35],[.4,-.75],[.75,-.4],[.35,-.12]]);line([[.15,-.6],[.12,-.88]]);ctx.restore();}line([[-.2,.12],[0,-.25],[.2,.12]],true);break;
        case 'flesh_gate':
          for(const d of [-1,1]){line([[d*.6,.7],[d*.6,-.5],[d*.3,-.78],[d*.3,.5]]);line([[d*.75,.3],[d*.85,-.2]]);}oval(0,0,.14,.38);break;
        case 'blood_pins':
          for(let i=0;i<4;i++){ctx.save();ctx.rotate(i*Math.PI/2+.3);line([[0,-.85],[0,-.3],[-.1,-.45],[0,-.18],[.1,-.45]]);oval(0,-.85,.07,.04);ctx.restore();}oval(0,0,.32,.32);break;
        case 'beast_pact':
          oval(-.26,0,.48,.6);oval(.26,0,.48,.6);for(const d of [-1,1])line([[d*.57,-.35],[d*.8,-.65],[d*.75,-.1]]);line([[-.12,.05],[0,.27],[.12,.05]]);break;
        case 'sacred_flame':
          ctx.beginPath();ctx.moveTo(0,-.86);ctx.bezierCurveTo(.6,-.3,.75,.5,0,.65);ctx.bezierCurveTo(-.75,.5,-.5,-.2,0,-.86);ctx.stroke();line([[-.7,.76],[.7,.76]]);line([[0,-.25],[-.15,.24],[.15,.24],[0,-.25]]);break;
        case 'moon_bow':
          ctx.beginPath();ctx.arc(-.1,0,.72,-1.25,1.25);ctx.stroke();line([[.13,-.68],[-.3,0],[.13,.68]]);line([[-.8,0],[.8,0],[.6,-.12],[.8,0],[.6,.12]]);break;
        case 'fate_cut':
          for(const d of [-1,1]){ctx.beginPath();ctx.moveTo(-.8,d*.48);ctx.bezierCurveTo(-.4,-d*.15,-.15,d*.18,-.07,d*.06);ctx.stroke();ctx.beginPath();ctx.moveTo(.12,-d*.15);ctx.quadraticCurveTo(.45,-d*.7,.8,-d*.4);ctx.stroke();}line([[-.25,.6],[.28,-.65]]);break;
        case 'faith_link':
          for(let i=-1;i<=1;i++){const x=i*.58,y=i===0?-.48:.38;oval(x,y,.16,.16);if(i){ctx.beginPath();ctx.moveTo(0,-.32);ctx.quadraticCurveTo(x,-.1,x,.22);ctx.stroke();}}line([[-.18,-.76],[.18,-.76]]);break;
        case 'altar_burst':
          line([[-.72,-.2],[-.44,.5],[-.1,.25],[.12,.6],[.5,.4],[.72,-.2]]);oval(0,-.2,.72,.15);for(let i=-1;i<=1;i++)line([[i*.4,-.4],[i*.5,-.8]]);break;
        case 'sky_tribunal':
          line([[-.65,-.66],[0,-.85],[.65,-.66],[.5,-.35],[-.5,-.35]],true);line([[.12,-.35],[-.22,.13],[.12,.07],[-.08,.76]]);for(const d of [-1,1])line([[d*.65,-.07],[d*.42,.36],[d*.65,.28]]);break;
        case 'traceless_sword':
          for(const d of [-1,1]){ctx.beginPath();ctx.moveTo(-.83,d*.3);ctx.quadraticCurveTo(-.1,-d*.25,.78,-d*.58);ctx.stroke();}line([[-.45,.63],[.64,-.63],[.53,-.22]]);break;
        case 'sun_bow':
          oval(-.3,0,.4,.4);for(let i=0;i<count;i++){const a=i*Math.PI*2/count;line([[-.3+Math.cos(a)*.49,Math.sin(a)*.49],[-.3+Math.cos(a)*.64,Math.sin(a)*.64]]);}line([[-.65,0],[.82,0],[.58,-.15],[.82,0],[.58,.15]]);break;
        case 'ocean_trident':
          line([[0,.8],[0,-.8],[-.1,-.6],[0,-.8],[.1,-.6]]);line([[-.44,-.62],[-.35,-.12],[.35,-.12],[.44,-.62]]);for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(-.8,.38+i*.18);ctx.quadraticCurveTo(-.2,.1+i*.18,.8,.38+i*.18);ctx.stroke();}break;
        case 'frost_tide':
          ctx.beginPath();ctx.moveTo(-.8,.45);ctx.bezierCurveTo(-.65,-.5,.4,-.7,.75,-.1);ctx.quadraticCurveTo(.1,-.38,.2,.2);ctx.stroke();for(let i=-1;i<=1;i++)line([[i*.42,.6],[i*.42,.24],[i*.42-.1,.35],[i*.42,.24],[i*.42+.1,.35]]);break;
        case 'cloud_brush':
          line([[-.62,.7],[.28,-.62],[.45,-.5],[-.4,.8]],true);for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-.7+i*.35,-.2);ctx.bezierCurveTo(-.8+i*.35,-.7,-.3+i*.35,-.65,-.35+i*.35,-.3);ctx.stroke();}break;
        case 'vajra':
          for(const d of [-1,1]){line([[d*.8,0],[d*.45,-.3],[d*.2,0],[d*.45,.3],[d*.8,0]]);line([[d*.45,-.3],[d*.45,.3]]);}oval(0,0,.15,.26);line([[0,-.8],[-.17,-.5],[0,-.32],[.17,-.5],[0,-.8]]);break;
        case 'earth_step':
          oval(-.25,-.28,.15,.32,-.4);oval(.3,.05,.15,.32,-.4);for(let i=0;i<3;i++){const y=.48+i*.15;line([[-.8+i*.12,y],[-.24,y-.08],[.12,y+.04],[.78-i*.1,y-.1]]);}break;
        case 'gu_swarm':
          for(let i=0;i<count;i++){const a=i*Math.PI*2/count,x=Math.cos(a)*.6,y=Math.sin(a)*.5;oval(x,y,.07,.14,a);line([[x-.12,y-.08],[x+.12,y+.08]]);line([[x-.12,y+.08],[x+.12,y-.08]]);}break;
        case 'dream_silk':
          for(const d of [-1,1]){ctx.beginPath();ctx.moveTo(d*.7,-.6);ctx.bezierCurveTo(-d*.8,-.2,d*.8,.3,-d*.7,.65);ctx.stroke();}oval(0,0,.4,.19,-.4);oval(0,0,.4,.19,.4);break;
        case 'spirit_thread':
          for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*.6,.7);ctx.bezierCurveTo(i*.65,.1,-i*.5,-.3,0,-.65);ctx.stroke();oval(i*.6,.7,.09,.09);}line([[-.15,-.52],[0,-.82],[.15,-.52]],true);break;
        case 'array_gates':
          for(let i=0;i<(low?4:8);i++){ctx.save();ctx.rotate(i*Math.PI*2/(low?4:8));line([[-.1,-.56],[-.1,-.8],[.1,-.8],[.1,-.56]]);ctx.restore();}line([[-.22,0],[0,-.22],[.22,0],[0,.22]],true);break;
        case 'stone_seal':
          line([[-.8,.62],[-.52,-.23],[-.28,.12],[.05,-.78],[.42,-.17],[.56,-.4],[.85,.62]],true);line([[-.28,-.04],[-.28,-.5],[.28,-.5],[.28,-.04]]);break;
        case 'hidden_bastion':
          line([[-.82,.6],[-.82,-.32],[-.6,-.32],[-.6,-.6],[-.35,-.6],[-.35,-.32],[.35,-.32],[.35,-.6],[.6,-.6],[.6,-.32],[.82,-.32],[.82,.6]],true);line([[-.17,.6],[-.17,.12],[.17,.12],[.17,.6]]);break;
        case 'star_gate':
          for(let i=0;i<count;i++){const a=i*Math.PI*2/count,x=Math.cos(a)*.68,y=Math.sin(a)*.68;line([[x-.07,y],[x+.07,y],[x,y-.07],[x,y+.07]]);}line([[-.34,.47],[-.34,-.38],[0,-.62],[.34,-.38],[.34,.47]]);break;
        case 'dharma':
          line([[-.6,.65],[.6,.65],[-.4,.37],[.4,.37],[-.27,.04],[.27,.04],[0,-.75]],false);for(let i=0;i<3;i++){const y=.48-i*.32,d=.48-i*.12;line([[-d,y],[d,y]]);}oval(0,-.66,.15,.15);break;
        case 'cloud_step':
          for(let i=0;i<3;i++){const x=(i-1)*.55,y=(i%2)*.38;ctx.beginPath();ctx.moveTo(x-.25,y);ctx.bezierCurveTo(x-.4,y-.45,x+.45,y-.45,x+.25,y);ctx.stroke();}line([[-.3,.7],[.1,.25],[.42,-.65]]);break;
        case 'debt_balance':
          line([[0,-.8],[0,.65],[-.35,.65],[.35,.65]]);line([[-.75,-.4],[.75,-.4]]);for(const d of [-1,1]){line([[d*.58,-.4],[d*.58,.16]]);ctx.beginPath();ctx.arc(d*.58,.16,.2,0,Math.PI);ctx.stroke();}break;
        case 'dragon_fault':
          line([[-.82,.58],[-.4,.15],[-.55,-.12],[-.1,-.35],[.12,-.76],[.42,-.55],[.62,-.7]]);line([[-.55,.7],[0,.25],[-.1,-.03],[.3,-.16],[.48,-.42],[.8,-.25]]);break;
        case 'gravity_fist':
          for(let i=0;i<3;i++)oval(0,.25,.78-i*.19,.22+i*.12);line([[-.26,-.25],[-.26,-.7],[.26,-.7],[.26,-.25]],true);line([[-.7,-.4],[-.4,-.05],[.4,-.05],[.7,-.4]]);break;
        case 'epoch_seal':
          for(const d of [-1,1]){line([[-.42,d*.7],[.42,d*.7],[0,0],[-.42,d*.7]]);line([[-.62,d*.78],[.62,d*.78]]);}oval(0,0,.68,.4,Math.PI/2);break;
        default:ctx.restore();return false;
      }
      if(!low){ctx.strokeStyle=spec.accent;ctx.lineWidth=.75/r;ctx.globalAlpha*=.55;ctx.beginPath();ctx.arc(0,0,.92,.25+(reduced?0:q*.2),1.25+(reduced?0:q*.2));ctx.stroke();}
      ctx.restore();return true;
    },

    drawT6SkillVfx(ctx,fx,p,reduced,full=true){
      const key=fx.t6Vfx||(g.SK&&g.SK.TECH_TO_T6_VFX[fx.techId]),spec=g.SK&&g.SK.T6_VFX_FAMILIES[key];if(!ctx||!spec)return false;
      const q=reduced?.5:clamp(p,0,1),low=this.resolveQuality()==='low',b=g.SK.NONLEGENDARY_VFX_BUDGET[6];
      const radius=full?(reduced?44.5:b.rMin+(b.rMax-b.rMin)*Math.sin(Math.min(1,q/.65)*Math.PI/2)):18;
      ctx.save();ctx.globalAlpha*=1-clamp((q-.76)/.24,0,1);
      this.drawT6FamilyGlyph(ctx,key,q,radius,reduced,low);
      if(full){
        const wave=Math.sin(clamp((q-.25)/.45,0,1)*Math.PI),supportive=['heal','support','buff','harmonize','guard','shield','counter','evade','blink'].includes(fx.arch);
        ctx.strokeStyle=spec.accent;ctx.lineWidth=1.3;ctx.globalAlpha*=.6*wave;
        ctx.beginPath();
        if(supportive){ctx.moveTo(-radius*.5,radius*.2);ctx.quadraticCurveTo(0,-radius*.55,radius*.5,radius*.2);}
        else{ctx.rotate(Number.isFinite(fx.angle)?fx.angle:0);ctx.moveTo(-radius*.65,0);ctx.lineTo(radius*.75,0);ctx.lineTo(radius*.52,-4);}
        ctx.stroke();
      }
      ctx.restore();return true;
    },

    // Ordinary T7: local technique geometry, not a Legendary apparition or environment scene.
    drawT7SkillVfx(ctx, fx, p, reduced, full = true) {
      const spec=g.SK&&g.SK.T7_VFX_CATALOG[fx.techId];if(!ctx||!spec)return false;
      const low=this.resolveQuality()==='low',q=reduced?.5:clamp(p,0,1),budget=g.SK.NONLEGENDARY_VFX_BUDGET[7];
      const r=full?(reduced?53:budget.rMin+(budget.rMax-budget.rMin)*Math.sin(Math.min(1,q/.65)*Math.PI/2)):24;
      const sig=fx.signatureVfx||spec.oldSignature,ink=g.SK.SIGNATURE_VFX_CATALOG[sig]||{primary:PATH_COL[(CULT.tech(fx.techId)||{}).path]||'#a5d9df',secondary:'#d3c8a4',accent:'#f0e1bf'};
      const release=reduced?.55:clamp((q-.28)/.38,0,1),echo=1-clamp((q-.72)/.28,0,1);
      ctx.save();ctx.globalAlpha*=echo;
      // Keep the pre-existing signature identity at the center of the larger T7 composition.
      if(sig&&g.SK.SIGNATURE_VFX_CATALOG[sig]){
        ctx.save();ctx.globalAlpha*=.8;this.drawSignatureSkillVfx(ctx,{...fx,signatureVfx:sig},q,full?23:15,reduced);ctx.restore();
      }else{
        ctx.save();this.drawWeaponMotionVfx(ctx,{...fx,tier:7},q,full?22:14,reduced,.8);ctx.restore();
      }
      if(full){
        ctx.save();ctx.scale(r,r);ctx.strokeStyle=ink.primary;ctx.fillStyle=ink.secondary;ctx.lineWidth=1.35/r;ctx.globalAlpha*=.35+.5*Math.sin(q*Math.PI);
        const line=(ps,close=false)=>{ctx.beginPath();ps.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));if(close)ctx.closePath();ctx.stroke();};
        const oval=(x,y,rx,ry,a=0)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,a,0,Math.PI*2);ctx.stroke();};
        const count=low?3:5;
        switch(spec.family){
          case 'sky_spear':
            for(const d of [-1,1]){line([[d*.65,.45],[d*.65,-.6],[d*.65-.1,-.4],[d*.65,-.8],[d*.65+.1,-.4]]);}line([[-.5,.55],[0,.7],[.5,.55]]);break;
          case 'earth_staff':
            line([[-.85,-.5],[.75,-.5],[.75,-.4],[-.85,-.4]],true);for(let i=0;i<count;i++){const x=(i-(count-1)/2)*.3;line([[x-.12,.55],[x,.25],[x+.16,.62]]);}break;
          case 'sun_arrow':
            for(let i=0;i<3;i++){const x=(i-1)*.55;oval(x,-.55,.2,.2);line([[x,-.85],[x,-.78]]);}line([[-.75,.35],[.8,.35],[.55,.2],[.8,.35],[.55,.5]]);break;
          case 'galaxy_arrow':
            ctx.beginPath();ctx.arc(0,0,.82,-2.8,-.3);ctx.stroke();for(let i=0;i<count;i++){const a=-2.8+i*2.5/(count-1),x=Math.cos(a)*.82,y=Math.sin(a)*.82;line([[x-.04,y],[x+.04,y],[x,y-.04],[x,y+.04]]);}break;
          case 'void_blade':
            line([[-.85,.5],[-.2,.06],[.07,-.32],[.82,-.65]]);line([[-.64,.65],[-.05,.12],[.22,-.19],[.85,-.45]]);break;
          case 'myriad_blades':
            for(let i=0;i<count;i++){const x=(i-(count-1)/2)*.3;line([[x,-.4],[x,-.82],[x-.05,-.68],[x,-.9],[x+.05,-.68]]);}line([[-.7,.5],[0,.7],[.7,.5]]);break;
          case 'body_breaker':
            for(const d of [-1,1])line([[d*.4,-.75],[d*.75,-.5],[d*.82,.1],[d*.6,.3]]);for(let i=0;i<3;i++)line([[(i-1)*.3,.5],[(i-1)*.4,.8]]);break;
          case 'rune_brush':
            for(const d of [-1,1]){line([[d*.65,-.65],[d*.65,.4],[d*.45,.58]]);line([[d*.9,-.5],[d*.75,-.5],[d*.82,-.25],[d*.7,0]]);}break;
          case 'dream_loom':
            for(let i=0;i<3;i++){const x=(i-1)*.55;oval(x,-.5,.18,.3,(i-1)*.3);}ctx.beginPath();ctx.moveTo(-.85,.45);ctx.bezierCurveTo(-.2,.2,.15,.7,.85,.45);ctx.stroke();break;
          case 'vital_garden':
            for(let i=0;i<count;i++){const a=i*Math.PI*2/count,x=Math.cos(a)*.7,y=Math.sin(a)*.42;ctx.save();ctx.translate(x,y);ctx.rotate(a);oval(0,0,.12,.25);ctx.restore();}break;
          case 'forge_lattice':
            line([[-.85,.4],[-.6,.65],[.6,.65],[.85,.4]],true);for(let i=0;i<3;i++){const x=(i-1)*.45;line([[x,-.5],[x-.1,-.7],[x+.06,-.88]]);}break;
          case 'zither_chords':
            for(let i=0;i<count;i++){const y=(i-(count-1)/2)*.25;ctx.beginPath();ctx.moveTo(-.8,y);ctx.quadraticCurveTo(0,y+(i%2?.25:-.25),.8,y);ctx.stroke();}break;
          case 'fate_whip':
          case 'puppet_lines':
            for(let i=0;i<3;i++){const x=(i-1)*.6;oval(x,-.7,.05,.05);ctx.beginPath();ctx.moveTo(x,-.7);ctx.bezierCurveTo(x*.6,-.45,-x*.7,.15,x*.8,.65);ctx.stroke();}break;
          case 'celestial_edict':
            for(let i=0;i<3;i++){const x=(i-1)*.6;line([[x,.3],[x,-.8],[x+.26,-.7],[x,-.4]]);}line([[-.85,.6],[.85,.6]]);break;
          case 'venom_hive':
            for(let i=0;i<count;i++){const a=i*Math.PI*2/count,x=Math.cos(a)*.76,y=Math.sin(a)*.6;oval(x,y,.1,.06);line([[x-.1,y-.1],[x+.1,y+.1]]);}break;
          case 'beast_totem':
            for(const d of [-1,1])line([[d*.4,-.65],[d*.65,-.8],[d*.85,-.4],[d*.55,.5],[d*.3,.65]]);break;
          case 'gravity_bands':
            for(let i=0;i<3;i++)oval(0,0,.82,.28+i*.13,(i-1)*.3);break;
          case 'epoch_glass':
            for(const d of [-1,1])line([[d*.7,-.65],[d*.4,-.65],[d*.62,-.05],[d*.4,.55],[d*.7,.55]],true);break;
          case 'gold_balance':
            line([[-.82,-.4],[.82,-.4],[0,-.6],[0,-.82]]);for(const d of [-1,1]){line([[d*.6,-.4],[d*.6,.2]]);oval(d*.6,.3,.22,.08);}break;
          case 'astral_ladle':
            line([[-.75,-.4],[-.45,-.7],[-.1,-.7],[.15,-.4],[.45,-.1],[.72,.2]]);for(let i=0;i<3;i++)oval(-.45+i*.32,-.7+i*.15,.06,.06);break;
          case 'earth_veins':
            line([[-.9,.6],[-.6,-.35],[-.2,.1],[.1,-.7],[.65,.2],[.9,.6]]);line([[-.4,.55],[0,.3],[.4,.55]]);break;
          case 'blood_furnace':
            for(let i=0;i<3;i++){const x=(i-1)*.6;line([[x,-.75],[x-.14,-.4],[x,-.18],[x+.14,-.4],[x,-.75]]);}line([[-.7,.5],[0,.72],[.7,.5]]);break;
          case 'cloud_thunder':
            for(let i=0;i<3;i++){const x=(i-1)*.55;line([[x,-.8],[x-.15,-.32],[x+.1,-.4],[x-.1,.1]]);}break;
        }
        ctx.strokeStyle=ink.accent||'#eee0bd';ctx.lineWidth=1/r;
        for(let i=0;i<2;i++){const a=spec.variant*.37+i*.12,d=.82;line([[Math.cos(a)*d,Math.sin(a)*d*.7],[Math.cos(a)*(d+.09),Math.sin(a)*(d+.09)*.7]]);}
        // Per-technique seal accents keep shared-family curricula distinguishable.
        if(!low){ctx.strokeStyle=ink.accent||'#eee0bd';ctx.lineWidth=.75/r;const n=4+spec.variant%5;for(let i=0;i<n;i++){const a=i*Math.PI*2/n+spec.variant*.19+(reduced?0:q*.2),d=.92;line([[Math.cos(a)*d,Math.sin(a)*d*.7],[Math.cos(a)*(d+.06),Math.sin(a)*(d+.06)*.7]]);}}
        ctx.restore();
        // A focused release only; Legendary apparition and ambient-world layers remain exclusive.
        const supportive=['heal','support','buff','harmonize','guard','shield','counter','evade','blink'].includes(fx.arch);
        ctx.save();ctx.strokeStyle=ink.secondary;ctx.globalAlpha*=.6*Math.sin(release*Math.PI);ctx.lineWidth=1.3;
        if(supportive){for(let i=0;i<3;i++){const x=(i-1)*r*.4;ctx.beginPath();ctx.moveTo(x,r*.25);ctx.quadraticCurveTo(x+7,-r*.2,x,-r*(.3+release*.45));ctx.stroke();}}
        else {ctx.rotate(Number.isFinite(fx.angle)?fx.angle:0);for(let i=0;i<3;i++){const y=(i-1)*r*.18;ctx.beginPath();ctx.moveTo(-r*.5,y);ctx.lineTo(r*(.3+release*.55),y*.2);ctx.stroke();}}
        ctx.restore();
      }
      ctx.restore();return true;
    },

    // T7 equipment has owner-bound, type-aware accents, not fabricated relic procs.
    drawT7EquipmentGlyph(ctx,type,r){
      if(!ctx)return false;
      type=({LIGHT_ARMOR:'LIGHT',HEAVY_ARMOR:'HEAVY',PENDANT:'NECKLACE',BOSS_TROPHY:'ORNAMENT',TALISMAN:'CHARM',FIST_PALM:'FIST',SHOES:'CHARM'})[type]||type;
      if(R.WEAPON_MOTION_VFX[type])return this.drawWeaponMotionVfx(ctx,{weaponType:type,tier:7,angle:-.35},.5,r,true,.66);
      ctx.save();ctx.scale(r,r);ctx.strokeStyle='#d4ca9d';ctx.lineWidth=1/r;
      const line=(ps,closed=false)=>{ctx.beginPath();ps.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));if(closed)ctx.closePath();ctx.stroke();};
      const oval=(x,y,rx,ry)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.stroke();};
      switch(type){
        case 'HEAVY':line([[-.7,-.65],[0,-.85],[.7,-.65],[.5,.4],[0,.75],[-.5,.4]],true);line([[-.4,-.2],[.4,-.2],[0,-.2],[0,.45]]);break;
        case 'LIGHT':line([[-.65,-.65],[-.3,-.65],[0,-.2],[.3,-.65],[.65,-.65],[.45,.7],[-.45,.7]],true);break;
        case 'ROBE':line([[-.3,-.7],[-.8,-.15],[-.45,-.08],[-.6,.65],[.6,.65],[.45,-.08],[.8,-.15],[.3,-.7]],true);break;
        case 'RING':oval(0,0,.55,.55);line([[-.15,-.55],[0,-.85],[.15,-.55]],true);break;
        case 'NECKLACE':ctx.beginPath();ctx.arc(0,-.25,.65,0,Math.PI);ctx.stroke();line([[0,.4],[-.18,.65],[0,.85],[.18,.65]],true);break;
        case 'BRACELET':oval(0,0,.7,.35);oval(0,0,.4,.2);break;
        case 'CHARM':line([[-.4,-.65],[.4,-.65],[.4,.55],[-.4,.55]],true);line([[-.2,-.35],[.2,.1],[-.2,.3]]);break;
        case 'ORNAMENT':line([[0,-.8],[0,-.4],[-.4,0],[0,.6],[.4,0],[0,-.4]]);break;
        case 'AUX_TOOL':line([[-.7,.6],[.55,-.65],[.75,-.4],[.25,-.15],[-.7,.6]]);break;
        default:ctx.restore();return false;
      }
      ctx.restore();return true;
    },

    drawT7EquipmentAura(ctx,n,ap,by=0){return this.drawOrdinaryHighTierEquipmentAura(ctx,n,ap,by,[7]);},
    drawT6EquipmentAura(ctx,n,ap,by=0){return this.drawOrdinaryHighTierEquipmentAura(ctx,n,ap,by,[6]);},
    drawT5EquipmentAura(ctx,n,ap,by=0){return this.drawOrdinaryHighTierEquipmentAura(ctx,n,ap,by,[5]);},
    drawT4EquipmentAura(ctx,n,ap,by=0){return this.drawOrdinaryHighTierEquipmentAura(ctx,n,ap,by,[4]);},
    drawOrdinaryHighTierEquipmentAura(ctx,n,ap,by=0,tiers=[6,7]){
      if(!ctx||!n||n.dead||n.hidden||n.away||n.gone)return false;
      const items=Object.values(n.equip||{});let drawn=0;
      for(const it of items){
        if(drawn>=3)break;
        if(!it||!tiers.includes(it.tier)||it.legendary||R.resolveLegendaryGearVisual(it)||(g.MARTIAL&&g.MARTIAL.gearUsable&&!g.MARTIAL.gearUsable(n,it)))continue;
        const rawType=it.gearType||it.subType,type=({LIGHT_ARMOR:'LIGHT',HEAVY_ARMOR:'HEAVY',PENDANT:'NECKLACE',BOSS_TROPHY:'ORNAMENT',TALISMAN:'CHARM',FIST_PALM:'FIST'})[rawType]||rawType,finish=it.tier===7?1:(it.tier===6?.82:(it.tier===5?.68:.56)),armor=['HEAVY','LIGHT','ROBE'].includes(type),weapon=!!R.WEAPON_MOTION_VFX[type];
        ctx.save();ctx.translate(weapon?10:armor?0:-10,weapon?-12+by:armor?-9+by:-16+by);ctx.globalAlpha*=(armor?.35:.55)*finish;
        const ok=this.drawT7EquipmentGlyph(ctx,type,(armor?7:weapon?4.6:4.2)*finish);ctx.restore();if(ok)drawn++;
      }
      if(drawn>0){
        const nodes=Math.min(3,Math.ceil(((ap&&ap.totalGearStars)||0)/2)),phase=this.isReducedMotion()?0:(this.t||0)+(n.n||0)*.8;
        ctx.save();ctx.fillStyle='#fff8c4';ctx.globalAlpha*=.85;
        for(let i=0;i<nodes;i++){const a=phase*2+i*Math.PI*2/nodes;ctx.fillRect(Math.cos(a)*7.8-1,-12+by+Math.sin(a)*4.5-1,2,2);}
        ctx.restore();
      }
      return drawn>0;
    },

    // T3: one main silhouette + one restrained echo. Larger tiers retain room to grow.
    drawT3SkillVfx(ctx, id, p, radius, reduced, angle = 0, arch = null) {
      const spec = g.SK && g.SK.T3_VFX_CATALOG[id];
      if (!ctx || !spec) return false;
      const q = reduced ? .5 : clamp(p,0,1), r = clamp(radius,1,g.SK.NONLEGENDARY_VFX_BUDGET[3].rMax);
      const low = this.resolveQuality && this.resolveQuality() === 'low';
      ctx.save(); ctx.scale(r,r); ctx.strokeStyle=spec.primary;ctx.fillStyle=spec.primary;
      ctx.lineWidth=1.35/r;ctx.lineCap='round';ctx.lineJoin='round';
      const line=(pts,closed=false)=>{ctx.beginPath();for(let i=0;i<pts.length;i++)i?ctx.lineTo(...pts[i]):ctx.moveTo(...pts[i]);if(closed)ctx.closePath();ctx.stroke();};
      const ellipse=(x,y,rx,ry,rot=0)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot,0,Math.PI*2);ctx.stroke();};
      const arc=(x,y,rr,a,b)=>{ctx.beginPath();ctx.arc(x,y,rr,a,b);ctx.stroke();};
      switch(id){
        case 'violet_point':
          ctx.rotate(angle);line([[-.85,0],[-.3,-.12],[-.05,.12],[.3,-.12],[.85,0],[.56,.2]]);ellipse(.36,0,.21,.35);break;
        case 'moon_pool':
          arc(-.08,-.24,.48,-1.9,1.3);arc(.1,-.27,.39,-1.85,1.3);ellipse(0,.56,.78,.16);line([[-.32,.53],[.45,.53]]);break;
        case 'layered_mist':
          for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-.75+i*.08,-.55+i*.32);ctx.bezierCurveTo(-.22,-.95+i*.32,.2,.12+i*.25,.74-i*.08,-.45+i*.3);ctx.stroke();}break;
        case 'autumn_blades':
          for(let i=0;i<3;i++){ctx.save();ctx.translate((i-1)*.45,(i%2)*.3-.25);ctx.rotate(-.5+q*.4+i*.2);line([[0,-.34],[.17,-.05],[0,.34],[-.15,.05]],true);line([[0,-.2],[0,.32]]);ctx.restore();}break;
        case 'solar_knuckle':
          line([[-.6,.2],[-.62,-.36],[-.3,-.55],[.3,-.55],[.57,-.15],[.4,.35]],true);
          for(let i=0;i<3;i++){const x=(i-1)*.28;line([[x,.1],[x,.6],[x+.12,.78]]);}break;
        case 'frost_rake':
          for(let i=0;i<3;i++){const x=(i-1)*.45;line([[x-.15,-.65],[x+.08,-.25],[x-.02,.18],[x+.2,.65]]);}line([[-.7,.4],[.7,-.4]]);break;
        case 'thorn_guard':
          ellipse(0,0,.48,.58);for(let i=0;i<4;i++){const a=i*Math.PI/2;line([[Math.cos(a)*.48,Math.sin(a)*.58],[Math.cos(a)*.8,Math.sin(a)*.85],[Math.cos(a+.2)*.48,Math.sin(a+.2)*.58]]);}break;
        case 'faith_lamella':
          for(let i=-1;i<=1;i++)line([[i*.35-.16,-.5],[i*.35+.16,-.5],[i*.35+.13,.26],[i*.35,.5],[i*.35-.13,.26]],true);
          if(!arch || ['guard','shield','counter','support','buff','heal','harmonize'].includes(arch)) arc(0,-.1,.75,Math.PI,Math.PI*2);
          else { line([[-.72,-.25],[-.44,-.05]]);line([[.44,.05],[.72,.25]]); }
          break;
        case 'curse_eye':
          line([[-.8,0],[-.3,-.4],[.3,-.4],[.8,0],[.3,.4],[-.3,.4]],true);ellipse(0,0,.23,.23);line([[-.25,.64],[.25,.64]]);break;
        case 'thread_shear':
          line([[-.8,-.5],[-.15,-.06],[.16,.08],[.8,.5]]);line([[-.8,.5],[-.15,.06],[.15,-.06],[.8,-.5]]);
          arc(0,0,.34,-.85,.85);line([[0,-.62],[0,-.35]]);break;
        case 'shadow_stiletto':
          ctx.rotate(angle);line([[-.75,.25],[-.28,.08],[.75,-.35],[.3,.15],[-.25,.3]],true);line([[-.4,-.05],[-.25,.47]]);line([[-.6,.55],[.45,.18]]);break;
        case 'bone_ribs':
          line([[0,-.7],[0,.65]]);for(let i=0;i<3;i++){const y=-.44+i*.35;ctx.beginPath();ctx.moveTo(-.58,y-.15);ctx.quadraticCurveTo(-.7,y+.36,0,y+.24);ctx.quadraticCurveTo(.7,y+.36,.58,y-.15);ctx.stroke();}break;
        case 'blood_furnace':
          line([[-.55,-.2],[-.42,.58],[.42,.58],[.55,-.2]],true);ellipse(0,-.2,.55,.16);
          line([[-.15,-.28],[-.32,-.58],[-.03,-.9],[.19,-.55],[.12,-.28]]);break;
        case 'cloud_bodkin':
          ctx.rotate(angle);line([[-.82,0],[.4,0],[.25,-.2],[.88,0],[.25,.2],[.4,0]]);
          arc(-.2,-.13,.4,Math.PI,Math.PI*1.9);arc(-.15,.18,.4,.1,Math.PI);break;
        case 'iron_breach':
          ctx.rotate(angle);line([[-.85,0],[.75,0],[.42,-.18],[.75,0],[.42,.18]]);
          line([[.05,-.75],[-.05,-.27],[.12,-.12]]);line([[.15,.15],[-.02,.31],[.1,.72]]);break;
        case 'gravity_staff':
          line([[-.25,-.85],[.16,.15],[.4,.05],[0,-.93]],true);line([[-.75,.65],[-.22,.33],[.02,.6],[.33,.38],[.75,.62]]);break;
        case 'cross_execution':
          ctx.rotate(angle);line([[-.7,-.7],[.7,.7],[.28,.08]],true);line([[-.7,.7],[.7,-.7],[.1,-.16]],true);break;
        case 'abacus_grid':
          line([[-.72,-.55],[.72,-.55],[.72,.55],[-.72,.55]],true);
          for(let i=-1;i<=1;i++){line([[i*.38,-.48],[i*.38,.48]]);ellipse(i*.38,(i%2)*.17,.12,.07);}break;
        case 'baji_impact':
          line([[-.62,-.65],[-.2,-.65],[.03,-.25],[.3,-.08],[.22,.4],[-.38,.55],[-.62,.1]],true);
          for(let i=0;i<2;i++)arc(-.1,0,.64+i*.24,-.8,.8);break;
        case 'blade_disc':
          ctx.rotate(reduced?0:q*.8);ellipse(0,0,.28,.28);for(let i=0;i<4;i++){ctx.save();ctx.rotate(i*Math.PI/2);line([[.2,-.15],[.62,-.55],[.85,-.12],[.36,.1]],true);ctx.restore();}break;
        case 'karma_links':
          for(let i=0;i<3;i++)ellipse((i-1)*.48,(i-1)*.2,.34,.2,.4);line([[-.65,.45],[-.45,.7]]);break;
        case 'healing_chime':
          line([[-.46,.2],[-.3,-.45],[0,-.58],[.3,-.45],[.46,.2],[-.46,.2]]);ellipse(0,.2,.46,.13);line([[0,.2],[0,.4]]);
          arc(0,.1,.72,.55,2.6);break;
        case 'zither_breeze':
          for(let i=0;i<3;i++){const y=(i-1)*.28;ctx.beginPath();ctx.moveTo(-.75,y);ctx.bezierCurveTo(-.25,y-.32,.2,y+.3,.75,y);ctx.stroke();}
          line([[-.62,-.65],[-.62,.6]]);ellipse(.55,-.44,.13,.08);break;
        case 'frost_harmony':
          line([[-.65,-.44],[.65,-.44],[.55,.44],[-.55,.44]],true);for(let i=-1;i<=1;i++)line([[i*.3,-.4],[i*.3,.4]]);
          line([[0,-.75],[0,-.48],[-.15,-.63],[0,-.53],[.15,-.63]]);break;
      }
      if(!low){
        // A single understated echo, not the multiple layers reserved for T4–T7.
        ctx.strokeStyle=spec.accent;ctx.lineWidth=.8/r;ctx.globalAlpha*=.5;
        arc(0,.15,.9,reduced?.2:q*.55,1.15+(reduced?.2:q*.55));
      }
      ctx.restore();return true;
    },

    // Quiet common motifs: <= 3 repeated marks per form, muted colors, no bloom or screen wash.
    drawCommonSkillVfx(ctx, id, p, radius, reduced, angle = 0, harmful = false) {
      const spec = g.SK && g.SK.COMMON_VFX_CATALOG[id];
      if (!ctx || !spec) return false;
      const q = reduced ? 0.5 : clamp(p, 0, 1), r = Math.min(17, radius);
      ctx.save(); ctx.scale(r, r); ctx.lineWidth = 1.2 / r;
      ctx.strokeStyle = harmful ? '#c58c9b' : spec.primary;
      ctx.fillStyle = harmful ? '#b87789' : spec.primary;
      ctx.globalAlpha *= 0.78; ctx.lineCap = 'round';
      const line = (pts, close = false) => { ctx.beginPath(); for (let i = 0; i < pts.length; i++) { const [x,y] = pts[i]; i ? ctx.lineTo(x,y) : ctx.moveTo(x,y); } if (close) ctx.closePath(); ctx.stroke(); };
      const oval = (x,y,rx,ry) => { ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.stroke(); };
      const dot = (x,y,s) => { ctx.beginPath(); ctx.arc(x,y,s,0,Math.PI*2); ctx.fill(); };
      switch (id) {
        case 'qi_palm':
          ctx.rotate(angle); line([[-.6,.3],[-.2,-.15],[.1,-.15],[.1,-.65],[.25,-.68],[.4,-.12],[.55,-.5],[.7,-.38],[.63,.2],[.2,.52],[-.3,.52]]); break;
        case 'stone_fist':
          line([[-.6,.25],[-.6,-.35],[-.3,-.55],[.42,-.55],[.65,-.1],[.5,.42],[-.3,.48]],true); line([[-.3,-.5],[-.3,-.05],[.3,.05]]); break;
        case 'heart_ward':
          ctx.beginPath(); ctx.moveTo(0,.65); ctx.bezierCurveTo(-1,-.05,-.65,-.85,0,-.35); ctx.bezierCurveTo(.65,-.85,1,-.05,0,.65); ctx.stroke(); break;
        case 'blood_drop':
          ctx.beginPath(); ctx.moveTo(0,-.75); ctx.bezierCurveTo(-.8,.2,-.45,.65,0,.65); ctx.bezierCurveTo(.45,.65,.8,.2,0,-.75); ctx.stroke(); line([[-.15,.25],[.08,.4]]); break;
        case 'mind_ripple':
          for(let i=0;i<3;i++) { ctx.beginPath(); ctx.arc(0,.08,.22+i*.23,-2.6,2.6); ctx.stroke(); } break;
        case 'paw_signal':
          oval(0,.25,.3,.23); for(let i=0;i<3;i++) dot((i-1)*.33,-.25-Math.abs(i-1)*-.1,.11); break;
        case 'heal_sprout':
          line([[0,.65],[0,-.2]]); ctx.beginPath();ctx.moveTo(0,.1);ctx.quadraticCurveTo(-.8,.08,-.52,-.48);ctx.quadraticCurveTo(-.02,-.4,0,.1);ctx.moveTo(0,-.05);ctx.quadraticCurveTo(.8,-.05,.5,-.65);ctx.quadraticCurveTo(.02,-.5,0,-.05);ctx.stroke(); break;
        case 'qi_thread':
          for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(-.7,(i-.5)*.45);ctx.bezierCurveTo(-.2,-.65+i*.4,.2,.65-i*.4,.7,(i-.5)*.45);ctx.stroke();} dot(-.5+q,.03,.1);break;
        case 'forge_spark':
          for(let i=0;i<3;i++){const a=-2.4+i*.8;line([[Math.cos(a)*.2,Math.sin(a)*.2],[Math.cos(a)*(.55+q*.15),Math.sin(a)*(.55+q*.15)]]);} line([[-.5,.4],[.5,.4]]); break;
        case 'gear_tick':
          oval(0,0,.4,.4); for(let i=0;i<3;i++){const a=i*Math.PI*2/3;line([[Math.cos(a)*.4,Math.sin(a)*.4],[Math.cos(a)*.7,Math.sin(a)*.7]]);}dot(0,0,.09);break;
        case 'sword_drizzle':
          ctx.rotate(angle); for(let i=-1;i<=1;i++)line([[i*.4-.1,-.55],[i*.4+.15,.55],[i*.4-.02,.36]]);break;
        case 'thorn_whip':
          ctx.beginPath();ctx.moveTo(-.75,.3);ctx.bezierCurveTo(-.5,-.85,.3,.6,.75,-.3);ctx.stroke();line([[-.3,-.15],[-.4,-.45]]);line([[.3,.08],[.4,.38]]);break;
        case 'silver_pin':
          ctx.rotate(angle);line([[-.75,0],[.7,0],[.45,-.12]]);oval(-.52,0,.13,.08);break;
        case 'twin_balance':
          for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(0,0,.55,i*Math.PI+.2,i*Math.PI+2.7);ctx.stroke();dot(Math.cos(i*Math.PI+.5)*.3,Math.sin(i*Math.PI+.5)*.3,.08);}break;
        case 'star_guard':
          line([[-.55,-.45],[0,-.65],[.55,-.45],[.4,.3],[0,.65],[-.4,.3]],true);line([[0,-.3],[0,.26]]);break;
        case 'bronze_skin':
          for(let i=-1;i<=1;i++)line([[i*.34,-.45],[i*.34+.2,-.4],[i*.34+.18,.35],[i*.34,.45]],true);break;
        case 'frost_knuckle':
          for(let i=0;i<3;i++){ctx.save();ctx.rotate(i*Math.PI*2/3);line([[0,0],[0,-.7],[-.15,-.45],[0,-.55],[.15,-.45]]);ctx.restore();}break;
        case 'thunder_tap':
          line([[.15,-.75],[-.36,.03],[.15,-.06],[-.15,.7],[.5,-.15],[.03,-.06]]);break;
        case 'incense_wisp':
          for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*.35,.55);ctx.bezierCurveTo(i*.35-.35,-.1,i*.35+.3,-.2,i*.35,-.65);ctx.stroke();}break;
        case 'ink_bind':
          line([[-.6,-.5],[.55,-.35],[-.3,.15],[.6,.55]]);dot(-.4,.5,.12);dot(.55,-.6,.08);break;
        case 'dream_haze':
          for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse((i-1)*.25,(i-1)*.27,.45,.15,-.2,0,Math.PI*1.7);ctx.stroke();}break;
        case 'poison_barb':
          line([[-.65,.45],[.5,-.6],[.15,-.5],[.5,-.6],[.4,-.2]]);dot(-.25,-.4,.14);dot(.4,.4,.1);break;
        case 'soul_needle':
          line([[-.75,.1],[.5,-.15],[.25,-.3],[.75,-.2],[.3,.18],[.5,-.15]]);oval(-.4,.05,.17,.3);break;
        case 'straight_jab':
          ctx.rotate(angle);line([[-.75,-.2],[.35,-.2],[.6,0],[.35,.3],[-.75,.3]]);line([[-.3,-.2],[-.3,.3]]);break;
        case 'draw_cut':
          ctx.rotate(angle);ctx.beginPath();ctx.moveTo(-.7,.4);ctx.quadraticCurveTo(-.05,-.1,.7,-.5);ctx.quadraticCurveTo(.25,.3,-.7,.4);ctx.stroke();break;
        case 'arrow_fletch':
          ctx.rotate(angle);line([[-.75,0],[.7,0],[.42,-.2],[.7,0],[.42,.2]]);line([[-.7,-.23],[-.45,0],[-.7,.23]]);break;
        case 'staff_broom':
          ctx.beginPath();ctx.arc(0,0,.7,-.15,2.8);ctx.stroke();line([[-.65,-.4],[.65,.35]]);dot(-.55,.5,.06);break;
        case 'spear_point':
          ctx.rotate(angle);line([[-.8,0],[.18,0],[.18,-.22],[.75,0],[.18,.22],[.18,0]]);break;
        case 'seal_knot':
          line([[-.4,-.6],[.4,-.6],[.4,.6],[-.4,.6]],true);line([[-.6,0],[.6,0],[0,-.4],[0,.4]]);break;
        case 'root_stance':
          line([[0,-.55],[0,.15],[-.6,.6],[-.3,.15],[.3,.15],[.6,.6]]);line([[-.65,.65],[.65,.65]]);break;
      }
      ctx.restore(); return true;
    },

    // Select one beneficial and one harmful live status. Never purge or extend simulation statuses.
    drawCommonStatusAuras(ctx, n, by = 0) {
      if (!ctx || !n || n.dead || n.away || n.gone || n.hidden || !this.W || !g.SK || !Array.isArray(n.sx)) return 0;
      const slots = [null,null];
      for (const entry of n.sx) {
        if (!entry || !Number.isFinite(entry.until) || entry.until <= this.W.t) continue;
        const t3 = !!g.SK.STATUS_TO_T3_VFX[entry.k];
        const id = g.SK.STATUS_TO_COMMON_VFX[entry.k] || g.SK.STATUS_TO_T3_VFX[entry.k], spec = g.SK.STATUS[entry.k];
        if (!id || !spec) continue;
        const positive = !!(spec.isBuff || ['guardUp','shield','counter','haste','evadeUp','morale','holyAura','critUp'].includes(entry.k));
        const slot = positive ? 0 : 1;
        if (!slots[slot]) slots[slot] = { id, harmful: !positive, t3 };
      }
      const reduced = this.isReducedMotion(), p = reduced ? .5 : ((this.t || 0) * .35) % 1;
      let count = 0;
      for (let i=0;i<slots.length;i++) if(slots[i]) {
        ctx.save(); ctx.translate(i ? 9 : -9, -8 + by*.2); ctx.globalAlpha *= .72;
        if(slots[i].t3) this.drawT3SkillVfx(ctx, slots[i].id, p, 6.5, reduced);
        else this.drawCommonSkillVfx(ctx, slots[i].id, p, 5.5, reduced, 0, slots[i].harmful);
        ctx.restore(); count++;
      }
      return count;
    },

    drawCommonPassiveAura(ctx, n, act, by = 0) {
      if (!ctx || !n || n.dead || n.away || n.gone || n.hidden || !g.SK ||
          !['fight','practice','cultivate','breakthrough'].includes(act) && this.selected !== n.id) return false;
      const passives = this.readOnlyActivePassives(n);
      const primaryTech = passives.find(t => !t.legendary && (g.SK.PASSIVE_TO_COMMON_VFX[t.id] || g.SK.PASSIVE_TO_T3_VFX[t.id] || g.SK.PASSIVE_TO_T6_VFX[t.id]));
      const extTech = primaryTech || passives.find(t => !t.legendary && (
        (g.SK.PASSIVE_TO_T6_EXT_VFX && g.SK.PASSIVE_TO_T6_EXT_VFX[t.id]) ||
        (g.SK.PASSIVE_TO_T5_VFX && g.SK.PASSIVE_TO_T5_VFX[t.id]) ||
        (g.SK.PASSIVE_TO_T4_VFX && g.SK.PASSIVE_TO_T4_VFX[t.id]) ||
        (g.SK.PASSIVE_TO_T3_GROUP_VFX && g.SK.PASSIVE_TO_T3_GROUP_VFX[t.id]) ||
        (g.SK.PASSIVE_TO_T2_VFX && g.SK.PASSIVE_TO_T2_VFX[t.id]) ||
        (g.SK.PASSIVE_TO_T1_VFX && g.SK.PASSIVE_TO_T1_VFX[t.id])
      ));
      if (!extTech) return false;
      const low = this.resolveQuality() === 'low';
      ctx.save(); ctx.translate(0, 3 + by*.2); ctx.globalAlpha *= .38;
      if (g.SK.PASSIVE_TO_T6_VFX[extTech.id]) this.drawT6FamilyGlyph(ctx, g.SK.PASSIVE_TO_T6_VFX[extTech.id], .5, 9.5, true, low);
      else if (g.SK.PASSIVE_TO_T3_VFX[extTech.id]) this.drawT3SkillVfx(ctx, g.SK.PASSIVE_TO_T3_VFX[extTech.id], .5, 8, true);
      else if (g.SK.PASSIVE_TO_COMMON_VFX[extTech.id]) this.drawCommonSkillVfx(ctx, g.SK.PASSIVE_TO_COMMON_VFX[extTech.id], .5, 7, true);
      else if (g.SK.PASSIVE_TO_T6_EXT_VFX && g.SK.PASSIVE_TO_T6_EXT_VFX[extTech.id]) this.drawT6ExtFamilyGlyph(ctx, g.SK.PASSIVE_TO_T6_EXT_VFX[extTech.id], .5, 9.5, true, low);
      else if (g.SK.PASSIVE_TO_T5_VFX && g.SK.PASSIVE_TO_T5_VFX[extTech.id]) this.drawT5FamilyGlyph(ctx, g.SK.PASSIVE_TO_T5_VFX[extTech.id], .5, 9.0, true, low);
      else if (g.SK.PASSIVE_TO_T4_VFX && g.SK.PASSIVE_TO_T4_VFX[extTech.id]) this.drawT4FamilyGlyph(ctx, g.SK.PASSIVE_TO_T4_VFX[extTech.id], .5, 8.5, true, low);
      else if (g.SK.PASSIVE_TO_T3_GROUP_VFX && g.SK.PASSIVE_TO_T3_GROUP_VFX[extTech.id]) this.drawT3ExtSkillVfx(ctx, g.SK.PASSIVE_TO_T3_GROUP_VFX[extTech.id], .5, 8.0, true);
      else if (g.SK.PASSIVE_TO_T2_VFX && g.SK.PASSIVE_TO_T2_VFX[extTech.id]) this.drawT2SkillVfx(ctx, g.SK.PASSIVE_TO_T2_VFX[extTech.id], .5, 7.2, true);
      else if (g.SK.PASSIVE_TO_T1_VFX && g.SK.PASSIVE_TO_T1_VFX[extTech.id]) this.drawT1ExtSkillVfx(ctx, g.SK.PASSIVE_TO_T1_VFX[extTech.id], .5, 6.8, true);
      ctx.restore(); return extTech.id;
    },

    drawAppliedBuffAura(ctx, n, by) {
      const commonCount = this.drawCommonStatusAuras(ctx, n, by);
      if (!ctx || !n || !Array.isArray(n.sx) || !this.W || !g.SK || !g.SK.STATUS) return false;
      const positive = n.sx.filter(entry => {
        if (!entry || !Number.isFinite(entry.until) || entry.until <= this.W.t) return false;
        const spec = g.SK.STATUS[entry.k]; if (!spec) return false;
        if (spec.isBuff || (g.STATS && g.STATS.BUFF_CATALOG && g.STATS.BUFF_CATALOG[entry.k])) return true;
        if (['guardUp', 'evadeUp', 'counter', 'shield', 'critUp', 'haste', 'morale', 'holyAura', 'tacticalCommand'].includes(entry.k)) return true;
        return Object.values(spec.mods || {}).some(value => value > 0) || Object.values(spec.pmods || {}).some(value => value > 0);
      });
      if (!positive.length) return false;
      const ids = positive.map(entry => entry.k);
      const family = /aegis|ward|shield|guard|barrier|holyAura|nirvana|karmic/i.test(ids.join('|')) ? 'guard'
        : /vital|regen|clarity|meridian|lotus|healing/i.test(ids.join('|')) ? 'life'
          : /haste|swift|wind|step|mirage|evade/i.test(ids.join('|')) ? 'wind'
            : /morale|fervor|might|frenzy|critUp|command/i.test(ids.join('|')) ? 'power' : 'qi';
      if (commonCount && positive.every(entry => g.SK.STATUS_TO_COMMON_VFX[entry.k] || g.SK.STATUS_TO_T3_VFX[entry.k])) return family;
      const palette = { guard: ['#72efdd', '#d4fff6'], life: ['#79d98c', '#e4ffb5'], wind: ['#80deea', '#e0fbff'], power: ['#ffd166', '#fff2bd'], qi: ['#c792ea', '#f0dcff'] }[family];
      const reduced = this.isReducedMotion(), phase = reduced ? 0.5 : (Number.isFinite(this.t) ? this.t : 0) + (n.n || 0) * 0.41;
      ctx.save(); ctx.globalAlpha *= 0.58 + (reduced ? 0 : Math.sin(phase * 2.1) * 0.08);
      ctx.strokeStyle = palette[0]; ctx.fillStyle = palette[1]; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(0, 1 + by * 0.2, 11.5, 4.8, 0, 0, Math.PI * 2); ctx.stroke();
      if (family === 'guard') {
        ctx.beginPath(); ctx.arc(0, -5 + by * 0.25, 8.5, Math.PI, 0, false); ctx.lineTo(8.5, 1 + by * 0.2); ctx.lineTo(-8.5, 1 + by * 0.2); ctx.closePath(); ctx.stroke();
      } else if (family === 'life') {
        for (let i = 0; i < 3; i++) { const a = phase * 0.8 + i * Math.PI * 2 / 3; ctx.save(); ctx.translate(Math.cos(a) * 10, -7 + by * 0.25 + Math.sin(a) * 2.5); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, 0, 1.6, 3.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
      } else if (family === 'wind') {
        for (let i = 0; i < 3; i++) { const y = -7 + i * 2.3 + by * 0.25; ctx.beginPath(); ctx.moveTo(-10, y); ctx.quadraticCurveTo(0, y - 2.2, 10, y); ctx.stroke(); }
      } else if (family === 'power') {
        for (let i = 0; i < 4; i++) { const a = phase * 0.55 + i * Math.PI / 2; const x = Math.cos(a) * 10, y = -6 + by * 0.2 + Math.sin(a) * 3.2; ctx.beginPath(); ctx.arc(x, y, 1.15, 0, Math.PI * 2); ctx.fill(); }
      } else {
        for (let i = 0; i < 3; i++) { const a = phase * 0.65 + i * Math.PI * 2 / 3; ctx.beginPath(); ctx.arc(Math.cos(a) * 10, -7 + by * 0.25 + Math.sin(a) * 3, 1.25, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.restore(); return family;
    },

    drawLegendaryAura(ctx, n, act) {
      if (!n || !n.cult) return;
      if (act !== 'fight' && act !== 'cultivate' && act !== 'practice' && act !== 'breakthrough' && this.selected !== n.id) return;
      const activePassives = this.readOnlyActivePassives(n);
      const legPass = activePassives.filter(t => t && t.legendary && t.fxKind);
      const legMantra = n.cult.mantra ? CULT.tech(n.cult.mantra) : null;
      const hasLegMantra = !!(legMantra && legMantra.legendary && legMantra.fxKind);
      if (!legPass.length && !hasLegMantra) return;

      const reduced=this.isReducedMotion(),low=this.resolveQuality()==='low';
      const t = reduced?.5:this.t + (n.n || 0) * 0.7;
      ctx.save();
      ctx.scale(low?1.15:1.35,low?1.15:1.35);
      for(const lp of legPass)this.drawLegendaryPassiveCrown(ctx,lp,t,reduced,low);
      if (hasLegMantra) {
        const mKey = legMantra.fxKind;
        const spec = LEGENDARY_MOTIFS[mKey] || { primary: '#ffd54f', secondary: '#ff9800', accent: '#ffffff' };
        ctx.strokeStyle = spec.primary; ctx.globalAlpha = 0.68; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(0, 1.2, 9.2, 3.8, 0, 0, 7); ctx.stroke();
        if (mKey === 'legend_taixuan_runes') {
          for (let i = 0; i < 5; i++) {
            const a = t * 1.4 + i * Math.PI * 2 / 5;
            ctx.fillStyle = spec.accent;
            ctx.fillRect(Math.cos(a) * 9.5 - 1, -7 + Math.sin(a) * 3.5, 2, 2.5);
          }
        } else if (mKey === 'legend_six_meridian') {
          const cols = ['#ff5252', '#ffd740', '#69f0ae', '#40c4ff', '#7c4dff', '#ff4081'];
          for (let i = 0; i < 6; i++) {
            const a = t * 1.8 + i * Math.PI / 3;
            ctx.fillStyle = cols[i];
            ctx.beginPath(); ctx.arc(Math.cos(a) * 9.5, -8 + Math.sin(a) * 3.8, 1.3, 0, 7); ctx.fill();
          }
        } else if (mKey === 'legend_dragon_elephant') {
          ctx.strokeStyle = spec.secondary;
          ctx.beginPath(); ctx.arc(-6, -9, 3.2, 0, 7); ctx.arc(6, -9, 3.2, 0, 7); ctx.stroke();
        } else if (mKey === 'legend_vajra_bell') {
          ctx.strokeStyle = spec.primary;
          ctx.beginPath(); ctx.arc(0, -9, 10.8, Math.PI * 0.95, Math.PI * 2.05); ctx.stroke();
        } else if (mKey === 'legend_eight_desolations') {
          for (let i = 0; i < 8; i++) {
            const a = t * 1.2 + i * Math.PI / 4;
            ctx.beginPath(); ctx.moveTo(Math.cos(a) * 8, 1 + Math.sin(a) * 3); ctx.lineTo(Math.cos(a) * 11.5, 1 + Math.sin(a) * 4.5); ctx.stroke();
          }
        } else if (mKey === 'legend_celestial_mandate') {
          ctx.strokeStyle = spec.secondary;
          for (const px2 of [-7, 7]) {
            ctx.beginPath(); ctx.moveTo(px2, 1); ctx.lineTo(px2, -13); ctx.stroke();
          }
        } else if (mKey === 'legend_ashura_blood') {
          ctx.strokeStyle = spec.primary;
          ctx.beginPath(); ctx.arc(0, -6, 9.5, 0.2, Math.PI - 0.2); ctx.stroke();
        } else if (mKey === 'legend_gu_monarch') {
          for (let i = 0; i < 4; i++) {
            const a = t * 2 + i * Math.PI / 2;
            ctx.fillStyle = i % 2 ? spec.primary : spec.secondary;
            ctx.beginPath(); ctx.arc(Math.cos(a) * 9, -6 + Math.sin(a) * 4, 1.4, 0, 7); ctx.fill();
          }
        } else if (mKey === 'legend_nine_yin_mirror') {
          ctx.strokeStyle = spec.accent;
          ctx.beginPath(); ctx.arc(0, -14, 4.2, -Math.PI * 0.8, Math.PI * 0.2); ctx.stroke();
        } else if (mKey === 'legend_little_li_dagger') {
          const a = t * 2.4;
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(Math.cos(a) * 9 - 2, -11 + Math.sin(a) * 3); ctx.lineTo(Math.cos(a) * 9 + 2, -11 + Math.sin(a) * 3); ctx.stroke();
        } else if (mKey === 'legend_shennong_crucible') {
          for (let i = 0; i < 4; i++) {
            const a = t * 1.6 + i * Math.PI / 2;
            ctx.fillStyle = i % 2 ? spec.primary : spec.secondary;
            ctx.beginPath(); ctx.arc(Math.cos(a) * 8.5, -5 - ((t * 5 + i * 3) % 9), 1.5, 0, 7); ctx.fill();
          }
        } else if (mKey === 'legend_sovereign_edict') {
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.4;
          ctx.strokeRect(-4.2, -16.5, 8.4, 4.2);
          for (let i = 0; i < 4; i++) {
            const a = t * 1.5 + i * Math.PI / 2;
            ctx.fillStyle = i % 2 ? spec.primary : spec.secondary;
            ctx.fillRect(Math.cos(a) * 9.5 - 1.2, -6 + Math.sin(a) * 3.5, 2.4, 3.2);
          }
        }
      }
      ctx.restore();
    },

    nightFactor(h) {
      if (h >= 7 && h < 17.5) return 0;
      if (h >= 19.5 || h < 4.5) return 1;
      if (h >= 17.5) return (h - 17.5) / 2;
      if (h >= 4.5 && h < 7) return 1 - (h - 4.5) / 2.5;
      return 0;
    },

    drawWater(ctx) {
      const W = this.W, t = this.t;
      const b = W.map.byId.spirit_pond;
      if (b) {
        ctx.save();
        ctx.beginPath(); ctx.rect(b.x * TS, b.y * TS, b.w * TS, b.h * TS); ctx.clip();
        ctx.strokeStyle = 'rgba(255,255,255,.36)'; ctx.lineWidth = 0.85;
        for (let i = 0; i < 14; i++) {
          const x = b.x * TS + ((i * 53 + t * 6) % (b.w * TS)), y = b.y * TS + ((i * 37) % (b.h * TS));
          ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 5, y - 2 + Math.sin(t * 2 + i) * 1.5, x + 10, y); ctx.stroke();
        }
        for (let i = 0; i < 7; i++) {
          const x = b.x * TS + ((i * 61) % (b.w * TS - 20)) + 10, y = b.y * TS + ((i * 43) % (b.h * TS - 20)) + 10;
          ctx.fillStyle = 'rgba(84,166,88,.92)';
          ctx.beginPath(); ctx.ellipse(x, y, 5.2, 3.2, 0, 0.2, Math.PI * 1.9); c_fill(ctx);
          if (i % 2 === 0) {
            ctx.fillStyle = '#f8c2d8';
            ctx.beginPath(); ctx.arc(x + 1, y - 1, 2.0, 0, 7); ctx.fill();
          }
        }
        ctx.restore();
      }
      // วาดคลื่นน้ำและเงาปลาใน「ธารน้ำปราณทักษิณ」(y = 165..176) เมื่อกล้องส่องลงมาด้านใต้
      const hh = this.vh / 2 / this.cam.z;
      if (this.cam.y + hh >= 248 * TS && this.effectiveQuality !== 'low') {
        ctx.save();
        ctx.strokeStyle = 'rgba(230,252,255,.34)';
        ctx.lineWidth = 0.9;
        for (let i = 0; i < 28; i++) {
          const rx = ((i * 83 + t * 9) % (216 * TS)) + 12 * TS;
          const tx = Math.floor(rx / TS);
          if ((tx >= 92 && tx <= 94) || (tx >= 178 && tx <= 182) || (tx >= 264 && tx <= 266)) continue;
          const cy = (MAP.riverCenterY ? MAP.riverCenterY(tx) : 170) * TS + ((i % 5) - 2) * 7;
          ctx.beginPath();
          ctx.moveTo(rx, cy);
          ctx.quadraticCurveTo(rx + 6, cy - 1.8 + Math.sin(t * 2.2 + i) * 1.4, rx + 12, cy);
          ctx.stroke();
        }
        // เงาปลาแหวกว่ายใต้น้ำตามความอุดมสมบูรณ์ของแหล่งน้ำ
        ctx.fillStyle = 'rgba(24,68,78,.38)';
        for (let i = 0; i < 12; i++) {
          const fx = ((i * 137 + t * (12 + (i % 3) * 4)) % (160 * TS)) + 40 * TS;
          const tx = Math.floor(fx / TS);
          if ((tx >= 177 && tx <= 183) || (tx >= 91 && tx <= 95) || (tx >= 263 && tx <= 267)) continue;
          const fy = (MAP.riverCenterY ? MAP.riverCenterY(tx) : 170) * TS + Math.sin(t * 1.6 + i) * 14;
          ctx.beginPath();
          ctx.ellipse(fx, fy, 4.2, 1.8, Math.sin(t * 2 + i) * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }
        // ประกายแดดระยิบระยับบนผิวน้ำ (Living Water Caustics — Pillar 4)
        ctx.fillStyle = 'rgba(255,238,165,.48)';
        for (let i = 0; i < 16; i++) {
          const cx = ((i * 97 + t * 14) % (180 * TS)) + 30 * TS;
          const tx = Math.floor(cx / TS);
          const cy = (MAP.riverCenterY ? MAP.riverCenterY(tx) : 170) * TS + Math.cos(t * 2.5 + i) * 9;
          const gl = 0.8 + 0.7 * Math.sin(t * 4.5 + i * 1.9);
          if (gl > 0.4) {
            ctx.beginPath();
            ctx.arc(cx, cy, gl * 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }
      if (b) {
        // Golden water caustics on spirit_pond
        ctx.save();
        ctx.fillStyle = 'rgba(255,240,175,.45)';
        for (let i = 0; i < 8; i++) {
          const gx = b.x * TS + 12 + ((i * 43 + t * 8) % Math.max(16, (b.w - 2) * TS));
          const gy = b.y * TS + 12 + ((i * 29 + Math.sin(t * 2 + i) * 6) % Math.max(16, (b.h - 2) * TS));
          ctx.beginPath();
          ctx.arc(gx, gy, 1.3 + 0.5 * Math.sin(t * 4 + i), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    },

    computeSunShadow(tMinutes) {
      return R.computeSunShadow(tMinutes != null ? tMinutes : (this.W ? this.W.t : 0));
    },

    drawPeakMist(ctx, peakArea, alpha) {
      return R.drawPeakMist(ctx, peakArea, alpha, this.t);
    },

    drawLeylineVeins(ctx) {
      const W = this.W;
      if (!W || !W.map || !Array.isArray(W.map.leylinePaths)) return;
      const t = this.t;
      ctx.save();
      for (let i = 0; i < W.map.leylinePaths.length; i++) {
        const lp = W.map.leylinePaths[i];
        const pts = lp && lp.waypoints;
        if (!pts || pts.length < 2) continue;
        const active = MAP.isPeakBuildingActive ? MAP.isPeakBuildingActive(W, lp.peakId) : false;
        ctx.strokeStyle = active ? (lp.color || '#48cae4') : 'rgba(130,180,195,0.22)';
        ctx.lineWidth = active ? 2.6 : 1.3;
        ctx.globalAlpha = active ? (0.48 + 0.16 * Math.sin(t * 2.4 + i)) : 0.24;
        ctx.beginPath();
        ctx.moveTo(pts[0].x * TS, pts[0].y * TS);
        for (let j = 1; j < pts.length; j++) {
          ctx.lineTo(pts[j].x * TS, pts[j].y * TS);
        }
        ctx.stroke();

        if (active) {
          // Flowing qi pulse node along the leyline toward Central Bagua Plaza
          const prog = (t * 0.35 + i * 0.13) % 1;
          const segIdx = Math.min(pts.length - 2, Math.floor(prog * (pts.length - 1)));
          const segU = (prog * (pts.length - 1)) - segIdx;
          const px = (pts[segIdx].x + (pts[segIdx + 1].x - pts[segIdx].x) * segU) * TS;
          const py = (pts[segIdx].y + (pts[segIdx + 1].y - pts[segIdx].y) * segU) * TS;
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.82;
          ctx.beginPath();
          ctx.arc(px, py, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    },

    drawDriftingMountainMist(ctx) {
      const W = this.W;
      if (!W) return;
      const wt = (W.t || 0) * 0.25 + this.t * 6;
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,.12)';
      for (let i = 0; i < 6; i++) {
        const mx = ((i * 420 + wt * (1.2 + (i % 3) * 0.3)) % (MAP.W * TS));
        const my = (22 + i * 24) * TS + Math.sin(this.t * 0.6 + i) * 18;
        ctx.beginPath();
        ctx.ellipse(mx, my, 110 + (i % 3) * 35, 22 + (i % 2) * 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    },

    drawSectBarrierDome(ctx) {
      const W = this.W;
      if (!W || !W.sect) return;
      const bar = W.sect.elementalBarrier;
      const isActive = W.sect.barrierActive !== false && (!bar || bar.active !== false);
      if (!isActive) return;

      const colHex = R.resolveBarrierColor(W);
      const cx = 180 * TS, cy = 126 * TS, rx = 110 * TS, ry = 74 * TS;
      const pulse = 0.5 + 0.5 * Math.sin(this.t * 1.8);

      ctx.save();
      // Outer protective barrier dome ring
      ctx.strokeStyle = colHex;
      ctx.lineWidth = 2.4;
      ctx.globalAlpha = 0.28 + pulse * 0.12;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Hexagonal Shield Mesh (ลายตาข่ายรวงผึ้งหกเหลี่ยม)
      ctx.lineWidth = 1.1;
      ctx.globalAlpha = 0.18 + pulse * 0.08;
      const hexR = 24;
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2 + this.t * 0.05;
        const hx = cx + Math.cos(ang) * (rx * 0.88);
        const hy = cy + Math.sin(ang) * (ry * 0.88);
        ctx.beginPath();
        for (let k = 0; k <= 6; k++) {
          const ha = k * Math.PI / 3;
          const vx = hx + Math.cos(ha) * hexR;
          const vy = hy + Math.sin(ha) * hexR * 0.68;
          if (k === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.stroke();
      }
      ctx.restore();
    },

    drawDeco(ctx, d, night) {
      const x = d.x * TS, y = d.y * TS, t = this.t;
      if (d.kind === 'lantern') {
        ctx.fillStyle = 'rgba(0,0,0,.18)';
        ctx.beginPath(); ctx.ellipse(x + 8, y + 10, 4, 1.8, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#523422'; ctx.fillRect(x + 7, y - 7, 2, 17);
        ctx.fillStyle = '#382416'; ctx.fillRect(x + 4.5, y - 12, 7, 2.2);
        ctx.fillStyle = night > 0.2 ? '#ffda8e' : '#c9382b';
        const f = night > 0.2 ? 1 + Math.sin(t * 5 + d.x) * 0.05 : 1;
        ctx.beginPath(); ctx.ellipse(x + 8, y - 6.5, 4.2 * f, 5.2 * f, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = '#e8c068'; ctx.lineWidth = 0.7; ctx.stroke();
      } else if (d.kind === 'banner') {
        ctx.fillStyle = '#523422'; ctx.fillRect(x + 7, y - 27, 2.2, 35);
        const w = Math.sin(t * 2 + d.x) * 2;
        ctx.fillStyle = '#a82b24';
        ctx.beginPath();
        ctx.moveTo(x + 9, y - 26);
        ctx.lineTo(x + 22 + w, y - 23);
        ctx.lineTo(x + 20 + w, y - 7);
        ctx.lineTo(x + 9, y - 9);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#e8c458'; ctx.lineWidth = 0.8; ctx.stroke();
        ctx.fillStyle = '#f2d25c'; ctx.fillRect(x + 12, y - 19, 6 + w / 2, 2);
      } else if (d.kind === 'fountain') {
        ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(x + 8, y + 7, 24, 12, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#9c9689'; ctx.beginPath(); ctx.ellipse(x + 8, y + 6, 22, 11, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#4a98bf'; ctx.beginPath(); ctx.ellipse(x + 8, y + 5, 18, 8, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#bab3a4'; ctx.fillRect(x + 5, y - 9, 6, 13);
        ctx.beginPath(); ctx.arc(x + 8, y - 10, 4, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(215,242,255,.9)'; ctx.lineWidth = 1.2;
        for (let i = 0; i < 5; i++) {
          const a = i / 5 * 6.28 + t * 0.5;
          ctx.beginPath();
          ctx.moveTo(x + 8, y - 9);
          ctx.quadraticCurveTo(x + 8 + Math.cos(a) * 9, y - 18, x + 8 + Math.cos(a) * 15, y + 3 + Math.sin(a) * 3);
          ctx.stroke();
        }
      }
    },

    /* ---------- อาคารและเอฟเฟกต์ตามสถานะจริง ---------- */
    drawBuilding(ctx, b, hour, night) {
      const bt = MAP.BTYPES[b.type], c = this.cam, z = c.z;
      if (bt.open) { this.drawOpenArea(ctx, b, z); return; }

      // Patch v4.1.0 [Pillar 2]: Fog-Shrouded Peak Awakening & Conditional Unveiling
      if (b.isPeakSanctuary) {
        const isFounded = MAP.isPeakBuildingActive ? MAP.isPeakBuildingActive(this.W, b) : !!b.founded;
        if (!isFounded) {
          this.drawPeakMist(ctx, b, 1.0);
          return;
        }
      }

      const x = b.x * TS, y = b.y * TS, w = b.w * TS, h = b.h * TS;
      const m = buildingMetrics(b), wallTop = y + m.wallTop;
      const level = b.level || 1;

      // Patch v4.1.0 [Pillar 4]: Directional Soft Sun Shadows based on W.t
      const sunSh = this.computeSunShadow(this.W ? this.W.t : hour * 60);
      ctx.save();
      ctx.fillStyle = sunSh.fillStyle;
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w + sunSh.offsetX, y + h + sunSh.offsetY);
      ctx.lineTo(x + sunSh.offsetX, y + h + sunSh.offsetY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      const shell = this.getBuildingSprite(b);
      const isCutaway = (z >= 1.65 && b.inside && b.inside.length > 0) || (this.selected && b.inside && b.inside.includes(this.selected));
      if (isCutaway) {
        ctx.save();
        ctx.globalAlpha = 0.36;
        ctx.drawImage(shell, x - 22, y - 44, w + 48, h + 68);
        ctx.restore();
      } else {
        ctx.drawImage(shell, x - 22, y - 44, w + 48, h + 68);
      }

      // If Peak Sanctuary was recently founded, render dissipating mist fade-out
      if (b.isPeakSanctuary && b.mistFadeStartT != null && this.W && (this.W.t - b.mistFadeStartT) < 60) {
        const fadeAlpha = clamp(1 - (this.W.t - b.mistFadeStartT) / 60, 0, 0.85);
        if (fadeAlpha > 0.02) this.drawPeakMist(ctx, b, fadeAlpha);
      }

      const occupied = b.inside && b.inside.length > 0;
      const lit = night > 0.3 && (occupied || b.type === 'main_hall' || b.isPeakSanctuary);
      if (lit && b.type !== 'gate') {
        ctx.save(); ctx.translate(x, y); buildingWindows(ctx, m, true, b.type); ctx.restore();
      }

      // State-bound ambient facility effects (Alchemy multicolored vapor & Forge glowing sparks)
      if (!b.building && (occupied || b.type === 'alchemy' || b.type === 'forge' || b.type === 'peak_alchemy' || b.type === 'peak_body') && this.effectiveQuality !== 'low') {
        const t = this.t;
        if (b.type === 'alchemy' || b.type === 'peak_alchemy') {
          // Rising multi-colored alchemical vapor from the bronze cupola
          const cx = x + w / 2, topY = y - (level >= 2 ? 28 : 14);
          for (let i = 0; i < 3; i++) {
            const phase = (t * 0.8 + i * 0.33) % 1;
            ctx.fillStyle = i === 0 ? `rgba(130,235,190,${(1 - phase) * 0.45})` : i === 1 ? `rgba(195,160,245,${(1 - phase) * 0.42})` : `rgba(255,215,110,${(1 - phase) * 0.40})`;
            ctx.beginPath();
            ctx.arc(cx + Math.sin(t * 2 + i) * 4, topY - phase * 18, 2.5 + phase * 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (b.type === 'forge' || b.type === 'peak_body') {
          // Rising charcoal smoke & glowing forge sparks from the smelter chimney
          const chX = x + w - 15.5, chY = y - 18;
          for (let i = 0; i < 3; i++) {
            const phase = (t * 0.9 + i * 0.33) % 1;
            ctx.fillStyle = `rgba(90,85,82,${(1 - phase) * 0.42})`;
            ctx.beginPath();
            ctx.arc(chX + Math.sin(t * 1.8 + i) * 3.5, chY - phase * 20, 3 + phase * 4, 0, Math.PI * 2);
            ctx.fill();
            // Forge sparks
            ctx.fillStyle = i % 2 === 0 ? '#ffb703' : '#fb8500';
            ctx.fillRect(chX + Math.cos(t * 5 + i) * 5, chY - phase * 16, 1.8, 1.8);
          }
        } else if (b.type === 'canteen') {
          // Soft white cooking steam
          const sx = x + w * 0.72, sy = y + 4;
          for (let i = 0; i < 2; i++) {
            const phase = (t * 0.7 + i * 0.5) % 1;
            ctx.fillStyle = `rgba(255,255,250,${(1 - phase) * 0.40})`;
            ctx.beginPath();
            ctx.arc(sx + Math.sin(t * 1.5 + i) * 3, sy - phase * 14, 2.5 + phase * 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      const ry = y - 10;
      if (b.building) {
        // Bamboo scaffolding & construction progress bar
        ctx.fillStyle = 'rgba(78,52,26,.48)';
        ctx.fillRect(x - 6, y - 6, w + 12, h + 8);
        ctx.strokeStyle = '#dfc068';
        ctx.lineWidth = 1.6;
        for (let i = 0; i <= w / 12; i++) {
          ctx.beginPath(); ctx.moveTo(x - 6 + i * 12, y + h + 2); ctx.lineTo(x - 6 + i * 12 + 4, y - 6); ctx.stroke();
        }
        for (let j = 0; j < h / 14; j++) {
          ctx.beginPath(); ctx.moveTo(x - 6, y + j * 14); ctx.lineTo(x + w + 6, y + j * 14); ctx.stroke();
        }
        const pr = 1 - (b.building.until - this.W.t) / (8 * 1440);
        ctx.fillStyle = '#1b2622'; ctx.fillRect(x, y + h + 4, w, 4.5);
        ctx.fillStyle = '#6ad87a'; ctx.fillRect(x, y + h + 4, w * clamp(pr, 0, 1), 4.5);
      }
      if (b.hp < 70) {
        ctx.fillStyle = 'rgba(0,0,0,.38)';
        for (let i = 0; i < 4; i++) ctx.fillRect(x + 6 + i * (w / 4), wallTop + 10, 3, 14);
      }

      // Building Plaque Nameplate
      if (z > 0.5) {
        const hasUpper = level >= 2 || b.type === 'main_hall' || b.type === 'scripture' || b.type === 'tower';
        const label = bt.nameTh + (level > 1 ? ' ★' + level : '');
        ctx.font = '600 ' + (b.w > 14 ? 11 : 10) + 'px ' + FONT;
        ctx.textAlign = 'center';
        const tw = measureCached(ctx, ctx.font, label);
        const ly = ry - (hasUpper ? 20 : 7);
        ctx.fillStyle = 'rgba(24,46,40,.90)';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x + w / 2 - tw / 2 - 7, ly - 11.5, tw + 14, 15.5, 4) : ctx.rect(x + w / 2 - tw / 2 - 7, ly - 11.5, tw + 14, 15.5);
        ctx.fill();
        ctx.strokeStyle = 'rgba(233,205,133,.68)';
        ctx.lineWidth = 0.85;
        ctx.stroke();
        ctx.fillStyle = '#fff3d6';
        ctx.fillText(label, x + w / 2, ly);
      }

      // Indoor occupant activity badges
      if (occupied && z > 0.45) {
        const W = this.W, acts = {};
        b.inside.forEach(id => {
          const n = W.byId[id];
          if (n && !n.dead) { const k = n.act.id; acts[k] = (acts[k] || 0) + 1; }
        });
        let i = 0;
        ctx.textAlign = 'left';
        ctx.font = '10px ' + FONT;
        Object.keys(acts).slice(0, 4).forEach(k => {
          const a = AI.ACTS[k];
          if (!a) return;
          const bx = x + 4 + i * 25, by = wallTop - 2;
          ctx.fillStyle = 'rgba(16,28,25,.85)';
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(bx, by, 24, 13.5, 6) : ctx.rect(bx, by, 24, 13.5);
          ctx.fill();
          ctx.strokeStyle = a.color || '#e9cd85';
          ctx.lineWidth = 0.7;
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.fillText(a.icon + (acts[k] > 1 ? acts[k] : ''), bx + 3, by + 10.5);
          i++;
        });
      }
    },

    drawSpot(ctx, b, x, y, w, h) {
      const t = this.t, cx = x + w / 2, cy = y + h / 2, ex = this.W.explore;
      if (b.type === 'cave') {
        ctx.fillStyle = '#5b5560'; ctx.beginPath(); ctx.moveTo(x + 6, y + h - 6); ctx.quadraticCurveTo(x + 10, y + 10, cx, y + 6); ctx.quadraticCurveTo(x + w - 10, y + 10, x + w - 6, y + h - 6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#6e6874'; ctx.beginPath(); ctx.moveTo(x + 14, y + h - 10); ctx.quadraticCurveTo(x + 20, y + 22, cx - 8, y + 18); ctx.lineTo(cx - 4, y + h - 10); ctx.fill();
        ctx.fillStyle = '#0b0b10'; ctx.beginPath(); ctx.moveTo(cx - 20, y + h - 6); ctx.quadraticCurveTo(cx - 20, y + 26, cx, y + 24); ctx.quadraticCurveTo(cx + 20, y + 26, cx + 20, y + h - 6); ctx.closePath(); ctx.fill();
        const gr = ctx.createRadialGradient(cx, y + h - 14, 2, cx, y + h - 14, 26); gr.addColorStop(0, 'rgba(120,200,255,' + (0.25 + 0.1 * Math.sin(t * 2)) + ')'); gr.addColorStop(1, 'rgba(120,200,255,0)'); ctx.fillStyle = gr; ctx.fillRect(cx - 26, y + h - 40, 52, 40);
        ctx.fillStyle = 'rgba(220,235,255,.35)'; for (let i = 0; i < 4; i++) { const px = cx - 14 + ((t * 8 + i * 17) % 28), py = y + h - 10 - ((t * 6 + i * 9) % 22); ctx.beginPath(); ctx.arc(px, py, 3 + i % 2, 0, 7); ctx.fill(); }
        ctx.fillStyle = '#a89c8a'; ctx.fillRect(cx - 26, y + h - 8, 6, 8); ctx.fillRect(cx + 20, y + h - 8, 6, 8); ctx.fillStyle = '#7a1f1f'; ctx.fillRect(cx - 28, y + h - 14, 56, 4);
      } else if (b.type === 'realm_gate') {
        ctx.strokeStyle = 'rgba(160,140,200,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, Math.min(w, h) * 0.42, 0, 7); ctx.stroke();
        for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; ctx.fillStyle = '#6b6580'; ctx.fillRect(cx + Math.cos(a) * w * 0.42 - 3, cy + Math.sin(a) * h * 0.42 - 3, 6, 6); }
        const open = ex && ex.gate.open, R2 = Math.min(w, h) * 0.34;
        if (open) {
          for (let i = 0; i < 5; i++) {
            const gr = ctx.createRadialGradient(cx, cy - 8, 2, cx, cy - 8, R2 * (1 - i * 0.12));
            gr.addColorStop(0, 'rgba(255,255,255,.95)');
            gr.addColorStop(0.4, i % 2 ? 'rgba(140,90,255,.7)' : 'rgba(80,200,255,.7)');
            gr.addColorStop(1, 'rgba(60,20,120,0)');
            ctx.save(); ctx.translate(cx, cy - 8); ctx.rotate(t * (0.8 + i * 0.3) * (i % 2 ? 1 : -1)); ctx.scale(1, 1.35); ctx.translate(-cx, -(cy - 8));
            ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy - 8, R2 * (1 - i * 0.12), 0, 7); ctx.fill();
            ctx.restore();
          }
        } else {
          ctx.fillStyle = 'rgba(90,80,120,.55)'; ctx.beginPath(); ctx.ellipse(cx, cy, R2 * 0.55, R2 * 0.7, 0, 0, 7); ctx.fill();
        }
      } else if (b.type === 'stele') {
        ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(cx + 3, y + h - 8, 16, 5, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#7e7a72'; ctx.fillRect(cx - 12, y + 14, 24, h - 22); ctx.beginPath(); ctx.arc(cx, y + 14, 12, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#5d5a54'; for (let i = 0; i < 5; i++) ctx.fillRect(cx - 7 + (i % 2) * 5, y + 16 + i * 6, 8 - (i % 3) * 2, 2);
        ctx.fillStyle = 'rgba(120,230,200,' + (0.45 + 0.3 * Math.sin(t * 2.4)) + ')'; for (let i = 0; i < 3; i++) ctx.fillRect(cx - 6 + i * 5, y + 22 + i * 7, 3, 2);
      } else if (b.type === 'spring') {
        ctx.fillStyle = '#8a8478'; ctx.beginPath(); ctx.ellipse(cx, cy + 4, w * 0.4, h * 0.3, 0, 0, 7); ctx.fill();
        const sp = ex && ex.spots.spring, f = sp ? sp.charge / sp.max : 1;
        ctx.fillStyle = 'rgba(' + Math.round(60 + 80 * (1 - f)) + ',' + Math.round(150 + 60 * f) + ',230,.95)';
        ctx.beginPath(); ctx.ellipse(cx, cy + 4, w * 0.34, h * 0.23, 0, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(200,255,240,' + (0.3 + 0.4 * f) + ')';
        for (let i = 0; i < 5; i++) { const px = cx - 14 + ((i * 11 + t * 6) % 28), py = cy - ((t * 12 + i * 8) % 26); ctx.beginPath(); ctx.arc(px, py, 2, 0, 7); ctx.fill(); }
      } else if (b.type === 'ruin') {
        ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(cx, y + h - 6, w * 0.42, 6, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#8f8878'; ctx.fillRect(x + 10, y + 22, 12, h - 28); ctx.fillRect(x + w - 24, y + 14, 12, h - 20);
        ctx.fillStyle = '#a39b8a'; ctx.fillRect(x + 8, y + 18, 16, 6); ctx.fillRect(x + w - 26, y + 10, 16, 6);
        ctx.fillStyle = '#6a6458'; ctx.fillRect(cx - 14, y + h - 20, 10, 12); ctx.fillRect(cx + 4, y + h - 16, 14, 8);
      } else if (b.type === 'grove') {
        for (let i = 0; i < 7; i++) {
          const px = x + 12 + (i * 47) % (w - 24), py = y + 18 + ((i * 29) % (h - 30));
          ctx.fillStyle = '#2d6a35'; ctx.beginPath(); ctx.arc(px, py, 9, 0, 7); ctx.fill();
          ctx.fillStyle = '#3f8a46'; ctx.beginPath(); ctx.arc(px - 2, py - 3, 6, 0, 7); ctx.fill();
        }
      }
    },

    drawOpenArea(ctx, b, z) {
      const x = b.x * TS, y = b.y * TS, w = b.w * TS, h = b.h * TS;
      if (b.type === 'training_ground') {
        // Martial arena stone border + inlaid Yin-Yang Taiji ring & weapon racks
        ctx.strokeStyle = 'rgba(110,72,38,.55)';
        ctx.lineWidth = 2.2;
        ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
        const cx = x + w / 2, cy = y + h / 2, rad = Math.min(w, h) * 0.28;
        ctx.beginPath(); c_arc(ctx, cx, cy, rad); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy - rad / 2, rad / 2, -Math.PI / 2, Math.PI / 2); ctx.arc(cx, cy + rad / 2, rad / 2, Math.PI * 1.5, Math.PI / 2, true); ctx.stroke();
        // Weapon rack at top edge of training ground
        ctx.fillStyle = '#6e4726';
        ctx.fillRect(x + 14, y + 8, 26, 4);
        ctx.strokeStyle = '#cfd8dc'; ctx.lineWidth = 1.2;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath(); ctx.moveTo(x + 17 + i * 6, y + 12); ctx.lineTo(x + 17 + i * 6, y + 2); ctx.stroke();
        }
      } else if (b.type === 'herb_garden') {
        ctx.strokeStyle = 'rgba(92,68,42,.55)';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
      } else if (b.type === 'river_dock') {
        // วาดเสาไม้ท่าน้ำข้ามธารน้ำปราณทักษิณโดยไม่มีกรอบเส้นทึบปิดกั้นผืนน้ำ
        const bx0 = 116 * TS, bx1 = 121 * TS, by0 = 165 * TS, by1 = 176 * TS;
        ctx.fillStyle = '#6e4726';
        for (let py = by0; py <= by1; py += 16) {
          ctx.fillRect(bx0 - 2, py - 2, 4, 4);
          ctx.fillRect(bx1 - 2, py - 2, 4, 4);
        }
      }
      this.drawSpot(ctx, b, x, y, w, h);
      if (z > 0.5) {
        const label = MAP.BTYPES[b.type].nameTh + (b.level > 1 ? ' ★' + b.level : '');
        ctx.font = '600 10px ' + FONT;
        ctx.textAlign = 'center';
        const tw = measureCached(ctx, ctx.font, label);
        ctx.fillStyle = 'rgba(20,38,33,.78)';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x + w / 2 - tw / 2 - 6, y + 2, tw + 12, 14, 3) : ctx.rect(x + w / 2 - tw / 2 - 6, y + 2, tw + 12, 14);
        ctx.fill();
        ctx.fillStyle = '#fff2d4';
        ctx.fillText(label, x + w / 2, y + 12);
      }
      if (b.building) {
        ctx.fillStyle = 'rgba(90,60,30,.35)';
        ctx.fillRect(x, y, w, h);
        ctx.font = '12px ' + FONT;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('🚧 กำลังขยาย', x + w / 2, y + h / 2);
      }
    },

    /* ---------- Shared Character Visual Profile (World Sprite + Portrait Agreement) ---------- */
    appearance(n) {
      const b = (n && n.h && n.h.body) || {};
      const hs = b.hairStyle || '';
      const wpnObj = (n && n.equip && n.equip.WEAPON) ? n.equip.WEAPON : null;
      const eqW = wpnObj ? (wpnObj.visualKey || wpnObj.visualSubtype || wpnObj.type || wpnObj.id || '') : '';
      const armObj = (n && n.equip && n.equip.ARMOR) ? n.equip.ARMOR : null;
      const accObj = (n && n.equip && n.equip.ACCESSORY) ? n.equip.ACCESSORY : null;
      const eqA = armObj ? (armObj.visualKey || armObj.id || '') : '';
      const eqAcc = accObj ? (accObj.visualKey || accObj.id || '') : '';
      const cPath = (n && n.cult) ? n.cult.path : 'MORTAL';
      const cStage = (n && n.cult && n.cult.stage) ? n.cult.stage : 0;
      const wUsable = !!(wpnObj && (wpnObj.weaponSoul || !g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(n, wpnObj)));
      const wTier = wpnObj ? (wpnObj.tier || 1) : 0;
      const aTier = armObj ? (armObj.tier || 1) : 0;
      const accTier = accObj ? (accObj.tier || 1) : 0;
      const wStars = wpnObj ? (wpnObj.attunedStars || wpnObj.stars || wpnObj.star || (wpnObj.quality === 'Masterwork' || wpnObj.legendary ? 3 : wpnObj.quality === 'Refined' ? 2 : wTier >= 5 ? 2 : wTier >= 3 ? 1 : 0)) : 0;
      const aStars = armObj ? (armObj.attunedStars || armObj.stars || armObj.star || (armObj.legendary ? 3 : aTier >= 5 ? 2 : aTier >= 3 ? 1 : 0)) : 0;
      const accStars = accObj ? (accObj.attunedStars || accObj.stars || accObj.star || (accObj.legendary ? 3 : accTier >= 5 ? 2 : accTier >= 3 ? 1 : 0)) : 0;
      const petObj = (n && Array.isArray(n.pets) && n.pets[0]) ? n.pets[0] : (n && n.pet ? n.pet : null);
      const petSig = petObj ? `${petObj.speciesId || petObj.id || 'pet'}:${petObj.stage || petObj.tier || 1}:${petObj.awakenedSymbol || ''}` : '';
      const legendaryGear = Object.values((n && n.equip) || {}).filter(it => it && R.resolveLegendaryGearVisual(it) &&
        (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(n,it))).map(it => R.resolveLegendaryGearVisual(it));
      const gearIdentity = Object.entries((n && n.equip) || {}).map(([slot,it]) => slot+':'+(it && it.id)+':'+!!(it && it.legendary)).join('|') + '|' + legendaryGear.map(it=>it.id).join(',');
      const bioAge = (n && g.HC && g.HC.bioAge) ? g.HC.bioAge(n) : ((n && g.HC && g.HC.ageYears) ? g.HC.ageYears(n) : 22);
      const ageY = (n && g.HC && g.HC.ageYears) ? g.HC.ageYears(n) : 22;
      const marksLen = (b.marks && b.marks.length) || 0;
      const sig = `${gearIdentity}|${b.skinHex}|${b.hairHex}|${b.eyeHex}|${hs}|${b.heightCm}|${n?.h?.sex}|${n?.rank}|${cPath}|${cStage}|${eqW}|${wUsable ? 1 : 0}|${wTier}:${wStars}|${eqA}:${aTier}:${aStars}|${eqAcc}:${accTier}:${accStars}|${petSig}|${bioAge >= 62 ? 1 : 0}|${marksLen}`;

      if (this.apCache && n && n.id) {
        const cached = this.apCache.get(n.id);
        if (cached && cached.sig === sig) return cached;
      }

      const isF = n?.h?.sex === 'F';
      const wTypeResolved = (wpnObj && g.MARTIAL && g.MARTIAL.gearType) ? g.MARTIAL.gearType(wpnObj) : (eqW || null);
      const resEval = (n && !n.foe && g.MARTIAL && g.MARTIAL.evaluateResonanceSet) ? g.MARTIAL.evaluateResonanceSet(n) : null;
      const ap = {
        sig,
        skin: b.skinHex || '#e8c49c',
        hair: (b.hairHex === '#e9edf5') ? '#e9edf5' : (bioAge >= 62 ? '#b8bec4' : (b.hairHex || '#222024')),
        eye: b.eyeHex || '#222024',
        long: /ยาว|ปล่อย|ถัก/.test(hs) || (isF && !/สั้น|โกน/.test(hs)),
        bun: /มวย|รวบ|ปิ่น/.test(hs) || (!/โกน/.test(hs) && (n?.rank >= 2 || !isF)),
        bald: /โกน|หัวล้าน/.test(hs),
        hasBeard: !isF && ageY >= 38 && !/เกลี้ยง/.test(b.facialHair || ''),
        scale: clamp(0.9 + ((b.heightCm || 168) - 165) / 160, 0.82, 1.12),
        slim: isF ? 0.90 : 1,
        robe: n && n.cult ? (PATH_COL[n.cult.path] || ROBE_MORTAL) : ROBE_MORTAL,
        sash: (SECT.RANKS[n?.rank || 0] || { color: '#9aa' }).color,
        weaponType: (wpnObj && g.MARTIAL && g.MARTIAL.gearType)
          ? g.MARTIAL.gearType(wpnObj)
          : (eqW || null),
        weaponVisualKey: wpnObj && wpnObj.visualKey ? wpnObj.visualKey : null,
        weaponSubtype: wpnObj && wpnObj.visualSubtype ? wpnObj.visualSubtype : null,
        weaponPresentation: wpnObj && wpnObj.presentationMode ? wpnObj.presentationMode : 'held',
        weaponUsable: wUsable,
        hasArmor: !!armObj,
        armorVisualKey: armObj && armObj.visualKey ? armObj.visualKey : null,
        accessoryVisualKey: accObj && accObj.visualKey ? accObj.visualKey : null,
        cultStage: cStage,
        cultPath: cPath,
        visualRealmStage: n && n.cult ? R.resolveCultivationVisualState(n).normStage : 0,
        isPathApex: n && n.cult ? R.resolveCultivationVisualState(n).isApex : false,
        tierBand: n && n.cult ? R.resolveCultivationVisualState(n).tierBand : 'MORTAL',
        weaponTier: wTier,
        armorTier: aTier,
        accessoryTier: accTier,
        highestGearTier: Math.max(wTier, aTier, accTier),
        legendaryGear,
        totalGearStars: Math.min(9, wStars + aStars + accStars),
        weaponStars: wStars,
        weaponElement: (wpnObj && (wpnObj.element || (Array.isArray(wpnObj.runes) && wpnObj.runes[0]))) || (n && n.cult && n.cult.element) || null,
        activeSetCount: (resEval && resEval.active) ? (resEval.pieces || 3) : 0,
        hasFlyingSword: !!(wUsable && (wTypeResolved === 'SWORD' || (wpnObj && wpnObj.type === 'SWORD') || cPath === 'SWORD_DOMAIN' || (cPath === 'XIAN' && (!wpnObj || wTypeResolved === 'SWORD'))) && (wTier >= 4 || (wpnObj && wpnObj.legendary) || cStage >= 3)),
        hasWeaponSoul: !!(wUsable && (wTier >= 6 || (wpnObj && (wpnObj.legendary || wpnObj.weaponSpirit || wpnObj.imbuedElderSoul || wpnObj.weaponSoul || wpnObj.spiritNameTh)))),
        hasSilkRibbon: (n && n.cult ? R.resolveCultivationVisualState(n).normStage >= 7 : cStage >= 7) || (armObj && armObj.visualKey === 'vis_celestial_crane_robe'),
        hasPet: !!petObj,
        petSpeciesId: petObj ? (petObj.speciesId || petObj.id || 'SPIRIT_BEAST') : null,
        petTier: petObj ? (petObj.tier || petObj.stage || 2) : 0,
        petSymbol: petObj ? (petObj.awakenedSymbol || petObj.fourSymbol || null) : null
      };

      if (this.apCache && n && n.id) {
        if (this.apCache.size > 250) this.apCache.clear();
        this.apCache.set(n.id, ap);
      }
      return ap;
    },

    drawNpc(ctx, n, p, hour) {
      const c = this.cam, z = c.z, W = this.W;
      const x = p.x * TS, y = p.y * TS;
      const act = n.act ? n.act.id : 'idle';
      const A = AI.ACTS[act];
      const moving = !!n.path || !!n.travel;
      const sel = this.selected === n.id;

      // Far overview zoom (< 0.42): crisp emblem marker
      if (z < 0.42) {
        const col = n.cult ? PATH_COL[n.cult.path] : '#bbb';
        ctx.fillStyle = col;
        const r = Math.max(2.2 / z, 5);
        ctx.beginPath(); ctx.arc(x, y - 4, r, 0, 7); ctx.fill();
        if (n.rank >= 4) { ctx.strokeStyle = '#f0cf4a'; ctx.lineWidth = 1.4 / z; ctx.stroke(); }
        if (sel) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2 / z; ctx.beginPath(); ctx.arc(x, y - 4, r + 4 / z, 0, 7); ctx.stroke(); }
        return;
      }

      const ap = this.appearance(n);
      const sc = ap.scale * 1.15 * (n.rank === 6 ? 1.08 : 1);
      const mount = moving && n.path && act !== 'fight' ? g.EXPED?.travelMount(n) : null;
      const ridingAirborne = !!mount && R.isAirborneMount(mount);
      const qgInfo = !mount && act !== 'fight' && (moving || act === 'qinggong') && n.cult ? CULT.QINGGONG?.resolveNpcMode(W, n) : null;
      const qgMode = qgInfo && (!qgInfo.airborne || n.aerialFlightActive || act === 'qinggong')
        ? qgInfo.modeId : 'MORTAL_WALK';
      const ridingSword = qgMode === 'SWORD_FLIGHT';
      const isAerialFlight = ridingAirborne || ridingSword || qgMode === 'CELESTIAL_LEVITATION';
      const isLeapBound = (moving || act === 'qinggong') && qgMode === 'LEAP_BOUND';
      const isWaterDrift = (moving || act === 'qinggong') && qgMode === 'WATER_LOTUS_DRIFT';
      const ph = this.t * (act === 'fight' || n.run ? 14 : (qgMode !== 'MORTAL_WALK' ? 13 : 9)) + (n.n || 0) * 1.7;
      const step = mount || isAerialFlight ? 0 : (moving ? Math.sin(ph) : 0);
      const motionTime = (mount || ridingSword) && this.isReducedMotion() ? 0 : this.t;
      const aerialLift = mount
        ? (ridingAirborne ? 24 + Math.sin(motionTime * 5) * 1.9 : 12 + Math.sin(motionTime * 8) * .9)
        : qgMode === 'CELESTIAL_LEVITATION'
        ? (14.5 + Math.sin(this.t * 3.8 + (n.n || 0)) * 2.4)
        : qgMode === 'SWORD_FLIGHT'
        ? (11.5 + Math.sin(motionTime * 5.0 + (n.n || 0)) * 1.8)
        : isLeapBound
        ? (Math.abs(Math.sin(this.t * 7.2 + (n.n || 0))) * 13.5)
        : isWaterDrift
        ? (2.2 + Math.sin(this.t * 4.5 + (n.n || 0)) * 0.8)
        : 0;
      const bob = moving
        ? (isAerialFlight || mount ? aerialLift : (Math.abs(Math.sin(ph)) * 1.35 + aerialLift))
        : (act === 'qinggong' ? aerialLift : (act === 'cultivate' || act === 'sleep' ? 0 : Math.sin(this.t * 2 + (n.n || 0)) * 0.25));
      const face = n.face >= 0 ? 1 : -1;
      const inDoStage = !moving && (!n.act || n.act.stage !== 'move');
      const pose = (inDoStage && (act === 'cultivate' || act === 'breakthrough' || act === 'paidTraining' || act === 'mantra')) ? 'sit'
        : (inDoStage && act === 'sleep' && !n.hidden) ? 'lie'
        : (inDoStage && (act === 'pray' || act === 'flatter')) ? 'bow'
        : 'stand';

      ctx.save();
      ctx.translate(x, y);

      // Selected ground ring & visibility halo
      if (sel) {
        const pulse = 0.5 + 0.5 * Math.sin(this.uiT * 4);
        ctx.strokeStyle = '#f5d77f';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 2]);
        ctx.beginPath(); ctx.ellipse(0, 1, 10.5 + pulse, 5.2 + pulse * 0.5, 0, 0, 7); ctx.stroke();
        ctx.setLineDash([]);
      }

      // Ground contact shadow (shrinks slightly when airborne to show true height separation)
      const shadowScale = isAerialFlight ? 0.68 : (isLeapBound ? Math.max(0.65, 1 - aerialLift * 0.025) : 1.0);
      ctx.fillStyle = isAerialFlight ? 'rgba(0,0,0,.18)' : 'rgba(0,0,0,.26)';
      ctx.beginPath(); ctx.ellipse(0, 1, 5.6 * sc * shadowScale, 2.5 * shadowScale, 0, 0, 7); ctx.fill();

      // Patch v5.4.0: Ground/Underfoot Qinggong & Flight VFX (Water Lotus Ripples, Leap Wind Rings)
      if (qgMode !== 'MORTAL_WALK' && (moving || act === 'qinggong')) {
        this.drawQinggongGroundEffects(ctx, n, qgMode, qgInfo, sc, face, -bob);
      }

      // Companion Spirit Beast beside disciple on map (Pillar 1D)
      if (ap.hasPet) {
        this.drawCompanionPets(ctx, n, p, sc, mount);
      }

      // Legendary passive/mantra aura (pure read-only)
      this.drawLegendaryAura(ctx, n, act);
      this.drawTranscendentAura(ctx, n, -bob);

      // Era 5 Pillar 1 & 3: Realm Halo, Path Signature Motes, Equipment Tier Glow & Set Resonance
      if (this.opts.realmHalos !== false) {
        this.drawCultivatorRealmHalo(ctx, n, ap, act, -bob);
        this.drawPathSignatureMotes(ctx, n, ap, act, -bob);
      }
      this.drawEquipmentTierAura(ctx, n, ap, -bob);
      this.drawAppliedBuffAura(ctx, n, -bob);
      this.drawCommonPassiveAura(ctx, n, act, -bob);
      this.drawLegendaryEquipmentAura(ctx, n, ap, -bob);
      this.drawWeaponSoulAndSetResonance(ctx, n, ap, -bob);

      // Patch v5.5.0: Mantra Dharma Circle & Archetype Resonance Visuals
      if (n.cult && (act === 'cultivate' || act === 'breakthrough' || act === 'paidTraining' || act === 'mantra' || (n.mantraState && (n.mantraState.stance === 'OVERDRIVE_COMBUSTION' || (g.CULT && g.CULT.MANTRA_SYSTEM && g.CULT.MANTRA_SYSTEM.resolveNpcMantra(W, n)?.archetypeId === 'ASTRAL_VOID_BREATHING'))))) {
        this.drawNpcMantraDharmaAura(ctx, n, ap, act, -bob, moving);
      }
      // Patch v5.6.0: Defensive Kungfu & Protective Aegis Barrier Visuals
      if (n.cult && (act === 'defensive' || (act === 'fight' && n.defensiveArtState) || (n.defensiveArtState && n.defensiveArtState.posture === 'FORTRESS_BASTION_LOCK'))) {
        this.drawNpcDefensiveAegisVisual(ctx, n, ap, act, -bob, moving);
      }
      // Patch v5.7.0: Support & Auxiliary Arts Visuals (Zither Sound-Waves, Qimen Banner, Golden Needles, Alchemical Mist)
      if (n.cult && (act === 'support' || (n.supportState && (act === 'cultivate' || act === 'tea' || act === 'treatPatients' || act === 'brew' || act === 'fight')))) {
        this.drawNpcSupportArtVisual(ctx, n, ap, act, -bob, moving);
      }
      // Patch v5.8.0: Forbidden Arts Taboo Seal Chains, Blood-Flame Pillars & Passive Constellation Star-Nodes
      if (n.cult && (act === 'forbidden' || (n.forbiddenArtState && n.forbiddenArtState.sealMode !== 'SEALED_RESTRAINT') || n.passiveResonanceState)) {
        this.drawNpcForbiddenTabooVisual(ctx, n, ap, act, -bob, moving);
      }

      // Cultivation / Breakthrough / Intensive Paid Training Qi Resonance
      if (n.cult && (act === 'cultivate' || act === 'breakthrough' || act === 'paidTraining' || act === 'mantra')) {
        const pc = PATH_COL[n.cult.path];
        const pr = 0.5 + 0.5 * Math.sin(this.t * 3 + (n.n || 0));
        ctx.fillStyle = pc + '33';
        ctx.beginPath(); ctx.ellipse(0, -6, 13 + pr * 3, 6 + pr * 1.5, 0, 0, 7); ctx.fill();
        if (act === 'breakthrough' || act === 'paidTraining') {
          ctx.strokeStyle = act === 'breakthrough' ? '#fff8c0' : pc;
          ctx.lineWidth = 1.3;
          for (let i = 0; i < 6; i++) {
            const a = this.t * 2 + i;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 7, -8 + Math.sin(a) * 6);
            ctx.lineTo(Math.cos(a) * 16, -8 + Math.sin(a) * 14);
            ctx.stroke();
          }
        }
      }

      ctx.scale(face * sc, sc);
      const robe = ap.robe, sash = ap.sash;
      const lunge = act === 'fight' && n.act.ctx && n.fx && this.W.t - n.fx.t < 3 ? 3 : 0;
      if (pose === 'lie') { ctx.rotate(-1.5); ctx.translate(0, -4); }
      const legL = pose === 'sit' ? 0 : step * 2.5, legR = pose === 'sit' ? 0 : -step * 2.5;

      const by = -bob;
      if (mount) R.drawTravelMount(ctx, mount, by, motionTime, this.isReducedMotion());
      // Patch v5.4.0: Underfoot Sword Flight / Celestial Cloud / Phantom Blink Clones
      if (qgMode !== 'MORTAL_WALK' && (moving || act === 'qinggong')) {
        this.drawQinggongBodyEffects(ctx, n, ap, qgMode, qgInfo, by, step);
      }

      // Boots / Crossed legs (elevated by `by` when airborne or leaping!)
      ctx.fillStyle = '#2d313b';
      if (mount) {
        // Torso sits on the saddle. The near knee and boot overlap the flank.
        ctx.fillStyle = '#293435';
        ctx.beginPath(); ctx.ellipse(0, by - 3, 5.4, 1.9, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = shade(robe, -.27);
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(-2, by - 5); ctx.lineTo(2.6, by - 1); ctx.lineTo(1.5, by + 3.3); ctx.stroke();
        ctx.fillStyle = '#202a2e'; ctx.fillRect(.6, by + 2.2, 3.5, 2.1);
      } else if (pose === 'sit') {
        ctx.beginPath(); ctx.ellipse(0, -2 + by, 5.8, 2.2, 0, 0, 7); ctx.fill();
      } else if (ridingSword) {
        ctx.fillRect(-4.9, by - 4.5, 3, 4.5);
        ctx.fillRect(2.8, by - 5.3, 3.4, 5.3);
      } else if (isAerialFlight) {
        // Poised immortal / sword-rider stance with boots resting atop the flying sword or cloud
        ctx.fillRect(-3.0, -5.5 + by, 2.4, 5.5);
        ctx.fillRect(0.8, -5.5 + by, 2.4, 5.5);
      } else {
        const bootLift = aerialLift > 0.5 ? by : 0;
        ctx.fillRect(-3.2 + legL * 0.3, -6 + Math.abs(legL) * 0.1 + bootLift, 2.5, 6 - Math.max(0, -legL) * 0.3);
        ctx.fillRect(0.7 + legR * 0.3, -6 + bootLift, 2.5, 6 - Math.max(0, -legR) * 0.3);
      }

      // Layered Wuxia Robe (Outer Robe + Inner Skirt Hem + Crossed Lapel Collar + Waist Sash & Jade Token)
      ctx.fillStyle = robe;
      ctx.beginPath();
      ctx.moveTo(-5.0 * ap.slim, -4.5 + by);
      ctx.lineTo(5.0 * ap.slim, -4.5 + by);
      ctx.lineTo(3.8, -13.2 + by);
      ctx.lineTo(-3.8, -13.2 + by);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(30,42,38,0.65)';
      ctx.lineWidth = 0.65;
      ctx.stroke();

      // Robe lapel fold & inner hem
      ctx.fillStyle = shade(robe, -0.22);
      ctx.fillRect(1.1, -13 + by, 2.5, 8.2);
      ctx.strokeStyle = '#f7ebd2';
      ctx.lineWidth = 1.05;
      ctx.beginPath();
      ctx.moveTo(-2.5, -13.1 + by);
      ctx.lineTo(0.3, -9.8 + by);
      ctx.lineTo(2.5, -13.1 + by);
      ctx.stroke();

      // Armor shoulder/chest trim & Legendary Armor/Accessory Visual Overlays
      if (ap.hasArmor) {
        ctx.fillStyle = ap.armorVisualKey === 'vis_immortal_tortoise_plate' ? 'rgba(73,80,87,0.82)'
          : ap.armorVisualKey === 'vis_shadow_kirin_cuirass' ? 'rgba(123,44,191,0.72)'
          : ap.armorVisualKey === 'vis_celestial_crane_robe' ? 'rgba(144,224,239,0.75)'
          : 'rgba(210,218,226,0.55)';
        ctx.fillRect(-4.1 * ap.slim, -13.0 + by, 8.2 * ap.slim, 3.0);
        if (ap.armorVisualKey === 'vis_celestial_crane_robe') {
          ctx.strokeStyle = '#90e0ef'; ctx.lineWidth = 0.9;
          ctx.beginPath(); ctx.arc(0, -10.5 + by, 6.2, Math.PI * 0.85, Math.PI * 2.15); ctx.stroke();
        } else if (ap.armorVisualKey === 'vis_shadow_kirin_cuirass') {
          ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 0.85;
          ctx.beginPath(); ctx.moveTo(-4.4, -12.8 + by); ctx.lineTo(0, -10.2 + by); ctx.lineTo(4.4, -12.8 + by); ctx.stroke();
        } else if (ap.armorVisualKey === 'vis_immortal_tortoise_plate') {
          ctx.strokeStyle = '#00f5d4'; ctx.lineWidth = 0.95;
          ctx.strokeRect(-3.6 * ap.slim, -12.6 + by, 7.2 * ap.slim, 4.2);
        }
      }
      if (ap.accessoryVisualKey) {
        ctx.save();
        if (ap.accessoryVisualKey === 'vis_bodhi_starlight_beads') {
          ctx.fillStyle = '#ffd166';
          for (let bi = -2; bi <= 2; bi++) {
            ctx.beginPath(); ctx.arc(bi * 1.3, -11.6 + Math.abs(bi) * 0.4 + by, 0.75, 0, 7); ctx.fill();
          }
        } else if (ap.accessoryVisualKey === 'vis_samsara_karma_ring') {
          ctx.strokeStyle = '#e0aaff'; ctx.lineWidth = 0.9;
          ctx.beginPath(); ctx.arc(4.8, -8.5 + by, 2.1, 0, 7); ctx.stroke();
        } else if (ap.accessoryVisualKey === 'vis_taichi_heaven_seal') {
          ctx.fillStyle = '#f4a261';
          ctx.fillRect(-3.2, -8.2 + by, 2.2, 2.8);
        } else if (ap.accessoryVisualKey === 'vis_dragon_phoenix_bangle') {
          ctx.strokeStyle = '#2ec4b6'; ctx.lineWidth = 1.0;
          ctx.beginPath(); ctx.arc(-4.5, -8.8 + by, 1.9, 0, 7); ctx.stroke();
        }
        ctx.restore();
      }

      const transcendentArmor = n.equip && n.equip.ARMOR;
      const transcendentAccessory = n.equip && n.equip.ACCESSORY;
      if (R.isTranscendent(transcendentArmor)) R.drawWornTranscendent(ctx, n, transcendentArmor, 0, -10 + by, 14);
      if (R.isTranscendent(transcendentAccessory)) R.drawWornTranscendent(ctx, n, transcendentAccessory, 4.6, -7 + by, 6.5);

      // Rank Sash & Hanging Jade Pendant (玉佩)
      ctx.fillStyle = sash;
      ctx.fillRect(-4.1 * ap.slim, -9.3 + by, 8.2 * ap.slim, 1.9);
      if (n.rank >= 2) {
        ctx.fillStyle = '#7ce6c4';
        ctx.fillRect(1.6, -7.4 + by, 1.3, 2.2);
      }

      // Context-Sensitive Arms & Sleeves
      let armA = -0.2 + (moving ? -step * 0.55 : 0), armB = 0.2 + (moving ? step * 0.55 : 0);
      if (mount) {
        armA = .95; armB = 1.2;
      } else if (ridingSword) {
        armA = .75; armB = -.84;
      } else if (act === 'practice' || act === 'skillDrill' || (act === 'fight' && lunge)) {
        armA = -1.35 + Math.sin(this.t * 9 + (n.n || 0)) * 0.85;
      } else if (pose === 'sit') {
        armA = 0.85; armB = 0.85;
      } else if (pose === 'bow') {
        // Cupped-hands salute (拱手) for pray / flatter
        armA = -0.65; armB = -0.55;
      } else if (act === 'giftItem' || act === 'shareMedicine' || act === 'donate') {
        armA = -0.9;
      }

      ctx.strokeStyle = shade(robe, -0.10);
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(3, -12 + by); ctx.lineTo(3 + Math.sin(armA) * 6 + lunge, -12 + by + Math.cos(armA) * 5.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-3, -12 + by); ctx.lineTo(-3 + Math.sin(armB) * 5, -12 + by + Math.cos(armB) * 5.5); ctx.stroke();
      ctx.fillStyle = ap.skin;
      ctx.beginPath(); ctx.arc(3 + Math.sin(armA) * 6 + lunge, -12 + by + Math.cos(armA) * 5.5, 1.45, 0, 7); ctx.fill();

      // Weapon / Activity Prop + Legendary Weapon Visual Silhouette
      if (!ridingSword && ap.weaponVisualKey && ap.weaponUsable) {
        this.drawLegendaryWeaponVisual(ctx, n, ap, armA, by, lunge, act);
      } else if (!ridingSword && ap.weaponVisualKey && !ap.weaponUsable) {
        // Sealed / dormant scabbard on back when weapon requirements are not met
        ctx.save();
        ctx.strokeStyle = "#5c6470";
        ctx.lineWidth = 2.0;
        ctx.beginPath(); ctx.moveTo(-3.2, -13 + by); ctx.lineTo(2.4, -5 + by); ctx.stroke();
        ctx.restore();
      }
      if (!ridingSword) this.drawProp(ctx, n, act, armA, by, lunge, ap);
      if (!ridingSword && this.opts.flyingSwords !== false) {
        this.drawOrbitingFlyingWeapon(ctx, n, ap, by, act);
      }
      if (this.opts.combatSlashes !== false) {
        this.drawCombatSlashAndAfterimages(ctx, n, ap, act, armA, by, lunge);
      }

      // Head, Hair, Topknot & Rank Crown
      const hy = -17.5 + by + (pose === 'bow' ? 2.2 : 0);
      if (ap.long) {
        ctx.fillStyle = ap.hair;
        ctx.beginPath(); ctx.ellipse(-1.4, hy + 4.2, 5.2, 7.2, 0, 0, 7); ctx.fill();
      }
      ctx.fillStyle = ap.skin;
      ctx.beginPath(); ctx.arc(0, hy, 4.8, 0, 7); ctx.fill();
      ctx.strokeStyle = '#705842';
      ctx.lineWidth = 0.55;
      ctx.stroke();

      if (!ap.bald) {
        ctx.fillStyle = ap.hair;
        ctx.beginPath();
        ctx.arc(0, hy - 0.7, 5.0, Math.PI * 1.02, Math.PI * 2.0);
        ctx.lineTo(4, hy - 0.8);
        ctx.quadraticCurveTo(1, hy - 2.8, -4.4, hy - 0.2);
        ctx.fill();
        if (ap.bun) {
          ctx.beginPath(); ctx.arc(-0.8, hy - 6.3, 2.3, 0, 7); ctx.fill();
          // Hairpin (簪)
          ctx.strokeStyle = n.rank >= 3 ? '#f0cf4a' : '#80cbc4';
          ctx.lineWidth = 0.9;
          ctx.beginPath(); ctx.moveTo(-3.2, hy - 6.3); ctx.lineTo(1.8, hy - 6.3); ctx.stroke();
        }
      }

      // Eyes & Beard
      const sleepy = act === 'sleep';
      ctx.fillStyle = '#1a1a22';
      if (sleepy) {
        ctx.fillRect(0.6, hy + 0.3, 2.5, 0.7);
      } else {
        ctx.fillRect(1.4, hy - 0.4, 1.3, 1.8);
      }
      if (ap.hasBeard) {
        ctx.fillStyle = ap.hair;
        ctx.beginPath(); ctx.moveTo(0.5, hy + 2.8); ctx.lineTo(2.8, hy + 2.8); ctx.lineTo(1.8, hy + 5.6); ctx.closePath(); ctx.fill();
      }

      // Rank Headwear / Coronet (suppress upright coronet when lying flat)
      if (pose !== 'lie' && n.rank === 6) {
        ctx.fillStyle = '#f2cf52';
        ctx.fillRect(-3.6, hy - 6.4, 7.2, 2.1);
        ctx.fillRect(-1.1, hy - 8.8, 2.2, 2.6);
        ctx.fillStyle = '#5ce6c4';
        ctx.fillRect(-0.5, hy - 7.8, 1.0, 1.2);
      } else if (n.rank === 5) {
        ctx.fillStyle = '#e8a43a';
        ctx.fillRect(-3.4, hy - 5.9, 6.8, 1.7);
      } else if (n.rank === 4) {
        ctx.fillStyle = '#b83c2c';
        ctx.fillRect(-3.2, hy - 5.5, 6.4, 1.5);
      }

      // Injury Bandage
      if (n.inj && n.inj.length) {
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(-4, hy - 2.4, 8, 1.7);
        ctx.fillStyle = '#d32f2f';
        ctx.fillRect(1, hy - 2.4, 1.3, 1.7);
      }
      ctx.restore();

      // Era 5 Pillar 2D: Breakthrough Heavenly Tribulation Clouds & Lightning Pillars
      if (act === 'breakthrough' || (n.tribulationState && n.tribulationState.active) || (n.fx && /ทะลวง|ทัณฑ์สวรรค์|เสาแสง|สำเร็จขั้น/.test(n.fx.text || '') && this.W.t - n.fx.t < 6)) {
        this.drawBreakthroughTribulationVfx(ctx, n, p, sc);
      }

      // Unflipped HUD overlays: HP bar, Nameplate, Acting Office Seal, Action Bubble
      const showName = this.opts.names && (z >= 1.05 || sel);
      ctx.textAlign = 'center';
      if (act === 'fight') {
        const effHm = (g.COMBAT && g.COMBAT.hpMax) ? g.COMBAT.hpMax(n) : ((g.STATS && g.STATS.hpMax) ? g.STATS.hpMax(n) : CULT.hpMax(n));
        this.hpBar(ctx, x, y - 30 * sc, n.h.state.hp / Math.max(1, effHm), 15);
      }
      if (showName) {
        ctx.font = (sel ? '600 ' : '') + '9px ' + FONT;
        const isDelegated = W.sect && W.sect.delegations && Object.values(W.sect.delegations).some(d => d && d.delegateId === n.id && d.until > W.t);
        const nm = n.h.name.given + (isDelegated ? ' · รักษาการ' : '');
        const tw = measureCached(ctx, ctx.font, nm);
        ctx.fillStyle = sel ? 'rgba(22,44,38,.92)' : 'rgba(15,22,26,.72)';
        ctx.fillRect(x - tw / 2 - 3.5, y + 2, tw + 7, 11.5);
        ctx.fillStyle = sash;
        ctx.fillRect(x - tw / 2 - 3.5, y + 2, 2.2, 11.5);
        if (sel) {
          ctx.strokeStyle = '#e9cd85';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(x - tw / 2 - 3.5, y + 2, tw + 7, 11.5);
        }
        ctx.fillStyle = sel ? '#fff6d6' : '#ffffff';
        ctx.fillText(nm, x + 0.5, y + 10.6);
      }
      if (this.opts.bubbles && z >= 0.78 && A && act !== 'idle') {
        const by2 = y - 31 * sc - (act === 'fight' ? 6 : 0);
        ctx.fillStyle = 'rgba(252,248,236,.94)';
        ctx.beginPath(); ctx.arc(x, by2, 6.4, 0, 7); ctx.fill();
        ctx.strokeStyle = A.color || '#e9cd85';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.font = '8.5px ' + FONT;
        ctx.fillStyle = '#111';
        ctx.fillText(A.icon, x, by2 + 3);
      }
      if (n.act && n.act.id === 'pair' && n.act.stage === 'do' && n.act.ctx.pair) {
        const tp = n.act.ctx.pair.type;
        ctx.font = '9px ' + FONT;
        ctx.fillText(tp === 'date' ? '♥' : tp === 'spar' ? '⚔' : tp === 'argue' ? '💢' : tp === 'teach' ? '📖' : '💬', x + 7.5, y - 34 * sc);
      }
      if (n.fx && this.W.t - n.fx.t < 4) {
        const age = (this.W.t - n.fx.t);
        ctx.font = 'bold 10px ' + FONT;
        ctx.fillStyle = /^-/.test(n.fx.text) ? '#ff6b5e' : '#ffe27a';
        ctx.strokeStyle = 'rgba(0,0,0,.7)';
        ctx.lineWidth = 2.4;
        const fy = y - 38 * sc - age * 3;
        ctx.strokeText(n.fx.text, x, fy);
        ctx.fillText(n.fx.text, x, fy);
      }
      if (sel) {
        ctx.fillStyle = '#f5d77f';
        ctx.beginPath();
        ctx.moveTo(x - 4.5, y - 48 * sc);
        ctx.lineTo(x + 4.5, y - 48 * sc);
        ctx.lineTo(x, y - 42 * sc);
        ctx.closePath();
        ctx.fill();
      }
    },

    /* ---------- True Weapon Category & NPC Overhaul Activity Props ---------- */
    /* ---------- Legendary Weapon Silhouette & Orbit Renderer (11 Weapons across 7 Families, Pure Read-Only) ---------- */
    drawLegendaryWeaponVisual(ctx, n, ap, armA, by, lunge, act) {
      const vk = ap && ap.weaponVisualKey;
      if (!vk || !ap.weaponUsable) return;
      const t = this.t;
      const activeCombat = act === 'practice' || act === 'skillDrill' || act === 'fight' || act === 'guard' || (act === 'pair' && n.act?.ctx?.pair?.type === 'spar');
      const hx = activeCombat ? (3 + Math.sin(armA) * 6 + lunge) : -3.5;
      const hy = activeCombat ? (-12 + by + Math.cos(armA) * 5.5) : (-10.5 + by);

      ctx.save();
      if (ap.weaponPresentation === 'held_and_orbit') {
        const ang = t * 1.9 + (n.n || 0);
        const ox = Math.cos(ang) * 9.5, oy = -10 + by + Math.sin(ang * 1.5) * 3.5;
        ctx.strokeStyle = vk === 'vis_yitian_sword' ? 'rgba(114,239,221,0.75)' : vk === 'vis_xiaoli_dagger' ? 'rgba(255,214,112,0.8)' : 'rgba(46,196,182,0.75)';
        ctx.lineWidth = 1.25;
        ctx.save();ctx.translate(ox,oy);
        this.drawLegendaryRelicGlyph(ctx,relicByVisual[vk],3.6,t,this.isReducedMotion());
        ctx.restore();
      }

      if (['vis_bodhi_nirvana_rosary','vis_taotie_devouring_claw','vis_baihua_soul_needle','vis_bajiao_tempest_fan','vis_hetu_luoshu_astrolabe','vis_caishen_golden_abacus'].includes(vk)) {
        ctx.save();ctx.translate(hx+2,hy-3);
        this.drawLegendaryRelicGlyph(ctx,relicByVisual[vk],5.5,t,this.isReducedMotion());
        ctx.restore();
      } else if (vk === 'vis_yitian_sword') {
        ctx.strokeStyle = '#72efdd'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + (activeCombat ? 11 : -5), hy - 10.5); ctx.stroke();
        ctx.strokeStyle = '#f4d35e'; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(hx - 1.4, hy + 1.2); ctx.lineTo(hx + 1.4, hy - 1.2); ctx.stroke();
      } else if (vk === 'vis_xuantie_heavy_sword') {
        ctx.strokeStyle = '#2b2d42'; ctx.lineWidth = 3.4;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + (activeCombat ? 10.5 : -5), hy - 10); ctx.stroke();
        ctx.strokeStyle = '#8d99ae'; ctx.lineWidth = 1.0;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + (activeCombat ? 10.5 : -5), hy - 10); ctx.stroke();
      } else if (vk === 'vis_tulong_saber') {
        ctx.strokeStyle = '#3d405b'; ctx.lineWidth = 2.9;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + 6, hy - 3, hx + (activeCombat ? 10.5 : -5), hy - 9.5); ctx.stroke();
        ctx.strokeStyle = '#f4a261'; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + (activeCombat ? 7 : -3), hy - 6); ctx.stroke();
      } else if (vk === 'vis_full_moon_scimitar') {
        ctx.strokeStyle = '#e0fbfc'; ctx.lineWidth = 2.0;
        ctx.beginPath(); ctx.arc(hx + (activeCombat ? 5 : -2), hy - 4.5, 5.5, -0.8, 1.4); ctx.stroke();
      } else if (vk === 'vis_xiaoli_dagger') {
        ctx.strokeStyle = '#f8f9fa'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + (activeCombat ? 6.5 : 3.5), hy - 4.5); ctx.stroke();
        ctx.fillStyle = '#e63946';
        ctx.beginPath(); ctx.arc(hx - 0.8, hy + 0.8, 1.3, 0, 7); ctx.fill();
      } else if (vk === 'vis_dagou_jade_staff') {
        ctx.strokeStyle = '#2a9d8f'; ctx.lineWidth = 2.1;
        ctx.beginPath(); ctx.moveTo(hx - 2.5, hy + 4); ctx.lineTo(hx + (activeCombat ? 9.5 : -4), hy - 11.5); ctx.stroke();
        ctx.fillStyle = '#80ed99';
        ctx.beginPath(); ctx.arc(hx + (activeCombat ? 9.5 : -4), hy - 11.5, 1.5, 0, 7); ctx.fill();
      } else if (vk === 'vis_overlord_spear') {
        ctx.strokeStyle = '#5c4033'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(hx - 3, hy + 4.5); ctx.lineTo(hx + (activeCombat ? 11 : -4.5), hy - 12); ctx.stroke();
        ctx.fillStyle = '#e63946';
        ctx.beginPath(); ctx.arc(hx + (activeCombat ? 8.8 : -3.5), hy - 9.5, 1.8, 0, 7); ctx.fill();
        ctx.strokeStyle = '#f1faee'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(hx + (activeCombat ? 9.2 : -3.8), hy - 10); ctx.lineTo(hx + (activeCombat ? 13 : -5.5), hy - 14); ctx.stroke();
      } else if (vk === 'vis_azure_dragon_lance') {
        ctx.strokeStyle = '#355070'; ctx.lineWidth = 1.9;
        ctx.beginPath(); ctx.moveTo(hx - 3, hy + 4.5); ctx.lineTo(hx + (activeCombat ? 11 : -4.5), hy - 12); ctx.stroke();
        ctx.strokeStyle = '#4ea8de'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(hx + (activeCombat ? 9.5 : -3.8), hy - 10.5, 3.2, -1.0, 1.0); ctx.stroke();
      } else if (vk === 'vis_wrathful_tiger_gauntlets') {
        ctx.fillStyle = '#f4a261';
        ctx.beginPath(); ctx.arc(hx + 0.5, hy, 2.5, 0, 7); ctx.fill();
        ctx.strokeStyle = '#ffe6a7'; ctx.lineWidth = 1.1;
        ctx.stroke();
      } else if (vk === 'vis_condor_meteor_bow') {
        ctx.strokeStyle = '#dda15e'; ctx.lineWidth = 1.9;
        ctx.beginPath(); ctx.arc(hx + (activeCombat ? 2.5 : -2), hy - 3, 6.2, -1.15, 1.15); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,240,0.75)'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(hx + (activeCombat ? 5 : 0), hy - 8.5); ctx.lineTo(hx + (activeCombat ? 5 : 0), hy + 2.5); ctx.stroke();
      } else if (vk === 'vis_peacock_plume_focus') {
        ctx.fillStyle = '#f4d35e';
        ctx.fillRect(hx - 1.2, hy - 3.2, 4.2, 2.4);
        ctx.strokeStyle = '#2ec4b6'; ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.arc(hx + 2, hy - 2, 3.6, -1.2, 1.2); ctx.stroke();
      } else if (vk === 'vis_jiuxiao_phoenix_zither') {
        ctx.fillStyle = '#ff9e00';
        ctx.fillRect(hx - 2.5, hy - 2.2, 8.2, 2.8);
        ctx.strokeStyle = '#72efdd'; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(hx - 2, hy - 1.2); ctx.lineTo(hx + 5.2, hy - 1.2); ctx.moveTo(hx - 2, hy - 0.2); ctx.lineTo(hx + 5.2, hy - 0.2); ctx.stroke();
      } else if (vk === 'vis_chunqiu_judgment_brush') {
        ctx.strokeStyle = '#52b788'; ctx.lineWidth = 2.0;
        ctx.beginPath(); ctx.moveTo(hx - 1.5, hy + 2); ctx.lineTo(hx + (activeCombat ? 7.5 : -3.5), hy - 7.5); ctx.stroke();
        ctx.fillStyle = '#ef476f';
        ctx.beginPath(); ctx.arc(hx + (activeCombat ? 8.2 : -4.2), hy - 8.2, 1.9, 0, 7); ctx.fill();
      } else if (vk === 'vis_tiancan_fate_whip') {
        ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + 6, hy - 7, hx + (activeCombat ? 11.5 : -4.5), hy - 2.5); ctx.stroke();
        ctx.strokeStyle = '#9b5de5'; ctx.lineWidth = 1.0;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + 4, hy - 9, hx + (activeCombat ? 10 : -3.5), hy - 6.5); ctx.stroke();
      }
      ctx.restore();
    },

    /* ---------- Physical Outsider / Visitor Sprite on Sect Map (Pure Read-Only) ---------- */
    drawVisitor(ctx, v, hour) {
      const z = this.cam.z;
      const a = this.alpha == null ? 1 : this.alpha;
      const vx = (Number.isFinite(v._px) && Math.hypot(v.x - v._px, v.y - v._py) < 4) ? (v._px + (v.x - v._px) * a) : v.x;
      const vy = (Number.isFinite(v._py) && Math.hypot(v.y - v._py, v.x - v._px) < 4) ? (v._py + (v.y - v._py) * a) : v.y;
      const x = vx * TS, y = vy * TS;
      const roleColors = {
        merchant: '#d4a373',
        trader: '#d4a373',
        scholar: '#4ea8de',
        herbalist: '#52b788',
        wanderer: '#e07a5f',
        envoy: '#9b5de5',
        artisan: '#f4a261',
        monk: '#e9c46a'
      };
      const robe = roleColors[v.role || v.kind] || '#c9a15b';
      if (z < 0.42) {
        ctx.fillStyle = robe;
        ctx.beginPath(); ctx.arc(x, y - 4, Math.max(2.4 / z, 5), 0, 7); ctx.fill();
        ctx.strokeStyle = '#fff3b0'; ctx.lineWidth = 1.2 / z; ctx.stroke();
        return;
      }
      const bob = Math.sin(this.t * 3 + (v.x || 0)) * 0.4;
      const face = (v.face == null || v.face >= 0) ? 1 : -1;
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0,0,0,.24)';
      ctx.beginPath(); ctx.ellipse(0, 1, 6, 2.6, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = v.notable ? 'rgba(245,215,127,0.75)' : 'rgba(168,218,220,0.55)';
      ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.ellipse(0, 1, 7.2, 3.2, 0, 0, 7); ctx.stroke();

      ctx.scale(face * 1.12, 1.12);
      ctx.fillStyle = '#2b2d42';
      ctx.fillRect(-3, -5.5, 2.3, 5.5);
      ctx.fillRect(0.7, -5.5, 2.3, 5.5);
      ctx.fillStyle = robe;
      ctx.beginPath();
      ctx.moveTo(-5.2, -4.2 - bob);
      ctx.lineTo(5.2, -4.2 - bob);
      ctx.lineTo(3.8, -13.2 - bob);
      ctx.lineTo(-3.8, -13.2 - bob);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f8edeb';
      ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(-2.4, -13 - bob); ctx.lineTo(0.4, -9.6 - bob); ctx.lineTo(2.4, -13 - bob); ctx.stroke();
      const hy = -17.2 - bob;
      ctx.fillStyle = '#e8c49c';
      ctx.beginPath(); ctx.arc(0, hy, 4.5, 0, 7); ctx.fill();
      ctx.fillStyle = v.notable ? '#5c4033' : '#8a6d3b';
      ctx.beginPath();
      ctx.moveTo(-7.2, hy - 2.2);
      ctx.quadraticCurveTo(0, hy - 8.2, 7.2, hy - 2.2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      if (this.opts.names && z >= 0.85) {
        const icon = v.kind === 'trader' || v.role === 'merchant' ? '🪙' : v.notable ? '🎐' : '🧳';
        const nm = icon + ' ' + (v.nameTh || 'ผู้มาเยือน');
        ctx.font = '600 9px ' + FONT;
        ctx.textAlign = 'center';
        const tw = measureCached(ctx, ctx.font, nm);
        ctx.fillStyle = 'rgba(24,20,32,0.84)';
        ctx.fillRect(x - tw / 2 - 4, y + 2, tw + 8, 11.5);
        ctx.strokeStyle = '#e9cd85';
        ctx.lineWidth = 0.75;
        ctx.strokeRect(x - tw / 2 - 4, y + 2, tw + 8, 11.5);
        ctx.fillStyle = '#ffe8a3';
        ctx.fillText(nm, x, y + 10.5);
      }
    },

    drawProp(ctx, n, act, armA, by, lunge, ap) {
      const t = this.t;
      const hx = 3 + Math.sin(armA) * 6 + lunge, hy = -12 + by + Math.cos(armA) * 5.5;
      const weapon = n.equip && n.equip.WEAPON;
      const wType = (ap && ap.weaponType) || (n.act && n.act.ctx && n.act.ctx.skill) || '';

      if (act === 'practice' || act === 'skillDrill' || act === 'fight' || act === 'guard' || (act === 'pair' && n.act?.ctx?.pair?.type === 'spar')) {
        if (ap && ap.weaponUsable && R.isTranscendent(weapon)) {
          R.drawWornTranscendent(ctx, n, weapon, hx + 4, hy - 4, 22, armA * .42);
          return;
        }
        if (ap && ap.weaponUsable && relicByVisual[ap.weaponVisualKey]) return;
        if (!weapon && (wType === 'FIST_PALM' || wType === 'MOVEMENT' || wType === 'BODY_REFINING' || wType === 'SOUL_DIVINE' || wType === 'POISON' || !wType)) {
          // Unarmed / Palm / Body / Movement build: draw martial palm-qi aura instead of a fake sword
          const pCol = n.cult ? PATH_COL[n.cult.path] : '#f0cf68';
          ctx.strokeStyle = pCol;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(hx + 2, hy - 1, 3.8 + Math.sin(t * 10 + (n.n || 0)) * 0.8, -1.1, 1.1);
          ctx.stroke();
          return;
        }
        if (wType === 'SPEAR' || wType === 'STAFF' || act === 'guard') {
          // Long Spear / Polearm with red tassel
          ctx.strokeStyle = '#6e492a';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(hx - 3, hy + 4); ctx.lineTo(hx + 10, hy - 11); ctx.stroke();
          if (wType !== 'STAFF') {
            ctx.fillStyle = '#d32f2f';
            ctx.beginPath(); ctx.arc(hx + 8, hy - 8.5, 1.6, 0, 7); ctx.fill();
            ctx.strokeStyle = '#e8eef5';
            ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(hx + 9, hy - 9.5); ctx.lineTo(hx + 12.5, hy - 13.5); ctx.stroke();
          }
        } else if (wType === 'BLADE' || wType === 'SABER') {
          // Curved Single-Edged Saber (刀)
          ctx.strokeStyle = '#8a5a2a';
          ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.moveTo(hx - 1, hy + 1); ctx.lineTo(hx + 1, hy - 1); ctx.stroke();
          ctx.strokeStyle = weapon ? '#e4ecf5' : '#c0c6cc';
          ctx.lineWidth = 2.1;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.quadraticCurveTo(hx + 6, hy - 2, hx + 9.5, hy - 8.5);
          ctx.stroke();
        } else if (wType === 'DAGGER') {
          // Twin Short Daggers
          ctx.strokeStyle = '#e8f0f8';
          ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 5.5, hy - 4.5); ctx.stroke();
        } else if (wType === 'ZITHER') {
          // Guqin / Zither with harmonic strings
          ctx.fillStyle = '#8d5b4c';
          ctx.fillRect(hx - 2, hy - 2, 7.5, 2.5);
          ctx.strokeStyle = '#80ffdb';
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(hx - 1.5, hy - 0.8); ctx.lineTo(hx + 5, hy - 0.8); ctx.stroke();
        } else if (wType === 'BRUSH') {
          // Talisman / Calligraphy Brush with cinnabar tip
          ctx.strokeStyle = '#52796f';
          ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.moveTo(hx - 1, hy + 1.5); ctx.lineTo(hx + 6.5, hy - 6.5); ctx.stroke();
          ctx.fillStyle = '#e63946';
          ctx.beginPath(); ctx.arc(hx + 7.2, hy - 7.2, 1.6, 0, 7); ctx.fill();
        } else if (wType === 'WHIP') {
          // Coiled / Sweeping Silk Whip & Spirit Thread
          ctx.strokeStyle = '#c77dff';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + 5.5, hy - 6.5, hx + 10.5, hy - 2); ctx.stroke();
        } else if (wType === 'BOW') {
          // Curved Warbow
          ctx.strokeStyle = '#bc6c25';
          ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.arc(hx + 2, hy - 2.5, 5.5, -1.1, 1.1); ctx.stroke();
        } else if (wType === 'ROSARY') {
          ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.arc(hx + 3, hy - 3, 3.2, 0, Math.PI * 2); ctx.stroke();
        } else if (wType === 'CLAW') {
          ctx.strokeStyle = '#ef476f'; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 5, hy - 5); ctx.moveTo(hx + 1, hy + 1); ctx.lineTo(hx + 6, hy - 3); ctx.stroke();
        } else if (wType === 'NEEDLE') {
          ctx.strokeStyle = '#06d6a0'; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 6.5, hy - 6.5); ctx.stroke();
        } else if (wType === 'FAN') {
          ctx.fillStyle = '#4cc9f0';
          ctx.beginPath(); ctx.moveTo(hx, hy); ctx.arc(hx, hy, 5.2, -1.4, -0.2); ctx.closePath(); ctx.fill();
        } else if (wType === 'ASTROLABE') {
          ctx.strokeStyle = '#74c0fc'; ctx.lineWidth = 1.3;
          ctx.beginPath(); ctx.arc(hx + 3.5, hy - 3.5, 3.8, 0, Math.PI * 2); ctx.stroke();
        } else if (wType === 'ABACUS') {
          ctx.fillStyle = '#ffb703';
          ctx.fillRect(hx + 1, hy - 5, 5.5, 4.0);
        } else if (wType === 'FOCUS') {
          // Spirit Focus Orb / Fan
          ctx.fillStyle = '#48cae4';
          ctx.beginPath(); ctx.arc(hx + 2.5, hy - 2.5, 2.4, 0, 7); ctx.fill();
        } else {
          // Straight Double-Edged Sword (剑)
          ctx.strokeStyle = weapon ? '#e8f2fc' : '#b8c0c8';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 9.5, hy - 9.5); ctx.stroke();
          ctx.strokeStyle = '#d4af37';
          ctx.lineWidth = 2.0;
          ctx.beginPath(); ctx.moveTo(hx - 1.2, hy + 1.2); ctx.lineTo(hx + 1.2, hy - 1.2); ctx.stroke();
        }
        if ((act === 'practice' || act === 'skillDrill') && Math.sin(t * 9 + (n.n || 0)) > 0.68) {
          ctx.strokeStyle = 'rgba(255,255,255,.78)';
          ctx.lineWidth = 1.1;
          ctx.beginPath(); ctx.arc(hx + 4, hy - 4, 10, -1.2, 0.3); ctx.stroke();
        }
      } else if (act === "investigateClueLocal") {
        // Compass & Jade Slip Clue Investigation Prop
        ctx.fillStyle = "#f4d35e";
        ctx.beginPath(); ctx.arc(hx + 1.5, hy - 1, 2.8, 0, 7); ctx.fill();
        ctx.strokeStyle = "#72efdd";
        ctx.lineWidth = 1.0;
        ctx.beginPath(); ctx.arc(hx + 1.5, hy - 1, 4.2 + Math.sin(t * 6) * 0.6, 0, 7); ctx.stroke();
      } else if (act === 'study' || act === 'guidedStudy' || (act === 'pair' && n.act?.ctx?.pair?.type === 'teach')) {
        // Bamboo/Silk Scroll & Brush
        ctx.fillStyle = '#f0e0b2';
        ctx.fillRect(hx - 2, hy - 3.5, 6.5, 5.2);
        ctx.fillStyle = '#36587a';
        ctx.fillRect(hx - 2, hy - 3.5, 1.4, 5.2);
        ctx.fillRect(hx + 3.2, hy - 3.5, 1.2, 5.2);
      } else if (act === 'giftItem' || act === 'donate') {
        // Wrapped Silk Gift Box / Parcel
        ctx.fillStyle = '#c84b31';
        ctx.fillRect(hx - 1.5, hy - 3.5, 5.5, 5.0);
        ctx.fillStyle = '#f5d77f';
        ctx.fillRect(hx + 0.6, hy - 3.5, 1.3, 5.0);
        ctx.fillRect(hx - 1.5, hy - 1.5, 5.5, 1.2);
      } else if (act === 'shareMedicine' || act === 'personalPillUse') {
        // White-Jade Porcelain Medicine Gourd
        ctx.fillStyle = '#e0f7fa';
        ctx.beginPath(); ctx.arc(hx + 1, hy - 0.5, 2.4, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(hx + 1, hy - 3.2, 1.5, 0, 7); ctx.fill();
        ctx.fillStyle = '#e53935';
        ctx.fillRect(hx + 0.4, hy - 5.0, 1.2, 1.0);
      } else if (act === 'flatter') {
        // Etiquette / Respect Scroll Token
        ctx.fillStyle = '#f5d77f';
        ctx.beginPath(); ctx.arc(hx + 1, hy - 1, 2.2, 0, 7); ctx.fill();
      } else if (act === 'farm' || act === 'forage' || act === 'gatherWildResource') {
        ctx.strokeStyle = '#6a4a2a';
        ctx.lineWidth = 1.4;
        const sw = Math.sin(t * 6 + (n.n || 0)) * 3;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 7 + sw, hy + 6); ctx.stroke();
        ctx.fillStyle = '#888';
        ctx.fillRect(hx + 6 + sw, hy + 5, 4, 2);
      } else if (act === 'mine') {
        ctx.strokeStyle = '#6a4a2a';
        ctx.lineWidth = 1.4;
        const sw = Math.sin(t * 7 + (n.n || 0));
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 7, hy - 6 + sw * 3); ctx.stroke();
        ctx.fillStyle = '#9aa0a6';
        ctx.fillRect(hx + 5, hy - 9 + sw * 3, 6, 2);
      } else if (act === 'eat') {
        ctx.fillStyle = '#f2ead8';
        ctx.beginPath(); ctx.arc(hx, hy - 1, 2.8, 0, Math.PI); ctx.fill();
        ctx.fillStyle = '#c84b31';
        ctx.fillRect(hx - 2.6, hy - 1.2, 5.2, 0.8);
      } else if (act === 'riverFish' || (act === 'leisure' && n.act.ctx && n.act.ctx.mode === 'fish')) {
        ctx.strokeStyle = '#6a4a2a';
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 13, hy - 9); ctx.stroke();
        const bobY = hy + 7 + Math.sin(t * 3.2 + (n.n || 0)) * 1.6;
        ctx.strokeStyle = 'rgba(255,255,255,.75)';
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(hx + 13, hy - 9); ctx.lineTo(hx + 13, bobY); ctx.stroke();
        ctx.fillStyle = '#e63946';
        ctx.beginPath(); ctx.arc(hx + 13, bobY, 1.6, 0, Math.PI * 2); ctx.fill();
      } else if (act === 'leisure' && n.act.ctx && n.act.ctx.mode === 'music') {
        ctx.fillStyle = '#fff';
        ctx.font = '8px ' + FONT;
        ctx.fillText('♪', hx + 4, hy - 4 - ((t * 8) % 8));
      } else if (act === 'cook') {
        ctx.fillStyle = '#d9d9d9';
        ctx.fillRect(hx - 1, hy - 1, 5, 3);
      } else if ((act === 'cultivate' || act === 'paidTraining') && n.cult) {
        ctx.fillStyle = PATH_COL[n.cult.path];
        for (let i = 0; i < 3; i++) {
          const a = t * 1.5 + i * 2.1 + (n.n || 0);
          ctx.globalAlpha = 0.72;
          ctx.fillRect(Math.cos(a) * 7, -8 - ((t * 10 + i * 9) % 22), 1.5, 1.5);
        }
        ctx.globalAlpha = 1;
      } else if (act === 'brew' || act === 'brewBasic' || act === 'personalBrew' || act === 'forge') {
        ctx.fillStyle = act === 'forge' ? '#ff9a4a' : '#7ae89e';
        ctx.beginPath(); ctx.arc(hx + 3, hy - 2 - ((t * 6) % 4), 1.6, 0, 7); ctx.fill();
      }
    },

    hpBar(ctx, x, y, f, w) {
      f = clamp(f, 0, 1);
      ctx.fillStyle = 'rgba(0,0,0,.68)';
      ctx.fillRect(x - w / 2 - 1, y - 1, w + 2, 4);
      ctx.fillStyle = f > 0.5 ? '#5fd35f' : f > 0.25 ? '#e8c43a' : '#e0463a';
      ctx.fillRect(x - w / 2, y, w * f, 2.2);
    },

    drawWild(ctx, b) {
      const alpha = this.alpha == null ? 1 : this.alpha;
      const dx = b.x - b._px, dy = b.y - b._py;
      const localStep = dx * dx + dy * dy < 16;
      const x = (localStep ? b._px + dx * alpha : b.x) * TS;
      const y = (localStep ? b._py + dy * alpha : b.y) * TS;
      const zoom = this.cam.z;
      const { model, tier, scale, palette, visual, marking, trim, raid } = R.resolveWildBeastArt(b);
      const body = visual?.body || palette[0];
      const light = visual?.accent || palette[1];
      const ink = '#18232e';
      const colors = { body, light, shade: ink, wing: body, ivory: palette[1],
        eye: b.aggressive || b.fighting ? '#ffea8d' : '#fff3d5' };
      const detail = zoom >= .42 && this.resolveQuality() !== 'low';
      const reduced = this.isReducedMotion();
      const moving = localStep && dx * dx + dy * dy > .001;
      const time = reduced ? 0 : (this.t || 0) + (b.px || 0) * .37 + (b.py || 0) * .19;
      const hover = model.hover || (trim === 'wings' || trim === 'feathers' ? 3 : 0);
      const rate = hover ? 3.3 : moving ? 8 : 2.8;
      const lift = hover + (reduced ? 0 : Math.sin(time * rate) * (hover ? 1.6 : moving ? 1.1 : .45));
      const flap = reduced ? 0 : Math.sin(time * (b.fighting ? 6.6 : 4.4)) * .19;
      const face = !b.fighting && moving && Math.abs(dx) > .015 ? Math.sign(dx) : (b.face < 0 ? -1 : 1);
      const shadow = model.shadow || 14;

      ctx.save();
      ctx.translate(x, y);
      const groundRing = b.legendary || tier >= 6;
      ctx.fillStyle = '#17252651';
      ctx.beginPath();
      ctx.ellipse(0, 1, shadow * scale, 3.9 * scale, 0, 0, 7);
      ctx.fill();
      if (b.aquaticHunt) {
        ctx.strokeStyle = '#b9f1ff99';
        ctx.lineWidth = 1.1;
        for (let i = 0; i < 2; i++) {
          ctx.beginPath();
          ctx.ellipse(0, 2 + i * 3, (shadow + i * 4) * scale, (2.4 + i) * scale, 0, 0, Math.PI);
          ctx.stroke();
        }
      }
      if (groundRing) {
        ctx.lineWidth = 1.05;
        ctx.strokeStyle = light;
        ctx.globalAlpha *= .68;
        ctx.beginPath();
        ctx.ellipse(0, 1, (shadow + 4) * scale, 5.2 * scale, 0, .25, 3.02);
        ctx.stroke();
        if (tier === 7 && detail) {
          ctx.beginPath();
          ctx.ellipse(0, 1, (shadow + 8) * scale, 8.1 * scale, 0, .42, 2.72);
          ctx.stroke();
        }
        ctx.globalAlpha /= .68;
      }
      if (raid) {
        const rings = raid.grade === 'TRANSCENDENT' ? 3 : raid.grade === 'LEGENDARY' ? 2 : 1;
        const centerY = -model.top * scale * .43;
        const radius = (shadow + 6) * scale;
        const pulse = b.raidPulse || b.raidPulseFlash;
        ctx.save();
        if (pulse) {
          const cx = pulse.x * TS - x, cy = pulse.y * TS - y;
          ctx.strokeStyle = b.raidPulse ? '#ffc78c' : '#fff2de';
          ctx.fillStyle = b.raidPulse ? '#f4795940' : '#fff1aa58';
          ctx.lineWidth = b.raidPulse ? 2 : 4;
          if (b.raidPulse) ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.arc(cx, cy, pulse.radius * TS, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
          ctx.setLineDash([]);
        }
        if (rings >= 2 && detail) {
          const aura = ctx.createRadialGradient(0, centerY, radius * .1, 0, centerY, radius * 1.45);
          aura.addColorStop(0, raid.color + '68');
          aura.addColorStop(.55, raid.color + '28');
          aura.addColorStop(1, raid.color + '00');
          ctx.fillStyle = aura;
          ctx.fillRect(-radius * 1.45, centerY - radius * 1.45, radius * 2.9, radius * 2.9);
        }
        ctx.strokeStyle = raid.color;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < rings; i++) {
          ctx.globalAlpha = .70 - i * .15;
          ctx.beginPath();
          const spin = time * (i % 2 ? -.15 : .18) + i * 2.1;
          ctx.ellipse(0, centerY, radius * (1 + i * .16), radius * (.74 + i * .13), -.28 + i * .27, spin, spin + 4.6);
          ctx.stroke();
        }
        if (rings === 3 && detail) {
          ctx.globalAlpha = .86;
          ctx.fillStyle = '#e5fdff';
          for (let i = 0; i < 8; i++) {
            const a = time * .17 + i * Math.PI / 4;
            const dx = Math.cos(a) * radius * 1.32, dy = centerY + Math.sin(a) * radius;
            ctx.beginPath();
            ctx.moveTo(dx, dy - 6); ctx.lineTo(dx + 3, dy);
            ctx.lineTo(dx, dy + 6); ctx.lineTo(dx - 3, dy); ctx.closePath(); ctx.fill();
          }
        }
        ctx.restore();
      }
      if (zoom >= .42) this.drawCommonStatusAuras(ctx, b, 0);

      ctx.save();
      ctx.translate(0, -lift * scale);
      ctx.scale(face * scale, scale);
      ctx.lineJoin = 'round';
      if (typeof Path2D === 'function') {
        const back = wildBacks[trim];
        if (back) paintWildLayer(ctx, back, colors, flap);
        for (const layer of model.layers) {
          if (zoom >= .35 || (layer[0] !== 'eye' && layer[0] !== 'ivory')) paintWildLayer(ctx, layer, colors, flap);
        }
        if ((zoom >= .42 && marking) || detail || tier >= 5) {
          const mark = wildMarkings[marking || (tier >= 3 && !trim ? wildTierMark[tier] : null)];
          if (mark) paintWildLayer(ctx, mark, colors, flap);
        }
        if (wildMarkings[trim]) paintWildLayer(ctx, wildMarkings[trim], colors, flap);
      } else {
        ctx.fillStyle = body;
        ctx.beginPath(); ctx.ellipse(0, -8, shadow * .8, 5, 0, 0, 7); ctx.fill();
      }
      ctx.restore();

      const top = Math.max(model.top, wildBacks[trim] ? 43 : 0, wildMarkings[trim] || marking === 'kirin' ? 38 : 0);
      const labelY = -(top + lift + 6) * scale;
      const showHealth = zoom >= .55 && b.fighting && Number.isFinite(b.hp) && b.hpMax > 0;
      if (showHealth) this.hpBar(ctx, 0, labelY, b.hp / b.hpMax, shadow * scale * 1.5);
      if (zoom > .8 || (raid && zoom >= .55)) {
        ctx.font = (groundRing ? 'bold ' : '') + '9px ' + FONT;
        ctx.textAlign = 'center';
        ctx.lineWidth = 2.3;
        ctx.strokeStyle = '#1b2a28';
        ctx.fillStyle = raid?.color || (groundRing ? palette[1] : '#f8f2dc');
        const label = (b.name || b.nameTh || '') + ' · ' + (raid?.nameTh || 'T' + tier);
        const textY = labelY - (showHealth ? 5 : 0);
        ctx.strokeText(label, 0, textY);
        ctx.fillText(label, 0, textY);
      }
      ctx.restore();
    },

    drawWildResource(ctx, rn) {
      const x = rn.x * TS, y = rn.y * TS, z = this.cam.z;
      ctx.save();
      ctx.translate(x + 8, y + 8);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath(); ctx.ellipse(0, 4, 7, 2.8, 0, 0, 7); ctx.fill();

      if (rn.category === 'HERB' || rn.category === 'BASIC_HERB' || rn.category === 'OTHER_HERB') {
        ctx.fillStyle = '#3e8e41';
        ctx.beginPath();
        ctx.ellipse(-3, 1, 4, 2.2, -0.4, 0, 7);
        ctx.ellipse(3, 1, 4, 2.2, 0.4, 0, 7);
        ctx.ellipse(0, -2, 2.5, 3.8, 0, 0, 7);
        ctx.fill();
        let petalCol = '#a8e6cf';
        if (rn.materialId === 'MAT_HERB_CINDER_LEAF_1') petalCol = '#ff7043';
        else if (rn.materialId === 'MAT_HERB_JADE_LOTUS_2') petalCol = '#81c784';
        else if (rn.materialId === 'MAT_HERB_MIST_ORCHID_2') petalCol = '#ba68c8';
        else if (rn.materialId.includes('FLAME') || rn.materialId.includes('FIRE')) petalCol = '#f44336';
        else if (rn.materialId.includes('ICE') || rn.materialId.includes('SNOW')) petalCol = '#80deea';
        ctx.fillStyle = petalCol;
        ctx.beginPath(); ctx.arc(0, -3.5, 2.4, 0, 7); ctx.fill();
      } else if (rn.category === 'ORE') {
        ctx.fillStyle = '#607d8b';
        ctx.beginPath(); ctx.moveTo(-5, 4); ctx.lineTo(-6, -2); ctx.lineTo(-1, -6); ctx.lineTo(5, -3); ctx.lineTo(6, 4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = rn.materialId.includes('GOLD') ? '#ffd54f' : rn.materialId.includes('IRON') ? '#cfd8dc' : '#80cbc4';
        ctx.fillRect(-2, -3, 3, 3);
      } else {
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath(); ctx.arc(0, 0, 4, 0, 7); ctx.fill();
        ctx.fillStyle = '#d7ccc8';
        ctx.fillRect(-1, -4, 2, 3);
      }

      if (z > 0.85) {
        ctx.font = '8px ' + FONT;
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillText(rn.remaining + '', 0, -8);
      }
      ctx.restore();
    },

    drawFoe(ctx, f) {
      const a = this.alpha == null ? 1 : this.alpha;
      const fx = (Number.isFinite(f._px) && Math.hypot(f.x - f._px, f.y - f._py) < 4) ? (f._px + (f.x - f._px) * a) : f.x;
      const fy = (Number.isFinite(f._py) && Math.hypot(f.y - f._py, f.x - f._px) < 4) ? (f._py + (f.y - f._py) * a) : f.y;
      const x = fx * TS, y = fy * TS, z = this.cam.z, t = this.t + f.x;
      if (z < 0.42) {
        ctx.fillStyle = '#e0463a';
        ctx.beginPath(); ctx.arc(x, y - 4, Math.max(2.5 / z, 5), 0, 7); ctx.fill();
        return;
      }
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0,0,0,.28)';
      ctx.beginPath(); ctx.ellipse(0, 1, 8, 3, 0, 0, 7); ctx.fill();
      this.drawCommonStatusAuras(ctx, f, 0);
      ctx.scale(f.face >= 0 ? 1 : -1, 1);
      const s = 0.9 + f.tier * 0.12, bob = Math.abs(Math.sin(t * 8)) * 1.5;
      if (f.kind === 'beast') {
        ctx.scale(s, s);
        const hue = ((f.sp || '').length * 37) % 360, col = 'hsl(' + hue + ',32%,36%)';
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.ellipse(0, -7 - bob, 9, 5.5, 0, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(9, -10 - bob, 4.2, 0, 7); ctx.fill();
        ctx.fillRect(-7, -4, 2.4, 4 + Math.sin(t * 8) * 1.2);
        ctx.fillRect(-2, -4, 2.4, 4 - Math.sin(t * 8) * 1.2);
        ctx.fillRect(3, -4, 2.4, 4 + Math.sin(t * 8) * 1.2);
        ctx.fillRect(7, -4, 2.4, 4 - Math.sin(t * 8) * 1.2);
        ctx.fillStyle = '#ff4a3a';
        ctx.fillRect(10, -11 - bob, 2, 1.6);
      } else {
        ctx.fillStyle = '#3a2a2a';
        ctx.fillRect(-3, -6, 2.6, 6);
        ctx.fillRect(0.6, -6, 2.6, 6);
        ctx.fillStyle = f.boss ? '#7a1f1f' : '#4a3a4a';
        ctx.beginPath(); ctx.moveTo(-4.5, -5 - bob); ctx.lineTo(4.5, -5 - bob); ctx.lineTo(3.6, -13 - bob); ctx.lineTo(-3.6, -13 - bob); ctx.fill();
        ctx.fillStyle = '#c99a78';
        ctx.beginPath(); ctx.arc(0, -17 - bob, 4.8, 0, 7); ctx.fill();
        ctx.fillStyle = '#222';
        ctx.fillRect(-4.4, -19.6 - bob, 8.8, 2.2);
        ctx.fillStyle = '#c33';
        ctx.fillRect(-4.4, -18.4 - bob, 8.8, 1);
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(4, -11 - bob); ctx.lineTo(12, -17 - bob + Math.sin(t * 9) * 3); ctx.stroke();
      }
      ctx.restore();
      this.hpBar(ctx, x, y - 24 * s, f.hp / f.hpMax, 16);
      ctx.font = '8.5px ' + FONT;
      ctx.textAlign = 'center';
      if (z >= 1) { ctx.fillStyle = '#ffb0a8'; ctx.fillText(f.name, x, y + 9); }
      if (f.fx && this.W.t - f.fx.t < 4) {
        ctx.font = 'bold 10px ' + FONT;
        ctx.fillStyle = '#ffe27a';
        ctx.strokeStyle = 'rgba(0,0,0,.7)';
        ctx.lineWidth = 2.4;
        ctx.strokeText(f.fx.text, x, y - 30 - (this.W.t - f.fx.t) * 3);
        ctx.fillText(f.fx.text, x, y - 30 - (this.W.t - f.fx.t) * 3);
      }
    },

    drawMarkers(ctx) {
      const W = this.W;
      const sel = this.selected && W.byId[this.selected];
      if (sel && !sel.hidden) {
        if (sel.path && sel.path.length) {
          ctx.strokeStyle = 'rgba(255,244,200,.62)';
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const p = this.npcPos(sel);
          ctx.moveTo(p.x * TS, p.y * TS);
          for (let i = sel.pi; i < sel.path.length; i++) ctx.lineTo(sel.path[i][0] * TS + 8, sel.path[i][1] * TS + 8);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        // If selected NPC has an active social commitment, draw a warm dashed link to their partner
        const comm = sel.cognition && sel.cognition.commitment;
        const partner = comm && W.byId[comm.partnerId];
        if (partner && !partner.dead && !partner.away && !partner.hidden && ctx.beginPath && ctx.setLineDash) {
          const pA = this.npcPos(sel), pB = this.npcPos(partner);
          ctx.strokeStyle = 'rgba(233,205,133,0.55)';
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(pA.x * TS, pA.y * TS - 10);
          ctx.lineTo(pB.x * TS, pB.y * TS - 10);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      const T2 = W.sect.tournament;
      if (T2 && T2.state === 'run') {
        const tg = W.map.byId.training_ground;
        ctx.font = '12px ' + FONT; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe27a'; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 3;
        ctx.strokeText('🏆 ประลองยุทธ์สำนัก', (tg.x + tg.w / 2) * TS, (tg.y - 0.3) * TS);
        ctx.fillText('🏆 ประลองยุทธ์สำนัก', (tg.x + tg.w / 2) * TS, (tg.y - 0.3) * TS);
      }
      if (Array.isArray(W.fights) && W.fights.length && this.cam.z >= 0.65) {
        const KIND_LABELS = { spar: '🥋 ซ้อมมือ', feud: '🩸 ดวลสะสางแค้น', leadership: '👑 ชิงตำแหน่งเจ้าสำนัก', tourney: '🏆 ประลองยุทธ์', raid: '⚔️ ต้านผู้บุกรุก', hunt: '🐾 ล่าอสูร' };
        W.fights.forEach(fg => {
          if (!fg || fg.done) return;
          const units = [].concat(fg.A || [], fg.B || []).map(id => (W.byId && W.byId[id]) || (W.foes && W.foes.find(x => x && x.id === id))).filter(u => u && !u.dead && Number.isFinite(u.x) && Number.isFinite(u.y));
          if (!units.length) return;
          const cx = units.reduce((s, u) => s + u.x, 0) / units.length * TS;
          const cy = (units.reduce((s, u) => s + u.y, 0) / units.length - 2.6) * TS;
          const fLabel = KIND_LABELS[fg.kind] || (fg.serious ? '⚔️ ศึกดวลเป็นตาย' : '🥋 ประลองยุทธ์');
          ctx.font = '600 9.5px ' + FONT; ctx.textAlign = 'center';
          ctx.fillStyle = fg.serious ? '#ffb27a' : '#a5f3fc'; ctx.strokeStyle = 'rgba(0,0,0,.78)'; ctx.lineWidth = 2.5;
          ctx.strokeText(fLabel, cx, cy); ctx.fillText(fLabel, cx, cy);
        });
      }
      if (W.sect.festival && W.sect.festival.until > W.t && W.sect.festival.kind === 'banquet') {
        const pl = W.map.byId.plaza;
        ctx.font = '12px ' + FONT; ctx.textAlign = 'center'; ctx.fillStyle = '#ffd1e0'; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 3;
        ctx.strokeText('🎎 งานเลี้ยงสำนัก', (pl.x + pl.w / 2) * TS, (pl.y + 1) * TS);
        ctx.fillText('🎎 งานเลี้ยงสำนัก', (pl.x + pl.w / 2) * TS, (pl.y + 1) * TS);
      }
      const visitors = W.world && Array.isArray(W.world.visitors) ? W.world.visitors.filter(v => v && v.kind === 'trader' && v.untilDay >= W.day) : [];
      const market = W.map.byId.market;
      if (visitors.length && market && this.cam.z > 0.5) {
        const mx = (market.x + market.w / 2) * TS, my = (market.y - 0.25) * TS, label = '🪙 พ่อค้า ' + visitors.length;
        ctx.font = '10px ' + FONT; ctx.textAlign = 'center';
        const tw = measureCached(ctx, ctx.font, label);
        ctx.fillStyle = 'rgba(15,20,28,.88)'; ctx.fillRect(mx - tw / 2 - 5, my - 13, tw + 10, 16);
        ctx.strokeStyle = '#c9a15b'; ctx.lineWidth = 1; ctx.strokeRect(mx - tw / 2 - 5, my - 13, tw + 10, 16);
        ctx.fillStyle = '#f6d28a'; ctx.fillText(label, mx, my - 2);
      }
      const ex = MAP.EXIT;
      if (this.cam.z > 0.5) {
        ctx.font = '10px ' + FONT; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.78)';
        ctx.fillText('▼ ทางออกสู่ยุทธภพ', ex.x * TS + 8, ex.y * TS - 4);
      }
    },

    drawWeather(ctx, kind, hour) {
      const w = this.vw, h = this.vh, t = this.t;
      const qual = this.effectiveQuality || 'standard';
      const mult = qual === 'low' ? 0.35 : qual === 'standard' ? 0.65 : 1.0;
      if (kind === 'rain') {
        const drops = Math.round(100 * mult);
        ctx.strokeStyle = 'rgba(190,215,255,.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < drops; i++) {
          const x = ((i * 97 + t * 160) % (w + 40)) - 20, y = ((i * 53 + t * 520) % (h + 40)) - 20;
          ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 11);
        }
        ctx.stroke();
        ctx.fillStyle = 'rgba(36,52,76,.14)';
        ctx.fillRect(0, 0, w, h);
      } else if (kind === 'snow') {
        const flakes = Math.round(80 * mult);
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        for (let i = 0; i < flakes; i++) {
          const x = ((i * 89 + Math.sin(t + i) * 20 + t * 14) % (w + 20)), y = ((i * 61 + t * 55) % (h + 20));
          ctx.beginPath(); ctx.arc(x, y, 1.5 + (i % 3) * 0.4, 0, 7); ctx.fill();
        }
        ctx.fillStyle = 'rgba(220,230,245,.09)';
        ctx.fillRect(0, 0, w, h);
      } else if (kind === 'fog') {
        const gr = ctx.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, 'rgba(220,228,236,.34)');
        gr.addColorStop(1, 'rgba(220,228,236,.18)');
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, w, h);
      } else if (kind === 'cloud') {
        ctx.fillStyle = 'rgba(70,80,95,.08)';
        ctx.fillRect(0, 0, w, h);
      }
      if (this.W.season === 0 && kind !== 'rain' && qual !== 'low') {
        const cnt = Math.round(16 * mult);
        ctx.fillStyle = 'rgba(250,192,212,.8)';
        for (let i = 0; i < cnt; i++) {
          const x = ((i * 131 + t * 24 + Math.sin(t * 0.7 + i) * 18) % (w + 20)), y = ((i * 77 + t * 30) % (h + 20));
          ctx.beginPath(); ctx.ellipse(x, y, 2.4, 1.4, t + i, 0, 7); ctx.fill();
        }
      }
      if (this.W.season === 2 && kind !== 'rain' && qual !== 'low') {
        const cnt = Math.round(12 * mult);
        ctx.fillStyle = 'rgba(212,135,52,.8)';
        for (let i = 0; i < cnt; i++) {
          const x = ((i * 151 + t * 20 + Math.sin(t * 0.9 + i) * 22) % (w + 20)), y = ((i * 71 + t * 34) % (h + 20));
          ctx.beginPath(); ctx.ellipse(x, y, 2.6, 1.6, t * 2 + i, 0, 7); ctx.fill();
        }
      }
    },

    /* ---------- Patch v5.0.0 & JS2-v2.5.0: 43-Path Ascendant Halos (P0) & Multi-Tier Path Motes (P2) ---------- */
    drawPathApexCrownGeometry(ctx, pKey, sig, hy, t, isApex, lowQuality) {
      const col1 = sig.primary || '#00f5d4';
      const col2 = sig.secondary || '#ffd166';
      const acc = sig.accent || '#ffffff';
      const sc = isApex ? 1.0 : 0.78;
      ctx.save();
      ctx.translate(0, hy);
      ctx.scale(sc, sc);
      ctx.strokeStyle = col1;
      ctx.fillStyle = col2;
      ctx.lineWidth = isApex ? 1.55 : 1.2;

      switch (pKey) {
        case 'XIAN':
        case 'SWORD': {
          // วงล้อไท่เก๊กเก้าชั้นฟ้า & กระบี่บินคู่ไร้ลักษณ์ (Taiji Wheel + Radial Immortal Swords)
          ctx.beginPath(); ctx.arc(0, 0, 8.8, 0, Math.PI * 2); ctx.stroke();
          const blades = lowQuality ? 4 : 6;
          for (let i = 0; i < blades; i++) {
            const a = t * 1.4 + (i * Math.PI * 2) / blades;
            ctx.strokeStyle = i % 2 === 0 ? col1 : col2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 6.0, Math.sin(a) * 6.0);
            ctx.lineTo(Math.cos(a) * 12.2, Math.sin(a) * 12.2);
            ctx.stroke();
          }
          break;
        }
        case 'BODY': {
          // วงแหวนฟันเฟืองวัชระแปดเหลี่ยม & เสาโลหิตทองคำทลายสวรรค์ (Vajra Octagon + Blood-Gold Pillars)
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const a = t * 0.9 + (i * Math.PI) / 4;
            const r = i % 2 === 0 ? 10.2 : 7.8;
            if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
            else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.fillStyle = col2;
          ctx.fillRect(-10.5, 2, 2.2, 10);
          ctx.fillRect(8.3, 2, 2.2, 10);
          break;
        }
        case 'GOD':
        case 'DIVINE': {
          // มหาอาณาจักรเทวะ & มงกุฎสุริยะ 12 แฉก (Divine Torii Arch + 12-Ray Solar Sovereign Halo)
          ctx.strokeStyle = col1;
          ctx.beginPath(); ctx.arc(0, 0, 9.6, 0, Math.PI * 2); ctx.stroke();
          const rays = lowQuality ? 6 : 12;
          for (let i = 0; i < rays; i++) {
            const a = t * 0.8 + (i * Math.PI * 2) / rays;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 7.2, Math.sin(a) * 7.2);
            ctx.lineTo(Math.cos(a) * 12.0, Math.sin(a) * 12.0);
            ctx.stroke();
          }
          ctx.fillStyle = acc;
          ctx.fillRect(-7.5, -8.8, 15.0, 1.8);
          break;
        }
        case 'DEMON': {
          // บัลลังก์จันทร์โลหิตสุริยุปราคา & เขาจักรพรรดิมารคู่ (Blood Eclipse + Twin Demon Horns)
          ctx.fillStyle = '#190a28';
          ctx.beginPath(); ctx.arc(0, 0, 7.6, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = col2;
          ctx.lineWidth = 1.8;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-6, -2); ctx.quadraticCurveTo(-12, -10, -7, -14);
          ctx.moveTo(6, -2); ctx.quadraticCurveTo(12, -10, 7, -14);
          ctx.stroke();
          break;
        }
        case 'HEART_SOUL':
        case 'SOUL': {
          // คันฉ่องทะเลจิตแปดเหลี่ยม & ดวงตาโพธิญาณ (Octagonal Mind Mirror + Third Eye Lotus)
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const a = -t * 0.6 + (i * Math.PI) / 4;
            const px = Math.cos(a) * 9.0, py = Math.sin(a) * 9.0;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.beginPath(); ctx.ellipse(0, -3.5, 4.2, 2.0, 0, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = acc;
          ctx.beginPath(); ctx.arc(0, -3.5, 1.4, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'MECH_PUPPET':
        case 'PUPPET': {
          // มหานครกลจักร 3 ฟันเฟืองขบกัน (Interlocking Triple Clockwork Gears)
          const gears = [[-5.5, -2.5, 4.8, 1], [5.5, -2.5, 4.8, -1], [0, -7.2, 4.2, 1]];
          for (let gIdx = 0; gIdx < gears.length; gIdx++) {
            const [gx, gy, gr, dir] = gears[gIdx];
            ctx.strokeStyle = gIdx === 2 ? col2 : col1;
            ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.stroke();
            for (let k = 0; k < 6; k++) {
              const a = t * 1.8 * dir + (k * Math.PI) / 3;
              ctx.beginPath();
              ctx.moveTo(gx + Math.cos(a) * gr, gy + Math.sin(a) * gr);
              ctx.lineTo(gx + Math.cos(a) * (gr + 1.8), gy + Math.sin(a) * (gr + 1.8));
              ctx.stroke();
            }
          }
          break;
        }
        case 'KARMA_SAMSARA': {
          // กงล้อสังสารวัฏหกภพ (Six-Realm Samsara Dharma Wheel + 6 Colored Realm Nodes)
          ctx.beginPath(); ctx.arc(0, 0, 9.5, 0, Math.PI * 2); ctx.stroke();
          const realmCols = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#9d4edd', '#f8f9fa'];
          for (let i = 0; i < 6; i++) {
            const a = t * 1.1 + (i * Math.PI) / 3;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 9.5, Math.sin(a) * 9.5); ctx.stroke();
            ctx.fillStyle = realmCols[i];
            ctx.beginPath(); ctx.arc(Math.cos(a) * 9.5, Math.sin(a) * 9.5, 1.7, 0, Math.PI * 2); ctx.fill();
          }
          break;
        }
        case 'BEAST_SOVEREIGN':
        case 'BEAST': {
          // ตราประทับจตุรเทพราชันย์หมื่นอสูร & เขามังกรบรรพกาล (Four-Symbols Totem Ring + Dragon Horns)
          ctx.beginPath(); ctx.arc(0, 0, 9.0, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = col2;
          ctx.beginPath();
          ctx.moveTo(-4, -5); ctx.lineTo(-9, -13); ctx.lineTo(-5, -10);
          ctx.moveTo(4, -5); ctx.lineTo(9, -13); ctx.lineTo(5, -10);
          ctx.stroke();
          for (let i = 0; i < 4; i++) {
            const a = t * 1.3 + (i * Math.PI) / 2;
            ctx.fillStyle = i % 2 === 0 ? col1 : col2;
            ctx.fillRect(Math.cos(a) * 9.0 - 1.5, Math.sin(a) * 9.0 - 1.5, 3.0, 3.0);
          }
          break;
        }
        case 'SAGE_SUPPORT':
        case 'PILL': {
          // น้ำเต้าสวรรค์ประทานพร & ดอกบัวหยกชุบชีวา (Celestial Jade Gourd + Healing Lotus Petals)
          ctx.fillStyle = col1;
          ctx.beginPath(); ctx.arc(0, -6.5, 2.6, 0, Math.PI * 2); ctx.arc(0, -1.8, 3.8, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = col2;
          for (let i = 0; i < 6; i++) {
            const a = t + (i * Math.PI) / 3;
            ctx.beginPath();
            ctx.ellipse(Math.cos(a) * 8.5, Math.sin(a) * 8.5, 2.8, 1.2, a, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
        }
        case 'CRAFT_CREATION': {
          // เตาหลอมสวรรค์สามขา & เพลิงสาม昧 (Tripod Immortal Cauldron + Samadhi Flame Ring)
          ctx.fillStyle = col1;
          ctx.fillRect(-5.5, -5.0, 11.0, 6.5);
          ctx.beginPath();
          ctx.moveTo(-4.5, 1.5); ctx.lineTo(-6.0, 5.5);
          ctx.moveTo(0, 1.5); ctx.lineTo(0, 5.8);
          ctx.moveTo(4.5, 1.5); ctx.lineTo(6.0, 5.5);
          ctx.stroke();
          ctx.strokeStyle = acc;
          ctx.beginPath(); ctx.arc(0, -1.5, 9.8, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
          break;
        }
        case 'ARRAY_TALISMAN':
        case 'ARRAY':
        case 'TALISMAN': {
          // มหาค่ายกลปากั้วแปดประตู & แผ่นยันต์ทอง 8 ทิศ (Bagua Octagon + 8 Orbiting Talismans)
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const a = (i * Math.PI) / 4;
            const px = Math.cos(a) * 8.8, py = Math.sin(a) * 8.8;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
          const cnt = lowQuality ? 4 : 8;
          for (let i = 0; i < cnt; i++) {
            const a = -t * 1.4 + (i * Math.PI * 2) / cnt;
            ctx.fillStyle = i % 2 === 0 ? col2 : acc;
            ctx.fillRect(Math.cos(a) * 10.6 - 1.3, Math.sin(a) * 10.6 - 2.2, 2.6, 4.4);
          }
          break;
        }
        case 'STRATEGY_GOVERNANCE': {
          // ราชรถธงบัญชาทัพ 4 ผืน & ตราหยกจักรพรรดิ (4 Command War Pennants + Imperial Seal)
          for (let f = -1.5; f <= 1.5; f += 1) {
            const fx = f * 4.6;
            ctx.strokeStyle = col1;
            ctx.beginPath(); ctx.moveTo(fx * 0.6, 5); ctx.lineTo(fx * 1.25, -10); ctx.stroke();
            ctx.fillStyle = Math.abs(f) > 1 ? acc : col2;
            ctx.beginPath();
            ctx.moveTo(fx * 1.25, -10);
            ctx.lineTo(fx * 1.25 + (f < 0 ? -4.5 : 4.5), -7.5);
            ctx.lineTo(fx * 1.05, -4.5);
            ctx.closePath();
            ctx.fill();
          }
          break;
        }
        case 'ASTRO_DIVINATION': {
          // ทรงกลมดาราศาสตร์ซ้อน 2 วง & กลุ่มดาวเจ็ดดาราเหนือ (Armillary Sphere + Big Dipper)
          ctx.beginPath(); ctx.ellipse(0, 0, 10.2, 4.5, t * 0.7, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = col2;
          ctx.beginPath(); ctx.ellipse(0, 0, 10.2, 4.5, -t * 0.7 + 1.1, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = acc;
          for (let i = 0; i < 7; i++) {
            const sx = (i - 3) * 2.6, sy = Math.sin(i * 0.9) * 3.2 - 5.5;
            ctx.beginPath(); ctx.arc(sx, sy, 1.3, 0, Math.PI * 2); ctx.fill();
          }
          break;
        }
        case 'BUDDHA_DHARMA': {
          // ประภามณฑลพุทธะซ้อน 2 ชั้น & บัวทองแปดกลีบ (Dual Dharmachakra + 8-Petal Golden Lotus)
          ctx.beginPath(); ctx.arc(0, 0, 10.4, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, 7.0, 0, Math.PI * 2); ctx.stroke();
          for (let i = 0; i < 8; i++) {
            const a = t * 0.6 + (i * Math.PI) / 4;
            ctx.fillStyle = col1;
            ctx.beginPath();
            ctx.ellipse(Math.cos(a) * 8.8, Math.sin(a) * 8.8, 2.4, 1.1, a, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'VOID_SPACE': {
          // รอยแยกมิติสี่เหลี่ยมซ้อนบิดเบี้ยว (Dimensional Tesseract Rhombus + Void Rift)
          for (let rIdx = 0; rIdx < 2; rIdx++) {
            const a0 = t * (rIdx === 0 ? 1.1 : -1.1) + rIdx * (Math.PI / 4);
            ctx.strokeStyle = rIdx === 0 ? col1 : col2;
            ctx.beginPath();
            for (let k = 0; k <= 4; k++) {
              const a = a0 + (k * Math.PI) / 2;
              const px = Math.cos(a) * 9.5, py = Math.sin(a) * 9.5;
              if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.stroke();
          }
          break;
        }
        case 'SONIC_HARMONY':
        case 'SOUND': {
          // มหาสังคีตพิณเก้าสวรรค์ (5 Acoustic Chord Arcs + Resonant Jade Notes)
          for (let s = -2; s <= 2; s++) {
            ctx.strokeStyle = s % 2 === 0 ? col1 : col2;
            ctx.beginPath();
            ctx.arc(0, 2, 6.5 + Math.abs(s) * 2.1, Math.PI * 1.12, Math.PI * 1.88);
            ctx.stroke();
          }
          break;
        }
        case 'VENOM_GU':
        case 'POISON': {
          // ราชันย์หนอนกู่ทองคำ & วงแหวนรังพิษหกเหลี่ยม (Hexagonal Gu Hive + Winged Golden Gu)
          ctx.beginPath();
          for (let i = 0; i <= 6; i++) {
            const a = t * 0.9 + (i * Math.PI) / 3;
            const px = Math.cos(a) * 9.2, py = Math.sin(a) * 9.2;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.fillStyle = col2;
          ctx.beginPath(); ctx.ellipse(-4.5, -4, 3.2, 1.5, -0.5, 0, Math.PI * 2); ctx.ellipse(4.5, -4, 3.2, 1.5, 0.5, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'PRIMORDIAL_SHIFTER': {
          // ปีกเทพอสูรบรรพกาลกางสยายสองข้าง (Outstretched Primordial Chimera Wings)
          ctx.fillStyle = col1;
          ctx.beginPath();
          ctx.moveTo(-2, 2); ctx.quadraticCurveTo(-14, -10, -16, -2); ctx.quadraticCurveTo(-11, 4, -2, 4);
          ctx.moveTo(2, 2); ctx.quadraticCurveTo(14, -10, 16, -2); ctx.quadraticCurveTo(11, 4, 2, 4);
          ctx.fill();
          ctx.strokeStyle = col2;
          ctx.stroke();
          break;
        }
        case 'CELESTIAL_WEATHER':
        case 'MAGIC': {
          // เมฆาทัณฑ์อสนีเก้าชั้นฟ้า & สายฟ้าฟาด (Celestial Storm Cloud + Zigzag Lightning Bolts)
          ctx.fillStyle = col1;
          ctx.beginPath();
          ctx.arc(-4.5, -7.5, 3.5, 0, Math.PI * 2);
          ctx.arc(0, -9.0, 4.2, 0, Math.PI * 2);
          ctx.arc(4.5, -7.5, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = col2;
          ctx.beginPath();
          ctx.moveTo(-3, -4); ctx.lineTo(-6, 1); ctx.lineTo(-2, 1); ctx.lineTo(-5, 7);
          ctx.moveTo(3, -4); ctx.lineTo(6, 1); ctx.lineTo(2, 1); ctx.lineTo(5, 7);
          ctx.stroke();
          break;
        }
        case 'WANDERING_DAO': {
          // เข็มทิศสี่ทิศหมื่นขุนเขา & เกลียวเมฆาคนจร (4-Point Cardinal Compass Star + Wind Swirl)
          ctx.beginPath(); ctx.arc(0, 0, 8.8, 0, Math.PI * 2); ctx.stroke();
          for (let i = 0; i < 4; i++) {
            const a = t * 0.8 + (i * Math.PI) / 2;
            ctx.fillStyle = i % 2 === 0 ? col1 : col2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 11.5, Math.sin(a) * 11.5);
            ctx.lineTo(Math.cos(a + 0.35) * 4.0, Math.sin(a + 0.35) * 4.0);
            ctx.lineTo(Math.cos(a - 0.35) * 4.0, Math.sin(a - 0.35) * 4.0);
            ctx.closePath();
            ctx.fill();
          }
          break;
        }
        case 'MERCANTILE_DAO': {
          // ตราชั่งสวรรค์พิพากษาคุณค่า & เหรียญทองโบราณ (Celestial Balance Scale + Square-Hole Coin)
          const tilt = Math.sin(t * 2.0) * 0.18;
          ctx.save();
          ctx.rotate(tilt);
          ctx.strokeStyle = col1;
          ctx.beginPath(); ctx.moveTo(-9.5, -5.5); ctx.lineTo(9.5, -5.5); ctx.stroke();
          ctx.fillStyle = col2;
          ctx.beginPath(); ctx.arc(-9.5, -1.5, 2.6, 0, Math.PI); ctx.arc(9.5, -1.5, 2.6, 0, Math.PI); ctx.fill();
          ctx.restore();
          ctx.strokeRect(-2.4, -8.0, 4.8, 4.8);
          break;
        }
        case 'DRAGON_VEIN_GEOMANCY': {
          // จานหลัวผานฟ้ากลมดินเหลี่ยม & ยอดเขามังกรหยก (Heaven-Round Earth-Square Luopan + Jade Peaks)
          ctx.strokeRect(-7.8, -7.8, 15.6, 15.6);
          ctx.beginPath(); ctx.arc(0, 0, 9.8, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = col2;
          ctx.beginPath();
          ctx.moveTo(-6, -7.8); ctx.lineTo(-3, -13.0); ctx.lineTo(0, -7.8);
          ctx.lineTo(3, -14.2); ctx.lineTo(6, -7.8);
          ctx.fill();
          break;
        }
        case 'GRAVITY_DAO': {
          // วงโคจรความโน้มถ่วงบิดโค้ง 3 ระนาบ & หลุมดำมวลหนัก (3 Tilted Gravity Ellipses + Singularity Core)
          for (let k = 0; k < 3; k++) {
            ctx.strokeStyle = k === 0 ? col1 : col2;
            ctx.beginPath();
            ctx.ellipse(0, 0, 10.8, 3.6, t * 0.9 + (k * Math.PI) / 3, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.fillStyle = '#10002b';
          ctx.beginPath(); ctx.arc(0, 0, 3.0, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'CHRONO_EPOCH': {
          // หน้าปัดนาฬิกาดาราจักร 12 ยาม & เข็มสั้นเข็มยาว (12-Tick Sundial Clock + Dual Hands)
          ctx.beginPath(); ctx.arc(0, 0, 9.6, 0, Math.PI * 2); ctx.stroke();
          const ticks = lowQuality ? 6 : 12;
          for (let i = 0; i < ticks; i++) {
            const a = (i * Math.PI * 2) / ticks;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 7.8, Math.sin(a) * 7.8);
            ctx.lineTo(Math.cos(a) * 9.6, Math.sin(a) * 9.6);
            ctx.stroke();
          }
          ctx.strokeStyle = col2;
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t * 2.4) * 7.5, Math.sin(t * 2.4) * 7.5);
          ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t * 0.4) * 5.0, Math.sin(t * 0.4) * 5.0);
          ctx.stroke();
          break;
        }
        case 'INK_LITERATI': {
          // ม้วนคัมภีร์หยกขาวลอยโค้ง & พู่กันประกาศิต (Floating Jade Scroll + Calligraphy Brush)
          ctx.fillStyle = '#f8f9fa';
          ctx.fillRect(-9.5, -9.5, 19.0, 4.2);
          ctx.strokeStyle = col2;
          ctx.strokeRect(-9.5, -9.5, 19.0, 4.2);
          ctx.strokeStyle = acc;
          ctx.beginPath(); ctx.moveTo(-6, -7.4); ctx.lineTo(6, -7.4); ctx.stroke();
          break;
        }
        case 'SOUL_PUPPETRY': {
          // คานไม้เชิดหุ่นเก้าเงา & เส้นด้ายวิญญาณ (Marionette Control Crossbar + Soul Strings)
          ctx.strokeStyle = col1;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(-9.5, -10.5); ctx.lineTo(9.5, -10.5);
          ctx.moveTo(-5.0, -13.0); ctx.lineTo(5.0, -8.0);
          ctx.stroke();
          ctx.lineWidth = 0.9;
          ctx.strokeStyle = acc;
          for (let s = -2; s <= 2; s++) {
            ctx.beginPath(); ctx.moveTo(s * 3.8, -10.5); ctx.lineTo(s * 2.4, 4.0); ctx.stroke();
          }
          break;
        }
        case 'PRIMORDIAL_CHAOS': {
          // โม่หินสวรรค์หุ่นตุ้น 2 ชั้นหมุนบดสวนทาง (Counter-Rotating Hundun Chaos Millstones)
          ctx.beginPath(); ctx.arc(0, 0, 9.8, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = col1;
          ctx.beginPath(); ctx.arc(0, 0, 6.2, t, t + Math.PI); ctx.fill();
          ctx.fillStyle = col2;
          ctx.beginPath(); ctx.arc(0, 0, 6.2, t + Math.PI, t + Math.PI * 2); ctx.fill();
          break;
        }
        case 'SHADOW_SAMURAI': {
          // พระจันทร์สีชาดถูกผ่าครึ่งด้วยคมดาบอิไอ 3 เส้น (Crimson Full Moon Sliced by 3 Iai Slashes)
          ctx.fillStyle = col1;
          ctx.beginPath(); ctx.arc(0, -1.5, 8.2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = col2;
          ctx.lineWidth = 1.7;
          ctx.beginPath();
          ctx.moveTo(-11.5, -5.0); ctx.lineTo(11.5, 1.5);
          ctx.moveTo(-9.5, 3.0); ctx.lineTo(10.5, -6.5);
          ctx.stroke();
          break;
        }
        case 'NINPO_SHADOW': {
          // ดาวกระจายยักษ์ 4 แฉกหมุนหลังแผ่นหลัง (Giant 4-Pointed Shinobi Shuriken Star)
          ctx.fillStyle = col2;
          ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            const a = t * 2.2 + (i * Math.PI) / 4;
            const r = i % 2 === 0 ? 10.6 : 3.2;
            if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
            else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = acc;
          ctx.stroke();
          break;
        }
        case 'NINPO_ELEMENTAL': {
          // วงแหวนกลองไทโกะจักระ 5 ธาตุหลังไหล่ (5 Elemental Chakra Magatama Drums)
          const elCols = ['#ff4d00', '#00b4d8', '#ffd166', '#52b788', '#9d4edd'];
          for (let i = 0; i < 5; i++) {
            const a = -Math.PI * 0.85 + (i * Math.PI * 0.7) / 4;
            const dx = Math.cos(a) * 9.8, dy = Math.sin(a) * 9.8;
            ctx.fillStyle = elCols[i];
            ctx.beginPath(); ctx.arc(dx, dy, 2.3, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = col2;
            ctx.stroke();
          }
          break;
        }
        case 'DIVINE_SUMMONER': {
          // ซุ้มประตูเทวสภา 5 มหาพิภพ & เสาวิหารทองคำ (Golden Pantheon Temple Pillars & Pediment)
          ctx.fillStyle = col1;
          ctx.fillRect(-8.5, -6.5, 2.2, 11.0);
          ctx.fillRect(6.3, -6.5, 2.2, 11.0);
          ctx.beginPath();
          ctx.moveTo(-10.5, -6.5); ctx.lineTo(0, -13.0); ctx.lineTo(10.5, -6.5);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'DIVINE_POSSESSION': {
          // เนตรที่สามเทวะสถิตร่าง & กรอบแขนทิพย์ 4 กร (Vertical Divine Third Eye + 4 Astral Arms)
          ctx.fillStyle = col1;
          ctx.beginPath(); ctx.ellipse(0, -9.5, 2.0, 4.2, 0, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = col2;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(-4, 0); ctx.lineTo(-11.5, -6.5);
          ctx.moveTo(4, 0); ctx.lineTo(11.5, -6.5);
          ctx.moveTo(-4, 3); ctx.lineTo(-11.5, 2.5);
          ctx.moveTo(4, 3); ctx.lineTo(11.5, 2.5);
          ctx.stroke();
          break;
        }
        case 'DIVINE_CHANNELER': {
          // วงแหวนโองการกฎฟ้า & หอกสายฟ้าสวรรค์ (Celestial Law Ring + Vertical Lightning Conduit)
          ctx.beginPath(); ctx.arc(0, 0, 9.2, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = col2;
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.moveTo(0, -14.0); ctx.lineTo(-2.5, -4.0); ctx.lineTo(2.5, -2.0); ctx.lineTo(0, 8.0);
          ctx.stroke();
          break;
        }
        case 'VOID_HERETIC_PACT': {
          // เนตรอวกาศมืด 3 ดวง & ระยางค์เทพอสูรนอกมิติ (Eldritch Abyssal Eyes + Writhing Tentacles)
          for (let i = 0; i < 6; i++) {
            const a = t * 1.2 + (i * Math.PI) / 3;
            ctx.strokeStyle = i % 2 === 0 ? col1 : col2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(Math.cos(a + 0.4) * 6.5, Math.sin(a + 0.4) * 6.5, Math.cos(a) * 11.2, Math.sin(a) * 11.2);
            ctx.stroke();
          }
          ctx.fillStyle = col2;
          ctx.beginPath(); ctx.ellipse(0, -5.5, 3.8, 2.0, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#000';
          ctx.fillRect(-0.6, -7.2, 1.2, 3.4);
          break;
        }
        case 'OCCULT_MAGE': {
          // มงกุฎมหายันต์เก้ายอดบรมครู & ตะกรุดทองแดง (9-Spire Sacred Khmer Yantra Crown)
          ctx.strokeStyle = col1;
          ctx.beginPath();
          for (let s = -2; s <= 2; s++) {
            const sx = s * 3.4;
            const sh = 11.5 - Math.abs(s) * 1.8;
            ctx.moveTo(sx - 1.5, -2.0);
            ctx.lineTo(sx, -sh);
            ctx.lineTo(sx + 1.5, -2.0);
          }
          ctx.stroke();
          ctx.fillStyle = col2;
          ctx.beginPath(); ctx.arc(0, -12.8, 1.5, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'DEVOURING_FLESH': {
          // กระเพาะหลุมดำเขี้ยวอสูรเทาเที่ยกลืนสวรรค์ (Taotie Fang Maw Ring Pulling Inward)
          ctx.fillStyle = '#2b0912';
          ctx.beginPath(); ctx.arc(0, 0, 8.8, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = col2;
          ctx.stroke();
          for (let i = 0; i < 8; i++) {
            const a = -t * 1.5 + (i * Math.PI) / 4;
            ctx.fillStyle = col2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 8.8, Math.sin(a) * 8.8);
            ctx.lineTo(Math.cos(a + 0.2) * 5.2, Math.sin(a + 0.2) * 5.2);
            ctx.lineTo(Math.cos(a - 0.2) * 5.2, Math.sin(a - 0.2) * 5.2);
            ctx.closePath();
            ctx.fill();
          }
          break;
        }
        case 'NETHER_GRAVE': {
          // ป้ายสุสานแม่น้ำเหลืองยมโลก & ลูกไฟวิญญาณสีคราม (Nether Stele + Ghost Will-o'-Wisps)
          ctx.fillStyle = col1;
          ctx.fillRect(-4.2, -9.5, 8.4, 11.0);
          ctx.strokeStyle = col2;
          ctx.strokeRect(-4.2, -9.5, 8.4, 11.0);
          for (let i = 0; i < 4; i++) {
            const a = t * 1.4 + (i * Math.PI) / 2;
            ctx.fillStyle = acc;
            ctx.beginPath(); ctx.arc(Math.cos(a) * 9.5, Math.sin(a) * 6.5 - 2.0, 1.8, 0, Math.PI * 2); ctx.fill();
          }
          break;
        }
        case 'ANCESTRAL_RITUAL': {
          // ศาลป้ายทองคำบรรพชนนิรันดร์ & รัศมีสายเลือด (Golden Ancestral Tablet Shrine)
          ctx.fillStyle = col1;
          ctx.fillRect(-3.6, -11.0, 7.2, 11.5);
          ctx.strokeStyle = acc;
          ctx.strokeRect(-3.6, -11.0, 7.2, 11.5);
          ctx.beginPath(); ctx.arc(0, -2.5, 9.6, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
          break;
        }
        case 'TIDE_VOYAGER': {
          // มงกุฎตรีศูลเก้าสมุทร & เกลียวคลื่นยักษ์ (Nine-Seas Trident Crown + Cresting Wave Ring)
          ctx.strokeStyle = col2;
          ctx.lineWidth = 1.7;
          ctx.beginPath();
          ctx.moveTo(0, 4); ctx.lineTo(0, -12.5);
          ctx.moveTo(-4.5, -5.5); ctx.lineTo(-4.5, -10.5);
          ctx.moveTo(4.5, -5.5); ctx.lineTo(4.5, -10.5);
          ctx.moveTo(-4.5, -5.5); ctx.lineTo(4.5, -5.5);
          ctx.stroke();
          ctx.strokeStyle = col1;
          ctx.beginPath(); ctx.arc(0, 0, 9.2, 0, Math.PI * 2); ctx.stroke();
          break;
        }
        case 'LORE_ARCHIVIST': {
          // ตำราเปิดกาง 4 เล่มหมุนถอดรหัสอักขระสวรรค์ (4 Open Floating Tomes + Glyph Ring)
          ctx.beginPath(); ctx.arc(0, 0, 8.8, 0, Math.PI * 2); ctx.stroke();
          for (let i = 0; i < 4; i++) {
            const a = t * 0.9 + (i * Math.PI) / 2;
            const bx = Math.cos(a) * 9.2, by2 = Math.sin(a) * 9.2;
            ctx.fillStyle = col2;
            ctx.fillRect(bx - 2.6, by2 - 1.8, 5.2, 3.6);
          }
          break;
        }
        case 'FORTUNE_GAMBLER': {
          // กงล้อรูเล็ตต์เดิมพันชะตา 8 ช่องสลับสีทอง-แดง (8-Wedge Wheel of Fortune + Fate Dice)
          ctx.beginPath(); ctx.arc(0, 0, 9.4, 0, Math.PI * 2); ctx.stroke();
          for (let i = 0; i < 8; i++) {
            const a = t * 1.8 + (i * Math.PI) / 4;
            ctx.strokeStyle = i % 2 === 0 ? col1 : col2;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 9.4, Math.sin(a) * 9.4); ctx.stroke();
          }
          break;
        }
        case 'SPIRIT_HUSBANDRY': {
          // เรือนยอดต้นไม้โลกเสิ่นหนง & ดอกไม้ทิพย์ผลิบาน (World-Tree Canopy Branches + Golden Blossoms)
          ctx.strokeStyle = '#8d5b4c';
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.moveTo(0, 6); ctx.lineTo(0, -6);
          ctx.lineTo(-6.5, -11.5); ctx.moveTo(0, -6); ctx.lineTo(6.5, -11.5);
          ctx.stroke();
          ctx.fillStyle = col1;
          ctx.beginPath();
          ctx.arc(-6.5, -11.5, 3.8, 0, Math.PI * 2);
          ctx.arc(0, -12.8, 4.4, 0, Math.PI * 2);
          ctx.arc(6.5, -11.5, 3.8, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'ARENA_GLORY':
        default: {
          // ช่อมงกุฎชัยพฤกษ์เจ้ายุทธจักร & คมทวนคู่ไขว้ (Champion Laurel Wreath + Crossed Halberds)
          ctx.strokeStyle = col2;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(-8.5, 5.5); ctx.lineTo(8.5, -10.5);
          ctx.moveTo(8.5, 5.5); ctx.lineTo(-8.5, -10.5);
          ctx.stroke();
          ctx.strokeStyle = col1;
          ctx.beginPath();
          ctx.arc(0, -1.5, 9.2, Math.PI * 0.7, Math.PI * 2.3);
          ctx.stroke();
          break;
        }
      }
      ctx.restore();
    },

    drawCultivatorRealmHalo(ctx, n, ap, act, by) {
      if (!n || !n.cult) return false;
      const vState = R.resolveCultivationVisualState(n);
      const stg = vState.normStage;
      const sig = vState.sig || R.PATH_VISUAL_SIGNATURES.XIAN;
      const spec = R.REALM_VISUAL_TIERS[stg] || R.REALM_VISUAL_TIERS[1];
      const t = this.t + (n.n || 0) * 0.5;
      const isMeditating = act === 'cultivate' || act === 'breakthrough' || act === 'paidTraining';
      const lowQ = this.effectiveQuality === 'low';

      ctx.save();
      // 1. Initiate Tier (Normalized Stages 1-2): Subtle Breathing Foundation Qi Ring at feet
      if (stg <= 2) {
        if (isMeditating || stg === 2 || this.selected === n.id) {
          const pulse = 0.5 + 0.5 * Math.sin(t * 2.6);
          ctx.strokeStyle = sig.primary || spec.color;
          ctx.globalAlpha = isMeditating ? 0.55 : 0.28 + pulse * 0.14;
          ctx.lineWidth = stg === 2 ? 1.3 : 1.0;
          ctx.beginPath();
          ctx.ellipse(0, 1.2, spec.radius + pulse * 1.2, (spec.radius + pulse * 1.2) * 0.42, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      // 2. Early-Mid Tier (Normalized Stages 3-4): Golden Core (金丹) Orbiting Bead & Path-Tinted Dantian Ring
      else if (stg <= 4) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 3.0);
        ctx.strokeStyle = sig.primary || spec.color;
        ctx.globalAlpha = 0.44 + pulse * 0.18;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, 1.2, spec.radius, spec.radius * 0.42, 0, 0, Math.PI * 2);
        ctx.stroke();
        const orbCount = stg === 4 ? 2 : 1;
        for (let i = 0; i < orbCount; i++) {
          const ang = t * 2.2 + i * Math.PI;
          const ox = Math.cos(ang) * 8.2, oy = -10.5 + by + Math.sin(ang * 1.5) * 3.2;
          ctx.fillStyle = sig.secondary || spec.secondary;
          ctx.globalAlpha = 0.88;
          ctx.beginPath(); ctx.arc(ox, oy, 1.9, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = sig.primary || spec.color;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }
      // 3. Upper-Mid Tier (Normalized Stages 5-6): Nascent Soul / Spirit Severing Back Halo & Path Ground Array
      else if (stg <= 6) {
        const hy = -15.5 + by;
        ctx.strokeStyle = sig.primary || spec.color;
        ctx.globalAlpha = 0.60;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, hy, 7.6, 0, Math.PI * 2);
        ctx.stroke();
        const spokes = stg === 6 ? 8 : 6;
        for (let i = 0; i < spokes; i++) {
          const a = t * 1.2 + (i * Math.PI * 2) / spokes;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 4.8, hy + Math.sin(a) * 4.8);
          ctx.lineTo(Math.cos(a) * 8.6, hy + Math.sin(a) * 8.6);
          ctx.stroke();
        }
        ctx.strokeStyle = sig.secondary || spec.secondary;
        ctx.globalAlpha = 0.46;
        ctx.beginPath();
        ctx.ellipse(0, 1.2, spec.radius, spec.radius * 0.44, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // 4. Penultimate & Apex Ascendant Tiers (Normalized Stages 7-9 / maxStage of any of the 43 Paths)
      else {
        const hy = -16.0 + by;
        const isApex = vState.isApex || stg >= 9;
        // Ground Ascendant Domain Ring
        ctx.strokeStyle = sig.primary || spec.color;
        ctx.globalAlpha = isApex ? 0.68 : 0.50;
        ctx.lineWidth = isApex ? 1.7 : 1.3;
        ctx.beginPath();
        ctx.ellipse(0, 1.2, spec.radius * (isApex ? 1.08 : 0.96), spec.radius * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Bespoke 43-Path Crown / Mandala Silhouette behind cultivator
        ctx.globalAlpha = isApex ? 0.86 : 0.68;
        this.drawPathApexCrownGeometry(ctx, vState.pathId, sig, hy, t, isApex, lowQ);

        // Flowing Celestial Silk Ribbon (披帛) arching gracefully around shoulders
        const wave = Math.sin(t * 2.4) * 2.2;
        ctx.strokeStyle = isApex ? (sig.accent || '#00f5d4') : (sig.secondary || '#ffd740');
        ctx.globalAlpha = isApex ? 0.84 : 0.72;
        ctx.lineWidth = isApex ? 1.9 : 1.6;
        ctx.beginPath();
        ctx.moveTo(-7.5, -9.5 + by);
        ctx.quadraticCurveTo(-11.5, -18.5 + by + wave, 0, -23.5 + by - wave * 0.4);
        ctx.quadraticCurveTo(11.5, -18.5 + by - wave, 7.5, -9.5 + by);
        ctx.stroke();
      }
      ctx.restore();
      return true;
    },

    drawSinglePathMoteShape(ctx, moteShape, mx, my, a, sig) {
      switch (moteShape) {
        case 'jade_sword_feather':
        case 'sword_qi': {
          ctx.beginPath();
          ctx.moveTo(mx, my - 2.8);
          ctx.lineTo(mx, my + 2.8);
          ctx.moveTo(mx - 1.4, my - 1.0);
          ctx.lineTo(mx + 1.4, my - 1.0);
          ctx.stroke();
          break;
        }
        case 'katana_crescent_sakura': {
          ctx.beginPath();
          ctx.arc(mx, my, 2.5, a - 0.9, a + 0.9);
          ctx.stroke();
          break;
        }
        case 'vajra_hex_plate':
        case 'blood_amber':
        case 'gu_centipede_spore':
        case 'miasma_spore': {
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const hk = a + (k * Math.PI) / 3;
            const px = mx + Math.cos(hk) * 2.1, py = my + Math.sin(hk) * 2.1;
            if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'talisman_slip_bagua':
        case 'paper_talisman':
        case 'bagua_glyph':
        case 'bamboo_slip_glyph':
        case 'explosive_kuji_tag':
        case 'ancestral_tablet_incense': {
          ctx.fillRect(mx - 1.4, my - 2.2, 2.8, 4.4);
          ctx.strokeRect(mx - 1.4, my - 2.2, 2.8, 4.4);
          break;
        }
        case 'qin_ripple_wave':
        case 'harmonic_wave':
        case 'cresting_wave_ice': {
          ctx.beginPath();
          ctx.arc(mx, my, 2.2, -0.85, 0.85);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(mx, my, 1.2, -0.85, 0.85);
          ctx.stroke();
          break;
        }
        case 'clockwork_cog':
        case 'spirit_thread': {
          ctx.beginPath();
          ctx.arc(mx, my, 1.8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(mx - 2.5, my); ctx.lineTo(mx + 2.5, my);
          ctx.moveTo(mx, my - 2.5); ctx.lineTo(mx, my + 2.5);
          ctx.stroke();
          break;
        }
        case 'shuriken_four_star':
        case 'astrolabe_star_cross':
        case 'starlight_orb': {
          ctx.beginPath();
          ctx.moveTo(mx, my - 2.6); ctx.lineTo(mx + 0.9, my - 0.9);
          ctx.lineTo(mx + 2.6, my); ctx.lineTo(mx + 0.9, my + 0.9);
          ctx.lineTo(mx, my + 2.6); ctx.lineTo(mx - 0.9, my + 0.9);
          ctx.lineTo(mx - 2.6, my); ctx.lineTo(mx - 0.9, my - 0.9);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'ancient_coin_ingot':
        case 'fate_dice_card': {
          ctx.beginPath();
          ctx.arc(mx, my, 2.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.clearRect(mx - 0.7, my - 0.7, 1.4, 1.4);
          break;
        }
        case 'hourglass_pendulum':
        case 'spatial_prism_shard': {
          ctx.beginPath();
          ctx.moveTo(mx - 1.8, my - 2.2); ctx.lineTo(mx + 1.8, my - 2.2);
          ctx.lineTo(mx - 1.8, my + 2.2); ctx.lineTo(mx + 1.8, my + 2.2);
          ctx.closePath();
          ctx.stroke();
          break;
        }
        case 'blood_crescent_horn':
        case 'primal_claw_fang':
        case 'totem_fang':
        case 'abyss_maw_fang': {
          ctx.beginPath();
          ctx.moveTo(mx - 1.8, my + 1.8);
          ctx.quadraticCurveTo(mx, my - 2.8, mx + 2.0, my + 0.8);
          ctx.stroke();
          break;
        }
        case 'thunder_cloud_snow':
        case 'heaven_edict_lightning':
        case 'element_sparks': {
          ctx.beginPath();
          ctx.moveTo(mx - 1.2, my - 2.5);
          ctx.lineTo(mx + 0.8, my - 0.3);
          ctx.lineTo(mx - 0.8, my + 0.3);
          ctx.lineTo(mx + 1.2, my + 2.5);
          ctx.stroke();
          break;
        }
        case 'command_pennant_seal':
        case 'champion_laurel_halberd':
        case 'sak_yant_takrut':
        case 'luopan_jade_pillar':
        case 'pantheon_pillar_rune': {
          ctx.beginPath();
          ctx.moveTo(mx, my - 2.6);
          ctx.lineTo(mx + 2.2, my + 1.8);
          ctx.lineTo(mx - 2.2, my + 1.8);
          ctx.closePath();
          ctx.fill();
          break;
        }
        default: {
          // Lotus / Leaf / Flame / Eye / Mirror / Needle / Thread organic curve
          ctx.beginPath();
          ctx.ellipse(mx, my, 2.2, 1.2, a, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }
    },

    drawPathSignatureMotes(ctx, n, ap, act, by) {
      if (!n || !n.cult) return false;
      const vState = R.resolveCultivationVisualState(n);
      const stg = vState.normStage;
      const active = act === 'cultivate' || act === 'practice' || act === 'skillDrill' || act === 'fight' || act === 'breakthrough' || (n.cult.stage || 1) >= 2 || stg >= 3 || this.selected === n.id;
      if (!active) return false;

      const sig = vState.sig || R.PATH_VISUAL_SIGNATURES.XIAN;
      const t = this.t + (n.n || 0) * 0.9;
      const lowQ = this.effectiveQuality === 'low';
      const baseCount = vState.isApex ? 6 : vState.isPenultimate ? 5 : stg >= 4 ? 3 : 2;
      const count = lowQ ? Math.max(2, Math.ceil(baseCount * 0.5)) : baseCount;

      ctx.save();
      ctx.globalAlpha = vState.isApex ? 0.88 : 0.76;
      for (let i = 0; i < count; i++) {
        const a = t * 1.7 + (i * Math.PI * 2) / count;
        const rx = (vState.isApex ? 9.2 : 7.5) + (i % 2) * 2.0;
        const mx = Math.cos(a) * rx;
        const my = -9.5 + by + Math.sin(a * 1.3) * 4.5;
        ctx.fillStyle = i % 2 === 0 ? sig.primary : sig.secondary;
        ctx.strokeStyle = i % 2 === 0 ? sig.primary : (sig.accent || sig.secondary);
        ctx.lineWidth = vState.isApex ? 1.25 : 1.0;
        this.drawSinglePathMoteShape(ctx, sig.moteShape, mx, my, a, sig);
      }
      ctx.restore();
      return true;
    },

    drawCompanionPets(ctx, n, p, sc, mount) {
      let pets = Array.isArray(n.pets) ? CULT.activePets(n) : (n.pet && n.pet.active !== false ? [n.pet] : []);
      if (!pets.length && Array.isArray(n.pets)) pets = n.pets.filter(p => p && p.active !== false && !p.dead && !p.injured);
      if (mount) pets = pets.filter(pet => pet !== mount);
      const pet = pets[0];
      if (!pet) return false;
      const t = this.isReducedMotion() ? 0 : this.t + (n.n || 0) * 0.6;
      const face = n.face >= 0 ? 1 : -1;
      const px = -face * 10.5;
      const py = 1.5 + Math.sin(t * 4.2) * 0.9;
      const illustrated = pets.filter(CULT.isCuratedCompanion);
      for (const companion of pets) {
        if (CULT.regionalCompanionSpec(companion.speciesId)) illustrated.push(companion);
      }
      const cap = illustrated.length > 1 && this.resolveQuality() === 'low' ? 1 : 2;
      let drewCompanion = false;
      for (const [i, companion] of illustrated.slice(0, cap).entries()) {
        const stage = companion.growthStage || 1;
        const regional = CULT.regionalCompanionSpec(companion.speciesId);
        if (regional) {
          drewCompanion = R.drawRegionalCompanion(ctx, regional, stage,
            px - face * (5 + i * 22), py + i * 14, t, face, this.isReducedMotion()) || drewCompanion;
          continue;
        }
        const lineage = CULT.lineageCompanionSpec(companion.speciesId);
        const size = [0, .12, .20, .31, .49][stage] * (lineage?.scale || 1) * (i ? .72 : 1);
        drewCompanion = R.drawSovereignCompanion(ctx, companion.speciesId, stage,
          -face * (12 + stage * 7 + i * 27), py + i * 17, size, t, face) || drewCompanion;
      }
      if (drewCompanion) return true;
      const spId = String(pet.speciesId || pet.id || 'SPIRIT_FOX').toUpperCase();
      const sym = pet.awakenedSymbol || pet.fourSymbol || null;
      const col = sym === 'AZURE_DRAGON' ? '#00e5ff'
        : sym === 'VERMILION_BIRD' ? '#ff5252'
        : sym === 'WHITE_TIGER' ? '#f8f9fa'
        : sym === 'BLACK_TORTOISE' ? '#2ec4b6'
        : /FOX|NINE/.test(spId) ? '#ff9ebb'
        : /CRANE|PHOENIX|BIRD|ROC/.test(spId) ? '#90e0ef'
        : /TIGER|WOLF/.test(spId) ? '#ffd166'
        : /TURTLE|TORTOISE/.test(spId) ? '#52b788'
        : '#c77dff';

      ctx.save();
      ctx.translate(px, py);
      // Pet shadow
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath(); ctx.ellipse(0, 1.2, 3.8, 1.6, 0, 0, Math.PI * 2); ctx.fill();

      // Awakened Four-Symbol constellation ring
      if (sym || (pet.tier || pet.stage || 1) >= 4) {
        ctx.strokeStyle = col;
        ctx.globalAlpha = 0.65;
        ctx.lineWidth = 1.0;
        ctx.beginPath(); ctx.ellipse(0, 0.8, 5.2, 2.3, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Miniature Spirit Beast body, head, ears & tail
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(0, -2.5, 3.6, 2.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(face * 2.6, -4.4, 2.2, 0, Math.PI * 2); ctx.fill();
      // Ears / crest
      ctx.beginPath();
      ctx.moveTo(face * 1.8, -6.0); ctx.lineTo(face * 2.4, -8.2); ctx.lineTo(face * 3.2, -6.0);
      ctx.closePath(); ctx.fill();
      // Spirited tail
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-face * 3.2, -2.5);
      ctx.quadraticCurveTo(-face * 5.8, -5.8 + Math.sin(t * 5) * 1.4, -face * 4.5, -7.2);
      ctx.stroke();
      ctx.restore();
      return true;
    },

    /* ---------- Patch v5.0.0 [Pillar 2]: Multi-Layered Weapon Slashes, Elemental Fusion & Heavenly Tribulation ---------- */
    drawGrandFormationWarfareBeams(ctx) {
      const W = this.W;
      if (!W || !W.sect || !g.SECT || !g.SECT.FORMATION_WARFARE) return;
      const fw = W.sect.formationWarfare;
      const stanceId = (fw && fw.activeStance) || 'FIVE_ELEMENT_NURTURE';
      const spec = g.SECT.FORMATION_WARFARE.STANCES[stanceId] || g.SECT.FORMATION_WARFARE.STANCES.FIVE_ELEMENT_NURTURE;
      const t = this.t;
      const cx = 180 * TS, cy = 123 * TS;
      const anchors = [
        [136 * TS, 84 * TS],
        [224 * TS, 84 * TS],
        [136 * TS, 162 * TS],
        [224 * TS, 162 * TS]
      ];
      ctx.save();
      // Linked formation energy beams from Central Bagua Plaza to 4 cardinal formation anchors
      for (let i = 0; i < anchors.length; i++) {
        const [ax, ay] = anchors[i];
        ctx.strokeStyle = i % 2 === 0 ? spec.beamColor : spec.secondaryColor;
        ctx.lineWidth = stanceId === 'SWORD_NET_SLAUGHTER' ? 2.2 : 1.6;
        ctx.globalAlpha = 0.30 + 0.14 * Math.sin(t * 2.8 + i);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ax, ay);
        ctx.stroke();

        // Travelling formation energy pulse along each beam
        const u = (t * 0.45 + i * 0.25) % 1;
        const px = cx + (ax - cx) * u;
        const py = cy + (ay - cy) * u;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.78;
        ctx.beginPath();
        ctx.arc(px, py, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    },

    drawForbiddenVaultAltarSpectacles(ctx) {
      const W = this.W;
      if (!W || !W.sect || !W.sect.forbiddenVault) return;
      const fv = W.sect.forbiddenVault;
      const t = this.t;
      const ax = 180 * TS, ay = 104 * TS;
      const isBlood = fv.policy === 'UNRESTRICTED_BLOOD_CULT' || (fv.bloodlineSurgeUntil && fv.bloodlineSurgeUntil > (W.t || 0));
      ctx.save();
      ctx.strokeStyle = isBlood ? '#ef233c' : '#ffd166';
      ctx.lineWidth = 1.8;
      ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t * 3.2);
      ctx.beginPath();
      ctx.ellipse(ax, ay, 22, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    },

    drawNpcForbiddenTabooVisual(ctx, n, ap, act, by, moving) {
      if (!g.CULT || !n || !n.cult) return;
      const t = this.t + (n.n || 0) * 0.9;
      ctx.save();

      // A. Passive Resonance Constellation Star-Ring (if passiveResonanceState is active or pose === 'forbidden')
      if (g.CULT.PASSIVE_RESONANCE && (n.passiveResonanceState || act === 'forbidden')) {
        const pr = g.CULT.PASSIVE_RESONANCE.resolveNpcConstellation(this.W, n);
        if (pr && pr.spec) {
          const stars = pr.spec.starCount || 6;
          ctx.strokeStyle = pr.spec.color;
          ctx.fillStyle = pr.spec.color;
          ctx.lineWidth = 0.75;
          ctx.globalAlpha = 0.55;
          ctx.beginPath();
          for (let i = 0; i <= stars; i++) {
            const ang = t * 1.1 + (i % stars) * (Math.PI * 2 / stars);
            const sx = Math.cos(ang) * 12.0;
            const sy = -18.5 + by + Math.sin(ang) * 3.2;
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.stroke();
        }
      }

      // B. Forbidden Arts Taboo Chains, Blood-Flame Pillar & Void Halo
      if (g.CULT.FORBIDDEN_ARTS && (act === 'forbidden' || (n.forbiddenArtState && n.forbiddenArtState.sealMode !== 'SEALED_RESTRAINT'))) {
        const fb = g.CULT.FORBIDDEN_ARTS.resolveNpcForbidden(this.W, n);
        if (fb && fb.spec) {
          const arch = fb.archetypeId;
          const col = fb.spec.color || '#ef233c';

          // Crimson-Black Taboo Hexagram & Shattered Seal Chains around the cultivator
          ctx.strokeStyle = col;
          ctx.lineWidth = fb.isFullTaboo ? 1.65 : 1.25;
          ctx.globalAlpha = 0.78;
          ctx.beginPath();
          ctx.ellipse(0, 1 + by * 0.2, 13.5, 5.8, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Crisscrossing Taboo Seal Chains (โซ่ตรวนผนึกต้องห้าม)
          ctx.strokeStyle = fb.isFullTaboo ? '#ff006e' : '#2b2d42';
          ctx.lineWidth = 1.15;
          ctx.beginPath();
          ctx.moveTo(-9.5, -14 + by);
          ctx.lineTo(9.5, -3 + by);
          ctx.moveTo(9.5, -14 + by);
          ctx.lineTo(-9.5, -3 + by);
          ctx.stroke();

          if (arch === 'VOID_TABOO_ANNIHILATION' || arch === 'SOUL_DEVOURING_ABYSS') {
            // Swirling Black-Crimson Void Singularity behind torso
            ctx.fillStyle = 'rgba(25,10,40,0.55)';
            ctx.strokeStyle = col;
            ctx.beginPath();
            ctx.arc(0, -10 + by, 9.2 + Math.sin(t * 5) * 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else {
            // Raging Blood-Essence Flame tongues rising around body
            ctx.fillStyle = col;
            ctx.globalAlpha = 0.65;
            for (let i = 0; i < 4; i++) {
              const ang = t * 3.8 + i * 1.57;
              ctx.beginPath();
              ctx.arc(Math.cos(ang) * 9.5, -8 + by + Math.sin(ang) * 4.5, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
      ctx.restore();
    },

    drawNpcSupportArtVisual(ctx, n, ap, act, by, moving) {
      if (!g.CULT || !g.CULT.SUPPORT_ARTS || !n || !n.cult) return;
      const sup = g.CULT.SUPPORT_ARTS.resolveNpcSupport(this.W, n);
      if (!sup || !sup.spec) return;
      const arch = sup.archetypeId;
      const spec = sup.spec;
      const t = this.t + (n.n || 0) * 0.7;

      ctx.save();
      if (arch === 'CELESTIAL_ZITHER_MELODY') {
        // Expanding Acoustic Zither/Flute Sound-Wave Ripples + Floating Jade Musical Chimes
        for (let r = 0; r < 2; r++) {
          const prog = (t * 0.9 + r * 0.5) % 1;
          ctx.strokeStyle = r === 0 ? '#48cae4' : '#90e0ef';
          ctx.lineWidth = 1.25;
          ctx.globalAlpha = (1 - prog) * 0.72;
          ctx.beginPath();
          ctx.ellipse(0, 1 + by * 0.15, 7 + prog * 11, 3.0 + prog * 4.8, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = '#90e0ef';
        ctx.globalAlpha = 0.85;
        for (let i = 0; i < 3; i++) {
          const ang = t * 2.2 + i * 2.1;
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * 9.5, -10 + by + Math.sin(ang) * 4.0, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (arch === 'ACUPOINT_MERIDIAN_THERAPY') {
        // Golden Acupuncture Needles connected by luminous emerald-gold Qi meridian threads
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 0.9;
        ctx.globalAlpha = 0.65;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const ang = t * 2.5 + (i * Math.PI * 2 / 5);
          const nx = Math.cos(ang) * 10.5;
          const ny = -9 + by + Math.sin(ang) * 5.0;
          if (i === 0) ctx.moveTo(nx, ny);
          else ctx.lineTo(nx, ny);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 1.35;
        ctx.globalAlpha = 0.92;
        for (let i = 0; i < 5; i++) {
          const ang = t * 2.5 + (i * Math.PI * 2 / 5);
          const nx = Math.cos(ang) * 10.5;
          const ny = -9 + by + Math.sin(ang) * 5.0;
          ctx.beginPath();
          ctx.moveTo(nx, ny - 2.5);
          ctx.lineTo(nx, ny + 2.5);
          ctx.stroke();
        }
      } else if (arch === 'QIMEN_BATTLE_BANNER') {
        // Glowing Qimen Tactical Command War Banner planted beside the cultivator
        const bx = -8.5, baseY = 1 + by * 0.2;
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx, baseY);
        ctx.lineTo(bx, baseY - 21);
        ctx.stroke();

        const wave = Math.sin(t * 4.0) * 1.8;
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.moveTo(bx, baseY - 20.5);
        ctx.lineTo(bx - 8.5, baseY - 17.5 + wave);
        ctx.lineTo(bx, baseY - 13.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (arch === 'ALCHEMICAL_INCENSE_MIST') {
        // Swirling Emerald-Amber Spirit-Herb Incense Mist Puffs
        const puffs = [[-6.5, -5 + by, 4.2, 2.2, '#52b788'], [6.5, -6 + by, 4.0, 2.1, '#74c69d'], [0, -3 + by, 5.2, 2.4, '#ffd166']];
        puffs.forEach(([px, py, rx, ry, col], idx) => {
          ctx.fillStyle = col;
          ctx.globalAlpha = 0.42 + 0.12 * Math.sin(t * 3 + idx);
          ctx.beginPath();
          ctx.ellipse(px + Math.sin(t * 2 + idx) * 1.2, py, rx, ry, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (arch === 'DIVINATION_STAR_GUIDANCE') {
        // Rotating Star-Compass Astrolabe Ring
        ctx.strokeStyle = '#c77dff';
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.78;
        ctx.beginPath();
        ctx.ellipse(0, -9 + by, 11.2, 5.2, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // BODHI_CHANT_SANCTUARY: Floating Golden Bodhi Lotus Lantern & Warm Sanctuary Halo
        ctx.strokeStyle = '#ffd166';
        ctx.fillStyle = 'rgba(244,162,97,0.18)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, -10 + by, 11.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    },

    drawNpcDefensiveAegisVisual(ctx, n, ap, act, by, moving) {
      if (!g.CULT || !g.CULT.DEFENSIVE_ARTS || !n || !n.cult) return;
      const df = g.CULT.DEFENSIVE_ARTS.resolveNpcDefense(this.W, n);
      if (!df || !df.spec) return;
      const arch = df.archetypeId;
      const spec = df.spec;
      const t = this.t + (n.n || 0) * 0.6;

      ctx.save();
      if (arch === 'IRON_VAJRA_CARAPACE') {
        // Golden-Bronze Hexagonal Iron Carapace Shield around torso
        ctx.strokeStyle = '#ffd166';
        ctx.fillStyle = 'rgba(255,209,102,0.16)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, -9 + by, 8.8, 10.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (arch === 'TAIJI_SOFT_REDIRECTION') {
        // Rotating Yin-Yang Deflection Ring around the cultivator
        const ang = t * 2.8;
        ctx.strokeStyle = '#48cae4';
        ctx.lineWidth = 1.35;
        ctx.beginPath();
        ctx.arc(0, -9 + by, 10.2, ang, ang + Math.PI * 1.4);
        ctx.stroke();
        ctx.strokeStyle = '#e0fbfc';
        ctx.beginPath();
        ctx.arc(0, -9 + by, 10.2, ang + Math.PI, ang + Math.PI * 2.4);
        ctx.stroke();
      } else if (arch === 'SWORD_CURTAIN_WARD') {
        // Spinning Sword Curtain Blades encircling the body
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 1.25;
        for (let i = 0; i < 4; i++) {
          const a = t * 4.5 + (i * Math.PI / 2);
          const sx = Math.cos(a) * 10.8;
          const sy = -9 + by + Math.sin(a) * 4.2;
          ctx.beginPath();
          ctx.moveTo(sx - 2.5, sy - 3.5);
          ctx.lineTo(sx + 2.5, sy + 3.5);
          ctx.stroke();
        }
      } else if (arch === 'ELEMENTAL_THORN_ARMOR') {
        // Radiating Elemental Spikes around the armor
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 1.25;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + t * 1.5;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 7.0, -9 + by + Math.sin(a) * 7.0);
          ctx.lineTo(Math.cos(a) * 11.5, -9 + by + Math.sin(a) * 11.5);
          ctx.stroke();
        }
      } else if (arch === 'MIRAGE_CICADA_SHELL') {
        // Shimmering Translucent Cicada Wings & Phantom Decoy Silhouette
        ctx.fillStyle = 'rgba(199,125,255,0.22)';
        ctx.strokeStyle = '#c77dff';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.ellipse(-4.5, -9 + by, 3.5, 7.5, -0.35, 0, Math.PI * 2);
        ctx.ellipse(4.5, -9 + by, 3.5, 7.5, 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        // CELESTIAL_AEGIS_DOME: Wide Protective Celestial Dome with Golden Rim
        ctx.fillStyle = 'rgba(114,239,221,0.15)';
        ctx.strokeStyle = '#72efdd';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -2 + by, 13.5, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    },

    drawNpcMantraDharmaAura(ctx, n, ap, act, by, moving) {
      if (!g.CULT || !g.CULT.MANTRA_SYSTEM || !n || !n.cult) return;
      const mr = g.CULT.MANTRA_SYSTEM.resolveNpcMantra(this.W, n);
      if (!mr || !mr.spec) return;
      const spec = mr.spec;
      const arch = mr.archetypeId;
      const isOverdrive = mr.stanceId === 'OVERDRIVE_COMBUSTION';
      const t = this.t + (n.n || 0) * 0.8;

      ctx.save();
      // 1. Base Sacred Mantra Dharma Ring beneath the cultivator
      const radX = isOverdrive ? 15.5 : 12.8;
      const radY = isOverdrive ? 6.8 : 5.6;
      ctx.strokeStyle = spec.color;
      ctx.lineWidth = isOverdrive ? 1.65 : 1.25;
      ctx.globalAlpha = 0.68 + 0.18 * Math.sin(t * 3.5);
      ctx.beginPath();
      ctx.ellipse(0, 1 + by * 0.2, radX, radY, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Archetype-Specific Dharma Manifestation
      if (arch === 'VAJRA_IMMORTAL_BODY_BELL') {
        // Golden Indestructible Vajra Bell (ระฆังทองคุ้มกาย)
        ctx.fillStyle = 'rgba(255,209,102,0.18)';
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(0, -10 + by, 9.5, Math.PI, 0, false);
        ctx.lineTo(10.5, 1 + by);
        ctx.lineTo(-10.5, 1 + by);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (arch === 'SWORD_QI_MERIDIAN') {
        // 6 Orbiting Miniature Sword-Qi Filaments around the body
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 6; i++) {
          const ang = t * 3.2 + (i * Math.PI / 3);
          const sx = Math.cos(ang) * 11.5;
          const sy = -8 + by + Math.sin(ang) * 4.5;
          ctx.beginPath();
          ctx.moveTo(sx, sy - 3.5);
          ctx.lineTo(sx, sy + 3.5);
          ctx.stroke();
        }
      } else if (arch === 'PRIMORDIAL_YANG_FURNACE') {
        // Rising Solar Furnace Flame Petals
        ctx.fillStyle = '#ff6b35';
        for (let i = 0; i < 5; i++) {
          const ang = t * 2.6 + (i * Math.PI * 2 / 5);
          const fx = Math.cos(ang) * 10.5;
          const fy = -3 + by + Math.sin(ang) * 4.0 - ((t * 8 + i) % 5);
          ctx.beginPath();
          ctx.arc(fx, fy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (arch === 'ABYSSAL_FROST_MIRROR') {
        // Six-Pointed Crystalline Frost Mirror Spokes
        ctx.strokeStyle = '#caf0f8';
        ctx.lineWidth = 1.1;
        for (let i = 0; i < 6; i++) {
          const ang = t * 1.4 + (i * Math.PI / 3);
          ctx.beginPath();
          ctx.moveTo(0, 1 + by * 0.2);
          ctx.lineTo(Math.cos(ang) * radX, 1 + by * 0.2 + Math.sin(ang) * radY);
          ctx.stroke();
        }
      } else if (arch === 'EVERGREEN_LONGEVITY_SPRING') {
        // Blooming Emerald Life Orbs rising gently
        ctx.fillStyle = '#52b788';
        for (let i = 0; i < 4; i++) {
          const ang = t * 2.0 + (i * Math.PI / 2);
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * 10, -5 + by + Math.sin(ang) * 3.5, 1.7, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (arch === 'DEVOURING_NETHER_VORTEX') {
        // Swirling Crimson-Purple Abyssal Vortex Spirals
        ctx.strokeStyle = '#ef233c';
        ctx.lineWidth = 1.35;
        ctx.beginPath();
        ctx.ellipse(0, -6 + by, 11.0, 4.8, (t * 2) % Math.PI, 0, Math.PI * 1.5);
        ctx.stroke();
      } else {
        // ASTRAL_VOID_BREATHING: Starlight Constellation Astrolabe Dots
        ctx.fillStyle = '#e0aaff';
        for (let i = 0; i < 6; i++) {
          const ang = -t * 2.2 + (i * Math.PI / 3);
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * 12.0, -7 + by + Math.sin(ang) * 5.0, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    },

    drawQinggongGroundEffects(ctx, n, qgMode, qgInfo, sc, face, by) {
      const t = this.t + (n.n || 0) * 0.7;
      ctx.save();
      if (qgMode === 'WATER_LOTUS_DRIFT') {
        // Concentric emerald-cyan water ripples & blooming jade lotus on the ground/water surface
        for (let r = 0; r < 2; r++) {
          const prog = (t * 1.8 + r * 0.5) % 1;
          ctx.strokeStyle = r === 0 ? '#48cae4' : '#72efdd';
          ctx.lineWidth = 1.1;
          ctx.globalAlpha = (1 - prog) * 0.65;
          ctx.beginPath();
          ctx.ellipse(-face * prog * 6, 1, (5 + prog * 9) * sc, (2.2 + prog * 3.8) * sc, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (qgMode === 'LEAP_BOUND') {
        // Wind launch shockwave ring on the ground + parabolic wind arc
        const jumpProg = Math.abs(Math.sin(t * 3.6));
        ctx.strokeStyle = '#90e0ef';
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.55 * (1 - jumpProg * 0.5);
        ctx.beginPath();
        ctx.ellipse(0, 1, (6 + jumpProg * 6) * sc, (2.4 + jumpProg * 2.2) * sc, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (qgMode === 'SWIFT_STRIDE') {
        // High-speed ground wind dust vortexes behind heels
        ctx.strokeStyle = '#72efdd';
        ctx.lineWidth = 1.15;
        ctx.globalAlpha = 0.62;
        for (let i = 0; i < 3; i++) {
          const ox = -face * (5 + i * 4.5 + ((t * 18) % 4));
          const oy = -2 - i * 2.2;
          ctx.beginPath();
          ctx.moveTo(ox, oy);
          ctx.lineTo(ox - face * 6.5, oy);
          ctx.stroke();
        }
      }
      ctx.restore();
    },

    drawQinggongBodyEffects(ctx, n, ap, qgMode, qgInfo, by, step) {
      const t = this.t + (n.n || 0) * 0.9;
      ctx.save();
      if (qgMode === 'SWORD_FLIGHT') {
        // 1. Large Energized Flying Sword (กระบี่บินเหินเวหา) horizontally beneath the cultivator's boots!
        const hasWpn = !qgInfo || !qgInfo.weaponPenaltyActive;
        const bladeCol = hasWpn ? (ap.weaponColor || '#00f5d4') : '#8ecae6';
        const glowCol = hasWpn ? '#ffd166' : '#48cae4';
        const sy = by + 0.8;
        const time = this.isReducedMotion() ? 0 : t;

        // Trailing sword-qi jet stream behind the flying sword
        for (let i = 1; i <= 4; i++) {
          ctx.strokeStyle = i % 2 === 0 ? bladeCol : glowCol;
          ctx.lineWidth = Math.max(0.8, 2.6 - i * 0.45);
          ctx.globalAlpha = 0.65 - i * 0.12;
          ctx.beginPath();
          ctx.moveTo(-7 - i * 3.5, sy + Math.sin(time * 10 + i) * 0.9);
          ctx.lineTo(-14 - i * 4.8, sy + Math.cos(time * 9 + i) * 1.3);
          ctx.stroke();
        }

        // Outer Qi Aura around the flying sword
        ctx.globalAlpha = 0.35 + 0.15 * Math.sin(time * 8);
        ctx.fillStyle = bladeCol;
        ctx.beginPath();
        ctx.ellipse(1.0, sy, 17.0, 2.9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Crisp Sword Blade Body (pointing forward +X in local facing coords)
        ctx.globalAlpha = 0.96;
        ctx.fillStyle = '#e0fbfc';
        ctx.strokeStyle = bladeCol;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-9.5, sy - 1.25);
        ctx.lineTo(13.2, sy - 1.05);
        ctx.lineTo(19.2, sy);
        ctx.lineTo(13.2, sy + 1.05);
        ctx.lineTo(-9.5, sy + 1.25);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Golden Sword Guard (กระบังกระบี่) & Pommel Tassel
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(-10.2, sy - 2.3, 1.9, 4.6);
        ctx.fillStyle = '#b56576';
        ctx.fillRect(-12.8, sy - 0.8, 2.6, 1.6);
      } else if (qgMode === 'CELESTIAL_LEVITATION') {
        // 2. High-Realm Celestial Levitation (เหาะเหินเดินอากาศเซียนอมตะ): Auspicious Clouds + Golden Dao Halo + Floating Ribbons
        const cy = by + 0.6;
        const pc = (n.cult && PATH_COL[n.cult.path]) || '#ffd166';

        // Radiant Golden-Jade Dao Halo beneath feet
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 1.25;
        ctx.globalAlpha = 0.78;
        ctx.beginPath();
        ctx.ellipse(0, cy + 0.5, 9.8 + Math.sin(t * 4) * 1.2, 3.2, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Swirling Auspicious Immortal Clouds (เมฆามงคลเจ็ดสี)
        const cloudPuffs = [
          [-5.2, cy + 0.8, 4.2, 2.2, '#ffffff'],
          [4.8, cy + 0.7, 4.0, 2.1, '#e0fbfc'],
          [0, cy + 1.1, 5.8, 2.6, '#fff3b0']
        ];
        cloudPuffs.forEach(([px, py, rx, ry, col], idx) => {
          ctx.fillStyle = col;
          ctx.globalAlpha = 0.82;
          ctx.beginPath();
          ctx.ellipse(px + Math.sin(t * 3 + idx) * 0.8, py, rx, ry, 0, 0, Math.PI * 2);
          ctx.fill();
        });

        // Flowing Celestial Silk Ribbon (ผ้าแพรเซียนเหินเวหา)
        ctx.strokeStyle = pc;
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = 0.72;
        ctx.beginPath();
        ctx.moveTo(-3.5, by - 9.5);
        ctx.quadraticCurveTo(-11.5, by - 13.5 + Math.sin(t * 5) * 2.5, -16.5, by - 6.5 + Math.cos(t * 4) * 2.5);
        ctx.stroke();
      } else if (qgMode === 'SHADOW_BLINK') {
        // 3. Phantom Shadow Afterimages (ก้าวพริบตาเงาพราย — 3 trailing shadow clones)
        for (let cloneIdx = 3; cloneIdx >= 1; cloneIdx--) {
          const ox = -cloneIdx * 5.2;
          const oy = by + Math.sin(t * 8 + cloneIdx) * 0.6;
          ctx.fillStyle = cloneIdx % 2 === 0 ? 'rgba(199,125,255,0.26)' : 'rgba(72,202,228,0.24)';
          ctx.beginPath();
          ctx.ellipse(ox, oy - 9.0, 3.8, 6.2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ox, oy - 16.8, 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (qgMode === 'WATER_LOTUS_DRIFT') {
        // 4. Blooming Jade Lotus Petals directly under the feet
        const ly = by + 0.4;
        ctx.fillStyle = 'rgba(114,239,221,0.75)';
        for (let p = -1; p <= 1; p++) {
          ctx.beginPath();
          ctx.ellipse(p * 3.0, ly, 2.4, 1.2, p * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (qgMode === 'LEAP_BOUND') {
        // 5. Upward Wind Vortex Streams around the leaping cultivator
        ctx.strokeStyle = 'rgba(144,224,239,0.72)';
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        ctx.moveTo(-4.5, by - 2);
        ctx.lineTo(-7.5, by + 5.5);
        ctx.moveTo(4.5, by - 2);
        ctx.lineTo(7.5, by + 5.5);
        ctx.stroke();
      }
      ctx.restore();
    },

    drawCombatSlashAndAfterimages(ctx, n, ap, act, armA, by, lunge) {
      const inCombat = act === 'fight' || act === 'practice' || act === 'skillDrill' || (act === 'pair' && n.act?.ctx?.pair?.type === 'spar');
      const movingFast = (!!n.path || !!n.travel) && ((ap && ap.cultStage >= 4) || act === 'fight');

      // 1. Movement Technique Shadow Afterimages (ภาพติดตาวิชาตัวเบา)
      if (movingFast) {
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = (ap && ap.robe) || '#4fc3f7';
        ctx.beginPath();
        ctx.ellipse(-4.5, -9.0 + by, 3.5, 6.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (!inCombat) return false;
      const t = this.t + (n.n || 0) * 0.73;
      const swingPhase = Math.sin(t * 8.5);
      if (act === 'fight' ? (lunge <= 0 && swingPhase < 0.55) : (swingPhase < 0.15)) return false;

      const wType = (ap && ap.weaponType) || 'SWORD';
      const elKey = (ap && ap.weaponElement) || (n.cult && n.cult.element) || 'METAL';
      const pal = R.ELEMENT_VFX_PALETTE[elKey] || R.ELEMENT_VFX_PALETTE.METAL;

      ctx.save();
      if (wType === 'SPEAR' || wType === 'STAFF') {
        // Piercing Dragon Spear Cone & Spiral Thrust
        ctx.strokeStyle = pal.primary;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(4, -11 + by);
        ctx.lineTo(17 + lunge, -15 + by);
        ctx.stroke();
        ctx.strokeStyle = pal.secondary;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(12 + lunge, -13 + by, 4.2, -0.9, 0.9);
        ctx.stroke();
      } else if (wType === 'BOW') {
        // Ranged Bow Release & Arrow Qi Streak
        ctx.strokeStyle = pal.primary;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(6, -11 + by);
        ctx.lineTo(20 + lunge * 1.5, -11 + by);
        ctx.lineTo(16 + lunge * 1.5, -13.5 + by);
        ctx.moveTo(20 + lunge * 1.5, -11 + by);
        ctx.lineTo(16 + lunge * 1.5, -8.5 + by);
        ctx.stroke();
      } else if (wType === 'NEEDLE') {
        // Ranged Silver/Venom Needle Fan Volley
        ctx.strokeStyle = pal.secondary;
        ctx.lineWidth = 1.2;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(6, -11 + by);
          ctx.lineTo(17 + lunge, -11 + by + i * 3.5);
          ctx.stroke();
        }
      } else if (wType === 'FAN') {
        // Ranged Wind-Fan Gale Wave
        ctx.strokeStyle = pal.primary;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(9 + lunge, -11 + by, 8.5, -0.95, 0.95);
        ctx.stroke();
        ctx.strokeStyle = pal.secondary;
        ctx.beginPath();
        ctx.arc(12 + lunge, -11 + by, 6.2, -0.75, 0.75);
        ctx.stroke();
      } else if (wType === 'BRUSH') {
        // Calligraphy Ink Rune Sweep
        ctx.strokeStyle = pal.primary;
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.moveTo(4, -15 + by);
        ctx.quadraticCurveTo(13 + lunge, -11 + by, 8 + lunge, -5 + by);
        ctx.stroke();
      } else if (wType === 'ASTROLABE' || wType === 'ABACUS' || wType === 'ROSARY' || wType === 'FOCUS') {
        // Ranged Focus / Star-Dial / Rosary / Abacus Qi Pulse
        ctx.strokeStyle = pal.primary;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(10 + lunge, -11 + by, 5.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = pal.secondary;
        ctx.beginPath();
        ctx.arc(10 + lunge, -11 + by, 1.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (wType === 'ZITHER') {
        // Expanding Sonic Jade Ripple Rings
        ctx.strokeStyle = '#80ffdb';
        ctx.lineWidth = 1.2;
        const rr = 6 + ((t * 12) % 9);
        ctx.beginPath();
        ctx.arc(8, -11 + by, rr, -1.1, 1.1);
        ctx.stroke();
      } else if (wType === 'FIST_PALM' || wType === 'FIST' || wType === 'CLAW' || !wType) {
        // Golden/Elemental Palm & Claw Shockwave Arc
        ctx.strokeStyle = pal.secondary;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(9 + lunge, -11 + by, 7.5, -0.85, 0.85);
        ctx.stroke();
      } else {
        // 3-Layer Crescent Sword / Saber Qi Slash (外弧光 + 剑气核心 + 残影)
        ctx.strokeStyle = pal.secondary;
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(6 + lunge, -11 + by, 11.5, -1.25, 0.45);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(6.5 + lunge, -11 + by, 10.2, -1.15, 0.35);
        ctx.stroke();
      }
      ctx.restore();
      return true;
    },

    drawElementalCastAndFusionVfx(ctx, fx, p, r) {
      if (!ctx || !fx) return false;
      const fKey = fx.fusion && R.ELEMENT_VFX_PALETTE[fx.fusion] ? fx.fusion : null;
      const eKey = fx.element && R.ELEMENT_VFX_PALETTE[fx.element] ? fx.element : 'FIRE';
      const pal = R.ELEMENT_VFX_PALETTE[fKey || eKey] || R.ELEMENT_VFX_PALETTE.FIRE;

      ctx.save();
      // Dual-color intertwining elemental spiral + ground sigil
      ctx.strokeStyle = pal.primary;
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.ellipse(0, 4, r * 1.08, r * 0.46, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = pal.secondary;
      ctx.lineWidth = 1.4;
      for (let arm = 0; arm < 2; arm++) {
        const a0 = p * Math.PI * 3 + arm * Math.PI;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.78, a0, a0 + 1.8);
        ctx.stroke();
      }
      // Elemental burst motes
      ctx.fillStyle = pal.accent;
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + p * 2.5;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.42 - p * 8, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return true;
    },


    /* ---------- Patch v2.6.0: Tier-Scaled VFX (T5, T4, T3 Ext, T2, T1 Ext, T6 Ext), Subpath Motifs, Ranged Delivery & Equipment/Action VFX ---------- */
    ingestEquipAndActionProcs(a, kind, baseKey, pos, hw, hh, present) {
      if (!a || a.dead || a.away || a.gone || a.hidden || !this.W || !g.SK) return;
      const W = this.W;
      const admit = (subKey, stamp, payload) => {
        const fullKey = subKey + ':' + baseKey;
        present.add(fullKey);
        if (!stamp || this.castSeen.get(fullKey) === stamp) return;
        this.castSeen.set(fullKey, stamp);
        if (!Number.isFinite(payload.t) || W.t - payload.t < 0 || W.t - payload.t > 8) return;
        const px = payload.x, py = payload.y;
        if (!Number.isFinite(px) || !Number.isFinite(py) || Math.abs(px - this.cam.x) > hw + 112 || Math.abs(py - this.cam.y) > hh + 112) return;
        this.castActive.delete(fullKey);
        if (this.castActive.size >= 24) this.castActive.delete(this.castActive.keys().next().value);
        this.castActive.set(fullKey, payload);
      };
      const ox = Number.isFinite(pos.x) ? pos.x * TS : 0, oy = Number.isFinite(pos.y) ? pos.y * TS : 0;
      const resolveCoords = (proc, anchorMode) => {
        const hasTgt = Number.isFinite(proc.targetX) && Number.isFinite(proc.targetY) && Math.hypot((proc.targetX - pos.x) * TS, (proc.targetY - pos.y) * TS) <= 180;
        const useTarget = (anchorMode === 'target' || anchorMode === 'conduit') && hasTgt;
        const x = useTarget ? proc.targetX * TS : ox;
        const y = useTarget ? proc.targetY * TS : oy;
        const origX = Number.isFinite(proc.originX) ? proc.originX * TS : ox;
        const origY = Number.isFinite(proc.originY) ? proc.originY * TS : oy;
        return { x, y, originX: origX, originY: origY, angle: Math.atan2(y - origY, x - origX) };
      };

      if (a.lastItemEffectProc && g.SK.resolveEquipEffectVfx) {
        const p = a.lastItemEffectProc;
        const spec = g.SK.resolveEquipEffectVfx(p.effectId, p.kind);
        if (spec) {
          const anchorMode = p.kind === 'onHit' ? spec.anchor : 'self';
          const c = resolveCoords(p, anchorMode);
          admit('iproc', p.t + '|' + p.itemId + '|' + p.effectId, {
            ownerId: a.id, t: p.t, equipEffectVfx: spec.id, equipSpec: spec, anchorMode,
            x: c.x, y: c.y, originX: c.originX, originY: c.originY, angle: c.angle, start: this.castClock, life: 680
          });
        }
      }
      if (a.lastResonanceTrigger && g.SK.resolveEquipEffectVfx) {
        const p = a.lastResonanceTrigger;
        const spec = g.SK.resolveEquipEffectVfx(p.setId, p.selfBuff ? 'self' : 'target');
        if (spec) {
          const anchorMode = p.selfBuff ? 'self' : 'target';
          const c = resolveCoords(p, anchorMode);
          admit('rproc', p.t + '|' + p.setId, {
            ownerId: a.id, t: p.t, equipEffectVfx: spec.id, equipSpec: spec, anchorMode,
            x: c.x, y: c.y, originX: c.originX, originY: c.originY, angle: c.angle, start: this.castClock, life: 760
          });
        }
      }
      if (a.lastTrinitySurge && g.SK.resolveEquipEffectVfx) {
        const p = a.lastTrinitySurge;
        const spec = g.SK.resolveEquipEffectVfx('EFX_TRINITY_RELIC_SURGE', 'target');
        if (spec) {
          const c = resolveCoords(p, 'target');
          admit('tproc', p.t + '|trinity', {
            ownerId: a.id, t: p.t, equipEffectVfx: spec.id, equipSpec: spec, anchorMode: 'conduit',
            x: c.x, y: c.y, originX: c.originX, originY: c.originY, angle: c.angle, start: this.castClock, life: 1150
          });
        }
      }
      if (a.lastPathGaugeFinisher && g.SK.resolveCombatActionVfx) {
        const p = a.lastPathGaugeFinisher;
        const spec = g.SK.resolveCombatActionVfx('PATH_GAUGE_FINISHER', { path: p.path || (a.cult && a.cult.path) || 'XIAN' });
        if (spec) {
          const c = resolveCoords(p, 'target');
          admit('fin', p.t + '|' + p.gaugeId, {
            ownerId: a.id, t: p.t, combatActionVfx: spec.id, actionSpec: spec,
            x: c.x, y: c.y, originX: c.originX, originY: c.originY, angle: c.angle, start: this.castClock, life: 1100
          });
        }
      }
      if (a.lastDuetSkill && g.SK.resolveCombatActionVfx) {
        const p = a.lastDuetSkill;
        const spec = g.SK.resolveCombatActionVfx('DUET_RESONANCE_STRIKE');
        if (spec) {
          const c = resolveCoords(p, 'conduit');
          admit('duet', p.t + '|' + p.duetId, {
            ownerId: a.id, t: p.t, combatActionVfx: spec.id, actionSpec: spec,
            partnerX: Number.isFinite(p.partnerX) ? p.partnerX * TS : c.originX,
            partnerY: Number.isFinite(p.partnerY) ? p.partnerY * TS : c.originY,
            x: c.x, y: c.y, originX: c.originX, originY: c.originY, angle: c.angle, start: this.castClock, life: 980
          });
        }
      }
      if (a.lastChargedRelease && g.SK.resolveCombatActionVfx) {
        const p = a.lastChargedRelease;
        const spec = g.SK.resolveCombatActionVfx('CHARGED_SKILL_RELEASE');
        if (spec) {
          const c = resolveCoords(p, 'target');
          admit('chrg', p.t + '|' + p.skillId, {
            ownerId: a.id, t: p.t, combatActionVfx: spec.id, actionSpec: spec,
            x: c.x, y: c.y, originX: c.originX, originY: c.originY, angle: c.angle, start: this.castClock, life: 920
          });
        }
      }
      if (a.lastElementalReaction && g.SK.resolveCombatActionVfx) {
        const p = a.lastElementalReaction;
        const spec = g.SK.resolveCombatActionVfx('ELEMENTAL_REACTION_BURST');
        if (spec) {
          const c = resolveCoords(p, 'target');
          admit('elrx', p.t + '|' + p.reactionId, {
            ownerId: a.id, t: p.t, combatActionVfx: spec.id, actionSpec: spec,
            x: c.x, y: c.y, originX: c.originX, originY: c.originY, angle: c.angle, start: this.castClock, life: 820
          });
        }
      }
      if (a.lastMarkDetonation && g.SK.resolveCombatActionVfx) {
        const p = a.lastMarkDetonation;
        const spec = g.SK.resolveCombatActionVfx('MARK_DETONATION_BURST');
        if (spec) {
          const c = resolveCoords(p, 'target');
          admit('mdet', p.t + '|' + p.targetId, {
            ownerId: a.id, t: p.t, combatActionVfx: spec.id, actionSpec: spec,
            x: c.x, y: c.y, originX: c.originX, originY: c.originY, angle: c.angle, start: this.castClock, life: 780
          });
        }
      }
      if (a.lastAcupointStrike && g.SK.resolveCombatActionVfx) {
        const p = a.lastAcupointStrike;
        const spec = g.SK.resolveCombatActionVfx('ACUPOINT_SEAL_STRIKE');
        if (spec) {
          const c = resolveCoords(p, 'target');
          admit('acup', p.t + '|' + p.pointId, {
            ownerId: a.id, t: p.t, combatActionVfx: spec.id, actionSpec: spec,
            x: c.x, y: c.y, originX: c.originX, originY: c.originY, angle: c.angle, start: this.castClock, life: 720
          });
        }
      }
      if (a.lastMantraCombatProc && g.SK.resolveCombatActionVfx) {
        const p = a.lastMantraCombatProc;
        const mapKind = {
          SOLAR_FURNACE_BURN: 'MANTRA_SOLAR_FURNACE_BURN',
          NETHER_VORTEX_SIPHON: 'MANTRA_NETHER_VORTEX_SIPHON',
          EVERGREEN_SPRING_HEAL: 'MANTRA_EVERGREEN_SPRING_HEAL',
          VAJRA_BELL_REFLECT: 'MANTRA_VAJRA_BELL_REFLECT',
          FROST_MIRROR_SHIELD: 'MANTRA_FROST_MIRROR_SHIELD',
          SWORD_QI_COUNTER: 'MANTRA_SWORD_QI_COUNTER'
        }[p.kind] || 'MANTRA_SOLAR_FURNACE_BURN';
        const spec = g.SK.resolveCombatActionVfx(mapKind);
        if (spec) {
          const c = resolveCoords(p, spec.anchor);
          admit('mproc', p.t + '|' + p.kind, {
            ownerId: a.id, t: p.t, combatActionVfx: spec.id, actionSpec: spec,
            x: c.x, y: c.y, originX: c.originX, originY: c.originY, angle: c.angle, start: this.castClock, life: 740
          });
        }
      }
      if (a.lastDefensiveArtProc && g.SK.resolveCombatActionVfx) {
        const p = a.lastDefensiveArtProc;
        const mapKind = p.kind === 'ALLY_AEGIS_INTERCEPT' ? 'DEF_ALLY_AEGIS_INTERCEPT'
          : p.kind === 'TAIJI_REDIRECT' ? 'DEF_TAIJI_REDIRECT'
          : p.kind === 'CICADA_MOLT_SAVE' ? 'DEF_CICADA_MOLT_SAVE'
          : 'DEF_COUNTER_SLASH';
        const spec = g.SK.resolveCombatActionVfx(mapKind);
        if (spec) {
          const c = resolveCoords(p, spec.anchor);
          admit('dproc', p.t + '|' + p.kind, {
            ownerId: a.id, t: p.t, combatActionVfx: spec.id, actionSpec: spec,
            x: c.x, y: c.y, originX: c.originX, originY: c.originY, angle: c.angle, start: this.castClock, life: 740
          });
        }
      }
      if (a.lastSupportArtProc && g.SK.resolveCombatActionVfx) {
        const p = a.lastSupportArtProc;
        const mapKind = /_HEAL$/.test(p.kind || '') ? 'SUP_SANCTUARY_HEAL' : 'SUP_COMMAND_BUFF';
        const spec = g.SK.resolveCombatActionVfx(mapKind);
        if (spec) {
          const c = resolveCoords(p, 'self');
          admit('sproc', p.t + '|' + p.kind, {
            ownerId: a.id, t: p.t, combatActionVfx: spec.id, actionSpec: spec,
            x: c.x, y: c.y, originX: c.originX, originY: c.originY, angle: c.angle, start: this.castClock, life: 720
          });
        }
      }
      if (a.lastForbiddenArtProc && g.SK.resolveCombatActionVfx) {
        const p = a.lastForbiddenArtProc;
        const mapKind = p.kind === 'TABOO_DESPERATION_NOVA' ? 'FORB_DESPERATION_NOVA' : 'FORB_TABOO_STRIKE';
        const spec = g.SK.resolveCombatActionVfx(mapKind);
        if (spec) {
          const c = resolveCoords(p, spec.anchor);
          admit('fproc', p.t + '|' + p.kind, {
            ownerId: a.id, t: p.t, combatActionVfx: spec.id, actionSpec: spec,
            x: c.x, y: c.y, originX: c.originX, originY: c.originY, angle: c.angle, start: this.castClock, life: 880
          });
        }
      }
      if (a.lastPetIntercept && g.SK.resolveCombatActionVfx) {
        const p = a.lastPetIntercept;
        const spec = g.SK.resolveCombatActionVfx('PET_GUARDIAN_INTERCEPT');
        if (spec) {
          admit('petp', p.t + '|' + p.petId, {
            ownerId: a.id, t: p.t, combatActionVfx: spec.id, actionSpec: spec,
            x: ox, y: oy, originX: ox, originY: oy, angle: 0, start: this.castClock, life: 700
          });
        }
      }
      if (a.lastParryCounter && g.SK.resolveCombatActionVfx) {
        const p = a.lastParryCounter;
        const spec = g.SK.resolveCombatActionVfx('SAMURAI_PARRY_COUNTER');
        if (spec) {
          const c = resolveCoords(p, 'target');
          admit('parry', p.t + '|parry', {
            ownerId: a.id, t: p.t, combatActionVfx: spec.id, actionSpec: spec,
            x: c.x, y: c.y, originX: c.originX, originY: c.originY, angle: c.angle, start: this.castClock, life: 720
          });
        }
      }
      if (a.lastShadowCloneIntercept && g.SK.resolveCombatActionVfx) {
        const p = a.lastShadowCloneIntercept;
        const spec = g.SK.resolveCombatActionVfx('SHADOW_CLONE_INTERCEPT');
        if (spec) {
          admit('scln', p.t + '|clone', {
            ownerId: a.id, t: p.t, combatActionVfx: spec.id, actionSpec: spec,
            x: ox, y: oy, originX: ox, originY: oy, angle: 0, start: this.castClock, life: 680
          });
        }
      }
      if (a.lastSubstitutionSave && g.SK.resolveCombatActionVfx) {
        const p = a.lastSubstitutionSave;
        const spec = g.SK.resolveCombatActionVfx('WOOD_SUBSTITUTION_SAVE');
        if (spec) {
          admit('subs', p.t + '|sub', {
            ownerId: a.id, t: p.t, combatActionVfx: spec.id, actionSpec: spec,
            x: ox, y: oy, originX: ox, originY: oy, angle: 0, start: this.castClock, life: 720
          });
        }
      }
    },

    drawUniversalTierGlyph(ctx, spec, p, radius, reduced, low = false, tier = 4, angle = 0, arch = null) {
      if (!ctx || !spec) return false;
      const budget = (g.SK && g.SK.NONLEGENDARY_VFX_BUDGET && g.SK.NONLEGENDARY_VFX_BUDGET[tier]) || { rMin: 16, rMax: 29, marks: 6 };
      const q = reduced ? 0.5 : clamp(p, 0, 1);
      const r = clamp(radius, 1, budget.rMax);
      const shapeId = Number.isFinite(spec.shapeId) ? spec.shapeId : 0;
      const motifGroup = shapeId % 12;
      const variantIdx = Math.floor(shapeId / 12);
      const maxMarks = low ? Math.max(2, Math.floor(budget.marks * 0.6)) : budget.marks;
      const nPetals = Math.min(maxMarks, 3 + (shapeId % 5));
      const beat = Math.sin(q * Math.PI);
      const turn = reduced ? 0 : (q - 0.5) * 0.16;

      ctx.save();
      ctx.scale(r, r);
      if (spec.motion === 'sweep') ctx.rotate(angle + turn);
      else if (spec.motion === 'rise') ctx.translate(0, -beat * 0.06);
      else if (spec.motion === 'weave') ctx.scale(1, 1 - beat * 0.05);
      else if (spec.motion === 'gather') ctx.scale(0.92 + beat * 0.08, 0.92 + beat * 0.08);
      else if (spec.motion === 'pulse') ctx.scale(0.95 + beat * 0.05, 0.95 + beat * 0.05);
      else if (angle) ctx.rotate(angle);

      ctx.strokeStyle = spec.primary || '#9fd2e3';
      ctx.fillStyle = spec.accent || spec.primary || '#e0f4f8';
      ctx.lineWidth = (tier >= 5 ? 1.38 : tier === 4 ? 1.28 : 1.18) / r;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const line = (pts, close = false) => {
        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
          if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]);
          else ctx.lineTo(pts[i][0], pts[i][1]);
        }
        if (close) ctx.closePath();
        ctx.stroke();
      };
      const oval = (x, y, rx, ry, rot = 0) => {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
        ctx.stroke();
      };
      const vOff = +(0.04 * (variantIdx + 1)).toFixed(3);

      switch (motifGroup) {
        case 0: {
          // Crescent Sword / Saber Qi Arc + Inner Blade Spine
          ctx.beginPath();
          ctx.arc(0, 0, 0.72 + vOff * 0.4, -1.15 - vOff, 1.05 + vOff);
          ctx.stroke();
          line([[-0.72, 0.18 - vOff], [0.76, -0.18 + vOff], [0.48, -0.34]]);
          break;
        }
        case 1: {
          // Piercing Spear / Arrow / Lightning Conduit
          line([[-0.82, 0], [0.78, 0], [0.46, -0.22 - vOff], [0.78, 0], [0.46, 0.22 + vOff]]);
          oval(-0.15 + vOff, 0, 0.26, 0.42);
          break;
        }
        case 2: {
          // Blooming Lotus / Palm Shockwave Petals
          for (let i = 0; i < nPetals; i++) {
            const a = (i * Math.PI * 2) / nPetals + vOff;
            oval(Math.cos(a) * 0.48, Math.sin(a) * 0.42, 0.24, 0.11, a);
          }
          oval(0, 0, 0.22 + vOff * 0.3, 0.22 + vOff * 0.3);
          break;
        }
        case 3: {
          // Protective Dome / Bell / Carapace Bastion
          line([[-0.64, 0.48], [-0.64, -0.38 - vOff], [0, -0.78], [0.64, -0.38 - vOff], [0.64, 0.48]], true);
          oval(0, 0.48, 0.68, 0.16);
          break;
        }
        case 4: {
          // Taiji / Samsara / Yin-Yang Dual Swirl
          ctx.beginPath();
          ctx.arc(0, 0, 0.68, vOff, Math.PI + vOff);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, 0.68, Math.PI + vOff, Math.PI * 2 + vOff);
          ctx.stroke();
          oval(-0.24, -0.12 + vOff * 0.5, 0.12, 0.12);
          oval(0.24, 0.12 - vOff * 0.5, 0.12, 0.12);
          break;
        }
        case 5: {
          // Bagua / Star Array / Astrolabe Polygon
          const pts = [];
          const sides = 4 + (variantIdx % 5);
          for (let i = 0; i < sides; i++) {
            const a = (i * Math.PI * 2) / sides + vOff;
            pts.push([Math.cos(a) * 0.72, Math.sin(a) * 0.72]);
          }
          line(pts, true);
          line([[-0.38, 0], [0.38, 0]]);
          line([[0, -0.38], [0, 0.38]]);
          break;
        }
        case 6: {
          // Beast Fang / Claw / Totem Horns
          for (const d of [-1, 1]) {
            line([[d * 0.68, -0.62 - vOff], [d * 0.28, -0.15], [d * 0.74, 0.52 + vOff]]);
          }
          line([[-0.32, -0.18], [0, 0.28 + vOff], [0.32, -0.18]], true);
          break;
        }
        case 7: {
          // Zither Sonic Waves / Dream Silk Ribbons
          for (let i = -1; i <= 1; i++) {
            const y = i * (0.26 + vOff * 0.3);
            ctx.beginPath();
            ctx.moveTo(-0.78, y);
            ctx.bezierCurveTo(-0.28, y - 0.28, 0.28, y + 0.28, 0.78, y);
            ctx.stroke();
          }
          break;
        }
        case 8: {
          // Cauldron / Furnace / Alchemy Gourd
          line([[-0.56, -0.22], [-0.44, 0.52], [0.44, 0.52], [0.56, -0.22]], true);
          oval(0, -0.22, 0.56, 0.15);
          line([[0, -0.38], [-0.18, -0.68 - vOff], [0.18, -0.68 - vOff]], true);
          break;
        }
        case 9: {
          // Marionette Threads / Karma Chains / Venom Web
          line([[-0.76, -0.62], [0.76, -0.62]]);
          for (let i = -1; i <= 1; i++) {
            const x = i * (0.46 + vOff * 0.2);
            line([[x, -0.62], [-x * 0.4, 0.05], [x * 0.85, 0.58]]);
          }
          break;
        }
        case 10: {
          // Command War Banner / Calligraphy Scroll / Edict Pillar
          line([[-0.52, 0.68], [-0.52, -0.72], [0.56, -0.52 - vOff], [0.22, -0.18], [-0.52, -0.24]]);
          oval(0.18, 0.28, 0.28 + vOff * 0.3, 0.18);
          break;
        }
        default: {
          // Void Rift / Gravity Singularity / Sundial Prism
          line([[-0.76, 0.48], [-0.18, 0.08], [0.16, -0.24], [0.76, -0.62 - vOff]]);
          oval(0, 0, 0.64, 0.26 + vOff * 0.3, 0.45);
          oval(0, 0, 0.64, 0.26 + vOff * 0.3, -0.45);
          break;
        }
      }

      // Unique family signature mark (guarantees 100% distinct ops per shapeId in both High & Low quality)
      const sigAngle = ((shapeId * 0.47) % (Math.PI * 2));
      const sx = +(Math.cos(sigAngle) * (0.52 + (shapeId % 7) * 0.04)).toFixed(3);
      const sy = +(Math.sin(sigAngle) * (0.44 + (shapeId % 5) * 0.04)).toFixed(3);
      ctx.strokeStyle = spec.accent || spec.primary;
      line([[sx, sy], [+(sx * 1.18).toFixed(3), +(sy * 1.18).toFixed(3)]]);

      if (!low && tier >= 4) {
        ctx.globalAlpha *= 0.56;
        ctx.beginPath();
        ctx.arc(0, 0, 0.88, 0.2 + (reduced ? 0 : q * 0.25), 1.2 + (reduced ? 0 : q * 0.25));
        ctx.stroke();
      }
      ctx.restore();
      return true;
    },

    drawT5FamilyGlyph(ctx, key, p, radius, reduced, low = false) {
      const spec = g.SK && g.SK.T5_VFX_FAMILIES && g.SK.T5_VFX_FAMILIES[key];
      if (!ctx || !spec) return false;
      const b = g.SK.NONLEGENDARY_VFX_BUDGET[5];
      return this.drawUniversalTierGlyph(ctx, spec, p, clamp(radius, 1, b.rMax), reduced, low, 5);
    },

    drawT5SkillVfx(ctx, fx, p, reduced, full = true) {
      const key = fx.t5Vfx || (g.SK && g.SK.TECH_TO_T5_VFX && g.SK.TECH_TO_T5_VFX[fx.techId]);
      const spec = g.SK && g.SK.T5_VFX_FAMILIES && g.SK.T5_VFX_FAMILIES[key];
      if (!ctx || !spec) return false;
      const q = reduced ? 0.5 : clamp(p, 0, 1);
      const low = this.resolveQuality() === 'low';
      const b = g.SK.NONLEGENDARY_VFX_BUDGET[5];
      const radius = full ? (reduced ? 35.5 : b.rMin + (b.rMax - b.rMin) * Math.sin(Math.min(1, q / 0.65) * Math.PI / 2)) : 16;
      ctx.save();
      ctx.globalAlpha *= 1 - clamp((q - 0.76) / 0.24, 0, 1);
      this.drawT5FamilyGlyph(ctx, key, q, radius, reduced, low);
      if (full) {
        const wave = Math.sin(clamp((q - 0.24) / 0.46, 0, 1) * Math.PI);
        const supportive = ['heal', 'support', 'buff', 'harmonize', 'guard', 'shield', 'counter', 'evade'].includes(fx.arch);
        ctx.strokeStyle = spec.accent;
        ctx.lineWidth = 1.25;
        ctx.globalAlpha *= 0.58 * wave;
        ctx.beginPath();
        if (supportive) {
          ctx.moveTo(-radius * 0.48, radius * 0.18);
          ctx.quadraticCurveTo(0, -radius * 0.52, radius * 0.48, radius * 0.18);
        } else {
          ctx.rotate(Number.isFinite(fx.angle) ? fx.angle : 0);
          ctx.moveTo(-radius * 0.62, 0);
          ctx.lineTo(radius * 0.72, 0);
          ctx.lineTo(radius * 0.50, -3.5);
        }
        ctx.stroke();
      }
      ctx.restore();
      return true;
    },

    drawT4FamilyGlyph(ctx, key, p, radius, reduced, low = false) {
      const spec = g.SK && g.SK.T4_VFX_FAMILIES && g.SK.T4_VFX_FAMILIES[key];
      if (!ctx || !spec) return false;
      const b = g.SK.NONLEGENDARY_VFX_BUDGET[4];
      return this.drawUniversalTierGlyph(ctx, spec, p, clamp(radius, 1, b.rMax), reduced, low, 4);
    },

    drawT4SkillVfx(ctx, fx, p, reduced, full = true) {
      const key = fx.t4Vfx || (g.SK && g.SK.TECH_TO_T4_VFX && g.SK.TECH_TO_T4_VFX[fx.techId]);
      const spec = g.SK && g.SK.T4_VFX_FAMILIES && g.SK.T4_VFX_FAMILIES[key];
      if (!ctx || !spec) return false;
      const q = reduced ? 0.5 : clamp(p, 0, 1);
      const low = this.resolveQuality() === 'low';
      const b = g.SK.NONLEGENDARY_VFX_BUDGET[4];
      const radius = full ? (reduced ? 26.5 : b.rMin + (b.rMax - b.rMin) * Math.sin(Math.min(1, q / 0.65) * Math.PI / 2)) : 13;
      ctx.save();
      ctx.globalAlpha *= 1 - clamp((q - 0.76) / 0.24, 0, 1);
      this.drawT4FamilyGlyph(ctx, key, q, radius, reduced, low);
      if (full) {
        const wave = Math.sin(clamp((q - 0.24) / 0.46, 0, 1) * Math.PI);
        const supportive = ['heal', 'support', 'buff', 'harmonize', 'guard', 'shield', 'counter', 'evade'].includes(fx.arch);
        ctx.strokeStyle = spec.accent;
        ctx.lineWidth = 1.15;
        ctx.globalAlpha *= 0.54 * wave;
        ctx.beginPath();
        if (supportive) {
          ctx.moveTo(-radius * 0.45, radius * 0.16);
          ctx.quadraticCurveTo(0, -radius * 0.48, radius * 0.45, radius * 0.16);
        } else {
          ctx.rotate(Number.isFinite(fx.angle) ? fx.angle : 0);
          ctx.moveTo(-radius * 0.58, 0);
          ctx.lineTo(radius * 0.68, 0);
          ctx.lineTo(radius * 0.46, -3.0);
        }
        ctx.stroke();
      }
      ctx.restore();
      return true;
    },

    drawT3ExtSkillVfx(ctx, id, p, radius, reduced, angle = 0, arch = null) {
      if (g.SK && g.SK.T3_VFX_CATALOG && g.SK.T3_VFX_CATALOG[id]) {
        return this.drawT3SkillVfx(ctx, id, p, radius, reduced, angle, arch);
      }
      const spec = g.SK && g.SK.T3_EXT_VFX_CATALOG && g.SK.T3_EXT_VFX_CATALOG[id];
      if (!ctx || !spec) return false;
      const low = this.resolveQuality && this.resolveQuality() === 'low';
      const b = g.SK.NONLEGENDARY_VFX_BUDGET[3];
      return this.drawUniversalTierGlyph(ctx, spec, p, clamp(radius, 1, b.rMax), reduced, low, 3, angle, arch);
    },

    drawT2SkillVfx(ctx, id, p, radius, reduced, angle = 0, arch = null) {
      const spec = g.SK && g.SK.T2_VFX_FAMILIES && g.SK.T2_VFX_FAMILIES[id];
      if (!ctx || !spec) return false;
      const low = this.resolveQuality && this.resolveQuality() === 'low';
      const b = g.SK.NONLEGENDARY_VFX_BUDGET[2];
      return this.drawUniversalTierGlyph(ctx, spec, p, clamp(radius, 1, b.rMax), reduced, low, 2, angle, arch);
    },

    drawT1ExtSkillVfx(ctx, id, p, radius, reduced, angle = 0, harmful = false) {
      if (g.SK && g.SK.COMMON_VFX_CATALOG && g.SK.COMMON_VFX_CATALOG[id]) {
        return this.drawCommonSkillVfx(ctx, id, p, radius, reduced, angle, harmful);
      }
      const spec = g.SK && g.SK.T1_EXT_VFX_CATALOG && g.SK.T1_EXT_VFX_CATALOG[id];
      if (!ctx || !spec) return false;
      const low = this.resolveQuality && this.resolveQuality() === 'low';
      const b = g.SK.NONLEGENDARY_VFX_BUDGET[1];
      return this.drawUniversalTierGlyph(ctx, spec, p, clamp(radius, 1, b.rMax), reduced, low, 1, angle);
    },

    drawT6ExtFamilyGlyph(ctx, key, p, radius, reduced, low = false) {
      if (g.SK && g.SK.T6_VFX_FAMILIES && g.SK.T6_VFX_FAMILIES[key]) {
        return this.drawT6FamilyGlyph(ctx, key, p, radius, reduced, low);
      }
      const spec = g.SK && g.SK.T6_EXT_VFX_FAMILIES && g.SK.T6_EXT_VFX_FAMILIES[key];
      if (!ctx || !spec) return false;
      const b = g.SK.NONLEGENDARY_VFX_BUDGET[6];
      return this.drawUniversalTierGlyph(ctx, spec, p, clamp(radius, 1, b.rMax), reduced, low, 6);
    },

    drawT6ExtSkillVfx(ctx, fx, p, reduced, full = true) {
      const key = fx.t6ExtVfx || (g.SK && g.SK.TECH_TO_T6_EXT_VFX && g.SK.TECH_TO_T6_EXT_VFX[fx.techId]);
      if (g.SK && g.SK.T6_VFX_FAMILIES && g.SK.T6_VFX_FAMILIES[key]) {
        return this.drawT6SkillVfx(ctx, { ...fx, t6Vfx: key }, p, reduced, full);
      }
      const spec = g.SK && g.SK.T6_EXT_VFX_FAMILIES && g.SK.T6_EXT_VFX_FAMILIES[key];
      if (!ctx || !spec) return false;
      const q = reduced ? 0.5 : clamp(p, 0, 1);
      const low = this.resolveQuality() === 'low';
      const b = g.SK.NONLEGENDARY_VFX_BUDGET[6];
      const radius = full ? (reduced ? 44.5 : b.rMin + (b.rMax - b.rMin) * Math.sin(Math.min(1, q / 0.65) * Math.PI / 2)) : 18;
      ctx.save();
      ctx.globalAlpha *= 1 - clamp((q - 0.76) / 0.24, 0, 1);
      this.drawT6ExtFamilyGlyph(ctx, key, q, radius, reduced, low);
      ctx.restore();
      return true;
    },

    drawSubpathMotifOverlay(ctx, fx, p, radius, reduced) {
      const motif = fx && fx.subpathMotif;
      if (!ctx || !motif) return false;
      const tier = clamp(fx.tier || motif.tier || 1, 1, 7);
      const budget = (g.SK && g.SK.NONLEGENDARY_VFX_BUDGET && g.SK.NONLEGENDARY_VFX_BUDGET[tier]) || { rMax: 20 };
      const maxAllowed = budget.rMax * (motif.tierScale || 0.65);
      const r = Math.min(radius, maxAllowed);
      const q = reduced ? 0.5 : clamp(p, 0, 1);
      ctx.save();
      ctx.scale(r, r);
      ctx.strokeStyle = motif.primary || '#9ec4d6';
      ctx.fillStyle = motif.accent || '#ddecf2';
      ctx.lineWidth = 1.05 / Math.max(1, r);
      ctx.globalAlpha *= 0.46;
      const idx = (motif.shapeId || 0) % 6;
      ctx.beginPath();
      if (idx === 0) {
        ctx.arc(0, 0, 0.52, -0.8 + (reduced ? 0 : q * 0.4), 0.8 + (reduced ? 0 : q * 0.4));
      } else if (idx === 1) {
        ctx.moveTo(-0.45, 0); ctx.lineTo(0, -0.45); ctx.lineTo(0.45, 0); ctx.lineTo(0, 0.45); ctx.closePath();
      } else if (idx === 2) {
        ctx.ellipse(0, 0, 0.56, 0.24, reduced ? 0.3 : q * 0.6, 0, Math.PI * 2);
      } else if (idx === 3) {
        ctx.moveTo(-0.48, 0.28); ctx.lineTo(0, -0.52); ctx.lineTo(0.48, 0.28); ctx.closePath();
      } else if (idx === 4) {
        ctx.arc(0, -0.1, 0.46, Math.PI, Math.PI * 2);
      } else {
        ctx.moveTo(-0.42, -0.42); ctx.lineTo(0.42, 0.42); ctx.moveTo(-0.42, 0.42); ctx.lineTo(0.42, -0.42);
      }
      ctx.stroke();
      ctx.restore();
      return true;
    },

    drawRangedAndSpatialDeliveryVfx(ctx, fx, p, reduced) {
      if (!ctx || !fx || !Number.isFinite(fx.originX) || !Number.isFinite(fx.originY) || !Number.isFinite(fx.x) || !Number.isFinite(fx.y)) return false;
      const q = reduced ? 0.5 : clamp(p, 0, 1);
      const fade = Math.min(1, (1 - q) * 2.6);
      const sx = fx.originX, sy = fx.originY - 7;
      const tx = fx.x, ty = fx.y - 7;
      const dx = tx - sx, dy = ty - sy, dist = Math.hypot(dx, dy);
      let drew = false;

      // 1. Equipment-Granted Active Skill Crest at Caster Origin
      if (fx.fromEquipmentGrant) {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.globalAlpha = fade * 0.68;
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.ellipse(0, 6, 9.5, 4.2, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        drew = true;
      }

      // 2. Hybrid Offensive Harmonize Wave (Caster -> Hostile TargetPoints)
      if (fx.castRole === 'HYBRID_HARMONIZE' && Array.isArray(fx.targetPoints)) {
        for (const pt of fx.targetPoints) {
          if (!pt || pt.team !== false) continue;
          const hdx = pt.x - tx, hdy = (pt.y - 7) - ty;
          if (Math.hypot(hdx, hdy) < 6) continue;
          const prog = reduced ? 0.6 : clamp(q * 1.4, 0, 1);
          const wx = tx + hdx * prog, wy = ty + hdy * prog;
          ctx.save();
          ctx.globalAlpha = fade * 0.72;
          ctx.strokeStyle = '#8ec7c2';
          ctx.lineWidth = 1.35;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.quadraticCurveTo((tx + wx) * 0.5, (ty + wy) * 0.5 - 8, wx, wy);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(pt.x, pt.y - 7, 6 + prog * 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          drew = true;
        }
      }

      if (dist < 14) return drew;
      const tier = clamp(fx.tier || 1, 1, 7);
      const strokeW = 1.0 + tier * 0.14;

      // 3. Gap-Closer / Blink / Charge Dash Trail from Origin to Target
      if (fx.isGapCloser) {
        ctx.save();
        ctx.globalAlpha = fade * 0.65;
        ctx.strokeStyle = fx.arch === 'blink' ? '#b39ddb' : '#90e0ef';
        ctx.lineWidth = strokeW;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        for (let i = 1; i <= 2; i++) {
          const u = i / 3;
          ctx.beginPath();
          ctx.ellipse(sx + dx * u, sy + dy * u, 3.2, 5.4, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
        return true;
      }

      // 4. Ranged Projectile / Sonic Wave / Star Beam Travel from Origin to Target
      if (fx.isRanged) {
        const prog = reduced ? 0.65 : clamp(q * 1.55, 0, 1);
        const px = sx + dx * prog, py = sy + dy * prog;
        const ang = Math.atan2(dy, dx);
        ctx.save();
        ctx.globalAlpha = fade * 0.76;
        ctx.strokeStyle = '#a8dadc';
        ctx.fillStyle = '#f1faee';
        ctx.lineWidth = strokeW;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.translate(px, py);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(-6, -2.5);
        ctx.lineTo(4, 0);
        ctx.lineTo(-6, 2.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        return true;
      }
      return drew;
    },

    drawEquipEffectVfx(ctx, fx, p, reduced) {
      const spec = fx.equipSpec || (g.SK && g.SK.EQUIP_EFFECT_VFX_CATALOG && g.SK.EQUIP_EFFECT_VFX_CATALOG[fx.equipEffectVfx]);
      if (!ctx || !spec) return false;
      const q = reduced ? 0.5 : clamp(p, 0, 1);
      const r = reduced ? 18 : 14 + q * 8;
      ctx.save();
      if ((fx.anchorMode === 'conduit' || fx.anchorMode === 'target') && Number.isFinite(fx.originX) && Number.isFinite(fx.originY)) {
        const odx = fx.originX - fx.x, ody = fx.originY - fx.y;
        if (Math.hypot(odx, ody) > 10) {
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 1.25;
          ctx.globalAlpha *= 0.62;
          ctx.beginPath();
          ctx.moveTo(odx, ody);
          ctx.quadraticCurveTo(odx * 0.5, ody * 0.5 - 9, 0, 0);
          ctx.stroke();
        }
      }
      this.drawUniversalTierGlyph(ctx, spec, q, r, reduced, this.resolveQuality() === 'low', 4, fx.angle || 0);
      ctx.restore();
      return true;
    },

    drawCombatActionVfx(ctx, fx, p, reduced) {
      const spec = fx.actionSpec || (g.SK && g.SK.COMBAT_ACTION_VFX_CATALOG && g.SK.COMBAT_ACTION_VFX_CATALOG[fx.combatActionVfx]);
      if (!ctx || !spec) return false;
      const q = reduced ? 0.5 : clamp(p, 0, 1);
      const isFinisher = String(spec.id || '').startsWith('FINISHER_') || spec.id === 'FORB_DESPERATION_NOVA';
      const r = isFinisher ? (reduced ? 30 : 24 + q * 11) : (reduced ? 20 : 16 + q * 8);
      ctx.save();
      if ((spec.anchor === 'conduit' || spec.anchor === 'target') && Number.isFinite(fx.originX) && Number.isFinite(fx.originY)) {
        const odx = fx.originX - fx.x, ody = fx.originY - fx.y;
        if (Math.hypot(odx, ody) > 10) {
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = isFinisher ? 1.65 : 1.25;
          ctx.globalAlpha *= 0.68;
          ctx.beginPath();
          ctx.moveTo(odx, ody);
          ctx.quadraticCurveTo(odx * 0.5, ody * 0.5 - 12, 0, 0);
          ctx.stroke();
        }
      }
      if (Number.isFinite(fx.partnerX) && Number.isFinite(fx.partnerY)) {
        const pdx = fx.partnerX - fx.x, pdy = fx.partnerY - fx.y;
        if (Math.hypot(pdx, pdy) > 10) {
          ctx.strokeStyle = spec.accent || spec.primary;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(pdx, pdy);
          ctx.quadraticCurveTo(pdx * 0.5, pdy * 0.5 + 12, 0, 0);
          ctx.stroke();
        }
      }
      this.drawUniversalTierGlyph(ctx, spec, q, r, reduced, this.resolveQuality() === 'low', isFinisher ? 5 : 4, fx.angle || 0);
      ctx.restore();
      return true;
    },

    drawHeavenlyTribulationSkyGlaze(ctx) {
      const W = this.W;
      if (!W || !W.sect || !Array.isArray(W.sect.activeTribulations) || !W.sect.activeTribulations.length) return false;
      const activeList = W.sect.activeTribulations.filter(x => x && x.active);
      if (!activeList.length) return false;
      const lead = activeList[0];
      const w = this.vw || 412, h = this.vh || 860, t = this.t;
      ctx.save();
      if (lead.phase === 'GATHERING') {
        // Phase 1: Sect sky dims ominously as tribulation clouds gather
        ctx.fillStyle = 'rgba(12, 8, 28, 0.24)';
        ctx.fillRect(0, 0, w, h);
      } else if (lead.phase === 'STRIKING') {
        // Phase 2: Dark storm glaze + periodic lightning flash across the sect sky
        ctx.fillStyle = 'rgba(18, 10, 38, 0.30)';
        ctx.fillRect(0, 0, w, h);
        const flash = Math.max(0, Math.sin(t * 16));
        if (flash > 0.72) {
          ctx.fillStyle = 'rgba(255, 245, 210, ' + ((flash - 0.72) * 0.55).toFixed(3) + ')';
          ctx.fillRect(0, 0, w, h);
        }
      } else if (lead.phase === 'ASCENSION') {
        // Phase 3 (Success): Golden celestial dawn glaze
        ctx.fillStyle = 'rgba(255, 215, 64, 0.14)';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();
      return true;
    },

    drawBreakthroughTribulationVfx(ctx, n, p, sc) {
      if (!ctx || !n || !p) return false;
      const x = p.x * TS, y = p.y * TS;
      const st = n.tribulationState || null;
      const curStg = (n.cult && n.cult.stage) || 1;
      const targetStage = (st && st.targetStage) || clamp(curStg + 1, 1, 9);
      const phase = (st && st.phase) || ((n.fx && /เสาแสง|สำเร็จขั้น/.test(n.fx.text || '')) ? 'ASCENSION' : (n.fx && /ย้อนกลับ|ควันดำ/.test(n.fx.text || '')) ? 'BACKFIRE' : 'STRIKING');
      const pKey = (n.cult && n.cult.path) || 'QI';
      const pStyle = (g.CULT && g.CULT.TRIBULATION && g.CULT.TRIBULATION.resolvePathStyle)
        ? g.CULT.TRIBULATION.resolvePathStyle(pKey)
        : {
            id: 'DAO_FIRE_THUNDER',
            cloudColor: 'rgba(38,18,64,0.84)',
            cloudRim: '#ffd740',
            boltPrimary: '#fff59d',
            boltSecondary: '#c77dff',
            pillarColor: '#ffd740',
            pillarCore: '#ffffff',
            emblemKind: 'fire_dragon_orbs'
          };
      const totalBolts = (st && st.totalStrikes) || (targetStage <= 2 ? 1 : targetStage <= 4 ? 3 : targetStage <= 6 ? 6 : 9);
      const t = this.t + (n.n || 0);

      ctx.save();
      ctx.translate(x, y);

      // 1. Path-Specific Ground Resonance Array & Swirling Qi Vortex
      const ringRadius = (18 + (targetStage >= 7 ? 6 : targetStage >= 5 ? 4 : 2)) * sc;
      ctx.strokeStyle = pStyle.cloudRim || '#ffd166';
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.ellipse(0, 1.5, ringRadius, ringRadius * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Path-specific orbiting Dao emblems (Sword shards, Fire dragons, Nether flames, Emerald lotus, Clockwork Bagua)
      const orbNodes = Math.min(8, Math.max(4, totalBolts));
      for (let i = 0; i < orbNodes; i++) {
        const a = t * 2.4 + (i * Math.PI * 2) / orbNodes;
        const ox = Math.cos(a) * (ringRadius * 0.85);
        const oy = -6 * sc + Math.sin(a) * (ringRadius * 0.36);
        ctx.fillStyle = i % 2 === 0 ? pStyle.boltPrimary : pStyle.boltSecondary;
        ctx.strokeStyle = pStyle.cloudRim;
        ctx.lineWidth = 1.1;
        if (pStyle.emblemKind === 'sword_shards') {
          ctx.beginPath();
          ctx.moveTo(ox, oy - 4 * sc);
          ctx.lineTo(ox + 1.5 * sc, oy + 3 * sc);
          ctx.lineTo(ox - 1.5 * sc, oy + 3 * sc);
          ctx.closePath();
          ctx.fill();
        } else if (pStyle.emblemKind === 'clockwork_bagua') {
          ctx.strokeRect(ox - 2.2 * sc, oy - 2.2 * sc, 4.4 * sc, 4.4 * sc);
        } else if (pStyle.emblemKind === 'emerald_lotus') {
          ctx.beginPath();
          ctx.ellipse(ox, oy, 2.8 * sc, 1.6 * sc, a, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(ox, oy, 2.1 * sc, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Overhead Heavenly Tribulation Cloud Vortex (เมฆทัณฑ์สวรรค์ทมิฬแยกสีตามวิถีเต๋า)
      const cloudY = -40 * sc;
      const cloudRx = (20 + Math.min(10, totalBolts * 1.1)) * sc;
      const cloudRy = 7.5 * sc;
      ctx.fillStyle = pStyle.cloudColor;
      ctx.beginPath();
      ctx.ellipse(0, cloudY, cloudRx, cloudRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = pStyle.cloudRim;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // 3. Phase-Specific Spectacle
      if (phase === 'GATHERING') {
        // Phase 1: Swirling Qi Funnel rising into the dark tribulation cloud
        ctx.strokeStyle = pStyle.boltSecondary;
        ctx.lineWidth = 1.3;
        for (let s = 0; s < 3; s++) {
          const hFrac = ((t * 0.9 + s * 0.33) % 1);
          const ry = -4 * sc + hFrac * (cloudY + 6 * sc);
          const rx = (1 - hFrac * 0.55) * 14 * sc;
          ctx.beginPath();
          ctx.ellipse(0, ry, rx, rx * 0.38, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (phase === 'STRIKING') {
        // Phase 2: Multi-Bolt Heavenly Lightning Barrage (1 / 3 / 6 / 9 Bolts by Stage)
        const boltPrimary = targetStage >= 7 ? '#d000ff' : targetStage >= 3 ? '#ffd740' : pStyle.boltPrimary;
        const boltCore = targetStage >= 7 ? '#f3c4fb' : '#ffffff';
        const visibleBolts = Math.min(totalBolts, Math.max(1, (st && st.strikesLanded) || totalBolts));

        for (let b = 0; b < visibleBolts; b++) {
          const spread = visibleBolts === 1 ? 0 : ((b / (visibleBolts - 1)) - 0.5) * (cloudRx * 1.25);
          const dstSpread = spread * 0.35;
          const jitter = Math.sin(t * 24 + b * 2.1) * 3.4;

          ctx.strokeStyle = b % 2 === 0 ? boltPrimary : pStyle.boltSecondary;
          ctx.lineWidth = targetStage >= 7 ? 2.6 : targetStage >= 3 ? 2.2 : 1.8;
          ctx.beginPath();
          ctx.moveTo(spread, cloudY + 2 * sc);
          ctx.lineTo(spread * 0.75 + jitter, cloudY * 0.68);
          ctx.lineTo(spread * 0.45 - jitter * 0.7, cloudY * 0.36);
          ctx.lineTo(dstSpread, -8 * sc);
          ctx.stroke();

          // White-hot lightning core
          ctx.strokeStyle = boltCore;
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }

        // Scattering lightning sparks at impact point
        ctx.fillStyle = boltPrimary;
        for (let sp = 0; sp < 6; sp++) {
          const sa = t * 8 + sp * (Math.PI / 3);
          const sr = (4 + ((t * 18 + sp * 3) % 12)) * sc;
          ctx.beginPath();
          ctx.arc(Math.cos(sa) * sr, -8 * sc + Math.sin(sa) * sr * 0.5, 1.5 * sc, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (phase === 'ASCENSION') {
        // Phase 3A: Ascension Light Pillar (เสาแสงแห่งเต๋าพุ่งทะลวงสวรรค์ + คลื่นปราณแผ่ขยาย)
        ctx.fillStyle = pStyle.pillarColor;
        ctx.globalAlpha = 0.38;
        ctx.fillRect(-9 * sc, cloudY - 12 * sc, 18 * sc, Math.abs(cloudY - 12 * sc) + 4 * sc);
        ctx.fillStyle = pStyle.pillarCore;
        ctx.globalAlpha = 0.78;
        ctx.fillRect(-4 * sc, cloudY - 12 * sc, 8 * sc, Math.abs(cloudY - 12 * sc) + 4 * sc);
        ctx.globalAlpha = 1;

        // Expanding Dao Shockwave Ring
        const waveProg = (t * 1.4) % 1;
        const waveR = (10 + waveProg * 28) * sc;
        ctx.strokeStyle = pStyle.pillarColor;
        ctx.lineWidth = 2.2 * (1 - waveProg * 0.6);
        ctx.beginPath();
        ctx.ellipse(0, 1, waveR, waveR * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (phase === 'BACKFIRE') {
        // Phase 3B: Backfire Smoke Explosion & Heart Demon Miasma
        for (let k = 0; k < 5; k++) {
          const ka = t * 2.5 + k * 1.25;
          const kx = Math.cos(ka) * 8 * sc;
          const ky = -10 * sc + Math.sin(ka) * 5 * sc;
          ctx.fillStyle = k % 2 === 0 ? 'rgba(30, 20, 35, 0.78)' : 'rgba(185, 28, 28, 0.65)';
          ctx.beginPath();
          ctx.arc(kx, ky, (5.5 + (k % 2) * 2.5) * sc, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
      return true;
    },

    /* ---------- Patch v5.3.0 [Pillar 3]: 15 Signature Martial Arts & Unique Skill VFX Renderer ---------- */
    drawSignatureSkillVfx(ctx, fx, p, r, reduced) {
      if (!ctx || !fx) return false;
      const sigId = fx.signatureVfx || 'sig_meteor_sword_rain';
      const spec = (g.SK && g.SK.SIGNATURE_VFX_CATALOG && g.SK.SIGNATURE_VFX_CATALOG[sigId]) || {
        id: sigId,
        primary: '#00f5d4',
        secondary: '#ffd166',
        accent: '#ffffff'
      };
      const rot = reduced ? 0 : p * Math.PI * 2;
      const phase = reduced ? 0.5 : p;
      const strokePoints = (points, close = false) => {
        ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
        if (close) ctx.closePath(); ctx.stroke();
      };
      const fillPoints = points => {
        ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
        ctx.closePath(); ctx.fill();
      };

      ctx.save();
      // Ground impact aura ring
      ctx.strokeStyle = spec.primary;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.ellipse(0, 4, r * 1.18, r * 0.50, 0, 0, Math.PI * 2);
      ctx.stroke();

      switch (sigId) {
        case 'sig_meteor_sword_rain': {
          // 1. เพลงกระบี่ดาวตกถล่มสวรรค์: 7 Giant Streaking Meteor Swords raining from sky
          for (let i = 0; i < 7; i++) {
            const sx = (i - 3) * (r * 0.34);
            const drop = ((p * 1.6 + i * 0.17) % 1);
            const sy = -28 + drop * 32;
            ctx.strokeStyle = i % 2 === 0 ? spec.primary : spec.secondary;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(sx + 6, sy - 14);
            ctx.lineTo(sx, sy);
            ctx.stroke();
            // Hilt & impact ripple
            ctx.fillStyle = spec.accent;
            ctx.beginPath();
            ctx.arc(sx, sy, 2.0, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'sig_eight_directions_palm': {
          // 2. ฝ่ามือสยบมารแปดทิศ: Colossal Golden Buddha/Dao Palm descending + 8-Direction Octagon
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 2.1;
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const a = (i * Math.PI) / 4 + rot * 0.25;
            const px = Math.cos(a) * r * 1.15;
            const py = 4 + Math.sin(a) * r * 0.52;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          // Giant Golden Palm Silhouette
          const palmY = -14 + p * 12;
          ctx.fillStyle = spec.primary;
          ctx.beginPath();
          ctx.arc(0, palmY, r * 0.42, 0, Math.PI * 2);
          ctx.fill();
          for (let f = -2; f <= 2; f++) {
            ctx.fillRect(f * 3.6 - 1.3, palmY - r * 0.72 + Math.abs(f) * 1.5, 2.6, r * 0.36);
          }
          break;
        }
        case 'sig_nine_suns_eye': {
          // 3. เนตรสุริยันเก้าเพลิง: Blazing Solar Eye + 9 Orbiting Miniature Suns
          ctx.fillStyle = spec.secondary;
          ctx.beginPath();
          ctx.ellipse(0, -14, r * 0.62, r * 0.30, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = spec.primary;
          ctx.beginPath();
          ctx.arc(0, -14, r * 0.22, 0, Math.PI * 2);
          ctx.fill();
          for (let i = 0; i < 9; i++) {
            const a = (i * Math.PI * 2) / 9 + rot * 0.6;
            const sx = Math.cos(a) * r * 1.05;
            const sy = -4 + Math.sin(a) * r * 0.48;
            ctx.fillStyle = i % 2 === 0 ? spec.primary : spec.secondary;
            ctx.beginPath();
            ctx.arc(sx, sy, 2.8, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'sig_soul_scorching_flame': {
          // 4. เพลิงผลาญวิญญาณ: Swirling Violet-Emerald Soul Flame Vortex
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3 + rot;
            const fx2 = Math.cos(a) * r * 0.78;
            const fy2 = 2 + Math.sin(a) * r * 0.38 - p * 10;
            ctx.fillStyle = i % 2 === 0 ? spec.primary : spec.secondary;
            ctx.beginPath();
            ctx.moveTo(fx2 - 3.5, fy2 + 4);
            ctx.quadraticCurveTo(fx2, fy2 - 9, fx2 + 3.5, fy2 + 4);
            ctx.closePath();
            ctx.fill();
          }
          break;
        }
        case 'sig_blazing_dragon_wave': {
          // 5. คลื่นมังกรเพลิงพุ่งทะยาน: Coiling Fire Dragon Surging Wave
          ctx.rotate(fx.angle || 0);
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 3.6;
          ctx.beginPath();
          for (let s = 0; s <= 16; s++) {
            const u = s / 16;
            const dx = (u - 0.2) * r * 1.55;
            const dy = Math.sin(u * 9 + p * 8) * 6.5;
            if (s === 0) ctx.moveTo(dx, dy);
            else ctx.lineTo(dx, dy);
          }
          ctx.stroke();
          ctx.fillStyle = spec.secondary;
          ctx.beginPath();
          ctx.arc(r * 1.2, 0, 4.2, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'sig_blood_beast_claw': {
          // 6. กรงเล็บอสูรโลหิตฉีกนภา: 4 Jagged Crimson Beast Claw Slash Marks
          ctx.rotate(fx.angle || 0);
          for (let c = -1.5; c <= 1.5; c += 1) {
            ctx.strokeStyle = spec.primary;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(-r * 0.75, c * 4.5 - 2);
            ctx.quadraticCurveTo(0, c * 4.5 + 3, r * 0.95, c * 4.5 - 1);
            ctx.stroke();
          }
          break;
        }
        case 'sig_frost_lotus_domain': {
          // 7. เขตแดนบัวหิมะหมื่นปี: 12-Petal Crystalline Ice Lotus & Frost Hexagons
          for (let i = 0; i < 12; i++) {
            const a = (i * Math.PI * 2) / 12 + rot * 0.3;
            ctx.fillStyle = i % 2 === 0 ? spec.primary : spec.secondary;
            ctx.beginPath();
            ctx.ellipse(Math.cos(a) * r * 0.55, 3 + Math.sin(a) * r * 0.28, r * 0.36, r * 0.14, a, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'sig_thunder_god_halberd': {
          // 8. ทวนอัสนีเทพพิโรธ: Giant Heavenly Lightning Halberd Cleave
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 3.0;
          ctx.beginPath();
          ctx.moveTo(0, -28);
          ctx.lineTo(0, 6);
          ctx.stroke();
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(0, -6, r * 0.55, -0.9, 0.9);
          ctx.arc(0, -6, r * 0.55, Math.PI - 0.9, Math.PI + 0.9);
          ctx.stroke();
          break;
        }
        case 'sig_myriad_puppet_barrage': {
          // 9. ค่ายกลหุ่นเชิดหมื่นด้ายสังหาร: Brass Clockwork Cogs & Silk Threads
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 1.2;
          for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4 + rot * 0.5;
            ctx.beginPath();
            ctx.moveTo(-Math.cos(a) * r, -Math.sin(a) * r * 0.5);
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.5);
            ctx.stroke();
          }
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case 'sig_heavens_sound_requiem': {
          // 10. พิณสวรรค์สะท้านวิญญาณ: Harmonic Guqin Strings & Sonic Jade Ripples
          for (let s = -2; s <= 2; s++) {
            ctx.strokeStyle = s === 0 ? spec.accent : spec.primary;
            ctx.lineWidth = s === 0 ? 2.0 : 1.2;
            ctx.beginPath();
            ctx.moveTo(-r * 0.85, s * 3 - 4);
            ctx.quadraticCurveTo(0, s * 3 - 4 + Math.sin(p * 12 + s) * 4, r * 0.85, s * 3 - 4);
            ctx.stroke();
          }
          break;
        }
        case 'sig_golden_buddha_bell': {
          // 11. ระฆังทองคำอรหันต์คุ้มกายา: Translucent Golden Sanctuary Bell Dome
          ctx.fillStyle = 'rgba(255, 215, 64, 0.26)';
          ctx.beginPath();
          ctx.arc(0, -4, r * 0.78, Math.PI, 0);
          ctx.lineTo(r * 0.88, 6);
          ctx.lineTo(-r * 0.88, 6);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 2.4;
          ctx.stroke();
          break;
        }
        case 'sig_void_spatial_slash': {
          // 12. คมดาบผ่ามิติว่างเปล่า: Dimensional Rift Tear & Starry Cracks
          ctx.rotate(fx.angle || 0);
          ctx.fillStyle = spec.primary;
          ctx.beginPath();
          ctx.moveTo(-r * 1.1, 0);
          ctx.quadraticCurveTo(0, -r * 0.38, r * 1.1, 0);
          ctx.quadraticCurveTo(0, r * 0.38, -r * 1.1, 0);
          ctx.fill();
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 1.8;
          ctx.stroke();
          break;
        }
        case 'sig_myriad_venom_miasma': {
          // 13. หมอกพิษกู่หมื่นอสรพิษ: Coiling Emerald-Violet Venom Serpents
          for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI) / 2 + rot * 0.7;
            ctx.strokeStyle = i % 2 === 0 ? spec.primary : spec.secondary;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.25, r * 0.42, a, a + 2.1);
            ctx.stroke();
          }
          break;
        }
        case 'sig_taiji_yin_yang_crush': {
          // 14. มหาค่ายกลหยินหยางบดขยี้: Counter-Rotating Yin-Yang Grinding Disc
          ctx.save();
          ctx.translate(0, 3);
          ctx.scale(1, 0.55);
          ctx.rotate(rot);
          ctx.fillStyle = spec.primary;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.92, -Math.PI / 2, Math.PI / 2);
          ctx.fill();
          ctx.fillStyle = spec.secondary;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.92, Math.PI / 2, Math.PI * 1.5);
          ctx.fill();
          ctx.strokeStyle = spec.accent;
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          break;
        }

        case 'sig_iai_crimson_moon_slash': {
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          ctx.arc(0, -10, r * 1.05, -Math.PI * 0.85, Math.PI * 0.25);
          ctx.stroke();
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(-r * 1.1, -6);
          ctx.lineTo(r * 1.1, -14);
          ctx.stroke();
          break;
        }
        case 'sig_shinobi_phantom_clone_ambush': {
          for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI) / 2 + rot;
            const cx2 = Math.cos(a) * r * 0.78;
            const cy2 = -8 + Math.sin(a) * r * 0.42;
            ctx.fillStyle = spec.primary;
            ctx.beginPath();
            ctx.arc(cx2, cy2, 4.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = spec.secondary;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx2, cy2);
            ctx.lineTo(0, -10);
            ctx.stroke();
          }
          break;
        }
        case 'sig_shinobi_mudra_firestorm': {
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 2.4;
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3 + rot * 1.2;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * r * 0.65, -10 + Math.sin(a) * r * 0.35, 4.5, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
        }
        case 'sig_pantheon_deity_descent': {
          ctx.fillStyle = spec.primary;
          ctx.beginPath();
          ctx.arc(0, -18, r * 0.55, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(0, -32);
          ctx.lineTo(0, 6);
          ctx.stroke();
          break;
        }
        case 'sig_eldritch_void_rift': {
          ctx.fillStyle = spec.primary;
          ctx.beginPath();
          ctx.ellipse(0, -12, r * 0.75, r * 0.35, rot * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = spec.secondary;
          ctx.beginPath();
          ctx.arc(0, -12, r * 0.22, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'sig_khmer_sacred_yantra_seal': {
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 2.0;
          ctx.strokeRect(-r * 0.55, -18, r * 1.1, r * 0.75);
          ctx.fillStyle = spec.secondary;
          for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.arc(i * 6, -18, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'sig_nether_grave_soul_eruption': {
          ctx.fillStyle = spec.primary;
          ctx.fillRect(-5, -18, 10, 16);
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 2.0;
          for (let i = 0; i < 5; i++) {
            const a = (i * Math.PI * 2) / 5 + rot;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * r * 0.65, -10 + Math.sin(a) * r * 0.35, 3.0, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
        }
        case 'sig_shennong_emerald_lotus': {
          // 23. บัวหยกเสินหนงโปรยน้ำค้างชุบชีวา (Healing Emerald Lotus + Rising Vitality Dew)
          for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4 + rot * 0.35;
            ctx.fillStyle = i % 2 === 0 ? spec.primary : spec.secondary;
            ctx.beginPath();
            ctx.ellipse(Math.cos(a) * r * 0.58, 2 + Math.sin(a) * r * 0.28, r * 0.34, r * 0.15, a, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = spec.accent;
          for (let d = 0; d < 5; d++) {
            const dx = (d - 2) * (r * 0.32);
            const dy = -4 - ((p * 18 + d * 4) % 18);
            ctx.beginPath();
            ctx.arc(dx, dy, 2.1, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'sig_imperial_eight_gates_banner': {
          // 24. ธงรบฉีเหมินแปดพยุหะบัญชาทัพ (4 planted war banners + Octagonal tactical array)
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const a = (i * Math.PI) / 4 + rot * 0.2;
            const px = Math.cos(a) * r * 1.05, py = 3 + Math.sin(a) * r * 0.48;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
          for (let b = -1.5; b <= 1.5; b += 1) {
            const bx = b * (r * 0.42);
            ctx.strokeStyle = spec.accent;
            ctx.beginPath(); ctx.moveTo(bx, 4); ctx.lineTo(bx, -18); ctx.stroke();
            ctx.fillStyle = spec.secondary;
            ctx.beginPath(); ctx.moveTo(bx, -18); ctx.lineTo(bx + 7, -14); ctx.lineTo(bx, -10); ctx.closePath(); ctx.fill();
          }
          break;
        }
        case 'sig_primordial_beast_totem': {
          // 25. เสาโทเท็มอัญเชิญจตุรเทพราชันอสูร (Totem Pillars + Kunpeng Wings & Fangs)
          ctx.fillStyle = spec.primary;
          ctx.fillRect(-r * 0.55, -20, 4.5, 22);
          ctx.fillRect(r * 0.55 - 4.5, -20, 4.5, 22);
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(0, -10); ctx.quadraticCurveTo(-r * 0.95, -24, -r * 1.15, -6);
          ctx.moveTo(0, -10); ctx.quadraticCurveTo(r * 0.95, -24, r * 1.15, -6);
          ctx.stroke();
          break;
        }
        case 'sig_heaven_brush_astrolabe': {
          // 26. พู่กันเทวะจารึกจานดาราเหอถูลั่วซู (Rotating Astrolabe + Descending Calligraphy Brush)
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.ellipse(0, -6, r * 0.88, r * 0.42, rot * 0.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 2.6;
          const bx = Math.sin(p * Math.PI * 2) * (r * 0.35);
          ctx.beginPath(); ctx.moveTo(bx + 6, -26); ctx.lineTo(bx, -6); ctx.stroke();
          ctx.fillStyle = spec.accent;
          ctx.beginPath(); ctx.arc(bx, -5, 3.0, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'sig_golden_abacus_wheel': {
          // 27. กงล้อโชคชะตาและลูกคิดทองไฉ่ซิง (8-Spoke Roulette + Golden Abacus Frame)
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 2.2;
          ctx.strokeRect(-r * 0.55, -18, r * 1.1, 14);
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3 + rot;
            ctx.fillStyle = i % 2 === 0 ? spec.primary : spec.secondary;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * r * 0.78, -4 + Math.sin(a) * r * 0.36, 2.8, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'sig_blood_lotus_apocalypse': {
          // 28. บัวโลหิตอเวจีสูบดาวทลายสามภพ (Crimson-Black Forbidden Vortex + Chains)
          ctx.fillStyle = spec.primary;
          for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4 - rot * 0.8;
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.quadraticCurveTo(Math.cos(a - 0.25) * r * 0.8, -6 + Math.sin(a - 0.25) * r * 0.4, Math.cos(a) * r * 1.05, -6 + Math.sin(a) * r * 0.52);
            ctx.closePath();
            ctx.fill();
          }
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 2.0;
          ctx.beginPath(); ctx.arc(0, -6, r * 0.42, 0, Math.PI * 2); ctx.stroke();
          break;
        }
        case 'sig_divine_crucible_forge': {
          // 29. เตาหลอมสวรรค์เก้ามังกรรังสรรค์ศาสตรา (Immortal Cauldron + Ascending Fire Pillars)
          ctx.fillStyle = spec.primary;
          ctx.fillRect(-r * 0.38, -16, r * 0.76, 12);
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 2.2;
          ctx.strokeRect(-r * 0.38, -16, r * 0.76, 12);
          for (let f = -1; f <= 1; f++) {
            ctx.fillStyle = spec.accent;
            ctx.beginPath();
            ctx.arc(f * (r * 0.35), -18 - p * 8, 3.2, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'sig_tidal_maelstrom_anchors': {
          // 30. วังวนคลื่นยักษ์เก้าสมุทรและมังกรปฐพี (Spiral Maelstrom Waves + Jade Pillars)
          for (let w = 0; w < 3; w++) {
            const a = rot + (w * Math.PI * 2) / 3;
            ctx.strokeStyle = w % 2 === 0 ? spec.primary : spec.secondary;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.arc(0, -2, r * (0.45 + w * 0.22), a, a + Math.PI * 1.15);
            ctx.stroke();
          }
          ctx.fillStyle = spec.accent;
          ctx.fillRect(-2.2, -20, 4.4, 16);
          break;
        }
        case 'sig_bamboo_reed_sword': {
          // Three flexible culms receive the strike, then loose jade leaves cut back.
          ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 2.2;
          for (let i = -1; i <= 1; i++) {
            const bx = i * r * 0.36, sway = i * 4 + (reduced ? 0 : Math.sin(p * Math.PI * 2) * 3);
            ctx.strokeStyle = i === 0 ? spec.primary : spec.secondary;
            ctx.beginPath(); ctx.moveTo(bx - sway * 0.35, 12); ctx.quadraticCurveTo(bx + sway, -2, bx - sway * 0.25, -21); ctx.stroke();
            for (let leaf = 0; leaf < 3; leaf++) {
              const ly = 4 - leaf * 7, lx = bx + sway * (leaf / 3);
              ctx.beginPath(); ctx.moveTo(lx, ly); ctx.quadraticCurveTo(lx + (leaf % 2 ? -8 : 8), ly - 2, lx + (leaf % 2 ? -11 : 11), ly - 7); ctx.stroke();
            }
          }
          ctx.fillStyle = spec.accent; ctx.beginPath(); ctx.arc(0, -20, 2.1, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'sig_magnetic_arsenal_draw': {
          // Floating blades are visibly pulled inward to a horseshoe magnet core.
          ctx.lineCap = 'round'; ctx.strokeStyle = spec.secondary; ctx.lineWidth = 2.3;
          ctx.beginPath(); ctx.moveTo(-5, -10); ctx.lineTo(-5, 1); ctx.quadraticCurveTo(0, 8, 5, 1); ctx.lineTo(5, -10); ctx.stroke();
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.5;
          for (let i = 0; i < 4; i++) {
            const a = i * Math.PI / 2 + phase * 0.18, ox = Math.cos(a) * r * 0.9, oy = -5 + Math.sin(a) * r * 0.45;
            ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox * 0.48, oy * 0.42 - 3); ctx.stroke();
            ctx.save(); ctx.translate(ox, oy); ctx.rotate(a + Math.PI / 2);
            strokePoints([[-2, 4], [0, -5], [2, 4]]); ctx.beginPath(); ctx.moveTo(-3, 1); ctx.lineTo(3, 1); ctx.stroke(); ctx.restore();
          }
          ctx.fillStyle = spec.accent; ctx.beginPath(); ctx.arc(0, -2, 2.6, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'sig_iron_rhino_ramming': {
          // A lowered horn and plated brow form a single forward-rushing rhino mask.
          ctx.lineJoin = 'round'; ctx.fillStyle = spec.primary;
          fillPoints([[-13, -8], [-8, -16], [-3, -11], [3, -11], [9, -16], [14, -7], [9, 1], [4, 1], [0, 13], [-4, 1], [-10, 1]]);
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 2.4;
          strokePoints([[-1, -10], [0, -23], [5, -17]]);
          strokePoints([[-9, -6], [-15, -12], [-12, -1]]); strokePoints([[9, -6], [15, -12], [12, -1]]);
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.6;
          for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-r * 0.8, 8 + i * 3); ctx.lineTo(-r * 0.35, 8 + i * 3); ctx.moveTo(r * 0.8, 8 + i * 3); ctx.lineTo(r * 0.35, 8 + i * 3); ctx.stroke(); }
          break;
        }
        case 'sig_eightfold_earthquake': {
          // Eight separated fault lines break outward from a heavy ground impact.
          ctx.lineWidth = 2; ctx.strokeStyle = spec.secondary;
          for (let ring = 0; ring < 3; ring++) {
            const radius = r * (0.36 + ring * 0.28), yScale = 0.46;
            ctx.beginPath();
            for (let i = 0; i <= 8; i++) { const a = (i * Math.PI / 4) + Math.PI / 8; const x = Math.cos(a) * radius, y = 5 + Math.sin(a) * radius * yScale; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
            ctx.stroke();
          }
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.8;
          for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; const x = Math.cos(a), y = Math.sin(a) * 0.46;
            ctx.beginPath(); ctx.moveTo(x * r * 0.18, 5 + y * r * 0.18); ctx.lineTo(x * r * 0.48, 5 + y * r * 0.48); ctx.lineTo(x * r * 0.57, 5 + y * r * 0.41); ctx.lineTo(x * r * 0.86, 5 + y * r * 0.86); ctx.stroke(); }
          ctx.fillStyle = spec.accent; ctx.fillRect(-4, -1, 8, 5);
          break;
        }
        case 'sig_twin_thunder_hammers': {
          // Twin hammer heads land on one anvil line; no single polearm silhouette.
          ctx.lineCap = 'square'; ctx.strokeStyle = spec.secondary; ctx.lineWidth = 2.6;
          strokePoints([[-13, -18], [-5, -12], [-2, -2]]); strokePoints([[13, -18], [5, -12], [2, -2]]);
          ctx.fillStyle = spec.primary;
          fillPoints([[-19, -21], [-8, -21], [-7, -15], [-20, -15]]); fillPoints([[8, -21], [19, -21], [20, -15], [7, -15]]);
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-15, 2); ctx.lineTo(15, 2); ctx.lineTo(11, 7); ctx.lineTo(-11, 7); ctx.closePath(); ctx.stroke();
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.5;
          for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 4, -3 + Math.sin(a) * 3); ctx.lineTo(Math.cos(a) * 10, -3 + Math.sin(a) * 7); ctx.stroke(); }
          break;
        }
        case 'sig_divine_bell_mind_ripple': {
          // Hanging bell with an audible clapper; outward crescents distinguish it from a dome ward.
          ctx.lineCap = 'round'; ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.3;
          ctx.beginPath(); ctx.moveTo(-3, -20); ctx.arc(0, -20, 3, Math.PI, 0); ctx.lineTo(3, -17); ctx.quadraticCurveTo(4, -12, 8, -5); ctx.lineTo(-8, -5); ctx.quadraticCurveTo(-4, -12, -3, -17); ctx.closePath(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-10, -4); ctx.lineTo(10, -4); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(0, 0); ctx.stroke();
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 1.6;
          for (let i = 0; i < 3; i++) { const radius = 12 + i * 5; ctx.beginPath(); ctx.arc(0, -8, radius, 0.68, 2.46); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -8, radius, 3.82, 5.60); ctx.stroke(); }
          ctx.fillStyle = spec.accent; ctx.beginPath(); ctx.arc(0, 1, 2, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'sig_primordial_stone_tortoise': {
          // Hex-plated carapace sits low over four load-bearing stone legs.
          ctx.fillStyle = spec.primary; ctx.strokeStyle = spec.secondary; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(0, -5, r * 0.76, r * 0.39, 0, Math.PI, Math.PI * 2); ctx.lineTo(r * 0.76, -5); ctx.ellipse(0, -5, r * 0.76, r * 0.39, 0, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.2;
          strokePoints([[-12, -7], [-7, -14], [0, -15], [7, -14], [12, -7], [7, -1], [0, 0], [-7, -1]], true);
          strokePoints([[-7, -14], [-6, -6], [0, 0], [6, -6], [7, -14]]);
          ctx.fillStyle = spec.primary; fillPoints([[-12, -3], [-18, -1], [-19, 4], [-10, 4]]); fillPoints([[12, -3], [18, -1], [19, 4], [10, 4]]);
          fillPoints([[-9, 1], [-14, 5], [-12, 9], [-5, 4]]); fillPoints([[9, 1], [14, 5], [12, 9], [5, 4]]);
          ctx.fillStyle = spec.secondary; fillPoints([[0, -7], [r * 0.92, -9], [r * 1.05, -5], [r * 0.84, -1]]);
          break;
        }
        case 'sig_thousand_faith_link': {
          // Connect only actual recipients saved by combat; local points are the fallback glyphs.
          const recipients = Array.isArray(fx.targetPoints) ? fx.targetPoints.filter(point => point && Number.isFinite(point.x) && Number.isFinite(point.y)).slice(0, 8) : [];
          const nodes = recipients.map(point => ({ x: point.x - fx.x, y: point.y - fx.y + 7, team: point.team !== false }));
          if (!nodes.length) for (let i = 0; i < 7; i++) { const a = i * Math.PI * 2 / 7 - Math.PI / 2; nodes.push({ x: Math.cos(a) * r * 0.82, y: -4 + Math.sin(a) * r * 0.42, team: true }); }
          ctx.lineCap = 'round'; ctx.globalAlpha *= 0.9; ctx.lineWidth = 2.8; ctx.strokeStyle = spec.secondary;
          nodes.forEach((node, i) => { if (i === 0) return; ctx.beginPath(); ctx.moveTo(nodes[0].x, nodes[0].y); ctx.lineTo(node.x, node.y); ctx.stroke(); });
          for (const [i, node] of nodes.entries()) {
            ctx.strokeStyle = node.team ? spec.accent : '#ffd0dd'; ctx.fillStyle = node.team ? spec.primary : '#ff718f'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(node.x, node.y, i === 0 ? 7.5 : 5.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(node.x, node.y - 4.1); ctx.lineTo(node.x + 4.1, node.y); ctx.lineTo(node.x, node.y + 4.1); ctx.lineTo(node.x - 4.1, node.y); ctx.closePath(); ctx.fill(); ctx.stroke();
          }
          break;
        }
        case 'sig_mountain_river_scroll': {
          // Rolled ends frame inked peaks and a winding water line across a landscape scroll.
          ctx.fillStyle = spec.primary; ctx.fillRect(-r * 0.78, -16, r * 1.56, 30);
          ctx.fillStyle = spec.accent; ctx.fillRect(-r * 0.68, -13, r * 1.36, 24);
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(-r * 0.66, 5); ctx.lineTo(-r * 0.37, -7); ctx.lineTo(-r * 0.18, 1); ctx.lineTo(r * 0.05, -11); ctx.lineTo(r * 0.35, 4); ctx.lineTo(r * 0.58, -3); ctx.stroke();
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.7;
          ctx.beginPath(); ctx.moveTo(-r * 0.58, 9); ctx.bezierCurveTo(-r * 0.24, 2, -r * 0.06, 13, r * 0.12, 5); ctx.bezierCurveTo(r * 0.26, -1, r * 0.39, 7, r * 0.62, 1); ctx.stroke();
          ctx.fillStyle = spec.secondary; ctx.fillRect(-r * 0.84, -18, 4, 34); ctx.fillRect(r * 0.76, -18, 4, 34);
          break;
        }
        case 'sig_seven_emotion_mirage': {
          // Seven dream masks, each with a distinct eye pair and turning mouth.
          for (let i = 0; i < 7; i++) {
            const a = i * Math.PI * 2 / 7 + rot * 0.14, x = Math.cos(a) * r * 0.72, y = -5 + Math.sin(a) * r * 0.38;
            ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2);
            ctx.strokeStyle = i % 2 ? spec.primary : spec.secondary; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.ellipse(0, 0, 4.8, 5.5, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = spec.accent; ctx.fillRect(-2.7, -1.2, 1.4, 1.4); ctx.fillRect(1.3, -1.2, 1.4, 1.4);
            ctx.beginPath(); ctx.moveTo(-1.8, 2.2); ctx.quadraticCurveTo(0, i % 2 ? 4 : 1, 1.8, 2.2); ctx.stroke(); ctx.restore();
          }
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, -5, r * 0.28, 0, Math.PI * 2); ctx.stroke();
          break;
        }
        case 'sig_mind_blade_flash': {
          // One telekinetic blade crosses a focused eye-line; no rain or weapon barrage.
          ctx.rotate((Number.isFinite(fx.angle) ? fx.angle : 0) - 0.38);
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(-r * 0.52, -6, r * 0.35, -0.8, 0.8); ctx.stroke();
          ctx.fillStyle = spec.primary; fillPoints([[-r * 0.68, 5], [r * 0.72, -13], [r * 0.45, -5], [-r * 0.68, 5]]);
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.7; strokePoints([[-r * 0.68, 5], [r * 0.72, -13], [r * 0.45, -5]]);
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-r * 0.94, 10); ctx.lineTo(-r * 0.66, 5); ctx.moveTo(-r * 0.82, 13); ctx.lineTo(-r * 0.54, 8); ctx.stroke();
          break;
        }
        case 'sig_myriad_beast_pack': {
          // Four independent beast heads close a hunting ring, unlike one claw swipe or one totem.
          for (let i = 0; i < 4; i++) {
            const a = i * Math.PI / 2 + rot * 0.12, x = Math.cos(a) * r * 0.72, y = -4 + Math.sin(a) * r * 0.34;
            ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2);
            ctx.fillStyle = i % 2 ? spec.secondary : spec.primary;
            fillPoints([[-5, -3], [-4, -7], [-1, -4], [2, -5], [5, -7], [5, -2], [2, 4], [-2, 4]]);
            ctx.strokeStyle = spec.accent; ctx.lineWidth = 1; strokePoints([[-2, 0], [-1, 2]]); strokePoints([[2, 0], [1, 2]]);
            ctx.restore();
          }
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.4;
          for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.58, -4 + Math.sin(a) * r * 0.28); ctx.lineTo(Math.cos(a) * r * 0.18, -4 + Math.sin(a) * r * 0.09); ctx.stroke(); }
          break;
        }
        case 'sig_gu_insect_swarm': {
          // A coil of tiny winged bodies reads as a swarm, not as the older serpent miasma.
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 1.3;
          ctx.beginPath(); for (let i = 0; i <= 28; i++) { const a = i * Math.PI / 7, d = r * (0.14 + i / 28 * 0.82), x = Math.cos(a) * d, y = -5 + Math.sin(a) * d * 0.44; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
          for (let i = 0; i < 12; i++) {
            const a = i * Math.PI * 2 / 12 + phase * 0.12, d = r * (0.33 + (i % 3) * 0.13), x = Math.cos(a) * d, y = -5 + Math.sin(a) * d * 0.46;
            ctx.fillStyle = i % 3 ? spec.primary : spec.accent; ctx.beginPath(); ctx.ellipse(x, y, 2.1, 1.2, a, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = spec.secondary; ctx.beginPath(); ctx.moveTo(x - 2, y - 1); ctx.lineTo(x - 4, y - 3); ctx.moveTo(x + 2, y - 1); ctx.lineTo(x + 4, y - 3); ctx.stroke();
          }
          break;
        }
        case 'sig_iron_thorn_vine_bind': {
          // Three cross-woven stems cinch around the target, with hooked iron thorns.
          ctx.lineCap = 'round'; ctx.lineWidth = 2.1;
          for (let i = -1; i <= 1; i++) {
            ctx.strokeStyle = i ? spec.primary : spec.secondary; const y = i * 6;
            ctx.beginPath(); ctx.moveTo(-r * 0.86, y + 8); ctx.bezierCurveTo(-r * 0.35, y - 16, r * 0.18, y + 16, r * 0.84, y - 6); ctx.stroke();
            for (const x of [-r * 0.5, 0, r * 0.48]) { ctx.beginPath(); ctx.moveTo(x, y + (x < 0 ? -1 : 1)); ctx.lineTo(x + (x < 0 ? 5 : -5), y - 5); ctx.lineTo(x + (x < 0 ? 4 : -4), y + 1); ctx.stroke(); }
          }
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.38, r * 0.24, 0, 0, Math.PI * 2); ctx.stroke();
          break;
        }
        case 'sig_arena_crowd_roar': {
          // Bowl-shaped stands and audience beats push a visible roar toward the arena floor.
          ctx.lineWidth = 2; ctx.strokeStyle = spec.secondary;
          for (let row = 0; row < 3; row++) { ctx.beginPath(); ctx.arc(0, 7, r * (0.72 + row * 0.2), Math.PI * 1.18, Math.PI * 1.82); ctx.stroke(); }
          for (let i = 0; i < 9; i++) {
            const x = (i - 4) * r * 0.18, y = -6 - Math.abs(i - 4) * 1.5;
            ctx.fillStyle = i % 2 ? spec.primary : spec.accent; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = spec.secondary; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x, y + 5); ctx.stroke();
          }
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.8;
          for (let i = 0; i < 3; i++) { const y = -1 + i * 4; ctx.beginPath(); ctx.moveTo(-r * 0.46, y); ctx.quadraticCurveTo(0, y + (i - 1) * 2, r * 0.46, y); ctx.stroke(); }
          break;
        }
        case 'sig_immortal_crane_feather_storm':
        default: {
          // 15. พายุขนนกกระเรียนเซียน: Whirling Tempest of White-Jade & Gold Feather Blades
          for (let i = 0; i < 10; i++) {
            const a = (i * Math.PI * 2) / 10 + rot;
            const fx2 = Math.cos(a) * r * 0.85;
            const fy2 = Math.sin(a) * r * 0.42;
            ctx.fillStyle = i % 2 === 0 ? spec.primary : spec.secondary;
            ctx.beginPath();
            ctx.ellipse(fx2, fy2, 4.8, 1.6, a + 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
      }
      ctx.restore();
      return true;
    },

    /* ---------- Patch v5.0.0 [Pillar 3]: Equipment Tier Glows, Orbiting Flying Swords & Weapon Souls ---------- */
    drawEquipmentTierAura(ctx, n, ap, by) {
      const maxTier = (ap && ap.highestGearTier) || 0;
      if (maxTier < 3 || Object.values(n.equip || {}).some(R.isTranscendent)) return false;
      // A lower ordinary piece must not replace the existing higher Legendary halo.
      if(maxTier>=6&&Object.values(n.equip||{}).some(it=>it&&it.tier===maxTier&&!it.legendary&&!R.isTranscendent(it)))return this.drawOrdinaryHighTierEquipmentAura(ctx,n,ap,by);
      const spec = R.GEAR_TIER_GLOWS[clamp(maxTier, 1, 7)] || R.GEAR_TIER_GLOWS[3];
      const stars = clamp((ap && ap.totalGearStars) || 0, 0, 9);
      const t = this.t + (n.n || 0) * 0.8;

      ctx.save();
      ctx.strokeStyle = spec.color;
      ctx.globalAlpha = spec.glowAlpha;
      ctx.lineWidth = maxTier >= 6 ? 1.8 : 1.2;
      ctx.beginPath();
      ctx.ellipse(0, -8.5 + by, 6.8, 9.8, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Star-attunement motes (★1-3)
      const starNodes = Math.min(3, Math.ceil(stars / 2));
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#fff8c4';
      for (let i = 0; i < starNodes; i++) {
        const a = t * 2.0 + (i * Math.PI * 2) / Math.max(1, starNodes);
        const sx = Math.cos(a) * 7.8, sy = -12 + by + Math.sin(a) * 4.5;
        ctx.fillRect(sx - 1.0, sy - 1.0, 2.0, 2.0);
      }
      ctx.restore();
      return true;
    },

    drawOrbitingFlyingWeapon(ctx, n, ap, by, act) {
      if (!ap || !ap.hasFlyingSword || (ap.legendaryGear || []).some(it=>it.slot==='WEAPON')) return false;
      const t = this.t + (n.n || 0) * 1.1;
      const speed = act === 'fight' ? 3.8 : 2.1;
      const ang = t * speed;
      const ox = Math.cos(ang) * 11.2;
      const oy = -11.5 + by + Math.sin(ang * 1.5) * 4.2;
      const col = ap.weaponTier >= 6 ? '#ffd740' : ap.weaponTier >= 4 ? '#00e5ff' : '#80ed99';

      ctx.save();
      // Luminous comet trail behind flying sword
      ctx.strokeStyle = col;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const prevAng = ang - 0.55;
      ctx.moveTo(Math.cos(prevAng) * 11.2, -11.5 + by + Math.sin(prevAng * 1.5) * 4.2);
      ctx.lineTo(ox, oy);
      ctx.stroke();

      // Autonomous Flying Sword Blade & Hilt (飞剑环绕)
      ctx.globalAlpha = 0.92;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(ox - 3.2, oy + 1.8);
      ctx.lineTo(ox + 3.8, oy - 2.6);
      ctx.stroke();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(ox - 1.6, oy + 0.9, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    },

    drawWeaponSoulAndSetResonance(ctx, n, ap, by) {
      if (!ap) return false;
      let drew = false;
      const t = this.t + (n.n || 0) * 0.65;

      ctx.save();
      // 1. Full 3-Piece Equipment Set Resonance Foot Sigil
      if (ap.activeSetCount >= 3 && ap.highestGearTier >= 3) {
        ctx.strokeStyle = ap.highestGearTier >= 5 ? '#ffd166' : '#4cc9f0';
        ctx.globalAlpha = 0.48;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 1.4, 8.8, 3.6, 0, 0, Math.PI * 2);
        ctx.stroke();
        drew = true;
      }

      // 2. Weapon Soul Spirit Manifestation (器灵显化) floating above T6-T7 / Legendary wielder
      if (ap.hasWeaponSoul && !(ap.legendaryGear || []).some(it=>it.slot==='WEAPON')) {
        const sx = -5.5 + Math.cos(t * 1.8) * 2.2;
        const sy = -22.5 + by + Math.sin(t * 2.4) * 1.6;
        ctx.globalAlpha = 0.78;
        ctx.fillStyle = '#ffd740';
        ctx.beginPath();
        ctx.arc(sx, sy, 2.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(sx, sy, 3.8, 0, Math.PI * 2);
        ctx.stroke();
        drew = true;
      }
      ctx.restore();
      return drew;
    },

    /* ---------- Patch v5.0.0 [Pillar 4]: Living Sect Ground Spectacles (Plaza Taiji Array, Totems, Banners, Koi, Cranes, Lanterns) ---------- */
    drawPlazaGrandArrayAndTotems(ctx) {
      const W = this.W;
      if (!W || !W.map || !W.map.byId) return false;
      const pl = W.map.byId.plaza;
      if (!pl) return false;

      const cx = (pl.x + pl.w / 2) * TS;
      const cy = (pl.y + pl.h / 2) * TS;
      const rad = Math.min(pl.w, pl.h) * TS * 0.42;
      const t = this.t;
      const col = R.resolveBarrierColor(W);

      ctx.save();
      // 1. Rotating Luminous Yin-Yang Bagua Grand Formation on Central Plaza
      ctx.strokeStyle = col;
      ctx.globalAlpha = 0.34 + 0.08 * Math.sin(t * 1.6);
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rad, rad * 0.58, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#fff3b0';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rad * 0.72, rad * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 8 Bagua Trigram Spokes rotating slowly
      for (let i = 0; i < 8; i++) {
        const a = t * 0.25 + (i * Math.PI) / 4;
        const x1 = cx + Math.cos(a) * (rad * 0.45);
        const y1 = cy + Math.sin(a) * (rad * 0.26);
        const x2 = cx + Math.cos(a) * (rad * 0.96);
        const y2 = cy + Math.sin(a) * (rad * 0.55);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // 2. Four Cardinal Sect Totem Pillars (เสาโทเท็มสี่ทิศลานแปดทิศ)
      const corners = [
        [pl.x * TS + 10, pl.y * TS + 10],
        [(pl.x + pl.w) * TS - 10, pl.y * TS + 10],
        [pl.x * TS + 10, (pl.y + pl.h) * TS - 10],
        [(pl.x + pl.w) * TS - 10, (pl.y + pl.h) * TS - 10]
      ];
      ctx.globalAlpha = 0.85;
      for (let i = 0; i < corners.length; i++) {
        const [tx, ty] = corners[i];
        ctx.fillStyle = '#5c4d3c';
        ctx.fillRect(tx - 3, ty - 18, 6, 18);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(tx, ty - 20 + Math.sin(t * 2.5 + i) * 1.2, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return true;
    },

    drawPeakSanctuarySpectacles(ctx) {
      const W = this.W;
      if (!W || !W.map || !Array.isArray(W.map.buildings)) return false;
      const t = this.t;
      let count = 0;

      ctx.save();
      for (let i = 0; i < W.map.buildings.length; i++) {
        const b = W.map.buildings[i];
        if (!b || !b.isPeakSanctuary) continue;
        const active = !!(b.founded || (MAP.isPeakBuildingActive && MAP.isPeakBuildingActive(W, b)));
        if (!active) continue;

        const cx = (b.x + b.w / 2) * TS;
        const cy = (b.y + b.h / 2) * TS;
        const rx = b.w * TS * 0.58;
        const ry = b.h * TS * 0.36;
        const pCol = (MAP.PEAK_LAYOUTS && MAP.PEAK_LAYOUTS[b.id] && MAP.PEAK_LAYOUTS[b.id].leylineColor) || '#ffd166';

        // Active Peak Guardian Formation Ring
        ctx.strokeStyle = pCol;
        ctx.globalAlpha = 0.32 + 0.10 * Math.sin(t * 2 + i);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 8, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Twin Fluttering Silk Peak Banners (ธงไหมประจำยอดเขา)
        const wave = Math.sin(t * 3.0 + i) * 2.5;
        ctx.globalAlpha = 0.88;
        for (const side of [-1, 1]) {
          const bx = cx + side * (b.w * TS * 0.46);
          const by = (b.y + b.h) * TS - 4;
          ctx.fillStyle = '#4a3525';
          ctx.fillRect(bx - 1, by - 22, 2, 22);
          ctx.fillStyle = pCol;
          ctx.beginPath();
          ctx.moveTo(bx + 1, by - 21);
          ctx.lineTo(bx + side * (11 + wave), by - 18);
          ctx.lineTo(bx + side * (9 + wave * 0.8), by - 8);
          ctx.lineTo(bx + 1, by - 10);
          ctx.closePath();
          ctx.fill();
        }
        count++;
      }
      ctx.restore();
      return count > 0;
    },

    drawLivingFloraAndFauna(ctx, hour, night) {
      const W = this.W;
      if (!W || !W.map) return false;
      const t = this.t;

      ctx.save();
      // 1. Golden & Crimson Spirit Koi Carp (ปลาคาร์ปวิญญาณ) in Spirit Pond
      const pond = W.map.byId && W.map.byId.spirit_pond;
      if (pond) {
        const px0 = pond.x * TS + 14, py0 = pond.y * TS + 14;
        const pw = Math.max(20, (pond.w - 2) * TS), ph = Math.max(20, (pond.h - 2) * TS);
        for (let i = 0; i < 6; i++) {
          const ang = t * (0.55 + (i % 3) * 0.15) + i * 1.1;
          const kx = px0 + pw * 0.5 + Math.cos(ang) * (pw * 0.34);
          const ky = py0 + ph * 0.5 + Math.sin(ang * 1.3) * (ph * 0.32);
          ctx.fillStyle = i % 2 === 0 ? '#ff9f1c' : '#ff4d6d';
          ctx.beginPath();
          ctx.ellipse(kx, ky, 3.6, 1.6, ang + Math.PI / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(kx + Math.cos(ang) * 1.5, ky + Math.sin(ang) * 1.5, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Soaring Immortal White Cranes (นกกระเรียนเซียนเหินเวหา) across mountain peaks
      for (let i = 0; i < 5; i++) {
        const cx = ((i * 520 + t * (22 + i * 3)) % (MAP.W * TS));
        const cy = (18 + i * 26) * TS + Math.sin(t * 1.2 + i) * 16;
        const flap = Math.sin(t * 6.5 + i * 1.7) * 4.5;
        // Soft ground shadow below crane
        ctx.fillStyle = 'rgba(0,0,0,0.14)';
        ctx.beginPath();
        ctx.ellipse(cx - 6, cy + 26, 5.5, 2.0, 0, 0, Math.PI * 2);
        ctx.fill();
        // Crane wings & body
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy + flap);
        ctx.quadraticCurveTo(cx, cy - 2, cx + 7, cy + flap);
        ctx.stroke();
        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.arc(cx + 3.5, cy - 1, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Rising Kongming Sky Lanterns (โคมลอยขงเบ้งยามราตรีและเทศกาล)
      const isBanquet = !!(W.sect && W.sect.festival && W.sect.festival.until > W.t);
      if ((night && night > 0.15) || isBanquet) {
        const lCount = isBanquet ? 10 : 6;
        for (let i = 0; i < lCount; i++) {
          const lx = (75 + ((i * 23) % 90)) * TS + Math.sin(t * 0.8 + i) * 12;
          const ly = (110 - ((t * 5 + i * 14) % 75)) * TS;
          ctx.fillStyle = 'rgba(255,214,102,0.88)';
          ctx.beginPath();
          ctx.ellipse(lx, ly, 3.2, 4.2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ff6b35';
          ctx.beginPath();
          ctx.arc(lx, ly + 2.5, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      return true;
    },

    /* ---------- Patch v5.0.0 [Pillar 5]: Celestial Phenomenon Atmospheric Shaders ---------- */
    resolveActiveCelestialShader() {
      const preview = this.opts && this.opts.celestialPreview;
      if (preview && preview !== 'AUTO' && R.CELESTIAL_SHADERS[preview]) {
        return R.CELESTIAL_SHADERS[preview];
      }
      const W = this.W;
      if (!W) return null;
      const align = String(W.celestialAlignment || (W.world && W.world.celestialEvent) || (W.sect && W.sect.fengShui && W.sect.fengShui.celestialPhenomenon && W.sect.fengShui.celestialPhenomenon.id) || '').toUpperCase();
      if (/BLOOD|ECLIPSE|CRIMSON|โลหิต/.test(align)) return R.CELESTIAL_SHADERS.BLOOD_MOON;
      if (/SUN|YANG|SOLAR|สุริยัน|ตะวัน/.test(align)) return R.CELESTIAL_SHADERS.NINE_SUNS;
      if (/STAR|METEOR|ASTRAL|ดารา|ดาวตก/.test(align)) return R.CELESTIAL_SHADERS.METEOR_SHOWER;
      if (/PRANA|TIDE|AURORA|ปราณ/.test(align)) return R.CELESTIAL_SHADERS.PRANA_TIDE;
      return null;
    },

    drawCelestialPhenomena(ctx, hour, night) {
      const spec = this.resolveActiveCelestialShader();
      if (!spec || !spec.tint) return false;
      const w = this.vw || 412, h = this.vh || 860, t = this.t;

      ctx.save();
      // 1. Full-viewport atmospheric glaze
      ctx.fillStyle = spec.tint;
      ctx.fillRect(0, 0, w, h);

      // 2. Diagonal Celestial Light Rays / Aurora Beams
      if (spec.beamColor) {
        ctx.fillStyle = spec.beamColor;
        for (let i = 0; i < 3; i++) {
          const bx = ((i * 180 + t * 12) % (w + 120)) - 60;
          ctx.beginPath();
          ctx.moveTo(bx, 0);
          ctx.lineTo(bx + 55, 0);
          ctx.lineTo(bx + 145, h);
          ctx.lineTo(bx + 90, h);
          ctx.closePath();
          ctx.fill();
        }
      }

      // 3. Phenomenon Particles (Meteors, Blood Embers, Solar Sparks, Prana Motes)
      ctx.fillStyle = spec.particleColor || '#ffd166';
      ctx.strokeStyle = spec.particleColor || '#ffd166';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 14; i++) {
        const px = ((i * 97 + t * (spec.id === 'METEOR_SHOWER' ? 140 : 24)) % w);
        const py = ((i * 67 + t * (spec.id === 'METEOR_SHOWER' ? 95 : 18)) % h);
        if (spec.id === 'METEOR_SHOWER') {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - 16, py - 10);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(px, py, 1.8 + (i % 2) * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      return true;
    },


    /* ---------- Patch v5.1.0 [Pillar 1, 2 & 4]: Sect Ceremonies, Martial Arena Ring & Sacred Site Spectacles ---------- */
    resolveActiveCeremonyMode() {
      const prev = this.opts && this.opts.ceremonyPreview;
      if (prev && prev !== 'AUTO' && R.CEREMONY_PRESETS[prev]) return prev;
      const W = this.W;
      if (!W || !W.sect) return null;
      if (W.sect.festival && W.sect.festival.until > W.t) return 'BANQUET';
      if (Array.isArray(W.sect.companions) && W.sect.companions.some(c => c && W.day - (c.marriedDay || 0) <= 2)) return 'COMPANION_WEDDING';
      if (W.sect.ancestralRiteUntil && W.sect.ancestralRiteUntil > W.t) return 'ANCESTRAL_RITE';
      return null;
    },

    drawSectCeremonySpectacles(ctx, hour, night) {
      const W = this.W;
      if (!W || !W.map || !W.map.byId) return false;
      const pl = W.map.byId.plaza;
      if (!pl) return false;
      const mode = this.resolveActiveCeremonyMode();
      if (!mode || mode === 'TOURNAMENT_ARENA') return false;

      const x = pl.x * TS, y = pl.y * TS, w = pl.w * TS, h = pl.h * TS;
      const cx = x + w / 2, cy = y + h / 2;
      const t = this.t;

      ctx.save();
      // 1. Auspicious Crimson-Gold Ceremonial Silk Carpet along Central Plaza Axis
      ctx.fillStyle = mode === 'ANCESTRAL_RITE' ? 'rgba(0,180,216,0.28)' : 'rgba(217,4,41,0.34)';
      ctx.fillRect(cx - 14, y + 6, 28, h - 12);
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(cx - 14, y + 6, 28, h - 12);

      // 2. Mode-Specific Centerpiece Altar & Feast Tables
      if (mode === 'BANQUET') {
        // 4 Jade Feast Tables with golden wine goblets & spirit fruit platters
        const offsets = [[-36, -18], [36, -18], [-36, 18], [36, 18]];
        for (let i = 0; i < offsets.length; i++) {
          const tx = cx + offsets[i][0], ty = cy + offsets[i][1];
          ctx.fillStyle = '#5c3a21';
          ctx.fillRect(tx - 12, ty - 6, 24, 12);
          ctx.strokeStyle = '#ffd166';
          ctx.lineWidth = 1.0;
          ctx.strokeRect(tx - 12, ty - 6, 24, 12);
          ctx.fillStyle = '#80ed99';
          ctx.beginPath(); ctx.arc(tx - 5, ty, 2.2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ff4d6d';
          ctx.beginPath(); ctx.arc(tx + 5, ty, 2.2, 0, Math.PI * 2); ctx.fill();
        }
      } else if (mode === 'COMPANION_WEDDING') {
        // Twin Dragon-Phoenix Wedding Altar & Destiny Red Silk Ribbons
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2 + t * 0.6;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 18);
          ctx.quadraticCurveTo(cx + Math.cos(a) * 18, cy - 10, cx + Math.cos(a) * 34, cy + Math.sin(a) * 20);
          ctx.stroke();
        }
      } else if (mode === 'ANCESTRAL_RITE') {
        // Bronze Ancestral Incense Tripod & Golden Lotus Pillar
        ctx.fillStyle = '#d4a238';
        ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.ellipse(cx, cy, 24, 14, 0, 0, Math.PI * 2); ctx.stroke();
      }

      // 3. Multi-Burst Celestial Qi Fireworks (พลุดอกไม้ไฟปราณเซียน 5 สี) above Plaza
      const fwColors = ['#ffd166', '#ff4d6d', '#00f5d4', '#c77dff', '#80ed99'];
      for (let bIdx = 0; bIdx < 3; bIdx++) {
        const phase = (t * 0.65 + bIdx * 0.33) % 1;
        const fx = cx + (bIdx - 1) * 42;
        const fy = y - 16 - phase * 24;
        const bRad = 4 + phase * 18;
        ctx.strokeStyle = fwColors[(bIdx + Math.floor(t)) % fwColors.length];
        ctx.globalAlpha = clamp(1 - phase * 0.85, 0.15, 0.92);
        ctx.lineWidth = 1.5;
        for (let r = 0; r < 8; r++) {
          const ang = (r * Math.PI) / 4 + phase * 0.6;
          ctx.beginPath();
          ctx.moveTo(fx + Math.cos(ang) * (bRad * 0.3), fy + Math.sin(ang) * (bRad * 0.3));
          ctx.lineTo(fx + Math.cos(ang) * bRad, fy + Math.sin(ang) * bRad);
          ctx.stroke();
        }
      }
      ctx.restore();
      return true;
    },

    drawMartialArenaSpectacles(ctx) {
      const W = this.W;
      if (!W || !W.map || !W.map.byId) return false;
      const tg = W.map.byId.training_ground;
      if (!tg) return false;

      const prev = this.opts && this.opts.ceremonyPreview;
      const activeTourney = !!(W.sect && W.sect.tournament && W.sect.tournament.state === 'run');
      const activeDuel = Array.isArray(W.duelQueue) && W.duelQueue.length > 0;
      const fightingOnArena = Array.isArray(W.npcs) && W.npcs.some(n => !n.dead && n.act && (n.act.id === 'fight' || (n.act.id === 'pair' && n.act.ctx && n.act.ctx.pair && n.act.ctx.pair.type === 'spar')));
      if (prev !== 'TOURNAMENT_ARENA' && !activeTourney && !activeDuel && !fightingOnArena) return false;

      const x = tg.x * TS, y = tg.y * TS, w = tg.w * TS, h = tg.h * TS;
      const cx = x + w / 2, cy = y + h / 2;
      const rx = w * 0.46, ry = h * 0.44;
      const t = this.t;

      ctx.save();
      // 1. Octagonal Golden-Crimson Martial Arena Barrier Ring
      ctx.strokeStyle = activeTourney || prev === 'TOURNAMENT_ARENA' ? '#ffd166' : '#4cc9f0';
      ctx.globalAlpha = 0.62 + 0.16 * Math.sin(t * 3.0);
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let i = 0; i <= 8; i++) {
        const a = (i * Math.PI) / 4 + t * 0.15;
        const vx = cx + Math.cos(a) * rx;
        const vy = cy + Math.sin(a) * ry;
        if (i === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      }
      ctx.stroke();

      // 2. Clashing Shockwave Rings at Arena Center
      const clashR = 8 + ((t * 18) % Math.max(14, Math.min(rx, ry) * 0.75));
      ctx.strokeStyle = '#ffffff';
      ctx.globalAlpha = 0.42;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, clashR, clashR * 0.58, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Four Corner War Banners (ธงศึกพยัคฆ์มังกร 4 ทิศ)
      const corners = [
        [x + 6, y + 6, -1],
        [x + w - 6, y + 6, 1],
        [x + 6, y + h - 6, -1],
        [x + w - 6, y + h - 6, 1]
      ];
      ctx.globalAlpha = 0.9;
      for (let i = 0; i < corners.length; i++) {
        const [bx, by, dir] = corners[i];
        const wave = Math.sin(t * 3.5 + i) * 2.5;
        ctx.fillStyle = '#4a3525';
        ctx.fillRect(bx - 1, by - 24, 2.2, 24);
        ctx.fillStyle = i % 2 === 0 ? '#d90429' : '#ffb703';
        ctx.beginPath();
        ctx.moveTo(bx + 1, by - 23);
        ctx.lineTo(bx + dir * (12 + wave), by - 19);
        ctx.lineTo(bx + dir * (10 + wave), by - 9);
        ctx.lineTo(bx + 1, by - 11);
        ctx.closePath();
        ctx.fill();
      }

      // 4. Floating Heavenly Referee Sword Seal (ตราประทับกระบี่ตัดสินยุทธ์)
      const hoverY = y - 14 + Math.sin(t * 2.6) * 3.0;
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(cx, hoverY - 12);
      ctx.lineTo(cx, hoverY + 6);
      ctx.moveTo(cx - 5, hoverY - 6);
      ctx.lineTo(cx + 5, hoverY - 6);
      ctx.stroke();
      ctx.restore();
      return true;
    },

    drawSacredSiteSpectacles(ctx, hour, night) {
      const W = this.W;
      if (!W || !W.map || !W.map.byId) return false;
      const t = this.t;
      let drew = false;

      ctx.save();
      // 1. Scripture Pavilion (หอคัมภีร์): Orbiting Golden Dao Glyphs
      const sc = W.map.byId.scripture;
      if (sc && !sc.building) {
        const cx = (sc.x + sc.w / 2) * TS, cy = (sc.y + sc.h * 0.45) * TS;
        ctx.fillStyle = '#ffd166';
        ctx.globalAlpha = 0.75;
        for (let i = 0; i < 6; i++) {
          const a = t * 0.8 + (i * Math.PI) / 3;
          const gx = cx + Math.cos(a) * (sc.w * TS * 0.52);
          const gy = cy + Math.sin(a) * (sc.h * TS * 0.28) - 8;
          ctx.fillRect(gx - 2, gy - 3, 4, 6);
        }
        drew = true;
      }

      // 2. Meditation Hall & Spirit Tower: Rising Azure-Gold Lotus Qi Rings
      for (const bid of ['meditation_hall', 'tower']) {
        const b = W.map.byId[bid];
        if (!b || b.building) continue;
        const cx = (b.x + b.w / 2) * TS, cy = (b.y + b.h * 0.5) * TS;
        const phase = (t * 0.45) % 1;
        ctx.strokeStyle = bid === 'tower' ? '#00f5d4' : '#90e0ef';
        ctx.globalAlpha = (1 - phase) * 0.52;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy - phase * 22, (b.w * TS * 0.45) * (1 - phase * 0.25), (b.h * TS * 0.24) * (1 - phase * 0.25), 0, 0, Math.PI * 2);
        ctx.stroke();
        drew = true;
      }
      ctx.restore();
      return drew;
    },


    /* ---------- Patch v5.2.0 [Pillar 3]: Secret Realm Portal Vortex, Ancient Cave & Stele Spectacles ---------- */
    drawSecretRealmPortalSpectacles(ctx, hour, night) {
      const W = this.W;
      if (!W || !W.map || !W.map.byId) return false;
      const t = this.t;
      let drew = false;

      ctx.save();
      // 1. Dimensional Realm Gate (ประตูมิติสู่แดนหมื่นพิภพ): Astral Star-Pillar & Orbiting Runes
      const rg = W.map.byId.realm_gate || W.map.byId.gate_zone;
      if (rg) {
        const cx = (rg.x + rg.w / 2) * TS, cy = (rg.y + rg.h / 2) * TS;
        const isOpen = !!(W.explore && W.explore.gate && W.explore.gate.open);
        const rad = Math.min(rg.w, rg.h) * TS * 0.44;
        ctx.strokeStyle = isOpen ? '#00f5d4' : '#9d4edd';
        ctx.globalAlpha = isOpen ? 0.72 : 0.38;
        ctx.lineWidth = isOpen ? 2.2 : 1.4;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rad, rad * 0.62, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Orbiting dimensional seal runes
        for (let i = 0; i < 8; i++) {
          const a = t * (isOpen ? 1.4 : 0.5) + (i * Math.PI) / 4;
          const rx = cx + Math.cos(a) * (rad * 0.92);
          const ry = cy + Math.sin(a) * (rad * 0.56);
          ctx.fillStyle = i % 2 === 0 ? '#ffd166' : '#72efdd';
          ctx.fillRect(rx - 1.8, ry - 2.4, 3.6, 4.8);
        }
        if (isOpen) {
          // Vertical Astral Light Pillar
          ctx.fillStyle = 'rgba(114,239,221,0.18)';
          ctx.fillRect(cx - 10, cy - 42, 20, 42);
        }
        drew = true;
      }

      // 2. Ancient Stele (ศิลาจารึกโบราณ): Floating Golden Enlightenment Characters
      const st = W.map.byId.stele;
      if (st) {
        const cx = (st.x + st.w / 2) * TS, cy = (st.y + st.h / 2) * TS;
        ctx.strokeStyle = '#ffd166';
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 6, 18, 9, 0, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 4; i++) {
          const phase = (t * 0.5 + i * 0.25) % 1;
          const gx = cx + Math.sin(t * 2 + i * 1.7) * 11;
          const gy = cy + 2 - phase * 24;
          ctx.fillStyle = '#ffe57f';
          ctx.globalAlpha = (1 - phase) * 0.85;
          ctx.fillRect(gx - 1.5, gy - 2, 3, 4);
        }
        drew = true;
      }

      // 3. Myriad Mist Cave (ถ้ำหมื่นสายหมอก): Swirling Amethyst-Azure Spirit Orbs
      const cv = W.map.byId.cave;
      if (cv) {
        const cx = (cv.x + cv.w / 2) * TS, cy = (cv.y + cv.h * 0.65) * TS;
        for (let i = 0; i < 4; i++) {
          const a = t * 1.1 + (i * Math.PI) / 2;
          ctx.fillStyle = i % 2 === 0 ? '#c77dff' : '#48cae4';
          ctx.globalAlpha = 0.65;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * 14, cy + Math.sin(a) * 6 - 6, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        drew = true;
      }
      ctx.restore();
      return drew;
    },

    drawOverlayText() {}
  };

  function c_fill(ctx) { ctx.fill(); }
  function c_arc(ctx, x, y, r) { ctx.arc(x, y, r, 0, Math.PI * 2); }

  /* ---------- Illustrated Wuxia Portrait (Shared Visual Vocabulary with World Sprite) ---------- */
  R.portrait = (canvas, n, size) => {
    const dpr = Math.min(2, g.devicePixelRatio || 1);
    size = size || 40;
    canvas.width = canvas.height = size * dpr;
    canvas.style.width = canvas.style.height = size + 'px';
    const c = canvas.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, size, size);

    const col = n.cult ? PATH_COL[n.cult.path] : ROBE_MORTAL;
    const rk = SECT.RANKS[n.rank] || { color: '#888' };
    const b = (n.h && n.h.body) || {};
    const ageY = (g.HC && g.HC.ageYears) ? g.HC.ageYears(n) : 22;
    const bioAge = (g.HC && g.HC.bioAge) ? g.HC.bioAge(n) : ageY;
    const isF = n.h && n.h.sex === 'F';
    const hs = b.hairStyle || '';
    const wpnObj = n.equip && n.equip.WEAPON;
    const armObj = n.equip && n.equip.ARMOR;
    const accObj = n.equip && n.equip.ACCESSORY;
    const wUsable = !!(wpnObj && (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(n, wpnObj)));
    const ap = {
      skin: b.skinHex || '#e8c49c',
      hair: (b.hairHex === '#e9edf5') ? '#e9edf5' : (bioAge >= 62 ? '#b8bec4' : (b.hairHex || '#222024')),
      eye: b.eyeHex || '#222024',
      long: /ยาว|ปล่อย|ถัก/.test(hs) || (isF && !/สั้น|โกน/.test(hs)),
      bun: /มวย|รวบ|ปิ่น/.test(hs) || (!/โกน/.test(hs) && (n.rank >= 2 || !isF)),
      bald: /โกน|หัวล้าน/.test(hs),
      hasBeard: !isF && ageY >= 38 && !/เกลี้ยง/.test(b.facialHair || ''),
      weaponType: (wpnObj && g.MARTIAL && g.MARTIAL.gearType) ? g.MARTIAL.gearType(wpnObj) : null,
      weaponVisualKey: wpnObj && wpnObj.visualKey ? wpnObj.visualKey : null,
      weaponUsable: wUsable,
      armorVisualKey: armObj && armObj.visualKey ? armObj.visualKey : null,
      accessoryVisualKey: accObj && accObj.visualKey ? accObj.visualKey : null
    };

    // 1. Rich Atmospheric Portrait Background with Subtle Halo & Border
    const bg = c.createLinearGradient(0, 0, 0, size);
    bg.addColorStop(0, shade(rk.color, -0.35));
    bg.addColorStop(0.6, '#1c3630');
    bg.addColorStop(1, '#122420');
    c.fillStyle = bg;
    c.fillRect(0, 0, size, size);

    const s = size / 40;
    c.save();
    c.scale(s, s);

    // Era 5 Pillar 1: Cultivation Realm Mandala & Path Aura in Portrait Background
    if (n.cult) {
      const vState = R.resolveCultivationVisualState(n);
      const stg = vState.normStage;
      const pSig = vState.sig || R.PATH_VISUAL_SIGNATURES.XIAN;
      const rSpec = R.REALM_VISUAL_TIERS[stg] || R.REALM_VISUAL_TIERS[1];
      c.strokeStyle = (pSig.primary || col) + '88';
      c.lineWidth = 1.4;
      c.beginPath(); c.arc(20, 18, 15, 0, Math.PI * 2); c.stroke();
      if (stg >= 3) {
        c.strokeStyle = vState.isApex ? (pSig.primary || rSpec.color) : rSpec.color;
        c.lineWidth = stg >= 7 ? 1.8 : 1.2;
        c.beginPath(); c.arc(20, 17, 16.8, 0, Math.PI * 2); c.stroke();
      }
      if (stg >= 5) {
        const spokes = stg >= 7 ? 12 : 8;
        c.strokeStyle = vState.isApex ? (pSig.secondary || rSpec.color) : rSpec.color;
        for (let i = 0; i < spokes; i++) {
          const a = (i * Math.PI * 2) / spokes;
          c.beginPath();
          c.moveTo(20 + Math.cos(a) * 13.5, 17 + Math.sin(a) * 13.5);
          c.lineTo(20 + Math.cos(a) * 17.5, 17 + Math.sin(a) * 17.5);
          c.stroke();
        }
      }
      if (stg >= 7) {
        // Immortal Flowing Silk Ribbon (仙家披帛) in Portrait
        c.strokeStyle = vState.isApex ? (pSig.accent || '#00f5d4') : '#ffd740';
        c.lineWidth = 1.6;
        c.beginPath();
        c.arc(20, 22, 17.5, Math.PI * 1.08, Math.PI * 1.92);
        c.stroke();
      }
    }

    // 2. Back Hair
    if (ap.long) {
      c.fillStyle = ap.hair;
      c.beginPath(); c.ellipse(20, 22, 11.8, 14.5, 0, 0, 7); c.fill();
    }

    // 3. Layered Wuxia Robe Shoulders & Crossed Lapel Collar
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(3, 40);
    c.quadraticCurveTo(6, 28, 13, 26.5);
    c.lineTo(27, 26.5);
    c.quadraticCurveTo(34, 28, 37, 40);
    c.closePath();
    c.fill();

    // Inner robe fold & collar trim
    c.fillStyle = shade(col, -0.22);
    c.beginPath();
    c.moveTo(14, 27); c.lineTo(20, 38); c.lineTo(26, 27); c.closePath();
    c.fill();

    // Neck
    c.fillStyle = shade(ap.skin, -0.08);
    c.fillRect(16.8, 23.5, 6.4, 6.5);

    // Crossed ivory/gold lapel (交领)
    c.strokeStyle = '#f6ebd2';
    c.lineWidth = 2.0;
    c.beginPath();
    c.moveTo(13.5, 26.5); c.lineTo(21.5, 36.5);
    c.moveTo(26.5, 26.5); c.lineTo(18.5, 34.5);
    c.stroke();

    // Rank badge sash accent at chest
    c.fillStyle = rk.color;
    c.fillRect(15, 36.5, 10, 3.5);

    // 4. Sculpted Head & Ears
    c.fillStyle = ap.skin;
    c.beginPath(); c.arc(10.8, 18, 2.0, 0, 7); c.arc(29.2, 18, 2.0, 0, 7); c.fill();
    c.beginPath();
    c.ellipse(20, 17.2, 8.8, 10.2, 0, 0, 7);
    c.fill();
    c.strokeStyle = 'rgba(100,72,50,0.35)';
    c.lineWidth = 0.6;
    c.stroke();

    // Subtle cheek blush/contour
    c.fillStyle = isF ? 'rgba(225,120,120,0.18)' : 'rgba(180,115,85,0.12)';
    c.beginPath(); c.ellipse(14.5, 19.8, 2.2, 1.2, 0, 0, 7); c.ellipse(25.5, 19.8, 2.2, 1.2, 0, 0, 7); c.fill();

    // 5. Hair Crown, Side Locks & Topknot
    if (!ap.bald) {
      c.fillStyle = ap.hair;
      if (ap.bun) {
        c.beginPath(); c.arc(20, 4.6, 4.2, 0, 7); c.fill();
        // Hairpin (簪)
        c.strokeStyle = n.rank >= 4 ? '#f2cf52' : '#80cbc4';
        c.lineWidth = 1.3;
        c.beginPath(); c.moveTo(14, 4.6); c.lineTo(26, 4.6); ctx_stroke(c);
      }
      c.beginPath();
      c.ellipse(20, 12.2, 9.6, 6.8, 0, Math.PI, 0);
      c.fill();
      // Parted side locks framing temples
      c.beginPath();
      c.moveTo(10.5, 11); c.quadraticCurveTo(13, 14, 11.2, 20); c.lineTo(10.2, 17); c.closePath();
      c.moveTo(29.5, 11); c.quadraticCurveTo(27, 14, 28.8, 20); c.lineTo(29.8, 17); c.closePath();
      c.fill();
    }

    // 6. Expressive Eyebrows, Eyes, Nose & Mouth
    const aggr = (n.h && n.h.personality && n.h.personality.aggression) || 50;
    const emp = (n.h && n.h.personality && n.h.personality.empathy) || 50;
    const slant = aggr > 68 ? 0.8 : emp > 68 ? -0.4 : 0.2;
    c.strokeStyle = ap.hair;
    c.lineWidth = isF ? 1.0 : 1.35;
    c.beginPath();
    c.moveTo(13.5, 14.5 - slant * 0.5); c.quadraticCurveTo(15.8, 13.8, 17.8, 14.6 + slant);
    c.moveTo(26.5, 14.5 - slant * 0.5); c.quadraticCurveTo(24.2, 13.8, 22.2, 14.6 + slant);
    c.stroke();

    // Eyes with white sclera, iris & specular highlight
    c.fillStyle = '#fdfaf2';
    c.beginPath(); c.ellipse(15.8, 17.2, 2.1, 1.45, 0, 0, 7); c.ellipse(24.2, 17.2, 2.1, 1.45, 0, 0, 7); c.fill();
    c.fillStyle = ap.eye;
    c.beginPath(); c.arc(15.9, 17.2, 1.25, 0, 7); c.arc(24.1, 17.2, 1.25, 0, 7); c.fill();
    c.fillStyle = '#ffffff';
    c.fillRect(16.2, 16.5, 0.7, 0.7);
    c.fillRect(24.4, 16.5, 0.7, 0.7);

    // Nose & Mouth
    c.strokeStyle = 'rgba(120,82,58,0.55)';
    c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(20, 17.5); c.lineTo(19.6, 20.5); c.lineTo(20.6, 20.7); c.stroke();

    const mood = (n.h && n.h.state && n.h.state.mood) || 0;
    c.strokeStyle = isF ? '#c45850' : '#a6534a';
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(17.8, 23.0);
    c.quadraticCurveTo(20, 23.0 + clamp(mood / 35, -1.2, 1.4), 22.2, 23.0);
    c.stroke();

    // Beard / Mustache for mature male cultivators
    if (ap.hasBeard) {
      c.fillStyle = ap.hair;
      c.beginPath();
      c.moveTo(17.5, 24.5); c.lineTo(22.5, 24.5); c.lineTo(20, 30.5); c.closePath();
      c.fill();
    }

    // 6B. Equipped Weapon / Legendary Weapon Shoulder Silhouette in Portrait
    if (ap.weaponType && ap.weaponUsable) {
      c.save();
      const isLegW = !!ap.weaponVisualKey;
      c.strokeStyle = isLegW ? '#ffd166' : '#cfd8dc';
      c.lineWidth = isLegW ? 2.0 : 1.4;
      if (ap.weaponType === 'ZITHER') {
        c.fillStyle = isLegW ? '#ff9e00' : '#8d5b4c';
        c.fillRect(29, 22, 7, 14);
        c.strokeRect(29, 22, 7, 14);
      } else if (ap.weaponType === 'BRUSH') {
        c.beginPath(); c.moveTo(31, 35); c.lineTo(36, 16); c.stroke();
        c.fillStyle = '#ef476f'; c.beginPath(); c.arc(36.3, 15, 2.1, 0, 7); c.fill();
      } else if (ap.weaponType === 'WHIP') {
        c.strokeStyle = isLegW ? '#ff4d6d' : '#c77dff';
        c.beginPath(); c.arc(32, 28, 5.5, -1.2, 1.8); c.stroke();
      } else if (ap.weaponType === 'BOW') {
        c.beginPath(); c.arc(31, 24, 9, -1.1, 1.1); c.stroke();
      } else if (ap.weaponType === 'ROSARY') {
        c.beginPath(); c.arc(33, 25, 4.5, 0, Math.PI * 2); c.stroke();
      } else if (ap.weaponType === 'FAN') {
        c.beginPath(); c.moveTo(31, 30); c.arc(31, 30, 7.5, -1.5, -0.3); c.closePath(); c.stroke();
      } else if (ap.weaponType === 'ASTROLABE') {
        c.beginPath(); c.arc(33, 24, 5.2, 0, Math.PI * 2); c.stroke();
      } else if (ap.weaponType === 'ABACUS') {
        c.strokeRect(29, 20, 7, 11);
      } else if (ap.weaponType === 'CLAW') {
        c.strokeStyle = isLegW ? '#ff4d6d' : '#ef476f';
        c.beginPath(); c.moveTo(29, 32); c.lineTo(35, 18); c.moveTo(31, 33); c.lineTo(37, 20); c.stroke();
      } else if (ap.weaponType === 'NEEDLE') {
        c.strokeStyle = isLegW ? '#ffd166' : '#06d6a0';
        c.beginPath(); c.moveTo(31, 32); c.lineTo(36, 15); c.stroke();
      } else {
        c.beginPath(); c.moveTo(30, 34); c.lineTo(36, 12); c.stroke();
      }
      c.restore();
    }
    if (ap.armorVisualKey || ap.accessoryVisualKey) {
      c.save();
      if (ap.armorVisualKey === "vis_celestial_crane_robe") {
        c.strokeStyle = "#90e0ef"; c.lineWidth = 1.4;
        c.beginPath(); c.arc(20, 32, 11, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      } else if (ap.armorVisualKey === "vis_shadow_kirin_cuirass") {
        c.strokeStyle = "#c77dff"; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(10, 31); c.lineTo(20, 36); c.lineTo(30, 31); c.stroke();
      } else if (ap.armorVisualKey === "vis_immortal_tortoise_plate") {
        c.strokeStyle = "#00f5d4"; c.lineWidth = 1.5;
        c.strokeRect(11, 30, 18, 7);
      }
      if (ap.accessoryVisualKey === "vis_bodhi_starlight_beads") {
        c.fillStyle = "#ffd166";
        for (let bi = -2; bi <= 2; bi++) { c.beginPath(); c.arc(20 + bi * 2.5, 31 + Math.abs(bi) * 0.6, 1.1, 0, 7); c.fill(); }
      } else if (ap.accessoryVisualKey === "vis_samsara_karma_ring") {
        c.strokeStyle = "#e0aaff"; c.lineWidth = 1.2;
        c.beginPath(); c.arc(8, 28, 3.2, 0, 7); c.stroke();
      } else if (ap.accessoryVisualKey === "vis_taichi_heaven_seal") {
        c.fillStyle = "#f4a261"; c.fillRect(6, 30, 4, 5);
      } else if (ap.accessoryVisualKey === "vis_dragon_phoenix_bangle") {
        c.strokeStyle = "#2ec4b6"; c.lineWidth = 1.3;
        c.beginPath(); c.arc(8, 32, 3.0, 0, 7); c.stroke();
      }
      c.restore();
    }

    [wpnObj, armObj, accObj].forEach((it, i) => {
      const spec = R.resolveLegendaryGearVisual(it);
      if (!spec || (g.MARTIAL && g.MARTIAL.gearUsable && !g.MARTIAL.gearUsable(n,it))) return;
      c.save();c.translate(6+i*14,35);
      R.methods.drawLegendaryRelicGlyph.call({resolveQuality:()=> 'low'},c,spec,3.1,0,true);
      c.restore();
    });

    // 7. Rank Coronet / Headpiece
    if (n.rank === 6) {
      c.fillStyle = '#f2cf52';
      c.fillRect(13, 5.2, 14, 2.8);
      c.beginPath(); c.moveTo(17.5, 5.2); c.lineTo(20, 0.8); c.lineTo(22.5, 5.2); c.closePath(); c.fill();
      c.fillStyle = '#5ce6c4';
      c.beginPath(); c.arc(20, 4.2, 1.3, 0, 7); c.fill();
    } else if (n.rank === 5) {
      c.fillStyle = '#e8a43a';
      c.fillRect(12.5, 7.2, 15, 2.4);
      c.fillStyle = '#fff0b3';
      c.fillRect(18.5, 6.2, 3, 3.4);
    } else if (n.rank === 4) {
      c.fillStyle = '#b83c2c';
      c.fillRect(12.5, 7.6, 15, 2.0);
    }

    // Era 5 Divine Forehead Mark (花钿 / 道印) for Stage >= 4 Cultivators
    if (n.cult && (n.cult.stage || 1) >= 4) {
      c.fillStyle = (n.cult.stage || 1) >= 7 ? '#00f5d4' : '#ffd166';
      c.beginPath();
      c.moveTo(20, 11.2);
      c.lineTo(21.1, 12.8);
      c.lineTo(20, 14.2);
      c.lineTo(18.9, 12.8);
      c.closePath();
      c.fill();
    }

    // Subtle portrait frame border + Equipment Tier Glow Frame
    const maxPillarTier = Math.max(wpnObj ? (wpnObj.tier || 1) : 0, armObj ? (armObj.tier || 1) : 0, accObj ? (accObj.tier || 1) : 0);
    c.strokeStyle = maxPillarTier >= 5 ? '#ffd54f' : (rk.color + '88');
    c.lineWidth = maxPillarTier >= 5 ? 1.8 : 1.2;
    c.strokeRect(0.6, 0.6, 38.8, 38.8);
    c.restore();

    if (n.dead) {
      c.fillStyle = 'rgba(0,0,0,.58)';
      c.fillRect(0, 0, size, size);
    }
  };

  function ctx_stroke(c) { c.stroke(); }


  /* ---------- Patch v5.1.0 [Pillar 3]: Interactive Full-Body Character Visual Diorama & Relic Showcase ---------- */
  R.characterDiorama = R.diorama = (canvas, n, opts) => {
    if (!canvas || !n) return false;
    opts = opts || {};
    const dpr = Math.min(2, g.devicePixelRatio || 1);
    const w = opts.width || 220;
    const h = opts.height || 136;
    const poseMode = opts.pose || 'cultivate';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    if (canvas.style) {
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const vState = R.resolveCultivationVisualState(n);
    const stg = clamp((n.cult && n.cult.stage) || 1, 1, 9);
    const pKey = (n.cult && n.cult.path) || 'XIAN';
    const rSpec = R.REALM_VISUAL_TIERS[vState.normStage || stg] || R.REALM_VISUAL_TIERS[1];
    const pSig = R.resolvePathVisualSignature(pKey);

    // 1. Scenic Xianxia Night-Mountain & Celestial Aurora Backdrop
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0f1c2e');
    bg.addColorStop(0.55, '#1b3142');
    bg.addColorStop(1, '#122229');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Distant mountain silhouettes & celestial moon/sun disc
    ctx.fillStyle = 'rgba(255,235,160,0.16)';
    ctx.beginPath();
    ctx.arc(w * 0.82, h * 0.24, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(18,38,48,0.75)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.68);
    ctx.quadraticCurveTo(w * 0.25, h * 0.48, w * 0.52, h * 0.70);
    ctx.quadraticCurveTo(w * 0.78, h * 0.50, w, h * 0.66);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // 2. Jade Lotus Meditation / Martial Pedestal
    const cx = w * 0.5, gy = poseMode === 'qinggong' ? h * 0.88 : h * 0.82;
    ctx.fillStyle = 'rgba(12,24,28,0.75)';
    ctx.beginPath();
    ctx.ellipse(cx, gy + 4, 56, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = rSpec.color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(cx, gy + 2, 48, 12, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Render Full-Body Cultivator with all Era 5 Visual Layers using a lightweight stand-in renderer context
    const fakeRenderer = Object.assign({
      W: (g.G && g.G.W) || { t: 720, npcs: [n], byId: { [n.id]: n }, sect: { delegations: {} } },
      cam: { x: 0, y: 0, z: 2.2 },
      t: Number(opts.timeSec) || 2.4,
      uiT: 2.4,
      selected: null,
      apCache: new Map(),
      opts: { names: false, bubbles: false, realmHalos: true, flyingSwords: true, combatSlashes: true }
    }, R.methods);

    const actId = poseMode === 'fight' ? 'fight' : poseMode === 'breakthrough' ? 'breakthrough' : poseMode === 'qinggong' ? 'qinggong' : poseMode === 'mantra' ? 'mantra' : poseMode === 'defensive' ? 'defensive' : poseMode === 'support' ? 'support' : poseMode === 'forbidden' ? 'forbidden' : 'cultivate';
    const proxyNpc = Object.create(n);
    proxyNpc.x = 0;
    proxyNpc.y = 0;
    proxyNpc.px = 0;
    proxyNpc.py = 0;
    proxyNpc.act = { id: actId, ctx: {} };
    ctx.save();
    ctx.translate(cx, gy);
    ctx.scale(2.15, 2.15);
    fakeRenderer.drawNpc(ctx, proxyNpc, { x: 0, y: 0 }, 12);
    ctx.restore();

    // 4. Top-Left Realm & Path Badge Overlay + Border Frame
    const stgTitle = (g.CULT && g.CULT.stageName && n.cult) ? g.CULT.stageName(n) : ('ขั้น ' + stg + ' ' + rSpec.nameTh);
    const badgeTxt = stgTitle + ' · ' + pSig.nameTh;
    ctx.font = '600 10px ' + FONT;
    const badgeW = clamp(Math.ceil(measureCached(ctx, ctx.font, badgeTxt)) + 14, 118, Math.max(118, w - 12));
    ctx.fillStyle = 'rgba(10,18,24,0.82)';
    ctx.fillRect(6, 6, badgeW, 18);
    ctx.strokeStyle = vState.isApex ? (pSig.primary || rSpec.color) : rSpec.color;
    ctx.lineWidth = 1.0;
    ctx.strokeRect(6, 6, badgeW, 18);
    ctx.fillStyle = '#fff5d6';
    ctx.textAlign = 'left';
    ctx.fillText(badgeTxt, 11, 18);

    ctx.strokeStyle = 'rgba(233,205,133,0.65)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(0.7, 0.7, w - 1.4, h - 1.4);
    return true;
  };

  /* ---------- Patch v5.3.0 [Pillar 4]: Interactive Sect Building Architectural Showcase Canvas ---------- */
  R.buildingShowcase = (canvas, b, opts) => {
    if (!canvas || !b) return false;
    opts = opts || {};
    const dpr = Math.min(2, g.devicePixelRatio || 1);
    const w = opts.width || 210;
    const h = opts.height || 96;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    if (canvas.style) {
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const level = clamp(b.level || 1, 1, 5);
    const isPeak = !!b.isPeakSanctuary;
    const accentCol = isPeak ? '#00f5d4' : level >= 4 ? '#ffd740' : level >= 2 ? '#90e0ef' : '#e9cd85';

    // 1. Scenic Mountain Courtyard Backdrop
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#101d29');
    bg.addColorStop(0.6, '#1a2f3b');
    bg.addColorStop(1, '#122128');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // 2. Feng Shui Leyline Foundation Ring
    const cx = w * 0.5, gy = h * 0.78;
    ctx.strokeStyle = accentCol;
    ctx.globalAlpha = 0.58;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(cx, gy, 58, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // 3. Classical Wuxia Pavilion / Hall Silhouette (Multi-Tiered Curved Eaves)
    const tiers = Math.min(3, 1 + Math.floor(level / 2));
    for (let t = 0; t < tiers; t++) {
      const tw = 64 - t * 14;
      const th = 16 - t * 2;
      const ty = gy - 4 - t * 15;
      // Walls & Pillars
      ctx.fillStyle = '#4a3525';
      ctx.fillRect(cx - tw * 0.42, ty - th, tw * 0.84, th);
      ctx.strokeStyle = '#d4a373';
      ctx.lineWidth = 1.0;
      ctx.strokeRect(cx - tw * 0.42, ty - th, tw * 0.84, th);
      // Warm lit window lattice
      ctx.fillStyle = '#ffda8e';
      ctx.fillRect(cx - 8, ty - th + 4, 16, th - 6);
      // Sweeping Chinese Roof Eaves (飞檐)
      ctx.fillStyle = isPeak ? '#1b4332' : level >= 3 ? '#7f1d1d' : '#2b3a42';
      ctx.beginPath();
      ctx.moveTo(cx - tw * 0.62, ty - th + 2);
      ctx.quadraticCurveTo(cx, ty - th - 11, cx + tw * 0.62, ty - th + 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = accentCol;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // 4. Level & Type Badge + Frame
    ctx.fillStyle = '#fff5d6';
    ctx.font = '600 9.5px ' + FONT;
    ctx.textAlign = 'left';
    ctx.fillText((b.nameTh || b.id || 'อาคารสำนัก') + ' · Lv.' + level, 8, 14);
    ctx.strokeStyle = accentCol;
    ctx.lineWidth = 1.3;
    ctx.strokeRect(0.7, 0.7, w - 1.4, h - 1.4);
    return true;
  };



  /* ---------- Patch v5.2.0 [Pillar 4]: Interactive Relic & Equipment Visual Showcase Canvas ---------- */
  R.relicShowcase = (canvas, item, opts) => {
    if (!canvas || !item) return false;
    opts = opts || {};
    const dpr = Math.min(2, g.devicePixelRatio || 1);
    const w = opts.width || 180;
    const h = opts.height || 86;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    if (canvas.style) {
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const eq = item.eq || item.gear || item;
    const tier = clamp(item.tier || eq.tier || 1, 1, 7);
    const gSpec = R.GEAR_TIER_GLOWS[tier] || R.GEAR_TIER_GLOWS[1];
    const isLeg = !!(item.legendary || eq.legendary);
    const stars = clamp(eq.attunedStars || eq.stars || eq.star || (isLeg ? 3 : tier >= 5 ? 2 : tier >= 3 ? 1 : 0), 0, 3);
    const elKey = eq.element || (Array.isArray(eq.runes) && eq.runes[0]) || 'METAL';
    const elPal = R.ELEMENT_VFX_PALETTE[elKey] || R.ELEMENT_VFX_PALETTE.METAL;

    // 1. Deep Sanctuary Relic Pedestal Background
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#101926');
    bg.addColorStop(0.5, '#192a38');
    bg.addColorStop(1, '#0e171f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const cx = w * 0.5, cy = h * 0.54;
    // 2. Radial Tier Halo & Bagua Forge Ring
    ctx.strokeStyle = gSpec.color;
    ctx.globalAlpha = 0.65;
    ctx.lineWidth = isLeg ? 2.0 : 1.4;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 16, 46, 12, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = elPal.primary;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // 3. Weapon / Armor / Accessory Silhouette in Center
    const slot = eq.slot || (item.broadCat === 'EQUIPMENT' ? 'WEAPON' : 'RELIC');
    const wType = (g.MARTIAL && g.MARTIAL.gearType && eq) ? g.MARTIAL.gearType(eq) : (eq.type || 'SWORD');
    ctx.save();
    ctx.translate(cx, cy - 2);
    if (slot === 'ARMOR' || wType === 'ARMOR') {
      ctx.fillStyle = gSpec.color;
      ctx.beginPath();
      ctx.moveTo(-14, -12);
      ctx.lineTo(14, -12);
      ctx.lineTo(11, 14);
      ctx.lineTo(-11, 14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fff5d6';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    } else if (slot === 'ACCESSORY' || wType === 'ACCESSORY') {
      ctx.strokeStyle = gSpec.color;
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = elPal.secondary;
      ctx.beginPath();
      ctx.arc(0, -11, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Weapon Blade / Spear / Zither / Brush / Rosary / Claw / Needle / Fan / Astrolabe / Abacus Silhouette
      if (wType === 'ROSARY' || wType === 'ASTROLABE') {
        ctx.strokeStyle = gSpec.color; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.stroke();
      } else if (wType === 'FAN') {
        ctx.fillStyle = gSpec.color;
        ctx.beginPath(); ctx.moveTo(0, 10); ctx.arc(0, 10, 18, -Math.PI * 0.85, -Math.PI * 0.15); ctx.closePath(); ctx.fill();
      } else if (wType === 'ABACUS') {
        ctx.strokeStyle = gSpec.color; ctx.lineWidth = 2.0;
        ctx.strokeRect(-12, -9, 24, 18);
      } else if (wType === 'CLAW') {
        ctx.strokeStyle = gSpec.color; ctx.lineWidth = 2.0;
        ctx.beginPath(); ctx.moveTo(-14, 10); ctx.lineTo(14, -10); ctx.moveTo(-10, 14); ctx.lineTo(18, -6); ctx.stroke();
      } else if (wType === 'NEEDLE') {
        ctx.strokeStyle = '#06d6a0'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(-16, 10); ctx.lineTo(16, -10); ctx.stroke();
      } else {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(-18, 12);
        ctx.lineTo(18, -12);
        ctx.stroke();
        ctx.strokeStyle = gSpec.color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-9, 9);
        ctx.lineTo(-13, 3);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 4. Star-Attunement Nodes (★1-3) & Awakened Weapon Soul Orb
    for (let i = 0; i < stars; i++) {
      const sx = w - 14 - i * 11, sy = 13;
      ctx.fillStyle = '#ffd740';
      ctx.beginPath();
      ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (isLeg || eq.weaponSpirit || eq.weaponSoul) {
      ctx.fillStyle = '#00f5d4';
      ctx.beginPath();
      ctx.arc(cx + 28, cy - 14, 4.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd740';
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }

    // 5. Tier Label & Border
    ctx.fillStyle = '#fff5d6';
    ctx.font = '600 9.5px ' + FONT;
    ctx.textAlign = 'left';
    const elNameTh = (g.ELEM && g.ELEM.META && g.ELEM.META[elKey] && g.ELEM.META[elKey].shortTh) || elKey;
    ctx.fillText('T' + tier + ' ' + gSpec.nameTh + (elNameTh ? ' · ธาตุ' + elNameTh : ''), 8, 15);
    ctx.strokeStyle = gSpec.color;
    ctx.lineWidth = 1.3;
    ctx.strokeRect(0.7, 0.7, w - 1.4, h - 1.4);
    return true;
  };

  R.describeActiveLegendaryVisuals = n => {
    if (!n || !n.cult) return { weaponVisualKey: null, weaponPresentation: null, armorVisualKey: null, accessoryVisualKey: null, activePassiveAuras: [], activeMantraAura: null, castMotifs: [] };
    const wpn = n.equip && n.equip.WEAPON;
    const arm = n.equip && n.equip.ARMOR;
    const acc = n.equip && n.equip.ACCESSORY;
    const wUsable = !!(wpn && (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(n, wpn)));
    const M = g.MARTIAL;
    const unequipped = new Set(Array.isArray(n.passiveUnequipped) ? n.passiveUnequipped : []);
    const pIds = (Array.isArray(n.passiveLoadout) && n.passiveLoadout.length) ? n.passiveLoadout : n.cult.techs;
    const activePassives = (pIds || [])
      .filter(id => !unequipped.has(id) && n.cult.techs.includes(id))
      .map(id => CULT.tech(id))
      .filter(t => t && (t.passive || t.cat === 'PASSIVE') && (!M || (M.isTechCompatible(n, t) && M.conditionMatches(n, t))))
      .slice(0, 3);
    const activePassiveAuras = activePassives.filter(t => t && t.legendary && t.fxKind).map(t => ({ id: t.id, fxKind: t.fxKind, motif: LEGENDARY_MOTIFS[t.fxKind] || null }));
    const mantraObj = n.cult.mantra ? CULT.tech(n.cult.mantra) : null;
    const activeMantraAura = (mantraObj && mantraObj.legendary && mantraObj.fxKind)
      ? { id: mantraObj.id, fxKind: mantraObj.fxKind, motif: LEGENDARY_MOTIFS[mantraObj.fxKind] || null }
      : null;
    const castMotifs = (n.cult.techs || [])
      .map(id => CULT.tech(id))
      .filter(t => t && t.legendary && t.fxKind && !(t.passive || t.cat === 'PASSIVE'))
      .map(t => ({ id: t.id, fxKind: t.fxKind, motif: LEGENDARY_MOTIFS[t.fxKind] || null }));
    return {
      weaponVisualKey: (wpn && wUsable && wpn.visualKey) ? wpn.visualKey : null,
      weaponPresentation: (wpn && wUsable && wpn.presentationMode) ? wpn.presentationMode : null,
      armorVisualKey: (arm && arm.visualKey) ? arm.visualKey : null,
      accessoryVisualKey: (acc && acc.visualKey) ? acc.visualKey : null,
      activePassiveAuras,
      activeMantraAura,
      castMotifs
    };
  };

  R.PATH_COL = PATH_COL;
  g.Render = R;
})(typeof globalThis !== 'undefined' ? globalThis : this);


;(function syncRenderPathSignaturesV260() {
  const gObj = typeof globalThis !== "undefined" ? globalThis : window;
  const R = gObj.Render;
  if (!R || !R.PATH_VISUAL_SIGNATURES) return;
  const pMap = {"XIAN":"วิถีเซียน","BODY":"วิถีกายา","GOD":"วิถีเทพศรัทธา","DEMON":"วิถีมาร","HEART_SOUL":"วิถีจิตเซน","MECH_PUPPET":"วิถีหุ่นกลไก","KARMA_SAMSARA":"วิถีสังสารวัฏ","BEAST_SOVEREIGN":"วิถีราชันอสูร","SAGE_SUPPORT":"วิถีปราชญ์โอสถ","CRAFT_CREATION":"วิถีหลอมสร้าง","ARRAY_TALISMAN":"วิถีค่ายกลยันต์","STRATEGY_GOVERNANCE":"วิถีพิชัยยุทธ์","ASTRO_DIVINATION":"วิถีโหราดารา","BUDDHA_DHARMA":"วิถีพุทธธรรม","VOID_SPACE":"วิถีมิติเร้น","SONIC_HARMONY":"วิถีคีตยุทธ์","VENOM_GU":"วิถีพิษกู่","PRIMORDIAL_SHIFTER":"วิถีจำแลงอสูร","CELESTIAL_WEATHER":"วิถีบัญชาฟ้าฝน","WANDERING_DAO":"วิถีคนจร","MERCANTILE_DAO":"วิถีวาณิชย์","DRAGON_VEIN_GEOMANCY":"วิถีชีพจรมังกร","GRAVITY_DAO":"วิถีถ่วงดารา","CHRONO_EPOCH":"วิถีกาลเวลา","INK_LITERATI":"วิถีอักษรปราชญ์","SOUL_PUPPETRY":"วิถีเชิดเงา","PRIMORDIAL_CHAOS":"วิถีโกลาหล","SHADOW_SAMURAI":"วิถีดาบไร้ปราณ","NINPO_SHADOW":"วิถีเร้นเงา","NINPO_ELEMENTAL":"วิถีมุทราธาตุ","DIVINE_SUMMONER":"วิถีอัญเชิญเทวะ","DIVINE_POSSESSION":"วิถีร่างทรงเทวะ","DIVINE_CHANNELER":"วิถีสื่อเทวบัญญัติ","VOID_HERETIC_PACT":"วิถีพันธะสุญตา","OCCULT_MAGE":"วิถีไสยเวทย์","DEVOURING_FLESH":"วิถีกลืนสรีระ","NETHER_GRAVE":"วิถีสุสานยมโลก","ANCESTRAL_RITUAL":"วิถีบรรพชน","TIDE_VOYAGER":"วิถีจ้าวสมุทร","LORE_ARCHIVIST":"วิถีอาลักษณ์","FORTUNE_GAMBLER":"วิถีเดิมพันชะตา","SPIRIT_HUSBANDRY":"วิถีพฤกษาปราณ","ARENA_GLORY":"วิถีสังเวียนยุทธ์"};
  for (const [pid, sig] of Object.entries(R.PATH_VISUAL_SIGNATURES)) {
    if (sig && pMap[pid]) sig.nameTh = pMap[pid];
  }
})();

/* Transcendent art direction. Shapes use a 100-unit square shared by Canvas and inventory art. */
;(function (g) {
  const R = g.Render;
  const forms = {
    stone: 'M24 39 46 13 67 20 80 51 70 78 45 87 19 66Z M31 43 48 26 65 34 57 61 37 74 44 49Z',
    sword: 'M74 8 80 17 51 60 63 65 59 72 45 66 31 86 23 80 36 62 26 54 31 48 42 54Z',
    omni: 'M49 6 54 23 63 29 56 49 82 32 90 37 67 60 53 64 55 80 49 93 43 80 45 64 31 60 11 37 18 32 42 49 35 29 44 23Z M49 36 59 57 49 69 39 57Z',
    great: 'M79 8 85 27 68 53 51 63 63 71 57 79 42 69 30 89 21 83 34 63 22 55 28 47 39 53 57 22Z',
    twin: 'M83 9 86 22 52 65 61 68 56 75 47 70 32 89 27 84 41 66 33 59 38 53 47 58Z M14 16 29 25 54 55 64 49 69 55 59 63 75 83 69 90 53 70 44 75 39 69 47 62 21 37Z',
    blade: 'M13 16Q48 56 83 12Q84 45 57 64L64 75 54 79 46 68 27 84 21 77 38 61Q22 52 13 16Z',
    spear: 'M79 7 76 33 63 40 60 35 22 88 15 83 54 32 51 27Z M63 31 68 27 73 17Z',
    halberd: 'M71 11 86 6 78 24 88 33 83 45 68 32 22 88 16 84 60 27 48 31 48 21 65 19Z',
    fist: 'M24 51 21 36 30 22 40 26 46 18 55 23 64 20 75 32 81 52 68 69 63 82 36 80 31 66Z M30 38 45 32 53 41 65 31 72 48 52 62Z',
    bow: 'M16 20Q66 0 84 63L70 81 74 62Q72 18 16 20Z M20 21 71 77 68 80 17 24Z M21 69 67 24 62 22 83 14 76 34 72 29 26 74Z',
    staff: 'M78 8 84 15 24 91 17 85Z M66 16 64 8 72 4 88 17 87 26 79 27Z M32 80 21 76 12 88 19 95Z',
    orb: 'M50 12C76 12 85 40 67 60L50 69 33 60C14 40 24 12 50 12Z M50 24 68 41 50 60 32 41Z M16 37 10 54 24 73 47 89 48 76 26 63Z M84 37 90 54 76 73 53 89 52 76 74 63Z',
    fan: 'M50 85 12 35Q50 -4 88 35Z M50 74 25 32 33 27Z M52 74 44 22 52 20Z M55 74 63 23 72 28Z',
    zither: 'M15 62 62 19 85 28 87 41 43 80 21 79Z M24 64 67 29 72 30 30 68Z M31 71 77 35 82 36 37 75Z',
    brush: 'M25 68 73 16 82 24 34 75Z M11 87Q13 64 25 61L38 74Q26 88 11 87Z M67 22 76 10 87 20 80 30Z',
    whip: 'M15 78 24 61 33 67 24 87Z M26 65C20 38 77 66 78 40 80 20 48 31 51 14 63 22 79 11 88 34 97 59 58 69 35 67Z',
    rosary: 'M50 12C101 12 101 81 50 81 0 81 0 12 50 12Z M50 25C18 25 18 69 50 69 82 69 82 25 50 25Z M43 78 57 78 58 92 50 98 42 92Z',
    claw: 'M19 76 28 53 44 49Q36 22 55 13L53 48Q62 19 72 12L66 52Q80 26 88 27L75 60 58 79 39 91Z M27 72 44 59 64 65 52 77 38 80Z',
    needles: 'M14 75 72 11 83 8 80 22 22 84Z M35 85 84 33 91 32 89 42 43 92Z M7 57 56 10 64 9 62 18 13 64Z',
    dial: 'M50 12C72 12 88 28 88 50 88 72 72 88 50 88 28 88 12 72 12 50 12 28 28 12 50 12Z M50 22C34 22 22 35 22 50 22 65 35 78 50 78 65 78 78 65 78 50 78 35 65 22 50 22Z M50 22 57 49 73 64 49 56 38 65 44 49Z',
    abacus: 'M14 27 85 18 89 69 17 81Z M22 34 24 71 81 64 78 27Z M29 39 75 33 76 38 30 45Z M31 53 77 46 78 52 32 59Z M33 64 79 57 79 61 33 68Z',
    cuirass: 'M13 30 30 19 41 22 50 36 58 22 71 18 87 30 83 56 71 51 69 79 50 89 31 79 29 51 17 56Z M36 46 50 52 64 46 63 64 50 77 37 64Z',
    robe: 'M37 18 50 31 62 18 76 29 91 63 76 70 65 51 69 82 51 91 30 84 35 51 22 71 9 64 24 30Z M44 34 54 39 44 76 36 82Z',
    ring: 'M50 11 65 22 62 35C92 47 82 88 50 88 18 88 8 47 38 35L35 22Z M50 45C30 45 29 77 50 77 71 77 70 45 50 45Z',
    mantle: 'M45 26 49 17 55 26Q72 19 93 32L81 59 72 50 78 81 63 73 51 87 40 75 21 83 29 51 18 61 7 32Q30 19 45 26Z M32 39 50 54 68 39 63 66 50 78 37 66Z',
    coffin: 'M53 11 74 23 76 48 62 85 45 92 24 75 25 45 38 18Z M52 23 66 31 67 49 55 74 45 80 34 70 35 47 44 27Z M47 35 58 40 55 59 46 68 42 60Z',
    scroll: 'M20 24Q20 16 31 16H79Q89 16 88 26L84 32H73L66 76H76Q85 77 81 86H29Q19 85 20 76L29 30H20Z',
    lotus: 'M50 17Q67 32 61 57Q74 37 88 38Q90 65 62 78H38Q10 65 12 38Q30 40 39 57Q33 34 50 17Z',
    wings: 'M49 78Q14 75 8 27Q26 42 39 37L49 53 60 37Q75 42 92 27Q87 74 51 78Z M18 39 31 59 47 70 31 46Z M82 39 69 59 53 70 69 46Z',
    gate: 'M14 31 50 12 86 31 88 42 78 45 77 84 63 84 64 40 50 32 36 40 37 84 23 84 22 45 12 42Z',
    rift: 'M38 5 67 20 60 37 82 43 55 58 66 72 29 93 43 70 30 59 49 44 33 31 50 23Z',
    eclipse: 'M74 17C31 9 11 52 34 79 51 97 76 81 84 68 57 82 34 57 47 34 54 22 65 19 74 17Z M73 23 80 38 92 43 79 50 74 64 69 50 56 44 69 37Z',
    thread: 'M10 64Q40 12 76 17Q57 31 52 54Q67 48 91 30Q58 85 26 85Q45 74 47 60Q26 57 10 64Z',
    storm: 'M45 10 61 23 72 17 82 31 94 40 74 46 83 69 61 65 50 89 38 68 16 76 22 50 6 42 29 35 27 17Z M49 28 56 45 69 49 55 54 50 69 44 54 31 50 44 43Z',
    scale: 'M47 16 53 16 56 61 67 73 33 73 44 61Z M12 38 50 25 88 38 80 44 50 34 20 44Z M15 41 8 59 30 59 23 41Z M77 41 70 59 92 59 85 41Z',
    flame: 'M53 9Q50 33 70 42L72 28Q97 68 66 83 46 94 25 77 4 60 28 35L29 53Q31 27 53 9Z M48 48Q51 64 64 64Q59 84 44 79 31 73 48 48Z',
    wave: 'M7 65Q22 45 42 52Q28 23 64 15 86 10 91 30 72 22 66 41 59 64 91 67L82 80Q54 87 31 69 20 61 7 74Z',
    crystal: 'M49 10 68 41 57 86 38 75 33 39Z M24 29 12 45 23 73 33 61Z M77 31 89 43 77 76 66 67Z',
    vial: 'M39 12 61 12 65 30 59 33 61 44Q82 55 78 72L70 88H30L22 72Q18 55 39 44L41 33 35 30Z M36 65Q50 50 64 65L65 75 35 75Z',
    anvil: 'M11 35 90 35 78 51 62 55 59 69 75 78 75 86H24V78L40 68 38 55 23 51Z M43 10 67 15 65 24 41 20Z',
    banner: 'M25 12 32 12 32 22 84 22 70 41 85 57 32 57 32 88 25 88Z M42 30 66 30 59 40 66 49 42 49Z',
    eye: 'M8 50Q50 9 92 50Q50 91 8 50Z M50 30C24 30 24 70 50 70 76 70 76 30 50 30Z M50 37 60 50 50 63 40 50Z'
  };

  const palette = {
    NEUTRAL: ['#e2ecfc', '#ab96ce'], FIRE: ['#ffc17b', '#ff554a'], WATER_ICE: ['#affbff', '#4e94fd'],
    LIGHTNING: ['#e0c0ff', '#9966ff'], WOOD_LIFE: ['#b2ffd4', '#43d1a3'], EARTH_METAL: ['#ffecad', '#d59457'],
    WIND: ['#c7ffec', '#4fdce5'], YIN_SHADOW: ['#e9aaff', '#9258ee'], LIGHT_YANG: ['#fff4be', '#ffbf61'],
    BLOOD_DEMON: ['#ffbed2', '#fa507c'], ASTRAL_VOID: ['#eee0ff', '#9263ff']
  };
  const gearIds = {
    REGALIA_ORIGIN_FORMLESS_STONE: 'stone',
    ARM_TRANSCENDENT_LOOM_OF_SCARS: 'mantle',
    ACC_TRANSCENDENT_OUROBOROS_SUNDIAL: 'dial',
    WPN_TRANSCENDENT_MYRIAD_ARSENAL_COFFIN: 'coffin',
    EQ_TR_PURE_WPN_GENESIS: 'great', EQ_TR_PURE_ARM_GENESIS: 'cuirass', EQ_TR_PURE_ACC_GENESIS: 'orb'
  };
  const regaliaForms = {
    ORIGIN_STONE:'stone', SWORD:'sword', GREAT_SWORD:'great', TWIN_SWORD:'twin', BLADE:'blade', SPEAR:'spear',
    HALBERD:'halberd', FIST:'fist', BOW:'bow', STAFF:'staff', FOCUS:'orb', FAN:'fan', ZITHER:'zither',
    BRUSH:'brush', WHIP:'whip', ROSARY:'rosary', CLAW:'claw', NEEDLE:'needles', ASTROLABE:'dial',
    ABACUS:'abacus', SACRED_ARMOR:'cuirass', CELESTIAL_ROBE:'robe', ORIGIN_RING:'ring', OMNI_REGALIA:'omni'
  };
  const codexShapes = {
    TCMB: ['rift','fist','thread','eclipse','scale','storm'],
    TMNT: ['orb','ring','gate','eclipse','lotus','dial'],
    TQGG: ['gate','wings','eclipse','wave','thread','rift'],
    TDEF: ['cuirass','robe','orb','gate','eclipse','ring'],
    TSUP: ['needles','zither','banner','lotus','scale','orb'],
    TAUX: ['brush','eye','anvil','dial','abacus','vial'],
    TFRB: ['banner','eclipse','claw','flame','rift','eye'],
    TPAS: ['orb','fist','lotus','eclipse','eye','anvil']
  };

  R.isTranscendent = item => !!(item && (item.transcendent || item.transcendentArt || item.isPatriarchRegalia ||
    item.isTranscendentArmor || item.isTranscendentAccessory || item.isTranscendentWeapon ||
    item.isPureTranscendentGenesis || item.grade === 'Transcendent'));

  R.transcendentArt = (item, id = item && item.id || '') => {
    const codex = /^(T[A-Z]+)_SOV_(\d+)/.exec(id);
    const stage = Math.max(0, Math.min(5, Number(item && item.awakeningStage) || 0));
    const form = item && item.currentForm;
    const slot = item && item.slot;
    const variant = codex ? Number(codex[2]) : 0;
    const theme = codex && codexShapes[codex[1]];
    const regalia = id === 'REGALIA_ORIGIN_FORMLESS_STONE' || !!(item && item.isPatriarchRegalia);
    const sub = item && (item.armorWeightClass || item.accessorySubtype || item.gearType || item.subType);
    let key = gearIds[id];
    if (regalia) key = regaliaForms[form] || 'stone';
    else if (key === 'mantle') key = sub === 'HEAVY' ? 'cuirass' : sub === 'LIGHT' ? 'robe' : 'mantle';
    else if (key === 'dial') key = sub === 'RING' ? 'ring' : sub === 'NECKLACE' ? 'orb' : 'dial';
    else if (key === 'coffin' && sub && slot === 'WEAPON' && item.escortBladesCount) key = regaliaForms[sub] || key;
    else if (theme) key = theme[(variant - 1) % theme.length];
    else if (/^MAT_/.test(id)) key = /ALC/.test(id) ? 'lotus' : 'crystal';
    else if (/^PILL_|@TR:/.test(id)) key = 'vial';
    else if (!key) key = slot === 'ARMOR' ? 'cuirass' : slot === 'ACCESSORY' ? 'orb' : regaliaForms[sub] || 'great';
    if (item && Object.hasOwn(forms, item.vfxShape)) key = item.vfxShape;
    const signature = {
      ARM_TRANSCENDENT_LOOM_OF_SCARS: ['#ffd3e3', '#a73870'],
      ACC_TRANSCENDENT_OUROBOROS_SUNDIAL: ['#c5fff3', '#218e9c'],
      WPN_TRANSCENDENT_MYRIAD_ARSENAL_COFFIN: ['#ffe5ad', '#b3684c']
    }[id];
    const [light, ink] = (signature || palette[item && item.element] || palette.NEUTRAL);
    const accent = (palette[item && item.secondaryElement] || [ '#ffeabc' ])[0];
    return { key, stage, regalia, codex: !!theme, variant, light, ink, accent, path: forms[key] };
  };

  const pulses = {
    chrysalis: ['mantle', '#ffc0d7', '#c13478', '#ffe4ae', 'ดักแด้ทอชะตา'],
    rewind: ['dial', '#bafff3', '#32bbcb', '#f9dc94', 'ย้อนกัลป์'],
    echo: ['dial', '#ddf9ff', '#5e94fe', '#bcfff2', 'เงาสะท้อนกาล'],
    arsenal: ['coffin', '#ffe5ae', '#d18e54', '#9ff5fc', 'หีบหมื่นศาสตรา'],
    clash: ['twin', '#fff2c7', '#b572e6', '#ffadc5', 'สวนคมผ่าจังหวะ'],
    forge: ['anvil', '#fff1b8', '#fb6740', '#cbb6ff', 'ทัณฑ์สวรรค์โรงหลอม'],
    stillWind: ['fan', '#ddfff0', '#299885', '#ffe8c8', 'พัดบัญชาลมเงียบ'],
    horizon: ['robe', '#bcfff3', '#33916a', '#edffb0', 'ม่านพรานเลียบขอบฟ้า'],
    lineage_KUNPENG: ['wings','#caf9ff','#3676c5','#fbdf9c','คุนเผิงโฉบข้ามกระแสลม'],
    lineage_FOX: ['eclipse','#f4daff','#7045b1','#ffd4b3','เก้าหางลวงจันทร์'],
    lineage_QILIN: ['gate','#ebffd3','#368b69','#ffe29c','ม่านกิเลน'],
    lineage_BAIZE: ['eye','#fff3d9','#7670b9','#fff1a1','ไป๋เจ๋ออ่านรอยอาคม'],
    heron: ['wings', '#d3fbff', '#5d84d5', '#f6fcaf', 'พักปีกเหนือผิวน้ำ'],
    awaken: ['stone', '#e0fcff', '#8f79ef', '#ffebb8', 'ตราบรรพชนตื่นรู้']
  };
  const paths = new Map();
  const glyph = (ctx, key, x, y, size, angle, light, ink) => {
    if (typeof Path2D !== 'function') return;
    if (!paths.has(key)) paths.set(key, new Path2D(forms[key]));
    const path = paths.get(key);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(size / 100, size / 100);
    ctx.translate(-50, -50);
    if (Array.isArray(ink)) {
      const fill = ctx.createLinearGradient(5, 11, 85, 97);
      fill.addColorStop(0, ink[0]); fill.addColorStop(.45, ink[1]); fill.addColorStop(1, ink[2]);
      ctx.fillStyle = fill;
    } else ctx.fillStyle = ink;
    ctx.strokeStyle = light;
    ctx.lineJoin = 'round';
    ctx.lineWidth = 1.6;
    ctx.fill(path, 'evenodd');
    ctx.stroke(path);
    ctx.restore();
  };
  const facet = (ctx, x, y, width, height) => {
    ctx.beginPath();
    ctx.moveTo(x, y - height);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x - width, y);
    ctx.closePath();
    ctx.fill();
  };
  const orbit = (ctx, radius, aspect, count, drift) => {
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, radius * aspect, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < count; i++) {
      const a = i * Math.PI * 2 / count + drift;
      facet(ctx, Math.cos(a) * radius, Math.sin(a) * radius * aspect, 2.8, 5.5);
    }
  };
  const bloom = (ctx, x, y, r, color, alpha) => {
    const fog = ctx.createRadialGradient(x, y, 2, x, y, r);
    fog.addColorStop(0, color + '94');
    fog.addColorStop(0.38, color + '54');
    fog.addColorStop(1, color + '00');
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = fog;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  };

  R.drawWornTranscendent = (ctx, npc, item, x, y, size, angle = 0) => {
    if (g.MARTIAL && g.MARTIAL.gearUsable && !g.MARTIAL.gearUsable(npc, item)) return;
    const art = R.transcendentArt(item);
    glyph(ctx, art.key, x, y, size, angle, art.light, art.ink);
  };

  const newMoveShapes = {
    TCMB_SOV_07:['spear', 'wave'], TMNT_SOV_06:['flame', 'lotus'], TQGG_SOV_05:['wings', 'eclipse'],
    TDEF_SOV_05:['gate', 'scale'], TSUP_SOV_05:['vial', 'wave'], TAUX_SOV_06:['dial', 'banner'],
    TFRB_SOV_05:['claw', 'rift']
  };
  R.transcendentCastSpec = (tech, techId, moveId) => {
    if (!R.isTranscendent(tech)) return null;
    const art = R.transcendentArt(tech, tech.id || techId);
    const shapes = newMoveShapes[tech.shortId];
    const index = shapes && (tech.moveDefs || []).findIndex(m => m.id === moveId);
    if (index >= 0 && shapes?.[index]) {
      return { ...art, key:shapes[index], path:forms[shapes[index]], name:tech.moveDefs[index].nameTh };
    }
    return { ...art, name:tech.nameTh };
  };

  R.transcendentProcSpec = event => {
    const proc = pulses[event.kind];
    if (!proc) return null;
    const [key, light, ink, accent, name] = proc;
    const art = event.gear && R.transcendentArt(event.gear);
    return art && event.kind === 'awaken' ? { ...art, name }
      : { key, light, ink, accent, name, presentationRank:event.gear?.gradeRank || 3 };
  };

  R.methods.queueTranscendentCast = function(key, actor, event, art) {
    const previous = this.castActive.get(key);
    if (previous && previous.transcendent && previous.transcendent.key === art.key &&
        this.castClock - previous.start < previous.life * .64) return;
    this.castActive.delete(key);
    if (this.castActive.size >= 24) {
      const ordinary = [...this.castActive].find(([, fx]) => !fx.transcendent);
      this.castActive.delete(ordinary ? ordinary[0] : this.castActive.keys().next().value);
    }
    const scale = R.TILE_SIZE;
    const x = event.x * scale, y = event.y * scale;
    const originX = (Number.isFinite(event.originX) ? event.originX : event.x) * scale;
    const originY = (Number.isFinite(event.originY) ? event.originY : event.y) * scale;
    const recipients = Array.isArray(event.targetPoints) ? event.targetPoints.filter(p => p && Number.isFinite(p.x) && Number.isFinite(p.y)).slice(0, 8) : [];
    this.castActive.set(key, {
      ownerId: actor.id, transcendent: art, transcendentKind: event.kind, verse: event.sovereignVerse,
      x, y, originX, originY, angle: Math.atan2(y - originY, x - originX), recipients,
      start: this.castClock, life: [0, 1100, 1820, 3000][art.presentationRank || 3]
    });
  };

  R.methods.drawTranscendentDelivery = function(ctx, fx, p) {
    const { x, y, originX, originY, transcendent: art } = fx;
    ctx.save();
    ctx.globalAlpha *= Math.sin(p * Math.PI) * .78;
    ctx.strokeStyle = art.light;
    ctx.fillStyle = art.accent;
    ctx.lineWidth = 1.5;
    if (Math.hypot(originX - x, originY - y) > 10) {
      ctx.beginPath();
      ctx.moveTo(originX, originY - 10);
      ctx.quadraticCurveTo((originX + x) / 2, (originY + y) / 2 - 36, x, y - 7);
      ctx.stroke();
      facet(ctx, originX, originY - 10, 4, 6);
    }
    const cap = this.resolveQuality() === 'low' ? 3 : 8;
    for (const point of fx.recipients.slice(0, cap)) {
      const tx = point.x * R.TILE_SIZE, ty = point.y * R.TILE_SIZE;
      if (Math.hypot(tx - x, ty - y) < 6) continue;
      ctx.strokeStyle = point.team ? '#b0ffed' : art.accent;
      ctx.beginPath();
      ctx.moveTo(x, y - 8);
      ctx.quadraticCurveTo((x + tx) / 2, (y + ty) / 2 - 25, tx, ty - 5);
      ctx.stroke();
      ctx.save();
      ctx.translate(tx, ty);
      glyph(ctx, point.team ? 'lotus' : 'rift', 0, -10, 25, 0, ctx.strokeStyle, art.ink + '88');
      ctx.restore();
    }
    ctx.restore();
  };

  R.methods.drawTranscendentSignature = function(ctx, fx, r, center, p, release, full, reduced) {
    const art = fx.transcendent;
    const kind = fx.transcendentKind;
    const n = full && !reduced ? 7 : 4;
    const drift = reduced ? .4 : p;
    const distance = r * (.58 + release * .45);
    ctx.save();
    ctx.globalAlpha *= Math.min(1, p / .25) * .82;
    ctx.strokeStyle = art.light;
    ctx.fillStyle = art.accent;
    ctx.lineWidth = 1.8;
    if (kind === 'chrysalis') {
      // Loom threads close around the wearer, then unfurl from the seam.
      const dome = Math.sin(p * Math.PI) * r * .48;
      for (let i = 0; i < n; i++) {
        const edge = (i - (n - 1) / 2) * r * .13;
        ctx.beginPath();
        ctx.moveTo(edge, 0);
        ctx.bezierCurveTo(edge * 2.6, -dome, edge * 2.3, center - r * .45, edge * .24, center - r * .36);
        ctx.stroke();
        facet(ctx, edge * 2, -dome * .84, 3.5, 7);
      }
    } else if (kind === 'rewind' || kind === 'echo') {
      const sweep = (kind === 'rewind' ? -1 : 1) * drift * Math.PI * 3;
      for (let i = 0; i < n; i++) {
        const a = sweep - i * .34, x = Math.cos(a) * distance, y = Math.sin(a) * distance * .72;
        facet(ctx, x, center * .5 + y, 3, 9);
      }
      ctx.beginPath();
      ctx.moveTo(0, center * .5);
      ctx.lineTo(Math.cos(sweep) * distance, center * .5 + Math.sin(sweep) * distance * .72);
      ctx.stroke();
    } else if (kind === 'arsenal') {
      for (let i = 0; i < n; i++) {
        const side = i % 2 ? -1 : 1;
        const bladeTravel = Math.min(1, release * 1.7);
        const x = side * r * (.3 + i * .09) * (1 - bladeTravel * .76);
        const y = center + side * r * .3 - r * .9 * (1 - bladeTravel);
        ctx.beginPath();
        ctx.moveTo(x * 1.35, y - r * .3);
        ctx.lineTo(x, y);
        ctx.stroke();
        glyph(ctx, i % 3 === 1 ? 'spear' : 'sword', x, y, r * .48, 2.55 + side * .18, art.light, art.ink + 'bd');
      }
    } else if (kind === 'forge' || art.key === 'storm') {
      const colors = kind === 'forge' ? ['#ffd797','#ff8e6a','#bb9dff'] : ['#ffa37d','#9eeaff','#c2ffb1','#ffedaa'];
      for (let i = 0; i < colors.length; i++) {
        const a = i * Math.PI * 2 / colors.length + drift;
        const x = Math.cos(a) * distance, y = Math.sin(a) * distance * .36;
        ctx.strokeStyle = colors[i];
        ctx.beginPath();
        ctx.moveTo(x * 1.21, y - r * .88);
        ctx.lineTo(x * .84, y - r * .37);
        ctx.lineTo(x * 1.03, y - r * .53);
        ctx.lineTo(x * .59, y);
        ctx.stroke();
        glyph(ctx, ['flame','wave','crystal','rift'][i], x, y - r * .3, r * .38, a / 2, colors[i], art.ink + 'aa');
      }
    } else if (art.key === 'thread' || art.key === 'scale') {
      for (let i = 0; i < n; i++) {
        const a = i * Math.PI * 2 / n + drift * .6;
        const x = Math.cos(a) * distance, y = Math.sin(a) * distance * .47;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(-x * .34, center * .28, x * -.63, center + y);
        ctx.stroke();
        facet(ctx, x, y, 3, 6);
      }
    } else if (art.key === 'rift' || art.key === 'fist' || kind === 'clash') {
      ctx.rotate(fx.angle || 0);
      for (let i = 0; i < n; i++) {
        const x = (i - (n - 1) / 2) * distance * .36;
        const y = Math.cos(i * 3.4) * distance * .36;
        ctx.beginPath();
        ctx.moveTo(x * .38, y * .24);
        ctx.lineTo(x * .79, y * .95);
        ctx.lineTo(x * .93 - y * .23, y * .71);
        ctx.lineTo(x * 1.23, y * 1.68);
        ctx.stroke();
        facet(ctx, x * 1.23, y * 1.68, 3, 5);
      }
    }
    ctx.restore();
  };

  R.methods.drawTranscendentScene = function(ctx, fx, p, reduced, full) {
    const art = fx.transcendent;
    const ignition = Math.min(1, (reduced ? p * 1.5 : p) / 0.18);
    const summon = Math.max(0, Math.min(1, (p - 0.12) / 0.29));
    const release = Math.max(0, Math.min(1, (p - 0.43) / 0.28));
    const after = Math.max(0, (p - 0.69) / 0.31);
    const dormant = art.regalia && art.stage === 0;
    const rank = art.presentationRank || 3;
    const radius = full ? (dormant ? 68 : reduced ? 95 : 114 + Math.min(4, (fx.verse || 1) - 1) * 4) : [0,31,64,43][rank];
    const energy = ignition * (1 - after);
    const spin = reduced ? 0 : p * 1.7 * (fx.transcendentKind === 'rewind' ? -1 : 1);
    const theta = Number.isFinite(fx.angle) ? fx.angle : 0;
    ctx.save();
    ctx.globalAlpha *= energy;
    bloom(ctx, 0, -radius * .32, radius * 1.13, art.ink, full ? 0.8 : 0.43);
    ctx.strokeStyle = art.ink;
    ctx.fillStyle = art.accent;
    ctx.lineWidth = 1.5;
    // The inscription forms at ground level while the apparition rises clear of NPC sprites.
    const seal = radius * (0.34 + summon * 0.5 + release * 0.29);
    orbit(ctx, seal, .29, full ? 12 : 4, spin);
    ctx.strokeStyle = art.light;
    orbit(ctx, seal * .73, .23, full ? 6 : 3, -spin);
    const center = -radius * (.21 + summon * .49 - after * .16);
    const apparition = radius * (.37 + summon * .96 - release * .24);
    const satellites = !full || dormant ? 0 : reduced ? 3 : 6;
    for (let i = 0; i < satellites; i++) {
      const a = (i - (satellites - 1) / 2) * .48;
      const spread = radius * (.48 + summon * .41 + release * .27);
      const sx = Math.sin(a + spin * .15) * spread;
      const sy = center - Math.cos(a) * spread * .48 + release * radius * .55;
      const secondary = art.key === 'coffin' ? (i % 2 ? 'spear' : 'sword')
        : art.key === 'mantle' ? 'wings' : art.key === 'fist' ? 'fist'
        : art.key === 'storm' ? ['flame', 'wave', 'crystal', 'rift'][i % 4] : art.key;
      glyph(ctx, secondary, sx, sy, radius * (.18 + summon * .2),
        a * .8 + (art.key === 'dial' ? spin : 0), art.light, art.ink + '76');
    }
    if (full && !dormant) this.drawTranscendentSignature(ctx, fx, radius, center, p, release, full, reduced);
    const tilt = art.key === 'dial' ? spin : Math.sin(theta) * .13;
    if (full) {
      glyph(ctx, art.key, 2, center + 4, apparition, tilt, art.ink, '#1d122ddd');
      glyph(ctx, art.key, 0, center, apparition, tilt, art.light, [art.light, art.ink + 'de', '#22102bb0']);
    } else {
      glyph(ctx, art.key, 0, center, apparition, tilt, art.light, art.ink + 'bd');
    }
    if (release > 0 && after < .96) {
      // In the impact beat each motif has its own motion language.
      ctx.save();
      ctx.globalAlpha *= (1 - after) * (0.45 + 0.55 * Math.sin(release * Math.PI / 2));
      ctx.strokeStyle = art.accent;
      ctx.fillStyle = art.light;
      ctx.lineWidth = full ? 2.2 : 1.15;
      if (['fist','rift','coffin','twin','great','needles','claw'].includes(art.key)) {
        ctx.rotate(theta);
        for (let i = -2; i <= 2; i++) {
          const y = i * radius * .13;
          ctx.beginPath();
          ctx.moveTo(-radius * (.46 + release * .36), y * 1.8);
          ctx.quadraticCurveTo(0, y * .5, radius * (0.43 + release * .49), y * .22);
          ctx.stroke();
        }
      } else if (['dial','eclipse','orb','ring','eye'].includes(art.key)) {
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          const d = radius * (.29 + release * .58 + i * .08);
          ctx.ellipse(0, center * .5, d, d * .55, spin + i * .7, i + p, i + p + 2.9);
          ctx.stroke();
        }
      } else {
        const petalCount = full ? 8 : 4;
        for (let i = 0; i < petalCount; i++) {
          const a = i * Math.PI * 2 / petalCount;
          const x = Math.cos(a) * radius * release, y = Math.sin(a) * radius * release * .44;
          ctx.beginPath();
          ctx.moveTo(x * .28, y * .28);
          ctx.quadraticCurveTo(x * .73 - y * .44, y * .6 - radius * .32, x, y);
          ctx.stroke();
          facet(ctx, x, y, 3, 8);
        }
      }
      ctx.restore();
    }
    if (full && !reduced) {
      ctx.fillStyle = art.accent;
      for (let i = 0; i < 18; i++) {
        const x = Math.sin(i * 2.41) * radius * (.51 + .45 * release);
        const y = -radius * ((i % 9) / 10 + p * .65);
        facet(ctx, x, y, 1.2 + i % 3, 2.3 + i % 4);
      }
    }
    ctx.restore();
  };

  R.methods.drawTranscendentAura = function(ctx, n, by) {
    const equip = n.equip;
    const sect = this.W && this.W.sect;
    const regalia = sect && sect.masterId === n.id && sect.patriarchRegalia;
    const limit = this.resolveQuality() === 'low' ? 1 : 3;
    const time = this.isReducedMotion() ? 0 : this.t || 0;
    let count = 0;
    const draw = item => {
      const art = R.transcendentArt(item);
      const x = count === 0 ? 0 : (count === 1 ? -20 : 20);
      const size = (count === 0 ? 38 : 26) + art.stage * 3;
      ctx.save();
      ctx.translate(x, (by || 0) - 29 - Math.sin(time * 1.6 + count * 2) * 2);
      ctx.globalAlpha *= .79;
      bloom(ctx, 0, 0, size * .67, art.ink, .6);
      glyph(ctx, art.key, 0, 0, size, 0, art.light, art.ink + 'aa');
      ctx.fillStyle = art.accent;
      ctx.strokeStyle = art.ink;
      ctx.lineWidth = 1;
      ctx.translate(0, 26);
      orbit(ctx, size * .53, .29, 4 + art.stage, time * .22);
      ctx.restore();
      count++;
    };
    if (regalia && (!equip || !Object.values(equip).includes(regalia))) draw(regalia);
    for (const slot of ['WEAPON', 'ARMOR', 'ACCESSORY']) {
      const item = equip && equip[slot];
      if (count >= limit) break;
      if (R.isTranscendent(item) && (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(n, item))) draw(item);
    }
    if (count >= limit || !n.cult) return;
    const manual = n.cult.mantra && g.CULT.tech(n.cult.mantra);
    if (R.isTranscendent(manual)) draw(manual);
    if (count < limit) {
      const active = n.passiveLoadout || [];
      const passives = (n.cult.techs || []).filter(id => /^TPAS_SOV_/.test(id));
      const passive = passives.find(id => {
        const tech = g.CULT.tech(id);
        return tech && (tech.zeroSlotPassive || active.includes(id)) && (!g.MARTIAL || !g.MARTIAL.isTechCompatible || g.MARTIAL.isTechCompatible(n, tech));
      });
      if (passive) draw(typeof passive === 'string' ? g.CULT.tech(passive) || { id: passive } : passive);
    }
  };

  R.methods.drawTranscendentScars = function(ctx) {
    const W = this.W;
    if (!W || !W.fights) return;
    const hw = this.vw / (2 * this.cam.z), hh = this.vh / (2 * this.cam.z);
    let budget = this.resolveQuality() === 'low' ? 3 : 8;
    for (const f of W.fights) {
      if (!f || f.over || f.state !== 'fight' || !f.daoScars) continue;
      for (const mark of f.daoScars) {
        if (!mark || mark.remainingTicks <= 0 || !Number.isFinite(mark.x) || !Number.isFinite(mark.y)) continue;
        const x = mark.x * R.TILE_SIZE, y = mark.y * R.TILE_SIZE;
        if (Math.abs(x - this.cam.x) > hw + 60 || Math.abs(y - this.cam.y) > hh + 60) continue;
        if (budget-- <= 0) return;
        const size = 66;
        const themes = { SCAR_VOID_ZERO_RIFT:'rift', SCAR_TECTONIC_GRAVITY_WELL:'fist', SCAR_KARMIC_SILK_WEB:'thread',
          SCAR_ECLIPSE_SHADOW_MIRROR:'eclipse', SCAR_GOLDEN_LOTUS_SANCTUARY:'lotus', SCAR_TIDAL_FRACTURE:'wave', SCAR_PRIMORDIAL_CHAOS_CAULDRON:'storm' };
        ctx.save();
        ctx.globalAlpha *= Math.min(1, mark.remainingTicks / 5) * .72;
        ctx.translate(x, y);
        ctx.scale(1, .43);
        bloom(ctx, 0, 0, size, '#8d5bef', .68);
        glyph(ctx, themes[mark.kind] || 'rift', 0, 0, size, -.6, '#ffcbff', '#512a86');
        ctx.restore();
      }
    }
  };

  R.methods.drawTranscendentCutIn = function(ctx) {
    const fx = [...this.castActive.values()].reverse().find(f => f.transcendent && (f.transcendent.presentationRank || 3) === 3 &&
      this.castClock - f.start > f.life * .13 && this.castClock - f.start < f.life * .56);
    if (!fx || !fx.transcendent.name || this.vw < 240 || this.vh < 320) return;
    const art = fx.transcendent, width = Math.min(this.vw - 32, 408);
    const p = (this.castClock - fx.start) / fx.life;
    // Stay in CSS-pixel view space so camera zoom does not push the title out of view.
    const x = this.vw / 2, y = Math.min(this.vh * .69, this.vh - 130);
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha *= Math.min(1, (p - .13) * 23, (.56 - p) * 19);
    const shade = ctx.createLinearGradient(-width / 2, 0, width / 2, 0);
    shade.addColorStop(0, '#120d2400');
    shade.addColorStop(.21, '#120d24eb');
    shade.addColorStop(.79, '#120d24eb');
    shade.addColorStop(1, '#120d2400');
    ctx.fillStyle = shade;
    ctx.fillRect(-width / 2, -22, width, 44);
    ctx.strokeStyle = art.ink;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-width * .42, 19);
    ctx.lineTo(width * .42, 19);
    ctx.stroke();
    ctx.fillStyle = art.accent;
    facet(ctx, -width * .42, 19, 3, 4);
    facet(ctx, width * .42, 19, 3, 4);
    ctx.textAlign = 'center';
    ctx.font = '600 10px sans-serif';
    ctx.fillText('✦ เหนือตำนาน' + (fx.verse ? ' · บทที่ ' + fx.verse : ''), 0, -5);
    ctx.fillStyle = art.light;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(art.name, 0, 12, width * .88);
    ctx.restore();
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);


/* Four-Symbol companion illustrations. Art is shared by the map, nursery and NPC profile. */
;(function (g) {
  const R = g.Render, CULT = g.CULT;
  // Coordinates use a 160 × 112 field. Each layer carries its own highlight and silhouette.
  const art = {
    AZURE_DRAGON: {
      color:['#103847','#137e85','#55dcc8','#c3ffed','#f6db9b'],
      young:'M31 79Q26 60 47 55Q67 51 82 62Q103 74 111 60Q115 51 103 49Q91 50 86 39L88 25 96 20 97 13 104 20 113 21 126 24 134 39 124 48 116 49Q126 72 108 81Q91 89 75 77Q57 65 43 71Q36 78 50 85L59 97 46 94Q34 93 31 79Z',
      body:'M20 82Q8 71 23 62Q34 50 67 62Q87 73 101 57Q108 48 94 46Q78 44 72 33Q67 23 83 20L99 21 110 12 125 14 130 23 143 29 149 37 142 43 119 42Q128 61 109 75Q88 89 67 76Q39 59 24 71Q18 78 34 81Q58 86 64 100Q52 93 38 94Q25 95 20 82Z',
      shade:'M20 75Q39 54 64 67Q89 80 105 64Q119 50 100 42Q86 39 77 29Q78 39 91 47Q109 53 96 63Q85 74 66 65Q33 49 20 70Z',
      accents:'M98 26 104 12 102 4 109 13 113 18 120 9 127 5 124 14 129 23 121 25 112 20Z M112 36 118 31 124 34 119 38Z M120 44 114 57 108 59 110 47Z M72 72Q67 82 61 85L55 82 58 78 53 79 57 74Z M95 74 103 84 109 82 108 77 112 79 113 85 107 91 99 89 90 77Z M28 84 18 92 18 100 30 96 38 94Z',
      detail:'M144 40Q155 46 157 53M139 41Q146 53 150 55M73 67q5 5 11 5m8-3q6 2 10-2m6-6 3-6m-64 6 5 6m-16-8 4 5m87-34 6 3',
      crown:'M81 24 73 13 76 7 81 15 87 19 84 7 88 2 92 11 98 19 92 25Z M17 69 8 61 11 55 17 60 22 52 25 56 22 66Z',
      insignia:'M83 11Q32 7 24 28Q47 12 65 27Q38 22 23 45Q41 35 50 40M116 73Q140 64 155 50Q152 71 125 85Q139 81 151 85'
    },
    VERMILION_PHOENIX: {
      color:['#571e29','#b93d39','#ff8652','#ffe0ad','#fff172'],
      young:'M80 16Q96 15 99 32L107 39 98 44Q97 57 92 61L100 90 89 103 82 80 75 101 64 101 71 78 53 93 45 91 64 65Q34 65 19 48L35 49 20 32Q46 30 63 49L71 52Q67 43 67 32L61 23 72 25Z M95 52Q113 31 145 33L135 43 150 42Q133 65 102 65Z',
      body:'M80 3 89 14 87 22 94 27 86 31Q95 47 90 62L105 93 96 105 82 80 77 103 67 111 70 81 55 104 46 106 62 76 66 60Q48 53 36 59L8 68 20 54 3 58 17 46 2 43 19 38 5 29Q37 28 57 44L16 13Q59 14 77 43Q74 33 77 23L71 14Z M90 42Q116 17 150 19L130 30 159 25 147 39 159 42 139 49 154 53 135 59 142 68 107 62Q96 60 88 64Z',
      shade:'M80 44Q72 58 82 73L91 77 88 59 95 45 104 33 97 46Q93 55 88 57L87 34Z M53 47 33 37 29 44 53 51Z M106 44 133 32 126 42 108 51Z',
      accents:'M82 4 89 10 90 17 83 18 80 13 77 15 78 9Z M84 26 94 27 86 31Z M75 53 82 41 87 54 82 67Z M61 80 51 100 58 93 68 75Z M93 75 107 96 101 103Z',
      detail:'M12 35 39 43 53 50M20 54l25-6m-11 12 20-6M107 47 148 33M111 52l34-8m-25 12 14-3M88 20l-3 2M71 79l-3 15m16-13 11 19',
      crown:'M78 13 66 8 71 6 65 2 78 6 84 2 88 7Z M21 25 8 16 14 14 34 22Z M134 22 148 10 154 10 148 19Z',
      insignia:'M9 54Q24 10 70 19M90 19Q137 6 153 54M33 96Q40 79 56 71M100 71Q114 82 128 100'
    },
    WHITE_TIGER: {
      color:['#25354c','#7389a7','#e8ebed','#fff6e4','#b8efff'],
      young:'M30 76Q12 74 16 61Q19 52 31 53Q20 62 29 66Q35 48 53 45Q70 40 86 46L95 38Q93 25 104 25L116 31 125 25Q140 24 143 39Q153 47 153 56Q147 72 132 75L127 92 121 99 105 98 100 93 104 76 87 77 78 95 65 96 59 91 63 78 49 78 41 91 28 91 25 85Z',
      body:'M15 75Q7 82 5 71Q2 57 20 55Q31 45 48 40Q67 29 89 39L105 30 110 20 122 25 135 24 142 34 152 42 156 53 146 64 134 64 124 71 120 89 126 96 125 102 105 102 100 95 103 74 94 70 81 77 71 97 66 102 49 101 49 94 60 84 61 70 47 72 40 87 42 96 39 101 21 101 20 96 27 86 27 75Z',
      shade:'M14 68Q33 51 48 49L61 48Q65 59 72 65L65 75 62 89 54 95 63 93 76 75Q93 70 101 62L108 69 111 89 107 95 116 94 119 74 130 63 147 62 153 54 145 57 133 52 123 56Q114 41 97 47L91 43Q63 33 45 46Z',
      accents:'M106 37 112 28 119 35Z M127 40 133 35 137 40 132 43Z M149 46 154 51 150 56 144 52Z M103 37 111 44 101 45 94 40Z M91 41 98 49 86 49 81 39Z M61 38 74 40 67 52 62 50Z M46 43 54 39 48 57 40 62Z M33 54 38 52 34 63 27 69Z M104 72 117 70 112 77 103 78Z M62 76 70 73 68 81 60 85Z M29 78 39 75 34 83 27 86Z',
      detail:'M140 49 133 47m11 6-10 0m-1 3 10 3m-34 37 5 0m-57 0 5 0m-34 0 4 0 M7 59q6 0 10 5m-10 8 6-3 M115 48 117 56 127 56',
      crown:'M107 32 99 23 103 15 111 22 118 29Z M124 29 133 13 141 18 138 30Z M89 37 85 23 91 28 104 36Z',
      insignia:'M15 50 37 17 44 14 32 46M50 37l20-29 6-1-11 27M87 26l16-20 7 0-7 20M119 93l32-18 5-13M11 101l14 7 34-1'
    },
    BLACK_TORTOISE: {
      color:['#191f37','#34506b','#748c91','#82e7cf','#ffdc96'],
      young:'M28 73Q27 46 45 37 62 27 77 30Q103 34 113 55L122 51Q139 48 148 62Q157 77 143 85L126 84 121 93 105 94 99 88 83 89 73 98 59 97 54 90 39 86 29 93 18 90 20 80Z',
      body:'M17 68Q12 55 23 46L27 37Q44 13 87 20Q108 22 125 44L130 53 140 52 152 59 155 70 145 78 130 77 124 95 112 99 101 95 104 81 86 84 79 97 65 100 56 96 59 82 40 77 35 92 20 92 15 86 22 75Z',
      shade:'M27 66Q36 34 66 29Q99 22 119 51L117 62 97 76 61 80 33 72Z M117 71 129 59 143 61 151 69 138 73 126 72Z',
      accents:'M67 28 90 27 104 40 92 59 66 58 55 42Z M34 45 48 36 56 45 62 58 50 71 31 65Z M76 63 95 62 101 69 94 75 68 80 61 74Z M109 43 120 53 116 62 102 67 98 58Z M142 62 147 64 143 67 138 65Z M18 85 23 82 28 86 24 92Z M66 93 72 90 75 96 68 99Z',
      detail:'M69 33 88 32l9 9-7 12-20 0-8-12Z M39 48l9-5 8 12-8 9-11-4Z M72 69l18-2m-19 6 18-3m15-18 10 3m28 13 9 2',
      crown:'M26 52Q10 52 8 34Q6 16 26 15L30 9 40 13 45 21 40 25 28 24Q22 23 19 31Q18 43 30 43Z M67 30 68 13 74 8 79 14 79 28Z M94 34 100 16 105 13 110 23 106 42Z',
      insignia:'M10 89Q40 113 76 103Q109 103 147 89M14 95Q43 118 81 107Q125 110 152 91M11 36q2-18 18-20'
    }
  };
  const lineageArt = {
    KUNPENG: {
      colors:[
        ['#183b50','#34758a','#73c7cd','#d8faf2','#e0d2ae'],
        ['#16394e','#39759e','#7bd6ec','#e1ffff','#f8dc9f'],
        ['#18233d','#4554a8','#6dd9fd','#eefdff','#ffe0a0']
      ],
      young:'M80 36Q103 21 131 24L116 34 146 33 130 47 147 52Q123 59 106 63L96 76 107 92 85 88 77 101 66 91 52 96 64 72Q37 61 17 55L29 49 13 37 40 41 23 26Q61 24 80 36Z',
      body:'M77 37Q57 19 14 14L21 25 40 35 9 29 19 41 33 46 5 46 23 60 7 60 33 69 26 75 59 73 69 67 61 82 45 94 65 89 76 105 89 89 106 97 94 79 92 69 106 60 133 66 150 59 142 55 160 48 149 42 157 36 129 39 151 22 158 9Q112 15 94 34L84 22 75 23 67 30Z',
      shade:'M24 26Q53 26 74 45L83 37 93 45Q116 28 148 19L128 39 103 56 94 59 91 75 84 83 81 99 75 83 66 88 73 69 58 62 42 64 17 56 39 57 25 49 48 53 23 39 43 43Z',
      accents:'M71 34 80 22 89 28 95 36 84 33 81 38Z M76 39 83 35 89 41 81 48Z M55 68l19-6-6 10Z M109 62 95 57 99 64Z M112 32l-12 15 18-10Z M47 36l17 14-21-8Z',
      detail:'M16 48Q43 49 59 60M25 57L56 64M145 42Q126 49 113 55M135 54l-24 6M53 42l14 10m26 2 17-13M73 80l7-6 7 7m-5-39 5 2m-4-10 2 0',
      crest:'M74 29 71 16 77 20 81 9 87 17 87 24 93 20 90 32Z M20 23l-8-18 18 11 7 9Z M131 29l15-16 13-5-12 20Z',
      crown:'M17 55Q46 78 71 52Q96 19 130 25Q114 31 112 40L153 32Q151 44 115 65Q99 81 93 89L121 97Q98 108 75 93Q51 97 36 92L53 84Q32 75 17 55Z',
      insignia:'M11 80Q42 101 75 91Q106 83 151 80M15 97Q50 112 97 106Q133 100 152 88M9 29Q35 10 55 13M109 14Q138 1 153 9'
    },
    FOX: {
      colors:[
        ['#4b2c43','#93617e','#e8a5aa','#fff1eb','#ffceb7'],
        ['#3c2f5a','#7f74ac','#c5bdff','#fff1fd','#ffdbad'],
        ['#281e49','#61459f','#c1a5ff','#fff4fd','#ffda99']
      ],
      young:'M35 78Q25 57 36 47Q49 35 72 49L87 47 97 25 103 15 119 36 135 20 137 49 148 58 139 73 121 78 114 96 97 97 102 80 91 78 74 86 70 98 55 97 56 82Z',
      body:'M33 76Q22 54 41 43Q62 36 81 46L92 44 100 30 102 6 120 32 139 12 143 38 139 48 154 55 146 67 127 75 121 94 116 101 100 99 104 87 109 75 96 75 79 86 75 98 58 100 58 91 61 84 48 78 39 89 24 92 24 84Z',
      shade:'M34 67Q42 46 62 42Q81 44 91 49L107 48 117 35 133 37 138 47 151 55 132 60 115 62 102 68 85 69 70 80 58 75 48 71Q44 70 34 77Z',
      accents:'M108 21l8 14-9 4Z M135 26l-2 11 7 4Z M117 48l7-2 7 4-7 3Z M143 54l10 1-5 5Z M115 63l15-2-9 8Z M75 55Q55 49 44 57L55 61 70 59Z',
      detail:'M117 54l3 2m5 12 10-3m-24 25 8 0m-54 2 8-1M101 55Q93 64 85 66M111 43l5-4',
      crest:'M113 39 119 29 124 40 126 25 132 33 134 46 123 51Z',
      crown:'M94 71Q109 30 82 9Q102 5 110 22Q125 49 100 77Z',
      insignia:'M12 76Q45 105 101 96Q139 91 153 64M9 46Q32 20 72 17M71 17q-7 10-3 14'
    },
    QILIN: {
      colors:[
        ['#1f473c','#4d8a63','#90d6a5','#e8ffce','#fcc778'],
        ['#314437','#729159','#e0dc81','#fff5c2','#ffd272'],
        ['#153733','#2a866c','#8ceac0','#f0ffcc','#ffdb88']
      ],
      young:'M25 76 16 67 23 60 33 62Q49 51 72 55L90 50 99 31 108 25 117 30 127 22 133 38 145 47 136 58 120 58 114 70 114 91 118 99 103 99 100 88 90 76 73 78 72 96 57 100 56 88 59 79 43 77 38 91 24 94Z',
      body:'M15 72Q2 66 9 53L12 43 17 51 24 48 21 61 30 64Q48 44 75 46L91 43 100 25 105 21 111 7 115 21 126 18 134 6 134 23 138 38 154 47 145 57 133 59 121 54 114 63 112 74 112 92 118 99 115 102 98 101 96 94 98 76 88 73 76 79 70 101 56 102 54 95 60 87 60 76 45 75 39 85 40 94 29 97 21 90 25 82Z',
      shade:'M33 64Q46 46 72 49L91 51 99 43 106 24 116 25 120 35 131 31 139 45 150 48 138 52 127 48 117 50 113 62 100 70 82 67 72 73 48 73 38 69Z',
      accents:'M117 43l9-6 7 6-8 4Z M101 53l13-9-5 16-5 4Z M92 54l8 6-10 6-6-6Z M77 53l7 6-6 6-9-5Z M62 53l7 6-7 6-9-5Z M49 56l7 7-9 5-6-7Z M104 91l9 0 3 8-12 0Z M58 94l12 0-4 6-12 0Z M24 87l12-3 2 7-11 2Z',
      detail:'M146 51l-8 2m-26-31-9 8m-25 33-12 4m14 7 10-4m16 1 6-5M18 58q2 7 8 9m91-22 7 0',
      crest:'M100 28 91 24 88 13 79 5 85 5 95 15 93 7 97 2 100 14 106 18 107 29Z M123 30 129 15 140 7 143 7 141 15 135 23 142 19 148 20 139 27 129 34Z',
      crown:'M77 62 73 40 66 31 71 26 74 34 82 38 87 29 85 21 93 22 98 37 91 59 84 65Z M120 90 128 75 138 65 132 82 124 94Z M28 95l-7-19 13 8 7 12Z',
      insignia:'M13 91Q51 99 79 97Q113 93 146 77M13 99Q75 114 144 88M47 9q10 7 16 23m60-26q-5 8-5 16'
    },
    BAIZE: {
      colors:[
        ['#303748','#7f8a9d','#d8e1da','#fff9e2','#dbf5db'],
        ['#303054','#717797','#b9d7e0','#f9f5dd','#ffe0a0'],
        ['#24223e','#596898','#dfd9fc','#fff8df','#ffe3ac']
      ],
      young:'M19 69Q8 58 12 49L25 51 27 64Q50 39 85 39L99 42 103 25 110 18 116 30 128 28 135 18 140 31 136 43 152 53 142 69 127 74 118 93 102 96 100 88 103 75 84 79 75 95 57 94 60 81 39 80 30 95 17 93 18 83Z',
      body:'M12 62Q2 55 5 46Q15 43 18 53L23 64 34 62Q57 40 81 43L97 40 99 23 104 13 113 27 123 24 129 6 137 4 141 14 134 31 143 41 154 44 159 53 150 68 139 65 127 76 124 93 129 99 113 104 101 96 104 79 92 80 85 91 81 103 64 103 61 96 64 85 50 80 45 91 45 99 30 101 25 93 32 79 20 75Z',
      shade:'M15 67Q29 64 43 53 70 37 96 48L107 45 109 32 123 29 137 41 150 46 153 51 146 58 132 56 118 65 98 64 81 70 66 72 49 73 32 79Z',
      accents:'M98 44l8-11 11 8-7 14Z M119 46l8-7 11 5-11 6Z M148 51l9 0-4 5Z M99 58l12 3-7 14-10 1Z M124 61l14 4-13 9-7 1Z M48 58q9-8 19 1-9 9-19-1Z M75 54q8-8 17 0-8 8-17 0Z',
      detail:'M45 62q10 7 24 2m7-8 3-2m12 19q5-4 10-5m24-23 4 0m16 14-7 1m-16 32 7 1m-61-2 8 0m-48-1 7-1',
      crest:'M100 34 94 25 91 12 96 6 104 17 108 33Z M125 34l1-13 7-14 7-4 0 15-9 18Z',
      crown:'M32 66 21 48 31 34 45 32 57 23 68 24 76 19 89 28 96 29 99 43 91 57 78 63 67 56 52 60 41 58Z',
      insignia:'M16 33Q77 -4 145 30M9 69Q22 95 54 103M109 101Q145 89 154 69M44 14l5 8m22-13 3 9m25-8-1 8'
    }
  };
  const illustration = spec => {
    if (spec.symbol) return art[spec.symbol];
    const form = lineageArt[spec.familyId];
    return form && { ...form, color:form.colors[spec.gradeRank - 1] };
  };
  const foxTail = (i, grade, stage) => {
    const h = 21 + i * 6.6, spread = stage === 1 ? 17 : 27, reach = 31 + Math.sin(i * .45) * spread;
    return `M52 75Q${reach} ${h + 22} ${7 + i * 2} ${h}Q${28 + i * 3} ${h - 13 - 2 * grade} ${reach + 18} ${h + 19}L55 75Z`;
  };
  const look = (spec, stage) => {
    const p = illustration(spec);
    const [ink, mid, light, shine, gold] = p.color;
    if (stage === 0) {
      return [
        ['M74 13C60 19 42 50 43 71C44 92 61 103 81 102C101 102 118 88 116 69C114 51 95 16 82 13Z', mid, light, 2.6],
        ['M74 22C65 27 50 55 53 70Q57 83 68 87Q56 66 77 30Z', light, null, 0],
        ['M101 43 85 50 88 62 70 70 69 77 57 85M86 49l-8-6m10 20 10 7', null, shine, 2.3],
        ['M83 27 88 34 83 41 78 34Z M95 75 99 81 95 87 91 81Z', gold, null, 0]
      ];
    }
    if (spec.familyId) {
      const rank = spec.gradeRank;
      const layers = [];
      if (stage >= 3 && rank >= 2) layers.push([p.insignia, null, gold, rank === 3 ? 2.6 : 1.3]);
      if (stage >= 3 && rank === 3) layers.push([p.crown, ink, light, 1.65]);
      if (spec.familyId === 'FOX') {
        for (let i = 0; i < (stage === 1 ? 3 : 9); i++) {
          layers.push([foxTail(i, rank, stage), i % 2 ? mid : light, i % 3 ? ink : gold, stage === 1 ? 1.7 : 1.25]);
        }
      }
      layers.push([stage === 1 ? p.young : p.body, mid, ink, 2.8]);
      if (stage > 1) layers.push([p.shade, light, null, 0], [p.detail, null, rank === 1 ? ink : gold, 1.15]);
      layers.push([p.accents, shine, ink, 1.25]);
      if (stage >= 3 || rank >= 2 && stage >= 2) layers.push([p.crest, mid, rank === 1 ? ink : gold, 1.5]);
      return layers;
    }
    if (stage === 1) {
      const eyes = { AZURE_DRAGON:'M112 34l6-2 3 4-6 2Z', VERMILION_PHOENIX:'M88 29l5 2-4 3-4-2Z',
        WHITE_TIGER:'M119 44l5-3 4 5-5 2Z M138 53l7 1-4 5Z',
        BLACK_TORTOISE:'M130 64l6-3 3 4-5 3Z M57 44l19-8 18 11-9 13-23 1Z' };
      return [[p.young, mid, ink, 3.2], [eyes[spec.symbol], shine, ink, 1.25]];
    }
    const layers = [];
    if (stage >= 3) layers.push([p.insignia, null, gold, stage === 4 && (spec.gradeRank || 3) >= 2 ? 2.3 : 1.05]);
    if (stage === 4) layers.push([p.crown, mid, shine, 1.75]);
    layers.push([p.body, mid, ink, stage === 1 ? 4.2 : 3.3], [p.shade, light, null, 0],
      [p.accents, stage === 1 ? light : shine, ink, 1.35], [p.detail, null, stage >= 3 ? gold : ink, 1.3]);
    return layers;
  };
  R.sovereignCompanionSvg = (speciesId, stage) => {
    const spec = CULT.curatedCompanionSpec(speciesId);
    if (!spec) return '';
    const [ink, mid, light, shine, gold] = illustration(spec).color;
    return '<svg viewBox="0 0 160 112" aria-hidden="true" focusable="false">' +
      '<ellipse cx="80" cy="96" rx="57" ry="9" fill="' + ink + '" opacity=".52"/>' +
      (stage === 4 && (spec.gradeRank || 3) >= 2 ? '<path d="M14 79Q79 59 146 79Q118 101 80 102Q41 102 14 79Z" fill="none" stroke="' + light + '" opacity=".7"/>' : '') +
      look(spec, stage).map(([path, fill, stroke, width]) => '<path d="' + path + '" fill="' + (fill || 'none') +
        '" stroke="' + (stroke || 'none') + '" stroke-width="' + width +
        '" stroke-linecap="round" stroke-linejoin="round" />').join('') +
      (stage === 4 ? '<path d="M80 3 83 8 80 13 77 8Z M17 38 20 43 17 48 14 43Z M143 36 146 41 143 46 140 41Z" fill="' + gold + '"/>' : '') +
      '</svg>';
  };

  const paths = new Map();
  R.drawSovereignCompanion = (ctx, speciesId, stage, x, y, scale, time, face, riding = false) => {
    const spec = CULT.curatedCompanionSpec(speciesId);
    if (!spec || typeof Path2D !== 'function') return false;
    const [ink, mid, light, shine, gold] = illustration(spec).color;
    const floating = spec.symbol === 'AZURE_DRAGON' || spec.symbol === 'VERMILION_PHOENIX' || spec.familyId === 'KUNPENG';
    ctx.save();
    ctx.translate(x, y - (floating && !riding ? Math.sin(time * 2.1) * 3 + scale * 13 : 0));
    ctx.scale((face || 1) * scale, scale);
    ctx.translate(-80, -94);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.fillStyle = '#11182670';
    ctx.beginPath(); ctx.ellipse(80, 103, stage === 4 ? 60 : 48, 11, 0, 0, Math.PI * 2); ctx.fill();
    if (stage >= 3 && (spec.gradeRank || 3) >= 2) {
      const aura = ctx.createRadialGradient(80, 58, 8, 80, 58, 76);
      aura.addColorStop(0, mid + 'a8');
      aura.addColorStop(1, mid + '00');
      ctx.fillStyle = aura; ctx.fillRect(4, -18, 152, 152);
    }
    for (const [d, fill, stroke, width] of look(spec, stage)) {
      if (!paths.has(d)) paths.set(d, new Path2D(d));
      const path = paths.get(d);
      if (fill) {
        if (fill === mid) {
          const gradient = ctx.createLinearGradient(8, 88, 112, 11);
          gradient.addColorStop(0, ink);
          gradient.addColorStop(.47, mid);
          gradient.addColorStop(1, light);
          ctx.fillStyle = gradient;
        } else ctx.fillStyle = fill;
        ctx.fill(path);
      }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(path); }
    }
    if (stage === 4 && (spec.gradeRank || 3) === 3) {
      ctx.strokeStyle = light + 'b0';
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.ellipse(80, 102, 64, 12, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = gold;
      for (let j = 0; j < 6; j++) {
        const a = j * Math.PI / 3 + time * .31;
        const sx = 80 + Math.cos(a) * 68, sy = 61 + Math.sin(a * 1.7) * 42;
        ctx.beginPath(); ctx.moveTo(sx, sy - 5); ctx.lineTo(sx + 3, sy); ctx.lineTo(sx, sy + 5); ctx.lineTo(sx - 3, sy); ctx.closePath(); ctx.fill();
      }
    }
    ctx.restore();
    return true;
  };
  // Shared coordinates for the map and the NPC card. Tier accents sit behind each silhouette.
  const regionalArt = {
    TAOTIE: {
      color:['#22152d','#5a385b','#ce84a1','#f9c17b'],
      body:'M23 89 27 67 16 55 32 61 46 47 64 45 77 56 91 47 96 32 109 42 116 21 131 32 127 46 145 57 147 68 134 72 126 71 131 85 123 96 111 96 113 78 89 75 79 94 67 94 72 76 57 78 46 94 33 94 39 77Z',
      detail:'M91 48Q106 47 108 60L123 62 116 70 101 67 91 55Z M35 64Q52 52 68 55L52 71Z M119 45 134 52 125 54Z',
      accent:'M32 83Q78 28 141 83 M50 77 48 64 56 59 66 64 65 71 60 75 55 72 M123 64 130 64 126 72Z'
    },
    BODHI: {
      color:['#172b29','#495943','#96b276','#ebd58b'],
      body:'M30 81 44 65 33 59 21 40 38 50 53 50 55 31 69 24 67 10 81 21 92 28 98 15 111 11 110 26 122 29 133 22 128 41 146 48 129 57 108 53 109 67 125 76 142 92 119 88 103 77 111 94 98 94 86 81 66 89 56 94 43 94 50 79Z',
      detail:'M68 23 64 48 72 62 62 82 75 75 83 60 79 51 88 46 99 55 104 49 94 42 101 29 84 39Z M24 51 39 58 51 60 43 55Z',
      accent:'M62 89Q82 67 93 85 M42 62Q84 18 125 60 M79 53 84 45 89 53 84 60Z M111 35 119 29 118 37Z'
    },
    HAWK: {
      airborne:true, color:['#17263d','#415880','#a6c9f0','#baf9ff'],
      body:'M17 36 47 40 59 55 74 59 76 49 64 28 59 13 77 22 90 39 103 39 114 30 123 34 132 44 143 46 135 52 122 53 116 68 102 77 91 79 76 91 60 89 67 81 53 81 32 66 15 59 29 58 12 48 32 50Z',
      detail:'M36 52 57 60 76 68 65 75 45 67Z M74 29 92 44 103 51 93 56 78 42Z M113 36 121 36 129 46 120 46Z',
      accent:'M26 74Q60 96 140 60 M38 79Q90 104 139 69 M123 43 130 44 125 47Z M101 62 108 57'
    },
    FOX: {
      color:['#302644','#7a6891','#ddcbed','#f3b9cf'],
      back:Array.from({length:9}, (_, i) => {
        const x = 17 + i * 5, y = 17 + Math.abs(i-4)*4;
        return 'M65 76Q' + (x-19) + ' 77 ' + x + ' ' + y + 'Q' + (x+8) + ' ' + (y+19) +
          ' 52 55Q64 60 70 72Z';
      }),
      body:'M43 78 53 64 69 61 95 65 111 54 110 42 121 49 132 38 135 57 146 66 139 73 123 73 113 83 114 93 104 93 100 81 83 85 75 95 65 95 68 82 57 91 48 91Z',
      detail:'M96 65 111 54 114 62 132 57 144 65 139 72 124 69 115 76 104 75Z M130 48 132 56 127 56Z',
      accent:'M44 30Q69 20 76 48 M115 74Q126 72 134 70 M132 62 137 62 134 65Z'
    },
    TORTOISE: {
      color:['#382329','#815044','#c28d60','#ffc46f'],
      body:'M16 85 26 78 30 65 45 51 63 44 81 34 100 45 115 61 129 61 141 68 145 76 135 81 124 81 122 90 111 92 102 86 66 88 56 93 42 93 49 84 30 83Z',
      detail:'M31 77 41 59 61 54 61 65 55 76Z M65 51 82 39 99 47 101 59 87 71 68 63Z M90 74 104 62 112 63 120 76 109 82Z',
      accent:'M61 54 65 66 56 78 M82 39 85 50 79 57 86 68 78 80 M103 63 106 72 116 74 M135 72 138 73'
    },
    SCORPION: {
      color:['#3d2327','#8f4e36','#cc8361','#ffc590'],
      body:'M38 80 43 67 53 62 68 63 81 72 94 70 102 55 102 41 91 33 80 33 71 40 66 35 71 21 77 27 93 24 109 31 116 44 114 59 102 77 88 83 76 84 71 93 63 92 67 81 58 80 54 92 47 91 49 79 43 79 38 91 30 90 34 77 24 74 17 64 21 56 27 64 32 64 29 54 39 60 37 70Z',
      detail:'M43 69 51 63 58 67 50 76Z M59 66 67 66 72 73 66 79 57 75Z M103 44 114 45 113 51 103 50Z M88 28 93 26 100 29 98 33Z',
      accent:'M71 25 74 31 69 34 M44 77 49 78 M103 56 111 58 M79 85 88 85'
    },
    PYTHON: {
      color:['#183929','#447858','#82be83','#e8d787'],
      body:'M23 87Q15 70 44 65Q65 61 78 68Q102 78 111 63Q112 57 104 52L98 46 101 39 117 33 132 37 139 46 133 52 119 55Q137 78 113 88Q93 97 76 86Q47 71 37 82Q33 88 55 92L57 96Q26 99 23 87Z',
      detail:'M102 46 112 39 126 38 137 45 124 47 118 51Z M31 75Q51 67 72 75L70 81Q50 75 31 83Z',
      accent:'M53 70 60 74 M67 72 74 78 M83 80 87 86 M97 81 101 86 M113 73 117 76 M126 42 130 43'
    },
    BAT: {
      airborne:true, color:['#261b39','#664d86','#b6a8d6','#f4b4d8'],
      body:'M76 51 69 40 67 28 77 35 87 31 94 21 98 36 94 49Q119 22 149 30L137 46 137 63Q120 51 118 69Q105 59 94 78L85 87 75 76Q61 60 48 69Q43 53 24 63L24 47 12 38Q42 26 76 51Z',
      detail:'M27 43 56 47 70 62Q59 54 49 61Q44 53 29 56Z M102 56 119 43 139 35 134 47 132 55Q123 49 118 58Z M74 41 80 38 91 38 94 42 91 50 77 51Z',
      accent:'M82 43 85 44 M91 42 92 43 M19 70Q37 67 49 74 M113 75Q125 66 140 68'
    },
    BOAR: {
      color:['#302a2a','#77645b','#bdab90','#f1ddae'],
      body:'M25 74 28 63 39 61 45 53 56 54 63 47 73 51 86 46 93 53 105 52 119 61 130 61 137 68 136 76 124 82 113 81 107 92 99 92 100 81 66 84 57 94 49 94 51 84 33 82 24 87 18 84Z',
      detail:'M45 63 54 55 59 62 65 55 71 61 82 53 92 60 83 66 61 67Z M116 64 128 64 135 68 133 73 118 72Z M125 77 139 66 136 81 126 84Z',
      accent:'M47 74 60 71 82 70 M111 66 115 66'
    },
    CRANE: {
      color:['#224340','#7cb0a2','#deefe0','#e8be7c'],
      body:'M37 73 24 68 38 65 54 60 74 62 91 67 97 56 92 43 100 32 114 32 122 37 140 40 125 43 115 42 106 44 112 56 111 67 100 77 85 81 78 91 96 96 90 99 71 94 74 82 62 81 58 94 60 100 53 100 52 93 56 79Z',
      detail:'M43 69 57 64 74 65 90 71 83 77 62 76 52 72Z M98 35 111 33 116 36 106 38Z',
      accent:'M48 71 67 69 79 72 M116 38 118 39'
    },
    GRASS_TURTLE: {
      color:['#24392a','#63805c','#b5c68a','#e1e4aa'],
      body:'M19 83 31 77 36 63 52 52 75 46 96 54 110 70 121 67 135 69 143 75 136 81 122 82 119 89 110 91 103 84 65 86 57 94 45 94 48 85 28 86Z',
      detail:'M39 69 53 56 73 50 68 62 59 70 47 75Z M69 66 77 51 93 57 106 72 90 74Z M44 77 61 75 69 69 85 76 77 82 56 83Z',
      accent:'M52 59 56 56 M81 55 85 58 M50 80Q76 72 99 80 M130 73 133 74'
    },
    GOAT: {
      color:['#30423e','#748c83','#d6dfbd','#e9c781'],
      body:'M20 61 34 64 48 56 74 54 89 51 101 42 113 45 125 43 139 53 140 60 128 67 116 64 107 74 108 90 101 94 95 91 96 72 79 76 74 91 64 93 65 79 48 78 43 91 36 93 33 91 38 75Z',
      detail:'M104 45Q91 34 94 22Q105 27 111 43Z M113 45Q108 30 114 21Q122 24 120 46Z M103 54 114 47 127 48 136 54 129 58 120 56 111 63 107 70Z M41 62 55 58 75 58 67 65 53 66Z',
      accent:'M98 31 103 33 M114 29 117 30 M123 52 126 53 M131 62 136 59'
    },
    MOTH: {
      airborne:true, color:['#3c2d41','#7d6281','#e3bedc','#fff1ae'],
      body:'M75 52Q44 22 21 32Q12 63 47 74Q36 86 57 92L79 76 90 92Q114 89 108 75Q143 65 142 34Q121 19 88 52L91 61 83 79 75 66Z',
      detail:'M27 38Q47 37 71 56L63 68Q34 63 27 38Z M135 37Q114 39 91 57L100 68Q125 64 135 37Z M49 78 64 73 71 77 58 86Z M97 76 107 83 96 84 90 79Z',
      accent:'M78 52 73 42 68 40 M85 52 91 41 96 39 M38 50Q47 44 53 52Q47 59 38 50Z M107 52Q116 44 123 51Q116 58 107 52Z'
    },
    WILDCAT: {
      color:['#343533','#816f57','#c7ae84','#f4d27e'],
      body:'M40 72Q33 80 20 72Q10 64 18 54L22 56Q18 65 28 68L45 67 56 59 80 60 99 64 108 48 115 43 120 52 132 45 133 57 144 64 140 72 124 76 114 84 113 92 104 94 104 81 81 83 73 92 64 92 67 82 52 83 47 91 38 91 41 79Z',
      detail:'M106 58 120 54 133 58 142 65 135 70 125 69 114 76 107 68Z M50 68 59 63 78 63 84 70 65 71Z',
      accent:'M59 60 63 68 M70 61 74 69 M81 61 86 69 M94 63 98 71 M124 61 128 62 M22 65 25 68'
    },
    FAWN: {
      color:['#3f3a26','#92744b','#d7bb7e','#fff0af'],
      body:'M30 67 46 60 69 58 87 61 99 48 103 37 113 44 123 43 132 50 140 53 136 61 120 62 111 75 113 92 104 96 101 78 88 78 81 94 72 95 77 77 54 80 49 92 41 95 39 93 45 77 31 76 20 66Z',
      detail:'M103 43Q90 35 94 28Q106 31 111 44Z M114 44Q118 34 129 34Q127 42 123 46Z M108 50 121 47 132 52 132 56 119 57 115 65 106 62Z',
      accent:'M47 65 50 65 M57 63 60 63 M67 63 70 63 M53 69 56 69 M64 68 67 68 M123 51 126 52'
    },
    MANTIS: {
      color:['#273b2b','#5e7948','#bdd28a','#ecdc7f'],
      body:'M22 78 34 67 66 62 83 62 95 52 100 39 112 32 122 40 117 49 109 50 101 67 94 79 97 91 90 93 84 79 72 77 61 93 52 95 48 91 63 77 45 77 35 85Z M101 59 117 64 128 55 132 62 119 73 105 67Z',
      detail:'M28 75 43 68 74 64 85 67 75 73 52 74Z M101 42 112 35 118 40 114 44 105 47Z',
      accent:'M107 36 101 28 95 27 M115 34 119 25 127 23 M108 42 112 42 M52 69 63 68 M120 66 125 61'
    },
    WOLF: {
      color:['#283845','#576b78','#a8c1c4','#dff2c6'],
      body:'M26 75 16 62 37 72 47 61 62 59 78 63 90 60 102 47 107 36 114 46 126 40 128 54 142 61 138 68 124 71 112 76 111 90 102 93 103 79 83 81 76 92 66 92 67 80 54 80 47 91 37 91 41 77Z',
      detail:'M90 62 102 48 109 55 124 51 131 58 141 62 135 68 121 66 112 73 102 71Z M54 64 72 66 81 73 65 74Z',
      accent:'M123 57 127 58 M103 48 106 43'
    },
    MUSHROOM: {
      color:['#263c31','#6b8e54','#c6d99a','#fff3b3'],
      body:'M35 76Q32 68 44 57Q58 45 73 42Q62 40 61 34Q67 21 85 18Q106 18 115 32Q116 40 105 42Q128 49 138 65Q142 76 124 79L106 78 107 87 114 92 109 95 96 94 90 84 84 84 80 94 69 94 65 90 73 84 74 78Q52 81 35 76Z',
      detail:'M38 69Q58 54 86 51Q117 54 134 69Q121 71 104 67Q87 66 74 70Q51 74 38 69Z M78 35Q82 26 92 27Q102 27 106 35Z',
      accent:'M81 76 85 76 M94 76 98 76 M58 61 62 60 M106 61 110 62'
    }
  };

  const regionalScale = (spec, stage) => [0, .15, .205, .265][Math.min(3, Math.max(1, stage))] * (.68 + spec.tier * .05);
  const regionalLayers = (spec, art) => {
    const [ink, pigment, pale, accent] = art.color;
    return [
      ...(art.back || []).map(path => [path, pigment, ink, 1.8]),
      [art.body, pigment, ink, 2.8],
      [art.detail, pale, ink, .8],
      [art.accent, null, accent, spec.tier >= 5 ? 2 : 1.4]
    ];
  };

  R.regionalCompanionSvg = (speciesId, stage) => {
    const spec = CULT.regionalCompanionSpec(speciesId);
    if (!spec) return '';
    const art = regionalArt[spec.key];
    const size = regionalScale(spec, stage) / .265;
    const [ink, , , accent] = art.color;
    const outline = spec.tier >= 5 && stage >= 2
      ? '<ellipse cx="80" cy="92" rx="60" ry="11" fill="none" stroke="' + accent + '" opacity=".54"/>' : '';
    return '<svg viewBox="0 0 160 112" aria-hidden="true" focusable="false">' +
      '<ellipse cx="80" cy="98" rx="' + (56 * size) + '" ry="8" fill="' + ink + '" opacity=".65"/>' +
      '<g transform="translate(80 94) scale(' + size + ') translate(-80 -94)" stroke-linecap="round" stroke-linejoin="round">' + outline +
      regionalLayers(spec, art).map(([path, fill, stroke, width]) => '<path d="' + path + '" fill="' + (fill || 'none') +
        '" stroke="' + stroke + '" stroke-width="' + width + '"/>').join('') + '</g></svg>';
  };

  const regionalPathCache = new Map();
  R.drawRegionalCompanion = (ctx, spec, stage, x, y, time, face, reduced, riding = false) => {
    if (typeof Path2D !== 'function') return false;
    const art = regionalArt[spec.key];
    let layers = regionalPathCache.get(spec.key);
    if (!layers) {
      layers = regionalLayers(spec, art).map(([path, ...paint]) => [new Path2D(path), ...paint]);
      regionalPathCache.set(spec.key, layers);
    }
    const size = riding ? .43 : regionalScale(spec, stage);
    const [ink, pigment, pale, accent] = art.color;
    ctx.save();
    ctx.translate(x, y - (art.airborne && !riding ? 3.5 + (reduced ? 0 : Math.sin(time * 3.8) * 1.75) : 0));
    ctx.scale(face * size, size);
    ctx.translate(-80, -94);
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.fillStyle = '#11182665';
    ctx.beginPath(); ctx.ellipse(80, 98, 48, 8, 0, 0, Math.PI * 2); ctx.fill();
    if (spec.tier >= 5 && stage >= 2) {
      ctx.strokeStyle = accent + '70';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(80, 94, 58, 10, 0, 0, Math.PI * 2); ctx.stroke();
    }
    const gradient = ctx.createLinearGradient(49, 97, 90, 18);
    gradient.addColorStop(0, ink);
    gradient.addColorStop(.52, pigment);
    gradient.addColorStop(1, pale);
    for (const [path, fill, stroke, width] of layers) {
      if (fill) { ctx.fillStyle = fill === pigment ? gradient : fill; ctx.fill(path); }
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.stroke(path);
    }
    ctx.restore();
    return true;
  };
  R.isAirborneMount = pet => pet.family === 'AVIAN' || pet.fourSymbol === 'VERMILION_PHOENIX' ||
    pet.fourSymbol === 'AZURE_DRAGON' || pet.bloodlineTrait === 'VERMILION_PHOENIX' || pet.bloodlineTrait === 'AZURE_DRAGON';

  const mountArtByFamily = {
    AVIAN:'HAWK', UNGULATE:'GOAT', CANINE:'WOLF', FELINE:'WILDCAT',
    URSINE_BOAR:'BOAR', SHELL_GUARDIAN:'GRASS_TURTLE', SERPENT:'PYTHON', CHIMERA:'TAOTIE'
  };
  const symbolMountArt = new Map((g.JD.CORE.sovereignCompanions || []).map(spec => [spec.symbol, spec]));
  R.drawTravelMount = (ctx, pet, by, time, reduced) => {
    const curated = CULT.curatedCompanionSpec(pet.speciesId);
    const beast = curated || symbolMountArt.get(pet.fourSymbol || pet.bloodlineTrait);
    if (beast) {
      const stage = curated ? pet.growthStage || 1 : 4;
      const seat = beast.familyId === 'KUNPENG' ? 17 : 20;
      if (R.drawSovereignCompanion(ctx, beast.id, stage, -2, by + seat, .55, time, 1, true)) return;
    }
    const body = CULT.regionalCompanionSpec(pet.speciesId) || { key:mountArtByFamily[pet.family] || 'WOLF', tier:2 };
    if (R.drawRegionalCompanion(ctx, body, pet.growthStage || 2, -2,
      by + (body.key === 'HAWK' ? 12 : 16), time, 1, reduced, true)) return;
    // Keep the contact silhouette available when a browser cannot construct Path2D.
    ctx.fillStyle = '#667b65';
    ctx.beginPath(); ctx.ellipse(0, by + 3, 11, 4.5, 0, 0, 7); ctx.fill();
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
