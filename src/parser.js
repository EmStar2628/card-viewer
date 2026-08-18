import { useState } from "react";

// ==================== 常數 ====================
const ELEM = { w:"水",f:"火",t:"木",l:"光",d:"暗" };
const ELEM_COLOR = { w:"#3B82F6",f:"#EF4444",t:"#22C55E",l:"#CA8A04",d:"#A855F7" };
const ELEM_DARK  = { w:"#1D4ED8",f:"#B91C1C",t:"#15803D",l:"#92400E",d:"#7E22CE" };
const ELEM_GLYPH = { w:"💧",f:"🔥",t:"🌿",l:"✨",d:"🌑" };
const RACE = { G:"神",E:"魔",H:"人",A:"獸",D:"龍",S:"妖",M:"機" };
const RACE_NUM = {"-2":"無","-1":"全種族","0":"神","1":"魔","2":"人","3":"獸","4":"龍","5":"妖","6":"機"};
const ELEM_NUM = {"-2":"無","-1":"不分屬性","0":"水","1":"火","2":"木","3":"光","4":"暗","5":"無屬性"};
const STONE = {
  w:"水符石",f:"火符石",t:"木符石",l:"光符石",d:"暗符石",h:"心符石",
  W:"水強化符石",F:"火強化符石",T:"木強化符石",L:"光強化符石",D:"暗強化符石",H:"心強化符石",
  "+"  :"強化符石","*":"任意符石","all":"所有符石","notStrong":"非強化符石",
  rdm:"隨機",rdmS:"強化隨機",memAttr:"成員屬性符石",notEnemyAttr:"非敵人屬性符石",
  notSelfAttr:"非自身屬性符石",xPos:"X爆符石",frozen:"凍結符石",elec:"電擊符石","frozen_elec":"凍結+電擊符石",
};
const STONE_NUM = {"-1":"無","0":"水符石","1":"火符石","2":"木符石","3":"光符石","4":"暗符石",
  "5":"心符石","6":"水強化符石","7":"火強化符石","8":"木強化符石","9":"光強化符石","10":"暗強化符石","11":"心強化符石"};
const RACE_SLOT = {"-2":"無","-1":"不限種族","0":"神族","1":"魔族","2":"人類","3":"獸類","4":"龍類","5":"妖精","6":"機械"};
const ICON_MAP = {AddAtk:"增攻",AddRec:"回復",AddAtkRec:"攻回",ReduceHurt:"減傷",Dissolve:"改變消除",AddTime:"加秒",AlsoPossess:"兼具",ExtraAtk:"追打",FreeMove:"排珠"};
const TS_ADDTIME = {"1":"延長","2":"必然延長","3":"必然延長至"};
const IGNR_NAME = {"0":"無","1":"拼圖障礙","2":"N屬限制","3":"固定連擊限制","4":"防禦力"};
const AS_ADDTIME_MODE = {"0,0":"延長","0,1":"必然延長","1,0":"必然延長至"};
const TSHV_MODE = {"self":"自身直行","lorh":"隊長或戰友直行","lnh":"隊長及戰友直行","rdmc":"隨機直行","rdmr":"隨機橫行","h":"橫行","v":"直行"};
const LS_POSSESS_OF = {"0":"水","1":"火","2":"木","3":"光","4":"暗","5":"心","6":"所有屬性","7":"所有"};
const LS_POSSESS_BY = {"0":"水","1":"火","2":"木","3":"光","4":"暗","5":"心","6":"其他屬性"};
const EXATK_WHO = {self:"自身",all:"全隊",highest:"攻最高成員"};
const EXATK_TGT = {one:"單體",all:"全體"};
const EXATK_SRC = {self:"自身",all:"全隊"};
const EXATK_ATTR = {"-2":"","-1":"無屬性","0":"水屬性","1":"火屬性","2":"木屬性","3":"光屬性","4":"暗屬性","5":"隨機屬性"};

// ==================== 工具函數 ====================
function parseKV(str) {
  const obj = {};
  let rem = str;
  while (rem) {
    const ci = rem.indexOf(","), seg = ci >= 0 ? rem.slice(0, ci) : rem;
    rem = ci >= 0 ? rem.slice(ci + 1) : "";
    const ei = seg.indexOf("=");
    if (ei >= 0) obj[seg.slice(0, ei)] = seg.slice(ei + 1);
  }
  return obj;
}

function stoneList(str) {
  if (!str) return "無";
  const r = str.split("+").filter(s => s && s !== "none").map(s => STONE[s] || s).join("、");
  return r || "無";
}

function parseAR(str) {
  if (!str) return "";
  return str.split("_").map(seg => {
    if (!seg) return "";
    if (seg.startsWith("--")) return `「${seg.slice(2)}」系列`;
    let rest = seg, e = "", r = "";
    for (const [k, v] of Object.entries(ELEM)) if (rest.startsWith(k)) { e = v; rest = rest.slice(1); break; }
    for (const [k, v] of Object.entries(RACE)) if (rest === k) { r = v + "族"; break; }
    return (e ? e + "屬" : "") + r || seg;
  }).filter(Boolean).join("、");
}

function fmt(n) {
  const v = Number(n);
  return isNaN(v) ? String(n) : (Number.isInteger(v) ? String(v) : v.toFixed(3).replace(/\.?0+$/, ""));
}

