const MAX_PLAYERS = 4,
    MAX_IMPACT = 255,
    CMD_STATE = 0,
    CMD_IF_NOT = 19,
    CMD_IF = 20,
    CMD_ELSE_IF_NOT = 21,
    CMD_ELSE_IF = 22,
    CMD_ELSE = 23,
    CMD_END_IF = 24,
    JOY_LEFT = 1,
    JOY_RIGHT = 2,
    JOY_UP = 4,
    JOY_DOWN = 8,
    JOY_BUTTONA = 16,
    JOY_BUTTONB = 32,
    JOY_BUTTONC = 64,
    JOY_JUMP = 128,
    JOY_ACTION = 256,
    JOY_EXTRA = 512,
    JOY_TRAINER = 1024,
    JOY_SHOULDER_L = 2048,
    JOY_SHOULDER_R = 4096,
    JOY_CONTINUE = 8192,
    JOY_INVENTORY = 16384,
    REG_ENERGY = 0,
    REG_IMPACT = 1,
    REG_VALUE = 2,
    REG_FLAGS = 3,
    CT_OBJECT = 0,
    CT_PLAYER = 1,
    CT_WALL = 2,
    CT_PLATFORM = 3,
    CT_TARGET = 4,
    CT_HAZARD = 5,
    CT_BULLET = 6,
    CT_EBULLET = 7,
    CT_XBULLET = 8,
    DM_NORMAL = 0,
    DM_VALUE = 1,
    DM_THREAD = 2,
    DM_FORCEFIELD = 3,
    DM_METER = 4,
    DM_ANGLE = 5,
    AM_DEFAULT = 0,
    AM_NODE = 1,
    AM_PATROL = 2,
    AM_DRIFT = 3,
    AM_SPIN = 4,
    AM_BUTTERFLY = 5,
    AM_CHASE_PLAYER = 6,
    AM_MAZE_MOVE = 7,
    AM_FLOOR_BUMP = 8,
    AM_NORMAL = 0,
    AM_PING_PONG = 1,
    AM_ONCE = 2,
    AM_MOVE = 3,
    AM_REVERSE = 4,
    TF_FLOOR = 16,
    TF_CEILING = 32,
    TF_LEFT_WALL = 64,
    TF_RIGHT_WALL = 128,
    TM_VOID = 0,
    TM_STOP = 1,
    TM_BOUNCE = 2,
    TM_OUT = 3,
    TM_CUSTOM = 4,
    MM_TILE = 0,
    MM_STACK = 1,
    MM_GHOST = 2,
    TILE_FLIP_X = 16384,
    TILE_FLIP_Y = 32768,
    BORDER_OPEN = 0,
    BORDER_STOP = 1,
    BORDER_WRAP = 2,
    BORDER_VOID = 3,
    BORDER_LOSS = 4,
    BORDER_BOUNCE = 5,
    RM_PLATFORM = 0,
    RM_ORIGIN = 1,
    RM_CURRENT = 2,
    NODEMODE_NORMAL = 0,
    NODEMODE_GOTO = 1,
    FIRST_CUSTOM_CHAR = 1,
    CHARCODE_VALUE_SMALL = 31;
let bImageLoaded,
    bUserInteraction,
    bShowPlayButton,
    bSlowMotion,
    bWaitForJoyUp,
    bTrainer,
    currentMessage,
    messageTimer,
    messageOffsetY,
    dialogActor,
    waveC = 0,
    lookAheadX = 0,
    lookAheadY = 0,
    nPlayers = 1,
    score = [],
    joy = [],
    joyTouch = 0,
    lastJoy = [],
    keyHold = [],
    respawnMode = RM_PLATFORM,
    posHistoryX = [],
    posHistoryY = [];