function parseConds(p) {
  const c = [];
  if (p.cdlh === "1") c.push("自身為隊長或戰友");
  if (p.cdtl === "1") c.push("隊長與戰友相同");
  if (p.cdls) c.push(`指定隊長 #${p.cdls.replace(/\//g, "、#")}`);
  if (p.cdhs) c.push(`指定戰友 #${p.cdhs.replace(/\//g, "、#")}`);
  if (p.cdms) c.push(`指定成員 #${p.cdms.replace(/\+/g, " & #")}`);
  if (p.cdmt) { const ar = parseAR(p.cdmt); if (ar) c.push(`成員含 ${ar}`); }
  return c;
}

function ldrElem(v) {
  if (!v || v === "-1" || v === "*") return "不分屬性";
  return ELEM[v] ? ELEM[v] + "屬" : (ELEM_NUM[v] ?? v);
}
function ldrRace(v) {
  if (!v || v === "-1" || v === "*") return "全種族";
  return RACE[v] ? RACE[v] + "族" : (RACE_NUM[v] ?? v);
}
function lsStone(v) {
  if (v === "*") return "任意";
  return ELEM[v] ? (ELEM[v] + "符石") : (STONE_NUM[v] ?? (STONE[v] ?? v));
}

// ==================== 主動技解析 ====================
function parseAS(line) {
  const ei = line.indexOf("="); if (ei < 0) return null;
  const type = line.slice(0, ei), rest = line.slice(ei + 1);
  try {
    switch (type) {
      case "clrLock": {
        const p = parseKV(rest), ar = parseAR(p.ar), parts = [];
        if (p.all === "1") parts.push(ar ? `解鎖 ${ar} 成員` : "解鎖所有鎖定成員");
        if (p.self === "1") parts.push("解鎖自身");
        return { icon: "🔓", title: "解鎖", parts, conds: [] };
      }
      case "clrBuff": return { icon: "🧹", title: "清除附加效果", parts: [], conds: [] };
      case "bump": {
        const p = parseKV(rest);
        const stones = stoneList(p.BTp);
        const lim = p.MBC === "0" ? "不限數量" : `最多 ${p.MBC} 粒`;
        const times = Number(p.BT) > 1 ? `，共 ${p.BT} 次` : "";
        const parts = [`引爆 ${stones}（${lim}${times}）`];
        if (p.FT) parts.push(`掉落：${stoneList(p.FT)}`);
        if (p.FFC && p.FFC !== "0") parts.push(`每直行首 ${p.FFC} 粒必定掉落`);
        if (p.FFA && p.FFA !== "-1") parts.push(`必定落下 ${STONE_NUM[p.FFA] || p.FFA}`);
        if (p.RcC && p.RcC !== "-2") parts.push(`依 ${RACE_SLOT[p.RcC]} 欄落下對應屬性符石`);
        if (p.AA && p.AA !== "-1") {
          const attr = ELEM_NUM[p.AA] || p.AA;
          if (p.FA && p.FA !== "0") parts.push(`引爆直傷（${attr}）：固定 ${p.FA} 點，無視 ${p.DB}% 防禦`);
          else {
            let s = `引爆直傷（${attr}）`;
            if (+p.RB > 0) s += `：每粒 × ${fmt(p.RB)} 倍攻`;
            if (+p.RBS > 0) s += `（強化 × ${fmt(p.RBS)}）`;
            if (+p.DB > 0) s += `，無視 ${p.DB}% 防禦`;
            parts.push(s);
          }
        }
        if (p.UAR && p.UAR !== "0") {
          const ae = p.UAA !== "-2" ? (ELEM_NUM[p.UAA] || "") : "";
          const ar2 = p.UARc !== "-2" ? (RACE_NUM[p.UARc] || "") : "";
          parts.push(`${p.UAR}回合：${ae}${ar2}攻擊力↑（引爆${p.UAMC}→${p.UAMR}粒達最大）`);
        }
        if (p.URR && p.URR !== "0") {
          const ae = p.URA !== "-2" ? (ELEM_NUM[p.URA] || "") : "";
          const ar2 = (p.URRC || p.URRc) && (p.URRC || p.URRc) !== "-2" ? (RACE_NUM[p.URRC || p.URRc] || "") : "";
          parts.push(`${p.URR}回合：${ae}${ar2}回復力↑（引爆${p.URMC}→${p.URMR}粒達最大）`);
        }
        if (p.DR && p.DR !== "0") {
          const ae = p.DA !== "-2" ? (ELEM_NUM[p.DA] || "") + "屬性" : "所有屬性";
          parts.push(`${p.DR}回合：${ae}傷害↓（引爆${p.DMC}粒最多減${p.DMR}%）`);
        }
        return { icon: "💥", title: "引爆符石", parts, conds: [] };
      }
      case "ts": {
        const [from, to, cnt] = rest.split(",");
        return { icon: "🔄", title: "轉版", parts: [`將 ${!cnt || cnt === "0" ? "所有" : cnt + "粒"} ${STONE[from] || from} 轉為 ${STONE[to] || to}`], conds: [] };
      }
      case "tsdyna": {
        const pts = rest.split(",");
        const dest = STONE[pts[2]] || pts[2];
        const prioStr = pts[3] || "";
        const prios = [...prioStr].filter(c => c !== "_").map(c => STONE[c] || c);
        const race = pts[4] && pts[4] !== "?" && pts[4] !== "0" && pts[4] !== "_" ? (RACE[pts[4]] || pts[4]) + "族" : "";
        const parts = [`將 ${pts[0]}~${pts[1]} 粒任意符石轉為 ${dest}`];
        if (prios.length) parts.push(`優先轉換：${prios.join("、")}`);
        if (race) parts.push(`每多1名${race}成員額外多轉2粒`);
        return { icon: "🔄", title: "動態轉版", parts, conds: [] };
      }
      case "tshv": {
        const pts = rest.split(",").filter(s => s);
        const mode = TSHV_MODE[pts[0]] || pts[0];
        const stone = STONE[pts[pts.length - 1]] || STONE[pts[pts.length - 2]] || pts[pts.length - 1];
        return { icon: "🔄", title: `轉符石（${mode}）`, parts: [`轉為 ${stone}`], conds: [] };
      }
      case "tsbr": {
        const pts = rest.split(",").filter(s => s);
        const rounds = Number(pts[0]);
        const stone = STONE[pts[1]] || pts[1];
        const count = pts[2];
        const roundsStr = rounds >= 100 ? `× ${rounds - 100} 倍` : rounds > 0 ? `+ ${rounds} 粒` : "";
        return { icon: "⚗️", title: "蓄能轉化", parts: [`每回合累積 ${roundsStr} ${stone}，最多 ${count} 粒`], conds: [] };
      }
      case "tsfp": {
        const sm = { _: "□", w: "水", f: "火", t: "木", l: "光", d: "暗", h: "心", W: "水★", F: "火★", T: "木★", L: "光★", D: "暗★", H: "心★" };
        const rows = [];
        for (let r = 4; r >= 0; r--) rows.push([...rest.slice(r * 6, r * 6 + 6)].map(c => sm[c] || c).join(" "));
        return { icon: "📋", title: "固定版面", parts: rows, conds: [], mono: true };
      }
      case "dirAtk": {
        const cl = rest.endsWith(",") ? rest.slice(0, -1) : rest;
        const p = parseKV(cl);
        const attr = p.attr === "-1" ? "無屬性" : (ELEM_NUM[p.attr] || p.attr);
        const parts = [];
        if (p.fix && p.fix !== "0") parts.push(`對敵全體造成固定 ${p.fix} 點${attr}傷害`);
        else {
          let s = `對敵全體造成${attr}屬性傷害`;
          if (+p.mbA > 0) s += `（全隊攻擊力 × ${fmt(p.mbA)}）`;
          if (+p.mbR > 0) s += `（含回復力 × ${fmt(p.mbR)}）`;
          parts.push(s);
        }
        if (+p.mr > 0) parts.push(`無視 ${p.mr}% 防禦`);
        if (p.iS === "1") parts.push("無視強化盾");
        if (p.iA === "1") parts.push("無視所有技能");
        return { icon: "⚔️", title: "直接傷害", parts, conds: [] };
      }
      case "addGE": {
        const p = parseKV(rest);
        const timing = p.t === "0" ? "發動技能時" : "下回合開始時";
        const targets = [];
        if (p.tSlf === "1") targets.push("自身");
        if (p.tSid === "1") targets.push("左右側");
        if (p.tNos) targets.push(`編號 ${p.tNos}`);
        const ar = parseAR(p.tAR); if (ar) targets.push(ar);
        const ge = Number(p.ge) > 0 ? `+${p.ge}` : p.ge;
        const parts = [`${timing}，對 ${targets.join("、") || "全隊"} 集氣值 ${ge}`];
        const ar2 = parseAR(p.cAR); if (ar2) parts.push(`條件：隊中只有 ${ar2}`);
        if (p.cGEF && p.cGEF !== "-1") parts.push(`條件：自身集氣值 ${p.cGEF}~${p.cGET}`);
        return { icon: "⚡", title: "增減集氣值", parts, conds: [] };
      }
      case "addatk": {
        const p = parseKV(rest);
        const icon2 = ICON_MAP[p.mi] || "增攻";
        const parts = [`${p.rnd}回合（${icon2}）`];
        if (p.ns && p.ns !== "-1") parts.push(`自身攻擊力 × ${fmt(p.ns)}`);
        if (p.nes && p.nes !== "-1") parts.push(`其他成員攻擊力 × ${fmt(p.nes)}`);
        const as = [...(p.a || "")], rs = [...(p.r || "")];
        const ns2 = (p.n || "").split("+").map(Number);
        const EL = { w: "水屬", f: "火屬", t: "木屬", l: "光屬", d: "暗屬", _: "", "*": "" };
        const RL = { G: "神族", E: "魔族", H: "人族", A: "獸族", D: "龍族", S: "妖族", M: "機族", _: "", "*": "" };
        for (let i = 0; i < ns2.length; i++) {
          if (ns2[i] === -1000) continue;
          const ae = EL[as[i]] || "", re = RL[rs[i]] || "";
          parts.push(`　${ae + re || "全隊"} 攻擊力 × ${fmt(ns2[i] / 1000)}`);
        }
        return { icon: "📈", title: "增攻", parts, conds: [] };
      }
      case "addrec": {
        const pts = rest.split(",");
        const icon2 = ICON_MAP[pts[4]] || "回復";
        const parts = [`${pts[0]}回合（${icon2}）`];
        const EL = { w: "水屬", f: "火屬", t: "木屬", l: "光屬", d: "暗屬", _: "", "*": "" };
        const RL = { G: "神族", E: "魔族", H: "人族", A: "獸族", D: "龍族", S: "妖族", M: "機族", _: "", "*": "" };
        const mags = (pts[3] || "").split("_");
        for (let i = 0; i < 3; i++) {
          if (!mags[i] || mags[i] === "0") continue;
          const ae = EL[(pts[1] || "")[i]] || "", re = RL[(pts[2] || "")[i]] || "";
          parts.push(`　${ae + re || "全隊"} 回復力 × ${fmt(mags[i])}`);
        }
        return { icon: "💚", title: "增回", parts, conds: [] };
      }
      case "rdcHurt": {
        const p = parseKV(rest);
        const icon2 = ICON_MAP[p.icn] || "減傷";
        const ns2 = (p.n || "").split("_"), attrs = (p.attr || "").split("_");
        const parts = [`${p.r}回合（${icon2}）`];
        for (let i = 0; i < 3; i++) {
          if (!ns2[i] || ns2[i] === "0") continue;
          const at = attrs[i] === "-1" ? "所有屬性" : (ELEM_NUM[attrs[i]] || attrs[i]);
          parts.push(`　${at}傷害 -${ns2[i]}%`);
        }
        return { icon: "🛡️", title: "減傷", parts, conds: [] };
      }
      case "dsv": {
        const p = parseKV(rest);
        const icon2 = ICON_MAP[p.icn] || "改變消除";
        const counts = (p.c || "").split("+");
        const attrss = (p.a || "").split("+").map(a => a.split("_").map(s => STONE[s] || s).join("+"));
        const rules = counts.map((c, i) => c && c !== "0" ? `${c}粒（${attrss[i] || "任意"}）` : "").filter(Boolean);
        const parts = [`${p.r}回合（${icon2}）`];
        if (rules.length) parts.push(`消除規則：${rules.join(" 或 ")}`);
        if (p.fb === "1") parts.push("限首消");
        if (p.uc && p.uc !== "0") { const ua = (p.ua || "").split("_").map(s => STONE[s] || s).filter(Boolean).join("、"); parts.push(`直到消 ${p.uc} 粒 ${ua || "符石"}`); }
        return { icon: "🔮", title: "改變消除方式", parts, conds: [] };
      }
      case "addtime": {
        const pts = rest.split(",");
        const modeKey = `${pts[1]},${pts[2]}`;
        const mode = AS_ADDTIME_MODE[modeKey] || "延長";
        const imm = pts[3] === "1" ? "（立即倒數）" : "";
        const icon2 = ICON_MAP[pts[5]] || "加秒";
        return { icon: "⏱️", title: "延長排珠時間", parts: [`${pts[0]}回合，${mode} ${pts[4]}秒${imm}（${icon2}）`], conds: [] };
      }
      case "freemove": {
        const [cnt, ic2] = rest.split(",");
        return { icon: "🕹️", title: "排珠", parts: [`排列 ${cnt} 粒符石（${ICON_MAP[ic2] || "排珠"}）`], conds: [] };
      }
      case "exAtk": {
        const pts = rest.split(",");
        const who = EXATK_WHO[pts[1]] || pts[1];
        const elem = pts[2] === "-1" ? "不分屬性" : (ELEM_NUM[pts[2]] || pts[2]);
        const race = pts[3] === "-1" ? "全種族" : (RACE_NUM[pts[3]] || pts[3]);
        const target = EXATK_TGT[pts[4]] || pts[4];
        const pct = pts[5], src = EXATK_SRC[pts[6]] || pts[6];
        const attrs = (pts[7] || "").split("_").map(a => EXATK_ATTR[a] || a).filter(Boolean);
        const count = pts[8], icon2 = ICON_MAP[pts[9]] || "追打";
        const memDesc = `${elem !== "不分屬性" ? elem : ""}${race !== "全種族" ? race : ""}` || "所有成員";
        return {
          icon: "👊", title: `追打（${icon2}）`, conds: [], parts: [
            `${pts[0]}回合，${who}（${memDesc}）對${target}敵人追打 ${count} 次`,
            `傷害：${src}攻擊力 × ${pct}%，屬性：${attrs.join("、") || "無屬性"}`,
          ]
        };
      }
      case "possess": {
        const pts = rest.split(",");
        const s1 = (pts[1] || "").split("_").map(v => STONE_NUM[v] || v).join("、");
        const s2 = (pts[2] || "").split("_").map(v => STONE_NUM[v] || v).join("、");
        const pc = (pts[3] || "").split("_").map(v => v + "%").join("、");
        const icon2 = ICON_MAP[pts[4]] || "兼具";
        return { icon: "🔗", title: `兼具（${icon2}）`, parts: [`${pts[0]}回合`, `${s1} 兼具 ${s2}（${pc}）`], conds: [] };
      }
      case "chC": return { icon: "🔄", title: "變身", parts: [`變身為 #${rest}`], conds: [] };
      case "mrgC": return { icon: "⚡", title: "合體", parts: [], conds: [] };
      default: return { icon: "❓", title: type, parts: [rest.slice(0, 80)], conds: [], raw: true };
    }
  } catch { return { icon: "❓", title: type, parts: [rest.slice(0, 80)], conds: [], raw: true }; }
}

// ==================== 隊長技解析 ====================
function parseLS(line) {
  const ei = line.indexOf("="); if (ei < 0) return null;
  const type = line.slice(0, ei), rest = line.slice(ei + 1);
  try {
    switch (type) {
      case "mag": {
        const pts = rest.split(",");
        const e = ldrElem(pts[0]), r = ldrRace(pts[1]);
        const t = { A: "攻擊力", H: "生命力", R: "回復力" }[pts[2]] || pts[2];
        return { icon: "⭐", title: `倍率：${e}${r} ${t} × ${pts[3]}`, parts: [], conds: [] };
      }
      case "dynaMag": {
        const pts = rest.split(",");
        const stone = lsStone(pts[1]) + "符石";
        const e = ldrElem(pts[2]), r = ldrRace(pts[3]);
        return { icon: "⭐", title: "動態倍率", parts: [`消 ${pts[0]} 粒${stone} → ${e}${r} 攻擊力 × ${pts[4]}`], conds: [] };
      }
      case "dh": {
        const p = parseKV(rest), parts = [];
        if (p.ldrOnly === "1") parts.push("（僅隊長有效）");
        if (p.p && p.p !== "0") parts.push(`減少 ${p.p}% 傷害`);
        const hpGt = p.condiHpGt ?? p.condiHPGt;
        if (hpGt && +hpGt > 0) parts.push(`條件：我方 HP ≥ ${hpGt}%`);
        if (+p.condiAC > 0) parts.push(`條件：首消 ≥ ${p.condiAC} 種符石`);
        if (p.condiAI && p.condiAI !== "?") { const st = [...p.condiAI].map(c => ({ 0: "水", 1: "火", 2: "木", 3: "光", 4: "暗", 5: "心" }[c] || c)); parts.push(`條件：消除 ${st.join("、")} 符石`); }
        return { icon: "🛡️", title: "減傷", parts: parts.length ? parts : ["減少傷害"], conds: [] };
      }
      case "dsv": {
        const pts = rest.split(",");
        return { icon: "🔮", title: "改變消除方式", parts: [`${pts[0]} 粒${lsStone(pts[1])}符石可消除`], conds: [] };
      }
      case "possess": {
        const pts = rest.split(",");
        const ldr = pts[0] === "1" ? "（僅隊長）" : "";
        const s1 = (pts[1] || "").split("_").map(v => LS_POSSESS_OF[v] || v).join("、");
        const s2 = (pts[2] || "").split("_").map(v => LS_POSSESS_BY[v] || v).join("、");
        const pc = (pts[3] || "").split("_").map(v => v + "%").join("、");
        return { icon: "🔗", title: `兼具${ldr}`, parts: [`${s1}符石 兼具 ${s2}符石（${pc}）`], conds: [] };
      }
      case "gsbc": {
        const pts = rest.split(",");
        const dropMap = { RDM: "隨機掉落", SLF: "自身直行掉落" };
        return { icon: "🎲", title: "消Combo掉落", parts: [`消 ${pts[1]} Combo → ${dropMap[pts[2]] || "掉落"} ${pts[3]} 粒${lsStone(pts[4])}符石`], conds: [] };
      }
      case "addtime": {
        const pts = rest.split(",");
        const mode = TS_ADDTIME[pts[1]] || "延長";
        const parts = [`${mode} ${pts[2]} 秒移動符石時間`];
        if (+pts[4] > 0) parts.push(`每多1種屬性 +${pts[4]}秒（最多 +${pts[3]}秒）`);
        return { icon: "⏱️", title: "延長移動符石時間", parts, conds: [] };
      }
      default: return { icon: "❓", title: type, parts: [rest.slice(0, 80)], conds: [], raw: true };
    }
  } catch { return { icon: "❓", title: type, parts: [rest.slice(0, 80)], conds: [], raw: true }; }
}