function UpdateWave() {
    waveOffset = .5 + .5 * Math.sin(waveC),
    (waveC += .1) >= 2 * Math.PI && (waveC -= 2 * Math.PI)
}
function SnapX(e) {
    return Math.floor(e / mainLayer.tileW) * mainLayer.tileW
}
function SnapY(e) {
    return Math.floor(e / mainLayer.tileH) * mainLayer.tileH
}
function RndInt(e, t) {
    return Math.floor(Math.random() * (t + 1 - e)) + e
}
function GetDistance(e, t, o, r) {
    let l = e - o,
        a = t - r;
    return Math.sqrt(l * l + a * a)
}
function GetAngle(e, t, o, r) {
    return e != o || t != r ? Math.atan2(o - e, r - t) : 0
}
function GetTarget(e, t) {
    return 1 == t && e.passenger ? e.passenger : e
}
function InitFloor(e) {
    e.tileCollStatus = e.lastTileCollStatus = TF_FLOOR
}
function GetNearestPlayer(e) {
    let t,
        o = 16777215;
    for (let r = 0; r < MAX_PLAYERS; r++) {
        let l = player[r];
        if (l && l.collType == CT_PLAYER && !l.bOut) {
            let r = GetDistance(l.x, l.y, e.x, e.y);
            o > r && (t = l, o = r)
        }
    }
    return t
}
function GetParent(e) {
    let t = iFirstActor;
    for (; t >= 0;) {
        if (actor[t].iObject == e.iParent)
            return actor[t];
        t = actor[t].iNext
    }
}
function GetS8(e) {
    return e >= 128 ? e - 256 : e
}
function GetS16(e) {
    return e >= 32768 ? e - 65536 : e
}
function TestJoy(e, t=0) {
    return bWaitForJoyUp ? 0 : joy[t] & e ? lastJoy[t] & e ? 2 : 1 : void 0
}
function GetRT(e) {
    return e >= 10 ? "" + e : "0" + e
}
function RenderText(e, t, o) {
    let r = [],
        l = 0;
    renderCol = [];
    let a = 0,
        n = 0;
    for (; t[o] && "|" != t[o];) {
        let i,
            c = t.substr(o, 2),
            s = t.substr(o, 3),
            u = t.substr(o, 4),
            f = t.substr(o, 5);
        if ("<sc>" == u || "<sc2>" == f || "<hi>" == u) {
            let e = "";
            "<sc>" == u ? e += score[0] : "<sc2>" == f ? e += score[1] : "<hi>" == u && (e += score[0]);
            let t = 6 - e.length;
            for (let o = 0; o < 6; o++)
                r[l++] = o < t ? 48 : e.charCodeAt(o - t);
            o += 4,
            "<sc2>" == f && o++
        } else if ("<ti>" == u) {
            let e = raceTimer,
                t = GetRT(Math.floor(e / 3600) % 60) + ":" + GetRT(Math.floor(e / 60) % 60) + ":" + GetRT(Math.floor(100 * e / 60) % 100);
            for (let e = 0; e < t.length; e++)
                r[l++] = t.charCodeAt(e);
            o += 4
        } else if ("<v>" == s) {
            let t = "" + e.reg[REG_VALUE];
            for (let e = 0; e < t.length; e++)
                r[l++] = t.charCodeAt(e);
            o += 3
        } else if ("<vs" == s && t[o + 3] >= "0" && t[o + 3] <= "9" && ">" == t[o + 4]) {
            let a = e.reg[REG_VALUE];
            a > 0 && (r[l++] = FIRST_CUSTOM_CHAR + (t[o + 3] - "0")),
            a > 1 ? (r[l++] = CHARCODE_VALUE_SMALL, r[l++] = e.reg[REG_VALUE]) : 1 == a && (r[l++] = " "),
            o += 5
        } else if ("<i" == c && t[o + 2] >= "0" && t[o + 2] <= "9" && ">" == t[o + 3])
            r[l++] = FIRST_CUSTOM_CHAR + (t[o + 2] - "0"),
            o += 4;
        else if ("<v" == c && t[o + 2] >= "0" && t[o + 2] <= "9" && ">" == t[o + 3]) {
            let a = e.reg[REG_VALUE];
            a > 10 && (a = 10);
            for (let e = 0; e < a; e++)
                r[l++] = FIRST_CUSTOM_CHAR + (t[o + 2] - "0");
            o += 4
        } else if ("<c" == c && t[o + 2] >= "0" && t[o + 2] <= "9" && ">" == t[o + 3])
            a = t[o + 2] - "0",
            o += 4;
        else if ("<itm>" == f) {
            if (e.obj && e.obj.iItem >= 0)
                i = item[e.obj.iIem].name;
            else {
                let e = inv.cursorX + inv.cursorY * inv.nColumns;
                i = e < nInventoryItems ? item[inventory[e]].name : "NO ITEM"
            }
            o += 5
        } else
            r[l++] = t.charCodeAt(o++);
        if (i)
            for (let e = 0; e < i.length; e++)
                r[l++] = i.charCodeAt(e);
        for (; n < l;)
            renderCol[n++] = a
    }
    return r
}
function TestMove(e, t, o, r) {
    if (r == MM_GHOST)
        return !0;
    let l = e.script.sprW,
        a = e.script.sprH,
        n = (e.x >> 8) + t,
        i = (e.y >> 8) + o;
    if (0 == o) {
        let o = a / mainLayer.tileH + 1;
        o < 2 && (o = 2);
        let r = n;
        t > 0 && (r += l - 1);
        let c = i;
        for (let t = 0; t < o; t++) {
            t == o - 1 && (c = i + a - 1);
            let l = GetTileInfo(e, r, c),
                n = 15 & l;
            if (l & (TF_LEFT_WALL | TF_RIGHT_WALL))
                return !1;
            if (n > 0 && !(moveMask & 1 << n - 1))
                return !1;
            c += mainLayer.tileH
        }
    } else {
        let t = l / mainLayer.tileW + 1;
        t < 2 && (t = 2);
        let r = n,
            c = i;
        o > 0 && (c += a - 1);
        for (let a = 0; a < t; a++) {
            a == t - 1 && (r = n + l - 1);
            let i = GetTileInfo(e, r, c),
                s = 15 & i;
            if (o > 0) {
                if (i & TF_FLOOR)
                    return !1
            } else if (i & TF_CEILING)
                return !1;
            if (s > 0 && !(moveMask & 1 << s - 1))
                return !1;
            r += mainLayer.tileW
        }
    }
    let c = e.collType;
    if (e.collType = -1, TestCollRect(n, i, l, a, CT_WALL))
        return e.collType = c, !1;
    if (e.collType = c, r == MM_STACK) {
        let r = iFirstActor;
        for (; r >= 0;) {
            let c = actor[r];
            if (c.collType == CT_HAZARD && c.bShow && c.script && c != e) {
                let r = c.x >> 8,
                    s = c.y >> 8;
                if (n + l > r && n < r + c.script.sprW && i + a > s && i < s + c.script.sprH) {
                    let r;
                    if (t < 0 && c.x > e.x && (r = !0), t > 0 && c.x < e.x && (r = !0), o < 0 && c.y > e.y && (r = !0), o > 0 && c.y < e.y && (r = !0), !r)
                        return !1
                }
            }
            r = c.iNext
        }
    }
    return !0
}
function Fill(e, t, o, r, l, a=1) {
    drawContext.globalAlpha = a,
    drawContext.fillStyle = l,
    drawContext.fillRect(e, t, o, r),
    drawContext.globalAlpha = 1
}
function CopyFrame() {
    let e = document.getElementById("mainCanvas"),
        t = e.getContext("2d");
    t.save(),
    t.mozImageSmoothingEnabled = !1,
    t.webkitImageSmoothingEnabled = !1,
    t.msImageSmoothingEnabled = !1,
    t.imageSmoothingEnabled = !1,
    t.scale(e.width / drawCanvas.width, e.height / drawCanvas.height),
    t.drawImage(drawCanvas, 0, 0),
    t.restore()
}
function DrawPlayButton() {
    let e = document.getElementById("mainCanvas"),
        t = e.getContext("2d"),
        o = e.width,
        r = e.height,
        l = o / 2,
        a = r / 2;
    t.globalAlpha = .5,
    t.fillStyle = "rgb( 128, 128, 128 )",
    t.fillRect(0, 0, o, r),
    t.globalAlpha = 1,
    t.fillStyle = "rgb( 255, 255, 255 )",
    t.beginPath(),
    t.arc(l, a, 120, 0, 2 * Math.PI),
    t.fill(),
    l += 15,
    t.fillStyle = "rgb( 0, 0, 0 )",
    t.beginPath(),
    t.moveTo(l - 50, a - 55),
    t.lineTo(l + 50, a),
    t.lineTo(l - 50, a + 55),
    t.lineTo(l - 50, a - 55),
    t.fill()
}
function DrawTile(e, t, o, r) {
    let l = 4 * r.shape;
    if (null != clip[l]) {
        let a = 16384 & o,
            n = 32768 & o;
        o &= 16383;
        let i = currentTileset.animTable[o];
        i && (o += Math.floor(mapTimer / i.speed % i.nFrames));
        let c = Math.floor(clip[l + 2] / r.tileW),
            s = clip[l + 0] + o % c * r.tileW,
            u = clip[l + 1] + Math.floor(o / c) * r.tileH,
            f = drawContext,
            d = currentTileset.fxTable[o];
        if (d >= 0) {
            if (0 == d) {
                let o = mapTimer / 4 & 15,
                    l = r.tileW,
                    a = r.tileH;
                t += Math.floor(4 * waveOffset),
                s += o,
                l -= o,
                f.drawImage(pngCanvas, s, u, l, a, e, t, l, a),
                s -= o,
                e += 16 - o,
                l = o,
                f.drawImage(pngCanvas, s, u, l, a, e, t, l, a)
            } else if (1 == d) {
                let o = mapTimer / 8 & 15,
                    l = r.tileW,
                    a = r.tileH;
                u += o,
                a -= o,
                f.drawImage(pngCanvas, s, u, l, a, e, t, l, a),
                u -= o,
                t += 16 - o,
                a = o,
                f.drawImage(pngCanvas, s, u, l, a, e, t, l, a)
            }
        } else
            a || n ? (f.save(), f.translate(e + r.tileW / 2, t + r.tileH / 2), a ? n ? f.scale(-1, -1) : f.scale(-1, 1) : n && f.scale(1, -1), f.translate(-(e + r.tileW / 2), -(t + r.tileH / 2)), drawContext.drawImage(pngCanvas, s, u, r.tileW, r.tileH, e, t, r.tileW, r.tileH), f.restore()) : f.drawImage(pngCanvas, s, u, r.tileW, r.tileH, e, t, r.tileW, r.tileH)
    }
}
function DrawActor(e, t=0, o=0, r) {
    if (e.s >= 0) {
        let l = 4 * e.s;
        if (r >= 0 && (l = 4 * r), e.shapeOffset && (l += 4 * e.shapeOffset), null != clip[l]) {
            let r = drawContext,
                a = pngCanvas;
            e.whiteMaskC > 0 && (a = maskCanvas);
            let n = (e.x >> 8) + t + e.drawOffsetX,
                i = (e.y >> 8) + o + e.drawOffsetY,
                c = clip[l + 0],
                s = clip[l + 1],
                u = clip[l + 2],
                f = clip[l + 3];
            if (e.clipU >= 0 && i < e.clipU) {
                if ((f += i - e.clipU) < 1)
                    return;
                s -= i - e.clipU,
                i -= i - e.clipU
            }
            if (e.clipD >= 0 && i + f - 1 > e.clipD && (f -= i + f - 1 - e.clipD) < 1)
                return;
            n += drawX - cameraX,
            i += drawY - cameraY,
            r.globalAlpha = e.blend,
            e.bFlipX || e.bFlipY ? (r.save(), r.translate(n + u / 2, i + f / 2), e.bFlipX ? e.bFlipY ? r.scale(-1, -1) : r.scale(-1, 1) : e.bFlipY && r.scale(1, -1), r.translate(-(n + u / 2), -(i + f / 2)), r.drawImage(a, c, s, u, f, n, i, u, f), r.restore()) : r.drawImage(a, c, s, u, f, n, i, u, f),
            r.globalAlpha = 1
        }
    }
}
function DrawValue(e) {
    let t = "" + e.reg[REG_VALUE],
        o = (e.x >> 8) + drawX - cameraX,
        r = (e.y >> 8) + drawY - cameraY + 4,
        l = 0;
    for (let e = 0; t[e]; e++) {
        let o = t.charCodeAt(e) - 48;
        l += smNrW[o]
    }
    o += 8 - Math.floor(l / 2);
    let a = drawContext;
    for (let n = 0; t[n]; n++) {
        let i = t.charCodeAt(n) - 48;
        l = smNrW[i],
        a.globalAlpha = e.blend,
        a.drawImage(pngCanvas, smNrX[i], smNrY, l, 7, o, r, l, 7),
        a.globalAlpha = 1,
        o += l - 1
    }
}
function DrawThread(e) {
    let t = e.x >> 8,
        o = e.y >> 8,
        r = mainLayer.tileH;
    if (null == e.clipU) {
        let l = o;
        for (let o = 0; o < 16 && !(GetTileInfo(e, t, l) & TF_CEILING); o++)
            l -= r;
        (l = SnapY(l) + r) < 0 && (l = 0),
        e.clipU = l
    }
    DrawActor(e);
    let l = (o - e.clipU) / r + 1;
    for (let t = 0; t < l; t++)
        DrawActor(e, 0, -(t + 1) * r, e.dmShape + 1);
    let a = -(e.clipU - o);
    DrawActor(e, 0, -a, e.dmShape),
    e.collType == CT_WALL && (a > 0 ? (e.collY = 4 - a, e.collH = a + 12) : (e.collY = 0, e.collH = 16))
}
function DrawMeter(e) {
    let t = 4 * e.dmShape,
        o = Math.floor((e.x >> 8) - e.dm2 + drawX - cameraX),
        r = Math.floor((e.y >> 8) - e.dm3 + drawY - cameraY),
        l = clip[t + 2],
        a = clip[t + 3];
    drawContext.drawImage(pngCanvas, clip[t + 0], clip[t + 1], l, a, o, r, l, a);
    let n = e.reg[REG_VALUE];
    n && (n < l && (l = n), drawContext.drawImage(pngCanvas, clip[t + 4], clip[t + 5], l, a, o, r, l, a))
}
function DrawAngle(e) {
    let t = 4 * e.dmShape,
        o = clip[t + 2],
        r = clip[t + 3];
    for (let l = 0; l < 5; l++) {
        let a = e.reg[REG_VALUE] / 255 * Math.PI * 2,
            n = Math.floor((e.x >> 8) + clip[4 * e.s + 2] / 2 - o / 2 + Math.cos(a) * (12 + e.dm2 + 8 * l) + .5 + drawX - cameraX),
            i = Math.floor((e.y >> 8) + clip[4 * e.s + 3] / 2 - r / 2 + Math.sin(a) * (12 + e.dm2 + 8 * l) + .5 + drawY - cameraY);
        drawContext.drawImage(pngCanvas, clip[t + 0], clip[t + 1], o, r, n, i, o, r)
    }
}
function DrawForceField(e) {
    let t = 4 * e.dmShape,
        o = clip[t + 2],
        r = clip[t + 3],
        l = e.dm2;
    for (let a = 0; a < l; a++) {
        let l = GetForceFieldPos(e, a),
            n = Math.floor(l.x + drawX - o / 2 - cameraX),
            i = Math.floor(l.y + drawY - r / 2 - cameraY);
        drawContext.drawImage(pngCanvas, clip[t + 0], clip[t + 1], o, r, n, i, o, r)
    }
}
function DrawText(e, t, o) {
    if (o > -8 && o < drawH)
        for (let r = 0; e[r]; r++)
            if (t > -8 && t < drawW) {
                let l = e.charCodeAt(r) - 32,
                    a = 8 * l & 511,
                    n = fontY + Math.floor(l / 64);
                drawContext.drawImage(pngCanvas, a, n, 8, 8, drawX + t, drawY + o, 8, 8),
                t += 8
            }
}
function DrawTags(e) {
    for (let t = 0; e.tag[t]; t++)
        DrawText(e.tag[t].text, e.tag[t].x - cameraX, e.tag[t].y - cameraY)
}
function DrawMenu() {}
function UpdateDialog() {
    dialogActor && player[0] && (TestPlayerInBox(dialogActor) ? 0 == player[0].vx && bubble.bOpen && (player[0].x < dialogActor.x ? player[0].bFlipX = !1 : player[0].bFlipX = !0) : (dialogActor.scriptPos = 0, CloseBubble(), dialogActor = void 0, bDialogRestart = !0))
}
function UpdateMessage() {
    messageTimer > 0 ? (messageOffsetY < 8 && messageOffsetY++, messageTimer--) : messageOffsetY > 0 && messageOffsetY--
}
function DrawMessage() {
    messageOffsetY > 0 && (Fill(drawX, drawY + messageOffsetY - hudH, resX, 8, "rgb( 0, 0, 0 )", .5), DrawText(currentMessage, resX / 2 - 4 * currentMessage.length, messageOffsetY - hudH))
}
function DrawNewItem() {}
function DrawPortrait() {}
function DrawInventory() {}
function DrawChar(e, t, o, r=0) {
    if (e > 32) {
        let l = 8 * (e -= 32) & 511,
            a = fontY + Math.floor(e / 64) + 16 * r;
        drawContext.drawImage(pngCanvas, l, a, 8, 8, t, o, 8, 8)
    } else if (e >= FIRST_CUSTOM_CHAR && e < 32 && iconS >= 0) {
        let r = 4 * (iconS + e - FIRST_CUSTOM_CHAR),
            l = clip[r + 2],
            a = clip[r + 3];
        drawContext.drawImage(pngCanvas, clip[r + 0], clip[r + 1], l, a, t, o, l, a)
    }
}
function DrawTextLayer(e, t) {
    for (let o = e; o < e + t; o++)
        for (let e = 0; e < scr.nColumns; e++) {
            let t = e + o * scr.nColumns,
                r = scr.color[t],
                l = scr.buffer[t];
            if (l == CHARCODE_VALUE_SMALL) {
                let l = "" + scr.buffer[t + 1],
                    a = 8 * e;
                for (let e = 0; l[e]; e++) {
                    let t = l.charCodeAt(e) - 48,
                        n = smNrW[t];
                    drawContext.drawImage(pngCanvas, smNrX[t], smNrY + 16 * r, n, 7, a, 8 * o, n, 7),
                    a += n - 1
                }
                e++
            } else
                DrawChar(l, 8 * e, 8 * o, r)
        }
}
function DrawGameOver() {
    if (bGameOver) {
        let e = 88,
            t = drawW / 2 - e / 2,
            o = drawH / 2 - 16;
        Fill(drawX + t, drawY + o, e, 24, "rgb( 0, 0, 0 )"),
        DrawText("GAME OVER", t + 8, o + 8)
    }
}
function DrawFade() {
    fadeOpacity < 1 && (drawContext.globalAlpha = 1 - fadeOpacity, drawContext.fillStyle = "rgb( 0, 0, 0 )", drawContext.fillRect(0, 0, resX, resY), drawContext.globalAlpha = 1)
}
let bubble = {};
function FormatBubble(e, t) {
    let o = 0,
        r = 0,
        l = 0,
        a = 0,
        n = 0;
    for (; n < e.length;)
        a > t && (bubble.text[l] = e.slice(o, r - 1), l++, o = r, a = n - r),
        32 == e[n] && (r = n + 1),
        a++,
        n++;
    bubble.text[l] = e.slice(o, e.length),
    bubble.nLines = l + 1
}
function Say(e, t, o, r) {
    bubble.bOpen = !0,
    bubble.bMenu = !1,
    bubble.text = [],
    r ? FormatBubble(e, 20) : (bubble.text[0] = e, bubble.nLines = 1),
    bubble.x = t,
    bubble.y = o - 8 * (2 + bubble.nLines)
}
function CloseBubble() {
    bubble.bOpen = !1
}
function UpdateBubble() {
    bubble.bOpen ? bubble.nDisplayChars++ : bubble.nDisplayChars = 0
}
function DrawBubbleShape(e, t, o) {
    let r = 256 + 8 * o,
        l = fontY + 8;
    drawContext.drawImage(pngCanvas, r, l, 8, 8, e, t, 8, 8)
}
function DrawBubbleFrame(e, t, o, r, l, a) {
    let n = e + a - 12,
        i = "rgb( 0, 0, 0 )",
        c = "rgb( 255, 255, 255 )";
    Fill(e, t + 8, o, r - 16, i),
    Fill(e + 8, t, o - 16, r, i),
    Fill(e + 1, t + 8, o - 2, r - 16, c),
    Fill(e + 8, t + 1, o - 16, r - 2, c),
    DrawBubbleShape(e, t, 0),
    DrawBubbleShape(e + o - 8, t, 1),
    DrawBubbleShape(e, t + r - 8, 2),
    DrawBubbleShape(e + o - 8, t + r - 8, 3),
    l && DrawBubbleShape(n, t + r - 1, 4)
}
function DrawBubble() {
    if (!bubble.bOpen)
        return;
    let e = bubble.text[0].length;
    for (let t = 1; t < bubble.nLines; t++)
        e < bubble.text[t].length && (e = bubble.text[t].length);
    let t = bubble.x - cameraX,
        o = bubble.y - cameraY,
        r = 16 + 8 * e,
        l = 16 + 8 * bubble.nLines;
    bubble.bMenu && (r += 6);
    let a = t -= r / 2;
    t < 0 && (t = 0),
    t + r > resX && (t = resX - r),
    DrawBubbleFrame(t, o, r, l, !0, r / 2 + (a -= t)),
    t += 8,
    bubble.bMenu && (t += 6),
    o += 8;
    let n = 0;
    for (let e = 0; e < bubble.nLines; e++) {
        bubble.bMenu && e == cursorPos && DrawBubbleShape(t - 8, o, 4);
        for (let r = 0; bubble.text[e][r]; r++)
            n < bubble.nDisplayChars && (DrawChar(bubble.text[e][r], t + 8 * r, o, nTextColors - 1), n++);
        o += 8
    }
}
function TestInv(e) {
    for (let t = 0; t < nInventoryItems; t++)
        if (inventory[t] == e)
            return !0
}
function AddToInv(e) {}
function DropInv(e) {
    for (let t = 0; t < nInventoryItems; t++)
        if (inventory[t] == e) {
            for (; t < nInventoryItems - 1; t++)
                inventory[t] = inventory[t + 1];
            return void nInventoryItems--
        }
}
function GetCurrentRoom() {
    let e = 0,
        t = currentMap,
        o = mainLayer,
        r = 1;
    return t.gridX && (r = Math.floor(o.w / t.gridX)), t.gridX && (e = Math.floor(roomX / o.tileW / t.gridX)), t.gridY && (e += Math.floor(roomY / o.tileH / t.gridY) * r), e
}
function NewRoom() {
    let e = iFirstActor;
    for (; e >= 0;)
        actor[e].bGlobal || actor[e].lastPassenger || (actor[e].obj && (actor[e].obj.bSpawned = !1), actor[e].bDeleteMe = !0, actor[e].bShow = !1),
        e = actor[e].iNext;
    let t = currentMap;
    for (let e = 0; t.obj[e]; e++) {
        let o = t.obj[e];
        script[o.i].bRevive && (t.obj[e].bSpawned = !1)
    }
    let o = GetMainActor();
    o && (o.scriptPos = 0, o.waitC = 0, o.gosubC = 0)
}
function GotoRoom(e) {
    let t = currentMap,
        o = 1;
    t.gridX && (o = Math.floor(mainLayer.w / t.gridX)),
    cameraX = e % o * mainLayer.tileW * t.gridX,
    cameraY = Math.floor(e / o) * mainLayer.tileH * t.gridY,
    InitMap()
}
function NextRoom(e=1) {
    let t = currentMap,
        o = GetCurrentRoom(),
        r = t.roomTable.length;
    for (let l = 0; l < r; l++)
        if (t.roomTable[l] == o)
            return (l += e) < 0 && (l += r), l >= r && (l -= r), void (iRoomRequest = t.roomTable[l])
}
function UpdateRoomRegs(e, t) {
    if (e < 0 || t < 0)
        return;
    let o = currentMap,
        r = mainLayer;
    roomX = 0,
    roomY = 0,
    roomW = r.w * r.tileW,
    roomH = r.h * r.tileH;
    let l = o.gridX * r.tileW,
        a = o.gridY * r.tileH;
    if (o.gridX && (roomX = Math.floor(e / l) * l, roomW = l), o.gridY && (roomY = Math.floor(t / a) * a, roomH = a), l && a) {
        let e = roomX / l,
            t = roomY / a;
        for (let r = 0; r < o.nUnionBoxes; r++) {
            let n = o.unionBox[r];
            if (e >= n.x && e < n.x + n.w && t >= n.y && t < n.y + n.h) {
                roomX = n.x * l,
                roomY = n.y * a,
                roomW = n.w * l,
                roomH = n.h * a;
                break
            }
        }
    }
    e = roomX / r.tileW,
    t = roomY / r.tileH;
    let n = roomW / r.tileW,
        i = roomH / r.tileH,
        c = !0;
    for (; c && roomW > resX;) {
        for (let o = 0; o < i; o++)
            if (r.buffer[e + n - 1 + (t + o) * r.w] > 0) {
                c = !1;
                break
            }
        c && (n--, roomW -= r.tileW)
    }
    for (c = !0; c && roomH > resY - hudH;) {
        for (let o = 0; o < n; o++)
            if (r.buffer[e + o + (t + i - 1) * r.w] > 0) {
                c = !1;
                break
            }
        c && (i--, roomH -= r.tileH)
    }
}
function SetCamera(e) {
    let t = e.x >> 8,
        o = e.y >> 8;
    if (player[0] && player[1]) {
        if (player[0] == e)
            return;
        t = e.x + player[0].x >> 9,
        o = e.y + player[0].y >> 9
    }
    t += Math.floor(e.collX + e.collW / 2) + lookAheadX,
    o += Math.floor(e.collY + e.collH / 2) + lookAheadY,
    e.borderModeLR != BORDER_OPEN && e.borderModeU != BORDER_OPEN && e.borderModeD != BORDER_OPEN || UpdateRoomRegs(t, o);
    let r = resX,
        l = resY - hudH,
        a = t - r / 2,
        n = o - l / 2;
    if (a < roomX && (a = roomX), n < roomY && (n = roomY), a > roomX + roomW - r && (a = roomX + roomW - r), n > roomY + roomH - l && (n = roomY + roomH - l), 0 == mapTimer)
        cameraX = a,
        cameraY = n;
    else {
        if (a != cameraX) {
            let e = Math.floor(Math.abs(cameraX - a) / 8) + 1;
            e > 16 && (e = 16),
            a < cameraX ? cameraX -= e : cameraX += e
        }
        if (n != cameraY) {
            let e = Math.floor(Math.abs(cameraY - n) / 8) + 1;
            e > 16 && (e = 16),
            n < cameraY ? cameraY -= e : cameraY += e
        }
    }
    mapTimer >= 4 && (roomX != lastRoomX || roomY != lastRoomY) && (cameraX = a, cameraY = n, NewRoom()),
    lastRoomX = roomX,
    lastRoomY = roomY
}
function HandleBorders(e) {
    let t = e.collX + Math.floor(e.collW / 2),
        o = e.collY + Math.floor(e.collH / 2),
        r = (e.x >> 8) + t,
        l = (e.y >> 8) + o,
        a = 0;
    if (e.borderModeU != BORDER_WRAP && e.borderModeD == BORDER_WRAP && (a = e.collH / 2), e.collType == CT_PLAYER && nPlayers >= 2 && (e.borderModeLR == BORDER_STOP && r < cameraX && e.x < e.lastX && (e.x = e.lastX), e.borderModeLR == BORDER_STOP && r >= cameraX + resX && e.x > e.lastX && (e.x = e.lastX), e.borderModeU == BORDER_STOP && l < cameraY && e.y < e.lastY && (e.y = e.lastY), e.borderModeD == BORDER_STOP && l >= cameraY + resY - hudH && e.y > e.lastY && (e.y = e.lastY)), r < roomX && (e.borderModeLR == BORDER_STOP && (e.x = 256 * (roomX - t), e.vx = 0), e.borderModeLR == BORDER_WRAP && (e.x += 256 * roomW), e.borderModeLR == BORDER_LOSS && HitActor(e, 255), e.borderModeLR == BORDER_BOUNCE && (e.vx = e.goalVX = -e.vx, e.x = e.lastX)), r >= roomX + roomW && (e.borderModeLR == BORDER_STOP && (e.x = 256 * (roomX + roomW - 1 - t), e.vx = 0), e.borderModeLR == BORDER_WRAP && (e.x -= 256 * roomW), e.borderModeLR == BORDER_LOSS && HitActor(e, 255), e.borderModeLR == BORDER_BOUNCE && (e.vx = e.goalVX = -e.vx, e.x = e.lastX)), l < roomY) {
        if (e.borderModeU == BORDER_STOP && (e.y = 256 * (roomY - o), e.vy = 0), e.borderModeU == BORDER_WRAP && (e.y += 256 * roomH), e.borderModeU == BORDER_LOSS && HitActor(e, 255), e.borderModeU == BORDER_OPEN) {
            let t = 256 * -(e.script.sprH - 1);
            e.y < t && (e.y = t)
        }
        e.borderModeU == BORDER_BOUNCE && (e.vy = e.goalVY = -e.vy, e.y = e.lastY)
    }
    l >= roomY + roomH + a && (e.borderModeD == BORDER_STOP && (e.y = 256 * (roomY + roomH - 1 - o), e.vy = 0), e.borderModeD == BORDER_WRAP && (e.y -= 256 * (roomH + 2 * a)), e.borderModeD == BORDER_LOSS && HitActor(e, 255), e.borderModeU == BORDER_BOUNCE && (e.vy = e.goalVY = -e.vy, e.y = e.lastY))
}
function InitTilesets() {
    for (let e = 0; tileset[e]; e++) {
        let t = tileset[e];
        t.data = [];
        let o,
            r = 0;
        for (let e = 0; t.attr[e]; e++) {
            let l;
            l = t.attr[e] <= "9" ? t.attr[e] - "0" : t.attr.charCodeAt(e) - 87,
            1 & e ? t.data[r++] = (o << 4) + l : o = l
        }
        if (t.animTable = [], t.anim)
            for (let e = 0; t.anim[e]; e++)
                t.animTable[t.anim[e].iTile] = t.anim[e];
        if (t.fxTable = [], t.fx)
            for (let e = 0; t.fx[e]; e++)
                t.fxTable[t.fx[e].iTile] = t.fx[e].mode
    }
}
function GetTilesetInfo(e) {
    return currentTileset.data[e]
}
function HandleTilePos(e, t) {
    if (e.borderModeLR == BORDER_OPEN) {
        if (t.x < 0)
            return
    } else if (e.borderModeLR == BORDER_WRAP)
        t.x < roomX && (t.x += roomW),
        t.x >= roomX + roomW && (t.x -= roomW);
    else {
        if (t.x < roomX)
            return;
        if (t.x >= roomX + roomW)
            return
    }
    if (e.borderModeU == BORDER_OPEN || e.borderModeD == BORDER_OPEN) {
        if (t.y < 0)
            return
    } else if (e.borderModeU == BORDER_WRAP && e.borderModeD == BORDER_WRAP)
        t.y < roomY && (t.y += roomH),
        t.y >= roomY + roomH && (t.y -= roomH);
    else {
        if (t.y < roomY)
            return;
        if (t.y >= roomY + roomH)
            return
    }
    return !0
}
function SetTile(e, t, o) {
    e = Math.floor(e / mainLayer.tileW),
    t = Math.floor(t / mainLayer.tileH),
    e >= 0 && e < mainLayer.w && t >= 0 && t < mainLayer.h && (mainLayer.buffer[e + t * mainLayer.w] = o)
}
function GetTile(e, t, o) {
    let r = {};
    if (r.x = t, r.y = o, !HandleTilePos(e, r))
        return 0;
    if (t = Math.floor(r.x / mainLayer.tileW), o = Math.floor(r.y / mainLayer.tileH), t >= 0 && t < mainLayer.w && o >= 0 && o < mainLayer.h) {
        let e = mainLayer.buffer[t + o * mainLayer.w];
        if (e > 0)
            return e &= ~(TILE_FLIP_X | TILE_FLIP_Y)
    }
    return 0
}
function GetTileInfo(e, t, o) {
    let r = GetTile(e, t, o);
    return r > 0 ? (r &= ~(TILE_FLIP_X | TILE_FLIP_Y), r--, currentTileset.data[r]) : 0
}
function GetTileType(e, t, o) {
    return 15 & GetTileInfo(e, t, o)
}
function TestCollision(e, t, o=!0) {
    if (!e.bShow)
        return;
    o && (tcc = iFirstActor);
    let r = (e.x >> 8) + e.collX,
        l = (e.y >> 8) + e.collY;
    for (; tcc >= 0;) {
        let o = actor[tcc];
        if (o.collType == t && o.bShow && !o.bOut && e != o) {
            let t = (o.x >> 8) + o.collX,
                a = (o.y >> 8) + o.collY;
            if (r + e.collW > t && r < t + o.collW && l + e.collH > a && l < a + o.collH)
                return tcc = actor[tcc].iNext, o
        }
        tcc = actor[tcc].iNext
    }
}
function TestCollRect(e, t, o, r, l, a=!0) {
    for (a && (tcc = iFirstActor); tcc >= 0;) {
        let a = actor[tcc];
        if (a.collType == l && a.bShow) {
            let l = (a.x >> 8) + a.collX,
                n = (a.y >> 8) + a.collY;
            if (e + o > l && e < l + a.collW && t + r > n && t < n + a.collH)
                return tcc = actor[tcc].iNext, a
        }
        tcc = actor[tcc].iNext
    }
}
function TestPlayerInBox(e) {
    if (e.obj) {
        let t = e.startX >> 8,
            o = e.startY >> 8;
        return TestCollRect(t + e.obj.box[0], o + e.obj.box[1], e.obj.box[2], e.obj.box[3], CT_PLAYER)
    }
}
function TestOnscreen(e) {
    let t = e.x >> 8,
        o = e.y >> 8;
    if (t + e.script.sprW >= cameraX && t < cameraX + resX && o + e.script.sprH >= cameraY && o < cameraY + resY - hudH)
        return 1
}
function UpdateWallCollX(e) {
    if (0 == e.vx)
        return;
    if (0 == e.collW)
        return;
    let t = mainLayer;
    if (e.tileCollStatus &= ~(TF_LEFT_WALL | TF_RIGHT_WALL), e.vx < 0) {
        e.collX--;
        let t = TestCollision(e, CT_WALL);
        for (; t;) {
            if ((e.lastX >> 8) + e.collX >= (t.lastX >> 8) + t.collX + t.collW - 1)
                return e.tileCollStatus |= TF_LEFT_WALL, e.x = t.x + 256 * (t.collX + t.collW - 1 - e.collX), e.collX++, !0;
            t = TestCollision(e, CT_WALL, !1)
        }
        e.collX++
    }
    if (e.vx > 0) {
        e.collW++;
        let t = TestCollision(e, CT_WALL);
        for (; t;) {
            if ((e.lastX >> 8) + e.collX + e.collW - 1 <= (t.lastX >> 8) + t.collX)
                return e.tileCollStatus |= TF_RIGHT_WALL, e.x = t.x + 256 * (t.collX - (e.collX + e.collW - 1)), e.collW--, !0;
            t = TestCollision(e, CT_WALL, !1)
        }
        e.collW--
    }
    let o,
        r,
        l = Math.floor(e.collH / t.tileH) + 1;
    l < 2 && (l = 2),
    e.vx < 0 ? (o = (e.x >> 8) + e.collX, r = (e.y >> 8) + e.collY) : (o = (e.x >> 8) + e.collX + e.collW, r = (e.y >> 8) + e.collY);
    for (let a = 0; a < l; a++) {
        a == l - 1 && (r = (e.y >> 8) + e.collY + e.collH - 1);
        let n = GetTile(e, o, r);
        if (n > 0 && (n--, (n &= ~(TILE_FLIP_X | TILE_FLIP_Y)) < currentTileset.data.length)) {
            let r = GetTilesetInfo(n);
            if (e.vx < 0 && r & TF_RIGHT_WALL)
                return e.tileCollStatus |= TF_LEFT_WALL, e.x = 256 * (SnapX(o) + t.tileW - e.collX), !0;
            if (e.vx > 0 && r & TF_LEFT_WALL)
                return e.tileCollStatus |= TF_RIGHT_WALL, e.x = 256 * (SnapX(o) - (e.collX + e.collW)), !0
        }
        r += t.tileH
    }
}
function UpdateWallCollY(e) {
    if (0 == e.vy)
        return;
    if (0 == e.collH)
        return;
    let t = mainLayer;
    if (e.tileCollStatus &= ~(TF_CEILING | TF_FLOOR), e.vy < 0) {
        e.collY--;
        let t = TestCollision(e, CT_WALL);
        for (; t;) {
            if ((e.lastY >> 8) + e.collY >= (t.lastY >> 8) + t.collY + t.collH - 1)
                return e.tileCollStatus |= TF_CEILING, e.y = t.y + 256 * (t.collY + t.collH - 1 - e.collY), e.collY++, !0;
            t = TestCollision(e, CT_WALL, !1)
        }
        e.collY++
    }
    if (e.vy >= 0) {
        e.collH++;
        for (let t = 0; t < 2; t++) {
            let o = CT_WALL;
            1 == t && (o = CT_PLATFORM);
            let r = TestCollision(e, o);
            for (; r;) {
                if ((e.lastY >> 8) + e.collY + e.collH - 1 <= (r.lastY >> 8) + r.collY)
                    return e.tileCollStatus |= TF_FLOOR, e.y = r.y + 256 * (r.collY - (e.collY + e.collH - 1)), e.collH--, e.tileCollMode != TM_VOID && (e.floor = r, r.passenger = e), !0;
                r = TestCollision(e, o, !1)
            }
        }
        e.collH--
    }
    let o,
        r,
        l = Math.floor(e.collW / t.tileW) + 1;
    l < 2 && (l = 2),
    e.vy < 0 ? (o = (e.x >> 8) + e.collX, r = (e.y >> 8) + e.collY) : (o = (e.x >> 8) + e.collX, r = (e.y >> 8) + e.collY + e.collH);
    for (let a = 0; a < l; a++) {
        a == l - 1 && (o = (e.x >> 8) + e.collX + e.collW - 1);
        let n = GetTile(e, o, r);
        if (n > 0 && (n--, (n &= ~(TILE_FLIP_X | TILE_FLIP_Y)) < currentTileset.data.length)) {
            let o = GetTilesetInfo(n);
            if (e.vy < 0) {
                if (o & TF_CEILING)
                    return e.tileCollStatus |= TF_CEILING, e.y = 256 * (SnapY(r) + t.tileH - e.collY), !0
            } else if (o & TF_FLOOR) {
                let t = 256 * (SnapY(r) - (e.collY + e.collH));
                if (e.lastY <= t)
                    return e.tileCollStatus |= TF_FLOOR, e.y = t, !0
            }
        }
        o += t.tileW
    }
}
function GetForceFieldPos(e, t) {
    let o = {},
        r = e.dm3,
        l = (31 & mapTimer) / 32 * Math.PI * 2 - .4 * t;
    return o.x = (e.x >> 8) + e.collX + e.collW / 2 + Math.cos(l) * r, o.y = (e.y >> 8) + e.collY + e.collH / 2 + Math.sin(l) * r, o
}
function ResetActor(e) {
    if (e.collType == CT_PLAYER) {
        if (bGameOver)
            return void (e.bDeleteMe = !0);
        e.invincibleTimer = 100,
        e.x = e.lastX = e.startX,
        e.y = e.lastY = e.startY,
        InitFloor(e)
    }
    e.returnPos = void 0,
    e.gosubC = 0,
    e.waitC = 0,
    e.nNodes && (e.mode = AM_NODE, e.nodeSpeed = 128, e.nodeC = 0),
    e.bShow = !0
}
function HitActor(e, t) {
    if (!e.bOut)
        if (e.reg[REG_ENERGY] > t) {
            if (e.reg[REG_ENERGY] -= t, e.whiteMaskC = 12, e.collType == CT_PLAYER && (e.invincibleTimer = 100), e.script.hit) {
                let t = e.waitC;
                e.returnPos = e.scriptPos,
                e.scriptPos = FindState(e.script.hit - 1, e.script),
                e.waitC = 0,
                Execute(e),
                e.waitC = t
            }
        } else
            e.reg[REG_ENERGY] = 0,
            e.whiteMaskC = 12,
            e.script.out ? (e.bOut = !0, e.returnPos = 0, e.scriptPos = FindState(e.script.out - 1, e.script), e.waitC = 0, Execute(e)) : e.bDeleteMe = !0
}
function HandleCollision(e) {
    if (e.collType == CT_PLAYER) {
        e.bStompColl = !1;
        let t = TestCollision(e, CT_HAZARD);
        for (; t;) {
            let o = !0,
                r = !1;
            t.bStompable && e.vy > 0 && e.lastY / 256 + e.collY + e.collH < t.lastY / 256 + t.collY + 4 && (e.y = 256 * (t.y / 256 + t.collY - (e.collY + e.collH)), e.vy = -e.stompVelocity, o = !1, r = !0, e.bStompColl = !0),
            e.invincibleTimer && (o = !1),
            e.drawMode == DM_FORCEFIELD && (o = !1, r = !0),
            o && HitActor(e, t.reg[REG_IMPACT]),
            r && HitActor(t, e.reg[REG_IMPACT]),
            t = TestCollision(e, CT_HAZARD, !1)
        }
        if (e.drawMode == DM_FORCEFIELD) {
            let t = GetForceFieldPos(e, 0),
                o = TestCollRect(t.x - 4, t.y - 4, 8, 8, CT_HAZARD);
            o && HitActor(o, MAX_IMPACT)
        }
    }
    if (e.collType == CT_BULLET || e.collType == CT_XBULLET) {
        let t = TestCollision(e, CT_HAZARD);
        t || (t = TestCollision(e, CT_TARGET)),
        t && (t.index = e.index, HitActor(e, MAX_IMPACT), HitActor(t, e.reg[REG_IMPACT]))
    }
    if (e.collType == CT_EBULLET || e.collType == CT_XBULLET) {
        let t = TestCollision(e, CT_PLAYER);
        t && (HitActor(e, MAX_IMPACT), t.bOut || t.invincibleTimer || t.drawMode == DM_FORCEFIELD || HitActor(t, e.reg[REG_IMPACT]))
    }
    if (e.collType == CT_PLAYER || e.collType == CT_HAZARD) {
        let t = TestCollision(e, CT_WALL);
        t && t.y - t.lastY >= 1 && HitActor(e, MAX_IMPACT)
    }
}
function FlushStaticRegs() {}
function LoadStaticRegs(e) {}
function SaveStaticRegs(e) {}
const conditionFunc = [function(e) {
    if (TestCollision(e, CT_PLAYER))
        return 1
}, function(e) {
    let t = 0,
        o = GetNearestPlayer(e);
    if (o) {
        let e = o.x - o.lastX,
            r = o.y - o.lastY;
        r < 0 ? t |= 1 : r > 0 && (t |= 2),
        e < 0 ? t |= 4 : e > 0 && (t |= 8)
    }
    return t
}, function(e) {
    let t = 0,
        o = GetNearestPlayer(e);
    return o && ((o.y >> 8) + o.script.sprH / 2 < (e.y >> 8) + e.script.sprH / 2 ? t |= 1 : t |= 2, (o.x >> 8) + o.script.sprW / 2 < (e.x >> 8) + e.script.sprW / 2 ? t |= 4 : t |= 8), t
}, function(e) {
    return TestPlayerInBox(e)
}, function(e) {
    return TestOnscreen(e)
}, function(e) {
    let t = 0,
        o = e.x - e.lastX,
        r = e.y - e.lastY;
    return r < 0 ? t |= 1 : r > 0 && (t |= 2), o < 0 ? t |= 4 : o > 0 && (t |= 8), t
}, function(e) {
    return e.tileCollStatus
}, function(e) {
    if (e.tileCollStatus & TF_FLOOR)
        return e.lastTileCollStatus & TF_FLOOR ? 2 : 1
}, function(e) {
    if (e.tileCollStatus & TF_CEILING)
        return 1
}, function(e) {
    if (e.tileCollStatus & TF_LEFT_WALL)
        return 1
}, function(e) {
    if (e.tileCollStatus & TF_RIGHT_WALL)
        return 1
}, function(e) {
    if (e.bTrigger)
        return 1
}, function(e) {
    if (e.iParent >= 0)
        return 1
}, function(e) {
    if (e.passenger && !e.passenger.bOut)
        return 1
}, function(e) {
    return e.nNodes
}, function(e) {
    if (e.obj && e.obj.iItem >= 0)
        return e.obj.iItem + 1
}, function(e) {
    return e.index
}, function(e) {
    return e.bFlipX
}, function(e) {
    return e.bFlipY
}, function(e) {
    return TestJoy(JOY_LEFT, e.index)
}, function(e) {
    return TestJoy(JOY_RIGHT, e.index)
}, function(e) {
    return TestJoy(JOY_UP, e.index)
}, function(e) {
    return TestJoy(JOY_DOWN, e.index)
}, function(e) {
    return TestJoy(JOY_JUMP, e.index)
}, function(e) {
    return !bubble.bOpen && TestJoy(JOY_ACTION, e.index)
}, function(e) {
    return !bubble.bOpen && TestJoy(JOY_EXTRA, e.index)
}, function(e) {
    if (1 == TestJoy(JOY_BUTTONA | JOY_BUTTONB | JOY_BUTTONC | JOY_CONTINUE))
        return bWaitForJoyUp = !0, 1
}, function(e) {
    if (iMenu >= 0) {
        if (1 == TestJoy(JOY_BUTTONA))
            return 1;
        if (1 == TestJoy(JOY_BUTTONB))
            return 1
    }
    if (1 == TestJoy(JOY_INVENTORY))
        return 1
}, function(e) {
    if (e.vy > 0)
        return 1
}, function(e) {
    if (iMenu >= 0)
        return 1
}, function(e) {
    return GetCurrentRoom()
}, function(e) {
    return nPlayers
}, function(e) {
    return bGameOver
}, function(e) {
    return bTrainer
}, function(e) {
    return 255 & mapTimer
}, function(e) {
    return e.invincibleTimer
}, function(e) {
    return e.bStompColl
}, function(e) {
    if ((e.x >> 8) + e.collX + e.collW / 2 >= roomX + roomW)
        return 1
}];
function GetRegValue(e, t, o) {
    let r;
    switch (t) {
    case 0:
        r = o;
        break;
    case 1:
        r = e.reg[o];
        break;
    case 2:
        r = globalReg[o];
        break;
    case 3:
        r = conditionFunc[o](e)
    }
    return null == r && (r = 0), r
}
function TestCondition(e, t) {
    let o = GetRegValue(e, 3 & t[0], t[1]),
        r = GetRegValue(e, t[0] >> 6, t[2]);
    switch (t[0] >> 2 & 15) {
    case 0:
        if (o == r)
            return !0;
        break;
    case 1:
        if (o != r)
            return !0;
        break;
    case 2:
        if (o > r)
            return !0;
        break;
    case 3:
        if (o < r)
            return !0;
        break;
    case 4:
        if (o >= r)
            return !0;
        break;
    case 5:
        if (o <= r)
            return !0;
        break;
    case 6:
        if (o & r)
            return !0;
        break;
    case 7:
        if (o | r)
            return !0
    }
}
function FindState(e, t) {
    let o = -1,
        r = 0;
    for (;;) {
        if (e == o)
            return r;
        if (r >= t.data.length)
            return;
        let l = t.data[r];
        l == CMD_STATE && o++,
        r += cmdSize[l]
    }
}
function GotoState(e, t) {
    let o = FindState(t, e.script);
    o >= 0 && (e.scriptPos = o, e.bNextLine = !1)
}
function GotoNextBlock(e, t) {
    e.bNextLine = !1;
    let o = e.script,
        r = !1,
        l = 0,
        a = [];
    for (; e.scriptPos < o.data.length && !r;) {
        let n = o.data[e.scriptPos],
            i = cmdSize[n];
        if (n != CMD_IF && n != CMD_IF_NOT || l++, n == CMD_END_IF && (0 == l ? r = !0 : l--), t) {
            if (n == CMD_ELSE && 0 == l && (r = !0), n == CMD_ELSE_IF && 0 == l) {
                for (let t = 0; t < i - 1; t++)
                    a[t] = o.data[e.scriptPos + 1 + t];
                TestCondition(e, a) && (r = !0)
            }
            if (n == CMD_ELSE_IF_NOT && 0 == l) {
                for (let t = 0; t < i - 1; t++)
                    a[t] = o.data[e.scriptPos + 1 + t];
                TestCondition(e, a) || (r = !0)
            }
        }
        e.scriptPos += i
    }
}
const command = [function() {}, function(e) {
    e.bEnd = !0,
    e.bBreak = !0
}, function(e, t) {
    e.iFirstFrame = e.s = 256 * t[0] + t[1],
    e.animSpeed = 0
}, function(e, t) {
    let o = 256 * t[0] + t[1];
    0 != e.animSpeed && e.iFirstFrame == o && e.animMode == t[4] || (e.iFirstFrame = o, e.nAnimFrames = t[2], e.animSpeed = t[3], e.animMode = t[4], e.animC = 0)
}, function(e, t) {
    e.iFirstFrame = 256 * t[0] + t[1],
    e.nAnimFrames = t[2],
    e.animSpeed = t[3],
    e.animMode = t[4],
    e.animC = 0
}, function(e) {
    e.animSpeed = 0
}, function(e, t) {
    e.shapeOffset = t[0]
}, function(e, t) {
    SetPriority(e, t[0])
}, function(e, t) {
    e.waitC = GetRegValue(e, t[0], t[1])
}, function(e, t) {
    TestCondition(e, t) || (e.bBreak = !0)
}, function(e, t) {
    TestCondition(e, t) && (e.bBreak = !0)
}, function(e) {
    e.bShow = !0
}, function(e) {
    e.bShow = !1
}, function(e) {
    e.doPos = e.scriptPos + 1,
    e.nDoWaits = 0,
    e.nDoRepeats = 0
}, function(e, t) {
    0 == t[0] ? (0 == e.nDoWaits && (e.bBreak = !0), e.scriptPos = e.doPos, e.bNextLine = !1) : (e.nDoRepeats++, e.nDoRepeats != t[0] && (e.scriptPos = e.doPos, e.bNextLine = !1))
}, function(e) {
    e.bBreak = !0,
    e.bDeleteMe = !0
}, function(e, t) {
    GotoState(e, t[0])
}, function(e, t) {
    let o = e.script.data[e.scriptPos];
    null == e.gosubPos && (e.gosubPos = []),
    e.gosubPos[e.gosubC++] = e.scriptPos + cmdSize[o],
    GotoState(e, t[0])
}, function(e) {
    e.returnPos >= 0 ? (e.scriptPos = e.returnPos, e.bNextLine = !1, e.returnPos = void 0, e.bOut ? (ResetActor(e), e.bOut = !1) : e.bBreak = !0) : e.gosubC > 0 && (e.gosubC--, e.scriptPos = e.gosubPos[e.gosubC], e.bNextLine = !1)
}, function(e, t) {
    if (TestCondition(e, t)) {
        let t = e.script.data[e.scriptPos];
        e.scriptPos += cmdSize[t],
        GotoNextBlock(e, !0)
    }
}, function(e, t) {
    if (!TestCondition(e, t)) {
        let t = e.script.data[e.scriptPos];
        e.scriptPos += cmdSize[t],
        GotoNextBlock(e, !0)
    }
}, function(e) {
    GotoNextBlock(e, !1)
}, function(e) {
    GotoNextBlock(e, !1)
}, function(e) {
    GotoNextBlock(e, !1)
}, function() {}, function(e, t) {
    let o = GetRegValue(e, 3 & t[0], t[2]),
        r = t[1];
    4 & t[0] ? globalReg[r] = o : e.reg[r] = o
}, function(e, t) {
    let o = GetRegValue(e, 3 & t[0], t[2]),
        r = t[1];
    4 & t[0] ? globalReg[r] += o : e.reg[r] += o
}, function(e, t) {
    let o = GetRegValue(e, 3 & t[0], t[2]),
        r = t[1];
    4 & t[0] ? globalReg[r] -= o : e.reg[r] -= o
}, function(e, t) {
    let o = GetRegValue(e, 3 & t[0], t[2]),
        r = t[1];
    4 & t[0] ? globalReg[r] &= o : e.reg[r] &= o
}, function(e, t) {
    let o = GetRegValue(e, 3 & t[0], t[2]),
        r = t[1];
    4 & t[0] ? globalReg[r] |= o : e.reg[r] |= o
}, function(e, t) {
    let o = e.index;
    if (1 == t[2]) {
        let t = GetNearestPlayer(e);
        t && (o = t.index)
    }
    score[o] += GetRegValue(e, t[0], t[1])
}, function(e, t) {
    nPlayers = t[0]
}, function(e, t) {
    e.portraitShape = 256 * t[0] + t[1]
}, function(e, t) {
    e.bubblePos = GetS8(t[0])
}, function(e) {
    let t = TestPlayerInBox(e);
    t && t.tileCollStatus & TF_FLOOR ? bDialogRestart ? e.bBreak = !0 : dialogActor = e : (bDialogRestart = !1, e.bBreak = !0)
}, function(e, t) {
    let o,
        r = 0;
    if (t[0] || t[1]) {
        let l = 256 * t[0] + t[1];
        for (o = "", "-" == strBuffer[l] && (l++, e = player[0]), r = l; "|" != strBuffer[l];)
            o += strBuffer[l++]
    } else
        o = e.obj.text;
    if (0 == e.cmdTimer) {
        let t = RenderText(e, o, 0),
            r = 14 + (e.x >> 8),
            l = e.y >> 8;
        e.bubblePos && (l += e.bubblePos),
        bubble.nDisplayChars = 0,
        Say(t, r, l, !0),
        e.portraitShape ? portraitShape = e.portraitShape : portraitShape = void 0
    }
    e == dialogActor && (e.cmdTimer < 4 && (e.bBreak = !0), 1 == TestJoy(JOY_BUTTONA | JOY_BUTTONB) ? bWaitForJoyUp = !0 : e.bBreak = !0)
}, function(e) {
    CloseBubble()
}, function(e, t) {
    let o = GetParent(e);
    o && (2 == t[0] ? o.bTrigger = !o.bTrigger : o.bTrigger = t[0])
}, function(e, t) {
    if (e.iParent >= 0) {
        let o = GetNearestPlayer(e),
            r = currentMap.obj[e.iParent];
        t[2] ? (o.x = o.lastX = 256 * (r.x + GetS8(t[0])), o.y = o.lastY = 256 * (r.y + GetS8(t[1]))) : (teleportActor = o, teleportX = r.x + GetS8(t[0]), teleportY = r.y + GetS8(t[1]), fadeOpacity = 1)
    }
}, function(e, t) {
    let o = t[0];
    if (o > 0) {
        o--;
        let r = GetS8(t[1]),
            l = GetS8(t[2]),
            a = GetRegValue(e, t[3], t[4]),
            n = NewActor((e.x >> 8) + r, (e.y >> 8) + l, o, -1, a, !1);
        n && (1 == t[5] && (n.vx = n.goalVX = e.vx, n.vy = n.goalVX = e.vy), n.spawner = e, n.index = e.index, UpdateActor(n))
    }
}, function(e, t) {
    let o = t[0];
    if (o > 0) {
        o--;
        let r = t[1],
            l = t[2];
        for (let a = 0; a < r; a++) {
            let n = 2 * Math.PI * a / r + 2 * Math.PI * t[5] / 256,
                i = 256 * Math.cos(n) * l,
                c = 256 * Math.sin(n) * l,
                s = NewActor((e.x >> 8) + GetS8(t[3]) + i * t[6] / 256, (e.y >> 8) + GetS8(t[4]) + c * t[6] / 256, o, -1, 0, !1);
            s && (s.vx = s.goalVX = i, s.vy = s.goalVY = c, UpdateActor(s))
        }
    }
}, function(e, t) {
    let o = t[0];
    if (o > 0) {
        o--;
        let r = t[1],
            l = t[2];
        for (let a = 0; a < r; a++) {
            let r = NewActor((e.x >> 8) + GetS8(t[3]) + RndInt(-4, 4), (e.y >> 8) + GetS8(t[4]) + RndInt(-2, 0), o, -1, 0, !1);
            r && (r.vy = RndInt(-512, 256 * -l), r.goalVY = 1024, r.deltaVY = 64, UpdateActor(r))
        }
    }
}, function(e, t) {
    (e = GetTarget(e, t[4])).mode = 0,
    e.goalVX = GetS16(256 * t[0] + t[1]),
    e.deltaVX = GetS16(256 * t[2] + t[3]),
    0 == e.deltaVX && (e.vx = e.goalVX)
}, function(e, t) {
    (e = GetTarget(e, t[4])).mode = 0,
    e.goalVY = GetS16(256 * t[0] + t[1]),
    e.deltaVY = GetS16(256 * t[2] + t[3]),
    0 == e.deltaVY && (e.vy = e.goalVY, e.vy < 0 && (e.tileCollStatus &= ~TF_FLOOR))
}, function(e, t) {
    let o = GetRegValue(e, t[0], t[1]),
        r = GetRegValue(e, t[2], t[3]),
        l = 256 * t[4] + t[5];
    0 == l && (l = 256);
    let a = Math.floor(256 * Math.cos(2 * Math.PI * o / 256) + .5),
        n = Math.floor(256 * Math.sin(2 * Math.PI * o / 256) + .5);
    e.mode = 0,
    e.goalVX = e.deltaVX = e.vx = Math.floor(a * l / 256 * r),
    e.goalVY = e.deltaVY = e.vy = Math.floor(n * l / 256 * r)
}, function(e, t) {
    (e = GetTarget(e, t[2])).vx += GetS16(256 * t[0] + t[1])
}, function(e, t) {
    (e = GetTarget(e, t[2])).vy += GetS16(256 * t[0] + t[1])
}, function(e, t) {
    let o = GetS16(256 * t[0] + t[1]),
        r = t[2];
    0 == r && e.vx == o && GotoState(e, t[3]),
    1 == r && e.vx > o && GotoState(e, t[3]),
    2 == r && e.vx < o && GotoState(e, t[3])
}, function(e, t) {
    let o = GetS16(256 * t[0] + t[1]),
        r = t[2];
    0 == r && e.vy == o && GotoState(e, t[3]),
    1 == r && e.vy > o && GotoState(e, t[3]),
    2 == r && e.vy < o && GotoState(e, t[3])
}, function(e, t) {
    e.vx = e.goalVX = -e.vx
}, function(e, t) {
    e.vy = e.goalVY = -e.vy
}, function(e, t) {
    let o = GetS16(256 * t[0] + t[1]);
    e.vx = e.goalVX = Math.trunc(e.vx * o / 256)
}, function(e, t) {
    let o = GetS16(256 * t[0] + t[1]);
    e.vy = e.goalVY = Math.trunc(e.vy * o / 256)
}, function(e, t) {
    let o = GetS16(256 * t[0] + t[1]),
        r = GetS16(256 * t[2] + t[3]);
    e.vx < o ? e.vx = e.goalVX = o : e.vx > r && (e.vx = e.goalVX = r)
}, function(e, t) {
    let o = GetS16(256 * t[0] + t[1]),
        r = GetS16(256 * t[2] + t[3]);
    e.vy < o ? e.vy = e.goalVY = o : e.vy > r && (e.vy = e.goalVY = r)
}, function(e, t) {
    let o = GetNearestPlayer(e);
    if (o) {
        let r = GetAngle(e.x / 256 + e.script.sprW / 2, e.y / 256 + e.script.sprH / 2, o.x / 256 + o.script.sprW / 2, o.y / 256 + o.script.sprH / 2);
        e.mode = 0,
        e.goalVX = e.vx = Math.floor(Math.sin(r) * t[0] * 256),
        e.goalVY = e.vy = Math.floor(Math.cos(r) * t[0] * 256)
    } else
        e.goalVX = e.vx = 0,
        e.goalVY = e.vy = 256 * -t[0];
    e.deltaVX = e.deltaVY = 0
}, function(e, t) {
    e.stompVelocity = GetS16(256 * t[0] + t[1])
}, function(e, t) {
    e.bStompable = t[0]
}, function(e, t) {
    e.borderModeLR = t[0],
    e.borderModeU = t[1],
    e.borderModeD = t[2]
}, function(e, t) {
    respawnMode = t[0]
}, function(e, t) {
    e.bGlobal = t[0]
}, function(e, t) {
    e.bFlipX = t[0]
}, function(e, t) {
    e.bFlipY = t[0]
}, function(e, t) {
    e.blend = GetRegValue(e, t[0], t[1]) / 255
}, function(e, t) {
    (e = GetTarget(e, t[1])).reg[3] |= t[0]
}, function(e, t) {
    let o = GetTarget(e, t[0]);
    e.reg[REG_VALUE] = o.reg[3]
}, function(e, t) {
    e.x += 256 * GetS8(t[0])
}, function(e, t) {
    e.y += 256 * GetS8(t[0])
}, function(e, t) {
    let o = GetS8(t[0]),
        r = GetS8(t[1]);
    e.x = 256 * (SnapX((e.x >> 8) + o) + r)
}, function(e, t) {
    let o = GetS8(t[0]),
        r = GetS8(t[1]);
    e.y = 256 * (SnapY((e.y >> 8) + o) + r)
}, function(e, t) {
    if (e.collX = GetS8(t[0]), e.collY = GetS8(t[1]), e.collW = t[2], e.collH = t[3], e.collType = t[4], e.collType == CT_PLAYER) {
        for (let t = 0; t < nStartedPlayers; t++)
            if (player[t] == e)
                return;
        nStartedPlayers < nPlayers ? (e.bGlobal = !0, e.index = nStartedPlayers, player[nStartedPlayers] = e, nStartedPlayers++) : (e.collType = 0, e.bDeleteMe = !0, e.bShow = !1),
        InitFloor(e)
    }
}, function(e, t) {
    e.collType = t[0]
}, function(e, t) {
    TestCollRect((e.x >> 8) + GetS8(t[0]), (e.y >> 8) + GetS8(t[1]), t[2], t[3], t[4]) && GotoState(e, t[5])
}, function(e, t) {
    let o = (e.x >> 8) + GetS8(t[0]),
        r = (e.y >> 8) + GetS8(t[1]);
    if (0 == t[5]) {
        let e = TestCollRect(o, r, t[2], t[3], CT_HAZARD);
        e ? HitActor(e, t[4]) : (e = TestCollRect(o, r, t[2], t[3], CT_TARGET)) && HitActor(e, t[4])
    } else {
        let e = TestCollRect(o, r, t[2], t[3], CT_PLAYER);
        e && HitActor(e, t[4])
    }
}, function(e, t) {
    e.tileCollMode = t[0]
}, function(e, t) {
    GetTileInfo(e, (e.x >> 8) + GetS8(t[0]), (e.y >> 8) + GetS8(t[1])) & (TF_LEFT_WALL | TF_RIGHT_WALL) && GotoState(e, t[2])
}, function(e, t) {
    e.reg[REG_VALUE] = RndInt(0, t[0] - 1)
}, function(e, t) {
    let o = 0;
    if (0 == t[0] || 1 == t[0]) {
        let r = roomY,
            l = mainLayer,
            a = Math.floor(roomW / l.tileW),
            n = Math.floor(roomH / l.tileH);
        for (let i = 0; i < n; i++) {
            let n = roomX;
            for (let i = 0; i < a; i++)
                0 == t[0] && t[1] == GetTile(e, n, r) ? o++ : 1 == t[0] && t[1] == GetTileType(e, n, r) && o++,
                n += l.tileW;
            r += l.tileH
        }
    }
    e.reg[REG_VALUE] = o
}, function(e, t) {
    let o = GetTile(e, (e.x >> 8) + GetS8(t[0]), (e.y >> 8) + GetS8(t[1]));
    o > 255 && (o = 255),
    e.reg[REG_VALUE] = o
}, function(e, t) {
    e.reg[REG_VALUE] = GetTileType(e, (e.x >> 8) + GetS8(t[0]), (e.y >> 8) + GetS8(t[1]))
}, function(e, t) {
    e.reg[REG_VALUE] = 240 & GetTileInfo(e, (e.x >> 8) + GetS8(t[0]), (e.y >> 8) + GetS8(t[1]))
}, function(e, t) {
    e.reg[REG_VALUE] == t[0] && GotoState(e, t[1])
}, function(e, t) {
    let o = {};
    if (o.x = (e.x >> 8) + GetS8(t[0]), o.y = (e.y >> 8) + GetS8(t[1]), !HandleTilePos(e, o))
        return;
    SetTile(o.x, o.y, GetRegValue(e, t[2], t[3]));
    let r = t[4];
    if (r > 0) {
        r--;
        let l = GetRegValue(e, t[5], t[6]);
        NewActor(SnapX(o.x), SnapY(o.y), r, -1, l)
    }
}, function(e, t) {
    let o = (e.x >> 8) + GetS8(t[0]),
        r = (e.y >> 8) + GetS8(t[1]),
        l = GetTileType(e, o, r);
    if (0 != l) {
        for (; GetTileType(e, o, r - mainLayer.tileH) == l;)
            r -= mainLayer.tileH;
        for (; GetTileType(e, o, r) == l;) {
            SetTile(o, r, 0);
            let e = t[2];
            e > 0 && (e--, NewActor(SnapX(o), SnapY(r), e)),
            r += mainLayer.tileH
        }
    }
}, function(e, t) {
    let o = (e.x >> 8) + GetS8(t[0]),
        r = (e.y >> 8) + GetS8(t[1]),
        l = GetTileType(e, o, r);
    if (0 != l) {
        for (; GetTileType(e, o - mainLayer.tileW, r) == l;)
            o -= mainLayer.tileW;
        for (; GetTileType(e, o, r) == l;) {
            SetTile(o, r, 0);
            let e = t[2];
            e > 0 && (e--, NewActor(SnapX(o), SnapY(r), e)),
            o += mainLayer.tileW
        }
    }
}, function(e, t) {
    e.bAutoFlip = t[0]
}, function(e, t) {
    e.mode = AM_NODE,
    e.nodeSpeed = 256 * t[0] + t[1] & 32767
}, function(e, t) {
    e.nodeMode = NODEMODE_GOTO,
    GotoNode(e, t[0])
}, function(e, t) {
    e.drawMode = t[0],
    e.dmShape = 256 * t[1] + t[2],
    e.dm2 = t[3],
    e.dm3 = t[4]
}, function(e, t) {
    e.drawOffsetX = GetS8(t[0]),
    e.drawOffsetY = GetS8(t[1])
}, function(e, t) {
    t[0] ? HitActor(e, 255) : (ResetActor(e), e.scriptPos = 0),
    e.bNextLine = !1,
    e.bBreak = !0
}, function(e) {
    e.x = e.lastX = e.startX,
    e.y = e.lastY = e.startY
}, function(e, t) {
    e.mode = AM_PATROL,
    e.bFlipX ? e.vx = 256 * t[0] + t[1] : e.vx = -(256 * t[0] + t[1]),
    e.m1 = t[2]
}, function(e, t) {
    e.mode = AM_DRIFT,
    e.vx = GetS16(256 * t[0] + t[1]),
    e.vy = GetS16(256 * t[2] + t[3]),
    e.m1 = t[4]
}, function(e, t) {
    e.mode = AM_SPIN,
    e.m1 = t[0],
    e.m2 = t[1],
    e.m3 = t[2],
    e.c1 = t[3]
}, function(e, t) {
    e.mode = AM_BUTTERFLY,
    e.m1 = t[0],
    e.m2 = t[1],
    e.m3 = t[2],
    e.m4 = t[3],
    e.m3 < e.m4 ? e.c1 = e.c2 = RndInt(0, e.m3 - 1) : e.c1 = e.c2 = RndInt(0, e.m4 - 1)
}, function(e, t) {
    e.mode = AM_CHASE_PLAYER,
    e.m1 = t[0],
    e.m2 = t[1],
    e.m3 = t[2]
}, function(e, t) {
    e.mode = AM_MAZE_MOVE,
    e.m1 = t[0],
    e.m2 = t[1],
    e.m3 = t[2],
    e.c1 = RndInt(0, 3)
}, function(e) {
    e.mode = AM_FLOOR_BUMP,
    e.vy = 384
}, function(e, t) {
    e.nDrawEntries || (e.draw = [], e.nDrawEntries = 0),
    e.draw[e.nDrawEntries] = {},
    e.draw[e.nDrawEntries].shape = 256 * t[0] + t[1] + GetRegValue(e, t[4], t[5]),
    e.draw[e.nDrawEntries].x = GetS8(t[2]),
    e.draw[e.nDrawEntries].y = GetS8(t[3]),
    e.nDrawEntries++
}, function(e) {
    let t = GetRegValue(e, p[0], p[1]);
    t >= 0 ? (e.iFirstFrame = e.s = item[t].shape, e.animSpeed = 0) : e.obj && e.obj.iItem >= 0 && (e.iFirstFrame = e.s = item[e.obj.iItem].shape, e.animSpeed = 0)
}, function(e, t) {
    e.obj.iItem == t[0] - 1 && GotoState(e, t[1])
}, function(e) {
    let t = GetRegValue(e, p[0], p[1]);
    t >= 0 ? AddToInv(t) : e.obj && e.obj.iItem >= 0 && AddToInv(e.obj.iItem)
}, function(e, t) {
    TestInv(t[0] - 1) && GotoState(e, t[1])
}, function(e, t) {
    TestInv(t[0] - 1) || GotoState(e, t[1])
}, function(e, t) {
    AddToInv(t[0] - 1)
}, function(e, t) {
    DropInv(t[0] - 1)
}, function(e, t) {
    iMenu = t[0] - 1
}, function(e) {
    iMenu = -1
}, function(e) {
    scr.buffer = [],
    scr.color = []
}, function(e, t) {
    let o = t[0],
        r = o,
        l = t[1],
        a = o + t[2],
        n = l + t[3],
        i = t[4];
    for (; l < n && l < scr.nLines; l++)
        for (o = r; o < a && o < scr.nColumns; o++)
            scr.buffer[o + l * scr.nColumns] = i
}, function(e, t) {
    scr.cursorX = t[0],
    scr.cursorY = t[1]
}, function(e, t) {
    let o = 256 * t[0] + t[1],
        r = t[2],
        l = scr.cursorY;
    if (l < scr.nLines) {
        let t = RenderText(e, strBuffer, o),
            a = scr.cursorX;
        0 == r && (scr.cursorX += t.length),
        1 == r && (scr.cursorX -= Math.floor(t.length / 2), a -= Math.floor(t.length / 2)),
        2 == r && (scr.cursorX -= t.length, a -= t.length);
        let n = 0;
        for (; n < t.length && a < scr.nColumns;) {
            if (a < 0)
                n++;
            else {
                let e = a + l * scr.nColumns;
                scr.buffer[e] = t[n],
                scr.color[e] = renderCol[n++]
            }
            a++
        }
    }
}, function(e, t) {
    inv.bShow = !0,
    inv.x = scr.cursorX,
    inv.y = scr.cursorY,
    inv.nColumns = t[0],
    inv.nLines = t[1],
    inv.spacingX = t[2],
    inv.spacingY = t[3]
}, function(e, t) {
    inv.shape = 256 * t[0] + t[1],
    inv.offsetX = t[2],
    inv.offsetY = t[3]
}, function(e, t) {
    let o = t[0];
    o > 0 && (iLastSound = PlaySound(o - 1, !t[1]))
}, function(e, t) {
    e.reg[REG_VALUE] = iLastSound
}, function(e, t) {
    ReleaseSound(GetRegValue(e, t[0], t[1]))
}, function(e, t) {
    let o = t[0];
    o > 0 && PlayMusic(o - 1)
}, function(e) {
    StopMusic()
}, function(e, t) {
    iRoomRequest = GetRegValue(e, t[0], t[1])
}, function(e) {
    NextRoom()
}, function(e) {
    bGameOver = !0
}, function(e) {
    ResetGame()
}, function(e, t) {
    let o = 256 * t[0] + t[1],
        r = RenderText(e, strBuffer, o);
    currentMessage = "";
    for (let e = 0; e < r.length; e++)
        currentMessage += String.fromCharCode(r[e]);
    messageTimer = 240,
    messageOffsetY = 0
}, function(e, t) {}, function(e, t) {
    let o = GetRegValue(e, t[0], t[1]);
    posHistoryX[o] = e.x,
    posHistoryY[o] = e.y
}, function(e, t) {
    let o = GetRegValue(e, t[0], t[1]);
    e.x = posHistoryX[o] + 256 * GetS8(t[2]),
    e.y = posHistoryY[o] + 256 * GetS8(t[3])
}, function(e, t) {
    lookAheadX = GetS8(t[0]),
    lookAheadY = GetS8(t[1])
}, function(e, t) {
    e.sortBias = t[0] << 8
}, function(e, t) {
    2 == t[0] ? raceTimer += 60 * t[1] : bUpdateRaceTimer = t[0]
}, function(e, t) {
    e.index = 3 & t[0]
}];
function InitScripts() {
    for (let e = 0; script[e]; e++) {
        let t = script[e];
        t.data = [];
        let o,
            r = 0;
        for (let e = 0; t.code[e]; e++) {
            let l;
            l = t.code[e] <= "9" ? t.code[e] - "0" : t.code.charCodeAt(e) - 87,
            1 & e ? t.data[r++] = (o << 4) + l : o = l
        }
    }
}
function Execute(e) {
    e.bBreak = !1,
    e.bEnd = !1;
    let t = e.script,
        o = [],
        r = 0;
    for (; e.scriptPos < t.data.length && !e.bBreak && 0 == e.waitC;) {
        e.bNextLine = !0;
        let l = t.data[e.scriptPos],
            a = e.scriptPos,
            n = cmdSize[l];
        for (let r = 0; r < n - 1; r++)
            o[r] = t.data[e.scriptPos + 1 + r];
        if (command[l](e, o), r++, e.bNextLine && !e.bBreak && (e.scriptPos += n), a == e.scriptPos ? e.cmdTimer++ : e.cmdTimer = 0, r >= 256)
            break;
        if (e.bBreak)
            break
    }
    (e.bEnd || e.scriptPos >= t.data.length) && (!e.bShow || e.bAnimDone || null == e.s && null == e.nAnimFrames) && dialogActor != e && (e.bDeleteMe = !0)
}
function FlushActors() {
    actor = [],
    iFirstFreeActor = 0,
    iFirstActor = void 0,
    iLastActor = void 0;
    for (let e = 0; e < currentMap.obj.length; e++)
        currentMap.obj[e].bSpawned = !1
}
function LinkActor(e) {
    let t = actor[e];
    if (iFirstActor >= 0) {
        let o = !1,
            r = iFirstActor;
        for (; r >= 0;) {
            let l = actor[r];
            t.priority < l.priority || sortPriority == t.priority && sortPriority == l.priority && t.y + t.sortBias <= l.y + l.sortBias ? (l.iPrev >= 0 ? actor[l.iPrev].iNext = e : iFirstActor = e, t.iPrev = l.iPrev, t.iNext = r, l.iPrev = e, o = !0, r = -1) : r = actor[r].iNext
        }
        o || (actor[iLastActor].iNext = e, t.iPrev = iLastActor, iLastActor = e)
    } else
        iFirstActor = e,
        iLastActor = e
}
function UnlinkActor(e) {
    let t = actor[e];
    t.iPrev >= 0 ? actor[t.iPrev].iNext = t.iNext : iFirstActor = t.iNext,
    t.iNext >= 0 ? actor[t.iNext].iPrev = t.iPrev : iLastActor = t.iPrev,
    t.iPrev = void 0,
    t.iNext = void 0
}
function SetPriority(e, t) {
    if (e.priority == t)
        return;
    let o;
    if (e.iNext >= 0)
        o = actor[e.iNext].iPrev;
    else {
        if (!(e.iPrev >= 0))
            return;
        o = actor[e.iPrev].iNext
    }
    UnlinkActor(o),
    e.priority = t,
    LinkActor(o)
}
function NewActor(e, t, o, r, l=0, a=!0) {
    let n = iFirstFreeActor;
    for (;;) {
        if (null == actor[n] || null == actor[n].iPrev && null == actor[n].iNext) {
            actor[n] = {};
            let i = actor[n];
            return i.script = script[o], i.scriptPos = 0, i.waitC = 0, i.cmdTimer = 0, i.gosubC = 0, i.priority = i.script.prio, i.bShow = !0, i.x = i.startX = i.lastX = 256 * e, i.y = i.startY = i.lastY = 256 * t, i.vx = i.vy = i.goalVX = i.goalVY = i.deltaVX = i.deltaVY = i.drawOffsetX = i.drawOffsetY = 0, i.borderModeU = i.borderModeD = i.borderModeLR = 0, i.blend = 1, i.stompVelocity = 896, i.sortBias = 0, i.index = 0, i.reg = new Uint8Array(16), i.reg[REG_ENERGY] = 1, i.reg[REG_IMPACT] = 1, i.reg[REG_VALUE] = l, r >= 0 && (i.iObject = r, i.obj = currentMap.obj[r], i.bFlipX = i.obj.bFlipX, i.bFlipY = i.obj.bFlipY, i.iParent = i.obj.iParent, i.reg[REG_VALUE] = i.obj.value, i.obj.node && (i.mode = AM_NODE, i.nodeMode = NODEMODE_NORMAL, i.nodeSpeed = 128, i.nNodes = i.obj.node.length / 2)), LinkActor(n), iFirstFreeActor = n + 1, LoadStaticRegs(i), a && UpdateActor(i), i
        }
        n++
    }
}
function GetMainActor() {
    if (main) {
        let e = iFirstActor;
        for (; e >= 0;) {
            let t = actor[e];
            if (t.script == script[main])
                return t;
            e = t.iNext
        }
    }
}
function StartMain() {
    if (null != main) {
        NewActor(0, 0, main).bGlobal = !0
    }
}
function StartActors() {
    let e = currentMap,
        t = cameraX,
        o = cameraX + resX,
        r = cameraY,
        l = cameraY + resY - hudH,
        a = roomX,
        n = roomX + roomW,
        i = roomY,
        c = roomY + roomH;
    for (let s = 0; e.obj[s]; s++) {
        let u = e.obj[s];
        if (!u.bSpawned) {
            let e = script[u.i];
            (e.bNoFreeze && u.x + e.sprW > a && u.x < n && u.y + e.sprH > i && u.y < c || u.x + e.sprW > t && u.x < o && u.y + e.sprH > r && u.y < l) && (NewActor(u.x, u.y, u.i, s), u.bSpawned = !0)
        }
    }
}
function UpdateActor(e) {
    let t = e.floor;
    if (e.floor = void 0, e.invincibleTimer && e.invincibleTimer--, e.whiteMaskC && e.whiteMaskC--, 0 != e.waitC || e.bDeleteMe || Execute(e), e.lastX = e.x, e.lastY = e.y, e.lastTileCollStatus = e.tileCollStatus, e.waitC && (e.nDoWaits++, e.waitC--), e.mode > 0 ? e.mode == AM_NODE && e.obj && e.nNodes > 0 ? UpdateNodes(e) : e.mode == AM_PATROL ? Patrol(e) : e.mode == AM_DRIFT ? Drift(e) : e.mode == AM_SPIN ? Spin(e) : e.mode == AM_BUTTERFLY ? Butterfly(e) : e.mode == AM_CHASE_PLAYER ? ChasePlayer(e) : e.mode == AM_MAZE_MOVE ? MazeMove(e) : e.mode == AM_FLOOR_BUMP && FloorBump(e) : (e.vx != e.goalVX && (e.vx > e.goalVX ? (e.vx -= e.deltaVX, e.vx < e.goalVX && (e.vx = e.goalVX)) : (e.vx += e.deltaVX, e.vx > e.goalVX && (e.vx = e.goalVX))), e.vy != e.goalVY && (e.vy > e.goalVY ? (e.vy -= e.deltaVY, e.vy < e.goalVY && (e.vy = e.goalVY)) : (e.vy += e.deltaVY, e.vy > e.goalVY && (e.vy = e.goalVY))), e.x += e.vx, t && (e.x += (-256 & t.x) - (-256 & t.lastX)), e.tileCollMode && UpdateWallCollX(e) && (e.tileCollMode == TM_OUT ? HitActor(e, MAX_IMPACT) : e.tileCollMode == TM_BOUNCE ? (e.vx = e.goalVX = -e.vx / 2, e.vx > -64 && e.vx < 64 && (e.vx = e.goalVX = 0)) : e.tileCollMode == TM_CUSTOM || (e.vx = e.goalVX = 0)), e.y += e.vy, t && (e.y += (-256 & t.y) - (-256 & t.lastY)), e.tileCollMode && UpdateWallCollY(e) && (e.tileCollMode == TM_OUT ? HitActor(e, MAX_IMPACT) : e.tileCollMode == TM_BOUNCE ? (e.vx = e.goalVX = e.vx / 2, e.vy = -e.vy / 2, e.vy > -256 && e.vy < 256 && (e.vy = 0)) : e.tileCollMode == TM_CUSTOM || (e.vy = 0))), !e.bOut && e.collType == CT_PLAYER) {
        if (respawnMode == RM_PLATFORM && e.tileCollStatus & TF_FLOOR && !e.whiteMaskC && !e.invincibleTimer) {
            let t = Math.floor(((e.x >> 8) + e.collX + e.collW / 2) / mainLayer.tileW) * mainLayer.tileW;
            GetTileInfo(e, t, (e.y >> 8) + e.collY + e.collH + 8) & TF_FLOOR && 0 == GetTileType(e, t, (e.y >> 8) + e.collY + e.collH - 4) && (e.startX = 256 * t - (e.collX + e.collW / 2), e.startY = e.y)
        }
        respawnMode == RM_CURRENT && (e.startX = e.x, e.startY = e.y)
    }
    if (e.bAutoFlip && (e.x - e.lastX > 0 && (e.bFlipX = !0), e.x - e.lastX < 0 && (e.bFlipX = !1)), HandleBorders(e), e.bOut || HandleCollision(e), e.animSpeed > 0)
        if (e.animMode == AM_MOVE && 0 == e.vx && 0 == e.vy)
            ;
        else {
            let t = Math.floor(e.animC / e.animSpeed),
                o = t,
                r = e.nAnimFrames;
            e.bAnimDone = !1,
            e.animMode == AM_PING_PONG && r > 2 && (t >= r && (t = r - (t - r) - 2), r += r - 2),
            o >= r && (e.animMode == AM_ONCE ? (t = e.nAnimFrames - 1, e.animC = t * e.animSpeed, e.bAnimDone = !0) : (t = 0, e.animC = 0)),
            e.animMode == AM_REVERSE ? e.s = e.iFirstFrame + r - 1 - t : e.s = e.iFirstFrame + t,
            e.animC++
        }
    e.collType != CT_PLAYER || e.bDeleteMe || SetCamera(e),
    e.lastPassenger = e.passenger,
    e.passenger = void 0
}
function UpdateActors() {
    let e = iFirstActor;
    for (; e >= 0;) {
        let t = actor[e];
        UpdateActor(t),
        t.bGlobal || TestOnscreen(t) || t.goalVY > 0 && t.vy != t.goalVY || t.script.bNoFreeze || (t.obj ? (t.obj.x + t.script.sprW < cameraX || t.obj.x > cameraX + resX || t.obj.y + t.script.sprH < cameraY || t.obj.y > cameraY + resY - hudH) && (t.bDeleteMe = !0, t.obj.bSpawned = !1) : t.bDeleteMe = !0);
        let o = t.iNext;
        if (t.bDeleteMe) {
            SaveStaticRegs(t),
            UnlinkActor(e),
            iFirstFreeActor > e && (iFirstFreeActor = e);
            for (let e = 0; e < MAX_PLAYERS; e++)
                player[e] == t && (player[e] = void 0);
            delete actor[e]
        }
        e = o
    }
}
function SortActors() {
    if (sortPriority < 0)
        return;
    let e = !0;
    for (; e;) {
        let t = iFirstActor;
        for (e = !1; t >= 0;) {
            let e = actor[t];
            if (e.priority == sortPriority)
                break;
            t = e.iNext
        }
        if (t >= 0)
            for (t = actor[t].iNext; t >= 0;) {
                let o = actor[t];
                if (o.priority != sortPriority)
                    break;
                {
                    let r = actor[o.iPrev];
                    if (o.y + o.sortBias < r.y + r.sortBias) {
                        UnlinkActor(t),
                        LinkActor(t),
                        e = !0;
                        break
                    }
                }
                t = o.iNext
            }
    }
}
function DrawActors() {
    let e = iFirstActor;
    for (; e >= 0;) {
        let t = actor[e];
        if (t.bShow)
            if (t.drawMode == DM_VALUE)
                DrawValue(t);
            else if (t.drawMode == DM_THREAD)
                DrawThread(t);
            else {
                if (t.drawMode == DM_METER ? DrawMeter(t) : t.drawMode == DM_ANGLE && DrawAngle(t), (7 & t.invincibleTimer) < 4) {
                    if (t.mode == AM_FLOOR_BUMP && (t.clipD = (t.startY >> 8) + clip[4 * t.s + 3] - 1), DrawActor(t), t.borderModeLR == BORDER_WRAP) {
                        let e = roomW;
                        t.x >> 8 > roomX + roomW / 2 && (e = -e),
                        DrawActor(t, e)
                    }
                    if (t.borderModeU == BORDER_WRAP && t.borderModeD == BORDER_WRAP) {
                        let e = roomW;
                        t.x >> 8 > roomX + roomW / 2 && (e = -e);
                        let o = roomH;
                        t.y >> 8 > roomY + roomH / 2 && (o = -o),
                        DrawActor(t, 0, o),
                        DrawActor(t, e, o)
                    }
                    if (t.clipD = void 0, t.nDrawEntries) {
                        for (let e = 0; e < t.nDrawEntries; e++) {
                            let o = 4 * t.draw[e].shape,
                                r = Math.floor((t.x >> 8) + t.draw[e].x + drawX - cameraX),
                                l = Math.floor((t.y >> 8) + t.draw[e].y + drawY - cameraY),
                                a = clip[o + 2],
                                n = clip[o + 3];
                            drawContext.drawImage(pngCanvas, clip[o + 0], clip[o + 1], a, n, r, l, a, n)
                        }
                        t.nDrawEntries = 0
                    }
                }
                t.drawMode == DM_FORCEFIELD && DrawForceField(t)
            }
        e = t.iNext
    }
}
function GotoNode(e, t) {
    let o,
        r;
    0 == t ? (o = e.obj.x, r = e.obj.y) : (o = e.obj.x + e.obj.node[2 * t - 2 + 0], r = e.obj.y + e.obj.node[2 * t - 2 + 1]),
    e.nNodeFrames = Math.floor(256 * GetDistance(e.x >> 8, e.y >> 8, o, r) / e.nodeSpeed);
    let l = GetAngle(e.x >> 8, e.y >> 8, o, r);
    e.vx = Math.floor(Math.sin(l) * e.nodeSpeed),
    e.vy = Math.floor(Math.cos(l) * e.nodeSpeed)
}
function UpdateNodes(e) {
    0 != e.nodeSpeed && (e.nNodeFrames || (e.x &= -256, e.y &= -256, e.nodeMode == NODEMODE_NORMAL && (null == e.nodeC && (e.nodeC = 0), e.obj.bLoopNodes || e.nNodes < 2 ? (e.nodeC++, e.nodeC > e.nNodes && (e.nodeC = 0), GotoNode(e, e.nodeC)) : (e.nodeC++, e.nodeC >= 2 * e.nNodes && (e.nodeC = 0), e.nodeC <= e.nNodes ? GotoNode(e, e.nodeC) : GotoNode(e, e.nNodes - (e.nodeC - e.nNodes)))), e.nodeMode != NODEMODE_GOTO)) && (e.x += e.vx, e.y += e.vy, e.nNodeFrames--)
}
function Patrol(e) {
    if (e.vx < 0 && !TestMove(e, -1, 0, e.m1))
        return void (e.vx = -e.vx);
    if (e.vx > 0 && !TestMove(e, 1, 0, e.m1))
        return void (e.vx = -e.vx);
    let t = e.x >> 8,
        o = (e.y >> 8) + e.collY + e.collH;
    e.vx > 0 ? t += e.collX + e.collW + 8 : t += e.collX - 8,
    info = GetTileInfo(e, t, o + 8),
    info & TF_FLOOR || (e.vx = -e.vx),
    e.x += e.vx
}
function Drift(e) {
    e.vx < 0 && !TestMove(e, -1, 0, e.m1) ? e.vx = -e.vx : e.vx > 0 && !TestMove(e, 1, 0, e.m1) ? e.vx = -e.vx : e.x += e.vx,
    e.vy < 0 && !TestMove(e, 0, -1, e.m1) ? e.vy = -e.vy : e.vy > 0 && !TestMove(e, 0, 1, e.m1) ? e.vy = -e.vy : e.y += e.vy,
    e.x >> 8 < roomX && (e.vx = -e.vx),
    e.y >> 8 < roomY && (e.vy = -e.vy),
    (e.x >> 8) + e.script.sprW >= roomX + roomW && (e.vx = -e.vx),
    (e.y >> 8) + e.script.sprH >= roomY + roomH && (e.vy = -e.vy)
}
function Spin(e) {
    e.x = e.startX + Math.cos(2 * Math.PI * e.c1 / e.m3) * e.m1 * 256,
    e.y = e.startY + Math.sin(2 * Math.PI * e.c1 / e.m3) * e.m2 * 256,
    e.c1++,
    e.c1 >= e.m3 && (e.c1 = 0)
}
function Butterfly(e) {
    e.x = e.startX + Math.sin(2 * Math.PI * e.c1 / e.m3) * e.m1 * 256,
    e.y = e.startY + Math.sin(2 * Math.PI * e.c2 / e.m4) * e.m2 * 256,
    e.c1++,
    e.c1 >= e.m3 && (e.c1 = 0),
    e.c2++,
    e.c2 >= e.m4 && (e.c2 = 0)
}
function ChasePlayer(e) {
    let t = GetNearestPlayer(e);
    if (t) {
        let o = 256 * e.m1 + e.m2,
            r = 16 * Math.floor(((t.x >> 8) + t.script.sprW / 2) / 16) + 8,
            l = 16 * Math.floor(((t.y >> 8) + t.script.sprH / 2) / 16) + 8,
            a = 8 + (e.x >> 8),
            n = 8 + (e.y >> 8);
        r < a && TestMove(e, -1, 0, e.m3) && (e.x -= o),
        r > a && TestMove(e, 1, 0, e.m3) && (e.x += o),
        l < n && TestMove(e, 0, -1, e.m3) && (e.y -= o),
        l > n && TestMove(e, 0, 1, e.m3) && (e.y += o)
    }
}
function MazeMove(e) {
    let t,
        o = 256 * e.m1 + e.m2;
    0 == e.c1 && (TestMove(e, -1, 0, e.m3) ? e.x -= o : t = !0),
    1 == e.c1 && (TestMove(e, 1, 0, e.m3) ? e.x += o : t = !0),
    2 == e.c1 && (TestMove(e, 0, -1, e.m3) ? e.y -= o : t = !0),
    3 == e.c1 && (TestMove(e, 0, 1, e.m3) ? e.y += o : t = !0),
    t && (e.c1 = RndInt(0, 3)),
    e.x >> 8 < roomX && (e.c1 = 1),
    (e.x >> 8) + e.script.sprW >= roomX + roomW && (e.c1 = 0),
    e.y >> 8 < roomY && (e.c1 = 3),
    (e.y >> 8) + e.script.sprH >= roomY + roomH && (e.c1 = 2)
}
function FloorBump(e) {
    e.vy -= 32,
    e.y += e.vy,
    e.y <= e.startY && (e.y = e.startY, e.vy = -e.vy / 2)
}
function UpdateGamePad() {
    if (joy[0] = 0, joy[1] = 0, !bShowPlayButton) {
        for (let e = 0; e < 2; e++) {
            const t = navigator.getGamepads()[e];
            t && (t.axes[0] <= -.5 && (joy[e] |= JOY_LEFT), t.axes[0] >= .5 && (joy[e] |= JOY_RIGHT), t.axes[1] <= -.5 && (joy[e] |= JOY_UP), t.axes[1] >= .5 && (joy[e] |= JOY_DOWN), t.buttons[14].pressed && (joy[e] |= JOY_LEFT), t.buttons[15].pressed && (joy[e] |= JOY_RIGHT), t.buttons[12].pressed && (joy[e] |= JOY_UP), t.buttons[13].pressed && (joy[e] |= JOY_DOWN), t.buttons[0].pressed && (joy[e] |= JOY_BUTTONA | JOY_JUMP), t.buttons[1].pressed && (joy[e] |= JOY_BUTTONB | JOY_ACTION), t.buttons[2].pressed && (joy[e] |= JOY_BUTTONC | JOY_EXTRA), t.buttons[3].pressed && (joy[e] |= JOY_TRAINER), t.buttons[6].pressed && (joy[e] |= JOY_SHOULDER_L), t.buttons[7].pressed && (joy[e] |= JOY_SHOULDER_R))
        }
        joyTouch & JOY_LEFT && (joy[0] |= JOY_LEFT),
        joyTouch & JOY_RIGHT && (joy[0] |= JOY_RIGHT),
        joyTouch & JOY_UP && (joy[0] |= JOY_UP),
        joyTouch & JOY_DOWN && (joy[0] |= JOY_DOWN),
        document.getElementById("noJumpButton") ? (joyTouch & JOY_BUTTONA && (joy[0] |= JOY_BUTTONA | JOY_ACTION), joyTouch & JOY_BUTTONB && (joy[0] |= JOY_BUTTONB | JOY_EXTRA)) : (joyTouch & JOY_BUTTONA && (joy[0] |= JOY_BUTTONA | JOY_JUMP), joyTouch & JOY_BUTTONB && (joy[0] |= JOY_BUTTONB | JOY_ACTION), joyTouch & JOY_BUTTONC && (joy[0] |= JOY_BUTTONC | JOY_EXTRA)),
        keyHold[13] && (joy[0] |= JOY_CONTINUE),
        keyHold[32] && (joy[0] |= JOY_INVENTORY),
        1 == nPlayers ? (keyHold[38] && (joy[0] |= JOY_UP | JOY_JUMP), keyHold[40] && (joy[0] |= JOY_DOWN), keyHold[37] && (joy[0] |= JOY_LEFT), keyHold[39] && (joy[0] |= JOY_RIGHT), (keyHold[70] || keyHold[88]) && (joy[0] |= JOY_BUTTONA | JOY_ACTION), (keyHold[68] || keyHold[90]) && (joy[0] |= JOY_BUTTONB | JOY_EXTRA)) : (keyHold[38] && (joy[0] |= JOY_UP | JOY_JUMP), keyHold[40] && (joy[0] |= JOY_DOWN), keyHold[37] && (joy[0] |= JOY_LEFT), keyHold[39] && (joy[0] |= JOY_RIGHT), keyHold[76] && (joy[0] |= JOY_BUTTONA | JOY_ACTION), keyHold[75] && (joy[0] |= JOY_BUTTONB | JOY_EXTRA), keyHold[87] && (joy[1] |= JOY_UP | JOY_JUMP), keyHold[83] && (joy[1] |= JOY_DOWN), keyHold[65] && (joy[1] |= JOY_LEFT), keyHold[68] && (joy[1] |= JOY_RIGHT), keyHold[86] && (joy[1] |= JOY_BUTTONA | JOY_ACTION), keyHold[67] && (joy[1] |= JOY_BUTTONB | JOY_EXTRA)),
        0 != joy[0] && (bUserInteraction = !0)
    }
}
let audioContext,
    audioNode;