// ==================== 隊伍技解析 ====================
function parseTS(line) {
  const ei = line.indexOf("="); if (ei < 0) return null;
  const type = line.slice(0, ei), rest = line.slice(ei + 1);
  try {
    switch (type) {
      case "gEng": {
        const p = parseKV(rest), conds = parseConds(p);
        const parts = [`「${p.n}」：初始 ${p.oV}，範圍 ${p.miV}~${p.mxV}`];
        const dsCs = (p.dsC || "").split("+"), dsAs = (p.dsA || "").split("+"), dsDs = (p.dsD || "").split("+"), dsEs = (p.dsE || "").split("+");
        for (let i = 0; i < dsCs.length; i++) {
          if (!dsCs[i] || !dsDs[i] || dsDs[i] === "0") continue;
          const stone = dsAs[i] ? (ELEM[dsAs[i]] || dsAs[i]) + "符石" : "符石";
          const mode = dsEs[i] === "0" ? "非強化" : dsEs[i] === "1" ? "強化" : "";
          parts.push(`消 ${dsCs[i]} 粒${mode}${stone} → 集氣值 +${dsDs[i]}`);
        }
        if (p.acM && p.acD && p.acD !== "0") {
          const acMStr = p.acM.startsWith("--") ? `「${p.acM.slice(2)}」系列` : p.acM;
          parts.push(`發動${acMStr}主動技 → 集氣值 ${Number(p.acD) > 0 ? "+" : ""}${p.acD}`);
        }
        if (p.kB && p.kB !== "0") parts.push(`擊殺敵人 → 集氣值 +${p.kB}（持續 ${p.kD} 回合）`);
        if (p.tF && p.tD && p.tD !== "0") parts.push(`每 ${p.tE} 回合觸發，集氣值 +${p.tD}（從第 ${p.tF} 回合開始）`);
        if (p.kdB && p.kdB !== "0") parts.push(`擊倒敵人 → 集氣值 +${p.kdB}`);
        if (p.kaC && p.kaC !== "0") parts.push(`累積攻擊 ${p.kaC} 次觸發`);
        return { icon: "⚡", title: `集氣值（${p.n || ""}）`, parts, conds };
      }
      case "mag": {
        const p = parseKV(rest), conds = parseConds(p), parts = [];
        const T = { A: "攻擊力", H: "生命力", R: "回復力" };
        if (p.cBC) { const cards = p.cBC.split("+"), types = [...(p.tBC || "")], mags = (p.rBC || "").split("+").map(Number); cards.forEach((c, i) => { if (c) parts.push(`#${c.replace(/\//g, "、#")} ${T[types[i]] || "攻擊力"} × ${fmt(mags[i] / 1000)}`); }); }
        if (p.arBAR) { const bars = p.arBAR.split("+"), types = [...(p.tBAR || "")], mags = (p.rBAR || "").split("+").map(Number); bars.forEach((bar, i) => { if (bar && mags[i]) parts.push(`${parseAR(bar) || "全隊"} ${T[types[i]] || "攻擊力"} × ${fmt(mags[i] / 1000)}`); }); }
        return { icon: "⭐", title: "倍率", parts: parts.length ? parts : ["設定倍率"], conds };
      }
      case "dynUp": {
        const p = parseKV(rest), conds = parseConds(p), parts = [];
        if (p.geGM !== undefined && p.geGR !== undefined) { const base = Number(p.geGM) / 1000, growth = Number(p.geGR) / 1000; if (growth > 0) parts.push(`基礎倍率 × ${fmt(base)}，每單位集氣值額外 +${fmt(growth)} 倍`); }
        if (p.mem) { const m = Number(p.mem) / 1000; if (m > 0 && m !== 1) parts.push(`成員加成 × ${fmt(m)}`); }
        if (p.mAR) { const ar = parseAR(p.mAR); if (ar) parts.push(`限 ${ar} 成員`); }
        if (p.topGE && p.topGE !== "0") parts.push(`集氣值達上限時固定 × ${fmt(Number(p.topGE) / 1000)}`);
        const geRF = (p.geRF || "").split("+").filter(Boolean), geRT = (p.geRT || "").split("+").filter(Boolean);
        const geRM = (p.geRM || "").split("+").filter(Boolean), geRR2 = (p.geRR || "").split("+").filter(Boolean);
        for (let i = 0; i < geRF.length; i++) {
          if ((!geRM[i] || geRM[i] === "0") && (!geRR2[i] || geRR2[i] === "0")) continue;
          let s = `集氣值 ${geRF[i]}~${geRT[i]}：`;
          if (geRM[i] && geRM[i] !== "0") s += `成員倍率 × ${fmt(Number(geRM[i]) / 1000)} `;
          if (geRR2[i] && geRR2[i] !== "0") s += `回復倍率 × ${fmt(Number(geRR2[i]) / 1000)}`;
          parts.push(s.trim());
        }
        return { icon: "⭐", title: "動態倍率（依集氣值）", parts: parts.length ? parts : ["依集氣值動態調整"], conds };
      }
      case "dh": {
        const p = parseKV(rest), conds = parseConds(p), parts = [];
        if (p.p && p.p !== "0") { const da = p.da ? [...p.da].map(c => ({ 0: "水", 1: "火", 2: "木", 3: "光", 4: "暗", 5: "心" }[c] || c)) : []; parts.push(`固定減少 ${p.p}% ${da.length ? da.join("、") + "屬性" : "所有屬性"}傷害`); }
        const geRF = (p.geRF || "").split("+").filter(Boolean), geRT = (p.geRT || "").split("+").filter(Boolean), geRR = (p.geRR || "").split("+").filter(Boolean);
        geRF.forEach((f, i) => { if (geRR[i] && geRR[i] !== "0") parts.push(`集氣值 ${f}~${geRT[i]} 時，減傷 ${geRR[i]}%`); });
        if (+p.hpGt > 0) parts.push(`條件：HP ≥ ${p.hpGt}%`);
        if (+p.atcGt > 0) parts.push(`條件：首消 ≥ ${p.atcGt} 種`);
        return { icon: "🛡️", title: "減傷", parts: parts.length ? parts : ["減少傷害"], conds };
      }
      case "dsv": {
        const p = parseKV(rest), conds = parseConds(p);
        const counts = (p.c || "").split("+");
        const attrGroups = (p.a || "").split("+").map(g => g.split("_").map(s => STONE[s] || s).filter(Boolean).join("、"));
        const rules = counts.map((c, i) => c && c !== "0" ? `${c}粒（${attrGroups[i] || "任意"}）` : "").filter(Boolean);
        const parts = [];
        if (rules.length) parts.push(`消除規則：${rules.join(" 或 ")}`);
        if (p.fb === "1") parts.push("限首消");
        if (p.mbc && p.mbc !== "0") parts.push(`每回合最多消 ${p.mbc} 批`);
        if (p.uc && p.uc !== "0") { const ua = (p.ua || "").split("_").map(s => STONE[s] || s).filter(Boolean).join("、"); parts.push(`直到消 ${p.uc} 粒${ua ? " " + ua : ""}`); }
        return { icon: "🔮", title: "改變消除方式", parts: parts.length ? parts : ["改變消除方式"], conds };
      }
      case "addtime": {
        const p = parseKV(rest), conds = parseConds(p);
        const secs = Number(p.s) / 10;
        const parts = [`${TS_ADDTIME[p.m] || "延長"} ${secs} 秒`];
        if (+p.memAS > 0) parts.push(`每多1種屬性 +${Number(p.memAS) / 10}秒（最多 +${Number(p.maxS) / 10}秒）`);
        return { icon: "⏱️", title: "延長移動符石時間", parts, conds };
      }
      case "reduceCD": {
        const p = parseKV(rest), conds = parseConds(p);
        const mars = p.mar ? p.mar.split("+") : [], ns2 = p.n ? p.n.split("+") : [];
        const parts = mars.map((m, i) => `${parseAR(m) || "全體"} CD -${ns2[i] || 0}`);
        return { icon: "⏳", title: "減CD", parts: parts.length ? parts : ["減少技能CD"], conds };
      }
      case "preAtk": {
        const p = parseKV(rest), conds = parseConds(p);
        const attr = p.attr === "-1" ? "無屬性" : (ELEM_NUM[p.attr] || p.attr);
        const parts = [`造成${attr}屬性攻前傷害`];
        if (+p.a > 0) parts.push(`全隊攻擊力合計 × ${p.a}`);
        if (+p.p > 0) parts.push(`此卡攻擊力 × ${p.p}`);
        return { icon: "⚔️", title: "攻前傷害", parts, conds };
      }
      case "rec": {
        const p = parseKV(rest), conds = parseConds(p);
        return { icon: "💚", title: "殺敵回血", parts: [`殺敵後回復 ${p.p}% 傷害量`], conds };
      }
      case "exAtk": {
        const p = parseKV(rest), conds = parseConds(p), parts = [];
        if (+p.fa > 0) parts.push(`攻擊力 × ${fmt(p.fa)}`);
        if (p.mar) { const ar = parseAR(p.mar); if (ar) parts.push(`限 ${ar} 成員`); }
        if (+p.cf > 0 && +p.ct > 0) parts.push(`消 ${p.cf}~${p.ct} C 時觸發`);
        return { icon: "👊", title: "追打", parts: parts.length ? parts : ["追加攻擊"], conds };
      }
      case "genSt": {
        const p = parseKV(rest), conds = parseConds(p), parts = [];
        if (p.byAC_c && p.byAC_n && p.byAC_a) parts.push(`消 ${p.byAC_c} 粒特定符石 → 掉落 ${p.byAC_n} 粒${STONE_NUM[p.byAC_a] || p.byAC_a}`);
        if (p.byCol) parts.push("依直行掉落特定符石");
        return { icon: "🪨", title: "改變符石掉落", parts: parts.length ? parts : ["改變符石掉落"], conds };
      }
      case "Ignr1": {
        const p = parseKV(rest), conds = parseConds(p), ig = [];
        if (p.iC === "1") ig.push("無視凍結"); if (p.iS === "1") ig.push("無視石化"); if (p.iE === "1") ig.push("無視電擊");
        if (p.cE === "1") ig.push("解除電擊"); if (p.cF === "1") ig.push("解除凍結"); if (p.cP === "1") ig.push("解除石化");
        if (p.cR === "1") ig.push("解除符石障礙"); if (p.fTR === "1") ig.push("無視轉珠限制");
        return { icon: "🔓", title: "無視/解除轉珠障礙", parts: ig.length ? ig : ["無視障礙"], conds };
      }
      case "Ignr2": {
        const p = parseKV(rest), conds = parseConds(p), parts = [];
        if (p.iAC && p.iAC !== "0") parts.push(`首消 ${p.aC} 種符石 → 無視${IGNR_NAME[p.iAC] || "限制"}`);
        if (p.iLS && p.iLS !== "0") { const st = (p.aLS || "").split("_").map(s => STONE[s] || s).join("、"); parts.push(`首消 ${p.ISC || p.lSC} 粒 ${st} → 無視${IGNR_NAME[p.iLS] || "限制"}`); }
        if (p.iCC && p.iCC !== "0") parts.push(`首消 ${p.cC} Combo → 無視${IGNR_NAME[p.iCC] || "限制"}`);
        return { icon: "🔓", title: "無視攻擊限制", parts: parts.length ? parts : ["無視攻擊限制"], conds };
      }
      default: return { icon: "❓", title: type, parts: [rest.slice(0, 80)], conds: [], raw: true };
    }
  } catch { return { icon: "❓", title: type, parts: [rest.slice(0, 80)], conds: [], raw: true }; }
}

// ==================== 卡片解析 ====================
function parseEffectBlock(str, ctx) {
  if (!str) return [];
  const fn = ctx === "ls" ? parseLS : ctx === "ts" ? parseTS : parseAS;
  return str.split(";").map(s => s.trim()).filter(Boolean).map(fn).filter(Boolean);
}

function parseCard(code) {
  try {
    const parts = code.trim().split(/\$\$as=|\$\$ls=|\$\$ts=|\$\$imgId=|\$\$imgCrop=|\$\$imgSrc=/);
    const base = parts[0].split(/=b=|,/);
    const no = base[0] || "", name = base[1] || "", hp = base[2] || "0", atk = base[3] || "0", rec = base[4] || "0";
    const element = (base[5] || "w").trim(), race = (base[6] || "G").trim(), series = (base[7] || "").trim();
    const asStr = parts[1] || "";
    const skills = asStr.split(/;;/).filter(s => s.trim()).map(s => {
      const m = s.match(/^(.*?)=b=(.*?)\$s=(.*)$/s); if (!m) return null;
      return { name: m[1], cd: m[2], effects: parseEffectBlock(m[3], "as") };
    }).filter(Boolean);
    const lsStr = (parts[2] || "").replace(/^.*?=s=/, "");
    const leaderSkill = parseEffectBlock(lsStr, "ls");
    const teamSkill = parseEffectBlock(parts[3] || "", "ts");
    return { no, name, hp, atk, rec, element, race, series, skills, leaderSkill, teamSkill, imgSrc: (parts[6] || "").trim() };
  } catch { return null; }
}