document.addEventListener("click", function(e) {
    bShowPlayButton && (bShowPlayButton = !1, bUserInteraction = !0)
}),
document.addEventListener("keydown", function(e) {
    bShowPlayButton || (keyHold[e.keyCode] = !0, bUserInteraction = !0)
}),
document.addEventListener("keyup", function(e) {
    keyHold[e.keyCode] = !1
});
let audioID = 1;
async function InitAudio() {
    audioContext = new AudioContext,
    await audioContext.audioWorklet.addModule("rgx_audio.js"),
    (audioNode = new AudioWorkletNode(audioContext, "RGX Audio Processor")).connect(audioContext.destination),
    audioNode.port.onmessage = HandleAudioMessage;
    let e = audioContext.sampleRate;
    audioNode.port.postMessage({
        message: "init",
        rate: e,
        sound: sound,
        pattern: pattern
    })
}
function HandleAudioMessage(e) {
    switch (e.data.message) {
    case "musicDone":
        bMusicDone = !0
    }
}
function TestMusicDone() {
    return bMusicDone
}
function PlaySound(e, t=!0) {
    if (audioNode && e >= 0) {
        let o = 0;
        return t || (o = audioID++, audioID > 254 && (audioID = 1)), audioNode.port.postMessage({
            message: "playSound",
            i: e,
            bRelease: t,
            id: o
        }), o
    }
}
function ReleaseSound(e) {
    audioNode && e && audioNode.port.postMessage({
        message: "release",
        id: e
    })
}
function PlayMusic(e) {
    audioNode && e >= 0 && (bMusicDone = !1, audioNode.port.postMessage({
        message: "playMusic",
        i: e
    }))
}
function StopMusic() {
    audioNode && audioNode.port.postMessage({
        message: "stopMusic"
    })
}
function ResetGame() {
    nInventoryItems = 0,
    inv = {},
    inv.cursorX = 0,
    inv.cursorY = 0,
    nPlayers < 0 && (nPlayers = 1);
    for (let e = 0; e < MAX_PLAYERS; e++)
        score[e] = 0;
    raceTimer = 0,
    FlushStaticRegs(),
    globalReg = new Uint8Array(256),
    scr.buffer = [],
    scr.color = []
}
function InitGame() {
    scr = {},
    scr.cursorX = 0,
    scr.cursorY = 0,
    scr.nColumns = resX / 8,
    scr.nLines = resY / 8,
    scr.buffer = [],
    scr.color = [],
    bUpdateRaceTimer = raceTimer = 0,
    ResetGame(),
    cameraX = 0,
    cameraY = 0,
    hudH = 8,
    iMenu = -1,
    portraitShape = -1
}
function UnpackLayer(e) {
    let t = e.data,
        o = 0,
        r = 0,
        l = 0;
    for (; null != t[o];)
        if ("," == t[o])
            o++,
            r += e.w - r % e.w;
        else if ("[" == t[o]) {
            o++;
            let a = 0;
            for (; t[o] >= "0" && t[o] <= "9";)
                a = 10 * a + (t[o++] - "0");
            for (o++; a--;)
                e.buffer[r++] = l
        } else {
            l = 0;
            for (let r = 0; r < e.npt; r++)
                l = t[o] <= "9" ? (l << 4) + (t[o++] - "0") : (l << 4) + (t.charCodeAt(o++) - 87);
            3 == e.npt && (l = (3072 & l) << 4 | 62463 & l),
            e.buffer[r++] = l
        }
}
function GetWrapX(e, t) {
    let o = currentMap;
    return e.wrapX && o.gridX ? Math.floor(t / o.gridX) * o.gridX + t % o.gridX % e.wrapX : t
}
function GetWrapY(e, t) {
    let o = currentMap;
    return e.wrapY && o.gridY ? Math.floor(t / o.gridY) * o.gridY + t % o.gridY % e.wrapY : t
}
function DrawLayer(e, t, o) {
    clip[4 * e.shape + 2],
    e.tileW;
    let r = e.w;
    r > drawW / e.tileW && (r = drawW / e.tileW);
    let l = e.h;
    l > drawH / e.tileH && (l = drawH / e.tileH);
    let a = drawX,
        n = drawY;
    e.speedX > 1 && (t = roomX + Math.floor((t - roomX) / e.speedX)),
    e.speedY > 1 && (o = roomY + Math.floor((o - roomY) / e.speedY)),
    0 == e.speedX && (t = roomX),
    0 == e.speedY && (o = roomY),
    t < 0 && (a -= t, t = 0),
    o < 0 && (n -= o, o = 0);
    let i = t % e.tileW;
    i > 0 && r++;
    let c = o % e.tileH;
    c > 0 && l++,
    t = Math.floor(t / e.tileW),
    o = Math.floor(o / e.tileH);
    for (let s = 0; s < l; s++)
        for (let l = 0; l < r; l++)
            if (l + t >= 0 && l + t < e.w && s + o >= 0 && s + o < e.h) {
                let r = e.buffer[GetWrapX(e, l + t) + GetWrapY(e, s + o) * e.w];
                r > 0 && DrawTile(a + l * e.tileW - i, n + s * e.tileH - c, r - 1, e)
            }
}
function InitLayers(e) {
    let t = 0;
    for (; e.layer[t] >= 0;) {
        let o = e.layer[t];
        null != layer[o].buffer && o != e.main || (layer[o].buffer = [], UnpackLayer(layer[o])),
        o == e.main && (mainLayer = layer[o]),
        t++
    }
    for (t = 0; null != tileset[t];)
        tileset[t].shape == mainLayer.shape && (currentTileset = tileset[t]),
        t++
}
function InitPalette(e) {
    let t = GetCurrentRoom(),
        o = 0;
    if (e.pal[t] && (o = e.pal[t]), iCurrentPalette != o) {
        pngContext.drawImage(pngImage, 0, 0),
        iCurrentPalette = o;
        let e = pngContext.getImageData(0, 0, pngCanvas.width, fontY),
            t = pngCanvas.width * fontY * 4,
            r = palette[0].length,
            l = palette[0],
            a = palette[o];
        for (let o = 0; o < t; o += 4)
            if (e.data[o + 3])
                for (let t = 0; t < r; t += 3)
                    if (e.data[o] == l[t] && e.data[o + 1] == l[t + 1] && e.data[o + 2] == l[t + 2]) {
                        e.data[o] = a[t],
                        e.data[o + 1] = a[t + 1],
                        e.data[o + 2] = a[t + 2];
                        break
                    }
        pngContext.putImageData(e, 0, 0)
    }
}
function InitMap() {
    audioNode && audioNode.port.postMessage({
        message: "stopAllSounds"
    }),
    mapTimer = 0,
    iRoomRequest = -1,
    teleportX = teleportY = -1,
    fadeOpacity = 0,
    bGameOver = !1,
    nStartedPlayers = 0,
    player = [],
    InitLayers(currentMap),
    UpdateRoomRegs(cameraX, cameraY),
    InitPalette(currentMap),
    CloseBubble(),
    FlushActors(),
    StartMain(),
    StartActors()
}
function UpdateMap() {
    if (iRoomRequest >= 0 || teleportX >= 0) {
        if (fadeOpacity > 0 && (fadeOpacity -= .05), fadeOpacity < 0 && (fadeOpacity = 0), 0 == fadeOpacity)
            if (iRoomRequest >= 0)
                GotoRoom(iRoomRequest),
                iRoomRequest = -1;
            else {
                let e = teleportActor;
                e.x = 256 * teleportX,
                e.y = 256 * teleportY,
                UpdateRoomRegs(Math.floor(teleportX + e.collX + e.collW / 2), Math.floor(teleportY + e.collY + e.collH / 2)),
                teleportX = teleportY = -1
            }
    } else
        fadeOpacity < 1 && (fadeOpacity += .05),
        fadeOpacity > 1 && (fadeOpacity = 1);
    inv.bShow = !1,
    iMenu >= 0 ? UpdateInventory() : (UpdateBubble(), UpdateActors(), SortActors(), StartActors(), UpdateDialog(), UpdateMessage(), UpdateWave(), bWaitForJoyUp && 0 == joy[0] && (bWaitForJoyUp = !1))
}
function DrawMap() {
    if (drawX = 0, drawY = hudH, drawW = resX, drawH = resY - hudH, iMenu >= 0)
        DrawMenu();
    else {
        let e = currentMap,
            t = 0;
        for (; e.layer[t] >= 0;) {
            let o = e.layer[t];
            DrawLayer(layer[o], cameraX, cameraY),
            o == e.main && (DrawTags(e), DrawTextLayer(1, scr.nLines - 1), DrawActors()),
            t++
        }
        DrawMessage(),
        DrawNewItem(),
        DrawPortrait(),
        DrawBubble()
    }
    DrawInventory(),
    Fill(0, 0, resX, hudH, "rgb( 0, 0, 0 )"),
    DrawTextLayer(0, 1),
    DrawGameOver(),
    DrawFade()
}
function Init(e) {
    pngImage = new Image,
    pngImage.src = e,
    pngImage.onload = function() {
        textColor[textColor.length] = 0,
        textColor[textColor.length] = 0,
        textColor[textColor.length] = 0,
        nTextColors = textColor.length / 3,
        pngCanvas = document.createElement("canvas"),
        pngCanvas.width = pngImage.width,
        pngCanvas.height = pngImage.height + 16 * (nTextColors - 1),
        pngContext = pngCanvas.getContext("2d"),
        pngContext.drawImage(pngImage, 0, 0),
        iCurrentPalette = 0;
        let e = pngContext,
            t = pngImage.width,
            o = e.getImageData(0, fontY, t, 16 * nTextColors);
        for (let e = 0; e < nTextColors; e++) {
            let r = 16 * t * 4;
            for (let t = 0; t < r; t += 4)
                if (o.data[t] > 0) {
                    let l = t + e * r;
                    o.data[l] = textColor[3 * e],
                    o.data[l + 1] = textColor[3 * e + 1],
                    o.data[l + 2] = textColor[3 * e + 2],
                    o.data[l + 3] = 255
                }
        }
        e.putImageData(o, 0, fontY),
        maskCanvas = document.createElement("canvas"),
        maskCanvas.width = pngCanvas.width,
        maskCanvas.height = pngCanvas.height,
        maskContext = maskCanvas.getContext("2d"),
        (e = maskContext).drawImage(pngCanvas, 0, 0),
        e.globalCompositeOperation = "source-atop",
        e.fillStyle = "rgb( 255, 255, 255 )",
        e.fillRect(0, 0, maskCanvas.width, maskCanvas.height),
        drawCanvas = document.createElement("canvas"),
        drawCanvas.width = resX,
        drawCanvas.height = resY,
        drawContext = drawCanvas.getContext("2d"),
        bImageLoaded = !0
    },
    bSetupDone = !1,
    window.requestAnimationFrame(Update)
}
let updateTime = 0;
function Update(e) {
    if (bImageLoaded) {
        if (!bSetupDone) {
            lastTime = e,
            currentMap = map[0],
            InitTilesets(),
            InitScripts(),
            InitGame(),
            InitMap(),
            bSetupDone = !0;
            let t = navigator.platform;
            "iPad" !== t && "iPhone" !== t && "iPod" !== t || (bShowPlayButton = !0)
        }
        !bUserInteraction || bShowPlayButton || audioContext || InitAudio(),
        (updateTime += e - lastTime) >= 1e3 / 60 && (updateTime -= 1e3 / 60, UpdateGamePad(), UpdateMap(), DrawMap(), CopyFrame(), bShowPlayButton && DrawPlayButton(), mapTimer++, bUpdateRaceTimer && raceTimer++, lastJoy[0] = joy[0], lastJoy[1] = joy[1])
    }
    lastTime = e,
    window.requestAnimationFrame(Update)
}