// 模組名稱對應中文標籤
const TAG_NAMES = {
  // 主動技
  clrLock: "解鎖", clrBuff: "清除附加效果", bump: "引爆符石",
  ts: "轉版", tsdyna: "動態轉版", tshv: "轉行列", tsbr: "蓄能轉化",
  tsfp: "固定版面", dirAtk: "直接傷害", addGE: "增減集氣值",
  addatk: "增攻", addrec: "增回", rdcHurt: "減傷", dsv: "主動改變消除",
  addtime: "延長排珠", freemove: "排珠", exAtk: "追打",
  possess: "主動兼具", chC: "變身", mrgC: "合體",
  // 隊長技
  mag: "隊長倍率", dynaMag: "隊長動態倍率", dh: "隊長減傷",
  // 隊伍技（用前綴區分）
};

const TS_TAG_NAMES = {
  gEng: "集氣值系統", mag: "隊伍倍率", dynUp: "動態倍率",
  dh: "隊伍減傷", addtime: "延長移動時間", reduceCD: "減CD",
  preAtk: "攻前傷害", rec: "殺敵回血", exAtk: "隊伍追打",
  genSt: "改變掉落", Ignr1: "無視轉珠障礙", Ignr2: "無視攻擊限制",
  dsv: "隊伍改變消除",
};

function extractModule(line) {
  const ei = line.indexOf("=");
  return ei >= 0 ? line.slice(0, ei) : null;
}

export function extractSkillTags(cardCode) {
  const tags = new Set();

  try {
    const parts = cardCode.trim().split(/\$\$as=|\$\$ls=|\$\$ts=|\$\$imgId=|\$\$imgCrop=|\$\$imgSrc=/);

    // 主動技標籤
    const asStr = parts[1] || "";
    const skillBlocks = asStr.split(/;;/).filter(s => s.trim());
    skillBlocks.forEach(block => {
      const m = block.match(/^.*?=b=.*?\$s=(.*)$/s);
      if (!m) return;
      m[1].split(";").forEach(line => {
        const mod = extractModule(line.trim());
        if (mod && TAG_NAMES[mod]) tags.add(TAG_NAMES[mod]);
      });
    });

    // 隊長技標籤
    const lsStr = (parts[2] || "").replace(/^.*?=s=/, "");
    lsStr.split(";").forEach(line => {
      const mod = extractModule(line.trim());
      if (!mod) return;
      if (mod === "mag") tags.add("隊長倍率");
      else if (mod === "dynaMag") tags.add("隊長動態倍率");
      else if (mod === "dh") tags.add("隊長減傷");
      else if (mod === "possess") tags.add("隊長兼具");
      else if (mod === "dsv") tags.add("隊長改變消除");
      else if (mod === "addtime") tags.add("隊長延長移動時間");
      else if (mod === "gsbc") tags.add("消Combo掉落");
    });

    // 隊伍技標籤
    const tsStr = parts[3] || "";
    tsStr.split(";").forEach(line => {
      const mod = extractModule(line.trim());
      if (mod && TS_TAG_NAMES[mod]) tags.add(TS_TAG_NAMES[mod]);
    });

  } catch (e) {
    console.error(e);
  }

  return [...tags];
}


export { parseCard };